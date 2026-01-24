import webpush from "web-push";
import PushSubscription from "../models/pushSubscription.model.js";

// Configure with your VAPID keys (Generate these if you haven't)
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const sendPushNotification = async (userId, payload) => {
  try {
    // 1. Find all registered devices for this specific user
    const subscriptions = await PushSubscription.find({ userId });

    if (subscriptions.length === 0) {
      console.log(
        `[Web-Push] No subscriptions found for User: ${userId}. Skipping push.`,
      );
      return;
    }

    console.log(
      `[Web-Push] Found ${subscriptions.length} device(s) for User: ${userId}. Sending...`,
    );

    // 2. Send the push to every device
    const pushPromises = subscriptions.map((sub) => {
      return webpush
        .sendNotification(sub.subscription, JSON.stringify(payload))
        .catch(async (err) => {
          console.error(`[Web-Push] Failed for endpoint: ${err.statusCode}`);
          // If the subscription is no longer valid (status 410 or 404), delete it
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
            console.log("[Web-Push] Removed expired subscription from DB.");
          }
        });
    });

    await Promise.all(pushPromises);
  } catch (error) {
    console.error("Error sending Web-Push:", error);
  }
};
