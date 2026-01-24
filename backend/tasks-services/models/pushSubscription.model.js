import { Schema, model } from "mongoose";

const pushSubscriptionSchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscription: {
    endpoint: { type: String, required: true },
    expirationTime: { type: Number, nullable: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  deviceType: { type: String, enum: ["mobile", "desktop"], default: "mobile" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

pushSubscriptionSchema.index(
  { userId: 1, "subscription.endpoint": 1 },
  { unique: true },
);

export default model("PushSubscription", pushSubscriptionSchema);
