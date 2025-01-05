import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { getHotelById } from "src/components/redux/reducers/hotel";
import BookingDetails from "./bookingDetails";
import Food from "./foods";
import Rooms from "./rooms";
import "./BookNow.css";
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
      // Set first room as default selection
      if (selectedRooms.length === 0) {
        setSelectedRooms([hotelById.rooms[0]]);
      }

      const roomPrice = hotelById.rooms[0]?.price || 0;
      let updatedPrice = roomPrice * numRooms;

      selectedFoods.forEach((food) => {
        updatedPrice += food.price * food.quantity;
      });

      setTotalPrice(updatedPrice);
    }
  }, [hotelById, numRooms, selectedFoods, selectedRooms]);

  useEffect(() => {
    // If no room is selected, pick a random room
    if (selectedRooms.length === 0 && hotelById?.rooms?.length > 0) {
      const randomRoom = hotelById.rooms[Math.floor(Math.random() * hotelById.rooms.length)];
      setSelectedRooms([randomRoom]);
    }
  }, [hotelById, selectedRooms]);

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

const handleRoomSelect = (room) => {
    if (!selectedRooms.some((r) => r.type === room.type)) {
        setSelectedRooms([...selectedRooms, room]);
    } else {
        setSelectedRooms(selectedRooms.filter((r) => r.type !== room.type));
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
            room={selectedRooms}
            food={selectedFoods}
            totalPrice={totalPrice}
            onBooking={handleBooking}
          />
        </div>
      </div>
      <div className="food-cards">
        <Typography
          style={{
            background: "linear-gradient(45deg, #6a11cb, #2575fc)",
            padding: "10px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#fff",
            textAlign: "center",
            fontFamily: "Helvetica, Arial, sans-serif",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            letterSpacing: "1px",
            fontWeight: "bold",
            transition: "all 0.3s ease-in-out",
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
            background: "linear-gradient(45deg, #6a11cb, #2575fc)",
            padding: "10px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#fff",
            textAlign: "center",
            fontFamily: "Helvetica, Arial, sans-serif",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            letterSpacing: "1px",
            fontWeight: "bold",
            transition: "all 0.3s ease-in-out",
          }}
        >
          Select Rooms
        </Typography>
        <br />
        <Rooms
          rooms={hotelById?.rooms}
          onRoomSelect={handleRoomSelect}
        />
      </div>
    </div>
  );
};

export default BookNow;
