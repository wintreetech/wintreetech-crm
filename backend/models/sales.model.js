import mongoose from "mongoose";
const { Schema } = mongoose;

const SalesSchema = new Schema(
	{
		leadSource: {
			type: String,
			required: [true, "Lead source is required"],
			trim: true,
		},
		partner: {
			type: String,
			required: [true, "Partner is required"],
			trim: true,
		},
		companyName: {
			type: String,
			required: [true, "Company name is required"],
			trim: true,
		},
		companyWebsite: {
			type: String,
			required: [true, "Company website is required"],
			trim: true,
			match: [
				/^(https?:\/\/)?([\w\d\-]+\.)+[\w]{2,}(\/.*)?$/,
				"Please enter a valid URL",
			],
		},
		companyMobileNo: {
			type: String,
			required: [true, "Company mobile number is required"],
			trim: true,
			validate: {
				validator: function (v) {
					return /^\d{10}$/.test(v);
				},
				message: (props) =>
					`${props.value} is not a valid 10-digit mobile number`,
			},
		},
		status: {
			type: String,
			enum: ["Open", "Active", "Suspended"],
			default: "Open",
		},
		subStatus: {
			type: String,
			enum: [
				"Under Discussion",
				"Pricing proposal sent",
				"Docs Review",
				"Agreement sent",
				"Agreement Sign",
				"Integration initiated",
			],
			validate: {
				validator: function (v) {
					// Only allow subStatus if status is Open
					return this.status === "Open" ? !!v : v === undefined || v === null;
				},
				message: "SubStatus is only allowed when status is 'Open'",
			},
		},
		companyEmail: {
			type: String,
			required: [true, "Company email is required"],
			trim: true,
			lowercase: true,
			unique: true,
			index: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please enter a valid email",
			],
		},
		monthlyDealSize: {
			type: Number,
			default: 0,
			min: [0, "Deal size cannot be negative"],
		},
		dealOwner: {
			type: String,
			trim: true,
			required: true,
		},
		contactName: {
			type: String,
			trim: true,
			required: true,
		},
		companyNotes: {
			type: String,
			trim: true,
		},
		remarks: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

const SalesModel = mongoose.model("Sales", SalesSchema);

export default SalesModel;
