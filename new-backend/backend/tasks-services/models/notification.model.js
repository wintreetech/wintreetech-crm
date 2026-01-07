import { model, Schema } from "mongoose";

const notificationSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  senderName: String,
  title: String,
  message: String,
  type: String,
  metadata: Object,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// This defines the main bucket for each user
const userNotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    userName: String,
    department: String,
    role: String,
    // Using the renamed schema for the nested array
    notifications: [notificationSchema],
  },
  { timestamps: true }
);

const UserNotification = model("UserNotification", userNotificationSchema);
export default UserNotification;
