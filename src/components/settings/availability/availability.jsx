import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isSameDay } from "date-fns";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Grid,
  Table,
  Paper,
  Button,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  InputBase,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

import { localUrl } from "../../../../utils/util";
import BookedRoomData from "./booked-room-data";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsCity } from "src/components/redux/reducers/hotel";

const HotelAvailability = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const dispatch = useDispatch();
  const { byCity } = useSelector((state) => state.hotel);
  useEffect(() => {
    dispatch(getHotelsCity());
  }, [dispatch]);

  const fetchHotels = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both from date and to date.");
      return;
    }

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const from = formatDate(fromDate);
    const to = formatDate(toDate);
    setLoading(true);
    try {
      const response = await axios.get(
        `${localUrl}/check/all-hotels/room-availability?fromDate=${from}&toDate=${to}&city=${selectedCity}`,
      );
      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotel data", error);
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
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredHotels = hotels
  .filter(
    (hotel) =>
      hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.hotelId.toString().includes(searchTerm)
  )
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
console.log("filteredHotels", filteredHotels);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper style={{ padding: 20 }}>
        <Typography variant="h5" gutterBottom>
          Hotel Availability
        </Typography>

        <Typography variant="body1" gutterBottom>
          Please select a start date and an end date.
          <br />
          After selecting your dates, click on "View Availability" to see the
          list of hotels.
          <br />
          To view more details about a specific hotel, click on the hotel name.
          <br />
          You can also click "View More" to see booked rooms and booking status.
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2}>
            <FormControl fullWidth>
              <InputLabel>Hotel City</InputLabel>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                label="Hotel City"
              >
                <MenuItem value="">All Cities</MenuItem>
                {byCity.map((city, index) => (
                  <MenuItem key={index} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={2}>
            <InputBase
              placeholder="Search by Hotel Name or ID"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => {
                setFromDate(newValue);
                if (toDate && isSameDay(newValue, toDate)) {
                  setToDate(null);
                }
              }}
              renderInput={(params) => <TextField {...params} />}
              minDate={new Date()}
            />
          </Grid>

          <Grid item xs={3}>
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
              minDate={fromDate || new Date()}
            />
          </Grid>

          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchHotels}
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Check"
              )}
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
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
              {filteredHotels.map((hotel) => (
                <TableRow key={hotel.hotelId}>
                  <TableCell>
                    <Link
                      to={`/view-hotel-details/${hotel.hotelId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {hotel.hotelName} ({hotel.city})
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
          count={hotels.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <BookedRoomData
          openDialog={openDialog}
          onClose={handleCloseDialog}
          selectedHotel={selectedHotel}
        />
      </Paper>
    </LocalizationProvider>
  );
};

export default HotelAvailability;
