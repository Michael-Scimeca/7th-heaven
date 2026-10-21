"use client";

import React from "react";
import Image from "next/image";
import {
  Film,
  Camera,
  Disc3,
  Sliders,
  Tv,
  Radio,
  Eye,
  Layers,
  Sparkles,
  Ticket,
  Flame,
  ArrowRightLeft,
  Volume2,
  Calendar,
  Grid,
  Zap,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";

interface MediaViewSwitcherProps {
  showFanWall: boolean;
  onToggle: (showFanWall: boolean) => void;
  styleVariant: number;
}

export const SWITCHER_VARIANTS = [
  { id: 1, name: "1. Neon Pill Switcher (Minimal Glass)" },
  { id: 2, name: "2. Dual Typography Split (Editorial Hero)" },
  { id: 3, name: "3. Live Counter Badge Tabs" },
  { id: 4, name: "4. Fender Amp / Studio Soundboard A/B Switch" },
  { id: 5, name: "5. Broadcast Tally Cam Switcher (CAM 1 vs CAM 2)" },
  { id: 6, name: "6. Cassette Tape Deck A/B Flip" },
  { id: 7, name: "7. Dual Visual Portal Split Banners" },
  { id: 8, name: "8. Concert Ticket Stubs (VIP Vault vs Fan Pit)" },
  { id: 9, name: "9. POV Stage Switcher (Stage vs Crowd)" },
  { id: 10, name: "10. Vinyl Record Sleeves (Side A vs Side B)" },
  { id: 11, name: "11. Floating Glass Island Dock" },
  { id: 12, name: "12. DJ Crossfader Slider Track" },
  { id: 13, name: "13. Magazine Issue Header (Vol. 1 vs Vol. 2)" },
  { id: 14, name: "14. Jukebox Rock-Ola Button Panel" },
  { id: 15, name: "15. Film Strip & Polaroid Photo Reel" },
  { id: 16, name: "16. Backstage Pass Lanyard Badges" },
  { id: 17, name: "17. Sliding Underline Tab Rail" },
  { id: 18, name: "18. Compact Inline Filter Pill" },
  { id: 19, name: "19. Glow Matrix HUD Switcher" },
  { id: 20, name: "20. Full-Bleed Gold Arch Banner Switch" },
];

export default function MediaViewSwitcher({
  showFanWall,
  onToggle,
  styleVariant,
}: MediaViewSwitcherProps) {
  // 1. Neon Pill Switcher (Minimal Glass)
  if (styleVariant === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[var(--radius-box)] border border-nocturne-mauve/40 bg-nocturne-midnight/90 p-4 sm:p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(33,14,42,0.6)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#f2efa3]">
            {showFanWall ? <Camera className="h-5 w-5" /> : <Film className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">
              {showFanWall ? "Fan Media Wall Active" : "Official Media Vault Active"}
            </p>
            <p className="text-xs text-nocturne-rose">
              {showFanWall
                ? "Showing live fan moments, crowd photos, and concert memories"
                : "Showing official music videos, concert footage, and jukebox audio"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`cursor-pointer text-xs font-semibold uppercase tracking-wider transition-colors ${!showFanWall ? "text-[#f2efa3]" : "text-white/50 hover:text-white"
              }`}
          >
            Official Media
          </button>
          <Toggle
            checked={showFanWall}
            onChange={onToggle}
            size="md"
            aria-label="Toggle between Official Media and Fan Media Wall"
          />
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`cursor-pointer text-xs font-semibold uppercase tracking-wider transition-colors ${showFanWall ? "text-[#f2efa3]" : "text-white/50 hover:text-white"
              }`}
          >
            Fan Media Wall
          </button>
        </div>
      </div>
    );
  }

  // 2. Dual Typography Split (Editorial Hero)
  if (styleVariant === 2) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-3 border-y border-white/10">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer font-heading text-2xl sm:text-4xl uppercase tracking-tight transition-all duration-300 ${!showFanWall
              ? "text-[#f2efa3] drop-shadow-[0_0_25px_rgba(242,239,163,0.4)] scale-105"
              : "text-white/40 hover:text-white/80"
            }`}
        >
          01 // OFFICIAL VAULT
        </button>
        <span className="text-white/20 text-xl font-mono hidden sm:inline">|</span>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer font-heading text-2xl sm:text-4xl uppercase tracking-tight transition-all duration-300 ${showFanWall
              ? "text-[#f2efa3] drop-shadow-[0_0_25px_rgba(242,239,163,0.4)] scale-105"
              : "text-white/40 hover:text-white/80"
            }`}
        >
          02 // FAN MEDIA WALL
        </button>
      </div>
    );
  }

  // 3. Live Counter Badge Tabs
  if (styleVariant === 3) {
    return (
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-full border border-white/15 bg-black/60 p-1.5 backdrop-blur-xl shadow-2xl">
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`cursor-pointer flex items-center gap-2.5 rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all ${!showFanWall
                ? "bg-[#f2efa3] text-black shadow-[0_0_20px_rgba(242,239,163,0.5)]"
                : "text-white/70 hover:text-white"
              }`}
          >
            <Film className="h-4 w-4" />
            <span>Official Archive</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-black ${!showFanWall ? "bg-black text-[#f2efa3]" : "bg-white/10 text-white"
                }`}
            >
              48 Videos
            </span>
          </button>
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`cursor-pointer flex items-center gap-2.5 rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all ${showFanWall
                ? "bg-[#f2efa3] text-black shadow-[0_0_20px_rgba(242,239,163,0.5)]"
                : "text-white/70 hover:text-white"
              }`}
          >
            <Camera className="h-4 w-4" />
            <span>Fan Moments</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-black ${showFanWall ? "bg-black text-[#f2efa3]" : "bg-white/10 text-white"
                }`}
            >
              300+ Snaps
            </span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Fender Amp / Studio Soundboard A/B Switch
  if (styleVariant === 4) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border-2 border-stone-800 bg-stone-950 p-4 sm:p-5 shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-amber-600/40 bg-stone-900 text-amber-500 font-mono text-xs font-black">
            A / B
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-amber-400">
              CHANNEL SELECTOR: {showFanWall ? "CHANNEL B [CROWD MIC]" : "CHANNEL A [MASTER REEL]"}
            </p>
            <p className="text-[11px] text-stone-400 font-mono">Analog stage signal routing active</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-stone-900 border border-stone-800 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full transition-all ${!showFanWall
                  ? "bg-amber-400 shadow-[0_0_12px_#fbbf24]"
                  : "bg-stone-800"
                }`}
            />
            <span className="font-mono text-xs text-stone-300">MASTER A</span>
          </div>
          <button
            type="button"
            onClick={() => onToggle(!showFanWall)}
            className="cursor-pointer relative h-7 w-14 rounded-full bg-stone-950 p-1 border border-stone-700 shadow-inner"
          >
            <div
              className={`h-5 w-5 rounded-full bg-gradient-to-b from-stone-200 to-stone-400 shadow-md transition-transform duration-200 ${showFanWall ? "translate-x-7" : "translate-x-0"
                }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full transition-all ${showFanWall
                  ? "bg-red-500 shadow-[0_0_12px_#ef4444]"
                  : "bg-stone-800"
                }`}
            />
            <span className="font-mono text-xs text-stone-300">CROWD B</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Broadcast Tally Cam Switcher (CAM 1 vs CAM 2)
  if (styleVariant === 5) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer flex items-center gap-3 rounded-md px-5 py-3 border font-mono text-xs uppercase tracking-wider transition-all ${!showFanWall
              ? "border-red-500/80 bg-red-950/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              : "border-white/10 bg-black/40 text-white/50 hover:border-white/20 hover:text-white"
            }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${!showFanWall ? "bg-red-500 animate-pulse" : "bg-white/20"
              }`}
          />
          <Tv className="h-4 w-4" />
          <span>CAM 1: STAGE DIRECT FEED [OFFICIAL]</span>
          {!showFanWall && <span className="rounded bg-red-500 text-black px-1.5 py-0.5 text-[9px] font-bold">ON AIR</span>}
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer flex items-center gap-3 rounded-md px-5 py-3 border font-mono text-xs uppercase tracking-wider transition-all ${showFanWall
              ? "border-red-500/80 bg-red-950/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              : "border-white/10 bg-black/40 text-white/50 hover:border-white/20 hover:text-white"
            }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${showFanWall ? "bg-red-500 animate-pulse" : "bg-white/20"
              }`}
          />
          <Radio className="h-4 w-4" />
          <span>CAM 2: PIT CROWD CAM [FAN WALL]</span>
          {showFanWall && <span className="rounded bg-red-500 text-black px-1.5 py-0.5 text-[9px] font-bold">ON AIR</span>}
        </button>
      </div>
    );
  }

  // 6. Cassette Tape Deck A/B Flip
  if (styleVariant === 6) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/15 bg-gradient-to-r from-[#170e28] to-[#0d0718] p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-purple-400/30 bg-black/60 text-purple-300">
            <Disc3 className="h-6 w-6 animate-spin text-purple-300" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-purple-300">CASSETTE DECK 7H-40</p>
            <p className="text-sm font-bold text-white">
              {showFanWall ? "Playing Side B • The Fan Crowd Chronicles" : "Playing Side A • The Band Studio Vault"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!showFanWall)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-purple-950/40 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-purple-200 hover:bg-purple-900/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>FLIP TAPE TO {showFanWall ? "SIDE A (BAND)" : "SIDE B (FANS)"}</span>
        </button>
      </div>
    );
  }

  // 7. Dual Visual Portal Split Banners
  if (styleVariant === 7) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer group relative overflow-hidden rounded-2xl border text-left p-6 transition-all duration-300 ${!showFanWall
              ? "border-[#f2efa3] bg-gradient-to-br from-yellow-950/30 to-black shadow-[0_0_30px_rgba(242,239,163,0.25)] ring-2 ring-[#f2efa3]/50"
              : "border-white/10 bg-black/40 hover:border-white/30 opacity-60 hover:opacity-90"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#f2efa3] font-bold uppercase tracking-widest">
              VIEW 01 // BAND RELEASES
            </span>
            <Film className="h-5 w-5 text-[#f2efa3]" />
          </div>
          <h3 className="font-heading text-2xl uppercase text-white">Official Media Vault</h3>
          <p className="mt-1 text-xs text-white/70">
            Official music videos, full live concert films, 700+ song jukebox archive.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer group relative overflow-hidden rounded-2xl border text-left p-6 transition-all duration-300 ${showFanWall
              ? "border-[#f2efa3] bg-gradient-to-br from-pink-950/30 to-black shadow-[0_0_30px_rgba(242,239,163,0.25)] ring-2 ring-[#f2efa3]/50"
              : "border-white/10 bg-black/40 hover:border-white/30 opacity-60 hover:opacity-90"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-pink-400 font-bold uppercase tracking-widest">
              VIEW 02 // FAN MOMENTS
            </span>
            <Camera className="h-5 w-5 text-pink-400" />
          </div>
          <h3 className="font-heading text-2xl uppercase text-white">Fan Media Wall</h3>
          <p className="mt-1 text-xs text-white/70">
            Real crowd clips, stage selfies, meet &amp; greet memories captured by 7th Heaven fans.
          </p>
        </button>
      </div>
    );
  }

  // 8. Concert Ticket Stubs (VIP Vault vs Fan Pit)
  if (styleVariant === 8) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer relative flex items-center gap-4 rounded-xl border border-dashed px-6 py-3.5 transition-all ${!showFanWall
              ? "border-[#f2efa3] bg-gradient-to-r from-[#20180a] to-black shadow-[0_0_20px_rgba(242,239,163,0.3)] scale-102"
              : "border-white/20 bg-white/[0.02] text-white/50 hover:text-white"
            }`}
        >
          <Ticket className={`h-6 w-6 ${!showFanWall ? "text-[#f2efa3]" : "text-white/40"}`} />
          <div className="text-left">
            <div className="font-mono text-[10px] uppercase text-[#f2efa3] font-bold">ALL ACCESS PASS #001</div>
            <div className="font-bold text-sm text-white">OFFICIAL VAULT &amp; JUKEBOX</div>
          </div>
          {!showFanWall && <span className="ml-2 rounded-full bg-[#f2efa3] text-black text-[10px] font-black px-2 py-0.5">ACTIVE</span>}
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer relative flex items-center gap-4 rounded-xl border border-dashed px-6 py-3.5 transition-all ${showFanWall
              ? "border-pink-400 bg-gradient-to-r from-[#280c1e] to-black shadow-[0_0_20px_rgba(244,114,182,0.3)] scale-102"
              : "border-white/20 bg-white/[0.02] text-white/50 hover:text-white"
            }`}
        >
          <Ticket className={`h-6 w-6 ${showFanWall ? "text-pink-400" : "text-white/40"}`} />
          <div className="text-left">
            <div className="font-mono text-[10px] uppercase text-pink-400 font-bold">PIT GENERAL ADMISSION #002</div>
            <div className="font-bold text-sm text-white">FAN MEDIA WALL &amp; SNAPS</div>
          </div>
          {showFanWall && <span className="ml-2 rounded-full bg-pink-400 text-black text-[10px] font-black px-2 py-0.5">ACTIVE</span>}
        </button>
      </div>
    );
  }

  // 9. POV Stage Switcher (Stage vs Crowd)
  if (styleVariant === 9) {
    return (
      <div className="flex items-center justify-between rounded-full border border-white/20 bg-black/60 p-2 backdrop-blur-xl max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all ${!showFanWall
              ? "bg-white text-black shadow-lg"
              : "text-white/60 hover:text-white"
            }`}
        >
          <Eye className="h-4 w-4" />
          <span>STAGE PERSPECTIVE (OFFICIAL)</span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all ${showFanWall
              ? "bg-[#f2efa3] text-black shadow-lg"
              : "text-white/60 hover:text-white"
            }`}
        >
          <Flame className="h-4 w-4" />
          <span>CROWD PERSPECTIVE (FANS)</span>
        </button>
      </div>
    );
  }

  // 10. Vinyl Record Sleeves (Side A vs Side B)
  if (styleVariant === 10) {
    return (
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer relative flex items-center gap-3 rounded-lg border px-5 py-3 transition-all ${!showFanWall
              ? "border-[#f2efa3] bg-[#f2efa3]/10 text-white shadow-[0_0_20px_rgba(242,239,163,0.3)]"
              : "border-white/10 text-white/50 hover:border-white/30"
            }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-current font-bold text-xs">
            A
          </div>
          <div className="text-left">
            <p className="text-[10px] font-mono uppercase text-[#f2efa3]">TRACKLIST SIDE A</p>
            <p className="font-bold text-sm">Band Discography &amp; Videos</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer relative flex items-center gap-3 rounded-lg border px-5 py-3 transition-all ${showFanWall
              ? "border-[#f2efa3] bg-[#f2efa3]/10 text-white shadow-[0_0_20px_rgba(242,239,163,0.3)]"
              : "border-white/10 text-white/50 hover:border-white/30"
            }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-current font-bold text-xs">
            B
          </div>
          <div className="text-left">
            <p className="text-[10px] font-mono uppercase text-[#f2efa3]">TRACKLIST SIDE B</p>
            <p className="font-bold text-sm">Fan Memories &amp; Crowd Reels</p>
          </div>
        </button>
      </div>
    );
  }

  // 11. Floating Glass Island Dock
  if (styleVariant === 11) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-nocturne-midnight/80 px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <span className="text-xs font-mono uppercase tracking-wider text-nocturne-rose mr-1">FEED:</span>
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!showFanWall
                ? "bg-[#f2efa3] text-black font-bold shadow-md"
                : "text-white/60 hover:text-white"
              }`}
          >
            Official Media
          </button>
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${showFanWall
                ? "bg-[#f2efa3] text-black font-bold shadow-md"
                : "text-white/60 hover:text-white"
              }`}
          >
            Fan Wall
          </button>
        </div>
      </div>
    );
  }

  // 12. DJ Crossfader Slider Track
  if (styleVariant === 12) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-950 p-5 max-w-xl mx-auto shadow-2xl">
        <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-2">
          <span className={!showFanWall ? "text-[#f2efa3] font-bold" : ""}>DECK 1 // OFFICIAL</span>
          <span className="text-stone-600">CROSSFADER</span>
          <span className={showFanWall ? "text-[#f2efa3] font-bold" : ""}>DECK 2 // FAN WALL</span>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onToggle(!showFanWall)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle(!showFanWall);
            }
          }}
          className="cursor-pointer relative h-10 w-full rounded-md bg-stone-900 border border-stone-800 p-1 flex items-center"
        >
          <div className="absolute inset-x-4 h-1 bg-stone-800 rounded-full" />
          <div
            className={`relative z-10 flex h-8 w-1/2 items-center justify-center rounded bg-gradient-to-b from-stone-700 to-stone-900 border border-stone-500 shadow-lg font-mono text-xs font-bold text-white transition-all duration-300 ${showFanWall ? "translate-x-full" : "translate-x-0"
              }`}
          >
            {showFanWall ? "SLID TO FANS ⫸" : "⫷ SLID TO BAND"}
          </div>
        </div>
      </div>
    );
  }

  // 13. Magazine Issue Header (Vol. 1 vs Vol. 2)
  if (styleVariant === 13) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-white/20 pb-4">
        <div>
          <span className="font-mono text-xs text-[#f2efa3] uppercase tracking-widest">ARCHIVE ANTHOLOGY</span>
          <h2 className="font-heading text-3xl uppercase text-white">
            {showFanWall ? "VOLUME II: THE FAN COMMUNITY" : "VOLUME I: THE BAND RECORDINGS"}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`cursor-pointer px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-all ${!showFanWall
                ? "border-[#f2efa3] bg-[#f2efa3] text-black"
                : "border-white/20 text-white/60 hover:text-white"
              }`}
          >
            VOL. I (OFFICIAL)
          </button>
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`cursor-pointer px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-all ${showFanWall
                ? "border-[#f2efa3] bg-[#f2efa3] text-black"
                : "border-white/20 text-white/60 hover:text-white"
              }`}
          >
            VOL. II (FANS)
          </button>
        </div>
      </div>
    );
  }

  // 14. Jukebox Rock-Ola Button Panel
  if (styleVariant === 14) {
    return (
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer flex items-center gap-3 rounded-xl border-2 px-6 py-3 font-mono text-xs font-black uppercase tracking-widest transition-all ${!showFanWall
              ? "border-amber-400 bg-amber-950/60 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              : "border-stone-800 bg-stone-900/60 text-stone-500 hover:text-stone-300"
            }`}
        >
          <div className="h-6 w-6 rounded border border-current flex items-center justify-center">1A</div>
          <span>OFFICIAL JUKEBOX &amp; VIDEOS</span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer flex items-center gap-3 rounded-xl border-2 px-6 py-3 font-mono text-xs font-black uppercase tracking-widest transition-all ${showFanWall
              ? "border-amber-400 bg-amber-950/60 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              : "border-stone-800 bg-stone-900/60 text-stone-500 hover:text-stone-300"
            }`}
        >
          <div className="h-6 w-6 rounded border border-current flex items-center justify-center">2B</div>
          <span>FAN CROWD MEDIA WALL</span>
        </button>
      </div>
    );
  }

  // 15. Film Strip & Polaroid Photo Reel
  if (styleVariant === 15) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer flex items-center gap-3 rounded-lg border px-5 py-3 transition-all ${!showFanWall
              ? "border-emerald-400 bg-emerald-950/30 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              : "border-white/10 text-white/50 hover:text-white"
            }`}
        >
          <Film className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">35MM BAND FILM ARCHIVE</span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer flex items-center gap-3 rounded-lg border px-5 py-3 transition-all ${showFanWall
              ? "border-pink-400 bg-pink-950/30 text-pink-200 shadow-[0_0_15px_rgba(244,114,182,0.3)]"
              : "border-white/10 text-white/50 hover:text-white"
            }`}
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">POLAROID FAN GALLERY</span>
        </button>
      </div>
    );
  }

  // 16. Backstage Pass Lanyard Badges
  if (styleVariant === 16) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`cursor-pointer flex items-center gap-3 rounded-xl border p-4 w-full sm:w-72 transition-all ${!showFanWall
              ? "border-[#f2efa3] bg-[#f2efa3]/10 text-white shadow-lg"
              : "border-white/10 text-white/40 hover:text-white"
            }`}
        >
          <div className="h-10 w-3 rounded-full bg-[#f2efa3]" />
          <div className="text-left">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#f2efa3]">VIP PASS</span>
            <div className="font-bold text-sm">Official Media Vault</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`cursor-pointer flex items-center gap-3 rounded-xl border p-4 w-full sm:w-72 transition-all ${showFanWall
              ? "border-cyan-400 bg-cyan-950/30 text-white shadow-lg"
              : "border-white/10 text-white/40 hover:text-white"
            }`}
        >
          <div className="h-10 w-3 rounded-full bg-cyan-400" />
          <div className="text-left">
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">FAN PASS</span>
            <div className="font-bold text-sm">Fan Photo Wall</div>
          </div>
        </button>
      </div>
    );
  }

  // 17. Sliding Underline Tab Rail
  if (styleVariant === 17) {
    return (
      <div className="flex justify-center border-b border-white/10">
        <div className="inline-flex gap-8">
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`cursor-pointer pb-3 text-sm sm:text-base font-bold tracking-wide transition-all border-b-2 ${!showFanWall
                ? "border-[#f2efa3] text-[#f2efa3]"
                : "border-transparent text-white/50 hover:text-white"
              }`}
          >
            Official Media Vault
          </button>
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`cursor-pointer pb-3 text-sm sm:text-base font-bold tracking-wide transition-all border-b-2 ${showFanWall
                ? "border-[#f2efa3] text-[#f2efa3]"
                : "border-transparent text-white/50 hover:text-white"
              }`}
          >
            Fan Media Wall
          </button>
        </div>
      </div>
    );
  }

  // 18. Compact Inline Filter Pill
  if (styleVariant === 18) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
        <span className="text-xs text-white/70">
          Viewing: <strong className="text-white">{showFanWall ? "Fan Media Wall" : "Official Media Vault"}</strong>
        </span>
        <button
          type="button"
          onClick={() => onToggle(!showFanWall)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>Switch to {showFanWall ? "Official Vault" : "Fan Wall"}</span>
        </button>
      </div>
    );
  }

  // 19. Glow Matrix HUD Switcher
  if (styleVariant === 19) {
    return (
      <div className="rounded-lg border border-cyan-500/40 bg-black/80 p-3 sm:p-4 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs">
            <Zap className="h-4 w-4" />
            <span>SYS.ROUTING: {showFanWall ? "[MEMORIES_FAN_WALL.DAT]" : "[BAND_VAULT_MASTER.DAT]"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(false)}
              className={`cursor-pointer px-3 py-1.5 text-xs border rounded ${!showFanWall
                  ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : "border-cyan-950 text-cyan-700 hover:text-cyan-400"
                }`}
            >
              [ 01: VAULT ]
            </button>
            <button
              type="button"
              onClick={() => onToggle(true)}
              className={`cursor-pointer px-3 py-1.5 text-xs border rounded ${showFanWall
                  ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : "border-cyan-950 text-cyan-700 hover:text-cyan-400"
                }`}
            >
              [ 02: FAN WALL ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 20. Full-Bleed Gold Arch Banner Switch
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f2efa3]/30 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black p-5 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-[#f2efa3]/20 border border-[#f2efa3]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f2efa3]">
            {showFanWall ? "Community Mode" : "Discography Mode"}
          </span>
          <h3 className="font-heading text-2xl uppercase text-white mt-2">
            {showFanWall ? "Fan Media Wall & Live Highlights" : "Official Media Vault"}
          </h3>
          <p className="text-xs text-white/70 mt-0.5">
            {showFanWall
              ? "Browse live fan photos, concert selfies, and stage memories uploaded by fans."
              : "Stream 40 years of official music videos, live concerts, and 700+ jukebox songs."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!showFanWall)}
          className="cursor-pointer shrink-0 rounded-full bg-[#f2efa3] text-black px-6 py-3 font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(242,239,163,0.5)] hover:scale-105 transition-all"
        >
          Switch to {showFanWall ? "Official Media Vault →" : "Fan Media Wall →"}
        </button>
      </div>
    </div>
  );
}
