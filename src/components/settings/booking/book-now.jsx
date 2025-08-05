import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { getHotelById } from 'src/components/redux/reducers/hotel';
import BookingDetails from './bookingDetails';
import Food from './foods';
import Rooms from './rooms';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Rating,
  CircularProgress,
  Stack,
} from '@mui/material';
import { toast } from 'react-toastify';

const BookNow = () => {
  const { hotelId } = useParams();
  const { byId: hotelById, loading } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);

  useEffect(() => {
    if (hotelId) {
      dispatch(getHotelById(hotelId));
    }
  }, [dispatch, hotelId]);

  useEffect(() => {
    // Pre-select a random room once hotel data is available
    if (selectedRooms.length === 0 && hotelById?.rooms?.length > 0) {
      const randomRoom = hotelById.rooms[Math.floor(Math.random() * hotelById.rooms.length)];
      setSelectedRooms([randomRoom]);
    }
  }, [hotelById, selectedRooms.length]);

  const handleFoodSelect = (food) => {
    if (selectedFoods.some((f) => f.foodId === food.foodId)) {
      setSelectedFoods(selectedFoods.filter((f) => f.foodId !== food.foodId));
      toast.info(`${food.name} Removed`);
    } else {
      setSelectedFoods([...selectedFoods, food]);
      toast.success(`${food.name} Selected`);
    }
  };

  const handleRoomSelect = (room) => {
    if (selectedRooms.some((r) => r.roomId === room.roomId)) {
      // Allow deselecting a room, but it's better UX to always have one selected.
      // If you want to enforce at least one selection, you can modify this.
      setSelectedRooms([]);
    } else {
      setSelectedRooms([room]);
    }
    toast.success(`${room.type} Selected`);
  };

  if (loading || !hotelById) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column: Hotel Details, Room & Food Selection */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={4}>
            {/* Image Carousel */}
            <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Carousel controls={false} indicators={false} interval={2000}>
                {hotelById?.images?.map((image, index) => (
                  <Carousel.Item key={index}>
                    <Box
                      component="img"
                      src={image}
                      alt={`Hotel Image ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: { xs: 250, sm: 450 },
                        objectFit: 'cover',
                      }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Paper>

            {/* Hotel Information */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {hotelById?.hotelName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {hotelById?.landmark}, {hotelById?.city}, {hotelById?.state}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Rating value={parseFloat(hotelById?.starRating) || 0} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary">
                  ({hotelById?.reviewCount} Reviews)
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {hotelById?.description}
              </Typography>
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Amenities
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {hotelById?.amenities?.[0]?.amenities?.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" />
                ))}
              </Box>
            </Paper>

            {/* Room and Food Selection in a Grid */}
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Select a Room
                  </Typography>
                  <Rooms
                    rooms={hotelById?.rooms}
                    onRoomSelect={handleRoomSelect}
                    selectedRooms={selectedRooms}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Add a Meal
                  </Typography>
                  <Food
                    foodData={hotelById?.foods}
                    onFoodSelect={handleFoodSelect}
                    selectedFoods={selectedFoods}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* Right Column: Booking Summary (Sticky) */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: 'sticky', top: '20px' }}>
            <BookingDetails
              room={selectedRooms}
              food={selectedFoods}
              hotel={hotelById?.hotelName}
              email={hotelById?.hotelEmail}
              owner={hotelById?.hotelOwnerName}
              address={hotelById?.destination}
              city={hotelById?.city}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookNow;
