/* eslint-disable no-nested-ternary */
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import {
  Table,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { localUrl } from '../../../../utils/util';
import { fDateTime, indianTime } from '../../../../utils/format-time';

const AppliedCouponModal = ({ open, handleClose }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null); // Track which coupon is being removed
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`${localUrl}/coupon/get/by-type`, {
          params: { type: 'hotel', status: 'active' },
        });
        setCoupons(response?.data?.data || response?.data || []);
      } catch (err) {
        try {
          const fallback = await axios.get(`${localUrl}/valid-coupons`);
          setCoupons(fallback?.data || []);
        } catch {
          setError('Failed to fetch coupons');
        }
      } finally {
        setLoading(false); // End loading
      }
    };

    if (open) {
      fetchCoupons();
    }
  }, [open]);

  const removeCoupon = async (roomId) => {
    setRemovingId(roomId); // Set the ID of the coupon being removed
    try {
      await axios.patch(`${localUrl}/remove/coupon/before-time-from-hotel`, { roomId });
      // Fetch coupons again to refresh the list
      const response = await axios.get(`${localUrl}/coupon/get/by-type`, {
        params: { type: 'hotel', status: 'active' },
      });
      setCoupons(response?.data?.data || response?.data || []);
      toast.success('Removed coupons');
      setError(null);
    } catch (err) {
      setError('Failed to remove coupon');
    } finally {
      setRemovingId(null); // Clear the removing state
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Applied Coupons</DialogTitle>
      <DialogContent>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100px',
            }}
          >
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : coupons.length === 0 ? (
          <Typography>No coupons applied yet.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Coupon Code</TableCell>
                <TableCell>Discount Price</TableCell>
                <TableCell>Validity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon, index) => (
                <TableRow key={`${coupon.id}-${index}`}>
                  <TableCell>{coupon.couponCode}</TableCell>
                  <TableCell>{coupon.discountPrice}</TableCell>
                  <TableCell>{indianTime(coupon.validity)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => removeCoupon(coupon.roomId)}
                      disabled={removingId === coupon.roomId}
                    >
                      {removingId === coupon.roomId ? 'Removing...' : 'Remove'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AppliedCouponModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default AppliedCouponModal;
