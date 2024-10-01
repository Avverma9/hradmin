import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { Close } from '@mui/icons-material';
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
  Typography,
  IconButton,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import { paths } from 'src/utils/filterOptions';

export default function EditUserModal({ open, onClose, user, onSubmit }) {
  const [menuItem, setMenuItem] = useState(''); // Added state for menu item
  const [menuItems, setMenuItems] = useState([]); // Changed to array for proper handling
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
        password: user.password || '',
        role: user.role || '',
        status: user.status || false,
        images: user.images || '', // Set to current image URL
        imageUrl: user.images || '', // Set to current image URL for preview
      });
      setMenuItems(user.menuItems || []); // Initialize menu items from user
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
      ...formData,
      status: formData.status, // Ensure status is boolean
    };
    onSubmit(updatedUser);
    onClose();
    console.log('Updated user data:', updatedUser);
  };

  const handleAddMenuItem = async () => {
    if (!menuItem) return;

    try {
      await axios.post(`${localUrl}/api/users/${user._id}/menu-items`, {
        menuItem,
      });
      const updatedMenuItems = [...menuItems, menuItem]; // Append new item
      setMenuItems(updatedMenuItems);
      setMenuItem(''); // Reset input
      if (onSubmit) onSubmit(updatedMenuItems); // Call onSubmit with updated menu items
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleDeleteMenuItem = async (item) => {
    try {
      await axios.delete(`${localUrl}/api/users/${user._id}/menu-items`, {
        data: { menuItem: item },
      });
      const updatedMenuItems = menuItems.filter((menu) => menu !== item);
      setMenuItems(updatedMenuItems);
      if (onSubmit) onSubmit(updatedMenuItems); // Call onSubmit with updated menu items
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{ borderRadius: '10px' }}>
      <DialogTitle
        sx={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          position: 'relative',
        }}
      >
        Basic Info
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#fafafa', padding: '2rem' }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={formData.imageUrl}
              sx={{ width: 100, height: 100, mb: 2, border: '2px solid #1976d2' }}
            />
            <Button variant="contained" component="label" color="primary">
              Upload Photo
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>
          </Box>
        </Box>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={3}>
            {['name', 'email', 'mobile', 'address', 'password'].map((field) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  name={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  placeholder={`Enter ${field}`}
                  fullWidth
                  value={formData[field]}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    style: { borderRadius: '8px' },
                  }}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#1976d2',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1565c0',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select Role (Current role is {user?.role})</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="PMS">Partner Management System</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Assign Menu</InputLabel>
                <Select
                  name="menu"
                  value={formData.menu} // Ensure this matches your state structure
                  onChange={(e) => setMenuItem(e.target.value)}
                  sx={{ borderRadius: '8px' }}
                >
                  {paths.map((path) => (
                    <MenuItem key={path.path} value={path.title}>
                      {path.title}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  onClick={handleAddMenuItem}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Add Menu Item
                </Button>
              </FormControl>
            </Grid>
            <Box mt={3} width="100%">
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                Current Menu Items
              </Typography>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {menuItems.length > 0 ? (
                  menuItems.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 15px',
                        marginBottom: '8px',
                        backgroundColor: '#f0f4f8',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: '500' }}>
                        {item}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteMenuItem(item)}
                        sx={{
                          ml: 1,
                          '&:hover': {
                            backgroundColor: '#ffebee',
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </li>
                  ))
                ) : (
                  <Typography variant="body1" sx={{ color: 'gray', fontStyle: 'italic' }}>
                    No menu items assigned.
                  </Typography>
                )}
              </ul>
            </Box>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#f5f5f5', padding: '1rem' }}>
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
