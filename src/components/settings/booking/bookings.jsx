import { toast } from "react-toastify";
import * as React from "react";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';

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
    CircularProgress,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";
import { Search, FileDownload, Clear } from "@mui/icons-material";

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

const BookingCard = React.memo(({ booking, onUpdate, onView }) => (
    <Card sx={{ mb: 2 }} variant="outlined">
        <CardContent>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="subtitle2" gutterBottom>Booking ID</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{booking.bookingId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="subtitle2" gutterBottom>User</Typography>
                    <Typography variant="body2" color="text.secondary">{booking.user?.name || 'N/A'}</Typography>
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" gutterBottom>Check-in / Check-out</Typography>
                    <Typography variant="body2" color="text.secondary">{fDate(booking.checkInDate)} - {fDate(booking.checkOutDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="subtitle2" gutterBottom>Status</Typography>
                    {renderStatusChip(booking.bookingStatus)}
                </Grid>
                <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom>Created By</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {`${booking.createdBy?.user || ''} (${booking.createdBy?.email || ''})`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {fDateTime(booking.createdAt)}
                    </Typography>
                </Grid>
            </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button variant="contained" size="small" onClick={() => onView(booking.bookingId)}>View Details</Button>
            <Button variant="contained" color="warning" size="small" onClick={() => onUpdate(booking)}>Update</Button>
        </CardActions>
    </Card>
));

export default function PanelBookings() {
    const [bookingId, setBookingId] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [status, setStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const PAGE_SIZE = 10;
    const [displayedBookings, setDisplayedBookings] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const email = hotelEmail;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showLoader, hideLoader } = useLoader();

    const { byCity } = useSelector((state) => state.hotel);
    const filtered = useSelector((state) => state.booking.filtered);
    const searchData = useSelector((state) => state.booking.search);
    
    const allBookings = searchData.length ? searchData : filtered;
    const bookingCount = allBookings.length;
    
    useEffect(() => {
        const handler = setTimeout(() => {
            if (isFetching) return;

            const fetchFilteredData = async () => {
                setIsFetching(true);
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
                    setIsFetching(false);
                }
            };

            fetchFilteredData();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [dispatch, status, filterDate, selectedCity, email]);
    
    useEffect(() => {
        dispatch(getHotelsCity());
        return () => dispatch({ type: "booking/clearSearch" });
    }, [dispatch]);

    useEffect(() => {
        setPage(1);
        const initialSlice = allBookings.slice(0, PAGE_SIZE);
        setDisplayedBookings(initialSlice);
        setHasMore(allBookings.length > PAGE_SIZE);
    }, [allBookings]);

    const loadMoreBookings = () => {
        const nextPage = page + 1;
        const nextSliceStart = displayedBookings.length;
        const nextSliceEnd = nextPage * PAGE_SIZE;
        const additionalData = allBookings.slice(nextSliceStart, nextSliceEnd);

        if (displayedBookings.length >= allBookings.length) {
            setHasMore(false);
            return;
        }

        setDisplayedBookings(prev => [...prev, ...additionalData]);
        setPage(nextPage);
    };

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
    };

    const handleExport = () => {
        if (allBookings.length === 0) { toast.info("No data to export."); return; }
        const headers = ["Booking ID", "User Name", "Status", "Source", "Payment Mode", "Check-In Date", "Check-Out Date", "Created By", "Created At"];
        const rows = allBookings.map(b => [ `"${b.bookingId || ''}"`, `"${b.user?.name || 'N/A'}"`, `"${b.bookingStatus || ''}"`, `"${b.bookingSource || "Site"}"`, `"${b.pm || "Offline"}"`, `"${fDate(b.checkInDate)}"` , `"${fDate(b.checkOutDate)}"`, `"${b.createdBy?.user || ''} (${b.createdBy?.email || ''})"` , `"${fDateTime(b.createdAt)}"`, ].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bookings-export-${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = (id) => navigate(`/your-booking-details/${id}`);
    const handleUpdate = (booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };
    const handleSave = () => {
        setOpenModal(false);
        setSelectedBooking(null);
        const currentStatus = status;
        setStatus('');
        setTimeout(() => setStatus(currentStatus), 0);
    };

    return (
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Paper elevation={3} sx={{ maxHeight: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    bgcolor: 'background.paper'
                }}>
                    <CardHeader
                        title="Panel Bookings"
                        subheader={`A total of ${bookingCount} bookings found`}
                        action={<Tooltip title="Export all bookings as CSV"><Button onClick={handleExport} variant="contained" color="secondary" startIcon={<FileDownload />}>Export</Button></Tooltip>}
                        sx={{ px: 3, pt: 3, flexShrink: 0 }}
                    />
                    <Divider />
                    <Box sx={{ p: 2, flexShrink: 0 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={2}> <TextField fullWidth label="Booking ID" variant="outlined" size="small" value={bookingId} onChange={(e) => setBookingId(e.target.value)} /> </Grid>
                            <Grid item xs={12} sm={6} md={2}> <TextField fullWidth label="Coupon Code" variant="outlined" size="small" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} /> </Grid>
                            <Grid item xs={12} sm={6} md={2}> <FormControl fullWidth size="small"> <InputLabel>City</InputLabel> <Select value={selectedCity} label="City" onChange={(e) => setSelectedCity(e.target.value)}> <MenuItem value="">All Cities</MenuItem> {byCity.map((city, index) => <MenuItem key={index} value={city}>{city}</MenuItem>)} </Select> </FormControl> </Grid>
                            <Grid item xs={12} sm={6} md={2}> <FormControl fullWidth size="small"> <InputLabel>Status</InputLabel> <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}> <MenuItem value="">All Statuses</MenuItem> {['Confirmed', 'Pending', 'Cancelled', 'Checked-in', 'Checked-out'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)} </Select> </FormControl> </Grid>
                            <Grid item xs={12} sm={6} md={2}> <TextField fullWidth type="date" variant="outlined" size="small" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} InputLabelProps={{ shrink: true }} /> </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Tooltip title="Search by ID or Coupon">
                                            <Button fullWidth variant="contained" onClick={handleSearch} startIcon={<Search />} sx={{ height: '100%' }}></Button>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Tooltip title="Clear all filters">
                                            <Button fullWidth variant="outlined" onClick={handleClearFilters} startIcon={<Clear />} sx={{ height: '100%' }}></Button>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                    <Divider />
                </Box>
                
                <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
                     <InfiniteScroll
                        dataLength={displayedBookings.length}
                        next={loadMoreBookings}
                        hasMore={hasMore}
                        loader={
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress />
                            </Box>
                        }
                        endMessage={
                            bookingCount > 0 && 
                            <Typography sx={{ textAlign: 'center', my: 2, color: 'text.secondary' }}>
                                <b>End of list.</b>
                            </Typography>
                        }
                        scrollableTarget={document.querySelector('div[style*="overflowY: auto"]')}
                    >
                        {displayedBookings.map((booking) => (
                           <BookingCard
                                key={booking._id || booking.bookingId}
                                booking={booking}
                                onView={handleView}
                                onUpdate={handleUpdate}
                           />
                        ))}
                    </InfiniteScroll>
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