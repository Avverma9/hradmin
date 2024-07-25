/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import { toast } from 'react-toastify';
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import {
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

export default function BookingsView() {
  const [bookingId, setBookingId] = useState('');
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const StyledButton = styled(Button)({
    marginRight: '10px',
  });
  useEffect(() => {
    fetchData();
  }, [status]);

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
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
      setBookings([]);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${localUrl}/get/all/filtered/booking/by/query?bookingStatus=${status}`
      );
      if (!response.ok) {
        toast.info('No bookings found !');
      }
      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.info('No bookings found !');
      setBookings([]);
    }
  };
  const handleView = (bookingId) => {
    // Implement view action here
    navigate(`/your-booking-details/${bookingId}`);

    // Example: navigate to view booking details page
  };

  const handleUpdate = (bookingId) => {
    // Implement update action here
    console.log('Update booking:', bookingId);
    // Example: navigate to update booking form
  };

  const handleRefresh = () => {
    window.location.reload();
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
        <Grid item md={4}>
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
        <Grid item md={2}>
          <StyledButton variant="contained" onClick={handleSearch}>
            Search
          </StyledButton>
        </Grid>
        <Grid item md={2}>
          <StyledButton variant="outlined" onClick={handleRefresh}>
            Refresh
          </StyledButton>
        </Grid>
        <Grid item md={4}>
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

      <Table sx={{ marginTop: '20px' }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Booking ID</TableCell>
            {/* <TableCell>Hotel</TableCell> */}
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
                {/* <TableCell>{booking.hotelName}</TableCell> */}
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
                    onClick={() => handleUpdate(booking._id)}
                  >
                    Update
                  </StyledButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No bookings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Container>
  );
}
