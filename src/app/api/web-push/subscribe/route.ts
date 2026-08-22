import { NextResponse } from "next/server";
import { addOrUpdatePushSubscription, PushSubscriptionItem } from "@/lib/push-subscriptions";

export async function POST(request: Request) {
  try {
    const body: Partial<PushSubscriptionItem> = await request.json();
    
    // Save or update subscription with zip/radius preferences
    const item = addOrUpdatePushSubscription(body);

    return NextResponse.json({
      ok: true,
      message: "Subscribed and saved push notification preferences successfully!",
      subscription: item,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to save subscription" },
      { status: 500 }
    );
  }
}
