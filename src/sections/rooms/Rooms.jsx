/* eslint-disable no-unused-vars */
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import { Edit, ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  Input,
  Dialog,
  Button,
  useTheme,
  CardMedia,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  useMediaQuery,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { localUrl, hotelEmail } from 'src/utils/util';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    price: '',
    bedTypes: '',
    countRooms: '',
    images: [],
  });
  const [newImages, setNewImages] = useState([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const itemsPerPage = 4; // Always show 4 items per page
  const cardGap = 2; // Gap between cards in theme spacing units

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${localUrl}/get-list-of/rooms?hotelEmail=${hotelEmail}`);
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const totalRooms = rooms.length;
  const totalPages = Math.ceil(totalRooms / itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalPages - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === totalPages - 1 ? 0 : prevIndex + 1));
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      type: room.type,
      price: room.price,
      bedTypes: room.bedTypes,
      countRooms: room.countRooms,
      images: room.images,
    });
    setNewImages([]); // Reset new images
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRoom(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (event) => {
    setNewImages(Array.from(event.target.files));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    data.append('roomId', selectedRoom.roomId);
    data.append('type', formData.type);
    data.append('price', formData.price);
    data.append('bedTypes', formData.bedTypes);
    data.append('countRooms', formData.countRooms);

    formData.images.forEach((file) => {
      data.append('images', file);
    });

    newImages.forEach((file) => {
      data.append('images', file);
    });

    try {
      await axios.patch(`${localUrl}/update-your/room`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Updated selected room');
      const response = await axios.get(`${localUrl}/get-list-of/rooms?hotelEmail=${hotelEmail}`);
      setRooms(response.data);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Rooms
      </Typography>
      {totalRooms > 0 ? (
        <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.5s ease-in-out', // Smooth transition for sliding
              transform: `translateX(-${currentIndex * (100 / totalPages)}%)`,
              width: `${totalPages * 100}%`,
              flexDirection: 'row',
              gap: `${cardGap * 8}px`, // Gap between cards
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <Box
                key={pageIndex}
                sx={{
                  display: 'flex',
                  flex: '0 0 auto',
                  width: `${100 / totalPages}%`,
                  boxSizing: 'border-box',
                }}
              >
                {rooms
                  .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                  .map((room, index) => (
                    <Box
                      key={index}
                      sx={{ flex: '0 0 auto', width: `${100 / itemsPerPage}%`, p: 1 }}
                    >
                      <Card
                        sx={{
                          borderRadius: '12px',
                          boxShadow: 3,
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 6,
                          },
                          overflow: 'hidden',
                          height: '350px',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={room.images[0]}
                          alt={room.type}
                          sx={{ height: '60%', objectFit: 'cover' }}
                        />
                        <CardContent
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2,
                            position: 'relative',
                          }}
                        >
                          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {room.type}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Bed Type: {room.bedTypes}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold', color: 'primary.main' }}
                          >
                            ₹ {room.price}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No. of Rooms: {room.countRooms}
                          </Typography>
                          <IconButton
                            onClick={() => handleEdit(room)}
                            sx={{
                              position: 'absolute',
                              bottom: 16,
                              right: 16,
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.dark' },
                              fontSize: '1.2rem',
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
              </Box>
            ))}
          </Box>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="h6">No rooms available</Typography>
      )}

      {/* Update Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}
          {!loading && (
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Room Type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Bed Types"
                    name="bedTypes"
                    value={formData.bedTypes}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Number of Rooms"
                    name="countRooms"
                    type="number"
                    value={formData.countRooms}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    type="file"
                    inputProps={{ multiple: true }}
                    onChange={handleImageChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Upload new images (optional)
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} color="primary">
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
