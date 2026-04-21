import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { validateSignup } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // ── 1. Rate Limiting ──
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";

    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      );
    }

    // ── 2. Parse request body ──
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // ── 3. Validate & Sanitize with Zod ──
    const validation = validateSignup(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const { name, email, phone, zip, radius } = validation.data;

    // ── 4. Optional: Verify hCaptcha token ──
    const captchaToken = (body as Record<string, unknown>)?.captchaToken;
    if (process.env.HCAPTCHA_SECRET && captchaToken) {
      const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET}`,
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 403 });
      }
    }

    // ── 5. Create account record ──
    const account = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      zip,
      radius,
      notificationsEnabled: true,
      emailConfirmed: false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      active: true,
    };

    // ── 6. Save to data store ──
    const filePath = path.join(process.cwd(), "data", "accounts.json");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let accounts: Record<string, unknown>[] = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      accounts = JSON.parse(raw);
    }

    // Check for duplicate email
    const existing = accounts.find((a) => a.email === email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    accounts.push(account);
    fs.writeFileSync(filePath, JSON.stringify(accounts, null, 2));

    // ── 7. TODO: Send confirmation email ──
    // When ready, integrate with Resend, SendGrid, or Supabase Auth:
    // await sendConfirmationEmail(email, account.id);

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Check your email to confirm.",
        accountId: account.id,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
