import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import axios from 'axios';

// MUI Components
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  InputAdornment,
  Skeleton,
  Stack,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// MUI Icons
import {
  Search,
  Clear,
  LocalGasStation,
  EventSeat,
  Work,
  Speed,
  Person,
  LocationOn,
  Map,
  CalendarToday,
} from '@mui/icons-material';

// Local Imports
import { filterCar, getAllCars } from '../redux/reducers/travel/car';
import { localUrl } from '../../../utils/util';
import { useLoader } from '../../../utils/loader';
import SeatData from './seat-data';

// CarCard Component for individual car display
const CarCard = ({ car, onBookNow }) => {
  const handleCarImage = (carData) =>
    carData?.images && Array.isArray(carData.images) && carData.images.length > 0
      ? carData.images[0]
      : "https://placehold.co/600x400/e0e0e0/757575?text=Car";
      
  const availableSeats = car.seatConfig?.filter(seat => !seat.bookedBy).length || 0;

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 2, borderRadius: 3, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 3 } }}>
      <CardMedia
        component="img"
        sx={{ width: { xs: '100%', sm: 220 }, height: { xs: 180, sm: 'auto' }, objectFit: 'cover' }}
        image={handleCarImage(car)}
        alt={`${car.make} ${car.model}`}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography component="div" variant="h6" fontWeight="bold">
                {car.make} {car.model}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {car.color} • {car.runningStatus}
              </Typography>
            </Box>
            {car.recommended && <Chip label="Recommended" color="success" size="small" variant="filled" />}
          </Box>
          <Grid container spacing={1.5} mt={0.5}>
            <Grid item xs={6} sm={6} display="flex" alignItems="center" gap={1}><LocalGasStation fontSize="small" color="action"/> <Typography variant="body2">{car.fuelType}</Typography></Grid>
            <Grid item xs={6} sm={6} display="flex" alignItems="center" gap={1}><EventSeat fontSize="small" color="action"/> <Typography variant="body2">{car.seater} Seater</Typography></Grid>
            <Grid item xs={6} sm={6} display="flex" alignItems="center" gap={1}><Work fontSize="small" color="action"/> <Typography variant="body2">{car.luggage} Luggage</Typography></Grid>
            <Grid item xs={6} sm={6} display="flex" alignItems="center" gap={1}><Speed fontSize="small" color="action"/> <Typography variant="body2">₹{car.extraKm}/km Extra</Typography></Grid>
            <Grid item xs={6} sm={6} display="flex" alignItems="center" gap={1}><LocationOn fontSize="small" color="action"/> <Typography variant="body2">From: {car.pickupP}</Typography></Grid>
            <Grid item xs={6} sm={6} display="flex" alignItems="center" gap={1}><Map fontSize="small" color="action"/> <Typography variant="body2">To: {car.dropP}</Typography></Grid>
            <Grid item xs={12} display="flex" alignItems="center" gap={1}><CalendarToday fontSize="small" color="action"/> <Typography variant="body2">{format(new Date(car.pickupD), 'p, dd MMM')} to {format(new Date(car.dropD), 'p, dd MMM')}</Typography></Grid>
          </Grid>
          <Box mt={1.5}>
              {car.badges?.map((badge, index) => <Chip key={index} label={badge} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50' }}>
           <Box>
                <Typography variant="h6" fontWeight="bold">₹{car.price}</Typography>
                <Typography variant="caption" color="text.secondary">Full ride</Typography>
           </Box>
           <Box textAlign="right">
              <Button variant="contained" size="medium" onClick={onBookNow}>
                Book Now
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                {availableSeats} seats available
              </Typography>
           </Box>
        </CardActions>
      </Box>
    </Card>
  );
};

CarCard.propTypes = {
  car: PropTypes.object.isRequired,
  onBookNow: PropTypes.func.isRequired,
};

// Skeleton Loader for CarCard
const CarCardSkeleton = () => (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 2, borderRadius: 3 }}>
        <Skeleton variant="rectangular" sx={{ width: { xs: '100%', sm: 220 }, height: { xs: 180, sm: 250 } }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
            <Grid container spacing={2} mt={1}>
                <Grid item xs={6}><Skeleton variant="text" width="80%" /></Grid>
                <Grid item xs={6}><Skeleton variant="text" width="80%" /></Grid>
                <Grid item xs={6}><Skeleton variant="text" width="80%" /></Grid>
                <Grid item xs={6}><Skeleton variant="text" width="80%" /></Grid>
                <Grid item xs={12}><Skeleton variant="text" width="90%" /></Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                <Skeleton variant="text" width={80} height={40} />
                <Skeleton variant="rectangular" width={100} height={40} />
            </Box>
        </Box>
    </Card>
);

const Cars = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [openSeatData, setOpenSeatData] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const { showLoader, hideLoader, isLoading } = useLoader();
  const filterList = useSelector((state) => state.car.data);
  const [pickupP, setPickupP] = useState('');
  const [dropP, setDropP] = useState('');
  const [filters, setFilters] = useState({ make: [], fuelType: [] });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const response = await dispatch(getAllCars());
        setData(response.payload);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        hideLoader();
      }
    };
    fetchData();
  }, [dispatch]);

  const handleFilterChange = async (key, value) => {
    const newFilters = { ...filters };
    const currentFilterValues = newFilters[key];

    if (currentFilterValues.includes(value)) {
      newFilters[key] = currentFilterValues.filter((item) => item !== value);
    } else {
      newFilters[key] = [...currentFilterValues, value];
    }
    setFilters(newFilters);
    showLoader();
    try {
        const response = await dispatch(filterCar({ query: key, value }));
        setData(response.payload);
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      hideLoader();
    }
  };

  const handleSeatDataOpen = (car) => {
    setSelectedCar(car);
    setOpenSeatData(true);
  };

  const handleSeatDataClose = () => {
    setOpenSeatData(false);
  };

  const handleSearch = async () => {
    if ((!pickupP || !dropP) && (!fromDate || !toDate)) return;
    const formattedFromDate = fromDate ? format(fromDate, 'yyyy-MM-dd') : '';
    const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') : '';
    const queryParams = [
      pickupP && `pickupP=${pickupP}`,
      dropP && `dropP=${dropP}`,
      formattedFromDate && `pickupD=${formattedFromDate}`,
      formattedToDate && `dropD=${formattedToDate}`,
    ].filter(Boolean).join('&');
    
    showLoader();
    try {
      const response = await axios.get(`${localUrl}/travel/filter-car/by-query?${queryParams}`);
      setData(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      hideLoader();
    }
  };

  const handleClear = () => window.location.reload();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth label="Pickup" value={pickupP} onChange={(e) => setPickupP(e.target.value)} InputProps={{startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>}}/></Grid>
                <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth label="Drop" value={dropP} onChange={(e) => setDropP(e.target.value)} InputProps={{startAdornment: <InputAdornment position="start"><Map /></InputAdornment>}}/></Grid>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid item xs={12} sm={6} md={2}><DatePicker label="From" value={fromDate} onChange={setFromDate} renderInput={(params) => <TextField {...params} fullWidth />} /></Grid>
                    <Grid item xs={12} sm={6} md={2}><DatePicker label="To" value={toDate} onChange={setToDate} renderInput={(params) => <TextField {...params} fullWidth />} /></Grid>
                </LocalizationProvider>
                <Grid item xs={12} md={3} display="flex" gap={1}>
                    <Button fullWidth variant="contained" onClick={handleSearch} startIcon={<Search />} sx={{ height: 56 }}>Search</Button>
                    <Button fullWidth variant="outlined" onClick={handleClear} startIcon={<Clear />} sx={{ height: 56 }}>Clear</Button>
                </Grid>
            </Grid>
        </Paper>

        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, position: 'sticky', top: 20 }}>
                    <Typography variant="h6" gutterBottom>Filters</Typography>
                    <Divider sx={{ mb: 2 }}/>
                    <Box mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">Car Type</Typography>
                        <FormGroup>
                            {Array.from(new Set(filterList?.map((car) => car.make))).map((make) => (
                                <FormControlLabel key={make} control={<Checkbox checked={filters.make.includes(make)} onChange={() => handleFilterChange('make', make)} />} label={make} />
                            ))}
                        </FormGroup>
                    </Box>
                    <Divider sx={{ my: 2 }}/>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Fuel Type</Typography>
                        <FormGroup>
                            {Array.from(new Set(filterList?.map((car) => car.fuelType))).map((fuelType) => (
                                <FormControlLabel key={fuelType} control={<Checkbox checked={filters.fuelType.includes(fuelType)} onChange={() => handleFilterChange('fuelType', fuelType)} />} label={fuelType} />
                            ))}
                        </FormGroup>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={9}>
                {isLoading ? (
                    <Stack spacing={2}>
                        <CarCardSkeleton />
                        <CarCardSkeleton />
                        <CarCardSkeleton />
                    </Stack>
                ) : data?.length > 0 ? (
                    data.map((car) => (
                        <CarCard key={car._id} car={car} onBookNow={() => handleSeatDataOpen(car)} />
                    ))
                ) : (
                    <Box textAlign="center" p={5}>
                        <Typography variant="h6">No Cars Found</Typography>
                        <Typography color="text.secondary">Try adjusting your search or filters.</Typography>
                    </Box>
                )}
            </Grid>
        </Grid>
        
        {selectedCar && <SeatData open={openSeatData} onClose={handleSeatDataClose} id={selectedCar._id} carData={selectedCar} />}
    </Container>
  );
};

export default Cars;
