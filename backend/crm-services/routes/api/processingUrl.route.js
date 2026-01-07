import express from "express";
import {
	getProcessingUrls,
	addProcessingUrls,
	deleteProcessingUrls,
	downloadProcessingUrls,
	downloadAllProcessingUrls,
} from "../../controller/processingUrl.controller.js";

const router = express.Router();

// ✅ Download all URLs (must be before dynamic routes)
router.get("/download-all", downloadAllProcessingUrls);

// ✅ Download URLs for specific company
router.get("/download/:companyId", downloadProcessingUrls);

// Fetch URLs for a specific company (used by your frontend)
router.get("/:companyId", getProcessingUrls);

// Add / Update URLs
router.post("/:companyId", addProcessingUrls);

// Delete URLs
router.delete("/:companyId", deleteProcessingUrls);

export default router;
