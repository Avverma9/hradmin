import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { Edit } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import ImageUpload from './manage-hotel-images';

const HotelCarousel = ({ hotel, hotelId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openImageModal, setOpenImageModal] = useState(false);
  const hotelImages = Array.isArray(hotel?.images) ? hotel.images : [];
  const hasImages = hotelImages.length > 0;
  const activeImage = hasImages
    ? hotelImages[currentIndex] || hotelImages[0]
    : 'https://cdni.iconscout.com/illustration/premium/thumb/data-error-11521121-9404366.png?f=webp';

  useEffect(() => {
    if (!hasImages) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= hotelImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, hasImages, hotelImages.length]);

  const handleNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % hotelImages.length);
  };

  const handlePrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + hotelImages.length) % hotelImages.length);
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
        disabled={!hasImages}
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
        disabled={!hasImages}
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
        src={activeImage}
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
      <ImageUpload
        open={openImageModal}
        onClose={handleCloseImageModal}
        hotelId={hotelId || hotel?.hotelId || ""}
      />
    </Box>
  );
};

// Prop Types Validation
HotelCarousel.propTypes = {
  hotelId: PropTypes.string,
  hotel: PropTypes.shape({
    images: PropTypes.arrayOf(PropTypes.string),
    hotelId: PropTypes.string,
  }).isRequired,
};

export default HotelCarousel;
