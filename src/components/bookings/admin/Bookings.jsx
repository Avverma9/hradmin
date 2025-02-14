import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Grid,
  Table,
  Button,
  Select,
  styled,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { fDate } from '../../../../utils/format-time';
import BookingUpdateModal from '../booking-update-modal'; // Adjust path as needed
import { useDispatch, useSelector } from 'react-redux';
import { useLoader } from '../../../../utils/loader';
import { fetchFilteredBookings, searchBooking } from 'src/components/redux/reducers/booking';

export default function BookingsView() {
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [bookingCount, setBookingCount] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [filterColumn, setFilterColumn] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);
  const search = useSelector((state) => state.booking.search);
  const { showLoader, hideLoader } = useLoader();
  const StyledButton = styled(Button)({
    marginRight: '10px',
  });

  useEffect(() => {
    fetchData();
  }, [status, filterDate]);

  useEffect(() => {
    setBookings(filtered);
    setBookingCount(filtered.length);
  }, [filtered]);

  useEffect(() => {
    setBookings(search);
    setBookingCount(search.length);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    showLoader();
    try {
      const queryParams = new URLSearchParams();
      if (status) {
        queryParams.append('bookingStatus', status);
      }
      if (filterDate) {
        queryParams.append('date', filterDate);
      }
      await dispatch(fetchFilteredBookings(queryParams.toString()));
    } catch (error) {
      console.error('Error:', error);
      setBookings([]);
      setBookingCount(0);
    } finally {
      hideLoader();
    }
  };

  const handleSearch = async () => {
    showLoader();
    try {
      await dispatch(searchBooking(bookingId));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
      setBookings([]);
      setBookingCount(0);
    } finally {
      hideLoader();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleView = (bookingId) => {
    navigate(`/your-booking-details/${bookingId}`);
  };

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };

  const handleSave = async (updatedData) => {
    showLoader();
    try {
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setOpenModal(false);
      setSelectedBooking(null);
      hideLoader();
    }
  };

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const handleFilterModalOpen = (column) => {
    setFilterColumn(column);
    setFilterModalOpen(true);
  };

  const handleFilterApply = () => {
    if (filterColumn && filterValue) {
      // Apply the filter on the bookings based on the selected column and value
      const filteredBookings = bookings.filter((booking) => {
        if (filterColumn === 'bookingId') {
          return booking.bookingId.includes(filterValue);
        }
        if (filterColumn === 'user.name') {
          return booking.user?.name.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (filterColumn === 'bookingStatus') {
          return booking.bookingStatus.toLowerCase().includes(filterValue.toLowerCase());
        }
        
        return true;
      });
      setBookings(filteredBookings);
      setBookingCount(filteredBookings.length);
    }
    setFilterModalOpen(false);
  };

  return (
    <Container maxWidth="auto" sx={{ marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>
        Bookings ({bookingCount})
      </Typography>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          background: 'transparent',
          zIndex: 1,
          padding: '16px 0',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Booking ID Input Field */}
          <Grid item xs={12} md={3}>
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

          {/* Filters and Actions */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <StyledButton variant="contained" onClick={handleSearch}>
                  Search
                </StyledButton>
              </Grid>

              <Grid item md={2} xs={12}>
                <StyledButton variant="outlined" onClick={handleRefresh}>
                  Refresh
                </StyledButton>
              </Grid>
              <Grid item>
                <TextField
                  id="filterDate"
                  label="In/Out or Created on"
                  type="date"
                  variant="outlined"
                  value={filterDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs>
                <FormControl fullWidth>
                  <InputLabel id="formStatusLabel">Status</InputLabel>
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
                    <MenuItem value="No-show">No-Show</MenuItem>
                    <MenuItem value="Checked-in">Checked-in</MenuItem>
                    <MenuItem value="Checked-out">Checked-out</MenuItem>
                    <MenuItem value="Created">Created-on</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Scrollable Table */}
      <Box sx={{ marginTop: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                { label: 'Booking ID', field: 'bookingId' },
                { label: 'Name', field: 'user.name' },
                { label: 'Status', field: 'bookingStatus' },
                { label: 'Check-in', field: 'checkInDate' },
                { label: 'Check-out', field: 'checkOutDate' },
                { label: 'Created on', field: 'createdAt' },
              ].map(({ label, field }) => (
                <TableCell
                  key={field}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    background: '#f8f9fa',
                    zIndex: 1,
                  }}
                >
                  {label}
                  <Button size="small" onClick={() => handleFilterModalOpen(field)}>
                    Filter
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings?.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.bookingId}</TableCell>
                  <TableCell>{booking.user?.name}</TableCell>
                  <TableCell>{booking.bookingStatus}</TableCell>
                  <TableCell>{fDate(booking.checkInDate)}</TableCell>
                  <TableCell>{fDate(booking.checkOutDate)}</TableCell>
                  <TableCell>{fDate(booking.createdAt)}</TableCell>

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

      {/* Filter Modal */}
      <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)}>
        <DialogTitle>Apply Filter</DialogTitle>
        <DialogContent>
          <TextField
            label="Filter Value"
            fullWidth
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleFilterApply} color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
