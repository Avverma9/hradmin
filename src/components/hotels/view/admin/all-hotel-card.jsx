import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
} from '@mui/material';

// Material-UI Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import DeckIcon from '@mui/icons-material/Deck';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ArticleIcon from '@mui/icons-material/Article';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';

// Local Component Imports
import Label from '../../../stuff/label';
import AddFoodModal from '../../manage-foods';
import Amenities from '../../manage-amenties';
import AddRoomModal from '../../manage-rooms';
import BasicDetails from '../../basic-details';

export default function ShopProductCard({
  product,
  onAddFood,
  onUpdateAmenities,
  onAddRoom,
  onBasicDetails,
}) {
  const navigate = useNavigate();

  // --- State Management ---
  const [openModal, setOpenModal] = useState(null); // e.g., 'food', 'rooms'
  const [anchorEl, setAnchorEl] = useState(null);

  // --- Handlers ---
  const handleViewDetails = () => navigate(`/view-hotel-details/${product.hotelId}`);
  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenModal = (modalName) => {
    setOpenModal(modalName);
    handleCloseMenu();
  };
  const handleCloseModal = () => setOpenModal(null);

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
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}>
        <Box sx={{ position: 'relative' }}>
          <CardActionArea onClick={handleViewDetails}>
            <CardMedia
              component="img"
              height="180"
              image={product?.images?.[0] || '/assets/placeholder.jpg'}
              alt={product?.hotelName}
            />
          </CardActionArea>
          {product?.price && (
            <Label
              variant="filled"
              color="info"
              sx={{ position: 'absolute', zIndex: 9, top: 16, right: 16, textTransform: 'uppercase' }}
            >
              {product.price}
            </Label>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Chip
              label={product?.isAccepted ? "Live" : "Needs Approval"}
              color={product?.isAccepted ? "success" : "warning"}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            {product?.rooms.some((room) => room.isOffer) && (
              <Tooltip title="Special offer available!">
                <Chip label="Offer" color="primary" size="small" />
              </Tooltip>
            )}
          </Stack>
          
          <Typography variant="h6" component="div" noWrap sx={{ mb: 1 }}>
            {product?.hotelName}
          </Typography>

          <Stack spacing={1} color="text.secondary">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">{product?.hotelOwnerName}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">{product?.city}</Typography>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
          <Button size="small" variant="text" onClick={handleViewDetails}>
            View Details
          </Button>
          <Tooltip title="Manage Hotel">
            <IconButton
              aria-label="settings"
              onClick={handleOpenMenu}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* --- Management Menu --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()}
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

      {/* --- Modals --- */}
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