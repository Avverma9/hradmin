import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { localUrl } from 'src/utils/util';

import AppWidgetSummary from '../app-widget-summary';

// ----------------------------------------------------------------------

export default function AppView() {
  const [hotelCount, setHotelCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [bookingCount, setBookingCount] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingResponse, hotelResponse, userResponse] = await Promise.all([
          axios.get(`${localUrl}/get-all/bookings-count`),
          axios.get(`${localUrl}/get-hotels/count`),
          axios.get(`${localUrl}/get-total/user-details`),
        ]);

        setBookingCount(bookingResponse.data);
        setHotelCount(hotelResponse.data);
        setUserCount(userResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const loggedIn = localStorage.getItem('user_email');
  const name = localStorage.getItem('user_name');

  useEffect(() => {
    if (!loggedIn) {
      navigate('/');
    }
  }, [loggedIn, navigate]);

  const handleWidgetClick = (title) => {
    if (title === 'Bookings') {
      navigate('/your-bookings');
    } else if (title === 'Hotels') {
      navigate('/your-hotels');
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>; // Loading state
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋 {name}
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Bookings"
            total={bookingCount || 0}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
            onClick={() => handleWidgetClick('Bookings')}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Users"
            total={userCount || 0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            onClick={() => handleWidgetClick('Users')}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Hotels"
            total={hotelCount || 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
            onClick={() => handleWidgetClick('Hotels')}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Reports"
            total={234}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
            onClick={() => handleWidgetClick('Reports')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
