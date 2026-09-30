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
      bookingId,
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
    } else if (targetAudience === "crew") {
      mappedAudiences = ["crew"];
    } else if (targetAudience === "band") {
      mappedAudiences = ["band"];
    } else if (targetAudience === "crew_and_band") {
      mappedAudiences = ["crew", "band"];
    } else if (targetAudience === "planners" || targetAudience === "planner") {
      mappedAudiences = ["planners"];
    } else if (targetAudience === "all") {
      mappedAudiences = ["all"];
    } else {
      mappedAudiences = [targetAudience as AlertAudience];
    }

    const alertResult = await sendAlert({
      audience: mappedAudiences,
      bookingId: bookingId || undefined,
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

export async function GET(req: Request) {
  try {
    const authDenied = await requireAdmin(req);
    if (authDenied) return authDenied;

    const { getEmailQuotaStatus } = await import("@/lib/email-quota");
    const { createClient } = await import("@supabase/supabase-js");

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // 1. Quota status
    const quota = await getEmailQuotaStatus();

    // 2. Broadcast history logs (last 20)
    let logs: any[] = [];
    try {
      const { data } = await sb
        .from("notification_broadcast_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) logs = data;
    } catch {
      // Table may not exist or empty
    }

    // 3. Audience counts
    let fansPushCount = 0;
    let crewPushCount = 0;
    let bandPushCount = 0;
    let fanEmailsCount = 0;
    let crewCount = 0;
    let bandCount = 0;

    try {
      const { count: fanPush } = await sb
        .from("push_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("audience", "fan");
      fansPushCount = fanPush || 0;

      const { count: crewPush } = await sb
        .from("push_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("audience", "crew");
      crewPushCount = crewPush || 0;

      const { count: bandPush } = await sb
        .from("push_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("audience", "band");
      bandPushCount = bandPush || 0;

      const { count: crewTotal } = await sb
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "crew");
      crewCount = crewTotal || 0;

      const { count: bandTotal } = await sb
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .or("role.eq.band,is_band.eq.true");
      bandCount = bandTotal || 0;

      const { count: newsEmails } = await sb
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true });
      fanEmailsCount = newsEmails || 0;
    } catch {
      // Best-effort audience count
    }

    return NextResponse.json({
      success: true,
      quota,
      logs,
      audienceCounts: {
        fansPush: fansPushCount,
        crewPush: crewPushCount,
        bandPush: bandPushCount,
        fanEmails: fanEmailsCount,
        crewTotal: crewCount,
        bandTotal: bandCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
