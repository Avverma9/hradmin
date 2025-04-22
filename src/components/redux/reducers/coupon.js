import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, notify, token } from "../../../../utils/util";
import { toast } from "react-toastify";

export const removeCoupon = createAsyncThunk(
  "coupon/removeCoupon",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/remove/coupon/before-time-from-hotel`,
        {
          roomId,
          headers: {
            Authorization: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getAllCoupons = createAsyncThunk(
  "hotel/getAllCoupons",
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
  },
);

export const createCoupon = createAsyncThunk(
  "hotel/createCoupon",
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
        },
      );
      toast.success(
        `Kindly note down your coupon code: ${response?.data?.coupon.couponCode}`,
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const applyCoupon = createAsyncThunk(
  "hotel/applyCoupon",
  async ({ couponCode, hotelIds, roomIds }, { getState, rejectWithValue }) => {
    try {
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return rejectWithValue("Authentication token is missing.");
      }

      const url = `${localUrl}/apply/a/coupon-to-room`;
      const requestData = {
        couponCode,
        hotelIds,
        roomIds,
      };
      const response = await axios.patch(url, requestData, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      notify(response.status);
      return response.data;
    } catch (error) {
      console.error("Error in applyCoupon thunk:", error);
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  },
);
const couponSlice = createSlice({
  name: "coupon",
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
