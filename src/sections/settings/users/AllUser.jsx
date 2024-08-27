import axios from 'axios';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Table,
  Paper,
  Modal,
  Avatar,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton, // Import IconButton for close icon
  ToggleButton,
  TableContainer,
  ToggleButtonGroup,
} from '@mui/material';

import { localUrl } from 'src/utils/util';

const AllUser = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDetails, setViewDetails] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${localUrl}/get/all-users-data/all-data`);
      if (response.status === 200) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setViewDetails(false);
  };

  const handleToggleView = (event, newViewDetails) => {
    if (newViewDetails !== null) {
      setViewDetails(newViewDetails);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          textAlign: 'center',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        All Users
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell>User Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user._id.$oid}>
              <TableCell>
                <Avatar alt={user.userName} src={user.images[0]} />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.userName}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.email}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.mobile}</Typography>
              </TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleOpen(user)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto', // Added to handle overflow if content is long
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3, // Increased margin-bottom
              px: 2, // Added horizontal padding
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              User Details
            </Typography>
            <IconButton onClick={handleClose} color="primary">
              X
            </IconButton>
          </Box>
          {selectedUser && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <Avatar
                  alt={selectedUser.userName}
                  src={selectedUser.images[0]}
                  sx={{ width: 120, height: 120, margin: '0 auto' }}
                />
              </Box>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                {selectedUser.userName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Mobile:</strong> {selectedUser.mobile}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                <strong>User ID:</strong> {selectedUser.userId}
              </Typography>

              <ToggleButtonGroup
                value={viewDetails}
                exclusive
                onChange={handleToggleView}
                aria-label="View Details"
                sx={{ mb: 2 }}
              >
                <ToggleButton value aria-label="View More Details">
                  View More Details
                </ToggleButton>
                <ToggleButton value={false} aria-label="View Less Details">
                  View Less Details
                </ToggleButton>
              </ToggleButtonGroup>

              {viewDetails && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Additional details or extended information can be placed here.
                  </Typography>
                </Box>
              )}
            </div>
          )}
        </Box>
      </Modal>
    </TableContainer>
  );
};

export default AllUser;
