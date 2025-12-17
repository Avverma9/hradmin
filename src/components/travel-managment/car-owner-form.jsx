import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useResponsive } from '../../hooks/use-responsive';
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  Divider,
  Container,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Home,
  PhotoCamera,
  ArrowBack,
  Save,
  Pin,
  Public,
  LocationCity,
  Badge,
} from '@mui/icons-material';

import { addCarOwner } from '../redux/reducers/travel/carOwner';

const Section = ({ title, children }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: { xs: 2, sm: 3 } }}>
    <Typography variant="h6" fontWeight="600" gutterBottom>{title}</Typography>
    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
        {children}
    </Paper>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

const ImageUpload = ({ label, onFileChange, previewSrc, variant = 'circular' }) => (
  <Box textAlign="center">
    <Avatar src={previewSrc} variant={variant} sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, mb: 1, mx: 'auto', border: '2px dashed', borderColor: 'grey.400' }} />
    <Button variant="outlined" component="label" color="inherit" startIcon={<PhotoCamera />} size="small">
            {label}
            <input type="file" hidden accept="image/*" onChange={onFileChange} />
        </Button>
    </Box>
);

ImageUpload.propTypes = {
    label: PropTypes.string.isRequired,
    onFileChange: PropTypes.func.isRequired,
    previewSrc: PropTypes.string,
    variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
};

export default function CarOwnerForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mdUp = useResponsive('up', 'md');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    dl: '',
    dlImage: null,
    city: '',
    state: '',
    address: '',
    pinCode: '',
    images: null,
  });
  
  const [previews, setPreviews] = useState({ images: '', dlImage: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      setPreviews((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (value) {
          data.append(key, value);
        }
      }
      await dispatch(addCarOwner(data)).unwrap();
      navigate(-1);
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isFormInvalid = !formData.name || formData.mobile.length !== 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || !formData.dl || !formData.address || !formData.city || !formData.state || !formData.pinCode;

    return (
    <Container maxWidth={mdUp ? 'md' : 'sm'} sx={{ py: mdUp ? 3 : 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={mdUp ? 'center' : 'flex-start'}
          mb={mdUp ? 3 : 2}
          sx={{ flexDirection: mdUp ? 'row' : 'column', gap: mdUp ? 0 : 1 }}
        >
          <Typography variant={mdUp ? 'h4' : 'h5'} fontWeight="bold">Add New Owner</Typography>
          <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} size={mdUp ? 'medium' : 'small'}>
            Go Back
          </Button>
        </Box>
            
            <Section title="Personal Information">
          <Grid container spacing={mdUp ? 2 : 1.5}>
            <Grid item xs={12} sm={6}><TextField fullWidth required name="name" label="Full Name" value={formData.name} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth required name="mobile" label="Mobile Number" value={formData.mobile} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} inputProps={{ maxLength: 10 }} error={formData.mobile.length > 0 && formData.mobile.length !== 10} helperText={formData.mobile.length > 0 && formData.mobile.length !== 10 ? 'Must be 10 digits' : ''} InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }} /></Grid>
            <Grid item xs={12}><TextField fullWidth required name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} error={formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)} helperText={formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Invalid email format' : ''} InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} /></Grid>
                </Grid>
            </Section>
            
            <Section title="Address Details">
           <Grid container spacing={mdUp ? 2 : 1.5}>
            <Grid item xs={12}><TextField fullWidth required name="address" label="Address" value={formData.address} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><Home /></InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth required name="city" label="City" value={formData.city} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><LocationCity /></InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth required name="state" label="State" value={formData.state} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><Public /></InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth required name="pinCode" label="Pin Code" value={formData.pinCode} onChange={handleInputChange} size={mdUp ? 'medium' : 'small'} InputProps={{ startAdornment: <InputAdornment position="start"><Pin /></InputAdornment> }} /></Grid>
           </Grid>
            </Section>

             <Section title="Documents">
          <Grid container spacing={mdUp ? 3 : 2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            name="dl"
                            label="Driver's License Number"
                            value={formData.dl}
                            onChange={handleInputChange}
                            size={mdUp ? 'medium' : 'small'}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><Badge /></InputAdornment>),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <ImageUpload label="Upload DL" onFileChange={(e) => handleFileChange(e, 'dlImage')} previewSrc={previews.dlImage} variant="rounded" />
                    </Grid>
                     <Grid item xs={12} sm={3}>
                        <ImageUpload label="Upload Photo" onFileChange={(e) => handleFileChange(e, 'images')} previewSrc={previews.images} variant="circular"/>
                    </Grid>
                </Grid>
             </Section>

                    <Box display="flex" justifyContent="flex-end" mt={mdUp ? 3 : 2}>
                      <Button type="submit" variant="contained" size={mdUp ? 'large' : 'medium'} disabled={loading || isFormInvalid} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}>
                    {loading ? "Submitting..." : "Submit Owner"}
                </Button>
            </Box>
        </Box>
    </Container>
  );
}
