/* eslint-disable consistent-return */
import { toast } from "react-toastify";
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  ButtonGroup,
  FormControl,
  TablePagination,
  Box,
  Grid,
  Autocomplete,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  getAllHotels,
  getHotelsByFilters,
  getHotelsCity,
} from "src/components/redux/reducers/hotel";
import { useLoader } from "../../../../utils/loader";
import {
  createCoupon,
  getAllCoupons,
  getCouponAppliedHotels,
} from "src/components/redux/reducers/coupon";
import HotelTable from "./hotel-table";
import { executeBulkAction } from "./bulkUtils";
import CreateCouponModal from "../coupon/create-coupon";
import AvailableCouponsModal from "../coupon/available-coupons";
const Bulk = () => {
  const data = useSelector((state) => state.hotel.data);
  const byCity = useSelector((state) => state.hotel.byCity);
  const byFilter = useSelector((state) => state.hotel.byFilter);
  const applied = useSelector((state) => state.coupon.applied);
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();
  const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false);
  const [couponName, setCouponName] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [validity, setValidity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isAcceptedFilter, setIsAcceptedFilter] = useState(null);
  const [selectedHotels, setSelectedHotels] = useState(new Set());
  const [action, setAction] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [openAvailableCouponsModal, setOpenAvailableCouponsModal] =
    useState(false);

  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getAllHotelsData = async () => {
    try {
      showLoader()
      await dispatch(getAllHotels());
    } catch (error) {
      toast.error("Failed to fetch hotels.");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    getAllHotelsData();
    dispatch(getHotelsCity());
    dispatch(getCouponAppliedHotels());
  }, [dispatch]);

  const getAppliedCouponHotels = async () => {
    try {
      await dispatch(getCouponAppliedHotels());
    } catch (error) {
      toast.error("Failed to fetch hotels with applied coupons.");
    }
  };

  useEffect(() => {
    if (action === "applyCoupon" && selectedHotels.size > 0) {
      const selectedData = data.filter((hotel) =>
        selectedHotels.has(hotel.hotelId),
      );
      const roomTypes = new Set();
      selectedData.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          if (room.type) {
            roomTypes.add(room.type);
          }
        });
      });
      setAvailableRoomTypes(Array.from(roomTypes));
    }

    if (action === "removeCoupon") {
      getAppliedCouponHotels();
    }
  }, [action, selectedHotels, data]);

  useEffect(() => {
    if (data?.length > 0) {
      const allRoomTypes = new Set();
      data.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          if (room.type) {
            allRoomTypes.add(room.type);
          }
        });
      });
      setAvailableRoomTypes(Array.from(allRoomTypes));
    }
  }, [data]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleCityChange = async (event) => {
    try {
      setSelectedCity(event.target.value);
      showLoader()
      await dispatch(getHotelsByFilters(event.target.value));
    } catch (error) {
      console.error("It seems an error", error)
    } finally {
      hideLoader()
    }

  };

  const hotelToShow =
    action === "removeCoupon"
      ? applied // Show only hotels with coupons applied
      : selectedCity !== "All City" && selectedCity
        ? byFilter?.data
        : data;

  const filteredData = hotelToShow?.filter((hotel) => {
    const matchesSearchQuery =
      hotel.hotelOwnerName.toLowerCase().includes(searchQuery) ||
      hotel.hotelName.toLowerCase().includes(searchQuery);

    const matchesAcceptedFilter =
      isAcceptedFilter === null || hotel.isAccepted === isAcceptedFilter;

    const matchesRoomType =
      action !== "applyCoupon" ||
      !selectedRoomType ||
      hotel.rooms?.some((room) => room.type === selectedRoomType);

    return matchesSearchQuery && matchesAcceptedFilter && matchesRoomType;
  });

  const paginatedData = filteredData?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleHotelSelect = (hotelId) => {
    setSelectedHotels((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(hotelId)) {
        newSelection.delete(hotelId);
      } else {
        newSelection.add(hotelId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedHotels.size === paginatedData.length) {
      setSelectedHotels(new Set());
    } else {
      setSelectedHotels(new Set(paginatedData.map((hotel) => hotel.hotelId)));
    }
  };
  const reloadPage = () => {
    window.location.reload();
  };
  const executeAction = async () => {
    await executeBulkAction({
      action,
      selectedHotels,
      data,
      couponCode,
      selectedRoomType,
      dispatch,
      reloadPage,
      showLoader, hideLoader
    });
  };


  useEffect(() => {
    fetchCoupons();
  }, []);
  const fetchCoupons = useCallback(async () => {
    showLoader();
    try {
      const response = await dispatch(getAllCoupons()).unwrap();
      setCoupons(response || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons.");
    } finally {
      hideLoader();
    }
  }, [dispatch, showLoader, hideLoader]);

  const resetCouponForm = () => {
    setCouponName("");
    setDiscountPrice("");
    setValidity("");
  };

  const handleOpenAvailableCouponsModal = async () => {
    await fetchCoupons();
    setOpenAvailableCouponsModal(true);
  };

  const handleCloseAvailableCouponsModal = () => {
    setOpenAvailableCouponsModal(false);
  };

  const handleCloseCreateCouponModal = () => {
    setOpenCreateCouponModal(false);
  };

  const handleOpenCreateCouponModal = () => {
    resetCouponForm();
    setOpenCreateCouponModal(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponName || !discountPrice || !validity) {
      toast.warn("Please fill in all coupon details.");
      return;
    }
    const formattedValidity = new Date(validity).toISOString().split("T")[0];
    const postData = {
      couponName,
      discountPrice: Number(discountPrice),
      validity: formattedValidity,
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
      const errorMessage =
        error?.message || error?.error || "Failed to create coupon";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      hideLoader();
    }
  };

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Coupon code copied to clipboard"),
      () => toast.error("Failed to copy coupon code"),
    );
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Hotel Management
      </Typography>

      {/* Filter & Input Controls */}
      <Box
        mt={2}
        p={2}
        sx={{
          border: '2px dotted #1976d2',
          borderRadius: '8px',
          mb: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              label="Search hotel ..."
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Autocomplete
              options={["All City", ...byCity]}
              value={selectedCity}
              onChange={(event, newValue) => handleCityChange({ target: { value: newValue } })}
              renderInput={(params) => (
                <TextField {...params} label="Filter by city" variant="outlined" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select value={action} onChange={(e) => setAction(e.target.value)} label="Action">
                <MenuItem value="">None</MenuItem>
                <MenuItem value="remove">Remove Hotels</MenuItem>
                <MenuItem value="accept">Accept Hotels</MenuItem>
                <MenuItem value="moveFrom">Move to Front Page</MenuItem>
                <MenuItem value="removeFront">Remove from Front Page</MenuItem>
                <MenuItem value="applyCoupon">Apply Coupon</MenuItem>
                <MenuItem value="removeCoupon">Remove Coupon</MenuItem>
                <MenuItem value="export">Export Selected</MenuItem>
                <MenuItem value="delete">Delete Permanently</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {action === "applyCoupon" && (
            <>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Coupon Code"
                  variant="outlined"
                  fullWidth
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Room Type</InputLabel>
                  <Select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    label="Room Type"
                  >
                    {availableRoomTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box
        mt={2}
        p={2}
        sx={{
          border: '2px dotted #1976d2',
          borderRadius: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ButtonGroup variant="contained" sx={{ flexWrap: 'wrap' }}>
          <Button onClick={executeAction}>
            {action === "export" ? "Export Selected" : "Execute Action"}
          </Button>
          <Button variant="outlined" onClick={handleSelectAll}>
            {selectedHotels?.size === paginatedData?.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </ButtonGroup>

        <ButtonGroup variant="contained" sx={{ flexWrap: 'wrap' }}>
          <Button onClick={() => setIsAcceptedFilter(null)}>All</Button>
          <Button onClick={() => setIsAcceptedFilter(true)}>Accepted</Button>
          <Button onClick={() => setIsAcceptedFilter(false)}>Not Accepted</Button>
          <Button onClick={handleOpenCreateCouponModal}>Create Coupon</Button>
          <Button onClick={handleOpenAvailableCouponsModal}>See Coupons</Button>
        </ButtonGroup>
      </Box>

      {/* Hotel Table */}
      <Box mt={3}>
        <HotelTable
          data={paginatedData}
          selectedHotels={selectedHotels}
          handleHotelSelect={handleHotelSelect}
        />

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
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
      />

      <AvailableCouponsModal
        open={openAvailableCouponsModal}
        handleClose={handleCloseAvailableCouponsModal}
        coupons={coupons}
        copyToClipboard={copyToClipboard}
      />
    </Box>
  );
};

export default Bulk;
