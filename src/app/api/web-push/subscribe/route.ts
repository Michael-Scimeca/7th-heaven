import { NextResponse } from "next/server";
import { addOrUpdatePushSubscription } from "@/lib/push-subscriptions";
import { sendEmail } from "@/lib/email";
import { pushWelcomeEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Expect: { subscription: PushSubscription JSON, zip?, radius?, selectedTypes?, email?, name? }
    const { subscription, zip, radius, selectedTypes, email, name } = body;

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

    // Send Push Notification Welcome & Management Email if email was provided
    if (email) {
      try {
        const html = pushWelcomeEmail({
          name: name || undefined,
          email,
          zip: zip || undefined,
          radius: radius || "50",
          selectedTypes: selectedTypes || ["all"],
        });

        await sendEmail({
          to: email,
          subject: "Welcome to 7th Heaven Show Alerts! 🎸 How Your Notifications Work",
          html,
        });
      } catch (emailErr) {
        console.warn("[web-push/subscribe] Failed to send welcome email:", emailErr);
      }
    }

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
