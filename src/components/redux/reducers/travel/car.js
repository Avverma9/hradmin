import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { localUrl, notify, token } from '../../../../../utils/util';
import { toast } from 'react-toastify';

export const addCar = createAsyncThunk('car/addCar', async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${localUrl}/travel/add-a-car`, data, {
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

export const getCarById = createAsyncThunk('car/getCarById', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/travel/get-a-car/${id}`, {
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

export const getCarByOwnerId = createAsyncThunk('car/getCarByOwnerId', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/travel/get-a-car/by-owner/${id}`, {
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


export const getAllCars = createAsyncThunk('car/getAll', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/travel/get-all-car`, {
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

export const filterCar = createAsyncThunk('car/filterCar', async ({query,value}, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/travel/filter-car/by-query?${query}=${value}`, {
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


export const getSeatsData = createAsyncThunk('car/getSeatsData', async (id, { rejectWithValue }) => {
    try {   
        const response = await axios.get(`${localUrl}/travel/get-seat-data/by-id/${id}`, {
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

export const bookSeat = createAsyncThunk('car/bookSeat', async ({id, data}, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${localUrl}/travel/book-a-seat/${id}`, data, {
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
export const deleteCar = createAsyncThunk('car/deleteCar', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`${localUrl}/travel/delete-a-car/${id}`, {
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

export const updateCar = createAsyncThunk('car/updateCar', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axios.patch(`${localUrl}/travel/update-a-car/${id}`, data, {
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

const carSlice = createSlice({
    name: 'car',
    initialState: {
        data: [],
        filterCar: [],
        seatsData: [],
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
            .addCase(addCar.fulfilled, (state, action) => {
                state.data.push(action.payload);
            })
            .addCase(getCarById.fulfilled, (state, action) => {
                state.data = [action.payload];
            })
            .addCase(getSeatsData.fulfilled, (state, action) => {
                state.seatsData = [action.payload];
            }
            )
            .addCase(getAllCars.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(filterCar.fulfilled, (state, action) => {
                state.filterCar = action.payload;
            })
            .addCase(getCarByOwnerId.fulfilled, (state, action) => {
                state.ownerCar = action.payload;
            })
            .addCase(deleteCar.fulfilled, (state, action) => {
                state.data = state.data.filter((car) => car.id !== action.payload.id);
            })
            .addCase(updateCar.fulfilled, (state, action) => {
                const index = state.data.findIndex((car) => car.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            });
    },
});

export default carSlice.reducer;
