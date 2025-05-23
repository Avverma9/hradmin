import { toast } from "react-toastify";
import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Button,
  Container,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";

import { fDate } from "../../../../utils/format-time";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../../utils/loader";
import {
  fetchFilteredBookings,
  searchBooking,
} from "src/components/redux/reducers/booking";
import { getHotelsCity } from "src/components/redux/reducers/hotel";
import AdminBookingUpdateModal from "./admin-booking-update";

export default function BookingsView() {
  const [bookingId, setBookingId] = useState("");
  const [couponCode, setCouponCode] = useState("")
  const [status, setStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { byCity } = useSelector((state) => state.hotel);
  const [selectedCity, setSelectedCity] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);
  const search = useSelector((state) => state.booking.search);
  const { showLoader, hideLoader } = useLoader();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const bookings = search.length ? search : filtered;
  const bookingCount = bookings.length;
  useEffect(() => {
    dispatch({ type: "booking/clearSearch" });
  }, [dispatch]);


  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleView(params.row.bookingId)}
          >
            View
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => handleUpdate(params.row)}
            style={{ marginLeft: "10px" }}
          >
            Update
          </Button>
        </div>
      ),
    },
    { field: "bookingId", headerName: "Booking ID", width: 150 },
    { field: "user", headerName: "User", width: 100 },
    { field: "createdBy", headerName: "Created/Updated By", width: 250 },
    { field: "status", headerName: "Status", width: 110 },
    { field: "source", headerName: "Source", width: 130 },
    { field: "mop", headerName: "Payment Mode", width: 130 },
    { field: "checkInDate", headerName: "Check-In Date", width: 180 },
    { field: "checkOutDate", headerName: "Check-Out Date", width: 180 },
    { field: "createdAt", headerName: "Created At", width: 180 },
  ];

  const rows = bookings?.map((booking) => ({
    id: booking._id || booking.bookingId,
    bookingId: booking.bookingId,
    user: booking.user?.name,
    createdBy: booking.createdBy?.user + " (" + booking.createdBy?.email + ")",
    status: booking.bookingStatus,
    source: booking.bookingSource || "Site",
    mop: booking.pm || "Offline",
    checkInDate: fDate(booking.checkInDate),
    checkOutDate: fDate(booking.checkOutDate),
    createdAt: fDate(booking.createdAt),
    roomDetails: booking.roomDetails,
    foodDetails: booking.foodDetails,
    price: booking.price,
    numRooms: booking.numRooms,
    guests: booking.guests,
  }));

  useEffect(() => {
    fetchData();
  }, [status, filterDate, selectedCity]);

  useEffect(() => {
    dispatch(getHotelsCity());
  }, [dispatch]);

  const fetchData = async () => {
    showLoader();
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append("bookingStatus", status);
      if (filterDate) queryParams.append("date", filterDate);
      if (selectedCity) queryParams.append("hotelCity", selectedCity);

      await dispatch(fetchFilteredBookings(queryParams.toString()));
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load bookings");
    } finally {
      hideLoader();
    }
  };

  const handleSearch = async () => {
    showLoader();
    try {
      if (bookingId) {
        await dispatch(searchBooking({ bookingId }));
      } else if (couponCode) {
        await dispatch(searchBooking({ couponCode }));
      } else {
        toast.warn("Please enter a booking ID or coupon code");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Search failed");
    } finally {
      hideLoader();
    }
  };


  const handleView = (bookingId) =>
    navigate(`/your-booking-details/${bookingId}`);

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };

  const handleSave = async () => {
    setOpenModal(false);
    setSelectedBooking(null);
    fetchData();
  };

  const handleRefresh = () => window.location.reload();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Bookings ({bookingCount})
      </Typography>

      {/* Filter controls */}
      <Box >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Booking ID"
              variant="outlined"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Coupon Code"
              variant="outlined"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Filter by City"
              variant="outlined"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <MenuItem value="">All Cities</MenuItem>
              {byCity.map((city, index) => (
                <MenuItem key={index} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button variant="contained" onClick={handleSearch}>
                  Search
                </Button>
              </Grid>
              <Grid item md={2} xs={12}>
                <Button variant="outlined" onClick={handleRefresh}>
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <Paper sx={{ width: "100%", height: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={(model) => setPaginationModel(model)}
            pageSizeOptions={[25, 50, 100]}
            checkboxSelection
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "white", // or your theme
              },
            }}
          />
        </Paper>
      </Box>


      <Container maxWidth="auto" sx={{ marginTop: "40px" }}>
        {/* Booking Update Modal */}
        {selectedBooking && (
          <AdminBookingUpdateModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            bookingData={selectedBooking}
            onSave={handleSave}
          />
        )}
      </Container>
    </div>
  );
}
