import { Router } from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
import PushSubscription from "../models/pushSubscription.model.js";

const router = Router();

// Save or Update a subscription
router.post("/save-subscription", async (req, res) => {
  try {
    const { userId, subscription, deviceType } = req.body;
    console.log(`[Backend] Received subscription request for User: ${userId}`);

    // Subscription object is required to prevent 'null' entries
    if (!subscription || !subscription.endpoint) {
      return res
        .status(400)
        .json({ message: "Subscription data with endpoint is required" });
    }

    // Update based on the unique endpoint.
    await PushSubscription.findOneAndUpdate(
      { "subscription.endpoint": subscription.endpoint },
      {
        userId,
        subscription,
        deviceType: deviceType || "mobile",
      },
      { upsert: true, new: true },
    );

    res.status(200).json({
      message: `Subscription saved successfully for device ${deviceType}`,
    });
  } catch (error) {
    console.error("Save Subscription Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Unsubscribe route for logout
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await PushSubscription.deleteOne({ "subscription.endpoint": endpoint });
    }
    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Public Key for the frontend
router.get("/public-key", (req, res) => {
  console.log("[Backend] Fetching VAPID Public Key");
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.get("/:userId", getMyNotifications);
router.patch("/read", markNotificationAsRead);

router.patch("/read-all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await UserNotification.updateOne(
      { userId },
      { $set: { "notifications.$[].isRead": true } },
    );
    res.json({ success: true, message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
