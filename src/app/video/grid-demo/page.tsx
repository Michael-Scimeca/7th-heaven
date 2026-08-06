"use client";
import Image from 'next/image';
import { useState, useEffect } from "react";

const layouts = ["A", "B", "C", "D", "E", "F"] as const;
type Layout = typeof layouts[number];

interface Video { id: string; title: string; year: number; duration?: string; description?: string; viewCount?: string; }
interface VideoCategory { category: string; videos: Video[]; }

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hq720.jpg`;

function Switcher({ active, set }: { active: Layout; set: (l: Layout) => void }) {
  return (
    <div className="fixed top-20 right-6 z-[999] flex flex-col gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3">
      <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.25em] text-white/40 text-center mb-1">Grid</p>
      {layouts.map(l => (
        <button key={l} onClick={() => set(l)}
          className={`w-10 h-10 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer ${active === l ? "bg-[var(--color-accent)] text-white  shadow-[var(--color-accent)]/30" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function CatTabs({ cats, active, set }: { cats: string[]; active: string; set: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {cats.map((c, i) => (
        <span key={c} className="flex items-center gap-1">
          <button onClick={() => set(c)} className={`text-xs font-bold uppercase tracking-[0.12em] px-2 py-2 transition-colors cursor-pointer whitespace-nowrap ${active === c ? " text-[var(--color-accent)]" : "text-white/40 hover:text-white/80"}`}>{c}</button>
          {i < cats.length - 1 && <span className=" text-[var(--color-accent)] text-sm">/</span>}
        </span>
      ))}
    </div>
  );
}

export default function GridLayoutDemo() {
  const [active, setActive] = useState<Layout>("A");
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [cat, setCat] = useState("Official Music Videos");

  useEffect(() => { fetch("/data/videos.json").then(r => r.json()).then(setCategories); }, []);
  const videos = categories.find(c => c.category === cat)?.videos || [];
  const catNames = categories.map(c => c.category);

  return (
    <div className="bg-[var(--color-bg-deep)] min-h-screen pt-[72px]">
      <Switcher active={active} set={setActive} />

      {/* Shared nav */}
      <div className="sticky top-[72px] z-40 bg-[var(--color-bg-deep)]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="site-container py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CatTabs cats={catNames} active={cat} set={setCat} />
          <p className="text-xs text-white/20 font-bold uppercase tracking-widest">{videos.length} Videos · Layout {active}</p>
        </div>
      </div>

      {/* ═══ A — Full-Bleed 4-Column (25% each, no gaps) ═══ */}
      {active === "A" && (
        <div className="grid grid-cols-2 md:grid-cols-4">
          {videos.map(v => (
            <div key={v.id} className="relative aspect-video group cursor-pointer overflow-hidden">
              <Image width={200} height={200} unoptimized src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-colors duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              {/* Play */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
              </div>
              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-colors">
                <p className="text-sm font-bold text-white truncate">{v.title}</p>
                <div className="flex items-center gap-2 text-[var(--font-size-2xs)] text-white/40 mt-0.5"><span>{v.year}</span>{v.duration && <span>{v.duration}</span>}</div>
              </div>
              {v.duration && <span className="absolute top-2 right-2 bg-black/60 text-white text-[var(--font-size-2xs)] font-bold px-1.5 py-0.5 rounded opacity-60">{v.duration}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ═══ B — Full-Bleed 4-Column with thin gaps ═══ */}
      {active === "B" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/[0.04]">
          {videos.map(v => (
            <div key={v.id} className="relative aspect-video group cursor-pointer overflow-hidden bg-[var(--color-bg-surface)]">
              <Image width={200} height={200} unoptimized src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/80 flex items-center justify-center shadow-[0_0_30px_rgba(255,10,61,0.4)]"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-colors duration-300">
                <p className="text-sm font-bold text-white">{v.title}</p>
                <p className="text-xs text-white/40 mt-0.5">{v.year} · {v.viewCount || ""} views</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ C — Full-Bleed 4-Col with persistent labels below ═══ */}
      {active === "C" && (
        <div className="grid grid-cols-2 md:grid-cols-4">
          {videos.map(v => (
            <div key={v.id} className="group cursor-pointer">
              <div className="relative aspect-video overflow-hidden">
                <Image width={200} height={200} unoptimized src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                </div>
                {v.duration && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[var(--font-size-2xs)] font-bold px-1.5 py-0.5 rounded">{v.duration}</span>}
              </div>
              <div className="px-3 py-3 bg-[var(--color-bg-surface)] border-b border-r border-white/[0.04]">
                <p className="text-sm font-bold text-white truncate group-hover: text-[var(--color-accent)] transition-colors">{v.title}</p>
                <div className="flex items-center gap-2 text-[var(--font-size-2xs)] text-white/25 mt-0.5"><span>{v.year}</span>{v.viewCount && <><span>·</span><span>{v.viewCount} views</span></>}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ D — Full-Bleed Mixed (1 large + 3 small per row) ═══ */}
      {active === "D" && (
        <div>
          {Array.from({ length: Math.ceil(videos.length / 4) }).map((_, rowIdx) => {
            const row = videos.slice(rowIdx * 4, rowIdx * 4 + 4);
            const flip = rowIdx % 2 === 1;
            return (
              <div key={rowIdx} className={`grid grid-cols-2 md:grid-cols-4 ${flip ? "" : ""}`}>
                {/* Large */}
                <div className={`relative md:col-span-2 md:row-span-2 aspect-video md:aspect-auto group cursor-pointer overflow-hidden ${flip ? "md:order-2" : ""}`} style={{ minHeight: "300px" }}>
                  {row[0] && <>
                    <Image width={200} height={200} unoptimized src={thumb(row[0].id)} alt={row[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/80 flex items-center justify-center shadow-[0_0_40px_rgba(255,10,61,0.5)]"><svg width="26" height="26" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-lg font-bold text-white">{row[0].title}</p>
                      <p className="text-xs text-white/40 mt-1">{row[0].year} · {row[0].duration}</p>
                    </div>
                  </>}
                </div>
                {/* 3 smaller */}
                {row.slice(1).map(v => (
                  <div key={v.id} className={`relative aspect-video group cursor-pointer overflow-hidden ${flip ? "md:order-1" : ""}`}>
                    <Image width={200} height={200} unoptimized src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-bold text-white truncate">{v.title}</p>
                    </div>
                  </div>
                ))}
                {/* Fill empties */}
                {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => <div key={`empty-${i}`} className="aspect-video bg-[var(--color-bg-surface)]" />)}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ E — Full-Bleed 4-Col with hover card expand ═══ */}
      {active === "E" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {videos.map(v => (
            <div key={v.id} className="relative group cursor-pointer overflow-hidden bg-[var(--color-bg-surface)]">
              <div className="aspect-video relative overflow-hidden">
                <Image width={200} height={200} unoptimized src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-colors duration-500" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_30px_rgba(255,10,61,0.6)] scale-75 group-hover:scale-100 transition-transform"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                </div>
              </div>
              {/* Expanding info panel */}
              <div className="max-h-0 group-hover:max-h-24 overflow-hidden transition-colors duration-300 ease-out bg-[var(--color-bg-surface)] border-t border-[var(--color-accent)]/20">
                <div className="p-3">
                  <p className="text-sm font-bold text-white truncate">{v.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-white/30">{v.year} · {v.duration}</span>
                    <span className="text-xs  text-[var(--color-accent)]">{v.viewCount} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ F — Full-Bleed 4-Col Numbered Overlay ═══ */}
      {active === "F" && (
        <div className="grid grid-cols-2 md:grid-cols-4">
          {videos.map((v, i) => (
            <div key={v.id} className="relative aspect-video group cursor-pointer overflow-hidden">
              <Image width={200} height={200} unoptimized src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors" />
              {/* Big number */}
              <span className="absolute top-3 left-4 text-6xl font-black italic text-white/[0.08] leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{String(i + 1).padStart(2, "0")}</span>
              {/* Play */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-bold text-white truncate">{v.title}</p>
                <div className="flex items-center gap-2 text-[var(--font-size-2xs)] text-white/30 mt-0.5">
                  <span>{v.year}</span>
                  {v.duration && <><span>·</span><span>{v.duration}</span></>}
                  {v.viewCount && <><span>·</span><span>{v.viewCount}</span></>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <div className="py-32 text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm">Loading videos...</p>
        </div>
      )}
    </div>
  );
}
