"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import CosmicRadialButton from "./CosmicRadialButton";
import { loadYouTubeAPI } from "@/lib/youtube-api";

interface InlineYTPlayerProps {
  videoId: string;
  title: string;
  onClose?: () => void;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function InlineYTPlayer({ videoId, title, onClose }: InlineYTPlayerProps) {
  const reactId = useId();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const playerDivId = useRef(`yt-inline-${videoId}-${reactId.replace(/:/g, "")}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const [useFallbackIframe, setUseFallbackIframe] = useState(false);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (useFallbackIframe) return;

    const initPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { }
      }
      try {
        playerRef.current = new window.YT.Player(playerDivId.current, {
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
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (e: any) => {
              setIsReady(true);
              setDuration(e.target.getDuration());
              e.target.setVolume(volume);
              e.target.playVideo();
            },
            onStateChange: (e: any) => {
              setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
            },
            onError: () => {
              setUseFallbackIframe(true);
            },
          },
        });
      } catch {
        setUseFallbackIframe(true);
      }
    };

    loadYouTubeAPI(initPlayer);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch { }
        playerRef.current = null;
      }
    };
  }, [videoId, volume, useFallbackIframe]);

  // Time update loop
  useEffect(() => {
    const update = () => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        const dur = playerRef.current.getDuration();
        if (dur) setDuration(dur);
        const loaded = playerRef.current.getVideoLoadedFraction?.() || 0;
        setBuffered(loaded * 100);
      }
      animRef.current = requestAnimationFrame(update);
    };
    if (isReady) update();
    return () => cancelAnimationFrame(animRef.current);
  }, [isReady]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying, resetHideTimer]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (state === window.YT?.PlayerState?.PLAYING || isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch {
      if (isPlaying) {
        playerRef.current.pauseVideo?.();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo?.();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  const handleClose = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      playerRef.current?.pauseVideo?.();
      playerRef.current?.stopVideo?.();
    } catch { }
    onClose?.();
  }, [onClose]);

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
    else { playerRef.current.mute(); setIsMuted(true); }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(pct * duration, true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (useFallbackIframe) {
    return (
      <div className="relative w-full h-full bg-black">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 w-8 h-8  rounded-lg  bg-black/70 hover: text-white flex items-center justify-center transition-colors cursor-pointer border  border-white/10 "
            aria-label="Close video"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&controls=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full outline-none bg-black"
      onMouseMove={resetHideTimer}
    >
      {/* YouTube Player */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div id={playerDivId.current} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-0 left-0 w-40 h-14 z-10" />
      </div>

      {/* Video playback toggle button */}
      <button
        type="button"
        aria-label="Toggle video playback"
        onClick={togglePlay}
        className="absolute inset-0 w-full h-full z-0 border-0 bg-transparent cursor-pointer"
      />

      {/* Close button */}
      {onClose && (
        <button onClick={handleClose}
          className={`absolute top-3 right-3 z-30 w-8 h-8  rounded-lg  bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors duration-300 cursor-pointer ${showControls ? "opacity-100" : "opacity-0"
            }`}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 px-4 pb-3 pt-8 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
          }`}
        aria-label="Player controls container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <button
          type="button"
          ref={progressRef as any}
          className="group/progress w-full h-1 bg-white/10 cursor-pointer mb-3 relative hover:h-1.5 transition-colors  rounded-lg  outline-none border-0 p-0 text-left"
          aria-label="Seek progress bar"
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-white/15  rounded-lg "
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full bg-[var(--color-accent)]  rounded-lg "
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)]  rounded-lg  opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-[var(--color-accent)]/30"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </button>

        {/* Control Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Play/Pause */}
            <CosmicRadialButton
              onClick={togglePlay}
              icon={false}
              className="w-8 h-8 ! rounded-lg  !p-0 flex items-center justify-center transition-all cursor-pointer border border-purple-300/40"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </CosmicRadialButton>

            {/* Volume */}
            <div
              className="relative flex items-[#center] gap-1.5"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button onClick={toggleMute}
                className=" text-white  hover:text-white transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
              <div className={`flex items-center transition-colors duration-200 overflow-hidden ${showVolume ? 'w-16 opacity-100' : 'w-0 opacity-0'}`}>
                <input aria-label="Input field"
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setVolume(v);
                    setIsMuted(v === 0);
                    playerRef.current?.setVolume(v);
                    if (v > 0) playerRef.current?.unMute();
                  }}
                  className="w-full h-1 appearance-none bg-white/20  rounded-lg  cursor-pointer accent-[var(--color-accent)]"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-xs text-white/40 font-mono tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen}
            className=" text-white  hover:text-white transition-colors cursor-pointer"
            aria-label="Fullscreen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
