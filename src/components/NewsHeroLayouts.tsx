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
  { id: "2F", name: "2F. Borderless Editorial" },
];

export function NewsHeroLayouts({ newsItems }: { newsItems: NewsItem[] }) {
  const [activeLayout, setActiveLayout] = useState<string>("2A");
  const featured = newsItems[0] || {
    date: "January 2026",
    title: "2026 Tour Dates Announced",
    content:
      "It's winter time, and besides our annual cruise we do every year, we are working in the studio on numerous things.",
  };

  return (
    <div className="relative">
      {/* ── OPTION 2 VARIATIONS SWITCHER TOOLBAR ── */}
      <div className="sticky top-[72px] z-50 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[var(--color-bg-surface)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-purple-400">
            <span>⚡</span> Option 2 Split Showcase Variations:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {OPTION_2_VARIATIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActiveLayout(opt.id)}
              className={`cursor-pointer border px-3 py-1.5 transition-colors ${activeLayout === opt.id ? "border-purple-400 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "border-white/10 bg-[#00000029] text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2A. Classic Dark Glass Split ── */}
      {activeLayout === "2A" && (
        <section className="relative overflow-hidden py-16 md:py-24">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('/images/hero/hero-band-bg.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090314] via-[#090314]/90 to-transparent" />

          <div className="site-container relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="text-left lg:col-span-5">
              <span className="border border-purple-500/20 px-3 py-1 text-purple-400">
                OPTION 2A — CLASSIC DARK GLASS
              </span>
              <h1 className="mt-4 mb-6">
                7th Heaven <br />
                <span>Band News</span>
              </h1>
              <p className="mb-6">
                Direct updates from the band — tour announcements, new releases,
                and live event updates.
              </p>
            </div>

            <div className="relative border border-white/10 bg-[#110b20]/90 p-8 text-left lg:col-span-7">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[var(--color-accent)]">
                  Featured Article
                </span>
                <span className="text-white/50">{featured.date}</span>
              </div>
              <h2 className="mb-6">{featured.title}</h2>
              <p>{featured.content}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2B. Photo Box Right ── */}
      {activeLayout === "2B" && (
        <section className="relative overflow-hidden bg-[#05030a] py-16 text-left md:py-24">
          <div className="site-container grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span>OPTION 2B — PHOTO BOX RIGHT</span>
              <h1 className="mt-3 mb-3">
                Band Bulletins <span>&</span> Updates
              </h1>
              <p>
                Stay tuned for studio news, upcoming summer festival dates, and
                cruise announcements.
              </p>
            </div>

            <div className="relative overflow-hidden border border-purple-500/40 bg-black/80 p-8 md:p-10 lg:col-span-7">
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: "url('/images/hero/hero-band-bg.png')",
                }}
              />
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="bg-cyan-400 px-3 py-1 text-black">
                    Latest News
                  </span>
                  <span>{featured.date}</span>
                </div>
                <h2 className="mb-6">{featured.title}</h2>
                <p className="mb-6">{featured.content}</p>
                <button
                  type="button"
                  className="cursor-pointer bg-purple-600 px-5 py-2.5 shadow-purple-600/30 transition-colors hover:bg-purple-500"
                >
                  Read Full Story →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2C. Reversed Left Card ── */}
      {activeLayout === "2C" && (
        <section className="relative overflow-hidden bg-[#0a0712] py-16 text-left md:py-24">
          <div className="site-container grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Card */}
            <div className="border border-purple-500/30 bg-[#130d24] p-8 md:p-10 lg:col-span-7">
              <div className="mb-6 flex items-center justify-between">
                <span className="px-2.5 py-1 text-purple-400">
                  OPTION 2C — REVERSED LEFT CARD
                </span>
                <span className="text-white/50">{featured.date}</span>
              </div>
              <h2 className="mb-6">{featured.title}</h2>
              <p>{featured.content}</p>
            </div>

            {/* Right Branding */}
            <div className="lg:col-span-5">
              <span className="text-purple-400">Official Channel</span>
              <h1 className="mt-2 mb-6">
                7th Heaven <br />
                <span>News Feed</span>
              </h1>
              <p>
                Get real-time alerts on tour additions, VIP packages, and new
                merchandise drops.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2D. Neon Line Divider ── */}
      {activeLayout === "2D" && (
        <section className="relative overflow-hidden py-16 text-left md:py-24">
          <div className="site-container grid grid-cols-1 items-stretch gap-0 border border-purple-500/30 lg:grid-cols-12">
            {/* Left Column */}
            <div className="flex flex-col justify-center border-b border-purple-500/30 bg-[#090512] p-8 md:p-12 lg:col-span-5 lg:border-r lg:border-b-0">
              <span className="text-purple-400mb-2">
                OPTION 2D — NEON LINE DIVIDER
              </span>
              <h1>
                7th Heaven <br />
                <span>Dispatch</span>
              </h1>
              <p className="mt-4">
                Direct updates from the band's official news desk.
              </p>
            </div>

            {/* Right Column */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:col-span-7">
              <div className="mb-6 flex items-center justify-between">
                <span>{featured.date}</span>
                <span className="bg-[var(--color-accent)]/20 px-2.5 py-0.5">
                  Featured
                </span>
              </div>
              <h2 className="mb-6">{featured.title}</h2>
              <p>{featured.content}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2E. Stacked Badge Card ── */}
      {activeLayout === "2E" && (
        <section className="relative overflow-hidden bg-[#07040d] py-16 text-left md:py-24">
          <div className="site-container grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="space-y-3">
                <span className="inline-block border border-purple-500/40 bg-cyan-500/20 px-3 py-1">
                  OPTION 2E — STACKED BADGE
                </span>
                <h1>Band Updates</h1>
                <p>
                  Latest releases, festival schedules, and band announcements.
                </p>
              </div>
            </div>

            <div className="border border-purple-400/30 bg-gradient-to-r from-[#120a24] to-[#0a0514] p-8 md:p-12 lg:col-span-8">
              <span className="mb-2 block">{featured.date}</span>
              <h2 className="mb-6">{featured.title}</h2>
              <p>{featured.content}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 2F. Borderless Editorial ── */}
      {activeLayout === "2F" && (
        <section className="relative overflow-hidden border-b border-white/10 bg-[#080510] py-16 text-left md:py-24">
          <div className="site-container grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="text-purple-400block mb-2">
                OPTION 2F — BORDERLESS EDITORIAL
              </span>
              <h1>
                Latest <br />
                <span>Headlines</span>
              </h1>
            </div>

            <div className="lg:col-span-8">
              <div className="mb-3 flex items-center gap-4">
                <span>{featured.date}</span>
                <span className="h-1.5 w-1.5 rounded-lg bg-cyan-400" />
                <span className="text-white/50">Band Announcement</span>
              </div>
              <h2 className="mb-6">{featured.title}</h2>
              <p>{featured.content}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
