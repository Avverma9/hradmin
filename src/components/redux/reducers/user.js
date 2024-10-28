import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { localUrl, notify, token } from '../../../../utils/util';
import { toast } from 'react-toastify';

export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${localUrl}/get/all-users-data/all-data`, {
      headers: {
        Authorization: token,
      },
    });
    return response?.data?.data; // Return the data to be used in fulfilled case
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(`Error: ${errorMessage}`);
    return rejectWithValue(errorMessage);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userData = action.payload;
      });
  },
});

export default userSlice.reducer;
