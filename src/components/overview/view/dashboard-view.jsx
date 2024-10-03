import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { role, localUrl } from '../../../../utils/util';


import AppWidgetSummary from '../app-widget-summary';
import { Grid2 } from '@mui/material';
import Rooms from 'src/components/rooms/Rooms';

// ----------------------------------------------------------------------

export default function AppView() {
  const [hotelCount, setHotelCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [bookingCount, setBookingCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  const name = localStorage.getItem('user_name');

  const handleWidgetClick = (title) => {
    switch (title) {
      case 'Bookings':
        if (role === 'PMS') {
          navigate('/your-bookings');
        } else {
          navigate('/all-bookings');
        }
        break;
      case 'Hotels':
        navigate('/your-hotels');
        break;
      case 'Users':
        navigate('/all-users');
        break;
      case 'Reports':
        if (role === 'Admin') {
          navigate('/complaints');
        } else if (role === 'PMS') {
          navigate('/your-complaints');
        }
        break;
      case 'Notifications':
        navigate('/notifications');
        break;
      case 'Partners':
        navigate('/partners');
        break;
      case 'Messenger':
        navigate('/messenger');
        break;
      case 'Availability':
        if (role === 'Admin') {
          navigate('/hotels/availability');
        }
        break;
      case 'Coupons':
        navigate('/apply-pms-coupon');
        break;
      case 'Monthly Price':
        navigate('/hotels/monthly-price');
        break;
      case 'Travel locations':
        navigate('/add-travel-location');
        break;
      case 'Reviews':
        navigate('/all-reviews');
        break;
      default:
        console.warn('Unknown widget title:', title);
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Widgets configuration
  const widgets = [
    {
      title: 'Bookings',
      count: bookingCount,
      color: 'success',
      icon: '/assets/icons/glass/ic_glass_bag.png',
    },
    {
      title: 'Users',
      count: userCount,
      color: 'info',
      icon: '/assets/icons/glass/ic_glass_users.png',
    },
    {
      title: 'Hotels',
      count: hotelCount,
      color: 'warning',
      icon: '/assets/icons/glass/ic_glass_buy.png',
    },
    {
      title: 'Reports',
      count: 234,
      color: 'error',
      icon: '/assets/icons/glass/ic_glass_message.png',
    },
    {
      title: 'Notifications',
      color: 'success',
      icon: 'https://static.vecteezy.com/system/resources/previews/009/394/760/non_2x/bell-icon-transparent-notification-free-png.png',
    },
    {
      title: 'Partners',
      color: 'info',
      icon: 'https://www.iconpacks.net/icons/2/free-handshake-icon-3312-thumb.png',
    },
    {
      title: 'Messenger',
      color: 'warning',
      icon: 'https://www.pngall.com/wp-content/uploads/5/Facebook-Messenger-Logo-PNG-HD-Image.png',
    },
    {
      title: 'Coupons',
      color: 'error',
      icon: 'https://png.pngtree.com/png-vector/20220803/ourmid/pngtree-gift-voucher-coupon-design-png-image_6097745.png',
    },
    {
      title: 'Availability',
      color: 'error',
      icon: 'https://www.freeiconspng.com/thumbs/check-tick-icon/tick-icon-30.png',
    },
    {
      title: 'Monthly Price',
      color: 'success',
      icon: 'https://atlas-content-cdn.pixelsquid.com/stock-images/calendar-Q9V6xnA-600.jpg',
    },
    {
      title: 'Travel locations',
      color: 'info',
      icon: 'https://www.freeiconspng.com/thumbs/travel-icon-png/plane-travel-flight-tourism-travel-icon-png-10.png',
    },
    {
      title: 'Reviews',
      color: 'warning',
      icon: 'https://png.pngtree.com/png-vector/20230427/ourmid/pngtree-review-us-survey-star-scale-feedback-vector-png-image_6737386.png',
    },
  ];

  // Filter widgets based on role
  const filteredWidgets =
    role === 'Admin'
      ? widgets
      : widgets.filter(
          (widget) =>
            ![
              'Users',
              'Partners',
              'Reviews',
              'Travel locations',
              'Notifications',
              'Availability',
            ].includes(widget.title)
        );

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" sx={{ mb: 5 }}>
        Hi👋 {name}, Welcome back <br /> <hr />
        {formattedTime} / {formattedDate}
      </Typography>
      <Typography variant="h6" sx={{ mb: 5 }}>
        Dashboard shortcuts{' '}
      </Typography>
      <Grid2 container spacing={3}>
        {filteredWidgets.map((widget) => (
          <Grid2 xs={12} sm={6} md={3} key={widget.title}>
            <AppWidgetSummary
              title={widget.title}
              total={widget.count || 0}
              color={widget.color}
              icon={<img alt={`${widget.title} icon`} src={widget.icon} />}
              onClick={() => handleWidgetClick(widget.title)}
            />
          </Grid2>
        ))}
      </Grid2>
      {role === 'PMS' && <Rooms />}
    </Container>
  );
}
