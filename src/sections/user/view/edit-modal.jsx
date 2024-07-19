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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, images: file, imageUrl: URL.createObjectURL(file) }));
    }
  };
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
    role: '',
    status: '',
    images: null,
    imageUrl: '',
  });

  useEffect(() => {
    // Populate formData when user prop changes (on modal open)
    if (user) {
      setFormData({
        _id: user._id,
      });
    }
  }, [user]);

  const handleSubmit = () => {
    const updatedUser = {
      _id: formData._id,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      address: formData.address,
      password: formData.password,
      role: formData.role,
      status: formData.status,
      images: formData.images,
    };
    onSubmit(updatedUser);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Basic Info</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={3}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={formData?.imageUrl ? formData.imageUrl : user.images}
              sx={{ width: 80, height: 80, marginBottom: 1 }}
            />
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
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superAdmin">Super Admin</MenuItem>
                  <MenuItem value="developer">Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Select Status (Current status is {user?.status ? 'Active' : 'In Active'})
                </InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
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
