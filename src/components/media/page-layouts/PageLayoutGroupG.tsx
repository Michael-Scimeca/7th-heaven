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
  Layers,
  Sparkles,
  Maximize2,
  Film,
  Camera,
} from "lucide-react";
import { MediaLayoutProps, MediaFormatBadge } from "../MediaLayoutTypes";
import MediaCinemaPlayer from "../MediaCinemaPlayer";

// =========================================================================
// LAYOUT 31: Hero Cinema with Giant Bottom Roller Deck
// Top 50vh cinema stage + bottom 50vh horizontal roller deck with oversized 480px cards.
// =========================================================================
export function Layout31GiantRollerDeck({
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
      const offset = dir === "left" ? -480 : 480;
      rollerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-4 px-4 sm:px-8 space-y-4">
      {/* Top 52vh: Spotlight Stage */}
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
            className="rounded-3xl border border-white/20 shadow-2xl"
          />
        </div>

        <div className="w-full lg:w-2/5 space-y-3">
          <div className="flex items-center gap-2">
            <MediaFormatBadge item={activeItem} />
            <span className="text-xs font-mono font-bold text-amber-300">{activeItem.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {activeItem.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed">
            {activeItem.synopsis}
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
            <span>FORMAT: <strong className="text-white">{activeItem.credits.format || "Master 4K"}</strong></span>
            <span>TIME: <strong className="text-white">{activeItem.duration}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom 45vh: Oversized 480px Roller Deck */}
      <div className="shrink-0 max-w-7xl mx-auto w-full space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Giant Video Roller Deck ({allMedia.length} Tracks)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRoller("left")}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRoller("right")}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={rollerRef}
          className="flex items-center gap-5 overflow-x-auto custom-scrollbar pb-2"
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
                className={`group relative shrink-0 w-80 sm:w-[420px] aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left cursor-pointer ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102 shadow-2xl opacity-100"
                    : "border-white/15 opacity-75 hover:opacity-100 hover:scale-102"
                }`}
              >
                <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <MediaFormatBadge item={m} />
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-black/70 px-2 py-0.5 rounded">
                      {m.duration}
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-white text-base truncate">{m.title}</div>
                    <div className="text-xs text-zinc-300 truncate">{m.credits.venue || m.category}</div>
                  </div>
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
// LAYOUT 32: Visual Setlist Jukebox (Giant Track Tiles)
// Retro-modern concert jukebox with oversized square & 16:9 track tiles.
// =========================================================================
export function Layout32SetlistJukebox({
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
      {/* Jukebox Arch Stage Header */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-purple-900/40 via-black/80 to-black border-2 border-purple-500/40 p-6 sm:p-8 shadow-2xl space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 font-bold tracking-widest uppercase">
          <Disc className="w-4 h-4 animate-spin text-amber-300" />
          <span>7TH HEAVEN ROCK JUKEBOX // SELECTION #{activeItem.year}</span>
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
          className="rounded-2xl border border-white/20 shadow-2xl max-w-2xl mx-auto"
        />

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{activeItem.title}</h1>
            <MediaFormatBadge item={activeItem} />
          </div>
          <p className="text-xs text-zinc-300 max-w-lg mx-auto">{activeItem.synopsis}</p>
        </div>
      </div>

      {/* Jukebox Giant Track Tiles */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="border-b border-white/15 pb-2 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>SELECT ANY TRACK TO PLAY NOW</span>
          <span>{allMedia.length} JUKEBOX DISCS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left cursor-pointer p-3 bg-black/60 shadow-xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102"
                    : "border-white/10 hover:border-white/30 hover:scale-101"
                }`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-base font-black text-amber-400">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-white text-base truncate group-hover:text-amber-300 transition-colors">
                      {m.title}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">{m.credits.venue || m.category}</div>
                  </div>
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
// LAYOUT 33: Two-Tier Mega Carousel (Band Cams & Fan Cams)
// Top mega-carousel for Official Band Masters (520px cards);
// Bottom mega-carousel for Fan Media (520px cards).
// =========================================================================
export function Layout33TwoTierMegaCarousel({
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
  const bandShelfRef = useRef<HTMLDivElement>(null);
  const fanShelfRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    if (ref.current) {
      const offset = dir === "left" ? -520 : 520;
      ref.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-12 custom-scrollbar">
      {/* Top Main Cinema Stage */}
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-white font-bold uppercase">TWO-TIER STAGE MONITOR</span>
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
          className="rounded-2xl border border-white/20 shadow-2xl"
        />

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white">{activeItem.title}</h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">{activeItem.synopsis}</p>
        </div>
      </div>

      {/* Tier 1: Official Band Master Tracks (Huge 520px Cards) */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            <span>Tier 1: Official Band 4K Masters</span>
            <span className="text-xs font-mono text-zinc-400">({bandMedia.length} Tracks)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(bandShelfRef, "left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(bandShelfRef, "right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={bandShelfRef}
          className="flex items-center gap-6 overflow-x-auto custom-scrollbar pb-3"
        >
          {bandMedia.map((m) => {
            const isSelected = m.id === activeItem.id;
            return (
              <div
                key={m.id}
                onClick={() => onSelectItem(m)}
                className={`relative shrink-0 w-80 sm:w-[500px] aspect-[16/10] rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-2xl ${
                  isSelected
                    ? "border-purple-400 ring-4 ring-purple-400/30 scale-102"
                    : "border-white/15 opacity-80 hover:opacity-100 hover:scale-102"
                }`}
              >
                <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <MediaFormatBadge item={m} />
                    <span className="text-xs font-mono font-bold text-amber-300 bg-black/80 px-2.5 py-1 rounded-full border border-white/20">
                      {m.duration}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-purple-300 font-bold">{m.category}</div>
                    <div className="text-xl font-black text-white truncate">{m.title}</div>
                    <div className="text-xs text-zinc-300 line-clamp-1">{m.synopsis}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier 2: Community Fan Media & Photos (Huge 520px Cards) */}
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <span>Tier 2: Community Fan Moments & Photos</span>
            <span className="text-xs font-mono text-zinc-400">({fanMedia.length} Captures)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(fanShelfRef, "left")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(fanShelfRef, "right")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={fanShelfRef}
          className="flex items-center gap-6 overflow-x-auto custom-scrollbar pb-3"
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
                className={`relative shrink-0 w-80 sm:w-[500px] aspect-[16/10] rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-2xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102"
                    : "border-white/15 opacity-80 hover:opacity-100 hover:scale-102"
                }`}
              >
                <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <MediaFormatBadge item={m} />
                    <span className="text-xs font-mono font-bold text-amber-300 bg-black/80 px-2.5 py-1 rounded-full border border-white/20">
                      {m.duration}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-amber-300 font-bold">By {m.credits.fanName || "Fan Contributor"}</div>
                    <div className="text-xl font-black text-white truncate">{m.title}</div>
                    <div className="text-xs text-zinc-300 line-clamp-1">{m.synopsis}</div>
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
// LAYOUT 34: Giant Coverflow Reel (Full Viewport Cards)
// Apple/Cine style 3D coverflow with huge 650px wide cards.
// =========================================================================
export function Layout34GiantCoverflowReel({
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
    <div className="relative w-full min-h-screen lg:h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-6 px-4 sm:px-8 space-y-4 select-none">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-widest">
            GIANT COVERFLOW THEATER REEL
          </span>
          <MediaFormatBadge item={activeItem} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">{activeItem.title}</h1>
      </div>

      {/* Center Huge Video Stage */}
      <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full min-h-0 relative">
        <button
          type="button"
          onClick={prevItem}
          disabled={currentIndex === 0}
          className="absolute left-2 z-30 p-3.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-all disabled:opacity-20 cursor-pointer shadow-2xl"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-full max-w-3xl transform transition-transform duration-500 shadow-[0_30px_90px_rgba(245,158,11,0.25)]">
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
            className="rounded-3xl border-2 border-amber-400"
          />
        </div>

        <button
          type="button"
          onClick={nextItem}
          disabled={currentIndex === allMedia.length - 1}
          className="absolute right-2 z-30 p-3.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-all disabled:opacity-20 cursor-pointer shadow-2xl"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Giant Coverflow Cards Carousel */}
      <div className="max-w-7xl mx-auto w-full flex items-center gap-4 overflow-x-auto custom-scrollbar p-2">
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
              className={`relative shrink-0 w-44 sm:w-56 aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-amber-400 scale-105 shadow-2xl opacity-100 ring-4 ring-amber-400/30"
                  : "border-white/15 opacity-60 hover:opacity-90"
              }`}
            >
              <img src={thumbFor(m)} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-1.5 left-1.5 z-10"><MediaFormatBadge item={m} /></div>
              <div className="absolute bottom-1 inset-x-1 bg-black/80 p-1 rounded text-center">
                <span className="text-[10px] font-bold text-white truncate block">{m.title}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// LAYOUT 35: High-Density Big-Card Masonry (Pinterest Video Wall)
// 3-column masonry grid where every thumbnail is large, with direct hover actions.
// =========================================================================
export function Layout35BigCardMasonry({
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
    <div className="relative w-full min-h-screen overflow-y-auto pt-28 sm:pt-32 pb-24 px-4 sm:px-8 space-y-8 custom-scrollbar">
      {/* Top Spotlight Cinema Viewport */}
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/20 bg-black/80 shadow-2xl p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-white font-bold uppercase">PINBOARD SPOTLIGHT PLAYER</span>
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

      {/* 3-Column Big Card Pinboard Wall */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-2 text-xs font-mono text-zinc-400">
          <span>BIG-CARD PINBOARD CATALOGUE</span>
          <span>{allMedia.length} TILES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`group rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-black/60 shadow-xl ${
                  isSelected
                    ? "border-amber-400 ring-4 ring-amber-400/30 scale-102"
                    : "border-white/15 hover:border-white/40 hover:scale-102"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img src={thumbFor(m)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10"><MediaFormatBadge item={m} /></div>
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300">
                    {m.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="font-black text-white text-lg group-hover:text-amber-300 transition-colors truncate">
                    {m.title}
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{m.synopsis}</p>
                  <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/10 flex items-center justify-between">
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
