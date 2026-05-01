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
  .string()
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
