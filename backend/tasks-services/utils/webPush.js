import webpush from "web-push";
import PushSubscription from "../models/pushSubscription.model.js";

// Configure with your VAPID keys (Generate these if you haven't)
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const sendPushNotification = async (subscription, payload) => {
  try {
    // Send the push to every device
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error("Error sending Web-Push:", error);
    // Auto-cleanup for this specific expired device
    if (err.statusCode === 410 || err.statusCode === 404) {
      await PushSubscription.deleteOne({
        "subscription.endpoint": subscription.endpoint,
      });
      console.log("[Web-Push] Removed expired device from DB.");
    }
  }
};
