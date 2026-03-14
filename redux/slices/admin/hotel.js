import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../src/api";

const normalizeHotelCollection = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.hotels)) {
        return payload.hotels;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    return [];
};

export const getAllHotels = createAsyncThunk(
    'admin/getAllHotels',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/get/all/hotels');
            return response.data;
        } catch {
            return rejectWithValue('Failed to fetch hotels.');
        }
    }
);

export const getHotelById = createAsyncThunk(
    'admin/getHotelById',
    async (hotelId, { rejectWithValue }) => {
        try {
            // Simulate an API call to fetch hotel details by ID
            const response = await api.get(`/hotels/get-by-id/${hotelId}`);
            return response.data;
        } catch {
            return rejectWithValue('Failed to fetch hotel details.');
        }
    }
);
const hotelSlice = createSlice({
    name: 'hotel',
    initialState: {
        hotels: [],
        selectedHotel: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllHotels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllHotels.fulfilled, (state, action) => {
                state.loading = false;
                state.hotels = normalizeHotelCollection(action.payload);
            })
            .addCase(getAllHotels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getHotelById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHotelById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedHotel = action.payload;
            })
            .addCase(getHotelById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default hotelSlice.reducer;
