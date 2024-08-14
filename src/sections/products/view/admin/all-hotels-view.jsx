/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Container, TextField } from '@mui/material';

import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';

import ProductCard from './all-hotel-card';
import AddFoodModal from '../../manage-foods';
// Import AddFoodModal

export default function ProductsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAllHotels();
  }, []);

  const getAllHotels = async () => {
    try {
      const response = await fetch(`${localUrl}/get/all/hotels`);
      const res = await response.json();
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHotel(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter data based on search query
  const filteredData = data.filter(
    (hotel) =>
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery)
  );

  if (loading) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hotels
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <TextField
          label="Search hotel or owner name ..."
          variant="outlined"
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
      </Stack>

      <Grid container spacing={3}>
        {filteredData.map((product) => (
          <Grid key={product._id} item xs={12} sm={6} md={3}>
            <ProductCard
              product={product}
              onAddFood={() => handleOpenModal(product)} // Pass handleOpenModal to ProductCard
            />
          </Grid>
        ))}
      </Grid>

      {selectedHotel && (
        <AddFoodModal
          open={isModalOpen}
          onClose={handleCloseModal}
          // Additional props if needed
        />
      )}
    </Container>
  );
}
