/* eslint-disable jsx-a11y/img-redundant-alt */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { IoMailOpenOutline } from 'react-icons/io5';
import { Row, Col, Carousel } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button, Container } from '@mui/material';

import LinearLoader from 'src/utils/Loading';

import './hotelDetails.css';

export default function HotelDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const hotelId = path.substring(path.lastIndexOf('/') + 1);

  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/hotels/get-by-id/${hotelId}`);
        setHotel(response.data);
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  if (!hotel) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };
  const handleMailToHotel = () => {
    const email = hotel.hotelEmail;
    window.location.href = `mailto:${email}`;
  };
  return (
    <div className="container mt-4">
      <Button variant="contained" onClick={handleGoBack} sx={{ mb: 2 }}>
        Back
      </Button>{' '}
      <Button variant="outlined" sx={{ mb: 2 }} onClick={handleMailToHotel}>
        {' '}
        <IoMailOpenOutline /> {'  '} Mail to hotel{' '}
      </Button>
      <br />
      <h4 className="main-header">{hotel.hotelName}</h4> <hr />
      <Carousel>
        {hotel.images.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={image}
              alt={`Slide ${index + 1}`}
              style={{ height: '400px', objectFit: 'cover' }} // Set max height and preserve aspect ratio
            />
          </Carousel.Item>
        ))}
      </Carousel>
      <hr />
      <h5>Basic Details</h5>
      <hr />
      <div>
        <Row>
          <Col md={6}>
            <p>
              <strong>Owner Name:</strong> {hotel.hotelOwnerName}
            </p>
            <p>
              <strong>Email:</strong> {hotel.hotelEmail}
            </p>
            <p>
              <strong>Address:</strong> {hotel.destination}
            </p>
          </Col>
          <Col md={6}>
            <p>
              <strong>City:</strong> {hotel.city}
            </p>
            <p>
              <strong>State:</strong> {hotel.state}
            </p>
            <p>
              <strong>Pin Code:</strong> {hotel.pinCode}
            </p>
          </Col>
        </Row>

        <p>
          <strong>Description:</strong> {hotel.description}
        </p>
        <p>
          <strong>Customer Welcome Note:</strong> {hotel.customerWelcomeNote}
        </p>
      </div>
      <h3 className="heading-text">Rooms Types</h3>
      <div className="room-container">
        {hotel.rooms.map((room) => (
          <div key={room._id} className="room-card-container">
            <div className="card-body">
              <div className="room-image">
                <img src={room?.images} alt={`${room.type} room`} />
              </div>
              <p className="card-text">
                <strong>Type:</strong> {room.type}
              </p>
              <p className="card-text">
                <strong>Bed Types:</strong> {room.bedTypes}
              </p>
              <p className="card-text">
                <strong>Price:</strong> ${room.price}
              </p>
              <p className="card-text">
                <strong>Number of Rooms:</strong> {room.countRooms}
              </p>
              {/* Add more room details as needed */}
            </div>
          </div>
        ))}
      </div>
      <h3 className="heading-text">Foods</h3>
      <div className="food-container">
        {hotel.foods.map((food) => (
          <div key={food._id} className="card">
            <div className="card-body">
              <p className="card-text">
                <strong>Name:</strong> {food.name}
              </p>
              <img src={food?.images} alt={`${food.name} image`} />
              <p className="card-text">
                <strong>About:</strong> {food.about}
              </p>
              <p className="card-text">
                <strong>Price:</strong> ${food.price}
              </p>
              {/* Add more food details as needed */}
            </div>
          </div>
        ))}
      </div>
      <h3 className="heading-text">Amenities</h3>
      {hotel.amenities.map((amenity) => (
        <div key={amenity._id} className="card mb-3">
          <div className="card-body">
            <p className="card-text">{amenity.amenities.join(', ')}</p>
            {/* Add more amenity details as needed */}
          </div>
        </div>
      ))}
      <h3 className="heading-text">Policies</h3>
      {hotel.policies.map((policy) => (
        <div key={policy._id} className="card mb-3">
          <div className="card-body">
            <p className="card-text">
              <strong>Hotels Policy:</strong> {policy.hotelsPolicy}
            </p>
            <p className="card-text">
              <strong>Check-In Policy:</strong> {policy.checkInPolicy}
            </p>
            <p className="card-text">
              <strong>Check-Out Policy:</strong> {policy.checkOutPolicy}
            </p>
            {/* Add more policy details as needed */}
          </div>
        </div>
      ))}
    </div>
  );
}
