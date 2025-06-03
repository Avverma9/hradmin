/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Modal, Button, Checkbox, Typography, FormControlLabel } from '@mui/material';

import { localUrl } from '../../../utils/util';
import { useHotelAmenities } from '../../../utils/additional/hotelAmenities';


export default function Amenities({ open, onClose, hotelId }) {
  const [data, setData] = useState([]);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [existingAmenities, setExistingAmenities] = useState([]);
  const [selectedAmenityWarning, setSelectedAmenityWarning] = useState(null);
  const allAmenities = useHotelAmenities()
  // Fetch amenities when the component mounts or hotelId changes
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        const amenitiesData = response.data.amenities.flatMap((item) => item.amenities);
        setData(amenitiesData);
        setExistingAmenities(amenitiesData); // Update existing amenities
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };

    if (hotelId) {
      fetchAmenities();
    }
  }, [hotelId]);

  const handleDeleteAmenity = async (amenityName) => {
    try {
      await axios.delete(`${localUrl}/hotels/${hotelId}/amenities/${amenityName}`);
      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      const amenitiesData = response.data.amenities.flatMap((item) => item.amenities);
      setData(amenitiesData);
      setExistingAmenities(amenitiesData); // Update existing amenities
      toast.success('Successfully deleted amenity');
    } catch (error) {
      toast.error(`Error deleting amenity: ${error.message}`);
    }
  };

  const handleAddMultipleAmenities = async () => {
    const newAmenities = selectedAmenities.filter(
      (amenity) => !existingAmenities.includes(amenity)
    );
    if (newAmenities.length > 0) {
      try {
        await axios.post(`${localUrl}/create-a-amenities/to-your-hotel`, {
          hotelId,
          amenities: newAmenities,
        });
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        const amenitiesData = response.data.amenities.flatMap((item) => item.amenities);
        setData(amenitiesData);
        setExistingAmenities(amenitiesData); // Update existing amenities
        setSelectedAmenities([]); // Clear the selected amenities after adding
        setSuggestionOpen(false); // Close the suggestion modal
        toast.success('Successfully added amenities');
      } catch (error) {
        toast.error(`Error adding amenities: ${error.message}`);
      }
    } else {
      toast.warning('Some or all selected amenities are already added');
    }
  };

  const handleCheckboxChange = (amenityName, isChecked) => {
    if (isChecked) {
      if (existingAmenities.includes(amenityName)) {
        toast.info(`${amenityName} is already added`);
        setSelectedAmenityWarning(amenityName);
      } else {
        setSelectedAmenities([...selectedAmenities, amenityName]);
        setSelectedAmenityWarning(null);
      }
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenityName));
      setSelectedAmenityWarning(null);
    }
  };

  return (
    <div>
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
            maxWidth: 600,
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
            Amenities
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {data.length > 0 ? (
              data.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {item}
                    </Typography>
                    <Button
                      onClick={() => handleDeleteAmenity(item)}
                      sx={{ minWidth: 'auto', ml: 1, p: 1 }}
                      variant="outlined"
                      color="error"
                    >
                      <FaTimes />
                    </Button>
                  </Box>
                </Grid>
              ))
            ) : (
              <Typography variant="body1">No amenities available</Typography>
            )}
          </Grid>
          <Button
            onClick={() => setSuggestionOpen(true)}
            sx={{ mt: 2, mr: 2 }} // Margin-right for spacing
            variant="contained"
            color="primary"
          >
            Add Amenities
          </Button>
          <Button
            onClick={onClose}
            sx={{ mt: 2 }} // Margin-top for spacing
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Modal
        open={suggestionOpen}
        onClose={() => setSuggestionOpen(false)}
        aria-labelledby="suggestion-modal-title"
        aria-describedby="suggestion-modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            width: '90%',
            maxWidth: 600,
            maxHeight: '80%',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="suggestion-modal-title" variant="h6" component="h2">
            Select Amenities to Add
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {allAmenities.map((amenity) => (
              <Grid item xs={12} sm={6} md={4} key={amenity._id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedAmenities.includes(amenity.name)}
                      onChange={(e) => handleCheckboxChange(amenity.name, e.target.checked)}
                    />
                  }
                  label={amenity.name}
                />
              </Grid>
            ))}
          </Grid>
          <Button
            onClick={handleAddMultipleAmenities}
            sx={{ mt: 2, mr: 2 }} // Margin-right for spacing
            variant="contained"
            color="primary"
          >
            Add Selected Amenities
          </Button>
          <Button
            onClick={() => setSuggestionOpen(false)}
            sx={{ mt: 2 }} // Margin-top for spacing
            variant="outlined"
            color="secondary"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

Amenities.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};
