import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingDetails.css';

const BookingDetails = ({ food, room, hotelName, hotelEmail, hotelOwnerName, destination }) => {
    const [checkInDate, setCheckInDate] = useState(new Date());
    const [checkOutDate, setCheckOutDate] = useState(new Date());
    const [numRooms, setNumRooms] = useState(1);
    const [guests, setGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showDatePickers, setShowDatePickers] = useState(false);
    const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);

    // Ensure food and room are arrays, and get the latest item
    const foodItems = Array.isArray(food) ? food[food.length - 1] : food;
    const roomItems = Array.isArray(room) ? room[room.length - 1] : room;

    // Calculate total price based on room and food
    const calculateTotalPrice = () => {
        const foodPrice = parseFloat(foodItems?.price || 0);
        const roomPrice = parseFloat(roomItems?.price || 0);
        return (foodPrice + roomPrice) * numRooms * guests; // Assuming the price is multiplied by rooms and guests
    };

    const handleBooking = () => {
        const foodDetails = {
            name: foodItems?.name,
            price: foodItems?.price,
            quantity: foodItems?.quantity,
        };

        const roomDetails = {
            type: roomItems?.type,
            bedTypes: roomItems?.bedTypes,
            price: roomItems?.price,
        };

        const bookingData = {
            checkInDate,
            checkOutDate,
            guests,
            numRooms,
            foodDetails,
            roomDetails,
            price: totalPrice,
            hotelName,
            hotelEmail,
            hotelOwnerName,
            destination,
        };

        console.log(bookingData);
    };

    const handleStartDateChange = (date) => {
        setCheckInDate(date);
        if (date > checkOutDate) setCheckOutDate(date);
    };

    const handleEndDateChange = (date) => {
        setCheckOutDate(date);
    };

    return (
        <div className="booking-details">
            <div className="login-banner">
                <span className="login-text">Booking Summary</span>
            </div>
            <div className="price-summary">
                <div className="price-header">
                    <span className="final-price">₹{roomItems?.price}</span>
                    <span className="original-price">₹4785</span>
                    <span className="discount">78% off</span>
                </div>
                <span className="tax-info">+ taxes & fees: ₹226</span>

                <div className="booking-info">
                    <div className="date-display" onClick={() => setShowDatePickers(true)}>
                        <span className="date-text">
                            {checkInDate
                                ? checkInDate.toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                  })
                                : 'Select Start Date'}
                        </span>
                        <span> - </span>
                        <span className="date-text">
                            {checkOutDate
                                ? checkOutDate.toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                  })
                                : 'Select End Date'}
                        </span>
                    </div>

                    <div className="room-guest-display" onClick={() => setShowRoomGuestPicker(!showRoomGuestPicker)}>
                        <span className="room-guest-text">{`${numRooms} Room${numRooms > 1 ? 's' : ''}, ${guests} Guest${guests > 1 ? 's' : ''}`}</span>
                    </div>
                </div>

                <div className="room-type">
                    <span>{roomItems?.type}</span>
                </div>
                {foodItems && (
                    <div className="food-type">
                        <span>{foodItems?.name}</span>
                    </div>
                )}

                <div className="offers">
                    <div className="offer">
                        <span className="offer-name">FREEDOM78 coupon applied</span>
                        <span className="offer-discount">₹2077</span>
                    </div>
                    <button className="more-offers">MORE OFFERS</button>
                </div>

                <span className="wizard-benefits">Get additional benefits up to ₹1000</span>
            </div>
            <div className="price-breakdown">
                <div className="savings">
                    <span>Your Savings</span>
                    <span className="savings-amount">₹2077</span>
                </div>
                {foodItems && (
                    <div className="addon">
                        <span>{foodItems?.foodType}</span>
                        <span className="addon-amount">₹{foodItems?.price}</span>
                    </div>
                )}

                <div className="total-price">
                    <span>Total Price</span>
                    <span className="price-amount">₹{calculateTotalPrice()}</span>
                </div>
                <span className="taxes-info">Including taxes & fees</span>
            </div>
            <button className="continue-button" onClick={handleBooking}>Continue to Book</button>

            {showDatePickers && (
                <div className="date-pickers-overlay">
                    <div className="date-pickers-container">
                        <button className="close-button" onClick={() => setShowDatePickers(false)}>
                            ✖
                        </button>

                        <div className="date-picker-wrapper">
                            <label>Check-in</label>
                            <DatePicker
                                selected={checkInDate}
                                onChange={handleStartDateChange}
                                selectsStart
                                startDate={checkInDate}
                                endDate={checkOutDate}
                                minDate={new Date()}
                                inline
                            />
                        </div>
                        <div className="date-picker-wrapper">
                            <label>Check-out</label>
                            <DatePicker
                                selected={checkOutDate}
                                onChange={handleEndDateChange}
                                selectsEnd
                                startDate={checkInDate}
                                endDate={checkOutDate}
                                minDate={checkInDate}
                                inline
                            />
                        </div>
                    </div>
                </div>
            )}

            {showRoomGuestPicker && (
                <div className="room-guest-picker">
                    <div className="picker-header">
                        <span>Rooms</span>
                        <div className="counter">
                            <button onClick={() => setNumRooms(Math.max(1, numRooms - 1))}>-</button>
                            <span>{numRooms}</span>
                            <button onClick={() => setNumRooms(numRooms + 1)}>+</button>
                        </div>
                    </div>

                    <div className="picker-header">
                        <span>Guests</span>
                        <div className="counter">
                            <button onClick={() => setGuests(Math.max(1, guests - 1))}>-</button>
                            <span>{guests}</span>
                            <button onClick={() => setGuests(guests + 1)}>+</button>
                        </div>
                    </div>

                    <div className="picker-actions">
                        <button onClick={() => setShowRoomGuestPicker(false)}>Cancel</button>
                        <button onClick={() => setShowRoomGuestPicker(false)}>Done</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetails;
