import { Schema, model } from "mongoose";

const userSyncSchema = new Schema(
  {
    // We store the CRM's MongoDB _id as crmUserId to link them
    crmUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "superadmin"] },
    department: {
      type: String,
      enum: ["sales", "finance", "recon", "support", "management"],
    },
  },
  { timestamps: true, _id: false }
);

const UserSync = model("user_sync", userSyncSchema);
export default UserSync;
