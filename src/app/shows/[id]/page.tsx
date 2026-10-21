import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import ShowPageClient from "./ShowPageClient";
import { notFound } from "next/navigation";
import showsSupabaseData from "@/data/shows-supabase.json";
import pastShowsData from "@/data/past-shows.json";
import { getFanPhotos } from "@/lib/fanPhotos";
import { sanityClient, queries, SanityTourDate } from "@/lib/sanity";

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
  let show: any = null;
  try {
    const { data } = await supabase
      .from("shows")
      .select("venue_name, city, state, date")
      .eq("id", id)
      .single();
    show = data;
  } catch {}

  if (!show && showsSupabaseData?.length) {
    show = showsSupabaseData.find((s) => s.id === id) || null;
  }

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

  // Enrich show with Sanity CMS tour date metadata (parking, notes, doorsTime, tickets, etc.)
  try {
    const sanityShows = await sanityClient.fetch<SanityTourDate[]>(
      queries.allTourDates,
      {},
      { next: { revalidate: 60, tags: ["sanity", "tour"] } },
    );
    if (sanityShows && sanityShows.length > 0) {
      const vNorm = (show.venue_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedSanity = sanityShows.find((s) => {
        const sNorm = (s.venue || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const sameDate = s.date === show.date;
        const venueMatch = (vNorm && sNorm && (vNorm.includes(sNorm) || sNorm.includes(vNorm))) || false;
        return sameDate || (venueMatch && Math.abs(new Date(s.date).getTime() - new Date(show.date).getTime()) <= 35 * 86400000);
      });
      if (matchedSanity) {
        show = {
          ...show,
          doors_time: show.doors_time || matchedSanity.doorsTime || null,
          all_ages: show.all_ages ?? matchedSanity.allAges ?? null,
          cover: show.cover || matchedSanity.cover || null,
          parkingType: matchedSanity.parkingType || show.parkingType || null,
          parkingAddress: matchedSanity.parkingAddress || show.parking_address || show.parkingAddress || null,
          parkingInfo: matchedSanity.parkingInfo || show.parking_info || show.parkingInfo || null,
          parkingNotes: matchedSanity.parkingNotes || show.parking_notes || show.parkingNotes || null,
          parkingUrl: matchedSanity.parkingUrl || show.parking_url || show.parkingUrl || null,
          ticketLink: matchedSanity.ticketLink || show.ticket_url || null,
          directionsLink: matchedSanity.directionsLink || matchedSanity.mapUrl || show.map_url || null,
        };
      }
    }
  } catch {}

  // Fallback venue & parking metadata for known venues if not set via Sanity
  if (!show.address) {
    if (show.venue_name === "Station 34") {
      show.address = "34 S Main St, Mount Prospect, IL 60056";
    }
  }
  if (!show.parkingAddress && !show.parking_address) {
    if (show.venue_name === "Station 34") {
      show.parkingAddress = "Maple St Parking Deck, 110 S Maple St, Mt Prospect, IL 60056";
      show.parkingType = "garage";
      show.parkingNotes = "Free public parking garage located directly behind Station 34 on Maple St.";
    }
  }

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

  // ── Upcoming Shows at this Venue vs Nearby Area Shows ──
  let upcomingVenueShows: any[] = [];
  let relatedShows: any[] = [];

  const venueNameTrim = (show.venue_name || "").toLowerCase().trim();

  // 1. Fetch upcoming shows at THIS venue (different date / id)
  try {
    if (show.venue_name) {
      const { data: vShows } = await supabase
        .from("shows")
        .select("id, venue_name, city, state, date, time")
        .neq("id", id)
        .ilike("venue_name", show.venue_name)
        .order("date", { ascending: true })
        .limit(8);
      if (vShows?.length) {
        upcomingVenueShows = vShows;
      }
    }
  } catch {}

  // Fallback to local shows data for upcoming venue shows
  if (showsSupabaseData?.length) {
    const venueShowIds = new Set([id, ...upcomingVenueShows.map((s) => s.id)]);
    for (const s of showsSupabaseData) {
      if (
        s.id !== id &&
        !venueShowIds.has(s.id) &&
        (s.venue_name || "").toLowerCase().trim() === venueNameTrim
      ) {
        upcomingVenueShows.push(s);
        venueShowIds.add(s.id);
      }
    }
  }

  // Sort upcoming venue shows by date
  upcomingVenueShows.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // 2. Fetch shows near this area (same city or neighboring cities in same state, excluding venue shows)
  const excludeIds = new Set([id, ...upcomingVenueShows.map((s) => s.id)]);

  try {
    if (show.city) {
      const { data: cityShows } = await supabase
        .from("shows")
        .select("id, venue_name, city, state, date, time")
        .neq("id", id)
        .eq("city", show.city)
        .order("date", { ascending: true })
        .limit(8);
      if (cityShows?.length) {
        for (const s of cityShows) {
          if (!excludeIds.has(s.id)) {
            relatedShows.push(s);
            excludeIds.add(s.id);
            if (relatedShows.length >= 4) break;
          }
        }
      }
    }
  } catch {}

  if (relatedShows.length < 4) {
    try {
      const { data: stateShows } = await supabase
        .from("shows")
        .select("id, venue_name, city, state, date, time")
        .neq("id", id)
        .eq("state", show.state || "IL")
        .order("date", { ascending: true })
        .limit(16);

      if (stateShows?.length) {
        for (const s of stateShows) {
          if (!excludeIds.has(s.id)) {
            relatedShows.push(s);
            excludeIds.add(s.id);
            if (relatedShows.length >= 4) break;
          }
        }
      }
    } catch {}
  }

  // Fallback to local shows data for nearby shows
  if (relatedShows.length < 4 && showsSupabaseData?.length) {
    // First try matching city
    if (show.city) {
      for (const s of showsSupabaseData) {
        if (!excludeIds.has(s.id) && s.city === show.city) {
          relatedShows.push(s);
          excludeIds.add(s.id);
          if (relatedShows.length >= 4) break;
        }
      }
    }
    // Then try matching state
    if (relatedShows.length < 4) {
      for (const s of showsSupabaseData) {
        if (
          !excludeIds.has(s.id) &&
          (s.state === show.state || s.state === "IL")
        ) {
          relatedShows.push(s);
          excludeIds.add(s.id);
          if (relatedShows.length >= 4) break;
        }
      }
    }
  }

  // ── Venue Photos & Videos (from data/fan-photos.json + Sanity band videos) ──
  let venueMedia: any[] = [];
  try {
    const allFanPhotos = await getFanPhotos();
    const venueLower = (show.venue_name || "").toLowerCase().trim();
    const cityLower = (show.city || "").toLowerCase().trim();

    // 1. Fan media matching venue specifically
    const matchedFanMedia = allFanPhotos.filter((p) => {
      if (!p.venue) return false;
      const pVenue = p.venue.toLowerCase().trim();
      const matchVenue = pVenue.includes(venueLower) || venueLower.includes(pVenue);
      return p.approved && matchVenue;
    });

    // 2. Sanity official band videos matching venue specifically
    let sanityVideos: any[] = [];
    try {
      const allSanityVideos = await sanityClient.fetch<any[]>(
        queries.allVideos,
        {},
        { next: { revalidate: 60, tags: ["sanity", "videos"] } },
      );
      if (allSanityVideos?.length) {
        sanityVideos = allSanityVideos
          .filter((v) => {
            const vVenue = (v.venue || "").toLowerCase().trim();
            return vVenue && (vVenue.includes(venueLower) || venueLower.includes(vVenue));
          })
          .map((v) => ({
            id: `sanity_video_${v._id}`,
            filename: `${v.youtubeId}.mp4`,
            src: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
            type: "video",
            youtubeId: v.youtubeId,
            name: "7th Heaven Official",
            venue: v.venue || show.venue_name,
            city: v.city || show.city,
            date: v.year ? String(v.year) : undefined,
            caption: v.title || v.description || "Official 7th Heaven concert performance",
            approved: true,
            isBandMedia: true,
          }));
      }
    } catch {}

    venueMedia = [...sanityVideos, ...matchedFanMedia];
  } catch {}

  // ── Past Shows at this Venue (from src/data/past-shows.json) ──
  const pastVenueShows: Array<{ id: string; date: string; raw: string; year?: string }> = [];
  try {
    const venueLower = (show.venue_name || "").toLowerCase().trim();
    const years = (pastShowsData as any).years || [];
    let pastCounter = 0;
    for (const yearGroup of years) {
      for (const s of yearGroup.shows || []) {
        if (s.venue && s.venue.toLowerCase().trim() === venueLower) {
          pastCounter++;
          pastVenueShows.push({
            id: `past-${yearGroup.year || "tour"}-${s.date || s.raw}-${pastCounter}`,
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
    <ShowPageClient
      show={show}
      initialAttendees={(attendees || []) as any}
      upcomingVenueShows={upcomingVenueShows}
      relatedShows={relatedShows}
      defaultImage={defaultImage}
      venueMedia={venueMedia}
      pastVenueShows={pastVenueShows}
      jsonLd={musicEventLd}
    />
  );
}

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ShowPageContent params={params} />;
}
