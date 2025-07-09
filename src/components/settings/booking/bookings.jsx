import { toast } from "react-toastify";
import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useState, useEffect, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Chip,
    Grid,
    Paper,
    Button,
    Tooltip,
    Container,
    TextField,
    Typography,
    MenuItem,
    CardHeader,
    Divider,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";
import { Search, Refresh, FileDownload, Clear } from "@mui/icons-material";

import { fDate, fDateTime } from "../../../../utils/format-time";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../../utils/loader";

import { getHotelsCity } from "src/components/redux/reducers/hotel";
import BookingUpdateModal from "src/components/bookings/booking-update-modal";
import { fetchFilteredBookings, searchBooking } from "src/components/redux/reducers/booking";
import { hotelEmail } from "../../../../utils/util";

const renderStatusChip = (statusVal) => {
    const statusMap = {
        Confirmed: { color: 'success', label: 'Confirmed' },
        Pending: { color: 'warning', label: 'Pending' },
        Cancelled: { color: 'error', label: 'Cancelled' },
        'Checked-out': { color: 'info', label: 'Checked-out' },
        'Checked-in': { color: 'primary', label: 'Checked-in' },
    };
    const { color, label } = statusMap[statusVal] || { color: 'default', label: statusVal };
    return <Chip label={label} color={color} size="small" variant="filled" />;
};

export default function PanelBookings() {
    const [bookingId, setBookingId] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [status, setStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    
    const email = hotelEmail;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showLoader, hideLoader } = useLoader();

    const { byCity } = useSelector((state) => state.hotel);
    const filtered = useSelector((state) => state.booking.filtered);
    const search = useSelector((state) => state.booking.search);
    
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    
    const bookings = search.length ? search : filtered;
    const bookingCount = bookings.length;

    const fetchData = useCallback(async () => {
        showLoader();
        try {
            const queryParams = new URLSearchParams();
            if (status) queryParams.append("bookingStatus", status);
            if (filterDate) queryParams.append("date", filterDate);
            if (selectedCity) queryParams.append("hotelCity", selectedCity);
            if (email) queryParams.append("createdBy", email);

            await dispatch(fetchFilteredBookings(queryParams.toString()));
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load bookings");
        } finally {
            hideLoader();
        }
    }, [dispatch, status, filterDate, selectedCity, email]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 500); // Debounce fetch
        return () => clearTimeout(handler);
    }, [fetchData]);

    useEffect(() => {
        dispatch(getHotelsCity());
        return () => dispatch({ type: "booking/clearSearch" });
    }, [dispatch]);

    const handleSearch = async () => {
        if (!bookingId && !couponCode) {
            toast.warn("Please enter a Booking ID or Coupon Code to search.");
            return;
        }
        showLoader();
        try {
            await dispatch(searchBooking({ bookingId, couponCode }));
        } catch (error) {
            console.error("Error:", error);
            toast.error("Search failed");
        } finally {
            hideLoader();
        }
    };

    const handleClearFilters = () => {
        setBookingId("");
        setCouponCode("");
        setSelectedCity("");
        setStatus("");
        setFilterDate("");
        dispatch({ type: "booking/clearSearch" });
        // Fetch data with cleared filters
        fetchData();
    };

    const handleView = (bookingId) => navigate(`/your-booking-details/${bookingId}`);
    const handleUpdate = (booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };
    const handleSave = () => {
        setOpenModal(false);
        setSelectedBooking(null);
        fetchData();
    };

    const columns = [
        { field: "actions", headerName: "Actions", width: 150, renderCell: (params) => ( <div> <Button variant="contained" size="small" onClick={() => handleView(params.row.bookingId)}> View </Button> <Button variant="contained" color="warning" size="small" onClick={() => handleUpdate(params.row)} style={{ marginLeft: "10px" }} > Update </Button> </div> ), },
        { field: "bookingId", headerName: "Booking ID", width: 150 },
        { field: "user", headerName: "User", width: 150 },
        { field: "createdBy", headerName: "Created/Updated By", width: 250 },
        { field: "status", headerName: "Status", width: 120, renderCell: (params) => renderStatusChip(params.value) },
        { field: "source", headerName: "Source", width: 130 },
        { field: "mop", headerName: "Payment Mode", width: 130 },
        { field: "checkInDate", headerName: "Check-In Date", width: 180 },
        { field: "checkOutDate", headerName: "Check-Out Date", width: 180 },
        { field: "createdAt", headerName: "Created At", width: 180 },
    ];

    const rows = bookings?.map((booking) => ({
        id: booking._id || booking.bookingId,
        ...booking, // Pass the full booking object to handleUpdate
        user: booking.user?.name,
        createdBy: `${booking.createdBy?.user || ''} (${booking.createdBy?.email || ''})`,
        status: booking.bookingStatus,
        source: booking.bookingSource || "Site",
        mop: booking.pm || "Offline",
        checkInDate: fDate(booking.checkInDate),
        checkOutDate: fDate(booking.checkOutDate),
        createdAt: fDateTime(booking.createdAt),
    }));

    return (
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Paper elevation={3} sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                {/* --- FIXED HEADER AREA --- */}
                <Box sx={{ flexShrink: 0 }}>
                    <CardHeader
                        title="Panel Bookings"
                        subheader={`A total of ${bookingCount} bookings found`}
                        sx={{ px: 3, pt: 3 }}
                    />
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField fullWidth label="Booking ID" variant="outlined" size="small" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField fullWidth label="Coupon Code" variant="outlined" size="small" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>City</InputLabel>
                                    <Select value={selectedCity} label="City" onChange={(e) => setSelectedCity(e.target.value)}>
                                        <MenuItem value="">All Cities</MenuItem>
                                        {byCity.map((city, index) => <MenuItem key={index} value={city}>{city}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                                        <MenuItem value="">All Statuses</MenuItem>
                                        {['Confirmed', 'Pending', 'Cancelled', 'Checked-in', 'Checked-out'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField fullWidth type="date" variant="outlined" size="small" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                    <Tooltip title="Clear search">
                                        <Search fullWidth variant="contained" onClick={handleSearch} />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title="Clear all filter">
                                            <Clear fullWidth variant="contained" onClick={handleClearFilters} />
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                    <Divider />
                </Box>

                {/* --- SCROLLABLE DATAGRID AREA --- */}
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[25, 50, 100]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
                        sx={{ border: 0 }}
                    />
                </Box>
            </Paper>

            {selectedBooking && (
                <BookingUpdateModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    bookingData={selectedBooking}
                    onSave={handleSave}
                />
            )}
        </Container>
    );
}