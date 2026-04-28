import Image from "next/image";
import Link from "next/link";
import AudioPlayerSection from "@/components/AudioPlayer";
import VideoSection from "@/components/VideoSection";
import BehindTheScenes from "@/components/BehindTheScenes";
import HeroLiveHub from "@/components/HeroLiveHub";
import ProximityNotify from "@/components/ProximityNotify";
import Logo from "@/components/Logo";
import LiveStatusSign from "@/components/LiveStatusSign";
import TourMap from "@/components/TourMap";
import TourList from "@/components/TourList";
import { VENUE_LINKS } from "@/lib/venue-links";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityBandMember, SanityTourDate, SanitySiteSettings } from "@/lib/sanity";

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

const FALLBACK_SHOWS: { day: string; date: string; venue: string; city: string; time: string; info: string }[] = [];

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [{ data: membersData }, { data: showsData }, { data: settingsData }] = await Promise.all([
    sanityFetch({ query: queries.allBandMembers }),
    sanityFetch({ query: queries.allTourDates }),
    sanityFetch({ query: queries.siteSettings }),
  ]);

  const settings = settingsData as SanitySiteSettings | null;

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
  const upcomingShows = allShows.length > 0
    ? allShows
        .map(s => {
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
          };
        })
    : FALLBACK_SHOWS;

  const stats = settings?.stats?.length ? settings.stats : FALLBACK_STATS;
  const tagline = settings?.tagline || "An experience you just have to see and hear.";
  const subTagline = settings?.subTagline || "40 years of rocking the world.";
  const release = settings?.latestRelease;
  const btsVideos = settings?.btsVideos;

 return (
 <>
  <LiveStatusSign />

 {/* ====== HERO ====== */}
 <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" id="hero">
  {/* BG - Solid Dark */}
  <div className="absolute inset-0 z-0 bg-black" />

  {/* Content */}
  <div className="relative z-[3] site-container pt-[calc(72px+4rem)] text-center">
    
    {/* Global Announcement Banner */}
    {settings?.announcement?.isActive && settings.announcement.text && (!settings.announcement.expiresAt || new Date(settings.announcement.expiresAt) > now) && (
     <div className="fixed top-[72px] left-0 w-screen z-40 bg-gradient-to-r from-[var(--color-accent)] to-[#6b1dcf] animate-[fade-in-down_0.5s_var(--ease-out-expo)_0.2s_both] shadow-[0_4px_25px_rgba(133,29,239,0.4)] border-b border-white/20">
      <div className="site-container py-3 flex flex-col sm:flex-row items-center justify-center gap-4">
       <div className="flex items-center gap-3">
        <span className="text-lg animate-pulse shrink-0">⚠️</span>
        <p className="text-xs sm:text-sm font-black italic text-white uppercase tracking-widest leading-snug">{settings.announcement.text}</p>
       </div>
       {settings.announcement.link && (
        <Link href={settings.announcement.link} className="shrink-0 px-5 py-2 bg-black/30 hover:bg-black/50 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-lg transition-colors border border-white/20">
         {settings.announcement.linkText || "Read More"}
        </Link>
       )}
      </div>
     </div>
    )}




    {/* Live Hub — Feed + Next Show + Notifications */}
    <div className="mt-12 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.7s_both]">
     <HeroLiveHub nextShow={upcomingShows[0] ? { venue: upcomingShows[0].venue, date: upcomingShows[0].date, time: upcomingShows[0].time, city: upcomingShows[0].city } : undefined} />
    </div>

   </div>



 </section>

 {/* ====== TOUR LIST (full — same as /tour page) ====== */}
 <TourList initialShows={upcomingShows} hideMap maxShows={5} />


 {/* ====== PROXIMITY NOTIFY ====== */}
 <ProximityNotify />

 {/* ====== MUSIC PLAYER ====== */}
 <AudioPlayerSection />

 {/* ====== MERCH QUICK SHOP ====== */}
 <section className="py-20 bg-[var(--color-bg-primary)] border-t border-white/5">
  <div className="site-container">
   <div className="flex items-center justify-between mb-10">
    <div>
     <span className="text-[0.65rem] font-black text-[var(--color-accent)] uppercase tracking-[0.2em] mb-2 block">Official Store</span>
     <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">Merch &amp; Music</h2>
    </div>
    <Link href="/store" className="text-[0.65rem] font-bold text-white/40 hover:text-white uppercase tracking-[0.15em] border border-white/10 px-4 py-2 transition-all">
     Shop All →
    </Link>
   </div>
   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {[
     { name: "Be Here", price: "$15", cat: "💿 Latest CD", badge: "NEW", paypalId: "CP5NWKWMEQMMJ", img: "/images/merch-be-here.png" },
     { name: "Color In Motion", price: "$15", cat: "💿 Original CD", paypalId: "898VXQMC4P56W", img: "/images/merch-color-in-motion.png" },
     { name: "Covered", price: "$15", cat: "🎵 Covers", paypalId: "B9NB2TDP2HV4Q", img: "/images/merch-covered.png" },
     { name: "Live on Harmony of the Seas", price: "$20", cat: "📀 Blu-ray", img: "/images/merch-live-bluray.png" },
     { name: "7th Heaven Logo Tee", price: "$25", cat: "👕 Apparel", comingSoon: true, img: "/images/merch-logo-tee.png" },
    ].map(item => (
     <div key={item.name} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-[var(--color-accent)]/30 transition-all group">
      <div className="aspect-square bg-[#0d0d15] relative overflow-hidden">
        <Image src={item.img} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
       {item.badge && (
        <span className="absolute top-2 left-2 bg-[var(--color-accent)] text-white text-[0.45rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded">{item.badge}</span>
       )}
       {item.comingSoon && (
        <span className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm text-white/50 text-[0.45rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Coming Soon</span>
       )}
      </div>
      <div className="p-4">
       <p className="text-[0.5rem] text-white/20 uppercase tracking-widest mb-1">{item.cat}</p>
       <h3 className="text-[0.8rem] font-bold text-white truncate mb-1 group-hover:text-[var(--color-accent)] transition-colors">{item.name}</h3>
       <div className="flex items-center justify-between">
        <span className="text-[var(--color-accent)] font-bold text-sm">{item.price}</span>
        {item.paypalId ? (
         <a href={`https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${item.paypalId}`} target="_blank" rel="noopener noreferrer" className="text-[0.5rem] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">Buy →</a>
        ) : item.comingSoon ? (
         <span className="text-[0.5rem] text-white/15 uppercase tracking-widest">Soon</span>
        ) : (
         <Link href="/store" className="text-[0.5rem] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">View →</Link>
        )}
       </div>
      </div>
     </div>
    ))}
   </div>
  </div>
 </section>

  {/* ====== PHOTOS FROM THE LAST SHOW ====== */}
  <section className="py-24 relative overflow-hidden bg-[#050508] border-t border-white/5">
    <div className="site-container relative z-10">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[0.65rem] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
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
             className="object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
             <span className="text-amber-500 text-[0.65rem] font-black uppercase tracking-widest mb-1">House of Blues</span>
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
               className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
               <span className="text-[0.6rem] font-bold text-white uppercase tracking-widest">{photo.title}</span>
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
       <span className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-cyan-400">Now Accepting Interest</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
       7th Heaven <span className="accent-gradient-text">Caribbean Cruise</span>
      </h2>
      <p className="text-white/45 text-sm leading-relaxed max-w-lg mb-2">
       7 nights. 3 islands. 6 live shows. Sign up free to help us negotiate the best group rate — the more fans, the better the deal.
      </p>
      <div className="flex flex-wrap gap-4 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/25">
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
