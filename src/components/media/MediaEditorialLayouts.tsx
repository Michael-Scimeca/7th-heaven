/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Share2,
  Check,
  ExternalLink,
  Disc,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Clock,
  Flame,
  Award,
  Film,
  Music,
  Users,
} from "lucide-react";
import type { MediaVaultItem } from "./MediaWeGoAgainClient";

interface MediaEditorialLayoutsProps {
  layoutId: number;
  activeItem: MediaVaultItem;
  onShare: () => void;
  copiedLink: boolean;
}

export default function MediaEditorialLayouts({
  layoutId,
  activeItem,
  onShare,
  copiedLink,
}: MediaEditorialLayoutsProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "specs" | "venue">("summary");

  // Common Share Button
  const shareButton = (
    <button
      type="button"
      onClick={onShare}
      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
      title="Share Link"
      aria-label="Share this media link"
    >
      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
    </button>
  );

  // =========================================================================
  // 1. WGA UNDISPUTED EDITORIAL ARCHETYPE (AUTHENTIC PROJECT INFO & CREDITS)
  // =========================================================================
  if (layoutId === 1) {
    return (
      <div className="w-full text-left flex flex-col">
        <div className="w-full h-px bg-white/20 mb-3 sm:mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
            {activeItem.title}
          </h2>
          <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-white/50">
            <span>{activeItem.year}</span>
            <span>•</span>
            <span>{activeItem.duration}</span>
            {shareButton}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-sans max-w-2xl mb-4">
          {activeItem.synopsis}
        </p>
        <div className="pt-3 border-t border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 font-bold">
            Credits
          </div>
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono text-white/70">
            <li className="flex flex-col">
              <span className="text-white/40 text-[9px] uppercase">Artist</span>
              <span className="text-white font-medium truncate">{activeItem.credits.artist || "7th Heaven"}</span>
            </li>
            <li className="flex flex-col">
              <span className="text-white/40 text-[9px] uppercase">Venue</span>
              <span className="text-white font-medium truncate">{activeItem.credits.venue ? activeItem.credits.venue.split(",")[0] : "Tour Stage"}</span>
            </li>
            <li className="flex flex-col">
              <span className="text-white/40 text-[9px] uppercase">Format</span>
              <span className="text-white font-medium truncate">{activeItem.credits.format || "4K Direct"}</span>
            </li>
            <li className="flex flex-col">
              <span className="text-white/40 text-[9px] uppercase">Audio Master</span>
              <span className="text-purple-300 font-medium truncate">{activeItem.credits.audio || "Multi-Track Master"}</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. WGA NUMBERED ARCHIVE DOSSIER (SPLIT NARRATIVE & METADATA TABLE)
  // =========================================================================
  if (layoutId === 2) {
    return (
      <div className="w-full text-left p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/15">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-2 pb-2 border-b border-white/10">
          <span className="uppercase tracking-widest font-bold">
            ARCHIVE DOSSIER // {activeItem.badge}
          </span>
          <span>RUNTIME: {activeItem.duration}</span>
        </div>
        <h2 className="font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
          {activeItem.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2">
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {activeItem.synopsis}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-white/40">ERA / YEAR</span>
              <span className="text-white font-bold">{activeItem.year}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-white/40">CATEGORY</span>
              <span className="text-purple-300 truncate max-w-[120px]">{activeItem.category}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-white/40">LOCATION</span>
              <span className="text-white truncate max-w-[120px]">{activeItem.credits.venue ? activeItem.credits.venue.split(",")[0] : "Tour Stage"}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-white/40">MASTER</span>
              <span className="text-emerald-400 font-bold">VERIFIED 24-BIT</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. WGA PHOTOGRAPHY EXHIBITION PLAQUE
  // =========================================================================
  if (layoutId === 3) {
    return (
      <div className="w-full text-left p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
          <span>GALLERY EXHIBITION CATALOGUE // PLATE 07</span>
          <span className="text-amber-400 font-bold">{activeItem.year}</span>
        </div>
        <h2 className="font-serif italic text-2xl sm:text-3xl text-white mb-1">
          {activeItem.title}
        </h2>
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
          {activeItem.subtitle} • {activeItem.credits.venue || "Chicago Soundstage"}
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-w-2xl mb-4">
          {activeItem.synopsis}
        </p>
        <div className="flex items-center gap-6 pt-3 border-t border-white/10 text-[10px] font-mono text-zinc-400">
          <span>CURATOR: 7TH HEAVEN ARCHIVES</span>
          <span>FORMAT: 35MM / 4K DIGITAL</span>
          <span>AUDIO: UNCOMPRESSED PCM</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. WGA PRODUCTION FILM SLATE
  // =========================================================================
  if (layoutId === 4) {
    return (
      <div className="w-full text-left p-4 sm:p-5 rounded-xl bg-[#0d0918] border border-purple-500/30">
        <div className="flex items-center justify-between font-mono text-[10px] text-purple-300 pb-2 border-b border-purple-500/20 mb-3">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-white">PROD // 7TH HEAVEN</span>
            <span>SCENE: 07</span>
            <span>TAKE: 01</span>
          </div>
          <span className="font-bold text-amber-300">TC 00:{activeItem.duration}:00</span>
        </div>
        <h2 className="font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
          {activeItem.title}
        </h2>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl mb-3">
          {activeItem.synopsis}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-white/10">
          <div>DIRECTOR: BAND COLLECTIVE</div>
          <div>CINEMATOGRAPHY: 4K MULTI-CAM</div>
          <div>SOUND: 24-BIT ARENA MIX</div>
          <div className="text-emerald-400">STATUS: MASTER READY</div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. WGA MULTI-TAB DOCUMENTARY DOSSIER
  // =========================================================================
  if (layoutId === 5) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/15">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            {(["summary", "specs", "venue"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                  activeTab === t
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-amber-300 font-bold">{activeItem.year}</span>
        </div>
        {activeTab === "summary" && (
          <div>
            <h2 className="font-black text-2xl text-white mb-2">{activeItem.title}</h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{activeItem.synopsis}</p>
          </div>
        )}
        {activeTab === "specs" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-zinc-300">
            <div><span className="text-white/40 block text-[9px]">FORMAT</span>{activeItem.credits.format || "4K Direct"}</div>
            <div><span className="text-white/40 block text-[9px]">AUDIO</span>{activeItem.credits.audio || "Multi-Track"}</div>
            <div><span className="text-white/40 block text-[9px]">DURATION</span>{activeItem.duration}</div>
            <div><span className="text-white/40 block text-[9px]">MASTER</span>Archival Master #7H</div>
          </div>
        )}
        {activeTab === "venue" && (
          <div className="font-mono text-xs text-zinc-300">
            <p className="font-bold text-white mb-1">{activeItem.credits.venue || "Festival Mainstage Circuit"}</p>
            <p className="text-white/60 text-[11px]">Recorded live during the 7th Heaven Midwest Tour season.</p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 6. WGA STUDIO MONOGRAPH SPREAD
  // =========================================================================
  if (layoutId === 6) {
    return (
      <div className="w-full text-left p-5 rounded-2xl bg-black/50 border border-white/15">
        <div className="text-[10px] font-mono tracking-widest text-purple-400 uppercase mb-2">
          MONOGRAPH ENTRY VII // {activeItem.badge}
        </div>
        <h2 className="font-light tracking-wide text-2xl sm:text-3xl text-white uppercase mb-2">
          {activeItem.title}
        </h2>
        <p className="font-serif italic text-white/70 text-xs sm:text-sm mb-3">
          &ldquo;{activeItem.tagline}&rdquo;
        </p>
        <p className="text-xs text-white/80 leading-relaxed font-sans max-w-2xl">
          {activeItem.synopsis}
        </p>
      </div>
    );
  }

  // =========================================================================
  // 7. WGA HORIZONTAL CINEMA MARQUEE
  // =========================================================================
  if (layoutId === 7) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-white/[0.04] border border-white/10">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/60 mb-2">
          <span className="text-purple-300 uppercase font-bold">{activeItem.category}</span>
          <span>{activeItem.year} • {activeItem.duration}</span>
        </div>
        <h2 className="font-extrabold text-2xl text-white mb-2">{activeItem.title}</h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 8. WGA CONTACT SHEET DARKROOM NOTES
  // =========================================================================
  if (layoutId === 8) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-black/90 border border-red-900/40 font-mono text-xs">
        <div className="flex items-center justify-between text-red-400 text-[10px] pb-1.5 border-b border-red-900/30 mb-2">
          <span>DARKROOM PROOF SHEET // KODAK TX-400</span>
          <span>FRAME #14A APPROVED</span>
        </div>
        <h2 className="font-bold text-xl text-white mb-1">{activeItem.title}</h2>
        <p className="text-zinc-400 text-[11px] leading-relaxed mb-2">{activeItem.synopsis}</p>
        <div className="text-[10px] text-zinc-500">EXPOSURE: 1/250s • ISO 800 • COLOR TEMP 3200K</div>
      </div>
    );
  }

  // =========================================================================
  // 9. WGA TYPOGRAPHIC STATEMENT & LYRICS
  // =========================================================================
  if (layoutId === 9) {
    return (
      <div className="w-full text-left py-2 border-t border-b border-white/15">
        <h2 className="font-black text-3xl sm:text-4xl text-white tracking-tighter uppercase mb-2">
          {activeItem.title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl mb-3">
          {activeItem.synopsis}
        </p>
        <div className="flex items-center gap-4 text-[10px] font-mono text-amber-300">
          <span>{activeItem.year}</span>
          <span>{activeItem.duration}</span>
          <span>{activeItem.credits.venue}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 10. WGA SWISS MODERNIST TABLE
  // =========================================================================
  if (layoutId === 10) {
    return (
      <div className="w-full text-left grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-black border border-white/30 font-sans">
        <div className="md:col-span-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-red-400 font-bold mb-1">RECORDING SPECIFICATION</div>
          <h2 className="font-black text-2xl text-white uppercase mb-2">{activeItem.title}</h2>
          <p className="text-xs text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-white/20 pt-2 md:pt-0 md:pl-3 font-mono text-[10px] text-zinc-400 flex flex-col justify-between">
          <div><strong className="text-white block">VENUE:</strong>{activeItem.credits.venue || "Tour Stage"}</div>
          <div><strong className="text-white block">AUDIO:</strong>{activeItem.credits.audio || "Multi-Track"}</div>
          <div><strong className="text-white block">LENGTH:</strong>{activeItem.duration}</div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 11. WGA VINYL LINER NOTES GATEFOLD
  // =========================================================================
  if (layoutId === 11) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-2">
          <Disc className="w-4 h-4 animate-[spin_5s_linear_infinite]" />
          <span>7TH HEAVEN RECORDS // LP CATALOG #{activeItem.year}</span>
        </div>
        <h2 className="font-bold text-2xl text-white mb-1">{activeItem.title}</h2>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 12. WGA BROADCAST MASTER CONTROL TELEMETRY
  // =========================================================================
  if (layoutId === 12) {
    return (
      <div className="w-full text-left p-3.5 rounded-xl bg-black/80 border border-red-500/30 font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-red-400 pb-1.5 border-b border-red-500/20 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold">OB-01 MASTER BROADCAST FEED</span>
          </div>
          <span>SIGNAL LOCKED: 1080p60</span>
        </div>
        <h2 className="font-bold text-xl text-white mb-1">{activeItem.title}</h2>
        <p className="text-zinc-300 text-[11px] leading-relaxed mb-2">{activeItem.synopsis}</p>
        <div className="text-[10px] text-zinc-500">CH-01 AUDIO L/R • TIMECODE 00:{activeItem.duration}:00</div>
      </div>
    );
  }

  // =========================================================================
  // 13. WGA FLOATING FROSTED GLASS DOSSIER
  // =========================================================================
  if (layoutId === 13) {
    return (
      <div className="w-full text-left p-4 rounded-[16px] bg-white/[0.05] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-2xl">
        <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 mb-2">
          <span className="font-bold uppercase tracking-wider">{activeItem.badge}</span>
          <span>{activeItem.duration}</span>
        </div>
        <h2 className="font-extrabold text-2xl text-white mb-2">{activeItem.title}</h2>
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 14. WGA BACKSTAGE TOUR PASS ITINERARY
  // =========================================================================
  if (layoutId === 14) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
        <div className="flex items-center justify-between text-xs font-mono text-purple-300 mb-2">
          <span className="font-bold uppercase tracking-widest">OFFICIAL TOUR CREDENTIAL // {activeItem.year}</span>
          <span>STAGE ACCESS</span>
        </div>
        <h2 className="font-black text-2xl text-white uppercase mb-2">{activeItem.title}</h2>
        <p className="text-xs text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 15. WGA MINIMALIST HAIRLINE SUMMARY
  // =========================================================================
  if (layoutId === 15) {
    return (
      <div className="w-full text-left py-3 border-t border-b border-white/10">
        <h2 className="font-bold text-xl text-white mb-1">{activeItem.title}</h2>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 16. WGA RETRO CRT TELETEXT FEED
  // =========================================================================
  if (layoutId === 16) {
    return (
      <div className="w-full text-left p-4 rounded-lg bg-black border border-amber-500/40 font-mono text-xs">
        <div className="bg-amber-400 text-black px-2 py-0.5 font-bold mb-2 inline-block">
          P301 TELETEXT 7TH HEAVEN ARCHIVE
        </div>
        <h2 className="text-xl font-bold text-amber-300 mb-1">{activeItem.title}</h2>
        <p className="text-zinc-300 text-[11px] leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 17. WGA STADIUM ARENA SPOTLIGHT
  // =========================================================================
  if (layoutId === 17) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-black border border-amber-500/30">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-2">
          <Flame className="w-4 h-4 fill-current" />
          <span>ARENA HEADLINER CONCERT ARCHIVE</span>
        </div>
        <h2 className="font-black text-2xl text-white uppercase tracking-tight mb-2">{activeItem.title}</h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 18. WGA DECLASSIFIED VAULT FILE
  // =========================================================================
  if (layoutId === 18) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-[#141008] border border-amber-600/30 font-mono text-xs">
        <div className="text-[10px] text-amber-400 font-bold uppercase mb-1">
          [DECLASSIFIED BAND ARCHIVE] // CASE VERIFIED
        </div>
        <h2 className="font-bold text-xl text-zinc-100 mb-1">{activeItem.title}</h2>
        <p className="text-zinc-400 text-[11px] leading-relaxed">{activeItem.synopsis}</p>
      </div>
    );
  }

  // =========================================================================
  // 19. WGA DIRECTOR STORYBOARD SCRIPT
  // =========================================================================
  if (layoutId === 19) {
    return (
      <div className="w-full text-left p-4 rounded-xl bg-black/60 border border-cyan-500/30 font-mono text-xs">
        <div className="text-[10px] text-cyan-300 font-bold uppercase mb-1">
          CINEMATOGRAPHY LOG // DIRECTOR COMMENTARY
        </div>
        <h2 className="font-bold text-xl text-white mb-1">{activeItem.title}</h2>
        <p className="text-zinc-300 text-[11px] leading-relaxed mb-2">{activeItem.synopsis}</p>
        <p className="text-cyan-400 text-[10px] italic">&ldquo;{activeItem.tagline}&rdquo;</p>
      </div>
    );
  }

  // =========================================================================
  // 20. WGA 3D PERSPECTIVE COVERFLOW HUD
  // =========================================================================
  return (
    <div className="w-full text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-black to-purple-950/30 border border-purple-500/40 shadow-2xl">
      <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 mb-2">
        <span className="font-bold uppercase tracking-widest">HOLOGRAPHIC MEDIA MATRIX</span>
        <span>{activeItem.year} • {activeItem.duration}</span>
      </div>
      <h2 className="font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
        {activeItem.title}
      </h2>
      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans max-w-2xl mb-3">
        {activeItem.synopsis}
      </p>
      <div className="flex items-center gap-4 text-[10px] font-mono text-purple-300 pt-2 border-t border-purple-500/20">
        <span>AUDIO: {activeItem.credits.audio || "MASTER"}</span>
        <span>VENUE: {activeItem.credits.venue || "TOUR"}</span>
        <span>FORMAT: {activeItem.credits.format || "DIRECT"}</span>
      </div>
    </div>
  );
}
