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
    legalName: {
      type: String,
      required: [true, "Legal name is required"],
      trim: true,
    },
    companyWebsite: {
      type: String,
      required: [true, "Company website is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username or email is required"],
      trim: true,
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
    status: {
      type: String,
      enum: ["Open", "Active", "Suspended", "Inactive"],
      default: "Open",
    },
    subStatus: {
      type: String,
      enum: [
        "Under Discussion",
        "Pricing Proposal",
        "KYC Docs",
        "Upload Contract",
        "Signed Contract & Complete",
        "Annexture",
      ],
      default: "Under Discussion",
      validate: {
        validator: function (v) {
          return this.status === "Open" ? !!v : v === undefined || v === null;
        },
        message: "SubStatus is only allowed when status is 'Open'",
      },
    },
    monthlyDealSize: {
      type: Number,
      default: 0,
      min: [0, "Deal size cannot be negative"],
    },
    dealOwner: {
      type: String,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
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
