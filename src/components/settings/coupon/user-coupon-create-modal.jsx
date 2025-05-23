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
  Autocomplete,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchUsers, findUser } from "src/components/redux/reducers/user";

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
  assignedTo,
  setAssignedTo,
}) => {
  const dispatch = useDispatch();

  // Fetch all users
  const allUsers = useSelector((state) =>
    Array.isArray(state.user.userData) ? state.user.userData : []
  );

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());

      if (!validity) {
        const now = new Date();
        const localISOTime = new Date(
          now.getTime() - now.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);
        setValidity(localISOTime);
      }

      if (!quantity) {
        setQuantity("1");
      }
    }
  }, [open]);

  const handleUserSelect = (event, newValue) => {
    if (typeof newValue === "string") {
      setAssignedTo(newValue); // Assume user typed raw email
    } else if (newValue && typeof newValue === "object" && newValue.email) {
      setAssignedTo(newValue.email); // ✅ Set only email, not label
    } else {
      setAssignedTo(""); // fallback
    }
  };



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
            {/* Assigned To (Autocomplete) */}
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={allUsers}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : `${option.userName || "Unknown"} (${option.email})`
                }
                filterOptions={(options, state) =>
                  options.filter((user) =>
                    user.email.toLowerCase().includes(state.inputValue.toLowerCase())
                  )
                }
                inputValue={assignedTo}
                onInputChange={(event, newInputValue) => {
                  // Do nothing here to avoid setting full label
                  // We'll handle this via onChange only
                }}
                onChange={(event, newValue) => {
                  if (typeof newValue === "string") {
                    setAssignedTo(newValue); // user typed email
                  } else if (newValue && newValue.email) {
                    setAssignedTo(newValue.email); // ✅ only email
                  } else {
                    setAssignedTo("");
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned To"
                    placeholder="Enter email"
                    size="small"
                    fullWidth
                    required
                  />
                )}
              />

            </Grid>

            {/* Coupon Name */}
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

            {/* Discount Price */}
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

            {/* Validity */}
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

            {/* Quantity */}
            <Grid item xs={12}>
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
          </Grid>

          {/* Buttons */}
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
  assignedTo: PropTypes.string.isRequired,
  setAssignedTo: PropTypes.func.isRequired,
};

export default CreateCouponModal;
