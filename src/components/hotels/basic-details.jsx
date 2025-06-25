import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';

import {
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Skeleton,
  Divider,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PinDropIcon from '@mui/icons-material/PinDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StarIcon from '@mui/icons-material/Star';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChatIcon from '@mui/icons-material/Chat';
import PublicIcon from '@mui/icons-material/Public';
import FlagIcon from '@mui/icons-material/Flag';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DeckIcon from '@mui/icons-material/Deck';

import { localUrl } from '../../../utils/util';

const fieldsConfig = [
  { id: 'hotelId', label: 'Hotel ID', icon: <VpnKeyIcon />, editable: false, grid: 6 },
  { id: 'hotelName', label: 'Hotel Name', icon: <BusinessIcon />, editable: true, grid: 6 },
  { id: 'description', label: 'Description', icon: <DescriptionIcon />, editable: true, type: 'multiline', grid: 12 },
  { id: 'customerWelcomeNote', label: 'Customer Welcome Note', icon: <ChatIcon />, editable: true, type: 'multiline', grid: 12 },
  { id: 'hotelOwnerName', label: 'Hotel Owner Name', icon: <PersonIcon />, editable: true, grid: 6 },
  { id: 'propertyType', label: 'Property Type', icon: <ApartmentIcon />, editable: true, grid: 6 },
  { id: 'contact', label: 'Contact', icon: <PhoneIcon />, editable: true, grid: 6 },
  { id: 'hotelEmail', label: 'Hotel Email', icon: <MailIcon />, editable: true, type: 'email', grid: 6 },
  { id: 'generalManagerContact', label: 'General Manager Contact', icon: <SupervisorAccountIcon />, editable: true, grid: 6 },
  { id: 'salesManagerContact', label: 'Sales Manager Contact', icon: <SupportAgentIcon />, editable: true, grid: 6 },
  { id: 'landmark', label: 'Landmark', icon: <HomeWorkIcon />, editable: true, grid: 12 },
  { id: 'destination', label: 'Destination', icon: <FlagIcon />, editable: true, grid: 6 },
  { id: 'city', label: 'City', icon: <LocationCityIcon />, editable: true, grid: 6 },
  { id: 'state', label: 'State', icon: <PublicIcon />, editable: true, grid: 6 },
  { id: 'pinCode', label: 'Pin Code', icon: <PinDropIcon />, editable: true, grid: 6 },
  { id: 'onFront', label: 'On Front', icon: <DeckIcon />, editable: true, grid: 6 },
  { id: 'starRating', label: 'Star Rating', icon: <StarIcon />, editable: true, type: 'number', grid: 6 },
  { id: 'isAccepted', label: 'Approval Status', icon: <CheckCircleIcon />, editable: true, type: 'select', options: ['Accepted', 'Not Accepted'], grid: 6 },
  { id: 'localId', label: 'Local ID Status', icon: <CheckCircleIcon />, editable: true, type: 'select', options: ['Accepted', 'Not Accepted'], grid: 6 },
];

export default function BasicDetails({ open, onClose, hotelId }) {
  const [hotel, setHotel] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        setHotel(response.data);
      } catch (error) {
        toast.error('Failed to fetch hotel details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (open) {
      fetchData();
    }
  }, [hotelId, open]);

  const handleEditClick = (field, value) => {
    setEditField(field.id);
    if (field.id === 'isAccepted' || field.id === 'localId') {
      setEditValue(value ? 'Accepted' : 'Not Accepted');
    } else {
      setEditValue(value || '');
    }
  };

  const handleCancelEdit = () => {
    setEditField(null);
    setEditValue('');
  };

  const handleSaveClick = async () => {
    if (editField === null) return;
    try {
      let updatedValue = editValue;
      if (editField === 'isAccepted' || editField === 'localId') {
        updatedValue = editValue === 'Accepted';
      }

      await axios.patch(`${localUrl}/hotels/update/info/${hotelId}`, { [editField]: updatedValue });
      
      const updatedHotel = { ...hotel, [editField]: updatedValue };
      setHotel(updatedHotel);
      toast.success('Update successful!');
    } catch (error) {
      toast.error('Update failed. Please try again.');
    } finally {
      handleCancelEdit();
    }
  };

  const renderFieldValue = (field) => {
    const value = hotel?.[field.id];
    if (field.id === 'isAccepted' || field.id === 'localId') {
      return value ? 'Accepted' : 'Not Accepted';
    }
    return value || 'Not provided';
  };

  const renderEditComponent = (field) => {
    if (field.type === 'select') {
      return (
        <Select value={editValue} onChange={(e) => setEditValue(e.target.value)} size="small" fullWidth>
          {field.options.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
        </Select>
      );
    }
    return (
      <TextField
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        size="small"
        fullWidth
        autoFocus
        multiline={field.type === 'multiline'}
        rows={field.type === 'multiline' ? 3 : 1}
        type={field.type || 'text'}
      />
    );
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          {hotel?.hotelName || 'Hotel Basic Details'}
        </Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Grid container spacing={2}>
            {fieldsConfig.map((field) => (
              <Grid item xs={12} sm={field.grid} key={field.id}>
                <Skeleton variant="rectangular" height={70} sx={{ borderRadius: 1.5 }} />
              </Grid>
            ))}
          </Grid>
        ) : hotel ? (
          <>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Hotel Images</Typography>
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', p: 1, pb: 2 }}>
                {hotel.images?.length > 0 ? hotel.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`Hotel Image ${index + 1}`}
                    sx={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
                  />
                )) : <Typography variant="body2" color="text.secondary">No images available.</Typography>}
              </Stack>
            </Box>

            <Grid container spacing={2}>
              {fieldsConfig.map((field) => (
                <Grid item xs={12} sm={field.grid} key={field.id}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                        {field.icon}
                        <Typography variant="body2" color="text.secondary" noWrap>{field.label}</Typography>
                      </Stack>
                      {field.editable && editField !== field.id && (
                        <IconButton size="small" onClick={() => handleEditClick(field, hotel[field.id])} sx={{ mt: -0.5 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                    
                    {editField === field.id ? (
                      <Stack spacing={1} mt={1}>
                        {renderEditComponent(field)}
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                          <Button size="small" variant="contained" onClick={handleSaveClick} startIcon={<CheckIcon />}>Save</Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography variant="body1" fontWeight="500" mt={0.5} sx={{
                        wordBreak: 'break-word',
                        color: (field.id === 'isAccepted' || field.id === 'localId') ? (hotel[field.id] ? 'success.main' : 'error.main') : 'text.primary'
                      }}>
                        {renderFieldValue(field)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography>No hotel data available.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

BasicDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string,
};

BasicDetails.defaultProps = {
  hotelId: null,
};