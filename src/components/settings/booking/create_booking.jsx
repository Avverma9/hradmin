import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  FormControl,
  InputLabel,
  Input,
  Snackbar,
  IconButton,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { findUser } from 'src/components/redux/reducers/user';

export default function CreateBooking({ handleBack }) {
  const dispatch = useDispatch();
  const foundUser = useSelector((state) => state.user.userData);
  const loading = useSelector((state) => state.user.loading); // Assuming you have a loading state in your Redux store
  const error = useSelector((state) => state.user.error); // Assuming you have an error state in your Redux store

  const [mobile, setMobile] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleFindUser = () => {
    if (!mobile) {
      setSnackbarMessage('Please enter a mobile number.');
      setSnackbarOpen(true);
      return;
    }
    // Dispatch the findUser action and pass the mobile number
    dispatch(findUser(mobile));
  };

  useEffect(() => {
    if (error) {
      setSnackbarMessage('No user found or there was an error with the request.');
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleCreateBooking = () => {
    if (!foundUser || foundUser.length === 0) {
      setSnackbarMessage('No user found. Please try again.');
      setSnackbarOpen(true);
      return;
    }
    // Continue with booking creation logic...
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg">
      {/* Go back button */}
      <Button variant="outlined" color="primary" onClick={handleBack} sx={{ margin: 2 }}>
        Go Back
      </Button>

      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Create Your Booking
      </Typography>

      {/* Mobile Number Input and Find User Button */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8} md={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="mobile-input-label">Enter Existing User Number</InputLabel>
            <Input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              fullWidth
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFindUser}
            fullWidth
            sx={{ height: '100%' }}
          >
            {loading ? 'Searching...' : 'Find User'}
          </Button>
        </Grid>
      </Grid>

      {/* Conditionally render user details card or message */}
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="textSecondary">
            Searching for user...
          </Typography>
        </Box>
      ) : foundUser && foundUser.length > 0 ? (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          {foundUser.map((item, index) => (
            <CardContent key={index}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <Typography variant="body1">Name: {item?.userName}</Typography>
              <Typography variant="body1">Email: {item?.email}</Typography>
              <Typography variant="body1">Mobile: {item?.mobile}</Typography>
              <Typography variant="body1">Password: {item?.password}</Typography>

              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={handleCreateBooking}
                fullWidth
              >
                Create Booking for this User
              </Button>
            </CardContent>
          ))}
        </Card>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            mt: 3,
            padding: 2,
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Typography variant="h6" color="textSecondary">
            No data !
          </Typography>
        </Box>
      )}

      {/* Snackbar for Error or Success Messages */}
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
        sx={{ bottom: 80 }} // Adjust the bottom margin for better visibility
      />
    </Container>
  );
}
