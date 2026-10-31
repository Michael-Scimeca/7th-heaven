/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  FileText,
  Terminal,
  Newspaper,
  Box,
  LayoutGrid,
  Check,
  Shield,
  Activity,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 16: Classified Manila Case Dossier
// Archival Manila folder binder with tabbed dividers, typewriter text,
// stamp seals, and vintage CRT monitor.
// =========================================================================
export function Layout16ManilaDossier({
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
  const [activeFolderTab, setActiveFolderTab] = useState<"case" | "exhibits">("case");

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-16 px-4 sm:px-8 space-y-8 custom-scrollbar">
      {/* Manila Dossier Binder Card */}
      <div className="max-w-5xl mx-auto rounded-3xl bg-[#1a1612] border-2 border-[#8c7453]/40 p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Binder Header with Stamp Seals */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#8c7453]/30 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-[#d4af37] tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>CLASSIFIED ARCHIVE // CASE 7H-{activeItem.year}</span>
              </span>
              <MediaFormatBadge item={activeItem} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-mono text-[#f3e5ab] uppercase">
              {activeItem.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase px-3 py-1 rounded bg-red-950/80 text-red-400 border border-red-500/60 font-black tracking-widest">
              RESTRICTED ACCESS
            </span>
          </div>
        </div>

        {/* Vintage CRT Evidence Player */}
        <div className="max-w-3xl mx-auto">
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
            className="rounded-2xl border-4 border-[#3a3024] shadow-2xl"
          />
        </div>

        {/* Typewriter Narrative Dossier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-black/40 border border-[#8c7453]/20 font-mono text-xs text-[#c4b59d]">
          <div className="space-y-2">
            <div className="text-[#d4af37] font-bold">CASE SUMMARY & WITNESS ACCOUNTS:</div>
            <p className="leading-relaxed">{activeItem.synopsis}</p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 md:border-l border-[#8c7453]/20 pt-2 md:pt-0 md:pl-6">
            <div>EXHIBIT FORMAT: <strong className="text-white">{activeItem.credits.format || (activeItem.mediaFormat === "photo" ? "Archival Silver Gelatin Still" : "Master Reel")}</strong></div>
            <div>LOCATION LOG: <strong className="text-white">{activeItem.credits.venue || "Midwest Circuit"}</strong></div>
            <div>EVIDENCE TIME: <strong className="text-white">{activeItem.duration}</strong></div>
            <div>RECORDING TAPE: <strong className="text-white">{activeItem.credits.release || "Archive Tape"}</strong></div>
          </div>
        </div>

        {/* Folder Exhibits Archive Selector */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-mono font-bold text-[#d4af37] uppercase">
            EVIDENCE EXHIBITS CATALOGUE ({allMedia.length} FILES)
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#d4af37] text-black font-black"
                      : "bg-black/60 text-[#c4b59d] hover:bg-black/90 border border-[#8c7453]/30"
                  }`}
                >
                  <MediaFormatBadge item={m} />
                  <span>EXHIBIT #{idx + 1}: {m.title}</span>
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
// LAYOUT 17: Cyberpunk Telemetry Terminal (Matrix CLI / Command Center)
// Amber/green CRT scanlines, live audio waveform visualizer, and terminal search.
// =========================================================================
export function Layout17CyberpunkTerminal({
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
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8 space-y-4 font-mono">
      {/* Terminal Top Command Banner */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-emerald-500/30 pb-2 text-xs text-emerald-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold tracking-widest">
            TERMINAL // 7TH-HEAVEN-CLI v4.2.0 [STREAM ACTIVE]
          </span>
          <MediaFormatBadge item={activeItem} />
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-zinc-500">HOST: LOCALHOST:3000</span>
          <span className="text-emerald-400 font-bold">STATUS: 200 OK</span>
        </div>
      </div>

      {/* Main Terminal Screen: Video + Telemetry Feed */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full min-h-0">
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
            className="rounded-2xl border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          />
        </div>

        <div className="w-full lg:w-2/5 p-5 rounded-2xl bg-black/90 border border-emerald-500/40 text-xs space-y-3">
          <div className="text-emerald-400 font-bold border-b border-emerald-500/20 pb-1.5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SYS_DIAGNOSTICS & PACKET TELEMETRY</span>
          </div>
          <div className="space-y-1 text-zinc-300 text-[11px]">
            <div>&gt; CURRENT_NODE: <strong className="text-emerald-300">{activeItem.title}</strong></div>
            <div>&gt; MEDIA_FORMAT: <strong className="text-purple-300">{activeItem.mediaFormat === "photo" ? "HIGH_RES_STILL_FRAME" : "PRORES_VIDEO_STREAM"}</strong></div>
            <div>&gt; TIMECODE_POS: <strong className="text-amber-400">{formatSeconds(currentTime)}</strong> / {formatSeconds(duration)}</div>
            <div>&gt; VIDEO_CODEC: <strong className="text-white">HEVC/H.265 4K 60FPS</strong></div>
            <div>&gt; PACKET_LOSS: <strong className="text-emerald-400">0.00% [OPTIMAL]</strong></div>
            <div>&gt; AUDIO_MASTER: <strong className="text-white">{activeItem.credits.audio || "FLAC 24-BIT"}</strong></div>
          </div>
          <p className="text-[11px] text-zinc-400 border-t border-emerald-500/20 pt-2 leading-relaxed">
            {activeItem.synopsis}
          </p>
        </div>
      </div>

      {/* Terminal Node Selector */}
      <div className="max-w-6xl mx-auto w-full p-2.5 rounded-xl bg-black/80 border border-emerald-500/30 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
        <span className="text-emerald-500 font-bold shrink-0">&gt; RUN_NODE:</span>
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
              className={`px-2.5 py-1 rounded shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-zinc-900 text-emerald-400 hover:bg-zinc-800 border border-emerald-500/20"
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
// LAYOUT 18: Scrollable Story Magazine & Docked Bottom Cinema Bar
// Long-form editorial magazine that scrolls freely with active video docked.
// =========================================================================
export function Layout18ScrollableStory({
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
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-32 px-4 sm:px-8 space-y-12 custom-scrollbar">
      {/* Editorial Magazine Hero Narrative */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-white/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">
              FEATURE ESSAY // 7TH HEAVEN ROCK CHRONICLES
            </span>
            <MediaFormatBadge item={activeItem} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mt-2 tracking-tight leading-tight">
            {activeItem.title}
          </h1>
          <div className="text-xs font-mono text-zinc-400 mt-2">
            BY 7TH HEAVEN ARCHIVE • {activeItem.year} TOUR SPECIAL
          </div>
        </div>

        <p className="text-lg sm:text-xl text-zinc-200 font-light leading-relaxed">
          {activeItem.synopsis}
        </p>

        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
            Performance & Venue Notes
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Captured live before tens of thousands of dedicated rock fans. Twin guitars modulate through soaring harmonies with pinpoint precision, anchored by thunderous percussion and iconic stadium lead vocals.
          </p>
        </div>

        {/* Stories from Other Tracks */}
        <div className="space-y-4 pt-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white border-b border-white/15 pb-2">
            Related Concert Chapters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allMedia.slice(0, 6).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectItem(m);
                  if (m.mediaFormat === "photo" && onOpenLightbox) {
                    onOpenLightbox(m);
                  }
                }}
                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-300">{m.category}</span>
                    <MediaFormatBadge item={m} />
                  </div>
                  <div className="font-bold text-white text-sm mt-1">{m.title}</div>
                </div>
                <div className="text-xs text-zinc-400 mt-2">{m.duration}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permanently Docked Bottom Cinema Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-black/90 backdrop-blur-2xl border-t border-white/20 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 border border-white/20">
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
              className="h-full w-full border-none rounded-none"
              showOverlayBadges={false}
              controlsVariant="compact"
            />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-300 font-bold uppercase">{activeItem.badge}</span>
              <MediaFormatBadge item={activeItem} />
            </div>
            <div className="font-bold text-white text-base truncate">{activeItem.title}</div>
            <div className="text-xs text-zinc-400 truncate">{activeItem.credits.venue || "Concert Venue"}</div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
            <span>{formatSeconds(currentTime)} / {formatSeconds(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 19: 3D Perspective Stage Coverflow
// Video cards angled in 3D perspective space with reflections.
// =========================================================================
export function Layout19PerspectiveCoverflow({
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
  const currentIndex = allMedia.findIndex((m) => m.id === activeItem.id);

  const prevItem = () => {
    if (currentIndex > 0) onSelectItem(allMedia[currentIndex - 1]);
  };
  const nextItem = () => {
    if (currentIndex < allMedia.length - 1) onSelectItem(allMedia[currentIndex + 1]);
  };

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8 space-y-4 select-none">
      {/* Stage Header */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-widest">
            3D PERSPECTIVE COVERFLOW STAGE
          </span>
          <MediaFormatBadge item={activeItem} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{activeItem.title}</h1>
      </div>

      {/* 3D Coverflow Perspective Stage */}
      <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full min-h-0 relative">
        <button
          type="button"
          onClick={prevItem}
          disabled={currentIndex === 0}
          className="absolute left-2 z-30 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all disabled:opacity-20 cursor-pointer"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Active Player with 3D Depth */}
        <div className="w-full max-w-2xl transform transition-transform duration-500 shadow-[0_30px_90px_rgba(168,85,247,0.3)]">
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
            className="rounded-3xl border-2 border-purple-400"
          />
        </div>

        <button
          type="button"
          onClick={nextItem}
          disabled={currentIndex === allMedia.length - 1}
          className="absolute right-2 z-30 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all disabled:opacity-20 cursor-pointer"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Coverflow Card Carousel */}
      <div className="max-w-6xl mx-auto w-full flex items-center gap-3 overflow-x-auto custom-scrollbar p-2">
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
              className={`relative shrink-0 w-28 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-purple-400 scale-105 shadow-xl opacity-100"
                  : "border-white/10 opacity-50 hover:opacity-90"
              }`}
            >
              <img
                src={thumbFor(m)}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 z-10">
                <MediaFormatBadge item={m} />
              </div>
              <div className="absolute bottom-1 inset-x-1 bg-black/80 px-1 py-0.5 rounded text-center">
                <span className="text-[9px] font-bold text-white truncate block">{m.title}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 20: Asymmetric Bento Box Matrix
// Modern Bento-grid architecture with 2x2 featured player tile.
// =========================================================================
export function Layout20AsymmetricBento({
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
    <div className="relative w-full min-h-screen overflow-y-auto pt-32 sm:pt-36 pb-16 px-4 sm:px-8 space-y-6 custom-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-white/15 pb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            ASYMMETRIC BENTO BOX MATRIX // 7TH HEAVEN ARCHIVE
          </span>
        </div>
        <span className="font-mono text-xs text-amber-300">{allMedia.length} Tiles Active</span>
      </div>

      {/* Master Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Large 2x2 Featured Cinema Tile */}
        <div className="md:col-span-2 lg:col-span-3 row-span-2 rounded-3xl overflow-hidden border border-white/20 bg-black/60 shadow-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-600/30 text-purple-200 border border-purple-400/30">
                FEATURED CINEMA MASTER
              </span>
              <MediaFormatBadge item={activeItem} />
            </div>
            <span className="font-mono text-xs text-zinc-400">{activeItem.duration}</span>
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

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">{activeItem.synopsis}</p>
          </div>
        </div>

        {/* Bento Tile 2: Audio Stems Spec */}
        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 space-y-3">
          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold block">
            AUDIO STEMS
          </span>
          <div className="text-white font-bold text-sm">24-Bit 96kHz Live Matrix</div>
          <p className="text-xs text-zinc-400">Direct soundboard feed captured live on tour with multi-track modulation.</p>
        </div>

        {/* Bento Tile 3: Release Year & Venue */}
        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 space-y-2">
          <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest font-bold block">
            STAGE VENUE
          </span>
          <div className="text-white font-bold text-sm">{activeItem.credits.venue || "Festival Circuit"}</div>
          <div className="text-xs font-mono text-zinc-400">TOUR YEAR: {activeItem.year}</div>
        </div>

        {/* Bento Tile 4: Surrounding Quick Clips */}
        {allMedia.slice(1, 5).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onSelectItem(m);
              if (m.mediaFormat === "photo" && onOpenLightbox) {
                onOpenLightbox(m);
              }
            }}
            className="rounded-3xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] p-4 text-left transition-all space-y-2 cursor-pointer"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={thumbFor(m)}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 z-10">
                <MediaFormatBadge item={m} />
              </div>
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono bg-black/80 text-amber-300">
                {m.duration}
              </span>
            </div>
            <div className="font-bold text-xs text-white truncate">{m.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
