"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase";

// ─── Mock live show media ───
const mockLiveMedia: FeedPostDB[] = [
 {
  id: "live-1",
  member_name: "Michael Scimeca",
  member_role: "Photo/Video Crew",
  member_avatar: "MS",
  content: "🔴 LIVE from the stage — the guys are absolutely crushing it tonight!",
  post_type: "video",
  video_url: "https://www.youtube.com/watch?v=BzHUNTZ66zY",
  reactions: { "🔥": 142, "🤘": 97 },
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
  content: "Sound check vibes 🎸",
  post_type: "photo",
  image_url: "/images/hero-banner.png",
  reactions: { "🤘": 45 },
  is_live: true,
  created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
 },
 {
  id: "live-4",
  member_name: "Michael Scimeca",
  member_role: "Photo/Video Crew",
  member_avatar: "MS",
  content: "Packed house tonight 🤘",
  post_type: "crowd",
  image_url: "/images/band-performance.png",
  reactions: { "🤘": 112 },
  is_live: true,
  created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
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

interface HeroLiveHubProps {
 nextShow?: {
  venue: string;
  date: string;
  time: string;
  city: string;
 };
}

export default function HeroLiveHub({ nextShow }: HeroLiveHubProps) {
 const [posts, setPosts] = useState<FeedPostDB[]>([]);
 const [selectedMedia, setSelectedMedia] = useState<FeedPostDB | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [viewerCount, setViewerCount] = useState(847); useEffect(() => { setViewerCount(Math.floor(Math.random() * 200) + 847); }, []);

 // Notification form state
 const [email, setEmail] = useState("");
 const [zip, setZip] = useState("");
 const [radius, setRadius] = useState("50");
 const [notifyStatus, setNotifyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

 const handleNotify = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !zip) return;
  setNotifyStatus("loading");
  try {
   const res = await fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, zip, radius }),
   });
   if (res.ok) {
    setNotifyStatus("success");
    setEmail("");
    setZip("");
   } else setNotifyStatus("error");
  } catch {
   setNotifyStatus("error");
  }
 };

 // Fetch posts
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
    .limit(12);
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

 // Real-time
 useEffect(() => {
  fetchPosts();
  if (!isSupabaseConfigured) return;
  const channel = supabase
   .channel("hero_live_hub")
   .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, (payload) => {
    const newPost = payload.new as FeedPostDB;
    if (["photo", "video", "crowd"].includes(newPost.post_type)) {
     setPosts((prev) => [newPost, ...prev]);
     if (newPost.video_url || newPost.image_url) setSelectedMedia(newPost);
    }
   })
   .subscribe();
  return () => { supabase.removeChannel(channel); };
 }, [fetchPosts]);

 const mediaPosts = posts.filter((p) => p.image_url || p.video_url);
 const videoId = selectedMedia?.video_url ? extractYouTubeId(selectedMedia.video_url) : null;

 return (
  <div className="w-full text-left">
   <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">

    {/* ═══ LEFT: Live Feed ═══ */}
    <div>
     {/* LIVE Badge */}
     <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
       <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1">
        <span className="relative flex h-2 w-2">
         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-red-400">Live</span>
       </div>
       <span className="text-[0.6rem] font-bold text-white/25 uppercase tracking-[0.15em]">From the Show</span>
      </div>
      <div className="flex items-center gap-2">
       <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
       <span className="text-[0.55rem] font-bold text-white/25 tabular-nums">{viewerCount.toLocaleString()} watching</span>
      </div>
     </div>

     {/* Main Player */}
     {isLoading ? (
      <div className="aspect-video bg-white/[0.03] animate-pulse border border-white/[0.06]" />
     ) : videoId ? (
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
       <img src={selectedMedia.image_url} alt={selectedMedia.content} className="w-full h-full object-cover" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
       <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1">
         <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.45rem] font-bold border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/15">
          {selectedMedia.member_avatar}
         </div>
         <span className="text-[0.65rem] font-semibold text-white/80">{selectedMedia.member_name}</span>
         <span className="text-[0.55rem] text-white/30">{timeAgo(selectedMedia.created_at)}</span>
        </div>
        <p className="text-[0.8rem] text-white/90 leading-relaxed">{selectedMedia.content}</p>
       </div>
      </div>
     ) : (
      <div className="aspect-video bg-white/[0.03] border border-white/10 flex items-center justify-center">
       <p className="text-white/20 text-sm">No live media yet</p>
      </div>
     )}

     {/* Thumbnails */}
     {mediaPosts.length > 1 && (
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mt-2">
       {mediaPosts.slice(0, 5).map((post) => {
        const isActive = selectedMedia?.id === post.id;
        const isVideo = !!post.video_url;
        const thumbSrc = isVideo
         ? `https://img.youtube.com/vi/${extractYouTubeId(post.video_url!) || ""}/mqdefault.jpg`
         : post.image_url;
        return (
         <button
          key={post.id}
          onClick={() => setSelectedMedia(post)}
          className={`relative aspect-square overflow-hidden border transition-all duration-300 cursor-pointer group ${
           isActive ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/50" : "border-white/[0.06] hover:border-white/20"
          }`}
         >
          {thumbSrc && <img src={thumbSrc} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
          {isVideo && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="opacity-80"><path d="M8 5v14l11-7z" /></svg>
           </div>
          )}
          <div className="absolute top-1 left-1">
           <span className="text-[0.4rem] font-bold uppercase tracking-wider bg-black/60 text-white/70 px-1 py-0.5">
            {timeAgo(post.created_at)}
           </span>
          </div>
         </button>
        );
       })}
      </div>
     )}
    </div>

    {/* ═══ RIGHT: Next Show + Notifications ═══ */}
    <div className="flex flex-col gap-4">

     {/* Next Show Card */}
     {nextShow && (
      <div className="bg-white/[0.03] border border-white/10 p-6">
       <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2 w-2">
         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75" />
         <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]" />
        </span>
        <span className="text-[0.6rem] font-black text-[var(--color-accent)] uppercase tracking-[0.2em]">Next Show</span>
       </div>
       <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight">{nextShow.venue}</h3>
       <p className="text-[0.8rem] text-white/40 mb-1">{nextShow.city}</p>
       <div className="flex items-center gap-3 mb-5">
        <span className="text-[0.8rem] font-semibold text-white/70">{nextShow.date}</span>
        {nextShow.time && (
         <>
          <span className="text-white/10">•</span>
          <span className="text-[0.8rem] text-white/50">{nextShow.time}</span>
         </>
        )}
       </div>
       <Link href="/tour" className="btn-primary btn-primary-hover text-[0.7rem] w-full text-center block">
        View All Shows →
       </Link>
      </div>
     )}

     {/* Get Notified Card */}
     <div className="bg-white/[0.03] border border-white/10 p-6 flex-1">
      <div className="flex items-center gap-3 mb-4">
       <div className="w-9 h-9 border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #851DEF)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
         <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
         <circle cx="12" cy="10" r="3" />
        </svg>
       </div>
       <div>
        <h3 className="text-sm font-bold text-white tracking-tight">Never Miss a Show</h3>
        <p className="text-[0.65rem] text-white/30">Get notified when we play near you</p>
       </div>
      </div>

      {notifyStatus === "success" ? (
       <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
         <span className="text-white font-bold text-[0.8rem]">You&apos;re on the list!</span>
        </div>
        <p className="text-white/40 text-[0.65rem]">We&apos;ll notify you when a show is near you.</p>
       </div>
      ) : (
       <form onSubmit={handleNotify} className="flex flex-col gap-2.5">
        <input
         type="email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         required
         placeholder="your@email.com"
         className="w-full bg-white/[0.03] border border-white/10 px-3.5 py-3 text-[0.8rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
        />
        <div className="flex gap-2">
         <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          required
          placeholder="Zip Code"
          maxLength={5}
          pattern="\d{5}"
          className="flex-1 bg-white/[0.03] border border-white/10 px-3.5 py-3 text-[0.8rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
         />
         <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="bg-white/[0.03] border border-white/10 px-2 py-3 text-[0.7rem] text-white/50 focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer text-center w-[70px]"
         >
          <option value="25" className="bg-[#0a0a0f]">25 mi</option>
          <option value="50" className="bg-[#0a0a0f]">50 mi</option>
          <option value="100" className="bg-[#0a0a0f]">100 mi</option>
          <option value="200" className="bg-[#0a0a0f]">200 mi</option>
         </select>
        </div>
        <button
         type="submit"
         disabled={notifyStatus === "loading"}
         className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.7rem] uppercase tracking-[0.1em] py-3 transition-all cursor-pointer disabled:opacity-50"
        >
         {notifyStatus === "loading" ? "Signing up..." : "Notify Me"}
        </button>
        {notifyStatus === "error" && (
         <p className="text-red-400 text-[0.65rem]">Something went wrong. Try again.</p>
        )}
       </form>
      )}
      <p className="text-[0.5rem] text-white/15 mt-3">Unsubscribe anytime. We&apos;ll never share your info.</p>
     </div>

     {/* Quick Links */}
     <div className="flex gap-2">
      <Link href="/tour" className="flex-1 btn-outline btn-outline-hover text-[0.65rem] text-center py-2.5">
       🎤 Tour Dates
      </Link>
      <Link href="#music-player-section" className="flex-1 btn-outline btn-outline-hover text-[0.65rem] text-center py-2.5">
       🎵 Listen Now
      </Link>
     </div>
    </div>
   </div>
  </div>
 );
}
