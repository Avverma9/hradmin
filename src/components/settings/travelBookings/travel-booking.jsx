import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Divider, Typography, TextField, Grid } from "@mui/material";
import { useLoader } from "../../../../utils/loader";
import { fetchTravelBookingsAdmin } from "src/components/redux/reducers/travel/booking";
import TravelBookingsTable from "src/components/travel-managment/bookings-table";

export default function TravelBookings() {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const { bookingsAdmin, loading, error } = useSelector(
    (state) => state.travelBooking
  );

  const [bookingIdSearch, setBookingIdSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      if (!bookingsAdmin || bookingsAdmin.length === 0) {
        showLoader();
        try {
          await dispatch(fetchTravelBookingsAdmin()).unwrap();
        } catch (err) {
          console.error("Failed to fetch bookings:", err);
        } finally {
          hideLoader();
        }
      }
    };

    loadBookings();
  }, [dispatch]);

  // Filter by booking ID and pickup/drop date range
  const filteredBookings = (bookingsAdmin || []).filter((booking) => {
    const matchesBookingId = booking.bookingId
      .toLowerCase()
      .includes(bookingIdSearch.toLowerCase());

    const pickupTime = new Date(booking.pickupD).getTime();
    const dropTime = new Date(booking.dropD).getTime();
    const fromTime = fromDate ? new Date(fromDate).getTime() : null;
    const toTime = toDate ? new Date(toDate).getTime() : null;

    const isWithinDateRange =
      (!fromTime || dropTime >= fromTime) && // drop must be after fromDate
      (!toTime || pickupTime <= toTime);     // pickup must be before toDate

    return matchesBookingId && isWithinDateRange;
  });

  return (
    <Box
      sx={{
        padding: "2rem",
        border: "2px dotted #ccc",
        borderRadius: "10px",
        backgroundColor: "#fafafa",
        boxShadow: 2,
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", mb: 1, color: "#333" }}
      >
        Travel Bookings (Admin View)
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search by Booking ID"
            value={bookingIdSearch}
            onChange={(e) => setBookingIdSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="From Date (Pickup/Drop)"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="To Date (Pickup/Drop)"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Grid>
      </Grid>

      {loading && <Typography>Loading...</Typography>}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      <TravelBookingsTable bookings={filteredBookings} />
    </Box>
  );
}
