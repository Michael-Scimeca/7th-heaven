import { NextResponse } from "next/server";
import { addOrUpdatePushSubscription } from "@/lib/push-subscriptions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Expect: { subscription: PushSubscription JSON, zip?, radius?, selectedTypes?, email? }
    const { subscription, zip, radius, selectedTypes, email } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { ok: false, error: "Invalid push subscription object" },
        { status: 400 }
      );
    }

    const item = await addOrUpdatePushSubscription({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      email: email || undefined,
      zip: zip || undefined,
      radius: radius || "50",
      selectedTypes: selectedTypes || ["all"],
    });

    return NextResponse.json({
      ok: true,
      message: "Push subscription saved successfully!",
      id: item.id,
    });
  } catch (err: any) {
    console.error("[web-push/subscribe] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to save subscription" },
      { status: 500 }
    );
  }
}
