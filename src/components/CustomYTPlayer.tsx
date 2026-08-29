/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import CosmicRadialButton from "./CosmicRadialButton";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface CustomYTPlayerProps {
  videoId: string;
  title: string;
  year: number;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function CustomYTPlayer({
  videoId,
  title,
  year,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: CustomYTPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showVolume, setShowVolume] = useState(false);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player("yt-player-frame", {
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
            if (e.data === window.YT.PlayerState.ENDED && onNext && hasNext) {
              onNext();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, hasNext, onNext, volume]);

  // Update time loop
  useEffect(() => {
    const update = () => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        const dur = playerRef.current.getDuration();
        if (dur) setDuration(dur);
        // Buffer
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

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seekTo = (pct: number) => {
    if (!playerRef.current || !duration) return;
    playerRef.current.seekTo(pct * duration, true);
  };

  const seekRelative = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    const t = playerRef.current.getCurrentTime() + seconds;
    playerRef.current.seekTo(Math.max(0, Math.min(t, duration)), true);
  }, [duration]);

  const changeVolume = useCallback((delta: number) => {
    const newVol = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVol);
    setIsMuted(newVol === 0);
    playerRef.current?.setVolume(newVol);
  }, [volume]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(volume || 80);
      setIsMuted(false);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  // Global Keyboard Controls
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => { });
  useLayoutEffect(() => {
    keyHandlerRef.current = (e: KeyboardEvent) => {
      // Don't intercept keypresses when typing in inputs/textareas
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      if (e.key === "ArrowLeft") { seekRelative(-5); }
      if (e.key === "ArrowRight") { seekRelative(10); }
      if (e.key === "ArrowUp") { e.preventDefault(); changeVolume(10); }
      if (e.key === "ArrowDown") { e.preventDefault(); changeVolume(-10); }
      if (e.key === "m") { toggleMute(); }
      if (e.key === "f") { toggleFullscreen(); }
    };
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);



  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, pct)));
  };



  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      style={{ backdropFilter: "blur(45px)", WebkitBackdropFilter: "blur(45px)" }}
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-[45px] flex items-center justify-center m-0 p-0 border-none max-w-none w-full h-full text-inherit"
    >
      <button
        type="button"
        aria-label="Close video player"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        className="absolute inset-0 cursor-pointer border-none bg-transparent"
      />
      <div
        ref={containerRef}
        className="w-full max-w-[1100px] mx-4 sm:mx-8 relative z-10"
      >
        {/* Player Container */}
        <div
          className="relative aspect-video border border-white/10 overflow-hidden group/player"
          onMouseMove={resetHideTimer}
        >
          {/* YouTube Player (hidden controls) */}
          <div id="yt-player-frame" className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Click overlay to toggle play */}
          <button type="button"
            aria-label="Toggle video playback"
            className="absolute inset-0 z-0 cursor-pointer border-0 bg-transparent"
            onClick={togglePlay}
          />

          {/* Loading State */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-12 h-12 border-2 border-white/10 border-t-[var(--color-accent)] rounded-lg animate-spin" />
            </div>
          )}

          {/* Center Play/Pause Indicator */}
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 pointer-events-none ${showControls && !isPlaying ? "opacity-100" : "opacity-0"
              }`}
          >
            <CosmicRadialButton
              icon={false}
              className="w-20 h-20 ! rounded-lg !p-0 flex items-center justify-center border border-purple-300/40 shadow-2xl"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </CosmicRadialButton>
          </div>

          {/* Top Gradient */}
          <div
            className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/70 to-transparent z-10 transition-opacity duration-300 pointer-events-none ${showControls ? "opacity-100" : "opacity-0"
              }`}
          />

          {/* Top Bar — Title & Close */}
          <div
            className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-6 bg-[var(--color-accent)] rounded-lg shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold text-white truncate">{title}</h3>
                <p className="">7th Heaven • {year}</p>
              </div>
            </div>
            <button aria-label="Close"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 ml-4"
            >
              <span className="font-bold    uppercase hidden sm:inline">ESC</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Bottom Gradient */}
          <div
            className={`absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10 transition-opacity duration-300 pointer-events-none ${showControls ? "opacity-100" : "opacity-0"
              }`}
          />

          {/* Bottom Controls */}
          <div
            className={`absolute bottom-0 inset-x-0 z-20 px-5 pb-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              role="slider"
              aria-label="Seek track position"
              aria-valuenow={Math.round(currentTime)}
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              tabIndex={0}
              className="group/progress w-full h-1 bg-white/10 cursor-pointer mb-4 relative hover:h-1.5 transition-colors"
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  if (playerRef.current?.seekTo) playerRef.current.seekTo(Math.min(duration, currentTime + 5), true);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  if (playerRef.current?.seekTo) playerRef.current.seekTo(Math.max(0, currentTime - 5), true);
                }
              }}
            >
              {/* Buffered */}
              <div
                className="absolute top-0 left-0 h-full bg-white/15 rounded-lg"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-[var(--color-accent)] rounded-lg transition-none"
                style={{ width: `${progress}%` }}
              />
              {/* Scrubber */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] rounded-lg opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-[var(--color-accent)]/30"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            {/* Control Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Prev */}
                {hasPrev && (
                  <button onClick={() => onPrev?.()}
                    className="text-white hover:text-white transition-colors cursor-pointer"
                    aria-label="Previous"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                )}

                {/* Play/Pause */}
                <CosmicRadialButton onClick={togglePlay}
                  icon={false}
                  className="w-10 h-10 ! rounded-lg !p-0 flex items-center justify-center transition-all cursor-pointer border border-purple-300/40"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </CosmicRadialButton>

                {/* Next */}
                {hasNext && (
                  <button onClick={() => onNext?.()}
                    className="text-white hover:text-white transition-colors cursor-pointer"
                    aria-label="Next"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                )}

                {/* Volume */}
                <div
                  className="relative flex items-center gap-2"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                >
                  <button onClick={toggleMute}
                    className="text-white hover:text-white transition-colors cursor-pointer"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : volume < 50 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    )}
                  </button>
                  <div className={`flex items-center transition-colors duration-200 overflow-hidden ${showVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
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
                      className="w-full h-1 appearance-none bg-white/20 rounded-lg cursor-pointer accent-[var(--color-accent)]"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-white/40 font-mono tabular-nums hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* YouTube link */}
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch on YouTube"
                  className="text-white/40 hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                    <polygon points="9.545 15.568 15.818 12 9.545 8.432" fill="white" />
                  </svg>
                  <span className="sr-only">Watch on YouTube</span>
                </a>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen}
                  className="text-white hover:text-white transition-colors cursor-pointer"
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
