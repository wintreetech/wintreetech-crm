import SalesModel from "../models/sales.model.js";
import SalesDataModel from "../models/SalesData.model.js";
import fs from "fs";
import path from "path";

// Create a new sales lead
const createSalesLead = async (req, res) => {
  try {
    const salesLead = new SalesModel(req.body);
    await salesLead.save();
    res.status(201).json({ success: true, data: salesLead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get a single sales lead by ID
const getSalesLead = async (req, res) => {
  try {
    const { _id } = req.params;
    const salesLead = await SalesModel.findById(_id);
    if (!salesLead) {
      return res
        .status(404)
        .json({ success: false, message: "Sales lead not found" });
    }
    res.status(200).json({ success: true, data: salesLead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a sales lead by ID
// const updateSalesLead = async (req, res) => {
// 	try {
// 		const { id: _id } = req.params;

// 		const lead = await SalesModel.findById({ _id });

// 		if (!lead) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "sales lead not found",
// 			});
// 		}

// 		// If you want to enforce that only "Open" leads can change subStatus:
// 		// Allow subStatus change for any status
// 		if (req.body.subStatus) {
// 			lead.subStatus = req.body.subStatus;
// 		}

// 		if (req.body.subStatus && lead.status !== "Open") {
// 			console.warn("Updating subStatus while status is not Open");
// 		}

// 		Object.assign(lead, req.body);
// 		const updatedLead = await lead.save();

// 		res.status(200).json({ success: true, data: updatedLead });
// 	} catch (error) {
// 		res.status(400).json({ success: false, error: error.message });
// 	}
// };

const updateSalesLead = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const lead = await SalesModel.findById(_id);

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "sales lead not found" });
    }

    Object.assign(lead, req.body);
    const updatedLead = await lead.save();

    if (req.body.subStatus && lead.status !== "Open") {
      console.warn("Updating subStatus while status is not Open");
    }

    res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a sales lead by ID
const deleteSalesLead = async (req, res) => {
  try {
    const { _id } = req.params;
    const deletedLead = await SalesModel.findByIdAndDelete(_id);
    if (!deletedLead) {
      return res
        .status(404)
        .json({ success: false, message: "Sales lead not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Sales lead deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all sales leads (optional for completeness)
const getAllSalesLeads = async (req, res) => {
  try {
    const salesLeads = await SalesModel.find();
    res.status(200).json({ success: true, data: salesLeads });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Upload Document
const uploadSalesCustomerLeadData = async (req, res) => {
  try {
    const { companyName, subStatus } = req.body;

    if (!companyName || !subStatus) {
      return res.status(400).json({
        error: "Company name and subStatus are required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Create folder structure dynamically
    const targetDir = path.join("merchant", companyName, subStatus);
    fs.mkdirSync(targetDir, { recursive: true });

    // Move each file from temp → actual folder
    const filesData = req.files.map((file) => {
      const newPath = path.join(targetDir, file.filename);
      fs.renameSync(file.path, newPath);

      return {
        fileName: file.originalname,
        fileUrl: `${req.protocol}://${req.get(
          "host"
        )}/merchant/${encodeURIComponent(companyName)}/${encodeURIComponent(
          subStatus
        )}/${encodeURIComponent(file.filename)}`,
        uploadedAt: new Date(),
      };
    });

    // Check if the company already exists
    let companyDoc = await SalesDataModel.findOne({ companyName });

    if (!companyDoc) {
      // Create a new company entry
      companyDoc = await SalesDataModel.create({
        companyName,
        companyData: [{ subStatus, upload: filesData }],
      });
    } else {
      // Find subStatus index
      const subStatusIndex = companyDoc.companyData.findIndex(
        (cd) => cd.subStatus === subStatus
      );

      if (subStatusIndex > -1) {
        // Append new files to existing subStatus
        companyDoc.companyData[subStatusIndex].upload.push(...filesData);
      } else {
        // Add new subStatus entry
        companyDoc.companyData.push({ subStatus, upload: filesData });
      }

      await companyDoc.save();
    }

    res.status(200).json({
      message: "File(s) uploaded successfully",
      data: companyDoc,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Delete Document
const deleteSalesCustomerLeadData = async (req, res) => {
  try {
    const { id } = req.params; // document id

    // Find the company that contains this document
    const company = await SalesDataModel.findOne({
      "companyData.upload._id": id,
    });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    let filePath = null;

    // Loop through companyData to find and remove the document
    company.companyData.forEach((subStatusData) => {
      const docIndex = subStatusData.upload.findIndex(
        (doc) => doc._id.toString() === id
      );

      if (docIndex > -1) {
        // Store file path for deletion
        const fileUrl = subStatusData.upload[docIndex].fileUrl;
        const urlParts = fileUrl.split("/"); // assuming your URL structure
        const relativePathIndex = urlParts.findIndex(
          (part) => part === "merchant"
        );
        if (relativePathIndex > -1) {
          filePath = path.join(...urlParts.slice(relativePathIndex));
        }

        // Remove the document from array
        subStatusData.upload.splice(docIndex, 1);
      }
    });

    await company.save();

    // Delete the file from disk
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete document" });
  }
};

const getCompanyDocuments = async (req, res) => {
  try {
    const { companyName, subStatus } = req.params;

    const company = await SalesDataModel.findOne({
      companyName: { $regex: new RegExp(`^${companyName}$`, "i") },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // If subStatus is provided, filter that specific section
    if (subStatus) {
      const subData = company.companyData?.find(
        (cd) => cd.subStatus.toLowerCase() === subStatus.toLowerCase()
      );

      if (!subData) {
        return res.status(404).json({
          error: `No documents found for subStatus: ${subStatus}`,
        });
      }

      return res.status(200).json({
        companyName: company.companyName,
        subStatus: subData.subStatus,
        upload: subData.upload || [],
      });
    }

    // Return all company data if no subStatus
    res.status(200).json({
      companyName: company.companyName,
      companyData: company.companyData || [],
    });
  } catch (error) {
    console.error("Error fetching company data:", error);
    res.status(500).json({ error: "Error fetching company data" });
  }
};

export {
  createSalesLead,
  getSalesLead,
  updateSalesLead,
  deleteSalesLead,
  getAllSalesLeads,
  uploadSalesCustomerLeadData,
  deleteSalesCustomerLeadData,
  getCompanyDocuments,
};
