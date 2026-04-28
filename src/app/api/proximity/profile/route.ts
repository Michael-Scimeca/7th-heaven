import { NextRequest, NextResponse } from "next/server";

// POST /api/proximity/profile — update zip, radius, and notification toggle
// Body: { zip, notificationRadius, notificationsEnabled }
export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { zip, notificationRadius, notificationsEnabled } = await req.json();

    // Geocode zip if provided
    let lat: number | null = null;
    let lng: number | null = null;
    if (zip) {
      try {
        const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const place = geoData.places?.[0];
          if (place) {
            lat = parseFloat(place.latitude);
            lng = parseFloat(place.longitude);
          }
        }
      } catch {}
    }

    const updates: Record<string, unknown> = {};
    if (zip !== undefined) updates.zip = zip;
    if (notificationRadius !== undefined) updates.notification_radius = notificationRadius;
    if (notificationsEnabled !== undefined) updates.notifications_enabled = notificationsEnabled;
    if (lat !== null) updates.latitude = lat;
    if (lng !== null) updates.longitude = lng;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, lat, lng });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
