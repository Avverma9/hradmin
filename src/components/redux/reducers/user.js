import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { localUrl, token } from '../../../../utils/util';
import { toast } from 'react-toastify';

export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${localUrl}/get/all-users-data/all-data`, {
      headers: { Authorization: token },
    });
    return response?.data?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(`Error: ${errorMessage}`);
    return rejectWithValue(errorMessage);
  }
});

export const findUser = createAsyncThunk('user/findUser', async (mobile, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${localUrl}/get/user/by/query?mobile=${mobile}`, {
      headers: { Authorization: token },
    });
    return response?.data?.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(`Error: ${errorMessage}`);
    return rejectWithValue(errorMessage);
  }
});

export const fetchBulkUser = createAsyncThunk(
  'user/fetchBulkUser',
  async (userIds, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/get-user-data/in-bulk`,
        { userIds }, // body
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      return response?.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const userDetails = createAsyncThunk(
  'user/userDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/get-all-users-booking-details/full-details`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      return response?.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(findUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(findUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(findUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userData = [];
      })
      .addCase(fetchBulkUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.users; // ✅ extract only the `users` array
      })
      .addCase(userDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload; // ✅ extract only the `users` array
      })
      
  },
});

export default userSlice.reducer;
