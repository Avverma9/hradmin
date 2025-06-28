import React, { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { tourById, tourUpdate } from "../redux/reducers/tour/tour";
import {
  Typography, Box, CircularProgress, Alert, Button, Paper, Divider, Grid,
  Select, MenuItem, FormControl, Chip, IconButton, Tooltip, Container,
  TextField, InputLabel, Rating,
} from "@mui/material";
import { Save, Edit, Close, CheckCircle, Cancel, ArrowBack, Add } from "@mui/icons-material";
import { useLoader } from "../../../utils/loader";
import { toast } from "react-toastify";
import { Country, State, City } from 'country-state-city';
import { useTourTheme } from "../../../utils/additional/tourTheme";
import { role } from "../../../utils/util";

const deepCopy = (obj) => {
  if (typeof structuredClone === "function") {
    try { return structuredClone(obj); } catch (e) { /* fallback */ }
  }
  try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return null; }
};

const SectionPaper = ({ title, children, editMode, onToggleEdit, onSave, onCancel }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, mb: 2.5 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
      <Typography variant="h6" fontWeight="600">{title}</Typography>
      {onToggleEdit && (
        <Tooltip title={editMode ? "Cancel Edit" : "Edit Section"}>
          <IconButton onClick={onToggleEdit}>
            {editMode ? <Close /> : <Edit fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
    <Divider sx={{ mb: 2.5 }} />
    {children}
    {editMode && (
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2.5}>
        <Button variant="outlined" onClick={onCancel} size="small">Cancel</Button>
        <Button variant="contained" onClick={onSave} startIcon={<Save />} size="small">Save Section</Button>
      </Box>
    )}
  </Paper>
);

SectionPaper.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  editMode: PropTypes.bool,
  onToggleEdit: PropTypes.func,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

export default function TourUpdate() {
  const { editData: editDataArray, loading, error } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editableData, setEditableData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [editSections, setEditSections] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const tourTheme = useTourTheme();

  console.log(tourTheme)
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (id) {
      showLoader();
      dispatch(tourById(id)).finally(() => hideLoader());
    }
  }, [id, dispatch]);
  
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);

    if (editableData?.country) {
        const availableStates = State.getStatesOfCountry(editableData.country);
        setStates(availableStates);

        if (editableData?.state) {
            const availableCities = City.getCitiesOfState(editableData.country, editableData.state);
            setCities(availableCities);
        } else {
            setCities([]);
        }
    } else {
        setStates([]);
        setCities([]);
    }
  }, [editableData?.country, editableData?.state]);


  useEffect(() => {
    if (!loading && Array.isArray(editDataArray) && editDataArray.length > 0) {
      const tourObject = deepCopy(editDataArray[0]);
      if (tourObject) {
        tourObject.images = tourObject.images || [];
        tourObject.amenities = tourObject.amenities || [];
        tourObject.inclusion = tourObject.inclusion || [];
        tourObject.exclusion = tourObject.exclusion || [];
        tourObject.dayWise = tourObject.dayWise || [];
        tourObject.termsAndConditions = tourObject.termsAndConditions || { cancellation: "", refund: "", bookingPolicy: "" };
        setEditableData(tourObject);
        setOriginalData(deepCopy(tourObject));
      }
    }
  }, [editDataArray, loading]);

  const handleInputChange = useCallback((path, value) => {
    setEditableData(prev => {
      const newData = deepCopy(prev);
      let current = newData;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = current[keys[i]] || {};
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleCountryChange = (event) => {
    const countryCode = event.target.value;
    handleInputChange('country', countryCode);
    handleInputChange('state', '');
    handleInputChange('city', '');
  };

  const handleStateChange = (event) => {
    const stateCode = event.target.value;
    handleInputChange('state', stateCode);
    handleInputChange('city', '');
  };

  const handleCityChange = (event) => {
    handleInputChange('city', event.target.value);
  };

  const handleAddDay = () => {
    setEditableData(prev => {
      const newDayWise = [...(prev.dayWise || [])];
      newDayWise.push({ day: newDayWise.length + 1, description: "" });
      return { ...prev, dayWise: newDayWise };
    });
  };

  const toggleEditSection = (section) => {
    setEditSections(prev => {
      const isCurrentlyEditing = prev[section];
      const newEditState = {};
      Object.keys(prev).forEach(key => { newEditState[key] = false; });
      
      if (isCurrentlyEditing) {
        setEditableData(deepCopy(originalData));
      }
      
      newEditState[section] = !isCurrentlyEditing;
      return newEditState;
    });
  };

  const handleSaveSection = async (sectionKey) => {
    showLoader();
    try {
      const dataToUpdate = {};
      const sectionsMap = {
        basic: ['travelAgencyName', 'visitingPlaces', 'country', 'state', 'city', 'themes', 'starRating', 'agencyEmail', 'agencyPhone'],
        pricing: ['price', 'nights', 'days', 'from', 'to'],
        details: ['overview', 'inclusion', 'exclusion', 'amenities'],
        terms: ['termsAndConditions'],
        itinerary: ['dayWise'],
      };

      sectionsMap[sectionKey]?.forEach(field => {
        dataToUpdate[field] = editableData[field];
      });

      await dispatch(tourUpdate({ id, data: dataToUpdate })).unwrap();
      toast.success(`${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} updated successfully!`);
      dispatch(tourById(id));
      setEditSections(prev => ({ ...prev, [sectionKey]: false }));
    } catch (err) {
      toast.error(`Failed to update ${sectionKey}.`);
    } finally {
      hideLoader();
    }
  };

  const handleAcceptanceChange = async (isAccepted) => {
    showLoader();
    try {
      await dispatch(tourUpdate({ id, data: { isAccepted } })).unwrap();
      toast.success(`Tour status updated to ${isAccepted ? 'Accepted' : 'Declined'}.`);
      dispatch(tourById(id));
    } catch(err) {
      toast.error('Failed to update status.');
    } finally {
      hideLoader();
    }
  };
  
  if (loading && !editableData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box sx={{ p: 4 }}><Alert severity="error">Error loading tour details.</Alert></Box>;
  }

  if (!editableData) {
    return <Box sx={{ p: 4 }}><Alert severity="warning">Tour data not found.</Alert></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
    
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Update Tour Package</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBack />}>Back to List</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
        
          <SectionPaper title="Basic Information" editMode={editSections.basic} onToggleEdit={() => toggleEditSection('basic')} onSave={() => handleSaveSection('basic')} onCancel={() => toggleEditSection('basic')}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Agency Name" value={editableData.travelAgencyName || ''} onChange={e => handleInputChange('travelAgencyName', e.target.value)} disabled={!editSections.basic} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Agency Email" value={editableData.agencyEmail || ''} onChange={e => handleInputChange('agencyEmail', e.target.value)} disabled={!editSections.basic} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Agency Phone" value={editableData.agencyPhone || ''} onChange={e => handleInputChange('agencyPhone', e.target.value)} disabled={!editSections.basic} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Visiting Places" value={editableData.visitingPlaces || ''} onChange={e => handleInputChange('visitingPlaces', e.target.value)} disabled={!editSections.basic}/></Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" disabled={!editSections.basic}>
                    <InputLabel>Country</InputLabel>
                    <Select label="Country" value={editableData.country || ''} onChange={handleCountryChange}>
                      <MenuItem value=""><em>Select Country</em></MenuItem>
                      {countries.map(country => (
                          <MenuItem key={country.isoCode} value={country.isoCode}>
                              {country.name}
                          </MenuItem>
                      ))}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" disabled={!editableData.country || !editSections.basic}>
                    <InputLabel>State</InputLabel>
                    <Select label="State" value={editableData.state || ''} onChange={handleStateChange}>
                      <MenuItem value=""><em>Select State</em></MenuItem>
                      {states.map(state => (
                          <MenuItem key={state.isoCode} value={state.isoCode}>
                              {state.name}
                          </MenuItem>
                      ))}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" disabled={!editableData.state || !editSections.basic}>
                    <InputLabel>City</InputLabel>
                    <Select label="City" value={editableData.city || ''} onChange={handleCityChange}>
                      <MenuItem value=""><em>Select City</em></MenuItem>
                      {cities.map(city => (
                          <MenuItem key={city.name} value={city.name}>
                              {city.name}
                          </MenuItem>
                      ))}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!editSections.basic}>
                  <InputLabel>Themes</InputLabel>
                  <Select
                    label="Themes"
                    value={editableData.themes || ''}
                    onChange={e => handleInputChange('themes', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select a Theme</em>
                    </MenuItem>
                    {tourTheme?.map(theme => (
                      <MenuItem key={theme.name} value={theme.name}>
                        {theme.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" gap={1} height="100%"><Typography color="text.secondary" variant="body2">Rating:</Typography><Rating value={Number(editableData.starRating) || 0} onChange={(_, val) => handleInputChange('starRating', val)} readOnly={!editSections.basic} /></Box></Grid>
            </Grid>
          </SectionPaper>

          <SectionPaper title="Pricing & Duration" editMode={editSections.pricing} onToggleEdit={() => toggleEditSection('pricing')} onSave={() => handleSaveSection('pricing')} onCancel={() => toggleEditSection('pricing')}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Price" type="number" value={editableData.price || ''} onChange={e => handleInputChange('price', e.target.value)} disabled={!editSections.pricing} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Nights" type="number" value={editableData.nights || ''} onChange={e => handleInputChange('nights', e.target.value)} disabled={!editSections.pricing} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Days" type="number" value={editableData.days || ''} onChange={e => handleInputChange('days', e.target.value)} disabled={!editSections.pricing} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Start Date" type="date" value={editableData.from ? editableData.from.split('T')[0] : ''} onChange={e => handleInputChange('from', e.target.value)} disabled={!editSections.pricing} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="End Date" type="date" value={editableData.to ? editableData.to.split('T')[0] : ''} onChange={e => handleInputChange('to', e.target.value)} disabled={!editSections.pricing} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
          </SectionPaper>
          
          <SectionPaper title="Package Details" editMode={editSections.details} onToggleEdit={() => toggleEditSection('details')} onSave={() => handleSaveSection('details')} onCancel={() => toggleEditSection('details')}>
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight={500}>Overview</Typography><TextField fullWidth multiline minRows={3} size="small" value={editableData.overview || ''} onChange={e => handleInputChange('overview', e.target.value)} disabled={!editSections.details} /></Grid>
              <Grid item xs={12} md={6}><Typography variant="subtitle2" fontWeight={500}>Inclusions</Typography><TextField fullWidth multiline minRows={4} size="small" value={(editableData.inclusion || []).join('\n')} onChange={e => handleInputChange('inclusion', e.target.value.split('\n'))} disabled={!editSections.details} helperText="Enter each item on a new line." /></Grid>
              <Grid item xs={12} md={6}><Typography variant="subtitle2" fontWeight={500}>Exclusions</Typography><TextField fullWidth multiline minRows={4} size="small" value={(editableData.exclusion || []).join('\n')} onChange={e => handleInputChange('exclusion', e.target.value.split('\n'))} disabled={!editSections.details} helperText="Enter each item on a new line."/></Grid>
              <Grid item xs={12}><Typography variant="subtitle2" fontWeight={500}>Amenities</Typography><FormControl fullWidth size="small"><Select multiple value={editableData.amenities || []} onChange={e => handleInputChange('amenities', e.target.value)} renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(val => <Chip key={val} label={val} size="small"/>)}</Box>} disabled={!editSections.details}>{["WiFi", "Parking", "Pool", "Gym", "Restaurant"].map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}</Select></FormControl></Grid>
            </Grid>
          </SectionPaper>

          <SectionPaper title="Terms & Policies" editMode={editSections.terms} onToggleEdit={() => toggleEditSection('terms')} onSave={() => handleSaveSection('terms')} onCancel={() => toggleEditSection('terms')}>
              <Grid container spacing={2}>
                  <Grid item xs={12}><Typography variant="subtitle2" fontWeight={500}>Cancellation Policy</Typography><TextField fullWidth multiline minRows={2} size="small" value={editableData.termsAndConditions?.cancellation || ''} onChange={e => handleInputChange('termsAndConditions.cancellation', e.target.value)} disabled={!editSections.terms}/></Grid>
                  <Grid item xs={12}><Typography variant="subtitle2" fontWeight={500}>Refund Policy</Typography><TextField fullWidth multiline minRows={2} size="small" value={editableData.termsAndConditions?.refund || ''} onChange={e => handleInputChange('termsAndConditions.refund', e.target.value)} disabled={!editSections.terms}/></Grid>
                  <Grid item xs={12}><Typography variant="subtitle2" fontWeight={500}>Booking Policy</Typography><TextField fullWidth multiline minRows={2} size="small" value={editableData.termsAndConditions?.bookingPolicy || ''} onChange={e => handleInputChange('termsAndConditions.bookingPolicy', e.target.value)} disabled={!editSections.terms}/></Grid>
              </Grid>
          </SectionPaper>

          <SectionPaper title="Day-wise Itinerary" editMode={editSections.itinerary} onToggleEdit={() => toggleEditSection('itinerary')} onSave={() => handleSaveSection('itinerary')} onCancel={() => toggleEditSection('itinerary')}>
              <Grid container spacing={2}>
                  {(editableData.dayWise || []).map((day, index) => (
                      <Grid item xs={12} key={index}>
                          <Typography variant="subtitle2" fontWeight={500}>Day {day.day}</Typography>
                          <TextField fullWidth multiline minRows={2} size="small" value={day.description || ''} onChange={e => handleInputChange(`dayWise.${index}.description`, e.target.value)} disabled={!editSections.itinerary}/>
                      </Grid>
                  ))}
                  {editSections.itinerary && (
                      <Grid item xs={12} textAlign="right">
                          <Button variant="outlined" onClick={handleAddDay} startIcon={<Add />} size="small">Add Day</Button>
                      </Grid>
                  )}
              </Grid>
          </SectionPaper>
        </Grid>
{role === "Admin" || role ==="TMS" || role ==="Developer" && <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" fontWeight="600">Tour Status</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
              <Typography variant="body1">Current Status:</Typography>
              <Chip label={editableData.isAccepted ? 'Accepted' : 'Not Accepted'} color={editableData.isAccepted ? 'success' : 'warning'} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Accept or decline this tour package request.</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                  <Button fullWidth variant="contained" color="success" onClick={() => handleAcceptanceChange(true)} startIcon={<CheckCircle/>}>Accept</Button>
              </Grid>
              <Grid item xs={6}>
                  <Button fullWidth variant="outlined" color="error" onClick={() => handleAcceptanceChange(false)} startIcon={<Cancel/>}>Decline</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid> }
        
      </Grid>
    </Container>
  );
}