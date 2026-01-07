import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3Client.js";
import { keys } from "../utils/keys.js";

const { S3_BUCKET_NAME } = keys.aws;

const taskUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      try {
        // Ensure these are passed in the Frontend FormData
        const workspace =
          req.body.workspaceSlug?.trim().replace(/\s+/g, "_") || "general";
        const task =
          req.body.taskName?.trim().replace(/\s+/g, "_") || "unnamed_task";

        const safeFileName = file.originalname.replace(/\s+/g, "_");
        const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        // Path: workspaces/marketing/new-logo/12345-logo.png
        const keyPath = `workspaces/${workspace}/${task}/${uniqueId}-${safeFileName}`;

        cb(null, keyPath);
      } catch (error) {
        cb(error);
      }
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024, files: 10 },
});

export default taskUpload;
