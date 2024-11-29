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

import { localUrl } from '../../../../utils/util';

import RoomModal from './room-modal';
import CouponCodeModal from './coupon-code';
import CreateCouponModal from './create-coupon';
import AppliedCouponModal from './applied-coupon';
import AvailableCouponsModal from './available-coupons';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHotels } from 'src/components/redux/reducers/hotel';
import { useLoader } from '../../../../utils/loader';
import { applyCoupon, createCoupon, getAllCoupons } from 'src/components/redux/reducers/coupon';

export default function Coupon() {
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  // const coupons = useSelector((state) => state.coupon.coupon);
  const [coupons, setCoupons] = useState([]);
  const hotels = useSelector((state) => state.hotel.data);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    fetchHotels();
    fetchCoupons();
  }, [dispatch]);

  const fetchHotels = async () => {
    showLoader();
    try {
      await dispatch(getAllHotels()).unwrap();
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      hideLoader();
    }
  };

  const fetchCoupons = async () => {
    showLoader();
    try {
      const response = await dispatch(getAllCoupons()).unwrap();
      setCoupons(response);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      hideLoader();
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const formattedValidity = new Date(validity).toISOString().split('T')[0];
    const postData = { couponName, discountPrice, validity: formattedValidity };
    showLoader();
    try {
      await dispatch(createCoupon(postData)).unwrap();
      handleCloseCreateCouponModal();
      resetCouponForm();
      fetchCoupons();
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };

  const handleApplyCoupon = async (hotelId, roomId) => {
    showLoader();
    try {
      await dispatch(applyCoupon({ couponCode, hotelId, roomId }));
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(errorMessage);
      alert(errorMessage);
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

  const handleOpenAvailableCouponsModal = async () => {
    await fetchCoupons(); // Refresh coupons before opening the modal
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

  // Opening the applied coupons modal
  const handleOpenViewCoupon = () => {
    setViewCoupons(true);
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

  const paginatedHotels = filteredHotels.slice(
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
        1. Create a Coupon Click on "Create Coupon" to set up a new coupon.
      </Typography>
      <Typography variant="body2" gutterBottom>
        2. View Existing Coupons : Use the "View Available Coupons" button to check for any existing
        coupons.
      </Typography>
      <Typography variant="body2" gutterBottom>
        3. Copy Coupon Code : If you have available coupons, click the copy icon to copy the coupon
        code.
      </Typography>
      <Typography variant="body2" gutterBottom>
        4. Select a Hotel : Scroll down to view the available hotels and select one.
      </Typography>
      <Typography variant="body2" gutterBottom>
        5. Apply the Coupon : Click the "Apply" button next to the selected hotel.
      </Typography>
      <Typography variant="body2" gutterBottom>
        6. Choose Rooms : After applying, select the desired rooms and click "Apply" again.
      </Typography>
      <Typography variant="body2" gutterBottom>
        7. Paste and Apply the Coupon Code : Enter the copied coupon code and click "Apply."
      </Typography>
      <Typography variant="body2" gutterBottom>
        8. View Applied Coupons : If you want to check the details of your applied coupons, click on
        "View Applied Coupons."
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
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpenViewCoupon} // Open applied coupons modal
        sx={{ ml: 2 }}
      >
        View Applied Coupons
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
            {paginatedHotels.map((hotel) => (
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
                <TableCell>{hotel.hotelName}</TableCell>
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
