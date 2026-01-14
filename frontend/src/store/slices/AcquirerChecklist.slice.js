import { createSlice } from "@reduxjs/toolkit";
import {
	fetchChecklist,
	addChecklistItem,
	toggleChecklistItem,
	deleteChecklistItem,
} from "../thunks/Acquirer.thunks.js";

const checklistSlice = createSlice({
	name: "acquirerChecklist",
	initialState: {
		list: [],
		loading: false,
		error: null,
		loaded: false,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			// -------- Fetch --------
			.addCase(fetchChecklist.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchChecklist.fulfilled, (state, action) => {
				state.loading = false;
				state.list = action.payload;
				state.loaded = true;
			})
			.addCase(fetchChecklist.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// -------- Add --------
			.addCase(addChecklistItem.fulfilled, (state, action) => {
				state.list = action.payload;
			})

			// -------- Toggle --------
			.addCase(toggleChecklistItem.fulfilled, (state, action) => {
				state.list = action.payload;
			})

			// -------- Delete --------
			.addCase(deleteChecklistItem.fulfilled, (state, action) => {
				state.list = action.payload;
			});
	},
});

export default checklistSlice.reducer;

/* -------- Selectors -------- */
export const selectChecklist = (state) => state.acquirerChecklist.list || [];
export const selectChecklistLoading = (state) =>
	state.acquirerChecklist.loading;
export const selectChecklistError = (state) => state.acquirerChecklist.error;
export const selectChecklistLoaded = (state) => state.acquirerChecklist.loaded;
