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
    Stack,
    Grid,
    Typography,
} from "@mui/material";
import { Refresh, Search, Clear, EventBusy } from '@mui/icons-material';

import { fDate } from "../../../../utils/format-time";
import BookingUpdateModal from "../booking-update-modal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredBookings, searchBooking } from "src/components/redux/reducers/booking";
import { hotelEmail, role } from "../../../../utils/util";
import { useResponsive } from "src/hooks/use-responsive";

const RenderStatusChip = ({ status }) => {
    const statusMap = {
        Confirmed: { color: 'success', label: 'Confirmed' },
        Pending: { color: 'warning', label: 'Pending' },
        Cancelled: { color: 'error', label: 'Cancelled' },
        'Checked-out': { color: 'info', label: 'Checked-out' },
        'Checked-in': { color: 'primary', label: 'Checked-in' },
    };
    const { color, label } = statusMap[status] || { color: 'default', label: status };
    return <Chip label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
};

const EmptyState = ({ isSearchActive }) => (
    <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ p: 4, height: '100%', minHeight: 180 }}
    >
        <EventBusy sx={{ fontSize: 40, color: 'text.disabled', mb: 0.5 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
            No Bookings Found
        </Typography>
        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ maxWidth: 250 }}>
            {isSearchActive 
                ? "We couldn't find any bookings matching your current filters. Try adjusting your search." 
                : "There are currently no bookings available for this property."}
        </Typography>
        {isSearchActive && (
            <Typography variant="caption" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                Click 'Clear' to reset filters
            </Typography>
        )}
    </Stack>
);

function CustomToolbar(props) {
    const {
        bookingId, setBookingId,
        status, setStatus,
        filterDate, setFilterDate,
        handleSearch, handleRefresh,
        isSearchActive
    } = props;

    return (
        <GridToolbarContainer sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <TextField
                    label="Search by ID"
                    variant="outlined"
                    size="small"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                        endAdornment: bookingId && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setBookingId('')} disableRipple>
                                    <Clear fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    sx={{ width: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
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
                    label="Filter Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 160 }}
                />
                <Button variant="contained" size="small" onClick={handleSearch} startIcon={<Search />} disableElevation>
                    Search
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <GridToolbarExport
                    size="small"
                    csvOptions={{ fileName: `bookings-export-${new Date().toLocaleDateString()}` }}
                />
                <Tooltip title={isSearchActive ? "Clear filters and refresh" : "Refresh data"}>
                    <Button variant="outlined" size="small" onClick={handleRefresh} startIcon={<Refresh />}>
                        {isSearchActive ? "Clear" : "Refresh"}
                    </Button>
                </Tooltip>
            </Box>
        </GridToolbarContainer>
    );
}

function MobileFilters(props) {
    const {
        bookingId, setBookingId,
        status, setStatus,
        filterDate, setFilterDate,
        handleSearch, handleRefresh,
        isSearchActive
    } = props;

    return (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
            <TextField
                label="Search by Booking ID"
                variant="outlined"
                size="small"
                fullWidth
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                    endAdornment: bookingId && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setBookingId('')} disableRipple>
                                <Clear fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <Stack direction="row" spacing={1}>
                <FormControl size="small" fullWidth>
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
                    label="Filter Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Stack>
            <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" size="small" onClick={handleSearch} startIcon={<Search />} disableElevation>
                    Search
                </Button>
                <Tooltip title={isSearchActive ? "Clear filters" : "Refresh data"}>
                    <Button fullWidth variant="outlined" size="small" onClick={handleRefresh} startIcon={<Refresh />}>
                        {isSearchActive ? "Clear" : "Refresh"}
                    </Button>
                </Tooltip>
            </Stack>
        </Stack>
    );
}

export default function SuperAdminBookingsView() {
    const mdUp = useResponsive("up", "md");
    
    const [bookingId, setBookingId] = useState("");
    const [status, setStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const filtered = useSelector((state) => state.booking.filtered) || [];
    const searchResults = useSelector((state) => state.booking.search) || [];

    const isSearchActive = bookingId || status || filterDate;
    const bookings = searchResults.length ? searchResults : filtered;

    const handleView = useCallback((id) => navigate(`/your-booking-details/${id}`), [navigate]);

    const handleUpdate = useCallback((booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    }, []);

    const handleSave = useCallback(() => {
        setOpenModal(false);
        setSelectedBooking(null);
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
            console.error(error);
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
        dispatch(fetchFilteredBookings(`hotelEmail=${hotelEmail}`));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchFilteredBookings(`hotelEmail=${hotelEmail}`));
    }, [dispatch]);

    const columns = [
        {
            field: "actions",
            headerName: "Actions",
            width: 140,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center" height="100%">
                    <Button variant="outlined" size="small" onClick={() => handleView(params.row.bookingId)}>
                        View
                    </Button>
                    <Button variant="contained" color="secondary" size="small" disableElevation onClick={() => handleUpdate(params.row)}>
                        Edit
                    </Button>
                </Stack>
            ),
        },
        { field: "bookingId", headerName: "Booking ID", width: 140 },
        { field: "bookingStatus", headerName: "Status", width: 130, renderCell: (params) => <RenderStatusChip status={params.value} /> },
        { field: "user", headerName: "User Name", width: 160, valueGetter: (value, row) => row?.user?.name || "N/A" },
        { field: "bookingSource", headerName: "Source", width: 120 },
        { field: "pm", headerName: "Pay Mode", width: 120 },
        { field: "checkInDate", headerName: "Check-In", width: 120, renderCell: (params) => fDate(params.value) },
        { field: "checkOutDate", headerName: "Check-Out", width: 120, renderCell: (params) => fDate(params.value) },
        { field: "createdAt", headerName: "Booking Date", width: 120, renderCell: (params) => fDate(params.value) },
    ];

    const rows = bookings.map(booking => ({ ...booking, id: booking._id || booking.bookingId }));
    const disableEditFields = role === "Developer" || role === "TMS" || role === "Admin";

    const renderBookingCard = (booking) => (
        <Card key={booking._id || booking.bookingId} variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {booking.bookingId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {booking.user?.name || booking.bookedBy || 'N/A'}
                            </Typography>
                        </Box>
                        <RenderStatusChip status={booking.bookingStatus} />
                    </Box>
                    <Divider sx={{ my: 0.5 }} />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Source</Typography>
                            <Typography variant="body2" noWrap>{booking.bookingSource || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Pay Mode</Typography>
                            <Typography variant="body2" noWrap>{booking.pm || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Check-In</Typography>
                            <Typography variant="body2" noWrap>{fDate(booking.checkInDate)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Check-Out</Typography>
                            <Typography variant="body2" noWrap>{fDate(booking.checkOutDate)}</Typography>
                        </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1} pt={0.5}>
                        <Button size="small" variant="outlined" fullWidth onClick={() => handleView(booking.bookingId)}>
                            View
                        </Button>
                        <Button size="small" variant="contained" color="secondary" disableElevation fullWidth onClick={() => handleUpdate(booking)}>
                            Update
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardHeader
                    title="Manage Bookings"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    subheader={`Found ${rows.length} bookings`}
                    subheaderTypographyProps={{ variant: 'body2' }}
                    sx={{ p: 2, pb: 1 }}
                />
                
                {mdUp ? (
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
                        density="compact"
                        slots={{
                            toolbar: CustomToolbar,
                            noRowsOverlay: () => <EmptyState isSearchActive={isSearchActive} />,
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
                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: (theme) => theme.palette.background.default,
                                borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
                            },
                            '& .MuiDataGrid-toolbarContainer': {
                                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                            }
                        }}
                    />
                ) : (
                    <>
                        <Divider />
                        <Box sx={{ p: 1.5 }}>
                            <MobileFilters
                                bookingId={bookingId}
                                setBookingId={setBookingId}
                                status={status}
                                setStatus={setStatus}
                                filterDate={filterDate}
                                setFilterDate={setFilterDate}
                                handleSearch={handleSearch}
                                handleRefresh={handleRefresh}
                                isSearchActive={isSearchActive}
                            />
                            {rows.length === 0 ? (
                                <EmptyState isSearchActive={isSearchActive} />
                            ) : (
                                <Stack spacing={1}>
                                    {rows.map((booking) => renderBookingCard(booking))}
                                </Stack>
                            )}
                        </Box>
                    </>
                )}
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