import SalesModel from "../models/sales.model.js";
import SalesDataModel from "../models/SalesData.model.js";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../utils/s3Client.js";
import { keys } from "../utils/keys.js";
const { S3_BUCKET_NAME } = keys.aws;

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

// Update lead status only
export const updateSalesLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    // Update only the 'status' field
    const updatedLead = await SalesModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res
        .status(404)
        .json({ success: false, message: "Sales lead not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update the subStatus
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

// Upload Document to the AWS & MongoDb Both
const uploadSalesCustomerLeadData = async (req, res) => {
  try {
    const { companyName, subStatus, uploadedBy } = req.body;

    if (!companyName || !subStatus || !uploadedBy) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Each uploaded file info from multer-s3
    const filesData = req.files.map((file) => ({
      fileName: file.originalname,
      fileUrl: file.location,
      uploadedBy,
      uploadedAt: new Date(),
    }));

    let companyDoc = await SalesDataModel.findOne({ companyName });

    if (!companyDoc) {
      companyDoc = await SalesDataModel.create({
        companyName,
        companyData: [{ subStatus, upload: filesData }],
      });
    } else {
      const subStatusIndex = companyDoc.companyData.findIndex(
        (cd) => cd.subStatus === subStatus
      );

      if (subStatusIndex > -1) {
        companyDoc.companyData[subStatusIndex].upload.push(...filesData);
      } else {
        companyDoc.companyData.push({ subStatus, upload: filesData });
      }

      await companyDoc.save();
    }

    res.status(200).json({
      message: "File(s) uploaded successfully to S3",
      data: companyDoc,
    });
  } catch (error) {
    console.error("S3 Upload error:", error);
    res.status(500).json({ error: "Something went wrong during upload" });
  }
};

// Download Documents from the AWS
const generateDownloadLink = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ error: "Missing fileUrl" });
    }

    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: "attachment",
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return res.json({ downloadUrl: signedUrl });
  } catch (err) {
    console.error("❌ Error generating signed URL:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete Documents from the AWS & MongoDb Both
const deleteSalesCustomerLeadData = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Find company containing this document
    const company = await SalesDataModel.findOne({
      "companyData.upload._id": id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Document not found in database.",
      });
    }

    let s3Key = null;

    // 🧹 Loop through subStatus sections and find + remove document
    for (const subStatusData of company.companyData) {
      const docIndex = subStatusData.upload.findIndex(
        (doc) => doc._id.toString() === id
      );

      if (docIndex > -1) {
        const fileUrl = subStatusData.upload[docIndex].fileUrl;

        // 🧠 Extract S3 Key correctly (remove the leading / from pathname)
        const url = new URL(fileUrl);
        s3Key = decodeURIComponent(
          url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname
        );

        // 🧹 Remove document entry from MongoDB
        subStatusData.upload.splice(docIndex, 1);
        break;
      }
    }

    await company.save();

    // 🗑️ Delete from S3 if key found
    if (s3Key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
          })
        );
        console.log("✅ Deleted from S3:", s3Key);
      } catch (err) {
        console.error("⚠️ Failed to delete from S3:", err.message);
        return res.status(500).json({
          success: false,
          error: "Deleted from DB, but failed to delete from S3",
        });
      }
    } else {
      console.warn("⚠️ No S3 key found, file may already be missing from S3");
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully from both MongoDB and S3.",
    });
  } catch (error) {
    console.error("❌ Delete document error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete document",
    });
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
  generateDownloadLink,
};
