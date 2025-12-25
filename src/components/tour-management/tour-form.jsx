import AddIcon from "@mui/icons-material/Add";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventIcon from "@mui/icons-material/Event";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { City, Country, State } from "country-state-city";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Select from "react-select";
import { useTourTheme } from "../../../utils/additional/tourTheme";
import { useLoader } from "../../../utils/loader";
import { addTour } from "../redux/reducers/tour/tour";

const cardSx = { borderRadius: 3, overflow: "hidden" };

const Section = ({ title, subtitle, defaultExpanded, children }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{ "&:before": { display: "none" } }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={800} noWrap>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        )}
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
  </Accordion>
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
  const isVisitingValid = useMemo(
    () => !formData.visitngPlaces || pattern.test(formData.visitngPlaces),
    [formData.visitngPlaces]
  );

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

  const autoFormatPlaces = () => {
    if (!formData.visitngPlaces) return;

    const formatted = formData.visitngPlaces
      .split(/[|\\/,]+/) 
      .map((seg) => {
        const trimmed = seg.trim();
        const match = trimmed.match(/^(\d+)\s*[nN]?\s*(.*)/);
        
        if (match) {
          const nights = match[1];
          let place = match[2].trim();
          
          place = place
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          if (place) return `${nights}N ${place}`;
        }
        return trimmed;
      })
      .filter(Boolean)
      .join("|");

    setFormData((p) => ({ ...p, visitngPlaces: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <Paper variant="outlined" sx={cardSx}>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Create Tour Package
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill required details; sections are collapsible on mobile.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" label="Mobile-ready" variant="outlined" />
              <Chip size="small" label="Compact UI" variant="outlined" />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ p: { xs: 1.5, sm: 2 } }}
        >
          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Agency details"
              subtitle="Identity + contact info"
              defaultExpanded={!isMobile}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Agency name"
                    name="travelAgencyName"
                    value={formData.travelAgencyName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
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
                    size="small"
                    type="email"
                    label="Agency email"
                    name="agencyEmail"
                    value={formData.agencyEmail}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Agency phone"
                    name="agencyPhone"
                    value={formData.agencyPhone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>
            </Section>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Package basics"
              subtitle="Theme, location, duration, price"
              defaultExpanded={!isMobile}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Theme"
                    name="themes"
                    value={formData.themes}
                    onChange={handleChange}
                    SelectProps={{ native: true }}
                    required
                  >
                    <option value="" disabled>
                      {Array.isArray(tourTheme) && tourTheme.length
                        ? "Select theme"
                        : "No themes"}
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
                    size="small"
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

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Days"
                    name="days"
                    value={formData.days}
                    onChange={handleChange}
                    SelectProps={{ native: true }}
                    required
                  >
                    <option value="">Select</option>
                    {[...Array(30).keys()].map((i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Nights"
                    name="nights"
                    value={formData.nights}
                    onChange={handleChange}
                    SelectProps={{ native: true }}
                    required
                  >
                    <option value="">Select</option>
                    {[...Array(30).keys()].map((i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Star rating"
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleChange}
                    SelectProps={{ native: true }}
                    required
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Places to visit (e.g., 1N Bihar|2N Patna|1N Delhi)"
                    name="visitngPlaces"
                    value={formData.visitngPlaces}
                    onChange={handleChange}
                    onBlur={autoFormatPlaces}
                    required
                    error={!isVisitingValid}
                    helperText={
                      !isVisitingValid
                        ? "Format invalid. Use: 1N City|2N City..."
                        : " "
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Overview"
                    name="overview"
                    value={formData.overview}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    Country
                  </Typography>
                  <Select
                    options={countries.map((c) => ({
                      label: c.name,
                      value: c.isoCode,
                    }))}
                    value={
                      formData.country
                        ? { label: formData.country, value: formData.country }
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
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    State
                  </Typography>
                  <Select
                    options={states.map((s) => ({
                      label: s.name,
                      value: s.isoCode,
                    }))}
                    value={
                      formData.state
                        ? { label: formData.state, value: formData.state }
                        : null
                    }
                    onChange={(opt) =>
                      setFormData((p) => ({
                        ...p,
                        state: opt?.value || "",
                        city: "",
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    City
                  </Typography>
                  <Select
                    options={cities.map((c) => ({
                      label: c.name,
                      value: c.name,
                    }))}
                    value={
                      formData.city
                        ? { label: formData.city, value: formData.city }
                        : null
                    }
                    onChange={(opt) =>
                      setFormData((p) => ({ ...p, city: opt?.value || "" }))
                    }
                  />
                </Grid>
              </Grid>
            </Section>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Schedule"
              subtitle="Customizable or fixed start date"
              defaultExpanded={!isMobile}
            >
              <Stack spacing={1.25}>
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
                  label="Customizable package"
                />

                <Grid container spacing={1.5}>
                  {formData.customizable ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="From"
                          name="from"
                          value={formData.from}
                          onChange={handleChange}
                          required
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="To"
                          name="to"
                          value={formData.to}
                          onChange={handleChange}
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Tour start date"
                        name="tourStartDate"
                        value={formData.tourStartDate}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </Section>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Inclusion / Exclusion"
              subtitle="Add multiple points"
              defaultExpanded={!isMobile}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography fontWeight={800}>Inclusions</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addInclusion}
                      >
                        Add
                      </Button>
                    </Stack>
                    {formData.inclusion.map((val, idx) => (
                      <TextField
                        key={idx}
                        fullWidth
                        size="small"
                        name="inclusion"
                        label={`Inclusion ${idx + 1}`}
                        value={val}
                        onChange={(e) => handleChange(e, idx)}
                        required
                      />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography fontWeight={800}>Exclusions</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addExclusion}
                      >
                        Add
                      </Button>
                    </Stack>
                    {formData.exclusion.map((val, idx) => (
                      <TextField
                        key={idx}
                        fullWidth
                        size="small"
                        name="exclusion"
                        label={`Exclusion ${idx + 1}`}
                        value={val}
                        onChange={(e) => handleChange(e, idx)}
                        required
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Section>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Day-wise itinerary"
              subtitle="Add/remove days"
              defaultExpanded={!isMobile}
            >
              <Stack spacing={1.5}>
                {formData.dayWise.map((d, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ borderRadius: 3, p: 1.5 }}
                  >
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Day"
                          value={d.day}
                          onChange={(e) => {
                            const updated = [...formData.dayWise];
                            updated[idx].day = e.target.value;
                            setFormData((p) => ({ ...p, dayWise: updated }));
                          }}
                          SelectProps={{ native: true }}
                          required
                        >
                          <option value="">Select</option>
                          {[...Array(30).keys()].map((i) => (
                            <option key={i + 1} value={i + 1}>
                              Day {i + 1}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Description"
                          multiline
                          minRows={2}
                          value={d.description}
                          onChange={(e) => {
                            const updated = [...formData.dayWise];
                            updated[idx].description = e.target.value;
                            setFormData((p) => ({ ...p, dayWise: updated }));
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <Tooltip title="Remove day">
                          <span>
                            <IconButton
                              disabled={formData.dayWise.length <= 1}
                              onClick={() => removeDay(idx)}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDay}
                >
                  Add Day
                </Button>
              </Stack>
            </Section>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Vehicles"
              subtitle="Mobile-friendly list (no table)"
              defaultExpanded={!isMobile}
            >
              <Stack spacing={1.5}>
                {formData.vehicles.map((v, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ borderRadius: 3, p: 1.5 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DirectionsBusIcon fontSize="small" />
                        <Typography fontWeight={800}>
                          Vehicle {idx + 1}
                        </Typography>
                      </Stack>
                      <IconButton
                        disabled={formData.vehicles.length <= 1}
                        onClick={() => removeVehicle(idx)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Vehicle type"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...formData.vehicles];
                            updated[idx].name = e.target.value;
                            setFormData((p) => ({ ...p, vehicles: updated }));
                          }}
                          SelectProps={{ native: true }}
                          required
                        >
                          <option value="">Select</option>
                          <option value="Deluxe Bus">Deluxe Bus</option>
                          <option value="AC Deluxe Bus">AC Deluxe Bus</option>
                          <option value="Luxury Coach">Luxury Coach</option>
                          <option value="Tempo Traveller">
                            Tempo Traveller
                          </option>
                          <option value="Innova Crysta">Innova Crysta</option>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Vehicle number"
                          value={v.vehicleNumber}
                          onChange={(e) => {
                            const updated = [...formData.vehicles];
                            updated[idx].vehicleNumber = e.target.value;
                            setFormData((p) => ({ ...p, vehicles: updated }));
                          }}
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Seats"
                          value={v.totalSeats}
                          onChange={(e) => {
                            const updated = [...formData.vehicles];
                            updated[idx].totalSeats = e.target.value;
                            setFormData((p) => ({ ...p, vehicles: updated }));
                          }}
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Seater"
                          value={v.seaterType}
                          onChange={(e) => {
                            const updated = [...formData.vehicles];
                            updated[idx].seaterType = e.target.value;
                            setFormData((p) => ({ ...p, vehicles: updated }));
                          }}
                          SelectProps={{ native: true }}
                          required
                        >
                          <option value="2*2">2x2</option>
                          <option value="2*3">2x3</option>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Price per seat"
                          value={v.pricePerSeat}
                          onChange={(e) => {
                            const updated = [...formData.vehicles];
                            updated[idx].pricePerSeat = e.target.value;
                            setFormData((p) => ({ ...p, vehicles: updated }));
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!v.isActive}
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
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addVehicle}
                >
                  Add Vehicle
                </Button>
              </Stack>
            </Section>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 3, mb: 1.5 }}>
            <Section
              title="Images"
              subtitle="Upload multiple images"
              defaultExpanded={!isMobile}
            >
              <Stack spacing={1.5}>
                {formData.images.map((img, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ borderRadius: 3, p: 1.5 }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        fullWidth={isMobile}
                      >
                        {img ? "Change image" : `Upload image ${idx + 1}`}
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(idx, e.target.files?.[0] || null)
                          }
                        />
                      </Button>

                      <Button
                        color="error"
                        variant="text"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => removeImage(idx)}
                        disabled={formData.images.length <= 1}
                        fullWidth={isMobile}
                      >
                        Remove
                      </Button>
                    </Stack>
                    {img && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.75, display: "block" }}
                      >
                        Selected: {img?.name}
                      </Typography>
                    )}
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addImage}
                >
                  Add Image
                </Button>
              </Stack>
            </Section>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, mb: isMobile ? 10 : 1.5 }}
          >
            <Section
              title="Terms & policies"
              subtitle="Cancellation, refund, booking"
              defaultExpanded={!isMobile}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Cancellation policy"
                    name="cancellation"
                    value={formData.termsAndConditions.cancellation}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Refund policy"
                    name="refund"
                    value={formData.termsAndConditions.refund}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Booking policy"
                    name="bookingPolicy"
                    value={formData.termsAndConditions.bookingPolicy}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>
            </Section>
          </Paper>

          {!isMobile && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" size="large">
                Submit Tour
              </Button>
            </Stack>
          )}
        </Box>

        {isMobile && (
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              p: 1.25,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={!isVisitingValid}
            >
              Submit Tour
            </Button>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default TourForm;