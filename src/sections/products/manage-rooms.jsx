/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { LuBedDouble } from 'react-icons/lu';
import React, { useState, useEffect } from 'react';
import { FaIndianRupeeSign } from 'react-icons/fa6';

import {
  Box,
  Grid,
  Modal,
  Input,
  Button,
  Select,
  styled,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  useMediaQuery,
} from '@mui/material';

import { localUrl } from 'src/utils/util';

// Styled components
const ModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  paddingBottom: theme.spacing(10),
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const UploadButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const RoomItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
  },
}));

const RoomImage = styled('img')(({ theme }) => ({
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    width: '80px',
    height: '80px',
  },
}));

const RoomDetails = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginTop: theme.spacing(1),
    textAlign: 'center',
  },
}));

const AddRoomModal = ({ open, onClose, hotelId }) => {
  const [roomType, setRoomType] = useState('');
  const [roomPrice, setRoomPrice] = useState('');
  const [bedTypes, setBedTypes] = useState('');
  const [countRooms, setCountRooms] = useState('');
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (hotelId) {
      fetchRooms(); // Fetch rooms when hotelId changes
    }
  }, [hotelId]);

  const fetchRooms = () => {
    axios
      .get(`${localUrl}/hotels/get-by-id/${hotelId}`)
      .then((response) => {
        setRooms(response.data.rooms); // Update state with fetched rooms
      })
      .catch(() => {
        toast.error('Error fetching rooms');
      });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleAddFood = () => {
    setLoading(true); // Set loading state to true
    const formData = new FormData();
    formData.append('hotelId', hotelId);
    formData.append('type', roomType);
    formData.append('price', roomPrice);
    formData.append('bedTypes', bedTypes);
    formData.append('countRooms', countRooms);

    images.forEach((file) => {
      formData.append('images', file);
    });

    axios
      .post(`${localUrl}/create-a-room-to-your-hotel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        toast.success('Room added successfully');
        window.location.reload();
      })
      .catch(() => {
        toast.error('Error adding room');
      })
      .finally(() => {
        setLoading(false); // Set loading state to false
        setIsAddingRoom(false); // Close the add room form
      });
  };
  const handleCancel = () => {
    // Reset form state
    setRoomType('');
    setRoomPrice('');
    setBedTypes('');
    setCountRooms('');
    setImages([]);

    // Refresh the room list and close the modal
    fetchRooms();
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <Header>
          <Typography variant="h6">
            {isAddingRoom ? 'Add Room' : 'Available Hotel Rooms'}
          </Typography>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        </Header>
        {!isAddingRoom ? (
          <>
            {rooms.length > 0 ? (
              <Box>
                {rooms.map((room, index) => (
                  <RoomItem key={index}>
                    <RoomImage src={room?.images} alt={`room ${index}`} />
                    <RoomDetails>
                      <Typography variant="h6">{room?.type}</Typography>
                      <Typography style={{ color: 'red' }} variant="body1">
                        <FaIndianRupeeSign /> {room?.price}
                      </Typography>
                    
                      <Typography variant="body1">
                        <LuBedDouble /> {room?.bedTypes}
                      </Typography>
                      <Typography style={{ color: 'green' }} variant="body2">
                        Number of Rooms - {room?.countRooms}
                      </Typography>
                      <ImagePreview>
                        {images.length > 0 &&
                          images.map((file, item) => (
                            <img
                              key={item}
                              src={URL.createObjectURL(file)}
                              alt={`Food ${item}`}
                              style={{
                                width: isMobile ? '60px' : '80px',
                                height: isMobile ? '60px' : '80px',
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                            />
                          ))}
                      </ImagePreview>
                    </RoomDetails>
                  </RoomItem>
                ))}
              </Box>
            ) : (
              <>
                <Typography>This hotel has no room availability.</Typography>
                <img
                  src="https://media.istockphoto.com/id/1396541669/vector/no-food-or-drink-icon.jpg?s=612x612&w=0&k=20&c=T8qvZM66nqu-Ir_rhjnmlmfTnbSUR4G6t0oPPlvVqfw="
                  alt="No room"
                  style={{ width: '100px', height: 'auto' }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Type of room"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Room Price"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={roomPrice}
                  onChange={(e) => setRoomPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Bed Type</InputLabel>
                  <Select
                    value={bedTypes}
                    onChange={(e) => setBedTypes(e.target.value)}
                    label="Bed Type"
                  >
                    <MenuItem value="Appetizer">Appetizer</MenuItem>
                    <MenuItem value="Main Course">Main Course</MenuItem>
                    <MenuItem value="Dessert">Dessert</MenuItem>
                    <MenuItem value="Beverage">Beverage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of rooms"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={countRooms}
                  onChange={(e) => setCountRooms(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Input
                  type="file"
                  inputProps={{ multiple: true }}
                  onChange={handleFileChange}
                  sx={{ display: 'none' }}
                  id="upload-file"
                />
                <label htmlFor="upload-file">
                  <UploadButton component="span">Choose Images</UploadButton>
                </label>
                <ImagePreview>
                  {images.length > 0 &&
                    images.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Food ${index}`}
                        style={{
                          width: isMobile ? '60px' : '80px',
                          height: isMobile ? '60px' : '80px',
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    ))}
                </ImagePreview>
              </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  handleCancel();
                  setIsAddingRoom(false);
                }}
                color="secondary"
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFood}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Room'}
              </Button>
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!isAddingRoom && (
            <Button variant="contained" color="primary" onClick={() => setIsAddingRoom(true)}>
              Add Room
            </Button>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

AddRoomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};

export default AddRoomModal;
