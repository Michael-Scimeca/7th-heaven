/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Tv,
  Film,
  Camera,
  Layers,
  Search,
  Filter,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 21: Giant Cinema Wall Grid (Huge 2-Column Cards)
// Two massive columns of huge 16:9 video cards (600px+ wide) with sticky
// spotlight player stage, instant hover preview, duration pills, and one-click play.
// =========================================================================
export function Layout21CinemaWallGrid({
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
  const [filterMode, setFilterMode] = useState<"all" | "video" | "photo">("all");
  const filtered = allMedia.filter((m) => {
    if (filterMode === "video") return m.mediaFormat !== "photo";
    if (filterMode === "photo") return m.mediaFormat === "photo";
    return true;
  });

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-20 px-4 sm:px-8 space-y-8 custom-scrollbar">
      {/* Top Active Cinema Stage */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-black/60 border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="lg:col-span-8">
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
            aspectClass="aspect-video"
            className="rounded-2xl border border-white/20 shadow-2xl"
          />
        </div>
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-2">
            <MediaFormatBadge item={activeItem} />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-600/30 text-purple-200 border border-purple-400/30">
              {activeItem.category} • {activeItem.year}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {activeItem.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
            {activeItem.synopsis}
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
            <span>VENUE: <strong className="text-white">{activeItem.credits.venue || "Live Stage"}</strong></span>
            <span className="text-amber-300 font-bold">{activeItem.duration}</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Bar for Rapid Picking */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>Giant Cinema Wall</span>
            <span className="text-xs font-mono text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
              {filtered.length} Mega Thumbnails
            </span>
          </h2>
          <p className="text-xs text-zinc-400">Large format video cards for effortless scanning and picking</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterMode === "all" ? "bg-white text-black font-extrabold shadow" : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            All Media ({allMedia.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("video")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterMode === "video" ? "bg-purple-600 text-white font-extrabold shadow" : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            Videos Only
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("photo")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterMode === "photo" ? "bg-emerald-600 text-white font-extrabold shadow" : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            Photos Only
          </button>
        </div>
      </div>

      {/* Massive 2-Column Video Grid with Giant Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {filtered.map((m) => {
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
              className={`group relative rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/60 shadow-2xl ${
                isSelected
                  ? "border-amber-400 ring-4 ring-amber-400/25 scale-[1.01]"
                  : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
              }`}
            >
              {/* Giant 16:9 Thumbnail Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img
                  src={thumbFor(m)}
                  alt={m.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <MediaFormatBadge item={m} />
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/80 backdrop-blur-md text-amber-300 border border-white/20 shadow">
                    {m.duration}
                  </span>
                </div>

                {/* Hover Play / View Glow Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs z-10">
                  <span className="p-4 rounded-full bg-amber-400 text-black shadow-[0_0_30px_rgba(251,191,36,0.8)] transform scale-90 group-hover:scale-100 transition-transform">
                    {m.mediaFormat === "photo" ? <Maximize2 className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
                  </span>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="text-purple-300 font-bold uppercase">{m.category}</span>
                  <span>{m.year}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                  {m.synopsis}
                </p>
                <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
                  <span>{m.credits.venue || "Midwest Stage"}</span>
                  {m.credits.fanName && (
                    <span className="text-amber-300 font-bold">By {m.credits.fanName}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 22: Netflix-Style Multi-Row Shelves (Giant Horizontal Carousels)
// Grouped by categories with huge 420px wide cards per row and snapping sliders.
// =========================================================================
export function Layout22NetflixShelves({
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
  const shelf1Ref = useRef<HTMLDivElement>(null);
  const shelf2Ref = useRef<HTMLDivElement>(null);
  const shelf3Ref = useRef<HTMLDivElement>(null);

  const scrollShelf = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    if (ref.current) {
      const offset = dir === "left" ? -500 : 500;
      ref.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const concerts = allMedia.filter((m) => m.type === "band");
  const fanMedia = allMedia.filter((m) => m.type === "fan");
  const photos = allMedia.filter((m) => m.mediaFormat === "photo");

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-12 custom-scrollbar">
      {/* Hero Cinema Backdrop Preview */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
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
              aspectClass="aspect-video"
              className="rounded-2xl border border-white/20"
            />
          </div>
          <div className="lg:col-span-4 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              NOW SPOTLIGHTED
            </span>
            <h1 className="text-3xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
            <div className="text-xs font-mono text-zinc-400 pt-2 border-t border-white/10 flex items-center justify-between">
              <span>{activeItem.category}</span>
              <span className="text-white font-bold">{activeItem.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Official 4K Concert Vault (Giant 420px Cards) */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            <span>Official 4K Concert Masters</span>
            <span className="text-xs font-mono text-zinc-400 font-normal">({concerts.length} Videos)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollShelf(shelf1Ref, "left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollShelf(shelf1Ref, "right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={shelf1Ref}
          className="flex items-center gap-5 overflow-x-auto custom-scrollbar pb-3"
        >
          {concerts.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => onSelectItem(m)}
                className={`relative shrink-0 w-80 sm:w-96 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/70 ${
                  isSelected
                    ? "border-purple-400 ring-4 ring-purple-400/30 scale-102 shadow-2xl"
                    : "border-white/15 hover:border-white/40 hover:scale-102"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="font-bold text-white text-base truncate">{m.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{m.credits.venue || "Arena Stage"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Front-Row Fan Media (Giant 420px Cards) */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <span>Front-Row Fan Media & Crowd Cams</span>
            <span className="text-xs font-mono text-zinc-400 font-normal">({fanMedia.length} Clips)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollShelf(shelf2Ref, "left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollShelf(shelf2Ref, "right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={shelf2Ref}
          className="flex items-center gap-5 overflow-x-auto custom-scrollbar pb-3"
        >
          {fanMedia.map((m) => {
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
                className={`relative shrink-0 w-80 sm:w-96 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/70 ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102 shadow-2xl"
                    : "border-white/15 hover:border-white/40 hover:scale-102"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="font-bold text-white text-base truncate">{m.title}</div>
                  <div className="text-xs text-amber-300 font-mono">By {m.credits.fanName || "Fan"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Live Community Photo Wall (Giant Cards) */}
      {photos.length > 0 && (
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Concert Photography Lightbox Gallery</span>
              <span className="text-xs font-mono text-zinc-400 font-normal">({photos.length} Stills)</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollShelf(shelf3Ref, "left")}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollShelf(shelf3Ref, "right")}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={shelf3Ref}
            className="flex items-center gap-5 overflow-x-auto custom-scrollbar pb-3"
          >
            {photos.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onSelectItem(m);
                  if (onOpenLightbox) onOpenLightbox(m);
                }}
                className="relative shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden border-2 border-white/15 hover:border-emerald-400 transition-all duration-300 cursor-pointer bg-black/70 hover:scale-102 shadow-xl"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                </div>
                <div className="p-3 space-y-0.5">
                  <div className="font-bold text-white text-sm truncate">{m.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{m.credits.venue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// LAYOUT 23: Spotlight Marquee Picker with Super-Wide Cards
// Snapping horizontal ribbon with extra-large 21:9 & 16:9 cards, live filter chips.
// =========================================================================
export function Layout23SpotlightMarquee({
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
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const tags = ["All", "Arena Medley", "Official Concert", "Fan Media", "Live Festival"];

  const filteredMedia = allMedia.filter((m) => {
    if (selectedTag === "All") return true;
    if (selectedTag === "Arena Medley") return m.title.toLowerCase().includes("medley") || m.title.includes("30 Songs");
    if (selectedTag === "Official Concert") return m.type === "band";
    if (selectedTag === "Fan Media") return m.type === "fan";
    if (selectedTag === "Live Festival") return m.credits.venue?.toLowerCase().includes("fest") || m.title.toLowerCase().includes("fest");
    return true;
  });

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-20 px-4 sm:px-8 space-y-8 custom-scrollbar">
      {/* Top Spotlight Cinema Screen */}
      <div className="max-w-6xl mx-auto space-y-4">
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
          aspectClass="aspect-video sm:aspect-[21/9]"
          className="rounded-3xl border border-white/25 shadow-2xl"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <MediaFormatBadge item={activeItem} />
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeItem.title}</h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">{activeItem.synopsis}</p>
          </div>
          <div className="font-mono text-xs text-amber-300 shrink-0 font-bold">
            {activeItem.duration} • {activeItem.year}
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 border-b border-white/15 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTag(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                selectedTag === t
                  ? "bg-amber-400 text-black shadow-lg scale-105"
                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-zinc-400 shrink-0 hidden sm:inline">
          {filteredMedia.length} Tracks
        </span>
      </div>

      {/* Super-Wide Snapping Marquee Ribbon */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div
          ref={marqueeRef}
          className="flex items-center gap-6 overflow-x-auto custom-scrollbar pb-4"
        >
          {filteredMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className={`relative shrink-0 w-80 sm:w-[440px] aspect-[16/10] rounded-3xl overflow-hidden border-2 transition-all duration-300 text-left cursor-pointer shadow-2xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102"
                    : "border-white/15 opacity-75 hover:opacity-100 hover:scale-102 hover:border-white/40"
                }`}
              >
                <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />
                <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                <div className="absolute top-3 right-3 font-mono text-xs font-bold text-amber-300 bg-black/70 px-2.5 py-1 rounded-full border border-white/20">
                  {m.duration}
                </div>
                <div className="absolute bottom-4 inset-x-4 space-y-1">
                  <div className="text-xs font-mono text-purple-300">{m.category}</div>
                  <div className="text-lg sm:text-xl font-black text-white truncate">{m.title}</div>
                  <div className="text-xs text-zinc-300 line-clamp-1">{m.synopsis}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 24: Split Video Browser & Massive Two-Column Catalog
// Left sticky cinema player with lyrics/specs; Right pane is a huge scrolling catalog.
// =========================================================================
export function Layout24SplitBrowserGiantCatalog({
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
  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col lg:flex-row overflow-hidden pt-28 sm:pt-32">
      {/* Left 45%: Sticky Master Cinema Stage */}
      <div className="w-full lg:w-[45%] h-auto lg:h-full p-6 sm:p-8 flex flex-col justify-center space-y-5 border-b lg:border-b-0 lg:border-r border-white/15 bg-black/80 backdrop-blur-2xl">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-white font-bold tracking-widest uppercase">ACTIVE STAGE FEED</span>
            <MediaFormatBadge item={activeItem} />
          </div>
          <span className="text-amber-300 font-bold">{activeItem.duration}</span>
        </div>

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
          aspectClass="aspect-video"
          className="rounded-3xl border border-white/25 shadow-2xl"
        />

        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
          <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
          <div className="pt-2 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
            <span>VENUE: <strong className="text-white">{activeItem.credits.venue || "Stage Capture"}</strong></span>
            <span>YEAR: <strong className="text-white">{activeItem.year}</strong></span>
          </div>
        </div>
      </div>

      {/* Right 55%: Massive Two-Column Video Catalog */}
      <div className="w-full lg:w-[55%] h-auto lg:h-full overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Mega Video Catalog</span>
          </h2>
          <span className="text-xs font-mono text-amber-300 font-bold">
            {allMedia.length} Tracks Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {allMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left cursor-pointer bg-black/60 shadow-xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102"
                    : "border-white/10 hover:border-white/30 hover:scale-101"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <div className="font-extrabold text-sm sm:text-base text-white truncate">{m.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{m.credits.venue || m.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 25: Full-Width Video Billboard Stack
// Cinematic full-width billboard cards spanning viewport width with rich metadata.
// =========================================================================
export function Layout25BillboardStack({
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
  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 lg:px-12 space-y-12 custom-scrollbar">
      {/* Sticky Spotlight Mini Player for Persistent Playback */}
      <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white uppercase">PRIMARY BILLBOARD STAGE</span>
            <MediaFormatBadge item={activeItem} />
          </div>
          <span className="text-amber-300 font-bold">{activeItem.duration}</span>
        </div>

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
          aspectClass="aspect-video"
          className="rounded-2xl border border-white/20"
        />

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white">{activeItem.title}</h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto">{activeItem.synopsis}</p>
        </div>
      </div>

      {/* Full-Width Billboard Stack (Each Card Massive) */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-white/15 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-amber-300">
            Cinematic Billboard Stack ({allMedia.length} Tracks)
          </h2>
          <span className="text-xs font-mono text-zinc-400">Click Any Billboard to Play</span>
        </div>

        {allMedia.map((m, idx) => {
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
              className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-2xl ${
                isSelected
                  ? "border-amber-400 ring-4 ring-amber-400/25 scale-[1.01]"
                  : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
              }`}
            >
              {/* Massive Panoramic Thumbnail Banner */}
              <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-neutral-900">
                <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-black/80 text-zinc-400 border border-white/20">
                    #{idx + 1}
                  </span>
                  <MediaFormatBadge item={m} />
                </div>
                <div className="absolute top-4 right-4 z-10 font-mono text-xs font-bold text-amber-300 bg-black/80 px-3 py-1 rounded-full border border-white/20">
                  {m.duration}
                </div>

                {/* Left Content Banner */}
                <div className="absolute bottom-4 left-6 max-w-lg space-y-1.5 z-10">
                  <div className="text-xs font-mono text-purple-300 font-bold">{m.category} • {m.year}</div>
                  <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">{m.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2">{m.synopsis}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
