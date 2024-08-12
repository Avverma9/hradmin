/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import { styled } from '@mui/system';
import {
  Box,
  Grid,
  Modal,
  Input,
  Button,
  Select,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  useMediaQuery,
} from '@mui/material';

import { localUrl } from 'src/utils/util';

// Styled component for the modal content
const ModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%', // Full width for responsiveness
  maxWidth: 600, // Max width for larger screens
  maxHeight: '90vh', // Max height to ensure it doesn't exceed viewport
  overflowY: 'auto', // Enable vertical scrolling if content is too large
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const UploadButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const FoodItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const AddFoodModal = ({ open, onClose, hotelId }) => {
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodType, setFoodType] = useState('');
  const [about, setAbout] = useState('');
  const [images, setImages] = useState([]);
  const [foods, setFoods] = useState([]);
  const [isAddingFood, setIsAddingFood] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (hotelId) {
      axios
        .get(`${localUrl}/hotels/get-by-id/${hotelId}`)
        .then((response) => {
          setFoods(response.data.foods); // Assuming response.data.foods contains the food items
        })
        .catch((error) => {
          toast.error('Error fetching foods');
        });
    }
  }, [hotelId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.map((file) => URL.createObjectURL(file))); // Store local URLs for preview
  };

  const handleAddFood = () => {
    const formData = new FormData();
    formData.append('hotelId', hotelId);
    formData.append('name', foodName);
    formData.append('price', foodPrice);
    formData.append('foodType', foodType);
    formData.append('about', about);
    images.forEach((image) => {
      formData.append('images', image); // Append each image file
    });

    axios
      .post(`${localUrl}/add/food-to/your-hotel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        toast.success('Food added successfully');
        onClose(); // Close the modal
        setIsAddingFood(false); // Close the add food form
      })
      .catch((error) => {
        toast.error('Error adding food');
        // Handle error (e.g., show an error message)
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <Header>
          <Typography variant="h6">{isAddingFood ? 'Add Food' : 'Hotel Foods'}</Typography>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        </Header>
        {!isAddingFood ? (
          <>
            {foods.length > 0 ? (
              <Box>
                {foods.map((food, index) => (
                  <FoodItem key={index}>
                    <Typography variant="h6">{food.name}</Typography>
                    <Typography variant="body1">Price: {food.price}</Typography>
                    <Typography variant="body1">Type: {food.foodType}</Typography>
                    <Typography variant="body2">{food.about}</Typography>
                    {/* Display food images if available */}
                    <ImagePreview>
                      <img src={food?.images} alt="food thumbnail" />
                    </ImagePreview>
                  </FoodItem>
                ))}
              </Box>
            ) : (
              <>
                <Typography>This hotel has no food availablity.</Typography>
                <img
                  src="https://media.istockphoto.com/id/1396541669/vector/no-food-or-drink-icon.jpg?s=612x612&w=0&k=20&c=T8qvZM66nqu-Ir_rhjnmlmfTnbSUR4G6t0oPPlvVqfw="
                  alt=""
                />
              </>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddingFood(true)}
              sx={{ mt: 2 }}
            >
              Add Food
            </Button>
          </>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Food Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Food Price"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={foodPrice}
                  onChange={(e) => setFoodPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Food Type</InputLabel>
                  <Select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    label="Food Type"
                  >
                    <MenuItem value="Appetizer">Appetizer</MenuItem>
                    <MenuItem value="Main Course">Main Course</MenuItem>
                    <MenuItem value="Dessert">Dessert</MenuItem>
                    <MenuItem value="Beverage">Beverage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="About"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Input
                  type="file"
                  inputProps={{ multiple: true }}
                  onChange={handleFileChange}
                  sx={{ display: 'none' }}
                  id="upload-file"
                />
                <label htmlFor="upload-file">
                  <UploadButton component="span">Choose Images</UploadButton>
                </label>
                <ImagePreview>
                  {images.length > 0 &&
                    images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Food ${index}`}
                        style={{
                          width: isMobile ? '80px' : '100px',
                          height: isMobile ? '80px' : '100px',
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    ))}
                </ImagePreview>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsAddingFood(false)} color="secondary" sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleAddFood} variant="contained" color="primary">
                Add Food
              </Button>
            </Box>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

AddFoodModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};

export default AddFoodModal;
