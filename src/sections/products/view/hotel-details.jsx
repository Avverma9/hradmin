/* eslint-disable perfectionist/sort-imports */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect } from 'react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Carousel } from 'react-bootstrap';
import {
  IoReturnUpBack,
  IoTrashOutline,
  IoFastFoodOutline,
  IoMailOpenOutline,
} from 'react-icons/io5';
import { GrStatusGood } from 'react-icons/gr';
import Tooltip from '@mui/material/Tooltip';
import { styled, Container } from '@mui/material';
import { localUrl } from 'src/utils/util';
import LinearLoader from 'src/utils/Loading';
import AddFoodModal from '../manage-foods'; // Import the AddFoodModal component

import './hotelDetails.css';
import Amenities from '../manage-amenties';
import AddRoomModal from '../manage-rooms';
import BasicDetails from '../basic-details';

export default function HotelDetails({ product, onAddFood, onUpdateAmenities,onAddRoom,onBasicDetails }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [amenitiesToShow, setAmenitiesToShow] = useState([]);
  const path = location.pathname;
  const hotelId = path.substring(path.lastIndexOf('/') + 1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [hotel, setHotel] = useState(null);
  const [isAmenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [isBasicDetailModalOpen, setBasicDetailsOpen] = useState(false);
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);
  // ------------------------------------Foods add -------------------------------------//
  const handleAddFood = async (foodData) => {
    onAddFood(product.hotelId, foodData); // Pass hotelId and foodData to the onAddFood function
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
    handleCloseModal();
  };
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const handleCloseModal = async () => {
    setModalOpen(false);
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
  };

  // ------------------------------------Amenities add-------------------------------------//
  const handleAddAmenities = async (amenitiesData) => {
    onUpdateAmenities(product.hotelId, amenitiesData);
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
    handleCloseAmenitiesModal();
  };
  const handleOpenAmenities = () => {
    setAmenitiesModalOpen(true);
  };
  const handleCloseAmenitiesModal = async () => {
    setAmenitiesModalOpen(false);
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
  };
  // ------------------------------------hotel fetch-------------------------------------//
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

  const limitedFood = hotel?.foods?.slice(0, 4);
  const limitedRoom = hotel?.rooms?.slice(0, 4);
  // ------------------------------------amenities flat--------------------------------------//
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

  // handle go back function
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  // handle mail hotel
  const handleMailToHotel = () => {
    const email = hotel.hotelEmail;
    window.location.href = `mailto:${email}`;
  };

  // ---------------------------------------Approve hotel function -----------------------------------
  const handleApproveHotel = async (currentAcceptanceState) => {
    try {
      const newAcceptanceState = !currentAcceptanceState;
      await axios.patch(`${localUrl}/hotels/update/${hotelId}`, {
        isAccepted: newAcceptanceState,
      });
      toast.success(newAcceptanceState ? 'Hotel accepted successfully' : 'Hotel removed from live');
      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      setHotel(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'An error occurred while updating the hotel status';
      toast.error(`Error updating hotel status: ${errorMessage}`);
    }
  };

  // -------------------------------------------------------------------------------------------
  const FlexContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  });
    const handleAddRoom = (roomData) => {
      onAddRoom(product.hotelId, roomData); // Pass hotelId and foodData to the onAddFood function
      handleCloseModal();
    };
    const handleOpenRoom = () => {
      setRoomModalOpen(true);
    };
    const handleCloseRoom = () => {
      setRoomModalOpen(false);
    };
    const handleBasicDetailsClose = () => {
      setBasicDetailsOpen(false);
    };
    const handleBasicDetailsOpen = () => {
      setBasicDetailsOpen(true);
    };
 const basicDetails = (basicData) => {
   onBasicDetails(product.hotelId, basicData);
   handleBasicDetailsClose();
 };
  if (!hotel) {
    return (
      <Container>
        <LinearLoader />
      </Container>
    );
  }

  return (
    <div className="container mt-4">
      <FlexContainer>
        <Button variant="primary" onClick={handleGoBack} sx={{ mb: 2 }}>
          <IoReturnUpBack /> Back
        </Button>
        <Button
          style={{ backgroundColor: 'black' }}
          onClick={() => handleApproveHotel(hotel?.isAccepted)}
        >
          {hotel?.isAccepted ? (
            <>
              <IoTrashOutline /> Remove this hotel
            </>
          ) : (
            <>
              <GrStatusGood /> Approve this hotel
            </>
          )}
        </Button>

        <Button variant="danger" sx={{ mb: 2 }} onClick={handleMailToHotel}>
          <IoMailOpenOutline /> Mail to hotel
        </Button>
      </FlexContainer>

      <h4
        className="main-header"
        style={{
          display: 'flex',
          justifyContent: 'center',
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
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
      <hr />

      {/* ---------------------------------------basic detaisl------------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }} className="heading-text">
          Basic Details
        </h3>
        <Button
          style={{ backgroundColor: 'rgb(222 124 124)', color: 'white', marginLeft: '1rem' }}
          variant="contained"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the card click event from firing
            handleBasicDetailsOpen();
          }}
        >
          Manage Details
        </Button>
      </div>
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
      <br />
      {/* ---------------------------------Room details ------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }} className="heading-text">
          Room Types
        </h3>
        <Button
          style={{ backgroundColor: 'rgb(222 124 124)', color: 'white', marginLeft: '1rem' }}
          variant="contained"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the card click event from firing
            handleOpenRoom();
          }}
        >
          Manage Rooms
        </Button>
      </div>
      <br />
      <div className="room-container">
        {hotel?.rooms?.length === 0 ? (
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/data-error-11521121-9404366.png?f=webp"
            alt="No rooms available"
            style={{ display: 'block', margin: 'auto' }}
          />
        ) : (
          limitedRoom?.map((room) => (
            <div key={room._id} className="room-card">
              <div className="card-header">
                <div className="room-image">
                  <img src={room.images} alt={`${room.type} room`} />
                </div>
              </div>
              <div className="card-body">
                <p className="card-text">{room.type}</p>
                <p className="card-text">
                  <strong>Bed Type:</strong> {room.bedTypes}
                </p>
                <p style={{ color: 'red' }} className="card-text">
                  <FaIndianRupeeSign /> {room?.price}
                </p>
                <p className="card-text">
                  <strong>Number of Rooms:</strong> {room.countRooms}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <br />
      {/* ----------------------------------------------food details--------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }} className="heading-text">
          Foods
        </h3>
        <Button
          style={{ backgroundColor: 'rgb(222 124 124)', color: 'white', marginLeft: '1rem' }}
          variant="contained"
          onClick={() => {
            handleOpenModal();
          }}
        >
          Manage Foods
        </Button>
      </div>
      <br />
      <div className="food-container">
        {hotel.foods.length === 0 ? (
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/data-error-11521121-9404366.png?f=webp"
            alt=""
          />
        ) : (
          limitedFood?.map((food) => (
            <div key={food._id} className="food-card">
              <div className="card-header">
                <h4 className="food-name">{food.name}</h4>
                {food.images && (
                  <img className="food-image" src={food.images} alt={`${food.name} image`} />
                )}
              </div>

              <div className="card-body">
                <p className="card-text">
                  <IoFastFoodOutline /> {food?.foodType}
                </p>
                <p style={{ color: 'red' }} className="card-text">
                  <FaIndianRupeeSign /> {food?.price}
                </p>
                <p style={{ color: 'green' }} className="card-text">
                  <Tooltip title={food?.about}>{food.about}</Tooltip>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <hr />
      {hotel?.foods?.length > 0 && (
        <Button
          style={{
            backgroundColor: 'rgba(171, 171, 171, 0.13)',
            color: 'black',
            marginLeft: '1rem',
          }}
          variant="contained"
          onClick={() => {
            handleOpenModal();
          }}
        >
          See all Foods
        </Button>
      )}

      <hr />
      <br />
      {/* -----------------------------------------amenities details--------------------------------- */}
      <div style={{ padding: '1rem' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }} className="heading-text">
            Amenities
          </h3>
          <Button
            style={{
              backgroundColor: 'rgb(222 124 124)', // Green button color
              color: 'white',
              padding: '0.5rem 1rem',
            }}
            variant="contained"
            onClick={() => handleOpenAmenities()}
          >
            Manage Amenities
          </Button>
        </div>

        {/* Amenities List */}
        <div
          className="amenities-list"
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          }}
        >
          {amenitiesToShow.map((amenityName, index) => (
            <div
              key={index}
              className="amenity-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <p style={{ margin: 0 }}>{amenityName}</p>
            </div>
          ))}
        </div>
        <hr />
        {!showAllAmenities &&
          amenitiesToShow.length < hotel.amenities.flatMap((a) => a.amenities).length && (
            <Button
              onClick={() => setShowAllAmenities(true)}
              style={{ backgroundColor: 'rgb(171 171 171 / 13%)', color: 'black' }}
              className="mt-2"
            >
              Show More ...
            </Button>
          )}
        {showAllAmenities && (
          <Button
            onClick={() => setShowAllAmenities(false)}
            style={{ backgroundColor: 'rgb(171 171 171 / 13%)', color: 'black' }}
            className="mt-2"
          >
            Show Less ...
          </Button>
        )}
      </div>
      <br />

      {/* ------------------------------------policies details---------------------------------------- */}
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
          </div>
        </div>
      ))}
      <AddFoodModal
        open={isModalOpen}
        onClose={handleCloseModal}
        hotelId={hotel.hotelId}
        onAddFood={handleAddFood} // Pass the function to handle adding food
      />
      <Amenities
        open={isAmenitiesModalOpen}
        onClose={handleCloseAmenitiesModal}
        hotelId={hotel.hotelId}
        onUpdateAmenities={handleAddAmenities}
      />
      <AddRoomModal
        open={isRoomModalOpen}
        onClose={handleCloseRoom}
        hotelId={hotel.hotelId}
        onAddRoom={handleAddRoom}
      />
      <BasicDetails
        open={isBasicDetailModalOpen}
        onClose={handleBasicDetailsClose}
        hotelId={hotel.hotelId}
        onBasicDetails={basicDetails}
      />
    </div>
  );
}
HotelDetails.propTypes = {
  product: PropTypes.object.isRequired,
  onAddFood: PropTypes.func.isRequired,
  onUpdateAmenities: PropTypes.func.isRequired,
  onBasicDetails: PropTypes.func.isRequired,
  onAddRoom: PropTypes.func.isRequired,
};
