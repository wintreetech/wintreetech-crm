import { notificationApi } from "../api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const initNotifications = async (userId) => {
  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!isMobile()) {
    await notificationApi.post("/save-subscription", {
      subscription: null,
      userId,
      deviceType: "desktop",
    });
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  if (isMobile() && "serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const { data } = await notificationApi.get("/public-key");
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
    }

    // Save to DB so backend can send Web-Push later
    await notificationApi.post("/save-subscription", {
      subscription,
      userId,
      deviceType: "mobile",
    });
  } else {
    console.log("Desktop detected: Using Socket-only notifications.");
  }
};
