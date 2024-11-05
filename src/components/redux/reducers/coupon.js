import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { localUrl, notify, token } from '../../../../utils/util';
import { toast } from 'react-toastify';

export const removeCoupon = createAsyncThunk(
  'coupon/removeCoupon',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${localUrl}/remove/coupon/before-time-from-hotel`, {
        roomId,
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
      toast.success(`Kindly note down your coupon code: ${response?.data?.coupon.couponCode}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'hotel/applyCoupon',
  async ({ couponCode, hotelId, roomId }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/apply/a/coupon-to-room?hotelId=${hotelId}&roomId=${roomId}&couponCode=${couponCode}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    coupon: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.coupon = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupon.push(action.payload);
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.apply = action.payload;
      });
  },
});

export default couponSlice.reducer;
