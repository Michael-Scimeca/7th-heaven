"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import videosData from "../../public/data/videos.json";

const InlineYTPlayer = dynamic(() => import("./InlineYTPlayer"), { ssr: false });

export default function VideoSection() {
  const [activeFilter, setActiveFilter] = useState(videosData[0]?.category || "");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [navStuck, setNavStuck] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [gridVisible, setGridVisible] = useState(true);
  const [pendingFilter, setPendingFilter] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const navSentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredVideos =
    videosData.find((c) => c.category === activeFilter)?.videos || [];

  /* Intersection Observer to detect when the nav should stick */
  useEffect(() => {
    const sentinel = navSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-73px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[var(--color-bg-secondary)] border-t border-b border-white/10" id="videos-preview">
      {/* Title */}
      <div className="px-8 mb-16">
        <div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
            Featured <span className="gradient-text">Videos</span>
          </h2>
        </div>
      </div>

      {/* Featured: Latest big left + 4 next in 2×2 right */}
      {(() => {
        const allVideos = videosData.flatMap(cat => cat.videos.map(v => ({ ...v, category: cat.category })));
        const latest = allVideos[0];
        const next4 = allVideos.slice(1, 5);
        if (!latest) return null;

        const SmallCard = ({ video }: { video: typeof latest }) => (
          <div className="group flex flex-col">
            <div className="relative aspect-video overflow-hidden bg-[#12121a] border border-white/5">
              {playingId === video.id ? (
                <InlineYTPlayer videoId={video.id} title={video.title} onClose={() => setPlayingId(null)} />
              ) : (
                <button className="absolute inset-0 w-full h-full cursor-pointer group/thumb" onClick={() => setPlayingId(video.id)} aria-label={`Play ${video.title}`}>
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    className="absolute inset-0 z-[1] w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/images/video-placeholder.jpg'; }}
                  />
                  {/* YouTube-style hover overlay */}
                  <div className="absolute inset-0 z-[2] bg-black/20 group-hover/thumb:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center opacity-0 scale-75 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 transition-all duration-300 shadow-xl">
                      <svg width="16" height="18" viewBox="0 0 20 22" fill="currentColor"><path d="M19 11L1 21V1L19 11Z" /></svg>
                    </div>
                  </div>
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 z-[3] px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[0.65rem] font-bold text-white rounded-[2px] tracking-wider">
                      {video.duration}
                    </div>
                  )}
                </button>
              )}
            </div>
            <div className="mt-3">
              <h3 className="text-[0.9rem] font-bold text-white leading-tight line-clamp-2 mb-1 group-hover:text-[var(--color-accent)] transition-colors">{video.title}</h3>
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] text-white/40 font-medium">7th Heaven</span>
                <div className="flex items-center gap-1.5 text-[0.7rem] text-white/40">
                  {video.viewCount && <span>{video.viewCount} views</span>}
                  <span className="text-white/10">•</span>
                  <span>{video.year}</span>
                </div>
              </div>
            </div>
          </div>
        );

        return (
          <div className="px-8 mb-8">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-4 px-1">Trending Releases</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Big featured video — left */}
              <div className="group flex flex-col">
                <div className="relative aspect-video overflow-hidden bg-[#12121a] border border-white/5">
                  {playingId === `featured-${latest.id}` ? (
                    <InlineYTPlayer videoId={latest.id} title={latest.title} onClose={() => setPlayingId(null)} />
                  ) : (
                    <button className="absolute inset-0 w-full h-full cursor-pointer group/thumb" onClick={() => setPlayingId(`featured-${latest.id}`)} aria-label={`Play ${latest.title}`}>
                      <img
                        src={`https://img.youtube.com/vi/${latest.id}/maxresdefault.jpg`}
                        alt={latest.title}
                        className="absolute inset-0 z-[1] w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105"
                        loading="eager"
                        onError={(e) => { e.currentTarget.src = '/images/video-placeholder.jpg'; }}
                      />
                      <div className="absolute inset-0 z-[2] bg-black/20 group-hover/thumb:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center opacity-0 scale-75 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 transition-all duration-300 shadow-2xl">
                          <svg width="24" height="28" viewBox="0 0 20 22" fill="currentColor"><path d="M19 11L1 21V1L19 11Z" /></svg>
                        </div>
                      </div>
                      {/* Duration badge */}
                      {latest.duration && (
                        <div className="absolute bottom-3 right-3 z-[3] px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[0.75rem] font-bold text-white rounded-[2px] tracking-wider">
                          {latest.duration}
                        </div>
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-[1.2rem] font-black text-white leading-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors uppercase tracking-tight">{latest.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[0.6rem] font-black text-white">7H</div>
                    <div className="flex flex-col">
                      <span className="text-[0.75rem] text-white/60 font-bold uppercase tracking-wide">7th Heaven Official</span>
                      <div className="flex items-center gap-2 text-[0.7rem] text-white/40">
                        {latest.viewCount && <span>{latest.viewCount} views</span>}
                        <span className="text-white/10">•</span>
                        <span>{latest.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2×2 grid — right */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {next4.map(video => <SmallCard key={video.id} video={video} />)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sentinel */}
      <div ref={navSentinelRef} className="h-0" />

      {/* Sticky category nav — Pill Tabs */}
      <div
        className={`sticky top-[72px] z-30 transition-all duration-300 mb-8 ${
          navStuck
            ? "backdrop-blur-lg border-b border-white/5 shadow-2xl"
            : ""
        }`}
        style={navStuck ? { backgroundColor: 'rgba(10, 10, 15, 0.95)' } : undefined}
      >
        <div className="px-8 overflow-x-auto scrollbar-hide">
          <nav className="flex items-center gap-2 py-5 min-w-max border-t border-white/5">
            {videosData.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  if (cat.category === activeFilter) return;
                  setPlayingId(null);
                  setGridVisible(false);
                  setPendingFilter(cat.category);
                  setTimeout(() => {
                    setActiveFilter(cat.category);
                    setVisibleCount(15);
                    setGridVisible(true);
                    setPendingFilter(null);
                  }, 250);
                }}
                className={`text-[0.7rem] font-bold uppercase tracking-[0.1em] py-2 px-6 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  (pendingFilter || activeFilter) === cat.category
                    ? "bg-white text-black"
                    : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Video Grid */}
      <div ref={gridRef} className="px-8 scroll-mt-[140px]">
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10 transition-all duration-300 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          {filteredVideos.slice(0, visibleCount).map((video, idx) => (
            <div key={video.id} className="group flex flex-col" style={{ animationDelay: gridVisible ? `${idx * 40}ms` : '0ms' }}>
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-[#12121a] rounded-[8px] border border-white/5">
                {playingId === video.id ? (
                  <InlineYTPlayer
                    videoId={video.id}
                    title={video.title}
                    onClose={() => setPlayingId(null)}
                  />
                ) : (
                  <button
                    className="absolute inset-0 w-full h-full cursor-pointer group/thumb"
                    onClick={() => setPlayingId(video.id)}
                    aria-label={`Play ${video.title}`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 z-[1] w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                      loading="lazy"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth <= 120) {
                          img.src = '/images/video-placeholder.jpg';
                        }
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/video-placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 z-[2] bg-black/10 group-hover/thumb:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center opacity-0 scale-75 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 transition-all duration-300">
                        <svg width="16" height="18" viewBox="0 0 20 22" fill="currentColor"><path d="M19 11L1 21V1L19 11Z" /></svg>
                      </div>
                    </div>
                    {/* Duration badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 z-[3] px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[0.65rem] font-bold text-white rounded-[2px] tracking-wider">
                        {video.duration}
                      </div>
                    )}
                  </button>
                )}
              </div>

              {/* Info below thumbnail */}
              <div className="mt-3 flex gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 flex items-center justify-center text-[0.6rem] font-black text-[var(--color-accent)]">7H</div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h3 className="text-[0.95rem] font-bold text-white leading-tight line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors mb-1">
                    {video.title}
                  </h3>
                  <div className="flex flex-col">
                    <span className="text-[0.75rem] text-white/40 font-medium hover:text-white transition-colors cursor-pointer">7th Heaven Official</span>
                    <div className="flex items-center gap-1.5 text-[0.75rem] text-white/40">
                      {video.viewCount && <span>{video.viewCount} views</span>}
                      <span className="text-white/10">•</span>
                      <span>{video.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {filteredVideos.length > visibleCount && (
          <div className="flex justify-center mt-16">
            <button
              onClick={() => setVisibleCount(prev => prev + 15)}
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.8rem] uppercase tracking-[0.1em] py-3 px-8 transition-all"
            >
              Load More <span className="text-white/50 font-normal">({filteredVideos.length - visibleCount} remaining)</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
