import { checkRateLimit } from "./rate-limit";

/**
 * Sanitize a string to prevent basic XSS when rendering in HTML.
 * Note: Next.js/React usually escapes strings, but this is a secondary layer
 * specifically for when we're manually building HTML (like in emails).
 */
export function sanitize(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates a honeypot field. If the field has a value, it's likely a bot.
 */
export function validateHoneypot(value: string | undefined | null): boolean {
  return !value; // Returns true if field is empty (good), false if filled (bot)
}

/**
 * Unified server-side protection for form submissions.
 * Checks rate limits and honeypots.
 */
export async function protectAction(options: {
  identifier: string;
  honeypotValue?: string | null;
}) {
  // 1. Honeypot check
  if (options.honeypotValue) {
    console.warn(`[security] Honeypot triggered for ${options.identifier}`);
    return { success: false, error: "Spam detected", status: 400 };
  }

  // 2. Rate limit check
  const rate = await checkRateLimit(options.identifier);
  if (!rate.success) {
    console.warn(`[security] Rate limit exceeded for ${options.identifier}`);
    return { success: false, error: "Too many requests. Please try again later.", status: 429 };
  }

  return { success: true };
}
