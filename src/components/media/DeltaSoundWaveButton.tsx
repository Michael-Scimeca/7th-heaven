"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";

export interface DeltaSoundWaveButtonProps {
  isMuted: boolean;
  isPlaying?: boolean;
  effectiveVolume?: number;
  onToggleMute: () => void;
  size?: "md" | "sm";
  className?: string;
}

const VIEWBOX_WIDTH = 64;
const VIEWBOX_HEIGHT = 32;
const CENTER_Y = VIEWBOX_HEIGHT / 2;
const START_X = 2.5;
const END_X = VIEWBOX_WIDTH - 2.5;
const SPAN_X = END_X - START_X;
const SAMPLE_COUNT = 48;
const TWO_PI = Math.PI * 2;

export function buildDeltaWavePath(phase: number, amplitude: number): string {
  const ptsX = new Array<number>(SAMPLE_COUNT + 1);
  const ptsY = new Array<number>(SAMPLE_COUNT + 1);

  for (let i = 0; i <= SAMPLE_COUNT; i += 1) {
    const u = i / SAMPLE_COUNT;
    const x = START_X + u * SPAN_X;

    // Wide raised-sine envelope keeps outer crests tall while tapering both tips smoothly
    const envelope = Math.pow(Math.sin(Math.PI * u), 0.72);

    // Multi-harmonic traveling sound wave (~4.5 deep crests & valleys + organic modulation)
    const primary = Math.sin(TWO_PI * 4.35 * u - phase);
    const harmonic2 = Math.sin(TWO_PI * 7.15 * u - phase * 1.42 + 0.85);
    const swell = Math.cos(TWO_PI * 2.25 * u + phase * 0.62);

    const composite = 0.7 * primary + 0.2 * harmonic2 + 0.14 * swell;
    const y = Math.max(
      1.8,
      Math.min(
        VIEWBOX_HEIGHT - 1.8,
        CENTER_Y - amplitude * envelope * composite
      )
    );

    ptsX[i] = x;
    ptsY[i] = y;
  }

  // Catmull-Rom to C1-continuous cubic Bezier spline
  const commands: string[] = [`M ${ptsX[0].toFixed(2)} ${ptsY[0].toFixed(2)}`];

  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const x0 = ptsX[Math.max(0, i - 1)];
    const y0 = ptsY[Math.max(0, i - 1)];
    const x1 = ptsX[i];
    const y1 = ptsY[i];
    const x2 = ptsX[i + 1];
    const y2 = ptsY[i + 1];
    const x3 = ptsX[Math.min(SAMPLE_COUNT, i + 2)];
    const y3 = ptsY[Math.min(SAMPLE_COUNT, i + 2)];

    const cp1x = x1 + (x2 - x0) / 6;
    const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6;
    const cp2y = y2 - (y3 - y1) / 6;

    commands.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`
    );
  }

  return commands.join(" ");
}

export const DEFAULT_DELTA_WAVE_PATH = buildDeltaWavePath(0.65, 11.8);

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

export default function DeltaSoundWaveButton({
  isMuted,
  isPlaying = true,
  effectiveVolume = 100,
  onToggleMute,
  size = "md",
  className = "",
}: DeltaSoundWaveButtonProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const phaseRef = useRef(0.65);
  const ampRef = useRef(11.4);
  const stateRef = useRef({
    isSoundActive: false,
    isHovered: false,
    effectiveVolume: 100,
  });

  const [isHovered, setIsHovered] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isSoundActive = !isMuted && isPlaying && effectiveVolume > 0;

  useEffect(() => {
    stateRef.current = {
      isSoundActive,
      isHovered,
      effectiveVolume,
    };
  }, [isSoundActive, isHovered, effectiveVolume]);

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    if (prefersReducedMotion) {
      pathEl.setAttribute("d", DEFAULT_DELTA_WAVE_PATH);
      return;
    }

    const tick = (_time: number, deltaTime: number) => {
      if (document.hidden) return;
      const dt = Math.min(0.05, (deltaTime || 16.67) / 1000);
      const {
        isSoundActive: active,
        isHovered: hovered,
        effectiveVolume: vol,
      } = stateRef.current;

      const targetSpeed = active ? 13.5 : hovered ? 10.4 : 6.6;
      phaseRef.current += dt * targetSpeed;

      const volumeScale = Math.max(0.5, Math.min(1, vol / 100));
      const beatPulse =
        1 +
        0.14 *
          Math.sin(phaseRef.current * 0.46) *
          Math.cos(phaseRef.current * 0.31);

      const targetAmp = active
        ? 14.2 * volumeScale * beatPulse
        : hovered
          ? 12.8
          : 11.2;

      ampRef.current += (targetAmp - ampRef.current) * Math.min(1, dt * 10);

      pathEl.setAttribute(
        "d",
        buildDeltaWavePath(phaseRef.current, ampRef.current)
      );
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [prefersReducedMotion]);

  const dimensionsClass = size === "sm" ? "h-9 w-14" : "h-14 w-20";
  const iconDimensionsClass = size === "sm" ? "h-5 w-10" : "h-8 w-14";

  return (
    <button
      type="button"
      onClick={onToggleMute}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-pressed={!isMuted}
      aria-label={isMuted ? "Play video sound" : "Mute video sound"}
      className={`delta-sound-pill flex ${dimensionsClass} shrink-0 items-center justify-center rounded-full border border-white/5 backdrop-blur-md transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 cursor-pointer ${
        isMuted
          ? "text-amber-50/90 hover:text-amber-50"
          : "text-amber-50 ring-1 ring-amber-200/40"
      } ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        fill="none"
        className={`${iconDimensionsClass} pointer-events-none`}
      >
        <path
          ref={pathRef}
          d={DEFAULT_DELTA_WAVE_PATH}
          stroke="currentColor"
          strokeWidth="2.05"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
