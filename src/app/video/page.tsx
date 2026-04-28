"use client";

import { useState, useEffect } from "react";
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

export default function VideoPage() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState("Official Music Videos");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/videos.json")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  // Featured video = first Official Music Video (latest release)
  const featuredVideo = categories.find(c => c.category === 'Official Music Videos')?.videos[0];

  let filteredVideos =
    categories.find((c) => c.category === activeFilter)?.videos || [];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredVideos = filteredVideos.filter(v => 
      v.title.toLowerCase().includes(q) || 
      (v.description && v.description.toLowerCase().includes(q))
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-[var(--color-bg-primary)]">

      {/* ── FEATURED / HERO VIDEO ── */}
      {featuredVideo && (
        <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: 'min(70vh, 600px)' }}>
          {/* Background thumbnail blur layer */}
          <div className="absolute inset-0 z-0">
            <img
              src={`https://img.youtube.com/vi/${featuredVideo.id}/maxresdefault.jpg`}
              alt=""
              className="w-full h-full object-cover scale-110 blur-[40px] opacity-30"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${featuredVideo.id}/hq720.jpg`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 site-container py-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12" style={{ minHeight: 'min(70vh, 600px)' }}>
            {/* Video Player / Thumbnail */}
            <div className="w-full lg:w-[65%] shrink-0">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10">
                {heroPlaying ? (
                  <InlineYTPlayer
                    videoId={featuredVideo.id}
                    title={featuredVideo.title}
                    onClose={() => setHeroPlaying(false)}
                  />
                ) : (
                  <button
                    className="absolute inset-0 w-full h-full cursor-pointer group/hero"
                    onClick={() => setHeroPlaying(true)}
                    aria-label={`Play ${featuredVideo.title}`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${featuredVideo.id}/maxresdefault.jpg`}
                      alt={featuredVideo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/hero:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${featuredVideo.id}/hq720.jpg`; }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover/hero:bg-black/10 transition-all duration-500" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_40px_rgba(133,29,239,0.5)] group-hover/hero:scale-110 group-hover/hero:shadow-[0_0_60px_rgba(133,29,239,0.7)] transition-all duration-300">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    {/* Duration badge */}
                    {featuredVideo.duration && (
                      <span className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-[0.7rem] font-bold px-3 py-1 rounded-lg tracking-wider">
                        {featuredVideo.duration}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Info Panel */}
            <div className="w-full lg:w-[35%] flex flex-col gap-5">
              <div>
                <span className="inline-flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  Latest Release
                </span>
                <h1 className="text-[clamp(1.5rem,3.5vw,2.8rem)] font-extrabold text-white leading-[1.1] tracking-tight">
                  {featuredVideo.title}
                </h1>
              </div>
              {featuredVideo.description && (
                <p className="text-white/40 text-[0.9rem] leading-relaxed">{featuredVideo.description}</p>
              )}
              <div className="flex items-center gap-4 text-[0.7rem] text-white/30 font-bold uppercase tracking-widest">
                <span>{featuredVideo.year}</span>
                {featuredVideo.duration && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{featuredVideo.duration}</span>
                  </>
                )}
                {featuredVideo.viewCount && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{featuredVideo.viewCount} views</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setHeroPlaying(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.7rem] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] hover:shadow-[0_0_30px_rgba(133,29,239,0.5)] cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Watch Now
                </button>
                <a
                  href={`https://www.youtube.com/watch?v=${featuredVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/60 hover:text-white font-bold text-[0.7rem] uppercase tracking-widest rounded-xl transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="site-container py-12 flex flex-col gap-10">

        {/* NAV & SEARCH */}
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <nav>
            <ul className="flex flex-row flex-wrap items-center gap-x-1 gap-y-1">
              {categories.map((cat, idx) => (
                <li key={cat.category} className="flex items-center gap-1">
                  <button
                    onClick={() => { setActiveFilter(cat.category); setPlayingId(null); setSearchQuery(""); }}
                    className={`text-[0.65rem] font-bold uppercase tracking-[0.12em] px-2 py-2 transition-colors cursor-pointer whitespace-nowrap ${
                      activeFilter === cat.category
                        ? "text-[var(--color-accent)]"
                        : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    {cat.category}
                  </button>
                  {idx < categories.length - 1 && <span style={{ color: 'var(--color-accent)' }} className="select-none mx-1 text-sm">/</span>}
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative w-full md:w-64 shrink-0">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="SEARCH VIDEOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[0.65rem] font-bold tracking-widest uppercase text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* VIDEO GRID */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {filteredVideos.map((video) => (
              <div key={video.id} className="group">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-[#12121a]">
                  {playingId === video.id ? (
                    <InlineYTPlayer
                      videoId={video.id}
                      title={video.title}
                      onClose={() => setPlayingId(null)}
                    />
                  ) : (
                    <button
                      className="absolute inset-0 w-full h-full cursor-pointer"
                      onClick={() => setPlayingId(video.id)}
                      onMouseEnter={() => setHoveredVideo(video.id)}
                      onMouseLeave={() => setHoveredVideo(null)}
                      aria-label={`Play ${video.title}`}
                    >
                      {/* Active Hover Iframe Preview Layer */}
                      {hoveredVideo === video.id && (
                        <div className="absolute inset-0 z-[1] w-full h-full overflow-hidden scale-[1.4] pointer-events-none opacity-50 transition-opacity duration-1000">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}&modestbranding=1&playsinline=1&rel=0&showinfo=0`}
                            className="w-full h-full object-cover"
                            allow="autoplay; encrypted-media"
                          />
                        </div>
                      )}

                      {/* Static Base Image Thumbnail */}
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className={`absolute inset-0 z-[2] w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
                          hoveredVideo === video.id ? 'opacity-0' : 'opacity-100 grayscale'
                        }`}
                        loading="lazy"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth <= 120 && img.src.includes('maxresdefault')) {
                            img.src = `https://img.youtube.com/vi/${video.id}/hq720.jpg`;
                          }
                        }}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.includes('maxresdefault')) {
                            img.src = `https://img.youtube.com/vi/${video.id}/hq720.jpg`;
                          } else {
                            img.src = '/images/video-placeholder.jpg';
                          }
                        }}
                      />
                      
                      <div className="absolute inset-0 z-[2] bg-black/30 group-hover:bg-black/10 transition-all duration-300" />
                      
                      {/* Play button removed per design request */}
                    </button>
                  )}
                </div>

                {/* Info below thumbnail */}
                <div className="mt-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[0.85rem] font-bold uppercase tracking-[0.05em] text-white leading-tight">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 text-[0.7rem] text-white/50 tabular-nums">
                      <span>{video.year}</span>
                      {video.duration && <span>{video.duration}</span>}
                    </div>
                  </div>

                  {/* Description */}
                  {video.description && (
                    <p className="text-[0.7rem] text-white/30 leading-relaxed line-clamp-1">
                      {video.description}
                    </p>
                  )}

                  {/* Category tag + arrow */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-accent)] border border-white/20 px-3 py-1 rounded-full">
                      {activeFilter}
                    </span>
                    <div className="flex items-center gap-3">
                      {video.viewCount && (
                        <span className="text-[0.6rem] text-[var(--color-accent)] tabular-nums">
                          {video.viewCount} views
                        </span>
                      )}
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-white/60 transition-colors"
                        aria-label="Open on YouTube"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Separator line */}
                <div className="mt-6 h-px bg-white/[0.06]" />
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && categories.length > 0 && (
            <div className="text-center py-20 text-white/30 text-sm">No videos in this category.</div>
          )}
        </div>
      </div>
    </div>
  );
}
