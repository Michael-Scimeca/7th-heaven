/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Color palette presets ────────────────────────────────────────────────────
const COLOR_PRESETS: Record<string, string[]> = {
  Purple: [
    "#a855f7", "#9333ea", "#8b5cf6", "#7e22ce", "#701a75",
    "#6b21a8", "#581c87", "#4c1d95", "#430868", "#3b0764",
    "#350659", "#2e054e", "#280443", "#210338", "#1b022d",
    "#150122", "#0e0117", "#0c011a", "#0a0115", "#080010",
    "#06000c", "#030006",
  ],
  Fire: [
    "#fff7ed", "#fef3c7", "#fde68a", "#fcd34d", "#c084fc",
    "#9333ea", "#7c3aed", "#6b21a8", "#ef4444", "#dc2626",
    "#b91c1c", "#991b1b", "#7f1d1d", "#6b0000", "#4a0000",
  ],
  Ice: [
    "#ecfeff", "#cffafe", "#a5f3fc", "#67e8f9", "#22d3ee",
    "#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63",
    "#0f3549", "#082a3a", "#051e2c", "#03121c", "#010810",
  ],
  Neon: [
    "#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80",
    "#22c55e", "#16a34a", "#a3e635", "#84cc16", "#65a30d",
    "#3d9900", "#facc15", "#eab308", "#ca8a04", "#a16207",
  ],
  Rose: [
    "#fff1f2", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185",
    "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337",
    "#6b0f2b", "#4e0a1d", "#360513", "#1f020b", "#0d0104",
  ],
  Ocean: [
    "#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8",
    "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e",
    "#083450", "#051f33", "#030f1c", "#010709", "#000304",
  ],
  White: Array.from({ length: 22 }, (_, i) => {
    const alpha = Math.round(255 * (1 - i / 22)).toString(16).padStart(2, "0");
    return `#ffffff${alpha}`;
  }),
};

const PRESET_NAMES = [...Object.keys(COLOR_PRESETS), "Custom"];

// ── Default settings ─────────────────────────────────────────────────────────
const DEFAULTS = {
  numCircles: 22,
  circleSize: 24,
  blur: 3,
  glow: 10,
  speed: 0.12,
  opacity: 1,
  palette: "Purple",
  tailScale: 1.0,
  gooey: true,
  gooeyStrength: 8,
};

function interpolateHex(color1: string, color2: string, factor: number): string {
  try {
    const c1 = color1.replace("#", "");
    const c2 = color2.replace("#", "");
    const r1 = parseInt(c1.substring(0, 2), 16) || 0;
    const g1 = parseInt(c1.substring(2, 4), 16) || 0;
    const b1 = parseInt(c1.substring(4, 6), 16) || 0;
    const r2 = parseInt(c2.substring(0, 2), 16) || 0;
    const g2 = parseInt(c2.substring(2, 4), 16) || 0;
    const b2 = parseInt(c2.substring(4, 6), 16) || 0;

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return color1;
  }
}

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`7h_cursor_${key}`);
    if (v === null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, val: unknown) {
  try { localStorage.setItem(`7h_cursor_${key}`, JSON.stringify(val)); } catch { }
}

const createSetHandler = <T,>(setter: (v: T) => void, key: string) => (v: T) => { setter(v); saveSetting(key, v); };

// ── "morph-pick" cursor override ────────────────────────────────────────────
// Any element with className="morph-pick" swaps the trailing-circle cursor
// for a spinning guitar-pick badge while hovered. Customize the marquee text
// per-element with data-pick-label="Your Text" (defaults to "Play Video").
const PICK_W = 104;
const PICK_H = 127;
const PICK_CLIP =
  "polygon(95.84% 28.87%, 95.84% 30.52%, 95.84% 32.17%, 95.84% 33.81%, 95.80% 35.46%, 95.60% 37.10%, 95.28% 38.73%, 94.85% 40.34%, 94.38% 41.94%, 93.88% 43.53%, 93.35% 45.12%, 92.79% 46.71%, 92.20% 48.28%, 91.57% 49.85%, 90.93% 51.41%, 90.25% 52.96%, 89.55% 54.50%, 88.82% 56.04%, 88.06% 57.56%, 87.28% 59.08%, 86.48% 60.59%, 85.65% 62.09%, 84.80% 63.59%, 83.92% 65.07%, 83.02% 66.54%, 82.10% 68.01%, 81.16% 69.46%, 80.19% 70.91%, 79.20% 72.34%, 78.18% 73.76%, 77.15% 75.17%, 76.09% 76.57%, 75.00% 77.96%, 73.90% 79.34%, 72.77% 80.70%, 71.61% 82.05%, 70.44% 83.38%, 69.24% 84.71%, 68.01% 86.02%, 66.77% 87.31%, 65.50% 88.59%, 64.21% 89.85%, 62.90% 91.10%, 61.57% 92.34%, 60.22% 93.56%, 58.85% 94.76%, 57.46% 95.95%, 55.94% 97.03%, 54.20% 97.84%, 52.27% 98.30%, 50.27% 98.36%, 48.26% 98.33%, 46.32% 97.92%, 44.55% 97.15%, 42.99% 96.11%, 41.59% 94.93%, 40.22% 93.72%, 38.87% 92.50%, 37.54% 91.27%, 36.23% 90.02%, 34.94% 88.76%, 33.66% 87.48%, 32.41% 86.19%, 31.19% 84.88%, 29.98% 83.57%, 28.80% 82.23%, 27.64% 80.89%, 26.51% 79.53%, 25.40% 78.15%, 24.31% 76.77%, 23.24% 75.37%, 22.20% 73.96%, 21.18% 72.54%, 20.19% 71.11%, 19.22% 69.67%, 18.27% 68.21%, 17.34% 66.75%, 16.44% 65.28%, 15.56% 63.80%, 14.70% 62.31%, 13.86% 60.81%, 13.05% 59.30%, 12.27% 57.79%, 11.51% 56.26%, 10.77% 54.73%, 10.06% 53.18%, 9.38% 51.63%, 8.73% 50.08%, 8.10% 48.51%, 7.51% 46.94%, 6.94% 45.35%, 6.41% 43.77%, 5.91% 42.17%, 5.46% 40.57%, 5.05% 38.95%, 4.70% 37.33%, 4.42% 35.70%, 4.23% 34.06%, 4.16% 32.41%, 4.19% 30.76%, 4.26% 29.12%, 4.49% 27.48%, 4.88% 25.87%, 5.42% 24.28%, 6.11% 22.73%, 6.93% 21.23%, 7.88% 19.77%, 8.94% 18.38%, 10.13% 17.05%, 11.45% 15.81%, 12.88% 14.65%, 14.42% 13.59%, 16.05% 12.63%, 17.76% 11.77%, 19.54% 11.00%, 21.38% 10.33%, 23.26% 9.75%, 25.17% 9.23%, 27.09% 8.75%, 29.03% 8.33%, 30.99% 7.95%, 32.96% 7.63%, 34.94% 7.34%, 36.93% 7.11%, 38.93% 6.92%, 40.93% 6.78%, 42.94% 6.68%, 44.95% 6.64%, 46.95% 6.56%, 48.96% 6.56%, 50.97% 6.56%, 52.98% 6.56%, 54.99% 6.63%, 57.00% 6.67%, 59.01% 6.76%, 61.01% 6.89%, 63.01% 7.08%, 65.00% 7.31%, 66.98% 7.59%, 68.95% 7.91%, 70.91% 8.28%, 72.85% 8.69%, 74.78% 9.16%, 76.69% 9.67%, 78.58% 10.24%, 80.42% 10.90%, 82.21% 11.64%, 83.94% 12.48%, 85.59% 13.43%, 87.14% 14.47%, 88.59% 15.61%, 89.92% 16.85%, 91.13% 18.16%, 92.22% 19.55%, 93.19% 20.99%, 94.04% 22.49%, 94.74% 24.03%, 95.29% 25.61%, 95.67% 27.23%, 95.84% 28.87%)";
const PICK_DEFAULT_LABEL = "Play Video";

// ── Component ─────────────────────────────────────────────────────────────────
export default function CursorFollower() {
  const pathname = usePathname();
  const [isTouch, setIsTouch] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [pickActive, setPickActive] = useState(false);
  const [pickLabel, setPickLabel] = useState(PICK_DEFAULT_LABEL);
  const pickElRef = useRef<HTMLDivElement | null>(null);

  // Settings state
  const [numCircles, setNumCircles] = useState(DEFAULTS.numCircles);
  const [circleSize, setCircleSize] = useState(DEFAULTS.circleSize);
  const [blur, setBlur] = useState(DEFAULTS.blur);
  const [glow, setGlow] = useState(DEFAULTS.glow);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [opacity, setOpacity] = useState(DEFAULTS.opacity);
  const [palette, setPalette] = useState(DEFAULTS.palette);
  const [tailScale, setTailScale] = useState(DEFAULTS.tailScale);
  const [gooey, setGooey] = useState(DEFAULTS.gooey);
  const [gooeyStrength, setGooeyStrength] = useState(DEFAULTS.gooeyStrength);
  const [customColors, setCustomColors] = useState<string[]>(["#3b0764", "#7e22ce", "#a855f7", "#3b0764"]);
  const [gradStart, setGradStart] = useState("#3b0764");
  const [gradEnd, setGradEnd] = useState("#06000e");
  const [showPerCircleEdit, setShowPerCircleEdit] = useState(false);

  const coordsRef = useRef({ x: -1000, y: -1000 });
  const hasMovedRef = useRef(false);
  const circlesRef = useRef<{ x: number; y: number; el: HTMLDivElement | null }[]>([]);

  // Load settings on mount
  useEffect(() => {
    setNumCircles(loadSetting("numCircles", DEFAULTS.numCircles));
    setCircleSize(loadSetting("circleSize", DEFAULTS.circleSize));
    setBlur(loadSetting("blur", DEFAULTS.blur));
    setGlow(loadSetting("glow", DEFAULTS.glow));
    setSpeed(loadSetting("speed", DEFAULTS.speed));
    setOpacity(loadSetting("opacity", DEFAULTS.opacity));
    setPalette(loadSetting("palette", DEFAULTS.palette));
    setTailScale(loadSetting("tailScale", DEFAULTS.tailScale));
    setGooey(loadSetting("gooey", DEFAULTS.gooey));
    setGooeyStrength(loadSetting("gooeyStrength", DEFAULTS.gooeyStrength));
    setCustomColors(loadSetting("customColors", ["#3b0764", "#7e22ce", "#a855f7", "#3b0764"]));
  }, []);

  // Reset on route change
  useEffect(() => {
    hasMovedRef.current = false;
    setIsVisible(false);
  }, [pathname]);

  // Touch detection & animation
  useEffect(() => {
    const touch = !window.matchMedia("(pointer: fine)").matches;
    setIsTouch(touch);
    if (touch) return;

    circlesRef.current = Array.from({ length: numCircles }, () => ({ x: -1000, y: -1000, el: null }));

    const handleMouseMove = (e: MouseEvent) => {
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        circlesRef.current.forEach(c => { c.x = e.clientX; c.y = e.clientY; });
        setIsVisible(true);
      }
    };
    const onLeave = () => setIsVisible(false);
    const onEnter = (e: MouseEvent) => {
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let animId: number;
    const animate = () => {
      if (hasMovedRef.current) {
        let x = coordsRef.current.x;
        let y = coordsRef.current.y;
        if (pickElRef.current) {
          pickElRef.current.style.transform = `translate3d(${x - PICK_W / 2}px, ${y - PICK_H / 2}px, 0)`;
        }
        circlesRef.current.forEach((c, i) => {
          if (!c.el) return;
          const baseScale = (circlesRef.current.length - i) / circlesRef.current.length;
          const scale = baseScale * tailScale;
          c.el.style.transform = `translate3d(${x - circleSize / 2}px, ${y - circleSize / 2}px, 0) scale(${scale})`;
          c.el.style.opacity = "1";
          c.x = x;
          c.y = y;
          const next = circlesRef.current[i + 1] || circlesRef.current[0];
          x += ((next?.x ?? x) - x) * speed;
          y += ((next?.y ?? y) - y) * speed;
        });
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(animId);
    };
  }, [isTouch, numCircles, circleSize, speed, tailScale]);

  // "morph-pick" hover detection — swap to the guitar-pick badge over opted-in elements
  useEffect(() => {
    if (isTouch) return;

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const match = target?.closest?.(".morph-pick") as HTMLElement | null;
      if (match) {
        setPickActive(true);
        setPickLabel(match.dataset.pickLabel || PICK_DEFAULT_LABEL);
      }
    };
    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const match = target?.closest?.(".morph-pick") as HTMLElement | null;
      if (!match) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !match.contains(related)) {
        setPickActive(false);
      }
    };

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [isTouch]);

  if (isTouch) return null;

  const colors = palette === "Custom"
    ? (customColors.length > 0 ? customColors : ["#a855f7"])
    : (COLOR_PRESETS[palette] ?? COLOR_PRESETS.Purple);

  const glowColor = colors[colors.length - 1] ?? "#a855f7";

  const set = createSetHandler;

  // Generator helpers
  const handleGenerateGradient = () => {
    const list: string[] = [];
    const count = numCircles;
    for (let i = 0; i < count; i++) {
      const factor = count > 1 ? i / (count - 1) : 0;
      list.push(interpolateHex(gradStart, gradEnd, factor));
    }
    setCustomColors(list);
    saveSetting("customColors", list);
    setPalette("Custom");
    saveSetting("palette", "Custom");
  };

  const handleGenerateRainbow = () => {
    const list: string[] = [];
    const count = numCircles;
    for (let i = 0; i < count; i++) {
      const hue = Math.round((i / count) * 360);
      list.push(`hsl(${hue}, 85%, 60%)`);
    }
    setCustomColors(list);
    saveSetting("customColors", list);
    setPalette("Custom");
    saveSetting("palette", "Custom");
  };

  const handleReverseColors = () => {
    const list = [...colors].reverse();
    setCustomColors(list);
    saveSetting("customColors", list);
    setPalette("Custom");
    saveSetting("palette", "Custom");
  };

  const handleUpdateCircleColor = (index: number, color: string) => {
    const next = [...customColors];
    while (next.length < numCircles) {
      next.push(colors[next.length % colors.length] || "#a855f7");
    }
    next[index] = color;
    setCustomColors(next);
    saveSetting("customColors", next);
    if (palette !== "Custom") {
      setPalette("Custom");
      saveSetting("palette", "Custom");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }
        .cursor-tail-circle {
          border-radius: 50%;
          position: fixed;
          top: 0; left: 0;
          pointer-events: none;
          z-index: 2147483647;
          will-change: transform;
          opacity: 0;
        }
        @keyframes cursorScaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes cursorPickSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cursorPickScrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes cursorPickScrollRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .cursor-pick-badge {
          position: fixed;
          top: 0; left: 0;
          pointer-events: none;
          z-index: 2147483647;
          will-change: transform;
          animation: cursorPickSpin 2.4s linear infinite;
          transition: opacity 0.2s ease;
        }
        .cursor-pick-row {
          width: 100%;
          height: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }
        .cursor-pick-track { display: flex; }
        .cursor-pick-row.reverse .cursor-pick-track { animation: cursorPickScrollRight 3.2s linear infinite; }
        .cursor-pick-row:not(.reverse) .cursor-pick-track { animation: cursorPickScrollLeft 3.2s linear infinite; }
        .cursor-pick-track span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .3px;
          text-transform: uppercase;
          color: #ffffff;
          padding: 0 6px;
        }
      `}} />

      {/* SVG Liquid Gooey Filter Definition (use visibility:hidden instead of display:none to avoid GPU filter matrix artifacts) */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" style={{ visibility: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="cursor-gooey" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyStrength} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0 0  0 0 1 0 0 0  0 0 0 20 -9"
            />
          </filter>
        </defs>
      </svg>

      {/* Cursor tail circles */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{
          opacity: isVisible && !pickActive ? opacity : 0,
          visibility: isVisible && !pickActive ? "visible" : "hidden",
          transition: "opacity 0.15s ease, visibility 0.15s ease",
          zIndex: 2147483647,
          filter: gooey ? "url(#cursor-gooey)" : "none",
        }}
      >
        {Array.from({ length: numCircles }, (_, i) => numCircles - 1 - i).map((i) => (
          <div
            key={i}
            ref={el => {
              if (el) {
                circlesRef.current[i] = {
                  x: coordsRef.current.x,
                  y: coordsRef.current.y,
                  el,
                };
              }
            }}
            className="cursor-tail-circle"
            style={{
              width: `${circleSize}px`,
              height: `${circleSize}px`,
              backgroundColor: colors[i % colors.length],
              filter: gooey ? "none" : (blur > 0 ? `blur(${blur}px)` : "none"),
              boxShadow: gooey ? "none" : (glow > 0 ? `0 0 ${glow}px ${glowColor}88` : "none"),
              transform: "translate3d(-9999px, -9999px, 0)",
            }}
          />
        ))}
      </div>

      {/* Guitar-pick cursor badge — shown while hovering a .morph-pick element */}
      <div
        ref={pickElRef}
        className="cursor-pick-badge"
        style={{
          width: PICK_W,
          height: PICK_H,
          opacity: isVisible && pickActive ? 1 : 0,
          clipPath: PICK_CLIP,
          transform: "translate3d(-9999px, -9999px, 0)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "#9333ea" }} />
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "33%",
            height: "26%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <div className="cursor-pick-row">
            <div className="cursor-pick-track">
              {Array.from({ length: 8 }, (_, i) => <span key={i}>{pickLabel}</span>)}
            </div>
          </div>
          <div className="cursor-pick-row reverse">
            <div className="cursor-pick-track">
              {Array.from({ length: 8 }, (_, i) => <span key={i}>{pickLabel}</span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Slider Row helper ─────────────────────────────────────────────────────────
function SliderRow({
  label, value, min, max, step, display, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
        <span>{label}</span>
        <span className=" text-[var(--color-accent)] font-mono font-black">{display}</span>
      </div>
      <input aria-label="Input field"
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-none"
      />
    </div>
  );
}
