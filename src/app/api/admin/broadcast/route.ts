import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/security";
import { requireAdmin, applyRateLimit, getClientIp } from "@/lib/api-utils";
import { sendAlert, AlertAudience } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Auth first — must be an admin session (Supabase cookie + profiles.role check)
    const authDenied = await requireAdmin(req);
    if (authDenied) return authDenied;

    // Rate limit
    const ip = await getClientIp();
    const rateLimited = await applyRateLimit(ip, "broadcast", 5, "60 m");
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const {
      showName,
      showDate,
      alertType = "announcement",
      messageTitle,
      messageBody,
      channels = { push: true, webPush: true, email: true, sms: false },
      targetAudience = "fans",
      urgent = false,
      url = "/notifications",
      image,
      distanceMiles,
    } = body;

    const cleanTitle = sanitizeInput(messageTitle || "Show Update Alert");
    const cleanBody = sanitizeInput(messageBody || "");
    const cleanShowName = sanitizeInput(showName || "Upcoming Show");

    // Map audience string to AlertAudience
    let mappedAudiences: AlertAudience[];
    if (Array.isArray(targetAudience)) {
      mappedAudiences = targetAudience as AlertAudience[];
    } else if (targetAudience === "all_fans" || targetAudience === "show_fans" || targetAudience === "fans") {
      mappedAudiences = ["fans"];
    } else if (targetAudience === "crew_and_band" || targetAudience === "crew") {
      mappedAudiences = ["crew", "band"];
    } else if (targetAudience === "all") {
      mappedAudiences = ["all"];
    } else {
      mappedAudiences = [targetAudience as AlertAudience];
    }

    const alertResult = await sendAlert({
      audience: mappedAudiences,
      title: cleanTitle,
      body: cleanBody,
      category: alertType,
      url,
      image,
      urgent: urgent || alertType === "cancellation",
      channels: {
        push: channels.push ?? true,
        webPush: channels.webPush ?? true,
        email: channels.email ?? true,
        sms: channels.sms ?? false,
      },
      distanceMiles,
    });

    return NextResponse.json({
      success: true,
      broadcastId: alertResult.broadcastId,
      results: alertResult.results,
      showName: cleanShowName,
      showDate: showDate || new Date().toISOString().split("T")[0],
      alertType,
      message: "Broadcast successfully dispatched!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
