/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { LuBedDouble } from 'react-icons/lu';
import React, { useState, useEffect } from 'react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

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
  position: 'relative', // Add position relative for absolute positioning of actions
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
  },
}));
const RoomActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  position: 'absolute',
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  '& > button': {
    margin: theme.spacing(0.5),
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
  const [currentRoomId, setCurrentRoomId] = useState(null); // State to manage current room id for updates
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

  const handleAddRoom = () => {
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
        fetchRooms();
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

  const handleDelete = (roomId) => {
    axios
      .request({
        url: `${localUrl}/delete-rooms-by-id`,
        method: 'DELETE',
        data: { roomId },
      })
      .then(() => {
        toast.success('Room deleted successfully');
        fetchRooms(); // Refresh the room list
      })
      .catch(() => {
        toast.error('Error deleting room');
      });
  };

  const handleUpdateRoom = () => {
    setLoading(true); // Set loading state to true
    const formData = new FormData();
    formData.append('roomId', currentRoomId);
    formData.append('type', roomType);
    formData.append('price', roomPrice);
    formData.append('bedTypes', bedTypes);
    formData.append('countRooms', countRooms);

    images.forEach((file) => {
      formData.append('images', file);
    });

    axios
      .patch(`${localUrl}/update-your/room`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        toast.success('Room updated successfully');
        setImages([]);
      })
      .catch(() => {
        toast.error('Error updating room');
      })
      .finally(() => {
        setLoading(false); // Set loading state to false
        setIsAddingRoom(false); // Close the add room form
        fetchRooms(); // Refresh the room list
      });
  };
  const handleEdit = (room) => {
    setRoomType(room.type);
    setRoomPrice(room.price);
    setBedTypes(room.bedTypes);
    setCountRooms(room.countRooms);
    setImages([]); // Optionally clear images or handle images differently
    setCurrentRoomId(room.roomId); // Set the current room id for updates
    setIsAddingRoom(true); // Open the form in update mode
  };
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <Header>
          <Typography variant="h6">
            {isAddingRoom ? (currentRoomId ? 'Update Room' : 'Add Room') : 'Available Hotel Rooms'}
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
                    <RoomActions>
                      <Button
                        onClick={() => handleDelete(room.roomId)}
                        color="error"
                        size="small"
                        startIcon={<AiOutlineDelete />}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => handleEdit(room)}
                        color="primary"
                        size="small"
                        startIcon={<AiOutlineEdit />}
                      >
                        Update
                      </Button>
                    </RoomActions>
                  </RoomItem>
                ))}
              </Box>
            ) : (
              <>
                <Typography>This hotel has no room availability.</Typography>
                <img
                  src="https://images.tv9kannada.com/wp-content/uploads/2022/03/sorry.jpg"
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
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
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
                        alt={`File ${index}`}
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
                onClick={currentRoomId ? handleUpdateRoom : handleAddRoom}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : currentRoomId ? 'Update Room' : 'Add Room'}
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
