"use client";
import Image from "next/image";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SeventhButton from "./SeventhButton";
const InlineYTPlayer = dynamic(() => import("./InlineYTPlayer"), {
  ssr: false,
});

type VideoCategoryData = {
  category: string;
  videos: Array<{
    id: string;
    title: string;
    duration?: string;
    viewCount?: string;
    year: string | number;
  }>;
};

const FALLBACK_VIDEOS: VideoCategoryData[] = [
  {
    category: "Featured",
    videos: [
      {
        id: "BzHUNTZ66zY",
        title: "Ain't That Just Beautiful (Official Video)",
        year: 2026,
      },
      { id: "i7dK9GCZOYo", title: "30 Songs in 30 Minutes Medley", year: 2025 },
    ],
  },
];

interface SmallCardProps {
  video: {
    id: string;
    title: string;
    duration?: string;
    viewCount?: string;
    year: string | number;
    category: string;
  };
  playingId: string | null;
  onPlay: (id: string) => void;
  onClose: () => void;
}

function SmallCard({ video, playingId, onPlay, onClose }: SmallCardProps) {
  return (
    <div className="group flex flex-col">
      <div className="relative aspect-video overflow-hidden border border-white/5 bg-[var(--color-bg-card)]">
        {playingId === video.id ? (
          <InlineYTPlayer
            videoId={video.id}
            title={video.title}
            onClose={onClose}
          />
        ) : (
          <button
            className="group/thumb absolute inset-0 h-full w-full cursor-pointer"
            onClick={() => onPlay(video.id)}
            aria-label={`Play ${video.title}`}
          >
            <Image
              width={480}
              height={360}
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              className="absolute inset-0 z-[1] h-full w-full object-cover group-hover/thumb:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/images/video-placeholder.jpg";
              }}
            />
            {/* YouTube-style hover overlay */}
            <div className="absolute inset-0 z-[2] flex items-center justify-center group-hover/thumb:bg-black/40">
              <div className="flex h-12 w-12 scale-75 items-center justify-center rounded-lg bg-[var(--color-accent)] opacity-0 group-hover/thumb:scale-100 group-hover/thumb:opacity-100">
                <svg
                  width="16"
                  height="18"
                  viewBox="0 0 20 22"
                  fill="currentColor"
                >
                  <path d="M19 11L1 21V1L19 11Z" />
                </svg>
              </div>
            </div>
            {/* Duration badge */}
            {video.duration && (
              <div className="r absolute right-2 bottom-2 z-[3] rounded-[2px] bg-black/80 px-1.5 py-0.5 backdrop-blur-sm">
                {video.duration}
              </div>
            )}
          </button>
        )}
      </div>
      <div className="mt-3">
        <h3 className="mb-1 line-clamp-2 group-hover:text-[var(--color-accent)]">
          {video.title}
        </h3>
        <div className="flex flex-col gap-0.5">
          <span className="text-white/40">7th Heaven</span>
          <div className="flex items-center gap-1.5 text-white/40">
            {video.viewCount && <span>{video.viewCount} views</span>}
            <span className="text-white/10">•</span>
            <span>{video.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoSection() {
  const [videosData, setVideosData] =
    useState<VideoCategoryData[]>(FALLBACK_VIDEOS);
  const [activeFilter, setActiveFilter] = useState(
    FALLBACK_VIDEOS[0]?.category || "",
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [navStuck, setNavStuck] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [gridVisible, setGridVisible] = useState(true);
  const [pendingFilter, setPendingFilter] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const navSentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    import("../../public/data/videos.json")
      .then((m) => {
        if (active && m.default) {
          setVideosData(m.default as unknown as VideoCategoryData[]);
          setActiveFilter((prev) =>
            !prev || prev === FALLBACK_VIDEOS[0]?.category
              ? m.default[0]?.category || ""
              : prev,
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filteredVideos =
    videosData.find((c) => c.category === activeFilter)?.videos || [];

  /* Intersection Observer to detect when the nav should stick */
  useEffect(() => {
    const sentinel = navSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-73px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-t border-b border-white/10 bg-[var(--color-bg-secondary)] py-32"
      id="videos-preview"
    >
      {/* Title */}
      <div className="mb-16 px-8">
        <div>
          <h2>
            Featured <span className="gradient-text">Videos</span>
          </h2>
        </div>
      </div>

      {/* Featured: Latest big left + 4 next in 2×2 right */}
      {(() => {
        const allVideos = videosData.flatMap((cat) =>
          cat.videos.map((v) => ({ ...v, category: cat.category })),
        );
        const latest = allVideos[0];
        const next4 = allVideos.slice(1, 5);
        if (!latest) return null;

        return (
          <div className="mb-8 px-8">
            <p className="mb-6 px-1">Trending Releases</p>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Big featured video — left */}
              <div className="group flex flex-col">
                <div className="relative aspect-video overflow-hidden border border-white/5 bg-[var(--color-bg-card)]">
                  {playingId === `featured-${latest.id}` ? (
                    <InlineYTPlayer
                      videoId={latest.id}
                      title={latest.title}
                      onClose={() => setPlayingId(null)}
                    />
                  ) : (
                    <button
                      className="group/thumb absolute inset-0 h-full w-full cursor-pointer"
                      onClick={() => setPlayingId(`featured-${latest.id}`)}
                      aria-label={`Play ${latest.title}`}
                    >
                      <Image
                        width={1280}
                        height={720}
                        src={`https://img.youtube.com/vi/${latest.id}/hqdefault.jpg`}
                        alt={latest.title}
                        className="absolute inset-0 z-[1] h-full w-full object-cover group-hover/thumb:scale-105"
                        priority
                        onError={(e) => {
                          e.currentTarget.src = "/images/video-placeholder.jpg";
                        }}
                      />
                      <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/30 group-hover/thumb:bg-black/50">
                        <SeventhButton
                          icon={false}
                          className="flex h-16 w-16 items-center justify-center !rounded-full border border-purple-300/40 !p-0 group-hover/thumb:scale-110"
                        >
                          <svg
                            width="22"
                            height="24"
                            viewBox="0 0 20 22"
                            fill="currentColor"
                            className="ml-1"
                          >
                            <path d="M19 11L1 21V1L19 11Z" />
                          </svg>
                        </SeventhButton>
                      </div>
                      {latest.duration && (
                        <div className="r absolute right-3 bottom-3 z-[3] rounded bg-black/80 px-2 py-1 backdrop-blur-sm">
                          {latest.duration}
                        </div>
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="mb-2 group-hover:text-[var(--color-accent)]">
                    {latest.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                      7H
                    </div>
                    <div className="flex flex-col">
                      <span>7th Heaven Official</span>
                      <div className="flex items-center gap-2 text-white/40">
                        {latest.viewCount && (
                          <span>{latest.viewCount} views</span>
                        )}
                        <span className="text-white/10">•</span>
                        <span>{latest.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2×2 grid — right */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {next4.map((video) => (
                  <SmallCard
                    key={video.id}
                    video={video}
                    playingId={playingId}
                    onPlay={setPlayingId}
                    onClose={() => setPlayingId(null)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sentinel */}
      <div ref={navSentinelRef} className="h-0" />

      {/* Sticky category nav — Pill Tabs */}
      <div
        className={`sticky top-[72px] z-30 mb-8 ${navStuck ? "border-b border-white/10 backdrop-blur-lg" : ""}`}
        style={
          navStuck ? { backgroundColor: "rgba(10, 10, 15, 0.95)" } : undefined
        }
      >
        <div className="scrollbar-hide overflow-x-auto px-8">
          <nav className="flex min-w-max items-center gap-2 border-t border-white/5 py-5">
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
                className={`cursor-pointer rounded-lg px-6 py-2 whitespace-nowrap ${(pendingFilter || activeFilter) === cat.category ? "bg-white text-black" : "bg-white/[0.05] hover:bg-white/10 hover:text-white"}`}
              >
                {cat.category}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Video Grid */}
      <div ref={gridRef} className="scroll-mt-[140px] px-8">
        <div
          className={`grid grid-cols-1 gap-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 ${gridVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          {filteredVideos.slice(0, visibleCount).map((video, idx) => (
            <div
              key={video.id}
              className="group flex flex-col"
              style={{ animationDelay: gridVisible ? `${idx * 40}ms` : "0ms" }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden rounded-[8px] border border-white/5 bg-[var(--color-bg-card)]">
                {playingId === video.id ? (
                  <InlineYTPlayer
                    videoId={video.id}
                    title={video.title}
                    onClose={() => setPlayingId(null)}
                  />
                ) : (
                  <button
                    className="group/thumb absolute inset-0 h-full w-full cursor-pointer"
                    onClick={() => setPlayingId(video.id)}
                    aria-label={`Play ${video.title}`}
                  >
                    <Image
                      width={480}
                      height={360}
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 z-[1] h-full w-full object-cover group-hover/thumb:scale-105"
                      loading="lazy"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth <= 120) {
                          img.src = "/images/video-placeholder.jpg";
                        }
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/video-placeholder.jpg";
                      }}
                    />
                    <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/10 group-hover/thumb:bg-black/30">
                      <SeventhButton
                        icon={false}
                        className="flex h-12 w-12 scale-75 items-center justify-center !rounded-full border border-purple-300/40 !p-0 opacity-0 group-hover/thumb:scale-100 group-hover/thumb:opacity-100"
                      >
                        <svg
                          width="16"
                          height="18"
                          viewBox="0 0 20 22"
                          fill="currentColor"
                          className="ml-1"
                        >
                          <path d="M19 11L1 21V1L19 11Z" />
                        </svg>
                      </SeventhButton>
                    </div>
                    {/* Duration badge */}
                    {video.duration && (
                      <div className="r absolute right-2 bottom-2 z-[3] rounded-[2px] bg-black/80 px-1.5 py-0.5 backdrop-blur-sm">
                        {video.duration}
                      </div>
                    )}
                  </button>
                )}
              </div>

              {/* Info below thumbnail */}
              <div className="mt-3 flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                  7H
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <h3 className="group- mb-1 line-clamp-2">{video.title}</h3>
                  <div className="flex flex-col">
                    <span className="cursor-pointer text-white/40 hover:text-white">
                      7th Heaven Official
                    </span>
                    <div className="flex items-center gap-1.5 text-white/40">
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
          <div className="6 flex justify-center">
            <button
              aria-label="Previous"
              onClick={() => setVisibleCount((prev) => prev + 15)}
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] px-8 py-3 hover:bg-[var(--color-accent)]/80"
            >
              Load More{" "}
              <span className="font-normal text-white/50">
                ({filteredVideos.length - visibleCount} remaining)
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
