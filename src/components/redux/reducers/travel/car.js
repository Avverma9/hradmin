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
        return response.data; // Assuming response.data contains the newly added car information
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
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCar.pending, (state) => {
                state.loading = true;
            })
            .addCase(addCar.fulfilled, (state, action) => {
                state.data.push(action.payload); // Add the new car to the data array
                state.loading = false;
            })
            .addCase(addCar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default carSlice.reducer;
