import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, notify, token } from "../../../../../utils/util";
import { toast } from "react-toastify";

export const getTravelAmenities = createAsyncThunk(
  "additional/getTravelAmenities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/additional/get/travel-amenities`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
export const addTravelAmenity = createAsyncThunk(
  "additional/addTravelAmenity",
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/add/travel-amenities`,

        name,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
export const deleteTravelAmenity = createAsyncThunk(
  "additional/deleteTravelAmenity",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/delete-travel/amenities/${id}`,

        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getMenuItems = createAsyncThunk(
  "additional/getMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/additional/get-menu-items`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const addMenu = createAsyncThunk(
  "additional/addMenu",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/add-single/menu`,
        formData, // ✅ send as a flat object
        {
          headers: {
            Authorization: token,
          },
        },
      );

      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteMenu = createAsyncThunk(
  "additional/deleteMenu",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/delete-menu-item/${id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getBedTypes = createAsyncThunk(
  "additional/getBedTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/additional/get-bed`, {
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
  },
);

export const addBedTypes = createAsyncThunk(
  "additional/addBedTypes",
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/add-bed`,
        {
          name,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteBedTypes = createAsyncThunk(
  "additional/deleteBedTypes",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/delete-bed/${id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getRoomTypes = createAsyncThunk(
  "additional/getRoomTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/additional/get-room`, {
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
  },
);
export const addRoomTypes = createAsyncThunk(
  "additional/addRoomTypes",
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/add-room`,
        {
          name,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
export const deleteRoomTypes = createAsyncThunk(
  "additional/deleteRoomTypes",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/delete-room/${id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
export const getAmenities = createAsyncThunk(
  "additional/getAmenities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/additional/get-amenities`, {
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
  },
);
export const addAmenity = createAsyncThunk(
  "additional/addAmenity",
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/add-amenities`,
        {
          name: name,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
export const deleteAmenity = createAsyncThunk(
  "additional/deleteAmenity",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/delete-amenity/${id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
export const getRole = createAsyncThunk(
  "additional/getRole",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${localUrl}/additional/roles`, {
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
  },
);

export const addRole = createAsyncThunk(
  "additional/getRole",
  async (roleInput, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/roles`,
        {
          role: roleInput,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteRole = createAsyncThunk(
  "additional/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/roles/${id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);


export const addTourTheme = createAsyncThunk(
  "additional/addTourTheme",
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/additional/add-tour-theme`,
        {
          name: name,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getTourThemes = createAsyncThunk(
  "additional/getTourThemes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/additional/get-tour-themes`,
       
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      console.log("Tour themes fetched successfully:", response.data);
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteTourThemes = createAsyncThunk(
  "additional/deleteTourThemes",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/additional/delete-tour-theme/${id}`,
       
        {
          headers: {
            Authorization: token,
          },
        },
      );
      notify(response.status);
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
const initialState = {
  travelAmenities: [],
  menuItems: [],
  bedTypes: [],
  roomTypes: [],
  tourThemes: [], // Added tourThemes to the initial state
  role: [],
  hotelAmenities: [],
};

const additionalSlice = createSlice({
  name: "additional",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTravelAmenities.fulfilled, (state, action) => {
        state.travelAmenities = action.payload;
      })
      .addCase(getMenuItems.fulfilled, (state, action) => {
        state.menuItems = action.payload;
      })
      .addCase(getBedTypes.fulfilled, (state, action) => {
        state.bedTypes = action.payload;
      })
      .addCase(getRoomTypes.fulfilled, (state, action) => {
        state.roomTypes = action.payload;
      })
      .addCase(getAmenities.fulfilled, (state, action) => {
        state.hotelAmenities = action.payload;
      })
      .addCase(getRole.fulfilled, (state, action) => {
        state.role = action.payload;
      })
      .addCase(getTourThemes.fulfilled, (state, action) => {
        state.tourThemes = action.payload;
      })
  },
});

export default additionalSlice.reducer;
