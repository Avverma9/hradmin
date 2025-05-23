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
  TextField,
} from "@mui/material";
import { CopyAll } from "@mui/icons-material";

import { createUserCoupon, getAllUserCoupons } from "src/components/redux/reducers/userAndPartnerCoupon/coupon";
import { fetchBulkUser } from "src/components/redux/reducers/user";

import CreateCouponModal from "./user-coupon-create-modal";
import UserDetailsModal from "./user-details";
import { useLoader } from "../../../../utils/loader";
import { indianTime } from "../../../../utils/format-time";

export default function UserCoupon() {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const [assignedTo, setAssignedTo] = useState("");
  const [couponName, setCouponName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [validity, setValidity] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterExpired, setFilterExpired] = useState(false);  // New state for filtering expired coupons

  const { userData } = useSelector((state) => state.user);

  const resetCouponForm = () => {
    setCouponName("");
    setDiscountPrice("");
    setAssignedTo("");
    setValidity("");
    setQuantity("");
  };

  const fetchCoupons = useCallback(async () => {
    showLoader();
    try {
      const response = await dispatch(getAllUserCoupons()).unwrap();
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
      assignedTo, // ✅ This must come from props/state correctly
      quantity: Number(quantity),
      validity: adjustedDate.toISOString(),
    };


    showLoader();
    try {
      await dispatch(createUserCoupon(postData)).unwrap();
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

  // Filter coupons based on expired or active status
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesExpired = filterExpired ? coupon.expired : !coupon.expired;

    const assignedToValue = coupon?.assignedTo || "";
    const matchesSearch = assignedToValue
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesExpired && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Button variant="contained" color="primary" onClick={handleOpenCreateCouponModal}>
          Create Coupon
        </Button>

        {/* New Filter Button */}
        <Button
          variant="outlined"
          color={filterExpired ? "error" : "primary"}
          onClick={() => setFilterExpired(!filterExpired)}
        >
          {filterExpired ? "Show Active Coupons" : "Show Expired Coupons"}
        </Button>
        <TextField
          label="Search by Assigned To"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
        assignedTo={assignedTo}           // ✅ Pass this
        setAssignedTo={setAssignedTo}     // ✅ And this
      />

      {filteredCoupons.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Coupon Name</strong></TableCell>
                <TableCell><strong>Coupon Code</strong></TableCell>
                <TableCell><strong>Assigned To</strong></TableCell>
                <TableCell><strong>Discount Price</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Validity</strong></TableCell>
                <TableCell><strong>Expired</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCoupons.map((coupon) => (
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
                  <TableCell>{coupon?.assignedTo}</TableCell>
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
                        Used: {coupon.userIds?.length || 0}
                      </Button>
                      <Typography variant="caption">
                        Remaining: {coupon.quantity - (coupon.userIds?.length || 0)}
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
