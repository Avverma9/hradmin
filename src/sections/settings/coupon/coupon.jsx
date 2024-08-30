import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Table,
  Paper,
  Button,
  Dialog,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Container,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
} from '@mui/material';

import { localUrl } from 'src/utils/util';

export default function Coupon() {
  const [hotels, setHotels] = useState([]);
  const [couponName, setCouponName] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [validity, setValidity] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${localUrl}/get/all/hotels`);
      const result = await response.json();
      setHotels(result.data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const formattedValidity = new Date(validity).toISOString().split('T')[0];
    try {
      const response = await axios.post(`${localUrl}/coupon/create-a-new/coupon`, {
        couponName,
        discountPrice,
        validity: formattedValidity,
      });
      if (response.status === 201) {
        toast.success(`Note down your Coupon Code - ${response.data?.coupon?.couponCode}`);
        setCouponName('');
        setDiscountPrice('');
        setValidity('');
      }
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleApplyCoupon = async (hotelId, roomId) => {
    try {
      const response = await axios.patch(
        `${localUrl}/apply/a/coupon-to-room/${couponCode}?hotelId=${hotelId}&roomId=${roomId}`
      );
      if (response.status === 200) {
        toast.success('Coupon Applied Successfully');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const handleOpenModal = (hotel) => {
    setSelectedHotel(hotel);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedHotel(null);
    setSelectedRoom(null);
  };

  const handleOpenCouponModal = (room) => {
    setSelectedRoom(room);
    setOpenCouponModal(true);
  };

  const handleCloseCouponModal = () => {
    setOpenCouponModal(false);
    setCouponCode('');
  };

  const handleApplyCouponToRoom = async () => {
    if (!selectedRoom || !couponCode) return;

    try {
      await handleApplyCoupon(selectedHotel.hotelId, selectedRoom.roomId, couponCode);
      handleCloseCouponModal();
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Coupon Management
      </Typography>

      <Box component="form" onSubmit={handleCreateCoupon} sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create a New Coupon
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Coupon Name"
              value={couponName}
              onChange={(e) => setCouponName(e.target.value)}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Discount Price"
              type="number"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Validity"
              type="date"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Create Coupon
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Available Hotels
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hotel ID</TableCell>
              <TableCell>Hotel Name</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.map((hotel) => (
              <TableRow key={hotel.hotelId}>
                <TableCell>{hotel.hotelId}</TableCell>
                <TableCell>{hotel.hotelName}</TableCell>
                <TableCell>{hotel.hotelOwnerName}</TableCell>
                <TableCell>{hotel.city}</TableCell>
                <TableCell>
                  <img src={hotel.images[0]} alt={hotel.hotelName} width="100" />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenModal(hotel)}
                  >
                    Apply
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rooms Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>
          Rooms of {selectedHotel?.hotelName}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            X
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedHotel?.rooms && selectedHotel.rooms.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Bed Types</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Count Rooms</TableCell>
                  <TableCell>Offer Price Less</TableCell>
                  <TableCell>Offer Expiry</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedHotel.rooms.map((room) => (
                  <TableRow key={room.roomId}>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.bedTypes}</TableCell>
                    <TableCell>{room.price}</TableCell>
                    <TableCell>{room.countRooms}</TableCell>
                    <TableCell>{room.offerPriceLess}</TableCell>
                    <TableCell>{room.offerExp}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenCouponModal(room)}
                      >
                        Apply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No rooms available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coupon Code Modal */}
      <Dialog open={openCouponModal} onClose={handleCloseCouponModal} fullWidth maxWidth="xs">
        <DialogTitle>Enter Coupon Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Coupon Code"
            type="text"
            fullWidth
            variant="outlined"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCouponModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleApplyCouponToRoom} color="secondary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
