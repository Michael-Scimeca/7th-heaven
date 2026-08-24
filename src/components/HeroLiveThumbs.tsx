"use client";
import Image from 'next/image';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase-client";
import { useVideoSnapshots } from "@/context/VideoSnapshotContext";

const mockThumbs: FeedPostDB[] = [
  {
    id: "thumb-1",
    member_name: "Ryan",
    member_role: "Photo/Video Crew",
    member_avatar: "MS",
    content: "🔴 LIVE from the stage!",
    post_type: "video",
    video_url: "https://www.youtube.com/watch?v=BzHUNTZ66zY",
    reactions: { "🔥": 142 },
    is_live: true,
    created_at: "2026-08-06T16:47:00.000Z",
  },
  {
    id: "thumb-2",
    member_name: "Adam",
    member_role: "Photo/Video Crew",
    member_avatar: "MS",
    content: "Adam owning it 🎤🔥",
    post_type: "photo",
    image_url: "/images/band-performance.webp",
    reactions: { "🔥": 89 },
    is_live: true,
    created_at: "2026-08-06T16:42:00.000Z",
  },
];

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function HeroLiveThumbs() {
  const { isLoggedIn, openModal } = useMember();
  const [posts, setPosts] = useState<FeedPostDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { snapshots } = useVideoSnapshots();
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("hero_live_thumbs_open");
    if (saved === "false") {
      setIsOpen(false);
    }
    setMounted(true);

    const updateScale = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setScale(Math.max(0.45, (window.innerWidth - 100) / 600));
        } else {
          setScale(1);
        }
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale, { passive: true });
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hero_live_thumbs_open", "false");
  };

  const handleOpen = () => {
    setIsOpen(true);
    localStorage.setItem("hero_live_thumbs_open", "true");
  };

  const fetchPosts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setPosts(mockThumbs);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("feed_posts")
        .select("*")
        .in("post_type", ["photo", "video", "crowd"])
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      setPosts(data?.length ? data : mockThumbs);
    } catch {
      setPosts(mockThumbs);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
    const intervalId = setInterval(fetchPosts, 60000);
    return () => clearInterval(intervalId);
  }, [fetchPosts]);

  const filteredMedia = posts.filter((p) => p.image_url || p.video_url);
  const mediaPosts = filteredMedia.length > 0 ? filteredMedia : mockThumbs;

  if (!mounted) {
    return null;
  }

  if (!isOpen) {
    return (
      <button aria-label="Action button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)]/80 border border-white/10 hover:border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:scale-[1.03] active:scale-95 transition-colors duration-300  backdrop-blur-[45px] select-none group cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
        </span>
        <span className="text-[var(--font-size-3xs)]  font-bold  text-white/80 group-hover:text-white uppercase tracking-[0.18em]">
          Show Live Streams
        </span>
      </button>
    );
  }

  const unscaledWidth = 452;
  const unscaledHeight = 295;

  if (loading) {
    return (
      <div
        className="relative flex justify-start items-end"
        style={{
          width: scale < 1 ? `${unscaledWidth * scale}px` : `${unscaledWidth}px`,
          height: scale < 1 ? `${unscaledHeight * scale}px` : `${unscaledHeight}px`,
        }}
      >
        <div
          className="absolute left-0 bottom-0 select-none animate-pulse flex items-end gap-3"
          style={{
            width: `${unscaledWidth}px`,
            height: `${unscaledHeight}px`,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "bottom left",
          }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-[220px] h-[250px] bg-[#e1e6ff29]   shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  // TEMPORARILY DISABLED (User request: "remove this for now and put it back later")
  return null;

  return (
    <div
      className="relative flex justify-start items-end"
      style={{
        width: scale < 1 ? `${unscaledWidth * scale}px` : `${unscaledWidth}px`,
        height: scale < 1 ? `${unscaledHeight * scale}px` : `${unscaledHeight}px`,
      }}
    >
      <div
        className="absolute left-0 bottom-0 select-none animate-[fade-in-up_0.6s_var(--ease-out-expo)_1.1s_both]"
        style={{
          width: `${unscaledWidth}px`,
          height: `${unscaledHeight}px`,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "bottom left",
        }}
      >
        {/* ── LIVE NOW header ── */}
        <div className="relative flex items-center justify-between mb-3 px-1 w-full">
          <div className="flex items-center gap-2 pr-7">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="text-white text-[var(--font-size-2xs)]  font-bold  uppercase tracking-[0.18em] whitespace-nowrap">
              Crew Streaming
            </span>
            {mediaPosts.length > 2 && (
              <Link
                href="/live"
                className="text-[var(--font-size-4xs)]  font-bold  text-red-500 hover:text-red-400 transition-colors uppercase tracking-[0.15em] ml-2 cursor-pointer flex items-center gap-0.5 hover:underline whitespace-nowrap"
              >
                + {mediaPosts.length - 2} More →
              </Link>
            )}
          </div>
          <button onClick={handleClose}
            className="text-white/40 hover:text-white transition-colors duration-200 p-2.5 min-w-[48px] min-h-[48px] rounded hover:bg-white/10 flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Hide Live Streams"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Card Row ── */}
        <div className="flex items-end gap-3 select-none">
          {mediaPosts.slice(0, 2).map((post, idx) => {
            const fallbackSrc = post.image_url || "/images/band-performance.webp";
            // Prefer the live canvas snapshot if available, else fall back
            const thumbSrc = snapshots[idx] ?? fallbackSrc;

            const crewName = idx === 0 ? "CREW RYAN" : "CREW ADAM";
            const timeText = idx === 0 ? "24:32" : "18:15";
            const viewers = idx === 0 ? "1.2K" : "847";

            return (
              <Link
                key={post.id}
                href="/live"
                className="group shrink-0 w-[220px] h-[250px] overflow-hidden bg-[var(--color-bg-surface)] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(220,38,38,0.25)] transition-colors duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-[195px] overflow-hidden bg-zinc-950">
                  <Image width={220} height={195}
                    src={thumbSrc}
                    alt={crewName}
                    priority={idx === 0}
                    quality={65}
                    sizes="220px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                  />

                  {/* Red gradient bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* LIVE badge — top left */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-red-600 text-white text-[var(--font-size-3xs)]  font-bold  uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.7)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>

                  {/* Viewer count — top right */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[var(--font-size-4xs)] font-bold px-2 py-0.5 rounded-full">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                    {viewers}
                  </div>

                  {/* Stream duration — bottom left */}
                  <div className="absolute bottom-3 left-3.5 text-white/80 text-[var(--font-size-3xs)] font-mono font-bold">
                    {timeText}
                  </div>
                </div>

                {/* Info row */}
                <div className="flex items-center justify-between px-4 py-3 flex-1 bg-black/30 border-t border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Green dot + name */}
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[var(--font-size-2xs)]  font-bold  uppercase tracking-tight text-white truncate">
                      {crewName}
                    </span>
                  </div>

                  {/* Watch now cta */}
                  <span className="text-[var(--font-size-4xs)]  font-bold  uppercase tracking-wide text-red-400 group-hover:text-red-300 transition-colors shrink-0">
                    WATCH →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
