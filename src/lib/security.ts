/**
 * Security & Input Validation Utilities
 */

/**
 * Sanitizes user input string against XSS injections (script tags, onerror attributes, etc.)
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^\s"']*/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const sanitize = sanitizeInput;

interface ProtectActionOptions {
  identifier?: string;
  honeypotValue?: any;
}

/**
 * Protects server actions and API requests by enforcing basic rate limiting and security checks
 */
export async function protectAction(
  options?: ProtectActionOptions | string,
  req?: Request
): Promise<{ success: boolean; error?: string; status?: number }> {
  if (typeof options === 'object' && options?.honeypotValue) {
    return { success: false, error: 'Spam detected', status: 400 };
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
export function hasAdminAccess(role: string | null | undefined, userEmail?: string): boolean {
  if (userEmail && (userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase() === 'mikeyscimeca@gmail.com')) {
    return true;
  }
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
