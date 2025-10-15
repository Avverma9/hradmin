import { toast } from "react-toastify";
import * as React from "react";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useState, useEffect, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    TextField,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Tooltip,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Refresh, Search, FileDownload, Clear } from '@mui/icons-material';

import { fDate } from "../../../../utils/format-time";
import BookingUpdateModal from "../booking-update-modal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredBookings, searchBooking } from "src/components/redux/reducers/booking";
import { hotelEmail, role } from "../../../../utils/util";

// A well-defined, reusable status chip component
const RenderStatusChip = ({ status }) => {
    const statusMap = {
        Confirmed: { color: 'success', label: 'Confirmed' },
        Pending: { color: 'warning', label: 'Pending' },
        Cancelled: { color: 'error', label: 'Cancelled' },
        'Checked-out': { color: 'info', label: 'Checked-out' },
        'Checked-in': { color: 'primary', label: 'Checked-in' },
    };
    const { color, label } = statusMap[status] || { color: 'default', label: status };
    return <Chip label={label} color={color} size="small" variant="filled" />;
};

// Custom Toolbar for a cleaner and more organized structure
function CustomToolbar(props) {
    const {
        bookingId, setBookingId,
        status, setStatus,
        filterDate, setFilterDate,
        handleSearch, handleRefresh,
        isSearchActive
    } = props;

    return (
        <GridToolbarContainer sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {/* Left side: Filters and Search */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="Search by Booking ID"
                    variant="outlined"
                    size="small"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                        endAdornment: bookingId && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setBookingId('')} aria-label="clear search">
                                    <Clear fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
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
                        <MenuItem value="Checked-in">Checked-in</MenuItem>
                        <MenuItem value="Checked-out">Checked-out</MenuItem>
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
                    sx={{ width: 180 }}
                />
                <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
                    Search
                </Button>
            </Box>

            {/* Right side: Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <GridToolbarExport
                    csvOptions={{ fileName: `bookings-export-${new Date().toLocaleDateString()}` }}
                />
                <Tooltip title={isSearchActive ? "Clear filters and refresh" : "Refresh data"}>
                    <Button variant="outlined" onClick={handleRefresh} startIcon={<Refresh />}>
                        {isSearchActive ? "Clear" : "Refresh"}
                    </Button>
                </Tooltip>
            </Box>
        </GridToolbarContainer>
    );
}

export default function SuperAdminBookingsView() {
    // State
    const [bookingId, setBookingId] = useState("");
    const [status, setStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    // Redux & Navigation
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const filtered = useSelector((state) => state.booking.filtered) || [];
    const searchResults = useSelector((state) => state.booking.search) || [];

    const isSearchActive = bookingId || status || filterDate;
    const bookings = searchResults.length ? searchResults : filtered;

    // Handlers
    const handleView = useCallback((id) => navigate(`/your-booking-details/${id}`), [navigate]);

    const handleUpdate = useCallback((booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    }, []);

    const handleSave = useCallback(() => {
        setOpenModal(false);
        setSelectedBooking(null);
        // Refetch data after saving
        dispatch(fetchFilteredBookings(`hotelEmail=${hotelEmail}`));
    }, [dispatch]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (bookingId.trim()) {
                await dispatch(searchBooking(bookingId)).unwrap();
            } else {
                let filters = `hotelEmail=${hotelEmail}`;
                if (status) filters += `&bookingStatus=${status}`;
                if (filterDate) filters += `&date=${filterDate}`;
                await dispatch(fetchFilteredBookings(filters)).unwrap();
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(error.message || "Failed to fetch bookings.");
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, bookingId, status, filterDate]);

    const handleSearch = () => {
        fetchData();
    };

    const handleRefresh = useCallback(() => {
        setBookingId('');
        setStatus('');
        setFilterDate('');
        dispatch({ type: "booking/clearSearch" });
        // Fetch initial data after clearing
        dispatch(fetchFilteredBookings(`hotelEmail=${hotelEmail}`));
    }, [dispatch]);

    // Effects
    useEffect(() => {
        // Initial data fetch on component mount
        dispatch(fetchFilteredBookings(`hotelEmail=${hotelEmail}`));
    }, [dispatch]);

    // Columns Definition
    const columns = [
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Box display="flex" gap={1}>
                    <Button variant="contained" size="small" onClick={() => handleView(params.row.bookingId)}>
                        View
                    </Button>
                    <Button variant="contained" color="secondary" size="small" onClick={() => handleUpdate(params.row)}>
                        Update
                    </Button>
                </Box>
            ),
        },
        { field: "bookingId", headerName: "Booking ID", width: 150 },
        { field: "bookingStatus", headerName: "Status", width: 120, renderCell: (params) => <RenderStatusChip status={params.value} /> },
        { field: "user", headerName: "User Name", width: 150, valueGetter: (value, row) => row?.user?.name || "N/A" },
        { field: "bookingSource", headerName: "Source", width: 130 },
        { field: "pm", headerName: "Payment Mode", width: 130 },
        { field: "checkInDate", headerName: "Check-In", width: 150, renderCell: (params) => fDate(params.value) },
        { field: "checkOutDate", headerName: "Check-Out", width: 150, renderCell: (params) => fDate(params.value) },
        { field: "createdAt", headerName: "Booking Date", width: 150, renderCell: (params) => fDate(params.value) },
    ];

    const rows = bookings.map(booking => ({ ...booking, id: booking._id || booking.bookingId }));
    const disableEditFields = role === "Developer" || role === "TMS" || role === "Admin";

    return (
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardHeader
                    title="Manage Bookings"
                    subheader={`Found ${rows.length} bookings`}
                />
                <Divider />
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={isLoading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    slots={{
                        toolbar: CustomToolbar,
                        noRowsOverlay: () => <Box sx={{ p: 4, textAlign: 'center' }}>No bookings found.</Box>,
                    }}
                    slotProps={{
                        toolbar: {
                            bookingId, setBookingId,
                            status, setStatus,
                            filterDate, setFilterDate,
                            handleSearch, handleRefresh,
                            isSearchActive,
                        },
                    }}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: (theme) => theme.palette.grey[100],
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
                    }}
                />
            </Card>

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
