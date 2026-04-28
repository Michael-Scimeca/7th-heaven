import { NextRequest, NextResponse } from "next/server";

// Haversine distance in miles
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Convert zip code to lat/lng via free zippopotam.us API
async function zipToLatLng(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}

// GET /api/proximity/shows?userId=xxx
// Returns shows within the user's notification radius
export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Fetch user profile
    const { data: profile, error: profError } = await supabase
      .from("profiles")
      .select("zip, notification_radius, latitude, longitude, notifications_enabled")
      .eq("id", userId)
      .single();

    if (profError || !profile) {
      return NextResponse.json({ shows: [], message: "Profile not found" });
    }

    if (!profile.notifications_enabled) {
      return NextResponse.json({ shows: [], message: "Notifications disabled" });
    }

    // Get/geocode user location
    let userLat = profile.latitude;
    let userLng = profile.longitude;

    if ((!userLat || !userLng) && profile.zip) {
      const coords = await zipToLatLng(profile.zip);
      if (coords) {
        userLat = coords.lat;
        userLng = coords.lng;
        // Cache it back on the profile
        await supabase.from("profiles").update({ latitude: userLat, longitude: userLng }).eq("id", userId);
      }
    }

    if (!userLat || !userLng) {
      return NextResponse.json({ shows: [], message: "Location not resolved" });
    }

    const radius = profile.notification_radius || 50;

    // Fetch upcoming shows with lat/lng from Supabase
    const { data: shows } = await supabase
      .from("shows")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .eq("status", "upcoming")
      .not("latitude", "is", null);

    const nearbyShows = (shows || []).filter((show) => {
      if (!show.latitude || !show.longitude) return false;
      const dist = haversine(userLat!, userLng!, show.latitude, show.longitude);
      return dist <= radius;
    }).map((show) => ({
      ...show,
      distanceMiles: Math.round(haversine(userLat!, userLng!, show.latitude, show.longitude)),
    }));

    return NextResponse.json({ shows: nearbyShows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
