"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase";

// ─── Mock live show media for demo ───
const mockLiveMedia: FeedPostDB[] = [
 {
  id: "live-1",
  member_name: "Michael Scimeca",
  member_role: "Photo/Video Crew",
  member_avatar: "MS",
  content: "🔴 LIVE from the stage — the guys are absolutely crushing it tonight!",
  post_type: "video",
  video_url: "https://www.youtube.com/watch?v=BzHUNTZ66zY",
  reactions: { "🔥": 142, "🤘": 97, "❤️": 63 },
  is_live: true,
  created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
 },
 {
  id: "live-2",
  member_name: "Michael Scimeca",
  member_role: "Photo/Video Crew",
  member_avatar: "MS",
  content: "Adam absolutely owning the stage right now 🎤🔥",
  post_type: "photo",
  image_url: "/images/band-performance.png",
  reactions: { "🔥": 89, "📸": 34 },
  is_live: true,
  created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
 },
 {
  id: "live-3",
  member_name: "Michael Scimeca",
  member_role: "Photo/Video Crew",
  member_avatar: "MS",
  content: "Sound check vibes — this venue sounds incredible 🎸",
  post_type: "photo",
  image_url: "/images/hero-banner.png",
  reactions: { "🤘": 45, "❤️": 22 },
  is_live: true,
  created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
 },
 {
  id: "live-4",
  member_name: "Adam Heisler",
  member_role: "Lead Vocals",
  member_avatar: "AH",
  content: "Tonight's setlist is going to be something special. We've got surprises 🎵",
  post_type: "setlist",
  reactions: { "🎵": 67, "🔥": 41 },
  is_live: true,
  created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
 },
 {
  id: "live-5",
  member_name: "Michael Scimeca",
  member_role: "Photo/Video Crew",
  member_avatar: "MS",
  content: "The crowd is packed and ready 🤘 Standing room only!",
  post_type: "crowd",
  image_url: "/images/band-performance.png",
  reactions: { "🤘": 112, "🔥": 78 },
  is_live: true,
  created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
 },
];

function timeAgo(dateStr: string): string {
 const diff = Date.now() - new Date(dateStr).getTime();
 const mins = Math.floor(diff / 60000);
 const hrs = Math.floor(diff / 3600000);
 if (mins < 1) return "Just now";
 if (mins < 60) return `${mins}m ago`;
 if (hrs < 24) return `${hrs}h ago`;
 return `${Math.floor(diff / 86400000)}d ago`;
}

function extractYouTubeId(url: string): string | null {
 const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
 return match ? match[1] : null;
}

export default function LiveShowFeed() {
 const [posts, setPosts] = useState<FeedPostDB[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [selectedMedia, setSelectedMedia] = useState<FeedPostDB | null>(null);
 const [newIds, setNewIds] = useState<Set<string>>(new Set());
 const [viewerCount] = useState(Math.floor(Math.random() * 200) + 847);
 const feedRef = useRef<HTMLDivElement>(null);

 // ─── Fetch media posts ───
 const fetchPosts = useCallback(async () => {
  if (!isSupabaseConfigured) {
   setPosts(mockLiveMedia);
   setSelectedMedia(mockLiveMedia[0]);
   setIsLoading(false);
   return;
  }

  try {
   const { data, error } = await supabase
    .from("feed_posts")
    .select("*")
    .in("post_type", ["photo", "video", "crowd"])
    .order("created_at", { ascending: false })
    .limit(20);

   if (error) throw error;
   const result = data?.length ? data : mockLiveMedia;
   setPosts(result);
   setSelectedMedia(result[0]);
  } catch {
   setPosts(mockLiveMedia);
   setSelectedMedia(mockLiveMedia[0]);
  }
  setIsLoading(false);
 }, []);

 // ─── Real-time subscription ───
 useEffect(() => {
  fetchPosts();

  if (!isSupabaseConfigured) return;

  const channel = supabase
   .channel("live_show_media")
   .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "feed_posts" },
    (payload) => {
     const newPost = payload.new as FeedPostDB;
     if (["photo", "video", "crowd"].includes(newPost.post_type)) {
      setPosts((prev) => [newPost, ...prev]);
      setNewIds((prev) => new Set(prev).add(newPost.id));
      // Auto-select new media
      if (newPost.video_url || newPost.image_url) {
       setSelectedMedia(newPost);
      }
      setTimeout(() => {
       setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(newPost.id);
        return next;
       });
      }, 4000);
     }
    }
   )
   .subscribe();

  return () => {
   supabase.removeChannel(channel);
  };
 }, [fetchPosts]);

 const mediaPosts = posts.filter((p) => p.image_url || p.video_url);
 const videoId = selectedMedia?.video_url ? extractYouTubeId(selectedMedia.video_url) : null;

 if (isLoading) {
  return (
   <div className="w-full">
    <div className="aspect-video bg-white/[0.03] animate-pulse border border-white/[0.06]" />
    <div className="grid grid-cols-4 gap-2 mt-2">
     {[1, 2, 3, 4].map((i) => (
      <div key={i} className="aspect-square bg-white/[0.03] animate-pulse border border-white/[0.06]" />
     ))}
    </div>
   </div>
  );
 }

 return (
  <div className="w-full" ref={feedRef}>
   {/* LIVE Banner */}
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
     <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1.5">
      <span className="relative flex h-2 w-2">
       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
       <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <span className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-red-400">Live</span>
     </div>
     <span className="text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.15em]">
      From the Show
     </span>
    </div>
    <div className="flex items-center gap-2">
     <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
     <span className="text-[0.6rem] font-bold text-white/30 tabular-nums">
      {viewerCount.toLocaleString()} watching
     </span>
    </div>
   </div>

   {/* Main Media Player */}
   <div className="relative group">
    {videoId ? (
     <div className="relative aspect-video bg-black border border-white/10 overflow-hidden">
      <iframe
       src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
       className="absolute inset-0 w-full h-full"
       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
       allowFullScreen
      />
     </div>
    ) : selectedMedia?.image_url ? (
     <div className="relative aspect-video bg-black border border-white/10 overflow-hidden">
      <img
       src={selectedMedia.image_url}
       alt={selectedMedia.content}
       className="w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      {/* Caption overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
       <div className="flex items-center gap-2 mb-2">
        <div
         className="w-7 h-7 rounded-full flex items-center justify-center text-[0.5rem] font-bold border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/15"
        >
         {selectedMedia.member_avatar}
        </div>
        <span className="text-[0.7rem] font-semibold text-white/80">{selectedMedia.member_name}</span>
        <span className="text-[0.6rem] text-white/30">{timeAgo(selectedMedia.created_at)}</span>
       </div>
       <p className="text-[0.85rem] text-white/90 leading-relaxed">{selectedMedia.content}</p>
      </div>
     </div>
    ) : (
     <div className="aspect-video bg-white/[0.03] border border-white/10 flex items-center justify-center">
      <p className="text-white/20 text-sm">No live media yet — check back soon</p>
     </div>
    )}
   </div>

   {/* Media Thumbnails Grid */}
   {mediaPosts.length > 1 && (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mt-2">
     {mediaPosts.slice(0, 10).map((post) => {
      const isActive = selectedMedia?.id === post.id;
      const isNew = newIds.has(post.id);
      const isVideo = !!post.video_url;
      const thumbSrc = isVideo
       ? `https://img.youtube.com/vi/${extractYouTubeId(post.video_url!) || ""}/mqdefault.jpg`
       : post.image_url;

      return (
       <button
        key={post.id}
        onClick={() => setSelectedMedia(post)}
        className={`relative aspect-square overflow-hidden border transition-all duration-300 cursor-pointer group ${
         isActive
          ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/50"
          : isNew
          ? "border-red-500/50"
          : "border-white/[0.06] hover:border-white/20"
        }`}
        style={isNew ? { animation: "slideInFeed 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" } : undefined}
       >
        {thumbSrc && (
         <img
          src={thumbSrc}
          alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
         />
        )}
        {/* Video indicator */}
        {isVideo && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="opacity-80">
           <path d="M8 5v14l11-7z" />
          </svg>
         </div>
        )}
        {/* Type badge */}
        <div className="absolute top-1 left-1">
         <span className="text-[0.45rem] font-bold uppercase tracking-wider bg-black/60 text-white/70 px-1.5 py-0.5">
          {isVideo ? "🎬" : "📸"} {timeAgo(post.created_at)}
         </span>
        </div>
        {/* New indicator */}
        {isNew && (
         <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
       </button>
      );
     })}
    </div>
   )}

   {/* Latest Text Updates */}
   {posts.filter((p) => !p.image_url && !p.video_url).length > 0 && (
    <div className="mt-4 flex flex-col gap-1.5">
     {posts
      .filter((p) => !p.image_url && !p.video_url)
      .slice(0, 3)
      .map((post) => (
       <div
        key={post.id}
        className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.06] transition-all hover:bg-white/[0.04]"
       >
        <div
         className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[0.5rem] font-bold border border-[var(--color-accent)]/40 text-[var(--color-accent)] bg-[var(--color-accent)]/10"
        >
         {post.member_avatar}
        </div>
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[0.7rem] font-semibold text-white/70">{post.member_name}</span>
          <span className="text-[0.55rem] text-white/20">{timeAgo(post.created_at)}</span>
         </div>
         <p className="text-[0.8rem] text-white/50 leading-relaxed truncate">{post.content}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
         {Object.entries(post.reactions).slice(0, 2).map(([emoji, count]) => (
          <span key={emoji} className="text-[0.6rem] text-white/30">
           {emoji} {count as number}
          </span>
         ))}
        </div>
       </div>
      ))}
    </div>
   )}

   {/* Slide-in animation */}
   <style jsx>{`
    @keyframes slideInFeed {
     0% {
      opacity: 0;
      transform: scale(0.9);
     }
     100% {
      opacity: 1;
      transform: scale(1);
     }
    }
   `}</style>
  </div>
 );
}
