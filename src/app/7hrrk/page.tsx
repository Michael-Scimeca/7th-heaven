"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles, Play, BookOpen, Gamepad2, Music, Shield, ExternalLink, Mail,
  Award, Users, Star, Tv, Zap, Heart, Layout, Layers, Monitor, Disc, ChevronRight
} from "lucide-react";

const comicBooks = [
  {
    ep: "Episode 1",
    title: "Land Of Confusion",
    desc: "The Rock 'N' Roll Kids embark on their first epic adventure, bringing positivity and music to resolve chaos in the city.",
    amazonUrl: "https://www.amazon.com/gp/product/B096TJNDWR?ref_=dbs_m_mng_rwt_calw_tpbk_0&storeType=ebooks",
    badge: "Series Premiere",
    color: "from-purple-600 to-indigo-600",
  },
  {
    ep: "Episode 2",
    title: "Who Are You",
    desc: "Identity, friendship, and staying true to yourself when XEC Records try to change the band's authentic rock sound.",
    amazonUrl: "https://www.amazon.com/gp/product/B08FNMPFTR?ref_=dbs_m_mng_rwt_calw_tpbk_1&storeType=ebooks",
    badge: "Fan Favorite",
    color: "from-blue-600 to-cyan-600",
  },
  {
    ep: "Episode 3",
    title: "What You Give",
    desc: "A powerful tale of kindness and social consciousness as the kids use music to help community schools stay open.",
    amazonUrl: "https://www.amazon.com/gp/product/B08GLP426D?ref_=dbs_m_mng_rwt_calw_tpbk_2&storeType=ebooks",
    badge: "Must Read",
    color: "from-emerald-600 to-teal-600",
  },
  {
    ep: "Episode 4",
    title: "Runnin' Down A Dream",
    desc: "High-octane concert energy, flying drones, and an unbelievable battle of the bands showdown against ancient rock rivals.",
    amazonUrl: "https://www.amazon.com/gp/product/B08R68B2QF?ref_=dbs_m_mng_rwt_calw_tpbk_3&storeType=ebooks",
    badge: "Latest Edition",
    color: "from-pink-600 to-rose-600",
  },
];

const videosList = [
  {
    id: "3ZhqLJDRxQ8",
    title: "7th Heaven and the Rock 'n' Roll Kids Promo 1",
    tag: "Official Trailer",
    desc: "Official animated promo trailer for the upcoming TV series featuring original animation and music.",
  },
  {
    id: "vW9GMwJtUZ0",
    title: "Beautiful Life (Animated Video)",
    tag: "Music Video",
    desc: "High-energy animated music video communicating messages of fun, positivity, and hope.",
  },
  {
    id: "Fw9RruU3dT0",
    title: "Midwest Girls In The Summertime",
    tag: "Animated Single",
    desc: "Summer anthemic animated video celebrating good vibes and great rock and roll.",
  },
  {
    id: "W3dkLd9UkZU",
    title: "Time of Our Lives",
    tag: "Concert Finale",
    desc: "Full band animated concert performance showcasing the Rock 'N' Roll Kids live on stage.",
  },
];

const mainCharacters = [
  {
    role: "Lead Guitarist",
    name: "Barefoot Rocker",
    desc: "Blonde hair, shades, and barefoot energy. Plays lightning-fast lead guitar solos and brings fearless optimism.",
    icon: Zap,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    role: "Bass Guitarist",
    name: "Cap Bassist",
    desc: "Baseball cap backwards, driving deep basslines that keep the groove locked down in every battle.",
    icon: Shield,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    role: "Drums & Percussion",
    name: "Power Drummer",
    desc: "The heartbeat of 7HRRK. Thunderous rhythms and high-tempo beats that power up the kids' magical music energy.",
    icon: Music,
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    role: "Rhythm Guitarist",
    name: "Headband Shredder",
    desc: "Red headband and heavy rhythm chords. Crafts catchy riffs that solve problems and unite the crowd.",
    icon: Star,
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
  {
    role: "Lead Vocalist",
    name: "Frontman Kid",
    desc: "Black hat and infectious mic vocals. Leads the team with powerful anthems of kindness and rock attitude.",
    icon: Tv,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
const layoutNames = [
  { mode: 1, name: "Layout 1: Comic Book Magazine", desc: "Bold comic panels, issue rack grid, and trading cards" },
  { mode: 2, name: "Layout 2: Neon Arcade", desc: "Futuristic synthwave cyberpunk dark theme with glowing neon grid" },
  { mode: 3, name: "Layout 3: Cinematic TV Streaming", desc: "Featured theater player with horizontal media rails" },
  { mode: 4, name: "Layout 4: Editorial Split Column", desc: "Fixed sticky sidebar with clean high-density right column flow" },
  { mode: 5, name: "Layout 5: 3D Vault Portal", desc: "Radial glow backdrop with floating 3D tilt interactive cards" },
];

export default function RockNRollKidsPage() {
  const [layoutMode, setLayoutMode] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedVideo, setSelectedVideo] = useState("3ZhqLJDRxQ8");

  return (
    <div className="min-h-screen bg-[#05030a] text-white pt-24 pb-20 overflow-x-hidden">

      {/* ── LAYOUT SELECTOR CONTROL BAR ── */}
      <div className="sticky top-20 z-50 bg-[#0b0717]/95 border-y border-purple-500/30 backdrop-blur-xl py-3 px-4 shadow-2xl">
        <div className="site-container flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Choose Layout Variant:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {layoutNames.map((item) => (
              <button aria-label="Action button"
                type="button"
                key={item.mode}
                onClick={() => setLayoutMode(item.mode as any)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${layoutMode === item.mode
                    ? "bg-linear-to-r from-purple-600 to-cyan-600 text-white shadow-md shadow-purple-600/40 border border-purple-300/40 scale-105"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                title={item.desc}
              >
                Layout {item.mode}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* ── LAYOUT 1: COMIC BOOK MAGAZINE ── */}
      {/* ========================================================================= */}
      {layoutMode === 1 && (
        <div className="animate-fadeIn">
          {/* Hero */}
          <section className="relative site-container py-16 text-center">
            <div className="max-w-4xl mx-auto bg-gradient-to-b from-purple-900/30 to-black/60 border-2 border-purple-500/40 rounded-3xl p-8 md:p-12 shadow-2xl relative">
              <span className="px-3 py-1 bg-purple-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
                Layout 1 · Comic Book Magazine
              </span>
              <h1 className="text-5xl md:text-7xl font-bold uppercase italic text-white leading-none tracking-tight mb-4" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                7TH HEAVEN <br />
                <span className="text-purple-400">& THE ROCK &apos;N&apos; ROLL KIDS</span>
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-6 font-medium">
                Official Animated Series & Comic Universe created by Richard Hofherr & Roy Adorjan. Communicating positivity, fun, and social consciousness through rock and roll music!
              </p>
            </div>
          </section>

          <div className="site-container space-y-16">
            {/* Story Magazine Section */}
            <section className="bg-purple-950/20 border border-purple-500/20 rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl font-bold uppercase text-white mb-4">Rock &apos;N&apos; Roll To The Rescue</h2>
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-purple-200 text-sm mb-4">
                &ldquo;Based on the globally renowned pop rock band 7th Heaven, this animated series features the band as young kids who bring positivity, problem-solving, and music to kids across the world.&rdquo;
              </blockquote>
              <p className="text-white/70 text-xs leading-relaxed max-w-3xl">
                Created to bring a breath of fresh air to young audiences, each episode and comic book features fun adventures, school community support, and uplifting pop-rock songs.
              </p>
            </section>

            {/* Comic Rack */}
            <section>
              <h2 className="text-2xl font-bold uppercase text-white mb-6">Comic Book Rack (4 Episodes)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {comicBooks.map((c) => (
                  <div key={c.ep} className="bg-black/80 border-2 border-purple-500/30 rounded-2xl p-5 hover:border-purple-400 transition-all flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 block mb-1">{c.ep}</span>
                      <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                      <p className="text-white/60 text-xs mb-4">{c.desc}</p>
                    </div>
                    <a href={c.amazonUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2">
                      <span>Amazon Store</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Video Showcase */}
            <section className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold uppercase text-white mb-4">Animated Video Theater</h2>
              <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-black">
                <iframe src={`https://www.youtube.com/embed/${selectedVideo}`} title="7HRRK Player" className="w-full h-full" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {videosList.map((v) => (
                  <button aria-label="Action button" type="button" key={v.id} onClick={() => setSelectedVideo(v.id)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-purple-900/40 transition-all">
                    <span className="text-[10px] font-bold text-purple-300 block">{v.tag}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{v.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Characters */}
            <section>
              <h2 className="text-2xl font-bold uppercase text-white mb-6">Character Trading Cards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainCharacters.map((char) => (
                  <div key={char.name} className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-6">
                    <span className="text-[10px] font-bold text-purple-400 block uppercase">{char.role}</span>
                    <h3 className="text-base font-bold text-white mb-2">{char.name}</h3>
                    <p className="text-white/60 text-xs">{char.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Games & Contact */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">&ldquo;ONE&rdquo; Card Game & Apps</h3>
                <p className="text-white/60 text-xs">Official 7HRRK family card game and action video games in active development.</p>
              </div>
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Creators</h3>
                <p className="text-white/70 text-xs mb-1">Richard Hofherr (Rich777@aol.com)</p>
                <p className="text-white/70 text-xs">Roy Adorjan (info@minimartians.com)</p>
              </div>
            </section>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ── LAYOUT 2: NEON ARCADE (CYBERPUNK GRID) ── */}
      {/* ========================================================================= */}
      {layoutMode === 2 && (
        <div className="animate-fadeIn">
          {/* Hero */}
          <section className="relative site-container py-16 text-center">
            <span className="px-3 py-1 bg-cyan-500 text-black font-mono text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
              Layout 2 · Neon Arcade Synthwave
            </span>
            <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] mb-4">
              7HRRK ARCADE
            </h1>
            <p className="text-cyan-200 text-sm font-mono max-w-xl mx-auto">
              [SYSTEM_ONLINE] 7th Heaven & The Rock &apos;N&apos; Roll Kids Animated Series & Comic Matrix.
            </p>
          </section>

          <div className="site-container space-y-16">
            {/* Cyber Grid Videos */}
            <section className="border border-cyan-500/40 bg-black/90 p-6 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.15)]">
              <h2 className="text-xl font-mono text-cyan-400 uppercase tracking-widest mb-4">// VIDEO_MATRIX</h2>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-cyan-500/50 mb-4">
                <iframe src={`https://www.youtube.com/embed/${selectedVideo}`} title="7HRRK Player" className="w-full h-full" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {videosList.map((v) => (
                  <button aria-label="Action button" type="button" key={v.id} onClick={() => setSelectedVideo(v.id)} className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-left hover:border-cyan-400">
                    <span className="text-[9px] font-mono text-pink-400 block">{v.tag}</span>
                    <span className="text-xs font-bold text-cyan-100 line-clamp-1">{v.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Cyber Comics */}
            <section>
              <h2 className="text-xl font-mono text-pink-400 uppercase tracking-widest mb-6">// COMIC_DATABASE</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {comicBooks.map((c) => (
                  <div key={c.ep} className="bg-black/90 border border-pink-500/40 p-5 rounded-xl hover:border-pink-300">
                    <span className="text-[10px] font-mono text-pink-400 block mb-1">{c.ep}</span>
                    <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                    <p className="text-white/60 text-xs mb-4">{c.desc}</p>
                    <a href={c.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-pink-600 text-white text-[10px] font-mono font-bold uppercase rounded-lg inline-block">
                      AMAZON_LINK
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Characters & Arcade Games */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-purple-500/40 bg-black/90 p-6 rounded-xl">
                <h2 className="text-lg font-mono text-purple-400 mb-4">// HERO_ROSTER</h2>
                <div className="space-y-3">
                  {mainCharacters.map((char) => (
                    <div key={char.name} className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-lg">
                      <span className="text-[10px] font-mono text-purple-300">{char.role}</span>
                      <h4 className="text-xs font-bold text-white">{char.name}</h4>
                      <p className="text-[11px] text-white/50">{char.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-amber-500/40 bg-black/90 p-6 rounded-xl space-y-6">
                <div>
                  <h2 className="text-lg font-mono text-amber-400 mb-2">// GAMES_IN_DEVELOPMENT</h2>
                  <p className="text-white/70 text-xs mb-3">&ldquo;ONE&rdquo; Physical Card Game & 7HRRK Arcade Side-scroller Video Games.</p>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-mono rounded">STATUS: ACTIVE</span>
                </div>

                <div className="border-t border-amber-500/20 pt-6">
                  <h2 className="text-lg font-mono text-amber-400 mb-2">// PRODUCTION_CONTACTS</h2>
                  <p className="text-white/70 text-xs">Rich777@aol.com (Richard Hofherr)</p>
                  <p className="text-white/70 text-xs">info@minimartians.com (Roy Adorjan)</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ── LAYOUT 3: CINEMATIC TV STREAMING ── */}
      {/* ========================================================================= */}
      {layoutMode === 3 && (
        <div className="animate-fadeIn">
          {/* Full Width Streaming Hero */}
          <section className="relative w-full h-[500px] flex items-center justify-center text-center overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-t from-[#05030a] via-black/80 to-transparent z-10" />
            <div className="relative z-20 site-container max-w-3xl">
              <span className="px-3 py-1 bg-rose-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-full mb-3 inline-block">
                Layout 3 · Streaming Showcase
              </span>
              <h1 className="text-5xl md:text-7xl font-bold uppercase text-white mb-4" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                7TH HEAVEN & THE ROCK &apos;N&apos; ROLL KIDS
              </h1>
              <p className="text-white/70 text-sm max-w-xl mx-auto mb-6">
                Now streaming official promo trailers, music videos, and comic book episodes.
              </p>
            </div>
          </section>

          <div className="site-container space-y-14">
            {/* Horizontal Video Strip */}
            <section>
              <h2 className="text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                <Tv className="w-5 h-5 text-rose-500" />
                <span>Featured Animated Trailers</span>
              </h2>
              <div className="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black mb-6">
                <iframe src={`https://www.youtube.com/embed/${selectedVideo}`} title="7HRRK Stream" className="w-full h-full" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {videosList.map((v) => (
                  <button aria-label="Action button" type="button" key={v.id} onClick={() => setSelectedVideo(v.id)} className="w-64 shrink-0 p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10">
                    <span className="text-[10px] font-bold text-rose-400 block">{v.tag}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{v.title}</h4>
                  </button>
                ))}
              </div>
            </section>

            {/* Horizontal Comic Rail */}
            <section>
              <h2 className="text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>Comic Book Series Rail</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {comicBooks.map((c) => (
                  <div key={c.ep} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-300 block mb-1">{c.ep}</span>
                      <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                      <p className="text-white/60 text-xs mb-4">{c.desc}</p>
                    </div>
                    <a href={c.amazonUrl} target="_blank" rel="noopener noreferrer" className="py-2 px-3 bg-purple-600 text-white text-xs font-bold uppercase rounded-xl text-center">
                      Amazon eBook
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Characters & Contacts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Cast Members</h3>
                <div className="space-y-3">
                  {mainCharacters.map((c) => (
                    <div key={c.name} className="p-3 bg-white/5 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-400 block">{c.role}</span>
                      <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Production Studio</h3>
                  <p className="text-white/60 text-xs mb-4">NTD Animation · NTD Graphics · RNR Studios</p>
                  <p className="text-white/80 text-xs">Richard Hofherr: Rich777@aol.com</p>
                  <p className="text-white/80 text-xs">Roy Adorjan: info@minimartians.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ── LAYOUT 4: EDITORIAL SPLIT COLUMN ── */}
      {/* ========================================================================= */}
      {layoutMode === 4 && (
        <div className="animate-fadeIn site-container py-12">
          <div className="mb-8">
            <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-full mb-2 inline-block">
              Layout 4 · Editorial Split Column
            </span>
            <h1 className="text-4xl md:text-6xl font-bold uppercase italic text-white" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              7TH HEAVEN & THE ROCK &apos;N&apos; ROLL KIDS
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36 h-fit">
              <div className="bg-[#0f0a1c] border border-white/10 p-6 rounded-2xl">
                <h3 className="text-lg font-bold uppercase text-white mb-2">Series Overview</h3>
                <p className="text-white/70 text-xs leading-relaxed mb-4">
                  Communicating messages of fun, positivity, and social consciousness through rock and roll music and imagination.
                </p>
                <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                  <p className="text-emerald-400 font-bold">Created by:</p>
                  <p className="text-white/80">Richard Hofherr (Rich777@aol.com)</p>
                  <p className="text-white/80">Roy Adorjan (info@minimartians.com)</p>
                </div>
              </div>

              <div className="bg-[#0f0a1c] border border-white/10 p-6 rounded-2xl">
                <h3 className="text-lg font-bold uppercase text-white mb-2">Games & Apps</h3>
                <p className="text-white/60 text-xs mb-2">&ldquo;ONE&rdquo; Card Game</p>
                <p className="text-white/60 text-xs">7HRRK Video Games</p>
              </div>
            </div>

            {/* Right Main Column */}
            <div className="lg:col-span-8 space-y-12">
              {/* Video Player */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase text-white">Video Showcase</h2>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <iframe src={`https://www.youtube.com/embed/${selectedVideo}`} title="7HRRK Editorial" className="w-full h-full" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
                </div>
              </div>

              {/* Comic Books */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase text-white">Comic Book Library</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {comicBooks.map((c) => (
                    <div key={c.ep} className="bg-[#0f0a1c] border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">{c.ep}</span>
                        <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                        <p className="text-white/60 text-xs mb-4">{c.desc}</p>
                      </div>
                      <a href={c.amazonUrl} target="_blank" rel="noopener noreferrer" className="py-2 px-3 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl text-center">
                        Amazon Kindle
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Characters */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase text-white">Character Roster</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mainCharacters.map((c) => (
                    <div key={c.name} className="bg-[#0f0a1c] border border-white/10 p-4 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-400 block">{c.role}</span>
                      <h4 className="text-sm font-bold text-white mb-1">{c.name}</h4>
                      <p className="text-white/60 text-xs">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ── LAYOUT 5: 3D VAULT PORTAL ── */}
      {/* ========================================================================= */}
      {layoutMode === 5 && (
        <div className="animate-fadeIn">
          <section className="relative site-container py-16 text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />

            <span className="px-3 py-1 bg-amber-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-full mb-4 inline-block">
              Layout 5 · 3D Vault Portal
            </span>
            <h1 className="text-5xl md:text-8xl font-bold uppercase italic text-white mb-4" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              7TH HEAVEN <br />
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                ROCK &apos;N&apos; ROLL VAULT
              </span>
            </h1>
            <p className="text-white/80 text-sm max-w-xl mx-auto mb-8 font-medium">
              Explore the animated multiverse, comic book archives, music releases, and character universe.
            </p>
          </section>

          <div className="site-container space-y-16">
            {/* 3D Floating Video Theater */}
            <section className="bg-gradient-to-b from-amber-950/30 to-purple-950/30 border border-amber-500/30 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
              <h2 className="text-2xl font-bold uppercase italic text-amber-400 mb-4">3D Animated Cinema</h2>
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-amber-500/40 bg-black mb-4">
                <iframe src={`https://www.youtube.com/embed/${selectedVideo}`} title="7HRRK Vault" className="w-full h-full" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {videosList.map((v) => (
                  <button aria-label="Action button" type="button" key={v.id} onClick={() => setSelectedVideo(v.id)} className="p-3 bg-amber-950/40 border border-amber-500/20 rounded-xl text-left hover:border-amber-400">
                    <span className="text-[10px] font-bold text-amber-300 block">{v.tag}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{v.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3D Comic Cards */}
            <section>
              <h2 className="text-2xl font-bold uppercase italic text-white mb-6">Comic Book Vault (4 Issues)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {comicBooks.map((c) => (
                  <div key={c.ep} className="bg-gradient-to-b from-purple-900/40 to-black/80 border border-purple-500/40 p-6 rounded-2xl hover:scale-105 transition-all shadow-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">{c.ep}</span>
                      <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                      <p className="text-white/60 text-xs mb-6">{c.desc}</p>
                    </div>
                    <a href={c.amazonUrl} target="_blank" rel="noopener noreferrer" className="py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl text-center shadow-md">
                      Buy Amazon Issue
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Character Vault & Studio Details */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h3 className="text-xl font-bold uppercase text-white mb-4">Character Universe</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mainCharacters.map((c) => (
                    <div key={c.name} className="p-3 bg-black/50 border border-white/10 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-400 block">{c.role}</span>
                      <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold uppercase text-white mb-2">Vault Directors</h3>
                  <p className="text-white/70 text-xs mb-2">Richard Hofherr (Rich777@aol.com)</p>
                  <p className="text-white/70 text-xs mb-4">Roy Adorjan (info@minimartians.com)</p>
                  <p className="text-white/50 text-[11px]">NTD Animation · NTD Graphics · RNR Studios</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

    </div>
  );
}
