import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FaRupeeSign } from 'react-icons/fa';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';

const RoomCarousel = ({ limitedRoom }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const roomsPerPage = 4;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, Math.floor(limitedRoom.length / roomsPerPage)));
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const start = currentIndex * roomsPerPage;
  const end = start + roomsPerPage;
  const currentRooms = limitedRoom.slice(start, end);
  const totalPages = Math.ceil(limitedRoom.length / roomsPerPage);

  return (
    <Box sx={{ padding: '20px' }}>
      {limitedRoom.length === 0 ? (
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/data-error-11521121-9404366.png?f=webp"
          alt="No rooms available"
          style={{ display: 'block', margin: 'auto', width: '80%', maxWidth: '400px' }}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {currentRooms.map((room) => (
              <Grid item key={room._id} xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                  }}
                >
                  <Box sx={{ position: 'relative', width: '100%', height: '150px' }}>
                    <img
                      src={room.images}
                      alt={`${room.type} room`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box sx={{ padding: '15px' }}>
                    <Typography variant="h6" component="p" sx={{ fontWeight: 'bold' }}>
                      {room.type}
                    </Typography>
                    <Typography variant="body2" sx={{ margin: '5px 0' }}>
                      <strong>Bed Type:</strong> {room.bedTypes}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'red', fontSize: '18px', margin: '5px 0' }}>
                      <FaRupeeSign /> {room.price}
                    </Typography>
                    <Typography variant="body2" sx={{ margin: '5px 0' }}>
                      <strong>Total: {room.totalRooms} / Available Rooms: {room.countRooms}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
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
              disabled={currentIndex >= Math.floor(limitedRoom.length / roomsPerPage)}
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
RoomCarousel.propTypes = {
  limitedRoom: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      images: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      bedTypes: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      totalRooms: PropTypes.number.isRequired,
      countRooms: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default RoomCarousel;
