import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTravelBookings } from "../redux/reducers/travel/booking";
import TravelBookingsTable from "./bookings-table";
import { Box, Divider, Typography } from "@mui/material";

export default function MyTravelBookingTMS() {
  const dispatch = useDispatch();
  const { travelBookings, loading, error } = useSelector(
    (state) => state.travelBooking
  );

  useEffect(() => {
    dispatch(fetchTravelBookings());
  }, [dispatch]);

  const handleViewBookings = (booking) => {
    console.log("Viewing booking:", booking);
  };

  const handleUpdateBookings = (booking) => {
    console.log("Update modal open for:", booking);
  };

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
        My Travel Bookings
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading && <Typography>Loading...</Typography>}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}


      <TravelBookingsTable
        bookings={travelBookings}
        onView={handleViewBookings}
        onUpdate={handleUpdateBookings}
      />
    </Box>
  );
}
