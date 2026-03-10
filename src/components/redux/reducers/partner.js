import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { token, userId, localUrl, notify } from "../../../../utils/util"; // Ensure localUrl is imported

const buildAuthHeaders = (extraHeaders = {}) => {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    return extraHeaders;
  }

  return {
    Authorization: /^Bearer\s+/i.test(normalizedToken)
      ? normalizedToken
      : `Bearer ${normalizedToken}`,
    ...extraHeaders,
  };
};

const buildPartnerFormData = (payload = {}) => {
  const multipartData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (key === "images") {
      if (value instanceof File) {
        multipartData.append("images", value);
      }
      return;
    }

    multipartData.append(key, value);
  });

  return multipartData;
};

const getUpdatedPartnerRecord = (payload) =>
  payload?.updatedUser ||
  payload?.user ||
  payload?.data ||
  payload?.partner ||
  (payload?._id ? payload : null);

const patchPartnerList = (list, nextRecord) => {
  if (!Array.isArray(list) || !nextRecord?._id) {
    return list;
  }

  return list.map((item) =>
    item?._id === nextRecord._id ? { ...item, ...nextRecord } : item
  );
};

export const addPartner = createAsyncThunk(
  "partner/addPartner",
  async (newUser, { rejectWithValue }) => {
    try {
      const payload =
        newUser instanceof FormData ? newUser : buildPartnerFormData(newUser);

      const response = await axios.post(
        `${localUrl}/create/dashboard/user`,
        payload,
        {
          headers: buildAuthHeaders(
            payload instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : {}
          ),
        },
      );
      notify(response.status);
      return response.data; // Return the data from the response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getPartnerById = createAsyncThunk(
  "partner/getById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/login/dashboard/get/all/user/${userId}`,
        {
          headers: buildAuthHeaders(),
        },
      );

      return response.data; // Return the data from the response
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getAll = createAsyncThunk(
  "partner/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/login/dashboard/get/all/user`,
        {
          headers: buildAuthHeaders(),
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

export const updatedPartner = createAsyncThunk(
  "partner/updatePartner",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const multipartData =
        formData instanceof FormData ? formData : buildPartnerFormData(formData);

      const response = await axios.patch(
        `${localUrl}/update/dashboard/updated/partner/${userId}`,
        multipartData,
        {
          headers: buildAuthHeaders({
            "Content-Type": "multipart/form-data",
          }),
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

export const updateStatus = createAsyncThunk(
  "partner/updateStatus",
  async ({ userId, newStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${localUrl}/update/dashboard/user-status/${userId}`,
        {
          status: newStatus,
        },
        {
          headers: buildAuthHeaders(),
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

export const deletePartner = createAsyncThunk(
  "partner/deletePartner",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${localUrl}/delete/dashboard/delete/partner/${userId}`,
        {
          headers: buildAuthHeaders(),
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

export const updatePartnerImage = createAsyncThunk(
  "partner/updatePartnerImage",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${localUrl}/api/users/${userId}/upload-image`,
        {
          formData,
        },
        {
          headers: buildAuthHeaders(),
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

export const addMenu = createAsyncThunk(
  "partner/addMenu",
  async ({ userId, matchedMenuItems }, { rejectWithValue }) => {
    try {
      const linkIds = (Array.isArray(matchedMenuItems) ? matchedMenuItems : [])
        .map((item) => item?._id || item?.id)
        .filter(Boolean);

      if (!linkIds.length) {
        return { message: "No valid sidebar links selected.", data: null };
      }

      const response = await axios.patch(
        `${localUrl}/additional/sidebar-permissions/${userId}/allow`,
        { linkIds },
        {
          headers: buildAuthHeaders(),
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
  "partner/deleteMenu",
  async (payload, { rejectWithValue }) => {
    try {
      const linkIds = [payload?.menuId].filter(Boolean);
      if (!linkIds.length) {
        return { message: "No valid sidebar link selected.", data: null };
      }

      const response = await axios.patch(
        `${localUrl}/additional/sidebar-permissions/${payload.id}/block`,
        { linkIds },
        {
          headers: buildAuthHeaders(),
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

export const deleteAllmenus = createAsyncThunk(
  "partner/deleteMenu",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${localUrl}/additional/sidebar-permissions/${userId}`,
        {
          mode: "role_based",
          allowedLinkIds: [],
          blockedLinkIds: [],
        },
        {
          headers: buildAuthHeaders(),
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
export const findPartnerByQuery = createAsyncThunk(
  "partner/findPartnerByQuery",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${localUrl}/api/users-get-user/by/query?search=${query}`,
        {
          headers: buildAuthHeaders(),
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
const partnerSlice = createSlice({
  name: "partner",
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
        const updatedRecord = getUpdatedPartnerRecord(action.payload);
        if (updatedRecord) {
          state.allData = patchPartnerList(state.allData, updatedRecord);
          state.data = patchPartnerList(state.data, updatedRecord);
        }
        state.loading = false;
      })
      .addCase(addPartner.fulfilled, (state, action) => {
        state.newUser = action.payload;
        const createdRecord = getUpdatedPartnerRecord(action.payload);
        if (createdRecord?._id) {
          state.allData = Array.isArray(state.allData)
            ? [createdRecord, ...state.allData]
            : [createdRecord];
        }
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
      })
      .addCase(findPartnerByQuery.fulfilled, (state, action) => {
        state.allData = action.payload;
        state.loading = false;
      });
  },
});

export default partnerSlice.reducer;
