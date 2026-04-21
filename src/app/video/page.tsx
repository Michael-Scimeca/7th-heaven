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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/videos.json")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

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
