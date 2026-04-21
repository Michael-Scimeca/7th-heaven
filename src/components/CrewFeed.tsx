"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase";

// ─── Tour schedule for LIVE NOW detection ───
const tourDates = [
 { date: "April 17, 2026", time: "8:00pm", venue: "Joe's Live", city: "Rosemont", state: "IL" },
 // Add more dates as needed — or fetch from tour data
];

function isShowLiveNow(): { live: boolean; venue?: string } {
 const now = new Date();
 for (const show of tourDates) {
  const match = show.time.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) continue;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  if (match[3].toLowerCase() === "pm" && h !== 12) h += 12;
  if (match[3].toLowerCase() === "am" && h === 12) h = 0;

  const showDate = new Date(show.date);
  showDate.setHours(h, m, 0, 0);

  // Show is "live" from 30 min before start to 4 hours after start
  const preShow = new Date(showDate.getTime() - 30 * 60 * 1000);
  const postShow = new Date(showDate.getTime() + 4 * 60 * 60 * 1000);

  if (now >= preShow && now <= postShow) {
   return { live: true, venue: show.venue };
  }
 }
 return { live: false };
}

// ─── Post types config ───
const typeConfig: Record<string, { color: string; label: string; icon: string }> = {
 text: { color: "#851DEF", label: "Update", icon: "✍️" },
 photo: { color: "#22c55e", label: "Photo", icon: "📸" },
 video: { color: "#ef4444", label: "Video", icon: "🎬" },
 setlist: { color: "#f59e0b", label: "Setlist", icon: "🎵" },
 crowd: { color: "#06b6d4", label: "Crowd", icon: "🤘" },
 announcement: { color: "#f59e0b", label: "Announcement", icon: "🚨" },
};

// ─── Mock posts (used when Supabase is not configured) ───
const mockPosts: FeedPostDB[] = [
 {
  id: "1",
  member_name: "Adam Heisler",
  member_role: "Lead Vocals",
  member_avatar: "AH",
  content: "Sound check at Joe's Live! This venue has incredible acoustics. Can't wait for Thursday night 🔥🎤",
  post_type: "photo",
  reactions: { "🔥": 47, "🤘": 32, "❤️": 18 },
  is_live: true,
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
 },
 {
  id: "2",
  member_name: "Richard Hofherr",
  member_role: "Guitar / Keys",
  member_avatar: "RH",
  content: "Working on some new arrangements for the summer shows. Adding a few surprises to the setlist that I think you're all going to love. Stay tuned 🎸🎹",
  post_type: "text",
  reactions: { "🎸": 28, "❤️": 41 },
  is_live: true,
  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
 },
 {
  id: "3",
  member_name: "Nick Cox",
  member_role: "Guitar / Vocals",
  member_avatar: "NC",
  content: "Caught some amazing deep sky shots last night between rehearsals. The Orion Nebula was on full display 🌌🔭 Music and astrophotography — the two best things in life.",
  post_type: "photo",
  reactions: { "🌌": 55, "🔥": 22, "❤️": 34 },
  is_live: true,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
 },
 {
  id: "4",
  member_name: "7th Heaven",
  member_role: "Official",
  member_avatar: "7H",
  content: "🚨 NEW DATES ADDED! We just locked in 5 more summer shows across the Midwest. Check the tour page for all the details. See you out there!",
  post_type: "announcement",
  reactions: { "🤘": 89, "🔥": 67, "❤️": 45 },
  is_live: true,
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
 },
 {
  id: "5",
  member_name: "Mark Kennetz",
  member_role: "Bass / Vocals",
  member_avatar: "MK",
  content: "New bass strings on and dialed in. There's nothing like the sound of fresh rounds on a P-Bass. Thursday is going to hit different 🎸💪",
  post_type: "text",
  reactions: { "🎸": 19, "🔥": 14 },
  is_live: true,
  created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
 },
 {
  id: "6",
  member_name: "Frankie Harchut",
  member_role: "Drums",
  member_avatar: "FH",
  content: "Just got the kit re-tuned and ready for the next run of shows. New heads on the snare — punchy and crisp, just the way I like it 🥁🔥 Let's go!",
  post_type: "text",
  reactions: { "🥁": 33, "🤘": 21 },
  is_live: true,
  created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
 },
];

// ─── Time ago helper ───
function timeAgo(dateStr: string): string {
 const now = Date.now();
 const then = new Date(dateStr).getTime();
 const diff = now - then;
 const minutes = Math.floor(diff / 60000);
 const hours = Math.floor(diff / 3600000);
 const days = Math.floor(diff / 86400000);

 if (minutes < 1) return "Just now";
 if (minutes < 60) return `${minutes}m ago`;
 if (hours < 24) return `${hours}h ago`;
 if (days === 1) return "1 day ago";
 return `${days} days ago`;
}

export default function CrewFeed() {
 const [posts, setPosts] = useState<FeedPostDB[]>([]);
 const [liveStatus, setLiveStatus] = useState<{ live: boolean; venue?: string }>({ live: false });
 const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
 const [isLoading, setIsLoading] = useState(true);
 const feedRef = useRef<HTMLDivElement>(null);

 // ─── Fetch posts ───
 const fetchPosts = useCallback(async () => {
  if (!isSupabaseConfigured) {
   setPosts(mockPosts);
   setIsLoading(false);
   return;
  }

  try {
   const { data, error } = await supabase
    .from("feed_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

   if (error) throw error;
   setPosts(data || []);
  } catch {
   console.warn("Supabase not available, using mock data");
   setPosts(mockPosts);
  }
  setIsLoading(false);
 }, [isSupabaseConfigured]);

 // ─── Real-time subscription ───
 useEffect(() => {
  fetchPosts();

  if (!isSupabaseConfigured) return;

  const channel = supabase
   .channel("feed_posts_realtime")
   .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "feed_posts" },
    (payload) => {
     const newPost = payload.new as FeedPostDB;
     setPosts((prev) => [newPost, ...prev]);
     setNewPostIds((prev) => new Set(prev).add(newPost.id));

     // Remove highlight after animation
     setTimeout(() => {
      setNewPostIds((prev) => {
       const next = new Set(prev);
       next.delete(newPost.id);
       return next;
      });
     }, 3000);
    }
   )
   .subscribe();

  return () => {
   supabase.removeChannel(channel);
  };
 }, [fetchPosts, isSupabaseConfigured]);

 // ─── LIVE NOW detection ───
 useEffect(() => {
  const check = () => setLiveStatus(isShowLiveNow());
  check();
  const interval = setInterval(check, 60000); // check every minute
  return () => clearInterval(interval);
 }, []);

 if (isLoading) {
  return (
   <section className="py-20 bg-[var(--color-bg-primary)]">
    <div className="site-container !max-w-[800px]">
     <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
       <div key={i} className="h-40 bg-white/[0.03] border border-white/[0.06] animate-pulse" />
      ))}
     </div>
    </div>
   </section>
  );
 }

 return (
  <section className="py-20 bg-[var(--color-bg-primary)]">
   <div className="site-container !max-w-[800px]">
    {/* Section Header */}
    <div className="flex items-center justify-between mb-10">
     <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
       {/* LIVE NOW badge */}
       {liveStatus.live ? (
        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1">
         <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
         </span>
         <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-red-400">
          Live Now{liveStatus.venue ? ` — ${liveStatus.venue}` : ""}
         </span>
        </div>
       ) : (
        <div className="flex items-center gap-2">
         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
         <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-green-500">Crew Feed</span>
        </div>
       )}
       <span className="text-white/20">·</span>
       <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30">{posts.length} posts</span>
      </div>
      <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] leading-tight tracking-tight">
       {liveStatus.live ? (
        <>Live from <span className="gradient-text">{liveStatus.venue || "the show"}</span></>
       ) : (
        <>Crew <span className="gradient-text">Feed</span></>
       )}
      </h2>
      <p className="text-[0.85rem] text-white/40 mt-2">
       {liveStatus.live
        ? "Real-time updates from the stage and backstage"
        : "Behind the scenes with the 7th Heaven crew"}
      </p>
     </div>
    </div>

    {/* Feed Timeline */}
    <div className="relative" ref={feedRef}>
     {/* Timeline line */}
     <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

     <div className="flex flex-col gap-0">
      {posts.map((post) => {
       const config = typeConfig[post.post_type] || typeConfig.text;
       const isNew = newPostIds.has(post.id);
       const reactions = typeof post.reactions === "object" ? post.reactions : {};

       return (
        <article
         key={post.id}
         className={`relative pl-16 pb-8 transition-all duration-700 ${
          isNew ? "animate-slide-in-feed" : ""
         }`}
         id={`crew-feed-${post.id}`}
         style={isNew ? { animation: "slideInFeed 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" } : undefined}
        >
         {/* Timeline dot */}
         <div
          className="absolute left-[18px] top-3 w-3 h-3 rounded-full border-2 z-10 transition-all duration-300"
          style={{
           borderColor: config.color,
           background: isNew ? config.color : "var(--color-bg-primary)",
          }}
         />

         {/* New post glow */}
         {isNew && (
          <div
           className="absolute -inset-2 opacity-20 pointer-events-none transition-opacity duration-3000"
           style={{ background: `radial-gradient(ellipse at left, ${config.color}40, transparent 70%)` }}
          />
         )}

         {/* Post Card */}
         <div
          className={`border bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] ${
           isNew ? "border-white/20" : "border-white/[0.06]"
          }`}
         >
          {/* Header: Avatar + Name + Time */}
          <div className="flex items-start justify-between mb-4">
           <div className="flex items-center gap-3">
            <div
             className="w-10 h-10 rounded-full flex items-center justify-center text-[0.65rem] font-bold border"
             style={{
              borderColor: config.color,
              color: config.color,
              background: `${config.color}15`,
             }}
            >
             {post.member_avatar}
            </div>
            <div>
             <div className="flex items-center gap-2">
              <span className="text-[0.85rem] font-semibold text-white">{post.member_name}</span>
              {post.post_type === "announcement" && (
               <span className="text-[0.5rem] font-bold uppercase tracking-[0.15em] px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Official
               </span>
              )}
             </div>
             <span className="text-[0.7rem] text-white/30">{post.member_role}</span>
            </div>
           </div>

           <div className="flex flex-col items-end gap-1">
            <span className="text-[0.6rem] text-white/30">{timeAgo(post.created_at)}</span>
            <span
             className="text-[0.5rem] font-bold uppercase tracking-[0.15em] px-2 py-0.5"
             style={{
              color: config.color,
              background: `${config.color}15`,
              border: `1px solid ${config.color}30`,
             }}
            >
             {config.icon} {config.label}
            </span>
           </div>
          </div>

          {/* Content */}
          <p className="text-[0.9rem] text-white/70 leading-relaxed mb-4">{post.content}</p>

          {/* Image attachment */}
          {post.image_url && (
           <div className="mb-4 border border-white/10 overflow-hidden">
            <img src={post.image_url} alt="" className="w-full h-auto" loading="lazy" />
           </div>
          )}

          {/* Reactions bar */}
          <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
            {Object.entries(reactions).map(([emoji, count], ri) => (
             <span key={ri} className="flex items-center gap-1 text-[0.75rem] text-white/40 hover:text-white/70 transition-colors cursor-pointer">
              <span>{emoji}</span>
              <span className="tabular-nums">{count as number}</span>
             </span>
            ))}
           </div>
          </div>
         </div>
        </article>
       );
      })}
     </div>
    </div>

    {/* Load More */}
    <div className="text-center mt-8">
     <button className="btn-outline btn-outline-hover text-[0.7rem] py-2.5 px-8">
      Load More Posts
     </button>
    </div>
   </div>

   {/* Slide-in animation keyframes */}
   <style jsx>{`
    @keyframes slideInFeed {
     0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.98);
     }
     100% {
      opacity: 1;
      transform: translateY(0) scale(1);
     }
    }
   `}</style>
  </section>
 );
}
