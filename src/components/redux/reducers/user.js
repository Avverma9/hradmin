import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { localUrl, token } from '../../../../utils/util';
import { toast } from 'react-toastify';

// Thunks for API calls

// Fetch all users
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

// Find a specific user by mobile number
export const findUser = createAsyncThunk('user/finduser', async (mobile, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${localUrl}/get/user/by/query?mobile=${mobile}`, {
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

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: [],  // The user data
    loading: false, // Loading state for API calls
    error: null,    // Error state
  },
  reducers: {
    // You can add reducers here to handle specific actions if needed
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true; // Set loading to true when the API call is pending
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false; // Set loading to false when the API call is successful
      state.userData = action.payload; // Store the user data in the state
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false; // Set loading to false on failure
      state.error = action.payload; // Store the error message in the state
    });

    // Find a specific user
    builder.addCase(findUser.pending, (state) => {
      state.loading = true; // Set loading to true when the API call is pending
    });
    builder.addCase(findUser.fulfilled, (state, action) => {
      state.loading = false; // Set loading to false when the API call is successful
      state.userData = action.payload; // Store the found user data in the state
    });
    builder.addCase(findUser.rejected, (state, action) => {
      state.loading = false; // Set loading to false on failure
      state.error = action.payload; // Store the error message in the state
      state.userData = []; // Clear user data on failure to ensure no old data persists
    });
  },
});

export default userSlice.reducer;
