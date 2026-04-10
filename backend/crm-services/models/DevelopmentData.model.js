import { Schema, model } from "mongoose";

export const ALLOWED_DEVELOPMENT_SECTIONS = [
  "Business Plan",
  "Customer Journey",
  "Domain Ownership",
  "Invoice & Email",
];

const developmentUploadSchema = new Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true },
});

const developmentSectionSchema = new Schema({
  sectionName: {
    type: String,
    required: true,
    trim: true,
    enum: ALLOWED_DEVELOPMENT_SECTIONS,
  },
  upload: [developmentUploadSchema],
});

const developmentDataSchema = new Schema(
  {
    developmentId: {
      type: Schema.Types.ObjectId,
      ref: "Development",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    sectionData: [developmentSectionSchema],
  },
  { timestamps: true }
);

const DevelopmentDataModel = model("DevelopmentData", developmentDataSchema);

export default DevelopmentDataModel;
