import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi } from "../../api.js";

export const fetchNotifications = createAsyncThunk(
	"notifications/fetch",
	async (userId, { rejectWithValue }) => {
		try {
			const response = await notificationApi.get(`/${userId}`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to fetch");
		}
	}
);

export const markAsRead = createAsyncThunk(
	"notifications/markAsRead",
	async ({ userId, notificationId }, { rejectWithValue }) => {
		try {
			await notificationApi.patch("/read", { userId, notificationId });
			return notificationId;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to mark as read");
		}
	}
);

const notificationSlice = createSlice({
	name: "notifications",
	initialState: { items: [], unreadCount: 0, loading: false },
	reducers: {
		addNotification: (state, action) => {
			// Check if notification already exists to prevent duplicates (per your instructions)
			const exists = state.items.some(
				(n) => (n._id || n.id) === (action.payload._id || action.payload.id)
			);
			if (!exists) {
				state.items.unshift(action.payload);
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNotifications.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchNotifications.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
				state.unreadCount = action.payload.filter((n) => !n.isRead).length;
			})
			.addCase(markAsRead.fulfilled, (state, action) => {
				const item = state.items.find((n) => n._id === action.payload);
				if (item && !item.isRead) {
					item.isRead = true;
					state.unreadCount = Math.max(0, state.unreadCount - 1);
				}
			});
	},
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
