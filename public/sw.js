// 7th Heaven Web Push Service Worker
self.addEventListener("push", function (event) {
  let data = { title: "🎸 7th Heaven Alert", body: "New show / update posted!" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || "New 7th Heaven notification!",
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/notifications",
    },
    actions: [
      { action: "open", title: "View Alert" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "🎸 7th Heaven Alert", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
