import { model, Schema } from "mongoose";

const currencySchema = new Schema(
	{
		company: {
			type: Schema.Types.ObjectId,
			ref: "Sales",
			required: true,
		},

		currency: {
			type: [String],
			required: true,
			default: [],
		},

		payMode: {
			type: [String],
			required: true,
			default: [],
		},

		cardType: {
			type: [String],
			required: true,
			default: [],
		},
	},
	{ timestamps: true }
);

// One record per company
currencySchema.index({ company: 1 }, { unique: true });

const Currency = model("Currency", currencySchema);
export default Currency;
