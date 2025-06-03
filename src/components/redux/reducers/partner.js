import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { token, userId, localUrl, notify } from '../../../../utils/util'; // Ensure localUrl is imported

export const addPartner = createAsyncThunk(
  'partner/addPartner',
  async (newUser, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${localUrl}/create/dashboard/user`, newUser, {
        headers: {
          Authorization: token,
        },
      });
      notify(response.status);
      return response.data; // Return the data from the response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getPartnerById = createAsyncThunk(
  'partner/getById',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/login/dashboard/get/all/user/${userId}`, {
        headers: {
          Authorization: token,
        },
      });

      return response.data; // Return the data from the response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAll = createAsyncThunk('partner/getAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${localUrl}/login/dashboard/get/all/user`, {
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

export const updatedPartner = createAsyncThunk(
  'partner/updatePartner',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/update/dashboard/updated/partner/${userId}`,
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateStatus = createAsyncThunk(
  'partner/updateStatus',
  async ({ userId, newStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${localUrl}/update/dashboard/user-status/${userId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deletePartner = createAsyncThunk(
  'partner/deletePartner',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${localUrl}/delete/dashboard/delete/partner/${userId}`, {
        headers: {
          Authorization: token,
        },
      });
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updatePartnerImage = createAsyncThunk(
  'partner/updatePartnerImage',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/api/users/${userId}/upload-image`,
        {
          formData,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addMenu = createAsyncThunk(
  'partner/addMenu',
  async ({ userId, matchedMenuItems }, { rejectWithValue }) => {
    console.log("matced menu items", matchedMenuItems)
    try {
      const response = await axios.post(
        `${localUrl}/api/users/${userId}/menu-items`,
        { menuItems: matchedMenuItems },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteMenu = createAsyncThunk(
  'partner/deleteMenu',
  async ({ userId, item }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${localUrl}/api/users/${userId}/menu-items`,
        { menuId: item._id },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

const partnerSlice = createSlice({
  name: 'partner',
  initialState: {
    data: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPartnerById.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(getAll.fulfilled, (state, action) => {
        state.allData = action.payload;
        state.loading = false;
      })
      .addCase(updatedPartner.fulfilled, (state, action) => {
        state.updated = action.payload;
        state.loading = false;
      })
      .addCase(addPartner.fulfilled, (state, action) => {
        state.newUser = action.payload;
        state.loading = false;
      })
      .addCase(deletePartner.fulfilled, (state, action) => {
        state.delete = action.payload;
        state.loading = false;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.status = action.payload;
        state.loading = false;
      })
      .addCase(updatePartnerImage.fulfilled, (state, action) => {
        state.partnerImage = action.payload;
        state.loading = false;
      })
      .addCase(addMenu.fulfilled, (state, action) => {
        state.menuAdd = action.payload;
        state.loading = false;
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.menuDelete = action.payload;
        state.loading = false;
      });
  },
});

export default partnerSlice.reducer;
