import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  IconButton,
  Container,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getAllHotels } from 'src/components/redux/reducers/hotel';
import { fetchUsers } from 'src/components/redux/reducers/user';
import { toast } from 'react-toastify';

export default function CreateBooking() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.hotel.data);
  const userData = useSelector((state) => state.user.userData);

  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    dispatch(getAllHotels());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleHotelChange = (event) => {
    setSelectedHotel(event.target.value);
  };

  const handleUserChange = (event) => {
    const userId = event.target.value;
    const user = userData.find((user) => user.userId === userId);
    if (user) {
      localStorage.setItem('rsUserId', userId);
      localStorage.setItem('rsUserMobile', user.mobile);
    }
    setSelectedUser(userId);
  };

  const handleBooking = () => {
    if (!selectedHotel || !selectedUser) {
      setSnackbarMessage('Please select a hotel and a user.');
      setSnackbarOpen(true);
      return;
    }

    const iframeSrc = `https://hotelroomsstay.com/book-hotels/${selectedHotel}`;

    iframeRef.current.src = iframeSrc;

    // Send a message to the iframe
    const messageData = {
      hotelId: selectedHotel,
      userId: localStorage.getItem('rsUserId'),
      userMobile: localStorage.getItem('rsUserMobile'),
    };

    iframeRef.current.onload = () => {
      iframeRef.current.contentWindow.postMessage(messageData, iframeSrc);
    };
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Create Your Booking
      </Typography>

      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
        <InputLabel id="hotel-select-label">Select Hotel</InputLabel>
        <Select
          labelId="hotel-select-label"
          value={selectedHotel}
          onChange={handleHotelChange}
          label="Select Hotel"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {data &&
            data.map((item) => (
              <MenuItem key={item.hotelId} value={item.hotelId}>
                {item.hotelName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
        <InputLabel id="user-select-label">Select User</InputLabel>
        <Select
          labelId="user-select-label"
          value={selectedUser}
          onChange={handleUserChange}
          label="Select User"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {userData &&
            userData.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.userName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleBooking} sx={{ marginBottom: 2 }}>
        Proceed to Booking
      </Button>

      <Box>
        <iframe
          ref={iframeRef}
          src="about:blank"
          style={{ width: '100%', height: '600px', border: 'none' }}
        ></iframe>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
}
