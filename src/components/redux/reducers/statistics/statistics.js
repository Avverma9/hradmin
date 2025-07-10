import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, token } from "../../../../../utils/util";

export const getHotelDataByYear = createAsyncThunk(
  "statistics/getHotelDataByYear",
  async ( selectedYear , { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/statistics/hotel-data?year=${selectedYear}`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);


export const getPartnersStatistics = createAsyncThunk(
    "statistics/getPartnersStatistics",
    async ( selectedYear , { rejectWithValue }) => {
      try {
        const response = await axios.get(`${localUrl}/statistics/partners-data?year=${selectedYear}`, {
          headers: {
            Authorization: token,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Something went wrong");
      }
    }
  );


  export const getBookingsData = createAsyncThunk(
    "statistics/getBookingsData",
    async ( selectedYear , { rejectWithValue }) => {
      try {
        const response = await axios.get(`${localUrl}/statistics/bookings-data?year=${selectedYear}`, {
          headers: {
            Authorization: token,
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Something went wrong");
      }
    }
  );
const initialState = {
  hotelChartData: [],
  partnersChartData : [],
  loading: false,
  error: null,
};
const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getHotelDataByYear.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelChartData = action.payload;
      })
      .addCase(getPartnersStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.partnersChartData = action.payload;
      })
      .addCase(getBookingsData.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsData = action.payload;
      })
  },
});

export default statisticsSlice.reducer;
