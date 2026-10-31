/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Tv,
  Film,
  Camera,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 26: YouTube-Style Mega Widescreen Grid (Huge 3-Col Cards)
// Giant 3-column cards with large video previews, category filter pills,
// view count tags, and creator badges.
// =========================================================================
export function Layout26YouTubeMegaGrid({
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
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Concerts", "Medleys", "Fan Cams", "Festivals", "Photos"];

  const filteredMedia = allMedia.filter((m) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Concerts") return m.type === "band" && !m.title.toLowerCase().includes("medley");
    if (activeCategory === "Medleys") return m.title.toLowerCase().includes("medley") || m.title.includes("30 Songs");
    if (activeCategory === "Fan Cams") return m.type === "fan" && m.mediaFormat !== "photo";
    if (activeCategory === "Festivals") return m.credits.venue?.toLowerCase().includes("fest") || m.title.toLowerCase().includes("fest");
    if (activeCategory === "Photos") return m.mediaFormat === "photo";
    return true;
  });

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8 custom-scrollbar">
      {/* Top Spotlight Cinema Viewport */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
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
            <span className="text-xs font-mono text-amber-300 font-bold">{activeItem.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{activeItem.title}</h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
          <div className="pt-2 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
            <span>VIEWS: <strong className="text-white">{activeItem.viewCount || "25K"}</strong></span>
            <span>TIME: <strong className="text-white">{activeItem.duration}</strong></span>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-white text-black shadow-lg scale-105"
                : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Huge 3-Column Video Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/60 shadow-xl ${
                isSelected
                  ? "border-purple-400 ring-4 ring-purple-400/30 scale-[1.02]"
                  : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
              }`}
            >
              {/* Big Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img
                  src={thumbFor(m)}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 z-10"><MediaFormatBadge item={m} /></div>
                <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-black/85 text-amber-300">
                  {m.duration}
                </span>
              </div>

              {/* Meta */}
              <div className="p-4 space-y-1.5">
                <div className="font-black text-white text-base sm:text-lg group-hover:text-purple-300 transition-colors line-clamp-1">
                  {m.title}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {m.synopsis}
                </p>
                <div className="pt-2 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                  <span>{m.credits.venue || "Live Concert"}</span>
                  <span>{m.year}</span>
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
// LAYOUT 27: Category Drawer & Giant Video Deck
// Left category selector tabs (Concerts, Medleys, Fan Cams, Festivals) that
// instantly filter the deck of huge video tiles with large thumbnails.
// =========================================================================
export function Layout27CategoryDrawerDeck({
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
  const [selectedSection, setSelectedSection] = useState<"all" | "band" | "fan" | "photo">("all");

  const displayedMedia = allMedia.filter((m) => {
    if (selectedSection === "band") return m.type === "band";
    if (selectedSection === "fan") return m.type === "fan";
    if (selectedSection === "photo") return m.mediaFormat === "photo";
    return true;
  });

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col lg:flex-row overflow-hidden pt-28 sm:pt-32">
      {/* Left 25%: Category Drawer & Active Monitor */}
      <div className="w-full lg:w-[28%] h-auto lg:h-full p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/15 bg-black/80 backdrop-blur-2xl flex flex-col justify-between space-y-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
            CATEGORICAL DRAWER
          </div>

          <div className="space-y-2">
            {[
              { id: "all", label: "All Media Vault", count: allMedia.length },
              { id: "band", label: "Official 4K Concerts", count: allMedia.filter(m => m.type === "band").length },
              { id: "fan", label: "Fan Video Clips", count: allMedia.filter(m => m.type === "fan" && m.mediaFormat !== "photo").length },
              { id: "photo", label: "Concert Photos", count: allMedia.filter(m => m.mediaFormat === "photo").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSection(tab.id as any)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedSection === tab.id
                    ? "bg-purple-600/30 border-purple-400 text-white font-black shadow-lg"
                    : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-zinc-400"
                }`}
              >
                <span className="text-sm">{tab.label}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/60 text-amber-300">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mini Preview Stage */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>PREVIEW</span>
            <MediaFormatBadge item={activeItem} />
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
          <div className="font-bold text-white text-sm truncate">{activeItem.title}</div>
        </div>
      </div>

      {/* Right 75%: Giant Video Deck */}
      <div className="w-full lg:w-[72%] h-auto lg:h-full overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h1 className="text-2xl font-black text-white">
            {selectedSection === "all" ? "Master Media Deck" : selectedSection === "band" ? "Official Band Masters" : selectedSection === "fan" ? "Community Fan Moments" : "Concert Photography Stills"}
          </h1>
          <span className="font-mono text-xs text-amber-300">
            {displayedMedia.length} Big Cards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/70 shadow-2xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102"
                    : "border-white/15 hover:border-white/40 hover:scale-101"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="font-extrabold text-white text-lg truncate">{m.title}</div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{m.synopsis}</p>
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
// LAYOUT 28: Infinite Cine-Stream Wall (Asymmetric Giant Cards)
// Alternating large and extra-large video cards for dynamic browsing.
// =========================================================================
export function Layout28InfiniteCineStream({
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
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-10 custom-scrollbar">
      {/* Sticky Top Cinema Stage */}
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold uppercase">CINE-STREAM SPOTLIGHT</span>
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
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">{activeItem.synopsis}</p>
        </div>
      </div>

      {/* Asymmetric Alternating Large Cards */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/15 pb-2 text-xs font-mono text-zinc-400">
          <span>STREAMING CATALOGUE</span>
          <span>{allMedia.length} TRACKS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {allMedia.map((m, idx) => {
            const isSelected = m.id === activeItem.id;
            const isWide = idx % 3 === 0;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className={`group rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/60 shadow-xl ${
                  isWide ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"
                } ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-101"
                    : "border-white/15 hover:border-white/40 hover:scale-101"
                }`}
              >
                <div className={`relative w-full overflow-hidden ${isWide ? "aspect-[21/9]" : "aspect-video"}`}>
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="font-black text-white text-base sm:text-lg truncate group-hover:text-amber-300 transition-colors">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2">{m.synopsis}</p>
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
// LAYOUT 29: Festival Stage Channel Strip (Giant Multi-Stage Pickers)
// Distinct horizontal channels for "Arena Stage", "Festival Stage", "Fan Pit"
// =========================================================================
export function Layout29FestivalStageStrip({
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
  const stages = [
    { title: "Stage A: Main Arena & Stadium Medleys", filter: (m: any) => m.title.toLowerCase().includes("medley") || m.title.includes("30 Songs") || m.type === "band" },
    { title: "Stage B: Festival Circuit & Street Fests", filter: (m: any) => m.credits.venue?.toLowerCase().includes("fest") || m.title.toLowerCase().includes("fest") },
    { title: "Stage C: Fan Pit Moments & Club Cams", filter: (m: any) => m.type === "fan" },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-12 custom-scrollbar">
      {/* Top Main Broadcast Monitor */}
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-purple-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-bold text-white uppercase">STAGE CHANNEL BROADCAST</span>
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
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">{activeItem.synopsis}</p>
        </div>
      </div>

      {/* 3 Festival Stage Channel Strips */}
      <div className="max-w-7xl mx-auto space-y-10">
        {stages.map((stage, sIdx) => {
          const stageMedia = allMedia.filter(stage.filter);
          return (
            <div key={stage.title} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-mono">
                    CH-{sIdx + 1}
                  </span>
                  <span>{stage.title}</span>
                </h2>
                <span className="text-xs font-mono text-zinc-400">
                  {stageMedia.length} Tracks
                </span>
              </div>

              <div className="flex items-center gap-5 overflow-x-auto custom-scrollbar pb-3">
                {stageMedia.map((m) => {
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                        <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                          {m.duration}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <div className="font-bold text-white text-base truncate">{m.title}</div>
                        <div className="text-xs text-zinc-400 truncate">{m.credits.venue || "Midwest Stage"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 30: Accordion Cinema Expander
// Full-width accordion panels where hovering or clicking smoothly expands massive video previews.
// =========================================================================
export function Layout30AccordionExpander({
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
  const [expandedId, setExpandedId] = useState<string>(activeItem.id);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-2 text-center">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
          ACCORDION CINEMA EXPANDER
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Full-Width Showcase</h1>
        <p className="text-xs sm:text-sm text-zinc-300">Click any track to smoothly expand its giant video stage</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        {allMedia.map((m, idx) => {
          const isExpanded = expandedId === m.id;
          const isActive = activeItem.id === m.id;
          return (
            <div
              key={m.id}
              className={`rounded-3xl overflow-hidden border-2 transition-all duration-300 bg-black/70 shadow-2xl ${
                isExpanded ? "border-amber-400 ring-4 ring-amber-400/20" : "border-white/10 hover:border-white/30"
              }`}
            >
              {/* Accordion Header Strip */}
              <div
                onClick={() => {
                  setExpandedId(isExpanded ? "" : m.id);
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-sm sm:text-base font-black text-zinc-500">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-base sm:text-xl text-white truncate flex items-center gap-2">
                      <span>{m.title}</span>
                      <MediaFormatBadge item={m} />
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">{m.category} • {m.year}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-amber-300 font-bold px-2.5 py-1 rounded-full bg-black/60 border border-white/15">
                    {m.duration}
                  </span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </div>
              </div>

              {/* Smooth Expanded Video Stage */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-white/15 space-y-4 bg-black/90">
                  <MediaCinemaPlayer
                    item={m}
                    videoRef={isActive ? videoPlayerRef : { current: null }}
                    isPlaying={isActive ? isPlaying : false}
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
                    className="rounded-2xl border border-white/20 shadow-2xl max-w-4xl mx-auto"
                  />
                  <div className="max-w-4xl mx-auto text-xs sm:text-sm text-zinc-300 leading-relaxed text-center">
                    {m.synopsis}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
