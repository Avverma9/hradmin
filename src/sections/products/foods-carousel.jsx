/* eslint-disable jsx-a11y/img-redundant-alt */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FaRupeeSign } from 'react-icons/fa';
import { IoFastFoodOutline } from 'react-icons/io5';

import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Grid, Typography, IconButton } from '@mui/material';

const FoodCarousel = ({ limitedFood }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const foodsPerPage = 4;

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, Math.floor(limitedFood.length / foodsPerPage))
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const start = currentIndex * foodsPerPage;
  const end = start + foodsPerPage;
  const currentFoods = limitedFood.slice(start, end);
  const totalPages = Math.ceil(limitedFood.length / foodsPerPage);

  return (
    <Box sx={{ padding: '20px' }}>
      {limitedFood.length === 0 ? (
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/data-error-11521121-9404366.png?f=webp"
          alt="No food available"
          style={{ display: 'block', margin: 'auto', width: '80%', maxWidth: '400px' }}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {currentFoods.map((food) => (
              <Grid item key={food._id} xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                  }}
                >
                  <Box sx={{ padding: '15px' }}>
                    <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold' }}>
                      {food.name}
                    </Typography>
                    {food.images && (
                      <img
                        src={food.images}
                        alt={`${food.name} image`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                        }}
                      />
                    )}
                    <Typography variant="body2" sx={{ margin: '5px 0' }}>
                      <IoFastFoodOutline /> {food.foodType}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'red', fontSize: '18px', margin: '5px 0' }}
                    >
                      <FaRupeeSign /> {food.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'green', margin: '5px 0' }}>
                      <Tooltip title={food.about}>{food.about}</Tooltip>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            <IconButton
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="previous"
              sx={{ marginRight: '10px' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body1" sx={{ margin: '0 10px' }}>
              Page {currentIndex + 1} of {totalPages}
            </Typography>
            <IconButton
              onClick={handleNext}
              disabled={currentIndex >= Math.floor(limitedFood.length / foodsPerPage)}
              aria-label="next"
              sx={{ marginLeft: '10px' }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

// Prop Types Validation
FoodCarousel.propTypes = {
  limitedFood: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      images: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      foodType: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      about: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default FoodCarousel;
