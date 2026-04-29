"use client";
import { useState } from "react";
import Link from "next/link";

const LAYOUTS = [
  { id: "a", label: "Full-Width Rows",       tag: "No photos", desc: "Each day spans the full width with gradient backgrounds and giant day numbers.", emoji: "📐", photo: false },
  { id: "b", label: "Vertical Timeline",     tag: "No photos", desc: "Classic spine timeline with glowing dots and color-coded cards.", emoji: "📋", photo: false },
  { id: "c", label: "7-Column Grid",         tag: "No photos", desc: "One column per day with progress bar footers and route breadcrumb header.", emoji: "🔲", photo: false },
  { id: "d", label: "Magazine Alternating",  tag: "No photos", desc: "Alternating left/right rows with bold vertical color bars.", emoji: "📰", photo: false },
  { id: "e", label: "Interactive Selector",  tag: "No photos · Interactive", desc: "Click any day tab to see a full-screen hero panel with prev/next navigation.", emoji: "🎛️", photo: false },
  { id: "f", label: "Bento Grid",            tag: "No photos", desc: "Modern bento layout with ghost emoji backgrounds and varied card sizes.", emoji: "⬛", photo: false },
  { id: "g", label: "Split Photo Rows",      tag: "Photos", desc: "Alternating half-photo, half-text rows. Each destination gets its own photo.", emoji: "↔️", photo: true },
  { id: "h", label: "Photo Card Grid",       tag: "Photos", desc: "3-column card grid with tall photos and info panels below.", emoji: "🖼️", photo: true },
  { id: "i", label: "Photo Sidebar Picker",  tag: "Photos · Interactive", desc: "Sticky large photo panel + scrollable clickable day list on the right.", emoji: "👆", photo: true },
  { id: "j", label: "Photo Bento Grid",      tag: "Photos", desc: "Bento grid with all tiles as full-bleed photos, varied sizes.", emoji: "🎨", photo: true },
  { id: "k", label: "Full-Screen Scroll",    tag: "Photos · Most Cinematic", desc: "Each day is full viewport height with full-bleed photo and giant typography.", emoji: "🎬", photo: true },
  { id: "l", label: "Film Strip Scroll",     tag: "Photos", desc: "Horizontal scrolling tall portrait cards + compact route map below.", emoji: "🎞️", photo: true },
  { id: "m", label: "Full Schedule Timeline", tag: "Photos · Detailed", desc: "Photo header per day + full time-by-time schedule with color-coded event chips.", emoji: "📅", photo: true },
  { id: "n", label: "Photo Rows + Schedule",  tag: "Photos · Detailed · ⭐ New", desc: "Layout G's alternating photo rows, but the text side is a full daily schedule timeline.", emoji: "⏱️", photo: true },
];

const PHOTOS: Record<string, string> = {
  a: "/images/cruise/miami.png",
  b: "/images/cruise/at-sea.png",
  c: "/images/cruise/cozumel.png",
  d: "/images/cruise/grand-cayman.png",
  e: "/images/cruise/roatan.png",
  f: "/images/cruise/concert.png",
  g: "/images/cruise/miami.png",
  h: "/images/cruise/grand-cayman.png",
  i: "/images/cruise/roatan.png",
  j: "/images/cruise/cozumel.png",
  k: "/images/cruise/concert.png",
  l: "/images/cruise/at-sea.png",
  m: "/images/cruise/miami.png",
  n: "/images/cruise/cozumel.png",
};

const STAR = ["e", "i", "k", "n"]; // recommended picks

export default function ItinPicker() {
  const [filter, setFilter] = useState<"all" | "photos" | "no-photos">("all");

  const filtered = LAYOUTS.filter(l =>
    filter === "all" ? true : filter === "photos" ? l.photo : !l.photo
  );

  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#07070f]">
        <div className="site-container max-w-6xl py-10">
          <p className="text-[0.55rem] font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-2">Design Lab</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black italic uppercase text-white leading-none mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Pick Your Itinerary Layout
          </h1>
          <p className="text-white/35 text-sm max-w-xl">12 options — click any card to open it full-screen. When you find one you like, tell me and I'll wire it into the cruise page.</p>

          {/* Filter pills */}
          <div className="flex gap-2 mt-6">
            {(["all", "photos", "no-photos"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                  filter === f
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                    : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
                }`}
              >
                {f === "all" ? "All 12" : f === "photos" ? "📸 With Photos" : "🎨 No Photos"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="site-container max-w-6xl py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(layout => (
            <Link
              key={layout.id}
              href={`/cruise/itin-${layout.id}`}
              target="_blank"
              rel="noopener"
              className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[var(--color-accent)]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(133,29,239,0.25)] bg-[#0b0b14] flex flex-col"
            >
              {/* Preview photo strip */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={PHOTOS[layout.id]}
                  alt={layout.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14] via-black/30 to-transparent" />

                {/* Layout letter badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/70 backdrop-blur-sm border border-white/20 text-white font-black text-base">
                    {layout.id.toUpperCase()}
                  </span>
                </div>

                {/* Star badge for recommended */}
                {STAR.includes(layout.id) && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[0.45rem] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full bg-[var(--color-accent)]/90 text-white backdrop-blur-sm">
                      ⭐ Recommended
                    </span>
                  </div>
                )}

                {/* Hover open arrow */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{layout.emoji}</span>
                  <h2 className="text-base font-black text-white">{layout.label}</h2>
                </div>
                <p className="text-white/35 text-xs leading-relaxed flex-1">{layout.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[0.45rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    layout.photo
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      : "bg-white/5 text-white/30 border-white/10"
                  }`}>{layout.tag}</span>
                  <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20 group-hover:text-[var(--color-accent)] transition-colors">
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-white/[0.05] text-center">
          <p className="text-white/20 text-xs">Each layout opens in a new tab. When you pick one, come back and say the letter (A–L) and I&apos;ll make it the real cruise page.</p>
        </div>
      </div>
    </div>
  );
}
