import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payment-test/north/result
 * This is North's REDIRECT_URL — after the customer's browser submits the
 * payment form straight to EPX, EPX processes the charge and redirects the
 * SAME browser here with the result as a POST body (not a server-to-server
 * webhook). We persist the raw result to Supabase (keyed by a UUID) rather
 * than an in-memory variable — serverless functions don't reliably share
 * memory between invocations — then send the browser on to the results page.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const raw: Record<string, string> = {};
    formData.forEach((value, key) => {
      raw[key] = String(value);
    });

    const { data, error } = await supabaseAdmin
      .from("north_payment_results")
      .insert({
        order_number: raw.TRAN_NBR || null,
        auth_resp: raw.AUTH_RESP || null,
        auth_resp_text: raw.AUTH_RESP_TEXT || null,
        amount: raw.AUTH_AMOUNT_REQUESTED || null,
        masked_account_nbr: raw.AUTH_MASKED_ACCOUNT_NBR || null,
        raw,
      })
      .select("id")
      .single();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (error || !data) {
      console.error("[payment-test/north/result] insert error:", error);
      // Still send the shopper somewhere sensible even if persistence failed.
      return NextResponse.redirect(`${siteUrl}/payment-test/result?error=1`, 303);
    }

    // 303 converts EPX's POST into a GET on the results page for this browser.
    return NextResponse.redirect(`${siteUrl}/payment-test/result?id=${data.id}`, 303);
  } catch (err) {
    console.error("[payment-test/north/result] error:", err);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/payment-test/result?error=1`, 303);
  }
}

/**
 * GET /api/payment-test/north/result?id=...
 * Used by the /payment-test/result page to look up a persisted result.
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("north_payment_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({
      authResp: data.auth_resp,
      authRespText: data.auth_resp_text,
      amount: data.amount,
      maskedAccountNbr: data.masked_account_nbr,
      raw: data.raw,
    });
  } catch (err: any) {
    console.error("[payment-test/north/result] GET error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
