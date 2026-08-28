"use client";

import React, { useState } from "react";

export interface NewsItem {
  date: string;
  title: string;
  content: string;
}

const OPTION_2_VARIATIONS = [
  { id: "2A", name: "2A. Classic Dark Glass" },
  { id: "2B", name: "2B. Photo Box Right" },
  { id: "2C", name: "2C. Reversed Left Card" },
  { id: "2D", name: "2D. Neon Line Divider" },
  { id: "2E", name: "2E. Stacked Badge Card" },
  { id: "2F", name: "2F. Borderless Editorial" }
];

export function NewsHeroLayouts({ newsItems }: { newsItems: NewsItem[] }) {
  const [activeLayout, setActiveLayout] = useState<string>("2A");
  const featured = newsItems[0] || {
    date: "January 2026",
    title: "2026 Tour Dates Announced",
    content: "It's winter time, and besides our annual cruise we do every year, we are working in the studio on numerous things."
  };

  return (
    <div className="relative">
      {/* ── OPTION 2 VARIATIONS SWITCHER TOOLBAR ── */}
      <div className="bg-[var(--color-bg-surface)] border-b border-white/10 px-4 py-3 sticky top-[72px] z-50 flex items-center justify-between flex-wrap gap-2 text-white">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-purple-400tracking-wider flex items-center gap-1">
            <span>⚡</span> Option 2 Split Showcase Variations:
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {OPTION_2_VARIATIONS.map((opt) => (
            <button aria-label="Action button"
              key={opt.id}
              type="button"
              onClick={() => setActiveLayout(opt.id)}
              className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer border ${activeLayout === opt.id ?"bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : " bg-[#00000029]    border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2A. Classic Dark Glass Split ── */}
      {activeLayout === "2A" && (
        <section className="relative py-16 md:py-24 overflow-hidden  ">
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/images/hero-band-bg.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090314] via-[#090314]/90 to-transparent" />

          <div className="site-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 text-left">
              <span className="font-bold uppercase tracking-widest text-purple-400 px-3 py-1 border border-cyan-500/20">
                OPTION 2A — CLASSIC DARK GLASS
              </span>
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-white mt-4 mb-4">
                7th Heaven <br /><span className="text-cyan-400">Band News</span>
              </h1>
              <p className="leading-relaxed mb-6">
                Direct updates from the band — tour announcements, new releases, and live event updates.
              </p>
            </div>

            <div className="lg:col-span-7 bg-[#110b20]/90 border border-white/10 p-8 text-left relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold uppercase tracking-widest text-[var(--color-accent)]">Featured Article</span>
                <span className="font-mono text-white/50">{featured.date}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{featured.title}</h2>
              <p className="leading-relaxed">{featured.content}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2B. Photo Box Right ── */}
      {activeLayout === "2B" && (
        <section className="relative py-16 md:py-24 overflow-hidden bg-[#05030a] text-left">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="font-mono font-bold uppercase tracking-widest text-cyan-300">
                OPTION 2B — PHOTO BOX RIGHT
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mt-3 mb-3">
                Band Bulletins <span className="text-cyan-400">&</span> Updates
              </h1>
              <p className="leading-relaxed">
                Stay tuned for studio news, upcoming summer festival dates, and cruise announcements.
              </p>
            </div>

            <div className="lg:col-span-7 relative overflow-hidden border border-cyan-500/40 bg-black/80 p-8 md:p-10">
              <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" style={{ backgroundImage: "url('/images/hero-band-bg.png')" }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="px-3 py-1 bg-cyan-400 text-black font-bold uppercase tracking-widest">
                    Latest News
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{featured.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{featured.title}</h2>
                <p className="leading-relaxed mb-6">{featured.content}</p>
                <button aria-label="Action button" type="button" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-lg shadow-purple-600/30">
                  Read Full Story →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2C. Reversed Left Card ── */}
      {activeLayout === "2C" && (
        <section className="relative py-16 md:py-24 overflow-hidden bg-[#0a0712] text-left">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Card */}
            <div className="lg:col-span-7 bg-[#130d24] border border-cyan-500/30 p-8 md:p-10">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold uppercase tracking-widest text-purple-400 px-2.5 py-1">
                  OPTION 2C — REVERSED LEFT CARD
                </span>
                <span className="font-mono text-white/50">{featured.date}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{featured.title}</h2>
              <p className="leading-relaxed">{featured.content}</p>
            </div>

            {/* Right Branding */}
            <div className="lg:col-span-5">
              <span className="font-mono text-purple-400font-bold uppercase tracking-widest">Official Channel</span>
              <h1 className="text-4xl md:text-5xl font-bold uppercase text-white mt-2 mb-4">
                7th Heaven <br /><span className="text-cyan-400">News Feed</span>
              </h1>
              <p className="">
                Get real-time alerts on tour additions, VIP packages, and new merchandise drops.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2D. Neon Line Divider ── */}
      {activeLayout === "2D" && (
        <section className="relative py-16 md:py-24 overflow-hidden text-left">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch border border-cyan-500/30">
            {/* Left Column */}
            <div className="lg:col-span-5 p-8 md:p-12 bg-[#090512] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-cyan-500/30">
              <span className="font-bold uppercase tracking-widest text-purple-400mb-2">OPTION 2D — NEON LINE DIVIDER</span>
              <h1 className="text-3xl md:text-4xl font-bold uppercase text-white leading-tight">
                7th Heaven <br /><span className="text-cyan-400">Dispatch</span>
              </h1>
              <p className="mt-4">
                Direct updates from the band's official news desk.
              </p>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-cyan-300 font-bold uppercase">{featured.date}</span>
                <span className="px-2.5 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold uppercase">Featured</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{featured.title}</h2>
              <p className="leading-relaxed">{featured.content}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2E. Stacked Badge Card ── */}
      {activeLayout === "2E" && (
        <section className="relative py-16 md:py-24 overflow-hidden bg-[#07040d] text-left">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-widest inline-block">
                  OPTION 2E — STACKED BADGE
                </span>
                <h1 className="text-3xl font-bold uppercase text-white tracking-tight">
                  Band Updates
                </h1>
                <p className="leading-relaxed">
                  Latest releases, festival schedules, and band announcements.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 bg-gradient-to-r from-[#120a24] to-[#0a0514] border border-cyan-400/30 p-8 md:p-12">
              <span className="font-mono text-cyan-300 font-bold uppercase block mb-2">{featured.date}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{featured.title}</h2>
              <p className="leading-relaxed">{featured.content}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2F. Borderless Editorial ── */}
      {activeLayout === "2F" && (
        <section className="relative py-16 md:py-24 overflow-hidden bg-[#080510] text-left border-b border-white/10">
          <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <span className="font-mono font-bold uppercase tracking-widest text-purple-400block mb-2">
                OPTION 2F — BORDERLESS EDITORIAL
              </span>
              <h1 className="text-4xl font-bold uppercase tracking-tight text-white leading-none">
                Latest <br /><span className="text-cyan-400">Headlines</span>
              </h1>
            </div>

            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-3">
                <span className="font-mono text-cyan-300 font-bold uppercase">{featured.date}</span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-lg" />
                <span className="font-bold uppercase text-white/50">Band Announcement</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4">{featured.title}</h2>
              <p className="leading-relaxed">{featured.content}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
