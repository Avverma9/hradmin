import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, notify, showSnackbar, token } from "../../../../utils/util";
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

const normalizeCoupons = (payload, fallbackType = "hotel") =>
  extractArrayPayload(payload).map((item) => ({
    ...item,
    type: normalizeCouponType(item?.type || fallbackType),
  }));

export const getAllCoupons = createAsyncThunk(
  "hotel/getAllCoupons",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const type = normalizeCouponType(filters?.type || "hotel");
      const status = filters?.status || "all";
      const search = String(filters?.search || "").trim();

      const response = await axios.get(`${localUrl}/coupon/get/by-type`, {
        params: {
          type,
          status,
          ...(search ? { search } : {}),
        },
        ...getAuthHeaders(),
      });

      return normalizeCoupons(response.data, type);
    } catch (error) {
      try {
        const fallbackResponse = await axios.get(
          `${localUrl}/coupon/get/all`,
          getAuthHeaders()
        );

        return normalizeCoupons(fallbackResponse.data, "hotel");
      } catch (fallbackError) {
        const errorMessage =
          fallbackError.response?.data?.message ||
          error.response?.data?.message ||
          fallbackError.message ||
          error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const createCoupon = createAsyncThunk(
  "hotel/createCoupon",
  async (postData, { rejectWithValue }) => {
    try {
      const type = normalizeCouponType(postData?.type || "hotel");
      const quantity = Number(postData?.quantity ?? postData?.maxUsage ?? 1);

      const payload = {
        couponName: postData.couponName,
        discountPrice: Number(postData.discountPrice),
        validity: postData.validity,
        type,
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
      const couponCode = createdCoupon?.couponCode;

      if (couponCode) {
        toast.success(`Kindly note down your coupon code: ${couponCode}`);
      }

      return {
        ...(createdCoupon || {}),
        type: normalizeCouponType(createdCoupon?.type || payload.type),
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "hotel/applyCoupon",
  async (payload, { rejectWithValue }) => {
    try {
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        return rejectWithValue("Authentication token is missing.");
      }

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

      const normalizedArray = normalizeCoupons(response.data, requestPayload.type);
      if (normalizedArray.length) return normalizedArray;

      const objectPayload = extractObjectPayload(response.data);
      if (objectPayload?.discountPrice !== undefined) {
        return [objectPayload];
      }

      return response.data;
    } catch (error) {
      console.error("Error in applyCoupon thunk:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(error.response?.data || errorMessage);
    }
  }
);

export const getCouponAppliedHotels = createAsyncThunk(
  "hotel/getCouponAppliedHotels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/get-hotel-list/filter-by-applied-coupons`,
        getAuthHeaders()
      );
      return extractArrayPayload(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeBulkCoupon = createAsyncThunk(
  "hotel/removeBulkCoupon",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/remove-bulk-coupons-from-hotels/by-hotel/id`,
        payload,
        getAuthHeaders()
      );
      toast.success(response?.data?.message || "Coupons removed successfully.");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    coupon: [],
    applied: [],
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
      .addCase(createCoupon.fulfilled, (state, action) => {
        if (action.payload && action.payload.couponCode) {
          state.coupon = [action.payload, ...state.coupon];
        }
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.apply = action.payload;
      })
      .addCase(getCouponAppliedHotels.fulfilled, (state, action) => {
        state.applied = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(removeBulkCoupon.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default couponSlice.reducer;
