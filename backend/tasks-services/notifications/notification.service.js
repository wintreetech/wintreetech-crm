import UserNotification from "../models/notification.model.js";
import { emitEvent } from "../realtime/emitter.js";
import { EVENTS } from "../socket/events.js";
import { sendPushNotification } from "../utils/webPush.js";
import PushSubscription from "../models/pushSubscription.model.js";
import { getIO } from "../socket/index.js";

export const sendNotification = async ({
  recipients,
  sender,
  title,
  message,
  type,
  metadata,
}) => {
  try {
    console.log("sending notification");
    // FILTER: Ensure recipients are valid IDs (not names or objects)
    // If your assignees are objects {id, name}, extract just the id.
    const validRecipientIds = recipients
      .map((r) => (typeof r === "object" ? r.id || r._id : r))
      .filter((id) => id && id.length === 24); // Only allow 24-char hex strings

    const senderId =
      typeof sender === "object" ? sender.id || sender._id : sender;
    const senderName = typeof sender === "object" ? sender.name : "System";

    if (validRecipientIds.length === 0 || !senderId) {
      console.warn("Notification skipped: No valid recipient IDs found.");
      return;
    }

    // Prepare the single notification object (matching your notificationSchema)
    const notificationItem = {
      senderId,
      senderName,
      title,
      message,
      type,
      metadata,
      isRead: false,
      createdAt: new Date(),
    };

    const io = getIO(); //Get the socket instance

    // Update DB: Find user docs and PUSH the notification into the array
    // Use Promise.all with findOneAndUpdate to ensure userId is set on creation
    await Promise.all(
      validRecipientIds.map(async (userId) => {
        await UserNotification.findOneAndUpdate(
          { userId: userId }, // Look for this specific user
          {
            $push: {
              notifications: {
                $each: [notificationItem],
                $position: 0,
              },
            },
            // IMPORTANT: If the document is created (upsert), set the userId
            $setOnInsert: { userId: userId },
          },
          { upsert: true, new: true },
        );

        // Check Socket Status
        const userRoom = `user:${userId}`;
        const activeConnections = io.sockets.adapter.rooms.get(userRoom);
        const isOnline = activeConnections && activeConnections.size > 0;

        // Real-time emit
        emitEvent({
          room: `user:${userId}`,
          event: EVENTS.NOTIFICATION.RECEIVED,
          payload: notificationItem,
        });

        /// HYBRID PUSH LOGIC
        const subRecord = await PushSubscription.find({ userId });

        if (subRecord.length > 0) {
          for (const record of subRecord) {
            const isMobile = subRecord.deviceType === "mobile";

            if (isMobile || !isOnline) {
              console.log(
                `[Push] Sending to ${userId} (${isMobile ? "Mobile" : "Desktop Offline"})`,
              );
              await sendPushNotification(record.subscription, {
                title,
                body: message,
                link: metadata?.link || "/",
              });
            } else {
              console.log(
                `Pushed notification to ${validRecipientIds.length} users.`,
              );
            }
          }
        } else {
          console.log(
            `Subscription record is ${subRecord.length} for the user: ${userId}`,
          );
        }
      }),
    );

    return { success: true };
  } catch (error) {
    console.error("Notification Service Error:", error);
  }
};
