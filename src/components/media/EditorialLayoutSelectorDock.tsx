"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Check,
  Layers,
} from "lucide-react";

export interface EditorialLayoutItem {
  id: number;
  number: string;
  name: string;
  tag: string;
  tagColor: string;
  desc: string;
}

export const TWENTY_EDITORIAL_LAYOUTS: EditorialLayoutItem[] = [
  {
    id: 61,
    number: "01",
    name: "JJettas Off-Field Flagship",
    tag: "JJETTAS OFF-FIELD",
    tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    desc: "Colossal 'OFF / STAGE' typography split, gold signature flourish, tilted photo card, statement quote, and continuous panoramic strip.",
  },
  {
    id: 9,
    number: "02",
    name: "Modernist Magazine Editorial",
    tag: "HIGH-FASHION Z-PATTERN",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    desc: "Asymmetric high-fashion editorial layout: offset video player, overlapping narrative pull-quote, and staggered media cards.",
  },
  {
    id: 7,
    number: "03",
    name: "Swiss Typographic Directory",
    tag: "SWISS EDITORIAL",
    tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    desc: "Oversized bold numbered titles directory (65%) with hover video triggers and right floating sticky monitor (35%).",
  },
  {
    id: 1,
    number: "04",
    name: "WGA Undisputed Case Study",
    tag: "WGA CANONICAL",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    desc: "Left editorial dossier with hairline dividers, floating central video player, and horizontal bottom poster cartouche drawer.",
  },
  {
    id: 2,
    number: "05",
    name: "50/50 Monolithic Split Screen",
    tag: "50/50 SPLIT",
    tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    desc: "Pure edge-to-edge 50vw/50vw split: left full-height sticky player, right independent scrollable narrative dossier.",
  },
  {
    id: 6,
    number: "06",
    name: "Horizontal Filmstrip Carousel",
    tag: "CINE FILMSTRIP",
    tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    desc: "Top spotlight video player with ambient bleed + bottom continuous horizontal snapping filmstrip slider.",
  },
  {
    id: 8,
    number: "07",
    name: "Darkroom 35mm Contact Sheet",
    tag: "DARKROOM 35MM",
    tagColor: "bg-red-500/20 text-red-300 border-red-500/40",
    desc: "Immersive 4-column photo-lab contact sheet wall with frame numbers, red grease marks, and top sticky player ribbon.",
  },
  {
    id: 13,
    number: "08",
    name: "Vinyl Gatefold & Spinning Record",
    tag: "VINYL JACKET",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    desc: "Square vinyl jacket with sliding spinning record and video center label; right gatefold liner notes & setlist.",
  },
  {
    id: 15,
    number: "09",
    name: "Chronological Era Timeline",
    tag: "ERA TIMELINE",
    tagColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    desc: "Interactive 1977–2025 horizontal timeline ruler scrubbing through eras with connected video milestone node cards.",
  },
  {
    id: 16,
    number: "10",
    name: "Classified Manila Case Dossier",
    tag: "CLASSIFIED",
    tagColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    desc: "Archival confidential dossier with paper clips, verification stamps, redacted lines, and tape markers.",
  },
  {
    id: 18,
    number: "11",
    name: "Scrollable Narrative Story",
    tag: "NARRATIVE PROSE",
    tagColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    desc: "Editorial long-form scroll with sticky media player and immersive retrospective prose.",
  },
  {
    id: 19,
    number: "12",
    name: "3D Perspective Coverflow",
    tag: "3D COVERFLOW",
    tagColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
    desc: "3D perspective album coverflow with depth reflection, angle easing, and center spotlight.",
  },
  {
    id: 20,
    number: "13",
    name: "Asymmetric Editorial Bento",
    tag: "EDITORIAL BENTO",
    tagColor: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    desc: "Dynamic bento grid with asymmetric aspect ratios, quote cards, and responsive media tiles.",
  },
  {
    id: 23,
    number: "14",
    name: "Spotlight Theatre Marquee",
    tag: "THEATRE MARQUEE",
    tagColor: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    desc: "Vintage Chicago theater canopy marquee with incandescent chase lights and bold typography.",
  },
  {
    id: 25,
    number: "15",
    name: "Sunset Strip Billboard Stack",
    tag: "BILLBOARD STACK",
    tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    desc: "Colossal stacked billboard cards inspired by Sunset Strip music and concert advertisements.",
  },
  {
    id: 29,
    number: "16",
    name: "Festival Mainstage Lineup",
    tag: "FESTIVAL LINEUP",
    tagColor: "bg-lime-500/20 text-lime-300 border-lime-500/40",
    desc: "Mainstage festival lineup poster layout with tiered headliner billing and festival stage stamps.",
  },
  {
    id: 38,
    number: "17",
    name: "Magazine Lookbook Showcase",
    tag: "LOOKBOOK",
    tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    desc: "Highsnobiety / Vogue style editorial lookbook with bold pull quotes and full-bleed photography.",
  },
  {
    id: 47,
    number: "18",
    name: "Editorial Archival Dossier (1-Col)",
    tag: "ARCHIVAL 1-COL",
    tagColor: "bg-zinc-400/20 text-zinc-300 border-zinc-400/40",
    desc: "Long-form storytelling with oversized venue stamps, single-column reading flow, and master player.",
  },
  {
    id: 52,
    number: "19",
    name: "21:9 Panoramic Stage & Roller",
    tag: "21:9 CINEMA",
    tagColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    desc: "Ultra-wide 21:9 cinema monitor on top + single continuous horizontal roller track below.",
  },
  {
    id: 62,
    number: "20",
    name: "JJettas Luxury Exhibit Canvas",
    tag: "MUSEUM EXHIBIT",
    tagColor: "bg-purple-400/20 text-purple-200 border-purple-400/40",
    desc: "Panoramic museum exhibit canvas with stone frontman hero card, turf accents, and origin narrative.",
  },
];

interface EditorialLayoutSelectorDockProps {
  activeLayoutId: number;
  setActiveLayoutId: (id: number) => void;
}

export default function EditorialLayoutSelectorDock({
  activeLayoutId,
  setActiveLayoutId,
}: EditorialLayoutSelectorDockProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Find active item within our 20 curated layouts
  const currentIndex = TWENTY_EDITORIAL_LAYOUTS.findIndex(
    (l) => l.id === activeLayoutId,
  );
  const currentLayout =
    currentIndex !== -1
      ? TWENTY_EDITORIAL_LAYOUTS[currentIndex]
      : TWENTY_EDITORIAL_LAYOUTS[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx =
      (currentIndex - 1 + TWENTY_EDITORIAL_LAYOUTS.length) %
      TWENTY_EDITORIAL_LAYOUTS.length;
    setActiveLayoutId(TWENTY_EDITORIAL_LAYOUTS[prevIdx].id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % TWENTY_EDITORIAL_LAYOUTS.length;
    setActiveLayoutId(TWENTY_EDITORIAL_LAYOUTS[nextIdx].id);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* ── Prominent Top Floating Layout Bar (Always visible right under header) ── */}
      <div className="fixed top-20 sm:top-22 left-1/2 -translate-x-1/2 z-[45] pointer-events-auto w-full max-w-4xl px-3">
        <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/85 hover:bg-black/95 border border-purple-500/40 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(158,109,233,0.3)] transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-xl bg-[#9e6de9] text-white shrink-0 shadow-[0_0_12px_rgba(158,109,233,0.6)]">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </span>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[10px] sm:text-xs font-mono font-black uppercase text-[#eeac1a] tracking-wider shrink-0">
                LAYOUT {currentLayout.number}/20
              </span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wide truncate text-white">
                {currentLayout.name}
              </span>
            </div>
            <span className="hidden lg:inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-black uppercase tracking-wider bg-white/10 text-purple-300 border border-purple-500/30 shrink-0">
              {currentLayout.tag}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous layout"
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next layout"
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(158,109,233,0.5)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Browse 20 Layouts</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Sleek Floating Bottom Dock ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto max-w-[95vw]">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-black/85 hover:bg-black/95 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(158,109,233,0.35)] transition-all">
          {/* Previous Layout Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous layout variation"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Center Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle 20 Editorial Layouts Picker"
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 to-black/60 hover:from-purple-800/70 hover:to-black/80 border border-purple-500/30 text-white transition-all cursor-pointer group"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9e6de9] text-white shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-3 h-3 fill-current" />
            </span>

            <div className="flex items-baseline gap-1.5 sm:gap-2 text-left">
              <span className="text-[10px] sm:text-xs font-mono font-black uppercase text-[#9e6de9] tracking-wider">
                {currentLayout.number}/20
              </span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wide truncate max-w-[140px] sm:max-w-[220px] text-white">
                {currentLayout.name}
              </span>
            </div>

            <span className="hidden md:inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
              {currentLayout.tag}
            </span>

            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0 transition-colors ml-1" />
          </button>

          {/* Next Layout Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next layout variation"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Expandable Drawer/Modal for all 20 Curated Editorial Layouts ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="20 Curated Editorial Layouts"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[85vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(158,109,233,0.3)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-white flex items-center gap-2">
                    20 Editorial & High-Fashion Layouts
                  </h2>
                  <p className="text-xs text-zinc-400 font-sans">
                    Inspired by jjettas.com/off-field, luxury lookbooks, and high-fashion music editorial archives.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Cards Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {TWENTY_EDITORIAL_LAYOUTS.map((item) => {
                const isActive = item.id === activeLayoutId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveLayoutId(item.id);
                      setIsOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`group text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isActive
                        ? "bg-purple-950/40 border-purple-500 shadow-[0_0_25px_rgba(158,109,233,0.3)]"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-black text-[#eeac1a]">
                          #{item.number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-black uppercase tracking-wider border ${item.tagColor}`}
                        >
                          {item.tag}
                        </span>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-wide text-white group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </h3>

                      <p className="mt-1.5 text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[10px]">
                      <span className="text-zinc-500 uppercase">
                        Layout #{item.id}
                      </span>
                      {isActive ? (
                        <span className="flex items-center gap-1 font-bold text-purple-400">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-zinc-400 group-hover:text-white uppercase font-bold transition-colors">
                          Switch →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-zinc-400 font-mono shrink-0">
              <span>Showing 20 Curated Editorial Variations</span>
              <button
                type="button"
                onClick={() => {
                  setActiveLayoutId(61);
                  setIsOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-[#eeac1a] hover:underline font-bold uppercase cursor-pointer"
              >
                Reset to Flagship (#01 JJettas)
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
