"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase";

// ─── Mock live show media (Fallback only) ───
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
  const [viewerCount, setViewerCount] = useState(0);
  const [activeLiveRooms, setActiveLiveRooms] = useState<any[]>([]);

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

  // Fetch live stream status
  useEffect(() => {
    const checkLiveStreams = async () => {
      try {
        const res = await fetch("/api/live-rooms");
        const data = await res.json();
        const allRooms = data.rooms || [];
        const rooms = allRooms.filter((r: any) => r.showOnHomepage);
        setActiveLiveRooms(rooms);
        
        // Calculate total viewers across visible rooms
        const total = rooms.reduce((acc: number, r: any) => acc + (r.numParticipants || 0), 0);
        // If real viewers is 0 but rooms exist, show a small random number for "hype"
        setViewerCount(total || (rooms.length > 0 ? Math.floor(Math.random() * 20) + 5 : 0));
      } catch (err) {
        console.error("Live rooms check failed", err);
      }
    };

    checkLiveStreams();
    const interval = setInterval(checkLiveStreams, 20000);
    return () => clearInterval(interval);
  }, []);

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

  // Real-time updates for feed posts
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



      {/* Multi-Stream Links (If 2+ streams) */}
      {activeLiveRooms.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4 animate-[fade-in_0.5s_ease-out]">
          <span className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest self-center mr-2">Alternative Feeds:</span>
          {activeLiveRooms.slice(1).map((room, idx) => (
            <Link 
              key={room.name} 
              href={`/live/${room.name}`}
              className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[var(--color-accent)]/50 px-3 py-1.5 rounded-full flex items-center gap-2 transition-all group"
            >
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[0.6rem] font-bold text-white/70 group-hover:text-white uppercase tracking-wider truncate max-w-[120px]">
                {room.title?.split(' — ')[0] || room.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Main Player */}
      <div className="relative group">
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

        {/* Real-time Live Overlay */}
        {activeLiveRooms.length > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="text-center p-8 scale-90 group-hover:scale-100 transition-transform duration-500">
              <div className="mb-4 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-full text-[0.7rem] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Now
              </div>
              <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6">Join the Crew Live</h4>
              <Link href="/live" className="btn-primary flex items-center justify-center gap-3 px-8 py-4 text-sm shadow-[0_0_30px_rgba(133,29,239,0.3)]">
                Enter Live Stream ⚡
              </Link>
            </div>
          </div>
        )}
      </div>

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




      {/* Listen / Buy Links */}
      <div className="flex gap-2 mt-2">
       <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CP5NWKWMEQMMJ" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.65rem] text-center uppercase tracking-wider py-2.5 transition-all">
        Buy CD
       </a>
       <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.65rem] text-center uppercase tracking-wider py-2.5 transition-all">
        Spotify
       </a>
       <a href="https://music.apple.com" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.65rem] text-center uppercase tracking-wider py-2.5 transition-all">
        Apple Music
       </a>
      </div>

     </div>
    </div>
   </div>
  );
}
