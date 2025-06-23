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
        seatsData = [],
        bookedBy,
        customerMobile,
        bookingDate,
        bookingId,
    } = booking;

    const formatDateTime = (dateStr) =>
        new Date(dateStr).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

    // const seatCount = seatsData.length;
    // const totalPrice = seatsData.reduce((sum, seat) => sum + (seat.seatPrice || 0), 0);

    return (
        <Box
            sx={{
                maxWidth: 800,
                margin: '40px auto',
                border: '2px dotted #1976d2',
                borderRadius: 4,
                backgroundColor: '#fefefe',
                boxShadow: 3,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    padding: 4,
                    borderRadius: 4,
                    backgroundColor: 'white',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        Booking Details
                    </Typography>
                    {onClose && (
                        <Button variant="contained" color="error" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                    {[
                        ['Booking ID', bookingId],
                        ['Booked By', bookedBy],
                        ['Mobile', customerMobile],
                        ['Vehicle Number', vehicleNumber],
                        ['Pickup Location', pickupP],
                        ['Drop Location', dropP],
                        ['Pickup Date', formatDateTime(pickupD)],
                        ['Drop Date', formatDateTime(dropD)],
                        // ['Total Seats Booked', seatCount],
                        // ['Total Price', `₹${totalPrice}`],
                        ['Booking Date', formatDateTime(bookingDate)],
                    ]?.map(([label, value], index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    padding: 2,
                                    borderRadius: 2,
                                    borderLeft: '4px solid #1976d2',
                                }}
                            >
                                <Typography variant="subtitle2" color="textSecondary">
                                    {label}
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Show Seat-wise Details */}
                <Divider sx={{ my: 4 }} />
                {/* <Typography variant="h6" gutterBottom color="primary">
                    Seat Details
                </Typography>
                <Grid container spacing={2}>
                    {seatsData?.map((seat, index) => (
                        <Grid item xs={12} sm={6} key={seat._id}>
                            <Box
                                sx={{
                                    backgroundColor: '#e3f2fd',
                                    padding: 2,
                                    borderRadius: 2,
                                    borderLeft: '4px solid #0288d1',
                                }}
                            >
                                <Typography variant="subtitle2" color="textSecondary">
                                    Seat #{seat.seatNumber}
                                </Typography>
                                <Typography variant="body1">
                                    Type: {seat.seatType}
                                </Typography>
                                <Typography variant="body1">
                                    Price: ₹{seat.seatPrice}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid> */}
            </Paper>
        </Box>
    );
};

export default BookingDetails;
