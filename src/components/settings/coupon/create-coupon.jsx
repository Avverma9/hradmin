import React from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Grid,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

const CreateCouponModal = ({
  open,
  handleClose,
  handleCreateCoupon,
  couponName,
  setCouponName,
  discountPrice,
  setDiscountPrice,
  validity,
  setValidity,
}) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
    <DialogTitle>Create a New Coupon</DialogTitle>
    <DialogContent>
      <Box component="form" onSubmit={handleCreateCoupon} sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Coupon Name"
              value={couponName}
              onChange={(e) => setCouponName(e.target.value)}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Discount Price"
              type="number"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Validity"
              type="date"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Create Coupon
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </DialogContent>
  </Dialog>
);

CreateCouponModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleCreateCoupon: PropTypes.func.isRequired,
  couponName: PropTypes.string.isRequired,
  setCouponName: PropTypes.func.isRequired,
  discountPrice: PropTypes.string.isRequired,
  setDiscountPrice: PropTypes.func.isRequired,
  validity: PropTypes.string.isRequired,
  setValidity: PropTypes.func.isRequired,
};

export default CreateCouponModal;
