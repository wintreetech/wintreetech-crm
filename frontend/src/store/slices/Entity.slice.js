import { createSlice } from "@reduxjs/toolkit";
import {
	fetchEntities,
	addEntities,
	deleteEntity,
} from "../thunks/Acquirer.thunks.js";

const entitySlice = createSlice({
	name: "entity",
	initialState: {
		list: [],
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			/* -----------------------------
			   FETCH ALL
			----------------------------- */
			.addCase(fetchEntities.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchEntities.fulfilled, (state, action) => {
				state.loading = false;
				state.list = action.payload;
			})
			.addCase(fetchEntities.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			/* -----------------------------
			   ADD (bulk)
			----------------------------- */
			.addCase(addEntities.pending, (state) => {
				state.loading = true;
			})
			.addCase(addEntities.fulfilled, (state, action) => {
				state.loading = false;

				// API returns updated list
				state.list = action.payload;
			})
			.addCase(addEntities.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			/* -----------------------------
			   DELETE
			----------------------------- */
			.addCase(deleteEntity.fulfilled, (state, action) => {
				state.list = state.list.filter((e) => e !== action.payload);
			});
	},
});

export default entitySlice.reducer;

/* -----------------------------
   SELECTORS
----------------------------- */
export const selectEntities = (state) => state.entity.list;
export const selectEntityLoading = (state) => state.entity.loading;
export const selectEntityError = (state) => state.entity.error;
