import React, { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingDetails.css';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { createBooking } from 'src/components/redux/reducers/booking';

const BookingDetails = ({ food, room, hotelName, hotelEmail, hotelOwnerName, destination }) => {
    const [showDatePickers, setShowDatePickers] = useState(false);
    const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const dispatch = useDispatch();

    const [numRooms, setNumRooms] = useState(1);
    const [guests, setGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const roomSectionRef = useRef(null);
    const foodSectionRef = useRef(null);

    // Ensure food and room are arrays, and get the latest item
    const foodItems = Array.isArray(food) ? food[food.length - 1] : food;
    const roomItems = Array.isArray(room) ? room[room.length - 1] : room;

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date > checkOutDate) setEndDate(date);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
    };

    const calculateTotalPrice = () => {
        const foodPrice = parseFloat(foodItems?.price || 0);
        const roomPrice = parseFloat(roomItems?.price || 0);
        return (foodPrice + roomPrice) * numRooms; // Multiply room price by the number of rooms
    };

    // Function to update room and guest count
    const updateRoomCount = (newGuests) => {
        let newNumRooms = numRooms;
        if (newGuests <= 3) {
            newNumRooms = 1; // If guests are <= 3, set to 1 room
        } else if (newGuests <= 6) {
            newNumRooms = 2; // If guests are <= 6, set to 2 rooms
        } else {
            newNumRooms = Math.ceil(newGuests / 3); // More than 6 guests, add more rooms
        }
        setNumRooms(newNumRooms);
        setGuests(newGuests);
    };

    const userId = localStorage.getItem('subid');
    const hotelId = localStorage.getItem('subhotelId');
    const handleBooking = () => {
        // Validation checks for required fields
        if (!checkInDate || !checkOutDate || guests <= 0) {
            toast.error('Please fill in all required fields.');
            return;
        }

        // Destructuring for clarity
        const { name, price, quantity } = food;
        const { type, bedTypes, price: roomPrice } = room;

        // Food and room details
        const foodDetails = { name, price, quantity };
        const roomDetails = { type, bedTypes, price: roomPrice };

        // Booking data object
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

        // Show loading toast
        const toastId = toast.loading('Creating Booking...');

        // Dispatch booking action and handle success or failure
        dispatch(createBooking({ userId, hotelId, bookingData }))
            .unwrap()
            .then(() => {
                // Success handling
                toast.update(toastId, {
                    render: 'Booking Created',
                    type: 'success',
                    isLoading: false,
                });
            })
            .catch((error) => {
                // Error handling
                toast.update(toastId, {
                    render: `Booking failed: ${error.message}`,
                    type: 'error',
                    isLoading: false,
                });
            });
    };

    // Handle room navigation
    const handleRoomNavigate = () => {
        if (roomSectionRef.current) {
            window.scrollTo({
                top: roomSectionRef.current.offsetTop - 600,
                behavior: 'smooth',
            });
        }
    };

    // Handle food navigation
    const handleFoodNavigate = () => {
        if (foodSectionRef.current) {
            window.scrollTo({
                top: foodSectionRef.current.offsetTop,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="booking-details">
            <div className="login-banner">
                <span className="login-text">Booking Summary</span>
            </div>
            <div className="price-summary">
                <div className="price-header">
                    <span className="final-price">₹{roomItems?.price * numRooms}</span> {/* Display price based on rooms */}
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
                    <button className="edit-button" onClick={handleRoomNavigate}>
                        ✎
                    </button>
                </div>
                {foodItems && (
                    <div className="food-type">
                        <span>{foodItems?.name}</span>
                        <button className="edit-button" onClick={handleFoodNavigate}>
                            ✎
                        </button>
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
                    <span className="price-amount">₹{calculateTotalPrice()}</span> {/* Calculate total price */}
                </div>
                <span className="taxes-info">Including taxes & fees</span>
            </div>
            <button className="continue-button" onClick={handleBooking}>
                Continue to Book
            </button>
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
                                checkInDate={checkInDate}
                                checkOutDate={checkOutDate}
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
                                checkInDate={checkInDate}
                                checkOutDate={checkOutDate}
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
                            <button onClick={() => updateRoomCount(Math.max(1, guests - 1))}>-</button>
                            <span>{guests}</span>
                            <button onClick={() => updateRoomCount(guests + 1)}>+</button>
                        </div>
                    </div>

                    <div className="picker-actions">
                        <button onClick={() => setShowRoomGuestPicker(false)}>Cancel</button>
                        <button onClick={() => setShowRoomGuestPicker(false)}>Done</button>
                    </div>
                </div>
            )}
            <div ref={foodSectionRef} style={{ height: '1px' }} />
            <div ref={roomSectionRef} style={{ height: '1px' }} /> {/* The div will serve as a target for scrolling */}
        </div>
    );
};

export default BookingDetails;
