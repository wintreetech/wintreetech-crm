import Currency from "../models/currency.model.js";

export const getCurrency = async (req, res) => {
	try {
		const { companyId } = req.params;
		const data = await Currency.findOne({ company: companyId });

		return res.json({
			success: true,
			data,
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

export const saveCurrency = async (req, res) => {
	try {
		const { companyId } = req.params;
		const { currency, payMode, cardType } = req.body;

		let record = await Currency.findOne({ company: companyId });

		if (!record) {
			// create
			record = await Currency.create({
				company: companyId,
				currency,
				payMode,
				cardType,
			});
		} else {
			// update
			record.currency = currency;
			record.payMode = payMode;
			record.cardType = cardType;
			await record.save();
		}

		return res.json({
			success: true,
			data: record,
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

export const deleteCurrency = async (req, res) => {
	try {
		const { companyId } = req.params;

		await Currency.deleteOne({ company: companyId });

		return res.json({
			success: true,
			message: "Deleted successfully",
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};
