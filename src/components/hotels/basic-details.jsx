/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/img-redundant-alt */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { AiOutlineEdit } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Modal,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { localUrl } from '../../../utils/util';
import { useLoader } from '../../../utils/loader';
export default function BasicDetails({ open, onClose, hotelId }) {
  const [hotel, setHotel] = useState({});
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        setHotel(response.data);
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    if (hotelId) {
      setLoading(true);
      fetchData();
    }
  }, [hotelId]);

  const handleEditClick = (field, value) => {
    if (field === 'isAccepted') {
      setEditValue(value ? 'Accepted' : 'Not Accepted');
    } else {
      setEditValue(value);
    }
    setEditField(field);
  };

  const handleSaveClick = async () => {
    try {
      let updatedValue = editValue;
      if (editField === 'isAccepted') {
        updatedValue = editValue === 'Accepted';
      }

      const updatedHotel = { ...hotel, [editField]: updatedValue };
      await axios.patch(`${localUrl}/hotels/update/info/${hotelId}`, updatedHotel);
      setHotel(updatedHotel);
      toast.success('Update successful');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setEditField(null);
      setEditValue('');
    }
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleSelectChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    }
  };

  const renderField = (key, value) => {
    if (key === 'isAccepted') {
      return value ? 'Accepted' : 'Not Accepted';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', '); // Join array values with commas
      }
      return JSON.stringify(value); // Convert object to string
    }
    return value;
  };

  const fieldsToHide = [
    'createdAt',
    'updatedAt',
    'rooms',
    'foods',
    'amenities',
    'policies',
    '_id',
    '__v',
    'startDate',
    'endDate',
  ];

  if (loading) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          width: '90%',
          maxWidth: 800,
          maxHeight: '80%',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Basic Details
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {Object.keys(hotel).map((key) => {
            if (fieldsToHide.includes(key)) {
              return null; // Skip rendering fields that should be hidden
            }
            return (
              <Grid item xs={12} key={key} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
                    {`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}`}
                  </Typography>
                  {editField === key ? (
                    key === 'isAccepted' ? (
                      <Select
                        value={editValue}
                        onChange={handleSelectChange}
                        onBlur={handleSaveClick}
                        onKeyDown={handleKeyDown}
                        sx={{ width: '100%' }}
                      >
                        <MenuItem value="Accepted">Accepted</MenuItem>
                        <MenuItem value="Not Accepted">Not Accepted</MenuItem>
                      </Select>
                    ) : key === 'localId' ? (
                      <Select
                        value={editValue}
                        onChange={handleSelectChange}
                        onBlur={handleSaveClick}
                        onKeyDown={handleKeyDown}
                        sx={{ width: '100%' }}
                      >
                        <MenuItem value="Accepted">Accepted</MenuItem>
                        <MenuItem value="Not Accepted">Not Accepted</MenuItem>
                      </Select>
                    ) : (
                      <TextField
                        value={editValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSaveClick}
                        sx={{ width: '100%' }}
                      />
                    )
                  ) : key === 'images' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                      {hotel.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Hotel Image ${index}`}
                          style={{
                            width: '120px',
                            height: 'auto',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ display: 'inline' }}>
                      {renderField(key, hotel[key])}
                    </Typography>
                  )}
                </Box>
                {key !== 'images' &&
                  key !== 'hotelId' && ( // Hide edit icon for images
                    <IconButton
                      onClick={() => handleEditClick(key, hotel[key])}
                      sx={{ ml: 2, visibility: editField === key ? 'hidden' : 'visible' }}
                    >
                      <AiOutlineEdit size={24} />
                    </IconButton>
                  )}
              </Grid>
            );
          })}
        </Grid>
        <Button onClick={onClose} sx={{ mt: 3 }} variant="contained" color="primary">
          Close
        </Button>
      </Box>
    </Modal>
  );
}

BasicDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};
