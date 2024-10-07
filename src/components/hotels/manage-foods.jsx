/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { AiOutlineDelete } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { IoFastFoodOutline } from 'react-icons/io5';

import {
  Box,
  Grid,
  Modal,
  Input,
  Button,
  Select,
  styled,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  useMediaQuery,
} from '@mui/material';

import { localUrl } from '../../../utils/util';

import './button.css';
import { addFood, deleteFood, getHotelById } from '../redux/reducers/hotel';
import { useDispatch, useSelector } from 'react-redux';
import { useLoader } from '../../../utils/loader';

// Styled components
const ModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  paddingBottom: theme.spacing(10),
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
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
  },
}));

const FoodImage = styled('img')(({ theme }) => ({
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    width: '80px',
    height: '80px',
  },
}));

const FoodDetails = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginTop: theme.spacing(1),
    textAlign: 'center',
  },
}));

const AddFoodModal = ({ open, onClose, hotelId }) => {
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodType, setFoodType] = useState('');
  const [about, setAbout] = useState('');
  const [images, setImages] = useState([]);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const dispatch = useDispatch();
  const foods = useSelector((state) => state.hotel.byId?.foods || []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchFoods = async () => {
      if (hotelId) {
        setLoading(true); // Show loader
        await dispatch(getHotelById(hotelId));
        setLoading(false); // Hide loader after fetching
      }
    };

    if (open) {
      fetchFoods();
    } else {
      setLoading(false); // Hide loader if not open
    }
  }, [open, hotelId, dispatch]);

  useEffect(() => {
    if (loading) {
      showLoader(); // Show loader when loading
    } else {
      hideLoader(); // Hide loader when not loading
    }
  }, [loading]);

  const handleAddFood = async () => {
    showLoader(); // Show loader
    const formData = new FormData();
    formData.append('hotelId', hotelId);
    formData.append('name', foodName);
    formData.append('price', foodPrice);
    formData.append('foodType', foodType);
    formData.append('about', about);

    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await dispatch(addFood(formData));
    } catch (error) {
      toast.error('Error adding food');
    } finally {
      hideLoader(); // Hide loader
      setIsAddingFood(false);
      resetForm(); // Reset form fields
    }
  };

  const resetForm = () => {
    setFoodName('');
    setFoodPrice('');
    setFoodType('');
    setAbout('');
    setImages([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleDeleteFood = async (foodId) => {
    try {
      await dispatch(deleteFood({ hotelId, foodId }));
      await dispatch(getHotelById(hotelId)); // Fetch updated food list
    } catch (error) {
      console.error('Error deleting food:', error);
      toast.error('Error deleting item. Please try again.');
    }
  };

  const handleCancel = () => {
    fetchFoods(); // Refresh food list
    resetForm(); // Reset form state
    onClose(); // Close the modal
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
            {foods?.length > 0 ? (
              <Box>
                {foods.map((food, index) => (
                  <FoodItem key={food.foodId}>
                    {' '}
                    {/* Use unique identifier for key */}
                    <FoodImage src={food?.images} alt={`food ${index}`} />
                    <FoodDetails>
                      <Typography variant="h6">{food?.name}</Typography>
                      <Typography style={{ color: 'red' }} variant="body1">
                        <FaIndianRupeeSign /> {food?.price}
                      </Typography>
                      <Typography variant="body1">
                        <IoFastFoodOutline /> {food?.foodType}
                      </Typography>
                      <Typography style={{ color: 'green' }} variant="body2">
                        {food?.about}
                      </Typography>

                      <button
                        onClick={() => handleDeleteFood(food.foodId)}
                        className="custom-button"
                        startIcon={<AiOutlineDelete />}
                      >
                        Delete
                      </button>

                      <ImagePreview>
                        {images?.length > 0 &&
                          images.map((file, item) => (
                            <img
                              key={item}
                              src={URL.createObjectURL(file)}
                              alt={`Food ${item}`}
                              style={{
                                width: isMobile ? '60px' : '80px',
                                height: isMobile ? '60px' : '80px',
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                            />
                          ))}
                      </ImagePreview>
                    </FoodDetails>
                  </FoodItem>
                ))}
              </Box>
            ) : (
              <>
                <Typography>This hotel has no food availability.</Typography>
                <img
                  src="https://media.istockphoto.com/id/1396541669/vector/no-food-or-drink-icon.jpg?s=612x612&w=0&k=20&c=T8qvZM66nqu-Ir_rhjnmlmfTnbSUR4G6t0oPPlvVqfw="
                  alt="No food"
                  style={{ width: '100px', height: 'auto' }}
                />
              </>
            )}
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
                  required
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
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
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
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  required
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
                  {images?.length > 0 &&
                    images.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Food ${index}`}
                        style={{
                          width: isMobile ? '60px' : '80px',
                          height: isMobile ? '60px' : '80px',
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    ))}
                </ImagePreview>
              </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  handleCancel();
                  setIsAddingFood(false);
                }}
                className="custom-button"
                sx={{ mr: 1 }}
              >
                Cancel
              </button>
              <button onClick={handleAddFood} className="custom-button" disabled={loading}>
                {loading ? 'Adding...' : 'Add Food'}
              </button>
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!isAddingFood && (
            <button className="custom-button" onClick={() => setIsAddingFood(true)}>
              Add Food
            </button>
          )}
        </div>
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
