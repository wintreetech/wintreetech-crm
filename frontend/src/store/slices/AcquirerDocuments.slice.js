import { createSlice } from "@reduxjs/toolkit";
import {
	uploadAcquirerDocuments,
	fetchAcquirerDocuments,
	deleteAcquirerDocument,
	downloadAcquirerDocument,
} from "../thunks/Acquirer.thunks.js";

const initialState = {
	bySection: {}, // key: `${bankName}_${sectionName}`
	loading: false,
	error: null,
};

const acquirerDocumentsSlice = createSlice({
	name: "acquirerDocs",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// FETCH
			.addCase(fetchAcquirerDocuments.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchAcquirerDocuments.fulfilled, (state, action) => {
				state.loading = false;
				const { bankName, sectionName } = action.meta.arg;
				const key = `${bankName}_${sectionName}`;
				state.bySection[key] = action.payload;
			})
			.addCase(fetchAcquirerDocuments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// UPLOAD → just stop loader
			.addCase(uploadAcquirerDocuments.pending, (state) => {
				state.loading = true;
			})
			.addCase(uploadAcquirerDocuments.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(uploadAcquirerDocuments.rejected, (state) => {
				state.loading = false;
			})

			// DELETE
			.addCase(deleteAcquirerDocument.fulfilled, (state, action) => {
				const deletedId = action.payload;
				Object.keys(state.bySection).forEach((key) => {
					state.bySection[key] = state.bySection[key]?.filter(
						(doc) => doc._id !== deletedId
					);
				});
			});
	},
});

export default acquirerDocumentsSlice.reducer;

export const selectAcquirerDocsBySection = (bankName, sectionName) => (state) =>
	state.acquirerDocs.bySection[`${bankName}_${sectionName}`] || [];
