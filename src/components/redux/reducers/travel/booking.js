import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, notify, token } from "../../../../../utils/util";
import { toast } from "react-toastify";

export const fetchTravelBookings = createAsyncThunk(
    "travel/fetchTravelBookings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${localUrl}/travel/get-travels-bookings`, {
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

export const updateTravelBooking = createAsyncThunk(
    'travel/updateTravelBooking',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(
                `${localUrl}/travel/update-travel/booking`,
                { id, data },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            if (response?.status >= 200 && response?.status < 300) {
                toast.success('Booking updated successfully!');
            }

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || 'Unknown error';
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
