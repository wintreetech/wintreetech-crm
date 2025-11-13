// All the thunks for all the sales tasks
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";
import axios from "axios";
import toast from "react-hot-toast";

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
9;
// Upload a document
export const uploadDocuments = createAsyncThunk(
  "sales/uploadDocuments",
  async (
    { files, companyName, subStatus, uploadedBy, leadId },
    { rejectWithValue }
  ) => {
    try {
      console.log("📤 Uploading files:", files);

      // 🧠 Pre-check (optional)
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
        if (err?.response?.status === 404) isFirstUpload = true;
      }

      // ✅ Build FormData properly
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("subStatus", subStatus);
      formData.append("uploadedBy", uploadedBy);

      // ⚠️ Append files correctly — the key *must* match multer.array("files")
      for (const file of files) {
        formData.append("files", file);
      }

      // ✅ Upload
      const uploadRes = await api.post(`/sales/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Get updated list
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
        subStatus,
        message: uploadRes.data?.message || "File(s) uploaded successfully",
      };
    } catch (err) {
      console.error("❌ Upload error:", err);
      return rejectWithValue(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "File upload failed"
      );
    }
  }
);

// Download a document
export const downloadDocuments = createAsyncThunk(
  "sales/downloadDocuments",
  async ({ id, fileUrl, fileName }, { rejectWithValue }) => {
    try {
      // Step 1️⃣ — Get signed URL from backend
      const { data } = await api.post("/sales/download", { fileUrl });
      const { downloadUrl } = data;

      if (!downloadUrl) throw new Error("No download URL received");

      // Step 2️⃣ — Fetch file as blob
      const fileResponse = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      // Step 3️⃣ — Trigger browser download
      const blob = new Blob([fileResponse.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`File downloaded successfully!`);

      // Return ID or any metadata to reducer
      return { id, fileName };
    } catch (error) {
      console.error("❌ Download failed:", error);
      toast.error("Unable to download file. Please try again.");

      return rejectWithValue(error.message || "Download failed");
    }
  }
);

// Delete a document
export const deleteDocument = createAsyncThunk(
  "sales/deleteDocument",
  async ({ id, companyName, subStatus, uploadedBy }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/sales/document/${id}`);
      if (res.data?.success) {
        return { id, key: docKey({ companyName, subStatus, uploadedBy }) };
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
      console.error(err);
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to update lead"
      );
    }
  }
);

// Fetch processing URLs for a lead
export const fetchProcessingUrls = createAsyncThunk(
  "sales/fetchProcessingUrls",
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/processing-urls/${leadId}`);
      return {
        leadId,
        trustedUrls: data?.data?.trustedUrls || [],
        ftdUrls: data?.data?.ftdUrls || [],
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load processing URLs"
      );
    }
  }
);

// Add new processing URLs
export const addProcessingUrls = createAsyncThunk(
  "sales/addProcessingUrls",
  async ({ leadId, urls, type }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/processing-urls/${leadId}`, {
        urls,
        type,
      });

      return {
        leadId,
        trustedUrls: data?.data?.trustedUrls || [],
        ftdUrls: data?.data?.ftdUrls || [],
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add URLs"
      );
    }
  }
);

// Delete a processing URL
export const deleteProcessingUrl = createAsyncThunk(
  "sales/deleteProcessingUrl",
  async ({ leadId, url, type }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/processing-urls/${leadId}`, {
        data: { url, type },
      });

      return {
        leadId,
        trustedUrls: data?.data?.trustedUrls || [],
        ftdUrls: data?.data?.ftdUrls || [],
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete URL"
      );
    }
  }
);

// ------- Lead ops end -------
