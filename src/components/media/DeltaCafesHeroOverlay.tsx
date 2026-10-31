/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { ArrowRight, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { videoThumb } from "@/lib/videoThumb";
import DeltaSoundWaveButton from "./DeltaSoundWaveButton";
import type { VideoTrack } from "./TbwaPillHero";

export interface DeltaCafesHeroOverlayProps {
  activeTrack: VideoTrack;
  tracks: readonly VideoTrack[];
  onTrackChange?: (track: VideoTrack) => void;
  onOpenCinema: () => void;
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
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return `${name}.`;
  if (words.length === 2) return `${words[0]}\n${words[1]}.`;
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");
  const cleanedLine2 = line2.endsWith(".") ? line2 : `${line2}.`;
  return `${line1}\n${cleanedLine2}`;
}

function formatChapterTwoLineTitle(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return `${name}.`;
  const mid = Math.ceil(words.length / 2);
  return `${words.slice(0, mid).join(" ")}\n${words.slice(mid).join(" ")}.`;
}

export default function DeltaCafesHeroOverlay({
  activeTrack,
  tracks,
  onTrackChange,
  onOpenCinema,
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
  progressPercent,
  formatTime,
  progressBarRef,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  onPointerUp,
  onKeyDown,
}: DeltaCafesHeroOverlayProps) {
  const chapters = tracks.slice(0, 3);
  const matchedChapterIdx = chapters.findIndex(
    (t) => t.id === activeTrack.id || t.youtubeId === activeTrack.youtubeId
  );
  const activeChapterIdx = matchedChapterIdx !== -1 ? matchedChapterIdx : 0;

  const handleNextChapter = () => {
    const nextIdx = (activeChapterIdx + 1) % chapters.length;
    onTrackChange?.(chapters[nextIdx]);
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
  const normalizedProgress = Math.max(0, Math.min(1, progressPercent / 100));

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 sm:px-8 pt-24 pb-6 select-none">
      {/* ── TOP-LEFT DELTA STADIUM-PILL SOUND WAVE + HOVER/ACTIVE VOLUME CAPSULE ── */}
      <div className="pointer-events-auto group/audio flex items-center gap-3 self-start">
        <DeltaSoundWaveButton
          isMuted={isMuted}
          isPlaying={isPlaying}
          effectiveVolume={effectiveVolume}
          onToggleMute={onToggleMute}
        />

        {/* Compact Frosted Sound + Volume + Play/Pause Capsule (Reveals on hover/focus or when sound is active) */}
        <div
          className={`flex items-center gap-2 rounded-full border border-white/10 delta-sound-pill px-3.5 py-2 backdrop-blur-md transition-opacity duration-300 ${
            isMuted && isPlaying
              ? "opacity-0 group-hover/audio:opacity-100 focus-within:opacity-100"
              : "opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="flex size-6 items-center justify-center rounded-full hover:bg-white/15 text-amber-100 transition-colors cursor-pointer"
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
            className="flex items-center gap-1 font-mono text-xs text-amber-100 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-3.5 text-amber-300" />
            ) : volume < 50 ? (
              <Volume1 className="size-3.5 text-amber-200" />
            ) : (
              <Volume2 className="size-3.5 text-amber-200" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? "Sound Off" : `${volume}%`}
            </span>
          </button>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={effectiveVolume}
            onChange={onVolumeChange}
            aria-label="Hero video volume"
            style={
              {
                "--slider-progress": `${effectiveVolume}%`,
              } as React.CSSProperties
            }
            className="media-volume-slider hidden sm:block w-16"
          />

          <span className="hidden md:inline font-mono text-xs tabular-nums text-amber-100/75">
            {formatTime(currentTime)} /{" "}
            {duration > 0 ? formatTime(duration) : activeTrack.duration ?? "4:54"}
          </span>
        </div>
      </div>

      {/* ── LOWER HERO STAGE: LEFT EDITORIAL HEADLINE + RIGHT HIGHLIGHTS BENTO + BOTTOM CHAPTERS ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-8">
          {/* Lower-Left Open Editorial Headline + Almond-Cream CTA Pill + Arrow Circle */}
          <div className="pointer-events-auto flex max-w-2xl flex-col items-start gap-6">
            <h1 className="delta-editorial-h1 whitespace-pre-line text-amber-100">
              {headline}
            </h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCinema}
                className="rounded-full bg-delta-cream hover:bg-amber-50 px-8 py-3.5 text-sm font-medium text-zinc-950 transition-colors cursor-pointer"
              >
                Watch 4K Video
              </button>

              <button
                type="button"
                onClick={handleNextChapter}
                aria-label="Next featured video chapter"
                className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-zinc-950/55 hover:bg-amber-100 text-amber-100 hover:text-zinc-950 backdrop-blur-md transition-colors cursor-pointer"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Lower-Right Floating Translucent Glass Highlights Bento (Delta highlights-grid) */}
          <aside
            aria-label="7th Heaven Vault Highlights"
            className="pointer-events-auto hidden lg:flex w-96 xl:w-104 flex-col gap-2.5 shrink-0"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {/* Left Column: Slim Vault Link + Vertical Collector Sleeve Card */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={scrollToVault}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/55 hover:bg-zinc-950/75 px-4 py-3 text-sm text-amber-100 backdrop-blur-md transition-colors cursor-pointer"
                >
                  <span>Media Vault</span>
                  <ArrowRight className="size-4 text-amber-100/80" />
                </button>

                <button
                  type="button"
                  onClick={() => tracks[1] && onTrackChange?.(tracks[1])}
                  className="group flex h-44 flex-col justify-between rounded-xl border border-white/10 bg-zinc-950/55 hover:bg-zinc-950/75 p-3.5 text-left backdrop-blur-md transition-colors cursor-pointer"
                >
                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative h-24 aspect-[3/4] overflow-hidden rounded-sm bg-amber-200 shadow-lg ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105">
                      <img
                        src="/images/album/colot-in-motion.png"
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-100">
                    Billboard #1 Singles
                  </span>
                </button>
              </div>

              {/* Right Column: Framed Square Stage Photography Card */}
              <button
                type="button"
                onClick={() => tracks[2] && onTrackChange?.(tracks[2])}
                className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-xl border border-white/15 p-3.5 text-left cursor-pointer"
              >
                <img
                  src="/images/hero/band-performance.webp"
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                />
                <span className="relative z-10 text-xs font-medium text-amber-50">
                  Live Arena Tour
                </span>
              </button>
            </div>

            {/* Bottom Wide History Card */}
            <button
              type="button"
              onClick={scrollToVault}
              className="group relative flex items-center gap-3.5 rounded-xl border border-white/10 bg-zinc-950/55 hover:bg-zinc-950/75 p-3.5 text-left backdrop-blur-md transition-colors cursor-pointer"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-pink-500/40">
                <img
                  src="/images/album/luminous.png"
                  alt=""
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-1 pr-5">
                <span className="text-xs font-medium text-amber-100">
                  40 Years of 7th Heaven
                </span>
                <span className="text-xs leading-snug text-amber-100/60 line-clamp-2">
                  More than 5,000 concerts, people, and moments: explore the 70-title archive.
                </span>
              </div>

              <ArrowRight className="absolute top-3.5 right-3.5 size-4 text-amber-100/75" />
            </button>
          </aside>
        </div>

        {/* ── BOTTOM NUMBERED CHAPTER THUMBNAILS STRIP (01 / 02 / 03) + HAIRLINE ── */}
        <div className="pointer-events-auto flex items-start">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl">
            {chapters.map((chapter, idx) => {
              const isCurrent =
                chapter.id === activeTrack.id ||
                chapter.youtubeId === activeTrack.youtubeId ||
                (matchedChapterIdx === -1 && idx === 0);
              const isPassed = !isCurrent && idx < activeChapterIdx;
              const thumbSrc = videoThumb(chapter.youtubeId);

              return (
                <div key={chapter.id} className="flex flex-col gap-3">
                  {/* Top Progress Track (Interactive scrubber on active chapter) */}
                  {isCurrent ? (
                    <div
                      ref={progressBarRef}
                      role="slider"
                      tabIndex={0}
                      aria-label="Video playback progress"
                      aria-valuemin={0}
                      aria-valuemax={Math.round(duration || 100)}
                      aria-valuenow={Math.round(currentTime)}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerLeave={onPointerLeave}
                      onPointerUp={onPointerUp}
                      onKeyDown={onKeyDown}
                      className="relative h-0.5 w-full bg-white/25 cursor-pointer py-1.5 -my-1.5 flex items-center"
                    >
                      <div className="relative h-0.5 w-full overflow-hidden bg-white/25">
                        <div
                          style={
                            {
                              "--chapter-progress": normalizedProgress,
                            } as React.CSSProperties
                          }
                          className="delta-chapter-progress h-full w-full bg-amber-100"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-0.5 w-full overflow-hidden bg-white/20">
                      {isPassed && <div className="h-full w-full bg-amber-100/55" />}
                    </div>
                  )}

                  {/* Thumbnail + 01 / Two-Line Chapter Title */}
                  <button
                    type="button"
                    onClick={() => onTrackChange?.(chapter)}
                    aria-pressed={isCurrent}
                    className={`group flex items-start gap-2.5 text-left transition-opacity cursor-pointer ${
                      isCurrent ? "opacity-100" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="relative w-16 sm:w-24 aspect-video shrink-0 overflow-hidden rounded-sm ring-1 ring-white/15">
                      <img
                        src={thumbSrc}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="hidden sm:flex flex-col gap-1 min-w-0">
                      <span className="font-sans text-xs font-medium text-amber-100/80">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-xs leading-snug whitespace-pre-line text-amber-50 line-clamp-2">
                        {formatChapterTwoLineTitle(chapter.name)}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Remaining Full-Width Hairline Rule (.remain-line from deltacafes.com/en) */}
          <div aria-hidden="true" className="hidden md:block h-px flex-1 bg-white/20" />
        </div>
      </div>
    </div>
  );
}
