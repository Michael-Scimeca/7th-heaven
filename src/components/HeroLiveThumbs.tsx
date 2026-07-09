"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase";

const mockThumbs: FeedPostDB[] = [
  {
    id: "thumb-1",
    member_name: "Michael Scimeca",
    member_role: "Photo/Video Crew",
    member_avatar: "MS",
    content: "🔴 LIVE from the stage!",
    post_type: "video",
    video_url: "https://www.youtube.com/watch?v=BzHUNTZ66zY",
    reactions: { "🔥": 142 },
    is_live: true,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "thumb-2",
    member_name: "Michael Scimeca",
    member_role: "Photo/Video Crew",
    member_avatar: "MS",
    content: "Adam owning it 🎤🔥",
    post_type: "photo",
    image_url: "/images/band-performance.png",
    reactions: { "🔥": 89 },
    is_live: true,
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "thumb-3",
    member_name: "Crew",
    member_role: "Crew",
    member_avatar: "CR",
    content: "Crowd going wild",
    post_type: "crowd",
    image_url: "/images/hero-band-bg.png",
    reactions: { "🤘": 45 },
    is_live: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

export default function HeroLiveThumbs() {
  const { isLoggedIn, openModal } = useMember();
  const [posts, setPosts] = useState<FeedPostDB[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Auto-refresh every 60 seconds to pull the latest frames/posts
    const intervalId = setInterval(fetchPosts, 60000);
    return () => clearInterval(intervalId);
  }, [fetchPosts]);

  const filteredMedia = posts.filter((p) => p.image_url || p.video_url);
  // Always show demo thumbnails if no real media posts exist
  const mediaPosts = filteredMedia.length > 0 ? filteredMedia : mockThumbs;



  // ─── Logged in: show thumbnails ───
  if (loading) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 animate-[fade-in-up_0.6s_var(--ease-out-expo)_1.1s_both]">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[150px] h-[150px] rounded-lg bg-white/5 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-[fade-in-up_0.6s_var(--ease-out-expo)_1.1s_both] w-full">
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">Active Live Feeds</span>
        <Link href="/live" className="text-[10px] font-bold text-white/25 hover:text-white/60 uppercase tracking-widest transition-colors ml-auto flex items-center gap-1">
          View All
          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>
      </div>
      
      {/* Horizontal Scroll Track */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 select-none scrollbar-thin scrollbar-thumb-white/10">
        {mediaPosts.slice(0, 3).map((post) => {
          const isVideo = !!post.video_url;
          const thumbSrc = isVideo
            ? `https://img.youtube.com/vi/${extractYouTubeId(post.video_url!) || ""}/mqdefault.jpg`
            : post.image_url;

          const reactionIcon = post.reactions ? Object.keys(post.reactions)[0] : null;
          const reactionCount = reactionIcon ? post.reactions[reactionIcon] : null;

          return (
            <Link
              key={post.id}
              href="/live"
              className="relative w-[150px] h-[150px] rounded-lg overflow-hidden border border-white/10 hover:border-[var(--color-accent)]/50 transition-all duration-300 group shrink-0 shadow-lg shadow-black/40"
            >
              {/* Background Image */}
              {thumbSrc && (
                <img
                  src={thumbSrc}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}

              {/* Rich Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent group-hover:via-black/25 transition-all" />

              {/* Top Badges (Live Status / Time Ago) */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                {post.is_live ? (
                  <span className="text-[6px] font-black uppercase tracking-wider bg-red-600/90 text-white px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    Live
                  </span>
                ) : (
                  <span className="text-[6px] font-black uppercase tracking-wider bg-white/10 backdrop-blur-md text-white/80 px-1.5 py-0.5 rounded-sm shadow border border-white/5">
                    Stream
                  </span>
                )}
                <span className="text-[6px] font-bold bg-black/60 backdrop-blur-md text-white/80 px-1.5 py-0.5 rounded-sm shadow border border-white/5">
                  {timeAgo(post.created_at)}
                </span>
              </div>

              {/* Video play icon inside center */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" className="ml-[1px]"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}

              {/* Bottom Card Content Info */}
              <div className="absolute bottom-2 left-2 right-2 flex flex-col pointer-events-none text-left">
                {/* Author Info */}
                <span className="text-[6px] text-[var(--color-accent)] font-extrabold uppercase tracking-widest leading-none">
                  {post.member_role ? post.member_role.split(" ")[0] : "Crew"}
                </span>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-tight mt-0.5 leading-tight truncate">
                  {post.member_name}
                </span>

                {/* Content description */}
                {post.content && (
                  <p className="text-[8px] text-white/70 font-medium leading-tight mt-0.5 line-clamp-1">
                    {post.content}
                  </p>
                )}

                {/* Reaction Badge */}
                {reactionIcon && (
                  <div className="flex items-center gap-1 mt-1 text-[7px] font-bold text-white/60 bg-white/5 border border-white/10 px-1 py-0.5 rounded-sm w-fit backdrop-blur-sm">
                    <span>{reactionIcon}</span>
                    <span>{reactionCount}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {/* Enter live dashboard link */}
        <Link
          href="/live"
          className="w-[150px] h-[150px] rounded-lg border border-dashed border-white/15 hover:border-[var(--color-accent)]/40 hover:bg-white/[0.01] flex flex-col items-center justify-center gap-1.5 transition-all group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-[var(--color-accent)]/30 transition-all duration-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white/30 group-hover:text-[var(--color-accent)] transition-colors"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" /></svg>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">Enter Room</span>
        </Link>
      </div>
    </div>
  );
}
