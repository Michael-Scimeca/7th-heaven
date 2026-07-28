'use client';

import React, { useState, useEffect } from 'react';
import type { CruiseVideoItem } from '@/app/api/cruise/videos/route';

export default function CruiseVideoGallery() {
  const [videos, setVideos] = useState<CruiseVideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<CruiseVideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/cruise/videos');
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      } catch {
        // Fallback default if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter(v => v.category === selectedCategory);

  return (
    <section id="ship-videos" className="py-20 site-container relative z-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-cyan-400 mb-3 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          🎥 Virtual Tours & Video Showcase
        </span>
        <h2
          className="text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white leading-none"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Explore <span className="accent-gradient-text">Ship Videos</span>
        </h2>
        <p className="text-white/45 mt-4 text-xs md:text-sm leading-relaxed">
          Watch official walkthroughs, entertainment previews, deck tours, and venue spotlights uploaded by our cruise team.
        </p>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mt-8">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12 text-white/40 text-xs bg-white/[0.02] border border-white/5 rounded-3xl">
          No videos available in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map(vid => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="group bg-[var(--color-bg-surface)] border border-white/10 hover:border-cyan-400/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-500 cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1 text-left"
            >
              {/* Poster Thumbnail */}
              <div className="relative aspect-video bg-black/90 overflow-hidden">
                <img
                  src={vid.poster || '/images/cruise-hero.png'}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-black/30 to-transparent flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-black font-black text-xl flex items-center justify-center pl-1 shadow-[0_0_25px_rgba(6,182,212,0.8)] group-hover:scale-110 group-hover:bg-cyan-400 transition-all duration-300">
                    ▶
                  </div>
                </div>

                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-cyan-300 text-[var(--font-size-3xs)] font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-cyan-500/30">
                  {vid.category}
                </span>

                {vid.featured && (
                  <span className="absolute top-3 right-3 bg-amber-400 text-black text-[var(--font-size-4xs)] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-lg">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Title & Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                    {vid.title}
                  </h3>
                  {vid.description && (
                    <p className="text-white/50 text-xs leading-relaxed mt-2 line-clamp-2">
                      {vid.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-cyan-400 tracking-wider pt-3 border-t border-white/5 group-hover:translate-x-1 transition-transform">
                  <span>Watch Video Tour</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl bg-[var(--color-bg-deep)] border-2 border-cyan-400 rounded-3xl p-4 md:p-6 overflow-hidden shadow-[0_0_90px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[var(--font-size-3xs)] font-black uppercase text-cyan-400 tracking-widest block">
                  {activeVideo.category}
                </span>
                <h3 className="text-white font-black text-base md:text-xl uppercase tracking-wide">
                  {activeVideo.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                ✕ Close Player
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
