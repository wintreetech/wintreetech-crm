import AcquirerDataModel from "../models/AcquirerData.model.js";
import AcquirerModel from "../models/Acquirer.model.js";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../utils/s3Client.js";
import { keys } from "../utils/keys.js";
const { S3_BUCKET_NAME } = keys.aws;

/* -----------------------------
   GET full Acquirer Data
----------------------------- */
export const getAcquirerData = async (req, res) => {
	try {
		const { bankName } = req.params;

		const data = await AcquirerDataModel.findOne({ bankName: bankName.trim() });
		if (!data) {
			return res
				.status(404)
				.json({ success: false, message: "Bank not found" });
		}

		res.status(200).json({ success: true, data });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};

/* -----------------------------
   CHECKLIST CONTROLLERS
----------------------------- */
/* ----------------------------------------
   GET checklist for a bank
----------------------------------------- */
export const getChecklistItems = async (req, res) => {
	try {
		const { bankName } = req.params;

		// Validate bank exists in master
		const bank = await AcquirerModel.findOne({ bankName: bankName.trim() });
		if (!bank)
			return res
				.status(404)
				.json({ success: false, message: "Bank not found" });

		// Find or create AcquirerData
		let acquirerData = await AcquirerDataModel.findOne({ bankName });
		if (!acquirerData) {
			acquirerData = await AcquirerDataModel.create({ bankName });
		}

		res.status(200).json({
			success: true,
			checklist: acquirerData.kycChecklist.items,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};

/* ----------------------------------------
   ADD checklist item
----------------------------------------- */
export const addChecklistItem = async (req, res) => {
	try {
		const { bankName } = req.params;
		const { title } = req.body;

		if (!title)
			return res
				.status(400)
				.json({ success: false, message: "Title is required" });

		// Validate bank
		const bank = await AcquirerModel.findOne({ bankName: bankName.trim() });
		if (!bank)
			return res
				.status(404)
				.json({ success: false, message: "Bank not found" });

		// Find or create data
		let acquirerData = await AcquirerDataModel.findOne({ bankName });
		if (!acquirerData) {
			acquirerData = await AcquirerDataModel.create({ bankName });
		}

		acquirerData.kycChecklist.items.push({
			title: title.trim(),
			isCompleted: false,
		});

		await acquirerData.save();

		res.status(201).json({
			success: true,
			checklist: acquirerData.kycChecklist.items,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};

/* ----------------------------------------
   TOGGLE checklist item
----------------------------------------- */
export const toggleChecklistItem = async (req, res) => {
	try {
		const { bankName, itemId } = req.params;

		const acquirerData = await AcquirerDataModel.findOne({ bankName });
		if (!acquirerData)
			return res
				.status(404)
				.json({ success: false, message: "Bank data not found" });

		const item = acquirerData.kycChecklist.items.id(itemId);
		if (!item)
			return res
				.status(404)
				.json({ success: false, message: "Checklist item not found" });

		item.isCompleted = !item.isCompleted;
		item.completedAt = item.isCompleted ? new Date() : null;

		await acquirerData.save();

		res.status(200).json({
			success: true,
			checklist: acquirerData.kycChecklist.items,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};

/* ----------------------------------------
   DELETE checklist item
----------------------------------------- */
export const deleteChecklistItem = async (req, res) => {
	try {
		const { bankName, itemId } = req.params;

		const acquirerData = await AcquirerDataModel.findOne({ bankName });
		if (!acquirerData) {
			return res.status(404).json({
				success: false,
				message: "Bank data not found",
			});
		}

		const beforeCount = acquirerData.kycChecklist.items.length;

		acquirerData.kycChecklist.items.pull({ _id: itemId });

		if (acquirerData.kycChecklist.items.length === beforeCount) {
			return res.status(404).json({
				success: false,
				message: "Checklist item not found",
			});
		}

		await acquirerData.save();

		res.status(200).json({
			success: true,
			checklist: acquirerData.kycChecklist.items,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			error: err.message,
		});
	}
};

/* -----------------------------
   DOCUMENT CONTROLLERS
----------------------------- */
// Upload documents
export const uploadAcquirerDocument = async (req, res) => {
	try {
		const { bankName, sectionName } = req.params;
		const { uploadedBy } = req.body;

		if (!uploadedBy) {
			return res.status(400).json({
				success: false,
				message: "uploadedBy is required",
			});
		}

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No files uploaded",
			});
		}

		/* ---------------------------------
		   1️⃣ Check bank exists in MASTER
		--------------------------------- */
		const masterAcquirer = await AcquirerModel.findOne({
			bankName: bankName.trim(),
		});

		if (!masterAcquirer) {
			return res.status(404).json({
				success: false,
				message: "Bank not found in Acquirer master",
			});
		}

		/* ---------------------------------
		   2️⃣ Ensure DATA document exists
		--------------------------------- */
		let acquirerData = await AcquirerDataModel.findOne({
			bankName: bankName.trim(),
		});

		if (!acquirerData) {
			acquirerData = await AcquirerDataModel.create({
				bankName: masterAcquirer.bankName,
				sections: [],
				createdAt: new Date(),
			});
		}

		/* ---------------------------------
		   3️⃣ Find or create section
		--------------------------------- */
		let section = acquirerData.sections.find(
			(s) => s.sectionName === sectionName
		);

		if (!section) {
			acquirerData.sections.push({
				sectionName,
				upload: [],
			});

			section = acquirerData.sections.find(
				(s) => s.sectionName === sectionName
			);
		}

		/* ---------------------------------
		   4️⃣ Push uploaded files
		--------------------------------- */
		const filesData = req.files.map((file) => ({
			fileName: file.originalname,
			fileUrl: file.location,
			uploadedBy,
			uploadedAt: new Date(),
		}));

		section.upload.push(...filesData);

		await acquirerData.save();

		return res.status(200).json({
			success: true,
			message: "Documents uploaded successfully",
			data: section.upload,
		});
	} catch (err) {
		console.error("❌ Upload error:", err);
		return res.status(500).json({
			success: false,
			error: err.message,
		});
	}
};

// Get documents by section
export const getAcquirerDocumentsBySection = async (req, res) => {
	try {
		const { bankName, sectionName } = req.params;

		const acquirer = await AcquirerDataModel.findOne({
			bankName: bankName.trim(),
		});
		if (!acquirer)
			return res
				.status(404)
				.json({ success: false, message: "Bank not found" });

		const section = acquirer.sections.find(
			(s) => s.sectionName === sectionName
		);
		res.status(200).json({ success: true, data: section?.upload || [] });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};

// Generate signed download link
export const generateAcquirerDownloadLink = async (req, res) => {
	try {
		const { fileUrl } = req.body;
		if (!fileUrl)
			return res
				.status(400)
				.json({ success: false, message: "fileUrl is required" });

		const url = new URL(fileUrl);
		const key = decodeURIComponent(url.pathname.substring(1));

		const command = new GetObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: key,
			ResponseContentDisposition: "attachment",
		});

		const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
		res.status(200).json({ success: true, downloadUrl: signedUrl });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
};

// Delete document
export const deleteAcquirerDocument = async (req, res) => {
	try {
		const { documentId } = req.params;

		const acquirer = await AcquirerDataModel.findOne({
			"sections.upload._id": documentId,
		});

		if (!acquirer) {
			return res
				.status(404)
				.json({ success: false, message: "Document not found" });
		}

		let s3Key = null;

		for (const section of acquirer.sections) {
			const index = section.upload.findIndex(
				(doc) => doc._id.toString() === documentId
			);

			if (index > -1) {
				const fileUrl = section.upload[index].fileUrl;

				const url = new URL(fileUrl);
				s3Key = decodeURIComponent(
					url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname
				);

				section.upload.splice(index, 1);
				break;
			}
		}

		await acquirer.save();

		if (s3Key) {
			await s3.send(
				new DeleteObjectCommand({
					Bucket: S3_BUCKET_NAME,
					Key: s3Key,
				})
			);
		}

		return res.status(200).json({
			success: true,
			message: "Document deleted successfully from MongoDB and S3",
		});
	} catch (err) {
		console.error("Delete error:", err);
		return res.status(500).json({ success: false, error: err.message });
	}
};
