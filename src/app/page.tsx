import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getShowDateTime } from "@/lib/date-utils";
import { VENUE_LINKS } from "@/lib/venue-links";
import { sanityClient, queries, SanityBandMember, SanityTourDate, SanitySiteSettings } from "@/lib/sanity";

// Above-the-fold, needed for initial render
import VideoSection from "@/components/VideoSection";
import Logo from "@/components/Logo";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import HeroUpcomingShows from "@/components/HeroUpcomingShows";
import LiveStatusSign from "@/components/LiveStatusSign";

// Lazy-loaded: canvas/rAF components only load when rendered
const VinylHeroPlayer   = dynamic(() => import("@/components/VinylHeroPlayer"));
const HeroVideoPlayer   = dynamic(() => import("@/components/HeroVideoPlayer"));
const HeroAlbumPlayer   = dynamic(() => import("@/components/HeroAlbumPlayer"));
const HeroLiveThumbs    = dynamic(() => import("@/components/HeroLiveThumbs"));
const TourList          = dynamic(() => import("@/components/TourList"));
const TourMap           = dynamic(() => import("@/components/TourMap"));
const BehindTheScenes   = dynamic(() => import("@/components/BehindTheScenes"));
const ProximityNotify   = dynamic(() => import("@/components/ProximityNotify"));
const HomeMerch         = dynamic(() => import("@/components/HomeMerch"));
const FeaturedTrack     = dynamic(() => import("@/components/FeaturedTrack"));



const FALLBACK_STATS = [
 { number: "40+", label: "Years Performing" },
 { number: "#1", label: "Billboard Charts" },
 { number: "200+", label: "Shows per Year" },
 { number: "5,000+", label: "Songs Written" },
];

const FALLBACK_MEMBERS = [
 { name: "Adam Heisler", role: "Lead Vocals • Guitars • Bass", color: "#851DEF" },
 { name: "Richard Hofherr", role: "Guitars • Keys • Vocals", color: "#3b82f6" },
 { name: "Nick Cox", role: "Guitars • Vocals", color: "#06b6d4" },
 { name: "Mark Kennetz", role: "Bass • Vocals", color: "#851DEF" },
 { name: "Frankie Harchut", role: "Drums", color: "#3b82f6" },
];

const FALLBACK_SHOWS = [
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
   allAges: true
 },
];

// ISR: regenerate every 60s — page is pre-rendered & cached
export const revalidate = 60;

export default async function Home() {
  // Use sanityClient.fetch directly — avoids draftMode() call that forces dynamic rendering
  const [membersData, showsData, settings] = await Promise.all([
    sanityClient.fetch<SanityBandMember[]>(queries.allBandMembers, {}, { next: { revalidate: 60, tags: ['sanity:members'] } }).catch(err => { console.error("Error fetching members:", err); return [] as SanityBandMember[]; }),
    sanityClient.fetch<SanityTourDate[]>(queries.allTourDates, {}, { next: { revalidate: 60, tags: ['sanity:shows'] } }).catch(err => { console.error("Error fetching shows:", err); return [] as SanityTourDate[]; }),
    sanityClient.fetch<SanitySiteSettings | null>(queries.siteSettings, {}, { next: { revalidate: 60, tags: ['sanity:settings'] } }).catch(err => { console.error("Error fetching settings:", err); return null; }),
  ]);

  const members = (membersData as SanityBandMember[]).length > 0 
    ? (membersData as SanityBandMember[]).map(m => ({
        name: m.name,
        role: m.role,
        color: m.name === "Adam Heisler" ? "#851DEF" : "#3b82f6"
      }))
    : FALLBACK_MEMBERS;

  const formatShowDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate + 'T12:00:00');
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } catch { return isoDate; }
  };

  const now = new Date();
  const allShows = (showsData as SanityTourDate[]);
  const allMappedShows = allShows.map(s => {
    const fb = VENUE_LINKS[s.venue];
    return {
      day: s.day || "TBD",
      date: formatShowDate(s.date),
      venue: s.venue,
      city: s.city || "",
      state: s.state || "",
      time: s.time || "",
      info: s.notes || "",
      mapUrl: s.directionsLink || fb?.mapUrl || "",
      websiteUrl: s.ticketLink || fb?.websiteUrl || "",
      startDate: s.date,
      allAges: s.allAges,
      isPrivate: s.isPrivate || false,
      lat: s.lat,
      lng: s.lng
    };
  });

  const hardcodedUpcoming = FALLBACK_SHOWS.map(f => ({
    ...f,
    websiteUrl: f.websiteUrl || "",
    mapUrl: f.mapUrl || "",
    startDate: f.startDate || "2026-07-01",
    allAges: f.allAges ?? true,
    isPrivate: false,
    lat: undefined,
    lng: undefined
  }));

  const combinedShows = [...allMappedShows];
  for (const hc of hardcodedUpcoming) {
    const exists = combinedShows.some(s => s.venue.toLowerCase() === hc.venue.toLowerCase() && s.startDate === hc.startDate);
    if (!exists) {
      combinedShows.push(hc);
    }
  }

  combinedShows.sort((a, b) => {
    const timeA = getShowDateTime(a.startDate, a.date, a.time).getTime();
    const timeB = getShowDateTime(b.startDate, b.date, b.time).getTime();
    return timeA - timeB;
  });

  const upcomingShows = combinedShows.filter(s => {
    const showDateTime = getShowDateTime(s.startDate, s.date, s.time);
    const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);
    return showEndTime >= now;
  });

  const stats = settings?.stats?.length ? settings.stats : FALLBACK_STATS;
  const tagline = settings?.tagline || "An experience you just have to see and hear.";
  const subTagline = settings?.subTagline || "40 years of rocking the world.";
  const release = settings?.latestRelease;
  const btsVideos = settings?.btsVideos;

 return (
 <>
  <LiveStatusSign />

  {/* ====== HERO ====== */}
  <section className="relative w-full p-[25px]" id="hero">
    {/* Hero Card — no top padding/rounding so video reaches the very top */}
    <div id="hero-card" className="relative w-full h-[calc(100vh-50px)] rounded-[32px] md:rounded-[40px] overflow-hidden bg-[var(--color-bg-surface)] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col justify-between p-[25px] pt-[104px]">








      {/* ── Hero Video + Vinyl Player (client component, synced) ── */}
      <HeroVideoPlayer>
        <HeroLiveThumbs />
      </HeroVideoPlayer>

    </div>

  </section>

  {/* Global Announcement Banner */}
  {settings?.announcement?.isActive && settings.announcement.text && (!settings.announcement.expiresAt || new Date(settings.announcement.expiresAt) > now) && (
    <AnnouncementBanner 
      text={settings.announcement.text}
      link={settings.announcement.link}
      linkText={settings.announcement.linkText}
      inline={true}
    />
  )}

 {/* ====== TOUR LIST (full — same as /tour page) ====== */}
 <section id="tour">
    <TourList initialShows={upcomingShows} />
  </section>


  {/* ====== PROXIMITY NOTIFY ====== */}
  <ProximityNotify nextShow={upcomingShows.find(s => s.city) || upcomingShows[0]} />

 {/* ====== MERCH QUICK SHOP (Shopify) ====== */}
 <HomeMerch />




 {/* ====== VIDEOS (removed) ====== */}

 {/* ====== BEHIND THE SCENES (removed) ====== */}

 </>
 );
}
