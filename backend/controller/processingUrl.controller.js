import ProcessingUrlModel from "../models/processingurl.model.js";
import SalesModel from "../models/sales.model.js";
import ExcelJS from "exceljs";

/**
 * GET /api/processing-urls/:companyId
 * Returns { data: { trustedUrls: [], ftdUrls: [] } }
 */
export const getProcessingUrls = async (req, res) => {
	try {
		const { companyId } = req.params;
		const record = await ProcessingUrlModel.findOne({ company: companyId });

		if (!record) {
			return res.status(200).json({ data: { trustedUrls: [], ftdUrls: [] } });
		}

		// return shape matches existing frontend usage: response.data.data.trustedUrls
		return res.status(200).json({ data: record });
	} catch (err) {
		console.error("Error fetching processing URLs:", err);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

/**
 * POST /api/processing-urls/:companyId
 * Body: { urls: [..], type: 'trusted'|'ftd' }
 * Returns { message, data: record }
 */
export const addProcessingUrls = async (req, res) => {
	try {
		const { companyId } = req.params;
		const { urls, type } = req.body;

		if (!Array.isArray(urls) || urls.length === 0) {
			return res.status(400).json({ message: "URLs array is required" });
		}
		if (type && !["trusted", "ftd"].includes(type)) {
			return res
				.status(400)
				.json({ message: "Type must be 'trusted' or 'ftd'" });
		}

		// normalize type (default to trusted)
		const key = type === "ftd" ? "ftdUrls" : "trustedUrls";

		// validate company exists
		const company = await SalesModel.findById(companyId);
		if (!company) return res.status(404).json({ message: "Company not found" });

		// clean + dedupe input urls
		const cleaned = Array.from(
			new Set(
				urls
					.map((u) => (typeof u === "string" ? u.trim() : ""))
					.filter((u) => u && /^https?:\/\//i.test(u))
			)
		);

		let record = await ProcessingUrlModel.findOne({ company: companyId });
		if (!record) {
			record = new ProcessingUrlModel({
				company: companyId,
				trustedUrls: [],
				ftdUrls: [],
			});
		}

		// add only URLs not already present
		const existingSet = new Set(record[key].map((u) => u.trim()));
		const toAdd = cleaned.filter((u) => !existingSet.has(u));
		if (toAdd.length > 0) {
			record[key] = [...record[key], ...toAdd];
			// ensure overall uniqueness in arrays (just in case)
			record.trustedUrls = Array.from(
				new Set(record.trustedUrls.map((u) => u.trim()))
			);
			record.ftdUrls = Array.from(new Set(record.ftdUrls.map((u) => u.trim())));
			await record.save();
			return res
				.status(200)
				.json({ message: "URLs updated successfully.", data: record });
		}

		// nothing new to add
		return res
			.status(200)
			.json({ message: "No new URLs to add.", data: record });
	} catch (err) {
		console.error("Error adding processing URLs:", err);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

/**
 * DELETE /api/processing-urls/:companyId
 * Body: { url: "http...", type: "trusted"|"ftd" }   (if url missing -> clear that type)
 * Returns { message, data: record }
 */
export const deleteProcessingUrls = async (req, res) => {
	try {
		const { companyId } = req.params;
		const { url, type } = req.body;

		const key = type === "ftd" ? "ftdUrls" : "trustedUrls";

		const record = await ProcessingUrlModel.findOne({ company: companyId });
		if (!record)
			return res
				.status(404)
				.json({ message: "No processing URL record found." });

		if (url) {
			record[key] = record[key].filter((u) => u !== url);
		} else {
			// clear that list
			record[key] = [];
		}

		await record.save();
		return res.status(200).json({ message: "URLs updated.", data: record });
	} catch (err) {
		console.error("Error deleting processing URLs:", err);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

/**
 * GET /api/processing-urls/download
 * Query params:
 *   - companyId (optional) -> if provided, download for that company only
 *   - type (optional) = 'trusted'|'ftd'|'all' (default 'trusted')
 *
 * If companyId provided + type trusted -> download that company's Trusted (single sheet)
 * If companyId provided + type ftd -> download that company's FTD (single sheet) (only if partner=dreamzpay)
 * If no companyId -> will generate a workbook with sheets for all companies (respecting type where possible)
 */
export const downloadProcessingUrls = async (req, res) => {
	try {
		const { companyId } = req.params;
		const { type } = req.query; // "trusted" | "ftd"

		// 🔍 1. Fetch company details
		const company = await SalesModel.findById(companyId);
		if (!company)
			return res
				.status(404)
				.json({ success: false, message: "Company not found" });

		// 🔍 2. Fetch processing URLs
		const record = await ProcessingUrlModel.findOne({ company: companyId });
		if (!record)
			return res.status(404).json({ success: false, message: "No URLs found" });

		// 🔍 3. Select URLs based on type
		const urls =
			type === "ftd" ? record.ftdUrls || [] : record.trustedUrls || [];

		if (!urls.length)
			return res
				.status(404)
				.json({ success: false, message: "No URLs to download" });

		// 🧾 4. Create Excel file
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet(`${type.toUpperCase()} URLs`);

		// ✅ Define headers
		sheet.columns = [
			{ header: "Merchant", key: "merchant", width: 30 },
			{ header: "Partner", key: "partner", width: 30 },
			{ header: "URL", key: "url", width: 60 },
			{ header: "Processing", key: "processing", width: 20 },
		];

		// ✅ Fill rows
		urls.forEach((url) => {
			sheet.addRow({
				merchant: company.companyName || "N/A",
				partner: company.partner || "N/A",
				url,
				processing: company.status || "Pending",
			});
		});

		// ✅ File name with company + date
		const date = new Date().toISOString().split("T")[0];
		const fileName = `${company.companyName}_${type}_urls_${date}.xlsx`;

		// ✅ Set headers for download
		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);

		// ✅ Write file to response
		await workbook.xlsx.write(res);
		res.end();
	} catch (err) {
		console.error("Error downloading URLs:", err);
		res.status(500).json({ success: false, message: err.message });
	}
};

// ✅ Download all processing URLs (for all companies)
export const downloadAllProcessingUrls = async (req, res) => {
	try {
		// 🟩 1. Fetch all companies and their URLs
		const allRecords = await ProcessingUrlModel.find().populate("company");
		if (!allRecords.length)
			return res.status(404).json({
				success: false,
				message: "No processing URLs found",
			});

		// 🧾 2. Create workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet("All Processing URLs");

		// 🏷️ 3. Define headers (consistent with single-company download)
		sheet.columns = [
			{ header: "Merchant", key: "merchant", width: 30 },
			{ header: "Partner", key: "partner", width: 25 },
			{ header: "URL", key: "url", width: 60 },
			{ header: "Processing", key: "processing", width: 20 },
			{ header: "Type", key: "type", width: 15 },
		];

		// 🧠 4. Add all rows
		allRecords.forEach((record) => {
			const company = record.company;
			const merchant = company?.companyName || "N/A";
			const partner = company?.partner || "N/A";
			const processing = company?.status || "Pending";

			// Trusted URLs
			(record.trustedUrls || []).forEach((url) => {
				sheet.addRow({
					merchant,
					partner,
					url,
					processing,
					type: "Trusted",
				});
			});

			// FTD URLs
			(record.ftdUrls || []).forEach((url) => {
				sheet.addRow({
					merchant,
					partner,
					url,
					processing,
					type: "FTD",
				});
			});
		});

		// 🗓️ 5. File name
		const date = new Date().toISOString().split("T")[0];
		const fileName = `All_Processing_URLs_${date}.xlsx`;

		// 🧾 6. Set headers for download
		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);

		await workbook.xlsx.write(res);
		res.end();
	} catch (err) {
		console.error("Error downloading all processing URLs:", err);
		res
			.status(500)
			.json({ success: false, message: "Failed to download all URLs" });
	}
};
