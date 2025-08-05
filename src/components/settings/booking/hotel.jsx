import React, { useEffect, useState } from 'react';
import './hotel.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHotels } from 'src/components/redux/reducers/hotel';
import { TextField, InputAdornment, IconButton, Autocomplete, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Hotel = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.hotel.data);
    const [searchTerm, setSearchTerm] = useState('');
    const [city, setCity] = useState('');
    const [cityOptions, setCityOptions] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);

    useEffect(() => {
        dispatch(getAllHotels());
    }, [dispatch]);

    useEffect(() => {
        // Extract unique city names from hotel data
        const cities = [...new Set(data?.map((hotel) => hotel.city))];
        setCityOptions(cities);
    }, [data]);

    useEffect(() => {
        // Whenever data or search term or city changes, filter the hotels
        const filterHotels = () => {
            let filtered = data;

            if (searchTerm) {
                filtered = filtered.filter((hotel) =>
                    hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    hotel.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    hotel.landmark.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (city) {
                filtered = filtered.filter((hotel) => hotel.city.toLowerCase() === city.toLowerCase());
            }

            setFilteredHotels(filtered);
        };

        filterHotels();
    }, [searchTerm, city, data]);

    const handleSearch = () => {
        setSearchTerm(searchTerm); 
    };

    const limitAmenity = (amenity) => {
        return amenity && Array.isArray(amenity) ? amenity.slice(0, 4).join(', ') : 'No amenities available';
    };

    const handleBookNow = (hotelId) => {
        localStorage.setItem('subhotelId', hotelId);
        window.location.href = `/book-now-page/${hotelId}`;
    };

    return (
        <>
            <div className="search-bar">
                <TextField
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search hotels"
                    variant="outlined"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleSearch}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    style={{ marginRight: '10px' }}
                />
                <Autocomplete
                    value={city}
                    onChange={(event, newValue) => setCity(newValue)}
                    options={cityOptions}
                    renderInput={(params) => <TextField {...params} label="City" variant="outlined" placeholder="Enter city" />}
                    style={{ width: 300 }}
                />
            </div>

            <div>
                <div className="hotel-list">
                    {filteredHotels?.map((hotel) => (
                        <div key={hotel?._id} className="hotel-card">
                            <div className="hotel-image">
                                <img src={hotel?.images[0]} alt={`${hotel?.hotelName} Image`} />
                            </div>
                            <div className="hotel-details">
                                <h3>{hotel?.hotelName}</h3>
                                <p>
                                    {hotel?.city}, {hotel?.state} • {hotel?.landmark}
                                </p>
                                <div className="hotel-ratings">
                                    <span>{hotel?.starRating} Stars</span>
                                    <span>({hotel?.reviewCount} Ratings) • Good</span>
                                </div>

                                <div className="hotel-features">
                                    <Typography>Amenities</Typography>
                                    <span>{limitAmenity(hotel?.amenities[0]?.amenities)}</span>
                                </div>

                                <div className="hotel-pricing">
                                    <span className="price">₹{hotel?.rooms[0]?.price}</span>
                                </div>

                                <div className="hotel-actions">
                                    <button className="details-btn" onClick={() => handleBookNow(hotel?.hotelId)}>
                                        View Details
                                    </button>
                                    <button className="book-btn" onClick={() => handleBookNow(hotel?.hotelId)}>
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Hotel;
