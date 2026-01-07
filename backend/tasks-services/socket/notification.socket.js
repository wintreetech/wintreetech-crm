import { EVENTS } from "./events.js";

export const registerNotificationSocket = (socket) => {
  // Use the JOIN event to put user in their private room
  socket.on(EVENTS.NOTIFICATION.JOIN, (userId) => {
    if (!userId) return;

    const roomName = `user:${userId}`;

    socket.join(roomName);
    console.log(`[Socket] User ${userId} is now listening for notifications.`);
  });

  // Handle marking as read (Sync across multiple open tabs)
  socket.on(EVENTS.NOTIFICATION.MARK_READ, ({ userId, notificationId }) => {
    socket
      .to(`user:${userId}`)
      .emit(EVENTS.NOTIFICATION.SYNC_READ, { notificationId });
  });
};
