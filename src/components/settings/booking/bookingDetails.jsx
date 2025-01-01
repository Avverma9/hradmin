import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Rooms from "./rooms";
import "./BookingDetails.css";

const BookingDetails = ({ rooms }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [showRoomGuestPicker, setShowRoomGuestPicker] = useState(false);
  const [roomCount, setRoomCount] = useState(1);
  const [guestCount, setGuestCount] = useState(1);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date > endDate) setEndDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  return (
    <div className="booking-details">
      <div className="login-banner">
        <span className="login-text">Booking Summary</span>
      </div>

      <div className="price-summary">
        <div className="price-header">
          <span className="final-price">₹1047</span>
          <span className="original-price">₹4785</span>
          <span className="discount">78% off</span>
        </div>
        <span className="tax-info">+ taxes & fees: ₹226</span>

        <div className="booking-info">
          <div className="date-display" onClick={() => setShowDatePickers(true)}>
            <span className="date-text">
              {startDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span> - </span>
            <span className="date-text">
              {endDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div
            className="room-guest-display"
            onClick={() => setShowRoomGuestPicker(!showRoomGuestPicker)}
          >
            <span className="room-guest-text">{`${roomCount} Room, ${guestCount} Guest`}</span>
          </div>
        </div>

        <div className="room-type">
          <span>Classic</span>
          <button className="edit-button">✎</button>
        </div>

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

        <div className="total-price">
          <span>Total Price</span>
          <span className="price-amount">₹1273</span>
        </div>
        <span className="taxes-info">Including taxes & fees</span>
      </div>

      <button className="continue-button">Continue to Book</button>

      {showDatePickers && (
        <div className="date-pickers-overlay">
          <div className="date-pickers-container">
            <button
              className="close-button"
              onClick={() => setShowDatePickers(false)}
            >
              ✖
            </button>

            <div className="date-picker-wrapper">
              <label>Check-in</label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                inline
              />
            </div>
            <div className="date-picker-wrapper">
              <label>Check-out</label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
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
              <button onClick={() => setRoomCount(Math.max(1, roomCount - 1))}>
                -
              </button>
              <span>{roomCount}</span>
              <button onClick={() => setRoomCount(roomCount + 1)}>+</button>
            </div>
          </div>

          <div className="picker-header">
            <span>Guests</span>
            <div className="counter">
              <button
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              >
                -
              </button>
              <span>{guestCount}</span>
              <button onClick={() => setGuestCount(guestCount + 1)}>+</button>
            </div>
          </div>

          <div className="picker-actions">
            <button onClick={() => setShowRoomGuestPicker(false)}>Cancel</button>
            <button onClick={() => setShowRoomGuestPicker(false)}>Done</button>
          </div>
        </div>
      )}

      <Rooms rooms={rooms} />
    </div>
  );
};

export default BookingDetails;
