"use client";
import { useState, useEffect, useCallback } from "react";

const layouts = ["A", "B", "C", "D", "E", "F"] as const;
type Layout = typeof layouts[number];

interface VideoCategory { category: string; videos: { id: string; title: string; year: number; duration?: string; viewCount?: string }[]; }

function Switcher({ active, set }: { active: Layout; set: (l: Layout) => void }) {
  return (
    <div className="fixed top-20 right-6 z-[999] flex flex-col gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3">
      <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.25em] text-white/40 text-center mb-1">Nav</p>
      {layouts.map(l => (
        <button aria-label="Action button" key={l} onClick={() => set(l)}
          className={`w-10 h-10 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer ${active === l ? "bg-[var(--color-accent)] text-white  shadow-[var(--color-accent)]/30" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

export default function CatNavDemo() {
  const [active, setActive] = useState<Layout>("A");
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [activeCat, setActiveCat] = useState("Official Music Videos");
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch("/data/videos.json");
      if (r.ok) {
        const data = await r.json();
        setCategories(data);
      }
    } catch { }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const cats = categories.map(c => c.category);
  const count = categories.find(c => c.category === activeCat)?.videos.length || 0;

  return (
    <div className="  min-h-screen pt-[72px]">
      <Switcher active={active} set={setActive} />

      {/* Spacer to simulate hero */}
      <div className="h-[30vh] bg-gradient-to-b from-[#1a1a2e] to-[#050508] flex items-end">
        <div className="site-container pb-8">
          <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.3em]  text-[var(--color-accent)] mb-2">Category Nav Demo</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Layout {active}</h1>
        </div>
      </div>

      {/* ═══ A — Slash-separated inline (current) ═══ */}
      {active === "A" && (
        <div className="sticky top-[72px] z-40  /90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="site-container py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1">
              {cats.map((c, i) => (
                <span key={c} className="flex items-center gap-1">
                  <button aria-label="Action button" onClick={() => setActiveCat(c)} className={`text-xs font-bold uppercase tracking-[0.12em] px-2 py-2 transition-colors cursor-pointer whitespace-nowrap ${activeCat === c ? " text-[var(--color-accent)]" : "text-white/40 hover:text-white/80"}`}>{c}</button>
                  {i < cats.length - 1 && <span className=" text-[var(--color-accent)] text-sm">/</span>}
                </span>
              ))}
            </div>
            <div className="relative w-full md:w-64 shrink-0">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input aria-label="Search" type="text" placeholder="SEARCH VIDEOS..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold tracking-widest uppercase text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ B — Pill/Chip tabs ═══ */}
      {active === "B" && (
        <div className="sticky top-[72px] z-40  /90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="site-container py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {cats.map(c => (
                <button aria-label="Action button" key={c} onClick={() => setActiveCat(c)}
                  className={`text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap border ${activeCat === c
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(255,10,61,0.3)]"
                    : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                    }`}>{c}</button>
              ))}
            </div>
            <div className="relative w-full md:w-64 shrink-0">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input aria-label="Search" type="text" placeholder="SEARCH..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold tracking-widest uppercase text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ C — Underline tabs with count ═══ */}
      {active === "C" && (
        <div className="sticky top-[72px] z-40  /90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="site-container flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {cats.map(c => {
                const vidCount = categories.find(cat => cat.category === c)?.videos.length || 0;
                return (
                  <button aria-label="Action button" key={c} onClick={() => setActiveCat(c)}
                    className={`relative text-xs font-bold uppercase tracking-[0.12em] px-4 py-4 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${activeCat === c ? "text-white" : "text-white/30 hover:text-white/60"
                      }`}>
                    {c}
                    <span className={`text-[var(--font-size-2xs)] tabular-nums ${activeCat === c ? " text-[var(--color-accent)]" : "text-white/15"}`}>{vidCount}</span>
                    {activeCat === c && <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-accent)] rounded-full" />}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full md:w-56 shrink-0 pb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input aria-label="Search" type="text" placeholder="SEARCH..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs font-bold tracking-widest uppercase text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ D — Vertical sidebar (left-anchored) ═══ */}
      {active === "D" && (
        <div className="flex">
          <div className="sticky top-[72px] h-[calc(100vh-72px)] w-[220px] shrink-0 bg-[var(--color-bg-surface)] border-r border-white/[0.06] flex flex-col py-6 px-4 gap-1">
            <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.25em] text-white/20 mb-3 px-3">Categories</p>
            {cats.map(c => {
              const vidCount = categories.find(cat => cat.category === c)?.videos.length || 0;
              return (
                <button aria-label="Action button" key={c} onClick={() => setActiveCat(c)}
                  className={`text-left text-xs font-bold uppercase tracking-[0.1em] px-3 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${activeCat === c ? "bg-[var(--color-accent)]/15  text-[var(--color-accent)]" : "text-white/35 hover:text-white/70"
                    }`}>
                  <span className="truncate">{c}</span>
                  <span className="text-[var(--font-size-2xs)] tabular-nums opacity-50">{vidCount}</span>
                </button>
              );
            })}
            <div className="mt-auto pt-4 border-t border-white/[0.06]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input aria-label="Search" type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-xs tracking-wider text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-8">
            <p className="text-white/20 text-sm text-center py-20">Grid content area — {activeCat}</p>
          </div>
        </div>
      )}

      {/* ═══ E — Full-width segmented bar ═══ */}
      {active === "E" && (
        <div className="sticky top-[72px] z-40 bg-[var(--color-bg-surface)] border-b border-white/[0.06]">
          <div className="flex items-stretch">
            {cats.map((c, i) => (
              <button aria-label="Action button" key={c} onClick={() => setActiveCat(c)}
                className={`flex-1 text-center text-xs font-bold uppercase tracking-[0.15em] py-4 transition-colors cursor-pointer border-r border-white/[0.04] last:border-r-0 relative ${activeCat === c ? "bg-[var(--color-accent)]/10  text-[var(--color-accent)]" : "text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
                  }`}>
                {c}
                {activeCat === c && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />}
              </button>
            ))}
          </div>
          <div className="site-container py-3 flex justify-between items-center">
            <p className="text-xs text-white/20 font-bold uppercase tracking-widest">{count} videos in {activeCat}</p>
            <div className="relative w-56">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input aria-label="Search" type="text" placeholder="SEARCH..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs font-bold tracking-widest uppercase text-white placeholder-white/25 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ F — Dropdown + prominent search ═══ */}
      {active === "F" && (
        <div className="sticky top-[72px] z-40  /90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="site-container py-4 flex items-center gap-4">
            <div className="relative">
              <select aria-label="Select option"
                value={activeCat}
                onChange={e => setActiveCat(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg py-2.5 pl-4 pr-10 text-xs font-bold uppercase tracking-widest text-white cursor-pointer focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              >
                {cats.map(c => <option key={c} value={c} className="bg-[var(--color-bg-surface)] text-white">{c}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input aria-label="Search" type="text" placeholder="Search all videos..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:bg-white/10 transition-colors" />
            </div>
            <p className="text-xs text-white/15 font-bold uppercase tracking-widest ml-auto hidden md:block">{count} results</p>
          </div>
        </div>
      )}

      {/* Placeholder grid */}
      {active !== "D" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/[0.02] mt-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video bg-[var(--color-bg-surface)] flex items-center justify-center">
              <span className="text-white/10 text-xs">Video {i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
