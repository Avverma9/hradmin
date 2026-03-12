import {
  Add as AddIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Close as CloseIcon,
  Delete,
  DirectionsBus,
  Save,
  AirlineSeatReclineNormal as SeatIcon, // Real seat icon
  Circle as SteeringIcon,
  Upload,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
  alpha,
  stepConnectorClasses,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { City, Country, State } from "country-state-city";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Utils & Redux
import { useHotelAmenities } from "../../../utils/additional/hotelAmenities";
import { useTourTheme } from "../../../utils/additional/tourTheme";
import { useLoader } from "../../../utils/loader";
import { buildTourPayload } from "../../../utils/tour-payload";
import { role } from "../../../utils/util";
import {
  deleteTourImage,
  tourById,
  updateTour,
  updateTourImage,
} from "../redux/reducers/tour/tour";

/* =========================================================
   1. CONSTANTS & PRESETS
========================================================= */
const VEHICLE_PRESETS = {
  "Sedan (4 Seater)": {
    seaterType: "2+2",
    totalSeats: 4,
    pricePerSeat: 1500,
    seatConfig: { rows: 2, left: 2, right: 0, aisle: false },
  },
  "Innova / SUV (6 Seater)": {
    seaterType: "2x2",
    totalSeats: 6,
    pricePerSeat: 2000,
    seatConfig: { rows: 3, left: 2, right: 0, aisle: false },
  },
  "Tempo Traveller (12 Seater)": {
    seaterType: "1x1",
    totalSeats: 12,
    pricePerSeat: 1200,
    seatConfig: { rows: 4, left: 1, right: 2, aisle: true },
  },
  "Tempo Traveller (17 Seater)": {
    seaterType: "2x1",
    totalSeats: 17,
    pricePerSeat: 1100,
    seatConfig: { rows: 6, left: 1, right: 2, aisle: true },
  },
  "Mini Bus (25 Seater)": {
    seaterType: "2x2",
    totalSeats: 25,
    pricePerSeat: 800,
    seatConfig: { rows: 7, left: 2, right: 2, aisle: true },
  },
  "Volvo / Luxury Bus (45 Seater)": {
    seaterType: "2x2",
    totalSeats: 45,
    pricePerSeat: 1500,
    seatConfig: { rows: 11, left: 2, right: 2, aisle: true },
  },
  "Sleeper Bus (30 Seater)": {
    seaterType: "2x1",
    totalSeats: 30,
    pricePerSeat: 2000,
    seatConfig: { rows: 10, left: 1, right: 2, aisle: true },
  },
};

/* =========================================================
   2. STYLED COMPONENTS (Modern UI)
========================================================= */

const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(145deg, ${alpha(
    theme.palette.primary.main,
    0.03
  )} 0%, #ffffff 100%)`,
  paddingBottom: theme.spacing(10),
}));

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  backdropFilter: "blur(10px)",
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  overflow: "visible",
}));

const SectionBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
  backgroundColor: "#fff",
  borderRadius: 16,
  border: `1px solid ${theme.palette.grey[200]}`,
  marginBottom: theme.spacing(2),
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: 16,
  height: 160,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  backgroundColor: theme.palette.grey[50],
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

// Stepper Styles
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[200],
    borderRadius: 1,
  },
}));

// Realistic Vehicle Preview Styles
const VehicleChassis = styled(Box)(({ theme }) => ({
  border: `4px solid ${theme.palette.grey[400]}`,
  borderRadius: "40px 40px 12px 12px",
  backgroundColor: "#fff",
  padding: theme.spacing(2),
  width: "fit-content",
  margin: "0 auto",
  position: "relative",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  minWidth: 220,
}));

const DriverCabin = styled(Box)(({ theme }) => ({
  borderBottom: `2px dashed ${theme.palette.grey[300]}`,
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  color: theme.palette.grey[500],
}));

const SeatIconStyled = styled(SeatIcon)(({ theme }) => ({
  fontSize: 28,
  color: theme.palette.primary.main,
  margin: "2px",
  cursor: "default",
}));

/* =========================================================
   3. HELPER FUNCTIONS
========================================================= */
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

const generateSeatLayout = (seatConfig, totalSeats) => {
  const { rows, left, right, aisle } = seatConfig || {};
  if (!rows || !left || (!right && right !== 0) || !totalSeats) return [];

  const rowsNum = parseInt(rows);
  const leftNum = parseInt(left);
  const rightNum = parseInt(right);
  const total = parseInt(totalSeats);
  const seatCodes = [];
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let seatCount = 0;

  for (let row = 1; row <= rowsNum; row++) {
    for (let col = 0; col < leftNum; col++) {
      if (seatCount >= total) break;
      seatCodes.push(`${row}${columns[col]}`);
      seatCount++;
    }
    const rightOffset = aisle ? leftNum + 1 : leftNum;
    for (let col = 0; col < rightNum; col++) {
      if (seatCount >= total) break;
      seatCodes.push(`${row}${columns[rightOffset + col]}`);
      seatCount++;
    }
    if (seatCount >= total) break;
  }
  return seatCodes.slice(0, total);
};

/* =========================================================
   4. MAIN COMPONENT
========================================================= */
export default function TourUpdate() {
  const { editData, loading } = useSelector((state) => state?.tour);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showLoader, hideLoader } = useLoader();

  // --- STATE ---
  const [tourData, setTourData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Local state for dynamic policies (since backend sends Map, UI needs Array)
  const [policies, setPolicies] = useState([]);

  const tourTheme = useTourTheme();
  const hotelAmenitiesData = useHotelAmenities();
  const amenitiesList = hotelAmenitiesData.map((a) => a?.name);

  const steps = [
    "Basics",
    "Location",
    "Itinerary",
    "Transport",
    "Policies",
    "Gallery",
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    if (id) {
      showLoader();
      dispatch(tourById(id)).finally(() => hideLoader());
    }
  }, [id]);

  // Process Redux Data into State
  useEffect(() => {
    if (!loading && editData) {
      let data = Array.isArray(editData) ? editData[0] : editData;
      if (data?.data) data = data.data;

      if (data && data._id) {
        // Normalize Data
        const processedData = {
          ...data,
          agencyId: data.agencyId || "",
          isAccepted: Boolean(data.isAccepted),
          tourStartDate:
            data.tourStartDate ||
            (!data.isCustomizable ? data.from || data.to || "" : ""),
          images: data.images || [],
          amenities: data.amenities || [],
          inclusion: data.inclusion || [],
          exclusion: data.exclusion || [],
          dayWise: data.dayWise || [],
          vehicles: (data.vehicles || []).map((v) => ({
            ...v,
            seatConfig: v.seatConfig || {
              rows: "",
              left: "",
              right: "",
              aisle: false,
            },
            seatLayout: v.seatLayout || [],
            bookedSeats: v.bookedSeats || [],
          })),
        };

        setTourData(processedData);

        // Transform Policies Map to Array for UI
        if (data.termsAndConditions) {
          const policyArray = Object.entries(data.termsAndConditions).map(
            ([key, value]) => ({ key, value })
          );
          setPolicies(
            policyArray.length > 0
              ? policyArray
              : [{ key: "Booking Policy", value: "" }]
          );
        }
      }
    }
  }, [editData, loading]);

  // Load Locations
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (tourData?.country) {
      const c = countries.find(
        (x) => x.name === tourData.country || x.isoCode === tourData.country
      );
      if (c) {
        setStates(State.getStatesOfCountry(c.isoCode));
        if (tourData.state) {
          const s = State.getStatesOfCountry(c.isoCode).find(
            (x) => x.name === tourData.state || x.isoCode === tourData.state
          );
          if (s) setCities(City.getCitiesOfState(c.isoCode, s.isoCode));
        }
      }
    }
  }, [tourData?.country, tourData?.state, countries]);

  // --- HANDLERS ---
  const updateField = useCallback((field, value) => {
    setTourData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVisitingPlacesBlur = () => {
    let val = tourData.visitngPlaces;
    if (!val) return;
    let corrected = val
      .replace(/[\/\\]+/g, "|")
      .replace(/\s*\|\s*/g, " | ")
      .replace(/\b(\d+)\s*n\b/gi, "$1N"); // Capitalize N
    if (corrected !== val) {
      updateField("visitngPlaces", corrected);
    }
  };

  // Policy Handlers
  const handlePolicyChange = (index, field, val) => {
    const updated = [...policies];
    updated[index][field] = val;
    setPolicies(updated);
  };
  const addPolicy = () => setPolicies([...policies, { key: "", value: "" }]);
  const removePolicy = (index) =>
    setPolicies(policies.filter((_, i) => i !== index));

  // Vehicle Handlers
  const addVehicle = () =>
    updateField("vehicles", [
      ...(tourData.vehicles || []),
      {
        name: "",
        vehicleNumber: "",
        seaterType: "",
        totalSeats: "",
        pricePerSeat: 0,
        isActive: true,
        seatConfig: { rows: "", left: "", right: "", aisle: false },
        seatLayout: [],
        bookedSeats: [],
      },
    ]);

  const removeVehicle = (idx) =>
    updateField(
      "vehicles",
      tourData.vehicles.filter((_, i) => i !== idx)
    );

  const updateVehicle = (idx, field, value) => {
    const v = [...tourData.vehicles];
    v[idx][field] = value;
    if (field === "totalSeats")
      v[idx].seatLayout = generateSeatLayout(v[idx].seatConfig, value);
    updateField("vehicles", v);
  };

  const updateSeatConfig = (idx, field, value) => {
    const v = [...tourData.vehicles];
    v[idx].seatConfig = { ...v[idx].seatConfig, [field]: value };
    if (v[idx].totalSeats && v[idx].seatConfig.rows)
      v[idx].seatLayout = generateSeatLayout(
        v[idx].seatConfig,
        v[idx].totalSeats
      );
    updateField("vehicles", v);
  };

  // Navigation
  const handleNext = () =>
    activeStep < steps.length - 1 && setActiveStep((p) => p + 1);
  const handleBack = () => activeStep > 0 && setActiveStep((p) => p - 1);

  // --- ACTIONS ---
  const handleSave = async () => {
    if (!tourData) return;
    showLoader();
    try {
      const dataToSend = buildTourPayload(tourData, {
        policies,
        agencyIdFallback: tourData?.agencyId || "",
        defaultAccepted: false,
      });

      await dispatch(updateTour({ id, data: dataToSend })).unwrap();
      toast.success("Tour updated successfully!");
      dispatch(tourById(id));
    } catch (err) {
      toast.error(err?.message || "Update failed!");
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
      await dispatch(updateTour({ id, data: { isAccepted } })).unwrap();
      toast.success(`Tour ${isAccepted ? "Accepted" : "Rejected"}`);
      dispatch(tourById(id));
    } catch (err) {
      toast.error("Status update failed!");
    } finally {
      hideLoader();
    }
  };

  if (loading || !tourData)
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

  /* =========================================================
     5. RENDER CONTENT
  ========================================================= */
  const renderStepContent = () => {
    switch (activeStep) {
      // --- STEP 0: BASICS ---
      case 0:
        return (
          <Stack spacing={3}>
            <SectionBox>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Agency Details
              </Typography>
              <Grid container spacing={2}>
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
                    label="Phone Number"
                    value={tourData.agencyPhone || ""}
                    onChange={(e) => updateField("agencyPhone", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={tourData.agencyEmail || ""}
                    onChange={(e) => updateField("agencyEmail", e.target.value)}
                  />
                </Grid>
              </Grid>
            </SectionBox>

            <SectionBox>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Tour Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={tourTheme || []}
                    getOptionLabel={(option) => option.name || option}
                    value={
                      tourTheme?.find((t) => t.name === tourData.themes) ||
                      tourData.themes ||
                      ""
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Theme" />
                    )}
                    onChange={(_, val) =>
                      updateField("themes", val?.name || "")
                    }
                  />
                </Grid>
                <Grid item xs={6} md={4}>
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
                    select
                    fullWidth
                    label="Rating"
                    value={tourData.starRating || ""}
                    onChange={(e) => updateField("starRating", e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} Star
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="Days"
                    type="number"
                    value={tourData.days || ""}
                    onChange={(e) => updateField("days", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="Nights"
                    type="number"
                    value={tourData.nights || ""}
                    onChange={(e) => updateField("nights", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={amenitiesList}
                    freeSolo
                    value={tourData.amenities || []}
                    onChange={(_, newValue) =>
                      updateField("amenities", newValue)
                    }
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          deleteIcon={<CloseIcon />}
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Amenities" />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Inclusions"
                    placeholder="One item per line"
                    value={
                      Array.isArray(tourData.inclusion)
                        ? tourData.inclusion.join("\n")
                        : tourData.inclusion
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
                    rows={4}
                    label="Exclusions"
                    placeholder="One item per line"
                    value={
                      Array.isArray(tourData.exclusion)
                        ? tourData.exclusion.join("\n")
                        : tourData.exclusion
                    }
                    onChange={(e) =>
                      updateField("exclusion", e.target.value.split("\n"))
                    }
                  />
                </Grid>
              </Grid>
            </SectionBox>
          </Stack>
        );

      // --- STEP 1: LOCATION ---
      case 1:
        return (
          <SectionBox>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Destination Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  value={
                    countries.find(
                      (c) =>
                        c.name === tourData.country ||
                        c.isoCode === tourData.country
                    ) || null
                  }
                  onChange={(_, val) => {
                    updateField("country", val?.name || "");
                    updateField("state", "");
                    updateField("city", "");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Country" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={states}
                  getOptionLabel={(option) => option.name}
                  disabled={!tourData.country}
                  value={
                    states.find(
                      (s) =>
                        s.name === tourData.state ||
                        s.isoCode === tourData.state
                    ) || null
                  }
                  onChange={(_, val) => {
                    updateField("state", val?.name || "");
                    updateField("city", "");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="State" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={cities}
                  getOptionLabel={(option) => option.name}
                  disabled={!tourData.state}
                  value={cities.find((c) => c.name === tourData.city) || null}
                  onChange={(_, val) => updateField("city", val?.name || "")}
                  renderInput={(params) => (
                    <TextField {...params} label="City" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Visiting Places"
                  value={tourData.visitngPlaces || ""}
                  onChange={(e) => updateField("visitngPlaces", e.target.value)}
                  onBlur={handleVisitingPlacesBlur}
                  placeholder="e.g. 2N Delhi | 1N Agra"
                />
              </Grid>
            </Grid>
          </SectionBox>
        );

      // --- STEP 2: ITINERARY ---
      case 2:
        return (
          <Stack spacing={2}>
            <SectionBox>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Timeline
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!tourData.isCustomizable}
                      onChange={(e) =>
                        updateField("isCustomizable", e.target.checked)
                      }
                    />
                  }
                  label="Customizable Dates"
                />
              </Box>

              <Grid container spacing={2}>
                {tourData.isCustomizable ? (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="From"
                        value={formatDateForInput(tourData.from)}
                        onChange={(e) => updateField("from", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="To"
                        value={formatDateForInput(tourData.to)}
                        onChange={(e) => updateField("to", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      value={formatDateForInput(tourData.tourStartDate)}
                      onChange={(e) =>
                        updateField("tourStartDate", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </SectionBox>

            {(tourData.dayWise || []).map((day, idx) => (
              <SectionBox key={idx} sx={{ position: "relative", p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 32,
                      height: 32,
                      fontSize: 14,
                    }}
                  >
                    {day.day}
                  </Avatar>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder={`Activities for Day ${day.day}...`}
                      value={day.description}
                      onChange={(e) => {
                        const d = [...tourData.dayWise];
                        d[idx].description = e.target.value;
                        updateField("dayWise", d);
                      }}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      updateField(
                        "dayWise",
                        tourData.dayWise
                          .filter((_, i) => i !== idx)
                          .map((item, i) => ({ ...item, day: i + 1 }))
                      )
                    }
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </SectionBox>
            ))}
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              fullWidth
              sx={{ borderStyle: "dashed", py: 1.5 }}
              onClick={() =>
                updateField("dayWise", [
                  ...tourData.dayWise,
                  { day: tourData.dayWise.length + 1, description: "" },
                ])
              }
            >
              Add Day {tourData.dayWise.length + 1}
            </Button>
          </Stack>
        );

      // --- STEP 3: VEHICLES ---
      case 3:
        return (
          <Stack spacing={4}>
            {tourData.vehicles.map((v, idx) => (
              <SectionBox key={idx}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Chip
                    icon={<DirectionsBus />}
                    label={`Vehicle ${idx + 1}`}
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: "bold" }}
                  />
                  <IconButton
                    onClick={() => removeVehicle(idx)}
                    color="error"
                    disabled={tourData.vehicles.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      freeSolo
                      options={Object.keys(VEHICLE_PRESETS)}
                      value={v.name || ""}
                      onChange={(_, newVal) => {
                        updateVehicle(idx, "name", newVal || "");
                        if (newVal && VEHICLE_PRESETS[newVal]) {
                          const preset = VEHICLE_PRESETS[newVal];
                          updateVehicle(idx, "seaterType", preset.seaterType);
                          updateVehicle(idx, "totalSeats", preset.totalSeats);
                          updateVehicle(
                            idx,
                            "pricePerSeat",
                            preset.pricePerSeat
                          );
                          const updated = [...tourData.vehicles];
                          updated[idx].seatConfig = { ...preset.seatConfig };
                          updated[idx].name = newVal;
                          updated[idx].seatLayout = generateSeatLayout(
                            preset.seatConfig,
                            preset.totalSeats
                          );
                          updateField("vehicles", updated);
                          toast.success(`${newVal} preset applied!`);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Vehicle Type"
                          helperText="Auto-fills configuration"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Seater Type"
                      value={v.seaterType}
                      onChange={(e) =>
                        updateVehicle(idx, "seaterType", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Price/Seat"
                      type="number"
                      value={v.pricePerSeat}
                      onChange={(e) =>
                        updateVehicle(idx, "pricePerSeat", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vehicle Number"
                      value={v.vehicleNumber || ""}
                      onChange={(e) =>
                        updateVehicle(idx, "vehicleNumber", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider>Seat Configuration</Divider>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      size="small"
                      label="Total Seats"
                      type="number"
                      value={v.totalSeats}
                      onChange={(e) =>
                        updateVehicle(idx, "totalSeats", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      size="small"
                      label="Rows"
                      type="number"
                      value={v.seatConfig?.rows || ""}
                      onChange={(e) =>
                        updateSeatConfig(idx, "rows", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      size="small"
                      label="Left"
                      type="number"
                      value={v.seatConfig?.left || ""}
                      onChange={(e) =>
                        updateSeatConfig(idx, "left", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      size="small"
                      label="Right"
                      type="number"
                      value={v.seatConfig?.right || ""}
                      onChange={(e) =>
                        updateSeatConfig(idx, "right", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4} display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!v.seatConfig?.aisle}
                          onChange={(e) =>
                            updateSeatConfig(idx, "aisle", e.target.checked)
                          }
                        />
                      }
                      label="Aisle"
                    />
                  </Grid>
                </Grid>

                {/* PREVIEW */}
                {v.seatLayout && v.seatLayout.length > 0 && (
                  <Box
                    mt={4}
                    bgcolor={alpha(theme.palette.grey[100], 0.5)}
                    p={3}
                    borderRadius={4}
                  >
                    <Typography
                      variant="subtitle2"
                      align="center"
                      gutterBottom
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 2 }}
                    >
                      Live Preview
                    </Typography>
                    <VehicleChassis>
                      <DriverCabin>
                        <Box textAlign="center">
                          <SteeringIcon
                            sx={{ fontSize: 40, color: "grey.700" }}
                          />
                          <Typography variant="caption" display="block">
                            DRIVER
                          </Typography>
                        </Box>
                      </DriverCabin>
                      <Stack spacing={1}>
                        {Array.from({ length: v.seatConfig?.rows || 0 }).map(
                          (_, rowIdx) => {
                            const leftCount = parseInt(v.seatConfig?.left || 0);
                            const totalPerRow =
                              leftCount + parseInt(v.seatConfig?.right || 0);
                            const rowSeats = v.seatLayout.slice(
                              rowIdx * totalPerRow,
                              (rowIdx + 1) * totalPerRow
                            );
                            const leftSideSeats = rowSeats.slice(0, leftCount);
                            const rightSideSeats = rowSeats.slice(leftCount);
                            if (rowSeats.length === 0) return null;

                            return (
                              <Box
                                key={rowIdx}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Box display="flex" gap={0.5}>
                                  {leftSideSeats.map((seatCode) => (
                                    <Box key={seatCode} position="relative">
                                      <SeatIconStyled
                                        color={
                                          v.bookedSeats?.includes(seatCode)
                                            ? "error"
                                            : "primary"
                                        }
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          position: "absolute",
                                          top: 8,
                                          left: 0,
                                          right: 0,
                                          textAlign: "center",
                                          color: "white",
                                          fontSize: 9,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {seatCode.replace(/[0-9]/g, "")}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                                {v.seatConfig?.aisle && <Box width={30} />}
                                <Box display="flex" gap={0.5}>
                                  {rightSideSeats.map((seatCode) => (
                                    <Box key={seatCode} position="relative">
                                      <SeatIconStyled
                                        color={
                                          v.bookedSeats?.includes(seatCode)
                                            ? "error"
                                            : "primary"
                                        }
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          position: "absolute",
                                          top: 8,
                                          left: 0,
                                          right: 0,
                                          textAlign: "center",
                                          color: "white",
                                          fontSize: 9,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {seatCode.replace(/[0-9]/g, "")}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            );
                          }
                        )}
                      </Stack>
                    </VehicleChassis>
                    {v.bookedSeats?.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        {v.bookedSeats.length} seats are currently booked.
                      </Alert>
                    )}
                  </Box>
                )}
              </SectionBox>
            ))}
            <Button
              variant="outlined"
              onClick={addVehicle}
              startIcon={<AddIcon />}
            >
              Add Another Vehicle
            </Button>
          </Stack>
        );

      // --- STEP 4: POLICIES ---
      case 4:
        return (
          <Stack spacing={3}>
            <SectionBox>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Terms & Conditions
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={addPolicy}
                  variant="contained"
                >
                  Add Policy
                </Button>
              </Box>
              {policies.map((policy, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor={alpha(theme.palette.primary.main, 0.05)}
                    p={2}
                    borderBottom={`1px solid ${theme.palette.divider}`}
                  >
                    <TextField
                      variant="standard"
                      placeholder="Policy Title"
                      value={policy.key}
                      onChange={(e) =>
                        handlePolicyChange(index, "key", e.target.value)
                      }
                      InputProps={{
                        disableUnderline: true,
                        style: { fontWeight: 600 },
                      }}
                      fullWidth
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removePolicy(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box p={2}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Details..."
                      value={policy.value}
                      onChange={(e) =>
                        handlePolicyChange(index, "value", e.target.value)
                      }
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                    />
                  </Box>
                </Card>
              ))}
            </SectionBox>
          </Stack>
        );

      // --- STEP 5: GALLERY ---
      case 5:
        return (
          <SectionBox>
            <Grid container spacing={2}>
              {(tourData.images || []).map((img, idx) => (
                <Grid item xs={6} md={3} key={idx}>
                  <Box
                    position="relative"
                    borderRadius={4}
                    overflow="hidden"
                    height={160}
                    sx={{ "&:hover button": { opacity: 1 } }}
                  >
                    <img
                      src={img}
                      alt="Tour"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      onClick={() => handleImageDelete(idx)}
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        opacity: 0,
                        transition: "0.2s",
                        "&:hover": { bgcolor: "error.main" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={6} md={3}>
                <ImageUploadBox component="label">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  <Upload color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Upload Images
                  </Typography>
                </ImageUploadBox>
              </Grid>
            </Grid>
          </SectionBox>
        );
      default:
        return null;
    }
  };

  return (
    <MainContainer>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 5 } }}>
        <Stack direction="row" justifyContent="space-between" mb={4}>
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight={800}
              color="text.primary"
            >
              Update Tour
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tourData.travelAgencyName}
            </Typography>
          </Box>
          {/* Status Actions for Admin */}
          {(role === "Admin" || role === "Developer") && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange(true)}
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatusChange(false)}
              >
                Reject
              </Button>
            </Stack>
          )}
        </Stack>

        <GlassCard sx={{ mb: 4, p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2, gap: 2 }}
          >
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ borderRadius: 8 }}
            >
              Previous Step
            </Button>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Stack>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            connector={<CustomConnector />}
          >
            {steps.map((label, index) => {
              if (isMobile && index !== activeStep) return null;
              return (
                <Step key={label} completed={activeStep > index}>
                  <StepLabel
                    StepIconComponent={(props) => (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor:
                            props.active || props.completed
                              ? "primary.main"
                              : "grey.300",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {props.completed ? (
                          <CheckCircle fontSize="small" />
                        ) : (
                          index + 1
                        )}
                      </Box>
                    )}
                  >
                    {isMobile
                      ? `${label} (${index + 1}/${steps.length})`
                      : label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {isMobile && (
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / steps.length) * 100}
              sx={{ mt: 2, borderRadius: 2 }}
            />
          )}
        </GlassCard>

        <Box minHeight={400}>{renderStepContent()}</Box>

        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            zIndex: 1000,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ borderRadius: 8, px: 3 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={
                  activeStep === steps.length - 1 ? handleSave : handleNext
                }
                endIcon={
                  activeStep === steps.length - 1 ? <Save /> : <ArrowForward />
                }
                sx={{ borderRadius: 8, px: 4, boxShadow: theme.shadows[4] }}
              >
                {activeStep === steps.length - 1 ? "Save Changes" : "Next Step"}
              </Button>
            </Stack>
          </Container>
        </Paper>
      </Container>
    </MainContainer>
  );
}
