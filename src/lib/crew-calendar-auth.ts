import crypto from "crypto";

/**
 * Resolve the HMAC secret lazily. There is intentionally NO hardcoded fallback:
 * a guessable default would let anyone forge crew calendar tokens.
 * In practice SUPABASE_SERVICE_ROLE_KEY is used when CREW_CALENDAR_SECRET is unset,
 * so existing calendar links keep working.
 */
function getSecret(): string {
  const secret =
    process.env.CREW_CALENDAR_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "Missing CREW_CALENDAR_SECRET (or SUPABASE_SERVICE_ROLE_KEY) for crew calendar tokens.",
    );
  }
  return secret;
}

/**
 * Generates a signed, deterministic 32+ char token for a given crew member.
 */
export function generateCrewCalendarToken(crewId: string): string {
  return crypto
    .createHmac("sha256", getSecret())
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
  try {
    const expected = generateCrewCalendarToken(crewId);
    return (
      token.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}
