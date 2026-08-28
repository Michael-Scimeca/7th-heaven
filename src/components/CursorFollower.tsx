/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */

import { useEffect, useState, useRef, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MorphSVGPlugin);
}

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
  numCircles: 36,
  circleSize: 10,
  blur: 0,
  glow: 0,
  speed: 0.25,
  opacity: 1,
  palette: "Purple",
  tailScale: 1.45,
  gooey: false,
  gooeyStrength: 0,
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
// Smaller "now playing" badge — shown while a song is playing (independent of hover),
// triggered by dispatching `window.dispatchEvent(new CustomEvent("cursor:song-playing", { detail: true }))`.
// 60% smaller than the hover pick (PICK_W/PICK_H), i.e. 40% of the original size.
const SONG_PICK_W = Math.round(PICK_W * 0.4);
const SONG_PICK_H = Math.round(PICK_H * 0.4);
// Hand-cursor badge is a clean, 1:1 square ratio matching hand.svg (85.42 x 85.16).
const HAND_W = 32;
const HAND_H = 32;
const SONG_PICK_LABEL = "Stop Music";
const PICK_CLIP =
  "polygon(95.84% 28.87%, 95.84% 30.52%, 95.84% 32.17%, 95.84% 33.81%, 95.80% 35.46%, 95.60% 37.10%, 95.28% 38.73%, 94.85% 40.34%, 94.38% 41.94%, 93.88% 43.53%, 93.35% 45.12%, 92.79% 46.71%, 92.20% 48.28%, 91.57% 49.85%, 90.93% 51.41%, 90.25% 52.96%, 89.55% 54.50%, 88.82% 56.04%, 88.06% 57.56%, 87.28% 59.08%, 86.48% 60.59%, 85.65% 62.09%, 84.80% 63.59%, 83.92% 65.07%, 83.02% 66.54%, 82.10% 68.01%, 81.16% 69.46%, 80.19% 70.91%, 79.20% 72.34%, 78.18% 73.76%, 77.15% 75.17%, 76.09% 76.57%, 75.00% 77.96%, 73.90% 79.34%, 72.77% 80.70%, 71.61% 82.05%, 70.44% 83.38%, 69.24% 84.71%, 68.01% 86.02%, 66.77% 87.31%, 65.50% 88.59%, 64.21% 89.85%, 62.90% 91.10%, 61.57% 92.34%, 60.22% 93.56%, 58.85% 94.76%, 57.46% 95.95%, 55.94% 97.03%, 54.20% 97.84%, 52.27% 98.30%, 50.27% 98.36%, 48.26% 98.33%, 46.32% 97.92%, 44.55% 97.15%, 42.99% 96.11%, 41.59% 94.93%, 40.22% 93.72%, 38.87% 92.50%, 37.54% 91.27%, 36.23% 90.02%, 34.94% 88.76%, 33.66% 87.48%, 32.41% 86.19%, 31.19% 84.88%, 29.98% 83.57%, 28.80% 82.23%, 27.64% 80.89%, 26.51% 79.53%, 25.40% 78.15%, 24.31% 76.77%, 23.24% 75.37%, 22.20% 73.96%, 21.18% 72.54%, 20.19% 71.11%, 19.22% 69.67%, 18.27% 68.21%, 17.34% 66.75%, 16.44% 65.28%, 15.56% 63.80%, 14.70% 62.31%, 13.86% 60.81%, 13.05% 59.30%, 12.27% 57.79%, 11.51% 56.26%, 10.77% 54.73%, 10.06% 53.18%, 9.38% 51.63%, 8.73% 50.08%, 8.10% 48.51%, 7.51% 46.94%, 6.94% 45.35%, 6.41% 43.77%, 5.91% 42.17%, 5.46% 40.57%, 5.05% 38.95%, 4.70% 37.33%, 4.42% 35.70%, 4.23% 34.06%, 4.16% 32.41%, 4.19% 30.76%, 4.26% 29.12%, 4.49% 27.48%, 4.88% 25.87%, 5.42% 24.28%, 6.11% 22.73%, 6.93% 21.23%, 7.88% 19.77%, 8.94% 18.38%, 10.13% 17.05%, 11.45% 15.81%, 12.88% 14.65%, 14.42% 13.59%, 16.05% 12.63%, 17.76% 11.77%, 19.54% 11.00%, 21.38% 10.33%, 23.26% 9.75%, 25.17% 9.23%, 27.09% 8.75%, 29.03% 8.33%, 30.99% 7.95%, 32.96% 7.63%, 34.94% 7.34%, 36.93% 7.11%, 38.93% 6.92%, 40.93% 6.78%, 42.94% 6.68%, 44.95% 6.64%, 46.95% 6.56%, 48.96% 6.56%, 50.97% 6.56%, 52.98% 6.56%, 54.99% 6.63%, 57.00% 6.67%, 59.01% 6.76%, 61.01% 6.89%, 63.01% 7.08%, 65.00% 7.31%, 66.98% 7.59%, 68.95% 7.91%, 70.91% 8.28%, 72.85% 8.69%, 74.78% 9.16%, 76.69% 9.67%, 78.58% 10.24%, 80.42% 10.90%, 82.21% 11.64%, 83.94% 12.48%, 85.59% 13.43%, 87.14% 14.47%, 88.59% 15.61%, 89.92% 16.85%, 91.13% 18.16%, 92.22% 19.55%, 93.19% 20.99%, 94.04% 22.49%, 94.74% 24.03%, 95.29% 25.61%, 95.67% 27.23%, 95.84% 28.87%)";
const PICK_DEFAULT_LABEL = "Play Video";
// Same 160-point outline as PICK_CLIP, expressed as raw path data (not percentages)
// in a 0–100 × 0–122 coordinate space, so MorphSVGPlugin can tween a circle into it.
const PICK_PATH_D = "M95.84,35.22L95.84,37.23L95.84,39.25L95.84,41.25L95.8,43.26L95.6,45.26L95.28,47.25L94.85,49.21L94.38,51.17L93.88,53.11L93.35,55.05L92.79,56.99L92.2,58.9L91.57,60.82L90.93,62.72L90.25,64.61L89.55,66.49L88.82,68.37L88.06,70.22L87.28,72.08L86.48,73.92L85.65,75.75L84.8,77.58L83.92,79.39L83.02,81.18L82.1,82.97L81.16,84.74L80.19,86.51L79.2,88.25L78.18,89.99L77.15,91.71L76.09,93.42L75,95.11L73.9,96.79L72.77,98.45L71.61,100.1L70.44,101.72L69.24,103.35L68.01,104.94L66.77,106.52L65.5,108.08L64.21,109.62L62.9,111.14L61.57,112.65L60.22,114.14L58.85,115.61L57.46,117.06L55.94,118.38L54.2,119.36L52.27,119.93L50.27,120L48.26,119.96L46.32,119.46L44.55,118.52L42.99,117.25L41.59,115.81L40.22,114.34L38.87,112.85L37.54,111.35L36.23,109.82L34.94,108.29L33.66,106.73L32.41,105.15L31.19,103.55L29.98,101.96L28.8,100.32L27.64,98.69L26.51,97.03L25.4,95.34L24.31,93.66L23.24,91.95L22.2,90.23L21.18,88.5L20.19,86.75L19.22,85L18.27,83.22L17.34,81.44L16.44,79.64L15.56,77.84L14.7,76.02L13.86,74.19L13.05,72.35L12.27,70.5L11.51,68.64L10.77,66.77L10.06,64.88L9.38,62.99L8.73,61.1L8.1,59.18L7.51,57.27L6.94,55.33L6.41,53.4L5.91,51.45L5.46,49.5L5.05,47.52L4.7,45.54L4.42,43.55L4.23,41.55L4.16,39.54L4.19,37.53L4.26,35.53L4.49,33.53L4.88,31.56L5.42,29.62L6.11,27.73L6.93,25.9L7.88,24.12L8.94,22.42L10.13,20.8L11.45,19.29L12.88,17.87L14.42,16.58L16.05,15.41L17.76,14.36L19.54,13.42L21.38,12.6L23.26,11.89L25.17,11.26L27.09,10.67L29.03,10.16L30.99,9.7L32.96,9.31L34.94,8.95L36.93,8.67L38.93,8.44L40.93,8.27L42.94,8.15L44.95,8.1L46.95,8L48.96,8L50.97,8L52.98,8L54.99,8.09L57,8.14L59.01,8.25L61.01,8.41L63.01,8.64L65,8.92L66.98,9.26L68.95,9.65L70.91,10.1L72.85,10.6L74.78,11.18L76.69,11.8L78.58,12.49L80.42,13.3L82.21,14.2L83.94,15.23L85.59,16.38L87.14,17.65L88.59,19.04L89.92,20.56L91.13,22.16L92.22,23.85L93.19,25.61L94.04,27.44L94.74,29.32L95.29,31.24L95.67,33.22L95.84,35.22Z";
// A circle in the same coordinate space — the resting shape the pick morphs from/to.
const CIRCLE_PATH_D = "M10,61C10,38.91,27.91,21,50,21C72.09,21,90,38.91,90,61C90,83.09,72.09,101,50,101C27.91,101,10,83.09,10,61Z";

// A stylized hand glyph (the main silhouette from /public/images/hand.svg),
// normalized into the same 0–100 x 0–122 coordinate space as CIRCLE_PATH_D /
// PICK_PATH_D so MorphSVGPlugin can tween between all three shapes without
// any viewBox trickery. Shown while hovering a generic clickable element
// (link, button, etc.) that isn't already inside a .morph-pick region.
const HAND_PATH_D = "M19.85,51.43c-1.24-1.16-3.72-3.04-5.32-2.93.76-.58,1.63-.71,2.55-.68,4.95.19,11.5,4.42,14.99,7.92.48.48,1.02.76,1.72.9l7.96,1.54c1.01.2,2,.36,3.01.25,1.19-.13,2.32-.49,3.41-.98l2.47-1.1c-2.25.22-4.37.14-6.51-.27,2.19-1.92,4.39-3.59,6.66-5.34l-5.13,1.69.3-4.44c.22-3.38.87-6.63,2.09-9.78.65-1.78,1.52-3.33,2.56-4.97-5.21,4.09-7.63,11.19-6.97,17.65-3.09-2.93-4.78-6.4-5.73-10.48,1.07-.79,1.88-1.77,2.61-2.89.9-1.37,1.66-2.79,2.32-4.33l-4.15,3.76-1.12.78c-.69.31-1.41.21-1.98-.3s-1.06-1.07-1.51-1.71c-1.17-1.65-2.24-3.33-3.23-5.1-.62-1.11-1.05-2.24-.48-3.33.67-1.3,1.45-2.49,2.26-3.71l1.21-1.82c-1.36.83-2.52,1.82-3.67,2.9-.78.73-1.48,1.44-2.36,2.11-3.9-1.36-7.73-4.5-10.29-7.69-.17-.21-.41-.6-.32-.83.44-1.22,1.29-2.13,2.32-2.96-1.19.08-2.27.6-3.26,1.29l-1.15.8c-.88-.26-1.63-.53-2.44-.95-3.08-1.61-5.8-3.85-7.95-6.59-1.19-1.52-2.2-3.51-2.01-5.41.06-.61.33-1.12.84-1.52,1.16,1.09,2.46,1.85,3.91,2.44,1.75.72,3.56.94,5.42.67l4.7,2.35,14.63,6.36c1.06.46,1.92.98,2.76,1.76,2.04,1.87,4.12,3.63,6.31,5.33s4.41,3.19,6.85,4.49c2.25,1.19,4.53,2.22,7.09,2.82l-6.9-5.09,2.51-.44c1.63-.28,3.14.25,4.34,1.33l4.59,4.14c.71.64,1.17,1.37,1.56,2.23l2.39,5.17c2.47,5.08,5.12,10,7.88,14.92l2.32,3.68c2.31,4.06,4.34,8.2,6.44,12.36l1.53,3.42c1.09,2.44-1.16,4.74-3.11,6.21-2.91,2.2-6.26,3.73-9.81,4.57-1.29.31-2.5.35-3.8.27-4.84-.27-9.47-1.64-13.35-4.59-.73-.6-1.34-1.23-1.84-2.03,0-.06,0-.12.02-.12h.15c2.07.13,4.06-.02,6.12-.33l6.16-.94-10.67-1c-.98-.09-1.9-.16-2.84-.42-1.24-.34-2.38-.82-3.57-1.31l-5.05-2.11c-2.09-.87-4.25-1.31-6.49-1.61l-4.52-.37c-1.87-.15-3.76-.14-4.58-1.96-.34-.75-.75-1.46-1.36-2.02l-2.02-1.84-1.72-1.59c-.17-.16-.27-.43-.34-.67l1.13-3.81c.6-1.46.62-2.67-.57-3.77ZM36.44,19.35c-1.32-1.33-2.69-2.36-4.09-3.47-1.39-.85-2.92-1.34-4.61-1.32,1.53.53,2.89,1.17,4.24,2.01l4.46,2.79ZM66.7,44.86l.04-.12-.72-1.38-5.41-10.37c-.59-.89-1.38-1.47-2.43-1.62l-1.95-.29,1.79,1.25c.37.26.67.66.92,1.04l1.9,2.84,5.85,8.66ZM27,61.98l.67-1.35c-1.49.82-2.47,2.12-2.11,3.76l1.44-2.41ZM27.24,66.8c.84.08,1.44-.41,1.94-.96.96-1.22,1-2.94.1-4.25.16,1.17-.04,2.2-.53,3.19-.27.55-.49,1.09-.91,1.55l-.6.47Z";


// ── Component ─────────────────────────────────────────────────────────────────
export default function CursorFollower() {
  const pathname = usePathname();
  const [isTouch, setIsTouch] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [pickActive, setPickActive] = useState(false);
  const [handActive, setHandActive] = useState(false);
  const [pickLabel, setPickLabel] = useState(PICK_DEFAULT_LABEL);
  const [songPlaying, setSongPlaying] = useState(false);
  const pickElRef = useRef<HTMLDivElement | null>(null);
  const pickSpinRef = useRef<HTMLDivElement | null>(null);
  const pickPathRef = useRef<SVGPathElement | null>(null);
  const pickTextRef = useRef<HTMLDivElement | null>(null);
  const pickTlRef = useRef<gsap.core.Timeline | null>(null);

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
    setGooey(loadSetting("gooey", false));
    setGooeyStrength(loadSetting("gooeyStrength", 0));
    setCustomColors(loadSetting("customColors", ["#3b0764", "#7e22ce", "#a855f7", "#3b0764"]));
  }, []);

  const updateNumCircles = createSetHandler(setNumCircles, "numCircles");
  const updateCircleSize = createSetHandler(setCircleSize, "circleSize");
  const updateBlur = createSetHandler(setBlur, "blur");
  const updateGlow = createSetHandler(setGlow, "glow");
  const updateSpeed = createSetHandler(setSpeed, "speed");
  const updateOpacity = createSetHandler(setOpacity, "opacity");
  const updatePalette = createSetHandler(setPalette, "palette");
  const updateTailScale = createSetHandler(setTailScale, "tailScale");
  const updateGooey = createSetHandler(setGooey, "gooey");
  const updateGooeyStrength = createSetHandler(setGooeyStrength, "gooeyStrength");

  // Reset on route change
  useEffect(() => {
    hasMovedRef.current = false;
    setIsVisible(false);
    setPickActive(false);
    setHandActive(false);
    setSongPlaying(false);
  }, [pathname]);

  const handActiveRef = useRef(false);

  useEffect(() => {
    handActiveRef.current = handActive;
  }, [handActive]);

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
      wakeLoop();
    };
    const onLeave = () => { setIsVisible(false); setPickActive(false); };
    const onEnter = (e: MouseEvent) => {
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
      setIsVisible(true);
    };

    let animId: number;
    let isLoopRunning = false;

    const animate = () => {
      if (hasMovedRef.current) {
        let x = coordsRef.current.x;
        let y = coordsRef.current.y;
        let totalDist = 0;

        if (pickElRef.current) {
          if (handActiveRef.current) {
            pickElRef.current.style.transform = `translate3d(${x - 4}px, ${y - 2}px, 0)`;
          } else {
            pickElRef.current.style.transform = `translate3d(${x - PICK_W / 2}px, ${y - PICK_H / 2}px, 0)`;
          }
        }

        circlesRef.current.forEach((c, i) => {
          if (!c.el) return;
          const baseScale = (circlesRef.current.length - i) / circlesRef.current.length;
          const scale = baseScale * tailScale;
          c.el.style.transform = `translate3d(${x - circleSize / 2}px, ${y - circleSize / 2}px, 0) scale(${scale})`;
          c.el.style.opacity = "1";
          totalDist += Math.abs(x - c.x) + Math.abs(y - c.y);
          c.x = x;
          c.y = y;
          const next = circlesRef.current[i + 1] || circlesRef.current[0];
          x += ((next?.x ?? x) - x) * speed;
          y += ((next?.y ?? y) - y) * speed;
        });

        // Pause loop when cursor trail has completely settled
        if (totalDist < 0.1) {
          isLoopRunning = false;
          return;
        }
      }
      animId = requestAnimationFrame(animate);
    };

    const wakeLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(animate);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
      wakeLoop();
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    wakeLoop();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (animId) cancelAnimationFrame(animId);
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

  // "morph-hand" hover detection — swap to the hand badge over generic
  // clickable elements (links, buttons, etc.), unless they're inside a
  // .morph-pick region, which takes priority (see the timeline effect below).
  useEffect(() => {
    if (isTouch) return;

    const CLICKABLE_SELECTOR =
      'a, button, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, summary, label[for], .cursor-pointer, [onclick], [data-clickable]';

    const isTextInput = (el: HTMLElement | null) => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === 'textarea' || el.isContentEditable) return true;
      if (tag === 'input') {
        const type = (el as HTMLInputElement).type.toLowerCase();
        return !['submit', 'button', 'checkbox', 'radio', 'range', 'file', 'color', 'image'].includes(type);
      }
      return false;
    };

    const handOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (isTextInput(target)) {
        setHandActive(false);
        return;
      }
      const match = target?.closest?.(CLICKABLE_SELECTOR) as HTMLElement | null;
      if (match && !match.closest(".morph-pick")) {
        setHandActive(true);
      }
    };
    const handOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (isTextInput(target)) {
        setHandActive(false);
        return;
      }
      const match = target?.closest?.(CLICKABLE_SELECTOR) as HTMLElement | null;
      if (!match) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !match.contains(related)) {
        setHandActive(false);
      }
    };

    document.addEventListener("mouseover", handOver);
    document.addEventListener("mouseout", handOut);
    return () => {
      document.removeEventListener("mouseover", handOver);
      document.removeEventListener("mouseout", handOut);
    };
  }, [isTouch]);

  // Instant snap on unhover to prevent trailing line stretches
  useEffect(() => {
    if (!handActive && !pickActive && hasMovedRef.current) {
      circlesRef.current.forEach(c => {
        c.x = coordsRef.current.x;
        c.y = coordsRef.current.y;
      });
    }
  }, [handActive, pickActive]);

  // "now playing" cursor override — independent of hover. Anything (an audio player,
  // a test button, etc.) can flip this on/off from anywhere in the app via:
  //   window.dispatchEvent(new CustomEvent("cursor:song-playing", { detail: true | false }))
  useEffect(() => {
    if (isTouch) return;
    const handleSongPlaying = (e: Event) => {
      setSongPlaying(!!(e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("cursor:song-playing", handleSongPlaying as EventListener);
    return () => window.removeEventListener("cursor:song-playing", handleSongPlaying as EventListener);
  }, [isTouch]);

  // Click-to-toggle music as long as the hero video/section is in view (even partially).
  // Deactivates ONLY when the hero section is completely out of view (scrolled off screen).
  useEffect(() => {
    if (isTouch) return;

    const isHeroInView = () => {
      const hero = document.getElementById("hero") || document.querySelector(".morph-pick");
      if (!hero) return false;
      const rect = hero.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const handleGlobalHeroClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Stop handling if hero video section is completely out of view
      if (!isHeroInView()) return;

      const inHeroSection = target.closest("#hero, #hero-card, .hero-container, .morph-pick");
      if (inHeroSection || songPlaying) {
        const isInteractive = target.closest("a, button, input, select, textarea, [role='button'], .swiper-button-next, .swiper-button-prev, .no-hero-click");
        if (!isInteractive) {
          window.dispatchEvent(new CustomEvent("7h-toggle-hero-music"));
        }
      }
    };

    window.addEventListener("click", handleGlobalHeroClick, { capture: true });
    return () => window.removeEventListener("click", handleGlobalHeroClick, { capture: true });
  }, [isTouch, songPlaying]);

  // Smoothly morph the trailing dot into the guitar pick (and back) with GSAP's
  // MorphSVGPlugin, instead of a hard opacity crossfade between two shapes.
  useEffect(() => {
    if (isTouch) return;
    const spin = pickSpinRef.current;
    const path = pickPathRef.current;
    const text = pickTextRef.current;
    if (!spin || !path || !text) return;

    pickTlRef.current?.kill();
    const tl = gsap.timeline();
    pickTlRef.current = tl;

    if (songPlaying) {
      // Smaller "now playing" badge — same pick shape, scaled down, with "Stop Music"
      // instead of the marquee label. Takes priority over hover: once a track is
      // playing, this shows even while still hovering the hero, so the cursor
      // "toggles" the instant playback starts instead of waiting for mouseout.
      tl.set(spin, { width: circleSize, height: circleSize, opacity: 0 })
        .set(path, { morphSVG: CIRCLE_PATH_D })
        .set(text, { opacity: 0 })
        .to(spin, { opacity: 1, duration: 0.12 }, 0)
        .to(spin, { width: SONG_PICK_W, height: SONG_PICK_H, duration: 0.45, ease: "back.out(1.6)" }, 0)
        .to(path, { morphSVG: PICK_PATH_D, duration: 0.45, ease: "power2.inOut" }, 0)
        .to(text, { opacity: 1, duration: 0.2 }, 0.24);
    } else if (pickActive) {
      tl.set(spin, { width: circleSize, height: circleSize, opacity: 0 })
        .set(path, { morphSVG: CIRCLE_PATH_D })
        .set(text, { opacity: 0 })
        .to(spin, { opacity: 1, duration: 0.12 }, 0)
        .to(spin, { width: PICK_W, height: PICK_H, duration: 0.5, ease: "back.out(1.6)" }, 0)
        .to(path, { morphSVG: PICK_PATH_D, duration: 0.5, ease: "power2.inOut" }, 0)
        .to(text, { opacity: 1, duration: 0.25 }, 0.28);
    } else if (handActive) {
      // Hand cursor over generic clickable elements — same grow-from-the-trailing-dot
      // morph as the pick badge, but no text marquee and no spin (a hand doesn't spin).
      tl.set(spin, { width: circleSize, height: circleSize, opacity: 0 })
        .set(path, { morphSVG: CIRCLE_PATH_D })
        .set(text, { opacity: 0 })
        .to(spin, { opacity: 1, duration: 0.12 }, 0)
        .to(spin, { width: HAND_W, height: HAND_H, duration: 0.4, ease: "power2.out" }, 0)
        .to(path, { morphSVG: HAND_PATH_D, duration: 0.4, ease: "power2.inOut" }, 0);
    } else {
      tl.to(text, { opacity: 0, duration: 0.12 }, 0)
        .to(path, { morphSVG: CIRCLE_PATH_D, duration: 0.3, ease: "power1.inOut" }, 0)
        .to(spin, { width: circleSize, height: circleSize, duration: 0.3, ease: "power1.inOut" }, 0)
        .to(spin, { opacity: 0, duration: 0.15 }, 0.2);
    }

    return () => { tl.kill(); };
  }, [pickActive, handActive, songPlaying, isTouch, circleSize]);

  if (isTouch) return null;

  const colors = palette === "Custom"
    ? (customColors.length > 0 ? customColors : ["#a855f7"])
    : (COLOR_PRESETS[palette] ?? COLOR_PRESETS.Purple);

  const glowColor = colors[colors.length - 1] ?? "#a855f7";

  const set = createSetHandler;

  // Generator helpers
  const handleResetDefaults = () => {
    updateNumCircles(DEFAULTS.numCircles);
    updateCircleSize(DEFAULTS.circleSize);
    updateBlur(DEFAULTS.blur);
    updateGlow(DEFAULTS.glow);
    updateSpeed(DEFAULTS.speed);
    updateOpacity(DEFAULTS.opacity);
    updatePalette(DEFAULTS.palette);
    updateTailScale(DEFAULTS.tailScale);
    updateGooey(DEFAULTS.gooey);
    updateGooeyStrength(DEFAULTS.gooeyStrength);
  };

  const handleApplyGradient = () => {
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

  const handleGenerateGradient = () => {
    handleApplyGradient();
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

      {/* SVG Liquid Gooey Filter Definition (use visibility:hidden instead of display:none to avoid GPU filter matrix artifacts) */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" style={{ visibility: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="cursor-gooey" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyStrength > 0 ? gooeyStrength : 12} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0 0  0 0 1 0 0 0  0 0 0 30 -10"
            />
          </filter>
        </defs>
      </svg>

      {/* Cursor tail circles */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{
          opacity: isVisible && !handActive && !pickActive && !songPlaying ? opacity : 0,
          visibility: isVisible && !handActive && !pickActive && !songPlaying ? "visible" : "hidden",
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
        className="cursor-pick-pos"
        style={{
          width: handActive ? HAND_W : PICK_W,
          height: handActive ? HAND_H : PICK_H,
          transform: "translate3d(-9999px, -9999px, 0)",
        }}
      >
        <div
          ref={pickSpinRef}
          className={`cursor-pick-spin${((pickActive || songPlaying) && !handActive) ? " is-spinning" : ""}`}
          style={{ clipPath: ((pickActive || songPlaying) && !handActive) ? PICK_CLIP : "none" }}
        >
          <svg
            viewBox="0 0 100 122"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: handActive ? "none" : "block" }}
          >
            <path ref={pickPathRef} d={CIRCLE_PATH_D} style={{ fill: "#9333ea" }} />
          </svg>
          {handActive && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/images/hand.svg" className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md" alt="" />
          )}
          <div
            ref={pickTextRef}
            style={{
              position: "absolute",
              left: "8%",
              right: "8%",
              top: "33%",
              height: "26%",
              display: handActive ? "none" : "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
              ["--pick-font-size" as string]: songPlaying ? "10px" : "14px",
            } as CSSProperties}
          >
            <div className="cursor-pick-row">
              <div className="cursor-pick-track">
                {Array.from({ length: 8 }, (_, i) => <span key={i}>{songPlaying ? SONG_PICK_LABEL : pickLabel}</span>)}
              </div>
            </div>
            <div className="cursor-pick-row reverse">
              <div className="cursor-pick-track">
                {Array.from({ length: 8 }, (_, i) => <span key={i}>{songPlaying ? SONG_PICK_LABEL : pickLabel}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
