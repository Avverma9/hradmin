import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function TravelBookingsTable({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
        No bookings found.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Booking ID</TableCell>
            <TableCell>Pickup Date</TableCell>
            <TableCell>Drop Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Destination</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.bookingId || booking._id}>
              <TableCell>{booking.bookingId}</TableCell>
              <TableCell>
                {booking.pickupD
                  ? new Date(booking.pickupD).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {booking.dropD
                  ? new Date(booking.dropD).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>{booking.status || "N/A"}</TableCell>
              <TableCell>{booking.source || "N/A"}</TableCell>
              <TableCell>{booking.destination || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
