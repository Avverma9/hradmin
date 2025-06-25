import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  Divider,
  Typography,
  CardHeader,
  Avatar,
  IconButton,
  CardContent,
  Rating,
  TablePagination,
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

// Custom hook for debouncing input
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


// --- The Main Page Component ---
export default function ReviewsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();

  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
  
  const paginatedReviews = filteredReviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        User Reviews
      </Typography>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField 
                fullWidth
                label="Search by User or Hotel Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
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
        ) : paginatedReviews.length > 0 ? (
          paginatedReviews.map((review) => (
            <ReviewItem key={review._id} review={review} onDelete={handleDelete} />
          ))
        ) : (
          <Paper sx={{ textAlign: 'center', p: 5 }}>
            <RateReviewOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ mt: 1 }}>No Reviews Found</Typography>
            <Typography color="text.secondary">Try adjusting your search filters.</Typography>
          </Paper>
        )}
      </Stack>

      <TablePagination
        component="div"
        count={filteredReviews.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ mt: 3 }}
      />
    </Container>
  );
}

// --- Reusable component for a single review item ---
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
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Review for: <strong>{hotelName}</strong>
          </Typography>
          <Rating value={rating} readOnly />
          <Typography variant="body1" sx={{ fontStyle: 'italic', pl: 0.5 }}>
            "{comment}"
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Reusable Skeleton for loading state ---
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
        <Skeleton animation="wave" height={20} width="50%" />
        <Skeleton animation="wave" height={25} width="40%" sx={{ my: 1 }} />
        <Skeleton animation="wave" height={40} width="90%" />
      </CardContent>
    </Card>
  );
}

// --- Prop Types ---
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