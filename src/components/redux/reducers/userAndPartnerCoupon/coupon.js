import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  localUrl,
  notify,
  showSnackbar,
  token,
} from "../../../../../utils/util";
import { toast } from "react-toastify";

// Helper function to handle headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: token,
    "Content-Type": "application/json",
  },
});

// Thunks

export const getAllCoupons = createAsyncThunk(
  "coupon/getAllCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/partner-coupon/coupon/get/all`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllUserCoupons = createAsyncThunk(
  "coupon/getAllUserCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/user-coupon/coupon/get/all/user`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCoupon = createAsyncThunk(
  "coupon/createCoupon",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/partner-coupon/coupon/create-a-new/coupon`,
        {
          couponName: postData.couponName,
          discountPrice: postData.discountPrice,
          validity: postData.validity,
          quantity: postData.quantity,
        },
        getAuthHeaders()
      );
      toast.success(
        `Kindly note down your coupon code: ${response?.data?.coupon?.couponCode}`
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createUserCoupon = createAsyncThunk(
  "coupon/createUserCoupon",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/user-coupon/coupon/create-a-new/coupon/user`,
        {
          couponName: postData.couponName,
          discountPrice: postData.discountPrice,
          assignedTo: postData.assignedTo,
          validity: postData.validity,
          quantity: 1,
        },
        getAuthHeaders()
      );
      toast.success(
        `Kindly note down your coupon code: ${response?.data?.coupon?.couponCode}`
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "coupon/applyCoupon",
  async (payload, { rejectWithValue }) => {
    try {
      const url = `${localUrl}/partner-coupon/apply/a/coupon-to-room`;

      const response = await axios.patch(url, payload, getAuthHeaders());

      notify(response.status);
      showSnackbar(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

// Slice

const userCoupon = createSlice({
  name: "userCoupon",
  initialState: {
    coupon: [],
    apply: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // getAllCoupons
      .addCase(getAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.coupon = action.payload;
        state.loading = false;
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAllUserCoupons
      .addCase(getAllUserCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUserCoupons.fulfilled, (state, action) => {
        state.coupon = action.payload;
        state.loading = false;
      })
      .addCase(getAllUserCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createCoupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupon.push(action.payload);
        state.loading = false;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createUserCoupon
      .addCase(createUserCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserCoupon.fulfilled, (state, action) => {
        state.coupon.push(action.payload);
        state.loading = false;
      })
      .addCase(createUserCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // applyCoupon
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.apply = action.payload;
        state.loading = false;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userCoupon.reducer;
