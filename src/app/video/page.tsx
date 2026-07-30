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

export default function VideoPage() {
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
              <>
                {/* Full-background YouTube player */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${featuredVideo.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&color=white`}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {/* Close button */}
                <button
                  onClick={() => setHeroPlaying(false)}
                  className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all cursor-pointer"
                  aria-label="Close video"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </>
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
                {/* Centered play button */}
                <button
                  onClick={() => setHeroPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group/play"
                  aria-label="Play featured video"
                >
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover/play:bg-white/20 group-hover/play:scale-110 transition-all duration-300 shadow-2xl">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Hero content — hidden when video is playing */}
          {!heroPlaying && (
            <div className="relative z-10 site-container flex items-end pb-24 h-screen">
              <div className="max-w-lg">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3 block flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  Featured
                </span>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {featuredVideo.title}
                </h1>
                {featuredVideo.description && (
                  <p className="text-white/40 text-sm mb-4 leading-relaxed max-w-md">{featuredVideo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-white/30 font-bold uppercase tracking-widest mb-6">
                  <span>{featuredVideo.year}</span>
                  {featuredVideo.duration && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featuredVideo.duration}</span></>}
                  {featuredVideo.viewCount && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{featuredVideo.viewCount} views</span></>}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── CATEGORY NAV + SEARCH (Underline tabs with count) ── */}
      <div className="sticky top-[72px] z-40/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="site-container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-wrap gap-x-6 gap-y-1 py-2">
            {categories.map(cat => (
              <button
                key={cat.category}
                onClick={() => handleFilterClick(cat.category)}
                className={`relative text-xs font-bold uppercase tracking-[0.12em] py-1.5 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === cat.category ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {cat.category}
                <span className="text-2xs tabular-nums text-[var(--color-accent)]">{cat.videos.length}</span>
                {activeFilter === cat.category && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)] rounded-full" />}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-56 shrink-0 self-center">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs font-bold tracking-widest uppercase text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── VIDEO GRID (4-col edge-to-edge) ── */}
      {displayCategories.map(cat => (
        <div key={cat.category} ref={el => { sectionRefs.current[cat.category] = el; }} className="scroll-mt-[160px]">
          <div className="site-container py-6">
            <h3 className="text-lg font-black uppercase tracking-[0.15em] text-white/70">{cat.category}</h3>
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
                <div className="px-3 py-3 bg-[var(--color-bg-surface)] border-b border-r border-white/[0.04]">
                  <p className="text-sm font-bold text-white truncate group-hover:text-[var(--color-accent)] transition-colors">{video.title}</p>
                  <div className="flex items-center gap-2 text-xs text-white/30 mt-1"><span>{video.year}</span>{video.viewCount && <><span>·</span><span>{video.viewCount} views</span></>}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="site-container py-32 text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm">Loading videos...</p>
        </div>
      )}
    </div>
  );
}
