/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Disc,
  Radio,
  Sparkles,
  Sliders,
  List,
  Film,
  Camera,
  Activity,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 51: Up-Next Queue (Strictly 1 Column)
// Left 65% big open video + Right 35% dedicated 1-column Up Next queue
// =========================================================================
export function Layout51UpNextQueueSingleColumn({
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
        {/* Left 65%: Master Video Player */}
        <div className="lg:col-span-8 lg:sticky lg:top-32 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> CURRENTLY BROADCASTING
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

          <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-3xl backdrop-blur-xl space-y-2">
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>{activeItem.credits.venue || "Midwest Arena"}</span>
              <span className="text-amber-300">{activeItem.duration}</span>
            </div>
          </div>
        </div>

        {/* Right 35%: 1-Column Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/10">
            <span className="text-amber-400 font-bold">1-COLUMN QUEUE</span>
            <span>{allMedia.length} TRACKS</span>
          </div>

          <div className="flex flex-col space-y-3">
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
                  className={`group flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-300 bg-zinc-950/85 ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/40 bg-zinc-900"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-zinc-500 group-hover:text-amber-400 w-5 text-center">
                    {idx + 1}
                  </span>

                  <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={thumbFor(m)}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300">
                      {m.duration}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors truncate">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">{m.credits.venue || "Live"}</div>
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
// LAYOUT 52: Panoramic Stage & Single Horizontal Roller
// Top 21:9 panoramic video stage + bottom single row of 480px wide cards
// =========================================================================
export function Layout52PanoramicStageSingleRoller({
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
  const rollerRef = useRef<HTMLDivElement>(null);

  const scrollRoller = (dir: "left" | "right") => {
    if (rollerRef.current) {
      rollerRef.current.scrollBy({
        left: dir === "left" ? -480 : 480,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8">
      {/* 21:9 Panoramic Cinema Screen */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-wider">21:9 PANORAMIC SCREEN</span>
          <MediaFormatBadge item={activeItem} />
        </div>

        <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-zinc-950/80 border border-white/10 rounded-2xl">
          <div>
            <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{activeItem.synopsis}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollRoller("left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRoller("right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Strictly ONE ROW Roller (No 2 columns) */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          SINGLE ROW ROLLER TRACK ({allMedia.length} VIDEOS)
        </div>

        <div
          ref={rollerRef}
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
                className={`flex-none w-[320px] sm:w-[460px] snap-start rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-2xl group ${
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
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded text-xs font-mono bg-black/85 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="font-bold text-white text-base group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{m.synopsis}</p>
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
// LAYOUT 53: Jukebox Single-Column Tracklist
// Vintage jukebox aesthetic: Left large stage monitor + Right 1-column illuminated playlist
// =========================================================================
export function Layout53JukeboxSingleColumn({
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
        {/* Left 65%: Jukebox Main Screen */}
        <div className="lg:col-span-8 lg:sticky lg:top-32 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span className="flex items-center gap-2">
              <Disc className="w-4 h-4 animate-spin" /> JUKEBOX MASTER SCREEN
            </span>
            <MediaFormatBadge item={activeItem} />
          </div>

          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-4 border-amber-400/40 bg-black shadow-[0_0_50px_rgba(251,191,36,0.15)]">
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

          <div className="p-6 bg-zinc-950/90 border border-amber-400/20 rounded-3xl space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-amber-300">{activeItem.title}</h1>
              <span className="text-xs font-mono text-zinc-400">{activeItem.duration}</span>
            </div>
            <p className="text-sm text-zinc-300">{activeItem.synopsis}</p>
          </div>
        </div>

        {/* Right 35%: Strictly ONE COLUMN Jukebox Track List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest pb-2 border-b border-amber-400/20">
            JUKEBOX COIN-OP 1-COL SELECTION
          </div>

          <div className="flex flex-col space-y-3">
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
                  className={`group flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-black/90 ${
                    isSelected
                      ? "border-amber-400 ring-4 ring-amber-400/30 bg-amber-400/10"
                      : "border-white/10 hover:border-amber-400/50"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                    <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs group-hover:text-amber-300 truncate">
                      {m.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{m.duration}</div>
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
// LAYOUT 54: Concert Setlist Single-Column Flow
// Chronological 1-column concert setlist: big open video at top, then pure 1-column list below
// =========================================================================
export function Layout54ConcertSetlistSingleColumn({
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
      <div ref={topStageRef} className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-amber-400 font-bold uppercase tracking-widest">LIVE TOUR SETLIST STAGE</span>
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

        <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">{activeItem.title}</h1>
          <span className="text-xs font-mono text-amber-300 font-bold">{activeItem.duration}</span>
        </div>
      </div>

      {/* Strictly ONE COLUMN Setlist Feed */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
          TOUR SETLIST — 1 COLUMN ({allMedia.length} TRACKS)
        </div>

        <div className="flex flex-col space-y-4">
          {allMedia.map((m, idx) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => handlePick(m)}
                className={`group flex items-center gap-4 p-4 rounded-3xl border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.01]"
                }`}
              >
                <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                  {idx + 1}
                </span>

                <div className="relative w-44 aspect-video rounded-2xl overflow-hidden bg-black shrink-0">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-bold text-white text-base group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{m.synopsis}</p>
                  <div className="text-[11px] font-mono text-zinc-500">{m.credits.venue || "Live Stage"}</div>
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
// LAYOUT 55: Broadcast Studio Single-Row Feeds
// Large PGM studio monitor on top + Strictly ONE row of live multi-cam feeds at bottom
// =========================================================================
export function Layout55BroadcastStudioSingleRow({
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
      {/* PGM Main Video Screen */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="text-rose-500 font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            PROGRAM MONITOR (ACTIVE FEED)
          </span>
          <MediaFormatBadge item={activeItem} />
        </div>

        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-rose-500/50 bg-black shadow-2xl">
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

        <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{activeItem.title}</h1>
          <span className="text-xs font-mono text-rose-400 font-bold">ON AIR • {activeItem.duration}</span>
        </div>
      </div>

      {/* Strictly ONE ROW Feed Tally (No 2 columns) */}
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase font-bold">
            PREVIEW TALLY DECK — 1 ROW ({allMedia.length} FEEDS)
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

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory"
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
                className={`flex-none w-[320px] sm:w-[420px] snap-start rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-950/90 shadow-xl group ${
                  isSelected
                    ? "border-rose-500 ring-4 ring-rose-500/30 scale-[1.02]"
                    : "border-white/15 hover:border-white/40 hover:scale-[1.02]"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
                    {m.duration}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-rose-400 font-bold">
                    CAM {idx + 1}
                  </span>
                </div>
                <div className="p-3">
                  <div className="font-bold text-white text-xs group-hover:text-amber-300 truncate">
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
