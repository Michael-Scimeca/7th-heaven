/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import type { MediaVaultItem } from "./MediaWeGoAgainClient";
import {
  Play,
  Film,
  Music,
  Tv,
  Users,
  Compass,
  Sparkles,
  Disc,
  Radio,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Layers,
  ChevronRight,
  Maximize2,
  Sliders,
  Volume2,
  Check,
  Flame,
  Award,
} from "lucide-react";

export interface RightRailLayoutPreset {
  id: number;
  name: string;
  badge: string;
  desc: string;
}

export const RIGHT_RAIL_PRESETS: RightRailLayoutPreset[] = [
  {
    id: 1,
    name: "WGA Undisputed Cartouche",
    badge: "We Go Again",
    desc: "Authentic We Go Again cartouche: 0.65 opacity unselected, active white hairline frame, clean film typography",
  },
  {
    id: 2,
    name: "WGA Numbered Poster Index",
    badge: "Index Mono",
    desc: "We Go Again archival numbering with mono indices [01/26], duration tags, and minimal hover scale",
  },
  {
    id: 3,
    name: "WGA Pure Photography Grid",
    badge: "Pure Visual",
    desc: "Uncluttered photography with zero text overlays on the image; titles and metadata sit in clean bottom captions",
  },
  {
    id: 4,
    name: "WGA Filmstrip Play Cursor",
    badge: "Play Cursor",
    desc: "Features We Go Again's signature play chevron glyph, smooth opacity transitions, and filmstrip border styling",
  },
  {
    id: 5,
    name: "WGA Split Metadata Dossier",
    badge: "Case Study",
    desc: "Documentary case study format with category pill tags, crisp 1:1.414 poster proportions, and subtle dark vignettes",
  },
  {
    id: 6,
    name: "WGA Studio Monograph",
    badge: "Monograph",
    desc: "High-end art monograph layout with delicate corner hairline pips, date dateline, and letterspaced titles",
  },
  {
    id: 7,
    name: "WGA Horizontal Cinema Reel",
    badge: "Cinema Row",
    desc: "Wide horizontal card rows featuring 16:9 thumbnail previews on left and rich documentary metadata on right",
  },
  {
    id: 8,
    name: "WGA Contact Sheet Darkroom",
    badge: "Darkroom",
    desc: "Photographic contact sheet inspired by negative test strips with frame counts, red wax markers, and Kodak film edge markings",
  },
  {
    id: 9,
    name: "WGA Typographic Directory",
    badge: "Type First",
    desc: "Swiss editorial index prioritizing oversized typographic titles with inline duration pills and hover popover previews",
  },
  {
    id: 10,
    name: "WGA Swiss Modernist Grid",
    badge: "Swiss Grid",
    desc: "Strict 1960s International Typographic grid with crisp white horizontal dividing rules and high-contrast sans headers",
  },
  {
    id: 11,
    name: "WGA Vinyl Gatefold Sleeve",
    badge: "Vinyl 12\"",
    desc: "Square 1:1 album jacket presentation with vinyl groove peek animation and record label catalog numbering",
  },
  {
    id: 12,
    name: "WGA Broadcast Control Deck",
    badge: "OB Truck",
    desc: "Live broadcast studio monitors with flashing TALLY REC beacons, camera channel tags (CAM-01), and audio VU bars",
  },
  {
    id: 13,
    name: "WGA Frosted Glass Deck",
    badge: "Elva Glass",
    desc: "Ultra-modern Elva frosted glass floating cards with laser gradient hover borders, glowing status dots, and pill capsules",
  },
  {
    id: 14,
    name: "WGA Backstage VIP Laminate",
    badge: "Tour Pass",
    desc: "Authentic VIP concert pass format with barcode serials, lanyard slot punchouts, and venue access level tags",
  },
  {
    id: 15,
    name: "WGA Minimalist Hairline Matrix",
    badge: "Hairline",
    desc: "Ultra-refined hairline grid with 0.5px borders, micro-typography, minimal dot status indicators, and clean spacing",
  },
  {
    id: 16,
    name: "WGA CRT Teletext Terminal",
    badge: "CRT 1985",
    desc: "Retro analog broadcast terminal with phosphor amber/cyan accents, scanline raster lines, and mono character spacing",
  },
  {
    id: 17,
    name: "WGA Stadium Arena Billboard",
    badge: "Arena LED",
    desc: "High-impact arena LED marquee cards with dynamic stadium lighting glow, bold condensed typography, and animated pulse dots",
  },
  {
    id: 18,
    name: "WGA Confidential Band Archive",
    badge: "Vault File",
    desc: "Declassified archival case file cards with Manila tint highlights, confidential stamps, and master tape verification tags",
  },
  {
    id: 19,
    name: "WGA Director Storyboard Strip",
    badge: "Storyboard",
    desc: "Cinematographer storyboard sketch frames with handwritten style director notes, camera angles, and timing markers",
  },
  {
    id: 20,
    name: "WGA 3D Perspective Coverflow",
    badge: "Coverflow",
    desc: "Dimensional perspective tilted cards with smooth depth perspective, active card elevation, and glowing neon reflection shadows",
  },
];

interface MediaRailLayoutsProps {
  layoutId: number;
  activeItem: MediaVaultItem;
  onSelectItem: (item: MediaVaultItem) => void;
  bandMedia: MediaVaultItem[];
  fanMedia: MediaVaultItem[];
  activeTab: "all" | "band" | "fan";
  thumbFor: (item: MediaVaultItem) => string;
}

export default function MediaRailLayouts({
  layoutId,
  activeItem,
  onSelectItem,
  bandMedia,
  fanMedia,
  activeTab,
  thumbFor,
}: MediaRailLayoutsProps) {
  // Combine items when viewing "all" or specific tab
  const activeItems =
    activeTab === "band" ? bandMedia : activeTab === "fan" ? fanMedia : [...bandMedia, ...fanMedia];

  // Helper for 2-digit zero padded indices
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // =========================================================================
  // 1. WGA UNDISPUTED CARTOUCHE (AUTHENTIC WE GO AGAIN WORK ARCHETYPE)
  // =========================================================================
  if (layoutId === 1) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "opacity-100 ring-1 ring-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.8)] scale-[1.01]"
                  : "opacity-65 hover:opacity-100 hover:scale-[1.005]"
              }`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0c0c0e]">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono font-medium text-white/80 border border-white/10">
                  {item.duration}
                </div>
                <div className="absolute bottom-3 inset-x-3 text-left">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-white/60 mb-0.5">
                    {item.badge}
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1 leading-snug tracking-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 2. WGA NUMBERED POSTER INDEX (ARCHIVAL [01/26] MONO NUMBERING)
  // =========================================================================
  if (layoutId === 2) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-200 bg-[#0d0918] ${
                isSelected
                  ? "border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.2)] opacity-100"
                  : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[10px] font-mono text-white/80">
                  <span className={`px-1.5 py-0.5 rounded ${isSelected ? "bg-amber-400 text-black font-extrabold" : "bg-black/60 text-white/80 border border-white/15"}`}>
                    [{pad(idx + 1)}/{pad(activeItems.length)}]
                  </span>
                  <span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded border border-white/15">
                    {item.duration}
                  </span>
                </div>
                <div className="absolute bottom-2.5 inset-x-2.5">
                  <div className="text-[9px] font-mono uppercase text-amber-300 font-bold mb-0.5">
                    {item.badge}
                  </div>
                  <h3 className="font-extrabold text-xs text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5">
                    {item.credits.venue ? item.credits.venue.split(",")[0] : item.subtitle}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 3. WGA PURE PHOTOGRAPHY GRID (ZERO OVERLAYS ON IMAGE, CLEAN CAPTIONS BELOW)
  // =========================================================================
  if (layoutId === 3) {
    return (
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group flex flex-col text-left transition-all duration-200 ${
                isSelected ? "opacity-100 scale-[1.01]" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black mb-2 transition-all ${
                isSelected ? "ring-2 ring-white shadow-xl" : "ring-1 ring-white/15 group-hover:ring-white/40"
              }`}>
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-white/50 mb-0.5">
                <span className="uppercase tracking-wider font-semibold text-purple-300">{item.badge}</span>
                <span>{item.duration}</span>
              </div>
              <h3 className="font-extrabold text-xs text-white line-clamp-1 leading-snug">
                {item.title}
              </h3>
              <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5 font-light">
                {item.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 4. WGA FILMSTRIP PLAY CURSOR (16:9 REEL + HOVER PLAY GLYPH)
  // =========================================================================
  if (layoutId === 4) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-200 bg-[#07050d] ${
                isSelected
                  ? "border-purple-400 ring-1 ring-purple-400 shadow-xl opacity-100"
                  : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? "bg-purple-600 text-white scale-110 shadow-lg" : "bg-black/60 text-white/80 group-hover:scale-110 group-hover:bg-white group-hover:text-black"
                  }`}>
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-white/90">
                  {item.duration}
                </div>
              </div>
              <div className="p-2.5">
                <div className="text-[9px] font-mono uppercase tracking-wider text-purple-300 font-semibold mb-0.5">
                  {item.badge} • {item.year}
                </div>
                <h3 className="font-extrabold text-xs text-white line-clamp-1">
                  {item.title}
                </h3>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 5. WGA SPLIT METADATA DOSSIER (CASE STUDY FORMAT)
  // =========================================================================
  if (layoutId === 5) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl p-2.5 border transition-all duration-200 ${
                isSelected
                  ? "bg-white/[0.08] border-white/60 ring-1 ring-white/40 shadow-xl opacity-100"
                  : "bg-white/[0.03] border-white/10 opacity-65 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-black mb-2">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[8px] font-mono font-bold text-amber-300 border border-amber-400/30">
                  REF-{pad(idx + 1)}
                </div>
              </div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">
                {item.badge}
              </div>
              <h3 className="font-extrabold text-xs text-white line-clamp-1">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-[10px] text-white/50 font-mono mt-1 pt-1 border-t border-white/10">
                <span>{item.year}</span>
                <span>{item.duration}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 6. WGA STUDIO MONOGRAPH (CORNER HAIRLINE PIPS & LETTERSPACED TITLES)
  // =========================================================================
  if (layoutId === 6) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative aspect-[3/4] rounded-xl overflow-hidden text-left border transition-all duration-200 bg-[#090514] ${
                isSelected
                  ? "border-white/80 ring-1 ring-white/50 shadow-2xl opacity-100"
                  : "border-white/15 opacity-65 hover:opacity-100 hover:border-white/35"
              }`}
            >
              <img
                src={thumbFor(item)}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20" />
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/40 pointer-events-none" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/40 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/40 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/40 pointer-events-none" />
              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[8px] font-mono text-white/70 uppercase tracking-widest">
                <span>{item.credits.release ? "RELEASE" : "VAULT"}</span>
                <span>{item.duration}</span>
              </div>
              <div className="absolute bottom-3 inset-x-3">
                <div className="text-[8px] font-mono uppercase tracking-widest text-purple-300 mb-1">
                  {item.badge}
                </div>
                <div className="font-extrabold text-xs uppercase text-white line-clamp-1 tracking-wider leading-snug">
                  {item.title}
                </div>
                <div className="text-[10px] text-white/60 line-clamp-1 mt-0.5 font-light">
                  {item.credits.venue || item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 7. WGA HORIZONTAL CINEMA REEL (1-COL WIDE HORIZONTAL ROWS)
  // =========================================================================
  if (layoutId === 7) {
    return (
      <div className="flex flex-col gap-2.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group flex items-center gap-3 p-2 rounded-xl text-left border transition-all duration-200 ${
                isSelected
                  ? "bg-white/[0.08] border-white/70 ring-1 ring-white/50 opacity-100 shadow-xl"
                  : "bg-white/[0.02] border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-video w-32 sm:w-36 rounded-lg overflow-hidden shrink-0 bg-black">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[8px] text-white/90">
                  {item.duration}
                </div>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-purple-300 mb-0.5">
                  <span>{item.badge}</span>
                  <span>•</span>
                  <span>{item.year}</span>
                </div>
                <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">
                  {item.title}
                </h3>
                <p className="text-[10px] text-white/60 truncate mt-0.5 font-light">
                  {item.credits.venue || item.subtitle}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${isSelected ? "text-white translate-x-1" : "group-hover:translate-x-0.5"}`} />
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 8. WGA CONTACT SHEET DARKROOM (3-COL PHOTOGRAPHIC STRIP + RED WAX PENCIL)
  // =========================================================================
  if (layoutId === 8) {
    return (
      <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-black/80 border border-white/15">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-lg overflow-hidden border transition-all duration-200 ${
                isSelected
                  ? "border-red-500 ring-2 ring-red-500 shadow-xl opacity-100 scale-[1.02] z-10"
                  : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0a0a]">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1 left-1 font-mono text-[7px] text-white/70 tracking-tighter bg-black/70 px-1 rounded">
                  #{idx + 1}A
                </div>
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-mono text-red-500 text-xs font-black tracking-widest border border-red-500/80 px-1 rounded transform -rotate-12 bg-black/60">
                      ✓ PIC
                    </span>
                  </div>
                )}
                <div className="absolute bottom-1 inset-x-1">
                  <p className="text-[8px] font-mono text-white font-bold truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 9. WGA TYPOGRAPHIC DIRECTORY (OVERSIZED SWISS TITLE LIST WITH HOVER POPOVER)
  // =========================================================================
  if (layoutId === 9) {
    return (
      <div className="flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group py-2.5 px-2 flex items-center justify-between text-left transition-all duration-150 ${
                isSelected
                  ? "bg-white/10 text-white font-bold opacity-100 pl-3"
                  : "text-white/70 hover:text-white hover:bg-white/[0.04] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                  {pad(idx + 1)}
                </span>
                <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                  {item.title}
                </span>
                <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300 shrink-0 hidden sm:inline-block">
                  {item.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-zinc-400">
                <span>{item.duration}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 10. WGA SWISS MODERNIST GRID (HIGH CONTRAST BOLD DIVIDERS)
  // =========================================================================
  if (layoutId === 10) {
    return (
      <div className="grid grid-cols-2 gap-px bg-white/20 p-px rounded-xl overflow-hidden border border-white/20">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative aspect-[3/4] p-2 flex flex-col justify-between text-left bg-black transition-all ${
                isSelected ? "bg-zinc-900 opacity-100 ring-2 ring-white inset-0 z-10" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={thumbFor(item)}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 flex items-center justify-between text-[9px] font-mono">
                <span className="bg-white text-black font-extrabold px-1 py-0.2 rounded-xs">
                  {pad(idx + 1)}
                </span>
                <span className="text-white/80">{item.duration}</span>
              </div>
              <div className="relative z-10">
                <div className="text-[8px] font-mono uppercase text-red-400 font-bold tracking-widest mb-0.5">
                  {item.badge}
                </div>
                <h3 className="font-black text-xs uppercase text-white leading-tight line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 11. WGA VINYL GATEFOLD SLEEVE (1:1 VINYL RECORD JACKETS)
  // =========================================================================
  if (layoutId === 11) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative aspect-square rounded-lg overflow-hidden text-left border transition-all duration-200 shadow-xl ${
                isSelected
                  ? "border-amber-400/90 ring-2 ring-amber-400/50 opacity-100 scale-[1.01]"
                  : "border-white/15 opacity-70 hover:opacity-100 hover:border-white/40"
              }`}
            >
              <img
                src={thumbFor(item)}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-300 border border-white/10">
                <Disc className="w-2.5 h-2.5 text-amber-400 animate-[spin_4s_linear_infinite]" />
                <span>33 RPM</span>
              </div>
              <div className="absolute bottom-2.5 inset-x-2.5">
                <div className="text-[8px] font-mono uppercase tracking-widest text-amber-300 font-semibold mb-0.5">
                  {item.badge}
                </div>
                <h3 className="font-extrabold text-xs text-white line-clamp-1 leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-[9px] font-mono text-white/50 mt-1">
                  <span>{item.year}</span>
                  <span>{item.duration}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 12. WGA BROADCAST CONTROL DECK (TALLY REC & OB TRUCK MONITORS)
  // =========================================================================
  if (layoutId === 12) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-lg overflow-hidden border font-mono transition-all ${
                isSelected
                  ? "border-red-500 ring-1 ring-red-500 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : "border-white/15 opacity-65 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[8px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
                  <span className={isSelected ? "text-red-400 font-extrabold" : "text-zinc-400"}>
                    {isSelected ? "TALLY REC" : `CAM-${pad(idx + 1)}`}
                  </span>
                </div>
                <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded bg-black/80 text-[8px] text-white/90">
                  {item.duration}
                </div>
              </div>
              <div className="p-2 bg-neutral-950/80">
                <div className="text-[8px] text-zinc-400 uppercase truncate">
                  {item.badge}
                </div>
                <h3 className="font-bold text-xs text-white truncate mt-0.5">
                  {item.title}
                </h3>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 13. WGA FROSTED GLASS DECK (ELVA LABS AMBIENT PILL CAPSULES)
  // =========================================================================
  if (layoutId === 13) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-[16px] overflow-hidden border p-2 backdrop-blur-[10px] backdrop-saturate-[180%] transition-all duration-200 shadow-2xl ${
                isSelected
                  ? "bg-white/[0.09] border-white/60 ring-1 ring-white/50 opacity-100 scale-[1.01]"
                  : "bg-white/[0.04] border-white/10 opacity-70 hover:opacity-100 hover:bg-white/[0.08]"
              }`}
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black mb-2">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/90 border border-white/15">
                  <span className="w-1 h-1 rounded-full bg-white opacity-90" />
                  <span>{item.duration}</span>
                </div>
              </div>
              <div className="px-1">
                <div className="text-[9px] font-mono uppercase text-amber-300 font-semibold mb-0.5">
                  {item.badge}
                </div>
                <h3 className="font-extrabold text-xs text-white line-clamp-1">
                  {item.title}
                </h3>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 14. WGA BACKSTAGE VIP LAMINATE (TOUR PASS PUNCHOUT)
  // =========================================================================
  if (layoutId === 14) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-2xl overflow-hidden border p-2.5 transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-b from-purple-950/60 to-black border-purple-400 ring-2 ring-purple-500/50 opacity-100 shadow-2xl scale-[1.01]"
                  : "bg-black/60 border-white/15 opacity-70 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="w-8 h-1.5 mx-auto mb-2 rounded-full bg-white/20 border border-white/30" />
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black mb-2">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[8px] uppercase tracking-wider text-amber-400 font-extrabold border border-amber-400/40">
                  ALL ACCESS
                </div>
              </div>
              <div className="text-[8px] font-mono uppercase tracking-widest text-purple-300 font-bold mb-0.5">
                {item.badge}
              </div>
              <h3 className="font-black text-xs text-white uppercase line-clamp-1">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 mt-1 pt-1 border-t border-white/10">
                <span>PASS #{item.year}</span>
                <span>{item.duration}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 15. WGA MINIMALIST HAIRLINE MATRIX (0.5PX ARCHITECTURAL SPACING)
  // =========================================================================
  if (layoutId === 15) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-lg overflow-hidden border p-2 transition-all duration-200 ${
                isSelected
                  ? "border-white/90 bg-white/[0.06] opacity-100"
                  : "border-white/10 bg-transparent opacity-60 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-[3/4] w-full rounded overflow-hidden bg-black mb-1.5">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 mb-0.5">
                <span>{pad(idx + 1)}.</span>
                <span>{item.duration}</span>
              </div>
              <h3 className="font-semibold text-xs text-white truncate">
                {item.title}
              </h3>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 16. WGA CRT TELETEXT TERMINAL (PHOSPHOR AMBER & SCANLINE MONO)
  // =========================================================================
  if (layoutId === 16) {
    return (
      <div className="flex flex-col gap-2 font-mono">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? "bg-amber-950/40 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-100"
                  : "bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-amber-400 font-extrabold text-xs">
                  {`> ${pad(idx + 1)}`}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold uppercase truncate text-zinc-100 group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="text-[9px] text-zinc-500 uppercase truncate">
                    {item.badge} // {item.credits.venue ? item.credits.venue.split(",")[0] : "ARENA"}
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-amber-400 font-bold shrink-0 ml-2">
                [{item.duration}]
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 17. WGA STADIUM ARENA BILLBOARD (CONDENSED TYPE & ARENA STAGE GLOW)
  // =========================================================================
  if (layoutId === 17) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                isSelected
                  ? "border-amber-400 ring-2 ring-amber-400/50 opacity-100 shadow-[0_0_25px_rgba(251,191,36,0.4)] scale-[1.01]"
                  : "border-white/15 opacity-70 hover:opacity-100 hover:border-white/35"
              }`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-extrabold text-[8px] font-mono">
                  <Flame className="w-2.5 h-2.5 fill-current" />
                  <span>ARENA LIVE</span>
                </div>
                <div className="absolute bottom-2.5 inset-x-2.5">
                  <h3 className="font-black text-sm uppercase text-white tracking-tighter leading-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-300 mt-1">
                    <span>{item.year}</span>
                    <span>{item.duration}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 18. WGA CONFIDENTIAL BAND ARCHIVE (CASE DOSSIER WITH RUBBER STAMP)
  // =========================================================================
  if (layoutId === 18) {
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl p-3 border font-mono transition-all ${
                isSelected
                  ? "bg-[#181410] border-amber-500/80 ring-1 ring-amber-400/40 shadow-xl opacity-100"
                  : "bg-[#0f0c08] border-amber-900/30 opacity-70 hover:opacity-100 hover:border-amber-700/50"
              }`}
            >
              <div className="flex items-center justify-between text-[8px] text-amber-300 font-bold mb-1.5 pb-1 border-b border-amber-500/20">
                <span>CASE #{pad(idx + 101)}</span>
                <span className="text-zinc-500">{item.duration}</span>
              </div>
              <div className="relative aspect-[3/4] w-full rounded overflow-hidden bg-black mb-2">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="text-[8px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">
                {item.badge}
              </div>
              <h3 className="font-extrabold text-xs text-zinc-100 truncate">
                {item.title}
              </h3>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 19. WGA DIRECTOR STORYBOARD STRIP (SKETCH NOTES & CINEMATOGRAPHY)
  // =========================================================================
  if (layoutId === 19) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {activeItems.map((item, idx) => {
          const isSelected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative text-left rounded-xl overflow-hidden border p-2 transition-all ${
                isSelected
                  ? "bg-white/[0.08] border-cyan-400/80 ring-1 ring-cyan-400/50 opacity-100 shadow-xl"
                  : "bg-white/[0.03] border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <div className="relative aspect-video w-full rounded overflow-hidden bg-black mb-1.5">
                <img
                  src={thumbFor(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[7px] text-cyan-300">
                  FRAME {pad(idx + 1)}
                </div>
              </div>
              <div className="text-[8px] font-mono text-cyan-300 uppercase tracking-wider mb-0.5">
                {item.badge}
              </div>
              <h3 className="font-bold text-xs text-white truncate">
                {item.title}
              </h3>
              <p className="text-[9px] text-zinc-400 line-clamp-1 italic mt-0.5">
                &ldquo;{item.tagline}&rdquo;
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // 20. WGA 3D PERSPECTIVE COVERFLOW (ELEVATED 3D CARDS & NEON GLOW)
  // =========================================================================
  return (
    <div className="grid grid-cols-2 gap-4 perspective-[1000px]">
      {activeItems.map((item) => {
        const isSelected = item.id === activeItem.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item)}
            className={`group relative text-left rounded-2xl overflow-hidden border transition-all duration-300 transform ${
              isSelected
                ? "border-purple-400 ring-2 ring-purple-500/60 shadow-[0_15px_40px_rgba(168,85,247,0.4)] opacity-100 scale-105 -translate-y-1 z-10"
                : "border-white/15 opacity-65 hover:opacity-100 hover:border-white/40 hover:-translate-y-0.5"
            }`}
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
              <img
                src={thumbFor(item)}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md text-[9px] font-mono text-purple-200 border border-purple-400/40">
                {item.duration}
              </div>
              <div className="absolute bottom-3 inset-x-3">
                <div className="text-[9px] font-mono uppercase text-purple-300 font-bold mb-0.5">
                  {item.badge}
                </div>
                <h3 className="font-black text-xs sm:text-sm text-white line-clamp-1 leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
