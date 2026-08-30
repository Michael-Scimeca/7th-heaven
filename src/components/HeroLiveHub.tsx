"use client";
import Image from 'next/image';

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured, type FeedPostDB } from "@/lib/supabase-client";

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
    created_at: "2026-08-06T16:47:00.000Z",
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
    created_at: "2026-08-06T16:42:00.000Z",
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
  const viewerCountRef = useRef(0);
  const [activeLiveRooms, setActiveLiveRooms] = useState<any[]>([]);

  // Notification form state
  const emailRef = useRef("");
  const zipRef = useRef("");
  const [radius, setRadius] = useState("50");
  const notifyStatusRef = useRef<"idle" | "loading" | "success" | "error">("idle");

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRef.current || !zipRef.current) return;
    notifyStatusRef.current = "loading";
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRef.current, zip: zipRef.current, radius }),
      });
      if (res.ok) {
        notifyStatusRef.current = "success";
        emailRef.current = "";
        zipRef.current = "";
      } else notifyStatusRef.current = "error";
    } catch {
      notifyStatusRef.current = "error";
    }
  };

  const checkLiveStreams = useCallback(async () => {
    try {
      const res = await fetch("/api/live-rooms");
      if (res.ok) {
        const data = await res.json();
        const allRooms = data.rooms || [];
        const rooms = allRooms.filter((r: any) => r.showOnHomepage);
        setActiveLiveRooms(rooms);

        // Calculate total viewers across visible rooms
        const total = rooms.reduce((acc: number, r: any) => acc + (r.numParticipants || 0), 0);
        // If real viewers is 0 but rooms exist, show a small random number for "hype"
        viewerCountRef.current = total || (rooms.length > 0 ? Math.floor(Math.random() * 20) + 5 : 0);
      }
    } catch (err) {
      console.error("Live rooms check failed", err);
    }
  }, []);

  useEffect(() => {
    checkLiveStreams();
    const interval = setInterval(checkLiveStreams, 20000);
    return () => clearInterval(interval);
  }, [checkLiveStreams]);

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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, (payload: any) => {
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
              <span className="font-bold text-white/30 uppercase    self-center mr-2">Alternative Feeds:</span>
              {activeLiveRooms.slice(1).map((room, idx) => (
                <Link
                  key={room.name}
                  href={`/live/${room.name}`}
                  className="bg-[#00000029] hover:bg-white/15 border border-white/10 hover:border-[var(--color-accent)]/50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-lg animate-pulse" />
                  <span className="font-bold text-white/70 group-hover:text-white uppercase  truncate max-w-[120px]">
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
              <div className="relative aspect-video border border-white/10 overflow-hidden">
                <iframe
                  title="7th Heaven Live Stream Video"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-presentation allow-popups allow-forms"
                  allowFullScreen
                />
              </div>
            ) : selectedMedia?.image_url ? (
              <div className="relative aspect-video border border-white/10 overflow-hidden">
                <Image width={200} height={200} unoptimized src={selectedMedia.image_url} alt={selectedMedia.content} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--font-size-2xs)] font-bold border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/15">
                      {selectedMedia.member_avatar}
                    </div>
                    <span className="font-semibold text-white/80">{selectedMedia.member_name}</span>
                    <span className="text-white/30">{timeAgo(selectedMedia.created_at)}</span>
                  </div>
                  <p className="leading-relaxed">{selectedMedia.content}</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <p className="">No live media yet</p>
              </div>
            )}

            {/* Real-time Live Overlay */}
            {activeLiveRooms.length > 0 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="text-center p-8 scale-90 group-hover:scale-100 transition-transform duration-500">
                  <div className="mb-4 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-lg font-bold uppercase    shadow-red-600/20">
                    <span className="w-2 h-2 bg-white rounded-lg animate-pulse" />
                    Live Now
                  </div>
                  <h4 className="font-bold text-white uppercase tracking-tighter mb-6">Join the Crew Live</h4>
                  <Link href="/live" className="btn-primary flex items-center justify-center gap-3 px-8 py-4 shadow-[0_0_30px_rgba(255,10,61,0.3)]">
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
                  <button aria-label="Action button"
                    key={post.id}
                    onClick={() => setSelectedMedia(post)}
                    className={`relative aspect-square overflow-hidden border transition-colors duration-300 cursor-pointer group ${isActive ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/50" : "border-white/[0.06] hover: border-white/10 "
                      }`}
                  >
                    {thumbSrc && <Image width={200} height={200} unoptimized src={thumbSrc} alt="7th Heaven Media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="opacity-80"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    )}
                    <div className="absolute top-1 left-1">
                      <span className="text-[var(--font-size-2xs)] font-bold uppercase  bg-black/60 text-white/70 px-1 py-0.5">
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






          {/* Listen / Buy Links */}
          <div className="flex gap-2 mt-2">
            <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CP5NWKWMEQMMJ" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-center uppercase  py-2.5 transition-colors">
              Buy CD
            </a>
            <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-center uppercase  py-2.5 transition-colors">
              Spotify
            </a>
            <a href="https://music.apple.com" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-center uppercase  py-2.5 transition-colors">
              Apple Music
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
