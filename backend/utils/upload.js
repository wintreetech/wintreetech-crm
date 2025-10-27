// upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Temporary storage
const tempStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const tempDir = path.join("merchant", "temp");
		fs.mkdirSync(tempDir, { recursive: true });
		cb(null, tempDir);
	},
	filename: (req, file, cb) => {
		const safeName = file.originalname.replace(/\s+/g, "_");
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${uniqueSuffix}-${safeName}`);
	},
});

const upload = multer({
	storage: tempStorage,
	limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export default upload;
