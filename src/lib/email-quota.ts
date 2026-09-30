import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./email";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export interface EmailQuotaStatus {
  dailyLimit: number;
  monthlyLimit: number;
  dailySent: number;
  monthlySent: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  remaining: number; // minimum of daily and monthly remaining
  pendingInQueue: number;
}

export interface QueueEmailItem {
  recipientEmail: string;
  subject: string;
  html: string;
  replyTo?: string;
  category?: string;
  audience?: string;
  scheduledFor?: string;
}

/**
 * Get the current email quota usage for today and this month.
 */
export async function getEmailQuotaStatus(): Promise<EmailQuotaStatus> {
  const dailyLimit = parseInt(process.env.EMAIL_DAILY_LIMIT || "100", 10);
  const monthlyLimit = parseInt(process.env.EMAIL_MONTHLY_LIMIT || "3000", 10);

  const sb = getSupabase();
  const now = new Date();

  // Start of today (UTC)
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

  // Start of month (UTC)
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  let dailySent = 0;
  let monthlySent = 0;
  let pendingInQueue = 0;

  try {
    const { data: monthData } = await sb
      .from("email_quota_logs")
      .select("recipient_count, sent_at")
      .gte("sent_at", startOfMonth);

    if (monthData) {
      for (const log of monthData) {
        const count = log.recipient_count || 1;
        monthlySent += count;
        if (new Date(log.sent_at) >= new Date(startOfDay)) {
          dailySent += count;
        }
      }
    }

    const { count: queueCount } = await sb
      .from("email_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    pendingInQueue = queueCount || 0;
  } catch (err) {
    console.warn("[email-quota] Error fetching quota usage:", err);
  }

  const dailyRemaining = Math.max(0, dailyLimit - dailySent);
  const monthlyRemaining = Math.max(0, monthlyLimit - monthlySent);
  const remaining = Math.min(dailyRemaining, monthlyRemaining);

  return {
    dailyLimit,
    monthlyLimit,
    dailySent,
    monthlySent,
    dailyRemaining,
    monthlyRemaining,
    remaining,
    pendingInQueue,
  };
}

/**
 * Log sent emails to email_quota_logs
 */
export async function logEmailSent(
  recipientCount: number,
  audience: string = "fan",
  category: string = "newsletter",
) {
  if (recipientCount <= 0) return;
  const sb = getSupabase();
  try {
    await sb.from("email_quota_logs").insert({
      recipient_count: recipientCount,
      audience,
      category,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[email-quota] Failed to log email usage:", err);
  }
}

/**
 * Queue emails that cannot be sent immediately within quota
 */
export async function enqueueEmails(items: QueueEmailItem[]): Promise<{ queued: number; error?: string }> {
  if (!items.length) return { queued: 0 };
  const sb = getSupabase();

  const rows = items.map((item) => ({
    recipient_email: item.recipientEmail.trim().toLowerCase(),
    subject: item.subject,
    html: item.html,
    reply_to: item.replyTo || null,
    category: item.category || "newsletter",
    audience: item.audience || "fan",
    status: "pending",
    scheduled_for: item.scheduledFor || new Date().toISOString(),
  }));

  const { error } = await sb.from("email_queue").insert(rows);
  if (error) {
    console.error("[email-quota] Failed to enqueue emails:", error.message);
    return { queued: 0, error: error.message };
  }
  return { queued: items.length };
}

/**
 * Drain pending emails from the queue up to remaining daily quota
 */
export async function drainEmailQueue(batchLimit?: number): Promise<{
  processed: number;
  sent: number;
  failed: number;
  remainingQuota: number;
}> {
  const quota = await getEmailQuotaStatus();
  if (quota.remaining <= 0) {
    return { processed: 0, sent: 0, failed: 0, remainingQuota: 0 };
  }

  const limit = Math.min(quota.remaining, batchLimit ?? quota.remaining);
  const sb = getSupabase();

  const { data: queueItems, error } = await sb
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error || !queueItems || queueItems.length === 0) {
    return { processed: 0, sent: 0, failed: 0, remainingQuota: quota.remaining };
  }

  let sent = 0;
  let failed = 0;

  const results = await Promise.all(
    queueItems.map(async (item) => {
      const result = await sendEmail({
        to: item.recipient_email,
        subject: item.subject,
        html: item.html,
        replyTo: item.reply_to || undefined,
      });

      if (result.success) {
        await sb
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", item.id);
        return { success: true };
      } else {
        const errMsg = typeof result.error === "object" && result.error !== null
          ? JSON.stringify(result.error)
          : String(result.error || "Unknown error");
        await sb
          .from("email_queue")
          .update({
            status: (item.retry_count || 0) >= 3 ? "failed" : "pending",
            retry_count: (item.retry_count || 0) + 1,
            last_error: errMsg,
          })
          .eq("id", item.id);
        return { success: false };
      }
    }),
  );

  for (const res of results) {
    if (res.success) sent++;
    else failed++;
  }

  if (sent > 0) {
    await logEmailSent(sent, "queue_drain", "scheduled_batch");
  }

  return {
    processed: queueItems.length,
    sent,
    failed,
    remainingQuota: quota.remaining - sent,
  };
}
