import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { hotelEmail, localUrl, notify, token } from "../../../../../utils/util";

export const addTour = createAsyncThunk(
  "tour/addTour",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${localUrl}/create-tour`, data, {
        headers: {
          Authorization: token,
        },
      });
      notify(response?.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const tourList = createAsyncThunk(
  "tour/tourList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/get-tour-list`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const tourRequest = createAsyncThunk(
  "tour/tourRequest",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/get-requests`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const tourById = createAsyncThunk(
  "tour/tourById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/get-tour/${id}`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const tourByOwner = createAsyncThunk(
  "tour/tourByOwner",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/get-tour/by-owner/query?email=${hotelEmail}`,
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

export const updateTour = createAsyncThunk(
  "tour/updateTour",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/update-tour/data/${id}`,
        data,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response?.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateTourImage = createAsyncThunk(
  "tour/updateTourImage",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/update-tour-image/${id}`,
        formData,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response?.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);
export const deleteTourImage = createAsyncThunk(
  "tour/deleteTourImage",
  async ({ id, index }, { rejectWithValue }) => {
    try {
      // Must send DELETE body via `data` property in axios config
      const response = await axios.delete(
        `${localUrl}/delete-tour-image/${id}`,
        {
          data: { index },
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response?.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSeatMap = createAsyncThunk(
  "travel/fetchSeatMap",
  async ({ tourId, vehicleId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/tours/${tourId}/vehicles/${vehicleId}/seats`
      );
      return { tourId, vehicleId, seats: response?.data?.seats || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const bookNow = createAsyncThunk(
  "travel/bookNow",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/tour-booking/create-tour-booking`,
        data
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getBookings = createAsyncThunk(
  "travel/getBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/tour-booking/get-bookings/by-agency-email/${hotelEmail}`
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAllBookings = createAsyncThunk(
  "tour/getAllBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${localUrl}/tour-booking/get-bookings`);
      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  data: [],
  bookings: [],
  allBookings: [],
  editData: null,
  loading: false,
  error: null,
  seatMapByKey: {},
};

const tourSlice = createSlice({
  name: "tour",
  initialState,

  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.loading = false;
      })
     
      .addCase(getAllBookings.fulfilled, (s, a) => {
        s.loading = false;
        s.allBookings = a.payload;
      })
      .addCase(addTour.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(bookNow.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(tourList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(tourByOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(tourRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(tourById.fulfilled, (state, action) => {
        state.loading = false;
        state.editData = [action.payload];
      })
      .addCase(updateTour.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(
          (tour) => tour._id === action.payload._id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      .addCase(fetchSeatMap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeatMap.fulfilled, (state, action) => {
        const { tourId, vehicleId, seats } = action.payload;
        state.loading = false;
        state.seatMapByKey[tourId + ":" + vehicleId] = seats;
      })
      .addCase(fetchSeatMap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export default tourSlice.reducer;
