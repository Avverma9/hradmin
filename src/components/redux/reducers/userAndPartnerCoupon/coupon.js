import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  localUrl,
  notify,
  showSnackbar,
  token,
} from "../../../../../utils/util";
import { toast } from "react-toastify";

const VALID_COUPON_TYPES = new Set(["hotel", "partner", "user"]);

const normalizeCouponType = (type = "hotel") => {
  const normalized = String(type || "hotel").toLowerCase();
  return VALID_COUPON_TYPES.has(normalized) ? normalized : "hotel";
};

const getAuthHeaders = () => ({
  headers: {
    Authorization: token,
    "Content-Type": "application/json",
  },
});

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.coupons)) return payload.coupons;
  if (Array.isArray(payload?.coupon)) return payload.coupon;
  return [];
};

const extractObjectPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.coupon && typeof payload.coupon === "object" && !Array.isArray(payload.coupon)) {
    return payload.coupon;
  }

  return payload;
};

const fetchCouponsByType = async (type) => {
  try {
    const response = await axios.get(`${localUrl}/coupon/get/by-type`, {
      params: { type: normalizeCouponType(type), status: "all" },
      ...getAuthHeaders(),
    });
    return extractArrayPayload(response.data);
  } catch {
    const fallback = await axios.get(`${localUrl}/coupon/get/all`, getAuthHeaders());
    const fallbackItems = extractArrayPayload(fallback.data);
    return fallbackItems.filter(
      (item) => normalizeCouponType(item?.type || "hotel") === normalizeCouponType(type)
    );
  }
};

const createCouponByType = async (postData, type) => {
  const normalizedType = normalizeCouponType(type);
  const quantity = Number(postData?.quantity ?? postData?.maxUsage ?? 1);

  const payload = {
    couponName: postData.couponName,
    discountPrice: Number(postData.discountPrice),
    validity: postData.validity,
    type: normalizedType,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    maxUsage: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
  };

  if (postData?.assignedTo) payload.assignedTo = postData.assignedTo;
  if (postData?.targetUserId) payload.targetUserId = postData.targetUserId;

  const response = await axios.post(
    `${localUrl}/coupon/create-a-new/coupon`,
    payload,
    getAuthHeaders()
  );

  const createdCoupon = extractObjectPayload(response.data);
  if (createdCoupon?.couponCode) {
    toast.success(`Kindly note down your coupon code: ${createdCoupon.couponCode}`);
  }

  return {
    ...(createdCoupon || {}),
    type: normalizeCouponType(createdCoupon?.type || normalizedType),
  };
};

export const getAllCoupons = createAsyncThunk(
  "coupon/getAllCoupons",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCouponsByType("partner");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllUserCoupons = createAsyncThunk(
  "coupon/getAllUserCoupons",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCouponsByType("user");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCoupon = createAsyncThunk(
  "coupon/createCoupon",
  async (postData, { rejectWithValue }) => {
    try {
      return await createCouponByType(postData, "partner");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createUserCoupon = createAsyncThunk(
  "coupon/createUserCoupon",
  async (postData, { rejectWithValue }) => {
    try {
      return await createCouponByType(postData, "user");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "coupon/applyCoupon",
  async (payload, { rejectWithValue }) => {
    try {
      const requestPayload = {
        ...payload,
        type: normalizeCouponType(payload?.type || "hotel"),
      };

      const response = await axios.patch(
        `${localUrl}/apply/a/coupon-to-room`,
        requestPayload,
        getAuthHeaders()
      );

      notify(response.status);
      if (response?.data?.message) {
        showSnackbar(response.data.message);
      }

      const rows = extractArrayPayload(response.data);
      if (rows.length) return rows;

      const one = extractObjectPayload(response.data);
      if (one?.discountPrice !== undefined) {
        return [one];
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

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
      .addCase(getAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.coupon = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllUserCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUserCoupons.fulfilled, (state, action) => {
        state.coupon = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(getAllUserCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        if (action.payload) {
          state.coupon = [action.payload, ...state.coupon];
        }
      })
      .addCase(createUserCoupon.fulfilled, (state, action) => {
        if (action.payload) {
          state.coupon = [action.payload, ...state.coupon];
        }
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.apply = action.payload;
      });
  },
});

export default userCoupon.reducer;
