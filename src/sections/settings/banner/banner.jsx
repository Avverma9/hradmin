/* eslint-disable arrow-body-style */
import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Button, Container, Typography } from '@mui/material';

import { localUrl } from 'src/utils/util';

import AddBannerModal from './add-modal'; // Import the modal component


export default function Banner() {
  const [banner, setBanner] = useState([]);
  const [openModal, setOpenModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    getBanner();
  }, []);

  const getBanner = async () => {
    try {
      const response = await axios.get(`${localUrl}/get/second/carousel`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setBanner(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Active Banners
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenModal}
        style={{ marginBottom: '16px' }}
      >
        Add New Banner
      </Button>
      <AddBannerModal open={openModal} handleClose={handleCloseModal} fetchBanners={getBanner} />
      {banner.map((item) => (
        <div key={item._id} className="mb-5">
          <Typography variant="body1">{item.description}</Typography>
          <div className="row">
            {item.images.map((image, idx) => (
              <div key={idx} className="col-md-4">
                <img
                  src={image}
                  alt={`Banner ${idx + 1}`}
                  className="img-fluid img-thumbnail mb-3"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Container>
  );
}
