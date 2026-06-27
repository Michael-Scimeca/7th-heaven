"use client";
import { useState } from "react";

const layouts = ["A","B","C","D","E","F"] as const;
type Layout = typeof layouts[number];

const VIDEOS = [
  { id: "BzHUNTZ66zY", title: "Ain't That Just Beautiful", year: 2025, duration: "3:35", views: "2.4K" },
  { id: "SWV7-pmtoA8", title: "Monster", year: 2021, duration: "4:48", views: "10.2K" },
  { id: "Es4TIoA2Emg", title: "Are We There Yet", year: 2021, duration: "3:57", views: "86.4K" },
  { id: "zAQL-diwq0A", title: "Wonderful World", year: 2020, duration: "3:21", views: "4.2K" },
  { id: "pUxsIGCmP3w", title: "Say It Already", year: 2020, duration: "3:29", views: "2.7K" },
  { id: "Rv6u0SMTUA4", title: "I See You Smile", year: 2020, duration: "3:32", views: "4.5K" },
  { id: "SRxUiTqwaZs", title: "This Is Where The Party's At", year: 2020, duration: "3:03", views: "8.2K" },
  { id: "BzHUNTZ66zY", title: "Country In The City", year: 2019, duration: "4:28", views: "3.1K" },
];
const CATS = ["Official Music Videos", "Live Performances", "Behind The Scenes", "Fan Favorites"];
const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hq720.jpg`;
const featured = VIDEOS[0];

function Switcher({ active, set }: { active: Layout; set: (l: Layout) => void }) {
  return (
    <div className="fixed top-20 right-6 z-[999] flex flex-col gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
      <p className="text-2xs font-black uppercase tracking-[0.25em] text-white/40 text-center mb-1">Layout</p>
      {layouts.map(l => (
        <button key={l} onClick={() => set(l)}
          className={`w-10 h-10 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${active === l ? "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/30" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function CatNav({ active, set }: { active: string; set: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {CATS.map((c, i) => (
        <span key={c} className="flex items-center gap-1">
          <button onClick={() => set(c)} className={`text-xs font-bold uppercase tracking-[0.12em] px-2 py-2 transition-colors cursor-pointer whitespace-nowrap ${active === c ? "text-[var(--color-accent)]" : "text-white/40 hover:text-white/80"}`}>{c}</button>
          {i < CATS.length - 1 && <span className="text-[var(--color-accent)] text-sm">/</span>}
        </span>
      ))}
    </div>
  );
}

function VideoCard({ v, style = "default" }: { v: typeof VIDEOS[0]; style?: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-[#12121a] rounded-xl">
        <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_30px_rgba(133,29,239,0.5)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
        </div>
        {v.duration && <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-md">{v.duration}</span>}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide truncate">{v.title}</h3>
        <div className="flex items-center gap-2 text-xs text-white/30 mt-1">
          <span>{v.year}</span><span className="w-1 h-1 rounded-full bg-white/15" /><span>{v.views} views</span>
        </div>
      </div>
    </div>
  );
}

export default function VideoLayoutDemo() {
  const [active, setActive] = useState<Layout>("A");
  const [cat, setCat] = useState("Official Music Videos");

  return (
    <div className="bg-[#050508] min-h-screen pt-[72px]">
      <Switcher active={active} set={setActive} />

      {/* ═══ A — Cinema Split (current style refined) ═══ */}
      {active === "A" && (
        <div>
          <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: "min(70vh, 600px)" }}>
            <div className="absolute inset-0"><img src={thumb(featured.id)} alt="" className="w-full h-full object-cover scale-110 blur-[40px] opacity-30" /><div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-black/60 to-black/40" /><div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" /></div>
            <div className="relative z-10 site-container py-12 flex flex-col lg:flex-row items-center gap-12" style={{ minHeight: "min(70vh, 600px)" }}>
              <div className="w-full lg:w-[65%]">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10">
                  <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_40px_rgba(133,29,239,0.5)]"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div></div>
                </div>
              </div>
              <div className="w-full lg:w-[35%] flex flex-col gap-5">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)]"><span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />Latest Release</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{featured.title}</h1>
                <div className="flex items-center gap-3 text-sm text-white/30 font-bold uppercase tracking-widest"><span>{featured.year}</span><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featured.duration}</span><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featured.views} views</span></div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-widest rounded-xl w-fit"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>Watch Now</button>
              </div>
            </div>
          </section>
          <div className="site-container py-12">
            <CatNav active={cat} set={setCat} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">{VIDEOS.map(v => <VideoCard key={v.id+v.title} v={v} />)}</div>
          </div>
        </div>
      )}

      {/* ═══ B — Full-Width Theater ═══ */}
      {active === "B" && (
        <div>
          <section className="relative bg-black">
            <div className="w-full aspect-[21/9] relative overflow-hidden">
              <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-[0_0_60px_rgba(255,255,255,0.1)]">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
              <div className="absolute bottom-8 left-0 right-0 site-container">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2 block">Now Playing</span>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{featured.title}</h1>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/40 font-bold uppercase tracking-widest"><span>{featured.year}</span><span>{featured.duration}</span><span>{featured.views} views</span></div>
              </div>
            </div>
          </section>
          <div className="site-container py-12">
            <CatNav active={cat} set={setCat} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">{VIDEOS.map(v => <VideoCard key={v.id+v.title} v={v} />)}</div>
          </div>
        </div>
      )}

      {/* ═══ C — Netflix Style (Big Row + Horizontal Scroll) ═══ */}
      {active === "C" && (
        <div>
          <section className="relative bg-black overflow-hidden" style={{ minHeight: "60vh" }}>
            <div className="absolute inset-0"><img src={thumb(featured.id)} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent" /><div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" /></div>
            <div className="relative z-10 site-container flex items-end pb-16" style={{ minHeight: "60vh" }}>
              <div className="max-w-lg">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3 block">Featured</span>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{featured.title}</h1>
                <p className="text-white/40 text-sm mb-6">7th Heaven&apos;s latest official music video — watch now.</p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold text-sm rounded-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3" /></svg>Play</button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold text-sm rounded-lg">ℹ️ More Info</button>
                </div>
              </div>
            </div>
          </section>
          {CATS.map(category => (
            <div key={category} className="site-container py-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50 mb-4">{category}</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
                {VIDEOS.map(v => (
                  <div key={v.id+v.title+category} className="w-[280px] shrink-0 snap-start group cursor-pointer">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-[#12121a]">
                      <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white mt-2 truncate">{v.title}</p>
                    <p className="text-xs text-white/30">{v.year} · {v.views} views</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ D — Masonry / Pinterest Grid ═══ */}
      {active === "D" && (
        <div className="site-container py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2 block">Video Gallery</span>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Watch 7th Heaven</h1>
            </div>
            <CatNav active={cat} set={setCat} />
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {VIDEOS.map((v, i) => (
              <div key={v.id+v.title} className="break-inside-avoid group cursor-pointer">
                <div className={`relative overflow-hidden rounded-2xl bg-[#12121a] ${i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-video" : "aspect-[3/4]"}`}>
                  <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">{v.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1"><span>{v.year}</span><span>{v.duration}</span></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/80 backdrop-blur-sm flex items-center justify-center"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ E — List / Table View ═══ */}
      {active === "E" && (
        <div>
          <section className="border-b border-white/5 py-16">
            <div className="site-container">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-3 block">Complete Library</span>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Videos</h1>
              <p className="text-white/30 text-sm">{VIDEOS.length} videos across {CATS.length} categories</p>
            </div>
          </section>
          <div className="site-container py-8">
            <CatNav active={cat} set={setCat} />
            <div className="mt-8 space-y-1">
              {VIDEOS.map((v, i) => (
                <div key={v.id+v.title} className={`flex items-center gap-6 px-4 py-4 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04] group ${i === 0 ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20" : ""}`}>
                  <span className="text-sm font-bold text-white/20 w-6 text-center tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-[#12121a]">
                    <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-[var(--color-accent)] transition-colors">{v.title}</h3>
                    <p className="text-xs text-white/25 mt-0.5">7th Heaven · Official</p>
                  </div>
                  <span className="text-xs text-white/25 tabular-nums hidden md:block">{v.views} views</span>
                  <span className="text-xs text-white/20 tabular-nums w-10 text-right">{v.duration}</span>
                  <span className="text-xs text-white/15 tabular-nums w-10 text-right hidden md:block">{v.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ F — Spotlight Carousel + Grid ═══ */}
      {active === "F" && (
        <div>
          <section className="py-12">
            <div className="site-container">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4 block">Spotlight</span>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
                {/* Main large video */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#12121a] group cursor-pointer">
                  <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="text-2xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2 block">Latest</span>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{featured.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-white/40 font-bold uppercase tracking-widest mt-2"><span>{featured.year}</span><span>{featured.duration}</span><span>{featured.views} views</span></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_40px_rgba(133,29,239,0.5)]"><svg width="26" height="26" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                  </div>
                </div>
                {/* 2x2 grid */}
                <div className="grid grid-cols-2 gap-4">
                  {VIDEOS.slice(1, 5).map(v => (
                    <div key={v.id+v.title} className="relative aspect-video rounded-xl overflow-hidden bg-[#12121a] group cursor-pointer">
                      <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-bold text-white truncate">{v.title}</p>
                        <p className="text-2xs text-white/30">{v.duration}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/80 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <div className="site-container py-8 border-t border-white/5">
            <CatNav active={cat} set={setCat} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">{VIDEOS.slice(1).map(v => <VideoCard key={v.id+v.title+"grid"} v={v} />)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
