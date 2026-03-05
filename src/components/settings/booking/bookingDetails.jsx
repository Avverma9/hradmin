import React, { useState, useEffect, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "src/components/redux/reducers/booking";
import { useLoader } from "../../../../utils/loader";
import { applyCoupon } from "src/components/redux/reducers/coupon";
import { hotelEmail, userName } from "../../../../utils/util";
import { getGst } from "src/components/redux/reducers/gst";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Modal,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Add, Remove, Close, Edit } from "@mui/icons-material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 320 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 2,
};

const datePickerStyles = `
  .custom-datepicker .react-datepicker {
    border: none;
    font-family: inherit;
    box-shadow: none;
    padding: 0;
  }
  .custom-datepicker .react-datepicker__header {
    background-color: white;
    border-bottom: none;
    padding-top: 0;
  }
  .custom-datepicker .react-datepicker__current-month {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
  }
  .custom-datepicker .react-datepicker__navigation--previous,
  .custom-datepicker .react-datepicker__navigation--next {
    top: 10px;
  }
  .custom-datepicker .react-datepicker__day-name {
    color: #9e9e9e;
    font-weight: 500;
  }
  .custom-datepicker .react-datepicker__day {
    width: 2.2rem;
    height: 2.2rem;
    line-height: 2.2rem;
    margin: 0.1rem;
  }
  .custom-datepicker .react-datepicker__day--selected,
  .custom-datepicker .react-datepicker__day--in-selecting-range,
  .custom-datepicker .react-datepicker__day--in-range {
    background-color: #1976d2 !important;
    color: white !important;
    border-radius: 50%;
  }
  .custom-datepicker .react-datepicker__day--range-start,
  .custom-datepicker .react-datepicker__day--range-end {
    border-radius: 50%;
  }
  .custom-datepicker .react-datepicker__day--in-range {
    border-radius: 0;
  }
  .custom-datepicker .react-datepicker__day--keyboard-selected {
    background-color: #e3f2fd;
    color: #333;
  }
  .custom-datepicker .react-datepicker__day:hover {
    background-color: #e3f2fd !important;
    color: #333 !important;
  }
`;

const BookingDetails = ({ food, room, hotel, email, owner, address, city }) => {
  const [inDate, setInDate] = useState(null);
  const [outDate, setOutDate] = useState(null);
  const [numRooms, setNumRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPrice, setDiscountPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const { gst } = useSelector((state) => state.gst);
  const foodItems = Array.isArray(food) ? food[food.length - 1] : food;
  const roomItems = Array.isArray(room) ? room[room.length - 1] : room;

  const userId = sessionStorage.getItem("subid");
  const hotelId = sessionStorage.getItem("subhotelId");

  const roomSectionRef = useRef(null);
  const foodSectionRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    setInDate(today);
    setOutDate(tomorrow);
  }, []);

  const calculateDaysDifference = () => {
    if (!inDate || !outDate) return 0;
    const timeDifference = outDate.getTime() - inDate.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setInDate(start);
    setOutDate(end);
  };

  const calculateRoomPriceBeforeDiscount = useCallback(() => {
    const days = calculateDaysDifference();
    const roomPrice = parseFloat(roomItems?.price || 0);
    return roomPrice * numRooms * days;
  }, [inDate, outDate, roomItems, numRooms]);

  const calculateRoomPriceWithDiscount = useCallback(() => {
    const priceBeforeDiscount = calculateRoomPriceBeforeDiscount();
    return Math.max(0, priceBeforeDiscount - discountPrice);
  }, [calculateRoomPriceBeforeDiscount, discountPrice]);

  const calculateFoodPrice = () => {
    const days = calculateDaysDifference();
    const foodPrice = parseFloat(foodItems?.price || 0);
    return foodPrice * days;
  };

  const calculateGstAmount = () => {
    const roomPriceBeforeDiscount = calculateRoomPriceBeforeDiscount();
    const gstPercent = parseFloat(gst?.gstPrice || 0);
    return (gstPercent / 100) * roomPriceBeforeDiscount;
  };

  const calculateFinalPrice = () => {
    const roomPriceBeforeDiscount = calculateRoomPriceBeforeDiscount();
    const totalFoodPrice = calculateFoodPrice();
    const gstAmount = calculateGstAmount();
    // Sum everything and then apply the discount
    const finalPrice = roomPriceBeforeDiscount + totalFoodPrice + gstAmount - discountPrice;
    return Math.round(Math.max(0, finalPrice));
  };

  useEffect(() => {
    const priceBeforeGST = calculateRoomPriceBeforeDiscount();
    if (priceBeforeGST > 0) {
      dispatch(getGst({ type: "Hotel", gstThreshold: priceBeforeGST }));
    }
  }, [dispatch, calculateRoomPriceBeforeDiscount]);

  const handleBooking = async () => {
    if (!inDate || !outDate || guests <= 0) {
      toast.error(
        "Please select valid check-in and check-out dates and guests.",
      );
      return;
    }

    setIsBooking(true);

    const finalPrice = calculateFinalPrice();

    const bookingData = {
      checkInDate: inDate.toISOString().split("T")[0],
      checkOutDate: outDate.toISOString().split("T")[0],
      guests,
      numRooms,
      foodDetails: food,
      roomDetails: room,
      discountPrice,
      hotelName: hotel,
      couponCode,
      hotelEmail: email,
      hotelOwnerName: owner,
      gstPrice: gst?.gstPrice || 0,
      createdBy: { user: userName, email: hotelEmail },
      destination: address,
      hotelCity: city,
      bookingSource: "Panel",
    };

    try {
      const response = await dispatch(
        createBooking({ userData: { userId, hotelId }, bookingData }),
      ).unwrap();
      console.log("Booking response:", response);
      setBookingSuccessData(response.data);
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code.");
      return;
    }
    showLoader();
    try {
      const payload = {
        couponCode,
        hotelIds: [hotelId],
        roomIds: [roomItems?.roomId],
        userIds: [userId],
        type: "hotel",
      };
      const response = await dispatch(applyCoupon(payload)).unwrap();
      const appliedCoupon = Array.isArray(response) ? response[0] : response;
      const discount = Number(appliedCoupon?.discountPrice || 0);
      const original = Number(
        appliedCoupon?.originalPrice || calculateRoomPriceBeforeDiscount()
      );
      setDiscountPrice(discount);
      setDiscountPercentage(
        original > 0 ? Math.round((discount / original) * 100) : 0
      );
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error("Failed to apply coupon. Please check the code.");
      setDiscountPrice(0);
      setDiscountPercentage(0);
    } finally {
      hideLoader();
    }
  }, [
    dispatch,
    showLoader,
    hideLoader,
    couponCode,
    hotelId,
    roomItems,
    userId,
    calculateRoomPriceBeforeDiscount,
  ]);

  return (
    <Box
      sx={{ p: 1, maxWidth: 360, mx: "auto", fontFamily: "Roboto, sans-serif" }}
    >
      <style>{datePickerStyles}</style>
      <Paper elevation={3} sx={{ p: 2, mb: 1, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={1} textAlign="center">
          Booking Summary
        </Typography>

        {/* Selected Details */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          <Box
            onClick={() => setShowDatePickers(true)}
            sx={{
              p: 1,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Check-in - Check-out
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight="bold">
                  {inDate?.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  }) || "Select"}{" "}
                  -{" "}
                  {outDate?.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  }) || "Select"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Divider />
          <Box
            onClick={() => setShowRoomGuestPicker(true)}
            sx={{
              p: 1,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Rooms & Guests
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight="bold">
                  {numRooms} Room{numRooms > 1 ? "s" : ""}, {guests} Guest
                  {guests > 1 ? "s" : ""}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Room and Food Items */}
        <Box mb={1.5}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold">
                {roomItems?.type}
              </Typography>
              {roomItems?.countRooms === 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: "bold",
                  }}
                >
                  Sold Out
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              startIcon={<Edit sx={{ fontSize: "12px !important" }} />}
              onClick={() =>
                roomSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              sx={{ p: 0.5 }}
            >
              Edit
            </Button>
          </Box>
          {foodItems && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" fontWeight="bold">
                {foodItems?.name}
              </Typography>
              <Button
                size="small"
                startIcon={<Edit sx={{ fontSize: "12px !important" }} />}
                onClick={() =>
                  foodSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                sx={{ p: 0.5 }}
              >
                Edit
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Price Breakdown */}
        <Typography variant="body1" fontWeight="bold" mb={1.5}>
          Price Breakdown
        </Typography>
        <Grid container spacing={0.5}>
          <Grid item xs={8}>
            <Typography variant="body2" color="text.secondary">
              Room Price ({calculateDaysDifference()} nights)
            </Typography>
          </Grid>
          <Grid item xs={4} textAlign="right">
            <Typography variant="body2">
              ₹{calculateRoomPriceBeforeDiscount()}
            </Typography>
          </Grid>
          {discountPrice > 0 && (
            <>
              <Grid item xs={8}>
                <Typography variant="body2" color="success.main">
                  Coupon Discount
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="body2" color="success.main">
                  - ₹{discountPrice}
                </Typography>
              </Grid>
            </>
          )}
          {foodItems && (
            <>
              <Grid item xs={8}>
                <Typography variant="body2" color="text.secondary">
                  {foodItems.foodType}
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="body2">+ ₹{calculateFoodPrice()}</Typography>
              </Grid>
            </>
          )}
          <Grid item xs={8}>
            <Typography variant="body2" color="text.secondary">
              GST ({gst?.gstPrice || 0}%)
            </Typography>
          </Grid>
          <Grid item xs={4} textAlign="right">
            <Typography variant="body2">
              + ₹{Math.round(calculateGstAmount())}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1, borderStyle: "dashed" }} />

        {/* Total and Coupon Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="body1" fontWeight="bold">
            Total Amount
          </Typography>
          <Typography variant="body1" color="primary" fontWeight="bold">
            ₹{calculateFinalPrice()}
          </Typography>
        </Box>
        <Box>
          <Button
            fullWidth
            onClick={() => setShowCouponInput(!showCouponInput)}
            sx={{ textTransform: "none", color: "primary.main", mb: 1, p: 0.5 }}
          >
            {showCouponInput ? "Hide coupon input" : "I have a coupon"}
          </Button>
          {showCouponInput && (
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                label="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button onClick={handleApplyCoupon} variant="contained">
                Apply
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      <Button
        fullWidth
        variant="contained"
        color="success"
        size="large"
        sx={{ mt: 1, py: 1, borderRadius: 2 }}
        onClick={handleBooking}
        disabled={isBooking || roomItems?.countRooms === 0}
      >
        {isBooking ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
            Booking, please wait...
            <CircularProgress size={20} color="inherit" />
          </Box>
        ) : (
          "Continue to Book"
        )}
      </Button>

      {/* Booking Success Modal */}
      <Modal
        open={Boolean(bookingSuccessData)}
        onClose={() => setBookingSuccessData(null)}
      >
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Booking Confirmed!</Typography>
            <IconButton
              onClick={() => setBookingSuccessData(null)}
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" mb={2}>
            Your booking has been successfully placed. Here are the details:
          </Typography>
          <Box mb={2}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <Typography component="span" fontWeight="bold">
                    Booking ID:
                  </Typography>{" "}
                  {bookingSuccessData?.bookingId}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <Typography component="span" fontWeight="bold">
                    Status:
                  </Typography>{" "}
                  {bookingSuccessData?.bookingStatus}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setBookingSuccessData(null)}
          >
            OK
          </Button>
        </Box>
      </Modal>

      {/* Date Picker Modal */}
      <Modal open={showDatePickers} onClose={() => setShowDatePickers(false)}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Box>
              <Typography variant="body1" fontWeight="bold">
                Select Dates
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {inDate?.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                }) || "Check-in"}{" "}
                -{" "}
                {outDate?.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                }) || "Check-out"}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowDatePickers(false)} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Box className="custom-datepicker">
            <DatePicker
              selected={inDate}
              onChange={handleDateChange}
              startDate={inDate}
              endDate={outDate}
              selectsRange
              inline
              minDate={new Date()}
            />
          </Box>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1, py: 1 }}
            onClick={() => setShowDatePickers(false)}
            disabled={!inDate || !outDate}
          >
            Done
          </Button>
        </Box>
      </Modal>

      {/* Room & Guest Picker Modal */}
      <Modal
        open={showRoomGuestPicker}
        onClose={() => setShowRoomGuestPicker(false)}
      >
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Select Rooms & Guests</Typography>
            <IconButton
              onClick={() => setShowRoomGuestPicker(false)}
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography>Rooms</Typography>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => setNumRooms(Math.max(1, numRooms - 1))}
                  size="small"
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Typography mx={1}>{numRooms}</Typography>
                <IconButton
                  onClick={() => setNumRooms(numRooms + 1)}
                  size="small"
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography>Guests</Typography>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  size="small"
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Typography mx={1}>{guests}</Typography>
                <IconButton
                  onClick={() => {
                    setGuests(guests + 1);
                    if (guests + 1 > 3)
                      setNumRooms(Math.ceil((guests + 1) / 3));
                  }}
                  size="small"
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, py: 1 }}
            onClick={() => setShowRoomGuestPicker(false)}
          >
            Done
          </Button>
        </Box>
      </Modal>

      <div ref={foodSectionRef} style={{ height: "1px" }} />
      <div ref={roomSectionRef} style={{ height: "1px" }} />
    </Box>
  );
};

export default BookingDetails;
