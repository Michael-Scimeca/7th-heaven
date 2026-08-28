"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Play, BookOpen, Gamepad2, Music, Shield, ExternalLink, Mail, Award, Users, Star, Tv, Zap, Heart } from "lucide-react";

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
];

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

export default function RockNRollKidsPage() {
  const [selectedVideo, setSelectedVideo] = useState("3ZhqLJDRxQ8");

  return (
    <div className="min-h-screen bg-[#05030a] text-white pt-24 pb-20 overflow-x-hidden">
      {/* ── HERO BANNER ── */}
      <section className="relative site-container py-12 md:py-20 text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Official Animated Series & Comic Universe</span>
          </div>

          {/* Main Title */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold uppercase italic tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] leading-none mb-6"
            style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}
          >
            7TH HEAVEN <br />
            <span className="bg-linear-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
              & THE ROCK &apos;N&apos; ROLL KIDS
            </span>
          </h1>

          {/* Description */}
          <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium mb-10">
            A positive, fun, and socially-conscious animated franchise based on 7th Heaven as young kids — featuring TV episodes, comic books, video games, original music, and empowering adventures!
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button aria-label="Action button"
              type="button"
              onClick={() => scrollToSection("videos")}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Animated Promo</span>
            </button>

            <button aria-label="Action button"
              type="button"
              onClick={() => scrollToSection("comics")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl backdrop-blur-md flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105"
            >
              <BookOpen className="w-4 h-4 text-cyan-300" />
              <span>Explore Comic Books</span>
            </button>
          </div>
        </div>

        {/* Anchor Jump Links Bar */}
        <div className="mt-14 flex flex-wrap justify-center gap-2 border-b border-white/10 pb-6 sticky top-20 z-30 bg-[#05030a]/80 backdrop-blur-md py-3">
          {[
            { id: "overview", label: "Overview & Vision", icon: Heart },
            { id: "comics", label: "Comic Books (4)", icon: BookOpen },
            { id: "videos", label: "Video Gallery", icon: Tv },
            { id: "characters", label: "Characters & Cast", icon: Users },
            { id: "games", label: "Games & Apps", icon: Gamepad2 },
            { id: "contact", label: "Creators & Contact", icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button aria-label="Action button"
                type="button"
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-white/5 text-white/70 hover:text-white hover:bg-purple-600/30 border border-white/10 transition-all cursor-pointer hover:border-purple-500/40"
              >
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── ALL SECTIONS CONTINUOUS SINGLE PAGE ── */}
      <div className="site-container space-y-24 py-8">

        {/* 1. OVERVIEW & VISION SECTION */}
        <section id="overview" className="scroll-mt-32 max-w-4xl mx-auto">
          <div className="bg-[#0f0a1c]/80 border border-purple-500/20 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

            <h2 className="text-2xl md:text-3xl font-bold uppercase italic text-white mb-6" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              Rock &apos;N&apos; Roll To <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">The Rescue!</span>
            </h2>

            <blockquote className="border-l-4 border-purple-500 pl-4 py-1 italic text-white/90 text-sm md:text-base leading-relaxed mb-6 font-medium bg-purple-950/30 rounded-r-xl">
              &ldquo;7th Heaven and the Rock &apos;n&apos; Roll Kids is based on the globally renowned pop rock band 7th Heaven. The animated series communicates messages of fun, positivity, and social consciousness through the connection of music and imagination. Each episode focuses on problem solving, adventure, and resolution.&rdquo;
            </blockquote>

            <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-6">
              We have been working with a dedicated team of creators to build a brand new animated universe based on 7th Heaven. The show features the band members as young kids who bring positivity to children across the world — known as &ldquo;The Rock and Roll Kids&rdquo;. In a world filled with negativity, 7th Heaven and the Rock &apos;n&apos; Roll Kids brings a breath of fresh air and positive influence through authentic rock and roll music.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <Heart className="w-5 h-5 text-rose-400 mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-1">Positivity First</h4>
                <p className="text-[11px] text-white/60">Inspiring young audiences with uplifting themes and friendly teamwork.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <Zap className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-1">Problem Solving</h4>
                <p className="text-[11px] text-white/60">Every adventure focuses on overcoming challenges through music and imagination.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <Music className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-1">Original Music</h4>
                <p className="text-[11px] text-white/60">Authentic pop-rock anthems composed specifically for the series and comic books.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. COMIC BOOKS SECTION */}
        <section id="comics" className="scroll-mt-32">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Official Comic Series</span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase italic text-white mt-1" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              Comic Book <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Library</span>
            </h2>
            <p className="text-white/60 text-xs md:text-sm mt-2">Available in Paperback & Kindle Edition on Amazon Store</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comicBooks.map((comic) => (
              <div key={comic.ep} className="bg-[#0f0a1c]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition-all hover:-translate-y-1 shadow-xl group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300 bg-purple-900/40 px-2.5 py-1 rounded-md border border-purple-500/30">
                      {comic.ep}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider text-white bg-linear-to-r ${comic.color} px-2 py-0.5 rounded-full shadow-xs`}>
                      {comic.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold uppercase italic text-white group-hover:text-purple-300 transition-colors mb-2" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                    {comic.title}
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed mb-6">{comic.desc}</p>
                </div>

                <a
                  href={comic.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
                >
                  <span>Buy On Amazon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 3. VIDEO GALLERY SECTION */}
        <section id="videos" className="scroll-mt-32 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400">Animated Showcase</span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase italic text-white mt-1" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              Video & Promo <span className="bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Gallery</span>
            </h2>
          </div>

          {/* Main Embedded Player */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-purple-500/30 bg-black shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=0&rel=0`}
              title="7HRRK Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Video Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {videosList.map((vid) => {
              const isSelected = selectedVideo === vid.id;
              return (
                <button aria-label="Action button"
                  type="button"
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid.id)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${isSelected
                    ? "bg-purple-950/80 border-purple-400 shadow-lg shadow-purple-600/30"
                    : "bg-[#0f0a1c]/60 border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-md border border-purple-500/30 block mb-2 w-fit">
                    {vid.tag}
                  </span>
                  <h4 className="text-xs font-bold uppercase text-white tracking-tight mb-1 line-clamp-1">{vid.title}</h4>
                  <p className="text-[11px] text-white/50 line-clamp-2">{vid.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. CHARACTERS & CAST SECTION */}
        <section id="characters" className="scroll-mt-32">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Meet The Band</span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase italic text-white mt-1" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              The Rock &apos;N&apos; Roll <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Kids Roster</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCharacters.map((char) => {
              const Icon = char.icon;
              return (
                <div key={char.name} className="bg-[#0f0a1c]/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl border ${char.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 block">{char.role}</span>
                      <h3 className="text-base font-bold uppercase text-white tracking-tight">{char.name}</h3>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{char.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Extended Universe Banner */}
          <div className="bg-[#0f0a1c]/60 border border-white/10 rounded-3xl p-6 md:p-8 text-center max-w-3xl mx-auto mt-8">
            <h3 className="text-lg font-bold uppercase text-white tracking-tight mb-2">Expanded Cast & Supporting Characters</h3>
            <p className="text-white/60 text-xs leading-relaxed max-w-xl mx-auto">
              Featuring Security Officers, high-tech Flying Camera Drones, Big Steve (Red 7th Heaven Shirt), denim-jacket guitarists, purple-haired rockers, XEC Record Execs, alien spaceships, and comic book villains!
            </p>
          </div>
        </section>

        {/* 5. GAMES & APPS SECTION */}
        <section id="games" className="scroll-mt-32 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-rose-400">Interactive Fun</span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase italic text-white mt-1" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              Games & Mobile <span className="bg-linear-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">Apps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f0a1c]/90 border border-purple-500/30 rounded-3xl p-8 text-left relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 mb-4 inline-block">
                Card Game
              </span>
              <h3 className="text-2xl font-bold uppercase italic text-white mb-2" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                &ldquo;ONE&rdquo; Card Game
              </h3>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                Official 7th Heaven and the Rock &apos;n&apos; Roll Kids physical card game for families and fans!
              </p>
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/50 px-4 py-2 rounded-xl border border-purple-500/30 inline-block">
                Coming Soon
              </span>
            </div>

            <div className="bg-[#0f0a1c]/90 border border-purple-500/30 rounded-3xl p-8 text-left relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-500/30 mb-4 inline-block">
                Mobile & Arcade
              </span>
              <h3 className="text-2xl font-bold uppercase italic text-white mb-2" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                7HRRK Action Video Games
              </h3>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                Interactive side-scrolling rock & roll adventures, drum rhythm battles, and puzzle challenges.
              </p>
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/50 px-4 py-2 rounded-xl border border-purple-500/30 inline-block">
                In Active Development
              </span>
            </div>
          </div>
        </section>

        {/* 6. CREATORS & CONTACT SECTION */}
        <section id="contact" className="scroll-mt-32 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Production Team</span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase italic text-white mt-1" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
              Creators & <span className="bg-linear-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">Studio Contact</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Richard Hofherr */}
            <div className="bg-[#0f0a1c]/90 border border-white/10 rounded-3xl p-8 text-left backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-900/40 border border-purple-500/30 rounded-2xl text-purple-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase text-white tracking-tight">Richard Hofherr</h3>
                  <p className="text-xs text-purple-300 font-medium">7th Heaven • NTD Animation</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                Founder and mastermind behind 7th Heaven and NTD Animation, bringing the band&apos;s positive message to animated television.
              </p>
              <a
                href="mailto:Rich777@aol.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-600/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email: Rich777@aol.com</span>
              </a>
            </div>

            {/* Roy Adorjan */}
            <div className="bg-[#0f0a1c]/90 border border-white/10 rounded-3xl p-8 text-left backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-900/40 border border-cyan-500/30 rounded-2xl text-cyan-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase text-white tracking-tight">Roy Adorjan</h3>
                  <p className="text-xs text-cyan-300 font-medium">RNR Studios • Writer & Illustrator</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                Creator, writer, and illustrator of the 7th Heaven and the Rock &apos;n&apos; Roll Kids comic book series and artwork.
              </p>
              <a
                href="mailto:info@minimartians.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email: info@minimartians.com</span>
              </a>
            </div>
          </div>

          {/* Official External Links */}
          <div className="bg-[#0f0a1c]/60 border border-white/10 rounded-3xl p-6 flex flex-wrap items-center justify-around gap-4 text-xs font-bold uppercase tracking-wider text-white/70 mt-8">
            <a href="http://www.NTDAnimation.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 flex items-center gap-1.5 transition-colors">
              <span>NTD Animation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="http://www.NTDGraphics.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 flex items-center gap-1.5 transition-colors">
              <span>NTD Graphics</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://www.7hrrk.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
              <span>Official 7HRRK Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
