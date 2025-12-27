import {
  Cancel,
  CheckCircle,
  ChevronRight,
  ExpandMore,
  FilterList,
  Info,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookings } from "../../redux/reducers/tour/tour"; // Correct Path

/* ================= STYLED COMPONENTS ================= */

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  minHeight: "100vh",
  backgroundColor: theme.palette.grey[50],
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    "& fieldset": { border: "1px solid", borderColor: theme.palette.divider },
    "&:hover fieldset": { borderColor: theme.palette.primary.main },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  "& .MuiTableCell-head": {
    fontWeight: 700,
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colorMap = {
    confirmed: { color: theme.palette.success.dark, bg: theme.palette.success.light },
    pending: { color: theme.palette.warning.dark, bg: theme.palette.warning.light },
    cancelled: { color: theme.palette.error.dark, bg: theme.palette.error.light },
  };
  const style = colorMap[status?.toLowerCase()] || colorMap.pending;
  return {
    fontWeight: 700,
    color: style.color,
    backgroundColor: alpha(style.bg, 0.2),
    border: `1px solid ${alpha(style.color, 0.2)}`,
  };
});

/* ================= HELPERS ================= */
const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

/* ================= MAIN COMPONENT ================= */

export default function TourBookings() {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Redux State
  const { allBookings, loading } = useSelector((state) => state.tour);

  // Local State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);

  // Fetch Data
  useEffect(() => {
    dispatch(getAllBookings());
  }, [dispatch]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    if (!allBookings) return [];
    const query = search.toLowerCase();
    return allBookings.filter((b) =>
      b.bookingCode?.toLowerCase().includes(query) ||
      b.travelAgencyName?.toLowerCase().includes(query) ||
      b.passengers?.some((p) => p.fullName?.toLowerCase().includes(query))
    );
  }, [allBookings, search]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <StyledContainer maxWidth="xl">
      {/* Header Section */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            All Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all tour reservations
          </Typography>
        </Box>
        
        <Stack direction="row" gap={2} width={{ xs: "100%", md: "auto" }}>
          <SearchField
            placeholder="Search by Booking ID, Agency, Passenger..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { md: 300 } }}
          />
          <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 3, px: 3 }}>
            Filter
          </Button>
        </Stack>
      </Stack>

      {/* Table Section */}
      <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "none", overflow: "hidden" }}>
        {loading ? (
          <Box p={6} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Box p={6} textAlign="center">
            <Typography variant="h6" color="text.secondary">No bookings found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Agency</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Seats</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {paginatedData.map((row) => (
                  <React.Fragment key={row._id}>
                    <StyledTableRow selected={expandedRow === row._id} onClick={() => handleRowClick(row._id)} sx={{ cursor: "pointer" }}>
                      <TableCell>
                        <IconButton size="small">
                          {expandedRow === row._id ? <ExpandMore /> : <ChevronRight />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700} fontFamily="monospace">
                          #{row.bookingCode?.slice(-6)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{row.travelAgencyName}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.agencyPhone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: "primary.light" }}>
                            {row.passengers?.[0]?.fullName?.[0]}
                          </Avatar>
                          <Typography variant="body2">{row.passengers?.[0]?.fullName}</Typography>
                          {row.passengers?.length > 1 && (
                            <Chip label={`+${row.passengers.length - 1}`} size="small" sx={{ height: 20, fontSize: 10 }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.city} → {row.state}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(row.tourStartDate || row.from)}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.days}D / {row.nights}N</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" gap={0.5}>
                          {row.seats?.map((s) => (
                            <Chip key={s} label={s} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700} color="primary">
                          {formatCurrency(row.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip label={row.status} status={row.status} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>

                    {/* EXPANDED ROW DETAILS */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                        <Collapse in={expandedRow === row._id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <Grid container spacing={3}>
                              {/* Passenger List */}
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Passenger Manifest</Typography>
                                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
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
                              </Grid>

                              {/* Amenities & Inclusions */}
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Amenities</Typography>
                                <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>
                                  {row.amenities?.map((a) => (
                                    <Chip key={a} label={a} size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} />
                                  ))}
                                </Stack>
                                
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Inclusions</Typography>
                                <Stack direction="column" gap={0.5}>
                                  {row.inclusion?.slice(0,3).map((inc, i) => (
                                    <Typography key={i} variant="caption" display="flex" alignItems="center" gap={1}>
                                       • {inc}
                                    </Typography>
                                  ))}
                                  {row.inclusion?.length > 3 && <Typography variant="caption" color="primary">+{row.inclusion.length - 3} more</Typography>}
                                </Stack>
                              </Grid>

                              {/* Policies & Actions */}
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Policies</Typography>
                                <Box bgcolor="white" p={2} borderRadius={2} border={`1px dashed ${theme.palette.divider}`}>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                        <strong>Cancellation:</strong> {row.termsAndConditions?.["Cancellation Policy"] || "N/A"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        <strong>Booking:</strong> {row.termsAndConditions?.["Booking Policy"] || "N/A"}
                                    </Typography>
                                </Box>
                                <Stack direction="row" gap={2} mt={2}>
                                    {row.status === 'pending' && (
                                        <>
                                            <Button variant="contained" color="success" size="small" fullWidth>Confirm</Button>
                                            <Button variant="outlined" color="error" size="small" fullWidth>Reject</Button>
                                        </>
                                    )}
                                    {row.status === 'confirmed' && (
                                        <Button variant="outlined" color="error" size="small" fullWidth startIcon={<Cancel />}>Cancel Booking</Button>
                                    )}
                                </Stack>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Pagination Footer */}
        {filteredData.length > 0 && (
          <Box p={2} display="flex" justifyContent="center" bgcolor="white" borderTop={`1px solid ${theme.palette.divider}`}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>
    </StyledContainer>
  );
}