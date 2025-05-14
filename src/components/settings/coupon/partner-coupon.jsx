import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { CopyAll } from "@mui/icons-material";

import { createCoupon, getAllCoupons } from "src/components/redux/reducers/userAndPartnerCoupon/coupon";
import { fetchBulkUser } from "src/components/redux/reducers/user";

import CreateCouponModal from "./user-coupon-create-modal";
import UserDetailsModal from "./user-details";
import { useLoader } from "../../../../utils/loader";
import { indianTime } from "../../../../utils/format-time";

export default function UserCoupon() {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const [couponName, setCouponName] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [validity, setValidity] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const { userData } = useSelector((state) => state.user);

  const resetCouponForm = () => {
    setCouponName("");
    setDiscountPrice("");
    setValidity("");
    setQuantity("");
  };

  const fetchCoupons = useCallback(async () => {
    showLoader();
    try {
      const response = await dispatch(getAllCoupons()).unwrap();
      setCoupons(response || []);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons.");
    } finally {
      hideLoader();
    }
  }, [dispatch, showLoader, hideLoader]);

  useEffect(() => {
    if (!hasFetched) {
      fetchCoupons();
    }
  }, [fetchCoupons, hasFetched]);

  const handleOpenCreateCouponModal = () => {
    resetCouponForm();
    setOpenCreateCouponModal(true);
  };

  const handleCloseCreateCouponModal = () => {
    setOpenCreateCouponModal(false);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!couponName || !discountPrice || !validity || !quantity) {
      toast.warn("Please fill in all coupon details.");
      return;
    }

    const originalDate = new Date(validity);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const adjustedDate = new Date(originalDate.getTime() + istOffset);

    const postData = {
      couponName,
      discountPrice: Number(discountPrice),
      quantity: Number(quantity),
      validity: adjustedDate.toISOString(),
    };

    showLoader();
    try {
      await dispatch(createCoupon(postData)).unwrap();
      toast.success("Coupon created successfully!");
      handleCloseCreateCouponModal();
      resetCouponForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(error?.message || "Failed to create coupon");
    } finally {
      hideLoader();
    }
  };

  const copyCouponCode = (couponCode) => {
    navigator.clipboard.writeText(couponCode).then(
      () => toast.success("Coupon code copied to clipboard!"),
      (err) => {
        toast.error("Failed to copy coupon code.");
        console.error("Error copying coupon code:", err);
      }
    );
  };

  const handleShowUserModal = async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      const resultAction = await dispatch(fetchBulkUser(userIds));
      const response = resultAction.payload;

      if (response?.users?.length > 0) {
        setShowUserModal(true);
      } else {
        toast.warn("No user details found.");
      }
    } catch (error) {
      toast.error("Failed to fetch user details.");
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenCreateCouponModal}>
          Create Coupon
        </Button>
      </Box>

      <CreateCouponModal
        open={openCreateCouponModal}
        handleClose={handleCloseCreateCouponModal}
        handleCreateCoupon={handleCreateCoupon}
        couponName={couponName}
        setCouponName={setCouponName}
        discountPrice={discountPrice}
        setDiscountPrice={setDiscountPrice}
        validity={validity}
        setValidity={setValidity}
        quantity={quantity}
        setQuantity={setQuantity}
      />

      {coupons.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Coupon Name</strong></TableCell>
                <TableCell><strong>Coupon Code</strong></TableCell>
                <TableCell><strong>Discount Price</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Validity</strong></TableCell>
                <TableCell><strong>Expired</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>{coupon.couponName}</TableCell>
                  <TableCell>
                    {coupon.couponCode}
                    <IconButton
                      size="small"
                      onClick={() => copyCouponCode(coupon.couponCode)}
                      sx={{ ml: 1 }}
                    >
                      <CopyAll fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>₹{coupon.discountPrice}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleShowUserModal(coupon.userIds)}
                        disabled={!coupon.userIds || coupon.userIds.length === 0}
                        sx={{ textTransform: "none", p: 0, width: "fit-content" }}
                      >
                        UsedBy: {coupon.userIds?.length || 0}
                      </Button>
                      <Typography variant="caption">
                        Remaining: {coupon.quantity - (coupon.roomId?.length || 0)}
                      </Typography>
                      <Typography variant="caption">
                        Total Coupon: {coupon.quantity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{indianTime(coupon.validity)}</TableCell>
                  <TableCell>{coupon.expired ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No coupons available</Typography>
      )}

      <UserDetailsModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        userData={userData}
      />
    </Box>
  );
}
