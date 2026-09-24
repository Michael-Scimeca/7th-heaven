"use client";

import { useEffect, useRef } from "react";
import { loadYouTubeAPI } from "@/lib/youtube-api";

interface HeroYTBackgroundProps {
  videoId?: string;
  start?: number;
  end?: number;
}

export default function HeroYTBackground({
  videoId = "UQBvl_wZ0ak",
  start = 20,
  end = 29,
}: HeroYTBackgroundProps) {
  const playerRef = useRef<any>(null);
  const playerDivId = useRef(
    `hero-yt-bg-${Math.random().toString(36).substring(2, 9)}`,
  );

  useEffect(() => {
    let loopInterval: ReturnType<typeof setInterval> | null = null;

    loadYouTubeAPI(() => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }

      const player = new window.YT.Player(playerDivId.current, {
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
          mute: 1,
          start,
          end,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.mute();
              e.target.seekTo(start, true);
              e.target.playVideo();
            } catch {}
          },
          onStateChange: (e: any) => {
            if (
              e.data === window.YT.PlayerState.ENDED ||
              e.data === window.YT.PlayerState.PAUSED
            ) {
              try {
                e.target.seekTo(start, true);
                e.target.playVideo();
              } catch {}
            }
          },
        },
      });
      playerRef.current = player;

      // Continuously monitor and replay the 8-second clip (from 28s to 36s)
      loopInterval = setInterval(() => {
        if (
          playerRef.current &&
          typeof playerRef.current.getCurrentTime === "function"
        ) {
          try {
            const curr = playerRef.current.getCurrentTime();
            if (curr >= end || curr < start) {
              playerRef.current.seekTo(start, true);
            }
          } catch {}
        }
      }, 250);
    });

    return () => {
      if (loopInterval) clearInterval(loopInterval);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, start, end]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black select-none">
      <div
        id={playerDivId.current}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[100vh] min-h-[56.25vw] w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-105"
      />
    </div>
  );
}
