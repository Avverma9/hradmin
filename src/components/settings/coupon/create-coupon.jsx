import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createCoupon } from 'src/components/redux/reducers/coupon';

// Function to get the current date in the proper format for `datetime-local` input
const getMinDateTime = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to 00:00 midnight in the local time zone

  // Format it for `datetime-local` input: YYYY-MM-DDTHH:MM
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
  const date = String(now.getDate()).padStart(2, '0'); // Ensure two digits for date
  const hours = String(now.getHours()).padStart(2, '0'); // Ensure two digits for hours
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Ensure two digits for minutes

  // Return the formatted date and time
  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

const CreateCouponModal = ({
  open,
  handleClose,
  fetchCoupons,
  showLoader,
  hideLoader,
}) => {
  const dispatch = useDispatch();

  const [couponName, setCouponName] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [validity, setValidity] = useState(getMinDateTime());

  const resetCouponForm = () => {
    setCouponName('');
    setDiscountPrice('');
    setValidity(getMinDateTime());
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!couponName || !discountPrice || !validity) {
      toast.warn("Please fill in all coupon details.");
      return;
    }

    const formattedValidity = new Date(validity).toISOString();

    const postData = {
      couponName,
      discountPrice: Number(discountPrice),
      validity: formattedValidity,
    };

    showLoader();

    try {
      await dispatch(createCoupon(postData)).unwrap();
      toast.success("Coupon created successfully!");
      handleClose();
      resetCouponForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      const errorMessage = error?.message || error?.error || "Failed to create coupon";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', paddingBottom: '8px' }}>
        Create a New Coupon
      </DialogTitle>
      <DialogContent sx={{ padding: '12px' }}>
        <Box component="form" onSubmit={handleCreateCoupon}>
          <Grid container spacing={2} sx={{ marginTop: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coupon Name"
                value={couponName}
                onChange={(e) => setCouponName(e.target.value)}
                required
                variant="outlined"
                size="small"
                sx={{ marginBottom: '12px', backgroundColor: '#f5f5f5' }}
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
                size="small"
                sx={{ marginBottom: '12px', backgroundColor: '#f5f5f5' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Validity"
                type="datetime-local"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                inputProps={{
                  min: getMinDateTime(), // Disable previous days (set to today's date at 00:00)
                }}
                sx={{ marginBottom: '12px', backgroundColor: '#f5f5f5' }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ padding: '6px 12px', textTransform: 'none', fontSize: '0.875rem' }}
            >
              Create Coupon
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              size="small"
              sx={{ padding: '6px 12px', textTransform: 'none', fontSize: '0.875rem' }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

CreateCouponModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  fetchCoupons: PropTypes.func.isRequired,
  showLoader: PropTypes.func.isRequired,
  hideLoader: PropTypes.func.isRequired,
};

export default CreateCouponModal;
