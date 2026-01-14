import AcquirerModel from "../models/Acquirer.model.js";
import AcquirerDataModel from "../models/AcquirerData.model.js";

/* -----------------------------
   Helpers
----------------------------- */
const normalize = (val) => (val ? val.trim() : "");

/* -----------------------------
   Create Acquirer(s) – Multiple Entities
----------------------------- */
export const createAcquirer = async (req, res) => {
	try {
		const {
			acquirerBankName,
			partnerName,
			entityName: entityNames, // array of entities
			acquirerContact,
			acquirerEmail,
		} = req.body;

		// 🔒 Validate
		if (
			!acquirerBankName ||
			!partnerName ||
			!Array.isArray(entityNames) ||
			entityNames.length === 0 ||
			!acquirerContact ||
			!acquirerEmail
		) {
			return res.status(400).json({
				success: false,
				message:
					"All fields are required and entityName must be a non-empty array",
			});
		}

		// 🧹 Normalize common fields
		const bankName = normalize(acquirerBankName);
		const partner = normalize(partnerName);
		const contactPerson = normalize(acquirerContact);
		const contactEmail = normalize(acquirerEmail).toLowerCase();
		const entities = entityNames.map(normalize);

		// 🔍 Check if an acquirer already exists for this bank
		let acquirer = await AcquirerModel.findOne({ bankName });

		if (acquirer) {
			// Merge entities, avoid duplicates
			acquirer.entityName = Array.from(
				new Set([...acquirer.entityName, ...entities])
			);
			acquirer.partnerName = partner; // optionally update partner if changed
			acquirer.contactPerson = contactPerson;
			acquirer.contactEmail = contactEmail;

			await acquirer.save();

			return res.status(200).json({
				success: true,
				message: "Acquirer updated with new entities",
				data: acquirer,
			});
		}

		// 💾 Create new acquirer record
		acquirer = await AcquirerModel.create({
			bankName,
			partnerName: partner,
			entityName: entities,
			contactPerson,
			contactEmail,
		});

		return res.status(201).json({
			success: true,
			message: "Acquirer created successfully",
			data: acquirer,
		});
	} catch (err) {
		console.error("Create Acquirer Error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to create acquirer",
			error: err.message,
		});
	}
};

/* -----------------------------
   Get All Acquirers
----------------------------- */
export const getAllAcquirers = async (req, res) => {
	try {
		const acquirers = await AcquirerModel.find().sort({
			bankName: 1,
			entityName: 1,
		});

		return res.status(200).json({
			success: true,
			count: acquirers.length,
			data: acquirers,
		});
	} catch (err) {
		console.error("Get All Acquirers Error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch acquirers",
			error: err.message,
		});
	}
};

/* -----------------------------
   Get Acquirer by ID
----------------------------- */
export const getAcquirerById = async (req, res) => {
	try {
		const { id } = req.params;

		const acquirer = await AcquirerModel.findById(id);
		if (!acquirer) {
			return res.status(404).json({
				success: false,
				message: "Acquirer not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: acquirer,
		});
	} catch (err) {
		console.error("Get Acquirer Error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch acquirer",
			error: err.message,
		});
	}
};

/* -----------------------------
   Update Acquirer
----------------------------- */
export const updateAcquirer = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			acquirerBankName,
			partnerName,
			entityName,
			acquirerContact,
			acquirerEmail,
		} = req.body;

		const acquirer = await AcquirerModel.findById(id);
		if (!acquirer) {
			return res.status(404).json({
				success: false,
				message: "Acquirer not found",
			});
		}

		// 🔍 Check duplicate bank name (ignore self)
		if (acquirerBankName) {
			const existing = await AcquirerModel.findOne({
				_id: { $ne: id },
				bankName: normalize(acquirerBankName),
			});
			if (existing) {
				return res.status(409).json({
					success: false,
					message: "Another acquirer already exists with this bank name",
				});
			}
		}

		// ✅ REPLACE entityName array
		if (Array.isArray(entityName)) {
			acquirer.entityName = entityName.map((e) => normalize(e));
		}

		// Update other fields
		if (acquirerBankName) acquirer.bankName = normalize(acquirerBankName);
		if (partnerName) acquirer.partnerName = normalize(partnerName);
		if (acquirerContact) acquirer.contactPerson = normalize(acquirerContact);
		if (acquirerEmail)
			acquirer.contactEmail = normalize(acquirerEmail).toLowerCase();

		await acquirer.save();

		return res.status(200).json({
			success: true,
			message: "Acquirer updated successfully",
			data: acquirer,
		});
	} catch (err) {
		console.error("Update Acquirer Error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to update acquirer",
			error: err.message,
		});
	}
};

/* -----------------------------
   Delete Acquirer
----------------------------- */
export const deleteAcquirer = async (req, res) => {
	try {
		const { id } = req.params;

		// 1️⃣ Find the acquirer first
		const acquirer = await AcquirerModel.findById(id);
		if (!acquirer) {
			return res.status(404).json({
				success: false,
				message: "Acquirer not found",
			});
		}

		const bankName = acquirer.bankName;

		// 2️⃣ Delete the acquirer
		await AcquirerModel.findByIdAndDelete(id);

		// 3️⃣ Delete related acquirer data
		await AcquirerDataModel.deleteMany({ bankName });

		return res.status(200).json({
			success: true,
			message: "Acquirer and related data deleted successfully",
		});
	} catch (err) {
		console.error("Delete Acquirer Error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to delete acquirer",
			error: err.message,
		});
	}
};
