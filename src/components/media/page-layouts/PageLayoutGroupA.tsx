/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Play,
  Film,
  Users,
  Music,
  Calendar,
  MapPin,
  Share2,
  Check,
  Disc3,
  Sliders,
  ChevronRight,
  Tv,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";
import { HERO_TYPOGRAPHY_PRESETS } from "../MediaTypographyPresets";

// =========================================================================
// LAYOUT 01: Authentic WGA Undisputed Case Study
// Left editorial dossier with hairline lines, central floating video,
// and horizontal bottom poster cartouche drawer.
// =========================================================================
export function Layout01Undisputed({
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
  typographyPresetId = 20,
}: MediaLayoutProps) {
  const [cartoucheExpanded, setCartoucheExpanded] = useState(false);
  const typo = HERO_TYPOGRAPHY_PRESETS.find((p) => p.id === typographyPresetId) || HERO_TYPOGRAPHY_PRESETS.find((p) => p.id === 20) || HERO_TYPOGRAPHY_PRESETS[0];

  let displayTitle = activeItem.title;
  if (typo.casing === "uppercase") {
    displayTitle = activeItem.title.toUpperCase();
  }

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-32 sm:pt-36 pb-24 sm:pb-28 px-4 sm:px-8 lg:px-12">
      {/* Studio Header Quote */}
      <div className="max-w-xl text-[11px] uppercase tracking-widest text-zinc-400 font-mono mb-4">
        7th Heaven Production Archive // Documentary & Live Cinema
      </div>

      {/* Main Split: Left Editorial Dossier + Center Video Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 min-h-0">
        {/* Left Column: WGA Typographic Dossier */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-5 overflow-y-auto max-h-full pr-2 custom-scrollbar">
          <div className={typo.dividerClasses} />

          <div>
            <span className={typo.eyebrowClasses}>
              {activeItem.category} • {activeItem.year}
            </span>
            <h2 className={`${typo.titleClasses} mt-1`}>
              {typo.highlightWords ? (
                <>
                  <span>{displayTitle.split(" ").slice(0, -2).join(" ")} </span>
                  <span className="text-amber-400">{displayTitle.split(" ").slice(-2).join(" ")}</span>
                </>
              ) : (
                displayTitle
              )}
            </h2>
            <p className={`${typo.synopsisClasses} mt-2`}>
              {activeItem.synopsis}
            </p>
          </div>

          {/* WGA Structured Credits List */}
          <div className="border-t border-white/15 pt-4 space-y-2">
            <h3 className={typo.specsHeaderClasses}>
              Credits & Technical Specs
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className={typo.specLabelClasses}>ARTIST</span>
                <span className={typo.specValueClasses}>{activeItem.credits.artist || "7th Heaven"}</span>
              </div>
              <div>
                <span className={typo.specLabelClasses}>FORMAT</span>
                <span className={typo.specValueClasses}>{activeItem.credits.format || "4K Concert Master"}</span>
              </div>
              <div>
                <span className={typo.specLabelClasses}>VENUE</span>
                <span className={`${typo.specValueClasses} truncate block`}>{activeItem.credits.venue || "Festival Circuit"}</span>
              </div>
              <div>
                <span className={typo.specLabelClasses}>AUDIO</span>
                <span className={`${typo.specValueClasses} truncate block`}>{activeItem.credits.audio || "Multi-Track Master"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onShare}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share Feature"}</span>
            </button>
            <span className="text-xs font-mono text-zinc-400">
              DURATION: <strong className="text-white">{activeItem.duration}</strong>
            </span>
          </div>
        </div>

        {/* Right / Center: Floating Anamorphic Player */}
        <div className="lg:col-span-7 flex justify-center items-center">
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
            aspectClass="aspect-video"
            className="rounded-2xl border border-white/20"
          />
        </div>
      </div>

      {/* Bottom Floating WGA Posters Cartouche Drawer */}
      <div className="fixed bottom-3 inset-x-4 sm:inset-x-8 lg:inset-x-12 z-30 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/90">
                WGA Cartouche Archive • {allMedia.length} Features
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCartoucheExpanded(!cartoucheExpanded)}
              className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {cartoucheExpanded ? "Collapse Cartouche" : "Expand All"}
            </button>
          </div>

          <div
            className={`flex items-center gap-3 overflow-x-auto custom-scrollbar transition-all ${
              cartoucheExpanded ? "h-36 sm:h-44 py-1" : "h-20 sm:h-24 py-1"
            }`}
          >
            {allMedia.map((m) => {
              const isSelected = m.id === activeItem.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectItem(m)}
                  className={`group relative shrink-0 h-full aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300 text-left cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-white scale-105 opacity-100 z-10"
                      : "opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                  aria-label={`Select ${m.title}`}
                >
                  <img
                    src={thumbFor(m)}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 z-10 scale-90 origin-top-left">
                    <MediaFormatBadge item={m} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-1.5 flex flex-col justify-end">
                    <span className="text-[9px] font-mono text-zinc-300 font-bold truncate">
                      {m.title}
                    </span>
                    <span className="text-[8px] font-mono text-amber-300 truncate">
                      {m.duration}
                    </span>
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
// LAYOUT 02: 50/50 Monolithic Split Screen
// Pure edge-to-edge 50vw / 50vw split from top to bottom.
// Left: edge-to-edge square/portrait video screen with floating playback HUD.
// Right: dedicated full-height independent scrollable document with deep narrative.
// =========================================================================
export function Layout02SplitScreen({
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
}: MediaLayoutProps) {
  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col lg:flex-row overflow-hidden pt-28 sm:pt-32">
      {/* Left 50%: Edge-to-Edge Sticky Video Viewport */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full relative bg-black flex items-center justify-center p-4 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10">
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
          aspectClass="aspect-video lg:aspect-square"
          className="rounded-3xl border border-white/20 max-h-[85vh]"
        />
      </div>

      {/* Right 50%: Independent Scrollable Narrative & Media Dossier */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full overflow-y-auto p-6 sm:p-10 lg:p-14 space-y-8 custom-scrollbar">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
              {activeItem.category}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              RELEASE {activeItem.year}
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 tracking-tight">
            {activeItem.title}
          </h1>
          <p className="text-lg text-zinc-300 font-light mt-3 leading-relaxed">
            {activeItem.synopsis}
          </p>
        </div>

        {/* Technical Data Grid */}
        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
            Archival Case File Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 font-mono block text-[10px]">CAPTURE SYSTEM</span>
              <span className="font-semibold text-white">{activeItem.credits.format || "Multi-Cam Stage 4K"}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-mono block text-[10px]">SOUND BOARD MIX</span>
              <span className="font-semibold text-white">{activeItem.credits.audio || "24-Bit Direct FOH"}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-mono block text-[10px]">STAGE VENUE</span>
              <span className="font-semibold text-white">{activeItem.credits.venue || "National Circuit"}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-mono block text-[10px]">PLAYBACK DURATION</span>
              <span className="font-semibold text-white">{activeItem.duration}</span>
            </div>
          </div>
        </div>

        {/* Right-Side Track Selection Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Select Track From Vault ({allMedia.length})
          </h2>
          <div className="space-y-2">
            {allMedia.map((m, idx) => {
              const isSelected = m.id === activeItem.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectItem(m)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/30 border-purple-400 text-white shadow-lg"
                      : "bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs text-zinc-500 w-6">
                      {idx < 9 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <img
                      src={thumbFor(m)}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="text-left truncate">
                      <div className="font-bold text-sm truncate text-white">{m.title}</div>
                      <div className="text-[11px] font-mono text-zinc-400">{m.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <MediaFormatBadge item={m} />
                    <span className="font-mono text-xs text-amber-300">
                      {m.duration}
                    </span>
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
// LAYOUT 03: 21:9 Ultra-Wide Cinema Screen (Top/Bottom Stack)
// Massive full-width 21:9 anamorphic theater player spanning top screen,
// followed below by 4-column organized catalog grid.
// =========================================================================
export function Layout03CinemaTheater({
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
}: MediaLayoutProps) {
  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-16 px-4 sm:px-8 lg:px-12 space-y-10 custom-scrollbar">
      {/* 21:9 Ultra-Wide Cinema Stage Header */}
      <div className="relative w-full max-w-7xl mx-auto">
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
          aspectClass="aspect-[21/9]"
          className="rounded-3xl border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.9)]"
        />

        {/* Cinema Marquee Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
          <div>
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold">
              NOW SCREENING // {activeItem.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{activeItem.title}</h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-300">
            <span>FORMAT: <strong>21:9 ANAMORPHIC</strong></span>
            <span>•</span>
            <span>TIME: <strong>{activeItem.duration}</strong></span>
          </div>
        </div>
      </div>

      {/* 4-Column Lower Media Catalog Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <h2 className="text-sm font-mono uppercase tracking-wider font-extrabold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Complete 7th Heaven Vault Catalog</span>
          </h2>
          <span className="font-mono text-xs text-zinc-400">
            {allMedia.length} Cinematic Recordings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectItem(m)}
                className={`group relative rounded-2xl overflow-hidden border text-left transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-purple-400 border-transparent shadow-xl scale-102 bg-purple-950/40"
                    : "border-white/10 hover:border-white/30 bg-black/40 hover:bg-black/60"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={thumbFor(m)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <MediaFormatBadge item={m} />
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 backdrop-blur-md text-amber-300 border border-white/15">
                    {m.duration}
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                    {m.category}
                  </span>
                  <div className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {m.synopsis}
                  </p>
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
// LAYOUT 04: Fullscreen Canvas with Floating Bottom Dock
// 100% full-screen immersive video canvas with macOS/WGA style floating
// bottom glass dock with magnifying cards.
// =========================================================================
export function Layout04FullscreenDock({
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
}: MediaLayoutProps) {
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* 100% Fullscreen Video Player */}
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
          aspectClass="h-full w-full"
          className="h-full w-full border-none rounded-none shadow-none"
          showOverlayBadges={false}
          controlsVariant="compact"
        />
      </div>

      {/* Floating Top Left Title Card */}
      <div className="absolute top-20 sm:top-24 left-6 sm:left-10 z-20 pointer-events-auto max-w-md p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl">
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-600/40 text-purple-200 border border-purple-400/30">
          {activeItem.category}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5">{activeItem.title}</h1>
        <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{activeItem.synopsis}</p>
      </div>

      {/* Floating macOS / WGA Bottom Dock */}
      <div className="absolute bottom-5 inset-x-0 z-30 flex justify-center pointer-events-auto px-4">
        <div className="p-2 sm:p-2.5 rounded-3xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/25 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center gap-2 sm:gap-3 max-w-full overflow-x-auto custom-scrollbar">
          {allMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectItem(m)}
                className={`group relative shrink-0 w-14 sm:w-16 h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-white -translate-y-2 scale-110 shadow-2xl opacity-100"
                    : "opacity-60 hover:opacity-100 hover:-translate-y-1.5 hover:scale-105"
                }`}
                title={m.title}
              >
                <img
                  src={thumbFor(m)}
                  alt={m.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 z-10 scale-75 origin-top-left">
                  <MediaFormatBadge item={m} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                  <span className="text-[8px] font-mono text-white truncate w-full text-center">
                    {m.title}
                  </span>
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
// LAYOUT 05: 3-Column Production Switcher (Director Suite)
// Left column (20%): Tracklist & Era Navigation tree.
// Center column (55%): Primary stage monitor with seek bar.
// Right column (25%): Technical production dossier with camera gear & audio specs.
// =========================================================================
export function Layout05ProductionSuite({
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
}: MediaLayoutProps) {
  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col lg:flex-row overflow-hidden pt-28 sm:pt-32">
      {/* Column 1: Left Tracklist & Era Nav Tree (20%) */}
      <aside className="w-full lg:w-[22%] h-auto lg:h-full border-r border-white/10 bg-black/60 backdrop-blur-xl p-4 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
          <Film className="w-3.5 h-3.5" />
          <span>Channel Selector</span>
        </div>
        <div className="space-y-1.5 flex-1">
          {allMedia.map((m, idx) => {
            const isSelected = m.id === activeItem.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectItem(m)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white font-bold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="truncate pr-2">
                  <span className="text-[10px] opacity-60 mr-1.5">
                    CH-{idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span>{m.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <MediaFormatBadge item={m} className="scale-80 origin-right" />
                  <span className="text-[10px] text-amber-300">{m.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Column 2: Center Primary Stage Monitor (53%) */}
      <main className="w-full lg:w-[53%] h-auto lg:h-full p-4 sm:p-6 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">
                DIRECTOR PGM MON-1
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              {activeItem.badge}
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
            aspectClass="aspect-video"
            className="rounded-2xl border border-white/20"
          />

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
          </div>
        </div>
      </main>

      {/* Column 3: Right Technical Production Dossier (25%) */}
      <aside className="w-full lg:w-[25%] h-auto lg:h-full border-l border-white/10 bg-black/60 backdrop-blur-xl p-5 overflow-y-auto space-y-6 custom-scrollbar">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Master Console Telemetry</span>
          </h2>
          <p className="text-[11px] text-zinc-400 mt-1">Live broadcast technical parameters & multi-track routing</p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-zinc-500 block">BROADCAST FORMAT</span>
            <span className="font-bold text-white text-xs">{activeItem.credits.format || "4K 60fps Broadcast Multi-Cam"}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-zinc-500 block">AUDIO MASTERING</span>
            <span className="font-bold text-white text-xs">{activeItem.credits.audio || "24-Bit 96kHz Arena Mix"}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-zinc-500 block">VENUE CAPTURE</span>
            <span className="font-bold text-white text-xs">{activeItem.credits.venue || "Festival Mainstage"}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-zinc-500 block">RELEASE RECORD</span>
            <span className="font-bold text-white text-xs">{activeItem.credits.release || `Tour ${activeItem.year}`}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
