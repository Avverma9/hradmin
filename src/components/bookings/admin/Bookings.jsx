import { toast } from "react-toastify";
import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useState, useEffect, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
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
    Accordion,
    IconButton,
    CardHeader,
    InputAdornment,
    AccordionSummary,
    AccordionDetails,
    Divider,
} from "@mui/material";
import {
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ConfirmationNumber as ConfirmationNumberIcon,
    Style as StyleIcon,
} from '@mui/icons-material';

import { fDate, fDateTime } from "../../../../utils/format-time";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../../utils/loader";
import {
    fetchFilteredBookings,
    searchBooking,
} from "src/components/redux/reducers/booking";
import { getHotelsCity } from "src/components/redux/reducers/hotel";
import AdminBookingUpdateModal from "./admin-booking-update";

const BookingStatusChip = ({ status }) => {
    const statusConfig = {
        Confirmed: { color: 'success', variant: 'filled' },
        Pending: { color: 'warning', variant: 'filled' },
        Cancelled: { color: 'error', variant: 'filled' },
        'Checked-out': { color: 'info', variant: 'outlined' },
        'Checked-in': { color: 'primary', variant: 'filled' },
        Default: { color: 'default', variant: 'outlined' },
    };
    const config = statusConfig[status] || statusConfig.Default;
    return <Chip label={status} color={config.color} variant={config.variant} size="small" />;
};


export default function BookingsView() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showLoader, hideLoader } = useLoader();

    // --- Redux State ---
    const { byCity } = useSelector((state) => state.hotel);
    const filteredBookings = useSelector((state) => state.booking.filtered);
    const searchResults = useSelector((state) => state.booking.search);

    // --- Component State ---
    const [searchQuery, setSearchQuery] = useState({ bookingId: "", couponCode: "" });
    const [filters, setFilters] = useState({ status: "", date: "", city: "" });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    
    const isSearchActive = searchResults.length > 0;
    const bookings = isSearchActive ? searchResults : filteredBookings;

    // --- Data Fetching and Side Effects ---
    const fetchData = useCallback((currentFilters) => {
        showLoader();
        try {
            const queryParams = new URLSearchParams();
            if (currentFilters.status) queryParams.append("bookingStatus", currentFilters.status);
            if (currentFilters.date) queryParams.append("date", currentFilters.date);
            if (currentFilters.city) queryParams.append("hotelCity", currentFilters.city);
            
            dispatch(fetchFilteredBookings(queryParams.toString()));
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load bookings");
        } finally {
            hideLoader();
        }
    }, [dispatch, showLoader, hideLoader]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(filters);
        }, 500); // Debounce fetching to avoid rapid calls
    
        return () => {
          clearTimeout(handler);
        };
      }, [filters, fetchData]);

    useEffect(() => {
        dispatch(getHotelsCity());
         // Clear search results when component unmounts
         return () => {
            dispatch({ type: "booking/clearSearch" });
        };
    }, [dispatch]);


    // --- Event Handlers ---
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSearchChange = (e) => {
        setSearchQuery(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = async () => {
        if (!searchQuery.bookingId && !searchQuery.couponCode) {
            toast.warn("Please enter a Booking ID or Coupon Code to search.");
            return;
        }
        showLoader();
        try {
            await dispatch(searchBooking(searchQuery));
        } catch (error) {
            console.error("Error searching:", error);
            toast.error("Search failed.");
        } finally {
            hideLoader();
        }
    };

    const handleClearSearch = () => {
        setSearchQuery({ bookingId: "", couponCode: "" });
        dispatch({ type: "booking/clearSearch" });
    };
    
    const handleClearFilters = () => {
        setFilters({ status: "", date: "", city: "" });
    };

    const handleUpdate = (bookingId) => {
        const fullBooking = bookings.find((b) => b.bookingId === bookingId);
        setSelectedBooking(fullBooking);
        setOpenModal(true);
    };

    const handleSave = () => {
        setOpenModal(false);
        setSelectedBooking(null);
        fetchData(filters); // Refetch data after update
    };

    // --- DataGrid Columns and Rows ---
    const columns = [

        { field: "actions", headerName: "Actions", width: 120, align: 'center', headerAlign: 'center', sortable: false, renderCell: (params) => ( <Stack direction="row" spacing={1}> <Tooltip title="View Details"> <IconButton size="small" onClick={() => navigate(`/your-booking-details/${params.row.bookingId}`)}> <VisibilityIcon fontSize="small" /> </IconButton> </Tooltip> <Tooltip title="Update Booking"> <IconButton size="small" color="warning" onClick={() => handleUpdate(params.row.bookingId)}> <EditIcon fontSize="small" /> </IconButton> </Tooltip> </Stack> ), },
                { field: "bookingId", headerName: "Booking ID", width: 150 },
                {field: "status", headerName: "Status", width: 130, renderCell: (params) => <BookingStatusChip status={params.value} />, },
                { field: "user", headerName: "User", width: 220, renderCell: (params) => ( <Typography variant="body2" noWrap>{params.value}</Typography> ) },
                { field: "source", headerName: "Source", width: 130 , renderCell: (params) => params.row?.bookingSource},
                { field: "mop", headerName: "Payment Mode", width: 130, renderCell: (params) => params.row?.pm },
                { field: "checkInDate", headerName: "Check-In", width: 150, renderCell: (params) => fDate(params?.row?.checkInDate) },
                { field: "checkOutDate", headerName: "Check-Out", width: 150, renderCell: (params) => fDate(params?.row?.checkOutDate) },
                { field: "createdAt", headerName: "Booking Date", width: 150, renderCell: (params) => fDate(params?.row?.createdAt) },
    ];

    const rows = bookings?.map((booking) => ({ id: booking._id || booking.bookingId, bookingId: booking.bookingId, user: booking.user?.name || 'N/A', status: booking.bookingStatus || 'N/A', source: booking.bookingSource || "Site", mop: booking.pm || "Offline", checkInDate: fDate(booking.checkInDate), checkOutDate: fDate(booking.checkOutDate), createdAt: fDateTime(booking.createdAt), })) || [];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={4} sx={{ overflow: 'hidden' }}>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
                    <CardHeader
                        title="Bookings Management"
                        subheader={`Found ${bookings.length} bookings ${isSearchActive ? 'matching your search' : ''}`}
                    />
                     <Accordion 
                        variant="outlined" 
                        sx={{ 
                            borderLeft: 0, 
                            borderRight: 0, 
                            borderRadius: 0,
                            boxShadow: 'none',
                            '&:before': { display: 'none' } 
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" fontWeight={500}>Search & Filter Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2} alignItems="center">
                                {/* Search Section */}
                                <Grid item xs={12} md={6}>
                                    <Stack direction="row" spacing={2}>
                                        <TextField fullWidth variant="filled" size="small" name="bookingId" label="Search by Booking ID" value={searchQuery.bookingId} onChange={handleSearchChange} InputProps={{ startAdornment: <InputAdornment position="start"><ConfirmationNumberIcon /></InputAdornment> }}/>
                                        <TextField fullWidth variant="filled" size="small" name="couponCode" label="Search by Coupon Code" value={searchQuery.couponCode} onChange={handleSearchChange} InputProps={{ startAdornment: <InputAdornment position="start"><StyleIcon /></InputAdornment> }} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Stack direction="row" spacing={2}>
                                        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>Search</Button>
                                        {isSearchActive && <Button variant="text" color="secondary" onClick={handleClearSearch}>Clear</Button>}
                                    </Stack>
                                </Grid>

                                {/* Filter Section */}
                                <Grid item xs={12}><Divider sx={{ my: 1 }}>Filters</Divider></Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <TextField fullWidth select variant="filled" size="small" name="city" label="Filter by City" value={filters.city} onChange={handleFilterChange}>
                                        <MenuItem value="">All Cities</MenuItem>
                                        {byCity.map((city, index) => <MenuItem key={index} value={city}>{city}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                     <TextField fullWidth select variant="filled" size="small" name="status" label="Filter by Status" value={filters.status} onChange={handleFilterChange}>
                                        <MenuItem value="">All Statuses</MenuItem>
                                        {['Confirmed', 'Pending', 'Cancelled', 'Checked-in', 'Checked-out'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField fullWidth variant="filled" size="small" type="date" name="date" label="Filter by Date" value={filters.date} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} fullWidth>Clear</Button>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Box>
                
                <Box sx={{ height: 650, width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[25, 50, 100]}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
                        disableRowSelectionOnClick
                        sx={{ border: 0 }}
                    />
                </Box>
            </Paper>

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