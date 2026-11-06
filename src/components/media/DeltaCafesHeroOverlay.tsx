/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import { ArrowRight, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import DeltaSoundWaveButton from "./DeltaSoundWaveButton";
import {
  GooeyPagination,
  type GooeyPaginationSlideMeta,
} from "./GooeyPagination";
import { HERO_ALBUM_PAGINATION_SLIDES } from "./deltaSmooothySlides";
import type { VideoTrack } from "./TbwaPillHero";

export interface DeltaCafesHeroOverlayProps {
  activeTrack: VideoTrack;
  tracks: readonly VideoTrack[];
  paginationSlides?: readonly GooeyPaginationSlideMeta[];
  onTrackChange?: (track: VideoTrack) => void;
  onPreviewTrack?: (track: VideoTrack) => void;
  onStopTrack?: () => void;
  onOpenCinema?: () => void;
  onScrollToVault?: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  effectiveVolume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  duration: number;
  progressPercent: number;
  formatTime: (sec: number) => string;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function formatEditorialHeroHeadline(name: string): string {
  const cleaned = name.trim().replace(/\.$/, "");
  const words = cleaned.split(/\s+/);
  if (words.length <= 1) return cleaned;
  if (words.length === 2) return `${words[0]}\n${words[1]}`;
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");
  return `${line1}\n${line2}`;
}

interface DeltaAudioControlClusterProps {
  readonly isPlaying: boolean;
  readonly onTogglePlay: () => void;
  readonly isMuted: boolean;
  readonly onToggleMute: () => void;
  readonly volume: number;
  readonly effectiveVolume: number;
  readonly onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly currentTime: number;
  readonly duration: number;
  readonly fallbackDuration?: string;
  readonly formatTime: (sec: number) => string;
  readonly alwaysShowCapsule?: boolean;
  readonly className?: string;
}

function DeltaAudioControlCluster({
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  volume,
  effectiveVolume,
  onVolumeChange,
  currentTime,
  duration,
  fallbackDuration = "4:54",
  formatTime,
  alwaysShowCapsule = false,
  className = "",
}: DeltaAudioControlClusterProps) {
  const sliderChangedDuringPressRef = useRef(false);
  const capsuleVisibilityClass =
    !alwaysShowCapsule && isMuted && isPlaying
      ? "opacity-0 group-hover/audio:opacity-100 focus-within:opacity-100"
      : "opacity-100";

  return (
    <div
      data-audio-control=""
      className={`pointer-events-auto group/audio flex items-center gap-3 shrink-0 ${className}`}
    >
      <DeltaSoundWaveButton
        isMuted={isMuted}
        isPlaying={isPlaying}
        effectiveVolume={effectiveVolume}
        onToggleMute={onToggleMute}
      />

      {/* Compact Frosted Sound + Volume + Play/Pause + Timecode Capsule */}
      <div
        className={`flex items-center gap-2 rounded-full border border-purple-400/20 delta-sound-pill px-3.5 py-2 backdrop-blur-md transition-opacity duration-300 ${capsuleVisibilityClass}`}
      >
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="flex size-6 items-center justify-center rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5 translate-x-px" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          className="flex items-center gap-1 font-sans text-xs font-medium text-purple-200 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="size-3.5 text-purple-300" />
          ) : volume < 50 ? (
            <Volume1 className="size-3.5 text-purple-300" />
          ) : (
            <Volume2 className="size-3.5 text-purple-300" />
          )}
          <span className="hidden sm:inline">
            {isMuted ? "Tap for Sound" : `${volume}%`}
          </span>
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={effectiveVolume}
          onPointerDown={() => {
            sliderChangedDuringPressRef.current = false;
          }}
          onChange={(e) => {
            sliderChangedDuringPressRef.current = true;
            onVolumeChange(e);
          }}
          onClick={() => {
            if (!sliderChangedDuringPressRef.current && isMuted) {
              onToggleMute();
            }
          }}
          aria-label="Hero video volume"
          style={
            {
              "--slider-progress": `${effectiveVolume}%`,
            } as React.CSSProperties
          }
          className="media-volume-slider hidden sm:block w-16 2xl:w-20"
        />

        <span className="hidden md:inline font-sans text-xs tabular-nums text-white/70">
          {formatTime(currentTime)} /{" "}
          {duration > 0 ? formatTime(duration) : fallbackDuration}
        </span>
      </div>
    </div>
  );
}

export default function DeltaCafesHeroOverlay({
  activeTrack,
  tracks,
  paginationSlides = HERO_ALBUM_PAGINATION_SLIDES,
  onTrackChange,
  onPreviewTrack,
  onStopTrack,
  onScrollToVault,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  volume,
  effectiveVolume,
  onVolumeChange,
  currentTime,
  duration,
  formatTime,
}: DeltaCafesHeroOverlayProps) {
  const matchedTrackIdx = tracks.findIndex(
    (t) => t.id === activeTrack.id || t.youtubeId === activeTrack.youtubeId
  );
  const activeTrackIdx = matchedTrackIdx !== -1 ? matchedTrackIdx : 0;
  const isHeroMusicAudible = isPlaying && !isMuted;

  const handleHeroPaginationScrub = (idx: number) => {
    const targetTrack = tracks[idx];
    if (!targetTrack) return;
    if (onPreviewTrack) {
      onPreviewTrack(targetTrack);
    } else {
      onTrackChange?.(targetTrack);
    }
  };

  const handleHeroPaginationSelect = (idx: number) => {
    const targetTrack = tracks[idx];
    if (!targetTrack) return;

    if (idx === activeTrackIdx) {
      if (isHeroMusicAudible) {
        if (onStopTrack) {
          onStopTrack();
        } else {
          onTogglePlay();
        }
      } else if (onTrackChange) {
        onTrackChange(targetTrack);
      } else {
        onToggleMute();
      }
      return;
    }

    handleHeroPaginationScrub(idx);
  };

  const scrollToVault = () => {
    if (onScrollToVault) {
      onScrollToVault();
      return;
    }
    const vaultEl = document.getElementById("partnerships-vault");
    vaultEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headline = formatEditorialHeroHeadline(activeTrack.name);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-8 pt-24 pb-6 select-none">
      {/* ── LOWER HERO STAGE: LEFT DISPLAY HEADLINE + PAGINATION STACK & RIGHT HIGHLIGHTS + AUDIO ── */}
      <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        {/* Lower-Left Open Display Headline + Page Blobber Pagination Directly Underneath */}
        <div className="flex min-w-0 max-w-4xl flex-col items-start gap-2">
          <h1 className="delta-editorial-h1 whitespace-pre-line text-white">
            {headline}
          </h1>

          <div
            data-audio-control=""
            className="pointer-events-auto max-w-full"
          >
            <GooeyPagination
              ariaLabel="Hero featured albums"
              align="start"
              slides={paginationSlides}
              currentSlide={activeTrackIdx}
              onSelectSlide={handleHeroPaginationSelect}
              onScrubSlide={handleHeroPaginationScrub}
              onTogglePlayCurrent={() => handleHeroPaginationSelect(activeTrackIdx)}
              isPlaying={isHeroMusicAudible}
            />
          </div>
        </div>

        {/* Lower-Right Stack: Floating Translucent Purple-Glass Highlights Bento + Audio Control */}
        <div className="flex flex-col items-end gap-4 shrink-0 self-end">
          <aside
            data-audio-control=""
            aria-label="7th Heaven Vault Highlights"
            className="pointer-events-auto hidden xl:flex w-88 2xl:w-100 flex-col gap-2.5 shrink-0"
          >
            <button
              type="button"
              onClick={scrollToVault}
              className="flex items-center justify-between rounded-xl border border-purple-400/20 bg-purple-950/55 hover:bg-purple-950/80 hover:border-purple-400/40 px-4 py-3 font-sans text-sm font-semibold text-white backdrop-blur-md transition-colors cursor-pointer"
            >
              <span>Media Vault</span>
              <ArrowRight className="size-4 text-purple-300" />
            </button>

            <button
              type="button"
              onClick={() => {
                const targetAlbum =
                  tracks.find((t) => t.id === "07-color-in-motion") ??
                  tracks[2] ??
                  tracks[1];
                if (targetAlbum) onTrackChange?.(targetAlbum);
              }}
              className="group flex h-44 flex-col justify-between rounded-xl border border-purple-400/20 bg-purple-950/55 hover:bg-purple-950/80 hover:border-purple-400/40 p-3.5 text-left backdrop-blur-md transition-colors cursor-pointer"
            >
              <div className="flex flex-1 items-center justify-center">
                <div className="relative h-24 aspect-[3/4] overflow-hidden rounded-sm bg-purple-950 shadow-lg ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src="/images/album/colot-in-motion.png"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <span className="font-sans text-xs font-semibold text-white">
                Billboard #1 Singles
              </span>
            </button>

            {/* Bottom Wide History Card */}
            <button
              type="button"
              onClick={scrollToVault}
              className="group relative flex items-center gap-3.5 rounded-xl border border-purple-400/20 bg-purple-950/55 hover:bg-purple-950/80 hover:border-purple-400/40 p-3.5 text-left backdrop-blur-md transition-colors cursor-pointer"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-purple-400/45">
                <img
                  src="/images/album/luminous.png"
                  alt=""
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-1 pr-5">
                <span className="font-sans text-xs font-semibold text-white">
                  40 Years of 7th Heaven
                </span>
                <span className="font-sans text-xs leading-snug text-white/70 line-clamp-2">
                  More than 5,000 concerts, people, and moments: explore the 70-title archive.
                </span>
              </div>

              <ArrowRight className="absolute top-3.5 right-3.5 size-4 text-purple-300" />
            </button>
          </aside>

          {/* Bottom-Right Delta Sound Wave + Frosted Play/Volume/Timecode Capsule */}
          <DeltaAudioControlCluster
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            volume={volume}
            effectiveVolume={effectiveVolume}
            onVolumeChange={onVolumeChange}
            currentTime={currentTime}
            duration={duration}
            fallbackDuration={activeTrack.duration ?? "4:54"}
            formatTime={formatTime}
            alwaysShowCapsule
          />
        </div>
      </div>
    </div>
  );
}
