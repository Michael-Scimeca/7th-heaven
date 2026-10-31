/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  RotateCw,
  Camera,
} from "lucide-react";
import { MediaVaultItem } from "./MediaWeGoAgainClient";

export interface MediaCinemaPlayerProps {
  item: MediaVaultItem;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSkip: (seconds: number) => void;
  toggleFullscreen: () => void;
  thumbFor: (item: MediaVaultItem) => string;
  formatSeconds: (sec: number) => string;
  aspectClass?: string;
  className?: string;
  showOverlayBadges?: boolean;
  controlsVariant?: "full" | "compact" | "minimal" | "dock";
  onOpenLightbox?: (item: MediaVaultItem) => void;
}

export default function MediaCinemaPlayer({
  item,
  videoRef,
  isPlaying,
  togglePlay,
  isMuted,
  toggleMute,
  currentTime,
  duration,
  handleSeek,
  handleSkip,
  toggleFullscreen,
  thumbFor,
  formatSeconds,
  aspectClass = "aspect-video",
  className = "",
  showOverlayBadges = true,
  controlsVariant = "full",
  onOpenLightbox,
}: MediaCinemaPlayerProps) {
  const [isSeeking, setIsSeeking] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/20 group select-none ${aspectClass} ${className}`}
    >
      {item.mediaFormat === "photo" ? (
        <div
          onClick={() => onOpenLightbox && onOpenLightbox(item)}
          className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden group ${onOpenLightbox ? "cursor-zoom-in" : ""}`}
        >
          <img
            src={thumbFor(item)}
            alt={item.title}
            className="w-full h-full object-contain sm:object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
            <span className="px-4 py-2 rounded-full bg-white/20 border border-white/40 text-white font-mono text-xs font-bold flex items-center gap-2 backdrop-blur-md">
              <Maximize2 className="w-4 h-4 text-emerald-400" /> View Fullscreen Photo
            </span>
          </div>
        </div>
      ) : item.videoSrc ? (
        <video
          key={item.id}
          ref={videoRef}
          src={item.videoSrc}
          poster={thumbFor(item)}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      )}

      {/* Top Overlay Badges */}
      {showOverlayBadges && (
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-20 pointer-events-none">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md border shadow flex items-center gap-1.5 ${
            item.mediaFormat === "photo"
              ? "border-emerald-400/50 text-emerald-300"
              : "border-purple-400/50 text-purple-300"
          }`}>
            {item.mediaFormat === "photo" && <Camera className="w-3 h-3 text-emerald-400" />}
            {item.badge}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/15 text-white/90">
            {item.duration || "PHOTO"}
          </span>
        </div>
      )}

      {/* Interactive Photo Info Bar */}
      {item.mediaFormat === "photo" && (
        <div className="absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-white/90 font-mono font-semibold truncate">
              {item.credits.fanName ? `Captured by ${item.credits.fanName}` : "Concert Photography"} • {item.credits.venue || "Live Show"}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      )}

      {/* Interactive Controls Overlay */}
      {item.videoSrc && controlsVariant !== "minimal" && (
        <div className="absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 transition-all">
          {/* Timeline Seek Scrubber */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                step="0.1"
                value={currentTime}
                onMouseDown={() => setIsSeeking(true)}
                onMouseUp={() => setIsSeeking(false)}
                onTouchStart={() => setIsSeeking(true)}
                onTouchEnd={() => setIsSeeking(false)}
                onChange={handleSeek}
                className="w-full slider-elva accent-purple-500 cursor-pointer h-1.5 bg-white/20 rounded-full"
                aria-label="Seek video playback time"
              />
            </div>
            <div className="font-mono text-[11px] font-bold text-white/90 shrink-0">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </div>
          </div>

          {/* Bottom Buttons Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 sm:p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              {controlsVariant === "full" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSkip(-10)}
                    className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition-all text-xs flex items-center gap-1 font-mono cursor-pointer"
                    title="Rewind 10 seconds"
                    aria-label="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">-10s</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSkip(10)}
                    className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition-all text-xs flex items-center gap-1 font-mono cursor-pointer"
                    title="Forward 10 seconds"
                    aria-label="Forward 10 seconds"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">+10s</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/20 transition-all shadow active:scale-95 cursor-pointer"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-purple-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/20 transition-all shadow active:scale-95 cursor-pointer"
                aria-label="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
