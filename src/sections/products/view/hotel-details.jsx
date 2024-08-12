/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/img-redundant-alt */
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Carousel } from 'react-bootstrap';
import { IoTrashOutline, IoMailOpenOutline } from 'react-icons/io5';

import { styled, Container } from '@mui/material';

import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';

import './hotelDetails.css';

export default function HotelDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [amenitiesToShow, setAmenitiesToShow] = useState([]);
  const path = location.pathname;
  const hotelId = path.substring(path.lastIndexOf('/') + 1);

  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        setHotel(response.data);
        const allAmenities = response.data.amenities.flatMap((a) => a.amenities);
        setAmenitiesToShow(allAmenities.slice(0, 10));
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  useEffect(() => {
    if (hotel) {
      const allAmenities = hotel.amenities.flatMap((a) => a.amenities);
      if (showAllAmenities) {
        setAmenitiesToShow(allAmenities);
      } else {
        setAmenitiesToShow(allAmenities.slice(0, 5));
      }
    }
  }, [showAllAmenities, hotel]);

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  const handleMailToHotel = () => {
    const email = hotel.hotelEmail;
    window.location.href = `mailto:${email}`;
  };
  /* -----------------------------------------Hotel approval -----------------------------------------*/
  const handleApproveHotel = async (currentAcceptanceState) => {
    try {
      const newAcceptanceState = !currentAcceptanceState;

      await axios.patch(`${localUrl}/hotels/update/${hotelId}`, {
        isAccepted: newAcceptanceState,
      });

      // Show success message
      toast.success(newAcceptanceState ? 'Hotel accepted successfully' : 'Hotel removed from live');

      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      setHotel(response.data);
    } catch (error) {
      // Extract and display a more informative error message
      const errorMessage =
        error.response?.data?.message || 'An error occurred while updating the hotel status';
      toast.error(`Error updating hotel status: ${errorMessage}`);
    }
  };

  /* -----------------------------------------FOOD DELETE FUNCTIONS-----------------------------------------*/
  const handleDeleteFood = async (foodId) => {
    try {
      await axios.delete(`${localUrl}/delete-food/${hotelId}/${foodId}`);
      // Update local state to remove the deleted food
      setHotel((prevHotel) => ({
        ...prevHotel,
        foods: prevHotel.foods.filter((food) => food.foodId !== foodId),
      }));
      toast.success('Successfully deleted food item');
    } catch (error) {
      toast.error('Error deleting food item:', error);
    }
  };

  /* -----------------------------------------Amenities function-----------------------------------------*/
  const handleDeleteAmenity = async (amenityName) => {
    try {
      await axios.delete(`${localUrl}/hotels/${hotelId}/amenities/${amenityName}`);
      // Re-fetch the hotel details to get the updated list of amenities
      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      setHotel(response.data);
      toast.success('Successfully deleted amenity');
    } catch (error) {
      toast.error('Error deleting amenity:', error);
    }
  };

  /* -----------------------------------------end-----------------------------------------*/
  if (!hotel) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }
  const FlexContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Space between items
    marginBottom: '16px', // Bottom margin
  });
  return (
    <div className="container mt-4">
      <FlexContainer>
        <Button variant="primary" onClick={handleGoBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <Button onClick={() => handleApproveHotel(hotel?.isAccepted)}>
          {hotel?.isAccepted ? 'Remove from live' : 'Accept this hotel'}
        </Button>
        <Button variant="danger" sx={{ mb: 2 }} onClick={handleMailToHotel}>
          <IoMailOpenOutline /> Mail to hotel
        </Button>
      </FlexContainer>
      <h4
        className="main-header"
        style={{
          display: 'flex',
          justifyContent: 'center', // Center align horizontally
          marginBottom: '16px',
        }}
      >
        {hotel.hotelName}
      </h4>

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
      {/* ----------------------------------------BASIC DETAILS-------------------------------------- */}
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
      {/* ----------------------------------------ROOM-------------------------------------- */}
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
      {/* ----------------------------------------FOODS-------------------------------------- */}
      <h3 className="heading-text">Foods</h3>
      <div className="food-container">
        {hotel.foods.length === 0 ? (
          <p>You haven't added any meals in your hotel.</p>
        ) : (
          hotel.foods.map((food) => (
            <div key={food._id} className="food-card">
              <div className="card-body">
                <p className="card-text">
                  <strong>Name:</strong> {food.name}
                </p>
                {food.images && <img src={food.images} alt={`${food.name} image`} />}
                <p className="card-text">
                  <strong>About:</strong> {food.about}
                </p>
                <p className="card-text">
                  <strong>Price:</strong> ${food.price}
                </p>
                <Button variant="danger" onClick={() => handleDeleteFood(food._id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* ----------------------------------------AMENITIES-------------------------------------- */}
      <h3 className="heading-text">Amenities</h3>
      <div className="amenities-list">
        {amenitiesToShow.map((amenityName, index) => (
          <div
            key={index}
            className="amenity-item d-flex justify-content-between align-items-center"
          >
            <p className="amenity-text">{amenityName}</p>
            <IoTrashOutline
              onClick={() => handleDeleteAmenity(amenityName)}
              className="trash-icon"
              title="Delete Amenity"
            />
          </div>
        ))}
      </div>
      {!showAllAmenities &&
        amenitiesToShow.length < hotel.amenities.flatMap((a) => a.amenities).length && (
          <Button
            onClick={() => setShowAllAmenities(true)}
            style={{ backgroundColor: '#007bff', color: '#fff' }} // Adjust the color as needed
            className="mt-2"
          >
            Show More ...
          </Button>
        )}
      {showAllAmenities && (
        <Button
          onClick={() => setShowAllAmenities(false)}
          style={{ backgroundColor: '#007bff', color: '#fff' }} // Adjust the color as needed
          className="mt-2"
        >
          Show Less ...
        </Button>
      )}
      <br />
      {/* ----------------------------------------POLICIES-------------------------------------- */}
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
