import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Card,
  Grid,
  Stack,
  Container,
  Typography,
  CardHeader,
  Avatar,
  IconButton,
  CardContent,
  Rating,
  Skeleton,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';

import { localUrl } from '../../../../utils/util';
import { fToNow } from '../../../../utils/format-time';
import { useLoader } from '../../../../utils/loader';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function ReviewsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [visibleCount, setVisibleCount] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const throttleRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${localUrl}/find-all-users-hotel-review`);
        if (response.status === 200) {
          setList(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredReviews = useMemo(() =>
    list.filter(review => {
      const matchesSearch = debouncedSearchTerm
        ? review.userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          review.hotelName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        : true;
      const matchesRating = ratingFilter > 0 ? review.rating === ratingFilter : true;
      return matchesSearch && matchesRating;
    }),
    [list, debouncedSearchTerm, ratingFilter]
  );

  useEffect(() => {
    setVisibleCount(10);
  }, [debouncedSearchTerm, ratingFilter]);

  const handleLoadMore = useCallback(() => {
    if (throttleRef.current) return;

    if (visibleCount < filteredReviews.length) {
      throttleRef.current = true;
      setTimeout(() => {
        setVisibleCount(prevCount => prevCount + 10);
        throttleRef.current = false;
      }, 500);
    }
  }, [visibleCount, filteredReviews.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      showLoader();
      try {
        const response = await axios.delete(`${localUrl}/delete/${id}`);
        if (response.status === 200) {
          toast.success('You have deleted a review');
          setList((prevList) => prevList.filter((review) => review._id !== id));
        }
      } catch (error) {
        toast.error('Error deleting review.');
        console.error('Error deleting review:', error);
      } finally {
        hideLoader();
      }
    }
  };

  const displayedReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        User Reviews
      </Typography>

      <Card elevation={3} sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search by User or Hotel Name"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filter by Rating</InputLabel>
                <Select
                  value={ratingFilter}
                  label="Filter by Rating"
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <MenuItem value={0}>All Ratings</MenuItem>
                  <MenuItem value={5}>5 Stars</MenuItem>
                  <MenuItem value={4}>4 Stars</MenuItem>
                  <MenuItem value={3}>3 Stars</MenuItem>
                  <MenuItem value={2}>2 Stars</MenuItem>
                  <MenuItem value={1}>1 Star</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack spacing={3}>
        {loading ? (
          Array.from(new Array(5)).map((_, index) => <ReviewItemSkeleton key={index} />)
        ) : displayedReviews.length > 0 ? (
          <>
            {displayedReviews.map((review) => (
              <ReviewItem key={review._id} review={review} onDelete={handleDelete} />
            ))}
            {hasMore && <ReviewItemSkeleton />}
          </>
        ) : (
          <Paper sx={{ textAlign: 'center', p: 5, mt: 3 }}>
            <RateReviewOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ mt: 1 }}>No Reviews Found</Typography>
            <Typography color="text.secondary">Try adjusting your search filters.</Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

function ReviewItem({ review, onDelete }) {
  const { _id, userImage, userName, hotelName, comment, rating, createdAt } = review;

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Avatar src={userImage} alt={userName} />}
        action={
          <Tooltip title="Delete Review">
            <IconButton onClick={() => onDelete(_id)}>
              <DeleteOutlineIcon color="error"/>
            </IconButton>
          </Tooltip>
        }
        title={<Typography variant="subtitle1" fontWeight="bold">{userName}</Typography>}
        subheader={`posted ${fToNow(new Date(createdAt))}`}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Review for: <strong>{hotelName}</strong>
          </Typography>
          <Rating value={rating} readOnly precision={0.5} />
          <Typography variant="body1" sx={{ fontStyle: 'italic', pl: 0.5 }}>
            "{comment}"
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ReviewItemSkeleton() {
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Skeleton animation="wave" variant="circular" width={40} height={40} />}
        action={<Skeleton animation="wave" variant="circular" width={32} height={32} />}
        title={<Skeleton animation="wave" height={20} width="30%" />}
        subheader={<Skeleton animation="wave" height={15} width="20%" />}
      />
      <CardContent sx={{ pt: 0 }}>
        <Skeleton animation="wave" height={20} width="50%" sx={{ mb: 1 }} />
        <Skeleton animation="wave" height={25} width="40%" sx={{ my: 1 }} />
        <Skeleton animation="wave" height={40} width="90%" />
      </CardContent>
    </Card>
  );
}

ReviewsPage.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

ReviewItem.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userImage: PropTypes.string,
    userName: PropTypes.string.isRequired,
    hotelName: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
