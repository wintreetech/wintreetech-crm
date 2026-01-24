// public/sw.js
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || "New update received",
    icon: "/WintreeTech_Logo.png",
    badge: "/wintree_favicon.png",
    vibrate: [100, 50, 100],
    data: { url: data.link || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "TaskFlow", options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === targetUrl && "focus" in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
