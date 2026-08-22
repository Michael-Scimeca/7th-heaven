import webPush from "web-push";

export interface PushSubscriptionItem {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const globalStore = globalThis as unknown as {
  __pushSubscriptions?: PushSubscriptionItem[];
};

if (!globalStore.__pushSubscriptions) {
  globalStore.__pushSubscriptions = [];
}

export function addPushSubscription(sub: PushSubscriptionItem) {
  if (!sub || !sub.endpoint) return;
  const exists = globalStore.__pushSubscriptions!.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    globalStore.__pushSubscriptions!.push(sub);
  }
}

export function getPushSubscriptions(): PushSubscriptionItem[] {
  return globalStore.__pushSubscriptions || [];
}

export async function sendWebPushNotification(title: string, message: string, url: string = "/notifications") {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "8q78LSuQ0bHjQSen3PocoQCPdKPB-ALMmJmvu33eGO8";
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@7thheavenband.com";

  webPush.setVapidDetails(subject, publicKey, privateKey);

  const subs = getPushSubscriptions();
  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/favicon.ico",
    url,
  });

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload
      )
    )
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
