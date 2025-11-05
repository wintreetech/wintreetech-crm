import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "./s3Client.js";
import { keys } from "../utils/keys.js";

const { S3_BUCKET_NAME } = keys.aws;

const upload = multer({
	storage: multerS3({
		s3,
		bucket: S3_BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: "private",
		key: (req, file, cb) => {
			try {
				const companyName =
					req.body.companyName?.trim().replace(/\s+/g, "_") ||
					"unknown_company";
				const subStatus =
					req.body.subStatus?.trim().replace(/\s+/g, "_") || "unknown_status";

				const safeFileName = file.originalname.replace(/\s+/g, "_");
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				const fileName = `${uniqueSuffix}-${safeFileName}`;
				const keyPath = `merchant/${companyName}/${subStatus}/${fileName}`;

				cb(null, keyPath);
			} catch (err) {
				cb(err);
			}
		},
	}),
	limits: { fileSize: 100 * 1024 * 1024, files: 10 },
});

export default upload;
