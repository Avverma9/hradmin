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

// Helper to extract YYYY-MM-DD from ISO string for HTML input
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

  // Determine allowed date range
  const minDate = tour?.from ? formatDateForInput(tour.from) : "";
  const maxDate = tour?.to ? formatDateForInput(tour.to) : "";

  // Initialize Dates
  // If not customizable, fix the dates. If customizable, allow empty.
  const fixedStartDate = !tour?.isCustomizable
    ? formatDateForInput(tour?.tourStartDate || tour?.from)
    : "";

  const fixedEndDate =
    !tour?.isCustomizable && fixedStartDate
      ? addDays(fixedStartDate, (tour.days || 1) - 1)
      : "";

  // Form State
  const [startDate, setStartDate] = useState(fixedStartDate);
  const [endDate, setEndDate] = useState(fixedEndDate);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [primaryMobile, setPrimaryMobile] = useState("");

  // Passengers State: mapped by seat ID
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
    if (!tour.isCustomizable) {
      const start = formatDateForInput(tour?.tourStartDate || tour?.from);
      setStartDate(start);
      setEndDate(addDays(start, (tour.days || 1) - 1));
    }
  }, [tour]);

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
        // Remove seat and passenger data
        const newPassengers = { ...passengers };
        delete newPassengers[seatCode];
        setPassengers(newPassengers);
        return prev.filter((s) => s !== seatCode);
      } else {
        // Add seat and initialize passenger data
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
        total += finalPrice / 2; // Assuming simple half price for child type
      }
    });
    return total;
  };

  const handleSubmit = () => {
    setError("");
    if (!startDate || !endDate)
      return setError("Select both Start and End travel dates.");

    // Date Validation
    if (new Date(endDate) < new Date(startDate)) {
      return setError("End date cannot be before Start date.");
    }

    if (selectedSeats.length === 0)
      return setError("Please select at least one seat.");
    if (!primaryMobile || primaryMobile.length < 10)
      return setError("Please enter a valid mobile number.");

    // Validate passengers
    for (const seat of selectedSeats) {
      const p = passengers[seat];
      if (!p.fullName || !p.age || !p.gender) {
        return setError(`Please fill all details for Seat ${seat}`);
      }
    }

    if (!userId) return setError("Please login to proceed.");

    const totalAmount = calculateTotal();

    // Format passengers for API
    const passengerList = selectedSeats.map((seat) => ({
      ...passengers[seat],
      seatNumber: seat,
    }));

    // Calculate counts
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
      isCustomizable: tour.isCustomizable,
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "grey.50",
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight="800">
                Complete Your Booking
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tour.travelAgencyName}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Price / Adult
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
              >
                {formatCurrency(finalPrice)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container>
          {/* Left Side: Seat Map & Trip Details */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{ borderRight: { md: "1px solid" }, borderColor: "divider" }}
          >
            <Box p={3}>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <EventIcon sx={{ fontSize: 16 }} /> TRIP DETAILS
              </Typography>

              <Stack spacing={2} mb={4}>
                {/* UPDATED DATE PICKER LOGIC: Start and End Date */}
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    disabled={!tour.isCustomizable}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: tour.isCustomizable ? minDate : undefined,
                      max: tour.isCustomizable ? maxDate : undefined,
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    type="date"
                    value={endDate}
                    disabled={!tour.isCustomizable}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: tour.isCustomizable
                        ? startDate || minDate
                        : undefined,
                      max: tour.isCustomizable ? maxDate : undefined,
                    }}
                  />
                </Box>
                {tour.isCustomizable && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: -1, display: "block" }}
                  >
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
                      <MenuItem key={v._id} value={v._id} dense>
                        {v.name} ({v.seaterType})
                      </MenuItem>
                    ))}
                </TextField>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <SeatIcon fontSize="small" color="action" /> SELECT SEATS
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      width={12}
                      height={12}
                      border={1}
                      borderRadius={0.5}
                      borderColor="grey.400"
                    />
                    <Typography variant="caption">Avail</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius={0.5}
                      bgcolor="primary.main"
                    />
                    <Typography variant="caption">Selected</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius={0.5}
                      bgcolor="grey.300"
                    />
                    <Typography variant="caption">Booked</Typography>
                  </Box>
                </Stack>
              </Box>

              {seatLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "grey.50", maxWidth: 300, mx: "auto" }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
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
                    {seatMap.length > 0 ? (
                      Array.from({ length: Math.ceil(seatMap.length / 4) }).map(
                        (_, rowIndex) => {
                          const rowSeats = seatMap.slice(
                            rowIndex * 4,
                            (rowIndex + 1) * 4
                          );
                          return (
                            <React.Fragment key={rowIndex}>
                              {renderSeatButton(
                                rowSeats[0],
                                selectedSeats,
                                handleSeatToggle
                              )}
                              {renderSeatButton(
                                rowSeats[1],
                                selectedSeats,
                                handleSeatToggle
                              )}
                              <Typography
                                variant="caption"
                                align="center"
                                color="text.disabled"
                                sx={{ fontSize: 10 }}
                              >
                                {rowIndex + 1}
                              </Typography>
                              {renderSeatButton(
                                rowSeats[2],
                                selectedSeats,
                                handleSeatToggle
                              )}
                              {renderSeatButton(
                                rowSeats[3],
                                selectedSeats,
                                handleSeatToggle
                              )}
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
                        No Seats
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Right Side: Passenger Forms */}
          <Grid item xs={12} md={7}>
            <Box
              p={3}
              bgcolor={alpha(theme.palette.primary.main, 0.02)}
              height="100%"
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                display="flex"
                alignItems="center"
                gap={1}
              >
                <PersonIcon color="primary" /> Passenger Details
              </Typography>

              {selectedSeats.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height={200}
                  border="1px dashed"
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    Select seats to add passengers
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {selectedSeats.map((seatId, index) => (
                    <Paper
                      key={seatId}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2, bgcolor: "white" }}
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
                        <Grid item xs={12} sm={5}>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            mb={0.5}
                            display="block"
                          >
                            TYPE
                          </Typography>
                          <ToggleButtonGroup
                            value={passengers[seatId]?.type || "adult"}
                            exclusive
                            onChange={(_, val) =>
                              val && handlePassengerChange(seatId, "type", val)
                            }
                            size="small"
                            fullWidth
                            sx={{ height: 40 }}
                          >
                            <ToggleButton
                              value="adult"
                              sx={{ textTransform: "none", gap: 1 }}
                            >
                              <FaceIcon fontSize="small" /> Adult
                            </ToggleButton>
                            <ToggleButton
                              value="child"
                              sx={{ textTransform: "none", gap: 1 }}
                            >
                              <ChildIcon fontSize="small" /> Child
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12} sm={7}>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            mb={0.5}
                            display="block"
                          >
                            FULL NAME
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Passenger Name"
                            value={passengers[seatId]?.fullName || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                seatId,
                                "fullName",
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            mb={0.5}
                            display="block"
                          >
                            AGE
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Age"
                            type="number"
                            value={passengers[seatId]?.age || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                seatId,
                                "age",
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                            mb={0.5}
                            display="block"
                          >
                            GENDER
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={passengers[seatId]?.gender || "male"}
                            onChange={(e) =>
                              handlePassengerChange(
                                seatId,
                                "gender",
                                e.target.value
                              )
                            }
                          >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </TextField>
                        </Grid>
                        {/* Primary Mobile only for the first passenger */}
                        {index === 0 && (
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              color="text.secondary"
                              mb={0.5}
                              display="block"
                            >
                              PRIMARY MOBILE NUMBER
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
                                    <PhoneIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                              helperText="Booking confirmation will be sent here."
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}

              {/* Payment Summary */}
              {selectedSeats.length > 0 && (
                <Box mt={4}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    Payment Summary
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderStyle: "dashed",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Package Price (x{selectedSeats.length})
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(selectedSeats.length * finalPrice)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        Total Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {formatCurrency(calculateTotal())}
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      bgcolor="warning.light"
                      p={1}
                      borderRadius={1}
                      color="warning.contrastText"
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Pay Now (20% Advance)
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(calculateTotal() * 0.2)}
                      </Typography>
                    </Box>
                  </Paper>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    sx={{ mt: 2, borderRadius: 2, fontWeight: "bold" }}
                    endIcon={<ArrowForwardIos fontSize="small" />}
                  >
                    Proceed to Pay {formatCurrency(calculateTotal() * 0.2)}
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

// --- Sub-component for Seat Button ---
const renderSeatButton = (seat, selectedSeats, handleToggle) => {
  if (!seat) return <Box />;
  const isBooked = seat.status === "booked";
  const isSelected = selectedSeats.includes(seat.code);

  return (
    <Button
      variant={isSelected ? "contained" : "outlined"}
      color={isSelected ? "primary" : "inherit"}
      disabled={isBooked}
      onClick={() => handleToggle(seat.code)}
      sx={{
        minWidth: 0,
        height: 32,
        width: "100%",
        p: 0,
        borderRadius: 1,
        fontSize: "0.75rem",
        fontWeight: "bold",
        borderColor: isBooked ? "transparent" : "divider",
        bgcolor: isBooked
          ? "action.disabledBackground"
          : isSelected
            ? "primary.main"
            : "white",
        color: isBooked
          ? "text.disabled"
          : isSelected
            ? "white"
            : "text.secondary",
        "&:hover": { bgcolor: isSelected ? "primary.dark" : "grey.100" },
        "&.Mui-disabled": {
          bgcolor: isBooked ? "action.disabledBackground" : "white",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {isSelected ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : seat.code}
    </Button>
  );
};

export default TourBookingForm;
