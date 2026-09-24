/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import SeventhButton from "./SeventhButton";
import GlassPlayButton from "./GlassPlayButton";
import { loadYouTubeAPI } from "@/lib/youtube-api";

interface CustomVideoPlayerProps {
  videoId: string;
  title: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

const formatTime = (s: number) => {
  if (isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function CustomVideoPlayer({
  videoId,
  title,
  onClose,
  autoPlay = true,
}: CustomVideoPlayerProps) {
  const reactId = useId();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const playerDivId = useRef(
    `yt-custom-${videoId}-${reactId.replace(/:/g, "")}`,
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [centerAnim, setCenterAnim] = useState<"play" | "pause" | null>(null);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  const triggerCenterAnim = (type: "play" | "pause") => {
    setCenterAnim(type);
    setTimeout(() => setCenterAnim(null), 700);
  };

  useEffect(() => {
    const initPlayer = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
      try {
        playerRef.current = new window.YT.Player(playerDivId.current, {
          videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            playsinline: 1,
            origin:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
          },
          events: {
            onReady: (e: any) => {
              setIsReady(true);
              const dur = e.target.getDuration();
              if (dur) setDuration(dur);
              e.target.setVolume(volume);
              if (autoPlay) {
                e.target.playVideo();
                setIsPlaying(true);
              }
            },
            onStateChange: (e: any) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (
                e.data === window.YT.PlayerState.PAUSED ||
                e.data === window.YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
                setShowControls(true);
              }
            },
          },
        });
      } catch {}
    };

    loadYouTubeAPI(initPlayer);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, autoPlay, volume]);

  // Sync state loop
  useEffect(() => {
    const update = () => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          const buf = playerRef.current.getVideoLoadedFraction();
          if (typeof cur === "number") setCurrentTime(cur);
          if (typeof dur === "number" && dur > 0) setDuration(dur);
          if (typeof buf === "number") setBuffered(buf * 100);
        } catch {}
      }
      animRef.current = requestAnimationFrame(update);
    };
    animRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      triggerCenterAnim("pause");
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      triggerCenterAnim("play");
    }
    resetHideTimer();
  };

  const seekRelative = (sec: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + sec));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    resetHideTimer();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    resetHideTimer();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
    resetHideTimer();
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
    resetHideTimer();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group/player relative h-full w-full cursor-pointer overflow-hidden bg-black select-none"
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
    >
      {/* Embedded Video Player Container (Full-bleed Cover Sizing) */}
      <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden">
        <div
          id={playerDivId.current}
          className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.13]"
        />
      </div>

      {/* Fallback Image Poster before API is ready */}
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
          <Image
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            sizes="100vw"
            priority
            className="object-cover brightness-75"
          />
        </div>
      )}

      {/* Animated Center Play Indicator Ring (Pause button hidden) */}
      {centerAnim && centerAnim !== "pause" && (
        <div className="pointer-events-none absolute inset-0 z-30 flex animate-ping items-center justify-center">
          <GlassPlayButton size="xl" isPlaying={false} glow />
        </div>
      )}

      {/* Top Header Overlay with Title & Close Button */}
      <div
        className={`absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 ${showControls ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex max-w-[80%] items-center gap-2">
          <span className="rounded border border-white/10 bg-black/60 px-2 py-0.5">
            Now Playing
          </span>
          <h4 className="drop-shadow">{title}</h4>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="!rounded-full border border-white/10 bg-black/60 p-2 hover:bg-white/20 hover:text-white"
            aria-label="Close Player"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom Custom Control Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-10 pb-4 ${showControls ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Custom Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="group/timeline relative mb-3 h-1.5 w-full cursor-pointer rounded-lg bg-white/20 transition-[height] hover:h-2.5"
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-lg bg-white/30"
            style={{ width: `${buffered}%` }}
          />
          {/* Played Progress */}
          <div
            className="absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-purple-500 via-[var(--color-accent)] to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber Handle */}
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 scale-50 rounded-lg bg-white opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-[opacity,transform] group-hover/timeline:scale-100 group-hover/timeline:opacity-100"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>

        {/* Controls Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls: Play, Rewind, Fast Forward, Time */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <SeventhButton
              onClick={togglePlay}
              icon={false}
              className="flex h-11 w-11 cursor-pointer items-center justify-center !rounded-full border border-purple-300/40 !p-0 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-white" />
              )}
            </SeventhButton>

            {/* Skip -10s */}
            <button
              onClick={() => seekRelative(-10)}
              className="cursor-pointer rounded-lg p-2 hover:bg-white/10 hover:text-white"
              title="Rewind 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => seekRelative(10)}
              className="cursor-pointer rounded-lg p-2 hover:bg-white/10 hover:text-white"
              title="Forward 10s"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Time Counter */}
            <span className="ml-1 tabular-nums">
              {formatTime(currentTime)} <span className="text-white/40">/</span>{" "}
              {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Volume, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="group relative flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="cursor-pointer rounded-lg p-2 hover:bg-white/10 hover:text-white"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-purple-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center overflow-hidden transition-[width,opacity] w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 group-focus-within:w-20 group-focus-within:opacity-100">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setVolume(v);
                    setIsMuted(v === 0);
                    if (playerRef.current) {
                      playerRef.current.setVolume(v);
                      if (v > 0) playerRef.current.unMute();
                    }
                  }}
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[var(--color-accent)]"
                />
              </div>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="cursor-pointer rounded-lg p-2 hover:bg-white/10 hover:text-white"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
