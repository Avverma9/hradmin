import axios from 'axios';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Table,
  Paper,
  Modal,
  Avatar,
  Button,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  TableContainer,
  TableSortLabel,
  TablePagination,
} from '@mui/material';

import { localUrl } from '../../../../utils/util';

const AllUser = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${localUrl}/get/all-users-data/all-data`);
      if (response.status === 200) {
        setData(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const results = data.filter((user) =>
      user?.userName?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const allUserCount = data.length;
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ letterSpacing: 0.5, mb: 2 }}>
        All Users ({allUserCount})
      </Typography>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#f5f5f5',
            '& .MuiInputBase-input': { padding: '10px' },
          },
        }}
      />
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Profile</TableCell>
              <TableCell>
                <TableSortLabel>User</TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user._id.$oid}>
                  <TableCell>
                    <Avatar
                      alt={user.userName}
                      src={user.images[0]}
                      sx={{ width: 40, height: 40 }}
                    />
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
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpen(user)}
                      sx={{ textTransform: 'none' }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #ddd' }}
        />
      </TableContainer>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 }, // Increased width for better view
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
            maxHeight: '90vh', // To handle long content
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              User Details
            </Typography>

            <Typography variant="h6">
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClose}
                sx={{ textTransform: 'none' }}
              >
                Close
              </Button>
            </Typography>
          </Box>
          {selectedUser && (
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={4} md={3}>
                <Avatar
                  alt={selectedUser.userName}
                  src={selectedUser.images[0]}
                  sx={{ width: 120, height: 120, margin: '0 auto', border: '2px solid #ddd' }}
                />
              </Grid>
              <Grid item xs={12} sm={8} md={9}>
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
                <Divider sx={{ mb: 2 }} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AllUser;
