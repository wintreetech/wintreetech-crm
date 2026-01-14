import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AcquirerSchema = new Schema(
	{
		// 🏦 Bank Name
		bankName: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},

		// 🤝 Partner Name
		partnerName: {
			type: String,
			required: true,
			trim: true,
		},

		// 🏢 Entity Name
		entityName: [
			{
				type: String,
				trim: true,
				required: true,
			},
		],

		// 🧑 Contact Person
		contactPerson: {
			type: String,
			required: true,
			trim: true,
		},

		// 📧 Contact Email
		contactEmail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

/* 🔐 Prevent duplicate bank + entity */
AcquirerSchema.index({ bankName: 1, entityName: 1 }, { unique: true });
const AcquirerModel = model("Acquirer", AcquirerSchema);
export default AcquirerModel;
