/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Award,
  ChevronRight,
  Radio,
  Share2,
} from "lucide-react";
import { MediaLayoutProps } from "../MediaLayoutTypes";
import { videoThumb } from "@/lib/videoThumb";

export default function Layout62JJettasExhibitCanvas({
  activeItem,
  onSelectItem,
  bandMedia,
  allMedia,
  videoPlayerRef,
  isPlaying,
  togglePlay,
  isMuted,
  toggleMute,
  currentTime,
  duration,
  handleSeek,
  formatSeconds,
  toggleFullscreen,
  onShare,
  copiedLink,
  thumbFor,
}: MediaLayoutProps) {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "hero" | "moments" | "cinema"
  >("all");

  const [activeCardId, setActiveCardId] = useState<string>("hero-master");

  const filteredMedia = allMedia.length > 0 ? allMedia : bandMedia;
  const signatureItems = filteredMedia.slice(0, 4);

  return (
    <div className="relative w-full min-h-screen text-white pt-24 sm:pt-28 lg:pt-32 pb-32 overflow-hidden bg-transparent select-none">
      {/* Subtle Pebbled Leather Radial Overlay on top of live background video blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(88,28,135,0.18),_transparent_75%)] opacity-85"
      />

      {/* Cinematic Analog Noise & Film Grain Overlay over the text and page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -inset-[50%] w-[200%] h-[200%] z-[1] bg-film-noise animate-film-grain opacity-25 mix-blend-overlay select-none"
      />

      {/* Main Museum Exhibit Multi-Card Canvas Container */}
      <div className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gallery Eyebrow & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-black tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>LUXURY EXHIBIT CANVAS</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
              ARCHIVE EDITION 2025
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="hidden sm:inline">CHICAGO • ARENA CIRCUIT</span>
            <span className="text-amber-400 font-bold">5,000+ SHOWS</span>
          </div>
        </div>

        {/* 3-Row Multi-Card Bento Grid (Matching User Screenshot Architecture) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">

          {/* ========================================================== */}
          {/* ROW 1 (TOP): 3 CARDS                                       */}
          {/* ========================================================== */}

          {/* Top Left: Arena Helmet / Frontman Badge Card (Col 4) */}
          <div
            className={`lg:col-span-4 rounded-[28px] sm:rounded-[36px] bg-[#120e1e]/90 hover:bg-[#161126] border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300 group cursor-pointer ${
              activeCardId === "top-badge" ? "ring-2 ring-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.3)]" : ""
            }`}
            onClick={() => setActiveCardId("top-badge")}
          >
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-purple-300">
                  ICONIC ARENA #18
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500">01 / 07</span>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <span
                data-no-text-anim="true"
                className="font-[family-name:var(--font-anton)] text-7xl sm:text-8xl text-white/5 font-black absolute inset-0 flex items-center justify-center select-none"
              >
                1985
              </span>
              <div className="relative z-10 w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/images/members/adam.png"
                  alt="Frontman Adam"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="z-10 flex items-center justify-between border-t border-white/10 pt-3">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wide">
                  Adam • Lead Vocalist
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  30-Song Medley Engine
                </p>
              </div>
              <span className="p-2 rounded-xl bg-white/5 group-hover:bg-purple-500/20 text-purple-300 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Top Center: Origin Quote Narrative Card (Col 5) */}
          <div
            className={`lg:col-span-5 rounded-[28px] sm:rounded-[36px] bg-[#0f0c18]/90 hover:bg-[#130f20] border border-white/10 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer ${
              activeCardId === "quote-card" ? "ring-2 ring-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.3)]" : ""
            }`}
            onClick={() => setActiveCardId("quote-card")}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-amber-400">
                ORIGIN NARRATIVE
              </span>
              <span className="text-xl font-serif italic text-amber-400/70">
                7H
              </span>
            </div>

            <blockquote className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans italic my-2">
              &ldquo;Before the stadium anthems, before the celebrations, before 20,000 voices sang along under the arena lights, there was a band from Chicago who understood one timeless truth: the crowd never stops.&rdquo;
            </blockquote>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-[10px] font-bold text-purple-200">
                  7H
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  ARCHIVAL LOG 1985–2025
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                CHICAGO, IL
              </span>
            </div>
          </div>

          {/* Top Right: Stadium Field Horizon Card (Col 3) */}
          <div
            className={`lg:col-span-3 rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#121c16]/90 to-[#0a110d]/90 border border-emerald-500/20 p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer ${
              activeCardId === "stadium-field" ? "ring-2 ring-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : ""
            }`}
            onClick={() => setActiveCardId("stadium-field")}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-emerald-400">
                ARENA TURF
              </span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            <div className="my-3">
              <p
                data-no-text-anim="true"
                className="font-[family-name:var(--font-anton)] text-4xl text-white font-normal uppercase tracking-tight leading-none"
              >
                ON THE FIELD
              </p>
              <p className="text-xs text-zinc-400 mt-2 leading-snug">
                Mainstage festival circuits with 20,000 screaming rock fans.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300 border-t border-emerald-500/20 pt-2.5">
              <span>FESTIVAL MAIN</span>
              <span className="font-bold">20,000 CAP</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* ROW 2: CENTERPIECE MASTER CARD (EXACT 1:1 WITH SCREENSHOT) */}
          {/* ========================================================== */}

          {/* Centerpiece Hero Card (Col 12 - Full Width Hero Display) */}
          <div
            className={`lg:col-span-12 rounded-[32px] sm:rounded-[44px] bg-[#eae5dd] text-zinc-900 border border-stone-300/80 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] transition-all duration-300 ${
              activeCardId === "hero-master" ? "ring-4 ring-purple-600/40" : ""
            }`}
            onClick={() => setActiveCardId("hero-master")}
          >
            {/* Colossal Watermarked "7TH" Graphic in Background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden opacity-30"
            >
              <span
                data-no-text-anim="true"
                className="font-[family-name:var(--font-anton)] text-[32vw] md:text-[22rem] lg:text-[26rem] leading-none text-[#cfc7b9] tracking-tighter"
              >
                7TH
              </span>
            </div>

            {/* Top Bar of the Card */}
            <div className="relative z-20 flex items-center justify-between border-b border-stone-300/70 pb-4 mb-6">
              {/* Left Brand Chevron */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                  ▲
                </div>
                <span className="text-[11px] font-mono font-extrabold tracking-[0.25em] text-zinc-500 uppercase">
                  7TH HEAVEN ARCHIVE
                </span>
              </div>

              {/* Centered Small-Caps Title */}
              <div className="hidden sm:block text-center">
                <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-zinc-900">
                  ROCKSTAR SHOWCASE • 1985–2025
                </span>
              </div>

              {/* Right Status Bars */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 w-6 cursor-pointer" title="Options">
                  <span className="w-full h-0.5 bg-zinc-800 rounded-full" />
                  <span className="w-full h-0.5 bg-zinc-800 rounded-full" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
            </div>

            {/* Middle Section: Central Rockstar Portrait with Left Card & Right Signature Callouts */}
            <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[420px] sm:min-h-[480px]">

              {/* Left Callout: Floating Collectible Holographic Rookie Card (Col 3) */}
              <div className="lg:col-span-3 flex flex-col items-start gap-4">
                <div className="w-36 sm:w-44 rounded-2xl overflow-hidden bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 p-1 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 group cursor-pointer">
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-black">
                    <img
                      src={thumbFor(activeItem)}
                      alt={activeItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                      ROOKIE CARD #01
                    </div>
                    <div className="absolute bottom-2 inset-x-2 p-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] text-white font-bold leading-tight truncate">
                      {activeItem.title}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-700 font-sans leading-relaxed max-w-[240px]">
                  The landmark continuous medley that rewrote arena history — the rookie card that launched four decades of festival dominance.
                </p>
              </div>

              {/* Center Subject: Frontman / Band Master Cutout (Col 6) */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
                <div className="relative w-64 sm:w-80 md:w-96 lg:w-[420px] aspect-[4/5] flex items-end justify-center">
                  {/* Subtle Glow Behind Subject */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                  {/* Cutout Image */}
                  <img
                    src="/images/members/adam.png"
                    alt="Frontman Adam Master"
                    className="relative z-10 w-full h-auto max-h-[460px] object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>

                {/* Subject Name Tag */}
                <div className="text-center mt-2 z-20">
                  <h2
                    data-no-text-anim="true"
                    className="font-[family-name:var(--font-anton)] text-2xl sm:text-3xl text-zinc-900 uppercase tracking-tight"
                  >
                    ADAM • LEAD VOCALS
                  </h2>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600">
                    7TH HEAVEN ARENA FRONTMAN
                  </p>
                </div>
              </div>

              {/* Right Callout: Hand-Drawn Authentic Signature & Narrative (Col 3) */}
              <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-3 text-left lg:text-right">
                {/* Authentic Purple Script Signature */}
                <div className="text-right">
                  <span className="font-serif italic font-black text-5xl sm:text-6xl text-[#6b21a8] select-none tracking-tight block">
                    7th Heaven
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-900/70 font-bold block -mt-1">
                    AUTHENTIC STAGE SIGNATURE
                  </span>
                </div>

                {/* Narrative Paragraph */}
                <p className="text-xs sm:text-[13px] text-zinc-700 font-sans leading-relaxed max-w-[260px] mt-2">
                  From suburban Chicago club circuits to 20,000-seat amphitheaters. Every song carries 40 years of precision, arena energy, and a bond you don’t find anywhere else.
                </p>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="mt-3 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-purple-900 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>PAUSE TRACK</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>PLAY ARENA AUDIO</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Bottom Accent Bar of Hero Card */}
            <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-stone-300/70 pt-4 mt-8 text-xs font-mono text-zinc-600">
              <div className="flex items-center gap-4">
                <span>FORMAT: 4K STAGE BROADCAST</span>
                <span>•</span>
                <span>AUDIO: 24-BIT MULTI-TRACK ARENA MIX</span>
              </div>
              <div className="font-bold text-zinc-900">
                ACTIVE SELECTION: {activeItem.title}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* ROW 3: SIGNATURE MOMENTS & SUPPORTING CARDS                 */}
          {/* ========================================================== */}

          {/* Signature Moments Card (Col 8 - Matching Screenshot Bottom Card) */}
          <div
            className={`lg:col-span-8 rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-[#180d2e] via-[#0d071a] to-[#080410] border border-purple-500/30 p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl shadow-2xl transition-all duration-300 cursor-pointer ${
              activeCardId === "signature-moments" ? "ring-2 ring-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.4)]" : ""
            }`}
            onClick={() => setActiveCardId("signature-moments")}
          >
            {/* Massive Purple Watermarked Title */}
            <div className="w-full text-center overflow-hidden select-none pointer-events-none mb-2">
              <h3
                data-no-text-anim="true"
                className="font-[family-name:var(--font-anton)] text-[9vw] sm:text-[6vw] font-normal uppercase tracking-[-0.03em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#a855f7] via-[#581c87] to-transparent opacity-80 whitespace-nowrap"
              >
                SIGNATURE MOMENTS
              </h3>
            </div>

            {/* 3D Tilted Gold Foil Trading Cards Row */}
            <div className="relative z-20 -mt-6 sm:-mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {signatureItems.map((item, idx) => {
                const tilts = [
                  "-rotate-2 hover:rotate-0",
                  "rotate-1 hover:rotate-0",
                  "-rotate-1 hover:rotate-0",
                  "rotate-2 hover:rotate-0",
                ];
                const isSelected = activeItem.id === item.id;

                return (
                  <div
                    key={`sig-card-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className={`rounded-2xl p-1 bg-gradient-to-b from-amber-300 via-amber-600 to-amber-900 shadow-xl transition-all duration-300 cursor-pointer ${
                      tilts[idx % tilts.length]
                    } ${
                      isSelected
                        ? "ring-2 ring-amber-300 scale-105 shadow-[0_0_25px_rgba(245,158,11,0.6)]"
                        : "hover:scale-105"
                    }`}
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black">
                      <img
                        src={thumbFor(item)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[8px] font-mono font-bold text-amber-300 uppercase">
                        #{String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <p className="text-[11px] font-bold text-white leading-tight truncate">
                          {item.title}
                        </p>
                        <p className="text-[9px] text-amber-300 font-mono mt-0.5">
                          {item.year || 2025} • MEDLEY
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-purple-500/20 pt-4 mt-6 text-xs font-mono text-purple-300">
              <span>DECK OF {filteredMedia.length} COLLECTIBLES</span>
              <span className="text-amber-400 font-bold">CLICK CARD TO PLAY</span>
            </div>
          </div>

          {/* Accolades & Trophies Sculpture Card (Col 4 - Matching Bottom-Right) */}
          <div
            className={`lg:col-span-4 rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#1c1408]/90 to-[#0e0a04]/90 border border-amber-500/30 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer ${
              activeCardId === "trophy-card" ? "ring-2 ring-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)]" : ""
            }`}
            onClick={() => setActiveCardId("trophy-card")}
          >
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-amber-400">
                HALL OF FAME ACCOLADES
              </span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>

            <div className="my-4 z-10">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-mono">
                5,000+
              </span>
              <p className="text-sm font-bold text-white uppercase tracking-wider mt-1">
                Concerts Performed Worldwide
              </p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Guinness continuous medley records, Billboard charting hits, and Chicago’s premier rock export.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-amber-500/20 pt-3 text-xs font-mono text-amber-300/80 z-10">
              <span>BILLBOARD HOT 100</span>
              <span className="font-bold text-amber-400">GOLD PLAQUE</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* ROW 4: INTERACTIVE MASTER CINEMA PLAYER CARD               */}
          {/* ========================================================== */}
          <div
            className={`lg:col-span-12 rounded-[32px] sm:rounded-[40px] bg-black/85 border border-white/15 p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
              activeCardId === "cinema-player" ? "ring-2 ring-cyan-500/80" : ""
            }`}
            onClick={() => setActiveCardId("cinema-player")}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                  LIVE VIDEO STAGE • {activeItem.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onShare}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "COPIED" : "SHARE"}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Display Container */}
            <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[520px] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner group">
              <video
                ref={videoPlayerRef}
                src={activeItem.videoSrc || "/movie/loops/aint-that-just-beautiful-30s.mp4"}
                className="w-full h-full object-cover"
                playsInline
                loop
                muted={isMuted}
                onClick={togglePlay}
              />

              {/* Play Overlay */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs cursor-pointer"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-black translate-x-0.5" />
                  </div>
                </div>
              )}

              {/* In-Video Bottom Controls */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="text-xs font-mono text-zinc-300">
                    {formatSeconds(currentTime)} / {formatSeconds(duration || 1800)}
                  </span>
                </div>

                <div className="flex-1 max-w-md hidden sm:block">
                  <input
                    type="range"
                    min={0}
                    max={duration || 1800}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Navigation Dock (1:1 with "W. Creator | Font & Color..." dock in user screenshot) */}
      <div className="fixed bottom-6 inset-x-0 z-40 flex items-center justify-center px-4 pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/85 hover:bg-black/95 border border-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_20px_60px_rgba(0,0,0,0.9)] transition-all">
          {/* "W." Award Badge Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs font-mono">
            <span>W.</span>
          </div>

          {/* Interactive Navigation Pills */}
          <button
            type="button"
            onClick={() => {
              setSelectedFilter("all");
              setActiveCardId("hero-master");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-white/20 text-white font-extrabold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Exhibit Overview
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedFilter("hero");
              setActiveCardId("hero-master");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === "hero"
                ? "bg-white/20 text-white font-extrabold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Frontman Hero
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedFilter("moments");
              setActiveCardId("signature-moments");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === "moments"
                ? "bg-purple-600 text-white font-extrabold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Signature Moments
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedFilter("cinema");
              setActiveCardId("cinema-player");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedFilter === "cinema"
                ? "bg-cyan-600 text-white font-extrabold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Cinema Player
          </button>

          {/* "Visit Stage / Play" Yellow Pill Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="ml-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
            <span className="hidden sm:inline">{isPlaying ? "PAUSE STAGE" : "PLAY STAGE"}</span>
            <span className="sm:hidden">{isPlaying ? "PAUSE" : "PLAY"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
