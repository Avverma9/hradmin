import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Divider,
    Button,
    Box,
    Chip,
} from '@mui/material';

const BookingDetails = ({ booking, onClose }) => {
    // Destructure all required fields from the booking object
    const {
        vehicleNumber,
        pickupP,
        dropP,
        pickupD,
        dropD,
        bookedBy,
        customerMobile,
        bookingDate,
        price,
        bookingId,
        seats, // <-- Added seats array
        totalSeatPrice, // <-- Added total price
    } = booking;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <Paper
            elevation={1}
            sx={{
                width: "calc(100% - 64px)",
                margin: '20px auto',
                border: '2px dotted #1976d2',
                borderRadius: 3,
                p: 2,
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                    Booking Details
                </Typography>
                {onClose && (
                    <Button size="small" variant="contained" color="error" onClick={onClose}>
                        Close
                    </Button>
                )}
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Main Booking Info */}
            <Grid container spacing={1}>
                {[
                    ['Booking ID', bookingId],
                    ['Booked By', bookedBy],
                    ['Mobile', customerMobile],
                    ['Vehicle Number', vehicleNumber],
                    ['Pickup Location', pickupP],
                    ['Drop Location', dropP],
                    ['Pickup Date', formatDateTime(pickupD)],
                    ['Drop Date', formatDateTime(dropD)],
                    ['Booking Date', formatDateTime(bookingDate)],
                ]?.map(([label, value]) => (
                    <Grid item xs={12} sm={6} key={label}>
                        <Box
                            sx={{
                                backgroundColor: '#f5f5f5',
                                p: 1,
                                borderRadius: 1,
                                borderLeft: '4px solid #1976d2',
                                height: '100%',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                                {label}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {value || 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Seat Information Section */}
            {seats && seats.length > 0 && (
                <>
                    <Divider sx={{ my: 2 }}>
                        <Typography variant="overline">Seat Information</Typography>
                    </Divider>

                    <Grid container spacing={1}>
                        {seats.map((seat, index) => (
                            <Grid item xs={12} sm={6} md={4} key={seat._id || index}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1,
                                        borderRadius: 1,
                                        backgroundColor: '#e3f2fd', // Light blue background
                                        border: '1px solid #90caf9'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Seat #{seat.seatNumber}
                                        </Typography>
                                        <Chip label={seat.seatType} color="primary" size="small" sx={{ mr: 1 }} />
                                    </Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        ₹{seat.seatPrice}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* Total Price Section */}
            <Divider sx={{ my: 2 }} />
            <Box textAlign="right" sx={{ pr: 1 }}>
                <Typography variant="overline" color="text.secondary">
                    Total Amount
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    ₹{price || 0}
                </Typography>
            </Box>
        </Paper>
    );
};

export default BookingDetails;