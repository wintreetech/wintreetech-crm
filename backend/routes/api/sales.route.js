import express from "express";
const router = express.Router();

import {
	createSalesLead,
	getSalesLead,
	updateSalesLead,
	deleteSalesLead,
	getAllSalesLeads,
	uploadSalesCustomerLeadData,
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
router.delete("/:id", deleteSalesLead);

// Upload Route
router.post("/upload", upload.array("file"), uploadSalesCustomerLeadData);

export default router;
