import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

export const dynamic = "force-dynamic";

/**
 * Dev-only: send a real Web Push to ONE subscription (the caller's own browser).
 * Never touches the subscriber list, so no fans are notified.
 * POST { subscription, title?, body?, url? }
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ ok: false, error: "VAPID keys missing" }, { status: 500 });
  }
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@7thheavenband.com",
    publicKey,
    privateKey,
  );

  const { subscription, title, body, url } = await req.json();
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ ok: false, error: "Invalid subscription" }, { status: 400 });
  }

  try {
    const res = await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: title || "🎸 7th Heaven Test Alert",
        body: body || "This came from the 7th Heaven server through the free push network.",
        url: url || "/notifications",
        tag: "dev-push-test",
      }),
    );
    return NextResponse.json({ ok: true, pushServiceStatus: res.statusCode });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; body?: string; message?: string };
    return NextResponse.json(
      { ok: false, statusCode: e.statusCode, error: e.body || e.message },
      { status: 500 },
    );
  }
}
