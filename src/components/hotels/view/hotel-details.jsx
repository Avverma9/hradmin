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
import { getBusinessHotelId, role, localUrl } from "../../../../utils/util";
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

const unwrapHotelResponse = (response) =>
  response?.data?.data ??
  response?.data?.hotel ??
  response?.data?.result ??
  response?.data ??
  {};

const toArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

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
      roomId: room?.roomId || room?.id || room?._id || `room-${index}`,
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
      foodId: food?.foodId || food?.id || food?._id || `food-${index}`,
      name: food?.name || "Unnamed",
      foodType: food?.foodType || food?.type || "",
      price: Number(food?.price ?? food?.pricing?.finalPrice ?? 0),
      about: food?.about || food?.description || "",
      images: imageSource || "",
    };
  });
};

const normalizePolicyValue = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join("\n");
  }

  return String(value).trim();
};

const normalizePolicyFlag = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const normalized = String(value || "").trim().toLowerCase();
  if (["yes", "true", "allowed", "1"].includes(normalized)) return "Yes";
  if (["no", "false", "not allowed", "0"].includes(normalized)) return "No";
  return value ? String(value) : "No";
};

const normalizePolicyEntry = (policy = {}) => ({
  ...policy,
  hotelsPolicy: normalizePolicyValue(policy?.hotelsPolicy ?? policy?.hotelPolicy ?? policy?.policy ?? policy?.rules),
  checkInPolicy: normalizePolicyValue(policy?.checkInPolicy ?? policy?.checkIn),
  checkOutPolicy: normalizePolicyValue(policy?.checkOutPolicy ?? policy?.checkOut),
  outsideFoodPolicy: normalizePolicyValue(policy?.outsideFoodPolicy),
  cancellationPolicy: normalizePolicyValue(policy?.cancellationPolicy ?? policy?.cancellationText),
  paymentMode: normalizePolicyValue(policy?.paymentMode),
  petsAllowed: normalizePolicyFlag(policy?.petsAllowed ?? policy?.restrictions?.petsAllowed),
  bachelorAllowed: normalizePolicyFlag(policy?.bachelorAllowed ?? policy?.restrictions?.bachelorAllowed),
  smokingAllowed: normalizePolicyFlag(policy?.smokingAllowed ?? policy?.restrictions?.smokingAllowed),
  alcoholAllowed: normalizePolicyFlag(policy?.alcoholAllowed ?? policy?.restrictions?.alcoholAllowed),
  unmarriedCouplesAllowed: normalizePolicyFlag(
    policy?.unmarriedCouplesAllowed ?? policy?.restrictions?.unmarriedCouplesAllowed,
  ),
  internationalGuestAllowed: normalizePolicyFlag(
    policy?.internationalGuestAllowed ?? policy?.restrictions?.internationalGuestAllowed,
  ),
  refundPolicy: normalizePolicyValue(policy?.refundPolicy),
  returnPolicy: normalizePolicyValue(policy?.returnPolicy),
});

const normalizePolicies = (policies) => {
  if (Array.isArray(policies)) {
    return policies
      .map((policy) => normalizePolicyEntry(policy))
      .filter((policy) => Object.values(policy).some((value) => String(value || "").trim() !== ""));
  }

  if (policies && typeof policies === "object") {
    if (Array.isArray(policies?.policies)) {
      return normalizePolicies(policies.policies);
    }

    const normalized = normalizePolicyEntry(policies);
    return Object.values(normalized).some((value) => String(value || "").trim() !== "")
      ? [normalized]
      : [];
  }

  return [];
};

const normalizeHotel = (rawHotel = {}, fallbackHotelId = "") => {
  const basicInfo = rawHotel?.basicInfo ?? {};
  const location = basicInfo?.location ?? {};
  const contacts = basicInfo?.contacts ?? {};
  const rooms = toArray(rawHotel?.rooms, rawHotel?.roomDetails, rawHotel?.hotelRooms);
  const foods = toArray(rawHotel?.foods, rawHotel?.foodsDetails, rawHotel?.foodItems);
  const amenities = rawHotel?.amenities ?? basicInfo?.amenities ?? [];
  const policies = rawHotel?.policies ?? rawHotel?.policy ?? rawHotel?.hotelPolicies ?? [];

  return {
    ...rawHotel,
    hotelId: getBusinessHotelId(rawHotel, fallbackHotelId),
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
    rooms: normalizeRooms(rooms),
    foods: normalizeFoods(foods),
    amenities: flattenAmenities(amenities),
    policies: normalizePolicies(policies),
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

  const refreshHotelDetails = async () => {
    if (!routeHotelId) return null;

    const response = await axios.get(`${localUrl}/hotels/get-by-id/${routeHotelId}`);
    const normalizedHotel = normalizeHotel(unwrapHotelResponse(response), routeHotelId);
    setHotel(normalizedHotel);
    return normalizedHotel;
  };

  // ------------------------------------Foods add -------------------------------------//
  const handleAddFood = async (foodData) => {
    onAddFood(resolvedHotelId, foodData);
    await refreshHotelDetails();
  };
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const handleCloseModal = async () => {
    setModalOpen(false);
    try {
      showLoader();
      await refreshHotelDetails();
    } finally {
      hideLoader();
    }
  };

  // ------------------------------------Amenities add-------------------------------------//
  const handleAddAmenities = async (amenitiesData) => {
    onUpdateAmenities(resolvedHotelId, amenitiesData);
    await refreshHotelDetails();
  };
  const handleOpenAmenities = () => {
    setAmenitiesModalOpen(true);
  };
  const handleCloseAmenitiesModal = async () => {
    setAmenitiesModalOpen(false);
    await refreshHotelDetails();
  };
  // ------------------------------------hotel fetch-------------------------------------//
  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!routeHotelId) {
        return;
      }
      try {
        showLoader();
        const hotelData = await refreshHotelDetails();
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
      await axios.patch(`${localUrl}/hotels/update/${resolvedHotelId}`, {
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
      setHotel(normalizeHotel(unwrapHotelResponse(response), routeHotelId));
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

      await axios.patch(`${localUrl}/hotels/update/${resolvedHotelId}`, {
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
      setHotel(normalizeHotel(unwrapHotelResponse(response), routeHotelId));
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
      <Policies hotel={hotel} onUpdated={refreshHotelDetails} />
      <AddFoodModal
        open={isModalOpen}
        onClose={handleCloseModal}
        hotelId={resolvedHotelId}
        onAddFood={handleAddFood}
        onUpdated={refreshHotelDetails}
      />
      <Amenities
        open={isAmenitiesModalOpen}
        onClose={handleCloseAmenitiesModal}
        hotelId={resolvedHotelId}
        onUpdateAmenities={handleAddAmenities}
        onUpdated={refreshHotelDetails}
      />
      <AddRoomModal
        open={isRoomModalOpen}
        onClose={handleCloseRoom}
        hotelId={resolvedHotelId}
        onAddRoom={handleAddRoom}
        onUpdated={refreshHotelDetails}
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
