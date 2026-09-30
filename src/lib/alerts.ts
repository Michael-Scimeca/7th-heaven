import { createClient } from "@supabase/supabase-js";
import { publishToGroup, NtfyGroup } from "./ntfy";
import { sendWebPushToGroup, PushAudience } from "./push-subscriptions";
import { sendEmail } from "./email";
import { getEmailQuotaStatus, enqueueEmails, logEmailSent } from "./email-quota";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export type AlertAudience = "fans" | "crew" | "band" | "planners" | "all";

export interface AlertChannels {
  push?: boolean; // ntfy
  webPush?: boolean; // Browser Web Push (VAPID)
  email?: boolean; // Resend Email
  sms?: boolean; // Twilio SMS (Paid)
}

export interface SendAlertParams {
  audience: AlertAudience | AlertAudience[];
  recipients?: string[]; // Specific emails or user IDs
  bookingId?: string; // If targeting a specific event planner
  category?: string; // "shows", "livestreams", "music", "merch", "news", "cruise", "emergency", "schedule"
  title: string;
  body: string;
  url?: string;
  image?: string;
  urgent?: boolean;
  channels?: AlertChannels;
  senderId?: string;
  senderEmail?: string;
  distanceMiles?: number;
  showZip?: string;
}

export interface SendAlertResult {
  success: boolean;
  broadcastId?: string;
  results: {
    webPush: { total: number; sent: number; failed: number; removed: number };
    ntfy: { groups: string[]; sent: number; skipped: number; failed: number };
    email: { total: number; sent: number; queued: number; failed: number };
    sms?: { total: number; sent: number; failed: number; skipped?: boolean };
  };
}

/**
 * Unified Alert Dispatcher for Fans, Crew, Band, and Planners.
 * Zero-cost channels (Web Push, ntfy, Email) are favored by default.
 * Twilio SMS is an opt-in paid fallback.
 */
export async function sendAlert(params: SendAlertParams): Promise<SendAlertResult> {
  const sb = getSupabase();
  const rawAudiences = Array.isArray(params.audience) ? params.audience : [params.audience];
  const audiences: AlertAudience[] = rawAudiences.includes("all")
    ? ["fans", "crew", "band", "planners"]
    : rawAudiences;

  const channels: Required<AlertChannels> = {
    push: params.channels?.push ?? true,
    webPush: params.channels?.webPush ?? true,
    email: params.channels?.email ?? true,
    sms: params.channels?.sms ?? false,
  };

  const alertUrl = params.url || "/notifications";
  const isUrgent = !!params.urgent;
  const category = params.category || "general";

  const resultStats: SendAlertResult["results"] = {
    webPush: { total: 0, sent: 0, failed: 0, removed: 0 },
    ntfy: { groups: [], sent: 0, skipped: 0, failed: 0 },
    email: { total: 0, sent: 0, queued: 0, failed: 0 },
  };

  // ── 1. Ntfy Push Notifications (Free & Instant) ────────────────────────────
  if (channels.push) {
    const ntfyGroups: NtfyGroup[] = [];
    if (audiences.includes("fans")) ntfyGroups.push("fans");
    if (audiences.includes("crew")) ntfyGroups.push("crew");
    if (audiences.includes("band")) ntfyGroups.push("band");
    // Planners do NOT get a shared ntfy topic (to maintain client event privacy)

    if (ntfyGroups.length > 0) {
      const ntfyResults = await Promise.all(
        ntfyGroups.map(async (group) => {
          const res = await publishToGroup(group, {
            title: params.title,
            message: params.body,
            priority: isUrgent ? "urgent" : "default",
            click: alertUrl,
            tags: isUrgent ? ["warning", "rotating_light"] : ["guitar", "loudspeaker"],
          });
          return { group, res };
        }),
      );

      for (const item of ntfyResults) {
        resultStats.ntfy.groups.push(item.group);
        if (item.res.ok) resultStats.ntfy.sent++;
        else if (item.res.skipped) resultStats.ntfy.skipped++;
        else resultStats.ntfy.failed++;
      }
    }
  }

  // ── 2. Browser Web Push (VAPID / Lock Screen) ──────────────────────────────
  if (channels.webPush) {
    const pushAudiences: PushAudience[] = [];
    if (audiences.includes("fans")) pushAudiences.push("fan");
    if (audiences.includes("crew")) pushAudiences.push("crew");
    if (audiences.includes("band")) pushAudiences.push("band");
    if (audiences.includes("planners")) pushAudiences.push("planner");

    let targetUserIds: string[] | undefined = undefined;

    // If targeting a specific booking, resolve planner user ID
    if (params.bookingId) {
      const { data: booking } = await sb
        .from("bookings")
        .select("user_id, client_email")
        .eq("id", params.bookingId)
        .single();
      if (booking?.user_id) {
        targetUserIds = [booking.user_id];
      }
    }

    const pushRes = await sendWebPushToGroup(
      pushAudiences,
      {
        title: params.title,
        body: params.body,
        url: alertUrl,
        image: params.image,
      },
      {
        category,
        urgent: isUrgent,
        distanceMiles: params.distanceMiles,
        userIds: targetUserIds,
      },
    );

    resultStats.webPush = pushRes;
  }

  // ── 3. Resend Email with Quota & Queueing ──────────────────────────────────
  if (channels.email) {
    const emailRecipients: Set<string> = new Set();

    // Specific recipients passed in directly
    if (params.recipients && params.recipients.length > 0) {
      params.recipients.forEach((email) => emailRecipients.add(email.trim().toLowerCase()));
    } else if (params.bookingId) {
      // Planner booking-specific target
      const { data: booking } = await sb
        .from("bookings")
        .select("client_email")
        .eq("id", params.bookingId)
        .single();
      if (booking?.client_email) {
        emailRecipients.add(booking.client_email.trim().toLowerCase());
      }
    } else {
      // Query database for target audience profiles
      const roleFilters: string[] = [];
      if (audiences.includes("crew")) roleFilters.push("crew");
      if (audiences.includes("planners")) roleFilters.push("event_planner");

      if (roleFilters.length > 0) {
        const { data: roleUsers } = await sb
          .from("profiles")
          .select("email")
          .in("role", roleFilters);
        roleUsers?.forEach((u) => u.email && emailRecipients.add(u.email.trim().toLowerCase()));
      }

      if (audiences.includes("band")) {
        const { data: bandUsers } = await sb
          .from("profiles")
          .select("email")
          .or("is_band.eq.true,role.eq.admin");
        bandUsers?.forEach((u) => u.email && emailRecipients.add(u.email.trim().toLowerCase()));
      }

      if (audiences.includes("fans")) {
        // Fans + newsletter subscribers
        const [{ data: fanProfiles }, { data: subs }] = await Promise.all([
          sb.from("profiles").select("email").eq("role", "fan"),
          sb.from("newsletter_subscribers").select("email").eq("subscribed", true),
        ]);

        fanProfiles?.forEach((u) => u.email && emailRecipients.add(u.email.trim().toLowerCase()));
        subs?.forEach((u) => u.email && emailRecipients.add(u.email.trim().toLowerCase()));
      }
    }

    const recipientList = Array.from(emailRecipients);
    resultStats.email.total = recipientList.length;

    if (recipientList.length > 0) {
      const isHighPriority = isUrgent || audiences.some((a) => a === "crew" || a === "band" || a === "planners");

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050508; color: #ffffff; padding: 32px; border-radius: 8px;">
          <h2 style="color: #a855f7; margin-bottom: 16px;">${params.title}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">${params.body}</p>
          ${
            params.url
              ? `<div style="margin-top: 24px;"><a href="${params.url}" style="background-color: #a855f7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Update</a></div>`
              : ""
          }
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0 16px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            You received this notification from 7th Heaven.
            <br />
            <a href="https://7thheavenband.com/api/newsletter/unsubscribe?email={{email}}" style="color: #a855f7; text-decoration: underline;">Unsubscribe from email updates</a>
          </p>
        </div>
      `;

      if (isHighPriority) {
        // High priority: send immediately and log quota
        const sendRes = await sendEmail({
          to: recipientList,
          subject: params.title,
          html: htmlContent,
        });
        resultStats.email.sent = sendRes.sentCount;
        resultStats.email.failed = sendRes.failedCount;
        if (sendRes.sentCount > 0) {
          await logEmailSent(sendRes.sentCount, audiences.join(","), category);
        }
      } else {
        // Low priority / bulk fan broadcasts: enforce quota limit
        const quota = await getEmailQuotaStatus();
        const sendImmediateCount = Math.min(recipientList.length, quota.remaining);

        const immediateBatch = recipientList.slice(0, sendImmediateCount);
        const overflowBatch = recipientList.slice(sendImmediateCount);

        if (immediateBatch.length > 0) {
          const sendRes = await sendEmail({
            to: immediateBatch,
            subject: params.title,
            html: htmlContent,
          });
          resultStats.email.sent = sendRes.sentCount;
          resultStats.email.failed = sendRes.failedCount;
          if (sendRes.sentCount > 0) {
            await logEmailSent(sendRes.sentCount, audiences.join(","), category);
          }
        }

        if (overflowBatch.length > 0) {
          await enqueueEmails(
            overflowBatch.map((email) => ({
              recipientEmail: email,
              subject: params.title,
              html: htmlContent,
              category,
              audience: "fan",
            })),
          );
          resultStats.email.queued = overflowBatch.length;
        }
      }
    }
  }

  // ── 4. Twilio SMS (Paid Opt-In Fallback) ────────────────────────────────────
  if (channels.sms) {
    resultStats.sms = { total: 0, sent: 0, failed: 0 };
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(accountSid, authToken);

        // Fetch target phone numbers
        const { data: phoneRows } = await sb
          .from("profiles")
          .select("phone")
          .not("phone", "is", null);

        const phones = phoneRows?.map((r) => r.phone).filter(Boolean) as string[];
        resultStats.sms.total = phones.length;

        const smsResults = await Promise.allSettled(
          phones.map((toPhone) =>
            client.messages.create({
              body: `7th Heaven Alert: ${params.title}\n\n${params.body}${params.url ? `\n\n${params.url}` : ""}`,
              from: twilioPhone,
              to: toPhone,
            }),
          ),
        );

        smsResults.forEach((res) => {
          if (res.status === "fulfilled") resultStats.sms!.sent++;
          else resultStats.sms!.failed++;
        });
      } catch (smsErr) {
        console.error("[alerts] SMS dispatch error:", smsErr);
        resultStats.sms.failed = resultStats.sms.total;
      }
    } else {
      resultStats.sms.skipped = true;
    }
  }

  // ── 5. Audit Logging in Supabase ───────────────────────────────────────────
  let broadcastId: string | undefined;
  try {
    const { data: logRow } = await sb
      .from("notification_broadcast_logs")
      .insert({
        sender_id: params.senderId || null,
        sender_email: params.senderEmail || null,
        audience: audiences.join(","),
        category,
        title: params.title,
        body: params.body,
        url: alertUrl,
        urgent: isUrgent,
        channels,
        counts: {
          web_push: resultStats.webPush.sent,
          ntfy: resultStats.ntfy.sent,
          email: resultStats.email.sent,
          email_queued: resultStats.email.queued,
          sms: resultStats.sms?.sent ?? 0,
        },
      })
      .select("id")
      .single();

    broadcastId = logRow?.id;
  } catch (err) {
    console.warn("[alerts] Failed to write broadcast audit log:", err);
  }

  return {
    success: true,
    broadcastId,
    results: resultStats,
  };
}
