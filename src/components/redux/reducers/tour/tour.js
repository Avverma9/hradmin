import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { hotelEmail, localUrl, notify, token } from "../../../../../utils/util";
import { toast } from "react-toastify";

export const addTour = createAsyncThunk("tour/addTour", async (data, { rejectWithValue }) => {
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
});

export const tourList = createAsyncThunk("tour/tourList", async (_, { rejectWithValue }) => {
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
});


export const tourRequest = createAsyncThunk("tour/tourRequest", async (_, { rejectWithValue }) => {
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
});

export const tourById = createAsyncThunk("tour/tourById", async (id, { rejectWithValue }) => {
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
});

export const tourByOwner = createAsyncThunk("tour/tourByOwner", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/get-tour/by-owner/query?email=${hotelEmail}`, {
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
});

export const tourUpdate = createAsyncThunk("tour/tourUpdate", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${localUrl}/update-tour/data/${id}`, data, {
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
export const updateTourImage = createAsyncThunk("tour/tourUpdate", async (formData, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${localUrl}/update-tour-image/${id}`, formData, {
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
const initialState = {
    data: [],
    editData: null,
    loading: false,
    error: null,
};

const tourSlice = createSlice({
    name: "tour",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            .addCase(addTour.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
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
            .addCase(tourUpdate.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex((tour) => tour._id === action.payload._id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

    },
});

export default tourSlice.reducer;
