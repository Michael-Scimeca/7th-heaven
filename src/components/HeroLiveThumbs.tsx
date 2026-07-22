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
    <div className="animate-[fade-in-up_0.6s_var(--ease-out-expo)_1.1s_both] w-fit">
      {/* Live Feed Cards Row */}
      <div className="flex items-center gap-3.5 select-none">
        {mediaPosts.slice(0, 2).map((post, idx) => {
          const isVideo = !!post.video_url;
          const thumbSrc = isVideo
            ? `https://img.youtube.com/vi/${extractYouTubeId(post.video_url!) || "BzHUNTZ66zY"}/mqdefault.jpg`
            : post.image_url || "/images/band-performance.png";

          const crewName = idx === 0 ? "CREW RYAN" : "CREW ADAM";
          const timeText = idx === 0 ? "TIME: 24:32" : "TIME: 18:15";

          return (
            <Link
              key={post.id}
              href="/live"
              className="bg-white rounded-[18px] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:scale-105 transition-all duration-300 group shrink-0 w-[160px] sm:w-[175px]"
            >
              {/* Thumbnail Image */}
              <div className="relative w-full h-[98px] sm:h-[108px] rounded-[12px] overflow-hidden bg-black">
                <img
                  src={thumbSrc}
                  alt={crewName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top-Right LIVE Badge */}
                <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                  LIVE
                </div>
              </div>

              {/* Bottom White Card Info Row */}
              <div className="flex items-center justify-between pt-1.5 px-1 text-black font-sans">
                {/* Status Dot + Member Name */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-tight text-black truncate">
                    {crewName}
                  </span>
                </div>

                {/* Stream Duration / Timestamp */}
                <span className="text-[8px] font-extrabold text-black/70 font-mono tracking-tight shrink-0">
                  {timeText}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
