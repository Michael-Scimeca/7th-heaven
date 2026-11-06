"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import gsap from "gsap";
import { PageBlobberPagination } from "./PageBlobberPagination";

export interface GooeyPaginationSlideMeta {
  readonly id: string;
  readonly title: string;
  readonly videoType?: string;
  readonly subtitle?: string;
  readonly duration?: string;
  readonly previewVideoSrc?: string;
  readonly coverSrc?: string;
}

export type GooeyPaginationSetupId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface GooeyPaginationProps {
  readonly slides: readonly GooeyPaginationSlideMeta[];
  readonly currentSlide: number;
  readonly onSelectSlide: (idx: number) => void;
  readonly onScrubSlide?: (idx: number) => void;
  readonly onTogglePlayCurrent?: () => void;
  readonly isPlaying?: boolean;
  readonly prefersReducedMotion?: boolean;
  readonly setupId?: GooeyPaginationSetupId;
  readonly ariaLabel?: string;
  readonly align?: "center" | "start";
}

interface PaginationSetupConfig {
  readonly id: GooeyPaginationSetupId;
  readonly code: string;
  readonly label: string;
  readonly summary: string;
  readonly gooStdDeviation: number;
  readonly gooColorMatrix: string;
  readonly waveAmplitudePx: number;
  readonly shoulderOffsetPx: number;
  readonly headBaseScale: number;
  readonly stagePaddingClass: string;
  readonly slotBoxClass: string;
  readonly slotGapClass: string;
  readonly dotSizeClass: string;
  readonly shoulderSizeClass: string;
  readonly headSizeClass: string;
  readonly glyphSizeClass: string;
}

const PAGINATION_SETUPS: readonly PaginationSetupConfig[] = [
  {
    id: 1,
    code: "01",
    label: "Compact Original (10)",
    summary: "Current compact 8px sine-wave droplets & 25px crest",
    gooStdDeviation: 2.7,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -6.5",
    waveAmplitudePx: 4.2,
    shoulderOffsetPx: 6.8,
    headBaseScale: 1.24,
    stagePaddingClass: "px-8 py-4",
    slotBoxClass: "size-6 sm:size-7",
    slotGapClass: "gap-1 sm:gap-2",
    dotSizeClass: "size-2",
    shoulderSizeClass: "size-3",
    headSizeClass: "size-5",
    glyphSizeClass: "h-2.5 w-3.5",
  },
  {
    id: 2,
    code: "02",
    label: "Grand Stage XL",
    summary: "Scaled-up 12px droplets, 40px soundwave orb & Prev/Next controls",
    gooStdDeviation: 4.1,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -7.5",
    waveAmplitudePx: 6.4,
    shoulderOffsetPx: 10.4,
    headBaseScale: 1.24,
    stagePaddingClass: "px-8 py-6",
    slotBoxClass: "size-7 sm:size-10 md:size-12",
    slotGapClass: "gap-1 sm:gap-2",
    dotSizeClass: "size-2.5 sm:size-3",
    shoulderSizeClass: "size-3.5 sm:size-4",
    headSizeClass: "size-6 sm:size-8",
    glyphSizeClass: "h-3.5 w-5 sm:h-4 sm:w-6",
  },
  {
    id: 3,
    code: "03",
    label: "Numbered Chapter Ruler",
    summary: "Large sine-wave crest paired with aligned 01–10 index ticks & step pills",
    gooStdDeviation: 3.9,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -7.5",
    waveAmplitudePx: 5.8,
    shoulderOffsetPx: 10.0,
    headBaseScale: 1.24,
    stagePaddingClass: "px-8 py-6",
    slotBoxClass: "size-7 sm:size-10 md:size-11",
    slotGapClass: "gap-1 sm:gap-2",
    dotSizeClass: "size-2.5 sm:size-3",
    shoulderSizeClass: "size-3.5 sm:size-4",
    headSizeClass: "size-6 sm:size-8",
    glyphSizeClass: "h-3.5 w-5 sm:h-4 sm:w-6",
  },
  {
    id: 4,
    code: "04",
    label: "Wide Split Console",
    summary: "Full-width deck: editorial readout left, large sine-wave center, transport right",
    gooStdDeviation: 3.8,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 23 -7.0",
    waveAmplitudePx: 5.6,
    shoulderOffsetPx: 9.6,
    headBaseScale: 1.24,
    stagePaddingClass: "px-6 py-4",
    slotBoxClass: "size-7 sm:size-9 md:size-10",
    slotGapClass: "gap-1 sm:gap-2",
    dotSizeClass: "size-2.5 sm:size-3",
    shoulderSizeClass: "size-3.5 sm:size-4",
    headSizeClass: "size-6 sm:size-7",
    glyphSizeClass: "h-3.5 w-5",
  },
  {
    id: 5,
    code: "05",
    label: "70-Video Catalog Window",
    summary: "Tapered 11-dot sliding sine-wave window + 01–70 decade range jumpers",
    gooStdDeviation: 3.6,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 23 -7.0",
    waveAmplitudePx: 5.4,
    shoulderOffsetPx: 9.2,
    headBaseScale: 1.24,
    stagePaddingClass: "px-6 py-4",
    slotBoxClass: "size-7 sm:size-9 md:size-10",
    slotGapClass: "gap-1 sm:gap-2",
    dotSizeClass: "size-2.5 sm:size-3",
    shoulderSizeClass: "size-3.5 sm:size-4",
    headSizeClass: "size-6 sm:size-7",
    glyphSizeClass: "h-3.5 w-5",
  },
  {
    id: 6,
    code: "06",
    label: "Giant Equalizer Crest",
    summary: "Maximum 48px soundwave sphere, deep 8px wave & headline display readout",
    gooStdDeviation: 5.0,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -8.0",
    waveAmplitudePx: 8.0,
    shoulderOffsetPx: 13.2,
    headBaseScale: 1.22,
    stagePaddingClass: "px-10 py-6",
    slotBoxClass: "size-8 sm:size-11 md:size-14",
    slotGapClass: "gap-1 sm:gap-2",
    dotSizeClass: "size-3 sm:size-3.5",
    shoulderSizeClass: "size-4 sm:size-5",
    headSizeClass: "size-7 sm:size-9 md:size-10",
    glyphSizeClass: "h-4 w-6 sm:h-5 sm:w-7",
  },
  {
    id: 7,
    code: "07",
    label: "Page Blobber (Smoked Glass)",
    summary:
      "Smoked-obsidian frosted capsule + protruding spring-jelly multi-hue blob & clipped white numerals",
    gooStdDeviation: 3.8,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 23 -7.0",
    waveAmplitudePx: 5.4,
    shoulderOffsetPx: 9.2,
    headBaseScale: 1.24,
    stagePaddingClass: "px-6 py-4",
    slotBoxClass: "size-8 sm:size-12",
    slotGapClass: "gap-0",
    dotSizeClass: "size-2.5",
    shoulderSizeClass: "size-3.5",
    headSizeClass: "size-6",
    glyphSizeClass: "h-3.5 w-5",
  },
  {
    id: 8,
    code: "08",
    label: "Page Blobber XL (Smoked Glass + Arrows)",
    summary:
      "XL smoked-obsidian frosted capsule + protruding stage-violet jelly blob & smoked step arrows",
    gooStdDeviation: 3.8,
    gooColorMatrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 23 -7.0",
    waveAmplitudePx: 5.4,
    shoulderOffsetPx: 9.2,
    headBaseScale: 1.24,
    stagePaddingClass: "px-6 py-4",
    slotBoxClass: "size-8 sm:size-12",
    slotGapClass: "gap-0",
    dotSizeClass: "size-2.5",
    shoulderSizeClass: "size-3.5",
    headSizeClass: "size-6",
    glyphSizeClass: "h-3.5 w-5",
  },
];

const SHOULDER_SEGMENTS = [0, 1] as const;
const WAVE_SPATIAL_FREQ = 0.9;
const CATALOG_TOTAL_COUNT = 70;
const CATALOG_WINDOW_SIZE = 11;
const CATALOG_DECADES = [0, 10, 20, 30, 40, 50, 60] as const;

const GLYPH_VIEWBOX_W = 24;
const GLYPH_VIEWBOX_H = 14;
const GLYPH_CENTER_Y = GLYPH_VIEWBOX_H / 2;
const GLYPH_X_START = 2.2;
const GLYPH_X_END = GLYPH_VIEWBOX_W - 2.2;
const GLYPH_SAMPLES = 20;

interface WaveMotionState {
  headX: number;
}

interface DisplaySlotItem {
  readonly slotKey: string;
  readonly virtualIndex: number;
  readonly baseSlideIndex: number;
  readonly slide: GooeyPaginationSlideMeta;
  readonly edgeScaleLevel: 0 | 1 | 2;
}

function sampleWaveY(
  itemPos: number,
  phase: number,
  amplitudePx: number
): number {
  return Math.sin(itemPos * WAVE_SPATIAL_FREQ - phase) * amplitudePx;
}

/**
 * Generates a smooth Catmull-Rom cubic Bezier soundwave path for the active dot glyph.
 */
function buildCrestWaveGlyphPath(phase: number, amplitude: number): string {
  const span = GLYPH_X_END - GLYPH_X_START;
  const pts: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= GLYPH_SAMPLES; i += 1) {
    const u = i / GLYPH_SAMPLES;
    const x = GLYPH_X_START + u * span;
    const envelope = Math.sin(Math.PI * u);
    const wave =
      0.78 * Math.sin(u * Math.PI * 3.4 - phase) +
      0.26 * Math.sin(u * Math.PI * 5.8 + phase * 0.68);
    const y = GLYPH_CENTER_Y - envelope * amplitude * wave;
    pts.push({ x, y });
  }

  if (pts.length === 0) return "";
  const cmds: string[] = [
    `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`,
  ];

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    cmds.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }

  return cmds.join(" ");
}

const RESTING_CREST_WAVE_PATH = buildCrestWaveGlyphPath(0.35, 3.0);
const REDUCED_ACTIVE_CREST_WAVE_PATH = buildCrestWaveGlyphPath(0.65, 4.4);

/**
 * Floating Sine-Soundwave Gooey Pagination (adapted from Lucas Bebber's
 * https://codepen.io/lbebber/pen/QWrLBE) with live Bigger Pagination Setup explorer:
 * - #01 preserves the exact compact layout
 * - #02–#06 showcase scaled-up stage, numbered ruler, wide split console,
 *   70-video sliding window, and giant equalizer crest setups.
 */
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function GooeyPagination({
  slides,
  currentSlide,
  onSelectSlide,
  onScrubSlide,
  onTogglePlayCurrent,
  isPlaying = false,
  prefersReducedMotion: prefersReducedMotionProp,
  setupId = 7,
  ariaLabel = "Featured videos",
  align = "center",
}: GooeyPaginationProps) {
  const systemReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const prefersReducedMotion = prefersReducedMotionProp ?? systemReducedMotion;
  const rawId = useId();
  const filterId = `gooey-sine-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [catalogDecade, setCatalogDecade] = useState<number>(0);
  const [hoveredSlotIdx, setHoveredSlotIdx] = useState<number | null>(null);

  const setup =
    PAGINATION_SETUPS.find((item) => item.id === setupId) ??
    PAGINATION_SETUPS[6];
  const isCatalogWindowMode = setup.id === 5;
  const isPageBlobberMode = setup.id === 7 || setup.id === 8;

  const safeSlideCount = Math.max(1, slides.length);
  const totalPages = isCatalogWindowMode ? CATALOG_TOTAL_COUNT : safeSlideCount;
  const activeVirtualIndex = isCatalogWindowMode
    ? Math.min(CATALOG_TOTAL_COUNT - 1, catalogDecade + currentSlide)
    : currentSlide;

  // Build visible droplet slots (10 direct slots normally, or an 11-dot tapered sliding window for 70 items)
  const { displaySlots, activeSlotIndex } = useMemo(() => {
    if (!isCatalogWindowMode) {
      const directSlots: DisplaySlotItem[] = slides.map((slide, idx) => ({
        slotKey: slide.id,
        virtualIndex: idx,
        baseSlideIndex: idx,
        slide,
        edgeScaleLevel: 2,
      }));
      return {
        displaySlots: directSlots,
        activeSlotIndex: Math.max(0, Math.min(directSlots.length - 1, currentSlide)),
      };
    }

    const windowSize = Math.min(CATALOG_WINDOW_SIZE, CATALOG_TOTAL_COUNT);
    const halfWindow = Math.floor(windowSize / 2);
    const windowStart = Math.max(
      0,
      Math.min(CATALOG_TOTAL_COUNT - windowSize, activeVirtualIndex - halfWindow)
    );
    const hasHiddenLeft = windowStart > 0;
    const hasHiddenRight = windowStart + windowSize < CATALOG_TOTAL_COUNT;

    const windowed: DisplaySlotItem[] = [];
    for (let slot = 0; slot < windowSize; slot += 1) {
      const vIdx = windowStart + slot;
      const baseIdx = vIdx % safeSlideCount;
      const baseSlide = slides[baseIdx] ?? slides[0];
      let edgeScaleLevel: 0 | 1 | 2 = 2;

      if (hasHiddenLeft && slot === 0) edgeScaleLevel = 0;
      else if (hasHiddenLeft && slot === 1) edgeScaleLevel = 1;
      else if (hasHiddenRight && slot === windowSize - 1) edgeScaleLevel = 0;
      else if (hasHiddenRight && slot === windowSize - 2) edgeScaleLevel = 1;

      windowed.push({
        slotKey: `win-slot-${slot}`,
        virtualIndex: vIdx,
        baseSlideIndex: baseIdx,
        slide: baseSlide,
        edgeScaleLevel,
      });
    }

    return {
      displaySlots: windowed,
      activeSlotIndex: Math.max(
        0,
        Math.min(windowSize - 1, activeVirtualIndex - windowStart)
      ),
    };
  }, [activeVirtualIndex, currentSlide, isCatalogWindowMode, safeSlideCount, slides]);

  const rootRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  const hitSlotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gooDotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shoulderBlobRefs = useRef<(HTMLDivElement | null)[]>([]);

  const headBlobRef = useRef<HTMLDivElement>(null);
  const waveGlyphWrapRef = useRef<HTMLDivElement>(null);
  const waveGlyphPathRef = useRef<SVGPathElement>(null);

  const isPlayingRef = useRef<boolean>(isPlaying);
  const setupRef = useRef<PaginationSetupConfig>(setup);
  const slotCountRef = useRef<number>(displaySlots.length);
  const glyphPhaseRef = useRef<number>(0.35);
  const glyphAmpRef = useRef<number>(isPlaying ? 4.6 : 3.0);
  const glyphSpeedRef = useRef<number>(isPlaying ? 16.5 : 0);
  const prevFrameTimeSecRef = useRef<number | null>(null);

  const motionStateRef = useRef<WaveMotionState>({ headX: 0 });
  const metricsRef = useRef<{ startPos: number; spacing: number }>({
    startPos: 0,
    spacing: 36,
  });

  const lastItemRef = useRef<number>(0);
  const lastItemRRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);
  const activeIndexRef = useRef<number>(activeSlotIndex);
  const directTargetRef = useRef<{ idx: number; expiresAt: number } | null>(
    null
  );

  useEffect(() => {
    setupRef.current = setup;
    slotCountRef.current = displaySlots.length;
  }, [displaySlots.length, setup]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (prefersReducedMotion && waveGlyphPathRef.current) {
      waveGlyphPathRef.current.setAttribute(
        "d",
        isPlaying ? REDUCED_ACTIVE_CREST_WAVE_PATH : RESTING_CREST_WAVE_PATH
      );
    }
  }, [isPlaying, prefersReducedMotion]);

  const measureSlots = useCallback(() => {
    const first = hitSlotRefs.current[0];
    const second = hitSlotRefs.current[1];
    if (!first) return false;
    const startPos = first.offsetLeft;
    const spacing = second
      ? Math.max(1, second.offsetLeft - first.offsetLeft)
      : first.offsetWidth + 8;
    metricsRef.current = { startPos, spacing };
    return true;
  }, []);

  const applyFrame = useCallback(
    (timeSec: number) => {
      const { startPos, spacing } = metricsRef.current;
      if (spacing <= 0) return { curItem: 0, curItemR: 0 };

      const currentSetup = setupRef.current;
      const visibleCount = slotCountRef.current;

      const rawDt =
        prevFrameTimeSecRef.current === null
          ? 1 / 60
          : timeSec - prevFrameTimeSecRef.current;
      prevFrameTimeSecRef.current = timeSec;
      const dt = Math.max(0, Math.min(0.05, rawDt));

      const activePlaying = isPlayingRef.current && !prefersReducedMotion;
      const targetGlyphSpeed = activePlaying ? 16.5 : 0;
      glyphSpeedRef.current +=
        (targetGlyphSpeed - glyphSpeedRef.current) * Math.min(1, dt * 10);
      glyphPhaseRef.current += dt * glyphSpeedRef.current;

      const beatPulse =
        1 +
        0.18 *
          Math.sin(glyphPhaseRef.current * 0.52) *
          Math.cos(glyphPhaseRef.current * 0.33);
      const targetGlyphAmp = activePlaying ? 4.65 * beatPulse : 3.0;
      glyphAmpRef.current +=
        (targetGlyphAmp - glyphAmpRef.current) * Math.min(1, dt * 11);

      const halfSpacing = spacing / 2;
      const headX = motionStateRef.current.headX;
      const pos = headX - startPos;
      let pinch = ((pos % spacing) + spacing) % spacing;
      if (pinch > halfSpacing) {
        pinch = halfSpacing - (pinch - halfSpacing);
      }
      const pinchRatio = pinch / halfSpacing;
      const curItem = pos / spacing;
      const curItemR = Math.round(curItem);
      const phase = prefersReducedMotion ? 0.65 : timeSec * 3.1;
      const waveAmp = currentSetup.waveAmplitudePx;

      // 1. Undulate visible track droplets along the traveling sine wave
      for (let i = 0; i < visibleCount; i += 1) {
        const dot = gooDotRefs.current[i];
        if (dot) {
          gsap.set(dot, {
            y: sampleWaveY(i, phase, waveAmp),
            force3D: true,
          });
        }
      }

      // 2. Surf active crest sphere + flanking liquid meniscus shoulders along the wave
      const crestY = sampleWaveY(curItem, phase, waveAmp);
      const leftSlopeY = sampleWaveY(curItem - 0.25, phase, waveAmp);
      const rightSlopeY = sampleWaveY(curItem + 0.25, phase, waveAmp);
      const playingPulse = activePlaying
        ? 1 + 0.045 * Math.sin(glyphPhaseRef.current * 0.65)
        : 1;
      const headScale =
        (1 - pinchRatio * 0.26) * currentSetup.headBaseScale * playingPulse;

      if (headBlobRef.current) {
        gsap.set(headBlobRef.current, {
          x: headX,
          y: crestY,
          scale: headScale,
          force3D: true,
        });
      }

      for (let s = 0; s < SHOULDER_SEGMENTS.length; s += 1) {
        const shEl = shoulderBlobRefs.current[s];
        if (!shEl) continue;
        const dir = s === 0 ? -1 : 1;
        gsap.set(shEl, {
          x: headX + dir * currentSetup.shoulderOffsetPx,
          y: dir < 0 ? leftSlopeY : rightSlopeY,
          scale: 0.82,
          force3D: true,
        });
      }

      // 3. Position & animate crisp unfiltered inner soundwave glyph
      if (waveGlyphWrapRef.current) {
        const glyphScale = Math.max(0.001, 1 - pinchRatio * 1.25);
        gsap.set(waveGlyphWrapRef.current, {
          x: headX,
          y: crestY,
          scale: glyphScale,
          opacity: glyphScale > 0.08 ? 1 : 0,
          force3D: true,
        });
      }

      if (waveGlyphPathRef.current && !prefersReducedMotion) {
        waveGlyphPathRef.current.setAttribute(
          "d",
          buildCrestWaveGlyphPath(glyphPhaseRef.current, glyphAmpRef.current)
        );
      }

      return { curItem, curItemR };
    },
    [prefersReducedMotion]
  );

  const renderWaveFrame = useCallback(
    (allowBounce: boolean) => {
      const now = performance.now();
      const { curItem, curItemR } = applyFrame(now * 0.001);

      const diff = Math.max(4, now - lastTimeRef.current);
      const deltaTime = diff / (1000 / 60);
      lastTimeRef.current = now;

      if (
        allowBounce &&
        !prefersReducedMotion &&
        lastItemRRef.current !== curItemR
      ) {
        const departedGooDot = gooDotRefs.current[lastItemRRef.current];
        if (departedGooDot) {
          const kick = Math.max(
            -16,
            Math.min(16, 52 * ((curItem - lastItemRef.current) / deltaTime))
          );
          const runRecoil = () => {
            gsap.to(departedGooDot, {
              x: kick,
              duration: 0.1,
              ease: "power1.out",
              overwrite: "auto",
              onComplete: () => {
                gsap.to(departedGooDot, {
                  x: 0,
                  duration: 0.9,
                  ease: "elastic.out(1.1, 0.5)",
                });
              },
            });
          };
          if (gsapCtxRef.current) {
            gsapCtxRef.current.add(runRecoil);
          } else {
            runRecoil();
          }
        }
      }

      lastItemRef.current = curItem;
      lastItemRRef.current = curItemR;
    },
    [applyFrame, prefersReducedMotion]
  );

  const animateToSlotIndex = useCallback(
    (targetSlotIdx: number, immediate = false) => {
      activeIndexRef.current = targetSlotIdx;
      if (setupRef.current.id >= 7) return;
      if (!rootRef.current || !measureSlots()) return;

      const { startPos, spacing } = metricsRef.current;
      const destX = startPos + targetSlotIdx * spacing;
      const state = motionStateRef.current;

      const runGlide = () => {
        if (immediate || !hasInitializedRef.current || prefersReducedMotion) {
          gsap.killTweensOf(state);
          state.headX = destX;
          lastItemRef.current = targetSlotIdx;
          lastItemRRef.current = targetSlotIdx;
          renderWaveFrame(false);
          hasInitializedRef.current = true;
          return;
        }

        lastTimeRef.current = performance.now();

        gsap.to(state, {
          headX: destX,
          duration: 0.6,
          ease: "power4.out",
          overwrite: "auto",
          onUpdate: () => renderWaveFrame(true),
          onComplete: () => renderWaveFrame(false),
        });
      };

      if (gsapCtxRef.current) {
        gsapCtxRef.current.add(runGlide);
      } else {
        runGlide();
      }
    },
    [measureSlots, prefersReducedMotion, renderWaveFrame]
  );

  // Mount-scoped GSAP context, ResizeObserver, & 60fps compositor sine-wave ticker
  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    const ctx = gsap.context(() => {
      if (setupRef.current.id < 7 && measureSlots()) {
        const { startPos, spacing } = metricsRef.current;
        const initX = startPos + activeIndexRef.current * spacing;
        motionStateRef.current.headX = initX;
        lastItemRef.current = activeIndexRef.current;
        lastItemRRef.current = activeIndexRef.current;
        lastTimeRef.current = performance.now();
        renderWaveFrame(false);
        hasInitializedRef.current = true;
      }
    }, rootRef);
    gsapCtxRef.current = ctx;

    const onTick = () => {
      if (document.hidden || prefersReducedMotion || setupRef.current.id >= 7) {
        return;
      }
      applyFrame(performance.now() * 0.001);
    };
    gsap.ticker.add(onTick);

    const ro = new ResizeObserver(() => {
      if (setupRef.current.id >= 7) return;
      animateToSlotIndex(activeIndexRef.current, true);
    });
    ro.observe(rootEl);

    return () => {
      gsap.ticker.remove(onTick);
      ro.disconnect();
      gsap.killTweensOf(motionStateRef.current);
      gsapCtxRef.current = null;
      ctx.revert();
    };
  }, [animateToSlotIndex, applyFrame, measureSlots, prefersReducedMotion, renderWaveFrame]);

  // Re-measure slot geometry immediately whenever switching between setups 01..08
  useEffect(() => {
    if (setupId >= 7) {
      hasInitializedRef.current = false;
      return;
    }
    const rafId = window.requestAnimationFrame(() => {
      animateToSlotIndex(activeSlotIndex, true);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [setupId, displaySlots.length, activeSlotIndex, animateToSlotIndex]);

  // Synchronize external carousel drag / keyboard changes smoothly
  useEffect(() => {
    const pending = directTargetRef.current;
    if (pending) {
      if (performance.now() <= pending.expiresAt) {
        return;
      }
      directTargetRef.current = null;
    }
    if (activeIndexRef.current === activeSlotIndex && hasInitializedRef.current) {
      return;
    }
    animateToSlotIndex(activeSlotIndex);
  }, [activeSlotIndex, animateToSlotIndex]);

  const navigateVirtualIndex = (targetVirtualIdx: number) => {
    const wrapped = ((targetVirtualIdx % totalPages) + totalPages) % totalPages;
    if (isCatalogWindowMode) {
      const nextDecade = Math.floor(wrapped / safeSlideCount) * safeSlideCount;
      const nextBaseIdx = wrapped % safeSlideCount;
      setCatalogDecade(nextDecade);
      if (wrapped === activeVirtualIndex) {
        if (onTogglePlayCurrent) {
          onTogglePlayCurrent();
        } else {
          onSelectSlide(nextBaseIdx);
        }
        return;
      }
      if (nextBaseIdx !== currentSlide) {
        onSelectSlide(nextBaseIdx);
      }
      return;
    }

    directTargetRef.current = {
      idx: wrapped,
      expiresAt: performance.now() + 900,
    };
    animateToSlotIndex(wrapped);
    onSelectSlide(wrapped);
  };

  const handleSlotClick = (slotIdx: number, slotItem: DisplaySlotItem) => {
    if (!isCatalogWindowMode) {
      directTargetRef.current = {
        idx: slotIdx,
        expiresAt: performance.now() + 900,
      };
      animateToSlotIndex(slotIdx);
      onSelectSlide(slotItem.baseSlideIndex);
      return;
    }
    navigateVirtualIndex(slotItem.virtualIndex);
  };

  const handleStepPrev = () => {
    navigateVirtualIndex(activeVirtualIndex - 1);
  };

  const handleStepNext = () => {
    navigateVirtualIndex(activeVirtualIndex + 1);
  };

  const previewSlotIdx =
    hoveredSlotIdx !== null &&
    hoveredSlotIdx >= 0 &&
    hoveredSlotIdx < displaySlots.length
      ? hoveredSlotIdx
      : activeSlotIndex;
  const previewItem =
    displaySlots[previewSlotIdx] ?? displaySlots[activeSlotIndex];
  const previewSlide = previewItem?.slide ?? slides[currentSlide];
  const previewVirtualNumber = (previewItem?.virtualIndex ?? activeVirtualIndex) + 1;

  // Shared Gooey Sine-Wave Stage (used across all 6 setups at each setup's calibrated scale)
  const gooeyWaveStage = (
    <div className="relative flex flex-col items-center">
      {/* SVG Liquid Metaball Filter Tuned to Active Setup Scale */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        aria-hidden="true"
        className="pointer-events-none absolute size-0 overflow-hidden"
      >
        <defs>
          <filter
            id={filterId}
            x="-50%"
            y="-160%"
            width="200%"
            height="420%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={setup.gooStdDeviation}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values={setup.gooColorMatrix}
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative">
        {/* LAYER 1: Pure Liquid Sine-Wave Metaball Shapes */}
        <div
          aria-hidden="true"
          style={
            { "--gooey-filter": `url("#${filterId}")` } as React.CSSProperties
          }
          className={`gooey-pagination-nav pointer-events-none ${setup.stagePaddingClass}`}
        >
          <div className="relative inline-flex items-center">
            {/* Flanking Wave-Shoulder Meniscus Droplets */}
            {SHOULDER_SEGMENTS.map((segIdx) => (
              <div
                key={segIdx}
                ref={(el) => {
                  shoulderBlobRefs.current[segIdx] = el;
                }}
                className={`pointer-events-none absolute top-0 left-0 flex items-center justify-center ${setup.slotBoxClass}`}
              >
                <span
                  className={`gooey-fill-orchid block rounded-full ${setup.shoulderSizeClass}`}
                />
              </div>
            ))}

            {/* Active Surfing Soundwave Crest Sphere */}
            <div
              ref={headBlobRef}
              className={`pointer-events-none absolute top-0 left-0 flex items-center justify-center ${setup.slotBoxClass}`}
            >
              <span
                className={`gooey-fill-orchid block rounded-full ${setup.headSizeClass}`}
              />
            </div>

            {/* Sinusoidal Track Droplet Slots (with automatic edge tapering in 70-page window mode) */}
            <div
              className={`relative z-10 flex items-center ${setup.slotGapClass}`}
            >
              {displaySlots.map((slotItem, idx) => {
                const dotScaleClass =
                  slotItem.edgeScaleLevel === 0
                    ? "size-1.5"
                    : slotItem.edgeScaleLevel === 1
                      ? "size-2"
                      : setup.dotSizeClass;

                return (
                  <div
                    key={slotItem.slotKey}
                    ref={(el) => {
                      gooDotRefs.current[idx] = el;
                    }}
                    className={`flex items-center justify-center ${setup.slotBoxClass}`}
                  >
                    <span
                      className={`gooey-fill-violet block rounded-full transition-all duration-300 ${dotScaleClass}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LAYER 2: Crisp Unfiltered Soundwave Glyph & Accessible Hit Targets */}
        <div
          className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center ${setup.stagePaddingClass}`}
        >
          <div className="relative inline-flex items-center">
            <div
              ref={waveGlyphWrapRef}
              aria-hidden="true"
              className={`gooey-overlay-number pointer-events-none absolute top-0 left-0 flex items-center justify-center text-white ${setup.slotBoxClass}`}
            >
              <svg
                aria-hidden="true"
                viewBox={`0 0 ${GLYPH_VIEWBOX_W} ${GLYPH_VIEWBOX_H}`}
                fill="none"
                className={`pointer-events-none shrink-0 ${setup.glyphSizeClass}`}
              >
                <path
                  ref={waveGlyphPathRef}
                  d={
                    isPlaying
                      ? REDUCED_ACTIVE_CREST_WAVE_PATH
                      : RESTING_CREST_WAVE_PATH
                  }
                  stroke="currentColor"
                  strokeWidth="2.05"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div
              className={`pointer-events-auto flex items-center ${setup.slotGapClass}`}
            >
              {displaySlots.map((slotItem, idx) => {
                const isActive = idx === activeSlotIndex;
                const displayNum = slotItem.virtualIndex + 1;
                return (
                  <button
                    key={slotItem.slotKey}
                    ref={(el) => {
                      hitSlotRefs.current[idx] = el;
                    }}
                    type="button"
                    data-audio-control=""
                    onClick={() => handleSlotClick(idx, slotItem)}
                    onPointerEnter={() => setHoveredSlotIdx(idx)}
                    onPointerLeave={() =>
                      setHoveredSlotIdx((prev) => (prev === idx ? null : prev))
                    }
                    onFocus={() => setHoveredSlotIdx(idx)}
                    onBlur={() =>
                      setHoveredSlotIdx((prev) => (prev === idx ? null : prev))
                    }
                    aria-label={`Go to video ${displayNum} of ${totalPages}: ${
                      slotItem.slide.title
                    }${
                      slotItem.slide.videoType
                        ? ` (${slotItem.slide.videoType})`
                        : ""
                    }`}
                    aria-current={isActive ? "true" : undefined}
                    className={`gooey-hit-btn relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 ${setup.slotBoxClass}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Setup #03 Aligned Tabular Chapter Number Ruler Directly Under Each Sine-Wave Slot */}
      {setup.id === 3 && (
        <div
          aria-hidden="true"
          className={`flex items-center px-8 ${setup.slotGapClass}`}
        >
          {displaySlots.map((slotItem, idx) => {
            const isActive = idx === activeSlotIndex;
            const isHovered = idx === hoveredSlotIdx;
            return (
              <span
                key={slotItem.slotKey}
                className={`flex items-center justify-center font-mono text-xs tabular-nums transition-colors ${
                  setup.slotBoxClass
                } ${
                  isActive
                    ? "font-bold text-white"
                    : isHovered
                      ? "font-semibold text-purple-200"
                      : "text-purple-300/55"
                }`}
              >
                {String(slotItem.virtualIndex + 1).padStart(2, "0")}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  const countDigits = totalPages >= 10 ? 2 : 2;
  const formattedCurrent = String(previewVirtualNumber).padStart(countDigits, "0");
  const formattedTotal = String(totalPages).padStart(countDigits, "0");

  const isStartAligned = align === "start";

  return (
    <div
      ref={rootRef}
      className={`flex flex-col select-none ${
        isStartAligned
          ? "w-fit max-w-full items-start gap-2"
          : "w-full items-center gap-3"
      }`}
    >
      {/* ── SETUP #04: WIDE SPLIT CONSOLE (FULL-WIDTH 3-ZONE PAGINATION DECK) ── */}
      {setup.id === 4 ? (
        <nav
          aria-label={ariaLabel}
          data-dots=""
          className="site-container flex w-full flex-col items-center justify-between gap-4 lg:flex-row"
        >
          {/* Left Zone: Editorial Active/Hovered Readout */}
          {previewSlide && (
            <div
              aria-live="polite"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center lg:items-start lg:text-left"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 font-sans text-xs font-semibold uppercase text-purple-200 lg:justify-start">
                <span className="tabular-nums text-purple-300">
                  {formattedCurrent} / {formattedTotal}
                </span>
                {previewSlide.videoType && (
                  <>
                    <span aria-hidden="true" className="text-purple-400/70">
                      •
                    </span>
                    <span className="text-white">{previewSlide.videoType}</span>
                  </>
                )}
              </div>
              <p className="font-sans text-sm sm:text-base text-purple-200/80 line-clamp-1">
                <span className="font-semibold text-white">
                  {previewSlide.title}
                </span>
                {previewSlide.subtitle ? ` — ${previewSlide.subtitle}` : ""}
              </p>
            </div>
          )}

          {/* Center Zone: Scaled-Up Gooey Sine-Wave Soundwave Crest */}
          <div className="shrink-0">{gooeyWaveStage}</div>

          {/* Right Zone: Duration Readout + Prev / Play-Stop / Next Transport */}
          <div className="flex flex-1 items-center justify-center gap-2 lg:justify-end">
            {previewSlide?.duration && (
              <span className="rounded-full border border-purple-400/25 bg-purple-950/45 px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-purple-100">
                {previewSlide.duration}
              </span>
            )}
            <button
              type="button"
              data-audio-control=""
              onClick={handleStepPrev}
              aria-label="Previous video"
              className="flex size-10 items-center justify-center rounded-full border border-purple-400/30 bg-purple-950/55 text-white hover:border-purple-300/65 hover:bg-purple-800/50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              data-audio-control=""
              onClick={() => {
                if (onTogglePlayCurrent) {
                  onTogglePlayCurrent();
                } else {
                  onSelectSlide(currentSlide);
                }
              }}
              aria-label={
                isPlaying ? "Stop current video" : "Play current video"
              }
              className="flex size-10 items-center justify-center rounded-full border border-purple-400/45 bg-purple-600/70 text-white hover:bg-purple-500/80 transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 translate-x-px" />
              )}
            </button>
            <button
              type="button"
              data-audio-control=""
              onClick={handleStepNext}
              aria-label="Next video"
              className="flex size-10 items-center justify-center rounded-full border border-purple-400/30 bg-purple-950/55 text-white hover:border-purple-300/65 hover:bg-purple-800/50 transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </nav>
      ) : (
        /* ── SETUPS #01–#03, #05–#08: CENTERED STAGE (SINE-WAVE OR PAGE BLOBBER) + CONTROLS + READOUT ── */
        <>
          <nav
            aria-label={ariaLabel}
            data-dots=""
            className={`relative flex flex-col gap-2 ${
              isStartAligned
                ? "w-fit items-start justify-start px-0"
                : "w-full items-center justify-center px-0 sm:px-2"
            }`}
          >
            <div
              className={`flex items-center gap-2 sm:gap-4 ${
                isStartAligned ? "justify-start" : "justify-center"
              }`}
            >
              {/* Left Prev / First Controls on Bigger Setups (#02, #03, #05, #06, #08) */}
              {setup.id === 5 && (
                <button
                  type="button"
                  data-audio-control=""
                  onClick={() => navigateVirtualIndex(0)}
                  disabled={activeVirtualIndex === 0}
                  aria-label="Jump to video 01 of 70"
                  className="hidden sm:inline-flex h-10 items-center gap-1 rounded-full border border-purple-400/25 bg-purple-950/50 px-3 font-mono text-xs font-semibold tabular-nums text-purple-200 hover:border-purple-300/60 hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                >
                  <span>01</span>
                </button>
              )}

              {setup.id === 3 ? (
                <button
                  type="button"
                  data-audio-control=""
                  onClick={handleStepPrev}
                  aria-label="Previous video"
                  className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-950/55 px-4 font-sans text-xs font-semibold uppercase text-purple-100 hover:border-purple-300/65 hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                  <span>Prev</span>
                </button>
              ) : setup.id !== 1 && setup.id !== 7 ? (
                <button
                  type="button"
                  data-audio-control=""
                  onClick={handleStepPrev}
                  aria-label="Previous video"
                  className={`flex items-center justify-center rounded-full text-white transition-colors cursor-pointer ${
                    setup.id === 8
                      ? "page-blobber-pill-smoked size-10 sm:size-12 hover:text-white/90"
                      : `border border-purple-400/30 bg-purple-950/55 hover:border-purple-300/65 hover:bg-purple-800/50 ${
                          setup.id === 6
                            ? "size-11 sm:size-12"
                            : "size-9 sm:size-11"
                        }`
                  }`}
                >
                  <ChevronLeft
                    className={setup.id === 6 ? "size-5" : "size-4"}
                  />
                </button>
              ) : null}

              {isPageBlobberMode ? (
                <PageBlobberPagination
                  slides={slides}
                  currentSlide={currentSlide}
                  hoveredSlotIdx={hoveredSlotIdx}
                  onHoverSlot={setHoveredSlotIdx}
                  onSelectSlide={onSelectSlide}
                  onScrubSlide={onScrubSlide}
                  isPlaying={isPlaying}
                  prefersReducedMotion={prefersReducedMotion}
                  variant={setup.id === 7 ? "smoked-pill" : "smoked-xl"}
                  align={align}
                />
              ) : (
                gooeyWaveStage
              )}

              {/* Right Next / Last Controls on Bigger Setups (#02, #03, #05, #06, #08) */}
              {setup.id === 3 ? (
                <button
                  type="button"
                  data-audio-control=""
                  onClick={handleStepNext}
                  aria-label="Next video"
                  className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-950/55 px-4 font-sans text-xs font-semibold uppercase text-purple-100 hover:border-purple-300/65 hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="size-4" />
                </button>
              ) : setup.id !== 1 && setup.id !== 7 ? (
                <button
                  type="button"
                  data-audio-control=""
                  onClick={handleStepNext}
                  aria-label="Next video"
                  className={`flex items-center justify-center rounded-full text-white transition-colors cursor-pointer ${
                    setup.id === 8
                      ? "page-blobber-pill-smoked size-10 sm:size-12 hover:text-white/90"
                      : `border border-purple-400/30 bg-purple-950/55 hover:border-purple-300/65 hover:bg-purple-800/50 ${
                          setup.id === 6
                            ? "size-11 sm:size-12"
                            : "size-9 sm:size-11"
                        }`
                  }`}
                >
                  <ChevronRight
                    className={setup.id === 6 ? "size-5" : "size-4"}
                  />
                </button>
              ) : null}

              {setup.id === 5 && (
                <button
                  type="button"
                  data-audio-control=""
                  onClick={() => navigateVirtualIndex(CATALOG_TOTAL_COUNT - 1)}
                  disabled={activeVirtualIndex === CATALOG_TOTAL_COUNT - 1}
                  aria-label="Jump to video 70 of 70"
                  className="hidden sm:inline-flex h-10 items-center gap-1 rounded-full border border-purple-400/25 bg-purple-950/50 px-3 font-mono text-xs font-semibold tabular-nums text-purple-200 hover:border-purple-300/60 hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                >
                  <span>70</span>
                </button>
              )}
            </div>

            {/* Setup #05: 70-Title Decade Range Jumpers (01–10 .. 61–70) */}
            {setup.id === 5 && (
              <div
                role="group"
                aria-label="Jump to catalog page group"
                className="flex flex-wrap items-center justify-center gap-1.5"
              >
                {CATALOG_DECADES.map((decadeStart) => {
                  const isCurrentDecade =
                    activeVirtualIndex >= decadeStart &&
                    activeVirtualIndex < decadeStart + 10;
                  const rangeLabel = `${String(decadeStart + 1).padStart(
                    2,
                    "0"
                  )}–${String(decadeStart + 10).padStart(2, "0")}`;

                  return (
                    <button
                      key={decadeStart}
                      type="button"
                      data-audio-control=""
                      onClick={() =>
                        navigateVirtualIndex(decadeStart + currentSlide)
                      }
                      aria-pressed={isCurrentDecade}
                      className={`rounded-full px-3 py-1 font-mono text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                        isCurrentDecade
                          ? "border border-purple-300/70 bg-purple-500/35 text-white"
                          : "border border-white/10 bg-purple-950/35 text-purple-200/75 hover:border-purple-400/40 hover:text-white"
                      }`}
                    >
                      {rangeLabel}
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Dynamic Active / Hovered Video-Type Readout Directly Beneath Sine-Wave Dots */}
          {previewSlide && (
            <div
              aria-live="polite"
              className={`flex flex-col items-center gap-1 text-center ${
                isStartAligned ? "min-w-full max-w-full px-0" : "px-4"
              }`}
            >
              <div
                className={`flex flex-wrap items-center justify-center gap-2 font-sans font-semibold uppercase text-purple-200 ${
                  setup.id === 1 ? "text-xs" : "text-xs sm:text-sm"
                }`}
              >
                <span className="tabular-nums text-purple-300">
                  {formattedCurrent} / {formattedTotal}
                </span>
                {previewSlide.videoType && (
                  <>
                    <span aria-hidden="true" className="text-purple-400/70">
                      •
                    </span>
                    <span className="text-white">{previewSlide.videoType}</span>
                  </>
                )}
                {previewSlide.duration && (
                  <>
                    <span aria-hidden="true" className="text-purple-400/70">
                      •
                    </span>
                    <span className="tabular-nums text-purple-200/85">
                      {previewSlide.duration}
                    </span>
                  </>
                )}
              </div>

              {setup.id === 6 ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="font-heading text-xl sm:text-2xl uppercase text-white">
                    {previewSlide.title}
                  </p>
                  {previewSlide.subtitle && (
                    <p className="font-sans text-sm sm:text-base text-purple-200/80">
                      {previewSlide.subtitle}
                    </p>
                  )}
                </div>
              ) : (
                <p
                  className={`font-sans text-purple-200/75 ${
                    setup.id === 1
                      ? "text-xs sm:text-sm"
                      : "text-sm sm:text-base"
                  }`}
                >
                  <span className="font-semibold text-white/95">
                    {previewSlide.title}
                  </span>
                  {previewSlide.subtitle ? ` — ${previewSlide.subtitle}` : ""}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
