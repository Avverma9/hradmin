/* eslint-disable no-shadow */
import { CiUser } from "react-icons/ci";
import { LuHotel } from "react-icons/lu";
import { FaPhone } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { IoMailOpenOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { MdAccessTime, MdOutlineHouse, MdErrorOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../utils/loader";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Typography,
  Chip,
  Stack,
  IconButton,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Skeleton,
} from "@mui/material";
import { 
  ArrowBack, 
  CheckCircle, 
  Cancel, 
  Pending,
  LocationOn,
  CalendarToday,
  Person,
  Hotel as HotelIcon
} from "@mui/icons-material";

import { fDate, fDateTime, indianTime } from "../../../utils/format-time";
import { fetchFilteredBookings } from "../redux/reducers/booking";
import { role } from "../../../utils/util";

const BookingDetail = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/");
  const bookingId = segments[segments.length - 1];
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchBookingData = async () => {
      showLoader();
      try {
        await dispatch(fetchFilteredBookings(`bookingId=${bookingId}`));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        hideLoader();
      }
    };

    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId, dispatch]);

  useEffect(() => {
    if (filtered?.length > 0) {
      setBooking(filtered[0]);
    }
  }, [filtered]);

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'Pending':
        return 'warning';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle />;
      case 'Cancelled':
        return <Cancel />;
      case 'Pending':
        return <Pending />;
      case 'Completed':
        return <CheckCircle />;
      default:
        return null;
    }
  };

  // Loading skeleton component
  if (!booking) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={50} />
          <Skeleton variant="rectangular" width={100} height={40} sx={{ mt: 2 }} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={70} height={70} />
                  <Skeleton variant="text" width="80%" height={30} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="60%" height={20} />
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="text" height={20} sx={{ mt: 1 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Booking Details
            </Typography>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="h6">
                {booking.bookingId}
              </Typography>
              <Chip 
                icon={getStatusIcon(booking.bookingStatus)}
                label={booking.bookingStatus}
                color={getStatusColor(booking.bookingStatus)}
                variant="filled"
                sx={{ fontWeight: 'bold', color: 'white' }}
              />
            </Box>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              backdropFilter: 'blur(10px)'
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Customer Information Card */}
        <Grid item xs={12} lg={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Customer Header */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  alt="Customer Avatar"
                  src={booking.user?.profile}
                  sx={{ width: 80, height: 80, border: '3px solid #e3f2fd' }}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {booking.user?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Customer
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Pricing Summary */}
              <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  💰 Pricing Summary
                </Typography>
                
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Room Charges:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ₹{booking.roomDetails.reduce((total, room) => total + room.price, 0)}
                    </Typography>
                  </Box>

                  {booking.gstPrice && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">GST ({booking.gstPrice}%):</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{(booking.price - booking.price / (1 + booking.gstPrice / 100)).toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  {booking.foodDetails?.length > 0 && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Food Charges:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{booking.foodDetails.reduce((total, item) => total + item.price, 0)}
                      </Typography>
                    </Box>
                  )}

                  {booking.discountPrice > 0 && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="success.main">Discount:</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        -₹{booking.discountPrice}
                      </Typography>
                    </Box>
                  )}

                  <Divider />
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" fontWeight="bold">Total Amount:</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ₹{booking.price}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Contact Information */}
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <HotelIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hotel Name" 
                    secondary={booking.hotelDetails?.hotelName}
                    secondaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hotel Owner" 
                    secondary={booking.hotelDetails?.hotelOwnerName}
                    secondaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>

                {role !== "PMS" && role !== "TMS" && (
                  <>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <IoMailOpenOutline color="#1976d2" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={booking.user?.email}
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>

                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <FaPhone color="#1976d2" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Mobile" 
                        secondary={booking.user?.mobile}
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Status and Timeline Card */}
        <Grid item xs={12} lg={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📅 Booking Information
              </Typography>

              {/* Check-in/Check-out */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f0f7ff' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <CalendarToday color="primary" sx={{ mb: 1 }} />
                      <Typography variant="caption" display="block">Check-In</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {fDate(booking.checkInDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <CalendarToday color="primary" sx={{ mb: 1 }} />
                      <Typography variant="caption" display="block">Check-Out</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {fDate(booking.checkOutDate)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Rooms and Guests */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fff8e1' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <HotelIcon color="warning" sx={{ mb: 1 }} />
                      <Typography variant="caption" display="block">Rooms</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {booking.numRooms}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Person color="warning" sx={{ mb: 1 }} />
                      <Typography variant="caption" display="block">Guests</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {booking.guests}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Cancellation Alert */}
              {booking.bookingStatus === 'Cancelled' && booking.cancellationReason && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cancellation Reason:
                  </Typography>
                  <Typography variant="body2">
                    {booking.cancellationReason}
                  </Typography>
                </Alert>
              )}

              {/* Timeline Information */}
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MdAccessTime color="#1976d2" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Booking Created" 
                    secondary={fDateTime(booking.createdAt)}
                    secondaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MdAccessTime color="#1976d2" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={indianTime(booking.updatedAt)}
                    secondaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Person color="#1976d2" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Created By" 
                    secondary={`${booking.createdBy?.user} (${booking.createdBy?.email})`}
                    secondaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>

                {booking.checkInTime && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Checked In" 
                      secondary={fDateTime(booking.checkInTime)}
                      secondaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}

                {booking.checkOutTime && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Checked Out" 
                      secondary={fDateTime(booking.checkOutTime)}
                      secondaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Services and Room Details Card */}
        <Grid item xs={12} lg={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🏨 Services & Amenities
              </Typography>

              {/* Room Details */}
              {booking.roomDetails?.map((room, index) => (
                <Paper 
                  key={index} 
                  variant="outlined" 
                  sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    🛏️ Room #{index + 1}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      label={room?.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label={room?.bedTypes} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      Room Price:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ₹{room?.price}
                    </Typography>
                  </Box>
                </Paper>
              ))}

              {/* Food Details */}
              {booking.foodDetails?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🍽️ Food Services
                  </Typography>
                  
                  {booking.foodDetails.map((food, index) => (
                    <Paper 
                      key={index} 
                      variant="outlined" 
                      sx={{ p: 2, mb: 2, bgcolor: '#fff8e1', borderRadius: 2 }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {food?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Food Item #{index + 1}
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          ₹{food?.price}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </>
              )}

              {/* Quick Actions */}
              {/* <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Button variant="outlined" size="small">
                    Print Details
                  </Button>
                  <Button variant="outlined" size="small">
                    Export PDF
                  </Button>
                  <Button variant="outlined" size="small" color="warning">
                    Contact Guest
                  </Button>
                </Stack>
              </Box> */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingDetail;
