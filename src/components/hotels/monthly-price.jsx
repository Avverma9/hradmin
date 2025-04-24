/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaRupeeSign } from 'react-icons/fa6';
import { LiaRupeeSignSolid } from 'react-icons/lia';
import React, { useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Card,
  Table,
  Paper,
  Button,
  Select,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  InputLabel,
  Typography,
  FormControl,
  CardContent,
  TableContainer,
  InputAdornment,
  Grid,
} from '@mui/material';

import { localUrl } from '../../../utils/util';
import { fDate } from '../../../utils/format-time';

export default function MonthlyPrice() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [monthPrice, setMonthPrice] = useState('');
  const [data, setData] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(''); // New state for selected room
  const hotelEmail = localStorage.getItem('user_email');
  const role = localStorage.getItem('user_role');

  const fetchHotels = useCallback(async () => {
    try {
      let url = '';
      if (role === 'PMS') {
        url = `${localUrl}/hotels/query/get/by?hotelEmail=${hotelEmail}`;
      } else if (role === 'Admin' || role === 'Developer') {
        url = `${localUrl}/get/all/hotels`;
      } else {
        throw new Error('Invalid user role');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const res = await response.json();

      if (role === 'Admin' || role === 'Developer') {
        setHotels(res.data);
      } else {
        setHotels(res);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Error fetching hotels', { autoClose: 3000 });
    }
  }, [role, hotelEmail]);

  const fetchMonthlyPriceData = async (hotelId) => {
    if (!hotelId) return;
    try {
      const response = await axios.get(`${localUrl}/monthly-set-room-price/get/by/${hotelId}`);
      setData(response?.data);
    } catch (error) {
      toast.error("It seems there's an error fetching monthly price data", { autoClose: 3000 });
    }
  };

  const handleHotelChange = async (event) => {
    const hotelId = event.target.value;
    setSelectedHotel(hotelId);
    setSelectedRoom(''); // Reset selected room
    await fetchMonthlyPriceData(hotelId);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleMonthPriceChange = (event) => {
    setMonthPrice(event.target.value);
  };

  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    if (selectedHotel) {
      fetchMonthlyPriceData(selectedHotel);
    }
  }, [selectedHotel]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!selectedHotel || !selectedRoom || !startDate || !endDate || !monthPrice) {
        toast.warn('Please fill all fields', { autoClose: 3000 });
        return;
      }

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      await axios.post(`${localUrl}/monthly-set-room-price/${selectedHotel}/${selectedRoom}`, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        monthPrice,
      });
      toast.success('Monthly price set successfully', { autoClose: 3000 });
      setStartDate(null);
      setEndDate(null);
      setMonthPrice('');
      setSelectedRoom('');
      fetchMonthlyPriceData(selectedHotel);
    } catch (error) {
      toast.error('Failed to set monthly price', { autoClose: 3000 });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${localUrl}/monthly-set-room-price/delete/price/by/${id}`
      );
      if (response.status === 200) {
        toast.success('Successfully removed');
        fetchMonthlyPriceData(selectedHotel);
      }
    } catch (error) {
      toast.error("It seems there's an issue!", { autoClose: 3000 });
    }
  };
  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid #ddd',
        borderRadius: 2,
        boxShadow: 2,
        maxWidth: 1000,
        mx: 'auto',
      }}
    >
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Please Read Before Filling Out This Form
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set room prices for selected hotels across date ranges. Select hotel, room, and enter pricing details below.
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Set Monthly Price
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Hotel</InputLabel>
              <Select value={selectedHotel} onChange={handleHotelChange} label="Select Hotel">
                {hotels.map((hotel) => (
                  <MenuItem key={hotel.hotelId} value={hotel.hotelId}>
                    {hotel.hotelName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Room</InputLabel>
              <Select value={selectedRoom} onChange={handleRoomChange} label="Select Room">
                {hotels
                  .find((h) => h.hotelId === selectedHotel)
                  ?.rooms.map((room) => (
                    <MenuItem key={room.roomId} value={room.roomId}>
                      {room.type}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Set Price"
                type="number"
                value={monthPrice}
                onChange={handleMonthPriceChange}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaRupeeSign />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 1 }}>
          Set Monthly Price
        </Button>
      </form>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Hotel</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.hotelId}</TableCell>
                  <TableCell>{item.roomId}</TableCell>
                  <TableCell>{fDate(item.startDate)}</TableCell>
                  <TableCell>{fDate(item.endDate)}</TableCell>
                  <TableCell>
                    <LiaRupeeSignSolid /> {item.monthPrice}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(item.hotelId)}
                      size="small"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
