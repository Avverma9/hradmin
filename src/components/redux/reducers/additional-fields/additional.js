import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { localUrl, notify, token } from "../../../../../utils/util";
import { toast } from "react-toastify";
import { SIDEBAR_LINK_SEED_DATA } from "../../../dashboard/sidebar-links-seed";

const ADMIN_SIDEBAR_ROLES = new Set([
  "Admin",
  "Developer",
  "superAdmin",
  "SuperAdmin",
]);

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeRoles = (roleInput) => {
  if (Array.isArray(roleInput)) {
    return roleInput.map((role) => String(role).trim()).filter(Boolean);
  }

  if (typeof roleInput === "string") {
    return roleInput
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeStatus = (statusInput) =>
  String(statusInput || "active").toLowerCase() === "inactive"
    ? "inactive"
    : "active";

const normalizeBooleanFlag = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const normalizeRoutePath = (path = "") => {
  const value = String(path || "").trim();
  if (!value) return "";
  if (value === "#") return "";
  return value.startsWith("/") ? value : `/${value}`;
};

const parseOrderValue = (orderInput) => {
  if (orderInput === undefined || orderInput === null) return undefined;

  const rawValue = String(orderInput).trim();
  if (!rawValue) return undefined;

  const parsedValue = Number(rawValue);
  if (!Number.isInteger(parsedValue)) return undefined;

  return parsedValue;
};

const buildSidebarLinkPayload = (formData = {}) => {
  const roles = normalizeRoles(formData.role);
  const normalizedChildLink = normalizeRoutePath(
    formData.childLink || formData.path
  );
  const normalizedRoute = normalizeRoutePath(formData.route);
  const isParentOnly = normalizeBooleanFlag(formData.isParentOnly);
  const status = normalizeStatus(formData.status);
  const icon = String(formData.icon || "MdDashboard").trim() || "MdDashboard";

  const payload = {
    parentLink: String(formData.parentLink || formData.title || "").trim(),
    isParentOnly,
    icon,
    status,
    role: roles.length ? roles : ["Admin"],
  };

  if (normalizedChildLink) {
    payload.childLink = normalizedChildLink;
  } else if (normalizedRoute) {
    payload.route = normalizedRoute;
  }

  const parsedOrder = parseOrderValue(formData.order);
  if (parsedOrder !== undefined) {
    payload.order = parsedOrder;
  }

  return payload;
};

const formatPathToTitle = (path = "") => {
  const cleanPath = String(path || "")
    .split("?")[0]
    .replace(/^\/+|\/+$/g, "");

  if (!cleanPath) return "Home";

  const lastSegment = cleanPath.split("/").filter(Boolean).pop() || "Home";
  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildAuthHeaders = () => ({
  headers: {
    Authorization: token,
  },
});

const normalizeSidebarMenuItem = (item = {}) => {
  const roles = normalizeRoles(item.role);
  const status = String(item.status || (item.isActive === false ? "inactive" : "active")).toLowerCase();
  const parentLink = item.parentLink || item.group || item.title || "";
  const rawChildLink = item.childLink || item.path || item.route || "";
  const path = normalizeRoutePath(rawChildLink);
  const isParentOnly =
    normalizeBooleanFlag(item.isParentOnly) || String(rawChildLink).trim() === "#";
  const childTitle =
    item.childTitle ||
    item.label ||
    (path ? formatPathToTitle(path) : isParentOnly ? "Parent Only" : "");

  const parsedOrder = Number(item.order);

  return {
    ...item,
    _id: item._id || item.id,
    title: item.title || (childTitle ? `${parentLink} / ${childTitle}` : parentLink),
    path,
    parentLink,
    childLink: path || (isParentOnly ? "#" : ""),
    childTitle,
    role: roles.length ? roles.join(", ") : "General",
    roles,
    status,
    isParentOnly,
    order: Number.isFinite(parsedOrder) ? parsedOrder : undefined,
    isActive: status === "active",
  };
};

const getSidebarIdentityKey = (item = {}) => {
  const parentLink = String(item.parentLink || "").trim().toLowerCase();
  const childLink = String(item.childLink || "").trim().toLowerCase();
  const normalizedPath = normalizeRoutePath(childLink);
  const pathKey = normalizedPath || (item.isParentOnly ? "#" : "");

  if (!parentLink || !pathKey) return "";
  return `${parentLink}::${pathKey.toLowerCase()}`;
};

const dedupeSidebarMenuItems = (items = []) => {
  const dedupedItemsMap = new Map();

  items.forEach((item) => {
    const key = getSidebarIdentityKey(item);
    if (!key) return;

    const existing = dedupedItemsMap.get(key);
    if (!existing) {
      dedupedItemsMap.set(key, item);
      return;
    }

    const currentOrder = Number.isFinite(Number(item.order))
      ? Number(item.order)
      : Number.MAX_SAFE_INTEGER;
    const existingOrder = Number.isFinite(Number(existing.order))
      ? Number(existing.order)
      : Number.MAX_SAFE_INTEGER;

    if (currentOrder < existingOrder) {
      dedupedItemsMap.set(key, item);
    }
  });

  return Array.from(dedupedItemsMap.values());
};

const isSidebarAdminRole = () => {
  const currentRole = sessionStorage.getItem("user_role");
  return ADMIN_SIDEBAR_ROLES.has(currentRole);
};

const cleanupSidebarDuplicates = async (items = []) => {
  if (!isSidebarAdminRole()) {
    return dedupeSidebarMenuItems(items);
  }

  const keepByKey = new Map();
  const duplicateIdsToDelete = [];

  items.forEach((item) => {
    const key = getSidebarIdentityKey(item);
    if (!key) return;

    const itemId = item._id || item.id;
    const existing = keepByKey.get(key);
    if (!existing) {
      keepByKey.set(key, item);
      return;
    }

    const currentOrder = Number.isFinite(Number(item.order))
      ? Number(item.order)
      : Number.MAX_SAFE_INTEGER;
    const existingOrder = Number.isFinite(Number(existing.order))
      ? Number(existing.order)
      : Number.MAX_SAFE_INTEGER;

    if (currentOrder < existingOrder) {
      const existingId = existing._id || existing.id;
      if (existingId) duplicateIdsToDelete.push(existingId);
      keepByKey.set(key, item);
      return;
    }

    if (itemId) duplicateIdsToDelete.push(itemId);
  });

  const uniqueDuplicateIds = Array.from(new Set(duplicateIdsToDelete.filter(Boolean)));
  if (uniqueDuplicateIds.length) {
    await Promise.allSettled(
      uniqueDuplicateIds.map((id) =>
        axios.delete(`${localUrl}/additional/sidebar-links/${id}`, buildAuthHeaders())
      )
    );
  }

  return Array.from(keepByKey.values());
};

const ensureSidebarSeedData = async () => {
  try {
    const response = await axios.get(`${localUrl}/additional/sidebar-links`, buildAuthHeaders());
    const existingLinksRaw = extractArrayPayload(response.data).map(normalizeSidebarMenuItem);
    const existingLinks = await cleanupSidebarDuplicates(existingLinksRaw);
    const existingPaths = new Set(existingLinks.map((item) => item.childLink));

    const missingLinks = SIDEBAR_LINK_SEED_DATA.filter(
      (item) => !existingPaths.has(item.childLink)
    );

    if (missingLinks.length) {
      await axios.post(
        `${localUrl}/additional/sidebar-links/bulk`,
        missingLinks,
        buildAuthHeaders()
      );
    }
  } catch {
    // Seed is best-effort; list fetch below still works for non-admin users.
  }
};

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
      await ensureSidebarSeedData();

      const response = await axios.get(
        `${localUrl}/additional/sidebar-links`,
        buildAuthHeaders(),
      );
      const normalizedItems = extractArrayPayload(response.data).map(normalizeSidebarMenuItem);
      const dedupedItems = dedupeSidebarMenuItems(normalizedItems);

      return dedupedItems
        .filter(
          (item) =>
            item.parentLink &&
            (item.path || item.isParentOnly || item.childLink === "#")
        )
        .sort(
          (a, b) =>
            (Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER) -
              (Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER) ||
            a.parentLink.localeCompare(b.parentLink) ||
            String(a.path || a.childLink || "").localeCompare(
              String(b.path || b.childLink || "")
            )
        );
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
      const payload = buildSidebarLinkPayload(formData);

      if (
        !payload.parentLink ||
        (!payload.isParentOnly && !payload.childLink && !payload.route)
      ) {
        throw new Error(
          "parentLink is required and childLink/route is required when isParentOnly=false"
        );
      }

      const response = await axios.post(
        `${localUrl}/additional/sidebar-links`,
        payload,
        buildAuthHeaders(),
      );

      notify(response.status);
      return normalizeSidebarMenuItem(response.data?.data || response.data);
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
        `${localUrl}/additional/sidebar-links/${id}`,
        buildAuthHeaders(),
      );
      notify(response.status);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);


export const changeMenuStatus = createAsyncThunk(
  "additional/changeMenuStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const id = typeof payload === "string" ? payload : payload?.id;
      const nextStatus =
        String(typeof payload === "string" ? "inactive" : payload?.status || "inactive").toLowerCase() === "active"
          ? "active"
          : "inactive";

      if (!id) {
        throw new Error("Menu id is required");
      }

      const response = await axios.patch(
        `${localUrl}/additional/sidebar-links/${id}/status`,
        {
          status: nextStatus,
        },
        buildAuthHeaders(),
      );
      notify(response.status);
      return normalizeSidebarMenuItem({
        ...(response.data?.data || response.data),
        _id: response.data?.data?._id || response.data?._id || id,
        status: response.data?.data?.status || response.data?.status || nextStatus,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);

export const reorderMenuItems = createAsyncThunk(
  "additional/reorderMenuItems",
  async (items, { rejectWithValue }) => {
    try {
      const orderedItems = Array.isArray(items) ? items : [];
      const updates = orderedItems
        .map((item, index) => {
          const id = item?._id || item?.id;
          const currentOrder = Number(item?.order);
          const nextOrder = index + 1;

          return {
            id,
            order: nextOrder,
            hasOrderChanged:
              !Number.isFinite(currentOrder) || currentOrder !== nextOrder,
          };
        })
        .filter((item) => item.id && item.hasOrderChanged)
        .map(({ id, order }) => ({ id, order }));

      if (!updates.length) {
        return [];
      }

      const headersConfig = buildAuthHeaders();
      const bulkPayloadCandidates = [
        { updates },
        { items: updates },
        { links: updates },
        updates,
      ];
      const bulkEndpoints = [
        `${localUrl}/additional/sidebar-links/reorder`,
        `${localUrl}/additional/sidebar-links/order`,
      ];

      let lastBulkError = null;
      let bulkUpdated = false;

      for (const endpoint of bulkEndpoints) {
        for (const payload of bulkPayloadCandidates) {
          try {
            const response = await axios.patch(endpoint, payload, headersConfig);
            notify(response.status);
            bulkUpdated = true;
            break;
          } catch (error) {
            lastBulkError = error;
          }
        }

        if (bulkUpdated) break;
      }

      if (!bulkUpdated) {
        try {
          await Promise.all(
            updates.map(({ id, order }) =>
              axios.put(
                `${localUrl}/additional/sidebar-links/${id}`,
                { order },
                headersConfig
              )
            )
          );
          notify(200);
        } catch (fallbackError) {
          throw fallbackError || lastBulkError;
        }
      }

      return updates;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
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
