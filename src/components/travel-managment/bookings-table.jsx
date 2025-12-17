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
  Card,
  CardContent,
  CardActions,
  Stack,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import BookingDetails from "./bookings-view";
import { fDate } from "../../../utils/format-time";
import UpdateBookingModal from "./update-booking";
import { useDispatch } from "react-redux";
import { updateTravelBooking } from "../redux/reducers/travel/booking";

const TravelBookingsTable = ({ bookings }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 10 : 25);
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
    <Box sx={{ width: "100%" }}>
      {!isMobile ? (
        // Desktop View
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: 3,
            border: "1px solid",
            borderColor: "divider",
            overflowX: "auto",
          }}
        >
          <Table
            size="small"
            stickyHeader
            sx={{ minWidth: 700 }}
          >
            <TableHead>
              <TableRow>
                {["Booking ID", "Booked By", "Mobile", "Booking Date", "Actions"].map(
                  (head) => (
                    <TableCell
                      key={head}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "grey.100",
                        borderBottom: 2,
                        borderColor: "divider",
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
                    "&:nth-of-type(odd)": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell align="center">{booking.bookingId}</TableCell>
                  <TableCell align="center">{booking.bookedBy}</TableCell>
                  <TableCell align="center">{booking.customerMobile}</TableCell>
                  <TableCell align="center">{fDate(booking.bookingDate)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleView(booking)}
                        sx={{ textTransform: "none", minWidth: 70 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleUpdateClick(booking)}
                        sx={{ textTransform: "none", minWidth: 70 }}
                      >
                        Update
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" sx={{ py: 3 }}>
                      No bookings found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Mobile View - Card Layout
        <Stack spacing={isSmallMobile ? 1.5 : 2}>
          {paginatedBookings.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No bookings found.
              </Typography>
            </Paper>
          ) : (
            paginatedBookings.map((booking) => (
              <Card
                key={booking._id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.3s",
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Booking ID Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant={isSmallMobile ? "subtitle2" : "subtitle1"}
                      fontWeight={700}
                      color="primary"
                    >
                      {booking.bookingId}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 1.5 }} />
                  
                  {/* Booking Details in Grid */}
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.25 }}
                      >
                        Booked By
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontSize: isSmallMobile ? "0.875rem" : "0.9375rem" }}
                      >
                        {booking.bookedBy}
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.25 }}
                        >
                          Mobile
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: isSmallMobile ? "0.875rem" : "0.9375rem" }}
                        >
                          {booking.customerMobile}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.25 }}
                        >
                          Booking Date
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: isSmallMobile ? "0.875rem" : "0.9375rem" }}
                        >
                          {fDate(booking.bookingDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
                
                {/* Action Buttons */}
                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 1,
                    gap: 1.5,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    size={isSmallMobile ? "small" : "medium"}
                    onClick={() => handleView(booking)}
                    fullWidth
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      minHeight: 40,
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size={isSmallMobile ? "small" : "medium"}
                    onClick={() => handleUpdateClick(booking)}
                    fullWidth
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      minHeight: 40,
                    }}
                  >
                    Update
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>
      )}

      {/* Pagination - Responsive */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TablePagination
          component="div"
          count={bookings.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={
            isMobile
              ? [10, 25, 50]
              : [10, 25, 50, { label: "All", value: -1 }]
          }
          labelRowsPerPage={isSmallMobile ? "Rows" : "Rows per page"}
          sx={{
            ".MuiTablePagination-selectLabel": {
              fontSize: isSmallMobile ? "0.75rem" : "0.875rem",
            },
            ".MuiTablePagination-displayedRows": {
              fontSize: isSmallMobile ? "0.75rem" : "0.875rem",
            },
            ".MuiTablePagination-select": {
              fontSize: isSmallMobile ? "0.75rem" : "0.875rem",
            },
          }}
        />
      </Paper>

      {/* Booking Details Dialog */}
      <Dialog
        open={!!selectedBooking && !updateModalOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
          },
        }}
      >
        {selectedBooking && !updateModalOpen && (
          <BookingDetails booking={selectedBooking} onClose={handleCloseDialog} />
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
    </Box>
  );
};

export default TravelBookingsTable;
