/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

import { Close } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Dialog,
  Select,
  Avatar,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import { paths } from 'src/utils/filterOptions';

const EditUserModal = ({ open, onClose, user, onSubmit }) => {
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
    role: '',
    status: false,
    images: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);

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
        images: user.images || '',
        imageUrl: user.images || '',
      });
      setSelectedMenuItems(user.menuItems || []);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'status' ? value === 'true' : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async () => {
    const updatedUser = {
      ...formData,
      menuItems: selectedMenuItems,
    };

    // Handle image upload if a new image file is selected
    if (imageFile) {
      const formDataToSend = new FormData();
      formDataToSend.append('image', imageFile);
      try {
        const response = await axios.post(
          `${localUrl}/api/users/${user._id}/upload-image`,
          formDataToSend
        );
        updatedUser.imageUrl = response.data.imageUrl; // Assuming the response contains the image URL
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
        return; // Stop further execution on error
      }
    }

    onSubmit(updatedUser);
    onClose();
    console.log('Updated user data:', updatedUser);
  };

  const handleAddMenuItems = async () => {
    if (selectedMenuItems.length === 0) return;

    try {
      await axios.post(`${localUrl}/api/users/${user._id}/menu-items`, {
        menuItems: selectedMenuItems,
      });
      toast.success('Menu items added');
    } catch (error) {
      console.error('Error adding menu items:', error);
      toast.error('Failed to add menu items');
    }
  };

  const handleDeleteMenuItem = async (item) => {
    try {
      await axios.patch(`${localUrl}/api/users/${user._id}/menu-items`, {
        menuItem: item,
      });
      const updatedMenuItems = selectedMenuItems.filter((menu) => menu !== item);
      setSelectedMenuItems(updatedMenuItems);
      toast.success('Deleted');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const filteredMenuItems = selectedMenuItems.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          backgroundColor: '#1976d2',
          color: '#fff',
          position: 'relative',
          py: 2,
        }}
      >
        Edit User Information
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 10, top: 10, color: '#fff' }}
        >
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
          <Grid container spacing={2}>
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
                <InputLabel>Select Role</InputLabel>
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

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Assign Menu Items</InputLabel>
                <Select
                  multiple
                  value={selectedMenuItems}
                  onChange={(e) => setSelectedMenuItems(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  sx={{ borderRadius: '8px' }}
                >
                  {paths.map((path) => (
                    <MenuItem key={path.path} value={path.title}>
                      <Checkbox checked={selectedMenuItems.indexOf(path.title) > -1} />
                      <ListItemText primary={path.title} />
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  onClick={handleAddMenuItems}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Add Menu Items
                </Button>
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
            Current Menu Items
          </Typography>
          <Grid item xs={12}>
            <TextField
              label="Search Menu Items"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Box
            sx={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '10px',
              backgroundColor: '#f0f4f8',
              mt: 1,
            }}
          >
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: '#e0f7fa',
                    },
                  }}
                >
                  <Typography variant="body1">{item}</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteMenuItem(item)}
                    sx={{ ml: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center' }}>
                No menu items found
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    mobile: PropTypes.string,
    address: PropTypes.string,
    password: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.bool,
    images: PropTypes.string,
    menuItems: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EditUserModal;
