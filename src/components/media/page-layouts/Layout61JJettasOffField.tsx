/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import { MediaLayoutProps } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 61: JJettas Off-Field Definitive Experience (https://jjettas.com/off-field)
// Directly ported from jjettas.com/off-field:
// - Hero split: Colossal "OFF / STAGE" title + narrative + gold signature flourish + tilted white-frame card
// - Statement quote: "HOW WE SHOW UP MATTERS AS MUCH AS WHAT WE PLAY"
// - Sticky Category Navigation Dock: [ ALL | CONCERTS | MEDLEYS | BROADCAST | FAN VAULT ]
// - Colossal watermarked category headings with noise texture & purple gradient
// - Horizontal panoramic media strip (continuous smooth drag/scroll) + Large Grid view toggle
// - Interactive cinema player stage with golden metallic bezel
// - Editorial Features section ("01 / 30 Songs In 30 Minutes", "02 / Billboard #1", etc.)
// - Press & sponsor accreditation ticker strip (Billboard, WGN 9, NBC, Bud Light, Arcada)
// =========================================================================
export default function Layout61JJettasOffField({
  activeItem,
  onSelectItem,
  allMedia,
  videoPlayerRef,
  isPlaying,
  togglePlay,
  isMuted,
  toggleMute,
  currentTime,
  duration,
  handleSeek,
  handleSkip,
  toggleFullscreen,
  thumbFor,
  formatSeconds,
  onShare,
  copiedLink,
  onOpenLightbox,
}: MediaLayoutProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"strip" | "grid">("strip");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cinemaStageRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (selectedFilter === "Concerts") {
      return allMedia.filter(
        (m) =>
          m.category?.toLowerCase().includes("concert") ||
          m.mediaFormat === "video",
      );
    }
    if (selectedFilter === "Medleys") {
      return allMedia.filter(
        (m) =>
          m.category === "Medley Special" ||
          m.title.toLowerCase().includes("medley") ||
          m.title.toLowerCase().includes("30 songs"),
      );
    }
    if (selectedFilter === "Broadcast") {
      return allMedia.filter(
        (m) =>
          m.category?.toLowerCase().includes("broadcast") ||
          m.credits.format?.toLowerCase().includes("4k"),
      );
    }
    if (selectedFilter === "Fan Vault") {
      return allMedia.filter(
        (m) =>
          m.mediaFormat === "photo" ||
          m.category?.toLowerCase().includes("fan"),
      );
    }
    return allMedia;
  }, [allMedia, selectedFilter]);

  const handlePick = (item: (typeof allMedia)[0]) => {
    onSelectItem(item);
    if (item.mediaFormat === "photo" && onOpenLightbox) {
      onOpenLightbox(item);
    } else {
      cinemaStageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -500, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 500, behavior: "smooth" });
  };

  // Rotational photo tilts matching jjettas.com
  const tilts = [
    "-rotate-2 hover:rotate-0",
    "rotate-1 hover:rotate-0",
    "-rotate-1 hover:rotate-0",
    "rotate-2 hover:rotate-0",
    "-rotate-2 hover:rotate-0",
  ];

  const categoryTitle =
    selectedFilter === "Medleys"
      ? "MEDLEYS"
      : selectedFilter === "Broadcast"
      ? "BROADCAST"
      : selectedFilter === "Fan Vault"
      ? "FAN VAULT"
      : selectedFilter === "Concerts"
      ? "CONCERTS"
      : "OFF STAGE";

  const categoryNarrative =
    selectedFilter === "Medleys"
      ? "30 Songs in 30 Minutes. Non-stop, unbroken adrenaline celebrating 40 years of rock history."
      : selectedFilter === "Broadcast"
      ? "Broadcast television specials, 4K multi-cam arena master recordings, and national festival broadcasts."
      : selectedFilter === "Fan Vault"
      ? "Crowd-submitted moments, front-row energy, and four decades of unforgettable concert memories."
      : "From the festival mainstage to the historic theatre, 7th Heaven treats every entrance as a chance to say something without speaking.";

  return (
    <div className="relative w-full min-h-screen text-white pt-16 sm:pt-20 pb-28 overflow-hidden bg-transparent select-none">
      {/* Cinematic Analog Noise & Film Grain Overlay over the text and page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -inset-[50%] w-[200%] h-[200%] z-[1] bg-film-noise animate-film-grain opacity-30 mix-blend-overlay select-none"
      />

      {/* ── SECTION 1: HERO SECTION (jjettas.com off-hero) ── */}
      <section
        aria-label="Off Stage Hero"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Stacked Colossal Typography + Story + Signature */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="select-none uppercase leading-[0.8] tracking-[-0.02em] font-[family-name:var(--font-anton)] text-[clamp(68px,14vw,185px)] text-[#F4EFE6]">
              <span className="block">OFF</span>
              <span className="block text-[#9e6de9]">STAGE</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#F4EFE6]/80 max-w-xl font-sans">
              Before the 5,000 live shows, before the #1 Billboard charting anthems, before 30 Songs in 30 Minutes became a Chicago legend, there were five musicians who understood one thing: how you show up on stage matters as much as what you play.
            </p>

            {/* Signature flourish in gold */}
            <div className="pt-2 flex items-center gap-4">
              <svg
                viewBox="0 0 140 50"
                className="w-32 h-auto text-[#eeac1a]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10,40 Q40,5 70,28 T120,18 Q135,30 138,40 M55,18 Q80,45 105,22" />
              </svg>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#eeac1a]/80 font-bold">
                7th Heaven • Archival Circuit
              </span>
            </div>
          </div>

          {/* Right Column: Tilted White-Framed Gallery Photo/Video Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              onClick={() => handlePick(activeItem)}
              className="group relative cursor-pointer rotate-2 hover:rotate-0 transition-transform duration-700 ease-out max-w-sm sm:max-w-md w-full"
            >
              <div className="p-3 sm:p-4 bg-white shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(158,109,233,0.35)] rounded-sm text-black">
                <div className="relative aspect-[4/5] bg-black overflow-hidden">
                  <img
                    src={thumbFor(activeItem)}
                    alt={activeItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

                  {/* Play Button Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#eeac1a] text-black flex items-center justify-center font-bold shadow-[0_0_30px_rgba(238,172,26,0.85)] group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-black/80 text-white font-mono text-[10px] font-black uppercase tracking-wider border border-white/20">
                      ● FEATURED
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 text-amber-300 font-mono text-[10px] font-bold border border-white/20">
                      {activeItem.duration}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#eeac1a]">
                      {activeItem.credits.venue || "Festival Mainstage"}
                    </p>
                    <h3 className="text-xl font-black uppercase tracking-wide truncate">
                      {activeItem.title}
                    </h3>
                  </div>
                </div>

                <div className="pt-3 pb-1 px-1 flex items-center justify-between font-mono text-[11px] text-zinc-700">
                  <span className="font-bold uppercase tracking-wider">Fig. 01 — Featured Moment</span>
                  <span className="text-zinc-500 uppercase">{activeItem.year}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: STATEMENT QUOTE (jjettas.com off-quote) ── */}
      <section
        aria-label="Statement Quote"
        className="relative z-10 py-20 sm:py-32 px-4 flex items-center justify-center text-center overflow-hidden border-y border-white/10"
      >
        <blockquote className="max-w-5xl mx-auto uppercase font-[family-name:var(--font-anton)] text-[clamp(38px,7.5vw,105px)] leading-[1.02] text-[#F4EFE6] tracking-tight">
          HOW WE SHOW UP <span className="text-[#9e6de9]">MATTERS</span>
          <span className="block mt-1">
            <span className="text-[#9e6de9]">AS MUCH</span> AS WHAT WE PLAY.
          </span>
        </blockquote>
      </section>

      {/* ── SECTION 3: STICKY CATEGORY SUB-NAV DOCK ── */}
      <div className="sticky top-20 z-40 flex items-center justify-center px-4 my-12">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {["All", "Concerts", "Medleys", "Broadcast", "Fan Vault"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedFilter === tab
                  ? "bg-[#9e6de9] text-white shadow-[0_0_15px_rgba(158,109,233,0.5)] font-black"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="w-px h-4 bg-white/20 mx-1 hidden sm:block" />
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("strip")}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                viewMode === "strip" ? "bg-white/20 text-white font-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">Strip</span>
              <SlidersHorizontal className="w-3 h-3 sm:hidden" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white/20 text-white font-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">Grid</span>
              <LayoutGrid className="w-3 h-3 sm:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: COLOSSAL WATERMARKED CATEGORY SHOWCASE ── */}
      <section aria-label="Category Media Showcase" className="relative z-10 pt-4 pb-12">
        {/* Colossal Watermarked Headline peeking out behind media strip */}
        <div className="relative select-none pointer-events-none overflow-hidden px-4 sm:px-6 lg:px-8">
          <h2
            data-no-text-anim="true"
            className="font-[family-name:var(--font-anton)] whitespace-nowrap text-[16vw] uppercase leading-[0.82] tracking-[-0.03em] text-transparent bg-clip-text bg-gradient-to-b from-[#9e6de9] via-[#4f2bab]/60 to-transparent opacity-85 select-none"
          >
            {categoryTitle}
          </h2>
          <p className="relative z-10 -mt-4 sm:-mt-8 md:-mt-12 text-sm sm:text-base md:text-lg text-[#F4EFE6]/85 max-w-xl font-sans mb-6">
            {categoryNarrative}
          </p>
        </div>

        {/* Media Tiles: Strip or Grid View */}
        {viewMode === "strip" ? (
          /* Horizontal Panoramic Scrolling Strip (matching jjettas.com continuous cards) */
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex items-stretch gap-6 overflow-x-auto pb-8 pt-4 px-4 sm:px-6 lg:px-8 custom-scrollbar snap-x snap-mandatory"
            >
              {filtered.map((item, idx) => {
                const isSelected = item.id === activeItem.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handlePick(item)}
                    className={`group/tile relative block shrink-0 w-[320px] sm:w-[420px] lg:w-[500px] cursor-pointer snap-start transition-all duration-500 ${
                      isSelected ? "scale-[1.02]" : "hover:scale-[1.02]"
                    }`}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.85)] group-hover/tile:border-[#eeac1a]/60 group-hover/tile:shadow-[0_20px_50px_rgba(238,172,26,0.25)] transition-all">
                      <img
                        src={thumbFor(item)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {/* Sequence Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="px-2.5 py-0.5 rounded bg-black/80 text-[#eeac1a] font-mono text-[10px] font-black uppercase tracking-wider border border-[#eeac1a]/40">
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/80 text-zinc-300 font-mono text-[10px] border border-white/20">
                          {item.duration}
                        </span>
                      </div>

                      {/* Play Hover Trigger */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[1px]">
                        <div className="w-14 h-14 rounded-full bg-[#eeac1a] text-black flex items-center justify-center font-bold shadow-[0_0_25px_rgba(238,172,26,0.7)] group-hover/tile:scale-110 transition-transform">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#eeac1a] block truncate">
                          {item.credits.venue || "Soldier Field Circuit"}
                        </span>
                        <h4 className="text-base sm:text-lg font-black uppercase tracking-wide text-white truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center justify-end gap-2 px-4 sm:px-6 lg:px-8 pt-2">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="w-10 h-10 rounded-full bg-black/70 border border-white/15 flex items-center justify-center hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Scroll right"
                className="w-10 h-10 rounded-full bg-black/70 border border-white/15 flex items-center justify-center hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Column Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
            {filtered.map((item, idx) => {
              const isSelected = item.id === activeItem.id;
              const tiltClass = tilts[idx % tilts.length];
              return (
                <div
                  key={item.id}
                  onClick={() => handlePick(item)}
                  className={`group relative cursor-pointer transition-all duration-500 ${tiltClass} ${
                    isSelected ? "scale-105" : "hover:scale-105"
                  }`}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 p-1 shadow-[0_20px_40px_rgba(0,0,0,0.85)] group-hover:border-[#eeac1a]/60 transition-all">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black">
                      <img
                        src={thumbFor(item)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-black/80 text-[#eeac1a] font-mono text-[10px] font-black uppercase tracking-wider border border-[#eeac1a]/40">
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/80 text-zinc-300 font-mono text-[10px] border border-white/20">
                          {item.duration}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#eeac1a] block truncate">
                          {item.credits.venue || "Arena Circuit"}
                        </span>
                        <h4 className="text-sm font-black uppercase tracking-wide text-white truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECTION 5: ARENA CINEMA THEATER STAGE ── */}
      <section
        ref={cinemaStageRef}
        aria-label="Arena Cinema Stage"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-[#eeac1a]">
              ACTIVE SCREENING
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              {activeItem.title}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
            {activeItem.year} • {activeItem.duration}
          </span>
        </div>

        {/* Player Screen */}
        <div className="relative rounded-3xl p-[3px] bg-gradient-to-b from-[#fde68a] via-[#eeac1a] to-[#78350f] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(238,172,26,0.25)] overflow-hidden">
          <div className="rounded-[22px] overflow-hidden bg-black aspect-video relative">
            <MediaCinemaPlayer
              item={activeItem}
              videoRef={videoPlayerRef}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              isMuted={isMuted}
              toggleMute={toggleMute}
              currentTime={currentTime}
              duration={duration}
              handleSeek={handleSeek}
              handleSkip={handleSkip}
              toggleFullscreen={toggleFullscreen}
              thumbFor={thumbFor}
              formatSeconds={formatSeconds}
            />
          </div>
        </div>

        {/* Narrative & Credits Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="lg:col-span-8 space-y-3">
            <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              SYNOPSIS & CONCERT CONTEXT
            </h4>
            <p className="text-sm sm:text-base text-[#f4efe6]/80 leading-relaxed font-normal">
              {activeItem.synopsis}
            </p>
          </div>

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 space-y-3">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#eeac1a] block">
              ARENA CREDITS & TECHNICAL SPECS
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="text-zinc-500 uppercase">ARTIST</span>
                <span className="text-white font-bold">7th Heaven</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="text-zinc-500 uppercase">VENUE</span>
                <span className="text-[#eeac1a] font-bold">
                  {activeItem.credits.venue || "Chicago Soundstage"}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="text-zinc-500 uppercase">FORMAT</span>
                <span className="text-zinc-300">
                  {activeItem.credits.format || "4K Broadcast"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 uppercase">AUDIO</span>
                <span className="text-zinc-300">
                  {activeItem.credits.audio || "24-Bit Master"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onShare}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{copiedLink ? "Link Copied!" : "Share Moment"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: EDITORIAL FEATURES ARCHIVE (jjettas.com features) ── */}
      <section
        aria-label="Editorial Features Archive"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 mt-20"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[#eeac1a]">
              HISTORIC HIGHLIGHTS
            </span>
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
              SIGNATURE FEATURES
            </h3>
          </div>
          <p className="text-sm font-mono text-zinc-400 max-w-sm">
            Record-breaking festival sets, chart-topping singles, and historic 4K concert broadcasts.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {[
            {
              num: "01",
              title: "30 Songs in 30 Minutes",
              desc: "The legendary unbroken medley that defined Midwest festival culture and arena stages.",
              tag: "Medley Special",
            },
            {
              num: "02",
              title: "Billboard Top 40 & #1 Hit 'Better Days'",
              desc: "Official Billboard charting anthem featured across national television and radio networks.",
              tag: "Billboard Single",
            },
            {
              num: "03",
              title: "5,000+ Career Concerts Worldwide",
              desc: "Over 40 continuous years of tour history across arenas, amphitheaters, and festival grounds.",
              tag: "Tour Milestone",
            },
            {
              num: "04",
              title: "DeKalb Cornfest & Grant Park Mainstage",
              desc: "Headlining to crowds of 20,000+ passionate rock fans across the Chicago metropolitan area.",
              tag: "Festival Headliner",
            },
            {
              num: "05",
              title: "The Arcada Theatre 4K Broadcast Special",
              desc: "Full cinematic concert experience captured live in legendary historic theatre.",
              tag: "Broadcast Film",
            },
          ].map((feat) => (
            <div
              key={feat.num}
              className="group py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded-xl"
            >
              <div className="flex items-baseline gap-6">
                <span className="font-mono text-sm sm:text-base text-zinc-500 font-bold group-hover:text-[#eeac1a] transition-colors">
                  {feat.num}
                </span>
                <div>
                  <h4 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-white group-hover:text-[#9e6de9] transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                    {feat.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">
                  {feat.tag}
                </span>
                <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 7: PRESS & BRAND ACCREDITATIONS TICKER STRIP ── */}
      <div className="relative z-10 py-12 border-t border-white/10 overflow-hidden">
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-50 font-[family-name:var(--font-anton)] text-xl sm:text-2xl uppercase tracking-widest text-[#F4EFE6]">
          <span>BILLBOARD</span>
          <span>•</span>
          <span>WGN 9 CHICAGO</span>
          <span>•</span>
          <span>NBC NEWS</span>
          <span>•</span>
          <span>BUD LIGHT</span>
          <span>•</span>
          <span>ARCADA THEATRE</span>
          <span>•</span>
          <span>SUMMERFEST</span>
        </div>
        <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mt-6">
          7TH HEAVEN ARCHIVAL ARENA CIRCUIT • ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
