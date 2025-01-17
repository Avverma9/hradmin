import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingDetails.css';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { createBooking } from 'src/components/redux/reducers/booking';

const BookingDetails = ({ food, room, hotel, email, owner, address }) => {
    const [showDatePickers, setShowDatePickers] = useState(false);
    const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [inDate, setInDate] = useState(null);
    const [outDate, setOutDate] = useState(null);
    const dispatch = useDispatch();

    const [numRooms, setNumRooms] = useState(1);
    const [guests, setGuests] = useState(1);

    const foodItems = Array.isArray(food) ? food[food.length - 1] : food;
    const roomItems = Array.isArray(room) ? room[room.length - 1] : room;

    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        setInDate(today); // Store as a full date object
        setOutDate(tomorrow); // Store as a full date object
    }, []);

    const handleStartDateChange = (date) => {
        // prevent user cant select past dates
        setInDate(date);
        if (date > outDate) setInDate(date);
    };

    const handleEndDateChange = (date) => {
        setOutDate(date);
    };

    const foodPrice = parseFloat(foodItems?.price || 0);
    const roomPrice = parseFloat(roomItems?.price || 0);
    const totalPricePerDay = (foodPrice + roomPrice) * numRooms;

    const calculateTotalPrice = () => {
        if (!inDate || !outDate) return 0;
        const timeDifference = outDate.getTime() - inDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        return totalPricePerDay * daysDifference;
    };

    const updateRoomCount = (newGuests) => {
        let newNumRooms = numRooms;
        if (newGuests <= 3) {
            newNumRooms = 1;
        } else if (newGuests <= 6) {
            newNumRooms = 2;
        } else {
            newNumRooms = Math.ceil(newGuests / 3);
        }
        setNumRooms(newNumRooms);
        setGuests(newGuests);
    };

    const userId = sessionStorage.getItem('subid');
    const hotelId = localStorage.getItem('subhotelId');
    const handleBooking = () => {
        if (!inDate || !outDate || guests <= 0) {
            toast.error('Please fill in all required fields.');
            return;
        }

        // Format the dates as 'YYYY-MM-DD' for saving
        const formattedInDate = inDate.toISOString().split('T')[0];
        const formattedOutDate = outDate.toISOString().split('T')[0];

        const bookingData = {
            checkInDate: formattedInDate,
            checkOutDate: formattedOutDate,
            guests: guests,
            numRooms: numRooms,
            foodDetails: food,
            roomDetails: room,
            price: calculateTotalPrice(),
            hotelName: hotel,
            hotelEmail: email,
            hotelOwnerName: owner,
            destination: address,
        };

        const userData = { userId, hotelId };
        dispatch(createBooking({ userData, bookingData })).unwrap();
    };
    const roomSectionRef = useRef(null);
    const foodSectionRef = useRef(null);
    const handleRoomNavigate = () => {
        if (roomSectionRef.current) {
            window.scrollTo({
                top: roomSectionRef.current.offsetTop - -600,
                behavior: 'smooth',
            });
        }
    };

    const handleFoodNavigate = () => {
        if (foodSectionRef.current) {
            window.scrollTo({
                top: foodSectionRef.current.offsetTop,
                behavior: 'smooth',
            });
        }
    };

    const handleApplyCoupon = () => {
        console.log('Coupon Code:', couponCode);
        setShowCouponInput(false); // Hide the input after applying coupon
    };

    return (
        <div className="booking-details">
            <div className="login-banner">
                <span className="login-text">Booking Summary</span>
            </div>
            <div className="price-summary">
                <div className="price-header">
                    <span className="final-price">₹{roomItems?.price * numRooms}</span>
                    <span className="original-price">₹4785</span>
                    <span className="discount">78% off</span>
                </div>
                <span className="tax-info">+ taxes & fees: ₹226</span>

                <div className="booking-info">
                    <div className="date-display" onClick={() => setShowDatePickers(true)}>
                        <span className="date-text">
                            {inDate
                                ? inDate.toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                  })
                                : 'Select Start Date'}
                        </span>
                        <span> - </span>
                        <span className="date-text">
                            {outDate
                                ? outDate.toLocaleDateString('en-IN', {
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
                    <div className="offer" onClick={() => setShowCouponInput(!showCouponInput)}>
                        <span className="offer-name">{!showCouponInput ? 'I have a coupon' : 'Dont have any coupon ?'}</span>
                    </div>

                    {showCouponInput && (
                        <div className="coupon-input">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter Coupon Code"
                                className="coupon-input-field"
                            />
                            <button onClick={handleApplyCoupon} className="apply-button">
                                <span>&#10003;</span>
                            </button>
                        </div>
                    )}
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
                                selected={inDate}
                                onChange={handleStartDateChange}
                                selectsStart
                                startDate={inDate}
                                endDate={outDate}
                                minDate={new Date()}
                                inline
                            />
                        </div>
                        <div className="date-picker-wrapper">
                            <label>Check-out</label>
                            <DatePicker
                                selected={outDate}
                                onChange={handleEndDateChange}
                                selectsEnd
                                startDate={inDate}
                                endDate={outDate}
                                minDate={inDate}
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
            <div ref={roomSectionRef} style={{ height: '1px' }} />
        </div>
    );
};

export default BookingDetails;
