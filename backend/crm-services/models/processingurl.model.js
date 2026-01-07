import { model, Schema } from "mongoose";

const ProcessingUrlSchema = new Schema(
	{
		company: {
			type: Schema.Types.ObjectId,
			ref: "Sales",
			required: true,
		},

		trustedUrls: [
			{
				type: String,
				required: false,
				trim: true,
				maxlength: [5000, "URL cannot exceed 5000 characters"],
			},
		],

		ftdUrls: [
			{
				type: String,
				required: false,
				trim: true,
				maxlength: [5000, "URL cannot exceed 5000 characters"],
			},
		],
	},
	{ timestamps: true }
);

// ✅ Ensure one record per company
ProcessingUrlSchema.index({ company: 1 }, { unique: true });

const ProcessingUrlModel = model("ProcessingUrl", ProcessingUrlSchema);
export default ProcessingUrlModel;
