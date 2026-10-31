import { NextRequest, NextResponse } from "next/server";
import { geocodeZip } from "@/lib/geo";

// GET /api/proximity/geocode?zip=60067 → { lat, lng } for the radius rings
export async function GET(req: NextRequest) {
  const zip = (req.nextUrl.searchParams.get("zip") || "").replace(/\D/g, "").slice(0, 5);
  if (zip.length !== 5) return NextResponse.json({ error: "Enter a 5-digit zip code." }, { status: 400 });
  const coords = await geocodeZip(zip);
  if (!coords) return NextResponse.json({ error: "We couldn't find that zip code." }, { status: 404 });
  return NextResponse.json(coords, { headers: { "Cache-Control": "public, s-maxage=86400" } });
}
