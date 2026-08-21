"use client";

import { useEffect, useState } from "react";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import dynamic from "next/dynamic";
import LazySection from "@/components/LazySection";

const TourList = dynamic(() => import("@/components/TourList"));
const BioParallaxSlider = dynamic(() => import("@/components/BioParallaxSlider"));
const ProximityNotify = dynamic(() => import("@/components/ProximityNotify"));

interface Show {
  day: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  time: string;
  info?: string;
  mapUrl?: string;
  websiteUrl?: string;
  startDate: string;
  allAges?: boolean;
  isPrivate?: boolean;
  lat?: number;
  lng?: number;
  _id?: string;
  [key: string]: unknown;
}

interface Announcement {
  isActive: boolean;
  text: string;
  link?: string;
  linkText?: string;
  expiresAt?: string;
}

const FALLBACK_SHOWS: Show[] = [
  {
    day: "Wed",
    date: "July 1",
    venue: "Arlington Hts Frontier Days",
    city: "Arlington Hts",
    state: "IL",
    time: "8:00pm",
    info: "Outdoor All-Age Festival",
    mapUrl: "https://maps.apple.com/?address=Arlington+Heights,+IL",
    websiteUrl: "",
    startDate: "2026-07-01",
    allAges: true,
    isPrivate: false,
  },
];

export default function HomeDataLoader() {
  const [shows, setShows] = useState<Show[]>(FALLBACK_SHOWS);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-doctor/no-fetch-in-effect
  // Intentional: page is fully static, this effect hydrates data client-side after first paint
    fetch("/api/tour")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        // /api/tour returns a plain array
        const raw: Record<string, unknown>[] = Array.isArray(data) ? data : [];
        if (raw.length > 0) {
          const now = new Date();
          const mapped: Show[] = raw.map(s => ({
            day: (s.day as string) || "TBD",
            date: s.date as string,
            venue: s.venue as string,
            city: (s.city as string) || "",
            state: (s.state as string) || "",
            time: (s.time as string) || "",
            info: (s.notes as string) || "",
            mapUrl: (s.directionsLink as string) || "",
            websiteUrl: (s.ticketLink as string) || "",
            startDate: s.date as string,
            allAges: s.allAges as boolean | undefined,
            isPrivate: (s.isPrivate as boolean) || false,
            lat: s.lat as number | undefined,
            lng: s.lng as number | undefined,
          }));
          // Filter to upcoming shows
          const upcoming = mapped.filter(s => {
            try {
              const d = new Date((s.startDate || s.date) + "T23:59:59");
              return d >= now;
            } catch { return true; }
          });
          setShows(upcoming.length > 0 ? upcoming : mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));

    // Fetch announcement from settings API
    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.announcement?.isActive && data.announcement.text) {
          const exp = data.announcement.expiresAt;
          if (!exp || new Date(exp) > new Date()) {
            setAnnouncement(data.announcement);
          }
        }
      })
      .catch(() => {});
  }, []);

  const nextShow = shows.find(s => s.city) || shows[0];

  return (
    <>
      {announcement && (
        <AnnouncementBanner
          text={announcement.text}
          link={announcement.link}
          linkText={announcement.linkText}
          inline={true}
        />
      )}

      {/* ====== TOUR LIST ====== */}
      <LazySection fallbackHeight="400px">
        <section id="tour" className="bg-transparent py-0 pb-12 relative z-10">
          <TourList initialShows={shows} />
        </section>
      </LazySection>

      {/* ====== BAND BIO PARALLAX SLIDER (UNDER TOUR DATES, ABOVE NOTIFICATIONS) ====== */}
      <LazySection fallbackHeight="600px">
        <section id="band" className="relative w-full bg-transparent overflow-x-clip pt-12 sm:pt-20 pb-8 mt-12 sm:mt-20 mb-16 sm:mb-24">
          <BioParallaxSlider />
        </section>
      </LazySection>

      {/* ====== PROXIMITY NOTIFY ====== */}
      <div className="mt-8">
        <ProximityNotify nextShow={nextShow} />
      </div>
    </>
  );
}
