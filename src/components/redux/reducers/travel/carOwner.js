import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { hotelEmail, localUrl, notify, token } from '../../../../../utils/util';
import { toast } from 'react-toastify';

export const addCarOwner = createAsyncThunk('owner/addCarOwner', async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${localUrl}/travel/add-an-owner`, data, {
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

export const getCarOwnerById = createAsyncThunk('owner/getCarOwnerById', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/travel/get-an-owner/${id}`, {
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

export const getAllOwner = createAsyncThunk('owner/getAllOwner', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/travel/get-all-owner`, {
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

export const getCarOwnerByEmail = createAsyncThunk('owner/getCarOwnerByEmail', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${localUrl}/travel/get-an-owner/email?email=${hotelEmail}`, {
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


export const deleteCarOwner = createAsyncThunk('owner/deleteCarOwner', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`${localUrl}/travel/delete-an-owner/${id}`, {
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

export const updateCarOwner = createAsyncThunk('owner/updateCarOwner', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${localUrl}/travel/update-an-owner/${id}`, data, {
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

const ownerSlice = createSlice({
    name: 'onwer',
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCarOwner.fulfilled, (state, action) => {
                state.data.push(action.payload);
            })
            .addCase(getCarOwnerById.fulfilled, (state, action) => {
                state.data = [action.payload];
            })
            .addCase(getAllOwner.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(getCarOwnerByEmail.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(deleteCarOwner.fulfilled, (state, action) => {
                state.data = state.data.filter((owner) => owner.id !== action.payload.id);
            })
            .addCase(updateCarOwner.fulfilled, (state, action) => {
                const index = state.data.findIndex((owner) => owner.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            });
    },
});

export default ownerSlice.reducer;
