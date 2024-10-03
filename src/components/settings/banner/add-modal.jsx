import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState } from 'react';

import { Box, Modal, Stack, Button, TextField, Typography } from '@mui/material';

import { localUrl } from '../../../../utils/util';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const AddBannerModal = ({ open, handleClose, fetchBanners }) => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

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
        fetchBanners(); // Refresh banners list
        handleClose(); // Close modal
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} centered>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Add New Banner
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            autoComplete="description"
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="file"
            multiple
            onChange={(e) => setImages([...e.target.files])}
            required
            style={{ marginTop: '16px', marginBottom: '16px' }}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleClose} variant="outlined">
              Close
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Stack>
        </form>
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
