/* eslint-disable perfectionist/sort-imports */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiDelete } from 'react-icons/fi';
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
import AddFoodModal from '../add-food-to-hotel'; // Import the AddFoodModal component

import './hotelDetails.css';

const ITEMS_PER_PAGE = 4;

export default function HotelDetails({ product, onAddFood }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [amenitiesToShow, setAmenitiesToShow] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRoomPage, setCurrentRoomPage] = useState(1);
  const path = location.pathname;
  const hotelId = path.substring(path.lastIndexOf('/') + 1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [hotel, setHotel] = useState(null);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddFood = (foodData) => {
    onAddFood(product.hotelId, foodData); // Pass hotelId and foodData to the onAddFood function
    handleCloseModal();
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
  //  ---------------------------------Delete Food ------------------------------------------
  const handleDeleteFood = async (foodId) => {
    try {
      await axios.delete(`${localUrl}/delete-food/${hotelId}/${foodId}`);
      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      setHotel(response.data);
      toast.success('Successfully deleted food item');
    } catch (error) {
      toast.error('Error deleting food item:', error);
    }
  };
  // ---------------------------------------Delete amenities-------------------------------------
  const handleDeleteAmenity = async (amenityName) => {
    try {
      await axios.delete(`${localUrl}/hotels/${hotelId}/amenities/${amenityName}`);
      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      setHotel(response.data);
      toast.success('Successfully deleted amenity');
    } catch (error) {
      toast.error('Error deleting amenity:', error);
    }
  };

  // -----------------------------------Pagination---------------------------------------------
  const totalFoodPages = Math.ceil(hotel?.foods.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFoods = hotel?.foods.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  const totalRoomPages = Math.ceil(hotel?.rooms.length / ITEMS_PER_PAGE);
  const startRoomIndex = (currentRoomPage - 1) * ITEMS_PER_PAGE;
  const currentRooms = hotel?.rooms.slice(startRoomIndex, startRoomIndex + ITEMS_PER_PAGE) || [];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalFoodPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleRoomPageChange = (pageNumber) => {
    setCurrentRoomPage(pageNumber);
  };

  const handleNextRoomPage = () => {
    if (currentRoomPage < totalRoomPages) {
      setCurrentRoomPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousRoomPage = () => {
    if (currentRoomPage > 1) {
      setCurrentRoomPage((prevPage) => prevPage - 1);
    }
  };
  // -------------------------------------------------------------------------------------------
  const FlexContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  });

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
      <br />
      {/* ---------------------------------Room details ------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }} className="heading-text">
          Room Types
        </h3>
        <Button
          style={{ backgroundColor: '#007bff', color: 'white', marginLeft: '1rem' }}
          variant="contained"
          onClick={() => {
            /* Add your button click handler here */
          }}
        >
          Add Rooms
        </Button>
      </div>
      <br />
      <div className="room-container">
        {currentRooms.map((room) => (
          <div key={room._id} className="room-card">
            <div className="card-header">
              <div className="room-image">
                <img src={room.images} alt={`${room.type} room`} />
              </div>
            </div>
            <div className="card-body">
              <p className="card-text">{room.type}</p>
              <p className="card-text">
                <strong>Bed Type</strong> {room.bedTypes}
              </p>
              <p style={{ color: 'red' }} className="card-text">
                <FaIndianRupeeSign /> {room?.price}
              </p>
              <p className="card-text">
                <strong>Number of Rooms:</strong> {room.countRooms}
              </p>
            </div>
          </div>
        ))}
      </div>
      {hotel?.rooms.length > ITEMS_PER_PAGE && (
        <div className="pagination">
          <Button
            variant="outlined"
            disabled={currentRoomPage === 1}
            onClick={handlePreviousRoomPage}
          >
            Previous
          </Button>
          {Array.from({ length: totalRoomPages }, (_, index) => (
            <Button
              key={index + 1}
              variant="outlined"
              className={`pagination-button ${currentRoomPage === index + 1 ? 'active' : ''}`}
              onClick={() => handleRoomPageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            variant="outlined"
            disabled={currentRoomPage === totalRoomPages}
            onClick={handleNextRoomPage}
          >
            Next
          </Button>
        </div>
      )}
      <br />
      {/* ----------------------------------------------food details--------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }} className="heading-text">
          Foods
        </h3>
        <Button
          style={{ backgroundColor: '#007bff', color: 'white', marginLeft: '1rem' }}
          variant="contained"
          onClick={() => {
            handleOpenModal();
          }}
        >
          Add Foods
        </Button>
      </div>
      <br />
      <div className="food-container">
        {hotel.foods.length === 0 ? (
          <p className="no-foods-message">You haven't added any meals in your hotel.</p>
        ) : (
          currentFoods.map((food) => (
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

              <div className="card-footer">
                <Button
                  style={{ backgroundColor: '#e5e5e4' }}
                  variant="outlined"
                  onClick={() => handleDeleteFood(food.foodId)}
                >
                  <FiDelete /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Food Pagination */}
      {totalFoodPages > 1 && (
        <div className="pagination">
          <Button variant="outlined" disabled={currentPage === 1} onClick={handlePreviousPage}>
            Previous
          </Button>
          {Array.from({ length: totalFoodPages }, (_, index) => (
            <Button
              key={index + 1}
              variant="outlined"
              className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            variant="outlined"
            disabled={currentPage === totalFoodPages}
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      )}
      <br />
      {/* -----------------------------------------amenities details--------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }} className="heading-text">
          Amenities
        </h3>
        <Button
          style={{
            backgroundColor: '#28a745', // Adjust the color as needed
            color: 'white',
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
          }}
          variant="contained"
          onClick={() => {
            /* Add your button click handler here */
          }}
        >
          Update Amenities
        </Button>
      </div>
      <br />
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
            style={{ backgroundColor: '#007bff', color: '#fff' }}
            className="mt-2"
          >
            Show More ...
          </Button>
        )}
      {showAllAmenities && (
        <Button
          onClick={() => setShowAllAmenities(false)}
          style={{ backgroundColor: '#007bff', color: '#fff' }}
          className="mt-2"
        >
          Show Less ...
        </Button>
      )}
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
    </div>
  );
}
HotelDetails.propTypes = {
  product: PropTypes.object.isRequired,
  onAddFood: PropTypes.func.isRequired,
};
