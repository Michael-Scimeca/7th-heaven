import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (server-side only) ──────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
export type PushAudience = "fan" | "crew" | "band" | "planner" | "cruise" | "all";

export interface PushSubscriptionItem {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  email?: string;
  zip?: string;
  radius?: string;
  selectedTypes?: string[];
  audience?: PushAudience;
  userId?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// Row shape from Supabase (snake_case)
interface DbRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  email?: string | null;
  zip?: string | null;
  radius?: string;
  selected_types?: string[];
  audience?: string;
  user_id?: string | null;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  created_at: string;
  updated_at: string;
}

function rowToItem(row: DbRow): PushSubscriptionItem {
  return {
    id: row.id,
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
    email: row.email ?? undefined,
    zip: row.zip ?? undefined,
    radius: row.radius ?? "50",
    selectedTypes: row.selected_types ?? ["all"],
    audience: (row.audience as PushAudience) ?? "fan",
    userId: row.user_id ?? undefined,
    quietHoursStart: row.quiet_hours_start ?? undefined,
    quietHoursEnd: row.quiet_hours_end ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/** Upsert a subscription (keyed on endpoint). Returns the saved item. */
export async function addOrUpdatePushSubscription(
  payload: Partial<PushSubscriptionItem>,
): Promise<PushSubscriptionItem> {
  const sb = getSupabase();

  const row: Record<string, unknown> = {
    endpoint: payload.endpoint!,
    p256dh: payload.keys?.p256dh ?? "",
    auth: payload.keys?.auth ?? "",
    email: payload.email ?? null,
    zip: payload.zip ?? null,
    radius: payload.radius ?? "50",
    selected_types: payload.selectedTypes ?? ["all"],
    audience: payload.audience ?? "fan",
    user_id: payload.userId ?? null,
    quiet_hours_start: payload.quietHoursStart ?? null,
    quiet_hours_end: payload.quietHoursEnd ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("push_subscribers")
    .upsert(row, { onConflict: "endpoint" })
    .select()
    .single();

  if (error)
    throw new Error(`[push-subscriptions] upsert failed: ${error.message}`);
  return rowToItem(data as DbRow);
}

/** Fetch all push subscribers. */
export async function getPushSubscriptions(): Promise<PushSubscriptionItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("push_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[push-subscriptions] fetch failed:", error.message);
    return [];
  }
  return (data as DbRow[]).map(rowToItem);
}

/** Update specific fields on a subscription by id. */
export async function updatePushSubscription(
  id: string,
  updates: Partial<PushSubscriptionItem>,
): Promise<PushSubscriptionItem | null> {
  const sb = getSupabase();
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.zip !== undefined) patch.zip = updates.zip;
  if (updates.radius !== undefined) patch.radius = updates.radius;
  if (updates.selectedTypes !== undefined)
    patch.selected_types = updates.selectedTypes;
  if (updates.email !== undefined) patch.email = updates.email;
  if (updates.audience !== undefined) patch.audience = updates.audience;
  if (updates.userId !== undefined) patch.user_id = updates.userId;
  if (updates.quietHoursStart !== undefined) patch.quiet_hours_start = updates.quietHoursStart;
  if (updates.quietHoursEnd !== undefined) patch.quiet_hours_end = updates.quietHoursEnd;

  const { data, error } = await sb
    .from("push_subscribers")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[push-subscriptions] update failed:", error.message);
    return null;
  }
  return rowToItem(data as DbRow);
}

/** Remove a subscription by id. */
export async function removePushSubscription(id: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb.from("push_subscribers").delete().eq("id", id);
  return !error;
}

/** Remove a subscription by endpoint. */
export async function removePushSubscriptionByEndpoint(endpoint: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb.from("push_subscribers").delete().eq("endpoint", endpoint);
  return !error;
}

// ── Web Push Sender with Parallel Concurrency & 404/410 Pruning ──────────────

export interface PushFilterOptions {
  showType?: string; // e.g. "full", "unplugged", "outdoor", "casino", "tv", "fundraiser", "special"
  showZip?: string; // Zip code of concert location
  distanceMiles?: number; // Calculated distance from subscriber zip to show zip
  category?: string; // e.g. "shows", "livestreams", "music", "merch", "news", "cruise"
  urgent?: boolean;
  userIds?: string[];
}

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  image?: string;
  icon?: string;
}

function setVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@7thheavenband.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  try {
    webPush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  } catch (e) {
    console.warn("[web-push] VAPID details error:", e);
    return false;
  }
}

/**
 * Check if the current time falls inside quiet hours for a subscriber.
 */
function isQuietHoursActive(start?: string, end?: string): boolean {
  if (!start || !end) return false;
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startTotal = startH * 60 + (startM || 0);
    const endTotal = endH * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes < endTotal;
    } else {
      // Wraps around midnight (e.g. 22:00 -> 08:00)
      return currentMinutes >= startTotal || currentMinutes < endTotal;
    }
  } catch {
    return false;
  }
}

/**
 * Targeted Web Push sender with audience grouping, quiet hours, and 404/410 pruning.
 */
export async function sendWebPushToGroup(
  audience: PushAudience | PushAudience[],
  payload: WebPushPayload,
  filterOptions?: PushFilterOptions,
): Promise<{ total: number; sent: number; failed: number; removed: number }> {
  const isConfigured = setVapid();
  if (!isConfigured) {
    console.warn("[web-push] VAPID keys not configured in environment — skipping Web Push send.");
    return { total: 0, sent: 0, failed: 0, removed: 0 };
  }

  let subs = await getPushSubscriptions();
  const audiences = Array.isArray(audience) ? audience : [audience];
  const audienceSet = new Set(audiences);

  // 1. Audience Filter
  if (!audienceSet.has("all")) {
    subs = subs.filter((sub) => audienceSet.has(sub.audience || "fan"));
  }

  // 2. Specific User ID Filter (e.g. targeted planner or crew member)
  if (filterOptions?.userIds && filterOptions.userIds.length > 0) {
    const userIdsSet = new Set(filterOptions.userIds);
    subs = subs.filter((sub) => sub.userId && userIdsSet.has(sub.userId));
  }

  // 3. Category & Distance Filters
  if (filterOptions) {
    subs = subs.filter((sub) => {
      // Quiet hours check (unless urgent flag is set)
      if (!filterOptions.urgent && isQuietHoursActive(sub.quietHoursStart, sub.quietHoursEnd)) {
        return false;
      }

      // Category check (e.g. "shows", "livestreams", "merch", "cruise")
      if (filterOptions.category) {
        const types = sub.selectedTypes || ["all"];
        const typesSet = new Set(types);
        const matchesCategory = typesSet.has("all") || typesSet.has(filterOptions.category);
        if (!matchesCategory) return false;
      }

      // Distance Radius Check
      if (
        filterOptions.distanceMiles !== undefined &&
        sub.radius &&
        sub.radius !== "all"
      ) {
        const maxRadius = parseFloat(sub.radius);
        if (!isNaN(maxRadius) && filterOptions.distanceMiles > maxRadius) {
          return false;
        }
      }

      return true;
    });
  }

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/notifications",
    tag: payload.tag || "7th-heaven-alert",
    icon: payload.icon || "/icon-192.png",
    image: payload.image,
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  // Process sends in batches of 15 for optimal throughput without socket starvation
  const BATCH_SIZE = 15;
  const deadEndpoints: string[] = [];

  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (sub) => {
        if (!sub.endpoint || !sub.endpoint.startsWith("http")) {
          failed++;
          return;
        }

        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            jsonPayload,
          );
          sent++;
        } catch (err: unknown) {
          failed++;
          const statusCode = (err as { statusCode?: number })?.statusCode;
          // 404 (Not Found) or 410 (Gone) indicates unsubscribed or expired endpoint
          if (statusCode === 404 || statusCode === 410) {
            deadEndpoints.push(sub.endpoint);
          }
        }
      }),
    );
  }

  // Prune dead subscriptions
  if (deadEndpoints.length > 0) {
    const sb = getSupabase();
    await sb.from("push_subscribers").delete().in("endpoint", deadEndpoints);
    removed = deadEndpoints.length;
  }

  return { total: subs.length, sent, failed, removed };
}

/** Backwards-compatible single-target or all-subscriber push notification */
export async function sendWebPushNotification(
  title: string,
  message: string,
  url: string = "/notifications",
  targetSubId?: string,
  filterOptions?: PushFilterOptions,
) {
  return sendWebPushToGroup("all", { title, body: message, url }, filterOptions);
}
