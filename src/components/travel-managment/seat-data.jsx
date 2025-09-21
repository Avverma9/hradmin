import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  EventSeat,
  Close,
  Person,
  Phone,
  Email,
  AirlineSeatReclineNormal,
  CarRental,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { bookSeat, getSeatsData } from "../redux/reducers/travel/car";
import { getGst } from "../redux/reducers/gst";

// Seat component with modern styling
const Seat = ({ seat, onSeatClick, isSelected }) => {
  const getSeatStyle = () => {
    if (seat.isBooked) {
      return {
        bgcolor: "#e0e0e0",
        color: "#757575",
        cursor: "not-allowed",
        border: "1px solid #bdbdbd",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
      };
    }
    if (isSelected) {
      return {
        background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
        color: "white",
        "&:hover": { boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)" },
        transform: "scale(1.1)",
        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
      };
    }
    return {
      bgcolor: "white",
      color: "#424242",
      border: "1px solid #e0e0e0",
      "&:hover": {
        bgcolor: "#e3f2fd",
        borderColor: "#90caf9",
      },
    };
  };

  return (
    <Tooltip
      title={seat.isBooked ? "Booked" : `Seat ${seat.seatNumber} - ₹${seat.seatPrice}`}
      placement="top"
    >
      <Box
        onClick={() => onSeatClick(seat)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          textAlign: "center",
          transition: "all 0.2s ease-in-out",
          width: 45,
          height: 45,
          userSelect: "none",
          ...getSeatStyle(),
        }}
      >
        <EventSeat sx={{ fontSize: 22, color: isSelected ? 'white' : 'inherit' }} />
        <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: '600' }}>
          {seat.seatNumber}
        </Typography>
      </Box>
    </Tooltip>
  );
};

Seat.propTypes = {
  seat: PropTypes.object.isRequired,
  onSeatClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

// Seat legend with modern styling
const SeatLegend = () => (
  <Stack direction="row" spacing={2.5} justifyContent="center" mb={2}>
    <Box display="flex" alignItems="center" gap={1}>
      <Box sx={{ width: 16, height: 16, bgcolor: "white", border: 1, borderColor: "grey.400", borderRadius: 1 }} />
      <Typography variant="caption">Available</Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <Box sx={{ width: 16, height: 16, background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)", borderRadius: 1 }} />
      <Typography variant="caption">Selected</Typography>
    </Box>
    <Box display="flex" alignItems="center" gap={1}>
      <Box sx={{ width: 16, height: 16, bgcolor: "#e0e0e0", border: 1, borderColor: "grey.500", borderRadius: 1 }} />
      <Typography variant="caption">Booked</Typography>
    </Box>
  </Stack>
);

export default function SeatData({ open, onClose, id, carData }) {
  const dispatch = useDispatch();
  const seatData = useSelector((state) => state.car.seatsData);
  const gstData = useSelector((state) => state.gst.gst);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const isPrivateBooking = carData && carData.sharingType === "Private";

  useEffect(() => {
    if (id && open && !isPrivateBooking) {
      dispatch(getSeatsData(id));
    }
    if (!open) {
      setSelectedSeats([]);
      setCustomerName("");
      setCustomerMobile("");
      setCustomerEmail("");
    }
  }, [id, open, dispatch, isPrivateBooking]);

  const basePrice = isPrivateBooking
    ? carData?.price || 0
    : selectedSeats.reduce((sum, seat) => sum + seat.seatPrice, 0);

  useEffect(() => {
    if (basePrice > 0) {
      dispatch(getGst({ type: "Travel", gstThreshold: basePrice }));
    }
  }, [basePrice, dispatch]);

  const handleSeatClick = useCallback((seat) => {
    if (seat.isBooked) return;
    setSelectedSeats((prev) =>
      prev.find((s) => s._id === seat._id)
        ? prev.filter((s) => s._id !== seat._id)
        : [...prev, seat]
    );
  }, []);

  const handleBooking = async () => {
    if (!customerName || !customerMobile || !customerEmail) {
      toast.error("Please fill in all customer details.");
      return;
    }
    if (!isPrivateBooking && selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        seats: isPrivateBooking ? [] : selectedSeats.map((s) => s._id),
        carId: id,
        bookedBy: customerName,
        sharingType: carData?.sharingType,
        vehicleType: carData?.vehicleType,
        vehicleNumber: carData?.vehicleNumber,
        customerMobile,
        customerEmail,
      };
      await dispatch(bookSeat(payload)).unwrap();
      window.location.reload();
    } catch (error) {
      toast.error(error?.message || "Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const gstPercentage = gstData?.gstPrice || 0;
  const gstAmount = basePrice * (gstPercentage / 100);
  const totalPrice = basePrice + gstAmount;

  const renderSharedBooking = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Paper elevation={0} sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%", bgcolor: 'transparent' }}>
          <SeatLegend />
           <Box sx={{
              p: {xs: 1.5, sm: 3}, pt: {xs: 4, sm: 6}, mt: 2, border: "2px solid #cfd8dc", borderBottomWidth: "10px",
              borderRadius: "50px 50px 8px 8px", position: "relative", bgcolor: "#eceff1",
              flexGrow: 1,
            }} >
            <Box sx={{ position: "absolute", top: 12, left: 15 }}>
              <Tooltip title="Driver"><AirlineSeatReclineNormal sx={{ fontSize: 32, color: "grey.600", transform: "rotate(-90deg)" }} /></Tooltip>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr) 40px repeat(3, 1fr)", gap: { xs: 1, sm: 1.5 }, justifyContent: "center" }}>
              {seatData[0]?.seats?.map((seat) => (
                <Seat key={seat._id} seat={seat} onSeatClick={handleSeatClick} isSelected={selectedSeats.some((s) => s._id === seat._id)} />
              ))}
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper elevation={2} sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, background: 'linear-gradient(to top, #ffffff, #f8fafc)' }}>
          <Typography variant="h6" fontWeight="700" gutterBottom>Booking Summary</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Selected Seats:</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, minHeight: 32 }}>
              {selectedSeats.length > 0 ? (
                selectedSeats.map((seat) => <Chip key={seat._id} label={seat.seatNumber} size="small" color="primary" variant="filled" />)
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>Please select a seat</Typography>
              )}
            </Box>
          </Box>

          <Typography variant="subtitle1" fontWeight="600">Passenger Details</Typography>
          <TextField margin="dense" size="small" label="Name" fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }} />
          <TextField margin="dense" size="small" label="Mobile" fullWidth value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }}/>
          <TextField margin="dense" size="small" label="Email" fullWidth value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}/>

          {basePrice > 0 && (
            <Stack spacing={1.5} sx={{ mt: 2, p: 2, background: 'rgba(236, 239, 241, 0.5)', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Base Price</Typography><Typography variant="body2" fontWeight="500">₹{basePrice.toFixed(2)}</Typography></Box>
              <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">GST ({gstPercentage}%)</Typography><Typography variant="body2" fontWeight="500">₹{gstAmount.toFixed(2)}</Typography></Box>
              <Divider sx={{ my: 0.5 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h6" fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
              </Box>
            </Stack>
          )}

          <Button fullWidth variant="contained" size="large" onClick={handleBooking} disabled={selectedSeats.length === 0 || !customerName || !customerMobile || !customerEmail || isBooking} sx={{ mt: "auto", py: 1.5, borderRadius: 2.5 }}>
            {isBooking ? <CircularProgress size={24} color="inherit" /> : `Book Now`}
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderPrivateBooking = () => (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={10} md={8}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(to top, #ffffff, #f8fafc)' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Confirm Your Private Ride</Typography>
          <Stack direction="row" spacing={2} alignItems="center" my={2} p={2} bgcolor="rgba(236, 239, 241, 0.5)" borderRadius={2}>
            <Avatar src={carData?.images?.[0]} sx={{ width: 64, height: 64 }} variant="rounded"><CarRental /></Avatar>
            <Box><Typography variant="h6">{carData?.make} {carData?.model}</Typography><Typography variant="body2" color="text.secondary">{carData?.vehicleNumber}</Typography></Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight="600">Passenger Details</Typography>
          <TextField autoFocus margin="dense" size="small" label="Name" fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }} />
          <TextField margin="dense" size="small" label="Mobile" fullWidth value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }}/>
          <TextField margin="dense" size="small" label="Email" fullWidth value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}/>
          <Stack spacing={1.5} sx={{ mt: 2.5, p: 2, background: 'rgba(236, 239, 241, 0.5)', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between"><Typography variant="body1" color="text.secondary">Base Price</Typography><Typography variant="body1" fontWeight="500">₹{basePrice.toFixed(2)}</Typography></Box>
              <Box display="flex" justifyContent="space-between"><Typography variant="body1" color="text.secondary">GST ({gstPercentage}%)</Typography><Typography variant="body1" fontWeight="500">₹{gstAmount.toFixed(2)}</Typography></Box>
              <Divider sx={{ my: 0.5 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">Total Price</Typography>
                <Typography variant="h6" fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
              </Box>
            </Stack>
          <Button fullWidth variant="contained" size="large" onClick={handleBooking} disabled={!customerName || !customerMobile || !customerEmail || isBooking} sx={{ mt: 3, py: 1.5, borderRadius: 2.5 }}>
            {isBooking ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Book Ride'}
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={isPrivateBooking ? "sm" : "md"} PaperProps={{ sx: { borderRadius: 4, maxHeight: "95vh" } }}>
      <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="600">{isPrivateBooking ? "Book Private Car" : "Select Your Seats"}</Typography>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: "#f1f5f9" }}>
        {!carData ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px"><CircularProgress /></Box>
        ) : isPrivateBooking ? (
          renderPrivateBooking()
        ) : (
          renderSharedBooking()
        )}
      </DialogContent>
    </Dialog>
  );
}

SeatData.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  id: PropTypes.string,
  carData: PropTypes.object,
};

