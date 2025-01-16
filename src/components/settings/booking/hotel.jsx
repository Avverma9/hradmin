import React, { useEffect } from 'react';
import './hotel.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHotels } from 'src/components/redux/reducers/hotel';
import { Typography } from '@mui/material';

const Hotel = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.hotel.data);

    useEffect(() => {
        dispatch(getAllHotels());
    }, [dispatch]);

    const limitAmenity = (amenity) => {
        // Ensuring amenities is an array and has elements to display
        return amenity && Array.isArray(amenity) ? amenity.slice(0, 4).join(', ') : 'No amenities available';
    };

    const handleBookNow = (hotelId) => {
        localStorage.setItem('subhotelId', hotelId);
        window.location.href = `/book-now-page/${hotelId}`;
    };

    return (
        <div className="hotel-list">
            {data?.map((hotel) => (
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
                            <span className="original-price">₹{hotel?.rooms[0]?.price - hotel?.rooms[0]?.offerPriceLess}</span>
                            <p>+ ₹{hotel?.taxesAndFees || 182} taxes & fees per room per night</p>
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
    );
};

export default Hotel;
