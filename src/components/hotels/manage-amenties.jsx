/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState, useEffect, useMemo } from 'react';

// Material-UI Imports
import {
  Box,
  Grid,
  Dialog,
  Button,
  Typography,
  Chip,
  Stack,
  Divider,
  Autocomplete,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Local Imports
import { localUrl } from '../../../utils/util';
import { useHotelAmenities } from '../../../utils/additional/hotelAmenities';

export default function Amenities({ open, onClose, hotelId }) {
  const [currentAmenities, setCurrentAmenities] = useState([]);
  const [amenitiesToAdd, setAmenitiesToAdd] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const allAmenities = useHotelAmenities();

  useEffect(() => {
    const fetchAmenities = async () => {
      if (!hotelId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        const amenitiesData = response.data.amenities.flatMap((item) => item.amenities);
        setCurrentAmenities(amenitiesData);
      } catch (error) {
        toast.error('Failed to fetch hotel amenities.');
        console.error('Error fetching amenities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchAmenities();
    } else {
      // Reset state when modal is closed
      setCurrentAmenities([]);
      setAmenitiesToAdd([]);
    }
  }, [hotelId, open]);

  const handleDeleteAmenity = async (amenityToDelete) => {
    try {
      await axios.delete(`${localUrl}/hotels/${hotelId}/amenities/${amenityToDelete}`);
      // Optimistic UI update
      setCurrentAmenities((prev) => prev.filter((amenity) => amenity !== amenityToDelete));
      toast.success(`"${amenityToDelete}" removed successfully.`);
    } catch (error) {
      toast.error(`Error deleting amenity: ${error.message}`);
    }
  };

  const handleAddAmenities = async () => {
    if (amenitiesToAdd.length === 0) {
      toast.info('Please select at least one amenity to add.');
      return;
    }
    
    const newAmenityNames = amenitiesToAdd.map(a => a.name);

    try {
      await axios.post(`${localUrl}/create-a-amenities/to-your-hotel`, {
        hotelId,
        amenities: newAmenityNames,
      });
      // Optimistic UI update
      setCurrentAmenities((prev) => [...prev, ...newAmenityNames]);
      setAmenitiesToAdd([]); // Clear the selection
      toast.success('Amenities added successfully.');
    } catch (error) {
      toast.error(`Error adding amenities: ${error.message}`);
    }
  };
  
  // Memoize the list of available amenities to prevent recalculation on every render
  const availableOptions = useMemo(
    () => allAmenities.filter((amenity) => !currentAmenities.includes(amenity.name)),
    [allAmenities, currentAmenities]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Manage Amenities
        </Typography>
        <IconButton aria-label="close" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Current Hotel Amenities
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              p: 2,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: '80px',
              alignContent: 'flex-start'
            }}>
              {currentAmenities.length > 0 ? (
                currentAmenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    onDelete={() => handleDeleteAmenity(amenity)}
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No amenities have been added to this hotel yet.
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }}>
              <Chip label="ADD NEW" size="small" />
            </Divider>

            <Autocomplete
              multiple
              limitTags={3}
              id="add-amenities-autocomplete"
              options={availableOptions}
              getOptionLabel={(option) => option.name}
              value={amenitiesToAdd}
              onChange={(event, newValue) => {
                setAmenitiesToAdd(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Search and Select Amenities" />
              )}
              sx={{ mt: 2 }}
              noOptionsText="All available amenities have been added."
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleAddAmenities} variant="contained" color="primary" disabled={isLoading || amenitiesToAdd.length === 0}>
          Add Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Amenities.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string,
};

Amenities.defaultProps = {
  hotelId: null,
};