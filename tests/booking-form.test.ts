import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidPhone,
  formatPhoneDisplay,
  sanitizeName,
  sanitizeNotes,
} from "../src/lib/validation";

describe("Booking Form Validation & Sanitization", () => {
  it("formats US phone numbers into (XXX) XXX-XXXX mask correctly", () => {
    expect(formatPhoneDisplay("123")).toBe("123");
    expect(formatPhoneDisplay("123456")).toBe("(123) 456");
    expect(formatPhoneDisplay("1234567890")).toBe("(123) 456-7890");
    expect(formatPhoneDisplay("123-456-7890123")).toBe("(123) 456-7890");
  });

  it("validates phone strings properly", () => {
    expect(isValidPhone("1234567890")).toBe(true);
    expect(isValidPhone("(555) 019-2834")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
  });

  it("validates email addresses accurately", () => {
    expect(isValidEmail("book@7thheavenband.com")).toBe(true);
    expect(isValidEmail("planner@event-agency.org")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("test@.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  it("sanitizes user names by stripping tags and dangerous characters", () => {
    expect(sanitizeName("  John <script>alert(1)</script> Doe  ")).toBe("John alert(1) Doe");
    expect(sanitizeName("<img src=x onerror=alert(1)>Event Organizer")).toBe("Event Organizer");
    expect(sanitizeName(null)).toBe("");
  });

  it("sanitizes freeform notes without allowing HTML injection", () => {
    expect(sanitizeNotes("<b>Stage notes</b>: curfew at 10pm")).toBe("Stage notes: curfew at 10pm");
    expect(sanitizeNotes("<script>fetch('http://evil.com')</script>")).toBe("fetch('http://evil.com')");
  });
});
