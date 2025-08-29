import { toast } from "react-toastify";
import * as React from "react";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Refresh, Search, FileDownload } from '@mui/icons-material';

import { fDate } from "../../../../utils/format-time";
import BookingUpdateModal from "../booking-update-modal";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredBookings, searchBooking } from "src/components/redux/reducers/booking";
import { hotelEmail, role } from "../../../../utils/util";

function CustomToolbar(props) {
    const {
        bookingId, setBookingId, handleSearch,
        status, setStatus,
        filterDate, setFilterDate,
        handleRefresh
    } = props;

    return (
        <GridToolbarContainer sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
                    sx={{ width: 180 }}
                />
                <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
                    Search
                </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <GridToolbarExport
                    csvOptions={{ fileName: `bookings-export-${new Date().toLocaleDateString()}` }}
                    component={Button}
                    startIcon={<FileDownload />}
                >
                    Export
                </GridToolbarExport>
                <Tooltip title="Clear filters and refresh">
                    <Button variant="outlined" onClick={handleRefresh} startIcon={<Refresh />}>
                        Refresh
                    </Button>
                </Tooltip>
            </Box>
        </GridToolbarContainer>
    );
}

const renderStatusChip = (statusVal) => {
    const statusMap = {
        Confirmed: { color: 'success', label: 'Confirmed' },
        Pending: { color: 'warning', label: 'Pending' },
        Cancelled: { color: 'error', label: 'Cancelled' },
        'Checked-out': { color: 'info', label: 'Checked-out' },
        'Checked-in': { color: 'primary', label: 'Checked-in' },
    };
    const { color, label } = statusMap[statusVal] || { color: 'default', label: statusVal };
    return <Chip label={label} color={color} size="small" variant="filled"/>;
};

export default function SuperAdminBookingsView() {
    const [bookingId, setBookingId] = useState("");
    const [status, setStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const filtered = useSelector((state) => state.booking.filtered) || [];
    const search = useSelector((state) => state.booking.search) || [];
    
    
    
    const bookings = search.length ? search : filtered;

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });

    const handleView = (id) => navigate(`/your-booking-details/${id}`);

    const handleUpdate = (booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };

    const columns = [
        { field: "actions", headerName: "Actions", width: 180, sortable: false, renderCell: (params) => ( <Box display="flex" gap={1}> <Button variant="contained" size="small" onClick={() => handleView(params.row.bookingId)}>View</Button> <Button variant="contained" color="secondary" size="small" onClick={() => handleUpdate(params.row)}>Update</Button> </Box> ), },
        { field: "bookingId", headerName: "Booking ID", width: 150 },
        { field: "status", headerName: "Status", width: 120, renderCell: (params) => renderStatusChip(params.value) },
        { field: "user", headerName: "User Name", width: 150, renderCell: (params) => params.row?.user?.name || "Not available"},
        { field: "source", headerName: "Source", width: 130 , renderCell: (params) => params.row?.bookingSource},
        { field: "mop", headerName: "Payment Mode", width: 130, renderCell: (params) => params.row?.pm },
        { field: "checkInDate", headerName: "Check-In", width: 150, renderCell: (params) => fDate(params?.row?.checkInDate) },
        { field: "checkOutDate", headerName: "Check-Out", width: 150, renderCell: (params) => fDate(params?.row?.checkOutDate) },
        { field: "createdAt", headerName: "Booking Date", width: 150, renderCell: (params) => fDate(params?.row?.createdAt) },
    ];

    const rows = bookings.map(booking => ({ ...booking, id: booking._id || booking.bookingId, status: booking.bookingStatus, source: booking.bookingSource || 'Site', mop: booking.pm || 'Offline' }));
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let filters = `hotelEmail=${hotelEmail}`;
                if (status) filters += `&bookingStatus=${status}`;
                if (filterDate) filters += `&date=${filterDate}`;
                
                await dispatch(fetchFilteredBookings(filters)).unwrap();
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, hotelEmail, status, filterDate]);

    const handleSearch = async () => {
        if (!bookingId.trim()) {
            toast.info("Please enter a Booking ID to search.");
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(searchBooking(bookingId)).unwrap();
        } catch (error) {
            console.error("Error searching:", error);
            toast.error(error.message || "Search failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setBookingId('');
        setStatus('');
        setFilterDate('');
        dispatch({ type: "booking/clearSearch" });
    };

    const handleSave = () => {
        setOpenModal(false);
        setSelectedBooking(null);
        handleRefresh();
    };
    
    const disableEditFields = role === "Developer" || role === "TMS" || role === "Admin";

    return (
        <Container maxWidth="xl" sx={{ my: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader
                    title="Manage Bookings"
                    subheader={`Found ${rows.length} bookings`}
                />
                <Divider />
                
                <CardContent>
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