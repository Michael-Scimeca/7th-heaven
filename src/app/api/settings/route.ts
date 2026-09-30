import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";
import { queries, SanitySiteSettings } from "@/lib/sanity";

export async function GET() {
  try {
    let settings: SanitySiteSettings | null = null;
    try {
      const { data } = await sanityFetch({ query: queries.siteSettings });
      settings = data as SanitySiteSettings | null;
    } catch {}

    let announcement = settings?.announcement || null;

    if (!announcement) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
          const supabase = createClient(url, key);
          const { data: row } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "announcement_banner")
            .single();
          if (row?.value) {
            let val = row.value;
            if (typeof val === "string") {
              try {
                val = JSON.parse(val);
              } catch {}
            }
            announcement = val;
          }
        }
      } catch {}
    }

    if (!settings && !announcement) return NextResponse.json(null);

    return NextResponse.json({
      platformLinks: settings?.platformLinks || [],
      endorsements: settings?.endorsements || [],
      socialLinks: settings?.socialLinks || [],
      bookingPhone: settings?.bookingPhone || "",
      bookingEmail: settings?.bookingEmail || "",
      announcement: announcement || null,
    });
  } catch {
    return NextResponse.json(null);
  }
}
