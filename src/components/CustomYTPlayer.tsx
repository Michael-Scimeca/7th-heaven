"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
  }, [videoId]);

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

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      if (e.key === "ArrowLeft") { seekRelative(-10); }
      if (e.key === "ArrowRight") { seekRelative(10); }
      if (e.key === "ArrowUp") { e.preventDefault(); changeVolume(10); }
      if (e.key === "ArrowDown") { e.preventDefault(); changeVolume(-10); }
      if (e.key === "m") { toggleMute(); }
      if (e.key === "f") { toggleFullscreen(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, volume, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seekTo = (pct: number) => {
    if (!playerRef.current || !duration) return;
    playerRef.current.seekTo(pct * duration, true);
  };

  const seekRelative = (seconds: number) => {
    if (!playerRef.current) return;
    const t = playerRef.current.getCurrentTime() + seconds;
    playerRef.current.seekTo(Math.max(0, Math.min(t, duration)), true);
  };

  const changeVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVol);
    setIsMuted(newVol === 0);
    playerRef.current?.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(volume || 80);
      setIsMuted(false);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, pct)));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[1100px] mx-4 sm:mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Player Container */}
        <div
          className="relative aspect-video bg-black border border-white/10 overflow-hidden group/player cursor-pointer"
          onMouseMove={resetHideTimer}
          onClick={togglePlay}
        >
          {/* YouTube Player (hidden controls) */}
          <div id="yt-player-frame" className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Loading State */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
              <div className="w-12 h-12 border-2 border-white/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
          )}

          {/* Center Play/Pause Indicator */}
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 pointer-events-none ${
              showControls && !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>

          {/* Top Gradient */}
          <div
            className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/70 to-transparent z-10 transition-opacity duration-300 pointer-events-none ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Top Bar — Title & Close */}
          <div
            className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-6 bg-[var(--color-accent)] rounded-full shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{title}</h3>
                <p className="text-[0.65rem] text-white/40">7th Heaven • {year}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 ml-4"
            >
              <span className="text-[0.6rem] font-bold tracking-widest uppercase hidden sm:inline">ESC</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Bottom Gradient */}
          <div
            className={`absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10 transition-opacity duration-300 pointer-events-none ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Bottom Controls */}
          <div
            className={`absolute bottom-0 inset-x-0 z-20 px-5 pb-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="group/progress w-full h-1 bg-white/10 cursor-pointer mb-4 relative hover:h-1.5 transition-all"
              onClick={handleProgressClick}
            >
              {/* Buffered */}
              <div
                className="absolute top-0 left-0 h-full bg-white/15 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-[var(--color-accent)] rounded-full transition-none"
                style={{ width: `${progress}%` }}
              />
              {/* Scrubber */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg shadow-[var(--color-accent)]/30"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            {/* Control Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Prev */}
                {hasPrev && (
                  <button
                    onClick={() => onPrev?.()}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    aria-label="Previous"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                )}

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
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
                </button>

                {/* Next */}
                {hasNext && (
                  <button
                    onClick={() => onNext?.()}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
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
                  <button
                    onClick={toggleMute}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
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
                  <div className={`flex items-center transition-all duration-200 overflow-hidden ${showVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                    <input
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
                      className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-[var(--color-accent)]"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-[0.7rem] text-white/40 font-mono tabular-nums hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* YouTube link */}
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                    <polygon points="9.545 15.568 15.818 12 9.545 8.432" fill="white" />
                  </svg>
                </a>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer"
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
