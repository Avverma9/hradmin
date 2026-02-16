import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import React, { useState, useEffect, useMemo } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import {
  IoReturnUpBack,
  IoTrashOutline,
  IoMailOpenOutline,
} from "react-icons/io5";
import { GrStatusGood } from "react-icons/gr";
import {
  styled,
  Container,
  IconButton,
  LinearProgress,
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Button as MuiButton,
} from "@mui/material";
import { role, localUrl } from "../../../../utils/util";
import { Edit, CheckCircleOutline } from "@mui/icons-material";
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

const unwrapHotelResponse = (response) => response?.data?.data ?? response?.data ?? {};

const flattenAmenities = (amenities) => {
  if (!Array.isArray(amenities)) return [];

  const stack = [...amenities];
  const result = [];

  while (stack.length > 0) {
    const item = stack.shift();

    if (Array.isArray(item)) {
      stack.push(...item);
      continue;
    }

    if (typeof item === "string") {
      const value = item.trim();
      if (value) result.push(value);
      continue;
    }

    if (item && Array.isArray(item.amenities)) {
      stack.push(...item.amenities);
    }
  }

  return Array.from(new Set(result));
};

const normalizeRooms = (rooms) => {
  if (!Array.isArray(rooms)) return [];

  return rooms.map((room, index) => {
    const imageSource = Array.isArray(room?.images)
      ? room.images[0]
      : room?.images;

    return {
      _id: room?._id || room?.roomId || room?.id || `room-${index}`,
      type: room?.type || room?.name || "Room",
      bedTypes: room?.bedTypes || room?.bedType || "N/A",
      images: imageSource || "",
      price: Number(
        room?.price ?? room?.pricing?.finalPrice ?? room?.pricing?.basePrice ?? 0,
      ),
      totalRooms: Number(room?.totalRooms ?? room?.inventory?.total ?? 0),
      countRooms: Number(room?.countRooms ?? room?.inventory?.available ?? 0),
      isOffer: Boolean(room?.isOffer ?? room?.features?.isOffer),
    };
  });
};

const normalizeFoods = (foods) => {
  if (!Array.isArray(foods)) return [];

  return foods.map((food, index) => {
    const imageSource = Array.isArray(food?.images)
      ? food.images[0]
      : food?.images;

    return {
      _id: food?._id || food?.foodId || food?.id || `food-${index}`,
      name: food?.name || "Unnamed",
      foodType: food?.foodType || food?.type || "",
      price: Number(food?.price ?? food?.pricing?.finalPrice ?? 0),
      about: food?.about || food?.description || "",
      images: imageSource || "",
    };
  });
};

const normalizePolicies = (policies) => {
  if (Array.isArray(policies)) return policies;

  if (policies && typeof policies === "object") {
    return [
      {
        hotelsPolicy: Array.isArray(policies.rules) ? policies.rules.join("\n") : "",
        checkInPolicy: policies.checkIn || "",
        checkOutPolicy: policies.checkOut || "",
        cancellationPolicy: policies.cancellationText || "",
        petsAllowed: policies?.restrictions?.petsAllowed ? "Yes" : "No",
        smokingAllowed: policies?.restrictions?.smokingAllowed ? "Yes" : "No",
        alcoholAllowed: policies?.restrictions?.alcoholAllowed ? "Yes" : "No",
      },
    ];
  }

  return [];
};

const normalizeHotel = (rawHotel = {}) => {
  const basicInfo = rawHotel?.basicInfo ?? {};
  const location = basicInfo?.location ?? {};
  const contacts = basicInfo?.contacts ?? {};

  return {
    ...rawHotel,
    hotelId: rawHotel?.hotelId || rawHotel?._id || "",
    hotelName: rawHotel?.hotelName || String(basicInfo?.name ?? "").trim(),
    hotelOwnerName:
      rawHotel?.hotelOwnerName || String(basicInfo?.owner ?? "").trim(),
    description: rawHotel?.description || basicInfo?.description || "",
    customerWelcomeNote: rawHotel?.customerWelcomeNote || "",
    propertyType: rawHotel?.propertyType || basicInfo?.category || "",
    starRating: rawHotel?.starRating ?? basicInfo?.starRating ?? "",
    images: Array.isArray(rawHotel?.images)
      ? rawHotel.images
      : Array.isArray(basicInfo?.images)
        ? basicInfo.images
        : [],
    destination: rawHotel?.destination || location?.address || "",
    city: rawHotel?.city || location?.city || "",
    state: rawHotel?.state || location?.state || "",
    pinCode: rawHotel?.pinCode || location?.pinCode || "",
    mapLink: rawHotel?.mapLink || location?.googleMapLink || "",
    contact: rawHotel?.contact || contacts?.phone || "",
    hotelEmail: rawHotel?.hotelEmail || contacts?.email || "",
    generalManagerContact:
      rawHotel?.generalManagerContact || contacts?.generalManager || "",
    salesManagerContact: rawHotel?.salesManagerContact || contacts?.salesManager || "",
    rooms: normalizeRooms(rawHotel?.rooms),
    foods: normalizeFoods(rawHotel?.foods),
    amenities: flattenAmenities(rawHotel?.amenities),
    policies: normalizePolicies(rawHotel?.policies),
  };
};

export default function HotelDetails({
  onAddFood = () => {},
  onUpdateAmenities = () => {},
  onAddRoom = () => {},
  onBasicDetails = () => {},
}) {
  const { hotelId: routeHotelId = "" } = useParams();
  const navigate = useNavigate();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [amenitiesToShow, setAmenitiesToShow] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [isModalOpen, setModalOpen] = useState(false);
  const [hotel, setHotel] = useState(null);
  const [isAmenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [isBasicDetailModalOpen, setBasicDetailsOpen] = useState(false);
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);
  const resolvedHotelId = hotel?.hotelId || routeHotelId || "";
  // ------------------------------------Foods add -------------------------------------//
  const handleAddFood = async (foodData) => {
    onAddFood(resolvedHotelId, foodData);
    showLoader();
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${routeHotelId}`);
    setHotel(normalizeHotel(unwrapHotelResponse(response)));
    hideLoader();

    handleCloseModal();
  };
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const handleCloseModal = async () => {
    setModalOpen(false);
    showLoader();
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${routeHotelId}`);
    setHotel(normalizeHotel(unwrapHotelResponse(response)));
    hideLoader();
  };

  // ------------------------------------Amenities add-------------------------------------//
  const handleAddAmenities = async (amenitiesData) => {
    onUpdateAmenities(resolvedHotelId, amenitiesData);
    showLoader();
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${routeHotelId}`);
    setHotel(normalizeHotel(unwrapHotelResponse(response)));
    handleCloseAmenitiesModal();
    hideLoader();
  };
  const handleOpenAmenities = () => {
    setAmenitiesModalOpen(true);
  };
  const handleCloseAmenitiesModal = async () => {
    setAmenitiesModalOpen(false);
    const response = await axios.get(`${localUrl}/hotels/get-by-id/${routeHotelId}`);
    setHotel(normalizeHotel(unwrapHotelResponse(response)));
  };
  // ------------------------------------hotel fetch-------------------------------------//
  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!routeHotelId) {
        return;
      }
      try {
        showLoader();
        const response = await axios.get(
          `${localUrl}/hotels/get-by-id/${routeHotelId}`,
        );
        const hotelData = normalizeHotel(unwrapHotelResponse(response));
        setHotel(hotelData);
        const allAmenities = flattenAmenities(hotelData.amenities);
        setAmenitiesToShow(allAmenities.slice(0, 10));
      } catch (error) {
        console.error("Error fetching hotel details:", error);
      } finally {
        hideLoader();
      }
    };

    fetchHotelDetails();
  }, [routeHotelId]);

  const limitedFood = Array.isArray(hotel?.foods) ? hotel.foods : [];
  const limitedRoom = Array.isArray(hotel?.rooms) ? hotel.rooms : [];
  const allAmenities = useMemo(
    () => flattenAmenities(hotel?.amenities),
    [hotel?.amenities],
  );
  // ------------------------------------amenities flat--------------------------------------//
  useEffect(() => {
    if (showAllAmenities) {
      setAmenitiesToShow(allAmenities);
    } else {
      setAmenitiesToShow(allAmenities.slice(0, 5));
    }
  }, [showAllAmenities, allAmenities]);

  // handle go back function
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  // handle mail hotel
  const handleMailToHotel = () => {
    const email = hotel.hotelEmail;
    if (!email) {
      toast.info("Hotel email is not available.");
      return;
    }
    window.location.href = `mailto:${email}`;
  };

  // ---------------------------------------Approve hotel function -----------------------------------
  const handleApproveHotel = async () => {
    try {
      showLoader();
      const newAcceptanceState = !hotel.isAccepted;
      await axios.patch(`${localUrl}/hotels/update/${routeHotelId}`, {
        isAccepted: newAcceptanceState,
      });
      toast.success(
        newAcceptanceState
          ? "Hotel accepted successfully"
          : "Hotel removed from live",
      );
      const response = await axios.get(
        `${localUrl}/hotels/get-by-id/${routeHotelId}`,
      );
      setHotel(normalizeHotel(unwrapHotelResponse(response)));
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

      await axios.patch(`${localUrl}/hotels/update/${routeHotelId}`, {
        onFront: onFrontPage,
      });
      toast.success(
        onFrontPage
          ? "Hotel is now on the front page"
          : "Hotel removed from the front page",
      );
      const response = await axios.get(
        `${localUrl}/hotels/get-by-id/${routeHotelId}`,
      );
      setHotel(normalizeHotel(unwrapHotelResponse(response)));
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
    onAddRoom(resolvedHotelId, roomData);
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
    onBasicDetails(resolvedHotelId, basicData);
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
  const handleDeleteHotel = async (targetHotelId) => {
    try {
      showLoader();
      const response = await axios.delete(
        `${localUrl}/delete/hotels/by/${targetHotelId}`,
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
              onClick={() => handleDeleteHotel(resolvedHotelId)}
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

      <HotelCarousel hotel={hotel} hotelId={resolvedHotelId} />

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
      {limitedFood.length > 0 && (
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
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, my: 2 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" className="heading-text">
            Amenities
          </Typography>
          <IconButton
            color="primary"
            onClick={() => handleOpenAmenities()} // Function to open the amenities modal
          >
            <Edit />
          </IconButton>
        </Box>

        {/* Amenities List */}
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {amenitiesToShow.map((amenityName, index) => (
            <Chip
              key={index}
              icon={<CheckCircleOutline fontSize="small" />}
              label={amenityName}
              variant="outlined"
              sx={{
                justifyContent: "flex-start",
                p: 2,
                height: "auto",
                "& .MuiChip-label": {
                  whiteSpace: "normal",
                },
              }}
            />
          ))}
        </Box>
        {allAmenities.length > 5 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <MuiButton onClick={() => setShowAllAmenities(!showAllAmenities)}>
                {showAllAmenities ? "Show Less" : "Show More ..."}
              </MuiButton>
            </Box>
          </>
        )}
      </Paper>
      <br />

      {/* ------------------------------------policies details---------------------------------------- */}
      <Policies hotel={hotel} />
      <AddFoodModal
        open={isModalOpen}
        onClose={handleCloseModal}
        hotelId={resolvedHotelId}
        onAddFood={handleAddFood} // Pass the function to handle adding food
      />
      <Amenities
        open={isAmenitiesModalOpen}
        onClose={handleCloseAmenitiesModal}
        hotelId={resolvedHotelId}
        onUpdateAmenities={handleAddAmenities}
      />
      <AddRoomModal
        open={isRoomModalOpen}
        onClose={handleCloseRoom}
        hotelId={resolvedHotelId}
        onAddRoom={handleAddRoom}
      />
      <BasicDetails
        open={isBasicDetailModalOpen}
        onClose={handleBasicDetailsClose}
        hotelId={resolvedHotelId}
        onBasicDetails={basicDetails}
      />
      <Reviews hotelId={resolvedHotelId} />
    </div>
  );
}
HotelDetails.propTypes = {
  onAddFood: PropTypes.func,
  onUpdateAmenities: PropTypes.func,
  onBasicDetails: PropTypes.func,
  onAddRoom: PropTypes.func,
};
