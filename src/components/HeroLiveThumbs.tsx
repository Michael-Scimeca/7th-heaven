"use client";
import Image from "next/image";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";
import {
  supabase,
  isSupabaseConfigured,
  type FeedPostDB,
} from "@/lib/supabase-client";
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
    image_url: "/images/hero/band-performance.webp",
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

  useEffect(() => {
    const saved = localStorage.getItem("hero_live_thumbs_open");
    if (saved === "false") {
      setIsOpen(false);
    }
    setMounted(true);
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
      <button
        onClick={handleOpen}
        className="group flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[var(--color-bg-surface)]/80 px-3 py-1.5 backdrop-blur-2xl select-none"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-lg bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-lg bg-red-600" />
        </span>
        <span className="group-hover:text-white">Show Live Streams</span>
      </button>
    );
  }

  const unscaledWidth = 452;
  const unscaledHeight = 295;

  if (loading) {
    return (
      <div className="relative flex max-w-[452px] items-end justify-start">
        <div className="flex animate-pulse items-end gap-3 select-none">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-[250px] w-[220px] shrink-0 bg-[#00000029]"
            />
          ))}
        </div>
      </div>
    );
  }

  // TEMPORARILY DISABLED (User request: "remove this for now and put it back later")
  return null;

  return (
    <div className="relative flex max-w-[452px] items-end justify-start">
      <div className="animate-[fade-in-up_0.6s_var(--ease-out-expo)_1.1s_both] select-none">
        {/* ── LIVE NOW header ── */}
        <div className="relative mb-3 flex w-full items-center justify-between px-1">
          <div className="flex items-center gap-2 pr-7">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-lg bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-lg bg-red-600" />
            </span>
            <span className="whitespace-nowrap text-[var(--font-size-2xs)]">
              Crew Streaming
            </span>
            {mediaPosts.length > 2 && (
              <Link
                href="/live"
                className="ml-2 flex cursor-pointer items-center gap-0.5 whitespace-nowrap text-red-500 hover:text-red-400 hover:text-white"
              >
                + {mediaPosts.length - 2} More →
              </Link>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center rounded p-2.5 text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Hide Live Streams"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Card Row ── */}
        <div className="flex items-end gap-3 select-none">
          {mediaPosts.slice(0, 2).map((post, idx) => {
            const fallbackSrc =
              post.image_url || "/images/hero/band-performance.webp";
            // Prefer the live canvas snapshot if available, else fall back
            const thumbSrc = snapshots[idx] ?? fallbackSrc;

            const crewName = idx === 0 ? "CREW RYAN" : "CREW ADAM";
            const timeText = idx === 0 ? "24:32" : "18:15";
            const viewers = idx === 0 ? "1.2K" : "847";

            return (
              <Link
                key={post.id}
                href="/live"
                className="group flex h-[250px] w-[220px] shrink-0 flex-col overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(220,38,38,0.25)]"
              >
                {/* Thumbnail */}
                <div className="relative h-[195px] w-full overflow-hidden bg-zinc-950">
                  <Image
                    width={220}
                    height={195}
                    src={thumbSrc}
                    alt={crewName}
                    priority={idx === 0}
                    quality={65}
                    sizes="220px"
                    className="h-full w-full object-cover brightness-90"
                  />

                  {/* Red gradient bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* LIVE badge — top left */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 shadow-[0_0_12px_rgba(220,38,38,0.7)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-lg bg-white" />
                    LIVE
                  </div>

                  {/* Viewer count — top right */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-0.5 backdrop-blur-sm">
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {viewers}
                  </div>

                  {/* Stream duration — bottom left */}
                  <div className="absolute bottom-3 left-3.5">{timeText}</div>
                </div>

                {/* Info row */}
                <div className="flex flex-1 items-center justify-between border-t border-white/5 bg-black/30 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {/* Green dot + name */}
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-lg bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-lg bg-emerald-500" />
                    </span>
                    <span className="text-[var(--font-size-2xs)]">
                      {crewName}
                    </span>
                  </div>

                  {/* Watch now cta */}
                  <span className="shrink-0 text-red-400 group-hover:text-red-300">
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
