import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import {
  fetchDocuments,
  deleteDocument,
  docKey,
  uploadDocuments,
  updateLead,
} from "../thunks/Sales.thunks.js";

// empty bucket for the document data fallback
export const EMPTY_BUCKET = Object.freeze({
  items: [],
  loading: false,
  error: null,
});

// Thunks
// Get all existing leads
export const fetchLeads = createAsyncThunk(
  "sales/fetchLeads",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/sales");
      return res.data?.data?.slice().reverse() || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load leads"
      );
    }
  }
);

// Create a fresh new lead
export const createLead = createAsyncThunk(
  "sales/createLead",
  async (payload, { rejectWithValue }) => {
    try {
      const body = {
        ...payload,
        monthlyDealSize: Number(payload.monthlyDealSize) || 0,
      };

      const res = await api.post("/sales", body);
      return {
        lead: res.data?.data,
        message: res.data?.message || "Lead added successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add lead"
      );
    }
  }
);

// updates the lead status and subStatus
export const updateLeadStatus = createAsyncThunk(
  "sales/updateLeadStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/sales/${id}`, { subStatus: status });
      return {
        lead: res.data?.data,
        message: res.data?.message || "Status updated",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update status"
      );
    }
  }
);

// Delete an existing lead
export const deleteLead = createAsyncThunk(
  "sales/deleteLead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/sales/${id}`);
      return { id, message: res.data?.message || "Lead deleted successfully" };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete lead"
      );
    }
  }
);

// State
const initialState = {
  list: [],
  loading: false,
  error: null,
  documents: {},
};

// Slice
const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    // optional helpers
    setLeads: (state, action) => {
      state.list = action.payload || [];
    },
    clearLeads: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createLead
      .addCase(createLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        const created = action.payload?.lead;
        if (created) state.list = [created, ...state.list];
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update lead
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.lead;
        if (!updated?._id) return;
        const idx = state.list.findIndex((l) => l._id === updated._id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...updated };
        else state.list.unshift(updated);
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.loading = false;
        console.error("error in the update lead", action.error);
        state.error =
          action.payload || action.error?.message || "Failed to update lead";
      })

      // updateLeadStatus
      .addCase(updateLeadStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const updated = action.payload?.lead;
        if (updated?._id) {
          const idx = state.list.findIndex((l) => l._id === updated._id);
          if (idx >= 0) state.list[idx] = { ...state.list[idx], ...updated };
        }
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // upload documents
      .addCase(uploadDocuments.pending, (s, a) => {
        const { companyName, subStatus } = a.meta.arg || {};
        const key = docKey({ companyName, subStatus });
        s.documents[key] = s.documents[key] || { ...EMPTY_BUCKET };
        s.documents[key].loading = true;
        s.documents[key].error = null;
      })
      .addCase(uploadDocuments.fulfilled, (s, a) => {
        const { key, docs, leadId, subStatus } = a.payload;
        s.documents[key] = { items: docs, loading: false, error: null };

        // Upsert the lead so the UI shows the updated status/subStatus immediately
        if (leadId && subStatus) {
          const idx = s.list.findIndex((l) => l._id === leadId);
          if (idx >= 0) {
            s.list[idx] = { ...s.list[idx], subStatus };
          }
        }
      })
      .addCase(uploadDocuments.rejected, (s, a) => {
        const { companyName, subStatus } = a.meta.arg || {};
        const key = docKey({ companyName, subStatus });
        s.documents[key] = s.documents[key] || { ...EMPTY_BUCKET };
        s.documents[key].loading = false;
        s.documents[key].error = a.payload || "File upload failed";
      })

      // deleteLead
      .addCase(deleteLead.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id) state.list = state.list.filter((l) => l._id !== id);
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.error = action.payload;
      })

      // documents fetching
      .addCase(fetchDocuments.pending, (state, action) => {
        const { companyName, subStatus } = action.meta.arg || {};
        const key = docKey({ companyName, subStatus });
        state.documents[key] = state.documents[key] || {
          ...EMPTY_BUCKET,
        };
        state.documents[key].loading = true;
        state.documents[key].error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        const { key, docs } = action.payload;
        state.documents[key] = { items: docs, loading: false, error: null };
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        const { companyName, subStatus } = action.meta.arg || {};
        const key = docKey({ companyName, subStatus });
        state.documents[key] = state.documents[key] || {
          ...EMPTY_BUCKET,
        };
        state.documents[key].loading = false;
        state.documents[key].error =
          action.payload || "Failed to fetch company documents.";
      })

      // document delete
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const { id, key } = action.payload;
        if (!id) return;
        const bucket = state.documents[key];
        if (bucket?.items?.length) {
          bucket.items = bucket.items.filter((d) => d._id !== id);
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete document";
      });
  },
});

// Actions
export const { setLeads, clearLeads } = salesSlice.actions;
export default salesSlice.reducer;

// Selectors
export const selectLeads = (state) => state.sales.list;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;
export const selectDocumentsBucket = (state, { companyName, subStatus }) => {
  const key = docKey({ companyName, subStatus });
  const sales = state?.sales;
  const bucket = sales?.documents?.[key];
  return bucket || EMPTY_BUCKET;
};
