/**
 * ntfy.sh push notification helper.
 *
 * Sends free push notifications to phones/desktops via https://ntfy.sh (or a
 * self-hosted ntfy server). Recipients subscribe to a topic in the ntfy app
 * (or at NTFY_SERVER/<topic> in a browser) to receive whatever gets
 * published here — no accounts, tokens, or per-message cost.
 *
 * Each audience has its own topic, configured via env vars so the actual
 * topic names never end up in source control:
 *   NTFY_SERVER       — base server URL (defaults to the free public https://ntfy.sh)
 *   NTFY_TOPIC_FANS
 *   NTFY_TOPIC_CREW
 *   NTFY_TOPIC_ADMINS
 *   NTFY_TOPIC_CRUISE
 *
 * If a group's topic isn't configured, publishing to it is skipped (and
 * logged) instead of throwing — ntfy is always a best-effort extra channel
 * alongside SMS/email, never a hard dependency.
 */

export type NtfyGroup = "fans" | "crew" | "admins" | "cruise";

export type NtfyPriority = "min" | "low" | "default" | "high" | "urgent";

export interface PublishNtfyOptions {
  title?: string;
  message: string;
  priority?: NtfyPriority;
  tags?: string[];
  /** URL to open when the notification is tapped. */
  click?: string;
}

export interface NtfyResult {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
}

const NTFY_SERVER = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/+$/, "");

const GROUP_TOPIC_ENV: Record<NtfyGroup, string | undefined> = {
  fans: process.env.NTFY_TOPIC_FANS,
  crew: process.env.NTFY_TOPIC_CREW,
  admins: process.env.NTFY_TOPIC_ADMINS,
  cruise: process.env.NTFY_TOPIC_CRUISE,
};

/** Returns the configured topic name for a group, or null if it isn't set. */
export function getNtfyTopic(group: NtfyGroup): string | null {
  const topic = GROUP_TOPIC_ENV[group];
  return topic && topic.trim() ? topic.trim() : null;
}

/** True if at least one ntfy group topic is configured. */
export function isNtfyConfigured(): boolean {
  return (Object.keys(GROUP_TOPIC_ENV) as NtfyGroup[]).some((g) => getNtfyTopic(g));
}

/**
 * Publish a raw message directly to a topic name (bypasses the group
 * mapping — mainly useful for one-off/manual sends).
 *
 * Uses ntfy's JSON publish format (POST to the server root with a "topic"
 * field) rather than PUT/POST-to-topic-URL with headers, so titles/messages
 * with emoji or non-ASCII text don't need any special header encoding.
 */
const PRIORITY_TO_NUMBER: Record<NtfyPriority, number> = {
  min: 1,
  low: 2,
  default: 3,
  high: 4,
  urgent: 5,
};

export async function publishNtfy(topic: string, opts: PublishNtfyOptions): Promise<NtfyResult> {
  try {
    const payload: Record<string, unknown> = { topic, message: opts.message };
    if (opts.title) payload.title = opts.title;
    // Send the numeric form (1-5) — it's the form ntfy's own JSON publish
    // examples use, so it's guaranteed to be understood by any version.
    if (opts.priority) payload.priority = PRIORITY_TO_NUMBER[opts.priority];
    if (opts.tags?.length) payload.tags = opts.tags;
    if (opts.click) payload.click = opts.click;

    const res = await fetch(`${NTFY_SERVER}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[ntfy] Publish to "${topic}" failed (${res.status}): ${text}`);
      return { ok: false, status: res.status, error: text || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status };
  } catch (err: any) {
    console.error(`[ntfy] Publish to "${topic}" threw:`, err);
    return { ok: false, error: err?.message || "Unknown ntfy error" };
  }
}

/**
 * Publish to one of the configured audience groups (fans/crew/admins/cruise).
 * Silently skips (returns { skipped: true }) if that group's topic isn't
 * configured in the environment yet.
 */
export async function publishToGroup(
  group: NtfyGroup,
  opts: PublishNtfyOptions
): Promise<NtfyResult & { group: NtfyGroup }> {
  const topic = getNtfyTopic(group);
  if (!topic) {
    console.warn(
      `[ntfy] Skipped "${group}" push — NTFY_TOPIC_${group.toUpperCase()} is not set in the environment.`
    );
    return { ok: false, skipped: true, group };
  }
  const result = await publishNtfy(topic, opts);
  return { ...result, group };
}

/** Publish the same message to several groups at once, in parallel. */
export async function publishToGroups(groups: NtfyGroup[], opts: PublishNtfyOptions) {
  return Promise.all(groups.map((g) => publishToGroup(g, opts)));
}
