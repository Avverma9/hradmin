import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { localUrl, notify, token } from "../../../../utils/util";

export const changeHotelStatus = createAsyncThunk("bulk/changeHotelStatus", async (payload, { rejectWithValue }) => {
    try {
        const response = await axios.patch(
            `${localUrl}/remove-bulk-hotel-from-hotels/by-hotel/ids`,
            payload,
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
export const bulkDelete = createAsyncThunk("bulk/bulkDelete", async (payload, { rejectWithValue }) => {
    try {
        const response = await axios.delete(
            `${localUrl}/delete-bulk-hotels-from-list-of-hotels/by-ids`,
            {
                data: payload,
                headers: {
                    Authorization: token,
                },
            }
        );
        notify(response.status);
        return response.data;
    }
    catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Error: ${errorMessage}`);
        return rejectWithValue(errorMessage);
    }
}
);
const bulkSlice = createSlice({
    name: "bulk",
    initialState: {
        loading: false,
        error: null,
        success: null,
    },
    reducers: {
        resetBulkState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(changeHotelStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message || "Bulk operation successful!";
            })
            .addCase(bulkDelete.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message || "Bulk operation successful!";
            })
    },
});

export default bulkSlice.reducer;