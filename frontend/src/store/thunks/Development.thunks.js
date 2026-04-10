import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "../../api.js";

export const docKey = ({ developmentId, sectionName }) =>
  `${developmentId || "unknown"}::${(sectionName || "").toLowerCase()}`;

export const fetchDevelopmentRecords = createAsyncThunk(
  "development/fetchDevelopmentRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/development");
      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load development records"
      );
    }
  }
);

export const createDevelopmentRecord = createAsyncThunk(
  "development/createDevelopmentRecord",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/development", payload);
      return {
        record: res.data?.data,
        message:
          res.data?.message || "Development record created successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to create development record"
      );
    }
  }
);

export const updateDevelopmentRecord = createAsyncThunk(
  "development/updateDevelopmentRecord",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/development/${id}`, data);
      return {
        record: res.data?.data,
        message:
          res.data?.message || "Development record updated successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update development record"
      );
    }
  }
);

export const deleteDevelopmentRecord = createAsyncThunk(
  "development/deleteDevelopmentRecord",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/development/${id}`);
      return {
        id,
        message:
          res.data?.message || "Development record deleted successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete development record"
      );
    }
  }
);

export const fetchDevelopmentDocuments = createAsyncThunk(
  "development/fetchDevelopmentDocuments",
  async ({ developmentId, sectionName }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/development/docs/${encodeURIComponent(
          developmentId
        )}/${encodeURIComponent(sectionName)}`
      );

      return {
        key: docKey({ developmentId, sectionName }),
        docs: res.data?.upload || [],
      };
    } catch (err) {
      if (err?.response?.status === 404) {
        return { key: docKey({ developmentId, sectionName }), docs: [] };
      }

      return rejectWithValue(
        err?.response?.data?.message ||
          "Failed to fetch development documents"
      );
    }
  }
);

export const uploadDevelopmentDocuments = createAsyncThunk(
  "development/uploadDevelopmentDocuments",
  async (
    { files, developmentId, companyName, sectionName, uploadedBy },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("developmentId", developmentId);
      formData.append("companyName", companyName);
      formData.append("sectionName", sectionName);
      formData.append("uploadedBy", uploadedBy);

      for (const file of files) {
        formData.append("files", file);
      }

      const uploadRes = await api.post("/development/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const currentSection =
        uploadRes.data?.data?.sectionData?.find(
          (section) =>
            section.sectionName.toLowerCase() === sectionName.toLowerCase()
        ) || {};

      return {
        key: docKey({ developmentId, sectionName }),
        docs: currentSection.upload || [],
        message:
          uploadRes.data?.message || "File(s) uploaded successfully",
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to upload development documents"
      );
    }
  }
);

export const downloadDevelopmentDocument = createAsyncThunk(
  "development/downloadDevelopmentDocument",
  async ({ id, fileUrl, fileName }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/development/download", { fileUrl });
      const downloadUrl = data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error("No download URL received");
      }

      const fileResponse = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      const blob = new Blob([fileResponse.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!");

      return { id, fileName };
    } catch (error) {
      toast.error("Unable to download file. Please try again.");
      return rejectWithValue(error.message || "Download failed");
    }
  }
);

export const deleteDevelopmentDocument = createAsyncThunk(
  "development/deleteDevelopmentDocument",
  async ({ id, developmentId, sectionName }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/development/document/${id}`);

      if (!res.data?.success) {
        return rejectWithValue(
          res.data?.message || "Failed to delete development document"
        );
      }

      return {
        id,
        key: docKey({ developmentId, sectionName }),
      };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          "Failed to delete development document"
      );
    }
  }
);
