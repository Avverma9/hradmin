import {
  Add as AddIcon,
  ArrowBack,
  Cancel,
  CheckCircle,
  Close,
  DeleteOutline,
  DescriptionOutlined,
  DirectionsBus,
  Edit,
  Event as EventIcon,
  FlightTakeoff,
  ImageOutlined,
  InfoOutlined,
  PolicyOutlined,
  Save,
  UploadFile,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { City, Country, State } from "country-state-city";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTourTheme } from "../../../utils/additional/tourTheme";
import { useLoader } from "../../../utils/loader";
import { role } from "../../../utils/util";
import {
  deleteTourImage,
  tourById,
  tourUpdate,
  updateTourImage,
} from "../redux/reducers/tour/tour";

// --- Utility Functions ---
const deepCopy = (obj) => {
  try {
    return structuredClone(obj);
  } catch (e) {
    return JSON.parse(JSON.stringify(obj));
  }
};

// Helper to safely parse date for input value (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

// --- Styled Components ---
const StyledCard = styled(Card)(({ theme, editing }) => ({
  borderRadius: 16,
  boxShadow: editing
    ? `0 0 0 2px ${theme.palette.primary.main}, 0 4px 20px rgba(0,0,0,0.1)`
    : "0px 4px 20px rgba(0, 0, 0, 0.05)",
  border: `1px solid ${
    editing ? theme.palette.primary.main : theme.palette.divider
  }`,
  transition: "all 0.3s ease",
  height: "100%",
  position: "relative",
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 12,
  height: 120,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backgroundColor: theme.palette.background.default,
  transition: "all 0.2s",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const DynamicItemBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderRadius: 12,
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

// --- Reusable Sub-Components ---

const SectionHeader = ({ icon, title, subtitle }) => (
  <Box display="flex" alignItems="center" gap={1.5}>
    <Avatar
      variant="rounded"
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        color: "primary.main",
        width: 32,
        height: 32,
      }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const EditableSectionCard = ({
  title,
  subtitle,
  icon,
  editMode,
  onToggleEdit,
  onSave,
  children,
}) => {
  return (
    <StyledCard editing={editMode ? 1 : 0}>
      <CardHeader
        title={<SectionHeader icon={icon} title={title} subtitle={subtitle} />}
        action={
          <Box>
            {editMode ? (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={onToggleEdit}
                  startIcon={<Close />}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={onSave}
                  startIcon={<Save />}
                >
                  Save
                </Button>
              </Stack>
            ) : (
              <Tooltip title="Edit Section">
                <IconButton onClick={onToggleEdit} size="small">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent
        sx={{
          opacity: editMode ? 1 : 0.8,
          pointerEvents: editMode ? "auto" : "none",
        }}
      >
        {children}
      </CardContent>
    </StyledCard>
  );
};

EditableSectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  editMode: PropTypes.bool,
  onToggleEdit: PropTypes.func,
  onSave: PropTypes.func,
  children: PropTypes.node,
};

// --- Main Component ---

export default function TourUpdate() {
  const { editData, loading, error } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { showLoader, hideLoader } = useLoader();

  // State
  const [editableData, setEditableData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [editSections, setEditSections] = useState({});

  // Location State
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const tourTheme = useTourTheme();

  // --- Effects ---

  useEffect(() => {
    if (id) {
      showLoader();
      dispatch(tourById(id)).finally(() => hideLoader());
    }
  }, [id, dispatch]);

  // Initial Country Load
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Sync State/City options when Country/State changes in data
  useEffect(() => {
    if (editableData?.country) {
      // Assuming editableData.country stores the ISO Code (e.g., "IN")
      const availableStates = State.getStatesOfCountry(editableData.country);
      setStates(availableStates);

      if (editableData?.state) {
        // Assuming editableData.state stores the ISO Code (e.g., "MH")
        const availableCities = City.getCitiesOfState(
          editableData.country,
          editableData.state
        );
        setCities(availableCities);
      } else {
        setCities([]);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [editableData?.country, editableData?.state]);

  // Load Data into State
  useEffect(() => {
    if (!loading && Array.isArray(editData) && editData.length > 0) {
      const tourObject = deepCopy(editData[0]);
      if (tourObject) {
        // Ensure arrays exist
        [
          "images",
          "amenities",
          "inclusion",
          "exclusion",
          "dayWise",
          "vehicles",
        ].forEach((key) => {
          tourObject[key] = tourObject[key] || [];
        });
        tourObject.termsAndConditions = tourObject.termsAndConditions || {
          cancellation: "",
          refund: "",
          bookingPolicy: "",
        };

        setEditableData(tourObject);
        setOriginalData(deepCopy(tourObject));
      }
    }
  }, [editData, loading]);

  // --- Handlers ---

  const handleInputChange = useCallback((path, value) => {
    setEditableData((prev) => {
      const newData = deepCopy(prev);
      let current = newData;
      const keys = path.split(".");
      for (let i = 0; i < keys.length - 1; i++) {
        // Create nested object if it doesn't exist
        current = current[keys[i]] = current[keys[i]] || {};
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleAddDay = () => {
    setEditableData((prev) => {
      const newData = deepCopy(prev);
      if (!newData.dayWise) newData.dayWise = [];
      newData.dayWise.push({
        day: newData.dayWise.length + 1,
        description: "",
      });
      return newData;
    });
  };

  const handleImageActions = async (action, payload) => {
    showLoader();
    try {
      if (action === "upload") {
        const formData = new FormData();
        payload.forEach((file) => formData.append("images", file));
        await dispatch(updateTourImage({ id, formData })).unwrap();
        toast.success("Images uploaded");
      } else if (action === "delete") {
        await dispatch(deleteTourImage({ id, index: payload })).unwrap();
        toast.success("Image deleted");
      }
      await dispatch(tourById(id)).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      hideLoader();
    }
  };

  const toggleEditSection = (section) => {
    setEditSections((prev) => {
      const isEditing = prev[section];
      if (isEditing) {
        // Revert to original data on cancel
        setEditableData(deepCopy(originalData));
      }
      return { [section]: !isEditing };
    });
  };

  const handleSaveSection = async (sectionKey) => {
    showLoader();
    try {
      const dataToUpdate = {};
      const sectionsMap = {
        basic: [
          "travelAgencyName",
          "agencyId",
          "visitingPlaces",
          "visitngPlaces", // Handle potential typo in DB
          "country",
          "state",
          "city",
          "themes",
          "starRating",
          "agencyEmail",
          "agencyPhone",
        ],
        pricing: [
          "price",
          "nights",
          "days",
          "from",
          "to",
          "customizable",
          "tourStartDate",
        ],
        details: ["overview", "inclusion", "exclusion", "amenities"],
        vehicles: ["vehicles"],
        terms: ["termsAndConditions"],
        itinerary: ["dayWise"],
      };

      sectionsMap[sectionKey]?.forEach((field) => {
        if (editableData[field] !== undefined) {
          dataToUpdate[field] = editableData[field];
        }
      });

      // Special handling for visitingPlaces typo consistency
      if (sectionKey === "basic") {
        // If the user edited 'visitingPlaces', ensure 'visitngPlaces' is also updated if backend expects it
        // Or prioritize one over the other based on your backend logic
        if (dataToUpdate.visitingPlaces) {
            dataToUpdate.visitngPlaces = dataToUpdate.visitingPlaces;
        } else if (dataToUpdate.visitngPlaces) {
            dataToUpdate.visitingPlaces = dataToUpdate.visitngPlaces;
        }
      }

      await dispatch(tourUpdate({ id, data: dataToUpdate })).unwrap();

      setOriginalData(deepCopy(editableData));
      setEditSections((prev) => ({ ...prev, [sectionKey]: false }));
      toast.success("Section updated successfully");
      dispatch(tourById(id));
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      hideLoader();
    }
  };

  const handleStatusChange = async (isAccepted) => {
    showLoader();
    try {
      await dispatch(tourUpdate({ id, data: { isAccepted } })).unwrap();
      toast.success(`Tour ${isAccepted ? "Accepted" : "Declined"}`);
      dispatch(tourById(id));
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      hideLoader();
    }
  };

  if (loading && !editableData)
    return (
      <Box
        minHeight="80vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  if (!editableData)
    return (
      <Box p={4}>
        <Alert severity="warning">Data unavailable</Alert>
      </Box>
    );

  return (
    <Box bgcolor="grey.50" minHeight="100vh" pb={8}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Manage Tour
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Editing:{" "}
              </Typography>
              <Chip label={editableData.travelAgencyName} size="small" />
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <EditableSectionCard
                title="Agency & Location"
                subtitle="Contact info and destination details"
                icon={<InfoOutlined />}
                editMode={editSections.basic}
                onToggleEdit={() => toggleEditSection("basic")}
                onSave={() => handleSaveSection("basic")}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Agency Name"
                      value={editableData.travelAgencyName || ""}
                      onChange={(e) =>
                        handleInputChange("travelAgencyName", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Agency Email"
                      value={editableData.agencyEmail || ""}
                      onChange={(e) =>
                        handleInputChange("agencyEmail", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Agency ID"
                      value={editableData.agencyId || ""}
                      onChange={(e) =>
                        handleInputChange("agencyId", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Agency Phone"
                      value={editableData.agencyPhone || ""}
                      onChange={(e) =>
                        handleInputChange("agencyPhone", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  {/* Location Selectors - Fixed */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Country</InputLabel>
                      <Select
                        value={editableData.country || ""}
                        label="Country"
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange("country", val);
                          handleInputChange("state", ""); // Reset state
                          handleInputChange("city", "");  // Reset city
                        }}
                      >
                        {countries.map((c) => (
                          <MenuItem key={c.isoCode} value={c.isoCode}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!editableData.country}
                    >
                      <InputLabel>State</InputLabel>
                      <Select
                        value={editableData.state || ""}
                        label="State"
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange("state", val);
                          handleInputChange("city", ""); // Reset city
                        }}
                      >
                        {states.map((s) => (
                          <MenuItem key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={!editableData.state}
                    >
                      <InputLabel>City</InputLabel>
                      <Select
                        value={editableData.city || ""}
                        label="City"
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                      >
                        {cities.map((c) => (
                          <MenuItem key={c.name} value={c.name}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    {/* Handles both keys for backward compatibility */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Visiting Places (Summary)"
                      value={editableData.visitingPlaces || editableData.visitngPlaces || ""}
                      onChange={(e) => {
                          handleInputChange("visitingPlaces", e.target.value);
                          handleInputChange("visitngPlaces", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={editableData.themes || ""}
                        label="Theme"
                        onChange={(e) =>
                          handleInputChange("themes", e.target.value)
                        }
                      >
                        {tourTheme?.map((t) => (
                          <MenuItem key={t.name} value={t.name}>
                            {t.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      height="100%"
                      border={1}
                      borderColor="divider"
                      borderRadius={1}
                      px={2}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Star Rating:
                      </Typography>
                      <Rating
                        value={Number(editableData.starRating) || 0}
                        onChange={(_, val) =>
                          handleInputChange("starRating", val)
                        }
                        readOnly={!editSections.basic}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </EditableSectionCard>

              <EditableSectionCard
                title="Pricing & Schedule"
                subtitle="Cost, Duration, and Validity"
                icon={<FlightTakeoff />}
                editMode={editSections.pricing}
                onToggleEdit={() => toggleEditSection("pricing")}
                onSave={() => handleSaveSection("pricing")}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Price"
                      value={editableData.price || ""}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Days"
                      value={editableData.days || ""}
                      onChange={(e) =>
                        handleInputChange("days", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Nights"
                      value={editableData.nights || ""}
                      onChange={(e) =>
                        handleInputChange("nights", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box bgcolor="background.default" p={2} borderRadius={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!editableData.customizable}
                            onChange={(e) =>
                              handleInputChange(
                                "customizable",
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Typography fontWeight="bold" variant="body2">
                            Flexible / Customizable Dates
                          </Typography>
                        }
                      />
                      <Grid container spacing={2} mt={0.5}>
                        {editableData.customizable ? (
                          <>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Valid From"
                                InputLabelProps={{ shrink: true }}
                                value={formatDateForInput(editableData.from)}
                                onChange={(e) =>
                                  handleInputChange("from", e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Valid To"
                                InputLabelProps={{ shrink: true }}
                                value={formatDateForInput(editableData.to)}
                                onChange={(e) =>
                                  handleInputChange("to", e.target.value)
                                }
                              />
                            </Grid>
                          </>
                        ) : (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              label="Fixed Start Date"
                              InputLabelProps={{ shrink: true }}
                              value={formatDateForInput(editableData.tourStartDate)}
                              onChange={(e) =>
                                handleInputChange(
                                  "tourStartDate",
                                  e.target.value
                                )
                              }
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </EditableSectionCard>

              <EditableSectionCard
                title="Itinerary"
                subtitle="Day-wise breakdown"
                icon={<EventIcon />}
                editMode={editSections.itinerary}
                onToggleEdit={() => toggleEditSection("itinerary")}
                onSave={() => handleSaveSection("itinerary")}
              >
                <Stack spacing={2}>
                  {(editableData.dayWise || []).map((day, idx) => (
                    <DynamicItemBox key={idx}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight="bold"
                        >
                          Day {day.day}
                        </Typography>
                        {editSections.itinerary && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const newDays = editableData.dayWise.filter(
                                (_, i) => i !== idx
                              );
                              handleInputChange("dayWise", newDays);
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        placeholder="Describe the day's activities..."
                        value={day.description || ""}
                        onChange={(e) =>
                          handleInputChange(
                            `dayWise.${idx}.description`,
                            e.target.value
                          )
                        }
                      />
                    </DynamicItemBox>
                  ))}
                  {editSections.itinerary && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddDay}
                    >
                      Add Day
                    </Button>
                  )}
                </Stack>
              </EditableSectionCard>

              <EditableSectionCard
                title="Package Details"
                subtitle="Overview, Inclusions & Amenities"
                icon={<DescriptionOutlined />}
                editMode={editSections.details}
                onToggleEdit={() => toggleEditSection("details")}
                onSave={() => handleSaveSection("details")}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Overview"
                      value={editableData.overview || ""}
                      onChange={(e) =>
                        handleInputChange("overview", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Inclusions"
                      helperText="One per line"
                      value={
                        Array.isArray(editableData.inclusion)
                          ? editableData.inclusion.join("\n")
                          : editableData.inclusion || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "inclusion",
                          e.target.value.split("\n")
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Exclusions"
                      helperText="One per line"
                      value={
                        Array.isArray(editableData.exclusion)
                          ? editableData.exclusion.join("\n")
                          : editableData.exclusion || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "exclusion",
                          e.target.value.split("\n")
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Amenities</InputLabel>
                      <Select
                        multiple
                        value={editableData.amenities || []}
                        onChange={(e) =>
                          handleInputChange("amenities", e.target.value)
                        }
                        renderValue={(selected) => (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {selected.map((v) => (
                              <Chip key={v} label={v} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {[
                          "WiFi",
                          "Parking",
                          "Pool",
                          "Gym",
                          "Restaurant",
                          "Guide",
                        ].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </EditableSectionCard>

              <EditableSectionCard
                title="Vehicles"
                subtitle="Manage transport options"
                icon={<DirectionsBus />}
                editMode={editSections.vehicles}
                onToggleEdit={() => toggleEditSection("vehicles")}
                onSave={() => handleSaveSection("vehicles")}
              >
                <Stack spacing={2}>
                  {(editableData.vehicles || []).map((v, idx) => (
                    <DynamicItemBox key={idx}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography variant="caption" fontWeight="bold">
                          VEHICLE {idx + 1}
                        </Typography>
                        {editSections.vehicles && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const newVehicles = editableData.vehicles.filter(
                                (_, i) => i !== idx
                              );
                              handleInputChange("vehicles", newVehicles);
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Name"
                            value={v.name || ""}
                            onChange={(e) =>
                              handleInputChange(
                                `vehicles.${idx}.name`,
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Number"
                            value={v.vehicleNumber || ""}
                            onChange={(e) =>
                              handleInputChange(
                                `vehicles.${idx}.vehicleNumber`,
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Seats"
                            value={v.totalSeats || ""}
                            onChange={(e) =>
                              handleInputChange(
                                `vehicles.${idx}.totalSeats`,
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="₹/Seat"
                            value={v.pricePerSeat || ""}
                            onChange={(e) =>
                              handleInputChange(
                                `vehicles.${idx}.pricePerSeat`,
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                    </DynamicItemBox>
                  ))}
                  {editSections.vehicles && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        handleInputChange("vehicles", [
                          ...(editableData.vehicles || []),
                          {
                            name: "",
                            vehicleNumber: "",
                            totalSeats: "",
                            pricePerSeat: 0,
                            isActive: true,
                          },
                        ])
                      }
                    >
                      Add Vehicle
                    </Button>
                  )}
                </Stack>
              </EditableSectionCard>

              <EditableSectionCard
                title="Policies"
                subtitle="Terms, Refund & Booking"
                icon={<PolicyOutlined />}
                editMode={editSections.terms}
                onToggleEdit={() => toggleEditSection("terms")}
                onSave={() => handleSaveSection("terms")}
              >
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Cancellation Policy"
                    value={editableData.termsAndConditions?.cancellation || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "termsAndConditions.cancellation",
                        e.target.value
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Refund Policy"
                    value={editableData.termsAndConditions?.refund || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "termsAndConditions.refund",
                        e.target.value
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Booking Policy"
                    value={editableData.termsAndConditions?.bookingPolicy || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "termsAndConditions.bookingPolicy",
                        e.target.value
                      )
                    }
                  />
                </Stack>
              </EditableSectionCard>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: 24 }}>
              {(role === "Admin" || role === "Developer") && (
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardHeader
                    title="Approval Status"
                    titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
                  />
                  <Divider />
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      bgcolor="grey.50"
                      p={2}
                      borderRadius={2}
                    >
                      <Typography variant="body2">Current Status:</Typography>
                      <Chip
                        label={
                          editableData.isAccepted
                            ? "Accepted"
                            : "Pending / Declined"
                        }
                        color={editableData.isAccepted ? "success" : "warning"}
                        variant="filled"
                      />
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleStatusChange(true)}
                      >
                        Accept
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleStatusChange(false)}
                      >
                        Decline
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <StyledCard>
                <CardHeader
                  title={
                    <SectionHeader
                      icon={<ImageOutlined />}
                      title="Gallery"
                      subtitle="Manage images"
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(2, 1fr)"
                    gap={1}
                    mb={2}
                  >
                    {(editableData.images || []).map((img, idx) => (
                      <Box
                        key={idx}
                        position="relative"
                        sx={{ aspectRatio: "4/3" }}
                      >
                        <img
                          src={img}
                          alt="tour"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleImageActions("delete", idx)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "white",
                            "&:hover": { bgcolor: "red" },
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  <label>
                    <UploadBox>
                      <UploadFile
                        color="primary"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Click to Upload
                      </Typography>
                    </UploadBox>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleImageActions("upload", Array.from(e.target.files))
                      }
                    />
                  </label>
                </CardContent>
              </StyledCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}