import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import ShowPageClient from "./ShowPageClient";
import { notFound } from "next/navigation";
import showsSupabaseData from "@/data/shows-supabase.json";
import pastShowsData from "@/data/past-shows.json";
import { getFanPhotos } from "@/lib/fanPhotos";

export const revalidate = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function generateStaticParams() {
  const { data: shows } = await supabase.from("shows").select("id").limit(500);
  return (shows || []).map((show) => ({ id: String(show.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: show } = await supabase
    .from("shows")
    .select("venue_name, city, state, date")
    .eq("id", id)
    .single();
  if (!show) return { title: "Show Details | 7th Heaven Band" };
  const dateStr = new Date(show.date + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );
  const title = `${show.venue_name} Concert — 7th Heaven Live`;
  const description = `Catch 7th Heaven live in concert at ${show.venue_name} in ${show.city}, ${show.state} on ${dateStr}. View show schedule, venue location, and RSVP.`;
  const canonicalUrl = `https://7thheavenband.com/shows/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "7th Heaven",
      type: "website",
      images: [
        {
          url: "https://7thheavenband.com/opengraph-image",
          width: 1200,
          height: 630,
          alt: `7th Heaven at ${show.venue_name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: ["https://7thheavenband.com/opengraph-image"],
    },
  };
}

async function ShowPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch show details (with fallback)
  let show: any = null;
  try {
    const { data } = await supabase
      .from("shows")
      .select("*")
      .eq("id", id)
      .single();
    show = data;
  } catch {}

  if (!show && showsSupabaseData?.length) {
    show = showsSupabaseData.find((s) => s.id === id) || null;
  }

  if (!show) notFound();

  // Fetch attendees
  let attendees: any[] = [];
  try {
    const { data } = await supabase
      .from("show_attendance")
      .select(
        `
        id,
        status,
        anonymous,
        checked_in_at,
        profiles (
          id,
          full_name,
          profile_photo_url,
          tier
        )
      `,
      )
      .eq("show_id", id)
      .order("created_at", { ascending: false });
    if (data) attendees = data;
  } catch {}

  // ── Related Shows (same city or same state) ──
  let relatedShows: any[] = [];
  try {
    if (show.city) {
      const { data: cityShows } = await supabase
        .from("shows")
        .select("id, venue_name, city, state, date, time")
        .neq("id", id)
        .eq("city", show.city)
        .order("date", { ascending: true })
        .limit(4);
      if (cityShows?.length) {
        relatedShows = cityShows;
      }
    }
  } catch {}

  if (relatedShows.length < 4) {
    try {
      const existingIds = new Set([id, ...relatedShows.map((s) => s.id)]);
      const { data: stateShows } = await supabase
        .from("shows")
        .select("id, venue_name, city, state, date, time")
        .neq("id", id)
        .eq("state", show.state || "IL")
        .order("date", { ascending: true })
        .limit(10);

      if (stateShows?.length) {
        for (const s of stateShows) {
          if (!existingIds.has(s.id)) {
            relatedShows.push(s);
            existingIds.add(s.id);
            if (relatedShows.length >= 4) break;
          }
        }
      }
    } catch {}
  }

  // Fallback to local shows data if needed
  if (relatedShows.length < 4 && showsSupabaseData?.length) {
    const existingIds = new Set([id, ...relatedShows.map((s) => s.id)]);
    // First try matching city
    if (show.city) {
      for (const s of showsSupabaseData) {
        if (s.id !== id && !existingIds.has(s.id) && s.city === show.city) {
          relatedShows.push(s);
          existingIds.add(s.id);
          if (relatedShows.length >= 4) break;
        }
      }
    }
    // Then try matching state
    if (relatedShows.length < 4) {
      for (const s of showsSupabaseData) {
        if (
          s.id !== id &&
          !existingIds.has(s.id) &&
          (s.state === show.state || s.state === "IL")
        ) {
          relatedShows.push(s);
          existingIds.add(s.id);
          if (relatedShows.length >= 4) break;
        }
      }
    }
  }

  // ── Venue Photos & Videos (from data/fan-photos.json) ──
  let venueMedia: any[] = [];
  try {
    const allFanPhotos = await getFanPhotos();
    const venueLower = (show.venue_name || "").toLowerCase().trim();
    const cityLower = (show.city || "").toLowerCase().trim();

    venueMedia = allFanPhotos.filter((p) => {
      if (!p.venue) return false;
      const pVenue = p.venue.toLowerCase().trim();
      const pCity = (p.city || "").toLowerCase().trim();
      const matchVenue = pVenue.includes(venueLower) || venueLower.includes(pVenue);
      const matchCity = cityLower && (pCity.includes(cityLower) || cityLower.includes(pCity));
      return p.approved && (matchVenue || (matchCity && p.type === "video"));
    });
  } catch {}

  // ── Past Shows at this Venue (from src/data/past-shows.json) ──
  const pastVenueShows: Array<{ date: string; raw: string; year?: string }> = [];
  try {
    const venueLower = (show.venue_name || "").toLowerCase().trim();
    const years = (pastShowsData as any).years || [];
    for (const yearGroup of years) {
      for (const s of yearGroup.shows || []) {
        if (s.venue && s.venue.toLowerCase().trim() === venueLower) {
          pastVenueShows.push({
            date: s.date || s.raw,
            raw: s.raw,
            year: yearGroup.year,
          });
        }
      }
    }
  } catch {}

  // Default image for the venue
  const defaultImage =
    venueMedia.find((m) => m.type !== "video" && m.src)?.src ||
    "/images/tour/fan-concert-photo.jpg";

  // MusicEvent JSON-LD schema for Google Event rich search results
  const showDateIso = show.date ? `${show.date}T19:00:00-06:00` : new Date().toISOString();
  const musicEventLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: `7th Heaven at ${show.venue_name}`,
    startDate: showDateIso,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: show.venue_name,
      address: {
        "@type": "PostalAddress",
        addressLocality: show.city || "Chicago",
        addressRegion: show.state || "IL",
        addressCountry: "US",
      },
    },
    performer: {
      "@type": "MusicGroup",
      name: "7th Heaven",
      url: "https://7thheavenband.com",
    },
    url: `https://7thheavenband.com/shows/${id}`,
    image: [defaultImage.startsWith("http") ? defaultImage : `https://7thheavenband.com${defaultImage}`],
    description: `7th Heaven live performance at ${show.venue_name} in ${show.city}, ${show.state}.`,
  };

  return (
    <>
      <script
        id={`show-event-jsonld-${id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(musicEventLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <ShowPageClient
        show={show}
        initialAttendees={(attendees || []) as any}
        relatedShows={relatedShows}
        defaultImage={defaultImage}
        venueMedia={venueMedia}
        pastVenueShows={pastVenueShows}
      />
    </>
  );
}

function ShowPageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-pulse text-white/50">Loading show…</div>
    </div>
  );
}

export default function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ShowPageFallback />}>
      <ShowPageContent params={params} />
    </Suspense>
  );
}
