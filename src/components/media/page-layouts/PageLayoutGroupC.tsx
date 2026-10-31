/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Disc3,
  Layers,
  Smartphone,
  History,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Check,
  Share2,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 11: Minimalist Floating HUD Canvas
// 100% full-screen video canvas with modular floating frosted glass HUD panels.
// =========================================================================
export function Layout11MinimalistHUD({
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
    <div className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* 100% Fullscreen Video Screen */}
      <div className="absolute inset-0 w-full h-full">
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
          aspectClass="h-full w-full"
          className="h-full w-full border-none rounded-none shadow-none"
          showOverlayBadges={false}
          controlsVariant="compact"
        />
      </div>

      {/* Top Left Floating HUD: Now Playing Telemetry */}
      <div className="absolute top-36 sm:top-40 left-6 z-20 p-4 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/20 max-w-sm space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
            HUD SIGNAL ACTIVE
          </span>
          <MediaFormatBadge item={activeItem} />
        </div>
        <h1 className="text-xl font-bold text-white leading-tight">{activeItem.title}</h1>
        <p className="text-xs text-zinc-300 line-clamp-2">{activeItem.synopsis}</p>
        <div className="font-mono text-[10px] text-zinc-400 pt-1">
          FORMAT: {activeItem.credits.format || (activeItem.mediaFormat === "photo" ? "High-Res Photography Still" : "4K Master")}
        </div>
      </div>

      {/* Top Right Floating HUD: Timecode & Category */}
      <div className="absolute top-36 sm:top-40 right-6 z-20 p-4 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/20 font-mono text-xs text-right space-y-1 pointer-events-auto hidden sm:block">
        <div className="text-amber-300 font-bold">{activeItem.badge}</div>
        <div className="text-white text-base font-black">
          {formatSeconds(currentTime)} / {formatSeconds(duration)}
        </div>
        <div className="text-zinc-400 text-[10px]">{activeItem.year} TOUR SPECIAL</div>
      </div>

      {/* Bottom Center Floating HUD: Quick Track Selector */}
      <div className="absolute bottom-5 inset-x-4 sm:inset-x-12 z-20 flex justify-center pointer-events-auto">
        <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/20 max-w-4xl w-full flex items-center gap-3 overflow-x-auto custom-scrollbar">
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
                className={`px-3 py-2 rounded-xl text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-purple-600 text-white font-bold shadow-lg scale-105"
                    : "bg-white/5 hover:bg-white/15 text-zinc-300"
                }`}
              >
                <MediaFormatBadge item={m} />
                <span>{m.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 12: Dual-Screen Comparison Deck (Pro Cam vs. Fan Cam)
// Side-by-side synchronized comparison with audio channel selector.
// =========================================================================
export function Layout12DualComparison({
  activeItem,
  onSelectItem,
  bandMedia,
  fanMedia,
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
  const [activeChannel, setActiveChannel] = useState<"pro" | "fan">("pro");

  // Pick paired band and fan media
  const proItem = bandMedia[0] || activeItem;
  const fanItem = fanMedia[0] || activeItem;

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8 space-y-4">
      {/* Header Comparison Status */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/15 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            DUAL-CAM COMPARISON DECK // PRO 4K VS FAN MEDIA
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400">AUDIO SOURCE:</span>
          <button
            type="button"
            onClick={() => setActiveChannel("pro")}
            className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
              activeChannel === "pro" ? "bg-purple-600 text-white font-bold" : "bg-white/10 text-zinc-400"
            }`}
          >
            PRO BOARD
          </button>
          <button
            type="button"
            onClick={() => setActiveChannel("fan")}
            className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
              activeChannel === "fan" ? "bg-amber-500 text-black font-bold" : "bg-white/10 text-zinc-400"
            }`}
          >
            FAN CROWD
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Cinema Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto w-full flex-1 min-h-0 items-center">
        {/* Left Screen: Official Pro Cam */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-300">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">SCREEN A: PRO MULTI-CAM 4K</span>
              <MediaFormatBadge item={proItem} />
            </div>
            <span>{proItem.duration}</span>
          </div>
          <MediaCinemaPlayer
            item={proItem}
            videoRef={videoPlayerRef}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            isMuted={isMuted || activeChannel !== "pro"}
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
            className="rounded-2xl border-2 border-purple-500/50"
          />
          <div className="text-xs font-bold text-white">{proItem.title}</div>
        </div>

        {/* Right Screen: Fan Cam */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">SCREEN B: FRONT-ROW FAN MEDIA</span>
              <MediaFormatBadge item={fanItem} />
            </div>
            <span>{fanItem.duration}</span>
          </div>
          <MediaCinemaPlayer
            item={fanItem}
            videoRef={videoPlayerRef}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            isMuted={isMuted || activeChannel !== "fan"}
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
            className="rounded-2xl border-2 border-amber-500/50"
          />
          <div className="text-xs font-bold text-white">{fanItem.title}</div>
        </div>
      </div>

      {/* Bottom Track Selector */}
      <div className="max-w-7xl mx-auto w-full p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3 overflow-x-auto custom-scrollbar">
        <span className="font-mono text-xs text-zinc-400 shrink-0">SELECT A/B:</span>
        {[...bandMedia, ...fanMedia].map((m) => {
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
              className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-white text-black font-black"
                  : "bg-white/5 hover:bg-white/15 text-zinc-300"
              }`}
            >
              <MediaFormatBadge item={m} />
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 13: Vinyl Gatefold & Spinning Record
// Left 1:1 square vinyl jacket with sliding spinning record and video center label;
// right gatefold liner notes & setlist.
// =========================================================================
export function Layout13VinylGatefold({
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
      {/* Left 50%: Vinyl Album Jacket & Spinning Disc Stage */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full flex items-center justify-center p-6 sm:p-12 relative">
        <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.9)] bg-neutral-900 group">
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
            aspectClass="aspect-square"
            className="w-full h-full"
          />

          {/* Center Vinyl Center Label Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-2">
            <Disc3 className={`w-5 h-5 text-amber-300 ${isPlaying ? "animate-spin" : ""}`} />
            <span className="font-mono text-[10px] font-bold uppercase text-white pr-2">
              33 1/3 RPM STEREO
            </span>
            <MediaFormatBadge item={activeItem} />
          </div>
        </div>
      </div>

      {/* Right 50%: Gatefold Liner Notes & Tracklist */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full overflow-y-auto p-6 sm:p-10 lg:p-14 space-y-6 custom-scrollbar">
        <div className="border-b border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-300 uppercase tracking-widest font-bold">
              NTD RECORDS // GATEFOLD LINER NOTES
            </span>
            <MediaFormatBadge item={activeItem} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            {activeItem.title}
          </h1>
          <p className="text-sm text-zinc-300 mt-2 font-light leading-relaxed">
            {activeItem.synopsis}
          </p>
        </div>

        {/* Side A / Side B Tracklist */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
            Recorded Track Listing ({allMedia.length} Tracks)
          </h2>
          <div className="space-y-2">
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
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-amber-400/20 border-amber-400 text-white shadow-lg"
                      : "bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {idx < 9 ? `A0${idx + 1}` : `B${idx + 1}`}
                    </span>
                    <span className="font-semibold text-sm text-white truncate">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <MediaFormatBadge item={m} />
                    <span className="font-mono text-xs text-zinc-400">{m.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 14: Vertical Story Reel Triptych (9:16 Shorts/Reels)
// 3 vertical 9:16 smartphone-format concert reels side-by-side with swipe rail.
// =========================================================================
export function Layout14VerticalReelTriptych({
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
  const reels = allMedia.slice(0, 3);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-16 px-4 sm:px-8 space-y-6 custom-scrollbar">
      <div className="max-w-6xl mx-auto flex items-center justify-between border-b border-white/15 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            VERTICAL CONCERT TRIPTYCH // 9:16 SOCIAL REELS & STAGE PHOTOS
          </span>
        </div>
        <span className="font-mono text-xs text-amber-300">STAGE CAM TRIPTYCH</span>
      </div>

      {/* 3 Vertical 9:16 Smartphone Frames */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {reels.map((reel, idx) => {
          const isSelected = reel.id === activeItem.id;
          return (
            <div
              key={reel.id}
              className={`relative aspect-[9/16] rounded-3xl overflow-hidden border-2 transition-all shadow-2xl ${
                isSelected ? "border-purple-400 ring-4 ring-purple-500/20" : "border-white/20"
              }`}
            >
              <MediaCinemaPlayer
                item={reel}
                videoRef={isSelected ? videoPlayerRef : { current: null }}
                isPlaying={isSelected ? isPlaying : false}
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
                aspectClass="h-full w-full"
                className="h-full w-full border-none rounded-none"
              />

              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-amber-300 border border-white/20">
                  ANGLE #{idx + 1}
                </span>
                <MediaFormatBadge item={reel} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal Track Selector */}
      <div className="max-w-5xl mx-auto flex items-center gap-3 overflow-x-auto custom-scrollbar p-2">
        {allMedia.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onSelectItem(m);
              if (m.mediaFormat === "photo" && onOpenLightbox) {
                onOpenLightbox(m);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              m.id === activeItem.id ? "bg-purple-600 text-white font-bold" : "bg-white/10 text-zinc-300"
            }`}
          >
            <MediaFormatBadge item={m} />
            <span>{m.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 15: Chronological Timeline Archive (1977 – 2025 Era Ruler)
// Interactive horizontal timeline ruler scrubbing through eras with connected nodes.
// =========================================================================
export function Layout15ChronologicalTimeline({
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
  // Sort media by year chronologically
  const sortedMedia = [...allMedia].sort((a, b) => a.year - b.year);

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8 space-y-4">
      {/* Top Stage & Detail Card */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl mx-auto w-full min-h-0 py-2">
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
          <div className="flex items-center gap-3">
            <span className="text-4xl font-mono font-black text-amber-400">
              {activeItem.year}
            </span>
            <MediaFormatBadge item={activeItem} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{activeItem.title}</h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
          <div className="font-mono text-xs text-zinc-400 pt-2 border-t border-white/10 flex items-center justify-between">
            <div>ERA: <strong>{activeItem.badge}</strong></div>
            <div>{activeItem.duration}</div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Timeline Era Ruler */}
      <div className="shrink-0 max-w-7xl mx-auto w-full space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-widest px-2">
          <History className="w-4 h-4" />
          <span>Timeline Decade Chronology (1977 – 2025)</span>
        </div>

        <div className="relative border-t-2 border-white/20 pt-4 flex items-center gap-6 overflow-x-auto custom-scrollbar pb-3 px-4">
          {sortedMedia.map((m) => {
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
                className={`relative shrink-0 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isSelected ? "scale-110" : "opacity-60 hover:opacity-100"
                }`}
              >
                {/* Timeline Node Pin */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    isSelected ? "bg-amber-400 border-white ring-4 ring-amber-400/30" : "bg-black border-white/40"
                  }`}
                />
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-bold text-amber-300">{m.year}</span>
                  <MediaFormatBadge item={m} />
                </div>
                <span className="text-[11px] font-semibold text-white max-w-[110px] truncate text-center">
                  {m.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
