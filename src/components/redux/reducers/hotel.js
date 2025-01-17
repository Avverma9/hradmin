import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { localUrl, notify, token } from '../../../../utils/util';

export const getAllHotels = createAsyncThunk('hotel/getAllHotels', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/get/all/hotels`, {
            headers: {
                Authorization: token,
            },
        });
        //   notify(response.status);
        return response?.data?.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const getHotelById = createAsyncThunk('hotel/getHotelById', async (hotelId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/hotels/get-by-id/${hotelId}`, {
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

export const getHotelByQuery = createAsyncThunk('hotel/getHotelByQuery', async (hotelEmail, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/hotels/query/get/by?hotelEmail=${hotelEmail}`, {
            headers: {
                Authorization: token,
            },
        });
        //   notify(response.status);
        return response.data;
    } catch (error) {
        const errorMessage = error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});
export const getHotelsByFilters = createAsyncThunk('hotel/getHotelsByFilters', async (query, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/hotels/filters/?search=${query}`, {
            headers: {
                Authorization: token,
            },
        });
        //   notify(response.status);
        return response.data;
    } catch (error) {
        const errorMessage = error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});
export const addFood = createAsyncThunk('hotel/addFood', async (formData, { rejectWithValue }) => {
    try {
        const response = axios.post(`${localUrl}/add/food-to/your-hotel`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token,
            },
        });
        notify(response.status);
        return response.data;
    } catch (error) {
        const errorMessage = error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

export const deleteFood = createAsyncThunk('hotel/deleteFood', async ({ hotelId, foodId }, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`${localUrl}/delete-food/${hotelId}/${foodId}`, {
            headers: {
                Authorization: token,
            },
        });
        notify(response.status);
        return response.data;
    } catch (error) {
        const errorMessage = error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
});

const hotelSlice = createSlice({
    name: 'hotel',
    initialState: {
        data: [],
        byQuery: [],
        byFilter: [],
        byId: [],
        coupon: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllHotels.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getHotelByQuery.fulfilled, (state, action) => {
                state.byQuery = action.payload;
            })
            .addCase(getHotelsByFilters.fulfilled, (state, action) => {
                state.byFilter = action.payload;
            })
            .addCase(getHotelById.fulfilled, (state, action) => {
                state.byId = action.payload;
            })
            .addCase(addFood.fulfilled, (state, action) => {
                state.addFood = action.payload;
            })
            .addCase(deleteFood.fulfilled, (state, action) => {
                state.addFood = action.payload;
            });
    },
});

export default hotelSlice.reducer;
