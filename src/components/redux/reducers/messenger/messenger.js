import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { localUrl, token } from "../../../../../utils/util";

// ------------------ Async Thunks ------------------

export const getContacts = createAsyncThunk("messenger/getContacts", async (id, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/chatApp/get-chat-contacts/${id}`, {
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

export const getChats = createAsyncThunk("messenger/getChats", async (id, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/chatApp/get-chats/${id}`, {
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

export const getMessages = createAsyncThunk("messenger/getMessages", async (payload, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${localUrl}/chatApp/get-messages/of-chat/${payload.userId1}/${payload.userId2}`, {
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

export const sendMessages = createAsyncThunk("messenger/sendMessages", async (formData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${localUrl}/chatApp/send-messages`, formData, {
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

// ------------------ Slice ------------------

const messengerSlice = createSlice({
    name: "messenger",
    initialState: {
        loading: false,
        error: null,
        success: null,
        contacts: [],
        chats: [],
        messages: [],
        activeReceiverId: null,
    },
    reducers: {
        setActiveReceiverId: (state, action) => {
            state.activeReceiverId = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getContacts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload.contacts || [];
                state.success = "Contacts fetched successfully!";
            })
            .addCase(getContacts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getChats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getChats.fulfilled, (state, action) => {
                state.loading = false;
                state.chats = action.payload || [];
            })
            .addCase(getChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload || [];
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setActiveReceiverId, addMessage, setMessages } = messengerSlice.actions;
export default messengerSlice.reducer;
