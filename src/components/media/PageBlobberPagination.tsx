"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import gsap from "gsap";
import {
  registerSyncedVideo,
  snapFollowerToGroupLeader,
} from "@/lib/videoFrameSync";
import type { GooeyPaginationSlideMeta } from "./GooeyPagination";

export type PageBlobberVariant = "smoked-pill" | "smoked-xl";

export interface PageBlobberPaginationProps {
  readonly slides: readonly GooeyPaginationSlideMeta[];
  readonly currentSlide: number;
  readonly hoveredSlotIdx: number | null;
  readonly onHoverSlot: (idx: number | null) => void;
  readonly onSelectSlide: (idx: number) => void;
  readonly onScrubSlide?: (idx: number) => void;
  readonly isPlaying?: boolean;
  readonly prefersReducedMotion?: boolean;
  readonly variant?: PageBlobberVariant;
  readonly align?: "center" | "start";
}

const DRAG_THRESHOLD_PX = 4;

// Official 7th Heaven 351 guitar-pick cubic Bezier contour (from GuitarPickIcon.tsx),
// normalized around optical center (x / 11.2, (y + 14.2) / 13.0) with rounded tip pointing down.
const PICK_HALF_W = 11.2;
const PICK_HALF_H = 13.0;
const PICK_OPTICAL_CENTER_Y = -14.2;

interface PickPointUV {
  readonly u: number;
  readonly v: number;
}

interface PickCubicSegmentUV {
  readonly cp1: PickPointUV;
  readonly cp2: PickPointUV;
  readonly end: PickPointUV;
}

function toPickUV(rawX: number, rawY: number): PickPointUV {
  return {
    u: rawX / PICK_HALF_W,
    v: (rawY - PICK_OPTICAL_CENTER_Y) / PICK_HALF_H,
  };
}

const PICK_START_UV: PickPointUV = toPickUV(0, 0);

const PICK_SEGMENTS_UV: readonly PickCubicSegmentUV[] = [
  // 1. Bottom tip -> lower-left flank
  { cp1: toPickUV(-1.6, 0), cp2: toPickUV(-2.6, -1.3), end: toPickUV(-4.0, -3.5) },
  // 2. Lower-left flank -> broad left shoulder
  { cp1: toPickUV(-7.2, -8.3), cp2: toPickUV(-10.6, -12.9), end: toPickUV(-11.1, -17.1) },
  // 3. Broad left shoulder -> convex top crown
  { cp1: toPickUV(-11.6, -21.9), cp2: toPickUV(-8.6, -26.0), end: toPickUV(0.0, -26.0) },
  // 4. Convex top crown -> broad right shoulder
  { cp1: toPickUV(8.6, -26.0), cp2: toPickUV(11.6, -21.9), end: toPickUV(11.1, -17.1) },
  // 5. Broad right shoulder -> lower-right flank
  { cp1: toPickUV(10.6, -12.9), cp2: toPickUV(7.2, -8.3), end: toPickUV(4.0, -3.5) },
  // 6. Lower-right flank -> bottom tip
  { cp1: toPickUV(2.6, -1.3), cp2: toPickUV(1.6, 0), end: toPickUV(0, 0) },
];

interface BlobPhysicsState {
  leadX: number;
  leadV: number;
  trailX: number;
  trailV: number;
  tiltX: number;
  tiltV: number;
  pullY: number;
  pullYV: number;
  squish: number;
  squishV: number;
  prevAbsSpan: number;
  idlePhase: number;
  wavePhase: number;
  waveAlpha: number;
  initialized: boolean;
}

interface StageGeometry {
  slotCentersX: number[];
  centerY: number;
  slotWidth: number;
  pillHeight: number;
  baseRx: number;
  baseRy: number;
}

interface DragGestureState {
  active: boolean;
  pointerId: number;
  startClientX: number;
  grabOffsetX: number;
  grabOffsetY: number;
  dragged: boolean;
  lastScrubIdx: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Builds the 7th Heaven 351 guitar-pick cubic Bezier contour with two-pole elastic
 * taffy stretching when pulled between slots, trailing-edge taper, plectrum-tip swing,
 * 2D pointer tug bending, and arrival spring rebound — settling into a crisp symmetric
 * guitar pick at rest.
 */
function buildPulledGuitarPickPath(
  leadX: number,
  trailX: number,
  centerY: number,
  baseRx: number,
  baseRy: number,
  tiltX: number,
  leadV: number,
  pullY: number,
  squish: number,
  idlePhase: number,
  wobbleIntensity: number,
  verticalOffset = 0
): string {
  const midX = (leadX + trailX) * 0.5;
  const span = leadX - trailX;
  const absHalfSpan = Math.abs(span) * 0.5;

  // Signed smooth pull signal (> 0 pulling right, < 0 pulling left, 0 at rest)
  const signedStretch = clamp(span / Math.max(1, baseRx * 1.32), -1.45, 1.45);
  const velStretch = clamp(leadV / 720, -0.42, 0.42);
  const pullSignal = clamp(signedStretch + velStretch * 0.45, -1.5, 1.5);
  const absPull = Math.abs(pullSignal);

  // Subtle symmetric breathing pulse so resting silhouette stays unmistakably a guitar pick
  const breath = 1 + wobbleIntensity * 0.012 * Math.sin(idlePhase);

  // Volume conservation: horizontal stretch thins vertical height; arrival snap rebounds via squish
  const clampedSquish = clamp(squish, -0.18, 0.24);
  const globalRx = baseRx * breath * (1 - clampedSquish * 0.52);
  const globalRy =
    baseRy *
    breath *
    (1 - Math.min(1.2, absPull) * 0.22) *
    (1 + clampedSquish * 0.84);

  const warpPoint = (pt: PickPointUV): { x: number; y: number } => {
    const { u, v } = pt;
    const uClamped = clamp(u, -1.1, 1.1);

    // Smooth monotonic two-pole spine between trailing and leading edges
    const spineX =
      midX + absHalfSpan * uClamped * (1.14 - 0.14 * uClamped * uClamped);

    // Alignment with pull direction (> 0 on leading shoulder/edge, < 0 on trailing edge)
    const dirU = uClamped * pullSignal;
    const noseAlign = absPull > 0.001 ? clamp(dirU / absPull, -1, 1) : 0;
    const noseFactor = 0.5 + 0.5 * noseAlign;

    // Pulled leading shoulder extension + tapered trailing flank
    const pullRadiusX =
      globalRx *
      (1 + 0.28 * Math.max(0, dirU) - 0.14 * Math.max(0, -dirU));

    // Teardrop taper + taffy waist pinch during transit while preserving pointed bottom tip
    const teardropTaper = clamp(1 + 0.24 * dirU, 0.64, 1.22);
    const waistWeight = Math.max(0, 1 - 0.45 * v * v);
    const waistPinch = 1 - 0.26 * Math.min(1.2, absPull) * waistWeight;
    const localRy = globalRy * teardropTaper * waistPinch;

    // Upper crown leans into travel direction while lower pick tip trails dynamically
    const shearX = (0.38 - 0.72 * v) * tiltX;

    // 2D vertical tug bends the pulled leading edge toward pointer Y
    const localPullY = pullY * (0.22 + 0.78 * noseFactor * noseFactor);

    return {
      x: spineX + u * pullRadiusX + shearX,
      y: centerY + verticalOffset + localPullY + v * localRy,
    };
  };

  const start = warpPoint(PICK_START_UV);
  const cmds: string[] = [`M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`];

  for (let i = 0; i < PICK_SEGMENTS_UV.length; i += 1) {
    const seg = PICK_SEGMENTS_UV[i];
    const c1 = warpPoint(seg.cp1);
    const c2 = warpPoint(seg.cp2);
    const end = warpPoint(seg.end);
    cmds.push(
      `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
    );
  }

  cmds.push("Z");
  return cmds.join(" ");
}

/**
 * Compact mini soundwave rendered inside the lower protruding dome of the video blob when playing.
 */
function buildMiniBlobSoundwavePath(
  cx: number,
  cy: number,
  halfWidth: number,
  amplitude: number,
  phase: number
): string {
  const samples = 14;
  const xStart = cx - halfWidth;
  const span = halfWidth * 2;
  const pts: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= samples; i += 1) {
    const u = i / samples;
    const x = xStart + u * span;
    const env = Math.sin(Math.PI * u);
    const wave =
      0.8 * Math.sin(u * Math.PI * 3.6 - phase) +
      0.24 * Math.sin(u * Math.PI * 6.0 + phase * 0.7);
    const y = cy - env * amplitude * wave;
    pts.push({ x, y });
  }

  const cmds: string[] = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];
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

export function PageBlobberPagination({
  slides,
  currentSlide,
  hoveredSlotIdx,
  onHoverSlot,
  onSelectSlide,
  onScrubSlide,
  isPlaying = false,
  prefersReducedMotion = false,
  variant = "smoked-pill",
  align = "center",
}: PageBlobberPaginationProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `page-blobber-clip-${rawId}`;
  const shadowFilterId = `page-blobber-shadow-${rawId}`;

  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const blobMediaLayerRef = useRef<HTMLDivElement>(null);
  const thumbViewportRef = useRef<HTMLDivElement>(null);
  const thumbVideoRef = useRef<HTMLVideoElement>(null);
  const blobGrabHandleRef = useRef<HTMLDivElement>(null);

  const slotBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inactiveTextRefs = useRef<(SVGTextElement | null)[]>([]);
  const activeTextRefs = useRef<(SVGTextElement | null)[]>([]);

  const blobShadowPathRef = useRef<SVGPathElement>(null);
  const blobClipPathRef = useRef<SVGPathElement>(null);
  const blobWavePathRef = useRef<SVGPathElement>(null);

  const currentSlideRef = useRef<number>(currentSlide);
  const hoveredIdxRef = useRef<number | null>(hoveredSlotIdx);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const prevTickSecRef = useRef<number | null>(null);
  const dragTargetXRef = useRef<number | null>(null);
  const dragTargetYOffsetRef = useRef<number>(0);
  const suppressButtonClickRef = useRef<boolean>(false);

  const blobDragRef = useRef<DragGestureState>({
    active: false,
    pointerId: -1,
    startClientX: 0,
    grabOffsetX: 0,
    grabOffsetY: 0,
    dragged: false,
    lastScrubIdx: currentSlide,
  });

  const trackDragRef = useRef<DragGestureState>({
    active: false,
    pointerId: -1,
    startClientX: 0,
    grabOffsetX: 0,
    grabOffsetY: 0,
    dragged: false,
    lastScrubIdx: currentSlide,
  });

  const geometryRef = useRef<StageGeometry>({
    slotCentersX: [],
    centerY: 42,
    slotWidth: 56,
    pillHeight: 48,
    baseRx: 32,
    baseRy: 37,
  });

  const physicsRef = useRef<BlobPhysicsState>({
    leadX: 0,
    leadV: 0,
    trailX: 0,
    trailV: 0,
    tiltX: 0,
    tiltV: 0,
    pullY: 0,
    pullYV: 0,
    squish: 0,
    squishV: 0,
    prevAbsSpan: 0,
    idlePhase: 0.4,
    wavePhase: 0.35,
    waveAlpha: isPlaying ? 0.94 : 0,
    initialized: false,
  });

  const safeSlideIdx = clamp(currentSlide, 0, Math.max(0, slides.length - 1));
  const activeMediaSlide = slides[safeSlideIdx] ?? slides[0];

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  useEffect(() => {
    hoveredIdxRef.current = hoveredSlotIdx;
  }, [hoveredSlotIdx]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Drive and frame-sync the looping video thumbnail inside the active blob
  // so it plays the exact same frame at the same time as the matching video card / hero
  useEffect(() => {
    const videoEl = thumbVideoRef.current;
    if (!videoEl) return;

    const nextSrc = activeMediaSlide?.previewVideoSrc;
    videoEl.dataset.reducedMotion = prefersReducedMotion ? "true" : "false";

    if (prefersReducedMotion || !nextSrc) {
      videoEl.dataset.ready = "false";
      videoEl.pause();
      return;
    }

    const srcChanged = videoEl.getAttribute("data-src") !== nextSrc;
    if (srcChanged) {
      videoEl.dataset.ready = "false";
      videoEl.setAttribute("data-src", nextSrc);
      videoEl.src = nextSrc;
    }

    const unregister = registerSyncedVideo(videoEl, nextSrc, "blob");
    snapFollowerToGroupLeader(videoEl, nextSrc);

    if (videoEl.readyState >= 2 && !videoEl.seeking) {
      videoEl.dataset.ready = "true";
    }

    videoEl.play().catch(() => {});

    return unregister;
  }, [activeMediaSlide?.previewVideoSrc, prefersReducedMotion]);

  const findNearestSlotIndex = useCallback((stageX: number): number => {
    const centers = geometryRef.current.slotCentersX;
    if (centers.length === 0) return 0;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < centers.length; i += 1) {
      const dist = Math.abs(centers[i] - stageX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, []);

  const commitScrubSlide = useCallback(
    (targetIdx: number) => {
      if (targetIdx < 0 || targetIdx >= slides.length) return;
      if (targetIdx === currentSlideRef.current) return;
      currentSlideRef.current = targetIdx;
      if (onScrubSlide) {
        onScrubSlide(targetIdx);
      } else {
        onSelectSlide(targetIdx);
      }
    },
    [onScrubSlide, onSelectSlide, slides.length]
  );

  const measureGeometry = useCallback(() => {
    const stageEl = stageRef.current;
    const pillEl = pillRef.current;
    if (!stageEl || !pillEl) return false;

    const pillLeft = pillEl.offsetLeft;
    const pillTop = pillEl.offsetTop;
    const pillHeight = Math.max(36, pillEl.offsetHeight);
    const centerY = pillTop + pillHeight * 0.5;

    const centers: number[] = [];
    let measuredSlotWidth = 56;

    for (let i = 0; i < slides.length; i += 1) {
      const btn = slotBtnRefs.current[i];
      if (!btn) continue;
      if (i === 0) {
        measuredSlotWidth = Math.max(28, btn.offsetWidth);
      }
      const cx = pillLeft + btn.offsetLeft + btn.offsetWidth * 0.5;
      centers.push(cx);

      const cxStr = cx.toFixed(2);
      const cyStr = centerY.toFixed(2);
      inactiveTextRefs.current[i]?.setAttribute("x", cxStr);
      inactiveTextRefs.current[i]?.setAttribute("y", cyStr);
      activeTextRefs.current[i]?.setAttribute("x", cxStr);
      activeTextRefs.current[i]?.setAttribute("y", cyStr);
    }

    if (centers.length === 0) return false;

    // Authentic 351 guitar-pick proportions (~69x80px on desktop, ~43x52px on mobile)
    // protruding cleanly above & below the smoked-glass capsule without covering adjacent numbers
    const baseRx = Math.max(21, measuredSlotWidth * 0.62);
    const baseRy = Math.max(26, pillHeight * 0.84);

    geometryRef.current = {
      slotCentersX: centers,
      centerY,
      slotWidth: measuredSlotWidth,
      pillHeight,
      baseRx,
      baseRy,
    };

    const p = physicsRef.current;
    const clampedIdx = clamp(currentSlideRef.current, 0, centers.length - 1);
    const targetX = centers[clampedIdx] ?? centers[0];

    if (!p.initialized) {
      p.leadX = targetX;
      p.trailX = targetX;
      p.leadV = 0;
      p.trailV = 0;
      p.tiltX = 0;
      p.tiltV = 0;
      p.pullY = 0;
      p.pullYV = 0;
      p.squish = 0;
      p.squishV = 0;
      p.prevAbsSpan = 0;
      p.initialized = true;
    }

    return true;
  }, [slides.length]);

  const paintBlobDom = useCallback(() => {
    const geom = geometryRef.current;
    const p = physicsRef.current;
    if (!p.initialized || geom.slotCentersX.length === 0) return;

    const isDraggingNow = dragTargetXRef.current !== null;
    const wobbleScale = prefersReducedMotion
      ? 0.4
      : isDraggingNow
        ? 1.15
        : isPlayingRef.current
          ? 1.2
          : 1.0;

    const mainPath = buildPulledGuitarPickPath(
      p.leadX,
      p.trailX,
      geom.centerY,
      geom.baseRx,
      geom.baseRy,
      p.tiltX,
      p.leadV,
      p.pullY,
      p.squish,
      p.idlePhase,
      wobbleScale,
      0
    );

    const shadowPath = buildPulledGuitarPickPath(
      p.leadX,
      p.trailX,
      geom.centerY,
      geom.baseRx * 0.98,
      geom.baseRy * 0.98,
      p.tiltX * 0.85,
      p.leadV,
      p.pullY * 0.9,
      p.squish,
      p.idlePhase,
      wobbleScale,
      6
    );

    // 1. Clip & position the live 4-second video thumbnail viewport to the morphing pulled contour
    if (blobMediaLayerRef.current) {
      blobMediaLayerRef.current.style.setProperty(
        "--blob-clip-path",
        `path("${mainPath}")`
      );
    }

    if (thumbViewportRef.current) {
      const stretchRatio = Math.min(
        1.5,
        Math.abs(p.leadX - p.trailX) / Math.max(1, geom.baseRx)
      );
      const padX =
        geom.baseRx * (1.08 + 0.34 * stretchRatio) + Math.abs(p.tiltX);
      const padY = geom.baseRy * 1.08 + Math.abs(p.pullY);
      const minX = Math.min(p.leadX, p.trailX) - padX;
      const maxX = Math.max(p.leadX, p.trailX) + padX;
      const minY = geom.centerY - padY;
      const maxY = geom.centerY + padY;
      gsap.set(thumbViewportRef.current, {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        force3D: true,
      });
    }

    // 2. Position the dedicated blob grab handle directly over the pulled leading lobe
    if (blobGrabHandleRef.current) {
      const handleCenterX = p.leadX * 0.65 + p.trailX * 0.35;
      const handleW = geom.baseRx * 2.15;
      const handleH = geom.baseRy * 2.15;
      gsap.set(blobGrabHandleRef.current, {
        x: handleCenterX - handleW * 0.5,
        y: geom.centerY + p.pullY * 0.6 - handleH * 0.5,
        width: handleW,
        height: handleH,
        force3D: true,
      });
    }

    // 3. Update soft neutral drop shadow and numeral clipPath (borderless organic video droplet)
    if (blobShadowPathRef.current) {
      blobShadowPathRef.current.setAttribute("d", shadowPath);
      blobShadowPathRef.current.setAttribute("fill", "rgba(0, 0, 0, 0.58)");
    }
    if (blobClipPathRef.current) {
      blobClipPathRef.current.setAttribute("d", mainPath);
    }

    if (blobWavePathRef.current) {
      blobWavePathRef.current.setAttribute("opacity", p.waveAlpha.toFixed(3));
      if (p.waveAlpha > 0.015) {
        const waveX = p.leadX * 0.6 + p.trailX * 0.4 + p.tiltX * 0.08;
        const waveY = geom.centerY + p.pullY * 0.5 + geom.baseRy * 0.44;
        const waveHalfW = Math.max(6.5, geom.baseRx * 0.27);
        const waveAmp = prefersReducedMotion ? 1.7 : 2.25;
        blobWavePathRef.current.setAttribute(
          "d",
          buildMiniBlobSoundwavePath(waveX, waveY, waveHalfW, waveAmp, p.wavePhase)
        );
      }
    }
  }, [prefersReducedMotion]);

  const stepPhysics = useCallback(
    (timeSec: number) => {
      const geom = geometryRef.current;
      const p = physicsRef.current;
      if (!p.initialized || geom.slotCentersX.length === 0) return;

      const rawDt =
        prevTickSecRef.current === null
          ? 1 / 60
          : timeSec - prevTickSecRef.current;
      prevTickSecRef.current = timeSec;
      const dt = clamp(rawDt, 0.001, 0.05);

      const activeIdx = clamp(
        currentSlideRef.current,
        0,
        geom.slotCentersX.length - 1
      );
      const activeCenterX =
        geom.slotCentersX[activeIdx] ?? geom.slotCentersX[0];
      const dragX = dragTargetXRef.current;
      const isDraggingNow = dragX !== null;

      let leadTargetX = activeCenterX;
      let trailTargetX = activeCenterX;
      let targetPullY = 0;

      if (isDraggingNow) {
        leadTargetX = dragX;
        // Surface-tension anchor: trailing tail clings strongly toward the active slot center
        // while pulled, then snaps free like stretched taffy as you cross into the next slot
        trailTargetX = activeCenterX * 0.78 + dragX * 0.22;
        targetPullY = dragTargetYOffsetRef.current;
      } else {
        const hIdx = hoveredIdxRef.current;
        if (
          !prefersReducedMotion &&
          hIdx !== null &&
          hIdx !== activeIdx &&
          hIdx >= 0 &&
          hIdx < geom.slotCentersX.length
        ) {
          const hoverX = geom.slotCentersX[hIdx];
          const delta = hoverX - activeCenterX;
          // Leading edge reaches toward hovered page while trailing anchor holds active slot
          leadTargetX += Math.sign(delta) * Math.min(16, Math.abs(delta) * 0.26);
          trailTargetX += Math.sign(delta) * Math.min(2, Math.abs(delta) * 0.03);
        }
      }

      if (prefersReducedMotion) {
        p.leadX = activeCenterX;
        p.trailX = activeCenterX;
        p.leadV = 0;
        p.trailV = 0;
        p.tiltX = 0;
        p.tiltV = 0;
        p.pullY = 0;
        p.pullYV = 0;
        p.squish = 0;
        p.squishV = 0;
        p.prevAbsSpan = 0;
        p.waveAlpha = isPlayingRef.current ? 0.94 : 0;
        paintBlobDom();
        return;
      }

      const subSteps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / subSteps;
      const maxSpan = geom.slotWidth * 2.05;

      // Snappy pulled front nose vs viscous lagging tail so movement visibly stretches the SVG
      const leadK = isDraggingNow ? 880 : 470;
      const leadC = isDraggingNow ? 41 : 23.5;
      const trailK = isDraggingNow ? 145 : 115;
      const trailC = isDraggingNow ? 19 : 16.5;

      for (let s = 0; s < subSteps; s += 1) {
        const accLead = (leadTargetX - p.leadX) * leadK - p.leadV * leadC;
        p.leadV += accLead * h;
        p.leadX += p.leadV * h;

        const accTrail = (trailTargetX - p.trailX) * trailK - p.trailV * trailC;
        p.trailV += accTrail * h;
        p.trailX += p.trailV * h;

        const span = p.leadX - p.trailX;
        if (Math.abs(span) > maxSpan) {
          p.trailX = p.leadX - Math.sign(span) * maxSpan;
          p.trailV = p.leadV * 0.72;
        }

        const absSpanNow = Math.abs(p.leadX - p.trailX);
        const spanCollapseRate = (p.prevAbsSpan - absSpanNow) / h;
        p.prevAbsSpan = absSpanNow;

        // Arrival recoil: collapsing horizontal stretch pumps a crisp vertical Jell-O bounce
        const recoilDrive =
          spanCollapseRate > 18
            ? Math.min(2.6, spanCollapseRate * 0.0038)
            : 0;
        const accSquish =
          recoilDrive - p.squish * 310 - p.squishV * 14.5;
        p.squishV += accSquish * h;
        p.squish += p.squishV * h;

        const desiredTilt = clamp(
          p.leadV * 0.022 + (p.leadX - p.trailX) * 0.16,
          -geom.baseRx * 0.48,
          geom.baseRx * 0.48
        );
        const accTilt = (desiredTilt - p.tiltX) * 260 - p.tiltV * 14;
        p.tiltV += accTilt * h;
        p.tiltX += p.tiltV * h;

        const accPullY = (targetPullY - p.pullY) * 420 - p.pullYV * 26;
        p.pullYV += accPullY * h;
        p.pullY += p.pullYV * h;
      }

      p.idlePhase += dt * (isPlayingRef.current ? 3.2 : 1.35);

      const targetWaveAlpha = isPlayingRef.current ? 0.94 : 0;
      p.waveAlpha += (targetWaveAlpha - p.waveAlpha) * Math.min(1, dt * 12);
      if (isPlayingRef.current) {
        p.wavePhase += dt * 15.5;
      }

      paintBlobDom();
    },
    [paintBlobDom, prefersReducedMotion]
  );

  // Sync immediate reduced-motion updates when slide/variant/playing changes
  useEffect(() => {
    if (prefersReducedMotion && measureGeometry()) {
      stepPhysics(performance.now() * 0.001);
    }
  }, [
    currentSlide,
    isPlaying,
    variant,
    prefersReducedMotion,
    measureGeometry,
    stepPhysics,
  ]);

  // Mount-scoped ResizeObserver & 60fps GSAP ticker
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    if (measureGeometry()) {
      paintBlobDom();
    }

    const onTick = () => {
      if (document.hidden) return;
      stepPhysics(performance.now() * 0.001);
    };
    gsap.ticker.add(onTick);

    const ro = new ResizeObserver(() => {
      const prevInitialized = physicsRef.current.initialized;
      physicsRef.current.initialized = false;
      if (measureGeometry()) {
        if (!prevInitialized) {
          physicsRef.current.initialized = true;
        }
        paintBlobDom();
      }
    });
    ro.observe(stageEl);

    return () => {
      gsap.ticker.remove(onTick);
      ro.disconnect();
    };
  }, [measureGeometry, paintBlobDom, stepPhysics]);

  const clampDragStageX = (rawStageX: number): number => {
    const centers = geometryRef.current.slotCentersX;
    if (centers.length === 0) return rawStageX;
    const minX = centers[0] - 10;
    const maxX = centers[centers.length - 1] + 10;
    return clamp(rawStageX, minX, maxX);
  };

  // ── Dedicated Protruding Blob Handle Drag / Tap Handlers ──
  const handleBlobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !stageRef.current) return;
    e.stopPropagation();

    const rect = stageRef.current.getBoundingClientRect();
    const pointerStageX = e.clientX - rect.left;
    const pointerStageY = e.clientY - rect.top;
    const currentBlobX =
      physicsRef.current.leadX * 0.65 + physicsRef.current.trailX * 0.35;

    blobDragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      grabOffsetX: pointerStageX - currentBlobX,
      grabOffsetY: pointerStageY - geometryRef.current.centerY,
      dragged: false,
      lastScrubIdx: currentSlideRef.current,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer events without active hardware pointerId degrade gracefully
    }
    e.currentTarget.dataset.dragging = "true";
  };

  const handleBlobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = blobDragRef.current;
    if (
      !state.active ||
      e.pointerId !== state.pointerId ||
      !stageRef.current
    ) {
      return;
    }

    if (!state.dragged) {
      if (Math.abs(e.clientX - state.startClientX) < DRAG_THRESHOLD_PX) {
        return;
      }
      state.dragged = true;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const pointerStageX = e.clientX - rect.left;
    const pointerStageY = e.clientY - rect.top;
    const nextX = clampDragStageX(pointerStageX - state.grabOffsetX);
    dragTargetXRef.current = nextX;
    dragTargetYOffsetRef.current = clamp(
      (pointerStageY - geometryRef.current.centerY - state.grabOffsetY) * 0.45,
      -12,
      12
    );

    const nearestIdx = findNearestSlotIndex(nextX);
    onHoverSlot(nearestIdx);
    if (nearestIdx !== state.lastScrubIdx) {
      state.lastScrubIdx = nearestIdx;
      commitScrubSlide(nearestIdx);
    }
  };

  const finishBlobDrag = (
    el: HTMLDivElement,
    triggerTapIfUndragged: boolean
  ) => {
    const state = blobDragRef.current;
    if (!state.active) return;
    const wasDragged = state.dragged;
    state.active = false;
    state.dragged = false;
    dragTargetXRef.current = null;
    dragTargetYOffsetRef.current = 0;
    el.dataset.dragging = "false";
    onHoverSlot(null);

    if (!wasDragged && triggerTapIfUndragged) {
      onSelectSlide(currentSlideRef.current);
    }
  };

  const handleBlobKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      commitScrubSlide(Math.max(0, currentSlideRef.current - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      commitScrubSlide(
        Math.min(slides.length - 1, currentSlideRef.current + 1)
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      e.stopPropagation();
      commitScrubSlide(0);
    } else if (e.key === "End") {
      e.preventDefault();
      e.stopPropagation();
      commitScrubSlide(slides.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onSelectSlide(currentSlideRef.current);
    }
  };

  // ── Pill Track Drag-Scrub Handlers (allows dragging from anywhere on the pill too) ──
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    trackDragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      grabOffsetX: 0,
      grabOffsetY: e.clientY - rect.top - geometryRef.current.centerY,
      dragged: false,
      lastScrubIdx: currentSlideRef.current,
    };
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = trackDragRef.current;
    if (!state.active || !stageRef.current) return;

    if (!state.dragged) {
      if (Math.abs(e.clientX - state.startClientX) < DRAG_THRESHOLD_PX) {
        return;
      }
      state.dragged = true;
      suppressButtonClickRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointer events without active hardware pointerId degrade gracefully
      }
      e.currentTarget.dataset.dragging = "true";
    }

    if (e.pointerId !== state.pointerId) return;

    const rect = stageRef.current.getBoundingClientRect();
    const nextX = clampDragStageX(e.clientX - rect.left);
    const pointerStageY = e.clientY - rect.top;
    dragTargetXRef.current = nextX;
    dragTargetYOffsetRef.current = clamp(
      (pointerStageY - geometryRef.current.centerY - state.grabOffsetY) * 0.45,
      -12,
      12
    );

    const nearestIdx = findNearestSlotIndex(nextX);
    onHoverSlot(nearestIdx);
    if (nearestIdx !== state.lastScrubIdx) {
      state.lastScrubIdx = nearestIdx;
      commitScrubSlide(nearestIdx);
    }
  };

  const finishTrackDrag = (el: HTMLDivElement) => {
    const state = trackDragRef.current;
    if (!state.active) return;
    const wasDragged = state.dragged;
    state.active = false;
    state.dragged = false;
    dragTargetXRef.current = null;
    dragTargetYOffsetRef.current = 0;
    el.dataset.dragging = "false";

    if (wasDragged) {
      onHoverSlot(null);
      window.setTimeout(() => {
        suppressButtonClickRef.current = false;
      }, 0);
    }
  };

  const slotSizeClass =
    variant === "smoked-xl"
      ? "h-12 w-9 sm:h-14 sm:w-16"
      : "h-10 w-7 sm:h-12 sm:w-14";

  const textSizeClass =
    variant === "smoked-xl"
      ? "text-sm sm:text-lg"
      : "text-sm sm:text-base";

  const stagePaddingClass =
    align === "start" ? "px-0 pt-4 pb-4" : "px-2 py-6 sm:px-4";

  return (
    <div
      ref={stageRef}
      className={`relative inline-flex items-center ${stagePaddingClass}`}
    >
      {/* LAYER 1: Smoked Obsidian Frosted Glass Capsule Track */}
      <div
        ref={pillRef}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={(e) => finishTrackDrag(e.currentTarget)}
        onPointerCancel={(e) => finishTrackDrag(e.currentTarget)}
        onLostPointerCapture={(e) => finishTrackDrag(e.currentTarget)}
        className="page-blobber-pill-smoked page-blobber-drag-handle relative z-10 flex items-center rounded-full px-2 sm:px-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white/40"
      >
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const displayNum = idx + 1;
          return (
            <button
              key={slide.id}
              ref={(el) => {
                slotBtnRefs.current[idx] = el;
              }}
              type="button"
              data-audio-control=""
              onClick={() => {
                if (suppressButtonClickRef.current) return;
                onSelectSlide(idx);
              }}
              onPointerEnter={() => {
                if (dragTargetXRef.current === null) onHoverSlot(idx);
              }}
              onPointerLeave={() => {
                if (dragTargetXRef.current === null) onHoverSlot(null);
              }}
              onFocus={() => onHoverSlot(idx)}
              onBlur={() => onHoverSlot(null)}
              aria-label={`Go to video ${displayNum} of ${slides.length}: ${
                slide.title
              }${slide.videoType ? ` (${slide.videoType})` : ""}`}
              aria-current={isActive ? "true" : undefined}
              className={`page-blobber-drag-handle relative z-10 flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none ${slotSizeClass}`}
            />
          );
        })}
      </div>

      {/* LAYER 2 (Back SVG): Inactive Numerals on Smoked Pill + Colored Ambient Glow Under Blob */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-15 size-full overflow-visible"
      >
        <defs>
          <filter
            id={shadowFilterId}
            x="-60%"
            y="-60%"
            width="220%"
            height="240%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>

        <g>
          {slides.map((slide, idx) => (
            <text
              key={`inactive-${slide.id}`}
              ref={(el) => {
                inactiveTextRefs.current[idx] = el;
              }}
              textAnchor="middle"
              dominantBaseline="central"
              className={`fill-white/60 font-sans ${textSizeClass} font-medium tabular-nums select-none`}
            >
              {idx + 1}
            </text>
          ))}
        </g>

        <path
          ref={blobShadowPathRef}
          filter={`url(#${shadowFilterId})`}
        />
      </svg>

      {/* LAYER 3: Live Video Thumbnail Clipped Directly to Morphing Organic Blob Contour */}
      <div
        ref={blobMediaLayerRef}
        aria-hidden="true"
        className="page-blobber-video-clip pointer-events-none absolute inset-0 z-20 overflow-visible"
      >
        <div
          ref={thumbViewportRef}
          className="absolute top-0 left-0 size-0 overflow-hidden bg-zinc-950"
        >
          {activeMediaSlide?.coverSrc && (
            <img
              src={activeMediaSlide.coverSrc}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <video
            ref={thumbVideoRef}
            poster={activeMediaSlide?.coverSrc}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              snapFollowerToGroupLeader(
                e.currentTarget,
                activeMediaSlide?.previewVideoSrc
              );
            }}
            onLoadedData={(e) => {
              snapFollowerToGroupLeader(
                e.currentTarget,
                activeMediaSlide?.previewVideoSrc
              );
              if (!e.currentTarget.seeking) {
                e.currentTarget.dataset.ready = "true";
              }
            }}
            onCanPlay={(e) => {
              if (!e.currentTarget.seeking) {
                e.currentTarget.dataset.ready = "true";
              }
            }}
            onPlaying={(e) => {
              if (!e.currentTarget.seeking) {
                e.currentTarget.dataset.ready = "true";
              }
            }}
            onSeeked={(e) => {
              if (e.currentTarget.readyState >= 2) {
                e.currentTarget.dataset.ready = "true";
              }
            }}
            className="absolute inset-0 size-full scale-110 object-cover opacity-0 transition-opacity duration-150 data-[ready=true]:opacity-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/65" />
        </div>
      </div>

      {/* LAYER 4 (Front SVG): Borderless Clipped Crisp White Numerals & Soundwave */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 size-full overflow-visible"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path ref={blobClipPathRef} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {slides.map((slide, idx) => (
            <text
              key={`active-${slide.id}`}
              ref={(el) => {
                activeTextRefs.current[idx] = el;
              }}
              textAnchor="middle"
              dominantBaseline="central"
              className={`page-blobber-numeral-shadow fill-white font-sans ${textSizeClass} font-bold tabular-nums select-none`}
            >
              {idx + 1}
            </text>
          ))}
          <path
            ref={blobWavePathRef}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0"
            className="page-blobber-numeral-shadow text-white"
          />
        </g>
      </svg>

      {/* LAYER 5: Dedicated Draggable Handle Covering Entire Protruding Video Blob */}
      <div
        ref={blobGrabHandleRef}
        role="slider"
        tabIndex={0}
        data-audio-control=""
        aria-label="Active video preview blob — drag left or right or use arrow keys to scrub videos"
        aria-valuemin={1}
        aria-valuemax={slides.length}
        aria-valuenow={safeSlideIdx + 1}
        aria-valuetext={`${safeSlideIdx + 1} of ${slides.length}: ${
          activeMediaSlide?.title ?? ""
        }`}
        onPointerDown={handleBlobPointerDown}
        onPointerMove={handleBlobPointerMove}
        onPointerUp={(e) => finishBlobDrag(e.currentTarget, true)}
        onPointerCancel={(e) => finishBlobDrag(e.currentTarget, false)}
        onLostPointerCapture={(e) => finishBlobDrag(e.currentTarget, false)}
        onPointerEnter={() => {
          if (dragTargetXRef.current === null) onHoverSlot(safeSlideIdx);
        }}
        onPointerLeave={() => {
          if (dragTargetXRef.current === null) onHoverSlot(null);
        }}
        onKeyDown={handleBlobKeyDown}
        className="page-blobber-drag-handle absolute top-0 left-0 z-40 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      />
    </div>
  );
}
