import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { sanityWriteClient, queries, fetchSanity } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isActive = body.isActive !== undefined ? body.isActive : body.active;
    const text = body.text || "";
    const link = body.link !== undefined ? body.link : (body.linkUrl || "");
    const linkText = body.linkText || "Read More";
    const expiresAt = body.expiresAt || null;

    // 1. Patch the announcement field in Sanity
    try {
      const settings = await fetchSanity<any>(queries.siteSettings);
      if (settings?._id) {
        await sanityWriteClient
          .patch(settings._id)
          .set({
            announcement: {
              isActive: !!isActive,
              text,
              link,
              linkText,
              expiresAt,
            },
          })
          .commit();
      }
    } catch (sanityErr) {
      console.warn("Failed to patch announcement in Sanity:", sanityErr);
    }

    // 2. Also keep Supabase site_settings synchronized
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("site_settings").upsert(
          {
            key: "announcement_banner",
            value: JSON.stringify({
              isActive: !!isActive,
              text,
              link,
              linkText,
              expiresAt,
            }),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" },
        );
      }
    } catch (supabaseErr) {
      console.warn("Failed to sync announcement to Supabase:", supabaseErr);
    }

    // Force Next.js to drop its cache for the homepage immediately
    revalidatePath("/", "page");
    revalidatePath("/admin/[username]", "page");
    revalidatePath("/crew", "page");
    revalidateTag("sanity:settings", {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update announcement:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Try Sanity first
    const settings = await fetchSanity<any>(queries.siteSettings);
    let ann = settings?.announcement;

    // Fall back to Supabase site_settings if Sanity announcement is null
    if (!ann) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "announcement_banner")
            .single();
          if (data?.value) {
            let val = data.value;
            if (typeof val === "string") {
              try {
                val = JSON.parse(val);
              } catch {}
            }
            ann = val;
          }
        }
      } catch {}
    }

    const isExpired = ann?.expiresAt && new Date(ann.expiresAt) < new Date();
    return NextResponse.json({
      isActive: isExpired ? false : ann?.isActive || false,
      text: ann?.text || "",
      link: ann?.link || "",
      linkText: ann?.linkText || "Read More",
      expiresAt: ann?.expiresAt || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      isActive: false,
      text: "",
      link: "",
      linkText: "Read More",
      expiresAt: null,
    });
  }
}
