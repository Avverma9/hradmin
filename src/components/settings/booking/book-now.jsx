import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { getHotelById } from 'src/components/redux/reducers/hotel';
import BookingDetails from './bookingDetails';
import Food from './foods';
import Rooms from './rooms';
import './BookNow.css';
import { Typography } from '@mui/material';
import { useLoader } from '../../../../utils/loader';
import { toast } from 'react-toastify';

const BookNow = () => {
    const { hotelId } = useParams();
    const hotelById = useSelector((state) => state.hotel.byId);
    const dispatch = useDispatch();
    const { showLoader, hideLoader } = useLoader();
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]);

    useEffect(() => {
        if (hotelId) {
            dispatch(getHotelById(hotelId));
        }
    }, [dispatch, hotelId]);

    useEffect(() => {
        if (selectedRooms.length === 0 && hotelById?.rooms?.length > 0) {
            const randomRoom = hotelById.rooms[Math.floor(Math.random() * hotelById.rooms.length)];
            setSelectedRooms([randomRoom]);
        }
    }, [hotelById, selectedRooms]);

    const handleFoodSelect = (food) => {
        if (selectedFoods.some((r) => r.foodId === food.foodId)) {
            setSelectedFoods(selectedFoods.filter((r) => r.foodId !== food.foodId));
            toast.success(`${food.name} Removed`);
        } else {
            setSelectedFoods([...selectedFoods, food]);
            toast.success(`${food.name} Selected`);
        }
    };

    const handleRoomSelect = (room) => {
        if (selectedRooms.some((r) => r.roomId === room.roomId)) {
            setSelectedRooms([]);
        } else {
            setSelectedRooms([room]);
        }
        toast.success(`${room.type} Selected`);
    };

    if (!hotelById) {
        showLoader();
    } else {
        hideLoader();
    }

    return (
        <div className="book-now-container">
            <div className="hotel-details-section">
                <div className="hotel-info">
                    <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-inner">
                            <Carousel controls={false} indicators={false}>
                                {hotelById?.images?.map((image, index) => (
                                    <Carousel.Item key={index} interval={1000}>
                                        <img
                                            src={image}
                                            alt={`Hotel Image ${index + 1}`}
                                            className="d-block w-100 h-300 object-fit-cover"
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </div>
                    </div>

                    <div className="hotel-info">
                        <h2 className="hotel-name">{hotelById?.hotelName}</h2>
                        <p className="hotel-address">
                            {hotelById?.landmark}, {hotelById?.city}, {hotelById?.state}
                        </p>
                        <div className="rating-section">
                            <span className="rating">{hotelById?.starRating || 'N/A'}</span>
                            <span className="ratings-count">{hotelById?.reviewCount} Reviews</span>
                        </div>
                        <hr />
                        <p className="hotel-description">{hotelById?.description}</p>
                    </div>
                    <div className="hotel-amenities">
                        {hotelById?.amenities?.map((item) => {
                            return (
                                <div key={item.hotelId} className="amenity-item">
                                    {item.amenities.map((amenity, index) => (
                                        <span key={index} className="amenity-button">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="booking-summary-right">
                    <BookingDetails
                        room={selectedRooms}
                        hotel={hotelById?.hotelName}
                        email={hotelById?.hotelEmail}
                        owner={hotelById?.hotelOwnerName}
                        address={hotelById?.destination}
                        city={hotelById?.city}
                        food={selectedFoods}
                    />
                </div>
            </div>
            <div className="food-cards">
                <Typography
                    style={{
                        background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#fff',
                        textAlign: 'center',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                        letterSpacing: '1px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    Select Foods
                </Typography>

                <br />
                <Food foodData={hotelById?.foods} onFoodSelect={handleFoodSelect} selectedFoods={selectedFoods} />
            </div>
            <div className="room-cards">
                <Typography
                    style={{
                        background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#fff',
                        textAlign: 'center',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                        letterSpacing: '1px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    Select Rooms
                </Typography>
                <br />
                <Rooms rooms={hotelById?.rooms} onRoomSelect={handleRoomSelect} selectedRooms={selectedRooms} />
            </div>
        </div>
    );
};

export default BookNow;
