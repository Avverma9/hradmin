/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Box,
  Grid,
  Modal,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateBooking } from "src/components/redux/reducers/booking";
import { hotelEmail, userName } from "../../../../utils/util";
import { useLoader } from "../../../../utils/loader";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 720,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AdminBookingUpdateModal = ({ open, onClose, bookingData, onSave }) => {
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    price: "",
    checkInTime: null,
    checkOutTime: null,
    bookingStatus: "",
    numRooms: "",
    guests: "",
    cancellationReason: "", // --- 1. Added new field to state ---
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const updated = useSelector((state) => state.booking.updated);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (bookingData) {
      const formatDate = (dateInput) => {
        const date = new Date(dateInput);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setFormData({
        checkInDate: bookingData.checkInDate ? formatDate(bookingData.checkInDate) : "",
        checkOutDate: bookingData.checkOutDate ? formatDate(bookingData.checkOutDate) : "",
        checkInTime: bookingData.checkInTime ? new Date(bookingData.checkInTime) : null,
        checkOutTime: bookingData.checkOutTime ? new Date(bookingData.checkOutTime) : null,
        price: bookingData.price || "",
        bookingStatus: bookingData.bookingStatus || "",
        numRooms: bookingData.numRooms || "",
        guests: bookingData.guests || "",
        cancellationReason: bookingData.cancellationReason || "", // Pre-fill if it exists
      });
    }
  }, [bookingData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTimeChange = (name) => (time) => {
    setFormData((prevData) => ({ ...prevData, [name]: time }));
  };

  const handleSave = async () => {
    setLoading(true);
    showLoader();
    try {
      await dispatch(
        updateBooking({
          bookingId: bookingData.bookingId,
          updatedData: {
            ...formData,
            checkInTime: formData.checkInTime?.toISOString(),
            checkOutTime: formData.checkOutTime?.toISOString(),
            createdBy: {
              user: userName,
              email: hotelEmail
            },
          },
        })
      );
      onSave(updated);
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const isDisabled =
    bookingData?.bookingStatus === "Cancelled" || bookingData?.bookingStatus === "Checked-out";
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Update Booking
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-in Date"
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="dense"
                disabled={isDisabled}
              />

            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-out Date"
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="dense"
                disabled={isDisabled}
              />
            </Grid>

            {formData.bookingStatus === "Checked-in" && (
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Check-in Time"
                  value={formData.checkInTime}
                  onChange={handleTimeChange("checkInTime")}
                  disabled={isDisabled}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="dense" />
                  )}
                />
              </Grid>
            )}

            {formData.bookingStatus === "Checked-out" && (
              <>
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Check-in Time"
                    value={formData.checkInTime}
                    onChange={handleTimeChange("checkInTime")}
                    disabled={isDisabled}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="dense" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Check-out Time"
                    value={formData.checkOutTime}
                    onChange={handleTimeChange("checkOutTime")}
                    disabled={isDisabled}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="dense" />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Booking Status"
                name="bookingStatus"
                value={formData.bookingStatus}
                onChange={handleChange}
                margin="dense"
                disabled={isDisabled}
              >
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="No-show">No Show</MenuItem>
                <MenuItem value="Checked-in">Checked in</MenuItem>
                <MenuItem value="Checked-out">Checked out</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                margin="dense"
                disabled={isDisabled}
              />
            </Grid>
            
            {/* --- 2. Conditionally render the new field --- */}
            {formData.bookingStatus === 'Cancelled' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Cancellation Reason"
                  name="cancellationReason"
                  value={formData.cancellationReason}
                  onChange={handleChange}
                  margin="dense"
                  disabled={isDisabled}
                  placeholder="Enter the reason for cancellation"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Rooms"
                type="number"
                name="numRooms"
                value={formData.numRooms}
                onChange={handleChange}
                margin="dense"
                disabled={isDisabled}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                margin="dense"
                disabled={isDisabled}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={onClose} sx={{ mr: 2 }} size="small">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || isDisabled}
            size="small"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

AdminBookingUpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingData: PropTypes.shape({
    bookingId: PropTypes.string.isRequired,
    checkInDate: PropTypes.string,
    checkOutDate: PropTypes.string,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    price: PropTypes.number,
    bookingStatus: PropTypes.string,
    numRooms: PropTypes.number,
    guests: PropTypes.number,
    cancellationReason: PropTypes.string, // --- 3. Added to PropTypes ---
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AdminBookingUpdateModal;