import express from "express";
import multer from "multer";
import {
	createAcquirer,
	getAllAcquirers,
	getAcquirerById,
	updateAcquirer,
	deleteAcquirer,
	updateAcquirerStatus,
} from "../../controller/acquirer.controller.js";

import {
	uploadAcquirerDocument,
	getAcquirerDocumentsBySection,
	generateAcquirerDownloadLink,
	deleteAcquirerDocument,
	getChecklistItems,
	addChecklistItem,
	toggleChecklistItem,
	deleteChecklistItem,
	getAcquirerData,
} from "../../controller/acquirerData.controller.js";

import upload from "../../utils/acquirerUpload.js";
import { multerErrorHandler } from "../../middleware/multerErrorHandler.js";

const router = express.Router();

/* --------------------------------------
   Acquirer Master Routes
--------------------------------------- */
router.get("/", getAllAcquirers);
router.get("/:id", getAcquirerById);
router.post("/", createAcquirer);
router.put("/:id", updateAcquirer);
// Activate / Deactivate
router.patch("/:id/status", updateAcquirerStatus);
router.delete("/:id", deleteAcquirer);

/* --------------------------------------
   Acquirer Data Routes (Checklist + Documents)
--------------------------------------- */

// Get Whole all data for a bank
router.get("/data/:bankName", getAcquirerData);

// Checklist routes
router.get("/:bankName/checklist", getChecklistItems);
router.post("/:bankName/checklist", addChecklistItem);
router.patch("/:bankName/checklist/:itemId/toggle", toggleChecklistItem);
router.delete("/:bankName/checklist/:itemId", deleteChecklistItem);

// Document routes
router.post(
	"/data/:bankName/section/:sectionName/upload",
	upload.array("files", 10),
	uploadAcquirerDocument,
	multerErrorHandler,
);

router.get(
	"/data/:bankName/section/:sectionName",
	getAcquirerDocumentsBySection,
);
router.post("/data/download", generateAcquirerDownloadLink);
router.delete("/data/document/:documentId", deleteAcquirerDocument);

export default router;
