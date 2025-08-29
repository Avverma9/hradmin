/* eslint-disable no-shadow */
import { CiUser } from "react-icons/ci";
import { LuHotel } from "react-icons/lu";
import { FaPhone } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { IoMailOpenOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { MdAccessTime, MdOutlineHouse, MdErrorOutline } from "react-icons/md"; // Added MdErrorOutline
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "../../../utils/loader";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Grid,
  Paper,
  Button,
  Avatar,
  Divider,
  Typography,
} from "@mui/material";

import { fDate, fDateTime, indianTime } from "../../../utils/format-time";
import { fetchFilteredBookings } from "../redux/reducers/booking";
import { role } from "../../../utils/util";

const BookingDetail = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null); // Initialize with null
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/");
  const bookingId = segments[segments.length - 1];
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);
  const { showLoader, hideLoader } = useLoader();


  const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    section: {
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      border: "1px solid #ccc",
      borderRadius: theme.shape.borderRadius,
      height: '100%', // Make sections equal height
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

  // Return a loading state or null if no booking data yet
  if (!booking) {
    return (
        <Box mt={3} mx={3}>
            <Typography variant="h4" gutterBottom>
                Loading Booking Details...
            </Typography>
        </Box>
    );
  }

  return (
    <Box mt={3} mx={3}>
      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>
      <Button variant="outlined" color="primary" onClick={handleBack} sx={{mb: 2}}>
        Back
      </Button>
      <Divider />
      <Paper elevation={3} className={classes.paper} sx={{mt: 2}}>
        <Grid container spacing={3}>
          {/* Customer, Hotel and Owner Info Section */}
          <Grid item xs={12} md={4}>
            <Box className={classes.section}>
              <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Grid item>
                  <Avatar
                    alt="User Avatar"
                    src={booking.user?.profile}
                    className={classes.avatar}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" noWrap>{booking.user?.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {booking.bookingId} ({booking.bookingStatus})
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Pricing Summary
              </Typography>

              <Typography variant="body2">
                Price (incl. GST): ₹{booking.price}
              </Typography>

              {booking.gstPrice ? (
                <Typography variant="body2">
                  GST ({booking.gstPrice}%): ₹
                  {(
                    booking.price -
                    booking.price / (1 + booking.gstPrice / 100)
                  ).toFixed(2)}
                </Typography>
              ) : (
                <Typography variant="body2">GST: Not Applicable</Typography>
              )}

              {booking.foodDetails?.length > 0 && (
                <Typography variant="body2">
                  Food Charges: ₹
                  {booking.foodDetails.reduce((total, item) => total + item.price, 0)}
                </Typography>
              )}

              {booking.discountPrice > 0 && (
                <Typography variant="body2" color="success.main">
                  Coupon Discount: - ₹{booking.discountPrice}
                </Typography>
              )}
              <Typography variant="h6" sx={{mt: 1}}>
                Total : ₹
                {(() => {
                  const food = booking.foodDetails?.reduce(
                    (total, item) => total + item.price,
                    0
                  ) || 0;
                  const discount = booking.discountPrice || 0;
                  return (booking.price + food - discount).toFixed(2);
                })()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <CiUser /> Customer Name
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking.user?.name}
              </Typography>

              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <LuHotel /> Hotel Name
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking.hotelDetails?.hotelName}
              </Typography>

              <Typography variant="subtitle1">Hotel Owner Name:</Typography>
              <Typography variant="body2" gutterBottom>
                {booking.hotelDetails?.hotelOwnerName}
              </Typography>

              {/* Corrected role check */}
              {role !== "PMS" && role !== "TMS" && (
                <>
                  <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <IoMailOpenOutline /> Email
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {booking.user?.email}
                  </Typography>
                  <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <FaPhone /> Mobile
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {booking.user?.mobile}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          {/* Check-in/Check-out and Booking Status Section */}
          <Grid item xs={12} md={4}>
            <Box className={classes.section}>
              <Typography variant="subtitle1">Check-In / Check-out</Typography>
              <Typography variant="body2" gutterBottom>
                {fDate(booking.checkInDate)} / {fDate(booking.checkOutDate)}
              </Typography>
              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <LuHotel /> Rooms / <CiUser /> Guests
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking.numRooms}- Room / {booking.guests}- Guest
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1">Booking Status:</Typography>
              <Typography variant="body2" gutterBottom>
                {booking.bookingStatus}
              </Typography>
              
              {/* --- ADDED CANCELLATION REASON SECTION --- */}
              {booking.bookingStatus === 'Cancelled' && booking.cancellationReason && (
                <>
                  <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1,color: 'error.main'}}>
                    <MdErrorOutline /> Cancellation Reason
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{color: 'error.main'}}>
                    {booking.cancellationReason}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <CiUser /> Status Updated On
              </Typography>
              <Typography variant="body2" gutterBottom>
                {indianTime(booking.updatedAt)}
              </Typography>
              
              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <CiUser /> Created/Updated By
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking.createdBy?.user} ({booking.createdBy?.email})
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <MdAccessTime /> Booking Time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDateTime(booking.createdAt)}
              </Typography>
              
              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <MdAccessTime /> Check-in Time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDateTime(booking.checkInTime) || "Not Checked in"}
              </Typography>
              
              <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <MdAccessTime /> Check-out Time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDateTime(booking.checkOutTime) || "Not Checked out"}
              </Typography>
            </Box>
          </Grid>

          {/* Services Section */}
          <Grid item xs={12} md={4}>
            <Box className={classes.section}>
              <Typography variant="h6" gutterBottom>
                Services
              </Typography>
              <Box display="flex" flexDirection="column">
                {booking.roomDetails?.map((room, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <LuHotel /> Room Details #{index + 1}
                    </Typography>
                    <Typography variant="body2">Type: {room?.type}</Typography>
                    <Typography variant="body2">Bed Type: {room?.bedTypes}</Typography>
                    <Typography variant="body2">Price: ₹{room?.price}</Typography>
                  </Box>
                ))}
                
                {booking.roomDetails?.length > 0 && booking.foodDetails?.length > 0 && <Divider sx={{my: 1}} />}

                {booking.foodDetails?.map((food, index) => (
                  <Box key={index} mt={1}>
                    <Typography variant="subtitle1">Food Details #{index + 1}</Typography>
                    <Typography variant="body2">Name: {food?.name}</Typography>
                    <Typography variant="body2">Price: ₹{food?.price}</Typography>
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