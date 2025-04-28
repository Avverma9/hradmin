import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, notify } from "../../../../../utils/util";
import { toast } from "react-toastify";

// You should replace this with however your token is stored (e.g., localStorage, cookies, context, etc.)
const token = localStorage.getItem("token");

export const fetchTravelBookings = createAsyncThunk(
    "travel/fetchTravelBookings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${localUrl}/travel/get-travels-bookings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
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

const travelBookingSlice = createSlice({
    name: "travelBooking",
    initialState: {
        travelBookings: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            .addCase(fetchTravelBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.travelBookings = action.payload;
                state.error = null;
            })

    },
});

export default travelBookingSlice.reducer;
