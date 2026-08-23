'use client';
import Image from 'next/image';
import { Play } from "lucide-react";
import CosmicRadialButton from "./CosmicRadialButton";

import React, { useState, useEffect, useCallback } from 'react';
import type { CruiseVideoItem } from '@/app/api/cruise/videos/route';

const FALLBACK_VIDEOS: CruiseVideoItem[] = [
  {
    id: 'vid-cmc-1',
    title: 'Star of the Seas 2027 — Official Promo Video',
    category: 'Promo & Announcements',
    url: 'https://www.youtube.com/watch?v=vaMRyPbgAz4',
    youtubeId: 'vaMRyPbgAz4',
    poster: 'https://img.youtube.com/vi/vaMRyPbgAz4/hqdefault.jpg',
    description: 'Official promo video for the 2027 Chicago Music Cruise aboard Royal Caribbean\'s Star of the Seas (Jan 10, 2027).',
    featured: true,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-2',
    title: 'Pre-Cruise Speech — Oasis of the Seas (2025)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=N3xFvQPXfqk',
    youtubeId: 'N3xFvQPXfqk',
    poster: 'https://img.youtube.com/vi/N3xFvQPXfqk/hqdefault.jpg',
    description: 'Exclusive pre-cruise address & announcements for Oasis of the Seas passengers (March 12, 2025).',
    featured: false,
    createdAt: '2025-03-12T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-3',
    title: 'Pre-Cruise Speech — Icon of the Seas (2025)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=P4j-2p-qLZE',
    youtubeId: 'P4j-2p-qLZE',
    poster: 'https://img.youtube.com/vi/P4j-2p-qLZE/hqdefault.jpg',
    description: 'Official pre-cruise briefing and group activity overview on Icon of the Seas (January 5, 2025).',
    featured: false,
    createdAt: '2025-01-05T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-4',
    title: 'Pre-Cruise Speech — Wonder of the Seas (2023)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=bduMR3nhxnA',
    youtubeId: 'bduMR3nhxnA',
    poster: 'https://img.youtube.com/vi/bduMR3nhxnA/hqdefault.jpg',
    description: 'Pre-cruise speech and band performance highlights aboard Wonder of the Seas (December 5, 2023).',
    featured: false,
    createdAt: '2023-12-05T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-5',
    title: 'Pre-Cruise Speech — Wonder of the Seas (2022)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=55C64kqfR9I',
    youtubeId: '55C64kqfR9I',
    poster: 'https://img.youtube.com/vi/55C64kqfR9I/hqdefault.jpg',
    description: 'Pre-cruise speech and itinerary preview for Wonder of the Seas (December 11, 2022).',
    featured: false,
    createdAt: '2022-12-11T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-6',
    title: 'Pre-Cruise Video Cast — Wonder of the Seas (2022)',
    category: 'Behind the Scenes',
    url: 'https://www.youtube.com/watch?v=Tj-gK_g5g1I',
    youtubeId: 'Tj-gK_g5g1I',
    poster: 'https://img.youtube.com/vi/Tj-gK_g5g1I/hqdefault.jpg',
    description: 'Special video cast with band members previewing the upcoming cruise season (March 11, 2022).',
    featured: false,
    createdAt: '2022-03-11T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-7',
    title: 'Pre-Cruise Speech — Allure of the Seas (2020)',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=If2QYmT7AV4',
    youtubeId: 'If2QYmT7AV4',
    poster: 'https://img.youtube.com/vi/If2QYmT7AV4/hqdefault.jpg',
    description: 'Pre-cruise speech for the 2020 Allure of the Seas Eastern Caribbean voyage (January 9, 2020).',
    featured: false,
    createdAt: '2020-01-09T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-8',
    title: 'Chicago Music Cruise — Video Blog #2 (2019)',
    category: 'Vlogs & Recaps',
    url: 'https://www.youtube.com/watch?v=jXSyCd_siAA',
    youtubeId: 'jXSyCd_siAA',
    poster: 'https://img.youtube.com/vi/jXSyCd_siAA/hqdefault.jpg',
    description: 'Video blog recap detailing cruise preparations and concert schedules (April 2, 2019).',
    featured: false,
    createdAt: '2019-04-02T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-9',
    title: 'Chicago Music Cruise — Video Blog #1 (2019)',
    category: 'Vlogs & Recaps',
    url: 'https://www.youtube.com/watch?v=88TOdJ24Re0',
    youtubeId: '88TOdJ24Re0',
    poster: 'https://img.youtube.com/vi/88TOdJ24Re0/hqdefault.jpg',
    description: 'Inaugural 2019 video blog with behind-the-scenes cruise announcements (March 5, 2019).',
    featured: false,
    createdAt: '2019-03-05T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-10',
    title: 'Pre-Cruise Speech 2019 — Symphony of the Seas',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=6NJKIpsC7bs',
    youtubeId: '6NJKIpsC7bs',
    poster: 'https://img.youtube.com/vi/6NJKIpsC7bs/hqdefault.jpg',
    description: 'Full 2019 pre-cruise presentation for Symphony of the Seas passengers (January 15, 2019).',
    featured: false,
    createdAt: '2019-01-15T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-11',
    title: 'Symphony of the Seas Highlights (2018)',
    category: 'Highlights & Recaps',
    url: 'https://www.youtube.com/watch?v=0KkOUuzNYcs',
    youtubeId: '0KkOUuzNYcs',
    poster: 'https://img.youtube.com/vi/0KkOUuzNYcs/hqdefault.jpg',
    description: 'Highlight reel from the historic Symphony of the Seas fan cruise (September 1, 2018).',
    featured: false,
    createdAt: '2018-09-01T00:00:00.000Z',
  },
  {
    id: 'vid-cmc-12',
    title: 'Pre-Cruise Speech 2018 — Liberty of the Seas',
    category: 'Pre-Cruise Speeches',
    url: 'https://www.youtube.com/watch?v=5nLO1fjBvmU',
    youtubeId: '5nLO1fjBvmU',
    poster: 'https://img.youtube.com/vi/5nLO1fjBvmU/hqdefault.jpg',
    description: 'Official 2018 pre-cruise speech and band lineup announcement.',
    featured: false,
    createdAt: '2018-01-01T00:00:00.000Z',
  },
];

export default function CruiseVideoGallery() {
  const [videos, setVideos] = useState<CruiseVideoItem[]>(FALLBACK_VIDEOS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<CruiseVideoItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cruise/videos');
      if (res.ok) {
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      }
    } catch {
      // Fallback default if fetch fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter(v => v.category === selectedCategory);

  return (
    <section id="ship-videos" className="py-20 site-container relative z-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400mb-3 px-4 py-1 rounded-full    border border-cyan-500/20">
          🎥 Virtual Tours & Video Showcase
        </span>
        <h2
          className="text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white leading-none"
          style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}
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
              <button aria-label="Action button"
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2  text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${selectedCategory === cat
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
            <button aria-label="Action button"
              type="button"
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="w-full text-left group bg-[var(--color-bg-surface)] border border-white/10 hover:border-cyan-400/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-colors duration-500 cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1"
            >
              {/* Poster Thumbnail */}
              <div className="relative aspect-video bg-black/90 overflow-hidden">
                <Image width={200} height={200} unoptimized
                  src={vid.poster || '/images/cruise-hero.png'}
                  alt={vid.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-black/30 to-transparent flex items-center justify-center">
                  <CosmicRadialButton
                    icon={false}
                    className="w-14 h-14 !rounded-full !p-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-300/40 shadow-2xl"
                  >
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </CosmicRadialButton>
                </div>

                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-cyan-300 text-[var(--font-size-3xs)] font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-cyan-500/30">
                  {vid.category}
                </span>

                {vid.featured && (
                  <span className="absolute top-3 right-3 bg-purple-500 text-white text-[var(--font-size-4xs)] font-black uppercase tracking-widest px-2.5 py-0.5 rounded">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Title & Info */}
              <div className="py-6 flex-1 flex flex-col justify-between space-y-3">
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

                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-400tracking-wider pt-3 border-t border-white/5 group-hover:translate-x-1 transition-transform">
                  <span>Watch Video Tour</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Full-screen Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 transition-opacity duration-300 animate-in fade-in">
          <div className="relative w-full max-w-5xl   border-2 border-cyan-400 rounded-3xl p-4 md:p-6 overflow-hidden shadow-[0_0_90px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[var(--font-size-3xs)] font-black uppercase text-purple-400tracking-widest block">
                  {activeVideo.category}
                </span>
                <h3 className="text-white font-black text-base md:text-xl uppercase tracking-wide">
                  {activeVideo.title}
                </h3>
              </div>

              <button aria-label="Action button"
                type="button"
                onClick={() => setActiveVideo(null)}
                className="text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors cursor-pointer"
              >
                ✕ Close Player
              </button>
            </div>

            <div className="aspect-video w-full overflow-hidden bg-black rounded-2xl relative shadow-2xl">
              {(() => {
                const ytId = activeVideo.youtubeId || (activeVideo.url && activeVideo.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]);
                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={activeVideo.url}
                    controls
                    autoPlay
                    muted
                    className="w-full h-full object-contain"
                  >
                    <track kind="captions" />
                  </video>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
