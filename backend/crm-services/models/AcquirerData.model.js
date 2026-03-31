import mongoose from "mongoose";
import { uploadSchema } from "./SalesData.model.js";

const { Schema, model } = mongoose;

/* -------------------------
   Checklist Item
-------------------------- */
const checklistItemSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		isCompleted: { type: Boolean, default: false },
		completedAt: { type: Date },
	},
	{ _id: true },
);

/* -------------------------
   Document Section
-------------------------- */
const sectionSchema = new Schema({
	sectionName: {
		type: String,
		enum: ["Initial Contract", "Signed Contract", "Annexture"],
		required: true,
	},
	upload: {
		type: [uploadSchema],
		default: [],
	},
});

/* -------------------------
   Acquirer Data
-------------------------- */
const AcquirerDataSchema = new Schema(
	{
		bankName: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},

		// ✅ KYC checklist
		kycChecklist: {
			checklistName: {
				type: String,
				default: "KYC Checklist",
			},
			items: {
				type: [checklistItemSchema],
				default: [],
			},
		},

		// 📄 Documents
		sections: {
			type: [sectionSchema],
			default: [],
		},
	},
	{ timestamps: true },
);

export default model("AcquirerData", AcquirerDataSchema);
