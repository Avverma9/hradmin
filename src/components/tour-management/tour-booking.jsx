import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeatMap } from "../redux/reducers/tour/tour"; 
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Event as EventIcon,
  DirectionsBus as BusIcon,
  AirlineSeatReclineNormal as SeatIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForwardIos,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  InputAdornment,
  alpha
} from "@mui/material";

// --- Helper Functions ---
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const addDays = (dateString, days) => {
  if (!dateString) return "";
  const result = new Date(dateString);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
};

// Format ISO/Date strings into yyyy-MM-dd for input[type=date]
const formatDateForInput = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const TourBookingForm = ({ tour, gstData, userId, onBookingSubmit }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  // Redux State
  const { loading: seatLoading, seatMapByKey } = useSelector((state) => state.tour);

  // Derived State
  const finalPrice = useMemo(() => {
    if (!tour) return 0;
    const gstPercent = gstData?.gstPrice || 0;
    return tour.price + (tour.price * gstPercent) / 100;
  }, [tour, gstData]);

  const fixedStartDate = !tour?.customizable ? formatDateForInput(tour?.tourStartDate || tour?.from || "") : "";

  // Form State
  const [startDate, setStartDate] = useState(fixedStartDate);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childDOBs, setChildDOBs] = useState([]);
  const [error, setError] = useState("");

  // Initialize Vehicle
  useEffect(() => {
    if (tour?.vehicles?.length > 0) {
      const activeVehicle = tour.vehicles.find((v) => v.isActive !== false);
      if (activeVehicle) setSelectedVehicleId(activeVehicle._id);
    }
    // Ensure startDate is in yyyy-MM-dd format when tour loads
    if (tour) {
      const fd = !tour?.customizable ? formatDateForInput(tour?.tourStartDate || tour?.from || "") : "";
      setStartDate(fd);
    }
  }, [tour]);

  // Fetch Seat Map
  useEffect(() => {
    if (tour?._id && selectedVehicleId) {
      const key = `${tour._id}:${selectedVehicleId}`;
      if (!seatMapByKey[key]) {
        dispatch(fetchSeatMap({ tourId: tour._id, vehicleId: selectedVehicleId }));
      }
    }
    setSelectedSeats([]);
  }, [tour?._id, selectedVehicleId, dispatch, seatMapByKey]);

  const seatKey = `${tour?._id}:${selectedVehicleId}`;
  const seatMap = seatMapByKey[seatKey] || [];
  const totalPassengers = adults + children;

  // Handlers
  const handleSeatToggle = (seatCode) => {
    setError("");
    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) return prev.filter((s) => s !== seatCode);
      if (prev.length >= totalPassengers) return prev;
      return [...prev, seatCode];
    });
  };

  const handleChildCountChange = (delta) => {
    const newVal = Math.max(0, Math.min(3, children + delta));
    setChildren(newVal);
    setChildDOBs((prev) => {
      const newDobs = [...prev];
      if (newVal > prev.length) return [...newDobs, ""];
      return newDobs.slice(0, newVal);
    });
  };

  const handleChildDobChange = (index, val) => {
    const newDobs = [...childDOBs];
    newDobs[index] = val;
    setChildDOBs(newDobs);
  };

  const calculateTotal = () => {
    let total = adults * finalPrice;
    childDOBs.forEach((dob) => {
      if (dob) {
        const age = calculateAge(dob);
        total += age === null || age >= 8 ? finalPrice : finalPrice / 2;
      } else {
        total += finalPrice;
      }
    });
    return total;
  };

  const handleSubmit = () => {
    setError("");
    if (!startDate) return setError("Select travel date.");
    if (childDOBs.some((d) => !d)) return setError("Enter DOB for children.");
    if (selectedSeats.length !== totalPassengers) return setError(`Select ${totalPassengers} seats.`);
    if (!userId) return setError("Please login.");

    const endDate = addDays(startDate, (tour.days || 1) - 1);
    const totalAmount = calculateTotal();

    const passengers = [
      ...Array(adults).fill({ type: "adult" }),
      ...childDOBs.map((dob) => ({ type: "child", dateOfBirth: dob })),
    ];

    onBookingSubmit({
      userId,
      tourId: tour._id,
      vehicleId: selectedVehicleId,
      seats: selectedSeats,
      status: "pending",
      numberOfAdults: adults,
      numberOfChildren: children,
      passengers,
      from: startDate,
      to: endDate,
      tourStartDate: tour.tourStartDate || startDate,
      customizable: tour.customizable,
      travelAgencyName: tour.travelAgencyName,
      basePrice: tour.price,
      totalAmount,
      country: tour.country,
      state: tour.state,
      city: tour.city,
    });
  };

  // Disabled reason for the primary action (better UX than silent disable)
  const disabledReason = useMemo(() => {
    if (!startDate) return "Select travel date.";
    if (children > 0 && childDOBs.some((d) => !d)) return "Enter DOB for all children.";
    if (selectedSeats.length !== totalPassengers) return `Select ${totalPassengers} seats.`;
    if (!userId) return "Please login to proceed.";
    return "";
  }, [startDate, children, childDOBs, selectedSeats, totalPassengers, userId]);

  if (!tour) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        
        {/* Compact Header */}
        <Box sx={{ bgcolor: "grey.50", px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight="800" lineHeight={1.2}>Confirm Booking</Typography>
              <Typography variant="caption" color="text.secondary">{tour.travelAgencyName} • {tour.days}D/{tour.nights}N</Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" display="block" color="text.secondary">Per Adult</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main" lineHeight={1}>{formatCurrency(finalPrice)}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={2}> {/* Tighter spacing between sections */}

            {/* Section 1: Details */}
            <Box>
              <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <EventIcon sx={{ fontSize: 16 }} /> TRIP DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small"
                    label="Travel Date" type="date"
                    value={startDate} disabled={!tour.customizable}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText={!tour.customizable ? "Fixed Date" : ""}
                    FormHelperTextProps={{ sx: { m: 0 } }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select fullWidth size="small"
                    label="Vehicle" value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><BusIcon fontSize="small" /></InputAdornment>,
                    }}
                  >
                    {(tour.vehicles || []).filter((v) => v.isActive !== false).map((v) => (
                      <MenuItem key={v._id} value={v._id} dense>
                        {v.name} ({v.seaterType})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Section 2: Passengers */}
            <Box>
              <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <PersonIcon sx={{ fontSize: 16 }} /> PASSENGERS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <CompactCounter label="Adults" sub="12+ yrs" value={adults} onAdd={() => setAdults(Math.min(10, adults + 1))} onRemove={() => setAdults(Math.max(1, adults - 1))} min={1} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactCounter label="Children" sub="0-12 yrs" value={children} onAdd={() => handleChildCountChange(1)} onRemove={() => handleChildCountChange(-1)} min={0} max={3} />
                </Grid>
              </Grid>

              {children > 0 && (
                <Box mt={2} p={1.5} bgcolor="info.50" borderRadius={2} border="1px dashed" borderColor="info.main">
                  <Grid container spacing={1}>
                    {childDOBs.map((dob, idx) => (
                      <Grid item xs={12} sm={4} key={idx}>
                        <TextField
                          fullWidth size="small" type="date"
                          label={`Child ${idx + 1}`}
                          value={dob} onChange={(e) => handleChildDobChange(idx, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ sx: { bgcolor: 'white' } }}
                          inputProps={{ max: new Date().toISOString().split("T")[0] }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Section 3: Seat Map */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight="bold" display="flex" alignItems="center" gap={0.5} color="text.secondary">
                  <SeatIcon sx={{ fontSize: 16 }} /> SEATS
                </Typography>
                <Typography variant="caption" fontWeight="bold" color={selectedSeats.length === totalPassengers ? 'success.main' : 'warning.main'}>
                  {selectedSeats.length}/{totalPassengers} Selected
                </Typography>
              </Box>

              {seatLoading ? (
                <Box display="flex" justifyContent="center" p={2}><CircularProgress size={20} /></Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', maxWidth: '320px', mx: 'auto' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, alignItems: 'center' }}>
                    {['A', 'B', '', 'C', 'D'].map((h, i) => (
                      <Typography key={i} variant="caption" fontWeight="bold" align="center" color="text.disabled">{h}</Typography>
                    ))}
                    {seatMap.length > 0 ? (
                       Array.from({ length: Math.ceil(seatMap.length / 4) }).map((_, rowIndex) => {
                        const rowSeats = seatMap.slice(rowIndex * 4, (rowIndex + 1) * 4);
                        return (
                          <React.Fragment key={rowIndex}>
                             {renderSeatButton(rowSeats[0], selectedSeats, handleSeatToggle, totalPassengers)}
                             {renderSeatButton(rowSeats[1], selectedSeats, handleSeatToggle, totalPassengers)}
                             <Typography variant="caption" align="center" color="text.disabled" sx={{ fontSize: 10 }}>{rowIndex + 1}</Typography>
                             {renderSeatButton(rowSeats[2], selectedSeats, handleSeatToggle, totalPassengers)}
                             {renderSeatButton(rowSeats[3], selectedSeats, handleSeatToggle, totalPassengers)}
                          </React.Fragment>
                        );
                      })
                    ) : <Typography align="center" variant="caption" color="error" sx={{ gridColumn: 'span 5' }}>No Data</Typography>}
                  </Box>
                </Paper>
              )}
            </Box>

            {error && <Alert severity="error" sx={{ py: 0, alignItems: 'center' }}>{error}</Alert>}

            {/* Section 4: Pay */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">Total Payable</Typography>
                <Typography variant="h5" fontWeight="800" color="primary.main">{formatCurrency(calculateTotal())}</Typography>
              </Box>
              <div>
                <Button
                  fullWidth
                  variant="contained"
                  size="medium"
                  disableElevation
                  onClick={handleSubmit}
                  disabled={Boolean(disabledReason)}
                  sx={{ fontWeight: 'bold', textTransform: 'none' }}
                >
                  Proceed to Pay
                </Button>
                {disabledReason && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    {disabledReason}
                  </Typography>
                )}
              </div>
            </Paper>

          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

// --- Compact Sub-components ---

const CompactCounter = ({ label, sub, value, onAdd, onRemove, min, max }) => (
  <Paper variant="outlined" sx={{ p: 1, px: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Box>
      <Typography variant="body2" fontWeight="bold" lineHeight={1}>{label}</Typography>
      <Typography variant="caption" color="text.secondary" lineHeight={1}>{sub}</Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={0.5}>
      <IconButton size="small" onClick={onRemove} disabled={value <= (min || 0)} sx={{ p: 0.5, bgcolor: 'grey.100' }}><RemoveIcon sx={{ fontSize: 14 }} /></IconButton>
      <Typography fontWeight="bold" sx={{ width: 16, textAlign: 'center', fontSize: '0.9rem' }}>{value}</Typography>
      <IconButton size="small" onClick={onAdd} disabled={max !== undefined && value >= max} sx={{ p: 0.5, bgcolor: 'grey.100' }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
    </Box>
  </Paper>
);

const renderSeatButton = (seat, selectedSeats, handleToggle, limit) => {
  if (!seat) return <Box />;
  const isBooked = seat.status === "booked";
  const isSelected = selectedSeats.includes(seat.code);
  const isDisabled = isBooked || (!isSelected && selectedSeats.length >= limit);

  return (
    <Button
      variant={isSelected ? "contained" : "outlined"}
      color={isSelected ? "primary" : "inherit"}
      disabled={isDisabled}
      onClick={() => handleToggle(seat.code)}
      sx={{
        minWidth: 0, height: 28, width: '100%', p: 0,
        borderRadius: 1, fontSize: '0.65rem', fontWeight: 'bold',
        borderColor: isBooked ? "transparent" : "divider",
        bgcolor: isBooked ? "action.disabledBackground" : (isSelected ? "primary.main" : "white"),
        color: isBooked ? "text.disabled" : (isSelected ? "white" : "text.secondary"),
        '&:hover': { bgcolor: isSelected ? "primary.dark" : "grey.100" },
        '&.Mui-disabled': { bgcolor: isBooked ? "action.disabledBackground" : "white", border: '1px solid', borderColor: 'divider' }
      }}
    >
      {isSelected ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : seat.code}
    </Button>
  );
};

export default TourBookingForm;