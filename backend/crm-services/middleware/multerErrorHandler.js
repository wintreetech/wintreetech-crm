import multer from "multer";

export const multerErrorHandler = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({
				message: "File too large. Max size is 100MB per file.",
			});
		}

		if (err.code === "LIMIT_FILE_COUNT") {
			return res.status(400).json({
				message: "Too many files. Maximum 10 files allowed.",
			});
		}

		return res.status(400).json({ message: err.message });
	}

	next(err);
};
