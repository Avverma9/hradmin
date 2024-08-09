import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import { Container } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';

import ProductCard from './all-hotel-card';
import ProductSort from '../../product-sort';
import AddFoodModal from '../../add-food-to-hotel';
import ProductFilters from '../../product-filters'; // Import AddFoodModal


export default function ProductsView() {
  const [openFilter, setOpenFilter] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

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

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenModal = (hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHotel(null);
  };

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
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
          <ProductFilters
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
          />
          <ProductSort />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {data.map((product) => (
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
