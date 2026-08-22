import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (server-side only) ──────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface PushSubscriptionItem {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  email?: string;
  zip?: string;
  radius?: string;
  selectedTypes?: string[];
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/** Upsert a subscription (keyed on endpoint). Returns the saved item. */
export async function addOrUpdatePushSubscription(
  payload: Partial<PushSubscriptionItem>
): Promise<PushSubscriptionItem> {
  const sb = getSupabase();

  const row = {
    endpoint: payload.endpoint!,
    p256dh: payload.keys?.p256dh ?? "",
    auth: payload.keys?.auth ?? "",
    email: payload.email ?? null,
    zip: payload.zip ?? null,
    radius: payload.radius ?? "50",
    selected_types: payload.selectedTypes ?? ["all"],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("push_subscribers")
    .upsert(row, { onConflict: "endpoint" })
    .select()
    .single();

  if (error) throw new Error(`[push-subscriptions] upsert failed: ${error.message}`);
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
  updates: Partial<PushSubscriptionItem>
): Promise<PushSubscriptionItem | null> {
  const sb = getSupabase();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.zip !== undefined) patch.zip = updates.zip;
  if (updates.radius !== undefined) patch.radius = updates.radius;
  if (updates.selectedTypes !== undefined) patch.selected_types = updates.selectedTypes;
  if (updates.email !== undefined) patch.email = updates.email;

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

// ── Web Push Sender with Preference Filtering ─────────────────────────────

export interface PushFilterOptions {
  showType?: string;        // e.g. "full", "unplugged", "outdoor", "casino", "tv", "fundraiser", "special"
  showZip?: string;         // Zip code of concert location
  distanceMiles?: number;   // Calculated distance from subscriber zip to show zip
}

function setVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const privateKey = process.env.VAPID_PRIVATE_KEY!;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@7thheavenband.com";
  try {
    webPush.setVapidDetails(subject, publicKey, privateKey);
  } catch (e) {
    console.warn("[web-push] VAPID details warning:", e);
  }
}

export async function sendWebPushNotification(
  title: string,
  message: string,
  url: string = "/notifications",
  targetSubId?: string,
  filterOptions?: PushFilterOptions
) {
  setVapid();

  let subs = await getPushSubscriptions();
  if (targetSubId) {
    subs = subs.filter((s) => s.id === targetSubId);
  }

  // Filter subscribers based on their proximity and show type preferences
  if (filterOptions) {
    subs = subs.filter((sub) => {
      // 1. Show Type Filter Check
      if (filterOptions.showType) {
        const subTypes = sub.selectedTypes || ["all"];
        const matchesType = subTypes.includes("all") || subTypes.includes(filterOptions.showType);
        if (!matchesType) return false;
      }

      // 2. Distance Radius Check
      if (filterOptions.distanceMiles !== undefined && sub.radius && sub.radius !== "all") {
        const maxRadius = parseFloat(sub.radius);
        if (!isNaN(maxRadius) && filterOptions.distanceMiles > maxRadius) {
          return false;
        }
      }

      return true;
    });
  }

  const payload = JSON.stringify({ title, body: message, icon: "/favicon.ico", url });

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subs.map((sub) => {
      if (!sub.endpoint.startsWith("http")) return Promise.resolve();
      return webPush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
    })
  );

  results.forEach((res) => {
    if (res.status === "fulfilled") sent++;
    else failed++;
  });

  return { total: subs.length, sent, failed };
}
