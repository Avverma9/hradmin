import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { getHotelById } from "src/components/redux/reducers/hotel";
import BookingDetails from "./bookingDetails";
import Food from "./foods";
import Rooms from "./rooms"; // Import Rooms component
import "./BookNow.css"; // Import the CSS file for styling
import { Typography } from "@mui/material";

const BookNow = () => {
  const { hotelId } = useParams();
  const hotelById = useSelector((state) => state.hotel.byId);
  const dispatch = useDispatch();

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numRooms, setNumRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (hotelId) {
      dispatch(getHotelById(hotelId));
    }
  }, [dispatch, hotelId]);

  useEffect(() => {
    if (hotelById && hotelById.rooms && hotelById.rooms.length > 0) {
      const roomPrice = hotelById.rooms[0]?.price || 0;
      let updatedPrice = roomPrice * numRooms;

      // Add price for selected foods
      selectedFoods.forEach((food) => {
        updatedPrice += food.price * food.quantity;
      });

      setTotalPrice(updatedPrice);
    }
  }, [hotelById, numRooms, selectedFoods]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "checkin") setCheckInDate(value);
    if (name === "checkout") setCheckOutDate(value);
  };

  const handleRoomChange = (e) => {
    setNumRooms(Number(e.target.value));
  };

  const handleGuestChange = (e) => {
    setGuests(Number(e.target.value));
  };

  const handleRoomSelect = (room) => {
    if (!selectedRooms.includes(room)) {
      setSelectedRooms([...selectedRooms, room]);
    } else {
      setSelectedRooms(selectedRooms.filter((r) => r !== room));
    }
  };

  const handleFoodSelect = (food) => {
    if (!selectedFoods.some((item) => item.name === food.name)) {
      setSelectedFoods([...selectedFoods, { ...food, quantity: 1 }]);
    } else {
      setSelectedFoods(
        selectedFoods.map((item) =>
          item.name === food.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    }
  };

  const handleFoodQuantityChange = (food, quantity) => {
    const updatedFoods = selectedFoods.map((item) =>
      item.name === food.name
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    );
    setSelectedFoods(updatedFoods);
  };

  const handleBooking = () => {
    const foodDetails = selectedFoods.map((food) => ({
      name: food.name,
      price: food.price,
      quantity: food.quantity,
    }));

    const roomDetails = selectedRooms.map((room) => ({
      type: room.type,
      bedTypes: room.bedTypes,
      price: room.price,
    }));

    const bookingData = {
      checkInDate,
      checkOutDate,
      guests,
      numRooms,
      foodDetails,
      roomDetails,
      price: totalPrice,
      hotelName: hotelById?.hotelName,
      hotelEmail: hotelById?.email,
      hotelOwnerName: hotelById?.ownerName,
      destination: hotelById?.city,
    };

    console.log(bookingData);
  };

  if (!hotelById) {
    return <div>Loading...</div>;
  }

  return (
    <div className="book-now-container">
      <div className="hotel-details-section">
        <div className="hotel-info">
          <div
            id="carouselExampleAutoplaying"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-inner">
              <Carousel controls={false} indicators={false}>
                {hotelById?.images?.map((image, index) => (
                  <Carousel.Item key={index} interval={1000}>
                    <img
                      src={image}
                      alt={`Hotel Image ${index + 1}`}
                      className="d-block w-100 h-300 object-fit-cover"
                      style={{ cursor: "pointer" }}
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
              <span className="rating">{hotelById?.starRating || "N/A"}</span>
              <span className="ratings-count">
                {hotelById?.reviewCount} Reviews
              </span>
            </div>
            <hr />
            <p className="hotel-description">{hotelById?.description}</p>
          </div>
        </div>

        <div className="booking-summary-right">
          <BookingDetails
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guests={guests}
            numRooms={numRooms}
            selectedRooms={selectedRooms}
            selectedFoods={selectedFoods}
            totalPrice={totalPrice}
            onBooking={handleBooking}
          />
        </div>
      </div>
      <div className="food-cards">
        <Typography
          style={{
            background: "linear-gradient(45deg, #6a11cb, #2575fc)", // Gradient background
            padding: "10px 20px", // Increased padding for a smoother feel
            borderRadius: "12px", // Softer rounded corners
            fontSize: "14px", // Larger font size
            color: "#fff", // White text for contrast
            textAlign: "center", // Centered text
            fontFamily: "Helvetica, Arial, sans-serif", // Clean and modern font
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)", // More prominent shadow
            letterSpacing: "1px", // Slight letter spacing for a cleaner look
            fontWeight: "bold", // Bolder text for emphasis
            transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
          }}
        >
          Select Foods
        </Typography>

        <br />
        <Food foodData={hotelById?.foods} onFoodSelect={handleFoodSelect} />
      </div>
      <div className="room-cards">
        <Typography
          style={{
            background: "linear-gradient(45deg, #6a11cb, #2575fc)", // Gradient background
            padding: "10px 20px", // Increased padding for a smoother feel
            borderRadius: "12px", // Softer rounded corners
            fontSize: "14px", // Larger font size
            color: "#fff", // White text for contrast
            textAlign: "center", // Centered text
            fontFamily: "Helvetica, Arial, sans-serif", // Clean and modern font
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)", // More prominent shadow
            letterSpacing: "1px", // Slight letter spacing for a cleaner look
            fontWeight: "bold", // Bolder text for emphasis
            transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
          }}
        >
          Select Rooms
        </Typography>
        <br />
        <Rooms
          rooms={hotelById?.rooms}
          onRoomSelect={handleRoomSelect}
          selectedRooms={selectedRooms}
        />
      </div>
    </div>
  );
};

export default BookNow;
