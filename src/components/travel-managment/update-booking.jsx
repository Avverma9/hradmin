import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useLoader } from "../../../utils/loader";
import { reloadPage } from "../../../utils/util";

const UpdateBookingModal = ({ booking, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: booking._id, // corrected id key
    bookedBy: booking.bookedBy,
    customerMobile: booking.customerMobile,
    vehicleNumber: booking.vehicleNumber,
    pickupP: booking.pickupP,
    dropP: booking.dropP,
    pickupD: booking.pickupD.slice(0, 16), // format for datetime-local input
    dropD: booking.dropD.slice(0, 16), // format for datetime-local input
    seats: booking.seats || [], // seats are objects array
  });

  const { showLoader, hideLoader } = useLoader();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const updatedBooking = {
        ...booking,
        id: formData.id,
        bookedBy: formData.bookedBy,
        customerMobile: formData.customerMobile,
        vehicleNumber: formData.vehicleNumber,
        pickupP: formData.pickupP,
        dropP: formData.dropP,
        pickupD: new Date(formData.pickupD),
        dropD: new Date(formData.dropD),
        seats: formData.seats,
      };

      await onUpdate(updatedBooking);
      onClose();
    } catch (err) {
      console.error("Failed to update booking:", err);
    } finally {
      hideLoader();
      reloadPage();
    }
  };
  console.log("Booking Data:", booking);
  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Booking - {booking.bookingId}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Booked By"
                name="bookedBy"
                value={formData.bookedBy}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Mobile"
                name="customerMobile"
                value={formData.customerMobile}
                onChange={handleChange}
                required
                type="tel"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pickup Location"
                name="pickupP"
                value={formData.pickupP}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Drop Location"
                name="dropP"
                value={formData.dropP}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pickup Date"
                name="pickupD"
                value={formData.pickupD}
                onChange={handleChange}
                required
                type="datetime-local"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Drop Date"
                name="dropD"
                value={formData.dropD}
                onChange={handleChange}
                required
                type="datetime-local"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="seats-label">Seats</InputLabel>
                <Select
                  labelId="seats-label"
                  name="seats"
                  multiple
                  value={formData.seats.map((seat) => seat._id)} // array of _id strings
                  onChange={(e) => {
                    const selectedIds = e.target.value;
                    // Map back to seat objects for formData
                    const selectedSeats = selectedIds
                      .map((id) =>
                        booking.seats.find((seat) => seat._id === id),
                      )
                      .filter(Boolean);
                    setFormData((prev) => ({
                      ...prev,
                      seats: selectedSeats,
                    }));
                  }}
                  renderValue={(selected) =>
                    selected
                      ?.map(
                        (id) =>
                          booking.seats.find((seat) => seat._id === id)
                            ?.seatType || id,
                      )
                      .join(", ")
                  }
                >
                  {booking.seats.map((seat) => (
                    <MenuItem key={seat._id} value={seat._id}>
                      {seat.seatType} - Seat #{seat.seatNumber} - ₹
                      {seat.seatPrice}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          color="primary"
          variant="contained"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBookingModal;
