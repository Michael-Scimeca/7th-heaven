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
import { VENUE_LINKS } from "@/lib/venue-links";
import { sanityClient, queries, SanityBandMember, SanityTourDate, SanitySiteSettings } from "@/lib/sanity";

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

  {/* Global Announcement Banner */}
  {settings?.announcement?.isActive && settings.announcement.text && (!settings.announcement.expiresAt || new Date(settings.announcement.expiresAt) > now) && (
   <div className="fixed top-[72px] left-0 w-screen z-[49] bg-gradient-to-r from-[var(--color-accent)] to-[#6b1dcf] animate-[fade-in-down_0.5s_var(--ease-out-expo)_0.2s_both] shadow-[0_4px_25px_rgba(133,29,239,0.4)] border-b border-white/20">
    <div className="site-container py-3 flex flex-col sm:flex-row items-center justify-center gap-4">
     <div className="flex items-center gap-3">
      <span className="text-lg animate-pulse shrink-0">⚠️</span>
      <div className="text-xs sm:text-sm font-black italic text-white uppercase tracking-widest leading-snug [&_p]:m-0 [&_p]:inline" dangerouslySetInnerHTML={{ __html: settings.announcement.text }} />
     </div>
     {settings.announcement.link && (
      <Link href={settings.announcement.link} className="shrink-0 px-5 py-2 bg-black/30 hover:bg-black/50 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-white/20">
       {settings.announcement.linkText || "Read More"}
      </Link>
     )}
    </div>
   </div>
  )}

 {/* ====== HERO ====== */}
 <section className="relative min-h-screen flex flex-col justify-end overflow-hidden" id="hero">
   {/* BG - Band Photo */}
   <div className="absolute inset-0 z-0">
     <Image
       src="/images/hero-band-bg.png"
       alt="7th Heaven performing live"
       fill
       priority
       sizes="100vw"
       className="object-cover object-top"
     />
     {/* Gradient overlays for readability */}
     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
     <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
     {/* Subtle accent tint */}
     <div className="absolute inset-0 bg-[var(--color-accent)]/[0.08] mix-blend-overlay" />
   </div>

   {/* Hero Content — Band Name + Tagline */}
   <div className="relative z-[3] site-container pt-[calc(72px+6rem)] pb-8 flex flex-col justify-end min-h-[60vh]">
     <div className="max-w-2xl animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.5s_both]">
       <Logo className="w-48 sm:w-64 lg:w-80 mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]" />
       <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white/80 leading-snug tracking-tight max-w-md">
         {tagline}
       </p>
       <p className="text-sm text-white/40 mt-2 uppercase tracking-[0.15em] font-bold">
         {subTagline}
       </p>
       <div className="flex flex-wrap gap-3 mt-6">
         <Link href="/tour" className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_4px_20px_rgba(133,29,239,0.4)] flex items-center gap-2">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
           See Us Live
         </Link>
         <Link href="/music" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="15.5" r="2.5" /><path d="M8 17V5l12-2v12" /></svg>
           Listen Now
         </Link>
       </div>

        {/* Live Feed Thumbnails */}
        <div className="mt-6">
          <HeroLiveThumbs />
        </div>
     </div>
   </div>

   {/* ── Compact Info Cards — Tour Dates + Latest Release ── */}
   <div className="relative z-[4] site-container pb-6">
     <div className="flex flex-col sm:flex-row gap-3 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.9s_both] max-w-4xl">

       {/* Tour Dates Card */}
        <div className="flex-[1.5] min-w-0">
          <HeroUpcomingShows upcomingShows={upcomingShows} />
        </div>

       {/* Latest Release Card */}
       {release && (
       <div className="flex-1 min-w-0">
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">Latest Release</span>
          </div>

          {/* Album row */}
          <div className="flex gap-3 items-center">
            {/* Album art */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded overflow-hidden border border-white/10 shrink-0 relative group">
              <Image
                src={release.youtubeId ? `https://img.youtube.com/vi/${release.youtubeId}/hqdefault.jpg` : '/images/hero-banner.png'}
                alt={release.title || 'Latest Release'}
                fill
                sizes="72px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {release.youtubeId && (
                <Link href={`/video`} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </Link>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xs leading-tight truncate">{release.title || 'New Release'}</h3>
              <p className="text-[8px] text-white/25 mt-0.5 uppercase tracking-wider">{release.type || 'Single'} · {release.year || '2025'}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {release.spotifyLink && (
                  <a href={release.spotifyLink} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/25 text-[#1DB954] text-[8px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-0.5">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Spotify
                  </a>
                )}
                {release.appleMusicLink && (
                  <a href={release.appleMusicLink} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-[#FC3C44]/15 hover:bg-[#FC3C44]/25 border border-[#FC3C44]/25 text-[#FC3C44] text-[8px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-0.5">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.263C18.96.11 18.21.06 17.46.04a69.69 69.69 0 00-1.4-.03L6.06.01c-.5 0-1 .01-1.5.04C3.82.07 3.08.12 2.35.27a5.1 5.1 0 00-1.89.63A4.89 4.89 0 00.28 2.26a5.1 5.1 0 00-.23.55A9.13 9.13 0 000 5.87v12.26c.05.86.16 1.69.44 2.49.41 1.17 1.18 2.05 2.27 2.63.62.33 1.29.5 1.99.58.79.09 1.58.11 2.38.11h10.2c.67 0 1.34-.02 2-.07a7.54 7.54 0 001.64-.29 4.84 4.84 0 002.53-1.84 4.98 4.98 0 00.75-1.79c.22-.77.3-1.55.33-2.35.04-.68.04-1.36.04-2.04V8.16c0-.69-.01-1.37-.04-2.04zM16.87 17c0 .18-.03.36-.09.53a1.08 1.08 0 01-.83.7c-.32.06-.64.1-.96.14a2.72 2.72 0 01-.67-.01c-.57-.08-1.01-.44-1.13-1-.07-.3-.05-.6.03-.89.15-.54.56-.87 1.08-.99.26-.06.53-.1.79-.16.22-.05.34-.17.37-.4V10.6a.54.54 0 00-.02-.15.27.27 0 00-.22-.2c-.07-.02-.14-.02-.22-.01l-4.6.93c-.09.02-.18.04-.26.08-.12.06-.18.16-.19.29-.01.07-.01.14-.01.22v7.48c0 .26-.04.51-.13.75-.14.4-.43.66-.82.79-.29.1-.59.15-.89.18-.35.03-.69.03-1.03-.04-.59-.12-1-.51-1.12-1.1-.08-.37-.05-.74.08-1.09.18-.48.56-.78 1.04-.91.26-.07.52-.11.78-.17.2-.04.33-.16.36-.36.01-.07.01-.14.01-.21V8.6c0-.22.02-.43.07-.65a1.1 1.1 0 01.78-.83c.18-.06.37-.1.56-.13l5.33-1.08c.26-.05.52-.1.79-.12.36-.03.59.16.65.52.01.1.02.2.02.3V17z"/></svg>
                    Apple
                  </a>
                )}
                {release.buyLink && (
                  <a href={release.buyLink} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-[8px] font-bold uppercase tracking-wider rounded transition-all">
                    Buy
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
       </div>
       )}

       {/* Now Playing — Mini Track Player */}
       <div className="flex-1 min-w-0">
         <FeaturedTrack mini />
       </div>

     </div>
   </div>

 </section>

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
