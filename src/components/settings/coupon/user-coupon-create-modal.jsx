import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
} from "@mui/material";

const CreateCouponModal = ({
  open,
  handleClose,
  handleCreateCoupon,
  couponName,
  setCouponName,
  discountPrice,
  setDiscountPrice,
  quantity,
  setQuantity,
  validity,
  setValidity,
}) => {
  useEffect(() => {
    if (open && !validity) {
      const now = new Date();
      const localISOTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16); // format to 'YYYY-MM-DDTHH:mm'
      setValidity(localISOTime);
    }
  }, [open, validity, setValidity]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1, fontWeight: 600, fontSize: 18 }}>
        Create a New Coupon
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box
          component="form"
          onSubmit={handleCreateCoupon}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Coupon Name"
                value={couponName}
                onChange={(e) => setCouponName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                label="Discount Price"
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Validity (Date & Time)"
                type="datetime-local"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
            <Button type="submit" variant="contained" size="small" color="primary">
              Create
            </Button>
            <Button
              onClick={handleClose}
              variant="outlined"
              size="small"
              color="secondary"
            >
              Cancel
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
  handleCreateCoupon: PropTypes.func.isRequired,
  couponName: PropTypes.string.isRequired,
  setCouponName: PropTypes.func.isRequired,
  discountPrice: PropTypes.string.isRequired,
  setDiscountPrice: PropTypes.func.isRequired,
  quantity: PropTypes.string.isRequired,
  setQuantity: PropTypes.func.isRequired,
  validity: PropTypes.string.isRequired,
  setValidity: PropTypes.func.isRequired,
};

export default CreateCouponModal;
