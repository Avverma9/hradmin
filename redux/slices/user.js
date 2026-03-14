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

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
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
            });
    },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
