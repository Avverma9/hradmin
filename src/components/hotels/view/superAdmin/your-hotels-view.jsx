import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { Container, LinearProgress } from '@mui/material';
import Typography from '@mui/material/Typography';

import { localUrl } from '../../../../../utils/util';

import YourHotelCard from './your-hotel-card';

export default function YourHotelsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const hotelEmail = sessionStorage.getItem('user_email');

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

  if (loading) {
    // Show loading indicator while fetching data
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="auto">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Your Hotels
      </Typography>
      <Grid container spacing={3}>
        {data.map((product) => (
          <Grid key={product._id} item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <YourHotelCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
