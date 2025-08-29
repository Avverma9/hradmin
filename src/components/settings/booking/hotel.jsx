import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
    Container,
    TextField,
    InputAdornment,
    IconButton,
    Autocomplete,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Box,
    CircularProgress,
    Stack,
    Paper,
    Rating,
    Fab, // নতুন ইম্পোর্ট
    Zoom, // নতুন ইম্পোর্ট
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'; // নতুন আইকন

import { getAllHotels } from 'src/components/redux/reducers/hotel';

// HotelCard component (কোনো পরিবর্তন নেই)
const HotelCard = ({ hotel, handleBookNow }) => {
    const getSafePrice = () => {
        if (hotel?.rooms && hotel.rooms.length > 0 && hotel.rooms[0]?.price) {
            return `₹${hotel.rooms[0].price.toLocaleString('en-IN')}`;
        }
        return 'Price not available';
    };

    const getSafeAmenities = () => {
        if (hotel?.amenities && hotel.amenities.length > 0 && Array.isArray(hotel.amenities[0]?.amenities)) {
            return hotel.amenities[0].amenities.slice(0, 4).join(' • ');
        }
        return 'No amenities listed';
    };

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={hotel?.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image'}
                    alt={hotel?.hotelName}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                        {hotel?.hotelName || 'Untitled Hotel'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 1 }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="body2">
                            {hotel?.city}, {hotel?.state}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Rating name="read-only" value={hotel?.starRating || 0} readOnly precision={0.5} />
                        <Typography variant="body2" color="text.secondary">
                            ({hotel?.reviewCount || 0} reviews)
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                        {getSafeAmenities()}
                    </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {getSafePrice()}
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleBookNow(hotel?.hotelId)}
                        >
                            Book Now
                        </Button>
                    </Stack>
                </Box>
            </Card>
        </Grid>
    );
};

// Scroll to top component
const ScrollTop = ({ children }) => {
    const [show, setShow] = useState(false);

    const checkScrollTop = () => {
        if (!show && window.pageYOffset > 400) {
            setShow(true);
        } else if (show && window.pageYOffset <= 400) {
            setShow(false);
        }
    };

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [show]);


    return (
        <Zoom in={show}>
            <Box onClick={handleClick} role="presentation" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10 }}>
                {children}
            </Box>
        </Zoom>
    );
}


const Hotel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data, loading } = useSelector((state) => ({
      data: state.hotel.data,
      loading: state.hotel.loading
    }));

    const [searchTerm, setSearchTerm] = useState('');
    const [city, setCity] = useState(null);
    const [cityOptions, setCityOptions] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [displayedHotels, setDisplayedHotels] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 9;

    useEffect(() => {
        dispatch(getAllHotels());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            const cities = [...new Set(data.map((hotel) => hotel.city).filter(Boolean))];
            setCityOptions(cities);
        }
    }, [data]);

    useEffect(() => {
        if (!data) return;

        let filtered = data.filter(hotel => {
            const searchTermMatch = searchTerm
                ? (hotel.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   hotel.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   hotel.landmark?.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            const cityMatch = city ? hotel.city === city : true;
            
            return searchTermMatch && cityMatch;
        });
        setFilteredHotels(filtered);
    }, [searchTerm, city, data]);

    useEffect(() => {
        const initialSlice = filteredHotels.slice(0, PAGE_SIZE);
        setDisplayedHotels(initialSlice);
        setHasMore(filteredHotels.length > PAGE_SIZE);
    }, [filteredHotels]);

    const loadMoreHotels = () => {
        if (displayedHotels.length >= filteredHotels.length) {
            setHasMore(false);
            return;
        }
        
        const nextSlice = filteredHotels.slice(displayedHotels.length, displayedHotels.length + PAGE_SIZE);
        setDisplayedHotels(prev => [...prev, ...nextSlice]);
    };

    const handleBookNow = (hotelId) => {
        if (!hotelId) return;
        sessionStorage.setItem('subhotelId', hotelId);
        navigate(`/book-now-page/${hotelId}`);
    };

    return (
        <>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Typography variant="h4" gutterBottom>
                        Find Your Perfect Stay
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by hotel name, city, state..."
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Autocomplete
                            value={city}
                            onChange={(event, newValue) => setCity(newValue)}
                            options={cityOptions}
                            sx={{ width: { xs: '100%', md: 300 } }}
                            renderInput={(params) => <TextField {...params} label="City" variant="outlined" />}
                        />
                    </Stack>
                </Paper>

                {loading && displayedHotels.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : (
                    <InfiniteScroll
                        dataLength={displayedHotels.length}
                        next={loadMoreHotels}
                        hasMore={hasMore}
                        loader={
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        }
                        endMessage={
                            <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                <b>You've seen it all!</b>
                            </Typography>
                        }
                        style={{ overflow: 'visible' }}
                    >
                        <Grid container spacing={3}>
                            {displayedHotels.map((hotel) => (
                                <HotelCard key={hotel?._id} hotel={hotel} handleBookNow={handleBookNow} />
                            ))}
                        </Grid>
                    </InfiniteScroll>
                )}

                {!loading && filteredHotels.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h6">No hotels found</Typography>
                        <Typography color="text.secondary">Try adjusting your search or filters.</Typography>
                    </Box>
                )}

            </Container>
            
            {/* Scroll to Top বাটনটি এখানে যোগ করা হয়েছে */}
            <ScrollTop>
                <Fab color="primary" size="large" aria-label="scroll back to top">
                    <KeyboardArrowUpIcon />
                </Fab>
            </ScrollTop>
        </>
    );
};

export default Hotel;