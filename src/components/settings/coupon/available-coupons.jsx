import React from 'react';
import PropTypes from 'prop-types';
import { BsCopy } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';

import {
  Table,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { fDateTime } from '../../../../utils/format-time';

const AvailableCouponsModal = ({ open, handleClose, coupons, copyToClipboard }) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
    <DialogTitle>
      Available Coupons
      <IconButton
        edge="end"
        color="inherit"
        onClick={handleClose}
        aria-label="close"
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <IoMdClose />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      {coupons?.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Coupon Name</TableCell>
              <TableCell>Discount Price</TableCell>
              <TableCell>Validity</TableCell>
              <TableCell>Coupon Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon._id}>
                <TableCell>{coupon.couponName}</TableCell>
                <TableCell>{coupon.discountPrice}</TableCell>
                <TableCell>{fDateTime(coupon.validity)}</TableCell>
                <TableCell>{coupon.couponCode}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => copyToClipboard(coupon.couponCode)}>
                    <BsCopy />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>No coupons available</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

AvailableCouponsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  coupons: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      couponName: PropTypes.string.isRequired,
      discountPrice: PropTypes.number.isRequired,
      validity: PropTypes.string.isRequired,
      couponCode: PropTypes.string.isRequired,
    })
  ).isRequired,
  copyToClipboard: PropTypes.func.isRequired,
};

export default AvailableCouponsModal;
