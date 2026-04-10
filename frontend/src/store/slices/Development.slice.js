import { createSlice } from "@reduxjs/toolkit";
import {
  createDevelopmentRecord,
  deleteDevelopmentDocument,
  deleteDevelopmentRecord,
  docKey,
  fetchDevelopmentDocuments,
  fetchDevelopmentRecords,
  updateDevelopmentRecord,
  uploadDevelopmentDocuments,
} from "../thunks/Development.thunks.js";

export const EMPTY_BUCKET = Object.freeze({
  items: [],
  loading: false,
  error: null,
});

const initialState = {
  list: [],
  loading: false,
  error: null,
  documents: {},
};

const developmentSlice = createSlice({
  name: "development",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevelopmentRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevelopmentRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDevelopmentRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDevelopmentRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDevelopmentRecord.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload?.record;
        if (created) {
          state.list = [created, ...state.list];
        }
      })
      .addCase(createDevelopmentRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDevelopmentRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDevelopmentRecord.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.record;
        if (!updated?._id) return;

        const index = state.list.findIndex((item) => item._id === updated._id);
        if (index >= 0) {
          state.list[index] = { ...state.list[index], ...updated };
        } else {
          state.list.unshift(updated);
        }
      })
      .addCase(updateDevelopmentRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDevelopmentRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDevelopmentRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((item) => item._id !== action.payload?.id);
      })
      .addCase(deleteDevelopmentRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDevelopmentDocuments.pending, (state, action) => {
        const { developmentId, sectionName } = action.meta.arg || {};
        const key = docKey({ developmentId, sectionName });
        state.documents[key] = state.documents[key] || { ...EMPTY_BUCKET };
        state.documents[key].loading = true;
        state.documents[key].error = null;
      })
      .addCase(fetchDevelopmentDocuments.fulfilled, (state, action) => {
        const { key, docs } = action.payload;
        state.documents[key] = {
          items: docs,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchDevelopmentDocuments.rejected, (state, action) => {
        const { developmentId, sectionName } = action.meta.arg || {};
        const key = docKey({ developmentId, sectionName });
        state.documents[key] = state.documents[key] || { ...EMPTY_BUCKET };
        state.documents[key].loading = false;
        state.documents[key].error =
          action.payload || "Failed to fetch development documents";
      })
      .addCase(uploadDevelopmentDocuments.pending, (state, action) => {
        const { developmentId, sectionName } = action.meta.arg || {};
        const key = docKey({ developmentId, sectionName });
        state.documents[key] = state.documents[key] || { ...EMPTY_BUCKET };
        state.documents[key].loading = true;
        state.documents[key].error = null;
      })
      .addCase(uploadDevelopmentDocuments.fulfilled, (state, action) => {
        state.documents[action.payload.key] = {
          items: action.payload.docs,
          loading: false,
          error: null,
        };
      })
      .addCase(uploadDevelopmentDocuments.rejected, (state, action) => {
        const { developmentId, sectionName } = action.meta.arg || {};
        const key = docKey({ developmentId, sectionName });
        state.documents[key] = state.documents[key] || { ...EMPTY_BUCKET };
        state.documents[key].loading = false;
        state.documents[key].error =
          action.payload || "Failed to upload development documents";
      })
      .addCase(deleteDevelopmentDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDevelopmentDocument.fulfilled, (state, action) => {
        const { id, key } = action.payload;
        const bucket = state.documents[key];
        if (bucket) {
          bucket.items = bucket.items.filter((doc) => doc._id !== id);
        }
      })
      .addCase(deleteDevelopmentDocument.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default developmentSlice.reducer;

export const selectDevelopmentRecords = (state) => state.development.list;
export const selectDevelopmentLoading = (state) => state.development.loading;
export const selectDevelopmentError = (state) => state.development.error;
export const selectDevelopmentDocuments = (state) => state.development.documents;
export const selectDevelopmentDocumentsBucket = (
  state,
  { developmentId, sectionName }
) => {
  const key = docKey({ developmentId, sectionName });
  return state?.development?.documents?.[key] || EMPTY_BUCKET;
};
