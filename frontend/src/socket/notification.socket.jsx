import { addNotification } from "../store/slices/Notification.slice.js";

export const initNotificationSocket = (socket, userId, dispatch) => {
  if (!socket || !userId) return;

  socket.emit("join:notifications", userId);

  if (Notification.permission === "default") {
    Notification.requestPermission();
  }

  const handleReceived = (newNotif) => {
    // console.log("Real-time notification received:", newNotif);
    // 1. Update the Redux UI (your list and badge)
    dispatch(addNotification(newNotif));

    // 2. Show Browser-Level Notification
    if (Notification.permission === "granted") {
      const browserNotif = new Notification(newNotif.title, {
        body: newNotif.message,
        // icon: "/logo.png", // Optional: path to your app icon
        tag: newNotif._id || Date.now().toString(), // Prevents duplicate popups for the same ID
        renotify: true,
      });

      // Optional: Focus the window when they click the popup
      browserNotif.onclick = (e) => {
        e.preventDefault();
        window.focus();
        // Optional: navigate to the specific link if metadata exists
        if (newNotif.metadata?.link) {
          window.location.href = newNotif.metadata.link;
        }
      };
    }
  };

  socket.on("notification:received", handleReceived);

  return () => {
    socket.off("notification:received", handleReceived);
  };
};
