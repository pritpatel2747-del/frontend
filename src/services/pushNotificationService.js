/**
 * Push Notification Service
 * Handles service worker registration and push notification subscription
 */

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Initialize push notifications
 * Call this after user logs in
 */
export const initializePushNotifications = async (token) => {
  try {
    console.log("[PUSH] Starting push notification initialization...");

    // Check if browser supports service workers and push notifications
    if (!("serviceWorker" in navigator)) {
      console.warn("[PUSH] Service Workers not supported");
      return false;
    }

    if (!("PushManager" in window)) {
      console.warn("[PUSH] Push Notifications not supported");
      return false;
    }

    // Step 1: Register service worker
    console.log("[PUSH] Registering service worker...");
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });
    console.log("✅ [PUSH] Service Worker registered:", registration);

    // Step 2: Request notification permission
    console.log("[PUSH] Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log(`[PUSH] Notification permission: ${permission}`);

    if (permission !== "granted") {
      console.warn("[PUSH] Notification permission not granted");
      return false;
    }

    // Step 3: Get VAPID public key from server
    console.log("[PUSH] Fetching VAPID public key from server...");
    const vapidResponse = await fetch(`${API_BASE}/vapid-public-key`);
    if (!vapidResponse.ok) {
      throw new Error("Failed to fetch VAPID public key");
    }

    const { publicKey } = await vapidResponse.json();
    console.log("[PUSH] VAPID public key received");

    // Step 4: Subscribe to push notifications
    console.log("[PUSH] Subscribing to push notifications...");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    console.log("✅ [PUSH] Push subscription created:", subscription);

    // Step 5: Send subscription to backend
    console.log("[PUSH] Sending subscription to backend...");
    const subscribeResponse = await fetch(`${API_BASE}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });

    if (!subscribeResponse.ok) {
      throw new Error("Failed to subscribe to push notifications");
    }

    const subscribeData = await subscribeResponse.json();
    console.log("✅ [PUSH] Subscription saved on backend:", subscribeData);

    console.log("✅ [PUSH] Push notifications initialized successfully!");
    return true;
  } catch (error) {
    console.error("[PUSH] Error initializing push notifications:", error);
    return false;
  }
};

/**
 * Convert VAPID public key from base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  try {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  } catch (error) {
    console.error("[PUSH] Error converting VAPID key:", error);
    throw error;
  }
}

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = () => {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
};

/**
 * Get current push notification permission status
 */
export const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
};

/**
 * Get current push subscription status
 */
export const getPushSubscriptionStatus = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      return { isSubscribed: false, subscription: null };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    console.log("[PUSH] Current push subscription:", subscription);
    return {
      isSubscribed: !!subscription,
      subscription: subscription
    };
  } catch (error) {
    console.error("[PUSH] Error getting subscription status:", error);
    return { isSubscribed: false, subscription: null };
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    console.log("[PUSH] Current subscription for unsubscription:", subscription);

    if (subscription) {
      await subscription.unsubscribe();
      console.log("✅ [PUSH] Unsubscribed from push notifications");
      return true;
    }

    return false;
  } catch (error) {
    console.error("[PUSH] Error unsubscribing from push notifications:", error);
    return false;
  }
};

export default {
  initializePushNotifications,
  isPushNotificationSupported,
  getNotificationPermission,
  getPushSubscriptionStatus,
  unsubscribeFromPushNotifications
};
