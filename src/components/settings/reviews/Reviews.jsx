/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Container } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { localUrl } from '../../../../utils/util';
import LinearLoader from '../../../../utils/Loading';
import { fToNow } from '../../../../utils/format-time';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function Reviews({ title, subheader, ...other }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch data when component mounts
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${localUrl}/find-all-users-hotel-review`);
        if (response.status === 200) {
          setLoading(false);
          setList(response.data); // Assuming response.data is an array of reviews
        }
      } catch (error) {
        setLoading(false);
        console.error('Error fetching reviews:', error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${localUrl}/delete/${id}`);
      // Remove the deleted review from the list
      if (response.status === 200) {
        toast.success('You have deleted a review');
        setList((prevList) => prevList.filter((review) => review._id !== id));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title="All User Reviews" subheader={subheader} />

      <Scrollbar>
        <Stack spacing={1} sx={{ pr: 0 }}>
          {list.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
              No reviews available
            </Typography>
          ) : (
            list.map((review) => (
              <NewsItem key={review._id} review={review} onDelete={handleDelete} />
            ))
          )}
        </Stack>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          View all
        </Button>
      </Box>
    </Card>
  );
}

Reviews.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

// ----------------------------------------------------------------------

function NewsItem({ review, onDelete }) {
  const { _id, userImage, userName, hotelName, comment, rating, createdAt } = review;

  // Function to render star rating
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Iconify
        key={i + 1}
        icon={i < rating ? 'eva:star-fill' : 'eva:star-outline'}
        sx={{ color: '#ffb74d', fontSize: 20 }}
      />
    ));

  return (
    <Grid container spacing={1} alignItems="flex-start" padding={5}>
      <Grid item xs={2} sm={1} md={1}>
        <Box
          component="img"
          alt={userName}
          src={userImage}
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ddd',
          }}
        />
      </Grid>
      <Grid item xs={9} sm={10} md={11}>
        <Stack spacing={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{hotelName}</Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onDelete(_id)}
              startIcon={<Iconify icon="eva:trash-2-outline" />}
              sx={{ ml: 2 }}
            >
              Delete
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {comment}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
            {renderStars(rating)}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {userName} posted {fToNow(new Date(createdAt))}
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}

NewsItem.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userImage: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    hotelName: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
