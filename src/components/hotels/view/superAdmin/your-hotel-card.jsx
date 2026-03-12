/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Material-UI Imports
import {
  Box,
  Card,
  Stack,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CardActionArea,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

// Material-UI Icons
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import DeckIcon from "@mui/icons-material/Deck";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ArticleIcon from "@mui/icons-material/Article";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from "@mui/icons-material/Person";

// Local Component Imports
import Label from "../../../stuff/label";
import AddFoodModal from "../../manage-foods";
import Amenities from "../../manage-amenties";
import AddRoomModal from "../../manage-rooms";
import BasicDetails from "../../basic-details";


export default function ShopProductCard({
  product,
  onAddFood,
  onUpdateAmenities,
  onAddRoom,
  onBasicDetails,
}) {
  const navigate = useNavigate();

  // --- Simplified State Management ---
  const [openModal, setOpenModal] = useState(null); // Tracks which modal is open, e.g., 'food', 'rooms'
  const [anchorEl, setAnchorEl] = useState(null); // For the action menu's position

  // --- Event Handlers ---
  const handleViewDetails = () => {
    navigate(`/view-hotel-details/${product.hotelId}`);
  };

  const handleOpenMenu = (event) => {
    event.stopPropagation(); // Prevent card navigation
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = (modalName) => {
    setOpenModal(modalName);
    handleCloseMenu();
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  // --- Submission Handlers ---
  const handleAddFood = (foodData) => {
    onAddFood(product.hotelId, foodData);
    handleCloseModal();
  };

  const handleUpdateAmenities = (amenitiesData) => {
    onUpdateAmenities(product.hotelId, amenitiesData);
    handleCloseModal();
  };

  const handleAddRoom = (roomData) => {
    onAddRoom(product.hotelId, roomData);
    handleCloseModal();
  };

  const handleBasicDetails = (basicData) => {
    onBasicDetails(product.hotelId, basicData);
    handleCloseModal();
  };

  return (
    <>
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 410,
        overflow: 'hidden',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
        },
      }}>
        <Box sx={{ position: 'relative' }}>
          {/* Main clickable area for navigation */}
          <CardActionArea onClick={handleViewDetails} sx={{ display: 'block' }}>
            <Box sx={{ height: 220, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={product?.images?.[0] || '/assets/placeholder.jpg'} // Fallback image
              alt={product?.hotelName}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            </Box>
          </CardActionArea>

          {/* Price Label */}
          {product?.price && (
            <Label
              variant="filled"
              color="info"
              sx={{ position: 'absolute', zIndex: 9, top: 16, right: 16 }}
            >
              {product.price}
            </Label>
          )}
        </Box>

        <CardContent sx={{ p: 2, pb: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            {/* Status Chip */}
            <Chip
              label={product?.isAccepted ? "Live" : "Needs Approval"}
              color={product?.isAccepted ? "success" : "warning"}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            {/* Offer Chip */}
            {product?.rooms.some((room) => room.isOffer) && (
              <Tooltip title="Special offer available!">
                <Chip label="Offer" color="primary" size="small" />
              </Tooltip>
            )}
          </Stack>
          
          <Typography variant="h6" component="div" noWrap sx={{ mb: 1, fontWeight: 'bold' }}>
            {product?.hotelName}
          </Typography>

          <Stack spacing={1} color="text.secondary">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2" noWrap>
                {product?.hotelOwnerName}
              </Typography>
            </Stack>
             <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2" noWrap>
                {product?.city}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions
          sx={{
            justifyContent: 'space-between',
            px: 2,
            py: 1.25,
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Button size="small" variant="text" onClick={handleViewDetails}>
            View Details
          </Button>
          <Tooltip title="Manage Hotel">
            <IconButton
              aria-label="management-settings"
              onClick={handleOpenMenu}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Management Menu controlled by the IconButton */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()} // Prevent background clicks
      >
        <MenuItem onClick={() => handleOpenModal('details')}>
          <ListItemIcon><ArticleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Basic Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenModal('rooms')}>
          <ListItemIcon><MeetingRoomIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Manage Rooms</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenModal('food')}>
          <ListItemIcon><RestaurantMenuIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Manage Food</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenModal('amenities')}>
          <ListItemIcon><DeckIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Manage Amenities</ListItemText>
        </MenuItem>
      </Menu>

      {/* All Modals controlled by the single state variable */}
      <BasicDetails
        open={openModal === 'details'}
        onClose={handleCloseModal}
        hotelId={product.hotelId}
        onBasicDetails={handleBasicDetails}
      />
      <AddRoomModal
        open={openModal === 'rooms'}
        onClose={handleCloseModal}
        hotelId={product.hotelId}
        onAddRoom={handleAddRoom}
      />
      <AddFoodModal
        open={openModal === 'food'}
        onClose={handleCloseModal}
        hotelId={product.hotelId}
        onAddFood={handleAddFood}
      />
      <Amenities
        open={openModal === 'amenities'}
        onClose={handleCloseModal}
        hotelId={product.hotelId}
        onUpdateAmenities={handleUpdateAmenities}
      />
    </>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAddFood: PropTypes.func.isRequired,
  onAddRoom: PropTypes.func.isRequired,
  onUpdateAmenities: PropTypes.func.isRequired,
  onBasicDetails: PropTypes.func.isRequired,
};
