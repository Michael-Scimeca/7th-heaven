import Image from "next/image";
import Link from "next/link";

import VideoSection from "@/components/VideoSection";
import BehindTheScenes from "@/components/BehindTheScenes";
import ProximityNotify from "@/components/ProximityNotify";
import Logo from "@/components/Logo";
import LiveStatusSign from "@/components/LiveStatusSign";
import TourMap from "@/components/TourMap";
import { getShowDateTime } from "@/lib/date-utils";
import TourList from "@/components/TourList";
import HeroUpcomingShows from "@/components/HeroUpcomingShows";
import HomeMerch from "@/components/HomeMerch";
import FeaturedTrack from "@/components/FeaturedTrack";
import HeroLiveThumbs from "@/components/HeroLiveThumbs";
import HeroAlbumPlayer from "@/components/HeroAlbumPlayer";
import VinylHeroPlayer from "@/components/VinylHeroPlayer";
import HeroVideoPlayer from "@/components/HeroVideoPlayer";
import { VENUE_LINKS } from "@/lib/venue-links";
import { sanityClient, queries, SanityBandMember, SanityTourDate, SanitySiteSettings } from "@/lib/sanity";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import CanvasLightsWrapper from "@/components/CanvasLightsWrapper";

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
  <section className="relative w-full p-[25px] bg-[#0d0914]" id="hero">
    {/* Hero Card — no top padding/rounding so video reaches the very top */}
    <div id="hero-card" className="relative w-full h-[calc(100vh-50px)] rounded-[32px] md:rounded-[40px] overflow-hidden bg-[#0d0914] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col justify-between p-[25px] pt-[104px]">








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
    <TourList initialShows={upcomingShows} hideMap={true} />
  </section>


  {/* ====== PROXIMITY NOTIFY ====== */}
  <ProximityNotify nextShow={upcomingShows.find(s => s.city) || upcomingShows[0]} />

 {/* ====== MERCH QUICK SHOP (Shopify) ====== */}
 <HomeMerch />


  {/* ====== PHOTOS FROM THE LAST SHOW ====== */}
  <section className="py-24 relative overflow-hidden bg-[#050508] border-t border-white/5">
    <div className="site-container relative z-10">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Live & Loud
          </span>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black italic tracking-tighter text-white uppercase leading-none">
            Photos From <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">The Last Show</span>
          </h2>
        </div>
        <Link href="/fan-photo-wall" className="shrink-0 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2">
          View All Galleries →
        </Link>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Large Feature Photo */}
        <div className="lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto bg-[#111116] border border-white/10 relative group overflow-hidden rounded-xl">
           <Image 
             src="/images/band-performance.png" 
             alt="Last Show Performance" 
             fill
             sizes="(max-width: 1024px) 100vw, 50vw"
             className="object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
             <span className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">House of Blues</span>
             <h3 className="text-white text-xl font-bold">Chicago, IL</h3>
           </div>
        </div>

        {/* Supporting Photos */}
        {[
          { src: '/images/hero-banner.png', title: 'Crowd Energy' },
          { src: '/images/video-placeholder.jpg', title: 'Guitar Solo' },
          { src: '/images/band-performance.png', title: 'Encore' },
          { src: '/images/hero-banner.png', title: 'Meet & Greet' }
        ].map((photo, i) => (
          <div key={i} className="aspect-square bg-[#111116] border border-white/10 relative group overflow-hidden rounded-xl">
             <Image 
               src={photo.src} 
               alt={photo.title} 
               fill
               sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
               className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
               <span className="text-xs font-bold text-white uppercase tracking-widest">{photo.title}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  </section>

 {/* ====== CRUISE PROMO ====== */}
 <section className="py-16 bg-[var(--color-bg-primary)] border-b border-white/5">
  <div className="site-container">
   <div className="relative overflow-hidden rounded-2xl border border-[var(--color-accent)]/20 bg-gradient-to-r from-[var(--color-accent)]/10 via-[#0d0d14] to-cyan-500/10">
    <div className="absolute inset-0 bg-[url('/images/cruise-hero.png')] bg-cover bg-center opacity-10" />
    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
     <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
       <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
       <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Now Accepting Interest</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
       7th Heaven <span className="accent-gradient-text">Caribbean Cruise</span>
      </h2>
      <p className="text-white/45 text-sm leading-relaxed max-w-lg mb-2">
       7 nights. 3 islands. 6 live shows. Sign up free to help us negotiate the best group rate — the more fans, the better the deal.
      </p>
      <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.15em] text-white/25">
       <span>🚢 Miami → Caribbean</span>
       <span>🏝️ Cozumel · Grand Cayman · Roatán</span>
       <span>🎸 6 Performances</span>
      </div>
     </div>

    </div>
   </div>
  </div>
 </section>

 {/* ====== VIDEOS (removed) ====== */}

 {/* ====== BEHIND THE SCENES (removed) ====== */}

 </>
 );
}
