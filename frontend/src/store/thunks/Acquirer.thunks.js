import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api";
import toast from "react-hot-toast";

/* -----------------------------
   GET ALL ACQUIRERS
----------------------------- */
export const fetchAcquirers = createAsyncThunk(
	"acquirer/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			const res = await api.get("/acquirer");

			console.log(res);
			return res.data?.data || [];
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to fetch acquirers";
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   GET ACQUIRER BY ID
----------------------------- */
export const fetchAcquirerById = createAsyncThunk(
	"acquirer/fetchById",
	async (id, { rejectWithValue }) => {
		try {
			const res = await api.get(`/acquirer/${id}`);
			return res.data?.data;
		} catch (err) {
			const msg =
				err?.response?.data?.message || "Failed to fetch acquirer details";
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   CREATE ACQUIRER
----------------------------- */
export const createAcquirer = createAsyncThunk(
	"acquirer/create",
	async (payload, { rejectWithValue }) => {
		try {
			const res = await api.post("/acquirer", payload);

			if (!res.data?.success) {
				return rejectWithValue(res.data?.message);
			}

			toast.success("Acquirer created successfully");
			return res.data?.data;
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to create acquirer";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   UPDATE ACQUIRER
----------------------------- */
export const updateAcquirer = createAsyncThunk(
	"acquirer/update",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const res = await api.put(`/acquirer/${id}`, data);

			toast.success("Acquirer updated successfully");
			return res.data?.data;
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to update acquirer";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   DELETE ACQUIRER
----------------------------- */
export const deleteAcquirer = createAsyncThunk(
	"acquirer/delete",
	async (id, { rejectWithValue }) => {
		try {
			const res = await api.delete(`/acquirer/${id}`);

			toast.success("Acquirer deleted successfully");
			return id; // return id for reducer
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to delete acquirer";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

// Thunk For the Entity

/* -----------------------------
   GET ALL ENTITIES
----------------------------- */
export const fetchEntities = createAsyncThunk(
	"entity/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			const res = await api.get("/entity");
			return res.data?.data || [];
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to fetch entities";
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   ADD MULTIPLE ENTITIES
----------------------------- */
export const addEntities = createAsyncThunk(
	"entity/add",
	async (entities, { rejectWithValue }) => {
		try {
			const res = await api.post("/entity", { entities });

			if (!res.data?.success) {
				return rejectWithValue(res.data?.message);
			}

			toast.success("Entities added successfully");
			return res.data?.data; // updated list
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to add entities";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   DELETE ENTITY
----------------------------- */
export const deleteEntity = createAsyncThunk(
	"entity/delete",
	async (name, { rejectWithValue }) => {
		try {
			await api.delete(`/entity/${name}`);

			toast.success("Entity deleted successfully");
			return name;
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to delete entity";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

// checklist

/* -----------------------------
   GET CHECKLIST
----------------------------- */
export const fetchChecklist = createAsyncThunk(
	"acquirerChecklist/fetch",
	async (bankName, { rejectWithValue }) => {
		try {
			const res = await api.get(`/acquirer/${bankName}/checklist`);
			return res.data.checklist;
		} catch (err) {
			toast.error("Failed to load checklist");
			return rejectWithValue(err.response?.data);
		}
	}
);

/* -----------------------------
   ADD CHECKLIST ITEM
----------------------------- */
export const addChecklistItem = createAsyncThunk(
	"acquirerChecklist/add",
	async ({ bankName, title }, { rejectWithValue }) => {
		try {
			const res = await api.post(`/acquirer/${bankName}/checklist`, { title });
			toast.success("Checklist item added");
			return res.data.checklist; // ✅
		} catch (err) {
			toast.error("Failed to add item");
			return rejectWithValue(err.response.data);
		}
	}
);

/* -----------------------------
   TOGGLE CHECKLIST ITEM
----------------------------- */
export const toggleChecklistItem = createAsyncThunk(
	"acquirerChecklist/toggle",
	async ({ bankName, itemId }, { rejectWithValue }) => {
		try {
			const res = await api.patch(
				`/acquirer/${bankName}/checklist/${itemId}/toggle`
			);
			toast.success("Checklist updated");
			return res.data.checklist; // ✅ IMPORTANT
		} catch (err) {
			toast.error("Failed to delete item");
			return rejectWithValue(err.response.data);
		}
	}
);

/* -----------------------------
   DELETE CHECKLIST ITEM
----------------------------- */
export const deleteChecklistItem = createAsyncThunk(
	"acquirerChecklist/delete",
	async ({ bankName, itemId }, { rejectWithValue }) => {
		try {
			const res = await api.delete(`/acquirer/${bankName}/checklist/${itemId}`);
			toast.success("Checklist item deleted");
			return res.data.checklist; // ✅
		} catch (err) {
			toast.error("Failed to delete item");
			return rejectWithValue(err.response.data);
		}
	}
);

/* -----------------------------
   UPLOAD DOCUMENTS
----------------------------- */
export const uploadAcquirerDocuments = createAsyncThunk(
	"acquirerDocs/upload",
	async ({ bankName, sectionName, files, uploadedBy }, { rejectWithValue }) => {
		try {
			const formData = new FormData();

			files.forEach((file) => formData.append("files", file));
			formData.append("uploadedBy", uploadedBy); // ✅ REQUIRED

			const res = await api.post(
				`/acquirer/data/${bankName}/section/${sectionName}/upload`,
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);

			toast.success("Documents uploaded successfully");
			return res.data;
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Upload failed";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   GET DOCUMENTS BY SECTION
----------------------------- */
export const fetchAcquirerDocuments = createAsyncThunk(
	"acquirerDocs/fetchBySection",
	async ({ bankName, sectionName }, { rejectWithValue }) => {
		try {
			const res = await api.get(
				`/acquirer/data/${bankName}/section/${sectionName}`
			);
			return res.data?.data || [];
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to fetch documents";
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   DELETE DOCUMENT
----------------------------- */
export const deleteAcquirerDocument = createAsyncThunk(
	"acquirerDocs/delete",
	async (documentId, { rejectWithValue }) => {
		try {
			await api.delete(`/acquirer/data/document/${documentId}`);
			toast.success("Document deleted");
			return documentId;
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				"Failed to delete document";
			toast.error(msg);
			return rejectWithValue(msg);
		}
	}
);

/* -----------------------------
   DOWNLOAD DOCUMENT
----------------------------- */
export const downloadAcquirerDocument = createAsyncThunk(
	"acquirerDocs/download",
	async ({ fileUrl, fileName }, { rejectWithValue }) => {
		try {
			// 1️⃣ Ask backend for signed URL
			const res = await api.post("/acquirer/data/download", {
				fileUrl,
			});

			const downloadUrl = res.data?.downloadUrl;

			if (!downloadUrl) {
				throw new Error("No download link received");
			}

			// 2️⃣ Trigger browser download
			const a = document.createElement("a");
			a.href = downloadUrl;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			a.remove();

			return true;
		} catch (err) {
			console.error("Download error:", err);
			const msg =
				err?.response?.data?.error || err?.message || "Download failed";
			return rejectWithValue(msg);
		}
	}
);
