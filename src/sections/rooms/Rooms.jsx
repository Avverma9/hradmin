import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  Card,
  useTheme,
  CardMedia,
  Typography,
  IconButton,
  CardContent,
  useMediaQuery,
} from '@mui/material';

import { localUrl, hotelEmail } from 'src/utils/util';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Set number of items per page based on screen size
  const itemsPerPage = isSmallScreen ? 2 : 4; // 2 items per page on small screens, 4 otherwise
  const cardGap = 2; // Gap between cards in theme spacing units (adjust as needed)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${localUrl}/get-list-of/rooms?hotelEmail=${hotelEmail}`);
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const totalRooms = rooms.length;
  const totalPages = Math.ceil(totalRooms / itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalPages - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === totalPages - 1 ? 0 : prevIndex + 1));
  };

  return (
    <Box sx={{ p: 3 }}>
      {totalRooms > 0 ? (
        <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.5s ease',
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              width: `${totalPages * 100}%`,
              flexDirection: 'row',
              gap: `${cardGap * 8}px`, // Gap between cards
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <Box
                key={pageIndex}
                sx={{
                  display: 'flex',
                  flex: '0 0 auto',
                  width: `${100 / itemsPerPage}%`,
                  boxSizing: 'border-box',
                }}
              >
                {rooms
                  .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                  .map((room, index) => (
                    <Box key={index} sx={{ flex: '0 0 auto', width: '100%', p: 1 }}>
                      <Card
                        sx={{
                          borderRadius: '12px',
                          boxShadow: 3,
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 6,
                          },
                          overflow: 'hidden',
                          height: '350px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={room.images[0]} // Display the first image
                          alt={room.type}
                          sx={{ height: '60%', objectFit: 'cover' }}
                        />
                        <CardContent
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2, // Added padding for better spacing
                          }}
                        >
                          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {room.type}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Bed Type: {room.bedTypes}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold', color: 'primary.main' }}
                          >
                            ₹ {room.price}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No. of Rooms: {room.countRooms}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
              </Box>
            ))}
          </Box>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="h6">No rooms available</Typography>
      )}
    </Box>
  );
}
