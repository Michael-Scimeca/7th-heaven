import { NextResponse } from "next/server";
import {
  getPushSubscriptions,
  updatePushSubscription,
  removePushSubscription,
  sendWebPushNotification,
} from "@/lib/push-subscriptions";

export async function GET() {
  try {
    const subscribers = getPushSubscriptions();
    return NextResponse.json({ ok: true, count: subscribers.length, subscribers });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, zip, radius, selectedTypes, fanName, title, message } = body;

    if (action === "update" && id) {
      const updated = updatePushSubscription(id, { zip, radius, selectedTypes, fanName });
      if (!updated) {
        return NextResponse.json({ ok: false, error: "Subscriber not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, message: "Subscriber updated successfully", subscriber: updated });
    }

    if (action === "delete" && id) {
      const removed = removePushSubscription(id);
      return NextResponse.json({ ok: true, removed });
    }

    if (action === "test_push" && id) {
      const pushRes = await sendWebPushNotification(
        title || "🚨 7th Heaven Admin Test Push",
        message || "Your notification preferences are active!",
        "/notifications",
        id
      );
      return NextResponse.json({ ok: true, pushRes });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
