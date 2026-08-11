"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, X } from "lucide-react";
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
  const playerDivId = useRef(`yt-custom-${videoId}-${reactId.replace(/:/g, "")}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
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
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
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
              } else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) {
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
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
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
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
    resetHideTimer();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden select-none group/player cursor-pointer"
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
    >
      {/* Embedded Video Player Container (Full-bleed Cover Sizing) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
        <div
          id={playerDivId.current}
          className="w-[177.78vh] min-w-full h-[56.25vw] min-h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.03]"
        />
      </div>

      {/* Fallback Direct iFrame if API isn't initialized yet */}
      {!isReady && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&playsinline=1`}
            title={title}
            className="w-[177.78vh] min-w-full h-[56.25vw] min-h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.03] border-0 pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Animated Center Play/Pause Indicator Ring */}
      {centerAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping duration-500">
          <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/80 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_40px_rgba(147,51,234,0.8)]">
            {centerAnim === "play" ? (
              <Play className="w-10 h-10 fill-white ml-1" />
            ) : (
              <Pause className="w-10 h-10 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Top Header Overlay with Title & Close Button */}
      <div
        className={`absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 max-w-[80%]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] bg-black/60 px-2 py-0.5 rounded border border-white/10">
            Now Playing
          </span>
          <h4 className="text-sm md:text-base font-bold text-white tracking-wide truncate drop-shadow">
            {title}
          </h4>
        </div>

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--color-accent)] text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            aria-label="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom Custom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 px-4 pb-4 pt-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Custom Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative w-full h-1.5 bg-white/20 hover:h-2.5 transition-all duration-200 cursor-pointer rounded-full mb-3 group/timeline"
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          {/* Played Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-[var(--color-accent)] to-pink-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 scale-50 group-hover/timeline:opacity-100 group-hover/timeline:scale-100 transition-all duration-200 shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>

        {/* Controls Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls: Play, Rewind, Fast Forward, Time */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.5)]"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => seekRelative(-10)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => seekRelative(10)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Time Counter */}
            <span className="text-xs font-mono font-bold text-white/80 tabular-nums ml-1">
              {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Volume, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div
              className="relative flex items-center gap-2"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={toggleMute}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-purple-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <div
                className={`flex items-center transition-all duration-300 overflow-hidden ${
                  showVolume ? "w-20 opacity-100" : "w-0 opacity-0"
                }`}
              >
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
                  className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-[var(--color-accent)]"
                />
              </div>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
