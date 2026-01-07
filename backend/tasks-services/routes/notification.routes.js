import { Router } from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/:userId", getMyNotifications);
router.patch("/read", markNotificationAsRead);

router.patch("/read-all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await UserNotification.updateOne(
      { userId },
      { $set: { "notifications.$[].isRead": true } }
    );
    res.json({ success: true, message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
