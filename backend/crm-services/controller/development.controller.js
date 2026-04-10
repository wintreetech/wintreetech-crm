import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import DevelopmentModel from "../models/Development.model.js";
import DevelopmentDataModel, {
  ALLOWED_DEVELOPMENT_SECTIONS,
} from "../models/DevelopmentData.model.js";
import s3 from "../utils/s3Client.js";
import { keys } from "../utils/keys.js";
import { deleteS3ObjectByUrl } from "../utils/s3Delete.js";

const { S3_BUCKET_NAME } = keys.aws;

const isAllowedSection = (sectionName = "") =>
  ALLOWED_DEVELOPMENT_SECTIONS.some(
    (allowedSection) =>
      allowedSection.toLowerCase() === sectionName.trim().toLowerCase()
  );

const normalizeSectionName = (sectionName = "") =>
  ALLOWED_DEVELOPMENT_SECTIONS.find(
    (allowedSection) =>
      allowedSection.toLowerCase() === sectionName.trim().toLowerCase()
  ) || sectionName;

const createDevelopment = async (req, res) => {
  try {
    const development = new DevelopmentModel(req.body);
    await development.save();

    res.status(201).json({
      success: true,
      message: "Development record created successfully",
      data: development,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create development record",
    });
  }
};

const getAllDevelopment = async (req, res) => {
  try {
    const developmentList = await DevelopmentModel.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: developmentList });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch development records",
    });
  }
};

const getDevelopmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const development = await DevelopmentModel.findById(id);

    if (!development) {
      return res.status(404).json({
        success: false,
        message: "Development record not found",
      });
    }

    res.status(200).json({ success: true, data: development });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch development record",
    });
  }
};

const updateDevelopment = async (req, res) => {
  try {
    const { id } = req.params;
    const development = await DevelopmentModel.findById(id);

    if (!development) {
      return res.status(404).json({
        success: false,
        message: "Development record not found",
      });
    }

    Object.assign(development, req.body);
    const updatedDevelopment = await development.save();

    await DevelopmentDataModel.findOneAndUpdate(
      { developmentId: id },
      { companyName: updatedDevelopment.companyName },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Development record updated successfully",
      data: updatedDevelopment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update development record",
    });
  }
};

const deleteDevelopment = async (req, res) => {
  try {
    const { id } = req.params;

    const development = await DevelopmentModel.findById(id);
    if (!development) {
      return res.status(404).json({
        success: false,
        message: "Development record not found",
      });
    }

    const developmentDataDoc = await DevelopmentDataModel.findOne({
      developmentId: id,
    });

    const fileUrls = [];
    if (developmentDataDoc?.sectionData?.length) {
      for (const section of developmentDataDoc.sectionData) {
        if (Array.isArray(section.upload)) {
          for (const file of section.upload) {
            if (file?.fileUrl) fileUrls.push(file.fileUrl);
          }
        }
      }
    }

    if (fileUrls.length) {
      const uniqueUrls = [...new Set(fileUrls)];
      const results = await Promise.allSettled(
        uniqueUrls.map((url) => deleteS3ObjectByUrl(url))
      );

      const failed = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === "rejected")
        .map(({ result, index }) => ({
          fileUrl: uniqueUrls[index],
          error: result.reason?.message || String(result.reason),
        }));

      if (failed.length) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to delete one or more files from S3. Development record not deleted.",
          failedFiles: failed,
        });
      }
    }

    if (developmentDataDoc?._id) {
      await DevelopmentDataModel.deleteOne({ _id: developmentDataDoc._id });
    }

    await DevelopmentModel.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Development record deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete development record",
    });
  }
};

const uploadDevelopmentDocuments = async (req, res) => {
  try {
    const { developmentId, companyName, sectionName, uploadedBy } = req.body;

    if (!developmentId || !companyName || !sectionName || !uploadedBy) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    if (!isAllowedSection(sectionName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Allowed sections are: ${ALLOWED_DEVELOPMENT_SECTIONS.join(", ")}`,
      });
    }

    const normalizedSectionName = normalizeSectionName(sectionName);

    const filesData = req.files.map((file) => ({
      fileName: file.originalname,
      fileUrl: file.location,
      uploadedBy,
      uploadedAt: new Date(),
    }));

    let developmentDataDoc = await DevelopmentDataModel.findOne({ developmentId });

    if (!developmentDataDoc) {
      developmentDataDoc = await DevelopmentDataModel.create({
        developmentId,
        companyName,
        sectionData: [{ sectionName: normalizedSectionName, upload: filesData }],
      });
    } else {
      developmentDataDoc.companyName = companyName;

      const sectionIndex = developmentDataDoc.sectionData.findIndex(
        (section) =>
          section.sectionName.toLowerCase() === normalizedSectionName.toLowerCase()
      );

      if (sectionIndex > -1) {
        developmentDataDoc.sectionData[sectionIndex].upload.push(...filesData);
      } else {
        developmentDataDoc.sectionData.push({
          sectionName: normalizedSectionName,
          upload: filesData,
        });
      }

      await developmentDataDoc.save();
    }

    res.status(200).json({
      success: true,
      message: "File(s) uploaded successfully to S3",
      data: developmentDataDoc,
    });
  } catch (error) {
    console.error("Development upload error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during upload",
    });
  }
};

const getDevelopmentDocuments = async (req, res) => {
  try {
    const { developmentId, sectionName } = req.params;

    const developmentDataDoc = await DevelopmentDataModel.findOne({ developmentId });

    if (!developmentDataDoc) {
      return res.status(404).json({
        success: false,
        message: "Development documents not found",
      });
    }

    if (sectionName) {
      if (!isAllowedSection(sectionName)) {
        return res.status(400).json({
          success: false,
          message: `Invalid section. Allowed sections are: ${ALLOWED_DEVELOPMENT_SECTIONS.join(", ")}`,
        });
      }

      const normalizedSectionName = normalizeSectionName(sectionName);
      const section = developmentDataDoc.sectionData.find(
        (item) =>
          item.sectionName.toLowerCase() === normalizedSectionName.toLowerCase()
      );

      if (!section) {
        return res.status(404).json({
          success: false,
          message: `No documents found for section: ${sectionName}`,
        });
      }

      return res.status(200).json({
        success: true,
        developmentId: developmentDataDoc.developmentId,
        companyName: developmentDataDoc.companyName,
        sectionName: section.sectionName,
        upload: section.upload || [],
      });
    }

    res.status(200).json({
      success: true,
      developmentId: developmentDataDoc.developmentId,
      companyName: developmentDataDoc.companyName,
      sectionData:
        developmentDataDoc.sectionData?.filter((section) =>
          isAllowedSection(section.sectionName)
        ) || [],
    });
  } catch (error) {
    console.error("Error fetching development documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch development documents",
    });
  }
};

const deleteDevelopmentDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const developmentDataDoc = await DevelopmentDataModel.findOne({
      "sectionData.upload._id": id,
    });

    if (!developmentDataDoc) {
      return res.status(404).json({
        success: false,
        message: "Document not found in database",
      });
    }

    let s3Key = null;

    for (const section of developmentDataDoc.sectionData) {
      const docIndex = section.upload.findIndex(
        (doc) => doc._id.toString() === id
      );

      if (docIndex > -1) {
        const fileUrl = section.upload[docIndex].fileUrl;
        const url = new URL(fileUrl);
        s3Key = decodeURIComponent(
          url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname
        );
        section.upload.splice(docIndex, 1);
        break;
      }
    }

    await developmentDataDoc.save();

    if (s3Key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
          })
        );
      } catch (error) {
        console.error("Failed to delete development doc from S3:", error.message);
        return res.status(500).json({
          success: false,
          message: "Deleted from DB, but failed to delete from S3",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully from both MongoDB and S3",
    });
  } catch (error) {
    console.error("Delete development document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};

const generateDevelopmentDownloadLink = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing fileUrl",
      });
    }

    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: "attachment",
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.status(200).json({ success: true, downloadUrl: signedUrl });
  } catch (error) {
    console.error("Error generating development download URL:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate download URL",
    });
  }
};

export {
  createDevelopment,
  deleteDevelopment,
  deleteDevelopmentDocument,
  generateDevelopmentDownloadLink,
  getAllDevelopment,
  getDevelopmentById,
  getDevelopmentDocuments,
  updateDevelopment,
  uploadDevelopmentDocuments,
};
