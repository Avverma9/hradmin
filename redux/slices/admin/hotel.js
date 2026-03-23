import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../../src/api'

const normalizeHotelCollection = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.hotels)) return payload.hotels
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.hotels)) return payload.data.hotels
  return []
}

const normalizeRoomCollection = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.rooms)) return payload.rooms
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.rooms)) return payload.data.rooms
  return []
}

const sanitizeFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null) return false
      return String(value).trim() !== ''
    }),
  )

const resolveUpdatedHotel = (payload) => payload?.data || payload?.hotel || payload || null
const resolveUpdatedRoom = (payload) => payload?.data || payload?.room || payload || null

const getEntityId = (entity) => entity?.hotelId || entity?._id || entity?.id || entity?.roomId || ''

const replaceEntityInList = (items, updatedEntity) => {
  const updatedId = getEntityId(updatedEntity)
  return items.map((item) => (getEntityId(item) === updatedId ? { ...item, ...updatedEntity } : item))
}

const mergeSelectedHotel = (selectedHotel, updatedHotel) => {
  if (!selectedHotel || !updatedHotel) return updatedHotel || selectedHotel
  if (selectedHotel?.data) {
    return {
      ...selectedHotel,
      data: {
        ...selectedHotel.data,
        ...updatedHotel,
      },
    }
  }

  return {
    ...selectedHotel,
    ...updatedHotel,
  }
}

export const getHotelsByFilters = createAsyncThunk(
  'admin/getHotelsByFilters',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const sanitizedFilters = sanitizeFilters(filters)
      const response = await api.get('/hotels/filters', {
        params: sanitizedFilters,
      })

      return {
        hotels: normalizeHotelCollection(response.data),
        filters: sanitizedFilters,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to filter hotels.')
    }
  },
)

export const getAllHotels = createAsyncThunk(
  'admin/getAllHotels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/get/all/hotels')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hotels.')
    }
  },
)

export const updateHotel = createAsyncThunk(
  'admin/updateHotel',
  async ({ hotelId, hotelData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/hotels/${hotelId}`, hotelData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update hotel.')
    }
  },
)

export const getHotelById = createAsyncThunk(
  'admin/getHotelById',
  async (hotelId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/hotels/get-by-id/${hotelId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hotel details.')
    }
  },
)

export const getRoomsByHotelEmail = createAsyncThunk(
  'admin/getRoomsByHotelEmail',
  async (hotelEmail, { rejectWithValue }) => {
    try {
      const response = await api.get('/get-list-of/rooms', {
        params: { hotelEmail },
      })
      return {
        hotelEmail,
        payload: response.data,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms.')
    }
  },
)

export const createRoomToHotel = createAsyncThunk(
  'admin/createRoomToHotel',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await api.post('/create-a-room-to-your-hotel', roomData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create room.')
    }
  },
)

export const updateRoom = createAsyncThunk(
  'admin/updateRoom',
  async ({ roomId, roomData }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/update-your/room', {
        roomId,
        ...roomData,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room.')
    }
  },
)

export const deleteRoomById = createAsyncThunk(
  'admin/deleteRoomById',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await api.delete('/delete-rooms-by-id', {
        data: { roomId },
      })
      return {
        roomId,
        payload: response.data,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room.')
    }
  },
)

const hotelSlice = createSlice({
  name: 'hotel',
  initialState: {
    hotels: [],
    allHotels: [],
    selectedHotel: null,
    rooms: [],
    roomHotelEmail: '',
    filters: {},
    loading: false,
    updating: false,
    roomsLoading: false,
    roomSaving: false,
    error: null,
    updateSuccess: null,
    roomSuccess: null,
  },
  reducers: {
    clearHotelUpdateStatus: (state) => {
      state.updateSuccess = null
      state.error = null
    },
    clearRoomStatus: (state) => {
      state.roomSuccess = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllHotels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllHotels.fulfilled, (state, action) => {
        const normalizedHotels = normalizeHotelCollection(action.payload)
        state.loading = false
        state.hotels = normalizedHotels
        state.allHotels = normalizedHotels
        state.filters = {}
      })
      .addCase(getAllHotels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getHotelsByFilters.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHotelsByFilters.fulfilled, (state, action) => {
        state.loading = false
        state.hotels = action.payload.hotels
        state.filters = action.payload.filters || {}
      })
      .addCase(getHotelsByFilters.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getHotelById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHotelById.fulfilled, (state, action) => {
        const hotelPayload = action.payload?.data || action.payload
        state.loading = false
        state.selectedHotel = action.payload
        state.rooms = normalizeRoomCollection(hotelPayload?.rooms)
      })
      .addCase(getHotelById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateHotel.pending, (state) => {
        state.updating = true
        state.error = null
        state.updateSuccess = null
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        const updatedHotel = resolveUpdatedHotel(action.payload)
        state.updating = false
        state.updateSuccess = action.payload?.message || 'Hotel updated successfully.'
        if (updatedHotel) {
          state.selectedHotel = mergeSelectedHotel(state.selectedHotel, updatedHotel)
          state.hotels = replaceEntityInList(state.hotels, updatedHotel)
          state.allHotels = replaceEntityInList(state.allHotels, updatedHotel)
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })
      .addCase(getRoomsByHotelEmail.pending, (state) => {
        state.roomsLoading = true
        state.error = null
      })
      .addCase(getRoomsByHotelEmail.fulfilled, (state, action) => {
        state.roomsLoading = false
        state.roomHotelEmail = action.payload.hotelEmail
        state.rooms = normalizeRoomCollection(action.payload.payload)
      })
      .addCase(getRoomsByHotelEmail.rejected, (state, action) => {
        state.roomsLoading = false
        state.error = action.payload
      })
      .addCase(createRoomToHotel.pending, (state) => {
        state.roomSaving = true
        state.roomSuccess = null
        state.error = null
      })
      .addCase(createRoomToHotel.fulfilled, (state, action) => {
        const createdRoom = resolveUpdatedRoom(action.payload)
        state.roomSaving = false
        state.roomSuccess = action.payload?.message || 'Room created successfully.'
        if (createdRoom) {
          state.rooms = [createdRoom, ...state.rooms]
        }
      })
      .addCase(createRoomToHotel.rejected, (state, action) => {
        state.roomSaving = false
        state.error = action.payload
      })
      .addCase(updateRoom.pending, (state) => {
        state.roomSaving = true
        state.roomSuccess = null
        state.error = null
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const updatedRoom = resolveUpdatedRoom(action.payload)
        state.roomSaving = false
        state.roomSuccess = action.payload?.message || 'Room updated successfully.'
        if (updatedRoom) {
          state.rooms = replaceEntityInList(state.rooms, updatedRoom)
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.roomSaving = false
        state.error = action.payload
      })
      .addCase(deleteRoomById.pending, (state) => {
        state.roomSaving = true
        state.roomSuccess = null
        state.error = null
      })
      .addCase(deleteRoomById.fulfilled, (state, action) => {
        state.roomSaving = false
        state.roomSuccess = action.payload.payload?.message || 'Room deleted successfully.'
        state.rooms = state.rooms.filter((room) => getEntityId(room) !== action.payload.roomId)
      })
      .addCase(deleteRoomById.rejected, (state, action) => {
        state.roomSaving = false
        state.error = action.payload
      })
  },
})

export const { clearHotelUpdateStatus, clearRoomStatus } = hotelSlice.actions
export default hotelSlice.reducer
