import React from 'react';
import {
    Box,
    Modal,
    Avatar,
    Button,
    Typography,
    Divider,
    Grid,
    Card,
    CardContent,
    Chip,
    Tooltip,
} from '@mui/material';
import { Email, Phone, AccountCircle, Hotel, Bed } from '@mui/icons-material';  // Use available icons
import { fDate } from '../../../../utils/format-time';

const UserDetailsModal = ({ open, onClose, user }) => {
    if (!user) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 750 },
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    overflow: 'auto',
                    maxHeight: '90vh',
                }}
            >
                {/* Modal Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">User Details</Typography>
                    <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
                </Box>

                {/* User Info */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={user.profile?.[0]}
                            alt={user.name}
                            sx={{
                                width: 120,
                                height: 120,
                                border: '2px solid #ccc',
                                mx: 'auto',
                                boxShadow: 4,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {user.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccountCircle sx={{ mr: 1 }} />
                            <Typography variant="body1"><strong>User ID:</strong> {user.userId}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Email sx={{ mr: 1 }} />
                            <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Phone sx={{ mr: 1 }} />
                            <Typography variant="body1"><strong>Mobile:</strong> {user.mobile}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AccountCircle sx={{ mr: 1 }} />
                            <Typography variant="body1"><strong>Address:</strong> {user?.address}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Bookings Info */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Bookings ({user?.bookings?.length || 0})
                </Typography>
                {user.bookings?.length > 0 ? (
                    user.bookings.map((booking, index) => (
                        <Card key={index} sx={{ mb: 3 }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body1">
                                            <strong>Booking ID:</strong> {booking.bookingId}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Status:</strong>
                                            <Chip
                                                label={booking.bookingStatus}
                                                color={booking.bookingStatus === 'Confirmed' ? 'success' : 'warning'}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                        <Typography variant="body1"><strong>Price:</strong> ₹{booking.price}</Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body1">
                                            <strong>Hotel:</strong> {booking.hotelDetails?.hotelName}, {booking.hotelDetails?.hotelCity}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Check-in:</strong> {fDate(booking.checkInDate)}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Check-out:</strong> {fDate(booking.checkOutDate)}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {/* Room Details */}
                                {booking.roomDetails?.length > 0 && (
                                    <Box mt={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Room Details:
                                        </Typography>
                                        {booking.roomDetails.map((room, i) => (
                                            <Card key={i} sx={{ mb: 2, padding: 2, boxShadow: 2 }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="body2">
                                                            <strong>Room Type:</strong> {room.type}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Bed Type:</strong> {room.bedTypes}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="body2">
                                                            <strong>Price:</strong> ₹{room.price}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Capacity:</strong> {room.capacity} people
                                                        </Typography>
                                                    </Grid>
                                                </Grid>

                                                {/* Icon Display */}
                                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                                    {room.bedTypes.includes('King') && (
                                                        <Tooltip title="King Bed" arrow>
                                                            <Bed sx={{ mr: 1, color: 'primary.main' }} />  {/* Use the 'Bed' icon */}
                                                        </Tooltip>
                                                    )}
                                                    {room.bedTypes.includes('Single') && (
                                                        <Tooltip title="Single Bed" arrow>
                                                            <Bed sx={{ mr: 1, color: 'primary.main' }} />  {/* Use the 'Bed' icon */}
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </Card>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography>No bookings available for this user.</Typography>
                )}
            </Box>
        </Modal>
    );
};

export default UserDetailsModal;
