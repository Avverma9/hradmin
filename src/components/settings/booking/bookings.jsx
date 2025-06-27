import { toast } from "react-toastify";
import * as React from "react";
// NEW: Importing components for the advanced layout and export feature
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
    MenuItem,
    // NEW: Card components for the layout
    Card,
    CardHeader,
    CardContent,
    Divider,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Tooltip,
} from "@mui/material";
import { Search, Refresh, FileDownload } from "@mui/icons-material";


import { fDate } from "../../../../utils/format-time";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../../utils/loader";

import { getHotelsCity } from "src/components/redux/reducers/hotel";
import BookingUpdateModal from "src/components/bookings/booking-update-modal";
import { fetchFilteredBookings, searchBooking } from "src/components/redux/reducers/booking";
import { hotelEmail } from "../../../../utils/util";


// --- NEW: Toolbar component to house your existing filters and add new actions ---
function CustomToolbar({
    bookingId, setBookingId,
    couponCode, setCouponCode,
    selectedCity, setSelectedCity,
    byCity,
    handleSearch, handleRefresh,
}) {
    return (
        <GridToolbarContainer sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            {/* Your original filters, now organized in the toolbar */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="Booking ID"
                    variant="outlined"
                    size="small"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                />
                <TextField
                    label="Coupon Code"
                    variant="outlined"
                    size="small"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by City</InputLabel>
                    <Select
                        value={selectedCity}
                        label="Filter by City"
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <MenuItem value="">All Cities</MenuItem>
                        {byCity.map((city, index) => (
                            <MenuItem key={index} value={city}>{city}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
                    Search
                </Button>
            </Box>

            {/* Your original refresh button + the new export feature */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <GridToolbarExport
                    csvOptions={{ fileName: `panel-bookings-${new Date().toLocaleDateString()}` }}
                    component={Button}
                    startIcon={<FileDownload />}
                >
                    Export
                </GridToolbarExport>
                <Tooltip title="Reload Page">
                    <Button variant="outlined" onClick={handleRefresh} startIcon={<Refresh />}>
                        Refresh
                    </Button>
                </Tooltip>
            </Box>
        </GridToolbarContainer>
    );
}

// --- NEW: Helper function for displaying status chips (UI only) ---
const renderStatusChip = (statusVal) => {
    const statusMap = {
        Confirmed: { color: 'success', label: 'Confirmed' },
        Pending: { color: 'warning', label: 'Pending' },
        Cancelled: { color: 'error', label: 'Cancelled' },
    };
    const { color, label } = statusMap[statusVal] || { color: 'default', label: statusVal };
    return <Chip label={label} color={color} size="small" />;
};


export default function PanelBookings() {
    // --- ALL YOUR ORIGINAL STATE AND LOGIC IS PRESERVED ---
    const [bookingId, setBookingId] = useState("");
    const [couponCode, setCouponCode] = useState("")
    const [status, setStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const { byCity } = useSelector((state) => state.hotel);
    const [selectedCity, setSelectedCity] = useState("");
    const email = hotelEmail
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const filtered = useSelector((state) => state.booking.filtered);
    const search = useSelector((state) => state.booking.search);
    const { showLoader, hideLoader } = useLoader();
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const bookings = search.length ? search : filtered;
    const bookingCount = bookings.length;

    useEffect(() => {
        dispatch({ type: "booking/clearSearch" });
    }, [dispatch]);

    // --- Columns definition with only one UI change for the status chip ---
    const columns = [
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
                <div>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleView(params.row.bookingId)}
                    >
                        View
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => handleUpdate(params.row)}
                        style={{ marginLeft: "10px" }}
                    >
                        Update
                    </Button>
                </div>
            ),
        },
        { field: "bookingId", headerName: "Booking ID", width: 150 },
        { field: "user", headerName: "User", width: 100 },
        { field: "createdBy", headerName: "Created/Updated By", width: 250 },
        // UI CHANGE ONLY: using renderCell to show a chip. The data is the same.
        { field: "status", headerName: "Status", width: 110, renderCell: (params) => renderStatusChip(params.value) },
        { field: "source", headerName: "Source", width: 130 },
        { field: "mop", headerName: "Payment Mode", width: 130 },
        { field: "checkInDate", headerName: "Check-In Date", width: 180 },
        { field: "checkOutDate", headerName: "Check-Out Date", width: 180 },
        { field: "createdAt", headerName: "Created At", width: 180 },
    ];

    // --- YOUR ORIGINAL LOGIC - UNCHANGED ---
    const rows = bookings?.map((booking) => ({
        id: booking._id || booking.bookingId,
        bookingId: booking.bookingId,
        user: booking.user?.name,
        createdBy: booking.createdBy?.user + " (" + booking.createdBy?.email + ")",
        status: booking.bookingStatus,
        source: booking.bookingSource || "Site",
        mop: booking.pm || "Offline",
        checkInDate: fDate(booking.checkInDate),
        checkOutDate: fDate(booking.checkOutDate),
        createdAt: fDate(booking.createdAt),
        roomDetails: booking.roomDetails,
        foodDetails: booking.foodDetails,
        price: booking.price,
        numRooms: booking.numRooms,
        guests: booking.guests,
    }));

    useEffect(() => {
        fetchData();
    }, [status, filterDate, selectedCity]);

    useEffect(() => {
        dispatch(getHotelsCity());
    }, [dispatch]);

    const fetchData = async () => {
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
    };

    const handleSearch = async () => {
        showLoader();
        try {
            if (bookingId) {
                await dispatch(searchBooking({ bookingId }));
            } else if (couponCode) {
                await dispatch(searchBooking({ couponCode }));
            } else {
                toast.warn("Please enter a booking ID or coupon code");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Search failed");
        } finally {
            hideLoader();
        }
    };

    const handleView = (bookingId) =>
        navigate(`/your-booking-details/${bookingId}`);

    const handleUpdate = (booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };

    const handleSave = async () => {
        setOpenModal(false);
        setSelectedBooking(null);
        fetchData();
    };

    const handleRefresh = () => window.location.reload();

    return (
        // --- NEW: Advanced card layout wrapping your existing component ---
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader
                    title="Panel Bookings"
                    subheader={`A total of ${bookingCount} bookings found`}
                />
                <Divider />

                {/* The DataGrid with the new CustomToolbar */}
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    slots={{
                        toolbar: CustomToolbar,
                        noRowsOverlay: () => <Box sx={{ p: 4, textAlign: 'center' }}>No bookings found.</Box>,
                    }}
                    slotProps={{
                        toolbar: {
                            bookingId, setBookingId,
                            couponCode, setCouponCode,
                            selectedCity, setSelectedCity,
                            byCity,
                            handleSearch, handleRefresh,
                        },
                    }}
                    sx={{ border: 0 }}
                />
            </Card>

            {/* Your original modal logic, preserved outside the main card */}
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