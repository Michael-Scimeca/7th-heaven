"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DotChevronDown,
} from "@/components/ui/DotArrow";
import {
  ChevronDown,
  Check,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Search,
  Command,
  Radio,
  Layers,
  Zap,
} from "lucide-react";

export interface SingleDropdownShowcaseProps {
  className?: string;
}

const CITIES = [
  { id: "all", name: "ALL LOCATIONS", state: "ALL", count: 38 },
  { id: "chicago", name: "CHICAGO, IL", state: "IL", count: 12 },
  { id: "naperville", name: "NAPERVILLE, IL", state: "IL", count: 8 },
  { id: "milwaukee", name: "MILWAUKEE, WI", state: "WI", count: 5 },
  { id: "schaumburg", name: "SCHAUMBURG, IL", state: "IL", count: 6 },
  { id: "geneva", name: "GENEVA, IL", state: "IL", count: 4 },
  { id: "aurora", name: "AURORA, IL", state: "IL", count: 3 },
];

export default function SingleDropdownShowcase({
  className = "",
}: SingleDropdownShowcaseProps) {
  const [selectedCity, setSelectedCity] = useState("all");
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");
  const [openStyle, setOpenStyle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenStyle(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenStyle(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeCityObj = CITIES.find((c) => c.id === selectedCity) || CITIES[0];
  const displayLabel = selectedCity === "all" ? "LOCATION" : activeCityObj.name;

  const filteredCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleDropdown = (styleIndex: number) => {
    setOpenStyle((prev) => (prev === styleIndex ? null : styleIndex));
    setSearchQuery("");
  };

  const handleSelect = (cityId: string) => {
    setSelectedCity(cityId);
    setOpenStyle(null);
  };

  const STYLES = [
    {
      id: 1,
      name: "Cyber Obsidian / Electric Aura",
      tag: "Direct Screenshot Match",
      desc: "Deep obsidian velvet base framed with an ambient electric purple glow, pulsing neon fuchsia status pip, and a luminous popover panel.",
      badgeColor: "border-purple-500/40 bg-purple-500/20 text-purple-300",
    },
    {
      id: 2,
      name: "Apple VisionOS Frosted Glass",
      tag: "Ultra Glassmorphism",
      desc: "High-specular glass capsule with top rim light reflections, frosted ambient backdrop blur, and crystalline pill checkmarks.",
      badgeColor: "border-cyan-500/40 bg-cyan-500/20 text-cyan-300",
    },
    {
      id: 3,
      name: "Linear / Raycast Tactile HUD",
      tag: "Site Cosmic Violet",
      desc: "Matte obsidian capsule with purple rim light, live filter search input, keyboard shortcuts (⌘K), and tactile site-themed feedback.",
      badgeColor: "border-purple-500/40 bg-purple-500/20 text-purple-300",
    },
    {
      id: 4,
      name: "Segmented Split Chamber",
      tag: "Dual-Action Pill",
      desc: "Distinct two-chamber container separating the label from the chevron with a razor-thin hairline divider and independent hover dynamics.",
      badgeColor: "border-amber-500/40 bg-amber-500/20 text-amber-300",
    },
    {
      id: 5,
      name: "Sunset Horizon / Prismatic Aura",
      tag: "Stage Light Spectrum",
      desc: "Vibrant iridescent gradient border blending neon magenta, electric violet, and deep indigo with rich glowing concert illumination.",
      badgeColor: "border-pink-500/40 bg-pink-500/20 text-pink-300",
    },
    {
      id: 6,
      name: "Hard Rock Backstage / Industrial Chic",
      tag: "Concert Venue Raw",
      desc: "Brutalist metallic micro-borders, blinking live stage amber pip, heavyweight condensed tracking, and tour city count badges.",
      badgeColor: "border-orange-500/40 bg-orange-500/20 text-orange-300",
    },
    {
      id: 7,
      name: "Minimalist Floating Pill",
      tag: "Clean & Weightless",
      desc: "Borderless ultra-smooth capsule floating on an ambient purple shadow field with pure typography and generous touch comfort.",
      badgeColor: "border-blue-500/40 bg-blue-500/20 text-blue-300",
    },
    {
      id: 8,
      name: "Bento Matrix Card Grid",
      tag: "Visual Rich Cards",
      desc: "Capsule trigger that unrolls into an organized 2-column Bento grid showcasing cities with show count badges and state pills.",
      badgeColor: "border-violet-500/40 bg-violet-500/20 text-violet-300",
    },
  ];

  return (
    <section
      ref={containerRef}
      aria-label="Location Dropdown Styles Showcase"
      className={`flex flex-col gap-10 ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/20 px-3 py-0.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> 8 Location Dropdown Styles
            </span>
            <span className="text-xs text-white/50">Single-Select Pill Variations</span>
          </div>
          <h2 className="mt-2 font-black tracking-tight text-white">
            Location Dropdown Selector Styles
          </h2>
          <p className="mt-1 text-xs text-white/60 max-w-3xl leading-relaxed">
            Comparing 8 distinct visual and interaction designs for the <code className="text-purple-300 font-mono">LOCATION</code> filter pill.
            Click each trigger to inspect the open menu animations, hover states, and glass highlights.
          </p>
        </div>

        {/* Style quick filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all ${activeFilter === "all"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
              : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
          >
            All 8 Styles
          </button>
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveFilter(s.id)}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold transition-all ${activeFilter === s.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}
            >
              0{s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Styles */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* ========================================================================= */}
        {/* STYLE 1: Cyber Obsidian / Electric Aura */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 1) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-purple-500/25 bg-[#0f071f]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/30 text-xs font-black text-purple-300">
                    01
                  </span>
                  <span className="text-sm font-bold text-white">Cyber Obsidian / Electric Aura</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[0].badgeColor}`}>
                  {STYLES[0].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[0].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#07030e]/70 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                {/* Dropdown Container */}
                <div className="relative mt-4 w-full max-w-[340px]">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openStyle === 1}
                    onClick={() => toggleDropdown(1)}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${openStyle === 1
                      ? "border-purple-400 bg-[#160a2c] text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/50"
                      : "border-purple-500/30 bg-[#0e071c] text-white/90 hover:border-purple-400/60 hover:bg-[#150a2b] hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                      }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.9)] animate-pulse" />
                      <span className="truncate">{displayLabel}</span>
                    </span>
                    <DotChevronDown
                      className={`h-3 w-3 shrink-0 text-purple-300 transition-transform duration-300 ${openStyle === 1 ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Menu Popover */}
                  {openStyle === 1 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-purple-500/40 bg-[#110826]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-2xl duration-200 animate-in fade-in zoom-in-95">
                      <ul role="menu" className="flex max-h-[220px] flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                        {CITIES.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${selectedCity === c.id
                                ? "border border-purple-400/60 bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${selectedCity === c.id ? "bg-fuchsia-400 shadow-[0_0_6px_#f43f5e]" : "bg-white/20"
                                    }`}
                                />
                                <span>{c.name}</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                                  {c.count} shows
                                </span>
                                {selectedCity === c.id && <Check className="h-3.5 w-3.5 text-purple-300" />}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 2: Apple VisionOS Frosted Glass */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 2) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600/30 text-xs font-black text-cyan-300">
                    02
                  </span>
                  <span className="text-sm font-bold text-white">Apple VisionOS Frosted Glass</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[1].badgeColor}`}>
                  {STYLES[1].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[1].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openStyle === 2}
                    onClick={() => toggleDropdown(2)}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-t-white/30 border-b-white/10 border-x-white/20 bg-white/[0.08] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.14] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.3)] ${openStyle === 2 ? "ring-2 ring-cyan-400/50 bg-white/[0.18]" : ""
                      }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                      <span className="truncate">{displayLabel}</span>
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-cyan-200 transition-transform duration-300 ${openStyle === 2 ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Menu Popover */}
                  {openStyle === 2 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-t-white/30 border-white/15 bg-neutral-900/90 p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl duration-200 animate-in fade-in zoom-in-95">
                      <ul role="menu" className="flex max-h-[220px] flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                        {CITIES.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${selectedCity === c.id
                                ? "border border-cyan-400/40 bg-cyan-500/20 text-white shadow-sm"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <span>{c.name}</span>
                              {selectedCity === c.id && <Check className="h-3.5 w-3.5 text-cyan-300" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 3: Linear & Raycast Tactile HUD */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 3) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-purple-500/25 bg-[#0e0720]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-400/40 hover:shadow-purple-950/40">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/30 text-xs font-black text-purple-300">
                    03
                  </span>
                  <span className="text-sm font-bold text-white">Linear / Raycast Tactile HUD</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[2].badgeColor}`}>
                  {STYLES[2].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[2].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openStyle === 3}
                    onClick={() => toggleDropdown(3)}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-purple-500/35 bg-[#0a0518] px-4 py-2 text-xs font-mono font-medium tracking-wide text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-150 hover:bg-[#130728] hover:text-white active:scale-[0.98] ${openStyle === 3 ? "border-purple-400 ring-2 ring-purple-500/35 text-white shadow-[0_0_18px_rgba(168,85,247,0.35)]" : ""
                      }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                      <span className="truncate">{displayLabel}</span>
                    </span>
                    <span className="flex items-center text-purple-300/70">
                      <ChevronDown
                        className={`h-3 w-3 text-purple-300 transition-transform duration-200 ${openStyle === 3 ? "rotate-180" : ""
                          }`}
                      />
                    </span>
                  </button>

                  {/* Menu Popover with Search Filter */}
                  {openStyle === 3 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-purple-500/35 bg-[#0c061e]/98 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(168,85,247,0.25)] backdrop-blur-2xl duration-150 animate-in fade-in zoom-in-95">
                      <div className="relative mb-2.5 px-0.5">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-purple-300/60" />
                        <input
                          type="text"
                          placeholder="Search locations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="w-full rounded-xl border border-purple-500/30 bg-purple-950/40 py-2 pr-3 pl-9 text-xs text-white placeholder-purple-300/40 outline-none transition-colors focus:border-purple-400 focus:bg-purple-950/70 focus:ring-1 focus:ring-purple-400/40"
                        />
                      </div>
                      <ul role="menu" className="flex max-h-[190px] flex-col gap-0.5 overflow-y-auto custom-scrollbar p-0.5">
                        {filteredCities.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-mono transition-colors ${selectedCity === c.id
                                ? "border border-purple-400/50 bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                                : "text-purple-100/80 hover:bg-purple-900/30 hover:text-white"
                                }`}
                            >
                              <span className="flex items-center gap-2">
                                {selectedCity === c.id && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                                )}
                                <span>{c.name}</span>
                              </span>
                              <span className="rounded bg-purple-950/60 border border-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-300">
                                {c.count}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 4: Segmented Split Chamber */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 4) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-amber-500/25 bg-[#140f07]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600/30 text-xs font-black text-amber-300">
                    04
                  </span>
                  <span className="text-sm font-bold text-white">Segmented Split Chamber</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[3].badgeColor}`}>
                  {STYLES[3].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[3].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  {/* Segmented Dual-Chamber Pill */}
                  <div
                    className={`inline-flex w-full items-stretch rounded-full border border-white/15 bg-white/[0.05] p-0.5 shadow-md transition-all duration-200 hover:border-amber-400/50 ${openStyle === 4 ? "border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.3)]" : ""
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown(4)}
                      className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-l-full px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-white/10"
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                      <span className="truncate">{displayLabel}</span>
                    </button>
                    {/* Vertical Divider Hairline */}
                    <div className="my-1.5 w-[1px] bg-white/20" />
                    <button
                      type="button"
                      aria-label="Toggle options"
                      onClick={() => toggleDropdown(4)}
                      className="flex cursor-pointer items-center justify-center rounded-r-full px-3 text-amber-300 transition-colors hover:bg-white/10"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${openStyle === 4 ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Menu Popover */}
                  {openStyle === 4 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-amber-500/30 bg-[#161005]/95 p-2 shadow-2xl backdrop-blur-2xl duration-200 animate-in fade-in zoom-in-95">
                      <ul role="menu" className="flex max-h-[220px] flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                        {CITIES.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${selectedCity === c.id
                                ? "border border-amber-400/50 bg-amber-500/20 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <span>{c.name}</span>
                              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                                {c.count} shows
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 5: Sunset Horizon / Prismatic Aura */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 5) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-pink-500/25 bg-[#170617]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600/30 text-xs font-black text-pink-300">
                    05
                  </span>
                  <span className="text-sm font-bold text-white">Sunset Horizon / Prismatic Aura</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[4].badgeColor}`}>
                  {STYLES[4].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[4].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  {/* Prismatic Gradient Outer Border Wrapper */}
                  <div
                    className={`rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-[1.5px] shadow-lg transition-all duration-300 ${openStyle === 5 ? "shadow-[0_0_25px_rgba(236,72,153,0.5)] scale-[1.01]" : ""
                      }`}
                  >
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={openStyle === 5}
                      onClick={() => toggleDropdown(5)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-full bg-[#120417] px-5 py-2 text-xs font-extrabold tracking-widest text-white uppercase transition-colors hover:bg-[#190620]"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899] animate-pulse" />
                        <span className="truncate">{displayLabel}</span>
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-pink-300 transition-transform duration-300 ${openStyle === 5 ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Menu Popover */}
                  {openStyle === 5 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-pink-500/40 bg-[#16051c]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(236,72,153,0.3)] backdrop-blur-2xl duration-200 animate-in fade-in zoom-in-95">
                      <ul role="menu" className="flex max-h-[220px] flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                        {CITIES.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${selectedCity === c.id
                                ? "border border-pink-400/50 bg-gradient-to-r from-pink-600/30 to-purple-600/30 text-white shadow-sm"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <span>{c.name}</span>
                              <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] text-pink-300">
                                {c.count}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 6: Hard Rock Backstage / Industrial Chic */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 6) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-orange-500/25 bg-[#140c06]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/30 text-xs font-black text-orange-300">
                    06
                  </span>
                  <span className="text-sm font-bold text-white">Hard Rock Backstage / Industrial Chic</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[5].badgeColor}`}>
                  {STYLES[5].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[5].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/70 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openStyle === 6}
                    onClick={() => toggleDropdown(6)}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-orange-500/40 bg-zinc-950 px-5 py-2.5 text-xs font-black tracking-widest text-zinc-100 uppercase transition-all duration-200 hover:border-orange-400 hover:bg-zinc-900 ${openStyle === 6 ? "border-orange-400 ring-2 ring-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.35)]" : ""
                      }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-ping" />
                      <span className="truncate">{displayLabel}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-orange-400">TOUR</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-orange-400 transition-transform duration-200 ${openStyle === 6 ? "rotate-180" : ""
                          }`}
                      />
                    </span>
                  </button>

                  {/* Menu Popover */}
                  {openStyle === 6 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-orange-500/40 bg-zinc-950 p-2 shadow-2xl backdrop-blur-2xl duration-150 animate-in fade-in zoom-in-95">
                      <ul role="menu" className="flex max-h-[220px] flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                        {CITIES.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black tracking-wider transition-all ${selectedCity === c.id
                                ? "border border-orange-500 bg-orange-500/25 text-white"
                                : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                                }`}
                            >
                              <span>{c.name}</span>
                              <span className="font-mono text-[10px] text-orange-400">{c.count} DATES</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 7: Minimalist Floating Pill */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 7) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-blue-500/25 bg-[#080d1a]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 text-xs font-black text-blue-300">
                    07
                  </span>
                  <span className="text-sm font-bold text-white">Minimalist Floating Pill</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[6].badgeColor}`}>
                  {STYLES[6].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[6].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openStyle === 7}
                    onClick={() => toggleDropdown(7)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-full bg-blue-950/40 px-5 py-2.5 text-xs font-bold tracking-wider text-blue-100 uppercase shadow-lg shadow-black/50 transition-all duration-200 hover:bg-blue-900/50 hover:text-white ${openStyle === 7 ? "bg-blue-900/70 text-white ring-1 ring-blue-400/40" : ""
                      }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      <span className="truncate">{displayLabel}</span>
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-blue-300 transition-transform duration-200 ${openStyle === 7 ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Menu Popover */}
                  {openStyle === 7 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full rounded-2xl border border-white/10 bg-[#070b16]/98 p-2 shadow-2xl backdrop-blur-2xl duration-150 animate-in fade-in zoom-in-95">
                      <ul role="menu" className="flex max-h-[220px] flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                        {CITIES.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(c.id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${selectedCity === c.id
                                ? "bg-blue-600/30 text-white font-bold"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <span>{c.name}</span>
                              {selectedCity === c.id && <Check className="h-3.5 w-3.5 text-blue-300" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STYLE 8: Bento Matrix Card Grid */}
        {/* ========================================================================= */}
        {(activeFilter === "all" || activeFilter === 8) && (
          <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-violet-500/25 bg-[#110722]/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-black text-violet-300">
                    08
                  </span>
                  <span className="text-sm font-bold text-white">Bento Matrix Card Grid</span>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[7].badgeColor}`}>
                  {STYLES[7].tag}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{STYLES[7].desc}</p>

              {/* Interactive Demo Area */}
              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6">
                <span className="absolute top-3 left-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Interactive Live Trigger:
                </span>

                <div className="relative mt-4 w-full max-w-[340px]">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openStyle === 8}
                    onClick={() => toggleDropdown(8)}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-violet-500/40 bg-[#170a2c] px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white shadow-md transition-all duration-300 hover:border-violet-400 hover:bg-[#1f0d3b] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] ${openStyle === 8 ? "border-violet-400 ring-2 ring-violet-500/40" : ""
                      }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-violet-400" />
                      <span className="truncate">{displayLabel}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="rounded-full bg-violet-500/25 px-2 py-0.5 text-[10px] font-mono text-violet-300">
                        {activeCityObj.count}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-violet-300 transition-transform duration-300 ${openStyle === 8 ? "rotate-180" : ""
                          }`}
                      />
                    </span>
                  </button>

                  {/* 2-Column Bento Matrix Popover */}
                  {openStyle === 8 && (
                    <div className="absolute top-[calc(100%+8px)] -left-8 sm:left-0 z-50 w-[360px] max-w-[90vw] rounded-2xl border border-violet-500/40 bg-[#140828]/98 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(139,92,246,0.25)] backdrop-blur-2xl duration-200 animate-in fade-in zoom-in-95">
                      <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-violet-300/80">
                        Select Tour City &amp; Market:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                        {CITIES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelect(c.id)}
                            className={`flex flex-col items-start gap-1 rounded-xl p-2.5 text-left transition-all ${selectedCity === c.id
                              ? "border border-violet-400 bg-violet-600/30 text-white shadow-sm"
                              : "border border-white/5 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                              }`}
                          >
                            <span className="text-xs font-bold leading-tight truncate w-full">{c.name}</span>
                            <span className="flex items-center justify-between w-full text-[10px] text-violet-300/70">
                              <span>{c.state}</span>
                              <span className="font-mono">{c.count} shows</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
