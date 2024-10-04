/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Box, Grid, Modal, Button, MenuItem, TextField, Typography } from '@mui/material';

import { localUrl } from '../../../utils/util';
import { useDispatch, useSelector } from 'react-redux';
import { updateBooking } from 'src/redux/reducers/booking';
import { toast } from 'react-toastify';

// Styles for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh', // Set max height to 80% of viewport height
  overflowY: 'auto', // Enable vertical scrolling if content overflows
};

const BookingUpdateModal = ({ open, onClose, bookingData, onSave }) => {
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    price: '',
    checkInTime: null,
    checkOutTime: null,
    bookingStatus: '',
    numRooms: '',
    guests: '',
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const updated = useSelector((state) => state.booking.updated);

  // Update form data when bookingData changes
  useEffect(() => {
    if (bookingData) {
      setFormData({
        checkInDate: bookingData.checkInDate || '',
        checkOutDate: bookingData.checkOutDate || '',
        checkInTime: bookingData.checkInTime ? new Date(bookingData.checkInTime) : null,
        checkOutTime: bookingData.checkOutTime ? new Date(bookingData.checkOutTime) : null,
        price: bookingData.price || '',
        bookingStatus: bookingData.bookingStatus || '',
        numRooms: bookingData.numRooms || '',
        guests: bookingData.guests || '',
      });
    }
  }, [bookingData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle time changes
  const handleTimeChange = (name) => (time) => {
    setFormData((prevData) => ({ ...prevData, [name]: time }));
  };
  console.log('selected bboking', bookingData.bookingId);

  // Handle form submission
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await dispatch(
        updateBooking({
          bookingId: bookingData.bookingId, // Wrap bookingId in an object
          updatedData: {
            ...formData,
            checkInTime: formData.checkInTime?.toISOString(),
            checkOutTime: formData.checkOutTime?.toISOString(),
          },
        })
      );

      if (response.error) {
        throw new Error('Failed to update booking');
      }

      onSave(updated); // Call the onSave callback with the updated booking data
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Update Booking
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {/* First Row */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-in Date"
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-out Date"
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>

            {/* Second Row */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Check-in Time"
                value={formData.checkInTime}
                onChange={handleTimeChange('checkInTime')}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Check-out Time"
                value={formData.checkOutTime}
                onChange={handleTimeChange('checkOutTime')}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </Grid>

            {/* Third Row */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Booking Status"
                name="bookingStatus"
                value={formData.bookingStatus}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="No-show">No Show</MenuItem>
                <MenuItem value="Checked-in">Checked in</MenuItem>
                <MenuItem value="Checked-out">Checked out</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Fourth Row */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Rooms"
                type="number"
                name="numRooms"
                value={formData.numRooms}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Define prop types
BookingUpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingData: PropTypes.shape({
    bookingId: PropTypes.string.isRequired,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    price: PropTypes.number.isRequired,
    bookingStatus: PropTypes.string.isRequired,
    numRooms: PropTypes.number.isRequired,
    guests: PropTypes.number.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default BookingUpdateModal;
