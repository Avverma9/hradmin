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
} from "@mui/material";

export default function SeatData({ open, onClose, id }) {
  const dispatch = useDispatch();
  const seatData = useSelector((state) => state.car.seatsData);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const GST_RATE = 0.18;
  const GST_THRESHOLD = 1000;

  useEffect(() => {
    if (id) {
      dispatch(getSeatsData(id));
    }
  }, [id, dispatch]);

  const handleSeatClick = (seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(selectedSeat?._id === seat._id ? null : seat); // Toggle selection
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
        })
      );
      setSelectedSeat(null);
      setCustomerName("");
      setIsBookingDialogOpen(false);
    }
  };

  // GST Calculation
  const gstAmount = selectedSeat ? selectedSeat.seatPrice * GST_RATE : 0;
  const totalPrice = selectedSeat ? selectedSeat.seatPrice + gstAmount : 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Select Available Seats</DialogTitle>
        <DialogContent>
          <div className="seat-container">
            {seatData &&
              Array.isArray(seatData) &&
              seatData?.map((car) =>
                car.seats.map((data) => (
                  <div
                    key={data._id}
                    className={`seat ${
                      data.isBooked
                        ? "booked"
                        : selectedSeat?._id === data._id
                        ? "selected"
                        : "available"
                    }`}
                    onClick={() => handleSeatClick(data)}
                  >
                    <FaChair className="seat-icon" />
                    <div className="seat-type">{data.seatType}</div>
                    <div className="seat-number">Seat: {data.seatNumber}</div>
                    <div className="seat-price">₹{data.seatPrice}</div>
                    {data.isBooked && <div className="booked-by">Booked</div>}
                  </div>
                ))
              )}
          </div>

          {/* GST Details Section */}
          {selectedSeat && (
            <Paper elevation={3} className="gst-details">
              <Typography variant="h6" className="gst-title">
                🧾 Pricing Breakdown
              </Typography>
              <div className="gst-row">
                <Typography variant="body1">💺 Seat Price:</Typography>
                <Typography variant="body1">₹{selectedSeat.seatPrice}</Typography>
              </div>
              <div className="gst-row">
                <Typography variant="body1">🧮 GST (18%):</Typography>
                <Typography variant="body1">₹{gstAmount.toFixed(2)}</Typography>
              </div>
              <div className="gst-row total">
                <Typography variant="h6">💰 Total Price:</Typography>
                <Typography variant="h6">₹{totalPrice.toFixed(2)}</Typography>
              </div>
              <Typography variant="body2" className="gst-note">
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

      {/* Booking Dialog */}
      <Dialog
        open={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
      >
        <DialogTitle>Enter Customer Name</DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Name"
            fullWidth
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsBookingDialogOpen(false)}
            color="primary"
          >
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
