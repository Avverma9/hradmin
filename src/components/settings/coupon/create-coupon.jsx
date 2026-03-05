import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
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
  validity,
  setValidity,
  couponType = "hotel",
  setCouponType = () => {},
  quantity = "1",
  setQuantity = () => {},
  showTypeSelector = false,
  showQuantityField = false,
}) => {
  useEffect(() => {
    if (open && !validity) {
      const now = new Date();
      const localISOTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      setValidity(localISOTime);
    }

    if (open && showQuantityField && !quantity) {
      setQuantity("1");
    }
  }, [open, validity, setValidity, showQuantityField, quantity, setQuantity]);

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

            {showTypeSelector && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="coupon-type-label">Coupon Type</InputLabel>
                  <Select
                    labelId="coupon-type-label"
                    value={couponType}
                    label="Coupon Type"
                    onChange={(e) => setCouponType(e.target.value)}
                  >
                    <MenuItem value="hotel">Hotel</MenuItem>
                    <MenuItem value="partner">Partner</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {showQuantityField && (
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </Grid>
            )}

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
          </Grid>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
          >
            <Button
              type="submit"
              variant="contained"
              size="small"
              color="primary"
            >
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
  validity: PropTypes.string.isRequired,
  setValidity: PropTypes.func.isRequired,
  couponType: PropTypes.string,
  setCouponType: PropTypes.func,
  quantity: PropTypes.string,
  setQuantity: PropTypes.func,
  showTypeSelector: PropTypes.bool,
  showQuantityField: PropTypes.bool,
};

export default CreateCouponModal;
