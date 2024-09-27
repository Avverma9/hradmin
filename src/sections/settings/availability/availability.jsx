import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isBefore, isSameDay } from 'date-fns';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Grid,
  Table,
  Paper,
  Button,
  Dialog,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  InputBase,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import { localUrl } from 'src/utils/util';

const HotelAvailability = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchHotels = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both from date and to date.');
      return;
    }

    // Format dates to 'yyyy-MM-dd'
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    setLoading(true);

    try {
      const response = await axios.get(
        `${localUrl}/check/all-hotels/room-availability?fromDate=${from}&toDate=${to}`
      );
      setHotels(response.data);
    } catch (error) {
      console.error('Error fetching hotel data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = (hotel) => {
    setSelectedHotel(hotel);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHotel(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.hotelId.toString().includes(searchTerm)
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper style={{ padding: 20 }}>
        <Typography variant="h4" gutterBottom>
          Hotel Availability
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => {
                if (newValue && isBefore(newValue, new Date())) {
                  alert("You cannot select a past or current date.");
                  return;
                }
                setFromDate(newValue);
                if (toDate && isSameDay(newValue, toDate)) {
                  setToDate(null); // Reset toDate if same as fromDate
                }
              }}
              renderInput={(params) => <TextField {...params} />}
              minDate={new Date()} // Disable past dates
            />
          </div>
          <div style={{ flex: 1 }}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(newValue) => {
                if (newValue && fromDate && isSameDay(fromDate, newValue)) {
                  alert("Start date and end date cannot be the same.");
                  return;
                }
                setToDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
              minDate={fromDate || new Date()} // Disable dates before fromDate
            />
          </div>
          <Button variant="contained" color="primary" onClick={fetchHotels} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'View Availability'}
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <InputBase
            placeholder="Search by Hotel Name or ID"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px', flex: 1 }}
          />
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hotel Name</TableCell>
                <TableCell>Total Rooms</TableCell>
                <TableCell>Booked Rooms</TableCell>
                <TableCell>Available Rooms</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHotels.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((hotel) => (
                <TableRow key={hotel.hotelId}>
                  <TableCell>
                    <Link
                      to={`/view-hotel-details/${hotel.hotelId}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {hotel.hotelName}
                    </Link>
                  </TableCell>
                  <TableCell>{hotel.totalRooms}</TableCell>
                  <TableCell>{hotel.bookedRooms}</TableCell>
                  <TableCell>{hotel.availableRooms}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleViewMore(hotel)}
                    >
                      View More
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredHotels.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{selectedHotel?.hotelName}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">Total Rooms:</Typography>
                <Typography variant="body2">{selectedHotel?.totalRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Booked Rooms:</Typography>
                <Typography variant="body2">{selectedHotel?.bookedRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Available Rooms:</Typography>
                <Typography variant="body2">{selectedHotel?.availableRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Cancelled Booking:</Typography>
                <Typography variant="body2">{selectedHotel?.cancelledRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Checked In Booking:</Typography>
                <Typography variant="body2">{selectedHotel?.checkedInRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Checked Out Booking:</Typography>
                <Typography variant="body2">{selectedHotel?.checkedOutRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">No Show Booking:</Typography>
                <Typography variant="body2">{selectedHotel?.noShowRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Failed Booking:</Typography>
                <Typography variant="body2">{selectedHotel?.failedRooms}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Pending Booking:</Typography>
                <Typography variant="body2">{selectedHotel?.pendingRooms}</Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </LocalizationProvider>
  );
};

export default HotelAvailability;
