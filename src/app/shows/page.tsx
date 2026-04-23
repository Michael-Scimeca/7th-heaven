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

export default function PastShowsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/videos.json")
      .then((r) => r.json())
      .then((cats: any[]) => {
        const lf = cats.find((c) => c.category === "Live Feeds");
        const baseVideos = lf?.videos || [];
        
        try {
          const customFeeds = JSON.parse(localStorage.getItem('7h_custom_live_feeds') || '[]');
          setVideos([...customFeeds, ...baseVideos]);
        } catch(e) {
          setVideos(baseVideos);
        }
      });
  }, []);

  const filtered = searchQuery.trim()
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : videos;

  return (
    <div className="pt-[72px] min-h-screen bg-[var(--color-bg-primary)]">
      <div className="site-container py-12 flex flex-col gap-10">

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2">Archive</p>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-tight leading-none text-white">
              Past Live Feeds
            </h1>
            <p className="text-white/40 text-sm mt-2">Every archived crew broadcast — watch anything you missed.</p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 shrink-0">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="SEARCH SHOWS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[0.65rem] font-bold tracking-widest uppercase text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">📡</div>
            <p className="text-white/30 text-sm uppercase tracking-wider">No archived feeds yet</p>
            <p className="text-white/20 text-xs">End a crew broadcast with "Save to Gallery" toggled on to archive it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filtered.map((video) => (
              <div key={video.id} className="group flex flex-col gap-0">

                {/* Thumbnail / Player */}
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
                      {/* Hover auto-play preview */}
                      {hoveredVideo === video.id && (
                        <div className="absolute inset-0 z-[1] w-full h-full overflow-hidden scale-[1.4] pointer-events-none">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}&modestbranding=1&playsinline=1&rel=0`}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                          />
                        </div>
                      )}

                      <img
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className={`absolute inset-0 z-[2] w-full h-full object-cover transition-opacity duration-700 pointer-events-none grayscale group-hover:grayscale-0 ${
                          hoveredVideo === video.id ? "opacity-0" : "opacity-100"
                        }`}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.includes("maxresdefault"))
                            img.src = `https://img.youtube.com/vi/${video.id}/hq720.jpg`;
                        }}
                      />

                      <div className="absolute inset-0 z-[3] bg-black/20 group-hover:bg-black/5 transition-all duration-300" />

                      {/* LIVE FEED badge */}
                      <div className="absolute top-3 left-3 z-[4]">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-accent)]/90 rounded-full text-white text-[0.55rem] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Live Archive
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[0.85rem] font-bold uppercase tracking-[0.04em] text-white leading-tight">
                      {video.title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0 text-[0.65rem] text-white/40 tabular-nums">
                      <span>{video.year}</span>
                      {video.duration && <span>{video.duration}</span>}
                    </div>
                  </div>

                  {video.description && (
                    <p className="text-[0.7rem] text-white/30 leading-relaxed line-clamp-1">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2.5 py-1 rounded-full">
                      Crew Broadcast
                    </span>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/20 hover:text-white/60 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Open on YouTube"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="mt-5 h-px bg-white/[0.05]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
