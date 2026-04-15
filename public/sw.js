// Service Worker for handling push notifications

// Listen for push events
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event);

  // Parse notification data
  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: "Notification",
      body: event.data.text(),
      icon: "/logo192.png",
      badge: "/logo192.png"
    };
  }

  const { title, body, icon, badge, tag, data } = notificationData;

  const options = {
    body: body || "You have a new notification",
    icon: icon || "/logo192.png",
    badge: badge || "/logo192.png",
    tag: tag || "default",
    requireInteraction: true,
    data: data || {}
  };

  console.log("[SW] Showing notification with options:", options);

  // Show notification
  event.waitUntil(
    self.registration.showNotification(title || "Notification", options)
  );
});

// Listen for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);

  event.notification.close();
  
  // Get data from notification
  const data = event.notification.data || {};
  const redirect = data.redirect || "/";

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(redirect);
      }
    })
  );
});

// Listen for notification close events
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification);
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
  event.waitUntil(clients.claim());
});

// Handle service worker install
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installed");
  self.skipWaiting();
});
