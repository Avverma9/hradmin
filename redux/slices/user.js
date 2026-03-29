import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../src/api";

export const findUserByMobile = createAsyncThunk(
    'user/findUserByMobile',
    async (mobile, { rejectWithValue }) => {
        try {
          const response = await api.get(`/get/user/by/query?mobile=${mobile}`);
          if (response.data?.data?.length === 0) {
            return rejectWithValue('User not found');
          }
          return response?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to find user.',
            );
        }
    }
);

export const getAllUsers = createAsyncThunk(
    'user/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/get/all-users-data/all-data');
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch users.',
            );
        }
    }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/Signup", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const filterUsers = createAsyncThunk(
  "user/filterUsers",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users/filter?search=${query}`);
      return response.data;
    } catch (error) {      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        users: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearUser: (state) => {
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(findUserByMobile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.user = null;
            })
            .addCase(findUserByMobile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(findUserByMobile.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload;
            })
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
