/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaRupeeSign } from 'react-icons/fa6';
import { CiCalendarDate } from 'react-icons/ci';
import { LiaRupeeSignSolid } from 'react-icons/lia';
import React, { useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
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
  TableContainer,
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import { fDate } from 'src/utils/format-time';

export default function MonthlyPrice() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthPrice, setMonthPrice] = useState('');
  const [data, setData] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
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
     console.log('coming hotels', res);
     setHotels(res)
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Error fetching hotels', { autoClose: 3000 });
    } 
  }, [role, hotelEmail]);

  const fetchMonthlyPriceData = async (hotelId) => {
    if (!hotelId) return; // Avoid fetching data if no hotel is selected
    try {
      const response = await axios.get(`${localUrl}/monthly-set-room-price/get/by/${hotelId}`);
      setData(response.data);
    } catch (error) {
      toast.error("It seems there's an error fetching monthly price data", { autoClose: 3000 });
    }
  };

  const handleHotelChange = (event) => {
    const hotelId = event.target.value;
    setSelectedHotel(hotelId);
    fetchMonthlyPriceData(hotelId);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleMonthPriceChange = (event) => {
    setMonthPrice(event.target.value);
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
      if (!selectedHotel || !selectedDate || !monthPrice) {
        toast.warn('Please fill all fields', { autoClose: 3000 });
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];

      await axios.post(`${localUrl}/monthly-set-room-price/${selectedHotel}`, {
        monthDate: formattedDate,
        monthPrice,
      });
      toast.success('Monthly price set successfully', { autoClose: 3000 });
      setSelectedDate(null);
      setMonthPrice('');
      fetchMonthlyPriceData(selectedHotel); // Refresh data after submission
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
        fetchMonthlyPriceData(selectedHotel); // Refresh data after deletion
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
        width: '100%',
        mx: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Set Monthly Price
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="hotel-select-label">Select Hotel</InputLabel>
          <Select
            labelId="hotel-select-label"
            value={selectedHotel}
            onChange={handleHotelChange}
            label="Select Hotel"
            sx={{ borderRadius: 1 }}
          >
            {hotels?.map((hotel) => (
              <MenuItem key={hotel.hotelId} value={hotel.hotelId}>
                {hotel.hotelName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ sx: { width: '100%' } }}
              />
            )}
          />
        </LocalizationProvider>
        <hr />
        <TextField
          label="Month Price"
          type="number"
          value={monthPrice}
          onChange={handleMonthPriceChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Set Monthly Price
        </Button>
      </form>

      {data.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Existing Monthly Prices
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <CiCalendarDate />{" "}
                     Date
                  </TableCell>
                  <TableCell>
                    <LiaRupeeSignSolid /> Price
                  </TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{fDate(item.monthDate)}</TableCell>
                    <TableCell>
                      {item.monthPrice} <FaRupeeSign />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(item.hotelId)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
