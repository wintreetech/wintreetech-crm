import { addNotification } from "../store/slices/Notification.slice.js";

// Create the audio instance outside the function so it's loaded only once
const notificationSound = new Audio("/notification.wav");

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Function to unlock the audio context
const unlockAudio = () => {
  notificationSound
    .play()
    .then(() => {
      // Success! Now pause it and reset
      notificationSound.pause();
      notificationSound.currentTime = 0;

      // Remove the listener so we don't keep running this on every click
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("mousedown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      // console.log("Audio unlocked and ready.");
    })
    .catch((err) => {
      console.error("Audio unlock failed:", err);
    });
};

// Add the listener to the document
window.addEventListener("click", unlockAudio);
window.addEventListener("mousedown", unlockAudio);
window.addEventListener("touchstart", unlockAudio);

export const initNotificationSocket = (socket, userId, dispatch) => {
  if (!socket || !userId) return;

  socket.off("notification:received");
  socket.emit("join:notifications", userId);

  if (Notification.permission === "default") {
    Notification.requestPermission();
  }

  const handleReceived = async (newNotif) => {
    notificationSound
      .play()
      .catch((err) => console.log("Sound blocked:", err.message));

    // console.log("Real-time notification received:", newNotif);
    // 1. Update the Redux UI (your list and badge)
    dispatch(addNotification(newNotif));

    // NEW CODE (START)
    if (!isMobile() && Notification.permission === "granted") {
      const browserNotif = new Notification(newNotif.title, {
        body: newNotif.message,
        icon: "/WintreeTech_Logo.png",
        tag: newNotif._id || Date.now().toString(),
        renotify: true,
      });

      browserNotif.onclick = (e) => {
        e.preventDefault();
        window.focus();
        if (newNotif.metadata?.link) {
          window.location.href = newNotif.metadata.link;
        }
      };
    }

    // From here the previous code works (START)
    // const browserNotif = new Notification(newNotif.title, {
    //   body: newNotif.message,
    //   // icon: "/logo.png", // Optional: path to your app icon
    //   tag: newNotif._id || Date.now().toString(), // Prevents duplicate popups for the same ID
    //   renotify: true,
    // });

    // // Optional: Focus the window when they click the popup
    // browserNotif.onclick = (e) => {
    //   e.preventDefault();
    //   window.focus();
    //   // Optional: navigate to the specific link if metadata exists
    //   if (newNotif.metadata?.link) {
    //     window.location.href = newNotif.metadata.link;
    //   }
    // };
    // (END)
  };

  socket.on("notification:received", handleReceived);

  return () => {
    socket.off("notification:received", handleReceived);
  };
};
