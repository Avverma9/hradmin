import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { localUrl, notify, token } from '../../../../utils/util';

export const getAllHotels = createAsyncThunk(
  'hotel/getAllHotels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/get/all/hotels`, {
        headers: {
          Authorization: token,
        },
      });
      //   notify(response.status);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getHotelByQuery = createAsyncThunk(
  'hotel/getHotelByQuery',
  async (hotelEmail, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/hotels/query/get/by?hotelEmail=${hotelEmail}`, {
        headers: {
          Authorization: token,
        },
      });
      //   notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllCoupons = createAsyncThunk(
  'hotel/getAllCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/coupon/get/all`, {
        headers: {
          Authorization: token,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'hotel/createCoupon',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/coupon/create-a-new/coupon`,
        {
          couponName: postData.couponName,
          discountPrice: postData.discountPrice,
          validity: postData.validity,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const hotelSlice = createSlice({
  name: 'hotel',
  initialState: {
    data: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllHotels.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
    builder.addCase(getHotelByQuery.fulfilled, (state, action) => {
      state.byQuery = action.payload;
      state.data = false;
    });
    builder.addCase(getAllCoupons.fulfilled, (state, action) => {
      state.coupon = action.payload;
      state.data = false;
    });
    builder.addCase(createCoupon.fulfilled, (state, action) => {
      state.coupon = action.payload;
      state.data = false;
    });
  },
});
export default hotelSlice.reducer;
