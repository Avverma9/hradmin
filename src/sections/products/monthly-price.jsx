/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { format } from 'date-fns';
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
} from '@mui/material';

import { localUrl } from 'src/utils/util';
import { fDate } from 'src/utils/format-time';

export default function MonthlyPrice() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [monthPrice, setMonthPrice] = useState('');
  const [data, setData] = useState([]);
  const [isAddition, setIsAddition] = useState(true); // true for Add, false for Minus
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

      // Check the role and set hotels accordingly
      if (role === 'Admin' || role === 'Developer') {
        setHotels(res.data); // For Admin and Developer, use res.data
      } else {
        setHotels(res); // For PMS, use res directly
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Error fetching hotels', { autoClose: 3000 });
    }
  }, [role, hotelEmail]);

  const fetchMonthlyPriceData = async (hotelId) => {
    if (!hotelId) return; // Avoid fetching data if no hotel is selected
    try {
      const response = await axios.get(`${localUrl}/monthly-set-room-price/get/by/${hotelId}`);
      setData(response?.data);
    } catch (error) {
      toast.error("It seems there's an error fetching monthly price data", { autoClose: 3000 });
    }
  };

  const handleHotelChange = (event) => {
    const hotelId = event.target.value;
    setSelectedHotel(hotelId);
    fetchMonthlyPriceData(hotelId);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  const handleIsAdditionChange = (event) => {
    setIsAddition(event.target.value === 'Add');
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
      if (!selectedHotel || !startDate || !endDate || !monthPrice) {
        toast.warn('Please fill all fields', { autoClose: 3000 });
        return;
      }

      // Format the start and end dates correctly
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      await axios.post(`${localUrl}/monthly-set-room-price/${selectedHotel}`, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        isAddition,
        monthPrice, // Pass the month price as well
      });
      toast.success('Monthly price set successfully', { autoClose: 3000 });
      setStartDate(null);
      setEndDate(null);
      setMonthPrice('');
      setIsAddition(true); // Reset isAddition to default (true for Add)
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Use This Form
          </Typography>
          <Typography variant="body2">
            In this monthly form, you only need to add one month's data. To set the data, select a
            start and end date, and choose an operation:
            <br />
            - Add = means you will add the price.
            <br />
            - Minus = means you will subtract the price.
            <br />
           
          </Typography>
        </CardContent>
      </Card>
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
            {hotels?.length > 0 &&
              hotels?.map((hotel) => (
                <MenuItem key={hotel.hotelId} value={hotel.hotelId}>
                  {hotel.hotelName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ sx: { width: '100%' } }}
              />
            )}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
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
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="addition-select-label">Choose Operation</InputLabel>
          <Select
            labelId="addition-select-label"
            value={isAddition ? 'Add' : 'Minus'}
            onChange={handleIsAdditionChange}
            label="Choose Operation"
          >
            <MenuItem value="Add">Add</MenuItem>
            <MenuItem value="Minus">Minus</MenuItem>
          </Select>
        </FormControl>
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
                    <CiCalendarDate /> Start date
                  </TableCell>
                  <TableCell>
                    <CiCalendarDate /> End date
                  </TableCell>
                  <TableCell>
                    <CiCalendarDate /> Choose operation
                  </TableCell>
                  <TableCell>
                    <LiaRupeeSignSolid /> Price
                  </TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{fDate(item.startDate)}</TableCell>
                    <TableCell>{fDate(item.endDate)}</TableCell>
                    <TableCell>{item.isAddition ? 'Will be added' : 'Will be minus'}</TableCell>
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
