import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Slide,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import { City, Country, State } from "country-state-city";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Select from "react-select";
import { useTourTheme } from "../../../utils/additional/tourTheme";
import { useLoader } from "../../../utils/loader";
import { addTour } from "../redux/reducers/tour/tour";

// --- Styled Components ---

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.08)",
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "12px !important",
  marginBottom: theme.spacing(2),
  "&:before": { display: "none" },
  "&.Mui-expanded": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 12,
  padding: theme.spacing(3),
  textAlign: "center",
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
  position: "relative",
}));

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

const TourForm = () => {
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    state: "",
    travelAgencyName: "",
    agencyId: "",
    agencyEmail: "",
    agencyPhone: "",
    themes: "",
    visitngPlaces: "",
    overview: "",
    price: "",
    nights: "",
    days: "",
    from: "",
    to: "",
    tourStartDate: "",
    customizable: false,
    amenities: [],
    inclusion: [""],
    exclusion: [""],
    termsAndConditions: { cancellation: "", refund: "", bookingPolicy: "" },
    dayWise: [{ day: "", description: "" }],
    starRating: "",
    images: [],
    vehicles: [
      {
        name: "",
        vehicleNumber: "",
        totalSeats: "",
        seaterType: "2*2",
        pricePerSeat: 0,
        isActive: true,
      },
    ],
  });

  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const tourTheme = useTourTheme();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) setStates(State.getStatesOfCountry(formData.country));
    else setStates([]);
    if (formData.country && formData.state) {
      setCities(City.getCitiesOfState(formData.country, formData.state));
    } else setCities([]);
  }, [formData.country, formData.state]);

  const pattern = /^[0-9]+N [a-zA-Z\s]+(\|[0-9]+N [a-zA-Z\s]+)*$/;
  const isVisitingValid = useMemo(() => {
    if (!formData.visitngPlaces) return true;
    const normalized = normalizeVisitingPlaces(formData.visitngPlaces);
    return !!normalized;
  }, [formData.visitngPlaces]);

  // Normalize visiting places into canonical form: "1N City | 2N City"
  function normalizeVisitingPlaces(input) {
    if (!input) return "";
    // split on | , / ; or multiple spaces
    const parts = input
      .split(/[|\/,;]+|\s{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const normalized = [];
    for (const part of parts) {
      // Accept formats like '1N City', '1 N City', '1 City' or '1NCity'
      const m = part.match(/^(\d+)\s*[Nn]?\s*(.+)$/);
      if (!m) return null;
      const days = m[1];
      const city = m[2].replace(/\s+/g, " ").trim();
      if (!city) return null;
      normalized.push(`${days}N ${city}`);
    }
    return normalized.join(" | ");
  }

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (["cancellation", "refund", "bookingPolicy"].includes(name)) {
      setFormData((p) => ({
        ...p,
        termsAndConditions: { ...p.termsAndConditions, [name]: value },
      }));
      return;
    }
    if (name === "inclusion") {
      const list = [...formData.inclusion];
      list[index] = value;
      setFormData((p) => ({ ...p, inclusion: list }));
      return;
    }
    if (name === "exclusion") {
      const list = [...formData.exclusion];
      list[index] = value;
      setFormData((p) => ({ ...p, exclusion: list }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    // ... (Keep existing form data appending logic identically)
    formDataToSend.append("city", formData.city);
    formDataToSend.append("themes", formData.themes);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("overview", formData.overview);
    formDataToSend.append("travelAgencyName", formData.travelAgencyName);
    formDataToSend.append("agencyId", formData.agencyId);
    formDataToSend.append("agencyEmail", formData.agencyEmail);
    formDataToSend.append("agencyPhone", formData.agencyPhone);
    formDataToSend.append("visitngPlaces", formData.visitngPlaces);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("nights", formData.nights);
    formDataToSend.append("days", formData.days);
    formDataToSend.append("from", formData.from);
    formDataToSend.append("to", formData.to);
    formDataToSend.append("tourStartDate", formData.tourStartDate);
    formDataToSend.append("customizable", !!formData.customizable);
    formDataToSend.append("starRating", formData.starRating);

    formData.inclusion.forEach((inc) => {
      formDataToSend.append("inclusion[]", inc);
    });
    formData.exclusion.forEach((exc) => {
      formDataToSend.append("exclusion[]", exc);
    });
    formData.amenities.forEach((amenity) => {
      formDataToSend.append("amenities[]", amenity);
    });

    formData.dayWise.forEach((day, index) => {
      formDataToSend.append(`dayWise[${index}][day]`, day.day);
      formDataToSend.append(`dayWise[${index}][description]`, day.description);
    });

    formData.vehicles.forEach((vehicle, index) => {
      formDataToSend.append(`vehicles[${index}][name]`, vehicle.name);
      formDataToSend.append(
        `vehicles[${index}][vehicleNumber]`,
        vehicle.vehicleNumber
      );
      formDataToSend.append(
        `vehicles[${index}][totalSeats]`,
        vehicle.totalSeats
      );
      formDataToSend.append(
        `vehicles[${index}][seaterType]`,
        vehicle.seaterType
      );
      formDataToSend.append(
        `vehicles[${index}][pricePerSeat]`,
        vehicle.pricePerSeat
      );
      formDataToSend.append(`vehicles[${index}][isActive]`, !!vehicle.isActive);
    });

    Object.entries(formData.termsAndConditions || {}).forEach(([key, val]) => {
      formDataToSend.append(`termsAndConditions[${key}]`, val);
    });

    formData.images.forEach((image) => {
      if (image instanceof File) {
        formDataToSend.append("images", image);
      }
    });

    try {
      showLoader();
      await dispatch(addTour(formDataToSend));
    } catch (err) {
      console.error("Failed to submit tour", err);
    } finally {
      hideLoader();
    }
  };

  const addInclusion = () =>
    setFormData((p) => ({ ...p, inclusion: [...p.inclusion, ""] }));
  const addExclusion = () =>
    setFormData((p) => ({ ...p, exclusion: [...p.exclusion, ""] }));

  const addDay = () =>
    setFormData((p) => ({
      ...p,
      dayWise: [...p.dayWise, { day: "", description: "" }],
    }));
  const removeDay = (idx) =>
    setFormData((p) => ({
      ...p,
      dayWise: p.dayWise.filter((_, i) => i !== idx),
    }));

  const addVehicle = () =>
    setFormData((p) => ({
      ...p,
      vehicles: [
        ...p.vehicles,
        {
          name: "",
          vehicleNumber: "",
          totalSeats: "",
          seaterType: "2*2",
          pricePerSeat: 0,
          isActive: true,
        },
      ],
    }));
  const removeVehicle = (idx) =>
    setFormData((p) => ({
      ...p,
      vehicles: p.vehicles.filter((_, i) => i !== idx),
    }));

  const addImage = () =>
    setFormData((p) => ({ ...p, images: [...p.images, null] }));
  const removeImage = (idx) =>
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== idx),
    }));
  const handleImageChange = (idx, file) => {
    const updated = [...formData.images];
    updated[idx] = file;
    setFormData((p) => ({ ...p, images: updated }));
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 10 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            New Tour Package
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a comprehensive travel itinerary.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column: Main Details */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Agency Details */}
                <StyledCard>
                  <CardHeader
                    title={
                      <SectionHeader
                        icon={<InfoOutlinedIcon />}
                        title="Agency Information"
                        subtitle="Identity & Contact details"
                      />
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Agency Name"
                          name="travelAgencyName"
                          value={formData.travelAgencyName}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Agency ID"
                          name="agencyId"
                          value={formData.agencyId}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Agency Email"
                          name="agencyEmail"
                          type="email"
                          value={formData.agencyEmail}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="agencyPhone"
                          value={formData.agencyPhone}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>

                {/* Package Basics */}
                <StyledCard>
                  <CardHeader
                    title={
                      <SectionHeader
                        icon={<FlightTakeoffIcon />}
                        title="Package Details"
                        subtitle="Location, Pricing & Theme"
                      />
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          name="themes"
                          value={formData.themes}
                          onChange={handleChange}
                          SelectProps={{ native: true }}
                          required
                        >
                          <option value="" disabled>
                            Select theme
                          </option>
                          {Array.isArray(tourTheme) &&
                            tourTheme.map((t) => (
                              <option key={t._id || t.name} value={t.name}>
                                {t.name}
                              </option>
                            ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CurrencyRupeeIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {/* Location Selectors */}
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: "background.default",
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            display="flex"
                            gap={1}
                            mb={1}
                            alignItems="center"
                            color="text.secondary"
                          >
                            <LocationOnOutlinedIcon fontSize="small" />{" "}
                            <Typography variant="caption" fontWeight="bold">
                              DESTINATION
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Select
                                placeholder="Country"
                                options={countries.map((c) => ({
                                  label: c.name,
                                  value: c.isoCode,
                                }))}
                                value={
                                  formData.country
                                    ? {
                                        label: formData.country,
                                        value: formData.country,
                                      }
                                    : null
                                }
                                onChange={(opt) =>
                                  setFormData((p) => ({
                                    ...p,
                                    country: opt?.value || "",
                                    state: "",
                                    city: "",
                                  }))
                                }
                                menuPortalTarget={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : null
                                }
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 1400,
                                  }),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Select
                                placeholder="State"
                                options={states.map((s) => ({
                                  label: s.name,
                                  value: s.isoCode,
                                }))}
                                value={
                                  formData.state
                                    ? {
                                        label: formData.state,
                                        value: formData.state,
                                      }
                                    : null
                                }
                                onChange={(opt) =>
                                  setFormData((p) => ({
                                    ...p,
                                    state: opt?.value || "",
                                    city: "",
                                  }))
                                }
                                menuPortalTarget={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : null
                                }
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 1400,
                                  }),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Select
                                placeholder="City"
                                options={cities.map((c) => ({
                                  label: c.name,
                                  value: c.name,
                                }))}
                                value={
                                  formData.city
                                    ? {
                                        label: formData.city,
                                        value: formData.city,
                                      }
                                    : null
                                }
                                onChange={(opt) =>
                                  setFormData((p) => ({
                                    ...p,
                                    city: opt?.value || "",
                                  }))
                                }
                                menuPortalTarget={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : null
                                }
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 1400,
                                  }),
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Visiting Places (Format: 2N Manali | 1N Shimla)"
                          name="visitngPlaces"
                          value={formData.visitngPlaces}
                          onChange={handleChange}
                          onBlur={() => {
                            const normalized = normalizeVisitingPlaces(
                              formData.visitngPlaces
                            );
                            if (normalized) {
                              setFormData((p) => ({
                                ...p,
                                visitngPlaces: normalized,
                              }));
                            }
                          }}
                          error={!isVisitingValid}
                          helperText={
                            !isVisitingValid
                              ? "Invalid Format — expected like: 2N Manali | 1N Shimla"
                              : ""
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Tour Overview"
                          name="overview"
                          value={formData.overview}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>

                {/* Itinerary */}
                <StyledCard>
                  <CardHeader
                    title={
                      <SectionHeader
                        icon={<DescriptionIcon />}
                        title="Itinerary & Schedule"
                        subtitle="Day-wise plan"
                      />
                    }
                    action={
                      <Button
                        startIcon={<AddIcon />}
                        size="small"
                        variant="outlined"
                        onClick={addDay}
                      >
                        Add Day
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Box
                      mb={3}
                      p={2}
                      bgcolor="primary.50"
                      borderRadius={2}
                      border="1px dashed"
                      borderColor="primary.main"
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.customizable}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                customizable: e.target.checked,
                                ...(e.target.checked
                                  ? { tourStartDate: "" }
                                  : { from: "", to: "" }),
                              }))
                            }
                          />
                        }
                        label={
                          <Typography fontWeight="bold">
                            Customizable Dates
                          </Typography>
                        }
                      />
                      <Grid container spacing={2} mt={1}>
                        {formData.customizable ? (
                          <>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Valid From"
                                name="from"
                                value={formData.from}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Valid To"
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
                              size="small"
                              type="date"
                              label="Fixed Start Date"
                              name="tourStartDate"
                              value={formData.tourStartDate}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Stack spacing={2}>
                      {formData.dayWise.map((d, idx) => (
                        <DynamicItemBox key={idx}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            mb={1}
                          >
                            <Typography
                              variant="subtitle2"
                              color="primary"
                              fontWeight="bold"
                            >
                              Day {idx + 1}
                            </Typography>
                            <Tooltip title="Remove Day">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => removeDay(idx)}
                                  disabled={formData.dayWise.length <= 1}
                                >
                                  <DeleteOutlineIcon
                                    fontSize="small"
                                    color="error"
                                  />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                value={d.day}
                                SelectProps={{ native: true }}
                                onChange={(e) => {
                                  const updated = [...formData.dayWise];
                                  updated[idx].day = e.target.value;
                                  setFormData((p) => ({
                                    ...p,
                                    dayWise: updated,
                                  }));
                                }}
                              >
                                <option value="">Select</option>
                                {[...Array(30).keys()].map((i) => (
                                  <option key={i} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </TextField>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                              <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={4}
                                label="Activities / Description"
                                value={d.description}
                                onChange={(e) => {
                                  const updated = [...formData.dayWise];
                                  updated[idx].description = e.target.value;
                                  setFormData((p) => ({
                                    ...p,
                                    dayWise: updated,
                                  }));
                                }}
                              />
                            </Grid>
                          </Grid>
                        </DynamicItemBox>
                      ))}
                    </Stack>
                  </CardContent>
                </StyledCard>
              </Stack>
            </Grid>

            {/* Right Column: Meta, Vehicles, Images */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Duration & Rating */}
                <StyledCard>
                  <CardHeader
                    title={
                      <Typography variant="h6" fontWeight="bold">
                        Overview Stats
                      </Typography>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Days"
                            name="days"
                            value={formData.days}
                            onChange={handleChange}
                            SelectProps={{ native: true }}
                          >
                            <option value="">-</option>
                            {[...Array(30).keys()].map((i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Nights"
                            name="nights"
                            value={formData.nights}
                            onChange={handleChange}
                            SelectProps={{ native: true }}
                          >
                            <option value="">-</option>
                            {[...Array(30).keys()].map((i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        name="starRating"
                        value={formData.starRating}
                        onChange={handleChange}
                        SelectProps={{ native: true }}
                      >
                        <option value="">Select Rating</option>
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} Stars
                          </option>
                        ))}
                      </TextField>
                    </Stack>
                  </CardContent>
                </StyledCard>

                {/* Images */}
                <StyledCard>
                  <CardHeader
                    title={
                      <SectionHeader
                        icon={<ImageOutlinedIcon />}
                        title="Gallery"
                      />
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      {formData.images.map((img, idx) => (
                        <DynamicItemBox
                          key={idx}
                          sx={{
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Button
                            component="label"
                            fullWidth
                            variant="outlined"
                            startIcon={<AddPhotoAlternateIcon />}
                            sx={{
                              borderStyle: "dashed",
                              textTransform: "none",
                              justifyContent: "flex-start",
                            }}
                          >
                            {img ? img.name : `Upload Image ${idx + 1}`}
                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageChange(idx, e.target.files?.[0])
                              }
                            />
                          </Button>
                          <IconButton
                            color="error"
                            onClick={() => removeImage(idx)}
                            disabled={formData.images.length <= 1}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </DynamicItemBox>
                      ))}
                      <Button
                        variant="text"
                        startIcon={<AddIcon />}
                        onClick={addImage}
                      >
                        Add Slot
                      </Button>
                    </Stack>
                  </CardContent>
                </StyledCard>

                {/* Vehicles */}
                <StyledAccordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionHeader
                      icon={<DirectionsBusIcon />}
                      title="Vehicles"
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {formData.vehicles.map((v, idx) => (
                        <DynamicItemBox key={idx}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              VEHICLE {idx + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeVehicle(idx)}
                              disabled={formData.vehicles.length <= 1}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Stack spacing={2}>
                            <Autocomplete
                              freeSolo
                              options={[
                                "Innova",
                                "Tempo Traveller",
                                "Sedan",
                                "Bus",
                              ]}
                              value={v.name}
                              onChange={(_, val) => {
                                const updated = [...formData.vehicles];
                                updated[idx].name = val || "";
                                setFormData((p) => ({
                                  ...p,
                                  vehicles: updated,
                                }));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Name"
                                  fullWidth
                                />
                              )}
                            />
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Seats"
                                  type="number"
                                  value={v.totalSeats}
                                  onChange={(e) => {
                                    const updated = [...formData.vehicles];
                                    updated[idx].totalSeats = e.target.value;
                                    setFormData((p) => ({
                                      ...p,
                                      vehicles: updated,
                                    }));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Price/Seat"
                                  type="number"
                                  value={v.pricePerSeat}
                                  onChange={(e) => {
                                    const updated = [...formData.vehicles];
                                    updated[idx].pricePerSeat = e.target.value;
                                    setFormData((p) => ({
                                      ...p,
                                      vehicles: updated,
                                    }));
                                  }}
                                />
                              </Grid>
                            </Grid>
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={v.isActive}
                                  onChange={(e) => {
                                    const updated = [...formData.vehicles];
                                    updated[idx].isActive = e.target.checked;
                                    setFormData((p) => ({
                                      ...p,
                                      vehicles: updated,
                                    }));
                                  }}
                                />
                              }
                              label="Active"
                            />
                          </Stack>
                        </DynamicItemBox>
                      ))}
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={addVehicle}
                      >
                        Add Vehicle
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </StyledAccordion>

                {/* Policies Accordion */}
                <StyledAccordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionHeader
                      icon={<PolicyOutlinedIcon />}
                      title="Policies"
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Cancellation Policy"
                        name="cancellation"
                        value={formData.termsAndConditions.cancellation}
                        onChange={handleChange}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Refund Policy"
                        name="refund"
                        value={formData.termsAndConditions.refund}
                        onChange={handleChange}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Booking Policy"
                        name="bookingPolicy"
                        value={formData.termsAndConditions.bookingPolicy}
                        onChange={handleChange}
                      />
                    </Stack>
                  </AccordionDetails>
                </StyledAccordion>
              </Stack>
            </Grid>
          </Grid>

          {/* Sticky Footer for Actions */}
          <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <Paper
              elevation={3}
              sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                borderRadius: "16px 16px 0 0",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Container maxWidth="lg">
                <Box
                  py={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display={{ xs: "none", md: "block" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Review all details before publishing.
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ width: { xs: "100%", md: "auto" } }}
                  >
                    <Button
                      fullWidth={isMobile}
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={!isVisitingValid}
                      sx={{ px: 4, borderRadius: 2 }}
                    >
                      Publish Tour Package
                    </Button>
                  </Stack>
                </Box>
              </Container>
            </Paper>
          </Slide>

          {/* Spacer for sticky footer */}
          <Box height={80} />
        </form>
      </Container>
    </Box>
  );
};

export default TourForm;
