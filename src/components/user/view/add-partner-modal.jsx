import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  Box,
  Grid,
  Card,
  Alert,
  Button,
  Dialog,
  Avatar,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  CardHeader,
  CardContent,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import { Close, Person, Mail, Phone, Business, Badge, VpnKey, Info } from '@mui/icons-material';
import { useRole } from "../../../../utils/additional/role";

const AddUserModal = ({ open, onClose, onSubmit }) => {
  const role = useRole();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    role: "",
    status: true,
    images: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "status" ? value === "true" : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, images: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, images: null }));
    setImagePreview("");
  };

  const handleSubmit = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        if (key === 'status') {
            data.append(key, formData[key] ? "true" : "false");
        } else if (formData[key] !== null) {
            data.append(key, formData[key]);
        }
    });
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="600">
            Create New Partner
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
        {/* Added Informational Alert */}
        <Alert severity="info" icon={<Info fontSize="inherit" />} sx={{ mb: 3 }}>
          After creating a partner, you can assign page authorizations from the **Update** section.
        </Alert>
        
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={5} md={4}>
             <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader title="Profile Picture" titleTypographyProps={{ fontWeight: '600', fontSize: '1rem' }} />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, pt: 1 }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <Avatar src={imagePreview} sx={{ width: 120, height: 120, border: '3px dashed', borderColor: 'grey.400' }} />
                        {imagePreview && (
                            <IconButton
                              size="small"
                              onClick={handleRemoveImage}
                              sx={{
                                position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': { bgcolor: 'white' },
                              }}
                            >
                              <Close sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        )}
                    </Box>
                    <Button variant="outlined" component="label" color="inherit">
                      Upload Photo
                      <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                    </Button>
                </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={7} md={8}>
            <Card variant="outlined">
                <CardHeader title="Account Information" titleTypographyProps={{ fontWeight: '600' }} />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField name="name" label="Full Name" fullWidth value={formData.name} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="mobile" label="Mobile Number" fullWidth value={formData.mobile} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="email" label="Email Address" type="email" fullWidth value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Mail color="action" /></InputAdornment> }} /></Grid>
                        <Grid item xs={12}><TextField name="address" label="Address" fullWidth value={formData.address} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Business color="action" /></InputAdornment> }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select name="role" value={formData.role} onChange={handleChange} label="Role">
                                    {role.map((item) => ( <MenuItem key={item._id} value={item.role}>{item.role}</MenuItem> ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                             <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid item xs={12}>
                            <TextField name="password" type="password" label="Password" fullWidth value={formData.password} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><VpnKey color="action" /></InputAdornment> }} />
                         </Grid>
                    </Grid>
                </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Partner
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddUserModal;
