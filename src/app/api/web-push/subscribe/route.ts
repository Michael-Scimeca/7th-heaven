import { NextResponse } from "next/server";
import { addPushSubscription, PushSubscriptionItem } from "@/lib/push-subscriptions";

export async function POST(request: Request) {
  try {
    const body: PushSubscriptionItem = await request.json();
    if (!body || !body.endpoint) {
      return NextResponse.json({ ok: false, error: "Invalid subscription payload" }, { status: 400 });
    }

    addPushSubscription(body);
    return NextResponse.json({ ok: true, message: "Subscribed to native Web Push successfully!" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to save subscription" }, { status: 500 });
  }
}
