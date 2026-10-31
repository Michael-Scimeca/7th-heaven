/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Sparkles,
  Maximize2,
  Film,
  Camera,
  Grid,
  List,
  Layers,
  CheckCircle,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 36: Filter Deck Cinema
// High-speed interactive filter bar (search, category pills, format toggles)
// with sticky cinema preview and oversized 2/3-column cards.
// =========================================================================
export function Layout36FilterDeckCinema({
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<"all" | "video" | "photo">("all");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allMedia.map((m) => m.category)));
    return ["all", ...cats];
  }, [allMedia]);

  const filteredMedia = useMemo(() => {
    return allMedia.filter((m) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.credits.venue && m.credits.venue.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
      const matchesFormat = selectedFormat === "all" || m.mediaFormat === selectedFormat;
      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [allMedia, searchQuery, selectedCategory, selectedFormat]);

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Top Filter & Search Control Deck */}
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-zinc-950/80 border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" /> High-Speed Video Filter Deck
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rapid Catalog Discovery
            </h1>
          </div>

          {/* Live Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search songs, venues, eras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/20 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick-Filter Pills & Format Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                    : "bg-white/5 text-zinc-300 hover:bg-white/15"
                }`}
              >
                {cat === "all" ? "All Tracks" : cat}
              </button>
            ))}
          </div>

          {/* Format Toggle */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setSelectedFormat("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                selectedFormat === "all" ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({allMedia.length})
            </button>
            <button
              onClick={() => setSelectedFormat("video")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
                selectedFormat === "video" ? "bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold" : "text-zinc-400 hover:text-rose-300"
              }`}
            >
              <Film className="w-3 h-3" /> Videos
            </button>
            <button
              onClick={() => setSelectedFormat("photo")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
                selectedFormat === "photo" ? "bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold" : "text-zinc-400 hover:text-sky-300"
              }`}
            >
              <Camera className="w-3 h-3" /> Photos
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split Spotlight Preview + Giant Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Left Cinema Preview (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-4">
          <div className="bg-zinc-950/80 border border-white/15 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ACTIVE PREVIEW
              </span>
              <MediaFormatBadge item={activeItem} />
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-inner">
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

            <div className="space-y-2">
              <div className="text-xl font-black text-white leading-tight">{activeItem.title}</div>
              <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">{activeItem.synopsis}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono text-zinc-400 border-t border-white/10">
                <div>Venue: <span className="text-white">{activeItem.credits.venue || "Midwest Arena"}</span></div>
                <div>Year: <span className="text-white">{activeItem.year}</span></div>
                <div>Category: <span className="text-amber-300">{activeItem.category}</span></div>
                <div>Duration: <span className="text-white">{activeItem.duration}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Catalog: Oversized 2-Column Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/10">
            <span>SHOWING {filteredMedia.length} OF {allMedia.length} MEDIA ITEMS</span>
            {selectedCategory !== "all" && <span className="text-amber-400">FILTER: {selectedCategory.toUpperCase()}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredMedia.map((m) => {
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
                  className={`group relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-900/80 shadow-xl ${
                    isSelected
                      ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                      : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                  }`}
                >
                  {/* Oversized 16:10 Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Top badges */}
                    <div className="absolute top-3 left-3 z-10">
                      <MediaFormatBadge item={m} />
                    </div>

                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black/85 text-amber-300 border border-white/15">
                      {m.duration}
                    </span>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-1.5">
                    <div className="font-bold text-white text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                      {m.title}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {m.synopsis}
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
                      <span className="truncate max-w-[140px]">{m.credits.venue || "Live Stage"}</span>
                      <span className="text-zinc-400 font-bold">{m.year}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 37: Multiview Mosaic Showcase
// 3 Large Hero Showcase Quadrants at the top + Massive bottom snapping picker track (440px wide cards)
// =========================================================================
export function Layout37MultiviewMosaic({
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
  const pickerRef = useRef<HTMLDivElement>(null);

  const scrollPicker = (dir: "left" | "right") => {
    if (pickerRef.current) {
      pickerRef.current.scrollBy({
        left: dir === "left" ? -460 : 460,
        behavior: "smooth",
      });
    }
  };

  // Top 3 featured spotlight items
  const featuredThree = useMemo(() => {
    const list = [activeItem];
    for (const m of allMedia) {
      if (list.length >= 3) break;
      if (!list.some((item) => item.id === m.id)) {
        list.push(m);
      }
    }
    return list;
  }, [activeItem, allMedia]);

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" /> Multiview Mosaic Stage
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Synchronized Showcase & Mega-Cards
          </h1>
          <div className="text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            {allMedia.length} Tracks In Vault
          </div>
        </div>
      </div>

      {/* Top 3 Featured Showcase Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {featuredThree.map((item, idx) => {
          const isActive = item.id === activeItem.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 bg-zinc-950/90 shadow-2xl flex flex-col ${
                isActive
                  ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                  : "border-white/15 hover:border-white/40 cursor-pointer"
              }`}
            >
              {/* Header badge */}
              <div className="p-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {idx === 0 ? "★ PRIMARY LIVE STAGE" : `PREVIEW FEED 0${idx + 1}`}
                </span>
                <MediaFormatBadge item={item} />
              </div>

              {/* Video or Big Thumbnail */}
              <div className="relative aspect-video w-full bg-black">
                {isActive ? (
                  <MediaCinemaPlayer
                    item={item}
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
                ) : (
                  <div className="relative w-full h-full group">
                    <img
                      src={thumbFor(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-4 py-2 bg-amber-400 text-black font-bold text-xs rounded-full flex items-center gap-1.5 shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current" /> Switch to Feed
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300">
                      {item.duration}
                    </span>
                  </div>
                )}
              </div>

              {/* Info footer */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-base font-black text-white line-clamp-1">{item.title}</div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{item.synopsis}</p>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/10 flex justify-between">
                  <span>{item.credits.venue || "Midwest Arena"}</span>
                  <span>{item.year}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Mega Picker Roller Track (440px wide cards) */}
      <div className="max-w-7xl mx-auto space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" /> Giant Video Selection Deck
            </h2>
            <p className="text-xs text-zinc-400">Click any card to load into the primary stage</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollPicker("left")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollPicker("right")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={pickerRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x snap-mandatory"
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
                className={`flex-none w-[360px] sm:w-[440px] snap-start rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/80 shadow-2xl group ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
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
                <div className="p-4 space-y-1.5">
                  <div className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{m.synopsis}</p>
                  <div className="pt-2 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
                    <span className="truncate">{m.credits.venue || "Midwest Arena"}</span>
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
// LAYOUT 38: Magazine Lookbook with Full-Bleed Cards
// High-fashion editorial lookbook layout with oversized panoramic 21:9 & 16:9 cards,
// bold typography, and category tabs for effortless selection across dozens of videos.
// =========================================================================
export function Layout38MagazineLookbook({
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
  const [activeTab, setActiveTab] = useState<string>("all");

  const categories = useMemo(() => {
    const list = Array.from(new Set(allMedia.map((m) => m.category)));
    return ["all", ...list];
  }, [allMedia]);

  const displayedMedia = useMemo(() => {
    if (activeTab === "all") return allMedia;
    return allMedia.filter((m) => m.category === activeTab);
  }, [allMedia, activeTab]);

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-10">
      {/* Magazine Editorial Masthead */}
      <div className="max-w-7xl mx-auto border-b border-white/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold">
            ISSUE N° 38 — RETROSPECTIVE
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
            The Midwest Chronicles
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Live archives, front-row perspectives, and backstage memories curated in oversized format.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const count = cat === "all" ? allMedia.length : allMedia.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all ${
                  activeTab === cat
                    ? "bg-white text-black font-bold shadow-lg"
                    : "bg-white/10 text-zinc-300 hover:bg-white/20"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Master Hero Banner */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border-2 border-white/20 bg-zinc-950/90 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 relative aspect-video bg-black">
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
          <div className="lg:col-span-4 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2"><MediaFormatBadge item={activeItem} /></div>
            <div className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {activeItem.title}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              &ldquo;{activeItem.synopsis}&rdquo;
            </p>
            <div className="pt-4 border-t border-white/10 space-y-1 text-xs font-mono text-zinc-400">
              <div>LOCATION: <span className="text-white">{activeItem.credits.venue || "Midwest Festival"}</span></div>
              <div>YEAR: <span className="text-white">{activeItem.year}</span></div>
              <div>CATEGORY: <span className="text-amber-400">{activeItem.category}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Giant Staggered Lookbook Grid */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          CURATED LOOKBOOK TILES ({displayedMedia.length} ITEMS)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedMedia.map((m, idx) => {
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
                className={`group rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/80 shadow-2xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
                }`}
              >
                {/* 16:9 Oversized Showcase */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded text-xs font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-2xl">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Typography Block */}
                <div className="p-6 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-bold tracking-widest uppercase">
                    ENTRY #{idx + 1} • {m.category}
                  </div>
                  <div className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {m.title}
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                    {m.synopsis}
                  </p>
                  <div className="pt-3 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
                    <span>{m.credits.venue || "Midwest Stage"}</span>
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
// LAYOUT 39: Video Wall Matrix
// 2-row × 3-column matrix of massive video cards with minimal chrome,
// deck switching (Deck 1: 1-6, Deck 2: 7-12, etc.) and fast selection.
// =========================================================================
export function Layout39VideoWallMatrix({
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
  const [currentDeck, setCurrentDeck] = useState(0);
  const pageSize = 6;
  const totalDecks = Math.ceil(allMedia.length / pageSize);

  const currentMediaBatch = useMemo(() => {
    const start = currentDeck * pageSize;
    return allMedia.slice(start, start + pageSize);
  }, [allMedia, currentDeck, pageSize]);

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-6">
      {/* Control Header & Deck Navigator */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl bg-zinc-950/80 border border-white/15 p-4 sm:p-6 rounded-3xl shadow-2xl">
        <div>
          <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold flex items-center gap-2">
            <Grid className="w-3.5 h-3.5" /> 6-Tile Mega Video Wall
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            High-Impact Video Matrix
          </h1>
        </div>

        {/* Deck Switcher Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDeck((prev) => Math.max(0, prev - 1))}
            disabled={currentDeck === 0}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev Deck
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalDecks }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentDeck(i)}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                  currentDeck === i
                    ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30"
                    : "bg-white/5 text-zinc-400 hover:bg-white/15"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentDeck((prev) => Math.min(totalDecks - 1, prev + 1))}
            disabled={currentDeck >= totalDecks - 1}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1 transition-colors"
          >
            Next Deck <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2x3 Giant Matrix Tiles */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentMediaBatch.map((m) => {
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
              className={`group relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-black shadow-2xl flex flex-col ${
                isSelected
                  ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                  : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
              }`}
            >
              {/* Massive 16:9 Thumbnail or Cinema Player if selected and playing */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                {isSelected && isPlaying ? (
                  <MediaCinemaPlayer
                    item={m}
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
                ) : (
                  <>
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Top Format Badge */}
                    <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>

                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-black/85 text-amber-300">
                      {m.duration}
                    </span>

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="p-4 bg-zinc-950/90 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="font-bold text-white text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {m.synopsis}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
                  <span className="truncate">{m.credits.venue || "Midwest Arena"}</span>
                  <span className="text-amber-400 font-bold">{m.category}</span>
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
// LAYOUT 40: Ultimate Showcase & Discovery Deck
// The grand finale: top full-width floating cinema stage + multi-lane infinite big-card ribbon
// with format badges, quick search, and fan submission access.
// =========================================================================
export function Layout40UltimateShowcase({
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
  const [activeLane, setActiveLane] = useState<"all" | "concerts" | "fan" | "photos">("all");
  const ribbonRef = useRef<HTMLDivElement>(null);

  const scrollRibbon = (dir: "left" | "right") => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollBy({
        left: dir === "left" ? -480 : 480,
        behavior: "smooth",
      });
    }
  };

  const laneItems = useMemo(() => {
    if (activeLane === "concerts") return allMedia.filter((m) => m.category === "Live Concerts" || m.category === "Medley Special");
    if (activeLane === "fan") return allMedia.filter((m) => m.type === "fan" || m.category === "Fan Media");
    if (activeLane === "photos") return allMedia.filter((m) => m.mediaFormat === "photo");
    return allMedia;
  }, [allMedia, activeLane]);

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Top Grand Finale Spotlight Stage */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border-2 border-white/20 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> PRESET 40 — ULTIMATE SHOWCASE STAGE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {activeItem.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <MediaFormatBadge item={activeItem} />
            {onOpenSubmitModal && (
              <button
                onClick={onOpenSubmitModal}
                className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-400/20"
              >
                + SUBMIT MEDIA
              </button>
            )}
          </div>
        </div>

        {/* Video Player & Synchronized Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-8 relative aspect-video bg-black">
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

          <div className="lg:col-span-4 p-6 flex flex-col justify-between space-y-4 bg-zinc-950/80 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-400">ARCHIVAL LINER NOTES</span>
              <p className="text-sm text-zinc-300 leading-relaxed italic">
                &ldquo;{activeItem.synopsis}&rdquo;
              </p>
              
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>VENUE</span>
                  <span className="text-white font-bold">{activeItem.credits.venue || "Midwest Arena"}</span>
                </div>
                <div className="flex justify-between">
                  <span>YEAR</span>
                  <span className="text-white font-bold">{activeItem.year}</span>
                </div>
                <div className="flex justify-between">
                  <span>RECORDED BY</span>
                  <span className="text-amber-400">{activeItem.credits.fanName || activeItem.credits.artist || "Official Production"}</span>
                </div>
                <div className="flex justify-between">
                  <span>AUDIO MIX</span>
                  <span className="text-white">{activeItem.credits.audio || activeItem.credits.format || "24-bit / 96kHz Master"}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 flex items-center justify-between">
              <span>ACTIVE TRACK DURATION</span>
              <span className="text-amber-300 font-bold">{activeItem.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Lane Discovery Deck with 450px Wide Cards */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Lane Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveLane("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-mono transition-all ${
                activeLane === "all"
                  ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              All Tracks ({allMedia.length})
            </button>
            <button
              onClick={() => setActiveLane("concerts")}
              className={`px-4 py-2 rounded-2xl text-xs font-mono transition-all ${
                activeLane === "concerts"
                  ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              Official Concerts
            </button>
            <button
              onClick={() => setActiveLane("fan")}
              className={`px-4 py-2 rounded-2xl text-xs font-mono transition-all ${
                activeLane === "fan"
                  ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              Fan Vault & Tapes
            </button>
            <button
              onClick={() => setActiveLane("photos")}
              className={`px-4 py-2 rounded-2xl text-xs font-mono transition-all ${
                activeLane === "photos"
                  ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                  : "bg-white/10 text-zinc-300 hover:bg-white/20"
              }`}
            >
              Photo Wall
            </button>
          </div>

          {/* Slider Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollRibbon("left")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRibbon("right")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Giant Snapping Cards Ribbon */}
        <div
          ref={ribbonRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar snap-x snap-mandatory"
        >
          {laneItems.map((m) => {
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
                className={`flex-none w-[360px] sm:w-[450px] snap-start rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/80 shadow-2xl group ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
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
                <div className="p-5 space-y-1.5">
                  <div className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{m.synopsis}</p>
                  <div className="pt-2 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
                    <span className="truncate">{m.credits.venue || "Midwest Arena"}</span>
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
