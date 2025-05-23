import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, showSnackbar, token } from "../../../../utils/util";
import { toast } from "react-toastify";

// Async Thunks
export const createGst = createAsyncThunk(
  "gst/createGst",
  async (payload) => {
    const response = await axios.post(`${localUrl}/gst/create-gst`, payload, {
      headers: { Authorization: token },
    });
    return response.data;
  }
);

export const updateGst = createAsyncThunk(
  "gst/updateGst",
  async (payload) => {
    const response = await axios.patch(`${localUrl}/gst/update-gst`, payload, {
      headers: { Authorization: token },
    });
    return response.data;
  }
);
export const deleteGst = createAsyncThunk(
  "gst/deleteGst",
  async (id) => {
    const response = await axios.delete(
      `${localUrl}/gst/delete-gst/${id}`,
      {
        headers: { Authorization: token },
      }
    );
    return response.data;
  }
);
export const getGst = createAsyncThunk(
  "gst/getGst",
  async (payload) => {
    const response = await axios.get(
      `${localUrl}/gst/get-single-gst?type=${payload?.type}&gstThreshold=${payload?.gstThreshold}`,
      {
        headers: { Authorization: token },
      }
    );
    return response.data;
  }
);

export const getAllGst = createAsyncThunk(
  "gst/getAllGst",
  async () => {
    const response = await axios.get(`${localUrl}/gst/get-all-gst`, {
      headers: { Authorization: token },
    });
    return response.data;
  }
);

// Initial state
const initialState = {
  gst: null,
  gstList: [],
};

// Slice
const gstSlice = createSlice({
  name: "gst",
  initialState,
  reducers: {
    resetGst: (state) => {
      state.gst = null;
      state.gstList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGst.fulfilled, (state, action) => {
        state.gst = action.payload;
        showSnackbar("GST created successfully", "success");
      })
      .addCase(updateGst.fulfilled, (state, action) => {
        state.gst = action.payload;
        showSnackbar("GST updated successfully", "success");
      })
      .addCase(deleteGst.fulfilled, (state, action) => {
        state.gstList = state.gstList.filter((gst) => gst._id !== action.payload.id);
        showSnackbar("GST deleted successfully", "success");
      })
      .addCase(getGst.fulfilled, (state, action) => {
        state.gst = action.payload;
      })
      .addCase(getAllGst.fulfilled, (state, action) => {
        state.gstList = action.payload;
      });
  },
});

export const { resetGst } = gstSlice.actions;
export default gstSlice.reducer;
