import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import {
  Box,
  Grid,
  Table,
  Button,
  Select,
  TableRow,
  MenuItem,
  TableCell,
  TableHead,
  TableBody,
  Container,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';
import { fDate } from 'src/utils/format-time';

import BookingUpdateModal from '../booking-update-modal'; // Adjust path as needed

export default function SuperAdminBookingsView() {
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const hotelEmail = localStorage.getItem('user_email');
  const StyledButton = styled(Button)({
    marginRight: '10px',
  });

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${localUrl}/get/all/filtered/booking/by/query?bookingStatus=${status}&hotelEmail=${hotelEmail}`
      );
      if (!response.ok) {
        toast.info('No bookings found !');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${localUrl}/get/all/filtered/booking/by/query?bookingId=${bookingId}`
      );
      if (!response.ok) {
        toast.info('No bookings found');
        setBookings([]);
        return;
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
      setBookings([]);
    }
  };

  const handleView = (bookingId) => {
    navigate(`/your-booking-details/${bookingId}`);
  };

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch(`${localUrl}/updatebooking/${selectedBooking.bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      toast.success('Booking updated successfully');
      fetchData(); // Refresh the bookings list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update booking');
    } finally {
      setOpenModal(false);
      setSelectedBooking(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>
        Bookings
      </Typography>

      <Grid container spacing={3} alignItems="center">
        <Grid item md={4} xs={12}>
          <FormControl fullWidth>
            <TextField
              id="formBookingId"
              label="Booking ID"
              variant="outlined"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </FormControl>
        </Grid>
        <Grid item md={2} xs={12}>
          <StyledButton variant="contained" onClick={handleSearch}>
            Search
          </StyledButton>
        </Grid>
        <Grid item md={2} xs={12}>
          <StyledButton variant="outlined" onClick={handleRefresh}>
            Refresh
          </StyledButton>
        </Grid>
        <Grid item md={4} xs={12}>
          <FormControl fullWidth>
            <InputLabel id="formStatusLabel">Filter by Status</InputLabel>
            <Select
              labelId="formStatusLabel"
              id="formStatus"
              value={status}
              label="Filter by Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Checked-in">Checked-in</MenuItem>
              <MenuItem value="Checked-out">Checked-out</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ marginTop: '20px', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.bookingId}</TableCell>
                  <TableCell>{booking.user?.name}</TableCell>
                  <TableCell>{booking.bookingStatus}</TableCell>
                  <TableCell>{fDate(booking.checkInDate)}</TableCell>
                  <TableCell>{fDate(booking.checkOutDate)}</TableCell>
                  <TableCell>
                    <StyledButton
                      variant="contained"
                      size="small"
                      onClick={() => handleView(booking.bookingId)}
                    >
                      View
                    </StyledButton>
                    <StyledButton
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => handleUpdate(booking)}
                    >
                      Update
                    </StyledButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {selectedBooking && (
        <BookingUpdateModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          bookingData={selectedBooking}
          onSave={handleSave}
        />
      )}
    </Container>
  );
}
