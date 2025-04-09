import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { localUrl, notify, token } from "../../../../../utils/util";
import axios from "axios";
import { toast } from "react-toastify"; // Assuming you're using react-toastify

export const addTour = createAsyncThunk("tour/addTour", async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${localUrl}/create-travel`, data, {
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
});

export const tourList = createAsyncThunk("tour/tourList", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/get-travel-list`, {
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
});

const tourSlice = createSlice({
    name: "tour",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addTour.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload); // Add the new tour to the list
            })
            .addCase(tourList.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload; // Update the data field with the fetched tours
            })
    },
});

export default tourSlice.reducer;
