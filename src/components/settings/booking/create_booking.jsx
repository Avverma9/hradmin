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
  const [showHotel, setShowHotel] = useState(false);
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
    setShowHotel(false);
    dispatch(findUser(mobile));
  };

  useEffect(() => {
    if (error) {
      setSnackbarMessage('No user found or there was an error with the request.');
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSelectedUserBooking = ({ mobile, userId }) => {
    sessionStorage.setItem("subn", mobile);
    sessionStorage.setItem("subid", userId);
    setShowHotel(true); // Show hotel view after making booking
  };

  return (
    <Container maxWidth="lg">
      <Button variant="outlined" color="primary" onClick={handleBack} sx={{ margin: 2 }}>
        Go Back
      </Button>

      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Create Your Booking
      </Typography>

      <Box sx={{ mb: 3 }}>
        {/* Flex container to align input and button in the same line */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl fullWidth variant="outlined" sx={{ flex: 1 }}>
            <InputLabel id="mobile-input-label">Enter Existing User Number</InputLabel>
            <Input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }} // Minimum width for the input field
            />
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFindUser}
            sx={{ height: '100%', minWidth: 150 }} // Set a consistent minWidth for the button
            disabled={loading}
          >
            {loading ? 'Finding...' : 'Find User'}
          </Button>
        </Box>
      </Box>

      {/* Display found user details and booking options */}
      {foundUser && Array.isArray(foundUser) && foundUser.length > 0 && !showHotel ? (
        <Box sx={{ mb: 3 }}>
          <TableContainer
            component={Paper}
            sx={{
              mb: 2,
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="user details table">
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell align="right">Mobile</TableCell>
                  <TableCell align="right">Email</TableCell>
                  <TableCell align="right">Password</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foundUser.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item?.userName}</TableCell>
                    <TableCell align="right">{item?.mobile}</TableCell>
                    <TableCell align="right">{item?.email}</TableCell>
                    <TableCell align="right">{item?.password}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleSelectedUserBooking(item)}
                      >
                        Make booking
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}

      {showHotel && <Hotel />} {/* Show the Hotel component only after booking is selected */}

      {/* If no data found and not loading */}
      {(!foundUser || foundUser.length === 0) && !loading && !showHotel && (
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

      {/* Snackbar for error/success messages */}
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
        sx={{ bottom: 80 }}
      />
    </Container>
  );
}
