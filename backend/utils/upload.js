import multer from "multer";
import fs from "fs";
import path from "path";

// Multer storage configuration
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const companyName = req.body.companyName;
		if (!companyName) return cb(new Error("Company name is required"));

		// Create folder dynamically: merchant/companyName
		const dir = path.join("merchant", companyName);
		fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname); // Keep original file name
	},
});

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Only PDF files are allowed"), false);
	}
};

// Multer upload instance
const upload = multer({ storage, fileFilter });

export default upload;
