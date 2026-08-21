/**
 * Security & Input Validation Utilities
 */
import { z } from 'zod';
import { applyRateLimit } from '@/lib/api-utils';

/**
 * Sanitizes user input string against XSS injections using DOMPurify with fallback
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  const cleaned = String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^\s"']*/gi, '');

  let domPurified = cleaned;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMPurify = require('isomorphic-dompurify');
    const purify = DOMPurify?.default || DOMPurify;
    if (purify && typeof purify.sanitize === 'function') {
      domPurified = purify.sanitize(cleaned);
    }
  } catch {
    /* fallback to regex sanitization if jsdom/undici environment fails */
  }

  return domPurified
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const sanitize = sanitizeInput;

/**
 * Common Zod API Validation Schemas (Zod v4 top-level format)
 */
export const BookingRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  venueName: z.string().optional(),
  message: z.string().max(2000, 'Message cannot exceed 2000 characters').optional(),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.email('Invalid email address'),
});

export const FanProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.email('Invalid email address'),
  phone: z.string().optional(),
  favoriteSong: z.string().optional(),
});

interface ProtectActionOptions {
  identifier?: string;
  honeypotValue?: any;
  /** Max requests allowed in the window. Defaults to 5. */
  requests?: number;
  /** Sliding window duration, e.g. '60 m', '1 h'. Defaults to '60 m'. */
  windowDuration?: string;
}

/**
 * Protects server actions and API requests via honeypot detection and
 * sliding-window rate limiting (Upstash). Degrades gracefully to honeypot-only
 * when Upstash is not configured (e.g. local dev without env vars).
 */
export async function protectAction(
  options?: ProtectActionOptions | string,
  _req?: Request
): Promise<{ success: boolean; error?: string; status?: number }> {
  const opts: ProtectActionOptions = typeof options === 'string'
    ? { identifier: options }
    : (options ?? {});

  // Honeypot check — bots fill hidden fields that humans leave empty
  if (opts.honeypotValue) {
    return { success: false, error: 'Spam detected', status: 400 };
  }

  // Real sliding-window rate limit via Upstash (no-op if unconfigured in dev)
  if (opts.identifier) {
    const rateLimited = await applyRateLimit(
      opts.identifier,
      opts.identifier,
      opts.requests ?? 5,
      opts.windowDuration ?? '60 m'
    );
    if (rateLimited) {
      return { success: false, error: 'Too many requests. Please try again later.', status: 429 };
    }
  }

  return { success: true };
}

/**
 * Normalizes phone numbers to standard 10-digit format (E.164 compatible string)
 */
export function normalizePhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return digits ? `+${digits}` : '';
}

/**
 * Validates whether a user role has administrative access permissions
 */
export function hasAdminAccess(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'owner' || normalizedRole.includes('manager');
}

/**
 * Validates Security Headers configuration for web responses
 */
export const RECOMMENDED_SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function validateSecurityHeaders(headers: Record<string, string>): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const header of Object.keys(RECOMMENDED_SECURITY_HEADERS)) {
    if (!headers[header] && !headers[header.toLowerCase()]) {
      missing.push(header);
    }
  }
  return {
    isValid: missing.length === 0,
    missing,
  };
}
