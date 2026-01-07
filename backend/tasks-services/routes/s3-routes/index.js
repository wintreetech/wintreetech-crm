import { Router } from "express";
import taskUpload from "../../middleware/taskUpload.js";
import { protect } from "../../middleware/protect.js";
import { deleteS3TaskFolder } from "../../utils/s3Cleanup.js";
import { keys } from "../../utils/keys.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../utils/s3Client.js";

const router = Router();

// Endpoint for uploading files
router.post("/upload-task-files", taskUpload.array("files", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const filesData = req.files.map((f) => ({
      name: f.originalname,
      url: f.location, // S3 Public URL
      key: f.key, // S3 Key (path)
      size: f.size, // File size in bytes
      type: f.mimetype,
    }));

    res.status(200).json({ success: true, files: filesData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for deleting an entire task folder
router.delete("/delete-task-folder", async (req, res) => {
  try {
    const { workspaceSlug, taskName } = req.body;

    if (!workspaceSlug || !taskName) {
      return res
        .status(400)
        .json({ error: "workspaceSlug and taskName are required" });
    }

    await deleteS3TaskFolder(workspaceSlug, taskName);
    res
      .status(200)
      .json({ success: true, message: "S3 folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE single file
router.post("/delete-file", protect, async (req, res) => {
  try {
    const { key } = req.body;
    const deleteCommand = new DeleteObjectCommand({
      Bucket: keys.aws.S3_BUCKET_NAME,
      Key: key,
    });
    await s3.send(deleteCommand);
    res.status(200).json({ success: true, message: "File deleted from S3" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
