/**
 * role-config.ts
 *
 * Single source of truth for email → role bootstrapping.
 * Used only during NEW account creation (signup / first OAuth callback)
 * to assign an initial role when no profile row exists yet.
 *
 * After the first login, the Supabase `profiles.role` column is the
 * authority — these lists are never consulted again for existing users.
 *
 * Configure via .env.local:
 *   ADMIN_EMAILS=alice@example.com,bob@example.com
 *   CREW_EMAILS=charlie@example.com
 *   MERCH_EMAILS=merch@example.com
 *   PLANNER_EMAILS=planner@example.com
 *   CRUISE_EMAILS=cruise@example.com
 *   ADMIN_ALERT_EMAIL=admin@example.com
 */

function parseEmailList(envVar: string | undefined): string[] {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const ADMIN_EMAILS   = parseEmailList(process.env.ADMIN_EMAILS);
export const CREW_EMAILS    = parseEmailList(process.env.CREW_EMAILS);
export const MERCH_EMAILS   = parseEmailList(process.env.MERCH_EMAILS);
export const PLANNER_EMAILS = parseEmailList(process.env.PLANNER_EMAILS);
export const CRUISE_EMAILS  = parseEmailList(process.env.CRUISE_EMAILS);

/** Notification / alert recipient for admin emails (booking alerts, new accounts, etc.) */
export const ADMIN_ALERT_EMAIL =
  process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL || "";

/**
 * Resolve the initial role for a brand-new account based on email.
 * Falls back to "fan" for any email not in a configured list.
 * This is only called at account creation time — after that, profiles.role is authoritative.
 */
export function resolveInitialRole(email: string): string {
  const e = email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(e))   return "admin";
  if (CREW_EMAILS.includes(e))    return "crew";
  if (MERCH_EMAILS.includes(e))   return "merch";
  if (PLANNER_EMAILS.includes(e)) return "event_planner";
  if (CRUISE_EMAILS.includes(e))  return "cruise";
  return "fan";
}
