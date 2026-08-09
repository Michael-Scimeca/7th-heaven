"use client";

import { useEffect, useRef, useState } from "react";
import { loadYouTubeAPI } from "@/lib/youtube-api";

interface HeroYTBackgroundProps {
  videoId: string;
}

export default function HeroYTBackground({ videoId }: HeroYTBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const playerDivId = useRef(`hero-yt-bg-${Math.random().toString(36).substring(2, 9)}`);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    let player: any = null;

    const initPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
      }

      player = new window.YT.Player(playerDivId.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
          mute: 1,
          start: 10,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.mute();
              e.target.seekTo(10, true);
              e.target.playVideo();
            } catch {}
          },
          onStateChange: (e: any) => {
            // Re-trigger play if paused or ended
            if (e.data === window.YT.PlayerState.ENDED || e.data === window.YT.PlayerState.PAUSED) {
              try { e.target.playVideo(); } catch {}
            }
          },
        },
      });
      playerRef.current = player;
    };

    loadYouTubeAPI(initPlayer);

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black">
      <div
        id={playerDivId.current}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] min-w-full h-[100vh] min-h-[56.25vw] pointer-events-none scale-105"
      />
      {/* Fallback iframe in case API script load is delayed */}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&muted=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] min-w-full h-[100vh] min-h-[56.25vw] border-0 pointer-events-none scale-105"
        allow="autoplay; encrypted-media; picture-in-picture"
        sandbox="allow-scripts allow-presentation"
        title="7th Heaven Background Video"
      />
    </div>
  );
}
