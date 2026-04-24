import { NextResponse } from "next/server";
import { sanityFetch } from "@/sanity/live";
import { queries, SanitySiteSettings } from "@/lib/sanity";

export async function GET() {
  try {
    const { data } = await sanityFetch({ query: queries.siteSettings });
    const settings = data as SanitySiteSettings | null;
    if (!settings) return NextResponse.json(null);
    return NextResponse.json({
      platformLinks: settings.platformLinks || [],
      endorsements: settings.endorsements || [],
      socialLinks: settings.socialLinks || [],
      bookingPhone: settings.bookingPhone || '',
      bookingEmail: settings.bookingEmail || '',
    });
  } catch {
    return NextResponse.json(null);
  }
}
