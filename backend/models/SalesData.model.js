import { Schema, model } from "mongoose";

const salesDataSchema = new Schema({
	companyName: {
		type: String,
		required: true,
		trim: true,
	},
	companyData: [
		{
			fileName: {
				type: String,
				required: true,
			},
			fileUrl: {
				type: String,
				required: true,
			},
			uploadedAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
});

const SalesDataModel = model("SalesData", salesDataSchema);

export default SalesDataModel;
