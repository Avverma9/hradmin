/* eslint-disable no-restricted-syntax */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import { Box, Modal, Button, Typography, IconButton, CircularProgress } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';

import { localUrl } from 'src/utils/util';

const ImageUpload = ({ open, hotelId, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [id, setId] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
        setImages(response.data.images || []);
        setId(response.data._id);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [hotelId]);

  const handleDelete = async (imageUrl) => {
    try {
      await axios.delete(`${localUrl}/hotels/${hotelId}/images/imageUrl?imageUrl=${imageUrl}`);
      toast.success('Image deleted successfully');
      setImages(images.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleFileChange = (event) => {
    setImageFiles(event.target.files);
  };

  const handleUploadImages = async () => {
    if (imageFiles.length === 0) return;

    const formData = new FormData();
    for (const file of imageFiles) {
      formData.append('images', file);
    }

    setUploading(true);
    try {
      await axios.patch(`${localUrl}/update-hotels-image-by-hotel-id/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Images uploaded successfully');
      setImageFiles([]);
      const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`);
      setImages(response.data.images || []);
      setImageFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="image-upload-modal"
      aria-describedby="modal-to-upload-and-manage-images"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', // Adjusted width to be more flexible
          maxWidth: 600, // Maximum width for large screens
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2, // Reduced padding for smaller screens
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'auto',
          '@media (min-width:600px)': {
            // Medium screens and up
            width: '80%',
          },
          '@media (min-width:900px)': {
            // Large screens and up
            width: '60%',
          },
        }}
      >
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="image-upload-modal" variant="h6" component="h2" gutterBottom>
          Upload Images
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1, // Adjusted gap for smaller screens
                mb: 2,
                justifyContent: 'center',
              }}
            >
              {images.length === 0 ? (
                <Typography>No images found.</Typography>
              ) : (
                images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative', width: 120, height: 120, mb: 1 }}>
                    <img
                      src={image}
                      alt={`Uploaded thumbnail ${index}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                    />
                    <IconButton
                      onClick={() => handleDelete(image)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ marginBottom: '16px', width: '100%' }} // Full width for input
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={uploading ? <CircularProgress size={24} /> : <AddIcon />}
                onClick={handleUploadImages}
                disabled={uploading}
                sx={{
                  width: '100%', // Full width for button
                  maxWidth: 200, // Maximum width for button
                }}
              >
                {uploading ? 'Uploading...' : 'Add More Images'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

ImageUpload.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotelId: PropTypes.string.isRequired,
};

export default ImageUpload;
