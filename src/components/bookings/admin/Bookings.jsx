import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../../utils/loader";
import {
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  Tooltip,
  Container,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  CardContent,
  InputAdornment,
  Divider,
  Fade,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ConfirmationNumber as BookingIcon,
  Style as CouponIcon,
  TrendingUp as TrendingIcon,
  Assessment as StatsIcon,
} from "@mui/icons-material";
import { fDate, fDateTime } from "../../../../utils/format-time";
import {
  fetchFilteredBookings,
  searchBooking,
} from "src/components/redux/reducers/booking";
import { getHotelsCity } from "src/components/redux/reducers/hotel";
import AdminBookingUpdateModal from "./admin-booking-update";

const BookingStatusChip = ({ status }) => {
  const statusStyles = {
    Confirmed: {
      color: "success",
      variant: "filled",
      icon: "✓",
    },
    Pending: {
      color: "warning",
      variant: "filled",
      icon: "⏳",
    },
    Cancelled: {
      color: "error",
      variant: "filled",
      icon: "✗",
    },
    "Checked-out": {
      color: "info",
      variant: "outlined",
      icon: "📤",
    },
    "Checked-in": {
      color: "primary",
      variant: "filled",
      icon: "🏨",
    },
  };

  const style = statusStyles[status] || {
    color: "default",
    variant: "outlined",
    icon: "?",
  };

  return (
    <Chip
      label={`${style.icon} ${status}`}
      color={style.color}
      variant={style.variant}
      size="small"
      sx={{
        fontWeight: 600,
        minWidth: 100,
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
};

const StatCard = ({ title, value, icon, color = "primary" }) => (
  <Card elevation={2} sx={{ height: "100%" }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: "50%",
            p: 1.5,
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function BookingsView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const { byCity } = useSelector((state) => state.hotel);
  const filteredBookings = useSelector((state) => state.booking.filtered);
  const searchResults = useSelector((state) => state.booking.search);

  const [searchQuery, setSearchQuery] = useState({
    bookingId: "",
    couponCode: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    city: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const isSearchActive = searchResults.length > 0;
  const bookings = isSearchActive ? searchResults : filteredBookings;

// ✅ Main Booking Component

const getBookingStats = () => {
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.bookingStatus === "Confirmed").length;
  const pending = bookings.filter((b) => b.bookingStatus === "Pending").length;
  const cancelled = bookings.filter((b) => b.bookingStatus === "Cancelled").length;

  return { total, confirmed, pending, cancelled };
};

const stats = getBookingStats();

// ✅ Fetch Bookings with Filters
const fetchData = useCallback(
  async (currentFilters) => {
    showLoader();
    try {
      const queryParams = new URLSearchParams();

      if (currentFilters.status)
        queryParams.append("bookingStatus", currentFilters.status);
      if (currentFilters.date)
        queryParams.append("date", currentFilters.date);
      if (currentFilters.city)
        queryParams.append("hotelCity", currentFilters.city);

      await dispatch(fetchFilteredBookings(queryParams.toString()));
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      hideLoader();
    }
  },
  [dispatch]
);

// ✅ Debounce Filtered Fetch
useEffect(() => {
  const handler = setTimeout(() => {
    fetchData(filters);
  }, 500);
  return () => clearTimeout(handler);
}, [filters, fetchData]);

// ✅ Fetch City List on Mount
useEffect(() => {
  const init = async () => {
    showLoader();
    try {
      await dispatch(getHotelsCity());
    } catch (error) {
      console.error("Error fetching hotel cities:", error);
      toast.error("Failed to load hotel cities");
    } finally {
      hideLoader();
    }
  };
  init();

  return () => {
    dispatch({ type: "booking/clearSearch" });
  };
}, [dispatch]);

// ✅ Handle Filter Change
const handleFilterChange = async (e) => {
  showLoader();
  try {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  } catch (error) {
    console.error("Error updating filters:", error);
    toast.error("Something went wrong while changing filters!");
  } finally {
    hideLoader();
  }
};

// ✅ Handle Search Input Change
const handleSearchChange = (e) => {
  setSearchQuery((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

// ✅ Handle Search Action
const handleSearch = async () => {
  if (!searchQuery.bookingId && !searchQuery.couponCode) {
    toast.warn("Please enter a Booking ID or Coupon Code to search.");
    return;
  }
  showLoader();
  try {
    await dispatch(searchBooking(searchQuery));
    toast.success("Search completed successfully!");
  } catch (error) {
    console.error("Error searching:", error);
    toast.error("Search failed.");
  } finally {
    hideLoader();
  }
};

// ✅ Clear Search
const handleClearSearch = async () => {
  showLoader();
  try {
    setSearchQuery({ bookingId: "", couponCode: "" });
    dispatch({ type: "booking/clearSearch" });
    toast.info("Search cleared successfully.");
  } catch (error) {
    console.error("Error clearing search:", error);
  } finally {
    hideLoader();
  }
};

// ✅ Clear Filters
const handleClearFilters = async () => {
  showLoader();
  try {
    setFilters({ status: "", date: "", city: "" });
    toast.info("Filters cleared successfully.");
  } catch (error) {
    console.error("Error clearing filters:", error);
  } finally {
    hideLoader();
  }
};

// ✅ Handle Booking Update
const handleUpdate = async (bookingId) => {
  showLoader();
  try {
    const fullBooking = bookings.find((b) => b.bookingId === bookingId);
    setSelectedBooking(fullBooking);
    setOpenModal(true);
  } catch (error) {
    console.error("Error updating booking:", error);
    toast.error("Failed to open booking details.");
  } finally {
    hideLoader();
  }
};

// ✅ Handle Save Booking
const handleSave = async () => {
  showLoader();
  try {
    setOpenModal(false);
    setSelectedBooking(null);
    await fetchData(filters);
    toast.success("Booking updated successfully!");
  } catch (error) {
    console.error("Error saving booking:", error);
    toast.error("Booking update failed.");
  } finally {
    hideLoader();
  }
};

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                navigate(`/your-booking-details/${params.row.bookingId}`)
              }
              sx={{ backgroundColor: "primary.light", color: "white" }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Booking">
            <IconButton
              size="small"
              color="warning"
              onClick={() => handleUpdate(params.row.bookingId)}
              sx={{ backgroundColor: "warning.light", color: "white" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: "bookingId",
      headerName: "Booking ID",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => <BookingStatusChip status={params.value} />,
    },
    {
      field: "user",
      headerName: "User",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "source",
      headerName: "Source",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.bookingSource}
          size="small"
          variant="outlined"
          color={params.row.bookingSource === "Site" ? "success" : "default"}
        />
      ),
    },
    {
      field: "mop",
      headerName: "Payment",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.pm}
          size="small"
          variant="filled"
          color={params.row.pm === "Online" ? "info" : "secondary"}
        />
      ),
    },
    {
      field: "checkInDate",
      headerName: "Check-In",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">{fDate(params.row.checkInDate)}</Typography>
      ),
    },
    {
      field: "checkOutDate",
      headerName: "Check-Out",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {fDate(params.row.checkOutDate)}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Booked On",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {fDateTime(params.row.createdAt)}
        </Typography>
      ),
    },
  ];

  // Map rows using actual bookingSource
  const rows = bookings.map((booking) => ({
    id: booking._id,
    bookingId: booking.bookingId,
    user: booking.user.name,
    status: booking.bookingStatus,
    bookingSource: booking.bookingSource, // include this field
    pm: booking.pm,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    createdAt: booking.createdAt,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏨 Booking Management Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all hotel bookings efficiently
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats.total}
            icon={<StatsIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={<TrendingIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<FilterListIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={<ClearIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🔍 Search & Filter Controls
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Find specific bookings or apply filters to narrow down results
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Quick Search
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="bookingId"
                  placeholder="Search by Booking ID"
                  value={searchQuery.bookingId}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BookingIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="couponCode"
                  placeholder="Search by Coupon Code"
                  value={searchQuery.couponCode}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CouponIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  sx={{ minWidth: 120 }}
                >
                  Search
                </Button>
                {isSearchActive && (
                  <Fade in={isSearchActive}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ClearIcon />}
                      onClick={handleClearSearch}
                    >
                      Clear Search
                    </Button>
                  </Fade>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Advanced Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    variant="outlined"
                    size="small"
                    name="city"
                    label="City"
                    value={filters.city}
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Cities</MenuItem>
                    {byCity.map((city, index) => (
                      <MenuItem key={index} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    variant="outlined"
                    size="small"
                    name="status"
                    label="Status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {[
                      "Confirmed",
                      "Pending",
                      "Cancelled",
                      "Checked-in",
                      "Checked-out",
                    ].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="date"
                    name="date"
                    label="Date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Box mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              {isSearchActive ? (
                <Badge badgeContent="Search Results" color="primary">
                  Found {bookings.length} booking(s)
                </Badge>
              ) : (
                `Showing ${bookings.length} total bookings`
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[25, 50, 100]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f8f9fa",
              },
            }}
            loading={false}
          />
        </Box>
      </Card>

      {selectedBooking && (
        <AdminBookingUpdateModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          bookingData={selectedBooking}
          onSave={handleSave}
        />
      )}
    </Container>
  );
}
