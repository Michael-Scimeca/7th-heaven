import webPush from "web-push";

export interface PushSubscriptionItem {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  zip?: string;
  radius?: string;
  selectedTypes?: string[];
  createdAt: string;
  updatedAt: string;
  deviceType?: string;
  fanName?: string;
}

const globalStore = globalThis as unknown as {
  __pushSubscriptions?: PushSubscriptionItem[];
};

const INITIAL_DEMO_SUBSCRIBERS: PushSubscriptionItem[] = [
  {
    id: "sub_demo_1",
    endpoint: "https://fcm.googleapis.com/fcm/send/demo-token-60056",
    keys: { p256dh: "demo_p256dh_key_1", auth: "demo_auth_key_1" },
    zip: "60056",
    radius: "50",
    selectedTypes: ["all"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    deviceType: "iPhone 15 Pro",
    fanName: "Mike S. (Mt. Prospect, IL)",
  },
  {
    id: "sub_demo_2",
    endpoint: "https://updates.push.apple.com/demo-token-60010",
    keys: { p256dh: "demo_p256dh_key_2", auth: "demo_auth_key_2" },
    zip: "60010",
    radius: "30",
    selectedTypes: ["full", "acoustic"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deviceType: "iPad Air",
    fanName: "Sarah K. (Barrington, IL)",
  },
  {
    id: "sub_demo_3",
    endpoint: "https://fcm.googleapis.com/fcm/send/demo-token-60601",
    keys: { p256dh: "demo_p256dh_key_3", auth: "demo_auth_key_3" },
    zip: "60601",
    radius: "15",
    selectedTypes: ["tickets"],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deviceType: "Pixel 8 Pro",
    fanName: "David L. (Chicago, IL)",
  },
];

if (!globalStore.__pushSubscriptions || globalStore.__pushSubscriptions.length === 0) {
  globalStore.__pushSubscriptions = INITIAL_DEMO_SUBSCRIBERS;
}

export function addOrUpdatePushSubscription(payload: Partial<PushSubscriptionItem>): PushSubscriptionItem {
  const store = globalStore.__pushSubscriptions!;
  const endpoint = payload.endpoint || "";
  const existingIdx = store.findIndex((s) => s.endpoint === endpoint || (payload.id && s.id === payload.id));

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updatedItem: PushSubscriptionItem = {
      ...store[existingIdx],
      ...payload,
      zip: payload.zip ?? store[existingIdx].zip ?? "60056",
      radius: payload.radius ?? store[existingIdx].radius ?? "50",
      selectedTypes: payload.selectedTypes ?? store[existingIdx].selectedTypes ?? ["all"],
      updatedAt: now,
    };
    store[existingIdx] = updatedItem;
    return updatedItem;
  }

  const newItem: PushSubscriptionItem = {
    id: payload.id || `sub_${Math.random().toString(36).substring(2, 9)}`,
    endpoint: payload.endpoint || `https://push.7thheavenband.com/demo/${Math.random().toString(36).substring(2, 7)}`,
    keys: payload.keys || { p256dh: "p256dh_default", auth: "auth_default" },
    zip: payload.zip || "60056",
    radius: payload.radius || "50",
    selectedTypes: payload.selectedTypes || ["all"],
    createdAt: now,
    updatedAt: now,
    deviceType: payload.deviceType || (typeof navigator !== "undefined" && /iPhone|iPad/i.test(navigator.userAgent) ? "iOS Safari" : "Web Browser"),
    fanName: payload.fanName || "Anonymous Fan",
  };

  store.unshift(newItem);
  return newItem;
}

export function getPushSubscriptions(): PushSubscriptionItem[] {
  return globalStore.__pushSubscriptions || [];
}

export function updatePushSubscription(id: string, updates: Partial<PushSubscriptionItem>): PushSubscriptionItem | null {
  const store = globalStore.__pushSubscriptions || [];
  const idx = store.findIndex((s) => s.id === id);
  if (idx < 0) return null;

  store[idx] = {
    ...store[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return store[idx];
}

export function removePushSubscription(id: string): boolean {
  const store = globalStore.__pushSubscriptions || [];
  const idx = store.findIndex((s) => s.id === id);
  if (idx >= 0) {
    store.splice(idx, 1);
    return true;
  }
  return false;
}

export async function sendWebPushNotification(
  title: string,
  message: string,
  url: string = "/notifications",
  targetSubId?: string
) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "8q78LSuQ0bHjQSen3PocoQCPdKPB-ALMmJmvu33eGO8";
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@7thheavenband.com";

  try {
    webPush.setVapidDetails(subject, publicKey, privateKey);
  } catch (e) {
    console.warn("[web-push] VAPID details set warning:", e);
  }

  let subs = getPushSubscriptions();
  if (targetSubId) {
    subs = subs.filter((s) => s.id === targetSubId);
  }

  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/favicon.ico",
    url,
  });

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subs.map((sub) => {
      // Only invoke webPush if it looks like a valid URL endpoint
      if (sub.endpoint.startsWith("http")) {
        return webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
      }
      return Promise.resolve();
    })
  );

  results.forEach((res) => {
    if (res.status === "fulfilled") {
      sent++;
    } else {
      failed++;
    }
  });

  return { total: subs.length, sent, failed };
}
