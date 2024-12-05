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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { findUser } from 'src/components/redux/reducers/user';
import Hotel from './hotel';

export default function CreateBooking({ handleBack }) {
  const dispatch = useDispatch();
  const foundUser = useSelector((state) => state.user.userData);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  const [mobile, setMobile] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleFindUser = () => {
    if (!mobile) {
      setSnackbarMessage('Please enter a mobile number.');
      setSnackbarOpen(true);
      return;
    }
    dispatch(findUser(mobile));
  };

  useEffect(() => {
    if (error) {
      setSnackbarMessage('No user found or there was an error with the request.');
      setSnackbarOpen(true);
    }
  }, [error]);

  // Function to store credentials (mobile and password)
  const storeCredentials = (mobile, password) => {
    sessionStorage.setItem('bmn', mobile);
    sessionStorage.setItem('bp', password);
  };

  const handleCreateBooking = () => {
    if (!foundUser || foundUser.length === 0) {
      setSnackbarMessage('No user found. Please try again.');
      setSnackbarOpen(true);
      return;
    }

    // Retrieve mobile and password for the first user found (if multiple users exist)
    const user = foundUser[0]; // Assuming the first user is the one we want to create the booking for
    const password = user?.password;

    if (password) {
      // Store credentials in sessionStorage
      storeCredentials(user?.mobile, password);
      setSnackbarMessage('Booking created successfully!');
      setSnackbarOpen(true);
      // Continue with booking creation logic...
    } else {
      setSnackbarMessage('Password is missing. Cannot create booking.');
      setSnackbarOpen(true);
    }
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
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="mobile-input-label">Enter Existing User Number</InputLabel>
          <Input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            fullWidth
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFindUser}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? 'Searching...' : 'Find User'}
        </Button>
      </Box>

      {/* Conditionally render user details table or message */}
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="textSecondary">
            Searching for user...
          </Typography>
        </Box>
      ) : foundUser && foundUser.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <TableContainer
            component={Paper}
            sx={{
              mb: 2,
              border: '1px solid #ccc', // Border around the table
              borderRadius: '8px', // Optional: rounded corners for the border
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="user details table">
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell align="right">Mobile</TableCell>
                  <TableCell align="right">Email</TableCell>
                  <TableCell align="right">Password</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foundUser.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item?.userName}</TableCell>
                    <TableCell align="right">{item?.mobile}</TableCell>
                    <TableCell align="right">{item?.email}</TableCell>
                    <TableCell align="right">{item?.password}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Create Booking Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ width: '40%' }} // 40% width
              size="small" // Smaller button
              onClick={handleCreateBooking}
            >
              Create Booking for this User
            </Button>
          </Box>
          <Hotel/>
        </Box>
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
            No data found!
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
