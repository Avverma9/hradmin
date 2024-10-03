import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiBathtubThin } from 'react-icons/pi';
import { IoFastFoodSharp } from 'react-icons/io5';
import { FaPersonCircleCheck } from 'react-icons/fa6';
import { FcHome, FcViewDetails } from 'react-icons/fc';
import { styled } from '@mui/system';
import { Box, Link, Card, Stack, Button, Tooltip, IconButton } from '@mui/material';

import Label from '../../../stuff/label';
import AddFoodModal from '../../manage-foods';
import Amenities from '../../manage-amenties';
import AddRoomModal from '../../manage-rooms';
import BasicDetails from '../../basic-details';

// Styled component for the action button container
const ActionButtonContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 48,
  marginTop: theme.spacing(2),
  '&:hover .action-buttons': {
    opacity: 1,
  },
}));

// Styled component for the action buttons
const ActionButtonOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  boxShadow: theme.shadows[4],
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  zIndex: 10,
}));

// Styled component for the card
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Ensure all cards take the full height
  width: 300, // Set a fixed width for all cards
  margin: theme.spacing(2), // Add margin for spacing between cards
}));

// Styled component for the image
const StyledImage = styled(Box)(({ theme }) => ({
  top: 0,
  width: '100%',
  height: 200, // Fixed height for uniformity
  objectFit: 'cover',
  position: 'relative',
}));

function ShopProductCard({ product, onAddFood, onUpdateAmenities, onAddRoom, onBasicDetails }) {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAmenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [isBasicDetailModalOpen, setBasicDetailsOpen] = useState(false);
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);

  const viewDetails = (hotelId) => {
    navigate(`/view-hotel-details/${hotelId}`);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleOpenRoom = () => setRoomModalOpen(true);
  const handleOpenAmenities = () => setAmenitiesModalOpen(true);
  const handleBasicDetailsOpen = () => setBasicDetailsOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleCloseRoom = () => setRoomModalOpen(false);
  const handleCloseAmenitiesModal = () => setAmenitiesModalOpen(false);
  const handleBasicDetailsClose = () => setBasicDetailsOpen(false);

  const handleAddFood = (foodData) => {
    onAddFood(product.hotelId, foodData);
    handleCloseModal();
  };

  const handleAddAmenities = (amenitiesData) => {
    onUpdateAmenities(product.hotelId, amenitiesData);
    handleCloseAmenitiesModal();
  };

  const basicDetails = (basicData) => {
    onBasicDetails(product.hotelId, basicData);
    handleBasicDetailsClose();
  };

  const handleAddRoom = (roomData) => {
    onAddRoom(product.hotelId, roomData);
    handleCloseModal();
  };

  const renderStatus = (
    <Label
      variant="filled"
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product?.price}
    </Label>
  );

  return (
    <>
      <StyledCard onClick={() => viewDetails(product.hotelId)}>
        <StyledImage component="img" alt={product?.hotelName} src={product?.images?.[0]} />
        {product.price && renderStatus}

        <Stack spacing={1} sx={{ p: 3, flexGrow: 1 }}>
          <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
            <FcHome /> {product?.hotelName}
          </Link>
          <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
            <FaPersonCircleCheck /> Owner - {product?.hotelOwnerName}
          </Link>
          <Button variant="outlined" color={product?.isAccepted ? 'success' : 'warning'} noWrap>
            {product?.isAccepted === true ? 'Live' : 'Needs approval'}
          </Button>
        </Stack>

        <ActionButtonContainer>
          <ActionButtonOverlay className="action-buttons">
            <Tooltip title="Add Food">
              <IconButton
                color="primary"
                sx={{ width: 32, height: 32 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal();
                }}
              >
                <IoFastFoodSharp size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Amenities">
              <IconButton
                color="primary"
                sx={{ width: 32, height: 32 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAmenities();
                }}
              >
                <PiBathtubThin size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Rooms">
              <IconButton
                color="primary"
                sx={{ width: 32, height: 32 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenRoom();
                }}
              >
                <FcHome size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Basic Details">
              <IconButton
                color="primary"
                sx={{ width: 32, height: 32 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBasicDetailsOpen();
                }}
              >
                <FcViewDetails size={20} />
              </IconButton>
            </Tooltip>
          </ActionButtonOverlay>
        </ActionButtonContainer>
      </StyledCard>

      {/* Modals */}
      <AddFoodModal
        open={isModalOpen}
        onClose={handleCloseModal}
        hotelId={product.hotelId}
        onAddFood={handleAddFood}
      />
      <Amenities
        open={isAmenitiesModalOpen}
        onClose={handleCloseAmenitiesModal}
        hotelId={product.hotelId}
        onUpdateAmenities={handleAddAmenities}
      />
      <AddRoomModal
        open={isRoomModalOpen}
        onClose={handleCloseRoom}
        hotelId={product.hotelId}
        onAddRoom={handleAddRoom}
      />
      <BasicDetails
        open={isBasicDetailModalOpen}
        onClose={handleBasicDetailsClose}
        hotelId={product.hotelId}
        onBasicDetails={basicDetails}
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

export default ShopProductCard;
