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
  Tv,
  Radio,
  FileText,
  Sliders,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 46: YouTube Desktop Theater Single-Column
// Left 70% large theater screen + Right 30% strictly ONE single-column list of video cards
// =========================================================================
export function Layout46YouTubeTheaterSingleColumn({
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
        {/* Left 70%: Theater Video Player */}
        <div className="lg:col-span-8 lg:sticky lg:top-32 space-y-4">
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

          <div className="p-6 bg-zinc-950/85 border border-white/10 rounded-3xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
              <MediaFormatBadge item={activeItem} />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>{activeItem.credits.venue || "Midwest Arena"}</span>
              <span>{activeItem.year} • {activeItem.duration}</span>
            </div>
          </div>
        </div>

        {/* Right 30%: Strictly ONE COLUMN Up-Next Rail */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest pb-2 border-b border-white/10">
            UP NEXT — 1 COLUMN QUEUE ({allMedia.length})
          </div>

          <div className="flex flex-col space-y-3">
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
                  className={`group flex items-start gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all duration-300 bg-zinc-950/80 ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/30 bg-zinc-900"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                      {m.duration}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-2">
                      {m.title}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">{m.category}</div>
                    <div className="text-[10px] text-zinc-500">{m.year}</div>
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
// LAYOUT 47: Editorial Single-Column Dossier
// Anchored top master cinema + Long-form single-column story cards with rich blurbs
// =========================================================================
export function Layout47EditorialSingleColumnDossier({
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

  const handleSelect = (m: (typeof allMedia)[0]) => {
    onSelectItem(m);
    if (m.mediaFormat === "photo" && onOpenLightbox) {
      onOpenLightbox(m);
    } else {
      topStageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-10">
      <div ref={topStageRef} className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> FEATURED ARCHIVAL CASE STUDY
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

        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h1 className="text-3xl font-black text-white">{activeItem.title}</h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed italic">&ldquo;{activeItem.synopsis}&rdquo;</p>
        </div>
      </div>

      {/* Strictly ONE COLUMN Editorial Stack */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          EDITORIAL ARCHIVES — 1 COLUMN GALLERY ({allMedia.length} ITEMS)
        </div>

        <div className="flex flex-col space-y-6">
          {allMedia.map((m, i) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`group rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl p-6 ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 bg-zinc-900/90"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                    <span>DOCUMENTARY ARCHIVE #{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
                    <MediaFormatBadge item={m} />
                  </div>

                  {/* Giant 16:9 Thumbnail */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded text-xs font-mono font-bold bg-black/85 text-amber-300 border border-white/15">
                      {m.duration}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl">
                        <Play className="w-7 h-7 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </h2>
                    <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{m.synopsis}</p>
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
// LAYOUT 48: Sticky PiP & Single Column Stream
// Main video player sticks as floating PiP upon scrolling down a single-column stream
// =========================================================================
export function Layout48StickyPipSingleColumn({
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
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Floating Sticky Theater Header */}
      <div className="max-w-4xl mx-auto sticky top-28 sm:top-32 z-30">
        <div className="rounded-3xl overflow-hidden border-2 border-amber-400/50 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="p-3 bg-zinc-950/90 border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              NOW PLAYING: {activeItem.title}
            </span>
            <MediaFormatBadge item={activeItem} />
          </div>

          <div className="relative aspect-video w-full bg-black max-h-[42vh]">
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
        </div>
      </div>

      {/* Strictly ONE COLUMN Gallery Stream */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          SINGLE COLUMN STREAM — CLICK ANY CARD TO SWITCH STICKY PLAYER
        </div>

        <div className="flex flex-col space-y-5">
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
                className={`group rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/85 shadow-xl flex flex-col sm:flex-row items-stretch ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
                }`}
              >
                <div className="relative w-full sm:w-2/5 aspect-video overflow-hidden bg-black shrink-0">
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-mono bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{m.synopsis}</p>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-xs font-mono text-zinc-500 flex justify-between">
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
// LAYOUT 49: Single Horizontal Filmstrip Rail
// Upper half is the open cinema screen + Lower half is strictly ONE single horizontal filmstrip ribbon
// =========================================================================
export function Layout49SingleHorizontalFilmstrip({
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
  const filmstripRef = useRef<HTMLDivElement>(null);

  const scrollFilmstrip = (dir: "left" | "right") => {
    if (filmstripRef.current) {
      filmstripRef.current.scrollBy({
        left: dir === "left" ? -460 : 460,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* Top Open Cinema Screen */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-wider">35MM MASTER FILM DISPLAY</span>
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

        <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl font-bold text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-400 line-clamp-1">{activeItem.synopsis}</p>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold px-3 py-1 bg-black/60 rounded-full border border-white/10">
            {activeItem.duration}
          </span>
        </div>
      </div>

      {/* Strictly ONE ROW 35mm Filmstrip Track */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
            35MM FILMSTRIP REEL — 1 ROW ({allMedia.length} FRAMES)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollFilmstrip("left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollFilmstrip("right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sprocket-punched single horizontal filmstrip */}
        <div className="border-y-2 border-white/20 bg-zinc-950/90 py-3 relative">
          <div
            ref={filmstripRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory"
          >
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
                  className={`flex-none w-[320px] sm:w-[420px] snap-start rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-black shadow-xl group ${
                    isSelected
                      ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.02]"
                      : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black/80 text-amber-300">
                      {m.duration}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-black/80">
                      FRAME #{idx + 1}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/90">
                    <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors truncate">
                      {m.title}
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
// LAYOUT 50: Docked Drawer Single Row
// Immersive edge-to-edge cinema stage + Docked bottom drawer with strictly ONE single row of video cards
// =========================================================================
export function Layout50DockedDrawerSingleRow({
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
  const [drawerOpen, setDrawerOpen] = useState(true);
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
    <div className="relative w-full min-h-screen text-white pt-24 pb-4 px-4 sm:px-8 flex flex-col justify-between">
      {/* Upper Giant Cinema Stage */}
      <div className="max-w-6xl mx-auto w-full space-y-3 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-wider">IMMERSIVE EDGE STAGE</span>
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

        <div className="flex items-center justify-between p-4 bg-zinc-950/80 border border-white/10 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-400 line-clamp-1">{activeItem.synopsis}</p>
          </div>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold font-mono transition-colors hover:bg-amber-300"
          >
            {drawerOpen ? "HIDE VIDEO ROW" : "SHOW 1-ROW GALLERY"}
          </button>
        </div>
      </div>

      {/* Docked Bottom Drawer (Strictly ONE Row) */}
      {drawerOpen && (
        <div className="max-w-6xl mx-auto w-full mt-4 space-y-2 p-4 rounded-3xl bg-zinc-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/10">
            <span className="text-amber-400 font-bold">DOCKED 1-ROW VIDEO SELECTOR</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollRow("left")}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollRow("right")}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={rowRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory"
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
                  className={`flex-none w-[300px] sm:w-[380px] snap-start rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-black shadow-xl group ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]"
                      : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300">
                      {m.duration}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/90 truncate font-bold text-white text-xs group-hover:text-amber-300">
                    {m.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
