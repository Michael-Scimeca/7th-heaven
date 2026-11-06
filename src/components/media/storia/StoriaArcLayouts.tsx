/* eslint-disable react-doctor/no-noninteractive-element-interactions */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import LanterneDofHeadline from "@/components/LanterneDofHeadline";
import {
  getCyclicOffset,
  type StoriaGalleryTile,
  type StoriaMilestone,
} from "./storiaData";
import { StoriaYearBackdropStack } from "./StoriaYearBackdropStack";
import { StoriaRulerScrubber } from "./StoriaControls";
import { useStoriaYearStepLock } from "./useStoriaYearStepLock";

export interface StoriaStageLayoutProps {
  milestones: readonly StoriaMilestone[];
  activeIdx: number;
  prevIdx?: number | null;
  onSelectIdx: (idx: number) => void;
  isDossierOpen: boolean;
  onToggleDossier: () => void;
  onExploreArchive: () => void;
  prefersReducedMotion: boolean;
  hasExternalBackdrop?: boolean;
}

export function StoriaExploreEraButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="storia-scopri-pill inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
    >
      <span>{isOpen ? "Hide Story" : "Explore Era"}</span>
      <ArrowUpRight className="size-3.5" />
    </button>
  );
}

export function StoriaMobileMinimalFallback({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: Pick<
  StoriaStageLayoutProps,
  "milestones" | "activeIdx" | "onSelectIdx" | "isDossierOpen" | "onToggleDossier"
>) {
  const active = milestones[activeIdx] ?? milestones[0];
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 text-center md:hidden">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {milestones.map((m, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectIdx(idx)}
              aria-pressed={isSelected}
              className={`cursor-pointer rounded-full px-3 py-1 font-sans text-xs font-semibold tabular-nums transition-colors ${
                isSelected
                  ? "bg-white text-purple-950"
                  : "text-purple-200/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {m.year}
            </button>
          );
        })}
      </div>
      <p className="font-sans text-2xl font-light tabular-nums text-purple-200/80">
        {active.year}
      </p>
      <h3 className="storia-monumental-h3 uppercase text-white">
        {active.title}
      </h3>
      <p className="max-w-md font-sans text-sm text-purple-100/85">
        {active.subtitle}
      </p>
      <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
    </div>
  );
}

/**
 * LAYOUT 01 — Shallow Horizon
 * Whisper-thin planetary arc across the top, tangential years & single plumb drop.
 */
export function StoriaShallowHorizonLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = 700;
  const cy = 1560;
  const radius = 1500;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/500] md:block">
        <svg
          viewBox="0 0 1400 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle cx={cx} cy={cy} r={radius} className="storia-arc-hairline" />
          <line x1={cx} y1={122} x2={cx} y2={176} className="storia-plumb-hairline" />
        </svg>

        {milestones.map((m, idx) => {
          const offset = getCyclicOffset(idx, activeIdx, total);
          const isVisible = Math.abs(offset) <= 2;
          const isActive = offset === 0;
          const thetaDeg = offset * 12.5;
          const rad = (thetaDeg * Math.PI) / 180;
          const svgX = cx + radius * Math.sin(rad);
          const svgY = cy - radius * Math.cos(rad);
          const nodeOpacity = !isVisible
            ? 0
            : isActive
              ? 1
              : Math.abs(offset) === 1
                ? 0.7
                : 0.38;

          return (
            <button
              key={m.id}
              type="button"
              tabIndex={isVisible ? 0 : -1}
              aria-pressed={isActive}
              aria-label={`${m.year}: ${m.title}`}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-rot": `${thetaDeg}deg`,
                  "--storia-opacity": nodeOpacity,
                } as React.CSSProperties
              }
              className={`storia-arc-pin group absolute top-0 left-0 flex w-40 flex-col items-center text-center focus-visible:outline-none ${
                isVisible ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
              }`}
            >
              <span
                aria-hidden="true"
                className={`block size-2.5 rounded-full transition-transform duration-300 ${
                  isActive
                    ? "bg-white ring-4 ring-purple-200/25 scale-125"
                    : "bg-purple-200/50 group-hover:bg-white"
                }`}
              />
              <span
                className={`pt-2 font-sans tabular-nums tracking-tight transition-colors ${
                  isActive
                    ? "text-xl font-semibold text-white lg:text-2xl"
                    : "text-base font-light text-purple-200/75 group-hover:text-white lg:text-lg"
                }`}
              >
                {m.year}
              </span>
              {!isActive && (
                <span className="max-w-36 pt-1 font-sans text-xs leading-tight text-purple-200/50 group-hover:text-purple-100/80">
                  {m.themeLabel}
                </span>
              )}
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center gap-3 px-12 text-center">
          <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 lg:text-4xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 lg:text-base">
            {active.subtitle}
          </p>
          <div className="pointer-events-auto pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>
      </div>

      <StoriaMobileMinimalFallback
        milestones={milestones}
        activeIdx={activeIdx}
        onSelectIdx={onSelectIdx}
        isDossierOpen={isDossierOpen}
        onToggleDossier={onToggleDossier}
      />
    </div>
  );
}

/**
 * LAYOUT 02 — Valley Cradle
 * Open monumental headline floating above an inverted lower sweeping cradle curve.
 */
export function StoriaValleyCradleLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = 700;
  const cy = -1060;
  const radius = 1500;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/500] md:block">
        <div className="pointer-events-none absolute inset-x-0 top-[8%] flex flex-col items-center gap-3 px-12 text-center">
          <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 lg:text-4xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 lg:text-base">
            {active.subtitle}
          </p>
          <div className="pointer-events-auto pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>

        <svg
          viewBox="0 0 1400 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle cx={cx} cy={cy} r={radius} className="storia-arc-hairline" />
          <line x1={cx} y1={320} x2={cx} y2={382} className="storia-plumb-hairline" />
        </svg>

        {milestones.map((m, idx) => {
          const offset = getCyclicOffset(idx, activeIdx, total);
          const isVisible = Math.abs(offset) <= 2;
          const isActive = offset === 0;
          const thetaDeg = offset * 12;
          const rad = (thetaDeg * Math.PI) / 180;
          const svgX = cx + radius * Math.sin(rad);
          const svgY = cy + radius * Math.cos(rad);
          const nodeOpacity = !isVisible
            ? 0
            : isActive
              ? 1
              : Math.abs(offset) === 1
                ? 0.72
                : 0.4;

          return (
            <button
              key={m.id}
              type="button"
              tabIndex={isVisible ? 0 : -1}
              aria-pressed={isActive}
              aria-label={`${m.year}: ${m.title}`}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-rot": `${-thetaDeg}deg`,
                  "--storia-opacity": nodeOpacity,
                } as React.CSSProperties
              }
              className={`storia-inverted-pin group absolute top-0 left-0 flex w-36 flex-col items-center text-center focus-visible:outline-none ${
                isVisible ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
              }`}
            >
              <span
                className={`pb-2 font-sans tabular-nums tracking-tight transition-colors ${
                  isActive
                    ? "text-xl font-semibold text-white lg:text-2xl"
                    : "text-base font-light text-purple-200/75 group-hover:text-white lg:text-lg"
                }`}
              >
                {m.year}
              </span>
              <span
                aria-hidden="true"
                className={`block size-2.5 rounded-full transition-transform ${
                  isActive
                    ? "bg-white ring-4 ring-purple-200/25 scale-125"
                    : "bg-purple-200/50 group-hover:bg-white"
                }`}
              />
            </button>
          );
        })}
      </div>

      <StoriaMobileMinimalFallback
        milestones={milestones}
        activeIdx={activeIdx}
        onSelectIdx={onSelectIdx}
        isDossierOpen={isDossierOpen}
        onToggleDossier={onToggleDossier}
      />
    </div>
  );
}

interface MosaicSlotConfig {
  readonly className: string;
  readonly sizes: string;
  readonly videoWidth: number;
  readonly videoHeight: number;
  readonly isHeroSlot?: boolean;
}

const MOSAIC_SLOT_CONFIG: readonly MosaicSlotConfig[] = [
  {
    className:
      "col-span-1 row-span-1 sm:col-span-2 sm:row-span-1 lg:col-span-6 lg:row-span-2",
    sizes: "(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, 50vw",
    videoWidth: 960,
    videoHeight: 540,
    isHeroSlot: true,
  },
  {
    className:
      "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1 lg:col-span-3 lg:row-span-1",
    sizes: "(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, 35vw",
    videoWidth: 480,
    videoHeight: 270,
  },
  {
    className:
      "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1 lg:col-span-3 lg:row-span-1",
    sizes: "(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, 35vw",
    videoWidth: 480,
    videoHeight: 270,
  },
  {
    className:
      "col-span-1 row-span-1 sm:col-span-2 sm:row-span-1 lg:col-span-6 lg:row-span-1",
    sizes: "(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, 50vw",
    videoWidth: 640,
    videoHeight: 360,
  },
  {
    className:
      "hidden sm:block sm:col-span-1 sm:row-span-1 lg:col-span-3 lg:row-span-1",
    sizes: "(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, 25vw",
    videoWidth: 480,
    videoHeight: 270,
  },
  {
    className:
      "hidden sm:block sm:col-span-1 sm:row-span-1 lg:col-span-3 lg:row-span-1",
    sizes: "(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, 25vw",
    videoWidth: 480,
    videoHeight: 270,
  },
  {
    className: "hidden lg:block lg:col-span-3 lg:row-span-1",
    sizes: "(min-width: 1280px) 16vw, 18vw",
    videoWidth: 480,
    videoHeight: 270,
  },
  {
    className: "hidden lg:block lg:col-span-3 lg:row-span-1",
    sizes: "(min-width: 1280px) 16vw, 18vw",
    videoWidth: 480,
    videoHeight: 270,
  },
];

function getMilestoneGallery(m: StoriaMilestone): readonly StoriaGalleryTile[] {
  if (m.mediaGallery && m.mediaGallery.length >= 8) {
    return m.mediaGallery;
  }
  const fallbackVideoSrc = m.videoSrc ?? "/movie/loops/summerfest-live-30s.mp4";
  return [
    {
      id: `${m.id}-fallback-0`,
      kind: "video",
      src: fallbackVideoSrc,
      posterSrc: m.imageSrc,
      alt: m.imageAlt,
      label: "Era Concert Film",
    },
    {
      id: `${m.id}-fallback-1`,
      kind: "video",
      src: "/movie/fest1-clip.mp4",
      posterSrc: m.secondaryImageSrc,
      alt: m.secondaryImageAlt,
      label: "Festival Stage Reel",
    },
    {
      id: `${m.id}-fallback-2`,
      kind: "photo",
      src: m.imageSrc,
      posterSrc: m.imageSrc,
      alt: m.imageAlt,
      label: `${m.year} Milestone`,
    },
    {
      id: `${m.id}-fallback-3`,
      kind: "photo",
      src: m.secondaryImageSrc,
      posterSrc: m.secondaryImageSrc,
      alt: m.secondaryImageAlt,
      label: m.themeLabel,
    },
    {
      id: `${m.id}-fallback-4`,
      kind: "photo",
      src: "/images/hero/hero-desktop-poster.webp",
      posterSrc: "/images/hero/hero-desktop-poster.webp",
      alt: `${m.year} Mainstage Production`,
      label: "Mainstage Production",
    },
    {
      id: `${m.id}-fallback-5`,
      kind: "photo",
      src: "/images/tour/fan-concert-photo.jpg",
      posterSrc: "/images/tour/fan-concert-photo.jpg",
      alt: `${m.year} Festival Crowd`,
      label: "Festival Crowd",
    },
    {
      id: `${m.id}-fallback-6`,
      kind: "video",
      src: "/movie/loops/are-we-there-yet-30s.mp4",
      posterSrc: "/images/hero/hero-banner.png",
      alt: `${m.year} Theatre Broadcast`,
      label: "Theatre Spotlight",
    },
    {
      id: `${m.id}-fallback-7`,
      kind: "photo",
      src: "/images/fans/fan-photo-featured.jpg",
      posterSrc: "/images/fans/fan-photo-featured.jpg",
      alt: `${m.year} Front-Row Singalong`,
      label: "Front-Row Singalong",
    },
  ];
}

const POLAROID_DECK_PROFILES = [
  { deckX: 215, deckY: 265, rot: -14, scale: 0.72 },
  { deckX: 115, deckY: 295, rot: 17, scale: 0.68 },
  { deckX: -65, deckY: 315, rot: -19, scale: 0.68 },
  { deckX: 85, deckY: 235, rot: 12, scale: 0.72 },
  { deckX: 245, deckY: 190, rot: 16, scale: 0.7 },
  { deckX: 140, deckY: 210, rot: -15, scale: 0.7 },
  { deckX: 45, deckY: 225, rot: 18, scale: 0.7 },
  { deckX: -60, deckY: 195, rot: -12, scale: 0.7 },
] as const;

function StoriaMosaicWall({
  milestones,
  activeIdx,
  prevIdx = null,
  settledActiveIdx,
  prefersReducedMotion,
  onOpenSlot,
}: {
  milestones: readonly StoriaMilestone[];
  activeIdx: number;
  prevIdx?: number | null;
  settledActiveIdx: number;
  prefersReducedMotion: boolean;
  onOpenSlot: (slotIdx: number) => void;
}) {
  const wallRef = useRef<HTMLDivElement>(null);
  const safeIdx = Math.max(0, Math.min(milestones.length - 1, activeIdx));
  const safePrevIdx =
    prevIdx !== null && prevIdx !== undefined
      ? Math.max(0, Math.min(milestones.length - 1, prevIdx))
      : null;
  const isMultiStepJump =
    safePrevIdx !== null && Math.abs(safeIdx - safePrevIdx) > 1;

  useEffect(() => {
    const root = wallRef.current;
    if (!root) return;

    const dir = safePrevIdx !== null && safeIdx < safePrevIdx ? -1 : 1;
    const spinSign = safeIdx % 2 === 0 ? 1 : -1;

    const ctx = gsap.context(() => {
      const activeCards = gsap.utils.toArray<HTMLElement>(
        '[data-pos="active"] [data-slot]'
      );
      const outgoingCards = gsap.utils.toArray<HTMLElement>(
        '[data-outgoing="true"] [data-slot]'
      );

      if (prefersReducedMotion) {
        gsap.set(activeCards, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
        });
        gsap.set(outgoingCards, { autoAlpha: 0 });
        return;
      }

      if (outgoingCards.length > 0) {
        gsap.to(outgoingCards, {
          x: (i) => {
            const p = POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length];
            return -p.deckX * 0.42;
          },
          y: (i) => {
            const p = POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length];
            return -dir * (p.deckY * 0.72);
          },
          rotation: (i) => {
            const p = POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length];
            return -p.rot * 0.65 * spinSign;
          },
          scale: 0.84,
          autoAlpha: 0,
          duration: 0.46,
          stagger: 0.02,
          ease: "power3.in",
          overwrite: "auto",
        });
      }

      if (activeCards.length > 0) {
        gsap.fromTo(
          activeCards,
          {
            x: (i) =>
              POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length].deckX,
            y: (i) =>
              dir *
              POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length].deckY,
            rotation: (i) =>
              POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length].rot *
              spinSign,
            scale: (i) =>
              POLAROID_DECK_PROFILES[i % POLAROID_DECK_PROFILES.length].scale,
            autoAlpha: 0,
            transformOrigin: "50% 65%",
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.84,
            stagger: 0.048,
            ease: "back.out(1.22)",
            overwrite: "auto",
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [safeIdx, safePrevIdx, prefersReducedMotion]);

  return (
    <div
      ref={wallRef}
      className="storia-mosaic-viewport-mask pointer-events-none relative z-20 flex min-h-0 w-full flex-1 items-center overflow-visible px-4 sm:px-8 min-[1401px]:col-span-8 min-[1401px]:h-full min-[1401px]:px-0"
    >
      <div className="relative h-full max-h-[44dvh] min-h-[220px] w-full overflow-visible sm:max-h-[48dvh] min-[1401px]:h-[78dvh] min-[1401px]:max-h-[920px] min-[1401px]:min-h-[520px]">
        {milestones.map((m, idx) => {
          const isOutgoing =
            safePrevIdx !== null && idx === safePrevIdx && idx !== safeIdx;
          if (Math.abs(idx - safeIdx) > 1 && !isOutgoing) return null;

          const isActive = idx === safeIdx;
          const pos: "above" | "active" | "below" = isActive
            ? "active"
            : idx < safeIdx
              ? "above"
              : "below";
          const jumpAttr =
            isActive && isMultiStepJump && safePrevIdx !== null
              ? safeIdx > safePrevIdx
                ? "from-below"
                : "from-above"
              : "none";
          const gallery = getMilestoneGallery(m);

          return (
            <div
              key={`${m.id}-mosaic-board`}
              aria-hidden={!isActive}
              data-pos={pos}
              data-outgoing={isOutgoing ? "true" : "false"}
              data-jump={jumpAttr}
              className={`storia-mosaic-board-slide absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 sm:grid-cols-4 sm:grid-rows-2 lg:grid-cols-12 lg:grid-rows-3 lg:gap-4 ${
                isActive ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              {MOSAIC_SLOT_CONFIG.map((slotCfg, slotIdx) => {
                const tile = gallery[slotIdx];
                if (!tile) return null;

                const shouldPlayLiveVideo =
                  tile.kind === "video" &&
                  isActive &&
                  settledActiveIdx === safeIdx &&
                  !prefersReducedMotion;

                return (
                  <button
                    key={`${m.id}-slot-${slotIdx}`}
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    data-slot={slotIdx}
                    onClick={() => onOpenSlot(slotIdx)}
                    aria-label={`Open ${m.year} ${
                      tile.kind === "video" ? "video" : "photo"
                    }: ${tile.label}`}
                    className={`storia-mosaic-card-drift group relative cursor-pointer overflow-clip rounded-[var(--radius-box)] bg-purple-950/60 text-left shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${slotCfg.className}`}
                  >
                    <Image
                      src={tile.posterSrc}
                      alt={isActive ? tile.alt : ""}
                      fill
                      sizes={slotCfg.sizes}
                      className={`object-cover transition-transform duration-700 ${
                        tile.posterSrc.startsWith("/images/media/video-frames/")
                          ? "scale-[1.35] group-hover:scale-[1.42]"
                          : "group-hover:scale-105"
                      }`}
                    />

                    {shouldPlayLiveVideo && (
                      <video
                        key={tile.src}
                        src={tile.src}
                        poster={tile.posterSrc}
                        width={slotCfg.videoWidth}
                        height={slotCfg.videoHeight}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        {...({
                          loading: "lazy",
                        } as React.VideoHTMLAttributes<HTMLVideoElement>)}
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
                    />

                    {tile.kind === "video" && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-2 right-2 flex items-center gap-2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-600/85"
                      >
                        <Play className="size-3.5 fill-current" />
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2 sm:p-4">
                      <span className="line-clamp-1 font-sans text-xs font-semibold uppercase tracking-wider text-white/95">
                        {slotCfg.isHeroSlot
                          ? `${m.year} • ${tile.label}`
                          : tile.label}
                      </span>
                      {slotCfg.isHeroSlot && (
                        <span className="hidden shrink-0 font-sans text-xs font-medium tabular-nums text-purple-200/90 sm:inline">
                          {m.statMeta}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoriaMediaLightboxDialog({
  milestone,
  selectedSlotIdx,
  prefersReducedMotion,
  onSelectSlot,
  onClose,
}: {
  milestone: StoriaMilestone;
  selectedSlotIdx: number | null;
  prefersReducedMotion: boolean;
  onSelectSlot: (slotIdx: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gallery = getMilestoneGallery(milestone);
  const isOpen = selectedSlotIdx !== null;
  const safeSlotIdx =
    selectedSlotIdx !== null
      ? ((selectedSlotIdx % gallery.length) + gallery.length) % gallery.length
      : 0;
  const activeTile = gallery[safeSlotIdx] ?? gallery[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      aria-label={`${milestone.year} media viewer`}
      className="mx-auto w-full max-w-5xl bg-transparent p-4 text-white backdrop:bg-black/85 backdrop:backdrop-blur-md focus:outline-none sm:p-6"
    >
      {isOpen && activeTile && (
        <div className="flex flex-col gap-4 overflow-hidden rounded-[var(--radius-box)] bg-purple-950/95 p-4 shadow-2xl ring-1 ring-white/20 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="font-display text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                {milestone.year} — {activeTile.label}
              </h4>
              <p className="font-sans text-xs uppercase tracking-wider text-purple-200/80">
                {milestone.title} • {milestone.venueMeta} •{" "}
                <span className="tabular-nums text-purple-200/60">
                  {safeSlotIdx + 1} / {gallery.length}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onSelectSlot(
                    (safeSlotIdx - 1 + gallery.length) % gallery.length
                  )
                }
                aria-label="Previous media item"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onSelectSlot((safeSlotIdx + 1) % gallery.length)
                }
                aria-label="Next media item"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                <ChevronRight className="size-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close media viewer"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-box)] bg-black ring-1 ring-white/15">
            {activeTile.kind === "video" ? (
              <video
                key={activeTile.src}
                src={activeTile.src}
                poster={activeTile.posterSrc}
                width={1280}
                height={720}
                controls
                autoPlay={!prefersReducedMotion}
                playsInline
                preload="metadata"
                className="size-full object-contain"
              />
            ) : (
              <Image
                src={activeTile.src}
                alt={activeTile.alt}
                fill
                sizes="(min-width: 1024px) 960px, 92vw"
                className={
                  activeTile.src.startsWith("/images/media/video-frames/")
                    ? "scale-[1.35] object-cover"
                    : "object-contain"
                }
              />
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {gallery.map((thumb, idx) => {
              const isSelected = idx === safeSlotIdx;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => onSelectSlot(idx)}
                  aria-pressed={isSelected}
                  aria-label={`${
                    thumb.kind === "video" ? "Video" : "Photo"
                  } ${idx + 1}: ${thumb.label}`}
                  className={`relative aspect-video cursor-pointer overflow-hidden rounded-[var(--radius-box)] bg-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
                    isSelected
                      ? "opacity-100 ring-2 ring-white"
                      : "opacity-55 ring-1 ring-white/15 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={thumb.posterSrc}
                    alt=""
                    fill
                    sizes="120px"
                    className={
                      thumb.posterSrc.startsWith("/images/media/video-frames/")
                        ? "scale-[1.35] object-cover"
                        : "object-cover"
                    }
                  />
                  {thumb.kind === "video" && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <Play className="size-3.5 fill-white text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </dialog>
  );
}

function StoriaTopHangingMeridianWheel({
  milestones,
  activeIdx,
  onSelectMilestone,
}: {
  milestones: readonly StoriaMilestone[];
  activeIdx: number;
  onSelectMilestone: (idx: number) => void;
}) {
  const topCx = 500;
  const topCy = -1490.5;
  const topRadius = 1602.5;

  return (
    <div className="@container relative w-full aspect-[1000/220]">
      <svg
        viewBox="0 0 1000 220"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <circle
          cx={topCx}
          cy={topCy}
          r={topRadius}
          className="storia-arc-hairline-bright"
        />
      </svg>

      {milestones.map((m, idx) => {
        const offset = idx - activeIdx;
        const absOffset = Math.abs(offset);
        const isVisible = absOffset <= 5;
        const isActive = offset === 0;
        const clampedOffset = Math.max(-6, Math.min(6, offset));
        const angleDeg = -clampedOffset * 3.4;
        const rad = (angleDeg * Math.PI) / 180;
        const svgX = topCx + topRadius * Math.sin(rad);
        const svgY = topCy + topRadius * Math.cos(rad);
        const rotDeg = 90 - angleDeg;
        const nodeOpacity = !isVisible
          ? 0
          : isActive
            ? 1
            : absOffset === 1
              ? 0.86
              : absOffset === 2
                ? 0.68
                : absOffset === 3
                  ? 0.5
                  : absOffset === 4
                    ? 0.34
                    : 0.2;

        return (
          <button
            key={`${m.id}-top-hanging`}
            type="button"
            tabIndex={isVisible ? 0 : -1}
            aria-pressed={isActive}
            aria-label={`${m.year}: ${m.title}`}
            onClick={() => onSelectMilestone(idx)}
            style={
              {
                "--storia-svg-x": svgX.toFixed(2),
                "--storia-svg-y": svgY.toFixed(2),
                "--storia-rot": `${rotDeg.toFixed(2)}deg`,
                "--storia-opacity": nodeOpacity,
              } as React.CSSProperties
            }
            className={`storia-top-hanging-pin group absolute top-0 left-0 flex items-center gap-4 text-left focus-visible:outline-none ${
              isVisible
                ? "pointer-events-auto cursor-pointer"
                : "pointer-events-none"
            }`}
          >
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "size-4 bg-white ring-8 ring-purple-200/25"
                    : absOffset === 1
                      ? "size-3 bg-purple-200/65 group-hover:scale-110 group-hover:bg-white"
                      : absOffset <= 3
                        ? "size-2.5 bg-purple-200/50 group-hover:scale-110 group-hover:bg-white"
                        : "size-2 bg-purple-200/40 group-hover:scale-110 group-hover:bg-white"
                }`}
              />
            </span>
            <span
              className={`font-sans tabular-nums leading-none tracking-tight transition-colors ${
                isActive
                  ? "text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                  : absOffset === 1
                    ? "text-xl font-light text-purple-100/85 group-hover:text-white sm:text-2xl lg:text-3xl"
                    : absOffset === 2
                      ? "text-lg font-light text-purple-200/75 group-hover:text-white sm:text-xl lg:text-2xl"
                      : absOffset === 3
                        ? "text-base font-light text-purple-200/65 group-hover:text-white sm:text-lg lg:text-xl"
                        : absOffset === 4
                          ? "text-sm font-light text-purple-200/55 group-hover:text-white sm:text-base lg:text-lg"
                          : "text-xs font-light text-purple-200/45 group-hover:text-white sm:text-sm lg:text-base"
              }`}
            >
              {m.year}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * LAYOUT 03 — Left Meridian
 * Sticky full-height (100dvh) left-edge meridian arc whose eras step 1 year at
 * a time with a ~1-second showcase lock so no year is ever skipped, paired with
 * each year's own full-bleed background image / video placeholder and 8-tile mosaic wall.
 */
export function StoriaLeftMeridianLayout({
  milestones,
  activeIdx,
  prevIdx = null,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
  onExploreArchive,
  prefersReducedMotion,
  hasExternalBackdrop = false,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = -1110;
  const cy = 500;
  const radius = 1220;

  const [settledActiveIdx, setSettledActiveIdx] = useState<number>(activeIdx);
  const [lightboxSlotIdx, setLightboxSlotIdx] = useState<number | null>(null);
  const editorialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setSettledActiveIdx(activeIdx);
    }, 90);
    return () => window.clearTimeout(timerId);
  }, [activeIdx]);

  useEffect(() => {
    const el = editorialRef.current;
    if (!el || prefersReducedMotion) return;
    const dir = prevIdx !== null && activeIdx < prevIdx ? -1 : 1;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-editorial-item]");
      gsap.fromTo(
        items,
        {
          y: dir * 18,
          rotation: dir * -1.4,
          autoAlpha: 0,
        },
        {
          y: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 0.56,
          stagger: 0.045,
          ease: "power3.out",
          overwrite: "auto",
        }
      );
    }, el);
    return () => ctx.revert();
  }, [activeIdx, prevIdx, prefersReducedMotion]);

  const {
    scrollTrackRef,
    handleSelectMilestone,
    handleScrubMilestone,
  } = useStoriaYearStepLock({
    total,
    activeIdx,
    onSelectIdx,
    prefersReducedMotion,
  });

  return (
    <div ref={scrollTrackRef} className="relative h-[2600dvh] w-full">
      <div className="sticky top-0 h-dvh min-h-[640px] w-full overflow-clip">
        {!hasExternalBackdrop && (
          <StoriaYearBackdropStack
            milestones={milestones}
            activeIdx={activeIdx}
            prevIdx={prevIdx}
          />
        )}

        {/* Monumental Full-Section "SINCE 1985" Background Watermark (locked at 2% opacity) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
        >
          <span className="storia-since-watermark">SINCE 1985</span>
        </div>

        {/* > 1400px: Left-docked 1:1 square coordinate frame equal to 100% of stage height (100dvh) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden aspect-square h-full min-[1401px]:block">
          <div className="@container relative size-full">
            <svg
              viewBox="0 0 1000 1000"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full overflow-visible"
            >
              <circle cx={cx} cy={cy} r={radius} className="storia-arc-hairline-bright" />
              <line
                x1={275}
                y1={cy}
                x2={315}
                y2={cy}
                className="storia-plumb-hairline"
              />
            </svg>

            {milestones.map((m, idx) => {
              const offset = idx - activeIdx;
              const absOffset = Math.abs(offset);
              const isVisible = absOffset <= 5;
              const isActive = offset === 0;
              const clampedOffset = Math.max(-6, Math.min(6, offset));
              const angleDeg = clampedOffset * 4.2;
              const rad = (angleDeg * Math.PI) / 180;
              const svgX = cx + radius * Math.cos(rad);
              const svgY = cy + radius * Math.sin(rad);
              const nodeOpacity = !isVisible
                ? 0
                : isActive
                  ? 1
                  : absOffset === 1
                    ? 0.86
                    : absOffset === 2
                      ? 0.68
                      : absOffset === 3
                        ? 0.5
                        : absOffset === 4
                          ? 0.34
                          : 0.2;

              return (
                <button
                  key={m.id}
                  type="button"
                  tabIndex={isVisible ? 0 : -1}
                  aria-pressed={isActive}
                  aria-label={`${m.year}: ${m.title}`}
                  onClick={() => handleSelectMilestone(idx)}
                  style={
                    {
                      "--storia-svg-x": svgX.toFixed(2),
                      "--storia-svg-y": svgY.toFixed(2),
                      "--storia-rot": `${angleDeg}deg`,
                      "--storia-opacity": nodeOpacity,
                    } as React.CSSProperties
                  }
                  className={`storia-left-meridian-pin group absolute top-0 left-0 flex items-center gap-4 text-left focus-visible:outline-none ${
                    isVisible ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-5 shrink-0 items-center justify-center"
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isActive
                          ? "size-4 bg-white ring-8 ring-purple-200/25"
                          : absOffset === 1
                            ? "size-3 bg-purple-200/65 group-hover:scale-110 group-hover:bg-white"
                            : absOffset <= 3
                              ? "size-2.5 bg-purple-200/50 group-hover:scale-110 group-hover:bg-white"
                              : "size-2 bg-purple-200/40 group-hover:scale-110 group-hover:bg-white"
                      }`}
                    />
                  </span>
                  <span
                    className={`font-sans tabular-nums leading-none tracking-tight transition-colors ${
                      isActive
                        ? "text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        : absOffset === 1
                          ? "text-xl font-light text-purple-100/85 group-hover:text-white sm:text-2xl lg:text-3xl"
                          : absOffset === 2
                            ? "text-lg font-light text-purple-200/75 group-hover:text-white sm:text-xl lg:text-2xl"
                            : absOffset === 3
                              ? "text-base font-light text-purple-200/65 group-hover:text-white sm:text-lg lg:text-xl"
                              : absOffset === 4
                                ? "text-sm font-light text-purple-200/55 group-hover:text-white sm:text-base lg:text-lg"
                                : "text-xs font-light text-purple-200/45 group-hover:text-white sm:text-sm lg:text-base"
                    }`}
                  >
                    {m.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* <= 1400px Top Stage Headline ("SINCE 1985, MUSIC THAT AWAKENS STORIES") nestled in hanging arc bowl */}
        <div className="pointer-events-none absolute inset-x-0 top-2 z-30 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center min-[1401px]:hidden">
          <LanterneDofHeadline
            lines={["SINCE 1985,", "MUSIC THAT AWAKENS STORIES"]}
            as="h2"
            headingId="delta-history-heading"
            align="center"
            color="#FFFFFF"
            fontSizeMode="computed"
            typographyClassName="delta-history-display"
            lineHeight={0.96}
            bokehStrength={13}
            focusWidth={0.11}
            focusFalloff={0.52}
            grainIntensity={0.48}
            maxTiltYDeg={18}
            maxTiltXDeg={11}
          />
        </div>

        {/* <= 1400px: Full-Bleed Hanging Meridian Wheel + Left-Aligned Story + Full Bento Mosaic | > 1400px: 12-Col Side-by-Side */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between gap-2 pt-0 pb-14 min-[1401px]:inset-y-0 min-[1401px]:left-[clamp(18.5rem,33.5dvh,30rem)] min-[1401px]:right-10 min-[1401px]:grid min-[1401px]:grid-cols-12 min-[1401px]:content-normal min-[1401px]:gap-8 min-[1401px]:py-0 xl:right-14 2xl:right-20">
          {/* <= 1400px Top Hanging Meridian Wheel (100% full-bleed edge-to-edge) */}
          <div className="relative z-30 w-full shrink-0 min-[1401px]:hidden">
            <StoriaTopHangingMeridianWheel
              milestones={milestones}
              activeIdx={activeIdx}
              onSelectMilestone={handleSelectMilestone}
            />
          </div>

          <div className="relative z-30 flex w-full shrink-0 flex-col items-start justify-between gap-2 px-4 text-left sm:px-8 min-[1401px]:col-span-4 min-[1401px]:h-full min-[1401px]:gap-4 min-[1401px]:px-0 min-[1401px]:pb-10">
            <div
              ref={editorialRef}
              className="flex w-full flex-col items-start justify-center gap-2 min-[1401px]:my-auto min-[1401px]:gap-3"
            >
              <h3
                data-editorial-item
                className="storia-monumental-h3 max-w-4xl uppercase text-white max-[1400px]:!text-3xl max-[1400px]:sm:!text-4xl min-[1401px]:max-w-xl"
              >
                {active.title}
              </h3>
              <p
                data-editorial-item
                className="font-sans text-xs font-light uppercase tracking-widest text-purple-200/75 sm:text-sm"
              >
                {active.year} • {active.venueMeta} •{" "}
                <span className="tabular-nums text-purple-200/55">
                  {String(activeIdx + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </p>
              <p
                data-editorial-item
                className="max-w-3xl font-sans text-xs text-purple-100/85 sm:text-sm min-[1401px]:max-w-lg min-[1401px]:text-base"
              >
                {active.subtitle}
              </p>
              {isDossierOpen && (
                <p
                  data-editorial-item
                  className="max-w-3xl font-sans text-xs leading-relaxed text-purple-100/90 sm:text-sm min-[1401px]:max-w-lg"
                >
                  {active.story}
                </p>
              )}
              <div
                data-editorial-item
                className="pointer-events-auto flex w-full flex-wrap items-center justify-between gap-4 pt-1 min-[1401px]:justify-start min-[1401px]:pt-2"
              >
                <div className="flex flex-wrap items-center gap-3 min-[1401px]:gap-4">
                  <StoriaExploreEraButton
                    isOpen={isDossierOpen}
                    onToggle={onToggleDossier}
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxSlotIdx(0)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-purple-100 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>3 Films &amp; 5 Photos</span>
                  </button>
                  {isDossierOpen && (
                    <button
                      type="button"
                      onClick={onExploreArchive}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-purple-200/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                    >
                      <span>Open 70-Title Vault</span>
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="w-full max-w-sm min-[1401px]:hidden">
                  <StoriaRulerScrubber
                    variant="column"
                    milestones={milestones}
                    activeIdx={activeIdx}
                    onSelectIdx={handleSelectMilestone}
                    onScrubIdx={handleScrubMilestone}
                  />
                </div>
              </div>
            </div>

            <div className="pointer-events-auto hidden w-full shrink-0 min-[1401px]:block">
              <StoriaRulerScrubber
                variant="column"
                milestones={milestones}
                activeIdx={activeIdx}
                onSelectIdx={handleSelectMilestone}
                onScrubIdx={handleScrubMilestone}
              />
            </div>
          </div>

          <StoriaMosaicWall
            milestones={milestones}
            activeIdx={activeIdx}
            prevIdx={prevIdx}
            settledActiveIdx={settledActiveIdx}
            prefersReducedMotion={prefersReducedMotion}
            onOpenSlot={setLightboxSlotIdx}
          />
        </div>

        <StoriaMediaLightboxDialog
          milestone={active}
          selectedSlotIdx={lightboxSlotIdx}
          prefersReducedMotion={prefersReducedMotion}
          onSelectSlot={setLightboxSlotIdx}
          onClose={() => setLightboxSlotIdx(null)}
        />
      </div>
    </div>
  );
}

/**
 * LAYOUT 04 — Right Meridian
 * Right-aligned monumental headline linked by a single hairline to a sweeping right arc.
 */
export function StoriaRightMeridianLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = 2160;
  const cy = 240;
  const radius = 920;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/480] md:block">
        <svg
          viewBox="0 0 1400 480"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-hidden"
        >
          <circle cx={cx} cy={cy} r={radius} className="storia-arc-hairline" />
          <line x1={1020} y1={cy} x2={1125} y2={cy} className="storia-plumb-hairline" />
        </svg>

        <div className="pointer-events-none absolute inset-y-0 left-8 right-[30%] flex flex-col items-end justify-center gap-3 text-right">
          <p className="font-sans text-sm font-light uppercase tracking-widest text-purple-200/70">
            {active.venueMeta} • {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 lg:text-base">
            {active.subtitle}
          </p>
          <div className="pointer-events-auto pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>

        {milestones.map((m, idx) => {
          const offset = getCyclicOffset(idx, activeIdx, total);
          const isVisible = Math.abs(offset) <= 2;
          const isActive = offset === 0;
          const angleDeg = offset * 7.2;
          const rad = (angleDeg * Math.PI) / 180;
          const svgX = cx - radius * Math.cos(rad);
          const svgY = cy + radius * Math.sin(rad);
          const nodeOpacity = !isVisible
            ? 0
            : isActive
              ? 1
              : Math.abs(offset) === 1
                ? 0.68
                : 0.36;

          return (
            <button
              key={m.id}
              type="button"
              tabIndex={isVisible ? 0 : -1}
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-rot": `${-angleDeg}deg`,
                  "--storia-opacity": nodeOpacity,
                } as React.CSSProperties
              }
              className={`storia-right-edge-pin group absolute top-0 left-0 flex items-center gap-3 text-right focus-visible:outline-none ${
                isVisible ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
              }`}
            >
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-xl font-semibold text-white lg:text-2xl"
                    : "text-base font-light text-purple-200/75 group-hover:text-white"
                }`}
              >
                {m.year}
              </span>
              <span
                aria-hidden="true"
                className={`block size-2.5 shrink-0 rounded-full ${
                  isActive
                    ? "bg-white ring-4 ring-purple-200/25"
                    : "bg-purple-200/50 group-hover:bg-white"
                }`}
              />
            </button>
          );
        })}
      </div>

      <StoriaMobileMinimalFallback
        milestones={milestones}
        activeIdx={activeIdx}
        onSelectIdx={onSelectIdx}
        isDossierOpen={isDossierOpen}
        onToggleDossier={onToggleDossier}
      />
    </div>
  );
}

/**
 * LAYOUT 05 — Open Halo
 * Centered whisper-thin circular halo with 8 perimeter years & open typography across the ring.
 */
export function StoriaOpenHaloLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = 700;
  const cy = 260;
  const radius = 218;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/520] md:block">
        <svg
          viewBox="0 0 1400 520"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle cx={cx} cy={cy} r={radius} className="storia-arc-hairline" />
          <line
            x1={cx}
            y1={cy - radius + 16}
            x2={cx}
            y2={cy - radius + 54}
            className="storia-plumb-hairline"
          />
        </svg>

        {milestones.map((m, idx) => {
          const offset = getCyclicOffset(idx, activeIdx, total);
          const isActive = offset === 0;
          const thetaDeg = offset * (360 / total);
          const rad = (thetaDeg * Math.PI) / 180;
          const labelR = radius + 28;
          const svgX = cx + labelR * Math.sin(rad);
          const svgY = cy - labelR * Math.cos(rad);

          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-opacity": isActive ? 1 : 0.55,
                } as React.CSSProperties
              }
              className="storia-center-pin group absolute top-0 left-0 cursor-pointer px-2 py-1 font-sans tabular-nums hover:opacity-100 focus-visible:outline-none"
            >
              <span
                className={
                  isActive
                    ? "text-lg font-semibold text-white lg:text-xl"
                    : "text-sm font-light text-purple-200/80 group-hover:text-white"
                }
              >
                {m.year}
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-12 text-center">
          <p className="font-sans text-xl font-light tabular-nums text-purple-200/75 lg:text-2xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-lg font-sans text-sm text-purple-100/80">
            {active.subtitle}
          </p>
          <div className="pointer-events-auto pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>
      </div>

      <StoriaMobileMinimalFallback
        milestones={milestones}
        activeIdx={activeIdx}
        onSelectIdx={onSelectIdx}
        isDossierOpen={isDossierOpen}
        onToggleDossier={onToggleDossier}
      />
    </div>
  );
}
