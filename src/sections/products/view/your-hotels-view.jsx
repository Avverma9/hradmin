import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Container } from '@mui/material';
import Typography from '@mui/material/Typography';

import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';

import ProductSort from '../product-sort';
import YourHotelCard from '../your-hotel-card';
import ProductFilters from '../product-filters';

export default function YourHotelsView() {
  const [openFilter, setOpenFilter] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const hotelEmail = localStorage.getItem('user_email');


useEffect(() => {
  const getAllHotels = async () => {
    try {
      const response = await fetch(`${localUrl}/hotels/query/get/by?hotelEmail=${hotelEmail}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      const res = await response.json();
      setData(res);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setLoading(false); // Ensure loading is set to false on error as well
    }
  };

  getAllHotels(); // Call getAllHotels directly inside useEffect

  // No dependencies in the array because getAllHotels doesn't change
}, [hotelEmail]);


  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  if (loading) {
    // Show loading indicator while fetching data
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Your Hotels
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
            <YourHotelCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
