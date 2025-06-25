import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState } from 'react';

import {
  Box,
  Modal,
  Stack,
  Button,
  TextField,
  Typography,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { localUrl } from '../../../../utils/util';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AddBannerModal = ({ open, handleClose, fetchBanners }) => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Generate image previews when images change
  React.useEffect(() => {
    if (images.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup URL objects when component unmounts or images change
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    formData.append('description', description);

    try {
      const response = await axios.post(`${localUrl}/create/second/carousel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 201) {
        toast.success('Added successfully');
        fetchBanners();
        handleClose();
        setDescription('');
        setImages([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="add-banner-modal-title" closeAfterTransition>
      <Box sx={style} component="form" onSubmit={handleSubmit} noValidate>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography id="add-banner-modal-title" variant="h6" component="h2">
            Add New Banner
          </Typography>
          <IconButton onClick={handleClose} size="small" aria-label="close modal">
            <CloseIcon />
          </IconButton>
        </Stack>

        <TextField
          label="Description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          required
          multiline
          minRows={2}
          sx={{ mb: 3 }}
        />

        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mb: 2 }}
        >
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
            required={images.length === 0}
          />
        </Button>

        {/* Preview thumbnails */}
        {previewUrls.length > 0 && (
          <Grid container spacing={1} mb={2}>
            {previewUrls.map((url, index) => (
              <Grid item key={index} xs={4} sm={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: 80,
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1,
                  }}
                  aria-label={`preview image ${index + 1}`}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={!description || images.length === 0}>
            Submit
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

AddBannerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  fetchBanners: PropTypes.func.isRequired,
};

export default AddBannerModal;
