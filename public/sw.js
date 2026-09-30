// 7th Heaven Official Service Worker
const SW_VERSION = "2.1.0";
const OFFLINE_CACHE = `7th-heaven-offline-v${SW_VERSION}`;
const OFFLINE_URL = "/offline";

// ── Lifecycle ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Purge old offline caches
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("7th-heaven-offline-") && key !== OFFLINE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
    ]),
  );
});

// ── Offline Navigation Fallback ──────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse || Response.error();
      }),
    );
  }
});

// ── Push Notification Display ────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "🎸 7th Heaven Alert",
    body: "New tour date, live stream, or exclusive band update!",
    url: "/notifications",
    tag: "7th-heaven-alert",
    icon: "/icon-192.png",
    badge: "/badge.png",
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || "New 7th Heaven notification!",
    icon: data.icon || "/icon-192.png",
    badge: "/badge.png",
    tag: data.tag || "7th-heaven-alert",
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || "/notifications",
      timestamp: Date.now(),
    },
    actions: [
      { action: "view", title: "View Update" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  if (data.image) {
    options.image = data.image;
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "🎸 7th Heaven Alert", options),
  );
});

// ── Notification Click & Navigation ──────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const rawUrl = event.notification.data?.url || "/notifications";
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientHref = new URL(client.url, self.location.origin).href;
        if (clientHref === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});

// ── Push Subscription Change Resync ──────────────────────────────────────────
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true })
      .then((newSub) => {
        return fetch("/api/web-push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSub),
        });
      })
      .catch((err) => {
        console.warn("[SW] Subscription resync failed:", err);
      }),
  );
});
