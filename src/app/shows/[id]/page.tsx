import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import ShowPageClient from "./ShowPageClient";
import { notFound } from "next/navigation";

export const revalidate = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function generateStaticParams() {
  const { data: shows } = await supabase.from("shows").select("id").limit(100);
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
          url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
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
      images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
    },
  };
}

async function ShowPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch show details
  const { data: show } = await supabase
    .from("shows")
    .select("*")
    .eq("id", id)
    .single();

  if (!show) notFound();

  // Fetch attendees
  const { data: attendees } = await supabase
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
      <ShowPageClient show={show} initialAttendees={(attendees || []) as any} />
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
