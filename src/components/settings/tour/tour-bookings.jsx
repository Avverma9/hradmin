import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Collapse,
  Grid2,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  Visibility,
  FilterList,
  Close,
  CalendarToday,
  Person,
  ConfirmationNumber,
  CheckCircle,
  Cancel,
  Phone,
  Email,
  Map,
  Edit,
  ChevronRight,
  ExpandMore,
} from "@mui/icons-material";
import { getAllBookings, updateBooking } from "../../redux/reducers/tour/tour"; 
import { toast } from "react-toastify";

/* ================= STYLED COMPONENTS ================= */

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  minHeight: "100vh",
  backgroundColor: theme.palette.grey[50],
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "white",
    borderRadius: 8,
    transition: "all 0.2s",
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusConfig = {
    confirmed: {
      color: theme.palette.success.dark,
      bgcolor: alpha(theme.palette.success.main, 0.1),
      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
    },
    pending: {
      color: theme.palette.warning.dark,
      bgcolor: alpha(theme.palette.warning.main, 0.1),
      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
    },
    cancelled: {
      color: theme.palette.error.dark,
      bgcolor: alpha(theme.palette.error.main, 0.1),
      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return {
    ...config,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 24,
    borderRadius: 6,
  };
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "& td": {
    borderColor: theme.palette.divider,
    padding: "12px 16px",
  },
  "&:last-child td": {
    borderBottom: 0,
  },
}));

/* ================= HELPERS ================= */
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/* ================= EDIT MODAL ================= */
const EditBookingModal = ({ open, onClose, booking }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(booking?.status || "pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  const handleUpdate = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      // API call with specific structure: bookingId, toBeUpdated object
      await dispatch(
        updateBooking({
          bookingId: booking._id,
          toBeUpdated: { status: status },
        })
      ).unwrap();

      toast.success("Booking status updated successfully!");
      dispatch(getAllBookings()); // Refresh table
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error?.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Update Booking Status</DialogTitle>
      <DialogContent>
        <Box pt={1}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Change status for Booking #{booking?.bookingCode}
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ================= DETAILS MODAL ================= */
const BookingDetailsModal = ({ open, onClose, booking }) => {
  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ConfirmationNumber color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Booking Details #{booking.bookingCode}
          </Typography>
        </Stack>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }}>
          {/* Left Sidebar: Key Info */}
          <Box
            sx={{
              width: { xs: "100%", md: 280 },
              bgcolor: "grey.50",
              p: 3,
              borderRight: "1px solid #eee",
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Status
                </Typography>
                <Box mt={1}>
                  <StatusChip label={booking.status} status={booking.status} />
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Total Amount
                </Typography>
                <Typography
                  variant="h5"
                  color="primary.main"
                  fontWeight={800}
                  mt={0.5}
                >
                  {formatCurrency(booking.totalAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Base: {formatCurrency(booking.basePrice)}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Agency Contact
                </Typography>
                <Stack spacing={1} mt={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {booking.travelAgencyName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Phone fontSize="inherit" color="action" />
                    <Typography variant="body2">
                      {booking.agencyPhone}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Email fontSize="inherit" color="action" />
                    <Typography
                      variant="body2"
                      noWrap
                      title={booking.agencyEmail}
                    >
                      {booking.agencyEmail}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Right Content: Details */}
          <Box flex={1} p={3}>
            <Stack spacing={3}>
              {/* Trip Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  <Map
                    sx={{
                      fontSize: 18,
                      verticalAlign: "text-bottom",
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                  Trip Information
                </Typography>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Origin
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.city}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Destination
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.state}, {booking.country}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Dates
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(booking.tourStartDate || booking.from)}
                        {" — "}
                        {formatDate(booking.to)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Itinerary:</strong> {booking.visitngPlaces}
                  </Typography>
                </Card>
              </Box>

              {/* Passengers */}
              <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  <Person
                    sx={{
                      fontSize: 18,
                      verticalAlign: "text-bottom",
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                  Passengers & Seats
                </Typography>
                <TableContainer
                  component={Card}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "grey.100" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, textAlign: "right" }}
                        >
                          Seat
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {booking.passengers?.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.fullName}</TableCell>
                          <TableCell sx={{ textTransform: "capitalize" }}>
                            {p.gender}
                          </TableCell>
                          <TableCell sx={{ textTransform: "capitalize" }}>
                            {p.type}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={booking.seats?.[i] || "N/A"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/* ================= MAIN COMPONENT ================= */

export default function TourBookings() {
  const dispatch = useDispatch();
  const theme = useTheme();

  // Redux State
  const { allBookings, loading } = useSelector((state) => state.tour);

  // Local State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);

  // Fetch Data
  useEffect(() => {
    dispatch(getAllBookings());
  }, [dispatch]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    if (!Array.isArray(allBookings)) return [];

    let data = allBookings;

    // 1. Status Filter
    if (statusFilter !== "all") {
      data = data.filter((b) => b.status?.toLowerCase() === statusFilter);
    }

    // 2. Search Filter
    if (search) {
      const query = search.toLowerCase();
      data = data.filter(
        (b) =>
          b.bookingCode?.toLowerCase().includes(query) ||
          b.travelAgencyName?.toLowerCase().includes(query) ||
          b.passengers?.some((p) =>
            p.fullName?.toLowerCase().includes(query)
          )
      );
    }

    return data;
  }, [allBookings, search, statusFilter]);

  // Pagination Handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData, page, rowsPerPage]);

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <StyledContainer maxWidth="xl">
      <Stack spacing={3}>
        {/* Header & Title */}
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all tour reservations
          </Typography>
        </Box>

        {/* Controls Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Filters */}
          <Stack direction="row" spacing={1}>
            {["All", "Pending", "Confirmed", "Cancelled"].map((status) => (
              <Button
                key={status}
                variant={
                  statusFilter === status.toLowerCase() ? "contained" : "text"
                }
                onClick={() => setStatusFilter(status.toLowerCase())}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  color:
                    statusFilter === status.toLowerCase()
                      ? "white"
                      : "text.secondary",
                }}
              >
                {status}
              </Button>
            ))}
          </Stack>

          {/* Search */}
          <SearchField
            size="small"
            placeholder="Search booking ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", md: 300 } }}
          />
        </Paper>

        {/* Data Table */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-label="simple table">
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Booking ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Customer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Agency
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                    align="right"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <React.Fragment key={row._id}>
                      <StyledTableRow selected={expandedRow === row._id}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleRowClick(row._id)}
                          >
                            {expandedRow === row._id ? (
                              <ExpandMore />
                            ) : (
                              <ChevronRight />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            fontFamily="monospace"
                          >
                            #{row.bookingCode?.slice(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 14,
                                bgcolor: "primary.main",
                              }}
                            >
                              {row.passengers?.[0]?.fullName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {row.passengers?.[0]?.fullName}
                              </Typography>
                              {row.passengers?.length > 1 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  +{row.passengers.length - 1} others
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.travelAgencyName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <CalendarToday fontSize="inherit" color="action" />
                            <Typography variant="body2">
                              {formatDate(row.tourStartDate || row.from)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color="primary"
                          >
                            {formatCurrency(row.totalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip label={row.status} status={row.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end">
                            {/* EDIT BUTTON */}
                            <IconButton
                              size="small"
                              onClick={() => setEditBooking(row)}
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "primary.main" },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            {/* VIEW BUTTON */}
                            <IconButton
                              size="small"
                              onClick={() => setSelectedBooking(row)}
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "info.main" },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </StyledTableRow>

                      {/* Expandable Row Content */}
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={8}
                        >
                          <Collapse
                            in={expandedRow === row._id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                p: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                              }}
                            >
                              <Grid2 container spacing={3}>
                                <Grid2 item xs={12} md={6}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    gutterBottom
                                  >
                                    Passenger Manifest
                                  </Typography>
                                  <Paper
                                    variant="outlined"
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Name</TableCell>
                                          <TableCell>Gender</TableCell>
                                          <TableCell>Type</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {row.passengers?.map((p, i) => (
                                          <TableRow key={i}>
                                            <TableCell>{p.fullName}</TableCell>
                                            <TableCell>{p.gender}</TableCell>
                                            <TableCell>{p.type}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Paper>
                                </Grid2>
                                <Grid2 item xs={12} md={6}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    gutterBottom
                                  >
                                    Quick Actions
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Edit />}
                                    onClick={() => setEditBooking(row)}
                                  >
                                    Update Status
                                  </Button>
                                </Grid2>
                              </Grid2>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                      >
                        <Search
                          sx={{ fontSize: 48, color: "text.disabled" }}
                        />
                        <Typography color="text.secondary">
                          No bookings found matching your filters
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
          />
        </Card>
      </Stack>

      <BookingDetailsModal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
      />

      <EditBookingModal
        open={!!editBooking}
        onClose={() => setEditBooking(null)}
        booking={editBooking}
      />
    </StyledContainer>
  );
}