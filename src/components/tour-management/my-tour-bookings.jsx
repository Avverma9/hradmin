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
  CircularProgress,
  FormControl,
  InputLabel,
  Collapse,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Search,
  Visibility,
  Close,
  Phone,
  Email,
  Edit,
  ChevronRight,
  ExpandMore,
  Route as RouteIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
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
  const config = statusConfig[String(status || "").toLowerCase()] || statusConfig.pending;
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
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const safeList = (val) => (Array.isArray(val) ? val.filter(Boolean) : []);

const parseVisitingPlaces = (s) => {
  if (!s || typeof s !== "string") return [];
  return s
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
};

const copyToClipboard = async (text, successMsg = "Copied!") => {
  try {
    if (!text) return;
    await navigator.clipboard.writeText(String(text));
    toast.success(successMsg);
  } catch {
    toast.error("Copy failed");
  }
};

const downloadInvoice = (booking) => {
  if (!booking) return;
  const bookingCode = booking?.bookingCode || booking?._id || "invoice";
  const travelDate = booking?.from || booking?.tourStartDate;
  const endDate = booking?.to;
  const seats = Array.isArray(booking?.seats) ? booking.seats.join(", ") : "-";
  const passengers = Array.isArray(booking?.passengers) ? booking.passengers : [];

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Tour Booking Invoice", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Booking ID: ${bookingCode}`, margin, y);
  y += 16;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] },
    head: [["Agency", "Route", "Dates", "Duration"]],
    body: [
      [
        booking?.travelAgencyName || "-",
        `${booking?.city || "-"} -> ${booking?.state || "-"}`,
        `${formatDate(travelDate)} - ${formatDate(endDate)}`,
        `${Number(booking?.days || 0)} Days / ${Number(booking?.nights || 0)} Nights`,
      ],
    ],
  });

  y = doc.lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Seats & Passengers", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [17, 24, 39] },
    head: [["Seats", "Adults", "Children"]],
    body: [[seats, String(booking?.numberOfAdults ?? 0), String(booking?.numberOfChildren ?? 0)]],
  });

  y = doc.lastAutoTable.finalY + 10;
  if (passengers.length) {
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [17, 24, 39] },
      head: [["#", "Type", "Seat"]],
      body: passengers.map((p, i) => [
        String(i + 1),
        String(p?.type || "-"),
        String(booking?.seats?.[i] || "-"),
      ]),
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No passenger details", margin, y + 12);
  }

  y = Math.max(doc.lastAutoTable?.finalY || y, y) + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Amount", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [17, 24, 39] },
    head: [["Base", "Seat", "Tax", "Discount", "Total"]],
    body: [[
      formatCurrency(booking?.basePrice),
      formatCurrency(booking?.seatPrice),
      formatCurrency(booking?.tax),
      formatCurrency(booking?.discount),
      formatCurrency(booking?.totalAmount),
    ]],
    columnStyles: {
      4: { fontStyle: "bold" },
    },
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}`,
    margin,
    doc.internal.pageSize.getHeight() - 24
  );
  doc.setTextColor(0, 0, 0);

  doc.save(`invoice_${bookingCode}.pdf`);
};

const KV = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} mt={0.5} sx={{ wordBreak: "break-word" }}>
      {value ?? "-"}
    </Typography>
  </Box>
);

/* ================= EDIT MODAL ================= */

const EditBookingModal = ({ open, onClose, booking }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(booking?.status || "pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) setStatus(booking.status || "pending");
  }, [booking]);

  const handleUpdate = async () => {
    if (!booking?._id) return;
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
            Update status for Booking <strong>#{booking?.bookingCode || "-"}</strong>
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Booking Status</InputLabel>
            <Select value={status} label="Booking Status" onChange={(e) => setStatus(e.target.value)}>
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
        <Button onClick={handleUpdate} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ================= TICKET / DETAILS MODAL ================= */
const TicketModal = ({ open, onClose, booking }) => {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (open) setShowMore(false);
  }, [open]);

  if (!booking) return null;

  const travelDate = booking.from || booking.tourStartDate;
  const endDate = booking.to;

  const seatsText = Array.isArray(booking.seats) && booking.seats.length
    ? booking.seats.join(", ")
    : "-";

  const passengers = Array.isArray(booking.passengers) ? booking.passengers : [];

  const parseVisitingPlaces = (s) => {
    if (!s || typeof s !== "string") return [];
    return s.split("|").map((x) => x.trim()).filter(Boolean);
  };

  const visitingPlaces = parseVisitingPlaces(booking.visitngPlaces);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <RouteIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Booking Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              #{booking.bookingCode || "-"}
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 1) Status + Total */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                STATUS
              </Typography>
              <Box mt={0.5}>
                <StatusChip label={booking.status || "pending"} status={booking.status} />
              </Box>
            </Box>

            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TOTAL
              </Typography>
              <Typography variant="h6" fontWeight={900}>
                {formatCurrency(booking.totalAmount)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* 2) Trip summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" fontWeight={800}>
              Route
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.city || "-"} → {booking.state || "-"}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  START
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDate(travelDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  END
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDate(endDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  DURATION
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {Number(booking.days || 0)} Days / {Number(booking.nights || 0)} Nights
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* 3) Seats + Pax */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} mb={1}>
            Seats & Passengers
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} divider={<Divider flexItem />}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                SEATS
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {seatsText}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                COUNT
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                Adults: {booking.numberOfAdults ?? 0}, Children: {booking.numberOfChildren ?? 0}
              </Typography>
            </Box>
          </Stack>

          {/* Passenger list (only useful part) */}
          {passengers.length ? (
            <Box mt={2}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PASSENGERS
              </Typography>

              <Table size="small" sx={{ mt: 1 }}>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Seat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {passengers.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{p?.type || "-"}</TableCell>
                      <TableCell>{booking.seats?.[i] || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : null}
        </Paper>

        {/* 4) Agency contact */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} mb={1}>
            Agency
          </Typography>

          <Typography variant="body2" fontWeight={700}>
            {booking.travelAgencyName || "-"}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={1}>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
              <Phone fontSize="inherit" /> {booking.agencyPhone || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
              <Email fontSize="inherit" /> {booking.agencyEmail || "-"}
            </Typography>
          </Stack>
        </Paper>

        {/* Optional: Show more (kept hidden by default) */}
        <Box mt={2}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowMore((v) => !v)}
          >
            {showMore ? "Hide extra details" : "Show extra details"}
          </Button>

          <Collapse in={showMore} unmountOnExit>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} mb={1}>
                Extra details
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Theme: {booking.themes || "-"}
              </Typography>

              <Box mt={1.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  VISITING PLACES
                </Typography>
                <Box mt={1}>
                  {visitingPlaces.length ? (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {visitingPlaces.slice(0, 10).map((p, idx) => (
                        <Chip key={idx} label={p} size="small" variant="outlined" />
                      ))}
                      {visitingPlaces.length > 10 ? (
                        <Chip label={`+${visitingPlaces.length - 10} more`} size="small" />
                      ) : null}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          startIcon={<DownloadIcon />}
          variant="outlined"
          color="inherit"
          onClick={() => downloadInvoice(booking)}
        >
          Invoice
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
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

  useEffect(() => {
    dispatch(getAllBookings());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(allBookings)) return [];
    let data = allBookings;

    if (statusFilter !== "all") {
      data = data.filter((b) => String(b.status || "").toLowerCase() === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (b) =>
          String(b.bookingCode || "").toLowerCase().includes(q) ||
          String(b.travelAgencyName || "").toLowerCase().includes(q) ||
          String(b.agencyPhone || "").toLowerCase().includes(q) ||
          String(b.city || "").toLowerCase().includes(q) ||
          String(b.state || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [allBookings, search, statusFilter]);

  const paginatedData = useMemo(
    () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  const statusTabs = ["All", "Pending", "Confirmed", "Cancelled"];

  return (
    <StyledContainer maxWidth="xl">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {filteredData.length}
          </Typography>
        </Box>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            display: "flex",
            gap: 2,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {statusTabs.map((s) => (
              <Button
                key={s}
                variant={statusFilter === s.toLowerCase() ? "contained" : "text"}
                onClick={() => {
                  setStatusFilter(s.toLowerCase());
                  setPage(0);
                }}
                size="small"
              >
                {s}
              </Button>
            ))}
          </Stack>

          <SearchField
            size="small"
            placeholder="Search bookingCode / agency / phone / city / state..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 420 } }}
          />
        </Paper>

        {/* Table */}
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Agency</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Booking Source</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress sx={{ m: 4 }} />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length ? (
                  paginatedData.map((row) => {
                    const expanded = expandedRow === row._id;
                    const places = parseVisitingPlaces(row.visitngPlaces);

                    return (
                      <React.Fragment key={row._id}>
                        <StyledTableRow>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => setExpandedRow(expanded ? null : row._id)}
                            >
                              {expanded ? <ExpandMore /> : <ChevronRight />}
                            </IconButton>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={800}>
                                #{String(row.bookingCode || "").slice(0, 10) || "-"}
                              </Typography>
                              <Tooltip title="Copy booking code">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(row.bookingCode, "Booking code copied!")}
                                >
                                  <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(row.createdAt)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {row.travelAgencyName || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.agencyPhone || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {row.city || "-"} → {row.state || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(row.from || row.tourStartDate)} - {formatDate(row.to)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {row.bookingSource || row.source || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {formatCurrency(row.totalAmount)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <StatusChip label={row.status || "pending"} status={row.status} />
                          </TableCell>

                          <TableCell align="right">
                            <Tooltip title="Edit status">
                              <IconButton size="small" onClick={() => setEditBooking(row)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={() => setSelectedBooking(row)}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </StyledTableRow>

                        {/* Expand row */}
                        <TableRow>
                          <TableCell sx={{ py: 0 }} colSpan={8}>
                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                              <Box p={2.5} bgcolor={alpha(theme.palette.primary.main, 0.02)}>
                                <Stack spacing={2}>
                                  <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    divider={<Divider flexItem />}
                                  >
                                    <Box flex={1}>
                                      <Typography variant="subtitle2" fontWeight={800} mb={0.5}>
                                        Trip summary
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Dates: {formatDate(row.from || row.tourStartDate)} - {formatDate(row.to)} •{" "}
                                        {Number(row.days || 0)} days / {Number(row.nights || 0)} nights
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Theme: {row.themes || "-"}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Customizable: {row.isCustomizable ? "Yes" : "No"}
                                      </Typography>
                                    </Box>

                                    <Box flex={1}>
                                      <Typography variant="subtitle2" fontWeight={800} mb={0.5}>
                                        Seats & passengers
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Seats: {(row.seats || []).join(", ") || "-"}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Adults: {row.numberOfAdults ?? 0}, Children: {row.numberOfChildren ?? 0}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Passenger entries: {safeList(row.passengers).length}
                                      </Typography>
                                    </Box>

                                    <Box flex={1}>
                                      <Typography variant="subtitle2" fontWeight={800} mb={0.5}>
                                        Amount
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Base: {formatCurrency(row.basePrice)} • Seat: {formatCurrency(row.seatPrice)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Tax: {formatCurrency(row.tax)} • Discount: {formatCurrency(row.discount)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Total: <strong>{formatCurrency(row.totalAmount)}</strong>
                                      </Typography>
                                    </Box>

                                    <Box flex={1}>
                                      <Typography variant="subtitle2" fontWeight={800} mb={0.5}>
                                        Contact
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Phone: {row.agencyPhone || "-"}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Email: {row.agencyEmail || "-"}
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  <Divider />

                                  <Box>
                                    <Typography variant="subtitle2" fontWeight={800} mb={1}>
                                      Visiting places
                                    </Typography>
                                    {places.length ? (
                                      <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {places.slice(0, 12).map((p, idx) => (
                                          <Chip key={idx} label={p} size="small" variant="outlined" />
                                        ))}
                                        {places.length > 12 ? (
                                          <Chip label={`+${places.length - 12} more`} size="small" />
                                        ) : null}
                                      </Stack>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        -
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={5}>
                        <Typography variant="body2" color="text.secondary">
                          No bookings found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </Card>
      </Stack>

      <TicketModal
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
