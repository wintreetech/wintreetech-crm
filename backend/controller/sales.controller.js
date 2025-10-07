import SalesModel from "../models/sales.model.js";
import SalesDataModel from "../models/SalesData.model.js";

// Create a new sales lead
const createSalesLead = async (req, res) => {
	try {
		const salesLead = new SalesModel(req.body);
		await salesLead.save();
		res.status(201).json({ success: true, data: salesLead });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
};

// Get a single sales lead by ID
const getSalesLead = async (req, res) => {
	try {
		const { id } = req.params;
		const salesLead = await SalesModel.findById(id);
		if (!salesLead) {
			return res
				.status(404)
				.json({ success: false, message: "Sales lead not found" });
		}
		res.status(200).json({ success: true, data: salesLead });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
};

// Update a sales lead by ID
const updateSalesLead = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedLead = await SalesModel.findByIdAndUpdate(id, req.body, {
			new: true, // return updated document
			runValidators: true, // run schema validations
		});
		if (!updatedLead) {
			return res
				.status(404)
				.json({ success: false, message: "Sales lead not found" });
		}
		res.status(200).json({ success: true, data: updatedLead });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
};

// Delete a sales lead by ID
const deleteSalesLead = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedLead = await SalesModel.findByIdAndDelete(id);
		if (!deletedLead) {
			return res
				.status(404)
				.json({ success: false, message: "Sales lead not found" });
		}
		res
			.status(200)
			.json({ success: true, message: "Sales lead deleted successfully" });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
};

// Get all sales leads (optional for completeness)
const getAllSalesLeads = async (req, res) => {
	try {
		const salesLeads = await SalesModel.find();
		res.status(200).json({ success: true, data: salesLeads });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
};

const uploadSalesCustomerLeadData = async (req, res) => {
	try {
		const { companyName } = req.body;

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ error: "No files uploaded" });
		}

		// Construct file info array for MongoDB
		const filesData = req.files.map((file) => ({
			fileName: file.originalname,
			fileUrl: `${req.protocol}://${req.get(
				"host"
			)}/merchant/${encodeURIComponent(companyName)}/${encodeURIComponent(
				file.originalname
			)}`,
			uploadedAt: new Date(),
		}));

		// Update MongoDB: push files into companyData array
		const updatedDoc = await SalesDataModel.findOneAndUpdate(
			{ companyName },
			{ $push: { companyData: { $each: filesData } } },
			{ new: true, upsert: true }
		);

		res.status(200).json({
			message: "File(s) uploaded successfully",
			data: updatedDoc,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
};

export {
	createSalesLead,
	getSalesLead,
	updateSalesLead,
	deleteSalesLead,
	getAllSalesLeads,
	uploadSalesCustomerLeadData,
};
