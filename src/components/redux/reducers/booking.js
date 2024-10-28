import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { localUrl, notify, token } from '../../../../utils/util';
// Async thunk for fetching booking data
export const fetchFilteredBookings = createAsyncThunk(
  'booking/fetchFilteredBookings',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/get/all/filtered/booking/by/query?${queryParams}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (userId, hotelId, data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${localUrl}/booking/${userId}/${hotelId}`, {
        data,
        headers: {
          Authorization: token,
        },
      });
      notify(response?.status);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);
export const searchBooking = createAsyncThunk(
  'booking/searchBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/get/all/filtered/booking/by/query?bookingId=${bookingId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async ({ bookingId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${localUrl}/updatebooking/${bookingId}`, updatedData, {
        headers: {
          Authorization: token,
        },
      });
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    filtered: [],
    search: [],
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFilteredBookings.fulfilled, (state, action) => {
      state.filtered = action.payload;
      state.loading = false;
    });
    builder.addCase(searchBooking.fulfilled, (state, action) => {
      state.search = action.payload;
      state.loading = false;
    });
    builder.addCase(updateBooking.fulfilled, (state, action) => {
      state.updated = action.payload;
      state.loading = false;
    });
  },
});
export default bookingSlice.reducer;
