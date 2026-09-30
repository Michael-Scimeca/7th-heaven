import crypto from "crypto";

const SECRET =
  process.env.CREW_CALENDAR_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "7th-heaven-crew-cal-secret-salt-2026";

/**
 * Generates a signed, deterministic 32+ char token for a given crew member.
 */
export function generateCrewCalendarToken(crewId: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`crew-cal:${(crewId || "").toLowerCase().trim()}`)
    .digest("hex");
}

/**
 * Validates whether the provided token matches the expected signature for the crew member.
 */
export function validateCrewCalendarToken(
  crewId: string,
  token?: string | null,
): boolean {
  if (!crewId || !token) return false;
  const expected = generateCrewCalendarToken(crewId);
  try {
    return (
      token.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}
