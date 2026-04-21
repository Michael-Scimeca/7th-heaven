import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Rate limiter for API routes ──
// Limits each IP to 5 signup attempts per 60-second window
// Falls back to a no-op in development if env vars are missing

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
 const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
 });

 ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute
  analytics: true,
  prefix: "7h:signup",
 });
}

export async function checkRateLimit(identifier: string): Promise<{
 success: boolean;
 limit: number;
 remaining: number;
 reset: number;
}> {
 if (!ratelimit) {
  // Dev fallback — no rate limiting when Upstash isn't configured
  console.warn("[rate-limit] Upstash not configured, skipping rate limit check");
  return { success: true, limit: 5, remaining: 5, reset: 0 };
 }

 const result = await ratelimit.limit(identifier);
 return {
  success: result.success,
  limit: result.limit,
  remaining: result.remaining,
  reset: result.reset,
 };
}
