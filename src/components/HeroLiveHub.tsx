"use client";
import Image from "next/image";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  supabase,
  isSupabaseConfigured,
  type FeedPostDB,
} from "@/lib/supabase-client";

// ─── Mock live show media (Fallback only) ───
const mockLiveMedia: FeedPostDB[] = [
  {
    id: "live-1",
    member_name: "Michael Scimeca",
    member_role: "Photo/Video Crew",
    member_avatar: "MS",
    content:
      "🔴 LIVE from the stage — the guys are absolutely crushing it tonight!",
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
    image_url: "/images/hero/band-performance.png",
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
  const notifyStatusRef = useRef<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRef.current || !zipRef.current) return;
    notifyStatusRef.current = "loading";
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailRef.current,
          zip: zipRef.current,
          radius,
        }),
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
        const total = rooms.reduce(
          (acc: number, r: any) => acc + (r.numParticipants || 0),
          0,
        );
        // If real viewers is 0 but rooms exist, show a small random number for "hype"
        viewerCountRef.current =
          total || (rooms.length > 0 ? Math.floor(Math.random() * 20) + 5 : 0);
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
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_posts" },
        (payload: any) => {
          const newPost = payload.new as FeedPostDB;
          if (["photo", "video", "crowd"].includes(newPost.post_type)) {
            setPosts((prev) => [newPost, ...prev]);
            if (newPost.video_url || newPost.image_url)
              setSelectedMedia(newPost);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const mediaPosts = posts.filter((p) => p.image_url || p.video_url);
  const videoId = selectedMedia?.video_url
    ? extractYouTubeId(selectedMedia.video_url)
    : null;

  return (
    <div className="w-full text-left">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* ═══ LEFT: Live Feed ═══ */}
        <div>
          {/* Multi-Stream Links (If 2+ streams) */}
          {activeLiveRooms.length > 1 && (
            <div className="mb-6 flex animate-[fade-in_0.5s_ease-out] flex-wrap gap-2">
              <span className="mr-2 self-center text-white/30">
                Alternative Feeds:
              </span>
              {activeLiveRooms.slice(1).map((room, idx) => (
                <Link
                  key={room.name}
                  href={`/live/${room.name}`}
                  className="group flex items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-3 py-1.5 hover:border-[var(--color-accent)]/50 hover:bg-white/15"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-lg bg-red-500" />
                  <span className="max-w-[120px] group-hover:text-white">
                    {room.title?.split(" — ")[0] || room.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Main Player */}
          <div className="group relative">
            {isLoading ? (
              <div className="aspect-video animate-pulse border border-white/[0.06] bg-white/[0.03]" />
            ) : videoId ? (
              <div className="relative aspect-video overflow-hidden border border-white/10">
                <iframe
                  title="7th Heaven Live Stream Video"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-presentation allow-popups allow-forms"
                  allowFullScreen
                />
              </div>
            ) : selectedMedia?.image_url ? (
              <div className="relative aspect-video overflow-hidden border border-white/10">
                <Image
                  width={200}
                  height={200}
                  unoptimized
                  src={selectedMedia.image_url}
                  alt={selectedMedia.content}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--font-size-2xs)]">
                      {selectedMedia.member_avatar}
                    </div>
                    <span>{selectedMedia.member_name}</span>
                    <span className="text-white/30">
                      {timeAgo(selectedMedia.created_at)}
                    </span>
                  </div>
                  <p>{selectedMedia.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center border border-white/10 bg-white/[0.03]">
                <p>No live media yet</p>
              </div>
            )}

            {/* Real-time Live Overlay */}
            {activeLiveRooms.length > 0 && (
              <div className="overlay-center-hover z-20 bg-black/60 backdrop-blur">
                <div className="p-8 text-center">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-1 shadow-red-600/20">
                    <span className="h-2 w-2 animate-pulse rounded-lg bg-white" />
                    Live Now
                  </div>
                  <h4 className="er mb-6">Join the Crew Live</h4>
                  <Link
                    href="/live"
                    className="btn-primary flex items-center justify-center gap-3 px-8 py-4 shadow-[0_0_30px_rgba(255,10,61,0.3)]"
                  >
                    Enter Live Stream ⚡
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {mediaPosts.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-5">
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
                    className={`group relative aspect-square cursor-pointer overflow-hidden border ${isActive ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/50" : "border-white/10 border-white/[0.06]"}`}
                  >
                    {thumbSrc && (
                      <Image
                        width={200}
                        height={200}
                        unoptimized
                        src={thumbSrc}
                        alt="7th Heaven Media"
                        className="h-full w-full object-cover"
                      />
                    )}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="opacity-80"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-1 left-1">
                      <span className="bg-black/60 px-1 py-0.5 text-[var(--font-size-2xs)]">
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
          <div className="mt-2 flex gap-2">
            <a
              href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CP5NWKWMEQMMJ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[var(--color-accent)] py-2.5 text-center hover:bg-[var(--color-accent)]/80"
            >
              Buy CD
            </a>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[var(--color-accent)] py-2.5 text-center hover:bg-[var(--color-accent)]/80"
            >
              Spotify
            </a>
            <a
              href="https://music.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[var(--color-accent)] py-2.5 text-center hover:bg-[var(--color-accent)]/80"
            >
              Apple Music
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
