/* eslint-disable no-shadow */
import { CiUser } from "react-icons/ci";
import { LuHotel } from "react-icons/lu";
import { FaPhone } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { IoMailOpenOutline } from "react-icons/io5";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { useLocation, useNavigate } from "react-router-dom";
import { MdAccessTime, MdOutlineHouse } from "react-icons/md";
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

import { localUrl } from "../../../utils/util";
import { fDate, fDateTime, indianTime } from "../../../utils/format-time";
import { fetchFilteredBookings } from "../redux/reducers/booking";

const BookingDetail = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState([]);
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/");
  const bookingId = segments[segments.length - 1];
  const dispatch = useDispatch();
  const filtered = useSelector((state) => state.booking.filtered);
  const { showLoader, hideLoader } = useLoader();
  const role = localStorage.getItem("user_role");
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
    },
    avatar: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }));
  const classes = useStyles();
  const visibleTo = () => {
    role === "PMS" || role === "TMS";
  };
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

    fetchBookingData();
  }, [bookingId, dispatch, showLoader, hideLoader]);
  useEffect(() => {
    if (filtered?.length > 0) {
      setBooking(filtered[0]); // Assuming you're getting a list and want the first item
    }
  }, [filtered]);
  const handleBack = () => {
    navigate(-1);
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
        <Grid container spacing={3}>
          {/* Customer, Hotel and Owner Info Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Box className={classes.section}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar
                    alt="User Avatar"
                    src={booking?.user?.profile}
                    className={classes.avatar}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h6">{booking?.user?.name}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6">
                    {booking?.bookingId} ({booking?.bookingStatus})
                  </Typography>
                </Grid>
              </Grid>

              <Grid item>
                <Box marginTop={1}>
                  <Typography variant="subtitle1" gutterBottom>
                    Pricing Summary
                  </Typography>

                  {/* Base Price incl GST */}
                  <Typography variant="body2">
                    Price (incl. GST): ₹{booking?.price}
                  </Typography>

                  {/* GST Amount */}
                  {booking?.gstPrice ? (
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

                  {/* Food Price */}
                  {booking?.foodDetails?.length > 0 && (
                    <Typography variant="body2">
                      Food Charges: ₹
                      {booking.foodDetails.reduce((total, item) => total + item.price, 0)}
                    </Typography>
                  )}

                  {/* Coupon Discount */}
                  {booking?.discountPrice > 0 && (
                    <Typography variant="body2" color="success.main">
                      Coupon Discount: - ₹{booking?.discountPrice}
                    </Typography>
                  )}
                  {/* Total Final Price */}
                  <Typography variant="h6">
                    Total : ₹
                    {(() => {
                      const gst = booking?.gstPrice
                        ? booking.price -
                        booking.price / (1 + booking.gstPrice / 100)
                        : 0;
                      const food = booking?.foodDetails?.reduce(
                        (total, item) => total + item.price,
                        0
                      );
                      const discount = booking?.discountPrice || 0;
                      return (booking.price + food - discount).toFixed(2);
                    })()}
                  </Typography>
                </Box>
              </Grid>
              <Divider sx={{ margin: "16px 0" }} />
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
                {booking?.hotelDetails?.hotelName}
              </Typography>
              <Typography variant="subtitle1">Hotel Owner Name:</Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.hotelDetails?.hotelOwnerName}
              </Typography>
              {(role !== "PMS" || role !== "TMS") && (
                <>
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
                </>
              )}
            </Box>
          </Grid>

          {/* Check-in/Check-out and Booking Status Section */}
          <Grid item xs={12} sm={6} md={4}>
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
              <Typography variant="subtitle1">
                <CiUser /> Booking {booking?.bookingStatus} on
              </Typography>
              <Typography variant="body2" gutterBottom>
                {indianTime(booking?.updatedAt)}
              </Typography>
              <Typography variant="subtitle1">
                <CiUser /> Created/Updated By
              </Typography>
              <Typography variant="body2" gutterBottom>
                {booking?.createdBy?.user} ({booking?.createdBy?.email})
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
                {fDateTime(booking?.checkInTime) || "Not Checked in"}
              </Typography>
              <Typography variant="subtitle1">
                <MdAccessTime /> Check out time
              </Typography>
              <Typography variant="body2" gutterBottom>
                {fDateTime(booking?.checkOutTime) || "Not Checked out"}
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
                      <Typography variant="body2">
                        Bed Type: {room?.bedTypes}
                      </Typography>
                      <Typography variant="body2">
                        Price: {room?.price}
                      </Typography>
                      {index !== booking.roomDetails.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
                {/* Food Details */}
                <Box>
                  {booking?.foodDetails?.map((food, index) => (
                    <Box key={index} marginTop={1}>
                      <Typography variant="subtitle1">Food Details:</Typography>
                      <Typography variant="body2">
                        Food Name: {food?.name}
                      </Typography>
                      <Typography variant="body2">
                        Price: {food?.price}
                      </Typography>
                      {index !== booking.foodDetails.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  );
};

export default BookingDetail;
