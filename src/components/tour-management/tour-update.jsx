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
  Paper,
  Rating,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
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

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

// --- Styled Components ---
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
}));

const ImageCard = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  aspectRatio: "16/9",
  backgroundColor: theme.palette.grey[100],
  "&:hover .delete-btn": {
    opacity: 1,
  },
}));

// --- Main Component ---
export default function TourUpdate() {
  const { editData, loading } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { showLoader, hideLoader } = useLoader();

  // State
  const [tourData, setTourData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const tourTheme = useTourTheme();

  // --- Load Tour Data ---
  useEffect(() => {
    if (id) {
      showLoader();
      dispatch(tourById(id)).finally(() => hideLoader());
    }
  }, [id]);

  // --- Process Data ---
// --- Process Data ---
useEffect(() => {
  if (!loading && editData) {
    console.log("🔥 Received editData:", editData);

    let data = null;

    // Handle different response formats
    if (Array.isArray(editData) && editData.length > 0) {
      // Case 1: Array with {success: true, data: {...}}
      if (editData[0]?.success && editData[0]?.data) {
        data = editData[0].data;
      }
      // Case 2: Array with direct object
      else if (editData[0]?._id) {
        data = editData[0];
      }
    }
    // Case 3: Direct {success: true, data: {...}}
    else if (editData?.success && editData?.data) {
      data = editData.data;
    }
    // Case 4: Direct object
    else if (editData?._id) {
      data = editData;
    }

    if (data && data._id) {
      console.log("✅ Processing data:", data);
      
      // Ensure all required fields
      const processedData = {
        ...data,
        images: data.images || [],
        amenities: data.amenities || [],
        inclusion: data.inclusion || [],
        exclusion: data.exclusion || [],
        dayWise: data.dayWise || [],
        vehicles: data.vehicles || [],
        termsAndConditions: data.termsAndConditions || {},
      };

      setTourData(processedData);
    } else {
      console.error("❌ Invalid data structure:", editData);
    }
  }
}, [editData, loading]);


  // --- Load Countries ---
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // --- Load States/Cities ---
  useEffect(() => {
    if (tourData?.country) {
      const country = countries.find(
        (c) => c.name === tourData.country || c.isoCode === tourData.country
      );

      if (country) {
        const stateList = State.getStatesOfCountry(country.isoCode);
        setStates(stateList);

        if (tourData?.state) {
          const state = stateList.find(
            (s) => s.name === tourData.state || s.isoCode === tourData.state
          );

          if (state) {
            setCities(City.getCitiesOfState(country.isoCode, state.isoCode));
          }
        }
      }
    }
  }, [tourData?.country, tourData?.state, countries]);

  // --- Handlers ---
  const updateField = useCallback((field, value) => {
    setTourData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedField = useCallback((path, value) => {
    setTourData((prev) => {
      const newData = deepCopy(prev);
      const keys = path.split(".");
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleSave = async () => {
    if (!tourData) return;

    showLoader();
    try {
      const dataToSend = { ...tourData };
      delete dataToSend._id;
      delete dataToSend.__v;
      delete dataToSend.createdAt;
      delete dataToSend.updatedAt;

      await dispatch(tourUpdate({ id, data: dataToSend })).unwrap();
      toast.success("Tour updated successfully!");
      dispatch(tourById(id));
    } catch (err) {
      console.error(err);
      toast.error("Update failed!");
    } finally {
      hideLoader();
    }
  };

  const handleImageUpload = async (files) => {
    showLoader();
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      await dispatch(updateTourImage({ id, formData })).unwrap();
      toast.success("Images uploaded!");
      dispatch(tourById(id));
    } catch (err) {
      toast.error("Upload failed!");
    } finally {
      hideLoader();
    }
  };

  const handleImageDelete = async (index) => {
    showLoader();
    try {
      await dispatch(deleteTourImage({ id, index })).unwrap();
      toast.success("Image deleted!");
      dispatch(tourById(id));
    } catch (err) {
      toast.error("Delete failed!");
    } finally {
      hideLoader();
    }
  };

  const handleStatusChange = async (isAccepted) => {
    showLoader();
    try {
      await dispatch(tourUpdate({ id, data: { isAccepted } })).unwrap();
      toast.success(`Tour ${isAccepted ? "Accepted" : "Rejected"}`);
      dispatch(tourById(id));
    } catch (err) {
      toast.error("Status update failed!");
    } finally {
      hideLoader();
    }
  };

  // --- Loading State ---
  if (loading || !tourData) {
    return (
      <Box
        minHeight="80vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // --- Render ---
  return (
    <Box bgcolor="grey.50" minHeight="100vh" py={4}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Edit Tour
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tourData?.travelAgencyName} • {tourData?.city}, {tourData?.state}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>

        {/* Status Bar */}
        {(role === "Admin" || role === "Developer") && (
          <Alert
            severity={tourData.isAccepted ? "success" : "warning"}
            sx={{ mb: 3, borderRadius: 3 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="success"
                  variant="contained"
                  onClick={() => handleStatusChange(true)}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => handleStatusChange(false)}
                >
                  Reject
                </Button>
              </Stack>
            }
          >
            Tour Status: {tourData.isAccepted ? "Accepted ✓" : "Pending Review"}
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Paper sx={{ borderRadius: 3, mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<InfoOutlined />} label="Basic Info" />
            <Tab icon={<FlightTakeoff />} label="Pricing" />
            <Tab icon={<EventIcon />} label="Itinerary" />
            <Tab icon={<DescriptionOutlined />} label="Details" />
            <Tab icon={<DirectionsBus />} label="Vehicles" />
            <Tab icon={<PolicyOutlined />} label="Policies" />
            <Tab icon={<ImageOutlined />} label="Gallery" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <StyledPaper>
          {/* Tab 0: Basic Info */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Agency Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agency Name"
                  value={tourData.travelAgencyName || ""}
                  onChange={(e) =>
                    updateField("travelAgencyName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agency ID"
                  value={tourData.agencyId || ""}
                  onChange={(e) => updateField("agencyId", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={tourData.agencyEmail || ""}
                  onChange={(e) => updateField("agencyEmail", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={tourData.agencyPhone || ""}
                  onChange={(e) => updateField("agencyPhone", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Location Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={tourData.country || ""}
                    label="Country"
                    onChange={(e) => {
                      updateField("country", e.target.value);
                      updateField("state", "");
                      updateField("city", "");
                    }}
                  >
                    {countries.map((c) => (
                      <MenuItem key={c.isoCode} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!tourData.country}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={tourData.state || ""}
                    label="State"
                    onChange={(e) => {
                      updateField("state", e.target.value);
                      updateField("city", "");
                    }}
                  >
                    {states.map((s) => (
                      <MenuItem key={s.isoCode} value={s.name}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!tourData.state}>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={tourData.city || ""}
                    label="City"
                    onChange={(e) => updateField("city", e.target.value)}
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
                <TextField
                  fullWidth
                  label="Visiting Places"
                  value={tourData.visitngPlaces || tourData.visitingPlaces || ""}
                  onChange={(e) => {
                    updateField("visitngPlaces", e.target.value);
                    updateField("visitingPlaces", e.target.value);
                  }}
                  helperText="Comma-separated list of places"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={tourData.themes || ""}
                    label="Theme"
                    onChange={(e) => updateField("themes", e.target.value)}
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
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Star Rating
                  </Typography>
                  <Rating
                    value={Number(tourData.starRating) || 0}
                    onChange={(e, val) => updateField("starRating", val)}
                    size="large"
                  />
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Pricing */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={tourData.price || ""}
                  onChange={(e) => updateField("price", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  fullWidth
                  label="Days"
                  type="number"
                  value={tourData.days || ""}
                  onChange={(e) => updateField("days", e.target.value)}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  fullWidth
                  label="Nights"
                  type="number"
                  value={tourData.nights || ""}
                  onChange={(e) => updateField("nights", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!tourData.isCustomizable}
                      onChange={(e) =>
                        updateField("isCustomizable", e.target.checked)
                      }
                    />
                  }
                  label="Flexible Dates (Customizable)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Valid From"
                  InputLabelProps={{ shrink: true }}
                  value={formatDateForInput(tourData.from)}
                  onChange={(e) => updateField("from", e.target.value)}
                />
              </Grid>

              {tourData.isCustomizable && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Valid To"
                    InputLabelProps={{ shrink: true }}
                    value={formatDateForInput(tourData.to)}
                    onChange={(e) => updateField("to", e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 2: Itinerary */}
          {activeTab === 2 && (
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={600}>
                  Day-wise Plan
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    updateField("dayWise", [
                      ...(tourData.dayWise || []),
                      {
                        day: (tourData.dayWise?.length || 0) + 1,
                        description: "",
                      },
                    ])
                  }
                >
                  Add Day
                </Button>
              </Box>

              {(tourData.dayWise || []).map((day, idx) => (
                <Paper key={idx} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Stack spacing={2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Chip label={`Day ${day.day}`} color="primary" />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          updateField(
                            "dayWise",
                            tourData.dayWise.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe the day's activities..."
                      value={day.description || ""}
                      onChange={(e) =>
                        updateField(
                          "dayWise",
                          tourData.dayWise.map((d, i) =>
                            i === idx ? { ...d, description: e.target.value } : d
                          )
                        )
                      }
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Tab 3: Details */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Inclusions"
                  helperText="One per line"
                  value={
                    Array.isArray(tourData.inclusion)
                      ? tourData.inclusion.join("\n")
                      : tourData.inclusion || ""
                  }
                  onChange={(e) =>
                    updateField("inclusion", e.target.value.split("\n"))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Exclusions"
                  helperText="One per line"
                  value={
                    Array.isArray(tourData.exclusion)
                      ? tourData.exclusion.join("\n")
                      : tourData.exclusion || ""
                  }
                  onChange={(e) =>
                    updateField("exclusion", e.target.value.split("\n"))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Amenities</InputLabel>
                  <Select
                    multiple
                    value={tourData.amenities || []}
                    onChange={(e) => updateField("amenities", e.target.value)}
                    renderValue={(selected) => (
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {selected.map((v) => (
                          <Chip key={v} label={v} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {[
                      "Hotel Stay",
                      "Breakfast & Dinner",
                      "Sightseeing",
                      "Tour Guide",
                      "Transport",
                      "WiFi",
                      "Parking",
                    ].map((a) => (
                      <MenuItem key={a} value={a}>
                        {a}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Vehicles */}
          {activeTab === 4 && (
            <Stack spacing={3}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={600}>
                  Vehicles
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    updateField("vehicles", [
                      ...(tourData.vehicles || []),
                      {
                        name: "",
                        vehicleNumber: "",
                        totalSeats: 0,
                        pricePerSeat: 0,
                        isActive: true,
                      },
                    ])
                  }
                >
                  Add Vehicle
                </Button>
              </Box>

              {(tourData.vehicles || []).map((vehicle, idx) => (
                <Paper key={idx} sx={{ p: 3, bgcolor: "grey.50" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          Vehicle {idx + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() =>
                            updateField(
                              "vehicles",
                              tourData.vehicles.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vehicle Name"
                        value={vehicle.name || ""}
                        onChange={(e) =>
                          updateField(
                            "vehicles",
                            tourData.vehicles.map((v, i) =>
                              i === idx ? { ...v, name: e.target.value } : v
                            )
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vehicle Number"
                        value={vehicle.vehicleNumber || ""}
                        onChange={(e) =>
                          updateField(
                            "vehicles",
                            tourData.vehicles.map((v, i) =>
                              i === idx
                                ? { ...v, vehicleNumber: e.target.value }
                                : v
                            )
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Total Seats"
                        value={vehicle.totalSeats || ""}
                        onChange={(e) =>
                          updateField(
                            "vehicles",
                            tourData.vehicles.map((v, i) =>
                              i === idx
                                ? { ...v, totalSeats: Number(e.target.value) }
                                : v
                            )
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Price Per Seat"
                        value={vehicle.pricePerSeat || ""}
                        onChange={(e) =>
                          updateField(
                            "vehicles",
                            tourData.vehicles.map((v, i) =>
                              i === idx
                                ? { ...v, pricePerSeat: Number(e.target.value) }
                                : v
                            )
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Tab 5: Policies */}
          {activeTab === 5 && (
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Booking Policy"
                value={tourData.termsAndConditions?.booking || ""}
                onChange={(e) =>
                  updateNestedField("termsAndConditions.booking", e.target.value)
                }
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Cancellation Policy"
                value={tourData.termsAndConditions?.cancellation || ""}
                onChange={(e) =>
                  updateNestedField(
                    "termsAndConditions.cancellation",
                    e.target.value
                  )
                }
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="ID Proof / Documents"
                value={
                  tourData.termsAndConditions?.idProof ||
                  tourData.termsAndConditions?.documents ||
                  ""
                }
                onChange={(e) => {
                  updateNestedField("termsAndConditions.idProof", e.target.value);
                  updateNestedField("termsAndConditions.documents", e.target.value);
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Other Terms"
                value={tourData.termsAndConditions?.weather || ""}
                onChange={(e) =>
                  updateNestedField("termsAndConditions.weather", e.target.value)
                }
              />
            </Stack>
          )}

          {/* Tab 6: Gallery */}
          {activeTab === 6 && (
            <Box>
              <Box mb={3}>
                <label>
                  <Box
                    p={4}
                    border="2px dashed"
                    borderColor="grey.300"
                    borderRadius={3}
                    textAlign="center"
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "grey.50",
                      },
                    }}
                  >
                    <UploadFile sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Click to Upload Images
                    </Typography>
                  </Box>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
              </Box>

              <Grid container spacing={2}>
                {(tourData.images || []).map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <ImageCard>
                      <img
                        src={img}
                        alt={`Tour ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        className="delete-btn"
                        onClick={() => handleImageDelete(idx)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(0,0,0,0.7)",
                          color: "white",
                          opacity: 0,
                          transition: "opacity 0.3s",
                          "&:hover": {
                            bgcolor: "error.main",
                          },
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </ImageCard>
                  </Grid>
                ))}
              </Grid>

              {tourData.images?.length === 0 && (
                <Alert severity="info">No images uploaded yet</Alert>
              )}
            </Box>
          )}
        </StyledPaper>

        {/* Floating Save Button */}
        <Box
          position="fixed"
          bottom={24}
          right={24}
          zIndex={1000}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{
              borderRadius: 8,
              px: 4,
              py: 1.5,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            Save All Changes
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
