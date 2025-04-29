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
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import BookingDetails from "./bookings-view";
import { fDate } from "../../../utils/format-time";
import UpdateBookingModal from "./update-booking";
import { useDispatch } from "react-redux";
import { updateTravelBooking } from "../redux/reducers/travel/booking";

const TravelBookingsTable = ({ bookings }) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDialog = () => {
    setSelectedBooking(null);
  };

  const handleUpdateClick = (booking) => {
    setSelectedBooking(booking);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateBooking = async (updatedData) => {
    await dispatch(updateTravelBooking({ id: updatedData._id, data: updatedData }));
  };

  const paginatedBookings =
    rowsPerPage > 0
      ? bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : bookings;

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
              {["Booking ID", "Booked By", "Mobile", "Booking Date", "Actions"].map(
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
                  {fDate(booking.bookingDate)}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleView(booking)}
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
                    onClick={() => handleUpdateClick(booking)}
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

      {/* Booking Details Dialog */}
      <Dialog
        open={!!selectedBooking && !updateModalOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && !updateModalOpen && (
          <BookingDetails
            booking={selectedBooking}
            onClose={handleCloseDialog}
          />
        )}
      </Dialog>

      {/* Update Booking Modal */}
      {selectedBooking && updateModalOpen && (
        <UpdateBookingModal
          booking={selectedBooking}
          onUpdate={handleUpdateBooking}
          onClose={handleCloseUpdateModal}
        />
      )}
    </>
  );
};

export default TravelBookingsTable;
