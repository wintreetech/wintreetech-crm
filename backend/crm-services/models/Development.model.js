import mongoose from "mongoose";

const { Schema } = mongoose;

const DevelopmentSchema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    registrarPlatform: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    companyDirector: {
      type: String,
      trim: true,
      default: "",
    },
    landline: {
      type: String,
      trim: true,
      default: "",
    },
    mainIp: {
      type: String,
      trim: true,
      default: "",
    },
    merchantCountry: {
      type: String,
      trim: true,
      default: "",
    },
    expiredOn: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const DevelopmentModel = mongoose.model("Development", DevelopmentSchema);

export default DevelopmentModel;
