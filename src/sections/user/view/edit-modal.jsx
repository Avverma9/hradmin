import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Button,
  Dialog,
  Select,
  Avatar,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

export default function EditUserModal({ open, onClose, user, onSubmit }) {
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
    role: '',
    status: false,
    images: '', // Use an empty string for URL or a placeholder
    imageUrl: '', // Placeholder URL for preview
  });

  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id,
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        address: user.address || '',
        password: '',
        role: user.role || '',
        status: user.status || false,
        images: user.images || '', // Set to current image URL
        imageUrl: user.images || '', // Set to current image URL for preview
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'status' ? value === 'true' : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        images: file, // Set file object directly here
        imageUrl: URL.createObjectURL(file), // For preview
      }));
    }
  };

  const handleSubmit = () => {
    const updatedUser = {
      _id: formData._id,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      address: formData.address,
      password: formData.password,
      role: formData.role,
      status: formData.status ? "true" : " false", // Convert to boolean
      images: formData.images, // This should be handled separately if it's a file
    };
    onSubmit(updatedUser);
    onClose();
    console.log('updated user data', updatedUser);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Basic Info</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={3}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar src={formData.imageUrl} sx={{ width: 80, height: 80, marginBottom: 1 }} />
            <Button variant="contained" component="label" color="primary">
              Upload Photo
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>
          </Box>
        </Box>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Full Name"
                placeholder={user?.name}
                fullWidth
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                placeholder={user?.email}
                fullWidth
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mobile"
                label="Mobile Number"
                placeholder={user?.mobile}
                fullWidth
                value={formData.mobile}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Your Location"
                placeholder={user?.address}
                fullWidth
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Role (Current role is {user?.role})</InputLabel>
                <Select name="role" value={formData.role} onChange={handleChange}>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="PMS">Partner Management System</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Select Status (Current status is {user?.status ? 'Active' : 'Inactive'})
                </InputLabel>
                <FormControl fullWidth>
                  <InputLabel>Select Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleChange}>
                    <MenuItem value>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Enter your password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
