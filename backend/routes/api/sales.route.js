import express from "express";
const router = express.Router();

import {
	createSalesLead,
	getSalesLead,
	updateSalesLead,
	deleteSalesLead,
	getAllSalesLeads,
	uploadSalesCustomerLeadData,
	getCompanyDocuments,
	deleteSalesCustomerLeadData,
	generateDownloadLink,
} from "../../controller/sales.controller.js";
import upload from "../../utils/upload.js";

// Route to get all sales leads
router.get("/", getAllSalesLeads);

// Route to create a new sales lead
router.post("/", createSalesLead);

// Route to get a single sales lead by ID
router.get("/:id", getSalesLead);

// Route to update a sales lead by ID
router.put("/:id", updateSalesLead);

// Route to delete a sales lead by ID
router.delete("/lead/:id", deleteSalesLead);

// Delete a document
router.delete("/document/:id", deleteSalesCustomerLeadData);

// Upload Route
router.post("/upload", upload.array("files", 10), uploadSalesCustomerLeadData);
router.post("/download", generateDownloadLink);

// Fetch all documents for a company
router.get("/:companyName/:subStatus", getCompanyDocuments);
router.get("/:companyName", getCompanyDocuments);

export default router;
