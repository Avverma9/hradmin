/* eslint-disable no-shadow */
import { CiUser } from 'react-icons/ci';
import { LuHotel } from 'react-icons/lu';
import { FaPhone } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { IoMailOpenOutline } from 'react-icons/io5';
import { LiaRupeeSignSolid } from 'react-icons/lia';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdAccessTime, MdOutlineHouse } from 'react-icons/md';

import { makeStyles } from '@mui/styles';
import {
  Box,
  Grid2,
  Paper,
  Button,
  Avatar,
  Divider,
  Container,
  Typography,
  LinearProgress,
} from '@mui/material';

import { fDate, fDateTime } from '../../../utils/format-time';
import { fetchFilteredBookings } from 'src/redux/reducers/booking';
import { useDispatch, useSelector } from 'react-redux';
import { useLoader } from '../../../utils/loader';

const BookingDetail = () => {
  const [booking, setBooking] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);

  const path = location.pathname;
  const segments = path.split('/');
  const bookingId = segments[segments.length - 1];
  const { showLoader, hideLoader } = useLoader();
  const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    section: {
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      border: '1px solid #ccc',
      borderRadius: theme.shape.borderRadius,
    },
    avatar: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }));
  const classes = useStyles();

  useEffect(() => {
    const fetchBookingData = async () => {
      showLoader();
      try {
        await dispatch(fetchFilteredBookings(`bookingId=${bookingId}`));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        hideLoader();
      }
    };

    fetchBookingData();
  }, [bookingId, dispatch, showLoader, hideLoader]);

  useEffect(() => {
    if (filtered?.length > 0) {
      setBooking(filtered[0]); // Assuming you're getting a list and want the first item
    }
  }, [filtered]);
  const handleBack = () => {
    navigate(-1); // Go back to the previous location
  };

  if (filtered?.length < 0) {
    showLoader();
  } else {
    hideLoader();
  }

  return (
    <Box mt={3} mx={3}>
      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>
      <Button variant="outlined" color="primary" onClick={handleBack}>
        Back
      </Button>
      <hr />
      <Paper elevation={3} className={classes.paper}>
        <Grid2 container spacing={3}>
          {/* Customer, Hotel and Owner Info Section */}
          <Grid2 item xs={12} sm={6} md={4}>
            <Box className={classes.section}>
              <Grid2 container alignItems="center" spacing={2}>
                <Grid2 item>
                  <Avatar
                    alt="User Avatar"
                    src={booking?.user?.profile}
                    className={classes.avatar}
                  />
                </Grid2>
                <Grid2 item>
                  <Typography variant="h6">{booking?.user?.name}</Typography>
                </Grid2>
                <Grid2 item>
                  <Typography variant="h6">
                    {booking?.bookingId} ({booking?.bookingStatus})
                  </Typography>
                </Grid2>
              </Grid2>

              <Grid2 item>
                <Typography variant="h6">
                  Price <LiaRupeeSignSolid />
                  {booking?.price}
                </Typography>
              </Grid2>
              <Divider sx={{ margin: '16px 0' }} />
              <Typography variant="subtitle1">
                <CiUser /> Customer Name
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.user?.name}
              </Typography>
              <Typography variant="subtitle1">
                <LuHotel /> Hotel Name
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.hotelName}
              </Typography>
              <Typography variant="subtitle1">Hotel Owner Name:</Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.hotelOwnerName}
              </Typography>
              <Typography variant="subtitle1">
                <IoMailOpenOutline /> Email
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.user?.email}
              </Typography>
              <Typography variant="subtitle1">
                <FaPhone /> Mobile
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.user?.mobile}
              </Typography>
            </Box>
          </Grid2>

          {/* Check-in/Check-out and Booking Status Section */}
          <Grid2 item xs={12} sm={6} md={4}>
            <Box className={classes.section}>
              <Typography variant="subtitle1">Check-In / Check-out</Typography>
              <Typography variant="body2" gutterBottom>
                {fDate(booking?.checkInDate)} / {fDate(booking?.checkOutDate)}
              </Typography>
              <Typography variant="subtitle1">
                <LuHotel /> Rooms / <CiUser /> Guests
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.numRooms}- Room / {booking?.guests}- Guest
              </Typography>
              <hr />
              <Typography variant="subtitle1">Booking Status:</Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.bookingStatus}
              </Typography>
              <Typography variant="subtitle1">
                <MdAccessTime /> Booking time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDate(booking?.createdAt)}
              </Typography>
              <Typography variant="subtitle1">
                <MdAccessTime /> Check in time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDateTime(booking?.checkInTime) || 'Not Checked in'}
              </Typography>
              <Typography variant="subtitle1">
                <MdAccessTime /> Check out time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDateTime(booking?.checkOutTime) || 'Not Checked out'}
              </Typography>
            </Box>
          </Grid2>

          {/* Services Section */}
          <Grid2 item xs={12} md={4}>
            <Box className={classes.section}>
              <Typography variant="h6" gutterBottom>
                Services
              </Typography>
              <Box display="flex" flexDirection="column">
                {/* Room Details */}
                <Box marginBottom={2}>
                  {booking?.roomDetails?.map((room, index) => (
                    <Box key={index} marginTop={1}>
                      <Typography variant="subtitle1">
                        <LuHotel /> Room Details
                      </Typography>
                      <Typography variant="body2">
                        Type: {room?.type} <MdOutlineHouse />
                      </Typography>
                      <Typography variant="body2">Bed Type: {room?.bedTypes}</Typography>
                      <Typography variant="body2">Price: {room?.price}</Typography>
                      {index !== booking.roomDetails.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
                {/* Food Details */}
                <Box>
                  {booking?.foodDetails?.map((food, index) => (
                    <Box key={index} marginTop={1}>
                      <Typography variant="subtitle1">Food Details:</Typography>
                      <Typography variant="body2">Food Name: {food?.name}</Typography>
                      <Typography variant="body2">Price: {food?.price}</Typography>
                      <Typography variant="body2">Quantity: {food?.quantity}</Typography>
                      {index !== booking.foodDetails.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      </Paper>
    </Box>
  );
};

export default BookingDetail;
