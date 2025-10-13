import multer from "multer";
import fs from "fs";
import path from "path";

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const companyName = req.body.companyName?.trim();
		if (!companyName) return cb(new Error("Company name is required"));

		// 🗂️ Create folder dynamically: merchant/companyName
		const dir = path.join("merchant", companyName);
		fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},

	filename: function (req, file, cb) {
		// 🕒 Add timestamp to avoid overwriting files with same name
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const safeName = file.originalname.replace(/\s+/g, "_");
		cb(null, `${uniqueSuffix}-${safeName}`);
	},
});

// --- File Filter (Accept Anything) ---
const fileFilter = (req, file, cb) => {
	// ✅ Accept all file types
	cb(null, true);
};

// --- Multer Instance ---
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 100 * 1024 * 1024, // 100MB limit for safety
	},
});

export default upload;
