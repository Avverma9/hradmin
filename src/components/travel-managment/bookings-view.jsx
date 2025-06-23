import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Divider,
    Button,
    Box,
} from '@mui/material';

const BookingDetails = ({ booking, onClose }) => {
    const {
        vehicleNumber,
        pickupP,
        dropP,
        pickupD,
        dropD,
        bookedBy,
        customerMobile,
        bookingDate,
        bookingId,
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
                border: '2px dotted #1976d2', // Border applied directly to Paper
                borderRadius: 3,
                p: 2, // Main padding
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

            <Grid container spacing={1}> {/* Further reduced spacing */}
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
                                p: 1, // Further reduced padding
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
        </Paper>
    );
};

export default BookingDetails;