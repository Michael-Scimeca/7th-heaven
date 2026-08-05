"use client";
import { useState } from "react";

const layouts = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"] as const;
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
    <div className="fixed top-20 right-6 z-[999] flex flex-col gap-1.5 bg-black/85 backdrop-blur-xl border border-white/10 p-2.5 max-h-[82vh] overflow-y-auto custom-scrollbar">
      <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.2em] text-white/40 text-center mb-1">Layout ({layouts.length})</p>
      <div className="grid grid-cols-2 gap-1.5">
        {layouts.map(l => (
          <button key={l} onClick={() => set(l)}
            className={`w-9 h-9 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${active === l ? "bg-[var(--color-accent)] text-white  shadow-[var(--color-accent)]/30 scale-105" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>
            {l}
          </button>
        ))}
      </div>
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
      <div className="relative aspect-video overflow-hidden bg-[var(--color-bg-card)]">
        <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_30px_rgba(255,10,61,0.5)]">
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
    <div className="bg-[var(--color-bg-deep)] min-h-screen pt-[72px]">
      <Switcher active={active} set={setActive} />

      {/* ═══ A — Cinema Split (current style refined) ═══ */}
      {active === "A" && (
        <div>
          <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: "min(70vh, 600px)" }}>
            <div className="absolute inset-0"><img src={thumb(featured.id)} alt="" className="w-full h-full object-cover scale-110 blur-[40px] opacity-30" /><div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-black/60 to-black/40" /><div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" /></div>
            <div className="relative z-10 site-container py-12 flex flex-col lg:flex-row items-center gap-12" style={{ minHeight: "min(70vh, 600px)" }}>
              <div className="w-full lg:w-[65%]">
                <div className="relative aspect-video overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10">
                  <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_40px_rgba(255,10,61,0.5)]"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div></div>
                </div>
              </div>
              <div className="w-full lg:w-[35%] flex flex-col gap-5">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)]"><span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />Latest Release</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{featured.title}</h1>
                <div className="flex items-center gap-3 text-sm text-white/30 font-bold uppercase tracking-widest"><span>{featured.year}</span><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featured.duration}</span><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featured.views} views</span></div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-widest w-fit"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>Watch Now</button>
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
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-card)]">
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
                <div className={`relative overflow-hidden  bg-[var(--color-bg-card)] ${i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-video" : "aspect-[3/4]"}`}>
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
                <div key={v.id+v.title} className={`flex items-center gap-6 px-4 py-4  cursor-pointer transition-all hover:bg-white/[0.04] group ${i === 0 ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20" : ""}`}>
                  <span className="text-sm font-bold text-white/20 w-6 text-center tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-[var(--color-bg-card)]">
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
                <div className="relative aspect-video overflow-hidden bg-[var(--color-bg-card)] group cursor-pointer">
                  <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2 block">Latest</span>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{featured.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-white/40 font-bold uppercase tracking-widest mt-2"><span>{featured.year}</span><span>{featured.duration}</span><span>{featured.views} views</span></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_40px_rgba(255,10,61,0.5)]"><svg width="26" height="26" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                  </div>
                </div>
                {/* 2x2 grid */}
                <div className="grid grid-cols-2 gap-4">
                  {VIDEOS.slice(1, 5).map(v => (
                    <div key={v.id+v.title} className="relative aspect-video overflow-hidden bg-[var(--color-bg-card)] group cursor-pointer">
                      <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-bold text-white truncate">{v.title}</p>
                        <p className="text-[var(--font-size-2xs)] text-white/30">{v.duration}</p>
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

      {/* ═══ G — Horizontal Split Cinema Feed (50/50 Real-Estate Split) ═══ */}
      {active === "G" && (
        <div className="site-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6-col Sticky Hero Player */}
            <div className="lg:col-span-6 lg:sticky lg:top-[90px]">
              <div className="relative aspect-video overflow-hidden bg-black border border-white/10 group cursor-pointer">
                <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] block mb-1">Featured Track</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{featured.title}</h2>
                  <p className="text-xs text-white/50 mt-1">{featured.year} · {featured.duration} · {featured.views} views</p>
                </div>
              </div>
            </div>
            {/* Right 6-col Vertical Scroll Stream */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Up Next & Related</h3>
                <CatNav active={cat} set={setCat} />
              </div>
              {VIDEOS.map((v, i) => (
                <div key={v.id+v.title+"G"} className="flex gap-4 p-3 bg-white/[0.03] border border-white/5 hover:border-[var(--color-accent)]/40 hover:bg-white/[0.06] transition-all cursor-pointer group">
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                    <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[var(--font-size-2xs)] text-white px-1 rounded">{v.duration}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-[var(--font-size-2xs)] font-bold uppercase text-[var(--color-accent)]">#0{i + 1}</span>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[var(--color-accent)] transition-colors">{v.title}</h4>
                    <span className="text-[var(--font-size-2xs)] text-white/40 mt-1">{v.year} · {v.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ H — Compact Minimalist Data Grid (6 columns) ═══ */}
      {active === "H" && (
        <div className="site-container py-8">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
            <div>
              <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-widest text-[var(--color-accent)]">Ultra-Dense Grid</span>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">All 7th Heaven Videos</h1>
            </div>
            <CatNav active={cat} set={setCat} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {VIDEOS.concat(VIDEOS).map((v, i) => (
              <div key={v.id+i+"H"} className="group cursor-pointer bg-white/[0.02] border border-white/5 p-2 hover:border-[var(--color-accent)]/50 transition-all">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-black">
                  <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-mono">{v.duration}</span>
                </div>
                <p className="text-xs font-bold text-white truncate group-hover:text-[var(--color-accent)] transition-colors">{v.title}</p>
                <div className="flex items-center justify-between text-[10px] text-white/40 mt-1 font-mono">
                  <span>{v.year}</span>
                  <span>{v.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ I — Asymmetrical Magazine Editorial ═══ */}
      {active === "I" && (
        <div className="site-container py-10">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] block mb-1">Editorial Spread</span>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">Video Showcase</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Big 8-col Hero */}
            <div className="md:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden bg-black border border-white/10 group cursor-pointer">
              <img src={thumb(VIDEOS[0].id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 px-3 py-1 rounded-full inline-block mb-3">Cover Feature</span>
                <h2 className="text-4xl font-black uppercase text-white tracking-tight">{VIDEOS[0].title}</h2>
                <p className="text-sm text-white/60 mt-2 max-w-lg">{VIDEOS[0].year} · Directed by 7th Heaven Crew · {VIDEOS[0].views} views</p>
              </div>
            </div>
            {/* 4-col Side Stack */}
            <div className="md:col-span-4 flex flex-col gap-4">
              {VIDEOS.slice(1, 3).map((v) => (
                <div key={v.id+v.title+"I"} className="flex-1 relative overflow-hidden bg-black border border-white/10 group cursor-pointer min-h-[160px]">
                  <img src={thumb(v.id)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-base font-bold text-white uppercase truncate">{v.title}</h3>
                    <p className="text-xs text-white/50">{v.year} · {v.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom 4-col Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {VIDEOS.slice(3, 7).map((v) => (
              <VideoCard key={v.id+v.title+"Ibot"} v={v} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ J — Translucent Glassmorphism Cards ═══ */}
      {active === "J" && (
        <div className="site-container py-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] block mb-2">Glass Experience</span>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">Glassmorphic Gallery</h1>
            <p className="text-sm text-white/50 mt-2">Smooth backdrop blur cards with floating neon glow highlights.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIDEOS.map((v) => (
              <div key={v.id+v.title+"J"} className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-[var(--color-accent)]/60 rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group cursor-pointer">
                <div className="relative aspect-video overflow-hidden mb-4 bg-black">
                  <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/80 backdrop-blur-md flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide truncate max-w-[200px]">{v.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{v.year} · {v.views} views</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 px-2.5 py-1 rounded-full">{v.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ K — Interactive Chronological Timeline Stream ═══ */}
      {active === "K" && (
        <div className="site-container py-12">
          <div className="mb-10 text-center">
            <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] block mb-1">Discography History</span>
            <h1 className="text-4xl font-black uppercase text-white">Chronological Video Archive</h1>
          </div>
          <div className="relative border-l-2 border-white/10 pl-6 md:pl-10 space-y-12 ml-4">
            {[2025, 2021, 2020, 2019].map((yr) => (
              <div key={yr} className="relative">
                <span className="absolute -left-[31px] md:-left-[47px] top-0 w-6 h-6 rounded-full bg-[var(--color-accent)] border-4 border-[#050508] flex items-center justify-center shadow-[0_0_15px_var(--color-accent)]" />
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                  <span>{yr}</span>
                  <span className="h-px bg-white/10 flex-1" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {VIDEOS.filter(v => v.year === yr || (yr === 2025 && v.year === 2025) || (yr === 2020 && v.year === 2020)).slice(0, 3).map((v) => (
                    <VideoCard key={v.id+v.title+"K"+yr} v={v} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ L — Multi-Stream Cinema Console ═══ */}
      {active === "L" && (
        <div className="site-container py-8">
          <div className="bg-black/90 border border-white/15 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Live Cinema Console</span>
              </div>
              <CatNav active={cat} set={setCat} />
            </div>
            {/* Primary Cinema Screen */}
            <div className="relative aspect-[21/9] overflow-hidden mb-6 bg-black border border-white/10">
              <img src={thumb(featured.id)} alt={featured.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center shadow-[0_0_50px_rgba(255,10,61,0.7)] cursor-pointer">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase">{featured.title}</h2>
                  <p className="text-xs text-white/50">{featured.year} · {featured.views} views</p>
                </div>
                <span className="text-xs font-mono font-bold bg-white/10 border border-white/20 px-3 py-1 rounded-full text-white">{featured.duration}</span>
              </div>
            </div>
            {/* Bottom 4-card Stream Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VIDEOS.slice(0, 4).map((v, i) => (
                <div key={v.id+v.title+"L"} className={`p-2  border transition-all cursor-pointer ${i === 0 ? "bg-[var(--color-accent)]/20 border-[var(--color-accent)]" : "bg-white/5 border-white/10 hover:border-white/30"}`}>
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                    <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-white truncate">{v.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ M — Bounded Category Drawer + Row Carousels ═══ */}
      {active === "M" && (
        <div className="site-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left 240px Category Sidebar */}
            <div className="w-full lg:w-[240px] shrink-0 bg-white/[0.02] border border-white/10 p-4 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)] mb-3">Categories</h3>
              <div className="flex flex-col gap-1.5">
                {CATS.map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={`text-left text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg transition-all ${cat === c ? "bg-[var(--color-accent)] text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {/* Right Row Carousels */}
            <div className="flex-1 min-w-0 space-y-8">
              {CATS.map((category) => (
                <div key={category+"M"}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black uppercase text-white tracking-wider">{category}</h3>
                    <span className="text-xs text-[var(--color-accent)] font-bold cursor-pointer hover:underline">View All →</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {VIDEOS.slice(0, 3).map((v) => (
                      <VideoCard key={v.id+v.title+"M"+category} v={v} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ N — Studio Broadcast Monitor Wall ═══ */}
      {active === "N" && (
        <div className="site-container py-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.3em] text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> CONTROL ROOM WALL
              </span>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white">Broadcast Grid</h1>
            </div>
            <CatNav active={cat} set={setCat} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/90 p-4 border border-white/15 rounded-3xl">
            {VIDEOS.concat(VIDEOS.slice(0, 4)).map((v, i) => (
              <div key={v.id+i+"N"} className="relative aspect-video overflow-hidden bg-black border border-white/15 group cursor-pointer hover:border-[var(--color-accent)] transition-all">
                <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 bg-black/80 text-[9px] font-mono text-white/80 px-1.5 py-0.5 rounded border border-white/20">CAM-0{i + 1}</div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 backdrop-blur-sm">
                  <p className="text-xs font-bold text-white truncate">{v.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ O — Vertical Video Reels Carousel ═══ */}
      {active === "O" && (
        <div className="site-container py-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.3em] text-[var(--color-accent)] block mb-1">Reels & Clips</span>
            <h1 className="text-4xl font-black uppercase text-white">Short Video Feed</h1>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x custom-scrollbar">
            {VIDEOS.concat(VIDEOS).map((v, i) => (
              <div key={v.id+i+"O"} className="w-[240px] aspect-[9/16] shrink-0 snap-center rounded-3xl overflow-hidden relative bg-black border border-white/15 group cursor-pointer shadow-xl">
                <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                <div className="absolute top-4 left-4 right-4 flex justify-between text-[var(--font-size-2xs)] font-mono text-white/70">
                  <span>#0{i + 1}</span>
                  <span>{v.duration}</span>
                </div>
                <div className="absolute bottom-6 left-4 right-4">
                  <h3 className="text-base font-bold text-white uppercase leading-snug">{v.title}</h3>
                  <p className="text-xs text-white/60 mt-1">7th Heaven · {v.views} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ P — High-Contrast Minimalist Spread (Clean #f5f8ff Light Background) ═══ */}
      {active === "P" && (
        <div className="bg-[#f5f8ff] min-h-screen py-12 text-black">
          <div className="site-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/10 mb-10">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] block mb-1">Light Theme Option</span>
                <h1 className="text-4xl font-black uppercase tracking-tight text-black">Off-White Clean Gallery</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button key={c+"P"} onClick={() => setCat(c)} className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${cat === c ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10 hover:border-black/30"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {VIDEOS.map((v) => (
                <div key={v.id+v.title+"P"} className="bg-white border border-black/10 p-3 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden mb-3 bg-black">
                    <img src={thumb(v.id)} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[var(--font-size-2xs)] font-bold px-2 py-0.5 rounded">{v.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-black uppercase truncate group-hover:text-[var(--color-accent)] transition-colors">{v.title}</h3>
                  <div className="flex items-center justify-between text-xs text-black/50 mt-1 font-mono">
                    <span>{v.year}</span>
                    <span>{v.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
