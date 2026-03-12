import {
  Add as AddIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Close as CloseIcon,
  Delete,
  DirectionsBus,
  AirlineSeatReclineNormal as SeatIcon, // Real seat icon
  Circle as SteeringIcon,
  Upload,
} from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
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
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

// Mock hooks (Replace with your actual imports)
import { useHotelAmenities } from "../../../utils/additional/hotelAmenities";
import { useTourTheme } from "../../../utils/additional/tourTheme";
import { useLoader } from "../../../utils/loader";
import { appendTourFormData, buildTourPayload } from "../../../utils/tour-payload";
import { userId } from "../../../utils/util";
import { addTour } from "../redux/reducers/tour/tour";

/* =========================================================
   1. VEHICLE DATA PRESETS (Auto-fill Logic)
========================================================= */
const VEHICLE_PRESETS = {
  "Sedan (4 Seater)": {
    seaterType: "2+2",
    totalSeats: 4,
    pricePerSeat: 1500,
    seatConfig: { rows: 2, left: 2, right: 0, aisle: false }, // Simplified
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
   STYLED COMPONENTS
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
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
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

/* --- NEW STYLES FOR REALISTIC PREVIEW --- */
const VehicleChassis = styled(Box)(({ theme }) => ({
  border: `4px solid ${theme.palette.grey[400]}`,
  borderRadius: "40px 40px 12px 12px", // Rounded front (top), squarer back
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
  justifyContent: "flex-end", // Driver on right
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
   HELPER LOGIC
========================================================= */
const generateSeatLayout = (seatConfig, totalSeats) => {
  const { rows, left, right, aisle } = seatConfig;
  if (!rows || !left || (!right && right !== 0) || !totalSeats) return [];
  const rowsNum = parseInt(rows);
  const leftNum = parseInt(left);
  const rightNum = parseInt(right);
  const total = parseInt(totalSeats);
  const seatCodes = [];
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let seatCount = 0;

  for (let row = 1; row <= rowsNum; row++) {
    // Left side
    for (let col = 0; col < leftNum; col++) {
      if (seatCount >= total) break;
      seatCodes.push(`${row}${columns[col]}`);
      seatCount++;
    }
    // Right side (Calculate offset based on Aisle)
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
   MAIN COMPONENT
========================================================= */
export default function TourForm() {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const tourTheme = useTourTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeStep, setActiveStep] = useState(0);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
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

  const [formData, setFormData] = useState({
    travelAgencyName: "",
    agencyId: userId || "",
    agencyPhone: "",
    agencyEmail: "",
    country: "",
    state: "",
    city: "",
    themes: "",
    visitngPlaces: "",
    price: "",
    days: "",
    nights: "",
    from: "",
    to: "",
    isCustomizable: false,
    tourStartDate: "",
    isAccepted: false,
    starRating: "",
    amenities: [],
    inclusion: "",
    exclusion: "",
    dayWise: [{ day: 1, description: "" }],
    vehicles: [
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
    ],
    images: [],
  });

  const [policies, setPolicies] = useState([
    { key: "Booking Policy", value: "" },
    { key: "Cancellation Policy", value: "" },
  ]);

  // Effects & Handlers
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) {
      const c = countries.find(
        (x) => x.isoCode === formData.country || x.name === formData.country
      );
      setStates(c ? State.getStatesOfCountry(c.isoCode) : []);
    } else setStates([]);
  }, [formData.country, countries]);

  useEffect(() => {
    if (formData.state) {
      const c = countries.find(
        (x) => x.isoCode === formData.country || x.name === formData.country
      );
      const s = states.find(
        (x) => x.isoCode === formData.state || x.name === formData.state
      );
      setCities(c && s ? City.getCitiesOfState(c.isoCode, s.isoCode) : []);
    } else setCities([]);
  }, [formData.state, countries, states]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVisitingPlacesBlur = () => {
    let val = formData.visitngPlaces;
    if (!val) return;
    let corrected = val
      .replace(/[\/\\]+/g, "|")
      .replace(/\s*\|\s*/g, " | ")
      .replace(/\b(\d+)\s*n\b/gi, "$1N");
    if (corrected !== val) {
      setFormData((p) => ({ ...p, visitngPlaces: corrected }));
    }
  };

  const handlePolicyChange = (index, field, val) => {
    const updated = [...policies];
    updated[index][field] = val;
    setPolicies(updated);
  };
  const addPolicy = () => {
    setPolicies([...policies, { key: "", value: "" }]);
  };
  const removePolicy = (index) => {
    setPolicies(policies.filter((_, i) => i !== index));
  };

  // Vehicle Logic
  const addVehicle = () =>
    setFormData((p) => ({
      ...p,
      vehicles: [
        ...p.vehicles,
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
      ],
    }));

  const removeVehicle = (idx) =>
    formData.vehicles.length > 1 &&
    setFormData((p) => ({
      ...p,
      vehicles: p.vehicles.filter((_, i) => i !== idx),
    }));

  const updateVehicle = (idx, field, value) => {
    const v = [...formData.vehicles];
    v[idx][field] = value;
    if (field === "totalSeats")
      v[idx].seatLayout = generateSeatLayout(v[idx].seatConfig, value);
    setFormData((p) => ({ ...p, vehicles: v }));
  };

  const updateSeatConfig = (idx, field, value) => {
    const v = [...formData.vehicles];
    v[idx].seatConfig[field] = value;
    if (v[idx].totalSeats && v[idx].seatConfig.rows)
      v[idx].seatLayout = generateSeatLayout(
        v[idx].seatConfig,
        v[idx].totalSeats
      );
    setFormData((p) => ({ ...p, vehicles: v }));
  };

  const handleNext = () =>
    activeStep < steps.length - 1 && setActiveStep((p) => p + 1);
  const handleBack = () => activeStep > 0 && setActiveStep((p) => p - 1);

  const handleSubmit = async () => {
    if (!formData.travelAgencyName)
      return toast.error("Agency Name is required");

    const payload = buildTourPayload(formData, {
      policies,
      agencyIdFallback: userId || "",
      defaultAccepted: false,
    });
    const fd = appendTourFormData(new FormData(), payload);

    formData.images.forEach((file) => {
      if (file) fd.append("images", file);
    });

    try {
      showLoader();
      await dispatch(addTour(fd)).unwrap();
      toast.success("Tour Created Successfully!");
      setActiveStep(0);
    } catch (err) {
      toast.error(err?.message || "Failed to create tour");
    } finally {
      hideLoader();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      // BASICS
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
                    name="travelAgencyName"
                    value={formData.travelAgencyName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="agencyPhone"
                    value={formData.agencyPhone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="agencyEmail"
                    value={formData.agencyEmail}
                    onChange={handleChange}
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
                    renderInput={(params) => (
                      <TextField {...params} label="Theme" />
                    )}
                    onChange={(_, val) =>
                      setFormData({ ...formData, themes: val?.name || "" })
                    }
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
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
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleChange}
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
                    name="days"
                    value={formData.days}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="Nights"
                    type="number"
                    name="nights"
                    value={formData.nights}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={amenitiesList}
                    freeSolo
                    value={formData.amenities}
                    onChange={(_, newValue) =>
                      setFormData((p) => ({ ...p, amenities: newValue }))
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
                    value={formData.inclusion}
                    name="inclusion"
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Exclusions"
                    placeholder="One item per line"
                    value={formData.exclusion}
                    name="exclusion"
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </SectionBox>
          </Stack>
        );

      // LOCATION
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
                    countries.find((c) => c.isoCode === formData.country) ||
                    null
                  }
                  onChange={(_, val) =>
                    setFormData((p) => ({
                      ...p,
                      country: val?.isoCode || "",
                      state: "",
                      city: "",
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Country" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={states}
                  getOptionLabel={(option) => option.name}
                  disabled={!formData.country}
                  value={
                    states.find((s) => s.isoCode === formData.state) || null
                  }
                  onChange={(_, val) =>
                    setFormData((p) => ({
                      ...p,
                      state: val?.isoCode || "",
                      city: "",
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="State" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={cities}
                  getOptionLabel={(option) => option.name}
                  disabled={!formData.state}
                  value={cities.find((c) => c.name === formData.city) || null}
                  onChange={(_, val) =>
                    setFormData((p) => ({ ...p, city: val?.name || "" }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="City" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Visiting Places"
                  name="visitngPlaces"
                  value={formData.visitngPlaces}
                  onChange={handleChange}
                  onBlur={handleVisitingPlacesBlur}
                  placeholder="e.g. 2N Delhi | 1N Agra"
                />
              </Grid>
            </Grid>
          </SectionBox>
        );

      // ITINERARY
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
                      checked={formData.isCustomizable}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          isCustomizable: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Customizable Dates"
                />
              </Box>

              <Grid container spacing={2}>
                {formData.isCustomizable ? (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="From"
                        name="from"
                        value={formData.from}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="To"
                        name="to"
                        value={formData.to}
                        onChange={handleChange}
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
                      name="tourStartDate"
                      value={formData.tourStartDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </SectionBox>

            {formData.dayWise.map((day, idx) => (
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
                        const d = [...formData.dayWise];
                        d[idx].description = e.target.value;
                        setFormData({ ...formData, dayWise: d });
                      }}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (formData.dayWise.length > 1) {
                        const d = formData.dayWise
                          .filter((_, i) => i !== idx)
                          .map((item, i) => ({ ...item, day: i + 1 }));
                        setFormData({ ...formData, dayWise: d });
                      }
                    }}
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
                setFormData((p) => ({
                  ...p,
                  dayWise: [
                    ...p.dayWise,
                    { day: p.dayWise.length + 1, description: "" },
                  ],
                }))
              }
            >
              Add Day {formData.dayWise.length + 1}
            </Button>
          </Stack>
        );

      // ---------------- STEP 3: VEHICLES (Updated) ---------------- //
      case 3:
        return (
          <Stack spacing={4}>
            {formData.vehicles.map((v, idx) => (
              <SectionBox key={idx}>
                {/* Header Row */}
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
                    disabled={formData.vehicles.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <Grid container spacing={3}>
                  {/* 1. Vehicle Selection with Auto-Prefill */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      freeSolo
                      options={Object.keys(VEHICLE_PRESETS)}
                      value={v.name}
                      onChange={(_, newVal) => {
                        // 1. Update Name
                        updateVehicle(idx, "name", newVal || "");

                        // 2. Auto-Prefill Logic
                        if (newVal && VEHICLE_PRESETS[newVal]) {
                          const preset = VEHICLE_PRESETS[newVal];
                          // Update simple fields
                          updateVehicle(idx, "seaterType", preset.seaterType);
                          updateVehicle(idx, "totalSeats", preset.totalSeats);
                          updateVehicle(
                            idx,
                            "pricePerSeat",
                            preset.pricePerSeat
                          );

                          // Update Config & Regenerate Layout
                          const updatedVehicles = [...formData.vehicles];
                          updatedVehicles[idx].seatConfig = {
                            ...preset.seatConfig,
                          };
                          updatedVehicles[idx].name = newVal;
                          updatedVehicles[idx].seaterType = preset.seaterType;
                          updatedVehicles[idx].totalSeats = preset.totalSeats;
                          updatedVehicles[idx].pricePerSeat =
                            preset.pricePerSeat;

                          // Trigger layout generation manually since updateVehicle won't see deep object updates immediately
                          updatedVehicles[idx].seatLayout = generateSeatLayout(
                            preset.seatConfig,
                            preset.totalSeats
                          );

                          setFormData((p) => ({
                            ...p,
                            vehicles: updatedVehicles,
                          }));
                          toast.success(`${newVal} configuration loaded!`);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Vehicle Type"
                          placeholder="e.g. Innova, Volvo Bus"
                          helperText="Select from list to auto-fill details"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Seater Type"
                      value={v.seaterType}
                      placeholder="2x2"
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                      onChange={(e) =>
                        updateVehicle(idx, "pricePerSeat", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider>Seat Configuration</Divider>
                  </Grid>

                  {/* 2. Configuration Inputs */}
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
                      value={v.seatConfig.rows}
                      onChange={(e) =>
                        updateSeatConfig(idx, "rows", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      size="small"
                      label="Left Side"
                      type="number"
                      value={v.seatConfig.left}
                      onChange={(e) =>
                        updateSeatConfig(idx, "left", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      size="small"
                      label="Right Side"
                      type="number"
                      value={v.seatConfig.right}
                      onChange={(e) =>
                        updateSeatConfig(idx, "right", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4} display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={v.seatConfig.aisle}
                          onChange={(e) =>
                            updateSeatConfig(idx, "aisle", e.target.checked)
                          }
                        />
                      }
                      label="Has Walking Aisle?"
                    />
                  </Grid>
                </Grid>

                {/* 3. REALISTIC PREVIEW SECTION */}
                {v.seatLayout.length > 0 && (
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
                      Live Vehicle Preview
                    </Typography>

                    <VehicleChassis>
                      {/* A. Driver Cabin */}
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

                      {/* B. Passenger Area - Vertical Layout */}
                      <Stack spacing={1}>
                        {Array.from({ length: v.seatConfig.rows }).map(
                          (_, rowIdx) => {
                            const leftCount = parseInt(v.seatConfig.left);
                            const rightCount = parseInt(v.seatConfig.right);
                            const totalPerRow = leftCount + rightCount;

                            // Calculate where to slice the flat array
                            // Note: Logic depends on how generateSeatLayout fills the array.
                            // If generateSeatLayout fills Row 1 Left, then Row 1 Right... this works.
                            const rowSeats = v.seatLayout.slice(
                              rowIdx * totalPerRow,
                              (rowIdx + 1) * totalPerRow
                            );

                            const leftSideSeats = rowSeats.slice(0, leftCount);
                            const rightSideSeats = rowSeats.slice(
                              leftCount,
                              totalPerRow
                            );

                            if (rowSeats.length === 0) return null;

                            return (
                              <Box
                                key={rowIdx}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                {/* Left Side */}
                                <Box display="flex" gap={0.5}>
                                  {leftSideSeats.map((seatCode) => (
                                    <Box
                                      key={seatCode}
                                      position="relative"
                                      title={`Seat ${seatCode}`}
                                    >
                                      <SeatIconStyled />
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

                                {/* Aisle (Spacer) */}
                                {v.seatConfig.aisle && (
                                  <Box width={30} textAlign="center">
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                    >
                                      |
                                    </Typography>
                                  </Box>
                                )}

                                {/* Right Side */}
                                <Box display="flex" gap={0.5}>
                                  {rightSideSeats.map((seatCode) => (
                                    <Box
                                      key={seatCode}
                                      position="relative"
                                      title={`Seat ${seatCode}`}
                                    >
                                      <SeatIconStyled />
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

      // POLICIES
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

              {policies.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  No policies added. Click "Add Policy" to define terms.
                </Typography>
              )}

              {policies.map((policy, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: "visible",
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
                      placeholder="Policy Title (e.g., Cancellation)"
                      value={policy.key}
                      onChange={(e) =>
                        handlePolicyChange(index, "key", e.target.value)
                      }
                      InputProps={{
                        disableUnderline: true,
                        style: { fontWeight: 600, fontSize: "1rem" },
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
                      placeholder="Enter policy details here..."
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

      // GALLERY
      case 5:
        return (
          <SectionBox>
            <Grid container spacing={2}>
              {formData.images.map((img, idx) => (
                <Grid item xs={6} md={3} key={idx}>
                  <Box
                    position="relative"
                    borderRadius={4}
                    overflow="hidden"
                    height={160}
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt="prev"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { bgcolor: "error.main" },
                      }}
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          images: p.images.filter((_, i) => i !== idx),
                        }))
                      }
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
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      setFormData((p) => ({
                        ...p,
                        images: [...p.images, e.target.files[0]],
                      }))
                    }
                  />
                  <Upload color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Upload Image
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
        <Box textAlign="center" mb={4}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight={800}
            color="text.primary"
          >
            Create New Tour
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drafting a new experience
          </Typography>
        </Box>

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
                  activeStep === steps.length - 1 ? handleSubmit : handleNext
                }
                endIcon={
                  activeStep === steps.length - 1 ? (
                    <CheckCircle />
                  ) : (
                    <ArrowForward />
                  )
                }
                sx={{ borderRadius: 8, px: 4, boxShadow: theme.shadows[4] }}
              >
                {activeStep === steps.length - 1 ? "Publish Tour" : "Next Step"}
              </Button>
            </Stack>
          </Container>
        </Paper>
      </Container>
    </MainContainer>
  );
}
