/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaEdit, FaUtensils, FaCalendarAlt } from 'react-icons/fa';

import { styled } from '@mui/system';
import { Box, Link, Card, Stack, Button, Tooltip, IconButton } from '@mui/material';

import Label from 'src/components/label';

import AddFoodModal from '../../add-food-to-hotel'; // Import the AddFoodModal component

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

function ShopProductCard({ product, onAddFood }) {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const viewDetails = (hotelId) => {
    navigate(`/view-hotel-details/${hotelId}`);
  };

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

  const renderImg = (
    <Box
      component="img"
      alt={product?.hotelName}
      src={product?.images?.[0]}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  return (
    <>
      <Card onClick={() => viewDetails(product.hotelId)}>
        <Box sx={{ pt: '100%', position: 'relative' }}>
          {product.price && renderStatus}
          {renderImg}
        </Box>

        <Stack spacing={1} sx={{ p: 3 }}>
          <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
            {product?.hotelName}
          </Link>
          <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
            Owner {product?.hotelOwnerName}
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
                  e.stopPropagation(); // Prevent the card click event from firing
                  handleOpenModal();
                }}
              >
                <FaUtensils size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Amenities">
              <IconButton color="primary" sx={{ width: 32, height: 32 }}>
                <FaBed size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Rooms">
              <IconButton color="primary" sx={{ width: 32, height: 32 }}>
                <FaEdit size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Set Monthly Price">
              <IconButton color="primary" sx={{ width: 32, height: 32 }}>
                <FaCalendarAlt size={20} />
              </IconButton>
            </Tooltip>
          </ActionButtonOverlay>
        </ActionButtonContainer>
      </Card>

      {/* AddFoodModal Component */}
      <AddFoodModal
        open={isModalOpen}
        onClose={handleCloseModal}
        hotelId={product.hotelId}
        onAddFood={handleAddFood} // Pass the function to handle adding food
      />
    </>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAddFood: PropTypes.func.isRequired,
};

export default ShopProductCard;
