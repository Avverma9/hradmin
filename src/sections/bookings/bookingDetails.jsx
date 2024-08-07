/* eslint-disable import/no-duplicates */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */

import { CiUser } from 'react-icons/ci';
import { LuHotel } from 'react-icons/lu';
import { FaPhone } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';
import { MdOutlineHouse } from 'react-icons/md';
import React, { useState, useEffect } from 'react';
import { IoMailOpenOutline } from 'react-icons/io5';
import { LiaRupeeSignSolid } from 'react-icons/lia';
import { useLocation, useNavigate } from 'react-router-dom';

import { makeStyles } from '@mui/styles';
import { Box, Grid, Paper, Button, Avatar, Divider, Container, Typography } from '@mui/material';

import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';
import { fDate } from 'src/utils/format-time';

const BookingDetail = () => {
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split('/');
  const bookingId = segments[segments.length - 1];
  const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    section: {
      marginBottom: theme.spacing(3),
    },
    avatar: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }));
  const classes = useStyles();
  const fetchBookingData = async (bookingId) => {
    try {
      const response = await fetch(
        `${localUrl}/get/all/filtered/booking/by/query?bookingId=${bookingId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setBooking(data[0]);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      // Handle error
    }
  };

  useEffect(() => {
    fetchBookingData(bookingId);
  }, [bookingId]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous location
  };

  if (!booking) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  return (
    <Box mt={3} mx={3}>
      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>
      <Button variant="outlined" color="primary" onClick={handleBack}>
        Back
      </Button>

      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} className={classes.section}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar alt="User Avatar" src={booking?.user?.profile} className={classes.avatar} />
              </Grid>

              <Grid item>
                <Typography variant="h6">Booking ID: {booking?.bookingId}</Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                Price <LiaRupeeSignSolid />
                {booking?.price}
              </Typography>
            </Grid>
            <Divider sx={{ margin: '16px 0' }} />
            <Typography variant="subtitle1">
              <CiUser /> User
            </Typography>
            <Typography variant="body2" gutterBottom>
              {booking?.user?.name}
            </Typography>
            <Typography variant="subtitle1">
              {' '}
              <LuHotel />{" "}
              Hotel Name
            </Typography>
            <Typography variant="body2" gutterBottom>
              {booking?.hotelName}
            </Typography>
            <Typography variant="subtitle1">Hotel Owner Name:</Typography>
            <Typography variant="body2" gutterBottom>
              {booking?.hotelOwnerName}
            </Typography>
            <Typography variant="subtitle1">
              {' '}
              <IoMailOpenOutline />{" "}
              Email
            </Typography>
            <Typography variant="body2" gutterBottom>
              {booking?.user?.email}
            </Typography>

            <Typography variant="subtitle1">
              {' '}
              <FaPhone />{" "}
              Mobile
            </Typography>
            <Typography variant="body2" gutterBottom>
              {booking?.user?.mobile}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4} className={classes.section}>
            <Typography variant="subtitle1">Check-In / Check-out</Typography>
            <Typography variant="body2" gutterBottom>
              {fDate(booking?.checkInDate)} / {fDate(booking?.checkOutDate)}
            </Typography>
            <Typography variant="subtitle1">
              <LuHotel />
              Rooms / <CiUser />
              Guests
            </Typography>

            <Typography variant="body2" gutterBottom>
              {booking?.numRooms}- Room/ {booking?.guests}- Guest
            </Typography>
            <hr />
            <Typography variant="subtitle1">Booking Status:</Typography>
            <Typography variant="body2" gutterBottom>
              {booking?.bookingStatus}
            </Typography>
            <Typography variant="subtitle1">
              {' '}
              <MdAccessTime />{" "}
              Booking time
            </Typography>
            <Typography variant="body2" gutterBottom>
              {fDate(booking?.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} className={classes.section}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Box display="flex" flexDirection="column">
              {/* Room Details */}
              <Box marginBottom={2}>
                {booking?.roomDetails?.map((room, index) => (
                  <Box key={index} marginTop={1}>
                    <Typography variant="subtitle1">
                      {' '}
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
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BookingDetail;
