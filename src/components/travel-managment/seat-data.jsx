import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bookSeat, getSeatsData } from "../redux/reducers/travel/car";
import "./seat.css";
import { FaChair } from "react-icons/fa";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  Paper,
  Box,
} from "@mui/material";

export default function SeatData({ open, onClose, id }) {
  const dispatch = useDispatch();
  const seatData = useSelector((state) => state.car.seatsData);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const GST_RATE = 0.18;
  const GST_THRESHOLD = 1000;

  useEffect(() => {
    if (id && open) {
      dispatch(getSeatsData(id));
    }
  }, [id, open, dispatch]);

  const handleSeatClick = (seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(selectedSeat?._id === seat._id ? null : seat);
    }
  };

  const handleOpenBookingDialog = () => {
    if (selectedSeat) {
      setIsBookingDialogOpen(true);
    }
  };

  const handleBooking = async () => {
    if (selectedSeat && customerName) {
      await dispatch(
        bookSeat({
          seatId: selectedSeat._id,
          carId: id,
          bookedBy: customerName,
          customerMobile: customerMobile,
        })
      );
      setSelectedSeat(null);
      setCustomerName("");
      setCustomerMobile("");
      setIsBookingDialogOpen(false);
    }
  };

  const gstAmount =
    selectedSeat && selectedSeat.seatPrice > GST_THRESHOLD
      ? selectedSeat.seatPrice * GST_RATE
      : 0;

  const totalPrice = selectedSeat
    ? selectedSeat.seatPrice + gstAmount
    : 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box
          sx={{
            border: "2px dotted #000",
            borderRadius: 1,
            padding: "8px",
            display: "inline-block",
          }}
        >
          <Typography>Select Available Seats</Typography>
        </Box>

        <DialogContent>
          <div className="seat-container">
            {Array.isArray(seatData) &&
              seatData.map((car) =>
                car.seats.map((seat) => (
                  <div
                    key={seat._id}
                    className={`seat ${
                      seat.isBooked
                        ? "booked"
                        : selectedSeat?._id === seat._id
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
                ))
              )}
          </div>

          {selectedSeat && (
            <Paper elevation={3} className="gst-details">
              <Typography variant="h6" className="gst-title">
                🧾 Pricing Breakdown
              </Typography>
              <div className="gst-row">
                <Typography>💺 Seat Price:</Typography>
                <Typography>₹{selectedSeat.seatPrice}</Typography>
              </div>
              <div className="gst-row">
                <Typography>🧮 GST (18%):</Typography>
                <Typography>₹{gstAmount.toFixed(2)}</Typography>
              </div>
              <div className="gst-row total">
                <Typography variant="h6">💰 Total Price:</Typography>
                <Typography variant="h6">₹{totalPrice.toFixed(2)}</Typography>
              </div>
              <Typography className="gst-note">
                * GST is applied at 18% if the price exceeds ₹{GST_THRESHOLD}.
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
          <Button
            onClick={handleOpenBookingDialog}
            color="secondary"
            disabled={!selectedSeat}
          >
            Book Now
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
            disabled={!customerName}
          >
            Book
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
