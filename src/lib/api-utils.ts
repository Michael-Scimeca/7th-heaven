/**
 * Shared API utilities — rate limiting, auth guards, input sanitization
 */
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Rate limiters (per-route, keyed by prefix) ──
const limiters = new Map<string, Ratelimit | null>();

function getLimiter(prefix: string, requests: number, window: string): Ratelimit | null {
  if (limiters.has(prefix)) return limiters.get(prefix)!;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(`[rate-limit] Upstash not configured for ${prefix}, skipping.`);
    limiters.set(prefix, null);
    return null;
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"ms" | "s" | "m" | "h" | "d"}`),
    analytics: true,
    prefix,
  });
  limiters.set(prefix, limiter);
  return limiter;
}

/** Get the caller's IP from the request headers */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/** Apply rate limiting. Returns a 429 response if exceeded, null if OK. */
export async function applyRateLimit(
  ip: string,
  prefix: string,
  requests = 5,
  window = "60 s"
): Promise<NextResponse | null> {
  const limiter = getLimiter(prefix, requests, window);
  if (!limiter) return null; // dev fallback

  const result = await limiter.limit(ip);
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }
  return null;
}

/** Validate email format server-side */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 254;
}

/** Strip HTML tags and trim — server-safe sanitizer */
export function sanitizeText(input: unknown, maxLen = 500): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").replace(/[<>&"']/g, "").trim().slice(0, maxLen);
}

/** Check admin secret header for protecting admin-only API routes */
export function requireAdminSecret(req: Request): NextResponse | null {
  const secret = req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_API_SECRET;
  // Skip in dev if no secret is configured
  if (!expected) return null;
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Detect likely bot/spam submissions via timing and honeypot field */
export function isSpam(body: Record<string, unknown>): boolean {
  // Honeypot: bots fill hidden fields, humans don't
  if (body._hp && String(body._hp).length > 0) return true;
  if (body.website && String(body.website).length > 0) return true;
  // Block suspiciously fast submissions (< 2s from page load)
  if (body._t && typeof body._t === "number") {
    const elapsed = Date.now() - body._t;
    if (elapsed < 2000) return true; // too fast — bot
  }
  return false;
}
