// All the thunks for all the sales tasks
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// Helper to key documents cache by company + phase
export const docKey = ({ companyName, subStatus }) =>
  `${(companyName || "").toLowerCase()} :: ${(subStatus || "").toLowerCase()}`;

// ------- Documents ops start -------

// Fetch all the company documents data
export const fetchDocuments = createAsyncThunk(
  "sales/fetchDocuments",
  async ({ companyName, subStatus }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/sales/${encodeURIComponent(companyName)}/${encodeURIComponent(
          subStatus
        )}`
      );

      let docs = [];
      if (res.data?.upload) {
        docs = res.data.upload;
      } else if (res.data?.companyName) {
        docs = (res.data.companyData || []).flatMap((d) => d.upload || []);
      }
      return { key: docKey({ companyName, subStatus }), docs };
    } catch (err) {
      if (err?.response?.status === 404) {
        // treat not-found as empty
        return { key: docKey({ companyName, subStatus }), docs: [] };
      }
      return rejectWithValue(
        err?.response?.data?.error || "Failed to fetch company documents."
      );
    }
  }
);

// Upload a document
export const uploadDocuments = createAsyncThunk(
  "sales/uploadDocuments",
  async ({ files, companyName, subStatus, leadId }, { rejectWithValue }) => {
    try {
      // 1) Check if this phase already has docs (to detect first upload)
      let isFirstUpload = false;
      try {
        const checkRes = await api.get(
          `/sales/${encodeURIComponent(companyName)}/${encodeURIComponent(
            subStatus
          )}`
        );
        const existing =
          checkRes.data?.upload ||
          (checkRes.data?.companyData || []).flatMap((d) => d.upload || []);
        if (!existing || existing.length === 0) isFirstUpload = true;
      } catch (err) {
        if (err?.response?.status === 404) {
          isFirstUpload = true; // treat missing as first upload
        } else {
          console.warn(
            "Pre-check failed:",
            err?.response?.data || err?.message
          );
        }
      }

      // 2) Build form-data and POST upload
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file)); // backend expects "file"
      formData.append("companyName", companyName);
      formData.append("subStatus", subStatus);

      const uploadRes = await api.post(`/sales/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3) Fetch updated docs to keep store in sync
      const listRes = await api.get(
        `/sales/${encodeURIComponent(companyName)}/${encodeURIComponent(
          subStatus
        )}`
      );
      const docs =
        listRes.data?.upload ||
        (listRes.data?.companyData || []).flatMap((d) => d.upload || []);

      return {
        key: docKey({ companyName, subStatus }),
        docs,
        isFirstUpload,
        leadId,
        newSubStatus: subStatus,
        message: uploadRes.data?.message || "File(s) uploaded",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "File upload failed"
      );
    }
  }
);

// Delete a document
export const deleteDocument = createAsyncThunk(
  "sales/deleteDocument",
  async ({ id, companyName, subStatus }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/sales/document/${id}`);
      if (res.data?.success) {
        return { id, key: docKey({ companyName, subStatus }) };
      }

      return rejectWithValue(res.data?.error || "Failed to delete document.");
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || "Something went wrong while deleting."
      );
    }
  }
);

// ------- Documents ops end -------

// ------- Lead ops start -------
export const updateLead = createAsyncThunk(
  "sales/updateLead",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/sales/${id}`, data);
      return {
        lead: res.data?.data, // updated lead from backend
        message: res.data?.message || "Lead updated",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to update lead"
      );
    }
  }
);
