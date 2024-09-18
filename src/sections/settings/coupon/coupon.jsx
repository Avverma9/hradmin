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

import { localUrl } from 'src/utils/util';

import RoomModal from './room-modal';
import CouponCodeModal from './coupon-code';
import CreateCouponModal from './create-coupon';
import AppliedCouponModal from './applied-coupon';
import AvailableCouponsModal from './available-coupons';

export default function Coupon() {
  const [hotels, setHotels] = useState([]);
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHotels();
    fetchCoupons();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${localUrl}/get/all/hotels`);
      const result = await response.json();
      setHotels(result.data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels');
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${localUrl}/coupon/get/all`);
      const result = await response.json();
      setCoupons(result || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const formattedValidity = new Date(validity).toISOString().split('T')[0];
    try {
      const response = await axios.post(`${localUrl}/coupon/create-a-new/coupon`, {
        couponName,
        discountPrice,
        validity: formattedValidity,
      });
      if (response.status === 201) {
        toast.success(`Kindly Note down your coupon code ${response?.data?.coupon?.couponCode}`);
        setCouponName('');
        setDiscountPrice('');
        setValidity('');
        handleCloseCreateCouponModal();
        fetchCoupons(); // Refresh coupons after creating a new one
      }
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleApplyCoupon = async (hotelId, roomId) => {
    try {
      const response = await axios.patch(
        `${localUrl}/apply/a/coupon-to-room/${couponCode}?hotelId=${hotelId}&roomId=${roomId}`
      );
      if (response.status === 200) {
        toast.success('Coupon Applied Successfully');
        window.location.reload()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(errorMessage);
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

  const filteredHotels = hotels.filter((hotel) =>
    hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedHotels = filteredHotels.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Coupon Management
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
      <AppliedCouponModal
        open={viewCoupons}
        handleClose={handleCloseViewCoupon}

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
          count={filteredHotels.length}
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
