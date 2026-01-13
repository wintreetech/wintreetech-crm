import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "./s3Client.js";
import { keys } from "../utils/keys.js";

const { S3_BUCKET_NAME } = keys.aws;

const acquirerUpload = multer({
	storage: multerS3({
		s3,
		bucket: S3_BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: "private",
		key: (req, file, cb) => {
			try {
				const { bankName, sectionName } = req.params;

				const safeBank = bankName.replace(/\s+/g, "_");
				const safeSection = sectionName.replace(/\s+/g, "_");
				const safeFile = file.originalname.replace(/\s+/g, "_");

				const uniqueName = `${Date.now()}-${safeFile}`;

				const keyPath = `acquirers/${safeBank}/${safeSection}/${uniqueName}`;

				cb(null, keyPath);
			} catch (err) {
				cb(err);
			}
		},
	}),
	limits: { fileSize: 100 * 1024 * 1024, files: 10 },
});

export default acquirerUpload;
