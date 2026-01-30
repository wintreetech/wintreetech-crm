import { notificationApi } from "../api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const initNotifications = async (userId) => {
  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Check if the browser even supports Service Workers/Push
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging is not supported in this browser.");
    return;
  }

  try {
    // Request permission (Works on both Desktop and Mobile)
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // Get Service Worker Registration
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // Create subscription if it doesn't exist
    if (!subscription) {
      const { data } = await notificationApi.get("/public-key");
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
    }
    // Save to DB so backend can send Web-Push later
    await notificationApi.post("/save-subscription", {
      subscription: subscription.toJSON(),
      userId,
      deviceType: isMobile() ? "mobile" : "desktop",
    });
  } catch (error) {
    console.error("Error initializing notifications:", error);
  }
};

export const unsubscribeNotifications = async () => {
  try {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // We tell the backend to delete ONLY this specific browser endpoint
      await notificationApi.post("/unsubscribe", {
        endpoint: subscription.endpoint,
      });

      // Physically unsubscribe the browser
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.error("Error unsubscribing device:", error);
  }
};
