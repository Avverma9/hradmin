import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Alert,
  Button,
  Select,
  MenuItem,
  Checkbox,
  Container,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  ListItemText,
} from '@mui/material';

import { localUrl } from '../../../../utils/util';
import { paths } from '../../../../utils/filterOptions';

const UserNotification = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`);
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Error fetching users. Please try again.');
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on selected role
  const filteredUsers = selectedRole
    ? users.filter(user => user.role === selectedRole)
    : users;

  // Fetch unique roles for the role dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  const handleUserChange = (event) => {
    setSelectedUserIds(event.target.value);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value); // Update selected role
  };

  const handleSelectAll = () => {
    // Select all filtered users
    const allUserIds = filteredUsers.map(user => user._id);
    setSelectedUserIds(allUserIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !message || !selectedPath || selectedUserIds.length === 0) {
      setError('Name, message, path, and at least one user are required.');
      return;
    }

    try {
      const response = await axios.post(
        `${localUrl}/push-a-new-notification-to-the-panel/dashboard/user`,
        {
          name,
          message,
          userIds: selectedUserIds,
          path: selectedPath,
        }
      );

      setName('');
      setMessage('');
      setSelectedPath('');
      setSelectedUserIds([]);
      setError(null);
      setSelectedRole(''); // Reset selected role
      toast.success('You have successfully sent a notification');
      window.location.reload();
    } catch (err) {
      console.error('Error creating notification:', err);
      toast.error('Error creating notification. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Push User Notification
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Message"
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Path</InputLabel>
          <Select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            label="Path"
            required
          >
            {paths.map((option) => (
              <MenuItem key={option.path} value={option.path}>
                {option.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Role Filter Dropdown */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Role"
            required
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            {uniqueRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select All Button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSelectAll}
          sx={{ mt: 2 }}
        >
          Select All Users
        </Button>

        {/* Users Dropdown */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Users</InputLabel>
          <Select
            multiple
            value={selectedUserIds}
            onChange={handleUserChange}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const user = filteredUsers.find((user) => user._id === id);
                  return user ? user.name : '';
                })
                .join(', ')
            }
            required
          >
            {filteredUsers.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                <Checkbox checked={selectedUserIds.indexOf(user._id) > -1} />
                <ListItemText primary={user.name} secondary={user.mobile} /> {user?.role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Create Notification
        </Button>
      </Box>
    </Container>
  );
};

export default UserNotification;
