import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

const CouponCodeModal = ({
  open,
  handleClose,
  couponCode,
  setCouponCode,
  handleApplyCouponToRoom,
}) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
    <DialogTitle>Enter Coupon Code</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Coupon Code"
        type="text"
        fullWidth
        variant="outlined"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Cancel
      </Button>
      <Button onClick={handleApplyCouponToRoom} color="secondary">
        Apply
      </Button>
    </DialogActions>
  </Dialog>
);

CouponCodeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  couponCode: PropTypes.string.isRequired,
  setCouponCode: PropTypes.func.isRequired,
  handleApplyCouponToRoom: PropTypes.func.isRequired,
};

export default CouponCodeModal;
