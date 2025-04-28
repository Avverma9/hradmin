import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material";

const TravelBookingsTable = ({ bookings, onView, onUpdate }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Pagination logic
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const paginatedBookings =
    rowsPerPage > 0
      ? bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : bookings; // For "All" (when rowsPerPage is -1)

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 500,
          borderRadius: 2,
          boxShadow: 4,
          border: "1px solid #e0e0e0",
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{ minWidth: 700, borderCollapse: "collapse" }}
        >
          <TableHead>
            <TableRow>
              {["Booking ID", "Booked By", "Mobile", "Seat No.", "Actions"].map(
                (head) => (
                  <TableCell
                    key={head}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f0f0f0",
                      color: "#000",
                      border: "1px solid #ddd",
                    }}
                  >
                    {head}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBookings.map((booking, index) => (
              <TableRow
                key={booking._id}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                  transition: "background-color 0.3s",
                }}
              >
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                  {booking.bookingId}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                  {booking.bookedBy}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                  {booking.customerMobile}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                  {booking.seatNumber}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => onView(booking)}
                    sx={{
                      mr: 1,
                      minWidth: 64,
                      borderRadius: 3,
                      textTransform: "none",
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onUpdate(booking)}
                    sx={{
                      minWidth: 64,
                      borderRadius: 3,
                      textTransform: "none",
                    }}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ border: "1px solid #ddd" }}
                >
                  <Typography variant="body2" sx={{ py: 2 }}>
                    No bookings found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={bookings.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100, { label: "All", value: -1 }]}
        labelRowsPerPage="Rows per page"
      />
    </>
  );
};

export default TravelBookingsTable;
