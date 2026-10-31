/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Film,
  Camera,
  Sparkles,
  Maximize2,
  List,
  Layers,
  ArrowRight,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 41: Master Stage & Vertical Stack (Single Column)
// Top giant video player + beneath it a pure single-column vertical stack
// of massive 16:9 cards (max-w-4xl mx-auto). No multi-columns.
// =========================================================================
export function Layout41MasterVerticalStack({
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

  const handlePickVideo = (m: (typeof allMedia)[0]) => {
    onSelectItem(m);
    if (m.mediaFormat === "photo" && onOpenLightbox) {
      onOpenLightbox(m);
    } else {
      topStageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-10">
      {/* Top Giant Open Video Stage */}
      <div ref={topStageRef} className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            NOW OPEN IN MASTER THEATER
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

        {/* Video Info Header */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 space-y-2 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{activeItem.title}</h1>
            <span className="text-xs font-mono text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              {activeItem.duration}
            </span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{activeItem.credits.venue || "Midwest Arena"}</span>
            <span>{activeItem.year} • {activeItem.category}</span>
          </div>
        </div>
      </div>

      {/* Strictly ONE COLUMN Gallery Video List */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="text-sm font-mono tracking-widest text-amber-400 uppercase font-bold flex items-center gap-2">
            <List className="w-4 h-4" /> Single-Column Video Gallery ({allMedia.length} Videos)
          </div>
          <span className="text-xs font-mono text-zinc-400">Click any video to load above</span>
        </div>

        <div className="flex flex-col space-y-6">
          {allMedia.map((m, idx) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => handlePickVideo(m)}
                className={`group relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl flex flex-col md:flex-row items-stretch ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
                }`}
              >
                {/* Big 16:9 Thumbnail (Left on desktop, full on mobile) */}
                <div className="relative w-full md:w-3/5 aspect-video overflow-hidden bg-black shrink-0">
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
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Details on the side */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3 bg-zinc-950/60">
                  <div>
                    <div className="text-xs font-mono text-amber-400 font-bold uppercase mb-1">
                      TRACK #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                    <div className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-3 mt-2 leading-relaxed">
                      {m.synopsis}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="truncate max-w-[180px]">{m.credits.venue || "Midwest Arena"}</span>
                    <span className="text-amber-400 font-bold">{m.year}</span>
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
// LAYOUT 42: Split Cinema & Right Single-Column Rail
// Left 65% sticky big video player + Right 35% dedicated single-column vertical scroll rail
// =========================================================================
export function Layout42SplitSingleColumnRail({
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
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 65%: Sticky Big Open Video Player */}
        <div className="lg:col-span-8 lg:sticky lg:top-32 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              NOW PLAYING IN MAIN THEATER
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

          <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
              <span className="text-xs font-mono text-amber-300 font-bold px-3 py-1 bg-black/60 rounded-full border border-white/15">
                {activeItem.duration}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400">
              <div>VENUE: <span className="text-white">{activeItem.credits.venue || "Midwest Arena"}</span></div>
              <div>YEAR: <span className="text-white">{activeItem.year}</span></div>
              <div>CATEGORY: <span className="text-amber-400">{activeItem.category}</span></div>
            </div>
          </div>
        </div>

        {/* Right 35%: Strictly ONE COLUMN Gallery Video Rail */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/15 text-xs font-mono text-zinc-400">
            <span className="text-amber-400 font-bold">1-COLUMN VIDEO LIST</span>
            <span>{allMedia.length} TRACKS</span>
          </div>

          <div className="flex flex-col space-y-4">
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
                  className={`group rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-xl ${
                    isSelected
                      ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                      : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                  }`}
                >
                  {/* Big Video Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 z-10"><MediaFormatBadge item={m} /></div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black/85 text-amber-300 border border-white/10">
                      {m.duration}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                      {m.title}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {m.synopsis}
                    </p>
                    <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/10 flex justify-between">
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
    </div>
  );
}

// =========================================================================
// LAYOUT 43: Left Single-Column Playlist & Right Big Cinema
// Left 35% single-column track list + Right 65% sticky big video player
// =========================================================================
export function Layout43LeftPlaylistRightCinema({
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
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 35%: Single-Column Video Queue (1 Column) */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/15 text-xs font-mono text-zinc-400">
            <span className="text-amber-400 font-bold">LEFT 1-COL PLAYLIST</span>
            <span>{allMedia.length} TRACKS</span>
          </div>

          <div className="flex flex-col space-y-4">
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
                  className={`group rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-xl ${
                    isSelected
                      ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                      : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 z-10"><MediaFormatBadge item={m} /></div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black/85 text-amber-300 border border-white/10">
                      {m.duration}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                      <span>#{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                      <span>• {m.category}</span>
                    </div>
                    <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                      {m.title}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {m.synopsis}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 65%: Sticky Big Open Video Player */}
        <div className="lg:col-span-8 order-1 lg:order-2 lg:sticky lg:top-32 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              RIGHT MAIN STAGE
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

          <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
              <span className="text-xs font-mono text-amber-300 font-bold px-3 py-1 bg-black/60 rounded-full border border-white/15">
                {activeItem.duration}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400">
              <div>VENUE: <span className="text-white">{activeItem.credits.venue || "Midwest Arena"}</span></div>
              <div>YEAR: <span className="text-white">{activeItem.year}</span></div>
              <div>AUDIO: <span className="text-amber-400">{activeItem.credits.audio || "Master 4K"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 44: Master Stage & Single Horizontal Snap Row
// Top huge open video stage (60vh) + Bottom strictly ONE horizontal snapping row
// of large 480px wide video cards with left/right chevrons.
// =========================================================================
export function Layout44MasterStageSingleSnapRow({
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
        left: dir === "left" ? -500 : 500,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Top Giant Open Video Stage */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            CINEMA STAGE (ACTIVE VIDEO OPEN)
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

        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl line-clamp-2">{activeItem.synopsis}</p>
          </div>
          <div className="text-xs font-mono text-zinc-400 shrink-0 border-l border-white/10 pl-4 space-y-1">
            <div>VENUE: <span className="text-white">{activeItem.credits.venue || "Midwest Arena"}</span></div>
            <div>DURATION: <span className="text-amber-300 font-bold">{activeItem.duration}</span></div>
          </div>
        </div>
      </div>

      {/* Strictly ONE ROW Video Track (No two columns) */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold flex items-center gap-2">
            <Film className="w-3.5 h-3.5" /> Single Row Video Deck ({allMedia.length} Videos)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollRow("left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRow("right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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
                className={`flex-none w-[340px] sm:w-[480px] snap-start rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl group ${
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
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
                <div className="p-4 space-y-1">
                  <div className="font-bold text-white text-base group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{m.synopsis}</p>
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
// LAYOUT 45: Centered Cinema with Floating Single-Row Shelf
// Full-bleed centered cinema screen + floating bottom frosted shelf of strictly ONE row of cards
// =========================================================================
export function Layout45CenteredCinemaFloatingRow({
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
  const shelfRef = useRef<HTMLDivElement>(null);

  const scrollShelf = (dir: "left" | "right") => {
    if (shelfRef.current) {
      shelfRef.current.scrollBy({
        left: dir === "left" ? -460 : 460,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-28 px-4 sm:px-8 space-y-8">
      {/* Centered Massive Cinema Stage */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            CENTERED CINEMA STAGE
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl line-clamp-2">{activeItem.synopsis}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scrollShelf("left")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollShelf("right")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Single-Row Shelf (Strictly ONE row of video cards) */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          SINGLE ROW GALLERY DECK — CLICK ANY VIDEO TO OPEN ABOVE
        </div>

        <div
          ref={shelfRef}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-xs font-mono font-bold bg-black/85 text-amber-300 border border-white/15">
                    {m.duration}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <div className="font-bold text-white text-base group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{m.synopsis}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
