import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Edit } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import ImageUpload from './manage-hotel-images';

const HotelCarousel = ({ hotel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openImageModal, setOpenImageModal] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % hotel.images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + hotel.images.length) % hotel.images.length);
  };

  const handleShowImageModal = () => {
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
  };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          zIndex: 10,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          zIndex: 10,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <ArrowForwardIcon />
      </IconButton>

      <img
        src={hotel.images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        style={{
          width: '100%',
          height: '550px',
          objectFit: 'cover',
          transition: 'transform 0.5s ease',
        }}
      />

      <IconButton
        sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          padding: '10px',
          marginLeft: '1rem',
          color: 'white',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          '&:hover': { backgroundColor: '#007b34' },
        }}
        onClick={handleShowImageModal}
      >
        <Edit />
      </IconButton>

      {/* Image Upload Modal */}
      <ImageUpload open={openImageModal} onClose={handleCloseImageModal} hotelId={hotel.hotelId} />
    </Box>
  );
};

// Prop Types Validation
HotelCarousel.propTypes = {
  hotel: PropTypes.shape({
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    hotelId: PropTypes.string.isRequired, // Ensure hotelId is part of hotel object
  }).isRequired,
};

export default HotelCarousel;
