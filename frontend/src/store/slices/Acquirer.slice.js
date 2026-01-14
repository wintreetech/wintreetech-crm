import { createSlice } from "@reduxjs/toolkit";
import {
	fetchAcquirers,
	fetchAcquirerById,
	createAcquirer,
	updateAcquirer,
	deleteAcquirer,
} from "../thunks/Acquirer.thunks.js";

const acquirerSlice = createSlice({
	name: "acquirer",
	initialState: {
		list: [],
		selected: null,
		loading: false,
		error: null,
		loaded: false,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			// -------- Fetch All --------
			.addCase(fetchAcquirers.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchAcquirers.fulfilled, (state, action) => {
				state.loading = false;
				state.list = action.payload;
				state.loaded = true;
			})
			.addCase(fetchAcquirers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// -------- Fetch One --------
			.addCase(fetchAcquirerById.fulfilled, (state, action) => {
				state.selected = action.payload;
			})

			// -------- Create --------
			.addCase(createAcquirer.fulfilled, (state, action) => {
				state.list.unshift(action.payload);
			})

			// -------- Update --------
			.addCase(updateAcquirer.fulfilled, (state, action) => {
				const updated = action.payload; // <-- this has the full merged entity array
				state.list = state.list.map((a) =>
					a._id === updated._id ? updated : a
				);
			})

			// -------- Delete --------
			.addCase(deleteAcquirer.fulfilled, (state, action) => {
				state.list = state.list.filter((a) => a._id !== action.payload);
			});
	},
});

export default acquirerSlice.reducer;
export const selectAcquirers = (state) => state.acquirer.list;
export const selectAcquirerLoading = (state) => state.acquirer.loading;
export const selectAcquirerError = (state) => state.acquirer.error;
export const selectAcquirerLoaded = (state) => state.acquirer.loaded;
