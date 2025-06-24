import React, { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { tourById, tourUpdate } from "../redux/reducers/tour/tour";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Chip,
  IconButton,
  Tooltip,
  Container,
  TextField,
  InputLabel,
  Rating,
} from "@mui/material";
import { Save, Edit, Close, CheckCircle, Cancel, ArrowBack, Add } from "@mui/icons-material";
import { useLoader } from "../../../utils/loader";
import { toast } from "react-toastify";

const deepCopy = (obj) => {
  if (typeof structuredClone === "function") {
    try { return structuredClone(obj); } catch (e) { /* fallback */ }
  }
  try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return null; }
};

const SectionPaper = ({ title, children, editMode, onToggleEdit, onSave, onCancel }) => (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">{title}</Typography>
            {onToggleEdit && (
                <Tooltip title={editMode ? "Cancel" : "Edit Section"}>
                    <IconButton onClick={onToggleEdit}>
                        {editMode ? <Close /> : <Edit />}
                    </IconButton>
                </Tooltip>
            )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        {children}
        {editMode && (
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
                <Button variant="contained" onClick={onSave} startIcon={<Save />}>Save Section</Button>
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

  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (id) {
        showLoader();
        dispatch(tourById(id)).finally(() => hideLoader());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch]);

  useEffect(() => {
    if (!loading && Array.isArray(editDataArray) && editDataArray.length > 0) {
      const tourObject = deepCopy(editDataArray[0]);
      if (tourObject) {
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
            current = current[keys[i]] || {};
        }
        current[keys[keys.length - 1]] = value;
        return newData;
    });
  }, []);

  const handleAddDay = () => {
    setEditableData(prev => {
        const newDayWise = [...(prev.dayWise || [])];
        newDayWise.push({
            day: newDayWise.length + 1,
            description: ""
        });
        return { ...prev, dayWise: newDayWise };
    });
  };
  
  const toggleEditSection = (section) => {
      setEditSections(prev => {
        const isCurrentlyEditing = prev[section];
        
        const newEditState = Object.keys(prev).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});

        if (isCurrentlyEditing) {
            setEditableData(prevData => {
                const revertedData = { ...prevData };
                if(originalData[section]) {
                    revertedData[section] = deepCopy(originalData[section]);
                }
                else if (section === 'basic') {
                    revertedData.travelAgencyName = originalData.travelAgencyName;
                    revertedData.visitingPlaces = originalData.visitingPlaces;
                    revertedData.state = originalData.state;
                    revertedData.city = originalData.city;
                    revertedData.themes = originalData.themes;
                    revertedData.starRating = originalData.starRating;
                } else if (section === 'pricing') {
                     revertedData.price = originalData.price;
                     revertedData.nights = originalData.nights;
                     revertedData.days = originalData.days;
                     revertedData.from = originalData.from;
                     revertedData.to = originalData.to;
                }
                else if (section === 'details') {
                    revertedData.overview = originalData.overview;
                    revertedData.inclusion = originalData.inclusion;
                    revertedData.exclusion = originalData.exclusion;
                    revertedData.amenities = originalData.amenities;
                } else if (section === 'terms') {
                    revertedData.termsAndConditions = originalData.termsAndConditions;
                    revertedData.dayWise = originalData.dayWise;
                }
                return revertedData;
            });
        }
        
        newEditState[section] = !isCurrentlyEditing;

        return newEditState;
    });
  };
  
  const handleSaveSection = async (sectionKey) => {
    showLoader();
    try {
        const dataToUpdate = {};
        const basicFields = ['travelAgencyName', 'visitingPlaces', 'state', 'city', 'themes', 'starRating'];
        const pricingFields = ['price', 'nights', 'days', 'from', 'to'];
        const detailsFields = ['overview', 'inclusion', 'exclusion', 'amenities'];
        const termsFields = ['termsAndConditions', 'dayWise'];

        if (sectionKey === 'basic') {
            basicFields.forEach(field => { dataToUpdate[field] = editableData[field] });
        } else if (sectionKey === 'pricing') {
            pricingFields.forEach(field => { dataToUpdate[field] = editableData[field] });
        } else if (sectionKey === 'details') {
            detailsFields.forEach(field => { dataToUpdate[field] = editableData[field] });
        } else if (sectionKey === 'terms') {
            termsFields.forEach(field => { dataToUpdate[field] = editableData[field] });
        }

        await dispatch(tourUpdate({ id, data: dataToUpdate })).unwrap();
        toast.success(`${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} updated successfully!`);
        dispatch(tourById(id)); // Re-fetch data to reflect changes
        toggleEditSection(sectionKey);
    } catch (err) {
        toast.error(`Failed to update ${sectionKey}.`);
        console.error("Save failed:", err);
    } finally {
        hideLoader();
    }
  };
  
   const handleAcceptanceChange = async (isAccepted) => {
    showLoader();
    try {
      await dispatch(tourUpdate({ id, data: { isAccepted } })).unwrap();
      toast.success(`Tour status updated to ${isAccepted ? 'Accepted' : 'Declined'}.`);
      dispatch(tourById(id)); // Re-fetch data to reflect changes
    } catch(err) {
      toast.error('Failed to update status.');
    } finally {
      hideLoader();
    }
  };
  
  if (loading && !editableData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>Error loading tour details.</Alert>;
  }

  if (!editableData) {
    return <Alert severity="warning" sx={{ m: 4 }}>Tour data not found.</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight="bold">Update Tour Package</Typography>
            <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBack />}>Back to List</Button>
        </Box>

        <SectionPaper title="Basic Information" editMode={editSections.basic} onToggleEdit={() => toggleEditSection('basic')} onSave={() => handleSaveSection('basic')} onCancel={() => toggleEditSection('basic')}>
             <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Agency Name" value={editableData.travelAgencyName || ''} onChange={e => handleInputChange('travelAgencyName', e.target.value)} disabled={!editSections.basic} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Visiting Places" value={editableData.visitingPlaces || ''} onChange={e => handleInputChange('visitingPlaces', e.target.value)} disabled={!editSections.basic}/></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="State" value={editableData.state || ''} onChange={e => handleInputChange('state', e.target.value)} disabled={!editSections.basic} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="City" value={editableData.city || ''} onChange={e => handleInputChange('city', e.target.value)} disabled={!editSections.basic} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Themes" value={editableData.themes || ''} onChange={e => handleInputChange('themes', e.target.value)} disabled={!editSections.basic} /></Grid>
                <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" gap={2}><Typography color="text.secondary">Rating:</Typography><Rating value={Number(editableData.starRating) || 0} onChange={(_, val) => handleInputChange('starRating', val)} readOnly={!editSections.basic} /></Box></Grid>
            </Grid>
        </SectionPaper>

        <SectionPaper title="Pricing & Duration" editMode={editSections.pricing} onToggleEdit={() => toggleEditSection('pricing')} onSave={() => handleSaveSection('pricing')} onCancel={() => toggleEditSection('pricing')}>
            <Grid container spacing={2}>
                 <Grid item xs={12} sm={4}><TextField fullWidth label="Price" type="number" value={editableData.price || ''} onChange={e => handleInputChange('price', e.target.value)} disabled={!editSections.pricing} /></Grid>
                 <Grid item xs={12} sm={4}><TextField fullWidth label="Nights" type="number" value={editableData.nights || ''} onChange={e => handleInputChange('nights', e.target.value)} disabled={!editSections.pricing} /></Grid>
                 <Grid item xs={12} sm={4}><TextField fullWidth label="Days" type="number" value={editableData.days || ''} onChange={e => handleInputChange('days', e.target.value)} disabled={!editSections.pricing} /></Grid>
                 <Grid item xs={12} sm={6}><TextField fullWidth label="Start Date" type="date" value={editableData.from ? editableData.from.split('T')[0] : ''} onChange={e => handleInputChange('from', e.target.value)} disabled={!editSections.pricing} InputLabelProps={{ shrink: true }} /></Grid>
                 <Grid item xs={12} sm={6}><TextField fullWidth label="End Date" type="date" value={editableData.to ? editableData.to.split('T')[0] : ''} onChange={e => handleInputChange('to', e.target.value)} disabled={!editSections.pricing} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
        </SectionPaper>
        
        <SectionPaper title="Package Details" editMode={editSections.details} onToggleEdit={() => toggleEditSection('details')} onSave={() => handleSaveSection('details')} onCancel={() => toggleEditSection('details')}>
            <Grid container spacing={3}>
                <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500}>Overview</Typography><TextField fullWidth multiline minRows={3} value={editableData.overview || ''} onChange={e => handleInputChange('overview', e.target.value)} disabled={!editSections.details} /></Grid>
                <Grid item xs={12} md={6}><Typography variant="subtitle1" fontWeight={500}>Inclusions</Typography><TextField fullWidth multiline minRows={4} value={(editableData.inclusion || []).join('\n')} onChange={e => handleInputChange('inclusion', e.target.value.split('\n'))} disabled={!editSections.details} helperText="Enter each item on a new line." /></Grid>
                <Grid item xs={12} md={6}><Typography variant="subtitle1" fontWeight={500}>Exclusions</Typography><TextField fullWidth multiline minRows={4} value={(editableData.exclusion || []).join('\n')} onChange={e => handleInputChange('exclusion', e.target.value.split('\n'))} disabled={!editSections.details} helperText="Enter each item on a new line."/></Grid>
                <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500}>Amenities</Typography><Select fullWidth multiple value={editableData.amenities || []} onChange={e => handleInputChange('amenities', e.target.value)} renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(val => <Chip key={val} label={val} />)}</Box>} disabled={!editSections.details}>{["WiFi", "Parking", "Pool", "Gym", "Restaurant"].map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}</Select></Grid>
            </Grid>
        </SectionPaper>

        <SectionPaper title="Terms & Itinerary" editMode={editSections.terms} onToggleEdit={() => toggleEditSection('terms')} onSave={() => handleSaveSection('terms')} onCancel={() => toggleEditSection('terms')}>
             <Grid container spacing={3}>
                <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500}>Cancellation Policy</Typography><TextField fullWidth multiline minRows={3} value={editableData.termsAndConditions?.cancellation || ''} onChange={e => handleInputChange('termsAndConditions.cancellation', e.target.value)} disabled={!editSections.terms}/></Grid>
                <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500}>Refund Policy</Typography><TextField fullWidth multiline minRows={3} value={editableData.termsAndConditions?.refund || ''} onChange={e => handleInputChange('termsAndConditions.refund', e.target.value)} disabled={!editSections.terms}/></Grid>
                <Grid item xs={12}><Typography variant="subtitle1" fontWeight={500}>Booking Policy</Typography><TextField fullWidth multiline minRows={3} value={editableData.termsAndConditions?.bookingPolicy || ''} onChange={e => handleInputChange('termsAndConditions.bookingPolicy', e.target.value)} disabled={!editSections.terms}/></Grid>
                 <Grid item xs={12}><Divider>Day-wise Itinerary</Divider></Grid>
                {(editableData.dayWise || []).map((day, index) => (
                    <Grid item xs={12} key={index}><Typography variant="subtitle1" fontWeight={500}>Day {day.day}</Typography><TextField fullWidth multiline minRows={2} value={day.description || ''} onChange={e => handleInputChange(`dayWise.${index}.description`, e.target.value)} disabled={!editSections.terms}/></Grid>
                ))}
                {editSections.terms && (
                    <Grid item xs={12} textAlign="right">
                        <Button variant="outlined" onClick={handleAddDay} startIcon={<Add />}>Add Another Day</Button>
                    </Grid>
                )}
            </Grid>
        </SectionPaper>
        
         <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            <Typography>Tour Status: <Chip label={editableData.isAccepted ? 'Accepted' : 'Not Accepted'} color={editableData.isAccepted ? 'success' : 'error'} /></Typography>
            <Tooltip title="Accept this tour request">
                <Button variant="contained" color="success" onClick={() => handleAcceptanceChange(true)} startIcon={<CheckCircle/>}>Accept</Button>
            </Tooltip>
             <Tooltip title="Decline this tour request">
                <Button variant="contained" color="error" onClick={() => handleAcceptanceChange(false)} startIcon={<Cancel/>}>Decline</Button>
            </Tooltip>
        </Paper>
    </Container>
  );
}
