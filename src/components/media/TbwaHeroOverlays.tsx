"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  Volume1,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import type { VideoTrack } from "./TbwaPillHero";
import TopLayerDialog from "./TopLayerDialog";

export type HeroLayoutId = 0 | 1 | 2 | 3 | 4 | 5;

export interface HeroLayoutMeta {
  id: HeroLayoutId;
  number: string;
  name: string;
  tag: string;
  desc: string;
}

export const HERO_LAYOUT_VARIATIONS: readonly HeroLayoutMeta[] = [
  {
    id: 0,
    number: "00",
    name: "Delta Cafés Full-Bleed Cinema & Smooothy Reel",
    tag: "DELTA CAFÉS",
    desc: "Full-bleed 93dvh cinema video at top:0 with airy light editorial headline, warm almond-cream CTA pill, 01–03 live-progress chapter thumbnails, frosted highlights bento, and peeking 100vw Smooothy jewel-tile reel directly underneath.",
  },
  {
    id: 1,
    number: "01",
    name: "1600px Cinema Stage & Overlapping Vault",
    tag: "CLEAN 16:9 STAGE",
    desc: "Clean 1600px 16:9 concert frame with sound, volume, and progress bar sitting directly above the overlapping Media Vault Catalog.",
  },
  {
    id: 2,
    number: "02",
    name: "TBWA\\Hakuhodo Case-Study Canvas",
    tag: "TBWA CANONICAL",
    desc: "Twin horizontal marquee title with acid-lime glyph frame, top chamfered VIEW ALL (7)(0) bar, diagonal 01–05 track index, floating CATEGORY / DATE / CREDITS / INFORMATION grid, and bottom MENU bar.",
  },
  {
    id: 3,
    number: "03",
    name: "TBWA Diagonal Spine & Staggered Headline",
    tag: "TBWA DIAGONAL SPINE",
    desc: "Left architectural backslash spine with stacked 01–05 index, diagonal-stepped 3-line display title, and lower-left Swiss case-study ledger.",
  },
  {
    id: 4,
    number: "04",
    name: "TBWA Crosshair Frame & Double Ticker",
    tag: "TBWA WIREFRAME HUD",
    desc: "Acid-lime corner wireframe crosshairs, counter-balanced top VIEW ALL and bottom MENU chamfered polygons, centered open title, and 4-column metadata strip.",
  },
  {
    id: 5,
    number: "05",
    name: "TBWA Agency Reel & Right Staircase Setlist",
    tag: "TBWA REEL SETLIST",
    desc: "Open left editorial dossier over live video paired with an enlarged right-hand diagonal staircase track selector and chamfered catalog controls.",
  },
];

interface CreditPair {
  role: string;
  person: string;
}

const BAND_CREDITS: readonly CreditPair[] = [
  { role: "Lead Vocals & Guitar", person: "Adam Heisler" },
  { role: "Guitars, Keys & Vocals", person: "Richard Hofherr" },
  { role: "Guitars & Vocals", person: "Nick Cox" },
  { role: "Bass & Vocals", person: "Mark Kennetz" },
  { role: "Drums & Percussion", person: "Frankie Harchut" },
  { role: "4K Vault Mastering", person: "7th Heaven Studios" },
];

const TRACK_EDITORIAL_INFO: Readonly<Record<string, { categoryLines: [string, string]; dateText: string; info: string }>> = {
  "better-this-way": {
    categoryLines: ["Billboard Top 40", "Official Single"],
    dateText: "November 2019",
    info: "\"BETTER THIS WAY\" is 7th Heaven's chart-topping Midwest radio single and live arena anthem. Captured across sold-out festival stages and remastered for the 40-Year Media Vault, the performance pairs soaring three-part vocal harmonies with stadium-grade lighting design.",
  },
  "aint-that-just-beautiful": {
    categoryLines: ["Worldwide 4K", "Studio Release"],
    dateText: "January 2025",
    info: "\"AIN'T THAT JUST BEAUTIFUL\" is the flagship 4K music video release from 7th Heaven. Filmed on location in Chicagoland, the visual blends widescreen narrative cinematography with the band's unmistakable melodic rock energy.",
  },
  "taste-of-chicago-live": {
    categoryLines: ["Live Festival", "Broadcast 4K"],
    dateText: "July 2024",
    info: "\"TASTE OF CHICAGO HEADLINE\" documents 7th Heaven commanding Grant Park's main festival stage before tens of thousands of fans, featuring multi-camera crane sweeps, crowd singalongs, and full broadcast audio.",
  },
  "monster-rock": {
    categoryLines: ["Hard Rock", "Studio Cut"],
    dateText: "October 2021",
    info: "\"MONSTER\" delivers high-voltage guitars, driving percussion, and dramatic chiaroscuro stage lighting — engineered in Chicago as one of the heaviest fan-requested singles in the modern 7th Heaven catalog.",
  },
  "sing-anthem": {
    categoryLines: ["Pop Media LP", "Fan Anthem"],
    dateText: "August 2017",
    info: "\"SING\" stands as one of 7th Heaven's most-streamed signature singles with over 135,000 archive views, uniting four decades of festival crowds into a single chorus from the opening downbeat.",
  },
};

const DIAGONAL_INDENT_CLASSES = [
  "translate-x-0",
  "translate-x-2",
  "translate-x-4",
  "translate-x-6",
  "translate-x-8",
] as const;

export function TbwaCircledDigits({
  value,
  dark = true,
}: {
  value: number;
  dark?: boolean;
}) {
  const digits = String(Math.max(0, value)).padStart(2, "0").split("");
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold leading-none tabular-nums">
      {digits.map((digit, index) => (
        <span
          key={`${index}-${digit}`}
          className={`inline-flex size-4 items-center justify-center rounded-full border ${
            dark
              ? "border-zinc-900 text-zinc-950"
              : "border-lime-300/80 text-lime-300"
          }`}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

function TbwaLimeWireframeSvg() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 220"
      className="pointer-events-none absolute top-0 left-0 z-20 w-44 sm:w-64 h-auto text-lime-300/55 select-none"
    >
      <line x1="22" y1="0" x2="22" y2="210" stroke="currentColor" strokeWidth="0.9" />
      <line x1="96" y1="0" x2="96" y2="165" stroke="currentColor" strokeWidth="0.9" />
      <line x1="0" y1="74" x2="220" y2="74" stroke="currentColor" strokeWidth="0.9" />
      <line x1="0" y1="142" x2="175" y2="142" stroke="currentColor" strokeWidth="0.9" />
      <line x1="0" y1="0" x2="180" y2="210" stroke="currentColor" strokeWidth="0.9" />
      <line x1="96" y1="0" x2="235" y2="165" stroke="currentColor" strokeWidth="0.9" />
      <line x1="96" y1="74" x2="22" y2="142" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

function TbwaOversizedTitlePair({
  activeTrack,
  isPlaying,
  singleBlock = false,
}: {
  activeTrack: VideoTrack;
  isPlaying: boolean;
  singleBlock?: boolean;
}) {
  const renderHeadlineCopy = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex flex-col leading-none select-none shrink-0 pr-14 sm:pr-24">
      <div className="text-2xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-white">
        <span>7th</span>
        <span className="relative inline-block mx-1 px-1 border border-lime-300/85">
          H
        </span>
        <span>eaven Archive</span>
      </div>
      <div className="pl-3 sm:pl-6 text-2xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-white/95">
        {activeTrack.badge}
      </div>
      <div className="pl-6 sm:pl-12 pt-1 text-2xl sm:text-4xl lg:text-6xl font-semibold uppercase tracking-tight text-white">
        {activeTrack.name}
      </div>
    </div>
  );

  if (singleBlock) {
    return renderHeadlineCopy("single");
  }

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]">
      <div
        data-paused={!isPlaying ? "true" : "false"}
        className="tbwa-marquee-track items-center"
      >
        {renderHeadlineCopy("copy-a")}
        {renderHeadlineCopy("copy-b")}
        {renderHeadlineCopy("copy-c")}
        {renderHeadlineCopy("copy-d")}
      </div>
    </div>
  );
}

export interface TbwaHeroOverlayProps {
  variant: Exclude<HeroLayoutId, 0 | 1>;
  activeTrack: VideoTrack;
  tracks: readonly VideoTrack[];
  onTrackChange?: (track: VideoTrack) => void;
  totalCatalogCount?: number;
  isListOpen: boolean;
  onToggleList?: () => void;
  fullBleed: boolean;
  onToggleFullBleed?: () => void;
  onOpenCinema: () => void;
  onToggleFullscreen: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  effectiveVolume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  duration: number;
  buffered: number;
  progressPercent: number;
  isScrubbing: boolean;
  hoverPosition: number | null;
  hoverTime: number | null;
  formatTime: (s: number) => string;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function TbwaHeroVideoOverlay({
  variant,
  activeTrack,
  tracks,
  onTrackChange,
  totalCatalogCount = 70,
  isListOpen,
  onToggleList,
  fullBleed,
  onToggleFullBleed,
  onOpenCinema,
  onToggleFullscreen,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  volume,
  effectiveVolume,
  onVolumeChange,
  currentTime,
  duration,
  buffered,
  progressPercent,
  isScrubbing,
  hoverPosition,
  hoverTime,
  formatTime,
  progressBarRef,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  onPointerUp,
  onKeyDown,
}: TbwaHeroOverlayProps) {
  const meta = TRACK_EDITORIAL_INFO[activeTrack.id] ?? {
    categoryLines: [activeTrack.badge || "Official Vault", "4K Remastered"],
    dateText: String(activeTrack.year ?? "2025"),
    info: `${activeTrack.name} — ${activeTrack.subtitle}. Preserved in the 7th Heaven 40-Year Official Media & Photography Vault.`,
  };

  const activeIndex = Math.max(
    0,
    tracks.findIndex((t) => t.id === activeTrack.id || t.youtubeId === activeTrack.youtubeId)
  );
  const inactiveTracks = tracks.filter((_, idx) => idx !== activeIndex);

  const bottomOffsetClass = isListOpen
    ? fullBleed
      ? "bottom-[calc(32dvh+0.75rem)]"
      : "bottom-[calc(14cqw+0.5rem)] @sm:bottom-[calc(20cqw+0.75rem)]"
    : "bottom-4 sm:bottom-6";

  return (
    <>
      {/* Acid-Lime Architectural Wireframe Lines */}
      <TbwaLimeWireframeSvg />

      {/* Variant #04 Extra Architectural Corner Crosshairs */}
      {variant === 4 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 sm:inset-5 z-20 border border-lime-300/30"
        >
          <span className="absolute -top-1 -left-1 size-2.5 border-t-2 border-l-2 border-lime-300" />
          <span className="absolute -top-1 -right-1 size-2.5 border-t-2 border-r-2 border-lime-300" />
          <span className="absolute -bottom-1 -left-1 size-2.5 border-b-2 border-l-2 border-lime-300" />
          <span className="absolute -bottom-1 -right-1 size-2.5 border-b-2 border-r-2 border-lime-300" />
        </div>
      )}

      {/* TOP BAR: Backslash Mark + Flanking Ticker + Chamfered VIEW ALL (7)(0) + Diagonal 01–05 Index */}
      <div
        className={`pointer-events-none absolute top-4 sm:top-6 z-30 flex items-start justify-between gap-4 ${
          fullBleed ? "inset-x-6 sm:inset-x-12" : "inset-x-4 sm:inset-x-8"
        }`}
      >
        {/* Top-Left TBWA Backslash Emblem */}
        <div className="pointer-events-auto flex items-center gap-3 shrink-0">
          <span className="font-mono text-xl sm:text-2xl font-extrabold leading-none text-white select-none">
            \
          </span>
          {variant === 3 && (
            <div className="hidden md:flex flex-col gap-1 pt-1">
              {tracks.map((t, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTrackChange?.(t)}
                    className={`flex items-center gap-2 text-left font-mono text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? "text-lime-300 font-bold"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <span className="truncate max-w-36">{t.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-Center Flanking Ticker + White Chamfered VIEW ALL (7)(0) Polygon */}
        <div className="pointer-events-auto flex items-center justify-center gap-3 min-w-0">
          <span className="hidden xl:inline font-mono text-xs tracking-wider text-white/75 uppercase truncate max-w-52">
            {activeTrack.name} • 7TH HEAVEN • {activeTrack.badge}
          </span>

          <button
            type="button"
            onClick={onToggleList}
            className="clip-tbwa-pill inline-flex items-center justify-between gap-6 bg-white hover:bg-lime-300 px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-950 shadow-xl transition-colors cursor-pointer shrink-0"
          >
            <span>{isListOpen ? "VIEW ALL" : "OPEN VAULT"}</span>
            <TbwaCircledDigits value={totalCatalogCount} dark />
          </button>

          <span className="hidden xl:inline font-mono text-xs tracking-wider text-white/75 uppercase truncate max-w-52">
            40-YEAR ARCHIVE • {activeTrack.duration} • 4K
          </span>
        </div>

        {/* Top-Right Staggered Diagonal 01–04 + Active 05 Track Selector (Reference Signature) */}
        <div className="pointer-events-auto flex flex-col items-end gap-3 shrink-0">
          {variant !== 3 && (
            <div className="hidden sm:flex items-start gap-6 text-xs">
              {/* Diagonal-Stepped Numbers */}
              <div className="flex flex-col gap-0.5 font-mono">
                {inactiveTracks.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTrackChange?.(t)}
                    className={`text-left text-white/60 hover:text-lime-300 transition-colors cursor-pointer ${
                      DIAGONAL_INDENT_CLASSES[idx] ?? "translate-x-6"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </button>
                ))}
                <span className="pt-3 translate-x-8 font-bold text-lime-300">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Right-Aligned Track Titles */}
              <div className="hidden md:flex flex-col items-end gap-0.5">
                {inactiveTracks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTrackChange?.(t)}
                    className="text-right text-white/60 hover:text-white uppercase tracking-wide transition-colors cursor-pointer"
                  >
                    {t.name}
                  </button>
                ))}
                <span className="pt-3 font-semibold uppercase tracking-wide text-white">
                  {activeTrack.name}
                </span>
              </div>
            </div>
          )}

          {/* Quick Top Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-pressed={!isMuted}
            aria-label={isMuted ? "Turn video sound on" : "Mute video sound"}
            className={`clip-tbwa-pill inline-flex items-center gap-2 px-4 py-1 font-mono text-xs font-extrabold uppercase transition-colors cursor-pointer ${
              isMuted
                ? "bg-black/80 text-lime-300 hover:bg-lime-300 hover:text-zinc-950"
                : "bg-lime-300 text-zinc-950 hover:bg-white"
            }`}
          >
            {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            <span>{isMuted ? "SOUND OFF" : `SOUND ${volume}%`}</span>
          </button>
        </div>
      </div>

      {/* CENTER + LOWER-MIDDLE OPEN EDITORIAL CANVAS (Zero Content-Boxing!) */}
      <div
        className={`pointer-events-none absolute inset-x-4 sm:inset-x-8 z-20 flex flex-col gap-4 transition-[bottom] duration-500 ${
          isListOpen
            ? fullBleed
              ? "bottom-[calc(32dvh+5.25rem)]"
              : "bottom-[calc(14cqw+4.75rem)] @sm:bottom-[calc(20cqw+5.25rem)]"
            : "bottom-20 sm:bottom-24"
        }`}
      >
        {/* Oversized Headline Overlay */}
        {variant === 2 || variant === 4 ? (
          <TbwaOversizedTitlePair activeTrack={activeTrack} isPlaying={isPlaying} />
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <TbwaOversizedTitlePair activeTrack={activeTrack} isPlaying={isPlaying} singleBlock />
            {variant === 5 && (
              <div className="pointer-events-auto hidden lg:flex flex-col gap-1.5 border-l border-lime-300/50 pl-4">
                {tracks.map((t, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onTrackChange?.(t)}
                      className={`flex items-center justify-between gap-6 font-mono text-xs transition-colors cursor-pointer ${
                        DIAGONAL_INDENT_CLASSES[idx] ?? "translate-x-0"
                      } ${
                        isCurrent
                          ? "text-lime-300 font-bold"
                          : "text-white/65 hover:text-white"
                      }`}
                    >
                      <span>\{String(idx + 1).padStart(2, "0")}</span>
                      <span className="uppercase">{t.name}</span>
                      <span className="text-white/45">{t.duration}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Open Floating Swiss Metadata Grid: CATEGORY / DATE / INFORMATION + 2-Column CREDITS */}
        <div className="hidden md:grid grid-cols-12 gap-6 items-start text-xs text-white/90 pt-1">
          <div className="col-span-8 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-6">
                <span className="font-mono uppercase text-white/60 shrink-0">CATEGORY</span>
                <div className="flex flex-col leading-snug text-white">
                  <span>{meta.categoryLines[0]}</span>
                  <span className="text-white/75">{meta.categoryLines[1]}</span>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <span className="font-mono uppercase text-white/60 shrink-0">DATE</span>
                <span className="text-white">
                  {meta.dateText} • {activeTrack.duration}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-start gap-6">
              <span className="font-mono uppercase text-white/60 shrink-0">INFORMATION</span>
              <p className="text-xs leading-relaxed text-white/85 max-w-2xl">
                {meta.info}
              </p>
            </div>
          </div>

          {/* Right 2-Column Credits Block (Right-Aligned Role / Left-Aligned Name) */}
          <div className="col-span-4 grid grid-cols-2 gap-x-4 gap-y-0.5 leading-snug">
            {BAND_CREDITS.map((credit) => (
              <React.Fragment key={credit.role}>
                <span className="text-right text-white/70 truncate">{credit.role}</span>
                <span className="text-left font-medium text-white truncate">{credit.person}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM TRANSPORT + CHAMFERED WHITE MENU BAR + PROGRESS SCRUBBER */}
      <div
        className={`pointer-events-auto absolute z-30 flex flex-col gap-2 transition-[bottom] duration-500 group-fullscreen:bottom-6 ${bottomOffsetClass} ${
          fullBleed ? "inset-x-6 sm:inset-x-12" : "inset-x-4 sm:inset-x-8"
        }`}
      >
        {/* Interactive Progress Scrubber */}
        <div
          ref={progressBarRef}
          role="slider"
          tabIndex={0}
          aria-label="Video playback progress"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className="group/bar relative w-full h-5 flex items-center cursor-pointer select-none touch-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
        >
          <div className="relative w-full h-1.5 group-hover/bar:h-2.5 transition-[height] duration-200 bg-white/25 overflow-hidden">
            <div
              style={
                {
                  "--buffer": `${Math.min(100, Math.max(0, buffered * 100))}%`,
                } as React.CSSProperties
              }
              className="absolute inset-y-0 left-0 w-[var(--buffer)] bg-white/35 transition-[width] duration-300 pointer-events-none"
            />
            {hoverPosition !== null && (
              <div
                style={{ "--hover-pos": `${hoverPosition}%` } as React.CSSProperties}
                className="absolute inset-y-0 left-0 w-[var(--hover-pos)] bg-lime-300/35 pointer-events-none"
              />
            )}
            <div
              style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
              className="absolute inset-y-0 left-0 w-[var(--progress)] bg-lime-300 pointer-events-none"
            />
          </div>

          <div
            style={{ "--thumb-pos": `${progressPercent}%` } as React.CSSProperties}
            className={`absolute top-1/2 left-[var(--thumb-pos)] -translate-x-1/2 -translate-y-1/2 size-3 bg-white border-2 border-zinc-950 shadow-md transition-transform pointer-events-none ${
              isScrubbing ? "scale-125" : "scale-100 group-hover/bar:scale-125"
            }`}
          />

          {hoverPosition !== null && hoverTime !== null && (
            <div
              style={{ "--hover-pos": `${hoverPosition}%` } as React.CSSProperties}
              className="absolute -top-8 left-[var(--hover-pos)] -translate-x-1/2 px-2 py-0.5 bg-zinc-950 border border-lime-300/50 text-xs font-mono font-semibold text-lime-300 tabular-nums pointer-events-none whitespace-nowrap"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Bottom 3-Zone Bar: Left Sound/Progress Transport | Center White Chamfered MENU \\ | Right View Modes */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Play/Pause + Mute + Volume Slider + Timecode */}
          <div className="flex items-center gap-2 bg-black/85 border border-white/20 px-2.5 py-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
              className="flex size-7 items-center justify-center bg-white/10 text-white hover:bg-lime-300 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-pressed={!isMuted}
              aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
              className={`flex size-7 items-center justify-center transition-colors cursor-pointer ${
                isMuted
                  ? "bg-white/10 text-lime-300 hover:bg-lime-300 hover:text-zinc-950"
                  : "bg-lime-300 text-zinc-950 hover:bg-white"
              }`}
            >
              {isMuted || effectiveVolume === 0 ? (
                <VolumeX className="size-3.5" />
              ) : effectiveVolume < 50 ? (
                <Volume1 className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={effectiveVolume}
              onChange={onVolumeChange}
              aria-label="Video volume"
              aria-valuetext={isMuted ? "Muted (0 percent)" : `${volume} percent volume`}
              style={{ "--slider-progress": `${effectiveVolume}%` } as React.CSSProperties}
              className="media-volume-slider w-16 sm:w-20 shrink-0"
            />

            <div className="flex items-center gap-1 font-mono text-xs font-semibold text-white/85 px-1.5 tabular-nums select-none">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/65">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Center: Iconic TBWA Solid White Chamfered MENU \\ Bar */}
          {onToggleList && (
            <button
              type="button"
              onClick={onToggleList}
              className="clip-tbwa-trapezoid inline-flex min-w-44 sm:min-w-64 items-center justify-between gap-8 bg-white hover:bg-lime-300 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-zinc-950 shadow-2xl transition-colors cursor-pointer"
            >
              <span>{isListOpen ? "MENU • HIDE VAULT" : "MENU • OPEN VAULT"}</span>
              <span className="font-mono font-black tracking-tighter">\\</span>
            </button>
          )}

          {/* Right: 1600px vs Full Bleed + Watch 4K + Fullscreen */}
          <div className="flex items-center gap-1.5">
            {onToggleFullBleed && (
              <button
                type="button"
                onClick={onToggleFullBleed}
                className="hidden md:inline-flex items-center gap-1.5 border border-white/25 bg-black/80 hover:bg-white hover:text-zinc-950 px-3 py-1.5 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>{fullBleed ? "FULL BLEED" : "1600PX BOX"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCinema}
              className="inline-flex items-center gap-1.5 border border-lime-300/60 bg-black/85 hover:bg-lime-300 text-lime-300 hover:text-zinc-950 px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              <Play className="size-3 fill-current" />
              <span>4K</span>
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="hidden sm:inline-flex items-center justify-center size-8 border border-white/20 bg-black/80 hover:bg-white/15 text-white transition-colors cursor-pointer"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                      HERO / PAGE LAYOUT SWITCHER BAR                       */
/* -------------------------------------------------------------------------- */

export interface TbwaHeroLayoutSwitcherBarProps {
  activeHeroLayout: HeroLayoutId;
  onSelectHeroLayout: (id: HeroLayoutId) => void;
}

export function TbwaHeroLayoutSwitcherBar({
  activeHeroLayout,
  onSelectHeroLayout,
}: TbwaHeroLayoutSwitcherBarProps) {
  const [openModal, setOpenModal] = useState(false);

  const currentIndex = HERO_LAYOUT_VARIATIONS.findIndex((h) => h.id === activeHeroLayout);
  const current =
    currentIndex !== -1 ? HERO_LAYOUT_VARIATIONS[currentIndex] : HERO_LAYOUT_VARIATIONS[0];

  const handlePrev = () => {
    const idx =
      (currentIndex - 1 + HERO_LAYOUT_VARIATIONS.length) % HERO_LAYOUT_VARIATIONS.length;
    onSelectHeroLayout(HERO_LAYOUT_VARIATIONS[idx].id);
  };

  const handleNext = () => {
    const idx = (currentIndex + 1) % HERO_LAYOUT_VARIATIONS.length;
    onSelectHeroLayout(HERO_LAYOUT_VARIATIONS[idx].id);
  };

  return (
    <>
      <aside aria-label="Hero Video Layout Switcher" className="w-full max-w-[1600px] mx-auto mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-white/15 bg-zinc-950/85 px-3 py-1.5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-extrabold uppercase text-lime-300 shrink-0">
              \ HERO {current.number}/0{HERO_LAYOUT_VARIATIONS.length}
            </span>
            <span className="text-xs font-bold uppercase text-white truncate">
              {current.name}
            </span>
            <span className="hidden lg:inline-flex rounded-full border border-lime-300/35 bg-lime-300/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-lime-300 shrink-0">
              {current.tag}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeHeroLayout !== 0 && (
              <button
                type="button"
                onClick={() => onSelectHeroLayout(0)}
                className="rounded-full bg-delta-cream hover:bg-amber-50 px-3.5 py-1 font-mono text-xs font-extrabold uppercase text-zinc-950 transition-colors cursor-pointer"
              >
                Delta Cafés
              </button>
            )}
            {activeHeroLayout !== 2 && (
              <button
                type="button"
                onClick={() => onSelectHeroLayout(2)}
                className="clip-tbwa-pill inline-flex items-center gap-1.5 bg-lime-300 hover:bg-white px-3.5 py-1 font-mono text-xs font-extrabold uppercase text-zinc-950 transition-colors cursor-pointer"
              >
                <Sparkles className="size-3" />
                <span>TBWA\Hakuhodo</span>
              </button>
            )}
            {activeHeroLayout !== 1 && (
              <button
                type="button"
                onClick={() => onSelectHeroLayout(1)}
                className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Clean 16:9
              </button>
            )}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous hero layout"
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-1 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next hero layout"
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-1 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-lime-300/40 bg-lime-300/15 hover:bg-lime-300 hover:text-zinc-950 px-3 py-1 font-mono text-xs font-bold uppercase text-lime-300 transition-colors cursor-pointer"
            >
              <Layers className="size-3.5" />
              <span>All {HERO_LAYOUT_VARIATIONS.length}</span>
            </button>
          </div>
        </div>
      </aside>

      <TopLayerDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        ariaLabel="Hero Video Layout Variations"
        className="m-auto w-full max-w-4xl rounded-[var(--radius-box)]"
      >
        <div className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-[var(--radius-box)] border border-white/20 bg-zinc-950/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-6 shrink-0">
            <div>
              <h2 className="uppercase text-white">
                Hero &amp; Video Overlay Layouts (Clean 16:9 + TBWA\Hakuhodo Series)
              </h2>
              <p className="text-xs text-zinc-400">
                Switch live between the clean 1600px 16:9 stage and 4 TBWA\Hakuhodo editorial video-overlay layouts without interrupting audio playback.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              aria-label="Close hero layouts picker"
              className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto p-6">
            {HERO_LAYOUT_VARIATIONS.map((item) => {
              const isSelected = item.id === activeHeroLayout;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectHeroLayout(item.id);
                    setOpenModal(false);
                  }}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "border-lime-300 bg-lime-950/30"
                      : "border-white/10 bg-white/5 hover:border-lime-300/50 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-extrabold text-lime-300">
                        \ #{item.number}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-xs text-white/80">
                        {item.tag}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span className="text-xs text-zinc-400 leading-relaxed">{item.desc}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 font-mono text-xs">
                    <span className={isSelected ? "text-lime-300 font-bold" : "text-zinc-500"}>
                      {isSelected ? "ACTIVE HERO" : "CLICK TO ACTIVATE"}
                    </span>
                    {isSelected && <Check className="size-3.5 text-lime-300" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </TopLayerDialog>
    </>
  );
}

