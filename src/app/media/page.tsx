"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const InlineYTPlayer = dynamic(() => import("@/components/InlineYTPlayer"), { ssr: false });

interface Video {
  id: string;
  title: string;
  year: number;
  duration?: string;
  description?: string;
  viewCount?: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hq720.jpg`;
const thumbMax = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export default function MediaPage() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch("/data/videos.json")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const featuredVideo = categories.find(c => c.category === 'Official Music Videos')?.videos[0];

  const handleFilterClick = (cat: string) => {
    if (activeFilter === cat) {
      setActiveFilter(null);
    } else {
      setActiveFilter(cat);
      setTimeout(() => {
        sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Filter categories based on active filter and search
  const displayCategories = categories
    .filter(cat => !activeFilter || cat.category === activeFilter)
    .map(cat => {
      if (!searchQuery.trim()) return cat;
      const q = searchQuery.toLowerCase();
      return {
        ...cat,
        videos: cat.videos.filter(v =>
          v.title.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q))
        ),
      };
    })
    .filter(cat => cat.videos.length > 0);

  return (
    <div className="min-h-screen">

      {/* ── FEATURED HERO (100vh Full Screen) ── */}
      {featuredVideo && (
        <section className="relative bg-black overflow-hidden h-screen w-full">
          {/* Background — either static image or full-screen YouTube */}
          <div className="absolute inset-0">
            {heroPlaying ? (
              <div className="absolute inset-0 w-full h-full">
                <InlineYTPlayer videoId={featuredVideo.id} title={featuredVideo.title} onClose={() => setHeroPlaying(false)} />
              </div>
            ) : (
              <>
                <img
                  src={thumbMax(featuredVideo.id)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = thumb(featuredVideo.id); }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                {/* Centered round play button */}
                <button
                  onClick={() => setHeroPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group/play"
                  aria-label="Play featured video"
                >
                  <div className="w-24 h-24 rounded-full bg-[var(--color-accent)]/90 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover/play:bg-[var(--color-accent)] group-hover/play:scale-110 transition-all duration-300 shadow-[0_0_60px_rgba(255,10,61,0.8)]">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="white" className="ml-1.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Hero content — hidden when video is playing */}
          {!heroPlaying && (
            <div className="relative z-10 site-container flex items-end pb-24 h-screen pointer-events-none">
              <div className="max-w-lg pointer-events-auto">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  Featured Media
                </span>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {featuredVideo.title}
                </h1>
                {featuredVideo.description && (
                  <p className="text-white/60 text-sm mb-4 leading-relaxed max-w-md">{featuredVideo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-white/40 font-bold uppercase tracking-widest mb-6">
                  <span>{featuredVideo.year}</span>
                  {featuredVideo.duration && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featuredVideo.duration}</span></>}
                  {featuredVideo.viewCount && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featuredVideo.viewCount} views</span></>}
                </div>
                <button
                  onClick={() => setHeroPlaying(true)}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,10,61,0.5)] cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Watch Featured Video
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── FLOATING LAYOUT OPTIONS LINK ── */}
      <a
        href="/media/layout-demo"
        className="fixed bottom-6 left-6 z-[999] px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,10,61,0.5)] transition-all hover:scale-105 flex items-center gap-2"
      >
        <span>🎨 Layout Options</span>
      </a>

      {/* ── CATEGORY NAV + SEARCH (Underline tabs with count) ── */}
      <div className="sticky top-[88px] z-40 bg-[var(--color-bg-primary)]/90 backdrop-blur-xl border-b border-black/10">
        <div className="site-container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-wrap gap-x-6 gap-y-1 py-2">
            {categories.map(cat => (
              <button
                key={cat.category}
                onClick={() => handleFilterClick(cat.category)}
                className={`relative text-sm font-extrabold uppercase tracking-[0.12em] py-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === cat.category ? "text-black font-black" : "text-black/60 hover:text-black"
                }`}
              >
                {cat.category}
                <span className="text-xs tabular-nums text-[var(--color-accent)] font-black">{cat.videos.length}</span>
                {activeFilter === cat.category && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)] rounded-full" />}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-56 shrink-0 self-center">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 border border-black/10 rounded-lg py-2 pl-9 pr-4 text-xs font-bold tracking-widest uppercase text-black placeholder-black/40 focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── VIDEO GRID (4-col edge-to-edge) ── */}
      {displayCategories.map(cat => (
        <div key={cat.category} ref={el => { sectionRefs.current[cat.category] = el; }} className="scroll-mt-[160px]">
          <div className="site-container py-6">
            <h3 className="text-lg font-black uppercase tracking-[0.15em] text-black/80">{cat.category}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {cat.videos.map(video => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                  {playingId === video.id ? (
                    <InlineYTPlayer videoId={video.id} title={video.title} onClose={() => setPlayingId(null)} />
                  ) : (
                    <button className="absolute inset-0 w-full h-full cursor-pointer" onClick={() => setPlayingId(video.id)} aria-label={`Play ${video.title}`}>
                      <img src={thumbMax(video.id)} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" onLoad={(e) => { const img = e.currentTarget; if (img.naturalWidth <= 120 && img.src.includes('maxresdefault')) img.src = thumb(video.id); }} onError={(e) => { const img = e.currentTarget; if (img.src.includes('maxresdefault')) img.src = thumb(video.id); }} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg></div></div>
                      {video.duration && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-2xs font-bold px-1.5 py-0.5 rounded">{video.duration}</span>}
                    </button>
                  )}
                </div>
                <div className="pl-8 pr-4 py-4 bg-[var(--color-bg-surface)] border-b border-r border-black/[0.08]">
                  <p className="text-base md:text-lg font-black text-black truncate group-hover:text-[var(--color-accent)] transition-colors tracking-tight">{video.title}</p>
                  <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-black/60 mt-1"><span>{video.year}</span>{video.viewCount && <><span>·</span><span>{video.viewCount} views</span></>}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="site-container py-32 text-center">
          <div className="w-12 h-12 border-2 border-black/10 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black/50 text-sm">Loading media...</p>
        </div>
      )}
    </div>
  );
}
