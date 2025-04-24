import { toast } from "react-toastify";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Table,
  Paper,
  Button,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  TextField,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import {
  getAllHotels,
  getHotelsByFilters,
} from "src/components/redux/reducers/hotel";
import {
  applyCoupon,
  createCoupon,
  getAllCoupons,
} from "src/components/redux/reducers/coupon";

import { useLoader } from "../../../../utils/loader";
import RoomModal from "./room-modal";
import CouponCodeModal from "./coupon-code";
import CreateCouponModal from "./create-coupon";
import AppliedCouponModal from "./applied-coupon";
import AvailableCouponsModal from "./available-coupons";

export default function Coupon() {
  const [couponName, setCouponName] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [validity, setValidity] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [couponCode, setCouponCode] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [openAvailableCouponsModal, setOpenAvailableCouponsModal] =
    useState(false);
  const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false);
  const [viewCoupons, setViewCoupons] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [coupons, setCoupons] = useState([]);

  const dispatch = useDispatch();
  const allHotelsData = useSelector((state) =>
    (state.hotel.data || []).filter((hotel) => hotel.isAccepted !== false),
  );
  const byFilterData = useSelector((state) => state.hotel.byFilter || []);
  const { showLoader, hideLoader } = useLoader();

  const handleCloseCouponModal = useCallback(() => {
    setOpenCouponModal(false);
    setCouponCode("");
    setSelectedRoom(null);
  }, []);

  const fetchHotels = useCallback(async () => {
    showLoader();
    try {
      await dispatch(getAllHotels()).unwrap();
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to fetch hotels.");
    } finally {
      hideLoader();
    }
  }, [dispatch, showLoader, hideLoader]);

  const fetchHotelsByCity = useCallback(
    async (city) => {
      showLoader();
      try {
        await dispatch(getHotelsByFilters(city)).unwrap();
      } catch (error) {
        console.error("Error fetching hotels by city:", error);
        toast.error(`Failed to fetch hotels for ${city}.`);
      } finally {
        hideLoader();
      }
    },
    [dispatch, showLoader, hideLoader],
  );

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

  useEffect(() => {
    fetchHotels();
    fetchCoupons();
  }, []);

  const resetCouponForm = () => {
    setCouponName("");
    setDiscountPrice("");
    setValidity("");
  };

  const handleCloseCreateCouponModal = () => {
    setOpenCreateCouponModal(false);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!couponName || !discountPrice || !validity) {
      toast.warn("Please fill in all coupon details.");
      return;
    }

    // Format the datetime-local input to full ISO string
    const formattedValidity = new Date(validity).toISOString(); // Full ISO with time

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

  const handleApplyCoupon = useCallback(
    async (hotelId, roomId) => {
      showLoader();
      try {
        const payload = {
          couponCode,
          hotelIds: [hotelId],
          roomIds: [roomId]
        };
        showLoader()
        await dispatch(applyCoupon(payload)).unwrap();
        window.location.reload();
      } catch (error) {
        const errorMessage =
          error?.message || error?.error || "Failed to apply coupon";
        console.error("Error applying coupon:", error);
        toast.error(`Error: ${errorMessage}`);
      } finally {
        hideLoader();
      }
    },
    // निर्भरताएँ वही रहेंगी
    [dispatch, showLoader, hideLoader, couponCode, handleCloseCouponModal]
  );

  const handleOpenModal = (hotel) => {
    setSelectedHotel(hotel);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedHotel(null);
    setSelectedRoom(null);
  };

  const handleOpenCouponModal = (room) => {
    setSelectedRoom(room);
    setOpenCouponModal(true);
  };

  const handleOpenAvailableCouponsModal = async () => {
    await fetchCoupons();
    setOpenAvailableCouponsModal(true);
  };

  const handleCloseAvailableCouponsModal = () => {
    setOpenAvailableCouponsModal(false);
  };

  const handleOpenCreateCouponModal = () => {
    resetCouponForm();
    setOpenCreateCouponModal(true);
  };

  const handleOpenViewCoupon = () => {
    setViewCoupons(true);
  };

  const handleCloseViewCoupon = () => {
    setViewCoupons(false);
  };

  const handleApplyCouponToRoom = useCallback(async () => {
    if (!selectedRoom || !couponCode || !selectedHotel) {
      toast.warn(
        "Please ensure a room is selected and coupon code is entered.",
      );
      return;
    }
    await handleApplyCoupon(selectedHotel.hotelId, selectedRoom.roomId);
  }, [selectedRoom, couponCode, selectedHotel, handleApplyCoupon]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Coupon code copied to clipboard"),
      () => toast.error("Failed to copy coupon code"),
    );
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const uniqueCities = useMemo(() => {
    if (!Array.isArray(allHotelsData) || allHotelsData.length === 0)
      return ["All Cities"];
    const cities = new Set(
      allHotelsData.map((hotel) => hotel.city).filter(Boolean),
    );
    return ["All Cities", ...Array.from(cities).sort()];
  }, [allHotelsData]);

  const handleCityChange = (event) => {
    const city = event.target.value;
    setSelectedCity(city);
    setSearchTerm("");
    setPage(0);
    if (city === "All Cities" || city === "") {
      // fetchHotels(); // Optional: uncomment if you want to refresh 'all' list
    } else {
      fetchHotelsByCity(city);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const displayedHotels = useMemo(() => {
    if (selectedCity && selectedCity !== "All Cities") {
      return byFilterData;
    }

    return allHotelsData;
  }, [selectedCity, byFilterData, allHotelsData]);
  const filteredAndSearchedHotels = useMemo(() => {
    const sourceHotels = displayedHotels;
    if (!searchTerm) {
      return sourceHotels;
    }
    return sourceHotels.filter((hotel) =>
      hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [displayedHotels, searchTerm]);
  const paginatedHotels = useMemo(() => {
    if (!filteredAndSearchedHotels) return [];
    if (Array.isArray(filteredAndSearchedHotels)) {
      // When filteredAndSearchedHotels is a direct array
      return filteredAndSearchedHotels.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
    } else if (Array.isArray(filteredAndSearchedHotels.data)) {
      // When filteredAndSearchedHotels has a .data property
      return filteredAndSearchedHotels.data.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
    }

    return []; // Fallback in case neither condition matches
  }, [filteredAndSearchedHotels, page, rowsPerPage]);
  return (
    <Container maxWidth="auto">
      <Typography variant="h6" gutterBottom>
        Please Read This Before Managing Coupons
      </Typography>
      <Typography variant="body2" gutterBottom>
        Follow these steps to effectively manage your coupons:
      </Typography>
      <Typography variant="body2" gutterBottom>
        1. Create a Coupon Click on "Create Coupon" to set up a new coupon.
      </Typography>
      <Typography variant="body2" gutterBottom>
        2. View Existing Coupons : Use the "View Available Coupons" button to
        check for any existing coupons.
      </Typography>
      <Typography variant="body2" gutterBottom>
        3. Copy Coupon Code : If you have available coupons, click the copy icon
        to copy the coupon code.
      </Typography>
      <Typography variant="body2" gutterBottom>
        4. Select a Hotel : Scroll down to view the available hotels and select
        one.
      </Typography>
      <Typography variant="body2" gutterBottom>
        5. Apply the Coupon : Click the "Apply" button next to the selected
        hotel.
      </Typography>
      <Typography variant="body2" gutterBottom>
        6. Choose Rooms : After applying, select the desired rooms and click
        "Apply" again.
      </Typography>
      <Typography variant="body2" gutterBottom>
        7. Paste and Apply the Coupon Code : Enter the copied coupon code and
        click "Apply."
      </Typography>
      <Typography variant="body2" gutterBottom>
        8. View Applied Coupons : If you want to check the details of your
        applied coupons, click on "View Applied Coupons."{" "}
      </Typography>
      <hr />

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreateCouponModal}
        sx={{ mb: 2, mr: 2 }}
      >
        Create Coupon
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpenAvailableCouponsModal}
        sx={{ mb: 2, mr: 2 }}
      >
        View Available Coupons
      </Button>
    

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <TextField
          label="Search Hotels by Name"
          variant="outlined"
          sx={{ flexGrow: 1 }}
          margin="none"
          onChange={handleSearch}
          value={searchTerm}
        />
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="city-filter-label">Filter by City</InputLabel>
          <Select
            labelId="city-filter-label"
            id="city-filter-select"
            value={selectedCity}
            onChange={handleCityChange}
            label="Filter by City"
            disabled={
              !Array.isArray(allHotelsData) || allHotelsData.length === 0
            }
          >
            {uniqueCities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

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

      <hr />
      <Typography variant="h5" gutterBottom>
        Available Hotels
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hotel ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Hotel Name</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedHotels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {selectedCity || searchTerm
                    ? "No hotels found matching your criteria."
                    : !Array.isArray(allHotelsData) ||
                      allHotelsData.length === 0
                      ? "Loading hotels..."
                      : "No hotels found."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedHotels.map((hotel) => (
                <TableRow key={hotel.hotelId}>
                  <TableCell>{hotel.hotelId}</TableCell>
                  <TableCell>
                    <img
                      src={
                        hotel.images && hotel.images.length > 0
                          ? hotel.images[0]
                          : "/placeholder-image.png"
                      }
                      alt={hotel.hotelName}
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.png";
                      }}
                    />
                  </TableCell>
                  <TableCell>{hotel.hotelName}</TableCell>
                  <TableCell>{hotel.hotelOwnerName}</TableCell>
                  <TableCell>{hotel.city}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleOpenModal(hotel)}
                      disabled={!hotel}
                    >
                      Apply
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSearchedHotels?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <RoomModal
        open={openModal}
        handleClose={handleCloseModal}
        selectedHotel={selectedHotel}
        handleOpenCouponModal={handleOpenCouponModal}
      />

      <CouponCodeModal
        open={openCouponModal}
        handleClose={handleCloseCouponModal}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        handleApplyCouponToRoom={handleApplyCouponToRoom}
      />

      <AvailableCouponsModal
        open={openAvailableCouponsModal}
        handleClose={handleCloseAvailableCouponsModal}
        coupons={coupons}
        copyToClipboard={copyToClipboard}
      />
    </Container>
  );
}
