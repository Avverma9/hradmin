import { toast } from "react-toastify";
import * as React from "react";
// CHANGED: Added GridToolbarExport and other components for a better UI
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip
} from "@mui/material";
import { Refresh, Search, FileDownload } from '@mui/icons-material';

import { fDate } from "../../../../utils/format-time";
import BookingUpdateModal from "../booking-update-modal";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../../utils/loader";
import {
  fetchFilteredBookings,
  searchBooking,
} from "src/components/redux/reducers/booking";

// --- Custom Toolbar with Export Feature ---
function CustomToolbar(props) {
  const {
    bookingId, setBookingId, handleSearch,
    status, setStatus,
    filterDate, setFilterDate,
    handleRefresh
  } = props;

  return (
    <GridToolbarContainer sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      {/* Left side: Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search by Booking ID"
          variant="outlined"
          size="small"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Filter by Date"
          type="date"
          variant="outlined"
          size="small"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
        <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
          Search
        </Button>
      </Box>

      {/* Right side: Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* NEW: Export button using GridToolbarExport */}
        <GridToolbarExport
          csvOptions={{ fileName: `bookings-export-${new Date().toLocaleDateString()}` }}
          // Customizing the button to match the theme
          component={Button}
          startIcon={<FileDownload />}
        >
          Export
        </GridToolbarExport>
        <Tooltip title="Refresh Data">
          <Button variant="outlined" onClick={handleRefresh} startIcon={<Refresh />}>
            Refresh
          </Button>
        </Tooltip>
      </Box>
    </GridToolbarContainer>
  );
}


// --- Main Component ---
export default function SuperAdminBookingsView() {
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NEW: Loading state for the grid

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);
  const search = useSelector((state) => state.booking.search);
  const { showLoader, hideLoader } = useLoader(); // For global loader
  const role = localStorage.getItem("user_role");
  const hotelEmail = localStorage.getItem("user_email");
  
  const bookings = search.length ? search : filtered;

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const handleView = (id) => navigate(`/your-booking-details/${id}`);

  const handleUpdate = (booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };
  
  const renderStatusChip = (statusVal) => {
    const statusMap = {
      Confirmed: { color: 'success', label: 'Confirmed' },
      Pending: { color: 'warning', label: 'Pending' },
      Cancelled: { color: 'error', label: 'Cancelled' },
    };
    const { color, label } = statusMap[statusVal] || { color: 'default', label: statusVal };
    return <Chip label={label} color={color} size="small" />;
  };

  const columns = [
    {
      field: "actions", headerName: "Actions", width: 180, sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button variant="contained" size="small" onClick={() => handleView(params.row.bookingId)}>View</Button>
          <Button variant="contained" color="secondary" size="small" onClick={() => {
            const fullBooking = bookings.find((b) => b.bookingId === params.row.bookingId);
            handleUpdate(fullBooking);
          }}>Update</Button>
        </Box>
      ),
    },
    { field: "bookingId", headerName: "Booking ID", width: 150 },
    { field: "status", headerName: "Status", width: 120, renderCell: (params) => renderStatusChip(params.value) },
    { field: "user", headerName: "User Name", width: 150, valueGetter: (params) => params.row?.user?.name || 'N/A' },
    { field: "source", headerName: "Source", width: 130 },
    { field: "mop", headerName: "Payment Mode", width: 130 },
    { field: "checkInDate", headerName: "Check-In", width: 150, valueGetter: (params) => fDate(params.row.checkInDate) },
    { field: "checkOutDate", headerName: "Check-Out", width: 150, valueGetter: (params) => fDate(params.row.checkOutDate) },
    { field: "createdAt", headerName: "Booking Date", width: 150, valueGetter: (params) => fDate(params.row.createdAt) },
  ];

  const rows = bookings?.map(booking => ({ ...booking, id: booking._id || booking.bookingId, status: booking.bookingStatus, source: booking.bookingSource || 'Site', mop: booking.pm || 'Offline' })) || [];
  
  // CHANGED: The useEffect hook is now simplified and more direct.
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let filters = `hotelEmail=${hotelEmail}`;
      if (status) filters += `&bookingStatus=${status}`;
      if (filterDate) filters += `&date=${filterDate}`;
      
      try {
        await dispatch(fetchFilteredBookings(filters));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, hotelEmail, status, filterDate]); // It now depends directly on the filter values.

  const handleSearch = async () => {
    if (!bookingId.trim()) {
      toast.info("Please enter a Booking ID to search.");
      return;
    }
    showLoader();
    try {
      await dispatch(searchBooking(bookingId));
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      hideLoader();
    }
  };

  const handleSave = () => {
    setOpenModal(false);
    setSelectedBooking(null);
    // After saving, we'll manually trigger a refresh by clearing filters, which re-runs the useEffect
    handleRefresh();
  };

  const handleRefresh = () => {
    setBookingId('');
    setStatus('');
    setFilterDate('');
    // Clearing the filters will trigger the useEffect to refetch the initial data.
  };
  
  const disableEditFields = role === "Developer" || role === "TMS" || role ==="Admin";

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          title="Manage Bookings"
          subheader={`Found ${rows.length} bookings`}
        />
        <Divider />
        
        {/* DataGrid is now inside CardContent for better padding */}
        <CardContent>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading} // NEW: Grid shows a loading overlay
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: () => <Box sx={{ p: 4, textAlign: 'center' }}>No bookings found.</Box>, // NEW
            }}
            slotProps={{
              toolbar: {
                bookingId, setBookingId, handleSearch,
                status, setStatus,
                filterDate, setFilterDate,
                handleRefresh
              },
            }}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: (theme) => theme.palette.grey[100],
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Booking Update Modal */}
      {selectedBooking && (
        <BookingUpdateModal
          open={openModal}
          editFields={disableEditFields}
          onClose={() => setOpenModal(false)}
          bookingData={selectedBooking}
          onSave={handleSave}
        />
      )}
    </Container>
  );
}