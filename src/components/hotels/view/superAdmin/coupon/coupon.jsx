/* eslint-disable react/no-unescaped-entities */
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
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
} from '@mui/material';

import { localUrl, hotelEmail } from '../../../../../../utils/util';

import RoomModal from '../../../../settings/coupon/room-modal';
import CouponCodeModal from '../../../../settings/coupon/coupon-code';
import CreateCouponModal from '../../../../settings/coupon/create-coupon';
import AppliedCouponModal from '../../../../settings/coupon/applied-coupon';
import AvailableCouponsModal from '../../../../settings/coupon/available-coupons';
import { useDispatch, useSelector } from 'react-redux';

import { useLoader } from '../../../../../../utils/loader';
import { applyCoupon, createCoupon, getAllCoupons } from 'src/components/redux/reducers/coupon';
import { getHotelByQuery } from 'src/components/redux/reducers/hotel';

export default function Coupon() {
  const hotels = useSelector((state) => state.hotel.byQuery);
  const [coupons, setCoupons] = useState([]);
  const [couponName, setCouponName] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [validity, setValidity] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [openAvailableCouponsModal, setOpenAvailableCouponsModal] = useState(false);
  const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false); // Added state for CreateCouponModal
  const [viewCoupons, setViewCoupons] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [page, setPage] = useState(0);
  const dispatch = useDispatch();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const { showLoader, hideLoader } = useLoader();
  useEffect(() => {
    fetchHotels();
    fetchCoupons();
  }, [dispatch]);

  const fetchHotels = async () => {

    try {
      showLoader();
      await dispatch(getHotelByQuery(hotelEmail));
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels');
    } finally {
      hideLoader();
    }
  };

  const fetchCoupons = async () => {
    showLoader();
    try {
      const response = await dispatch(
        getAllCoupons({ type: "hotel", status: "all" }),
      ).unwrap();
      setCoupons(response || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      hideLoader();
    }
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
      type: "hotel",
      quantity: 1,
      maxUsage: 1,
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

  const resetCouponForm = () => {
    setCouponName('');
    setDiscountPrice('');
    setValidity('');
    handleCloseCreateCouponModal();
  };
  const handleApplyCoupon = async (hotelIds, roomIds) => {
    showLoader();
    try {
      const payload ={
        couponCode,
        hotelIds: [hotelIds],
        roomIds: [roomIds],
        type: "hotel",
      }
      await dispatch(applyCoupon(payload)).unwrap();
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(errorMessage);
    } finally {
      hideLoader();
    }
  };

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

  const handleCloseCouponModal = () => {
    setOpenCouponModal(false);
    setCouponCode('');
  };

  const handleOpenAvailableCouponsModal = () => {
    setOpenAvailableCouponsModal(true);
  };

  const handleCloseAvailableCouponsModal = () => {
    setOpenAvailableCouponsModal(false);
  };

  const handleOpenCreateCouponModal = () => {
    setOpenCreateCouponModal(true);
  };

  const handleCloseCreateCouponModal = () => {
    setOpenCreateCouponModal(false);
  };



  const handleCloseViewCoupon = () => {
    setViewCoupons(false);
  };

  const handleApplyCouponToRoom = async () => {
    if (!selectedRoom || !couponCode) return;

    try {
      await handleApplyCoupon(selectedHotel.hotelId, selectedRoom.roomId, couponCode);
      handleCloseCouponModal();
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success('Coupon code copied to clipboard'),
      () => toast.error('Failed to copy coupon code')
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredHotels = hotels?.filter((hotel) =>
    hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedHotels = filteredHotels?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="auto">
      {/* Information Section */}
      <Typography variant="h6" gutterBottom>
        Please Read This Before Managing Coupons
      </Typography>
      <Typography variant="body2" gutterBottom>
        Follow these steps to effectively manage your coupons:
      </Typography>
      <Typography variant="body2" gutterBottom>
        1. **Create a Coupon**: Click on "Create Coupon" to set up a new coupon.
      </Typography>
      <Typography variant="body2" gutterBottom>
        2. **View Existing Coupons**: Use the "View Available Coupons" button to check for any
        existing coupons.
      </Typography>
      <Typography variant="body2" gutterBottom>
        3. **Copy Coupon Code**: If you have available coupons, click the copy icon to copy the
        coupon code.
      </Typography>
      <Typography variant="body2" gutterBottom>
        4. **Select a Hotel**: Scroll down to view the available hotels and select one.
      </Typography>
      <Typography variant="body2" gutterBottom>
        5. **Apply the Coupon**: Click the "Apply" button next to the selected hotel.
      </Typography>
      <Typography variant="body2" gutterBottom>
        6. **Choose Rooms**: After applying, select the desired rooms and click "Apply" again.
      </Typography>
      <Typography variant="body2" gutterBottom>
        7. **Paste and Apply the Coupon Code**: Enter the copied coupon code and click "Apply."
      </Typography>
      <Typography variant="body2" gutterBottom>
        8. **View Applied Coupons**: If you want to check the details of your applied coupons, click
        on "View Applied Coupons."
      </Typography>

      <hr />
      <Button variant="contained" color="primary" onClick={handleOpenCreateCouponModal}>
        Create Coupon
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpenAvailableCouponsModal}
        sx={{ ml: 2 }}
      >
        View Available Coupons
      </Button>

      <TextField
        label="Search Hotels"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={handleSearch}
        value={searchTerm}
      />
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
      <AppliedCouponModal open={viewCoupons} handleClose={handleCloseViewCoupon} />

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
            {paginatedHotels?.map((hotel) => (
              <TableRow key={hotel.hotelId}>
                <TableCell>{hotel.hotelId}</TableCell>
                <TableCell>
                  <img
                    src={hotel.images[0]}
                    alt={hotel.hotelName}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                </TableCell>
                <TableCell>
                  {hotel.hotelName}
                  {hotel.rooms?.some((room) => room.isOffer) && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: 8,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#2196f3',
                      }}
                      title="Offer Available"
                    />
                  )}
                </TableCell>

                <TableCell>{hotel.hotelOwnerName}</TableCell>
                <TableCell>{hotel.city}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenModal(hotel)}
                  >
                    Apply
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredHotels?.length}
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
