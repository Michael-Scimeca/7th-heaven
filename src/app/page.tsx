import Image from "next/image";
import Link from "next/link";
import AudioPlayerSection from "@/components/AudioPlayer";
import VideoSection from "@/components/VideoSection";
import BehindTheScenes from "@/components/BehindTheScenes";
import HeroLiveHub from "@/components/HeroLiveHub";
import ProximityNotify from "@/components/ProximityNotify";
import Logo from "@/components/Logo";
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

const FALLBACK_SHOWS = [
 { day: "Fri", date: "January 2", venue: "Station 34", city: "Mt. Prospect, IL", time: "8:30pm", info: "F.A.N. Show - Unplugged" },
 { day: "Sat", date: "January 3", venue: "Old Republic", city: "Elgin, IL", time: "8:00pm", info: "All Age Outdoor" },
 { day: "Fri", date: "January 9", venue: "Rookies", city: "Hoffman Est., IL", time: "8:00pm", info: "F.A.N. Show - Unplugged" },
 { day: "Sun", date: "January 11", venue: "Sundance Saloon", city: "Mundelein, IL", time: "2:00pm", info: "F.A.N. Show - Unplugged" },
];

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

  const upcomingShows = (showsData as SanityTourDate[]).length > 0
    ? (showsData as SanityTourDate[]).slice(0, 4).map(s => ({
        day: s.day || "TBD",
        date: s.date,
        venue: s.venue,
        city: `${s.city}${s.state ? `, ${s.state}` : ""}`,
        time: s.time || "",
        info: s.notes || ""
      }))
    : FALLBACK_SHOWS;

  const stats = settings?.stats?.length ? settings.stats : FALLBACK_STATS;
  const tagline = settings?.tagline || "An experience you just have to see and hear.";
  const subTagline = settings?.subTagline || "40 years of rocking the world.";
  const release = settings?.latestRelease;
  const btsVideos = settings?.btsVideos;

 return (
 <>

 {/* ====== HERO ====== */}
 <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" id="hero">
  {/* BG - Solid Dark */}
  <div className="absolute inset-0 z-0 bg-black" />

  {/* Content */}
  <div className="relative z-[3] site-container pt-[calc(72px+4rem)] text-center">
   
   <div className="mb-12 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.4s_both]">
    <div className="w-full max-w-[600px] h-[120px] md:h-[180px] mx-auto">
     <Logo className="w-full h-full text-white" />
    </div>
   </div>

   <p className="text-[clamp(1rem,2vw,1.26rem)] text-[var(--color-text-secondary)] max-w-[600px] mx-auto mb-10 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.6s_both]">
    {tagline}<br />{subTagline}
   </p>

    {/* Live Hub — Feed + Next Show + Notifications */}
    <div className="mt-12 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.7s_both]">
     <HeroLiveHub nextShow={upcomingShows[0] ? { venue: upcomingShows[0].venue, date: upcomingShows[0].date, time: upcomingShows[0].time, city: upcomingShows[0].city } : undefined} />
    </div>
   </div>

   {/* Stats Strip */}
  <div className="relative z-[3] flex justify-center gap-12 p-12 mt-auto animate-[fade-in-up_0.8s_var(--ease-out-expo)_1s_both] max-md:flex-wrap max-md:gap-8 bg-white/[0.02] border-y border-white/5">
   {stats.map((stat) => (
    <div key={stat.label} className="text-center min-w-[120px]">
     <span className="block font-[var(--font-heading)] text-[2.2rem] font-extrabold gradient-text leading-none mb-1">{stat.number}</span>
     <span className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-bold">{stat.label}</span>
    </div>
   ))}
  </div>
 </section>

 {/* ====== PROXIMITY NOTIFY ====== */}
 <ProximityNotify />

 {/* ====== LATEST RELEASE ====== */}
 <section className="py-32 bg-[var(--color-bg-primary)]" id="latest-release">
 <div className="site-container">
  <div className="mb-12">
  <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">Latest Release</span>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
  {/* LEFT — Details & Credits */}
  <div className="flex flex-col justify-center">
   <h3 className="font-[var(--font-heading)] text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white leading-[0.95] mb-2">
   {release?.title ? (
    <>
     {release.title.split(' ').slice(0, -1).join(' ')}<br />
     <span className="gradient-text">{release.title.split(' ').slice(-1)[0]}</span>
    </>
   ) : (
    <>Ain&apos;t That Just<br /><span className="gradient-text">Beautiful</span></>
   )}
   </h3>
   <p className="text-[0.85rem] text-white/40 mb-6 flex items-center gap-2">
   <span>{release?.year || '2025'}</span>
   <span className="text-white/15">·</span>
   <span className="text-[var(--color-accent)]">{release?.duration || '3:35'}</span>
   <span className="text-white/15">·</span>
   <span>{release?.type || 'Official Music Video'}</span>
   </p>
   <p className="text-[0.95rem] text-[var(--color-text-secondary)] leading-relaxed mb-8">
   {release?.description || "The latest official music video from 7th heaven — a powerful rock ballad about seeing the beauty in everyday moments. Shot on location in Chicago, the video captures the band's signature high-energy performance style blended with cinematic storytelling."}
   </p>

   {/* Credits */}
   <div className="border-t border-white/10 pt-8">
   <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">Credits</p>
   <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[0.8rem]">
    {(release?.credits || [
     { role: 'Written by', name: 'Adam Heisler & Richard Hofherr' },
     { role: 'Produced by', name: '7th Heaven' },
     { role: 'Directed by', name: 'Michael Scimeca' },
     { role: 'Mixed & Mastered', name: 'NTD Studios' },
    ]).map((credit, i) => (
     <div key={i}>
     <span className="text-white/30 block text-[0.65rem] uppercase tracking-wider">{credit.role}</span>
     <span className="text-white">{credit.name}</span>
     </div>
    ))}
   </div>
   </div>

   {/* CTAs */}
   <div className="flex flex-wrap gap-3 mt-8">
   <a href={release?.buyLink || "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CP5NWKWMEQMMJ"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.8rem] py-3 px-6 transition-all" id="latest-buy-cd">
    Buy CD
   </a>
   <a href={release?.spotifyLink || "https://open.spotify.com"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.8rem] py-3 px-6 transition-all">
    Spotify
   </a>
   <a href={release?.appleMusicLink || "https://music.apple.com"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.8rem] py-3 px-6 transition-all">
    Apple Music
   </a>
   </div>
  </div>

  {/* RIGHT — Video */}
  <div className="flex flex-col gap-4">
   <a href={`https://www.youtube.com/watch?v=${release?.youtubeId || 'BzHUNTZ66zY'}`} target="_blank" rel="noopener noreferrer" className="relative aspect-video bg-[#12121a] border border-white/10 overflow-hidden block group">
    <img
     src={`https://img.youtube.com/vi/${release?.youtubeId || 'BzHUNTZ66zY'}/maxresdefault.jpg`}
     alt={release?.title || "Ain't That Just Beautiful — Official Music Video"}
     className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
    {/* Play button */}
    <div className="absolute inset-0 flex items-center justify-center z-10">
     <svg width="68" height="48" viewBox="0 0 68 48" className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
      <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#851DEF"/>
      <path d="M45 24L27 14v20" fill="white"/>
     </svg>
    </div>
   </a>

   {/* Behind the scenes photos */}
   <div className="grid grid-cols-3 gap-3">
   <div className="relative aspect-square bg-[#12121a] border border-white/10 overflow-hidden group">
    <Image src="/images/band-performance.png" alt="Behind the scenes" fill style={{ objectFit: "cover" }} className="grayscale group-hover:grayscale-0 transition-all duration-500" />
   </div>
   <div className="relative aspect-square bg-[#12121a] border border-white/10 overflow-hidden group">
    <Image src="/images/hero-banner.png" alt="On set" fill style={{ objectFit: "cover" }} className="grayscale group-hover:grayscale-0 transition-all duration-500" />
   </div>
   <div className="relative aspect-square bg-[#12121a] border border-white/10 overflow-hidden group">
    <img src={`https://img.youtube.com/vi/${release?.youtubeId || 'BzHUNTZ66zY'}/maxresdefault.jpg`} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
   </div>
   </div>

  </div>
  </div>
 </div>
 </section>

 {/* ====== MUSIC PLAYER ====== */}
 <AudioPlayerSection />

 {/* ====== VIDEOS ====== */}
 <VideoSection />

 {/* ====== BEHIND THE SCENES ====== */}
 <BehindTheScenes btsVideos={btsVideos} />

 </>
 );
}
