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
  LinearProgress,
  ButtonGroup,
  Autocomplete,
  Button,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';

// These imports are placeholders based on the provided code snippets.
// You should adjust them to your actual project structure.
import { useDispatch, useSelector } from 'react-redux';
import { getAllHotels, getHotelsByFilters, getHotelsCity } from 'src/components/redux/reducers/hotel';
import ProductCard from './all-hotel-card';
import AddFoodModal from '../../manage-foods';
import { useLoader } from '../../../../../utils/loader';


export default function ProductsView() {
  const dispatch = useDispatch();
  const { data, byCity, byFilter } = useSelector((state) => state.hotel);
  const { showLoader, hideLoader } = useLoader();

  const [selectedCity, setSelectedCity] = useState('All City');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcceptedFilter, setIsAcceptedFilter] = useState(null);

  // --- Infinite Scroll State ---
  const [visibleCount, setVisibleCount] = useState(8); // Show initial 8 items
  const throttleRef = useRef(false);

  useEffect(() => {
    const getHotels = async () => {
      showLoader();
      try {
        await dispatch(getAllHotels());
        await dispatch(getHotelsCity());
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        hideLoader();
      }
    };
    getHotels();
  }, [dispatch]);

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

  const handleCityChange = async (event, newValue) => {
    try {
      setSelectedCity(newValue);
      if (newValue !== 'All City') {
        showLoader();
        await dispatch(getHotelsByFilters(newValue));
      }
    } catch (error) {
      console.error("Error filtering by city:", error);
    } finally {
      hideLoader();
    }
  };

  // --- Placeholder handlers for props required by ProductCard ---
  const handleUpdateAmenities = (hotelId, amenitiesData) => {
    console.log('Update amenities for hotel:', hotelId, amenitiesData);
    // Implement your logic here
  };
  const handleAddRoom = (hotelId, roomData) => {
    console.log('Add room for hotel:', hotelId, roomData);
    // Implement your logic here
  };
  const handleBasicDetails = (hotelId, basicData) => {
    console.log('Update basic details for hotel:', hotelId, basicData);
    // Implement your logic here
  };


  const filteredData = useMemo(() => {
    const sourceData = selectedCity !== "All City" ? byFilter : data;
    if (!Array.isArray(sourceData)) return []; // Ensure sourceData is an array
    return sourceData.filter((hotel) => {
      const matchesSearchQuery =
        hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
        hotel.hotelName.toLowerCase().includes(searchQuery);
      const matchesAcceptedFilter =
        isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;
      return matchesSearchQuery && matchesAcceptedFilter;
    });
  }, [data, byFilter, selectedCity, searchQuery, isAcceptedFilter]);

  // --- Infinite Scroll Logic ---
  useEffect(() => {
    setVisibleCount(8); // Reset visible count when filters change
  }, [searchQuery, selectedCity, isAcceptedFilter]);

  const handleLoadMore = useCallback(() => {
    if (throttleRef.current) return;

    if (visibleCount < filteredData?.length) {
      throttleRef.current = true;
      setTimeout(() => {
        setVisibleCount(prevCount => prevCount + 8); // Load 8 more items
        throttleRef.current = false;
      }, 500);
    }
  }, [visibleCount, filteredData?.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        handleLoadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  const displayedData = filteredData.slice(0, visibleCount);
  const hasMore = visibleCount < filteredData?.length;
  const filteredCount = filteredData?.length;

  return (
    <Container maxWidth="auto">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hotels ({filteredCount})
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        justifyContent="space-between"
        sx={{ mb: 5, gap: 2 }}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 2}}>
          <TextField
            label="Search hotel"
            variant="outlined"
            onChange={handleSearchChange}
            sx={{ width: { xs: '100%', sm: 250 } }}
          />
          <Autocomplete
            options={["All City", ...(byCity || [])]}
            value={selectedCity}
            sx={{ width: { xs: '100%', sm: 200 } }}
            onChange={handleCityChange}
            renderInput={(params) => (
              <TextField {...params} label="Filter by city" variant="outlined" />
            )}
          />
        </Stack>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button onClick={() => setIsAcceptedFilter(null)} variant={isAcceptedFilter === null ? 'contained' : 'outlined'}>All</Button>
          <Button onClick={() => setIsAcceptedFilter(true)} variant={isAcceptedFilter === true ? 'contained' : 'outlined'}>Accepted</Button>
          <Button onClick={() => setIsAcceptedFilter(false)} variant={isAcceptedFilter === false ? 'contained' : 'outlined'}>Not Accepted</Button>
        </ButtonGroup>
      </Stack>

      <Grid container spacing={3}>
        {displayedData.map((product) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={product._id}
            sx={{ display: 'flex' }}
          >
            <ProductCard
              product={product}
              onAddFood={() => handleOpenModal(product)}
              onUpdateAmenities={handleUpdateAmenities}
              onAddRoom={handleAddRoom}
              onBasicDetails={handleBasicDetails}
            />
          </Grid>
        ))}
      </Grid>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
           <LinearProgress sx={{width: '50%'}} />
        </Box>
      )}

      {selectedHotel && (
        <AddFoodModal
          open={isModalOpen}
          onClose={handleCloseModal}
          hotelId={selectedHotel.hotelId}
        />
      )}
    </Container>
  );
}
