import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bookSeat, getSeatsData } from "../redux/reducers/travel/car";
import { getGst } from "../redux/reducers/gst";
import "./seat.css";
import { FaChair } from "react-icons/fa";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function SeatData({ open, onClose, id, carData }) {
  const dispatch = useDispatch();
  const seatData = useSelector((state) => state.car.seatsData);
  const gstData = useSelector((state) => state.gst.gst);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (id && open) {
      const payload = {
        type: "Travel",
        gstThreshold: "", // optional or handled in backend
      };
      dispatch(getSeatsData(id));
      dispatch(getGst(payload));
    }
  }, [id, open, dispatch]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    const isSelected = selectedSeats.find((s) => s._id === seat._id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s._id !== seat._id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleOpenBookingDialog = () => {
    if (selectedSeats.length > 0) {
      setIsBookingDialogOpen(true);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length > 0 && customerName) {
      const seatIds = selectedSeats.map((seat) => seat._id);

      await dispatch(
        bookSeat({
          seats: seatIds,
          carId: id,
          bookedBy: customerName,
          vehicleNumber: carData?.vehicleNumber,
          customerMobile: customerMobile,
        })
      );

      setSelectedSeats([]);
      setCustomerName("");
      setCustomerMobile("");
      setIsBookingDialogOpen(false);
    }
  };

  const gstPercentage = gstData?.gstPrice || 0;
  const basePrice = selectedSeats.reduce((sum, seat) => sum + seat.seatPrice, 0);
  const gstAmount = basePrice * (gstPercentage / 100);
  const totalPrice = basePrice + gstAmount;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Select Available Seats</Typography>
        </Box>

        <DialogContent>
          <div className="seat-container">
            {Array.isArray(seatData) &&
              seatData.map((car) =>
                car.seats.map((seat) => {
                  const isSelected = selectedSeats.find((s) => s._id === seat._id);
                  return (
                    <div
                      key={seat._id}
                      className={`seat ${seat.isBooked
                        ? "booked"
                        : isSelected
                          ? "selected"
                          : "available"
                        }`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      <FaChair className="seat-icon" />
                      <div className="seat-type">{seat.seatType}</div>
                      <div className="seat-number">Seat: {seat.seatNumber}</div>
                      <div className="seat-price">₹{seat.seatPrice}</div>
                      {seat.isBooked && <div className="booked-by">Booked</div>}
                    </div>
                  );
                })
              )}
          </div>

          {selectedSeats.length > 0 && (
            <Paper elevation={3} className="gst-details">
              <Typography variant="h6" className="gst-title">
                🧾 Pricing Breakdown
              </Typography>
              <div className="gst-row">
                <Typography>💺 Total Seat Price:</Typography>
                <Typography>₹{basePrice}</Typography>
              </div>
              <div className="gst-row">
                <Typography>🧮 GST ({gstPercentage}%):</Typography>
                <Typography>₹{gstAmount.toFixed(2)}</Typography>
              </div>
              <div className="gst-row total">
                <Typography variant="h6">💰 Total Price:</Typography>
                <Typography variant="h6">₹{totalPrice.toFixed(2)}</Typography>
              </div>
              <Typography className="gst-note">
                * GST is applied dynamically as per government rules.
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary">Close</Button>
          <Button
            onClick={handleOpenBookingDialog}
            color="secondary"
            disabled={selectedSeats.length === 0}
          >
            Book Now ({selectedSeats.length} seats)
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
      >
        <DialogTitle>Enter Customer Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Name"
            fullWidth
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Customer Mobile"
            fullWidth
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBookingDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            color="secondary"
            disabled={!customerName || selectedSeats.length === 0}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
