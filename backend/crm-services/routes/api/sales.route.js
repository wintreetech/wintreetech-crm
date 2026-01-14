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
  updateSalesLeadStatus,
} from "../../controller/sales.controller.js";
import upload from "../../utils/upload.js";
import { multerErrorHandler } from "../../middleware/multerErrorHandler.js";

// 1. Static and Specific Prefix Routes (TOP)

// Route to get all sales leads
router.get("/", getAllSalesLeads);

// Route to create a new sales lead
router.post("/", createSalesLead);

// Upload Route
router.post(
  "/upload",
  upload.array("files", 10),
  uploadSalesCustomerLeadData,
  multerErrorHandler
);

// Download Route
router.post("/download", generateDownloadLink);

// Route to update a sales lead status by ID
router.patch("/status/:id", updateSalesLeadStatus);

// Route to delete a sales lead by ID
router.delete("/lead/:id", deleteSalesLead);

// Delete Route
router.delete("/document/:id", deleteSalesCustomerLeadData);

// Fetch all documents for a company
router.get("/docs/:companyName", getCompanyDocuments);

// 2. Generic Variable Routes (BOTTOM)

// FIX 2: Move the generic two-variable route below /docs/
// Fetch all documents for a company
router.get("/:companyName/:subStatus", getCompanyDocuments);

// FIX 3: Move all single-variable wildcards to the very bottom
// Route to get a single sales lead by ID
router.get("/:id", getSalesLead);

// Route to update a sales lead by ID
router.put("/:id", updateSalesLead);

export default router;
