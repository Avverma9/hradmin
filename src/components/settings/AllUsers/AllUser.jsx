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

import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, userDetails } from 'src/components/redux/reducers/user';
import UserDetailsModal from './user-details';
import { useLoader } from '../../../../utils/loader';

const AllUser = () => {
  const { userData } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const { showLoader, hideLoader } = useLoader()
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserDetails = async () => {
      showLoader()
      try {
        await dispatch(userDetails());
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        hideLoader();
      }
    };
    fetchUserDetails();
  }, [dispatch]);


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

  const allUserCount = userData.length;

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
      <TableContainer component={Paper} sx={{ mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
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
            {userData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <Avatar alt={user.userName} src={user.profile[0]} sx={{ width: 40, height: 40 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.name}</Typography>
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
          count={userData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #ddd' }}
        />
      </TableContainer>

      {/* User Details Modal */}
      <UserDetailsModal user={selectedUser} open={open} onClose={handleClose} />
    </Box>
  );
};

export default AllUser;
