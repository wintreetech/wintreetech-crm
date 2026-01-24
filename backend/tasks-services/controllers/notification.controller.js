import UserNotification from "../models/notification.model.js";

// Fetch notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await UserNotification.findOne({ userId }).lean();

    // Return the notifications array or empty list if doc doesn't exist
    res.json(data ? data.notifications : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as read using the internal notification _id
export const markNotificationAsRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.body;

    await UserNotification.updateOne(
      {
        userId,
        "notifications._id": notificationId,
      },
      { $set: { "notifications.$.isRead": true } },
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
