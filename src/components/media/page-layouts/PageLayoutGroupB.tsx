/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Sliders,
  Tv,
  CheckCircle,
  Eye,
  Film,
  Camera,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 06: Horizontal Filmstrip Carousel
// Top 60vh: Spotlight video player with ambient bleed.
// Bottom 40vh: Continuous horizontal snapping filmstrip slider with 16:9 cards.
// =========================================================================
export function Layout06FilmstripCarousel({
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const offset = direction === "left" ? -400 : 400;
      carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8">
      {/* Top 60vh: Spotlight Cinema Stage */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full min-h-0 py-2">
        <div className="w-full lg:w-3/5 h-auto max-h-[50vh] flex items-center">
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
            className="rounded-3xl border border-white/20"
          />
        </div>

        <div className="w-full lg:w-2/5 space-y-3">
          <div className="flex items-center gap-2">
            <MediaFormatBadge item={activeItem} />
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-600/30 text-purple-200 border border-purple-400/30">
              {activeItem.category} • {activeItem.year}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {activeItem.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
            {activeItem.synopsis}
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-400 flex items-center gap-3">
            <span>FORMAT: <strong className="text-white">{activeItem.credits.format || (activeItem.mediaFormat === "photo" ? "High-Res Still" : "4K Master")}</strong></span>
            <span>•</span>
            <span>TIME: <strong className="text-white">{activeItem.duration}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom 40vh: Horizontal Snapping Filmstrip Carousel */}
      <div className="shrink-0 w-full max-w-7xl mx-auto space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>Horizontal Filmstrip Reel ({allMedia.length} Tracks)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex items-center gap-4 overflow-x-auto custom-scrollbar pb-2"
        >
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
                className={`group relative shrink-0 w-64 sm:w-72 aspect-video rounded-2xl overflow-hidden border transition-all duration-300 text-left cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-purple-400 border-transparent scale-105 shadow-2xl opacity-100"
                    : "border-white/10 opacity-70 hover:opacity-100 hover:scale-102"
                }`}
              >
                <img
                  src={thumbFor(m)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 z-10">
                  <MediaFormatBadge item={m} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    {m.duration}
                  </span>
                  <div className="font-bold text-sm text-white truncate">{m.title}</div>
                  <span className="text-[10px] text-zinc-400 truncate">{m.category}</span>
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
// LAYOUT 07: Swiss Typographic Directory & Floating Sticky Monitor
// Left 65%: Oversized bold numbered titles directory with hover triggers.
// Right 35%: Floating sticky portrait/square video monitor.
// =========================================================================
export function Layout07SwissTypographic({
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
      {/* Left 65%: Oversized Typographic Directory */}
      <div className="w-full lg:w-[65%] h-auto lg:h-full overflow-y-auto p-6 sm:p-10 lg:p-14 space-y-6 custom-scrollbar">
        <div className="border-b border-white/20 pb-4">
          <span className="font-mono text-xs text-amber-300 uppercase tracking-widest font-extrabold">
            SWISS ARCHIVAL INDEX // 7TH HEAVEN VAULT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mt-1">
            CATALOGUE DIRECTORY
          </h1>
        </div>

        <div className="space-y-3">
          {allMedia.map((m, idx) => {
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
                className={`w-full text-left py-4 px-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-white/10 border-white text-white shadow-xl scale-101"
                    : "border-white/10 hover:border-white/30 text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <span className="font-mono text-lg sm:text-xl font-black text-zinc-500">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-black text-lg sm:text-2xl tracking-tight text-white truncate flex items-center gap-2">
                      <span>{m.title}</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>{m.category}</span>
                      <span>•</span>
                      <span>{m.year}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-3">
                  <MediaFormatBadge item={m} />
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-amber-300">
                    {m.duration}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 35%: Floating Sticky Cinema Monitor */}
      <div className="w-full lg:w-[35%] h-auto lg:h-full border-t lg:border-t-0 lg:border-l border-white/15 bg-black/80 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-center space-y-5">
        <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MediaFormatBadge item={activeItem} />
            <span className="text-purple-400 font-bold uppercase tracking-wider">PREVIEW MONITOR</span>
          </div>
          <span>{activeItem.duration}</span>
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

        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
          <div className="font-bold text-white text-base">{activeItem.title}</div>
          <p className="text-xs text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
          <div className="font-mono text-[10px] text-zinc-400 pt-2 border-t border-white/10">
            AUDIO: {activeItem.credits.audio || "Multi-Track Master"}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 08: Darkroom Contact Sheet Wall (Full-page Masonry Gallery)
// 4-column photo-lab contact sheet wall with frame numbers, red grease marks.
// =========================================================================
export function Layout08DarkroomWall({
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
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-16 px-4 sm:px-8 space-y-8 custom-scrollbar">
      {/* Top Floating Darkroom Proof Monitor */}
      <div className="max-w-4xl mx-auto bg-black/90 border-2 border-dashed border-red-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-red-400">
          <div className="flex items-center gap-2">
            <MediaFormatBadge item={activeItem} />
            <span className="font-bold tracking-widest uppercase">
              KODAK TX-400 PROOF STRIP // ACTIVE TEST FRAME
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
            ✓ PIC APPROVED
          </span>
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

        <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
          <div><strong className="text-white">{activeItem.title}</strong> — {activeItem.badge}</div>
          <div className="text-amber-300 font-bold">{activeItem.duration}</div>
        </div>
      </div>

      {/* 4-Column Contact Sheet Wall */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest border-b border-white/10 pb-2">
          35mm Contact Sheet Frames ({allMedia.length} Exposures)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allMedia.map((m, idx) => {
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
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all p-1 text-left cursor-pointer ${
                  isSelected
                    ? "border-red-500 bg-red-950/40 scale-102 shadow-2xl"
                    : "border-zinc-800 hover:border-zinc-500 bg-black/60 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="absolute top-1 left-2 font-mono text-[9px] text-zinc-400 z-10 flex items-center gap-1.5">
                  <span>#{idx + 1}A</span>
                  <MediaFormatBadge item={m} />
                </div>
                <img
                  src={thumbFor(m)}
                  alt=""
                  className="w-full h-full object-cover rounded"
                />
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-red-500 pointer-events-none rounded flex items-center justify-center">
                    <span className="font-mono text-xs font-black text-red-400 bg-black/80 px-2 py-0.5 rounded border border-red-500">
                      ✓ PIC
                    </span>
                  </div>
                )}
                <div className="absolute bottom-1 inset-x-1 bg-black/85 p-1 rounded text-center">
                  <div className="text-[10px] font-bold text-white truncate">{m.title}</div>
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
// LAYOUT 09: Asymmetric Modernist Magazine (Z-Pattern Editorial)
// Offset hero video, overlapping narrative pull-quote, staggered media cards.
// =========================================================================
export function Layout09ModernistMagazine({
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
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-20 px-4 sm:px-8 lg:px-12 space-y-12 custom-scrollbar">
      {/* Asymmetric Header Stage */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Narrative Overlap (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <MediaFormatBadge item={activeItem} />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-extrabold">
              VOL. 48 // BAND MONOGRAPH
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-tight font-serif italic">
            {activeItem.title}
          </h1>
          <blockquote className="border-l-2 border-amber-400 pl-4 py-1 text-sm sm:text-base text-zinc-200 italic font-light">
            “{activeItem.synopsis}”
          </blockquote>
          <div className="pt-2 text-xs font-mono text-zinc-400">
            RECORDED: <strong className="text-white">{activeItem.year}</strong> • {activeItem.credits.venue || "Stage Capture"}
          </div>
        </div>

        {/* Right Offset Video (7 cols) */}
        <div className="lg:col-span-7">
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
            className="rounded-3xl border border-white/20 shadow-2xl"
          />
        </div>
      </div>

      {/* Staggered Modernist Media Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-2">
          Staggered Feature Issues
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMedia.map((m, idx) => {
            const isSelected = m.id === activeItem.id;
            const isOffset = idx % 2 === 1;
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
                className={`p-4 rounded-3xl border transition-all text-left cursor-pointer ${
                  isOffset ? "sm:translate-y-6" : ""
                } ${
                  isSelected
                    ? "bg-white/15 border-white shadow-2xl"
                    : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10"
                }`}
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3">
                  <img
                    src={thumbFor(m)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <MediaFormatBadge item={m} />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400">{m.category}</div>
                <div className="font-extrabold text-base text-white mt-1 truncate">{m.title}</div>
                <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">{m.synopsis}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 10: Multi-Cam Broadcast Control Room
// Live TV broadcast switcher: main PGM monitor + 4 live preview feeds + tally.
// =========================================================================
export function Layout10BroadcastControlRoom({
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
  // First 4 tracks for live multi-cam inputs
  const camFeeds = allMedia.slice(0, 4);

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8 space-y-4">
      {/* Top Main Program Monitor (PGM) */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full min-h-0">
        <div className="w-full lg:w-3/5 h-auto max-h-[52vh] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-1.5 px-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-red-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                PROGRAM AIR (PGM-1)
              </span>
              <MediaFormatBadge item={activeItem} />
            </div>
            <span className="font-mono text-xs text-white bg-red-950/80 px-2 py-0.5 rounded border border-red-600">
              ON AIR
            </span>
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
            className="rounded-2xl border-2 border-red-600 shadow-2xl"
          />
        </div>

        {/* Telemetry Panel */}
        <div className="w-full lg:w-2/5 p-5 rounded-2xl bg-black/80 border border-white/15 space-y-3 font-mono text-xs">
          <div className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2">
            <Tv className="w-4 h-4" />
            <span>Master Switcher Diagnostics</span>
          </div>
          <div className="space-y-1.5 text-zinc-300">
            <div>CURRENT SOURCE: <strong className="text-white">{activeItem.title}</strong></div>
            <div>TIMECODE: <strong className="text-emerald-400">{formatSeconds(currentTime)}</strong></div>
            <div>STREAM BITRATE: <strong className="text-white">45.2 Mbps 4K UHD</strong></div>
            <div>AUDIO CHANNELS: <strong className="text-white">16CH STEMS ACTIVE</strong></div>
            <div>FORMAT TYPE: <strong className="text-purple-400">{activeItem.mediaFormat === "photo" ? "High-Res Photography Still" : "ProRes 422 Video Stream"}</strong></div>
          </div>
          <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400">
            {activeItem.synopsis}
          </div>
        </div>
      </div>

      {/* Bottom 4 Multi-Cam Switcher Feeds */}
      <div className="shrink-0 max-w-6xl mx-auto w-full">
        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-purple-400" />
          <span>Live Camera Switcher Bus (Click to Switch Program)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {camFeeds.map((feed, idx) => {
            const isLive = feed.id === activeItem.id;
            return (
              <button
                key={feed.id}
                type="button"
                onClick={() => {
                  onSelectItem(feed);
                  if (feed.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(feed);
                  }
                }}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                  isLive
                    ? "border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-102"
                    : "border-white/15 hover:border-white/40 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={thumbFor(feed)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-white">
                    CAM-{idx + 1}
                  </span>
                  <MediaFormatBadge item={feed} />
                </div>
                {isLive && (
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-600 text-white animate-pulse">
                    TALLY LIVE
                  </div>
                )}
                <div className="absolute bottom-1 inset-x-1 bg-black/80 px-2 py-1 rounded">
                  <div className="text-[10px] font-bold text-white truncate">{feed.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
