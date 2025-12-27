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
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Corrected Material UI Icon Imports
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
  LocationOn, // Replaces FaMapMarkerAlt
  Edit,
  ChevronRight,
  ExpandMore,
  DirectionsBus, // Replaces FaBus
  Route as RouteIcon, // Replaces FaRoute
  Download as DownloadIcon, // Replaces FaDownload
} from "@mui/icons-material";

import { toast } from "react-toastify";
import { getAllBookings, updateBooking } from "../../components/redux/reducers/tour/tour"; 

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
    "& fieldset": { borderColor: theme.palette.divider },
    "&:hover fieldset": { borderColor: theme.palette.primary.main },
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
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
  "& td": { borderColor: theme.palette.divider, padding: "12px 16px" },
  "&:last-child td": { borderBottom: 0 },
}));

/* ================= HELPERS ================= */
const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

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
      await dispatch(updateBooking({ bookingId: booking._id, toBeUpdated: { status } })).unwrap();
      toast.success("Booking updated successfully!");
      dispatch(getAllBookings());
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Update Status</DialogTitle>
      <DialogContent>
        <Box pt={1}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Update status for Booking <strong>#{booking?.bookingCode}</strong>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Booking Status</InputLabel>
            <Select value={status} label="Booking Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleUpdate} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ================= TICKET MODAL ================= */
const TicketModal = ({ open, onClose, booking }) => {
  const theme = useTheme();
  if (!booking) return null;

  const travelDate = booking.from || booking.tourStartDate;
  let endDateCalc = booking.to;
  if (!endDateCalc && travelDate && booking.days) {
    const start = new Date(travelDate);
    start.setDate(start.getDate() + booking.days);
    endDateCalc = start.toISOString();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box sx={{ height: 8, background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)' }} />
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <RouteIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Booking Details</Typography>
        </Stack>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }}>
          <Box sx={{ width: { xs: "100%", md: 280 }, bgcolor: "grey.50", p: 3, borderRight: `1px solid ${theme.palette.divider}` }}>
             <Stack spacing={3}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Status</Typography>
                    <Box mt={1}><StatusChip label={booking.status} status={booking.status} /></Box>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Agency</Typography>
                    <Typography variant="subtitle2" fontWeight={600} mt={1}>{booking.travelAgencyName}</Typography>
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}><Phone fontSize="inherit" /> {booking.agencyPhone}</Typography>
                </Box>
             </Stack>
          </Box>
          <Box flex={1} p={3}>
             <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Stack direction="row" justifyContent="space-between" textAlign="center">
                    <Box>
                        <Typography variant="caption" fontWeight={700}>START</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{formatDate(travelDate)}</Typography>
                        <Typography variant="caption" color="text.secondary">{booking.city}</Typography>
                    </Box>
                    <Box flex={1} px={2}><Divider sx={{ my: 1.5 }} /><Typography variant="caption" color="text.secondary">{booking.days} Days</Typography></Box>
                    <Box>
                        <Typography variant="caption" fontWeight={700}>END</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{formatDate(endDateCalc)}</Typography>
                        <Typography variant="caption" color="text.secondary">{booking.state}</Typography>
                    </Box>
                </Stack>
             </Paper>
             <Typography variant="subtitle2" fontWeight={700} mb={1}>Passengers</Typography>
             <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.50' }}><TableRow><TableCell>Name</TableCell><TableCell>Seat</TableCell></TableRow></TableHead>
                    <TableBody>
                        {booking.passengers?.map((p, i) => (
                            <TableRow key={i}><TableCell>{p.fullName}</TableCell><TableCell>{booking.seats?.[i]}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
             </TableContainer>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
         <Button startIcon={<DownloadIcon />} variant="outlined" color="inherit">Invoice</Button>
         <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

/* ================= MAIN PAGE ================= */

export default function TourBookings() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { allBookings, loading } = useSelector((state) => state.tour);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);

  useEffect(() => { dispatch(getAllBookings()); }, [dispatch]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(allBookings)) return [];
    let data = allBookings;
    if (statusFilter !== "all") data = data.filter((b) => b.status?.toLowerCase() === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((b) => b.bookingCode?.toLowerCase().includes(q) || b.travelAgencyName?.toLowerCase().includes(q));
    }
    return data;
  }, [allBookings, search, statusFilter]);

  const paginatedData = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);

  return (
    <StyledContainer maxWidth="xl">
      <Stack spacing={3}>
        <Box><Typography variant="h4" fontWeight={800}>Bookings</Typography></Box>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1}>
            {['All', 'Pending', 'Confirmed', 'Cancelled'].map((s) => (
              <Button key={s} variant={statusFilter === s.toLowerCase() ? "contained" : "text"} onClick={() => setStatusFilter(s.toLowerCase())} size="small">{s}</Button>
            ))}
          </Stack>
          <SearchField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
        </Paper>

        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Agency</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress sx={{ m: 4 }} /></TableCell></TableRow> : 
                 paginatedData.map((row) => (
                  <React.Fragment key={row._id}>
                    <StyledTableRow>
                      <TableCell><IconButton size="small" onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)}>{expandedRow === row._id ? <ExpandMore /> : <ChevronRight />}</IconButton></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={700}>#{row.bookingCode?.slice(0, 8)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{row.travelAgencyName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{formatCurrency(row.totalAmount)}</Typography></TableCell>
                      <TableCell><StatusChip label={row.status} status={row.status} /></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setEditBooking(row)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setSelectedBooking(row)}><Visibility fontSize="small" /></IconButton>
                      </TableCell>
                    </StyledTableRow>
                    <TableRow><TableCell sx={{ py: 0 }} colSpan={6}><Collapse in={expandedRow === row._id}><Box p={3} bgcolor={alpha(theme.palette.primary.main, 0.02)}><Typography variant="subtitle2" fontWeight={700}>Route: {row.city} → {row.state}</Typography></Box></Collapse></TableCell></TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={filteredData.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => {setRowsPerPage(parseInt(e.target.value, 10)); setPage(0);}} />
        </Card>
      </Stack>
      <TicketModal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} booking={selectedBooking} />
      <EditBookingModal open={!!editBooking} onClose={() => setEditBooking(null)} booking={editBooking} />
    </StyledContainer>
  );
}