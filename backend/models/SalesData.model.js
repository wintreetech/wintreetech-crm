import { Schema, model } from "mongoose";
import { type } from "os";

const uploadSchema = new Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true },
});

const companyDataSchema = new Schema({
  subStatus: { type: String, required: true },
  upload: [uploadSchema],
});

const salesDataSchema = new Schema({
  companyName: { type: String, required: true, trim: true },
  companyData: [companyDataSchema],
});

const SalesDataModel = model("SalesData", salesDataSchema);
export default SalesDataModel;
