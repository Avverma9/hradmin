/* eslint-disable arrow-body-style */
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';

// Import slick-carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Material-UI Components
import {
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';

// Material-UI Icons
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

// Local Imports
import { localUrl } from '../../../../utils/util';
import AddBannerModal from './add-modal';

// --- Carousel Settings ---
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
};

// --- Main Component ---
export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // State for delete confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);

  const getBanners = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${localUrl}/get/second/carousel`);
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      toast.error('Failed to fetch banners. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBanners();
  }, []);

  // --- Delete Logic with Confirmation ---
  const handleDeleteClick = (id) => {
    setSelectedBannerId(id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBannerId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBannerId) return;
    try {
      const response = await axios.delete(`${localUrl}/delete/second-carousel-data/${selectedBannerId}`);
      if (response.status === 200) {
        toast.success('Banner removed successfully');
        setBanners((prevBanners) => prevBanners.filter((b) => b._id !== selectedBannerId));
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
      toast.error("Deletion failed! It seems there was an error.");
    } finally {
      handleCloseDialog();
    }
  };

  // --- Modal Handlers ---
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // --- Render Functions ---
  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={50} />
        <Typography variant="h6">Loading Banners...</Typography>
      </Stack>
    </Box>
  );

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', mt: 10, p: 2 }}>
      <InfoIcon sx={{ fontSize: 60, color: 'grey.400' }} />
      <Typography variant="h5" component="p" sx={{ mt: 2, color: 'grey.600' }}>
        No Banners Found
      </Typography>
      <Typography sx={{ mt: 1, color: 'grey.500' }}>
        Click the "Add New Banner" button to get started.
      </Typography>
    </Box>
  );

  const renderBanners = () => (
    <Stack spacing={4}>
      {banners.map((banner) => (
        <Card key={banner._id} sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Slider {...sliderSettings}>
            {banner.images.map((image, idx) => (
              <Box key={idx} sx={{ height: 'auto', overflow: 'hidden' }}>
                <img
                  src={image}
                  alt={`Banner ${idx + 1}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            ))}
          </Slider>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {banner.description || 'No description available.'}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 1, pt: 0 }}>
            <IconButton aria-label="delete" color="error" onClick={() => handleDeleteClick(banner._id)}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', p: { xs: 2, sm: 4 } }}>
      <Container sx={{ maxWidth: '700px !important' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Banner Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={handleOpenModal}
            sx={{ borderRadius: 2, boxShadow: 3, '&:hover': { boxShadow: 6 } }}
          >
            Add New Banner
          </Button>
        </Stack>

        <AddBannerModal open={openModal} handleClose={handleCloseModal} fetchBanners={getBanners} />

        {isLoading ? renderLoading() : banners.length > 0 ? renderBanners() : renderEmptyState()}

        {/* --- Delete Confirmation Dialog --- */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this banner? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}