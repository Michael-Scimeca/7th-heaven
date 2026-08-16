import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getShowDateTime } from "@/lib/date-utils";
import { VENUE_LINKS } from "@/lib/venue-links";
import { sanityClient, queries, SanityBandMember, SanityTourDate, SanitySiteSettings } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "7th Heaven — Official Band Website",
  description: "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of unforgettable live performances.",
};

// Above-the-fold, needed for initial render
import VideoSection from "@/components/VideoSection";
import Logo from "@/components/Logo";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import HeroUpcomingShows from "@/components/HeroUpcomingShows";
import LiveStatusSign from "@/components/LiveStatusSign";
import { ARTIST_LOGOS, PRESS_LOGOS } from "@/components/LogoTicker";
const LogoTicker = dynamic(() => import("@/components/LogoTicker"));

// Lazy-loaded: canvas/rAF/below-the-fold components
const VinylHeroPlayer = dynamic(() => import("@/components/VinylHeroPlayer"));
const HeroVideoPlayer = dynamic(() => import("@/components/HeroVideoPlayer"));
const HeroAlbumPlayer = dynamic(() => import("@/components/HeroAlbumPlayer"));
const HeroLiveThumbs = dynamic(() => import("@/components/HeroLiveThumbs"));
const TourList = dynamic(() => import("@/components/TourList"));
const TourMap = dynamic(() => import("@/components/TourMap"));
const BehindTheScenes = dynamic(() => import("@/components/BehindTheScenes"));
const ProximityNotify = dynamic(() => import("@/components/ProximityNotify"));
const HomeMerch = dynamic(() => import("@/components/HomeMerch"));
const FeaturedTrack = dynamic(() => import("@/components/FeaturedTrack"));
const AudioPlayerSection = dynamic(() => import("@/components/AudioPlayer"));
const BioParallaxSlider = dynamic(() => import("@/components/BioParallaxSlider"));
const HomeNewsSection = dynamic(() => import("@/components/HomeNewsSection"));
const HomeVideoShowcase = dynamic(() => import("@/components/HomeVideoShowcase"));
const SlideupSection = dynamic(() => import("@/components/SlideupSection"));
import LazySection from "@/components/LazySection";



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

const fetchWithTimeout = <T,>(promise: Promise<T>, fallback: T, timeoutMs = 5000): Promise<T> => {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs))
  ]);
};

const formatShowDate = (isoDate: string) => {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  } catch { return isoDate; }
};

export default async function Home() {
  // Use sanityClient.fetch with 5s timeout — guarantees complete render on Netlify serverless
  const [membersData, showsData, settings] = await Promise.all([
    fetchWithTimeout(sanityClient.fetch<SanityBandMember[]>(queries.allBandMembers, {}, { next: { revalidate: 60, tags: ['sanity:members'] } }), [] as SanityBandMember[]),
    fetchWithTimeout(sanityClient.fetch<SanityTourDate[]>(queries.allTourDates, {}, { next: { revalidate: 60, tags: ['sanity:shows'] } }), [] as SanityTourDate[]),
    fetchWithTimeout(sanityClient.fetch<SanitySiteSettings | null>(queries.siteSettings, {}, { next: { revalidate: 60, tags: ['sanity:settings'] } }), null),
  ]);

  const members = (membersData as SanityBandMember[]).length > 0
    ? (membersData as SanityBandMember[]).map(m => ({
      name: m.name,
      role: m.role,
      color: m.name === "Adam Heisler" ? "#851DEF" : "#3b82f6"
    }))
    : FALLBACK_MEMBERS;


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

  // Guarantee non-empty shows list even if all dates fall in the past
  const finalShowsToRender = upcomingShows.length > 0 ? upcomingShows : combinedShows;

  const stats = settings?.stats?.length ? settings.stats : FALLBACK_STATS;
  const tagline = settings?.tagline || "An experience you just have to see and hear.";
  const subTagline = settings?.subTagline || "40 years of rocking the world.";
  const release = settings?.latestRelease;
  const btsVideos = settings?.btsVideos;

  return (
    <>
      <LiveStatusSign />

      {/* ====== HERO (Full 100vh Viewport Height) ====== */}
      <section
        className="relative w-full h-[100dvh] min-h-screen p-0 m-0 overflow-hidden morph-pick"
        data-pick-label="Play Music"
        id="hero"
        style={{
          marginLeft: "calc(-1 * var(--page-padding-x))",
          marginRight: "calc(-1 * var(--page-padding-x))",
          width: "calc(100% + 2 * var(--page-padding-x))",
        }}
      >
        <h1 className="sr-only">7th Heaven — Official Band Website</h1>
        <div id="hero-card" className="relative w-full h-full min-h-[100dvh] overflow-hidden bg-transparent flex flex-col justify-between p-0 m-0 morph-pick" data-pick-label="Play Music">
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
      <LazySection fallbackHeight="500px">
        <section id="tour" className="bg-transparent py-0">
          <TourList initialShows={finalShowsToRender} />
        </section>
      </LazySection>

      <LazySection fallbackHeight="600px">
        <section id="band" className="relative w-full bg-transparent overflow-x-clip py-0 mt-[80px]">
          <BioParallaxSlider />
        </section>
      </LazySection>

      {/* ====== FEATURED VIDEO SHOWCASE (30-Second Autoplay Previews) ====== */}
      <LazySection fallbackHeight="400px">
        <HomeVideoShowcase />
      </LazySection>

      {/* ====== SLIDEUP STACK SECTION ====== */}
      <LazySection fallbackHeight="400px">
        <SlideupSection />
      </LazySection>

      {/* ====== SHARED THE STAGE WITH / AS SEEN ON (scrolling logo tickers) ====== */}
      <LazySection fallbackHeight="180px">
        <section id="logos" className="relative w-full py-4">
          <LogoTicker items={ARTIST_LOGOS} direction="left" />
          <LogoTicker items={PRESS_LOGOS} direction="right" />
        </section>
      </LazySection>

      {/* ====== PROXIMITY NOTIFY ====== */}
      <LazySection fallbackHeight="150px">
        <ProximityNotify nextShow={upcomingShows.find(s => s.city) || upcomingShows[0]} />
      </LazySection>

      {/* ====== LATEST BAND NEWS ====== */}
      <LazySection fallbackHeight="400px">
        <HomeNewsSection />
      </LazySection>

      {/* ====== MERCH QUICK SHOP (Shopify) ====== */}
      <LazySection fallbackHeight="400px">
        <HomeMerch />
      </LazySection>

      {/* ====== MUSIC / AUDIO PLAYER SECTION (At Very Bottom) ====== */}
      <LazySection fallbackHeight="500px">
        <section id="music" className="relative w-full h-[calc(100dvh-90px)] mt-0 overflow-hidden">
          <AudioPlayerSection />
        </section>
      </LazySection>
    </>
  );
}
