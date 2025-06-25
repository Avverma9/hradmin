import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Grid,
  Paper,
  Button,
  Table,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  TablePagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Box,
  Skeleton,
  Chip,
  Link,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import EventSeatIcon from '@mui/icons-material/EventSeat';

import { getHotelsCity } from "src/components/redux/reducers/hotel";
import BookedRoomData from "./booked-room-data";
import { localUrl } from "../../../../utils/util";

const HotelAvailability = () => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);

  const dispatch = useDispatch();
  const { byCity } = useSelector((state) => state.hotel);

  useEffect(() => {
    dispatch(getHotelsCity());
  }, [dispatch]);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchHotels = async () => {
    if (!fromDate || !toDate) {
      // Using toast is better than alert, but for now, we remove the alert
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setPage(0); // Reset page on new search
    try {
      const from = formatDate(fromDate);
      const to = formatDate(toDate);
      const response = await axios.get(
        `${localUrl}/check/all-hotels/room-availability?fromDate=${from}&toDate=${to}&city=${selectedCity}`
      );
      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotel data", error);
      setHotels([]); // Clear previous results on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = (hotel) => {
    setSelectedHotel(hotel);
    setOpenDialog(true);
  };
  
  const filteredHotels = useMemo(() =>
    hotels.filter(
      (hotel) =>
        hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.hotelId.toString().includes(searchTerm)
    ), [hotels, searchTerm]);

  const paginatedHotels = filteredHotels.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getAvailabilityChip = (available, booked) => {
    if (available > 0) {
      return <Chip label={available} color="success" size="small" />;
    }
    return <Chip label={booked > 0 ? "Full" : "0"} color="error" size="small" variant="outlined"/>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Hotel Room Availability
        </Typography>
        
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardHeader title="Search Filters" />
          <Divider />
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>City</InputLabel>
                  <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} label="City">
                    <MenuItem value="">All Cities</MenuItem>
                    {byCity.map((city, index) => (<MenuItem key={index} value={city}>{city}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search by Hotel Name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)}}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  minDate={new Date()}
                  onChange={(newValue) => setFromDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  minDate={fromDate}
                  onChange={(newValue) => setToDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={2}>
                <Button variant="contained" color="primary" onClick={fetchHotels} disabled={loading} fullWidth sx={{ height: '56px' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Check"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Hotel Name</TableCell>
                  <TableCell align="center">Total Rooms</TableCell>
                  <TableCell align="center">Booked</TableCell>
                  <TableCell align="center">Blocked</TableCell>
                  <TableCell align="center">Available</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton variant="rectangular" height={36} /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedHotels.length > 0 ? (
                  paginatedHotels.map((hotel) => (
                    <TableRow key={hotel.hotelId} hover>
                      <TableCell>
                        <Link component={RouterLink} to={`/view-hotel-details/${hotel.hotelId}`} sx={{ fontWeight: '500' }}>
                          {hotel.hotelName}
                        </Link>
                        <Typography variant="caption" display="block">{hotel.city}</Typography>
                      </TableCell>
                      <TableCell align="center">{hotel.totalRooms || hotel.initialAvailableRooms}</TableCell>
                      <TableCell align="center"><Chip label={hotel?.bookingSummary?.Confirmed || 0} color="error" size="small" /></TableCell>
                      <TableCell align="center">{hotel?.bookedFromOthers || 0}</TableCell>
                      <TableCell align="center">{getAvailabilityChip(hotel?.actualAvailableRooms, hotel?.bookingSummary?.Confirmed)}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" onClick={() => handleViewMore(hotel)}>View More</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, color: 'text.secondary' }}>
                        <EventSeatIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="h6">
                          {hasSearched ? "No Hotels Found" : "Check for Availability"}
                        </Typography>
                        <Typography>
                          {hasSearched ? "No hotels match the selected criteria." : "Please select your dates and click 'Check'."}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredHotels.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {selectedHotel && <BookedRoomData openDialog={openDialog} onClose={() => setOpenDialog(false)} selectedHotel={selectedHotel} />}
      </Box>
    </LocalizationProvider>
  );
};

export default HotelAvailability;