"use client";
import Image from 'next/image';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Palette, Search, Play } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CustomVideoPlayer = dynamic(() => import("@/components/CustomVideoPlayer"), { ssr: false });

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

function VideoThumbnail({ videoId, title, isActive }: { videoId: string; title: string; isActive?: boolean }) {
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
  const [failed, setFailed] = useState(false);

  const previewUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=10&end=20&playsinline=1&modestbranding=1&enablejsapi=1`;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#1a0f2e] via-[#0c0817] to-black flex items-center justify-center overflow-hidden">
      {/* 10-Second Video Preview Loop when active starting 10s into video */}
      {isActive && (
        <iframe
          key={videoId}
          src={previewUrl}
          title={`${title} Preview`}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 w-full h-full object-cover scale-125 pointer-events-none z-0 border-0 opacity-90 transition-opacity duration-700"
        />
      )}

      {/* Static Fallback Thumbnail Image */}
      {!failed && (
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className={`object-cover transition-opacity duration-700 ${isActive ? "opacity-0" : "opacity-100 group-hover:scale-110"}`}
          unoptimized
          onError={() => {
            if (imgSrc.includes('maxresdefault')) {
              setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
            } else {
              setFailed(true);
            }
          }}
        />
      )}

      {failed && !isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#291645] via-[#120a24] to-[#05030a] flex flex-col items-center justify-center p-4 text-center z-10">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <span className="text-white/90 font-black text-xs uppercase tracking-wider line-clamp-2 px-2">{title}</span>
          <span className="text-purple-300/60 text-[10px] uppercase tracking-widest font-mono mt-1">7th Heaven Vault</span>
        </div>
      )}
    </div>
  );
}

export default function MediaPage() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch("/data/videos.json");
      if (r.ok) {
        const data: VideoCategory[] = await r.json();
        setCategories(data);
        if (data.length > 0) {
          setActiveFilter(data[0].category);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const featuredVideo = categories.find(c => c.category === 'Official Music Videos')?.videos[0];

  const selectedCategory = categories.find(c => c.category === activeFilter) || categories[0];

  // Filter videos inside the selected category by search
  const filteredVideos = selectedCategory?.videos.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return v.title.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q));
  }) || [];

  // GSAP ScrollTrigger setup for video list items
  useEffect(() => {
    if (typeof window === "undefined" || filteredVideos.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      videoItemRefs.current.forEach((item, index) => {
        if (!item) return;

        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.5,
          onToggle: (self) => {
            if (self.isActive) {
              setActiveIndex(index);
            }
          },
        });
      });
    }, containerRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [filteredVideos.length, activeFilter, searchQuery]);

  const handleTitleClick = (index: number) => {
    const el = videoItemRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen">

      {/* ── FEATURED HERO (100vh Full Screen) ── */}
      {featuredVideo && (
        <section className="relative overflow-hidden h-screen w-full mb-12">
          <div className="absolute inset-0">
            {heroPlaying ? (
              <div className="absolute inset-0 w-full h-full">
                <CustomVideoPlayer videoId={featuredVideo.id} title={featuredVideo.title} onClose={() => setHeroPlaying(false)} />
              </div>
            ) : (
              <>
                <Image width={200} height={200} unoptimized
                  src={thumbMax(featuredVideo.id)}
                  alt="7th Heaven Media"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = thumb(featuredVideo.id); }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                <button onClick={() => setHeroPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group/play"
                  aria-label="Play featured video"
                >
                  <div className="w-24 h-24 rounded-full bg-[var(--color-accent)]/90 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover/play:bg-[var(--color-accent)] group-hover/play:scale-110 transition-colors duration-300 shadow-[0_0_60px_rgba(255,10,61,0.8)]">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="white" className="ml-1.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </button>
              </>
            )}
          </div>

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
                <button aria-label="Action button"
                  onClick={() => setHeroPlaying(true)}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black text-xs uppercase tracking-widest transition-colors hover:scale-105 shadow-[0_0_30px_rgba(255,10,61,0.5)] cursor-pointer"
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
      <Link
        href="/media/layout-demo"
        className="fixed bottom-6 left-6 z-[999] px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,10,61,0.5)] transition-colors hover:scale-105 flex items-center gap-2"
      >
        <Palette className="w-4 h-4" />
        <span>Layout Options</span>
      </Link>

      {/* ── CATEGORY FILTER TABS & SEARCH BAR ── */}
      <div className="site-container px-6 mb-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0">
            {categories.filter(cat => cat.videos.length > 0).map((cat) => {
              const isActive = activeFilter === cat.category;
              return (
                <button
                  key={cat.category}
                  onClick={() => {
                    setActiveFilter(cat.category);
                    setActiveIndex(0);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${isActive
                    ? "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(255,10,61,0.4)]"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <span>{cat.category}</span>
                  <span className={`text-[10px] tabular-nums font-black px-1.5 py-0.2 rounded-full ${isActive ? "bg-black/30 text-white" : "bg-purple-500/20 text-purple-300"
                    }`}>
                    {cat.videos.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="SEARCH MEDIA..."
            width="300px"
          />
        </div>
      </div>

      {/* ── GSAP SCROLL-DRIVEN NAME-LIST / VIDEO REVEAL SECTION ── */}
      <div ref={containerRef} className="site-container px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: SCROLLABLE TYPOGRAPHY VIDEO NAME LIST (5 COLS) */}
          <div className="lg:col-span-5 space-y-16 md:space-y-24 ">
            {filteredVideos.map((video, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={video.id}
                  ref={(el) => {
                    videoItemRefs.current[index] = el;
                  }}
                  onClick={() => handleTitleClick(index)}
                  className="group cursor-pointer transition-all duration-300 select-none border-b border-white/5 pb-10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-purple-400 font-bold tracking-widest opacity-80">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      {video.year}
                    </span>
                    {video.duration && (
                      <span className="text-xs font-mono text-white/40 font-bold">
                        · {video.duration}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight transition-all duration-300 ${isActive
                      ? "!text-[#c084fc] scale-[1.02] translate-x-2 drop-shadow-[0_0_35px_rgba(192,132,252,0.85)]"
                      : "text-white/30 group-hover:text-white/70"
                      }`}
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {video.title}
                  </h3>

                  {video.description && (
                    <p
                      className={`mt-3 text-sm leading-relaxed max-w-lg transition-opacity duration-300 ${isActive ? "text-white/80 opacity-100" : "text-white/30 opacity-40"
                        }`}
                    >
                      {video.description}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingId(video.id);
                    }}
                    className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,10,61,0.4)] cursor-pointer ${isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                      }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    <span>Play Video</span>
                  </button>
                </div>
              );
            })}

            {filteredVideos.length === 0 && (
              <div className="py-16 text-center bg-white/5 rounded-2xl border border-white/5">
                <p className="text-white/60 text-sm font-semibold">No videos found matching &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-bold uppercase text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY VIDEO PREVIEW / PLAYER CONTAINER (7 COLS) */}
          <div className="lg:col-span-7 shrink-0 lg:sticky lg:top-[120px] z-20">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-0 shadow-[0_25px_70px_rgba(0,0,0,0.85)] bg-purple-950/20">
              {filteredVideos.map((video, index) => {
                const isActive = activeIndex === index;
                const isPlaying = playingId === video.id;

                return (
                  <div
                    key={video.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${isActive
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-105 pointer-events-none"
                      }`}
                  >
                    {isPlaying ? (
                      <CustomVideoPlayer videoId={video.id} title={video.title} onClose={() => setPlayingId(null)} />
                    ) : (
                      <button
                        onClick={() => setPlayingId(video.id)}
                        className="relative w-full h-full cursor-pointer group/card block text-left"
                        aria-label={`Play ${video.title}`}
                      >
                        <VideoThumbnail videoId={video.id} title={video.title} isActive={isActive} />
                        <div className="absolute inset-0  group-hover/card:bg-black/50 transition-colors z-10" />

                        {/* Play Icon Badge */}
                        <div className="absolute inset-0 hidden group-hover/card:flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(255,10,61,0.6)] group-hover/card:scale-110 transition-transform">
                            <Play className="w-7 h-7 fill-white ml-1 text-white" />
                          </div>
                        </div>

                        {/* Caption Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                            {selectedCategory?.category}
                          </span>
                          <h4 className="text-lg font-black uppercase tracking-tight text-white mt-1 drop-shadow-md truncate">
                            {video.title}
                          </h4>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {categories.length === 0 && (
        <div className="site-container py-32 text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading media...</p>
        </div>
      )}
    </div>
  );
}
