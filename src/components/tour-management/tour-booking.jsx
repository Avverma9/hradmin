import {
  ArrowForwardIos,
  DirectionsBus as BusIcon,
  CheckCircle as CheckCircleIcon,
  ChildCare as ChildIcon,
  Event as EventIcon,
  Face as FaceIcon,
  Person as PersonIcon,
  PhoneAndroid as PhoneIcon,
  AirlineSeatReclineNormal as SeatIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeatMap } from "../redux/reducers/tour/tour";

// --- Helper Functions ---
const addDays = (dateString, days) => {
  if (!dateString) return "";
  const result = new Date(dateString);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0];
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
  const { loading: seatLoading, seatMapByKey } = useSelector(
    (state) => state.tour
  );

  // Derived State
  const finalPrice = useMemo(() => {
    if (!tour) return 0;
    const gstPercent = gstData?.gstPrice || 0;
    return tour.price + (tour.price * gstPercent) / 100;
  }, [tour, gstData]);

  const minDate = tour?.from ? formatDateForInput(tour.from) : "";
  const maxDate = tour?.to ? formatDateForInput(tour.to) : "";
  const isCustomizable = !!tour?.isCustomizable;

  const fixedStartDate = !isCustomizable
    ? formatDateForInput(tour?.tourStartDate || tour?.from)
    : "";

  const fixedEndDate =
    !isCustomizable && fixedStartDate
      ? addDays(fixedStartDate, (tour.days || 1) - 1)
      : "";

  // Form State
  const [startDate, setStartDate] = useState(fixedStartDate);
  const [endDate, setEndDate] = useState(fixedEndDate);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [primaryMobile, setPrimaryMobile] = useState("");
  const [passengers, setPassengers] = useState({});
  const [error, setError] = useState("");

  // Initialize Vehicle
  useEffect(() => {
    if (tour?.vehicles?.length > 0) {
      const activeVehicle = tour.vehicles.find((v) => v.isActive !== false);
      if (activeVehicle) setSelectedVehicleId(activeVehicle._id);
    }
  }, [tour]);

  // Reset/Set dates if tour changes
  useEffect(() => {
    if (!isCustomizable) {
      const start = formatDateForInput(tour?.tourStartDate || tour?.from);
      setStartDate(start);
      setEndDate(addDays(start, (tour?.days || 1) - 1));
    }
  }, [tour, isCustomizable]);

  // Fetch Seat Map
  useEffect(() => {
    if (tour?._id && selectedVehicleId) {
      const key = `${tour._id}:${selectedVehicleId}`;
      if (!seatMapByKey[key]) {
        dispatch(
          fetchSeatMap({ tourId: tour._id, vehicleId: selectedVehicleId })
        );
      }
    }
    setSelectedSeats([]);
    setPassengers({});
  }, [tour?._id, selectedVehicleId, dispatch, seatMapByKey]);

  const seatKey = `${tour?._id}:${selectedVehicleId}`;
  const seatMap = seatMapByKey[seatKey] || [];

  // Handlers
  const handleSeatToggle = (seatCode) => {
    setError("");
    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatCode);
      if (isSelected) {
        const newPassengers = { ...passengers };
        delete newPassengers[seatCode];
        setPassengers(newPassengers);
        return prev.filter((s) => s !== seatCode);
      } else {
        setPassengers((prevP) => ({
          ...prevP,
          [seatCode]: { type: "adult", fullName: "", age: "", gender: "male" },
        }));
        return [...prev, seatCode];
      }
    });
  };

  const handlePassengerChange = (seatCode, field, value) => {
    setPassengers((prev) => ({
      ...prev,
      [seatCode]: { ...prev[seatCode], [field]: value },
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    selectedSeats.forEach((seat) => {
      const p = passengers[seat];
      if (p?.type === "adult") {
        total += finalPrice;
      } else {
        total += finalPrice / 2;
      }
    });
    return total;
  };

  const handleSubmit = () => {
    setError("");
    if (!startDate || !endDate)
      return setError("Select both Start and End travel dates.");
    if (new Date(endDate) < new Date(startDate)) {
      return setError("End date cannot be before Start date.");
    }
    if (selectedSeats.length === 0)
      return setError("Please select at least one seat.");
    if (!primaryMobile || primaryMobile.length < 10)
      return setError("Please enter a valid mobile number.");

    for (const seat of selectedSeats) {
      const p = passengers[seat];
      if (!p.fullName || !p.age || !p.gender) {
        return setError(`Please fill all details for Seat ${seat}`);
      }
    }

    if (!userId) return setError("Please login to proceed.");

    const totalAmount = calculateTotal();
    const passengerList = selectedSeats.map((seat) => ({
      ...passengers[seat],
      seatNumber: seat,
    }));

    const adultsCount = passengerList.filter((p) => p.type === "adult").length;
    const childrenCount = passengerList.filter(
      (p) => p.type === "child"
    ).length;

    onBookingSubmit({
      userId,
      tourId: tour._id,
      vehicleId: selectedVehicleId,
      seats: selectedSeats,
      status: "pending",
      numberOfAdults: adultsCount,
      numberOfChildren: childrenCount,
      passengers: passengerList,
      primaryMobile,
      from: startDate,
      to: endDate,
      tourStartDate: tour.tourStartDate || startDate,
      isCustomizable: isCustomizable,
      travelAgencyName: tour.travelAgencyName,
      agencyEmail: tour.agencyEmail,
      agencyPhone: tour.agencyPhone,
      basePrice: tour.price,
      totalAmount,
      country: tour.country,
      state: tour.state,
      city: tour.city,
    });
  };

  if (!tour) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* --- Header Section --- */}
        <Box
          sx={{
            bgcolor: "#fff",
            px: 4,
            py: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="800" color="#1a202c">
                Complete Your Booking
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {tour.travelAgencyName}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary" display="block">
                Price / Adult
              </Typography>
              <Typography variant="h5" fontWeight="800" color="primary.main">
                {formatCurrency(finalPrice)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container>
          {/* --- LEFT PANEL: Trip Details & Seat Selection --- */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              borderRight: { md: "1px solid" },
              borderColor: "divider",
              bgcolor: "#fff",
            }}
          >
            <Box p={4}>
              {/* Date Selection */}
              <Typography
                variant="subtitle2"
                fontWeight="700"
                color="text.secondary"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <EventIcon fontSize="small" /> TRIP DETAILS
              </Typography>

              <Stack spacing={2} mb={3}>
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    disabled={!isCustomizable}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: isCustomizable ? minDate : undefined,
                      max: isCustomizable ? maxDate : undefined,
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    type="date"
                    value={endDate}
                    disabled={!isCustomizable}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: isCustomizable ? startDate || minDate : undefined,
                      max: isCustomizable ? maxDate : undefined,
                    }}
                  />
                </Box>
                {isCustomizable && (
                  <Typography variant="caption" color="text.secondary">
                    Available Range: {minDate} to {maxDate}
                  </Typography>
                )}

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select Vehicle"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {(tour.vehicles || [])
                    .filter((v) => v.isActive !== false)
                    .map((v) => (
                      <MenuItem key={v._id} value={v._id}>
                        {v.name} ({v.seaterType})
                      </MenuItem>
                    ))}
                </TextField>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Seat Legend */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="700"
                  color="text.primary"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <SeatIcon color="action" /> SELECT SEATS
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <LegendItem color="grey.400" border label="Avail" />
                  <LegendItem color="primary.main" label="Selected" />
                  <LegendItem color="grey.300" label="Booked" />
                </Stack>
              </Box>

              {/* Grid Seat Map */}
              {seatLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    maxWidth: 320,
                    mx: "auto",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    {/* Headers A, B, C, D */}
                    {["A", "B", "", "C", "D"].map((h, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        fontWeight="bold"
                        align="center"
                        color="text.disabled"
                      >
                        {h}
                      </Typography>
                    ))}

                    {/* Seats Loop */}
                    {seatMap.length > 0 ? (
                      Array.from({ length: Math.ceil(seatMap.length / 4) }).map(
                        (_, rowIndex) => {
                          const rowSeats = seatMap.slice(
                            rowIndex * 4,
                            (rowIndex + 1) * 4
                          );
                          return (
                            <React.Fragment key={rowIndex}>
                              {renderSeatButton(rowSeats[0], selectedSeats, handleSeatToggle, "A")}
                              {renderSeatButton(rowSeats[1], selectedSeats, handleSeatToggle, "B")}
                              
                              {/* Aisle Number */}
                              <Typography
                                variant="caption"
                                align="center"
                                color="text.disabled"
                                sx={{ fontSize: 10, fontWeight: "bold" }}
                              >
                                {rowIndex + 1}
                              </Typography>

                              {renderSeatButton(rowSeats[2], selectedSeats, handleSeatToggle, "C")}
                              {renderSeatButton(rowSeats[3], selectedSeats, handleSeatToggle, "D")}
                            </React.Fragment>
                          );
                        }
                      )
                    ) : (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ gridColumn: "span 5", textAlign: "center" }}
                      >
                        No Seats Available
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* --- RIGHT PANEL: Passenger Details --- */}
          <Grid item xs={12} md={7} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Box p={4} height="100%">
              <Typography
                variant="h6"
                fontWeight="700"
                color="text.primary"
                gutterBottom
                display="flex"
                alignItems="center"
                gap={1}
                mb={3}
              >
                <PersonIcon color="primary" /> Passenger Details
              </Typography>

              {selectedSeats.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height={300}
                  border="2px dashed"
                  borderColor="divider"
                  borderRadius={3}
                  bgcolor="#fff"
                >
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    Select seats to add passengers
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {selectedSeats.map((seatId, index) => (
                    <Paper
                      key={seatId}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Chip
                          label={`SEAT ${seatId}`}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: "bold", borderRadius: 1 }}
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                            TYPE
                          </Typography>
                          <ToggleButtonGroup
                            value={passengers[seatId]?.type || "adult"}
                            exclusive
                            onChange={(_, val) => val && handlePassengerChange(seatId, "type", val)}
                            size="small"
                            fullWidth
                            sx={{ height: 40 }}
                          >
                            <ToggleButton value="adult"><FaceIcon fontSize="small" sx={{ mr: 1 }} /> Adult</ToggleButton>
                            <ToggleButton value="child"><ChildIcon fontSize="small" sx={{ mr: 1 }} /> Child</ToggleButton>
                          </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                            FULL NAME
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. John Doe"
                            value={passengers[seatId]?.fullName || ""}
                            onChange={(e) => handlePassengerChange(seatId, "fullName", e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                            AGE
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Age"
                            type="number"
                            value={passengers[seatId]?.age || ""}
                            onChange={(e) => handlePassengerChange(seatId, "age", e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                            GENDER
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={passengers[seatId]?.gender || "male"}
                            onChange={(e) => handlePassengerChange(seatId, "gender", e.target.value)}
                          >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </TextField>
                        </Grid>
                        
                        {index === 0 && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                              PRIMARY CONTACT (Mobile)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="10-digit mobile number"
                              value={primaryMobile}
                              onChange={(e) => setPrimaryMobile(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}

              {/* Payment Footer */}
              {selectedSeats.length > 0 && (
                <Box mt={4} pt={2} borderTop="1px dashed" borderColor="divider">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {formatCurrency(calculateTotal())}
                    </Typography>
                  </Box>
                  
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: "bold",
                      fontSize: "1rem",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    }}
                    endIcon={<ArrowForwardIos fontSize="small" />}
                  >
                    Pay Now {formatCurrency(calculateTotal() * 0.2)} (Advance)
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

// --- Sub-components ---

const LegendItem = ({ color, border, label }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Box
      width={14}
      height={14}
      borderRadius={0.5}
      bgcolor={border ? "transparent" : color}
      border={border ? 1 : 0}
      borderColor={color}
    />
    <Typography variant="caption" fontWeight="500" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const renderSeatButton = (seat, selectedSeats, handleToggle, colLetter) => {
  if (!seat) return <Box />;
  const isBooked = seat.status === "booked";
  const seatId = seat.code; 
  const isSelected = selectedSeats.includes(seatId);

  return (
    <Button
      variant={isSelected ? "contained" : "outlined"}
      color={isSelected ? "primary" : "inherit"}
      disabled={isBooked}
      onClick={() => handleToggle(seatId)}
      sx={{
        minWidth: 0,
        height: 44, // Taller to fit stacked text
        width: "100%",
        p: 0,
        borderRadius: 1.5,
        borderWidth: isSelected ? 0 : 1,
        borderColor: isBooked ? "transparent" : "divider",
        bgcolor: isBooked
          ? "action.disabledBackground"
          : isSelected
          ? "primary.main"
          : "#fff",
        color: isBooked
          ? "text.disabled"
          : isSelected
          ? "#fff"
          : "text.primary",
        "&:hover": {
          bgcolor: isSelected ? "primary.dark" : "grey.100",
          borderWidth: isSelected ? 0 : 1,
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        boxShadow: isSelected ? "0 4px 6px rgba(0,0,0,0.2)" : "none",
      }}
    >
      {isSelected ? (
        <CheckCircleIcon sx={{ fontSize: 20 }} />
      ) : (
        <>
          <Typography
            component="span"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {seatId}
          </Typography>
          {/* This renders the Column Letter just below the number */}
          <Typography
            component="span"
            sx={{
              fontSize: "0.65rem",
              fontWeight: 600,
              opacity: 0.6,
              lineHeight: 1,
              mt: 0.2,
            }}
          >
            {colLetter}
          </Typography>
        </>
      )}
    </Button>
  );
};

export default TourBookingForm;