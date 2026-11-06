/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
import {
  STORIA_LAYOUTS,
  type StoriaLayoutDef,
  type StoriaMilestone,
} from "./storiaData";

export interface StoriaLayoutSwitcherProps {
  activeLayoutIdx: number;
  onSelectLayout: (idx: number) => void;
}

export function StoriaLayoutSwitcher({
  activeLayoutIdx,
  onSelectLayout,
}: StoriaLayoutSwitcherProps) {
  const current: StoriaLayoutDef =
    STORIA_LAYOUTS[activeLayoutIdx] ?? STORIA_LAYOUTS[0];

  const handleStep = (delta: number) => {
    const total = STORIA_LAYOUTS.length;
    const next = (activeLayoutIdx + delta + total) % total;
    onSelectLayout(next);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 sm:px-8">
      <div className="storia-switcher-dock flex items-center gap-2 rounded-[var(--radius-box)] px-3 py-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          aria-label="Previous Storia layout"
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-purple-200/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div
          role="tablist"
          aria-label="30 Storia inspired layout variations"
          className="grid grid-cols-6 gap-1 sm:grid-cols-10 md:grid-cols-15"
        >
          {STORIA_LAYOUTS.map((layout) => {
            const isActive = layout.index === activeLayoutIdx;
            return (
              <button
                key={layout.code}
                type="button"
                role="tab"
                title={`${layout.code} — ${layout.name}`}
                aria-selected={isActive}
                aria-label={`Layout ${layout.code}: ${layout.name}`}
                onClick={() => onSelectLayout(layout.index)}
                className={`inline-flex h-7 w-9 cursor-pointer items-center justify-center rounded-full font-sans text-xs font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
                  isActive
                    ? "bg-white text-purple-950 shadow-sm"
                    : "text-purple-200/80 hover:bg-white/12 hover:text-white"
                }`}
              >
                {layout.code}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleStep(1)}
          aria-label="Next Storia layout"
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-purple-200/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <p className="text-center font-sans text-xs sm:text-sm text-purple-200/80">
        <span className="font-semibold text-white">
          Layout {current.code} / 30 — {current.name}:
        </span>{" "}
        {current.tagline}
      </p>
    </div>
  );
}

export interface StoriaRulerScrubberProps {
  milestones: readonly StoriaMilestone[];
  activeIdx: number;
  onSelectIdx: (idx: number) => void;
  onScrubIdx?: (idx: number) => void;
  variant?: "centered" | "column";
}

export function StoriaRulerScrubber({
  milestones,
  activeIdx,
  onSelectIdx,
  onScrubIdx,
  variant = "centered",
}: StoriaRulerScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const startClientXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const total = milestones.length;
  const activeMilestone = milestones[activeIdx] ?? milestones[0];
  const firstYear = milestones[0]?.year ?? "1985";
  const lastYear = milestones[total - 1]?.year ?? "2026";
  const isColumnVariant = variant === "column";

  const babyCx = 250;
  const babyCy = 780;
  const babyRadius = 746;

  const scrubFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || total <= 1) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clamped = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const nextIdx = Math.round(clamped * (total - 1));
    if (nextIdx !== activeIdx) {
      if (onScrubIdx) {
        onScrubIdx(nextIdx);
      } else {
        onSelectIdx(nextIdx);
      }
    }
  };

  const handlePrev = () => {
    onSelectIdx((activeIdx - 1 + total) % total);
  };

  const handleNext = () => {
    onSelectIdx((activeIdx + 1) % total);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "Home") {
      e.preventDefault();
      onSelectIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSelectIdx(total - 1);
    }
  };

  return (
    <div
      data-storia-scrubber
      className={
        isColumnVariant
          ? "flex w-full max-w-lg flex-col gap-1"
          : "mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-1 px-4"
      }
    >
      {/* Subtle Top Range & Step Header */}
      <div className="flex w-full items-center justify-between px-1 font-sans text-xs font-light uppercase tracking-widest text-purple-200/70">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous historical milestone"
          className="inline-flex cursor-pointer items-center gap-1.5 tabular-nums text-purple-200/75 transition-colors hover:text-white focus-visible:outline-none"
        >
          <ArrowLeft className="size-3" />
          <span>{firstYear}</span>
        </button>
        <span className="text-purple-200/50">Drag Timeline</span>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next historical milestone"
          className="inline-flex cursor-pointer items-center gap-1.5 tabular-nums text-purple-200/75 transition-colors hover:text-white focus-visible:outline-none"
        >
          <span>{lastYear}</span>
          <ArrowRight className="size-3" />
        </button>
      </div>

      {/* Baby Meridian Arc Wheel — Miniature Horizontal Sibling of the Main Meridian Wheel */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="7th Heaven historical year scrubber"
        aria-valuemin={milestones[0]?.yearNum ?? 1985}
        aria-valuemax={milestones[total - 1]?.yearNum ?? 2026}
        aria-valuenow={activeMilestone.yearNum}
        aria-valuetext={`${activeMilestone.year} — ${activeMilestone.title}`}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => {
          isDraggingRef.current = true;
          pointerMovedRef.current = false;
          startClientXRef.current = e.clientX;
          setIsDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current) return;
          if (Math.abs(e.clientX - startClientXRef.current) > 4) {
            pointerMovedRef.current = true;
          }
          if (pointerMovedRef.current) {
            scrubFromClientX(e.clientX);
          }
        }}
        onPointerUp={(e) => {
          if (!isDraggingRef.current) return;
          isDraggingRef.current = false;
          setIsDragging(false);
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        onPointerCancel={() => {
          isDraggingRef.current = false;
          setIsDragging(false);
        }}
        className="@container relative aspect-[500/110] w-full cursor-grab overflow-hidden select-none touch-none active:cursor-grabbing focus-visible:outline-none"
      >
        <svg
          viewBox="0 0 500 110"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle
            cx={babyCx}
            cy={babyCy}
            r={babyRadius}
            className="storia-arc-hairline-bright"
          />
          <line
            x1={babyCx}
            y1={10}
            x2={babyCx}
            y2={23}
            className="storia-plumb-hairline"
          />
        </svg>

        {milestones.map((m, idx) => {
          const offset = idx - activeIdx;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 3;
          const isActive = offset === 0;
          const clampedOffset = Math.max(-4, Math.min(4, offset));
          const angleFromTopDeg = clampedOffset * 5.8;
          const rad = ((-90 + angleFromTopDeg) * Math.PI) / 180;
          const svgX = babyCx + babyRadius * Math.cos(rad);
          const svgY = babyCy + babyRadius * Math.sin(rad);
          const nodeOpacity = !isVisible
            ? 0
            : isActive
              ? 1
              : absOffset === 1
                ? 0.86
                : absOffset === 2
                  ? 0.64
                  : 0.38;

          return (
            <button
              key={m.id}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              data-dragging={isDragging ? "true" : "false"}
              onClick={() => {
                if (!pointerMovedRef.current) {
                  onSelectIdx(idx);
                }
              }}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-rot": `${angleFromTopDeg.toFixed(2)}deg`,
                  "--storia-opacity": nodeOpacity,
                } as React.CSSProperties
              }
              className={`storia-baby-meridian-pin group absolute top-0 left-0 flex flex-col items-center gap-1.5 focus-visible:outline-none ${
                isVisible ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
              }`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "size-3 bg-white ring-6 ring-purple-200/25"
                      : absOffset === 1
                        ? "size-2 bg-purple-200/65 group-hover:scale-110 group-hover:bg-white"
                        : absOffset === 2
                          ? "size-1.5 bg-purple-200/50 group-hover:scale-110 group-hover:bg-white"
                          : "size-1.5 bg-purple-200/35 group-hover:scale-110 group-hover:bg-white"
                  }`}
                />
              </span>
              <span
                className={`font-sans tabular-nums leading-none tracking-tight transition-colors ${
                  isActive
                    ? "text-xl font-bold text-white sm:text-2xl"
                    : absOffset === 1
                      ? "text-xs font-light text-purple-100/85 group-hover:text-white sm:text-sm"
                      : absOffset === 2
                        ? "text-xs font-light text-purple-200/65 group-hover:text-white"
                        : "text-xs font-light text-purple-200/45 group-hover:text-white"
                }`}
              >
                {m.year}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface StoriaMediaFrameProps {
  milestone: StoriaMilestone;
  prefersReducedMotion: boolean;
  aspectClass?: string;
  showCaption?: boolean;
}

export function StoriaMediaFrame({
  milestone,
  prefersReducedMotion,
  aspectClass = "aspect-video",
  showCaption = true,
}: StoriaMediaFrameProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[var(--radius-box)] bg-purple-950/60 ${aspectClass}`}
    >
      {milestone.videoSrc && !prefersReducedMotion ? (
        <video
          key={milestone.videoSrc}
          src={milestone.videoSrc}
          poster={milestone.imageSrc}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
      ) : (
        <img
          src={milestone.imageSrc}
          alt={milestone.imageAlt}
          loading="lazy"
          className="size-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
      />
      {showCaption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-white">
            {milestone.venueMeta}
          </span>
          <span className="font-sans text-xs font-medium tabular-nums text-purple-200/90">
            {milestone.statMeta}
          </span>
        </div>
      )}
    </div>
  );
}

export interface StoriaEraDossierProps {
  milestone: StoriaMilestone;
  isOpen: boolean;
  onClose: () => void;
  onExploreArchive: () => void;
  prefersReducedMotion: boolean;
}

export function StoriaEraDossier({
  milestone,
  isOpen,
  onClose,
  onExploreArchive,
  prefersReducedMotion,
}: StoriaEraDossierProps) {
  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label={`${milestone.year} ${milestone.title} archival story`}
      className="storia-dossier-contain mx-auto w-full max-w-5xl border-t border-purple-200/15 px-4 pt-8 sm:px-8"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StoriaMediaFrame
            milestone={milestone}
            prefersReducedMotion={prefersReducedMotion}
            aspectClass="aspect-video"
          />
        </div>

        <div className="flex flex-col items-start gap-4 text-left lg:col-span-5">
          <div className="flex w-full items-center justify-between gap-4">
            <span className="font-sans text-sm font-semibold tabular-nums text-purple-300">
              {milestone.year} • {milestone.themeLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close era story"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-purple-200/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              <X className="size-4" />
            </button>
          </div>

          <h3 className="font-heading text-2xl uppercase tracking-tight text-white sm:text-3xl">
            {milestone.title}
          </h3>

          <p className="font-sans text-sm leading-relaxed text-purple-100/90 sm:text-base">
            {milestone.story}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <SeventhButton onClick={onExploreArchive}>
              Open 70-Title Vault
            </SeventhButton>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-sans text-xs font-semibold uppercase tracking-wider text-purple-200/80 transition-colors hover:text-white"
            >
              Collapse Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
