import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET: Read a setting by key
 * POST: Upsert a setting key/value pair
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    const { data } = await supabaseAdmin.from("site_settings").select("value").eq("key", key).single();
    return NextResponse.json({ key, value: data?.value || null });
  }

  const { data } = await supabaseAdmin.from("site_settings").select("*");
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, key, value });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
