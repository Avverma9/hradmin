import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, token } from "../../../../utils/util";
import { toast } from "react-toastify";

export const getTravelAmenities = createAsyncThunk(
  "car/getTravelAmenities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/additional/get/travel-amenities`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

const addtionalSlice = createSlice({
  name: "additional",
  initialState: {
    travelAmenities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTravelAmenities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});
export default addtionalSlice.reducer;
