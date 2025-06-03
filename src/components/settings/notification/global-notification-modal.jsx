/* eslint-disable no-unused-vars */
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState } from 'react';

import {
  Box,
  Alert,
  Button,
  Select,
  MenuItem,
  Container,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { localUrl } from '../../../../utils/util';
import { useMenuItems } from '../../../../utils/additional/menuItems';


// Sample path configuration (replace with your actual path options)


const GlobalNotification = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [error, setError] = useState(null);
  const paths = useMenuItems()
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !message || !selectedPath) {
      setError('Name, message, and path are required.');
      return;
    }

    try {
      const response = await axios.post(
        `${localUrl}/push-a-new-notification-to-the-panel/dashboard`,
        {
          name,
          message,
          path: selectedPath,
        }
      );

      setName('');
      setMessage('');
      setSelectedPath('');
      setError(null);
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
        Push Global Notification
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Create Notification
        </Button>
      </Box>
    </Container>
  );
};

export default GlobalNotification;
