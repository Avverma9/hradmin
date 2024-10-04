import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { token, userId } from '../../../utils/util';
export const getPartnerById = createAsyncThunk('', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${localUrl}/login/dashboard/get/all/user/${userId}`, {
      headers: {
        'Authorization': token,
      },
    });
    if (!response.ok) {
      toast.error('It seems an error !');
    }
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
const partnerSlice = createSlice({
  name: 'partner',
  initialState: {
    data: null,
  },
  extraReducers: (builder) => {
    builder.addCase(getPartnerById.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
  },
});
export default partnerSlice.reducer;