/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable consistent-return */
import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { localUrl } from '../../../src/utils/util';

export const getAllDashboardUsers = createAsyncThunk(
  'dashboardSlice/getAllDashboardUsers',
  async () => {
    try {
      const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    dashboardUsers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllDashboardUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardUsers = action.payload;
    });
  
  },
});

export default dashboardSlice.reducer;
