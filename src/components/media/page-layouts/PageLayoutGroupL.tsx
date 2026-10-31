/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Film,
  Camera,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 56: Full-Width Stacked Masterfeed (Single Column)
// Top master video player + Beneath it, full-width 1-column stacked cards
// =========================================================================
export function Layout56FullWidthStackedMasterfeed({
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
  onOpenLightbox,
}: MediaLayoutProps) {
  const topStageRef = useRef<HTMLDivElement>(null);

  const handlePick = (m: (typeof allMedia)[0]) => {
    onSelectItem(m);
    if (m.mediaFormat === "photo" && onOpenLightbox) {
      onOpenLightbox(m);
    } else {
      topStageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-10">
      {/* Top Open Cinema Screen */}
      <div ref={topStageRef} className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> MASTER VIDEO THEATER (OPEN)
          </span>
          <MediaFormatBadge item={activeItem} />
        </div>

        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
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
            onOpenLightbox={onOpenLightbox}
          />
        </div>

        <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <span className="text-xs font-mono text-amber-300 font-bold">{activeItem.duration}</span>
          </div>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{activeItem.synopsis}</p>
        </div>
      </div>

      {/* Strictly ONE COLUMN Full-Width Feed */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          FULL-WIDTH 1-COLUMN FEED ({allMedia.length} VIDEOS)
        </div>

        <div className="flex flex-col space-y-6">
          {allMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => handlePick(m)}
                className={`group rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded text-xs font-mono font-bold bg-black/85 text-amber-300 border border-white/15">
                    {m.duration}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {m.title}
                  </h2>
                  <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">{m.synopsis}</p>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>{m.credits.venue || "Midwest Arena"}</span>
                    <span>{m.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 57: Single-Row Carousel with Ambient Glow
// Large centered cinema screen + Strictly ONE single horizontal carousel row below
// =========================================================================
export function Layout57SingleRowAmbientCarousel({
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
  onOpenLightbox,
}: MediaLayoutProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scrollRow = (dir: "left" | "right") => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: dir === "left" ? -460 : 460,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Centered Master Video Screen */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-purple-400 font-bold uppercase tracking-wider">AMBIENT THEATER OPEN</span>
          <MediaFormatBadge item={activeItem} />
        </div>

        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-purple-500/40 bg-black shadow-[0_0_80px_rgba(168,85,247,0.2)]">
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
            onOpenLightbox={onOpenLightbox}
          />
        </div>

        <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl line-clamp-1">{activeItem.synopsis}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollRow("left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRow("right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Strictly ONE ROW Ambient Carousel */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          SINGLE ROW CAROUSEL ({allMedia.length} VIDEOS)
        </div>

        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory"
        >
          {allMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className={`flex-none w-[320px] sm:w-[440px] snap-start rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl group ${
                  isSelected
                    ? "border-purple-400 ring-4 ring-purple-400/30 scale-[1.02]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-xs font-mono bg-black/85 text-purple-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-bold text-white text-base group-hover:text-purple-300 truncate">
                    {m.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 58: Sidebar Accordion Single-Column
// Left collapsible single-column accordion list + Right large open video player
// =========================================================================
export function Layout58SidebarAccordionSingleColumn({
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
  onOpenLightbox,
}: MediaLayoutProps) {
  const [expandedId, setExpandedId] = useState<string | null>(activeItem.id);

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 40%: Single-Column Accordion List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest pb-2 border-b border-white/10">
            ACCORDION PLAYLIST — 1 COLUMN ({allMedia.length})
          </div>

          <div className="flex flex-col space-y-3">
            {allMedia.map((m) => {
              const isSelected = m.id === activeItem.id;
              const isExpanded = expandedId === m.id;
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border-2 transition-all duration-300 bg-zinc-950/90 overflow-hidden ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/30"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectItem(m);
                      setExpandedId(isExpanded ? null : m.id);
                      if (m.mediaFormat === "photo" && onOpenLightbox) {
                        onOpenLightbox(m);
                      }
                    }}
                    className="p-3.5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                        <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm group-hover:text-amber-300 truncate">
                          {m.title}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">{m.duration}</div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-white/10 bg-black/40 space-y-2">
                      <p className="text-xs text-zinc-300 leading-relaxed">{m.synopsis}</p>
                      <div className="text-[11px] font-mono text-zinc-400 flex justify-between">
                        <span>VENUE: {m.credits.venue || "Live"}</span>
                        <span>YEAR: {m.year}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 60%: Sticky Big Open Video Player */}
        <div className="lg:col-span-7 lg:sticky lg:top-32 space-y-4">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
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
              onOpenLightbox={onOpenLightbox}
            />
          </div>

          <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-3xl space-y-2">
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
            <div className="pt-3 border-t border-white/10 text-xs font-mono text-zinc-400 flex justify-between">
              <span>{activeItem.credits.venue || "Midwest Arena"}</span>
              <span className="text-amber-400">{activeItem.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 59: Horizontal Timeline Single-Row Track
// Era timeline on top (1977-2025) + Middle big open video + Bottom strictly ONE row
// =========================================================================
export function Layout59HorizontalTimelineSingleRow({
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
  onOpenLightbox,
}: MediaLayoutProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const rowRef = useRef<HTMLDivElement>(null);

  const years = useMemo(() => {
    const yList = Array.from(new Set(allMedia.map((m) => m.year))).sort((a, b) => b - a);
    return yList;
  }, [allMedia]);

  const displayedMedia = useMemo(() => {
    if (selectedYear === "all") return allMedia;
    return allMedia.filter((m) => m.year === selectedYear);
  }, [allMedia, selectedYear]);

  const scrollRow = (dir: "left" | "right") => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: dir === "left" ? -460 : 460,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Era Timeline Buttons */}
      <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedYear("all")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
            selectedYear === "all" ? "bg-amber-400 text-black shadow-lg" : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          All Eras ({allMedia.length})
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              selectedYear === y ? "bg-amber-400 text-black shadow-lg" : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Middle Big Open Video Stage */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
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
            onOpenLightbox={onOpenLightbox}
          />
        </div>

        <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-300 mt-1 line-clamp-1">{activeItem.synopsis}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollRow("left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRow("right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Strictly ONE ROW of Matching Era Videos */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          SINGLE ROW TIMELINE TRACK ({displayedMedia.length} VIDEOS)
        </div>

        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory"
        >
          {displayedMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className={`flex-none w-[320px] sm:w-[440px] snap-start rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl group ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-xs font-mono bg-black/85 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="font-bold text-white text-base group-hover:text-amber-300 truncate">
                    {m.title}
                  </div>
                  <div className="text-xs font-mono text-zinc-400">{m.year} • {m.credits.venue || "Live Stage"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 60: Ultimate Single-Column Master Suite
// Top grand cinema stage + pure 1-column vertical list with quick-filter pills
// =========================================================================
export function Layout60UltimateSingleColumnSuite({
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
  onOpenLightbox,
  onOpenSubmitModal,
}: MediaLayoutProps) {
  const [filterType, setFilterType] = useState<"all" | "concerts" | "fan" | "photos">("all");
  const topStageRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (filterType === "concerts") return allMedia.filter((m) => m.category === "Live Concerts" || m.category === "Medley Special");
    if (filterType === "fan") return allMedia.filter((m) => m.type === "fan" || m.category === "Fan Media");
    if (filterType === "photos") return allMedia.filter((m) => m.mediaFormat === "photo");
    return allMedia;
  }, [allMedia, filterType]);

  const handlePick = (m: (typeof allMedia)[0]) => {
    onSelectItem(m);
    if (m.mediaFormat === "photo" && onOpenLightbox) {
      onOpenLightbox(m);
    } else {
      topStageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-10">
      {/* Top Grand Cinema Stage */}
      <div ref={topStageRef} className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            PRESET 60 — ULTIMATE 1-COLUMN MASTER SUITE
          </span>
          <div className="flex items-center gap-3">
            <MediaFormatBadge item={activeItem} />
            {onOpenSubmitModal && (
              <button
                onClick={onOpenSubmitModal}
                className="px-3 py-1 rounded-xl bg-amber-400 text-black font-bold text-xs font-mono hover:bg-amber-300"
              >
                + SUBMIT MEDIA
              </button>
            )}
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
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
            onOpenLightbox={onOpenLightbox}
          />
        </div>

        <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-3xl backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-white">{activeItem.title}</h1>
            <span className="text-xs font-mono text-amber-300 font-bold px-3 py-1 bg-black/60 rounded-full border border-white/15">
              {activeItem.duration}
            </span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">&ldquo;{activeItem.synopsis}&rdquo;</p>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{activeItem.credits.venue || "Midwest Arena"}</span>
            <span>{activeItem.year} • {activeItem.category}</span>
          </div>
        </div>
      </div>

      {/* Filter Chips & Pure Single-Column Gallery */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                filterType === "all" ? "bg-amber-400 text-black font-bold shadow-lg" : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              All ({allMedia.length})
            </button>
            <button
              onClick={() => setFilterType("concerts")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                filterType === "concerts" ? "bg-amber-400 text-black font-bold shadow-lg" : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              Concerts
            </button>
            <button
              onClick={() => setFilterType("fan")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                filterType === "fan" ? "bg-amber-400 text-black font-bold shadow-lg" : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              Fan Vault
            </button>
            <button
              onClick={() => setFilterType("photos")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                filterType === "photos" ? "bg-amber-400 text-black font-bold shadow-lg" : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              Photos
            </button>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            SHOWING {filtered.length} OF {allMedia.length} (NO 2-COLUMN)
          </span>
        </div>

        {/* Pure Single-Column Feed */}
        <div className="flex flex-col space-y-6">
          {filtered.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => handlePick(m)}
                className={`group rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl flex flex-col md:flex-row items-stretch ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
                }`}
              >
                <div className="relative w-full md:w-1/2 aspect-video overflow-hidden bg-black shrink-0">
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-black/85 text-amber-300 border border-white/15">
                    {m.duration}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-2 bg-zinc-950/60">
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">{m.synopsis}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>{m.credits.venue || "Midwest Arena"}</span>
                    <span>{m.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 61: JJettas Signature Moments [Athletic Arena & Gold Foil Cards]
// Directly inspired by jjettas.com: Colossal watermarked purple 'SIGNATURE MOMENTS'
// title + floating 3D metallic gold foil cards + stadium yard markers.
// =========================================================================
export function Layout61JJettasSignatureMoments({
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
  const [viewMode, setViewMode] = useState<"grid" | "deck">("grid");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainStageRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (selectedFilter === "Videos") return allMedia.filter((m) => m.mediaFormat === "video");
    if (selectedFilter === "Photos") return allMedia.filter((m) => m.mediaFormat === "photo");
    if (selectedFilter === "Medley") return allMedia.filter((m) => m.category === "Medley Special");
    return allMedia;
  }, [allMedia, selectedFilter]);

  const handlePick = (item: (typeof allMedia)[0]) => {
    onSelectItem(item);
    if (item.mediaFormat === "photo" && onOpenLightbox) {
      onOpenLightbox(item);
    } else {
      mainStageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  // Card rotational tilts inspired by jjettas.com
  const tilts = [
    "-rotate-2 hover:rotate-0",
    "rotate-1 hover:rotate-0",
    "-rotate-1 hover:rotate-0",
    "rotate-2 hover:rotate-0",
    "-rotate-2 hover:rotate-0",
  ];

  return (
    <div className="relative w-full min-h-screen text-white pt-24 sm:pt-28 lg:pt-32 pb-24 overflow-hidden bg-transparent">
      {/* Background Colossal Watermarked Title (Fixed in background behind video grid, over live video blur) */}
      <div className="pointer-events-none select-none fixed top-24 sm:top-28 inset-x-0 z-0 flex items-center justify-center overflow-hidden opacity-80 py-4">
        <h2
          data-no-text-anim="true"
          className="font-[family-name:var(--font-anton)] font-normal uppercase tracking-[-0.03em] text-[13vw] sm:text-[15vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#8b5cf6] via-[#4f2bab] to-transparent drop-shadow-[0_12px_60px_rgba(79,43,171,0.6)] whitespace-nowrap text-center"
        >
          SIGNATURE MOMENTS
        </h2>
      </div>

      {/* Cinematic Analog Noise & Film Grain Overlay over the text and page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -inset-[50%] w-[200%] h-[200%] z-[1] bg-film-noise animate-film-grain opacity-30 mix-blend-overlay select-none"
      />

      {/* Foreground Content: Header, Filters, View Switcher & Large Video Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        {/* Top Header Deck Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl mb-8">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-[#eeac1a]">
              COLLECTIBLE CARD DECK
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono text-zinc-300 font-bold">
              {filtered.length} MOMENTS
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {["All", "Medley", "Videos", "Photos"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? "bg-[#eeac1a] text-[#171220] shadow-[0_0_15px_rgba(238,172,26,0.4)] font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Large Grid vs Horizontal Deck */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="View as Large Grid of Videos"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Large Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("deck")}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "deck"
                    ? "bg-purple-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="View as Single-Row Carousel Deck"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Carousel Deck</span>
              </button>
            </div>

            {viewMode === "deck" && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Mode 1: LARGE GRID OF VIDEOS (Matching User Screenshot & Request) */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pb-16 pt-2">
            {filtered.map((item, idx) => {
              const isSelected = item.id === activeItem.id;
              const tiltClass = tilts[idx % tilts.length];

              return (
                <div
                  key={item.id}
                  onClick={() => handlePick(item)}
                  className={`group relative w-full cursor-pointer transition-all duration-300 ease-out ${tiltClass} ${
                    isSelected ? "scale-105 z-10" : "hover:scale-[1.03] hover:-translate-y-2 hover:z-10"
                  }`}
                >
                  {/* Metallic Gold Foil Card Frame */}
                  <div
                    className={`relative rounded-2xl p-[3px] transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-b from-[#fef08a] via-[#eeac1a] to-[#b45309] shadow-[0_20px_50px_rgba(238,172,26,0.55),0_0_35px_rgba(238,172,26,0.35)] ring-2 ring-[#eeac1a]"
                        : "bg-gradient-to-b from-[#fde68a] via-[#eeac1a] to-[#78350f] shadow-[0_15px_40px_rgba(0,0,0,0.85)] group-hover:shadow-[0_25px_60px_rgba(238,172,26,0.4)]"
                    }`}
                  >
                    {/* Inner Card Artwork */}
                    <div className="relative rounded-[13px] overflow-hidden bg-black aspect-[1036/1519]">
                      <img
                        src={thumbFor(item)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <MediaFormatBadge item={item} />
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-black/85 text-[#eeac1a] border border-[#eeac1a]/50">
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                      </div>

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                        <div className="w-14 h-14 rounded-full bg-[#eeac1a] text-[#171220] flex items-center justify-center font-bold shadow-[0_0_25px_rgba(238,172,26,0.7)] transform group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                      </div>

                      {/* Bottom Venue & Duration */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span className="font-bold text-white truncate max-w-[130px]">
                          {item.credits.venue || "Arena Stage"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/75 text-amber-300 font-bold border border-white/10">
                          {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Metadata Below */}
                  <div className="pt-3.5 px-1 space-y-1 text-center">
                    <h4 className="font-black text-sm uppercase tracking-wider text-white group-hover:text-[#eeac1a] transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#f4efe6]/75">
                      {item.category === "Medley Special"
                        ? "30 SONGS • 30 MIN • 20,000 FANS"
                        : `${item.year} • ${item.credits.format || "4K CAPTURE"}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: Horizontal Carousel Deck Strip */
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-6 sm:gap-8 overflow-x-auto pb-12 pt-4 px-3 custom-scrollbar snap-x snap-mandatory"
          >
            {filtered.map((item, idx) => {
              const isSelected = item.id === activeItem.id;
              const tiltClass = tilts[idx % tilts.length];

              return (
                <div
                  key={item.id}
                  onClick={() => handlePick(item)}
                  className={`group relative shrink-0 w-60 sm:w-68 cursor-pointer transition-all duration-500 ease-out snap-center ${tiltClass} ${
                    isSelected ? "scale-105" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`relative rounded-2xl p-[3px] transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-b from-[#fef08a] via-[#eeac1a] to-[#b45309] shadow-[0_20px_50px_rgba(238,172,26,0.45),0_0_35px_rgba(238,172,26,0.35)] ring-2 ring-[#eeac1a]"
                        : "bg-gradient-to-b from-[#fde68a] via-[#eeac1a] to-[#78350f] shadow-[0_15px_40px_rgba(0,0,0,0.9)] group-hover:shadow-[0_20px_50px_rgba(238,172,26,0.3)]"
                    }`}
                  >
                    <div className="relative rounded-[13px] overflow-hidden bg-black aspect-[1036/1519]">
                      <img
                        src={thumbFor(item)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <MediaFormatBadge item={item} />
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-black/85 text-[#eeac1a] border border-[#eeac1a]/50">
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                        <div className="w-14 h-14 rounded-full bg-[#eeac1a] text-[#171220] flex items-center justify-center font-bold shadow-[0_0_25px_rgba(238,172,26,0.7)] transform group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span className="font-bold text-white truncate max-w-[130px]">
                          {item.credits.venue || "Arena Stage"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/75 text-amber-300 font-bold border border-white/10">
                          {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 px-1 space-y-1 text-center">
                    <h4 className="font-black text-sm uppercase tracking-wider text-white group-hover:text-[#eeac1a] transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#f4efe6]/65">
                      {item.category === "Medley Special"
                        ? "30 SONGS • 30 MIN • 20,000 FANS"
                        : `${item.year} • ${item.credits.format || "4K CAPTURE"}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Cinema Theater Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10 pt-4">
        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 border-y border-white/10 py-3">
          {["All", "Medley", "Videos", "Photos"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedFilter === cat
                  ? "bg-[#eeac1a] text-[#171220] shadow-[0_0_15px_rgba(238,172,26,0.4)] font-black"
                  : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Center Arena Cinema Screen with Gold Bezel Frame */}
        <div ref={mainStageRef} className="space-y-6">
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

          {/* Active Moment Info Bar in Athletic Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-[#eeac1a]">
                  {activeItem.category} • {activeItem.year}
                </span>
                <span className="text-zinc-600">/</span>
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                  DURATION: {activeItem.duration}
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none">
                {activeItem.title}
              </h3>
              <p className="text-sm sm:text-base text-[#f4efe6]/80 leading-relaxed font-normal">
                {activeItem.synopsis}
              </p>
            </div>

            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 space-y-3">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#eeac1a] block">
                ARENA CREDITS & SPECS
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-zinc-500 uppercase">ARTIST</span>
                  <span className="text-white font-bold">7th Heaven</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-zinc-500 uppercase">VENUE</span>
                  <span className="text-[#eeac1a] font-bold">{activeItem.credits.venue || "Soldier Field Circuit"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-zinc-500 uppercase">FORMAT</span>
                  <span className="text-zinc-300">{activeItem.credits.format || "4K Master"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-500 uppercase">AUDIO</span>
                  <span className="text-zinc-300">{activeItem.credits.audio || "Arena 24-Bit"}</span>
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
        </div>

        {/* Stadium Yard Markers (jjettas.com athletic field aesthetic) */}
        <div className="relative border-t border-white/10 pt-8 pb-4">
          <div className="flex items-center justify-between text-zinc-600 font-mono text-xl sm:text-2xl font-black select-none opacity-40">
            <span>10</span>
            <div className="w-px h-4 bg-white/10" />
            <span>20</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[#eeac1a] opacity-80">30</span>
            <div className="w-px h-4 bg-white/10" />
            <span>40</span>
            <div className="w-px h-4 bg-white/10" />
            <span>50</span>
          </div>
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mt-4">
            7TH HEAVEN ARCHIVAL ARENA CIRCUIT • ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

