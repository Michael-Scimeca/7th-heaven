import { z } from "zod";
import DOMPurify from "dompurify";

// ── Signup validation schema ──
export const signupSchema = z.object({
 name: z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be under 100 characters")
  .transform((val) => val.trim()),
 email: z
  .email("Invalid email address")
  .max(254, "Email too long")
  .transform((val) => val.toLowerCase().trim()),
 phone: z
  .string()
  .max(16, "Phone number too long")
  .optional()
  .transform((val) => val?.trim() || ""),
 zip: z
  .string()
  .regex(/^\d{5}$/, "Zip code must be 5 digits"),
 radius: z
  .enum(["25", "50", "100", "200"] as const, {
   error: "Invalid radius",
  }),
 notifyAreaShows: z.boolean().optional().default(true),
 notifyNextShow: z.boolean().optional().default(true),
 showTypes: z.array(z.string()).optional().default([]),
});

export type SignupInput = z.infer<typeof signupSchema>;

// ── Sanitize user inputs (for server-side use) ──
export function sanitizeInput(input: string): string {
 // Only run DOMPurify in a browser environment
 if (typeof window !== "undefined") {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
 }
 // Server-side: strip HTML tags manually
 return input.replace(/<[^>]*>/g, "").trim();
}

// ── Validate and sanitize signup data ──
export function validateSignup(data: unknown) {
 const result = signupSchema.safeParse(data);
 if (!result.success) {
  return {
   success: false as const,
   errors: result.error.flatten().fieldErrors,
  };
 }

 // Sanitize all string fields
 const sanitized = {
  ...result.data,
  name: sanitizeInput(result.data.name),
  email: result.data.email, // Email already validated by zod
  phone: sanitizeInput(result.data.phone || ""),
 };

 return { success: true as const, data: sanitized };
}

// ═══════════════════════════════════════════════════════════════
//  Shared Validation Helpers — used across all forms & APIs
// ═══════════════════════════════════════════════════════════════

/** Validate email format server-side */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 254;
}

/** Validate US phone number (must have 10+ digits once stripped) */
export function isValidPhone(phone: unknown): phone is string {
  if (typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/** Format a raw phone string into (555) 123-4567 display format */
export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Sanitize a name: strip HTML, trim, enforce max length */
export function sanitizeName(input: unknown, maxLen = 100): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").replace(/[<>&"']/g, "").trim().slice(0, maxLen);
}

/** Sanitize freeform notes: strip HTML, trim, enforce max length */
export function sanitizeNotes(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, maxLen);
}
