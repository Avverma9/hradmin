import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import {
  IoReturnUpBack,
  IoTrashOutline,
  IoMailOpenOutline,
} from "react-icons/io5";
import { GrStatusGood } from "react-icons/gr";
import { styled, Container, IconButton, LinearProgress } from "@mui/material";
import { role, localUrl } from "../../../../utils/util";
import { Edit } from "@mui/icons-material";
import AddFoodModal from "../manage-foods"; // Import the AddFoodModal component

import "./hotelDetails.css";
import Amenities from "../manage-amenties";
import AddRoomModal from "../manage-rooms";
import BasicDetails from "../basic-details";
import Reviews from "./superAdmin/reviews";
import RoomCarousel from "../rooms-carousel";
import FoodCarousel from "../foods-carousel";
import HotelCarousel from "../hotel-images";
import { useLoader } from "../../../../utils/loader";
import Policies from "../policies";

export default function HotelDetails({
  product,
  onAddFood,
  onUpdateAmenities,
  onAddRoom,
  onBasicDetails,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [amenitiesToShow, setAmenitiesToShow] = useState([]);
  const path = location.pathname;
  const { showLoader, hideLoader } = useLoader();
  const hotelId = path.substring(path.lastIndexOf("/") + 1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [hotel, setHotel] = useState(null);
  const [isAmenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [isBasicDetailModalOpen, setBasicDetailsOpen] = useState(false);
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);
  // ------------------------------------Foods add -------------------------------------//
  const handleAddFood = async (foodData) => {
    onAddFood(product.hotelId, foodData); // Pass hotelId and foodData to the onAddFood function
    showLoader();
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
    hideLoader();

    handleCloseModal();
  };
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const handleCloseModal = async () => {
    setModalOpen(false);
    showLoader();
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
    hideLoader();
  };

  // ------------------------------------Amenities add-------------------------------------//
  const handleAddAmenities = async (amenitiesData) => {
    onUpdateAmenities(product.hotelId, amenitiesData);
    showLoader();
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
    setHotel(response.data);
    handleCloseAmenitiesModal();
    hideLoader();
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
        showLoader();
        const response = await axios.get(
          `${localUrl}/hotels/get-by-id/${hotelId}`,
        );
        setHotel(response.data);
        const allAmenities = response.data.amenities.flatMap(
          (a) => a.amenities,
        );
        setAmenitiesToShow(allAmenities.slice(0, 10));
      } catch (error) {
        console.error("Error fetching hotel details:", error);
      } finally {
        hideLoader();
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  const limitedFood = hotel?.foods;
  const limitedRoom = hotel?.rooms;
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
  const handleApproveHotel = async () => {
    try {
      showLoader();
      const newAcceptanceState = !hotel.isAccepted;
      await axios.patch(`${localUrl}/hotels/update/${hotelId}`, {
        isAccepted: newAcceptanceState,
      });
      toast.success(
        newAcceptanceState
          ? "Hotel accepted successfully"
          : "Hotel removed from live",
      );
      const response = await axios.get(
        `${localUrl}/hotels/get-by-id/${hotelId}`,
      );
      setHotel(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while updating the hotel status";
      toast.error(`Error updating hotel status: ${errorMessage}`);
    } finally {
      hideLoader();
    }
  };

  const handleToggleFrontPage = async () => {
    try {
      showLoader();
      const onFrontPage = !hotel.onFront;

      await axios.patch(`${localUrl}/hotels/update/${hotelId}`, {
        onFront: onFrontPage,
      });
      toast.success(
        onFrontPage
          ? "Hotel is now on the front page"
          : "Hotel removed from the front page",
      );
      const response = await axios.get(
        `${localUrl}/hotels/get-by-id/${hotelId}`,
      );
      setHotel(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while updating the front page status";
      toast.error(`Error updating front page status: ${errorMessage}`);
    } finally {
      hideLoader();
    }
  };

  // -------------------------------------------------------------------------------------------
  const FlexContainer = styled("div")({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
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
        <LinearProgress />
      </Container>
    );
  }
  // -------------------------------------------------Delete hotel--------------------------------------//
  const handleDeleteHotel = async (hotelId) => {
    try {
      showLoader();
      const response = await axios.delete(
        `${localUrl}/delete/hotels/by/${hotelId}`,
      );
      if (response.status === 200) {
        toast.success("Selected hotel is deleted now !");
        navigate("/hotels");
      }
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="container mt-4">
      <FlexContainer>
        <button className="custom-button" onClick={handleGoBack} sx={{ mb: 2 }}>
          <IoReturnUpBack /> Back
        </button>
        {/* only authorized roles will see this buttons for use */}
        {(role === "Developer" || role === "Admin") && (
          <>
            <button
              style={{ backgroundColor: "white" }}
              onClick={() => handleToggleFrontPage(hotel?.onFront)}
              className="custom-button"
            >
              {hotel?.onFront ? (
                <>
                  <IoTrashOutline /> Remove from front page
                </>
              ) : (
                <>
                  <GrStatusGood /> Add to front page
                </>
              )}
            </button>
            <button
              style={{ backgroundColor: "white" }}
              onClick={() => handleApproveHotel(hotel?.isAccepted)}
              className="custom-button"
            >
              {hotel?.isAccepted ? (
                <>
                  <IoTrashOutline /> Decline
                </>
              ) : (
                <>
                  <GrStatusGood /> Approve
                </>
              )}
            </button>
            <button
              className="custom-button"
              onClick={() => handleDeleteHotel(hotel?.hotelId)}
            >
              X Delete
            </button>
            <button
              variant="danger"
              sx={{ mb: 2 }}
              onClick={handleMailToHotel}
              className="custom-button"
            >
              <IoMailOpenOutline /> Mail
            </button>
          </>
        )}
      </FlexContainer>

      <h4
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        {hotel.hotelName}
      </h4>

      <HotelCarousel hotel={hotel} />

      <hr />

      {/* ---------------------------------------basic detaisl------------------------------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }} className="heading-text">
          Basic Details
        </h3>
        <IconButton
          style={{
            backgroundColor: "#007bff", // Same color as the button
            color: "white",
            marginLeft: "1rem",
            borderRadius: "50%", // Circular shape
            padding: "10px", // Adjust padding for circular appearance
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent the card click event from firing
            handleBasicDetailsOpen(); // Function to open the basic details modal
          }}
        >
          <Edit />
        </IconButton>
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }} className="heading-text">
          Room Types
        </h3>
        <IconButton
          style={{
            backgroundColor: "#007bff",
            color: "white",
            marginLeft: "1rem",
            borderRadius: "50%", // Circular shape
            padding: "10px", // Adjust padding for the circular appearance
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent the card click event from firing
            handleOpenRoom();
          }}
        >
          <Edit />
        </IconButton>
      </div>
      <br />
      <RoomCarousel limitedRoom={limitedRoom} />
      <br />
      {/* ----------------------------------------------food details--------------------------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }} className="heading-text">
          Foods
        </h3>
        <IconButton
          style={{
            backgroundColor: "#007bff",
            color: "white",
            marginLeft: "1rem",
            borderRadius: "50%", // Circular shape
            padding: "10px", // Adjust padding for the circular appearance
          }}
          onClick={() => {
            handleOpenModal(); // Function to open the modal for managing foods
          }}
        >
          <Edit />
        </IconButton>
      </div>
      <br />
      <FoodCarousel limitedFood={limitedFood} />
      <hr />
      {hotel?.foods?.length > 0 && (
        <Button
          style={{
            backgroundColor: "rgba(171, 171, 171, 0.13)",
            color: "black",
            marginLeft: "1rem",
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
      <div
        style={{
          border: "1px solid #000", // Thicker border and darker color
          borderRadius: "8px", // Rounded corners
          padding: "16px", // Padding inside the div
          margin: "16px 0", // Margin outside the div
          backgroundColor: "#fff", // Background color should contrast with the border
          boxSizing: "border-box", // Include padding and border in total size
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ margin: 0 }} className="heading-text">
            Amenities
          </h3>
          <IconButton
            style={{
              backgroundColor: "#007bff", // Same color as the button
              color: "white",
              marginLeft: "1rem",
              borderRadius: "50%", // Circular shape
              padding: "10px", // Adjust padding for circular appearance
            }}
            onClick={() => handleOpenAmenities()} // Function to open the amenities modal
          >
            <Edit />
          </IconButton>
        </div>

        {/* Amenities List */}
        <div
          className="amenities-list"
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {amenitiesToShow.map((amenityName, index) => (
            <div
              key={index}
              className="amenity-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <p style={{ margin: 0 }}>{amenityName}</p>
            </div>
          ))}
        </div>
        <hr />
        {!showAllAmenities &&
          amenitiesToShow.length <
            hotel.amenities.flatMap((a) => a.amenities).length && (
            <Button
              onClick={() => setShowAllAmenities(true)}
              style={{
                backgroundColor: "rgb(171 171 171 / 13%)",
                color: "black",
              }}
              className="mt-2"
            >
              Show More ...
            </Button>
          )}
        {showAllAmenities && (
          <Button
            onClick={() => setShowAllAmenities(false)}
            style={{
              backgroundColor: "rgb(171 171 171 / 13%)",
              color: "black",
            }}
            className="mt-2"
          >
            Show Less ...
          </Button>
        )}
      </div>
      <br />

      {/* ------------------------------------policies details---------------------------------------- */}
      <Policies hotel={hotel} />
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
      <Reviews hotelId={hotel.hotelId} />
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
