import {
  ArrowForward,
  CalendarMonth,
  ChildCare,
  DirectionsBus,
  EventSeat,
  Info,
  LocationOn,
  Person,
  Phone,
  Star,
  WbSunny,
  Circle as SteeringIcon,
  Cake,
  Male,
  Female,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeatMap } from "../redux/reducers/tour/tour";

/* ================= STYLED COMPONENTS ================= */

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  backgroundColor: theme.palette.grey[50],
  minHeight: "100vh",
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(
    theme.palette.primary.main,
    0.02
  )} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(4),
}));

const VehicleSelectCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  border: `2px solid ${
    selected ? theme.palette.primary.main : theme.palette.divider
  }`,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.04)
    : theme.palette.background.paper,
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  "&:hover": {
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
}));

// --- Realistic Bus Layout Styles ---
const BusChassis = styled(Box)(({ theme }) => ({
  border: `3px solid ${theme.palette.grey[300]}`,
  borderRadius: "30px 30px 10px 10px", 
  padding: theme.spacing(3),
  backgroundColor: "white",
  position: "relative",
  maxWidth: 380, 
  margin: "0 auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
}));

const DriverCabin = styled(Box)(({ theme }) => ({
  borderBottom: `2px dashed ${theme.palette.grey[200]}`,
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  justifyContent: "flex-end", 
  color: theme.palette.grey[400],
}));

const SeatRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(5), // Aisle Gap
  marginBottom: theme.spacing(1.5),
}));

const SeatGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
}));

const SeatButton = styled(Button)(({ theme, status }) => ({
  minWidth: 0,
  width: 44, // Slightly wider for "10A" text
  height: 44,
  padding: 0,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid",
  transition: "all 0.2s",
  
  ...(status === "available" && {
    borderColor: theme.palette.grey[300],
    color: theme.palette.text.secondary,
    backgroundColor: "white",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    },
  }),

  ...(status === "selected" && {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
    "&:hover": { backgroundColor: theme.palette.primary.dark },
  }),

  ...(status === "booked" && {
    borderColor: theme.palette.grey[200],
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.disabled,
    cursor: "not-allowed",
  }),
}));

const StickySummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  position: "sticky",
  top: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
  border: `1px solid ${theme.palette.divider}`,
}));

const PassengerCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

/* ================= HELPERS ================= */
const addDays = (dateString, days) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};
const formatDateForInput = (date) => (date ? date.split("T")[0] : "");
const formatDateDisplay = (dateString) => {
  if (!dateString) return "Not Selected";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const validateMobileNumber = (mobile) => /^[6-9]\d{9}$/.test(mobile);

/* ================= MAIN COMPONENT ================= */

const TourBookingForm = ({ tour, userId, onBookingSubmit }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { loading: seatLoading, seatMapByKey } = useSelector((state) => state.tour);

  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Select Seats", "Passenger Details", "Review & Pay"];

  // --- Dates ---
  const isCustomizable = !!tour?.isCustomizable;
  const fixedStartDate = !isCustomizable ? formatDateForInput(tour?.tourStartDate || tour?.from) : "";
  const fixedEndDate = !isCustomizable && fixedStartDate ? addDays(fixedStartDate, (tour?.days || 1) - 1) : "";

  const [startDate, setStartDate] = useState(fixedStartDate);
  const [endDate, setEndDate] = useState(fixedEndDate);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [primaryMobile, setPrimaryMobile] = useState("");
  const [passengers, setPassengers] = useState({});
  const [error, setError] = useState("");

  // --- Select Vehicle & Dates Init ---
  useEffect(() => {
    if (tour?.vehicles?.length && !selectedVehicleId) {
      const v = tour.vehicles.find((v) => v.isActive !== false);
      if (v) setSelectedVehicleId(v._id);
    }
  }, [tour, selectedVehicleId]);

  useEffect(() => {
    if (!isCustomizable && tour) {
        const start = formatDateForInput(tour.tourStartDate || tour.from);
        setStartDate(start);
        setEndDate(addDays(start, (tour.days || 1) - 1));
    }
  }, [tour, isCustomizable]);

  const selectedVehicle = useMemo(() => tour?.vehicles?.find((v) => v._id === selectedVehicleId), [tour, selectedVehicleId]);

  // --- Pricing ---
  const seatPrice = selectedVehicle?.pricePerSeat || tour?.price || 0;
  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      const p = passengers[seat];
      return sum + (p?.type === "child" ? seatPrice / 2 : seatPrice);
    }, 0);
  }, [selectedSeats, passengers, seatPrice]);
  const advanceAmount = totalAmount * 0.2;
  const balanceAmount = totalAmount * 0.8;

  // --- Fetch Seats ---
  useEffect(() => {
    if (tour?._id && selectedVehicleId) {
      const key = `${tour._id}:${selectedVehicleId}`;
      if (!seatMapByKey[key]) {
        dispatch(fetchSeatMap({ tourId: tour._id, vehicleId: selectedVehicleId }));
      }
    }
  }, [tour?._id, selectedVehicleId, dispatch, seatMapByKey]);

  useEffect(() => {
    setSelectedSeats([]); setPassengers({}); setError("");
  }, [selectedVehicleId]);

  const seatKey = `${tour?._id}:${selectedVehicleId}`;
  
  // Use seatLayout from vehicle object directly as per your JSON structure
  const vehicleLayout = selectedVehicle?.seatLayout || []; 
  // bookedSeats comes from API (seatMapByKey) or empty if not yet fetched
  const bookedSeatsList = seatMapByKey[seatKey]?.bookedSeats || selectedVehicle?.bookedSeats || [];
  
  // Handlers
  const handleSeatToggle = (seatCode) => {
    setError("");
    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) {
        const p = { ...passengers }; delete p[seatCode]; setPassengers(p);
        return prev.filter((s) => s !== seatCode);
      }
      setPassengers((p) => ({ ...p, [seatCode]: { type: "adult", fullName: "", gender: "male", age: "", seatNumber: seatCode } }));
      return [...prev, seatCode];
    });
  };

  const handlePassengerChange = (seat, field, value) => {
    setPassengers((p) => ({ ...p, [seat]: { ...p[seat], [field]: value } }));
  };

  // Validation
  const validateStep = (step) => {
    setError("");
    if (step === 0) {
      if (!selectedSeats.length) return setError("Please select at least one seat.") || false;
      if (!startDate || !endDate) return setError("Please select valid travel dates.") || false;
    }
    if (step === 1) {
      if (!validateMobileNumber(primaryMobile)) return setError("Enter a valid 10-digit mobile number.") || false;
      for (const seat of selectedSeats) {
        const p = passengers[seat];
        if (!p?.fullName?.trim() || !p?.age) return setError(`Fill details for Seat ${seat}`) || false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep(activeStep)) setActiveStep((p) => p + 1); };
  const handleBack = () => { setError(""); setActiveStep((p) => p - 1); };

  const handleSubmit = () => {
    if (!userId) return setError("Please login to proceed.");
    const finalPassengers = selectedSeats.map((seat) => ({
      ...passengers[seat], fullName: passengers[seat].fullName.trim(), age: parseInt(passengers[seat].age),
    }));
    
    const bookingPayload = {
      userId, tourId: tour._id, vehicleId: selectedVehicleId, seats: selectedSeats, status: "pending",
      numberOfAdults: finalPassengers.filter((p) => p.type === "adult").length,
      numberOfChildren: finalPassengers.filter((p) => p.type === "child").length,
      passengers: finalPassengers, primaryMobile,
      from: startDate, to: endDate, tourStartDate: tour.tourStartDate || startDate, isCustomizable,
      basePrice: tour.price || 0, seatPrice: seatPrice, totalAmount,bookingSource:"Panel",
      travelAgencyName: tour.travelAgencyName, agencyPhone: tour.agencyPhone, agencyEmail: tour.agencyEmail,
      country: tour.country, state: tour.state, city: tour.city,
    };
    onBookingSubmit(bookingPayload);
  };

  if (!tour) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

  // --- RENDER SEAT LAYOUT LOGIC (FIXED) ---
  const renderBusLayout = () => {
    if (!selectedVehicle) return null;
    
    // Config from JSON: "rows": 11, "left": 2, "right": 2
    const { rows, left, right } = selectedVehicle.seatConfig || { rows: 10, left: 2, right: 2 };
    
    const numRows = parseInt(rows);
    const numLeft = parseInt(left);
    const numRight = parseInt(right);
    const seatsPerRow = numLeft + numRight;

    return (
        <BusChassis>
            {/* Driver */}
            <DriverCabin>
                <Stack alignItems="center">
                    <SteeringIcon sx={{ fontSize: 32, transform: 'rotate(-45deg)' }} />
                    <Typography variant="caption" sx={{ fontSize: 9 }}>DRIVER</Typography>
                </Stack>
            </DriverCabin>

            {Array.from({ length: numRows }).map((_, rowIndex) => {
                // Slicing logic for flat array based on row index
                const startIndex = rowIndex * seatsPerRow;
                
                // Extract seat codes for this specific row from layout array
                const rowSeats = vehicleLayout.slice(startIndex, startIndex + seatsPerRow);
                
                // Split row into Left side and Right side
                const leftSideSeats = rowSeats.slice(0, numLeft);
                const rightSideSeats = rowSeats.slice(numLeft, seatsPerRow);

                if(rowSeats.length === 0) return null;

                return (
                    <SeatRow key={rowIndex}>
                        {/* Left Side */}
                        <SeatGroup>
                            {leftSideSeats.map(seatCode => {
                                const isBooked = bookedSeatsList.includes(seatCode);
                                const isSelected = selectedSeats.includes(seatCode);
                                return (
                                    <Box key={seatCode} position="relative">
                                        <SeatButton
                                            status={isBooked ? 'booked' : isSelected ? 'selected' : 'available'}
                                            onClick={() => !isBooked && handleSeatToggle(seatCode)}
                                            disabled={isBooked}
                                        >
                                            {/* IMPORTANT: Removed regex replace. Display raw seat code */}
                                            <span style={{fontSize:10, fontWeight:700}}>{seatCode}</span>
                                        </SeatButton>
                                    </Box>
                                )
                            })}
                        </SeatGroup>

                        {/* Right Side */}
                        <SeatGroup>
                            {rightSideSeats.map(seatCode => {
                                const isBooked = bookedSeatsList.includes(seatCode);
                                const isSelected = selectedSeats.includes(seatCode);
                                return (
                                    <Box key={seatCode} position="relative">
                                        <SeatButton
                                            status={isBooked ? 'booked' : isSelected ? 'selected' : 'available'}
                                            onClick={() => !isBooked && handleSeatToggle(seatCode)}
                                            disabled={isBooked}
                                        >
                                            {/* IMPORTANT: Removed regex replace. Display raw seat code */}
                                            <span style={{fontSize:10, fontWeight:700}}>{seatCode}</span>
                                        </SeatButton>
                                    </Box>
                                )
                            })}
                        </SeatGroup>
                    </SeatRow>
                )
            })}
        </BusChassis>
    );
  };

  return (
    <StyledContainer maxWidth="lg">
      
      {/* 1. Immersive Header */}
      <HeaderCard elevation={0}>
        <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            <Typography variant="overline" letterSpacing={2} color="text.secondary" fontWeight={700}>BOOKING</Typography>
            <Typography variant={isMobile ? "h5" : "h3"} fontWeight={800} gutterBottom sx={{ mt: 1 }}>{tour.travelAgencyName}</Typography>
            <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap" gap={1}>
                <Chip icon={<LocationOn sx={{ fontSize: 16 }} />} label={`${tour.city}, ${tour.state}`} sx={{ bgcolor: 'white' }} />
                <Chip icon={<Star sx={{ fontSize: 16, color: '#faaf00 !important' }} />} label={`${tour.starRating} Star`} sx={{ bgcolor: 'white' }} />
                <Chip icon={<WbSunny sx={{ fontSize: 16 }} />} label={`${tour.days}D / ${tour.nights}N`} sx={{ bgcolor: 'white' }} />
            </Stack>
        </CardContent>
      </HeaderCard>

      {/* 2. Stepper */}
      <Box mb={5} maxWidth="md" mx="auto">
        <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
          {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: Main Form */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            
            {/* STEP 0: SELECTION */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>Select Vehicle</Typography>
                <Grid container spacing={2} mb={4}>
                    {tour.vehicles?.filter(v => v.isActive !== false).map((v) => (
                      <Grid item xs={12} sm={6} key={v._id}>
                        <VehicleSelectCard
                          selected={selectedVehicleId === v._id}
                          onClick={() => setSelectedVehicleId(v._id)}
                          elevation={selectedVehicleId === v._id ? 4 : 0}
                        >
                            <Avatar sx={{ bgcolor: selectedVehicleId === v._id ? 'primary.main' : 'grey.200', color: selectedVehicleId === v._id ? 'white' : 'grey.600' }}>
                                <DirectionsBus />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>{v.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {v.seaterType} • <strong>{formatCurrency(v.pricePerSeat)}</strong>
                                </Typography>
                            </Box>
                        </VehicleSelectCard>
                      </Grid>
                    ))}
                </Grid>

                <Typography variant="h6" fontWeight={700} gutterBottom>Travel Dates</Typography>
                <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }} elevation={0} variant="outlined">
                    {isCustomizable ? (
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth type="date" label="Start" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth type="date" label="End" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Grid>
                        </Grid>
                    ) : (
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <CalendarMonth color="action"/>
                            <Typography variant="body1" fontWeight={600}>{formatDateDisplay(startDate)} <ArrowForward sx={{fontSize:14, mx:1}}/> {formatDateDisplay(endDate)}</Typography>
                        </Stack>
                    )}
                </Paper>

                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Select Seats</Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip label="Available" size="small" variant="outlined" />
                        <Chip label="Selected" size="small" color="primary" />
                        <Chip label="Booked" size="small" disabled />
                    </Stack>
                </Stack>
                
                <Box bgcolor="grey.100" p={4} borderRadius={4}>
                    {seatLoading ? <CircularProgress /> : renderBusLayout()}
                </Box>
              </Box>
            )}

            {/* STEP 1: DETAILS */}
            {activeStep === 1 && (
                <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Contact Info</Typography>
                    <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }} elevation={0} variant="outlined">
                        <TextField fullWidth label="Mobile Number" placeholder="10-digit" value={primaryMobile} onChange={(e) => setPrimaryMobile(e.target.value.replace(/\D/g,''))} InputProps={{ startAdornment: <InputAdornment position="start"><Phone/></InputAdornment> }} inputProps={{ maxLength: 10 }} />
                    </Paper>

                    <Typography variant="h6" fontWeight={700} gutterBottom>Passengers</Typography>
                    {selectedSeats.map((seat, idx) => (
                        <PassengerCard key={seat} elevation={0}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                <Chip label={`Seat ${seat}`} color="primary" icon={<EventSeat sx={{ fontSize: 16 }}/>} />
                                <ToggleButtonGroup size="small" exclusive value={passengers[seat]?.type || 'adult'} onChange={(_, v) => v && handlePassengerChange(seat, "type", v)}>
                                    <ToggleButton value="adult">Adult</ToggleButton>
                                    <ToggleButton value="child">Child</ToggleButton>
                                </ToggleButtonGroup>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Name" value={passengers[seat]?.fullName || ''} onChange={(e) => handlePassengerChange(seat, "fullName", e.target.value)} /></Grid>
                                <Grid item xs={6} sm={3}><TextField select fullWidth size="small" label="Gender" value={passengers[seat]?.gender || 'male'} onChange={(e) => handlePassengerChange(seat, "gender", e.target.value)}><MenuItem value="male">Male</MenuItem><MenuItem value="female">Female</MenuItem></TextField></Grid>
                                <Grid item xs={6} sm={3}><TextField fullWidth size="small" label="Age" type="number" value={passengers[seat]?.age || ''} onChange={(e) => handlePassengerChange(seat, "age", e.target.value)} /></Grid>
                            </Grid>
                        </PassengerCard>
                    ))}
                </Box>
            )}

            {/* STEP 2: REVIEW */}
            {activeStep === 2 && (
                <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Review Booking</Typography>
                    <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                        <List disablePadding>
                            <ListItem sx={{ py: 2 }}><ListItemIcon><DirectionsBus color="primary"/></ListItemIcon><ListItemText primary="Vehicle" secondary={selectedVehicle?.name} /></ListItem>
                            <Divider component="li" />
                            <ListItem sx={{ py: 2 }}><ListItemIcon><CalendarMonth color="primary"/></ListItemIcon><ListItemText primary="Dates" secondary={`${formatDateDisplay(startDate)} — ${formatDateDisplay(endDate)}`} /></ListItem>
                            <Divider component="li" />
                            <ListItem sx={{ py: 2 }}><ListItemIcon><Phone color="primary"/></ListItemIcon><ListItemText primary="Contact" secondary={`+91 ${primaryMobile}`} /></ListItem>
                        </List>
                        <Box bgcolor={alpha(theme.palette.primary.main, 0.04)} p={3}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">PASSENGERS</Typography>
                            <Grid container spacing={2}>
                                {selectedSeats.map(seat => (
                                    <Grid item xs={12} sm={6} key={seat}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} bgcolor="white" p={1.5} borderRadius={2} border={`1px solid ${theme.palette.divider}`}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.light' }}>{seat.replace(/\D/g,'')}</Avatar>
                                            <Box><Typography variant="subtitle2" fontWeight={600}>{passengers[seat].fullName}</Typography><Typography variant="caption" color="text.secondary">{passengers[seat].age} yrs • {passengers[seat].gender}</Typography></Box>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                    <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }} icon={<Info />}>Pay <strong>{formatCurrency(advanceAmount)}</strong> (20%) now. Balance {formatCurrency(balanceAmount)} later.</Alert>
                </Box>
            )}

            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <Stack direction="row" justifyContent="space-between" pt={2}>
                <Button variant="text" onClick={handleBack} disabled={activeStep === 0} sx={{ px: 3, color: 'text.secondary' }}>Back</Button>
                <Button variant="contained" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} endIcon={<ArrowForward />} size="large" sx={{ borderRadius: 10, px: 5, py: 1.5, boxShadow: theme.shadows[4] }}>{activeStep === steps.length - 1 ? `Pay ${formatCurrency(advanceAmount)}` : 'Continue'}</Button>
            </Stack>

          </Stack>
        </Grid>

        {/* RIGHT: SUMMARY */}
        <Grid item xs={12} md={4}>
            <StickySummary elevation={0}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Fare Summary</Typography>
                <Stack spacing={2} my={3}>
                    <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Seat Price</Typography><Typography fontWeight={600}>{formatCurrency(seatPrice)}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Seats</Typography><Typography fontWeight={600}>x {selectedSeats.length}</Typography></Stack>
                    {selectedSeats.map(seat => passengers[seat]?.type === 'child' && (
                        <Stack key={seat} direction="row" justifyContent="space-between"><Typography variant="caption" color="success.main">Child Disc. (Seat {seat})</Typography><Typography variant="caption" color="success.main">-{formatCurrency(seatPrice / 2)}</Typography></Stack>
                    ))}
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6" fontWeight={700}>Total</Typography><Typography variant="h5" fontWeight={800} color="primary.main">{formatCurrency(totalAmount)}</Typography></Stack>
                </Stack>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 3 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1}><Typography variant="body2">Advance (20%)</Typography><Typography variant="body1" fontWeight={700} color="primary">{formatCurrency(advanceAmount)}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">On Boarding</Typography><Typography variant="body2" fontWeight={700}>{formatCurrency(balanceAmount)}</Typography></Stack>
                </Paper>
            </StickySummary>
        </Grid>

      </Grid>
    </StyledContainer>
  );
};

export default TourBookingForm;