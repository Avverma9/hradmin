/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Modal, Button, Checkbox, Typography, FormControlLabel } from '@mui/material';

import { localUrl } from 'src/utils/util';

export default function Amenities({ open, onClose, hotelId }) {
  const [data, setData] = useState([]);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [existingAmenities, setExistingAmenities] = useState([]);
  const [selectedAmenityWarning, setSelectedAmenityWarning] = useState(null);

  const allAmenities = [
    { name: 'Pool', id: 'poolCheckbox' },
    { name: 'Fitness Center', id: 'fitnessCheckbox' },
    { name: 'Spa', id: 'spaCheckbox' },
    { name: 'Restaurant', id: 'restaurantCheckbox' },
    { name: 'Conference Room', id: 'conferenceRoomCheckbox' },
    { name: 'Wi-Fi Paid', id: 'wifiCheckbox' },
    { name: 'Parking', id: 'parkingCheckbox' },
    { name: 'Pet Friendly', id: 'petFriendlyCheckbox' },
    { name: 'Laundry Service', id: 'laundryCheckbox' },
    { name: 'Business Center', id: 'businessCenterCheckbox' },
    { name: 'Shuttle Service', id: 'shuttleCheckbox' },
    { name: '24-Hour Front Desk', id: 'frontDeskCheckbox' },
    { name: 'Gym', id: 'gymCheckbox' },
    { name: 'Lounge Area', id: 'loungeCheckbox' },
    { name: 'Free Wi-Fi', id: 'freeWifiCheckbox' },
    { name: 'TV', id: 'tvCheckbox' },
    { name: 'Air Conditioning', id: 'airConditioningCheckbox' },
    { name: 'Coffee Maker', id: 'coffeeMakerCheckbox' },
    { name: 'Balcony', id: 'balconyCheckbox' },
    { name: 'Jacuzzi', id: 'jacuzziCheckbox' },
    { name: 'Barbecue Area', id: 'barbecueCheckbox' },
    { name: 'Room Service', id: 'roomServiceCheckbox' },
    { name: 'Ensuite Bathroom', id: 'ensuiteBathroomCheckbox' },
    { name: 'Telephone', id: 'telephoneCheckbox' },
    { name: 'Daily Housekeeping', id: 'dailyHousekeepingCheckbox' },
    { name: 'Complimentary Toiletries', id: 'toiletriesCheckbox' },
    { name: 'Closet', id: 'closetCheckbox' },
    { name: 'Iron and Ironing Board', id: 'ironCheckbox' },
    { name: 'Hair Dryer', id: 'hairDryerCheckbox' },
    { name: 'Safe', id: 'safeCheckbox' },
    { name: 'Mini Fridge', id: 'miniFridgeCheckbox' },
    { name: 'Microwave', id: 'microwaveCheckbox' },
    { name: 'Desk', id: 'deskCheckbox' },
    { name: 'Wake-up Service', id: 'wakeUpServiceCheckbox' },
    { name: 'Heating', id: 'heatingCheckbox' },
    { name: 'Cable Channels', id: 'cableChannelsCheckbox' },
    { name: 'Non-Smoking Rooms', id: 'nonSmokingCheckbox' },
    { name: 'Soundproof Rooms', id: 'soundproofCheckbox' },
    { name: 'Family Rooms', id: 'familyRoomsCheckbox' },
    { name: 'Elevator', id: 'elevatorCheckbox' },
    { name: 'Wheelchair Accessible', id: 'wheelchairAccessibleCheckbox' },
    { name: 'Airport Shuttle', id: 'airportShuttleCheckbox' },
    { name: 'Concierge Service', id: 'conciergeCheckbox' },
    { name: 'Valet Parking', id: 'valetParkingCheckbox' },
    { name: 'Currency Exchange', id: 'currencyExchangeCheckbox' },
    { name: 'ATM on Site', id: 'atmCheckbox' },
    { name: 'Gift Shop', id: 'giftShopCheckbox' },
    { name: 'Express Check-in/Check-out', id: 'expressCheckInCheckbox' },
    { name: 'Tour Desk', id: 'tourDeskCheckbox' },
    { name: 'Ticket Service', id: 'ticketServiceCheckbox' },
    { name: 'Luggage Storage', id: 'luggageStorageCheckbox' },
    { name: 'Library', id: 'libraryCheckbox' },
    { name: 'Sun Terrace', id: 'sunTerraceCheckbox' },
    { name: 'Garden', id: 'gardenCheckbox' },
    { name: 'Picnic Area', id: 'picnicAreaCheckbox' },
    { name: 'Outdoor Furniture', id: 'outdoorFurnitureCheckbox' },
    { name: 'Terrace', id: 'terraceCheckbox' },
    { name: 'BBQ Facilities', id: 'bbqFacilitiesCheckbox' },
    { name: 'Vending Machine Drinks', id: 'vendingMachineDrinksCheckbox' },
    { name: 'Vending Machine Snacks', id: 'vendingMachineSnacksCheckbox' },
    { name: 'Special Diet Menus on request', id: 'specialDietMenusCheckbox' },
    { name: 'Packed Lunches', id: 'packedLunchesCheckbox' },
    { name: 'Bar', id: 'barCheckbox' },
    { name: 'Wine Champagne', id: 'wineChampagneCheckbox' },
    { name: 'Bottle of Water', id: 'bottleOfWaterCheckbox' },
    { name: 'Chocolate Cookies', id: 'chocolateCookiesCheckbox' },
    { name: 'Kid-Friendly Buffet', id: 'kidFriendlyBuffetCheckbox' },
    { name: 'Kid Meals', id: 'kidMealsCheckbox' },
    { name: 'Breakfast in the Room', id: 'breakfastInRoomCheckbox' },
    { name: 'Restaurant Buffet', id: 'restaurantBuffetCheckbox' },
    { name: 'Snack Bar', id: 'snackBarCheckbox' },
    { name: 'Fruit', id: 'fruitCheckbox' },
    { name: 'Buffet Breakfast', id: 'buffetBreakfastCheckbox' },
    { name: 'Continental Breakfast', id: 'continentalBreakfastCheckbox' },
    { name: 'Gluten-Free Options', id: 'glutenFreeOptionsCheckbox' },
    { name: 'Vegetarian Options', id: 'vegetarianOptionsCheckbox' },
    { name: 'Vegan Options', id: 'veganOptionsCheckbox' },
    { name: 'Halal Options', id: 'halalOptionsCheckbox' },
    { name: 'Kosher Options', id: 'kosherOptionsCheckbox' },
    { name: 'Allergy-Free Room', id: 'allergyFreeRoomCheckbox' },
    { name: 'Designated Smoking Area', id: 'smokingAreaCheckbox' },
    { name: 'Non-Smoking Throughout', id: 'nonSmokingThroughoutCheckbox' },
    { name: 'Kitchen', id: 'kitchen' },
  ];

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
    <>
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
              <Grid item xs={12} sm={6} md={4} key={amenity.id}>
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
    </>
  );
}

Amenities.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};
