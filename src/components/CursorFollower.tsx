"use client";

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function CursorFollower() {
  const pathname = usePathname();
  const [isTouch, setIsTouch] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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
        circlesRef.current.forEach((c, i) => {
          if (!c.el) return;
          const baseScale = (circlesRef.current.length - i) / circlesRef.current.length;
          const scale = baseScale * tailScale;
          c.el.style.transform = `translate3d(${x - circleSize / 2}px, ${y - circleSize / 2}px, 0) scale(${scale})`;
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

  if (isTouch) return null;

  const colors = palette === "Custom"
    ? (customColors.length > 0 ? customColors : ["#a855f7"])
    : (COLOR_PRESETS[palette] ?? COLOR_PRESETS.Purple);

  const glowColor = colors[colors.length - 1] ?? "#a855f7";

  const set = <T,>(setter: (v: T) => void, key: string) => (v: T) => { setter(v); saveSetting(key, v); };

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
        }
        @keyframes cursorScaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}} />

      {/* SVG Liquid Gooey Filter Definition */}
      <svg className="hidden absolute w-0 h-0 pointer-events-none" aria-hidden="true">
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
          opacity: isVisible ? opacity : 0,
          visibility: isVisible ? "visible" : "hidden",
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

      {/* ── Settings Panel Button ── */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2" style={{ zIndex: 2147483646 }}>
        {!panelOpen ? (
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-wider hover:bg-black/95 hover:border-purple-400 hover:scale-105 active:scale-95 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.6)] select-none"
            title="Cursor Settings"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse" />
            <span>Cursor Settings</span>
          </button>
        ) : (
          <div
            className="w-[320px] max-h-[85vh] overflow-y-auto bg-black/95 backdrop-blur-2xl border border-white/15 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-4 select-none text-white scrollbar-thin"
            style={{ animation: "cursorScaleIn 0.18s ease-out" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider  text-[var(--color-accent)] block">Cursor Settings</span>
                <span className="text-[9px] text-white/40 uppercase font-semibold">Customize your cursor trail</span>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xs font-bold"
              >✕</button>
            </div>

            {/* Gooey Effect Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-purple-900/20 border border-purple-500/30">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Liquid Gooey Mode 🧪</span>
                <span className="text-[8px] text-white/50">Fuses trail circles into gooey liquid</span>
              </div>
              <button
                onClick={() => set<boolean>(setGooey, "gooey")(!gooey)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${gooey ? "bg-purple-600 justify-end" : "bg-white/10 justify-start"
                  }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>

            {/* Gooey Fusion Strength Slider */}
            {gooey && (
              <SliderRow
                label="Gooey Fusion"
                value={gooeyStrength}
                min={2} max={18} step={1}
                display={`${gooeyStrength}`}
                onChange={set<number>(setGooeyStrength, "gooeyStrength")}
              />
            )}

            {/* Color Palette Presets */}
            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-white/50 uppercase tracking-wider block">Color Palette</span>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_NAMES.map(name => {
                  const cols = name === "Custom" ? customColors : COLOR_PRESETS[name];
                  const mid = cols?.[Math.floor((cols?.length ?? 0) / 2)] ?? "#a855f7";
                  return (
                    <button
                      key={name}
                      onClick={() => set<string>(setPalette, "palette")(name)}
                      className={`px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg border transition-colors text-left truncate ${palette === name
                        ? "border-purple-400 bg-purple-600/30 text-white"
                        : "border-white/10 bg-white/5 hover:bg-purple-600/20 hover:border-purple-400 text-white/70"
                        }`}
                      style={{ borderLeftColor: mid, borderLeftWidth: 3 }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              {/* ── Per-Circle & Custom Color Builder ── */}
              <div className="space-y-2 border border-white/10 p-3 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold  text-[var(--color-accent)] uppercase tracking-wider block">
                    Custom & Per-Circle Colors
                  </span>
                  <button
                    onClick={() => setShowPerCircleEdit(!showPerCircleEdit)}
                    className="text-[9px] font-bold text-white/50 hover:text-purple-300 uppercase underline transition-colors"
                  >
                    {showPerCircleEdit ? "Hide Circle Breakdown" : "Edit Each Circle (" + numCircles + ")"}
                  </button>
                </div>

                {/* Gradient Builder Tools */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <span className="text-[8.5px] font-bold text-white/40 uppercase tracking-wider block">Quick Gradient Generator</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={gradStart}
                        onChange={e => setGradStart(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                        title="Start Color"
                      />
                      <span className="text-[9px] font-mono text-white/40">→</span>
                      <input
                        type="color"
                        value={gradEnd}
                        onChange={e => setGradEnd(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                        title="End Color"
                      />
                    </div>

                    <button
                      onClick={handleGenerateGradient}
                      className="px-2 py-1.5 bg-purple-600/40 hover:bg-purple-600/70 border border-purple-400/40 text-white text-[8.5px] font-extrabold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Fill
                    </button>
                    <button
                      onClick={handleGenerateRainbow}
                      className="px-1.5 py-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white text-[8.5px] font-extrabold uppercase tracking-wider rounded-lg transition-colors hover:scale-105"
                      title="Generate Rainbow Spectrum"
                    >
                      🌈 Rainbow
                    </button>
                    <button
                      onClick={handleReverseColors}
                      className="px-2 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[8.5px] font-extrabold uppercase tracking-wider rounded-lg transition-colors"
                      title="Reverse Color Trail Order"
                    >
                      ⇄ Reverse
                    </button>
                  </div>
                </div>

                {/* Individual Circle Breakdown (Show/Hide) */}
                {showPerCircleEdit && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10 max-h-[180px] overflow-y-auto pr-1">
                    <span className="text-[8.5px] font-extrabold text-white/50 uppercase tracking-wider block mb-1">
                      Individual Circle Swatches (Circle #1 to #{numCircles})
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Array.from({ length: numCircles }).map((_, i) => {
                        const circleColor = colors[i % colors.length] || "#a855f7";
                        const hexVal = circleColor.startsWith("#") ? circleColor : "#a855f7";
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:border-purple-400/50 transition-colors"
                          >
                            <input
                              type="color"
                              value={hexVal}
                              onChange={e => handleUpdateCircleColor(i, e.target.value)}
                              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-extrabold uppercase text-purple-300 leading-tight">
                                #{i + 1} {i === 0 ? "(Head)" : i === numCircles - 1 ? "(Tail)" : ""}
                              </span>
                              <span className="text-[7.5px] font-mono text-white/50 truncate leading-tight">
                                {circleColor}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tail Length */}
            <SliderRow
              label="Tail Length"
              value={numCircles}
              min={3} max={40} step={1}
              display={`${numCircles}`}
              onChange={set<number>(setNumCircles, "numCircles")}
            />

            {/* Circle Size */}
            <SliderRow
              label="Circle Size"
              value={circleSize}
              min={4} max={60} step={1}
              display={`${circleSize}px`}
              onChange={set<number>(setCircleSize, "circleSize")}
            />

            {/* Tail Scale Factor */}
            <SliderRow
              label="Tail Size Scale"
              value={tailScale}
              min={0.2} max={1.5} step={0.05}
              display={`${Math.round(tailScale * 100)}%`}
              onChange={set<number>(setTailScale, "tailScale")}
            />

            {/* Blur */}
            <SliderRow
              label="Blur"
              value={blur}
              min={0} max={20} step={0.5}
              display={`${blur}px`}
              onChange={set<number>(setBlur, "blur")}
            />

            {/* Glow */}
            <SliderRow
              label="Glow"
              value={glow}
              min={0} max={40} step={1}
              display={`${glow}px`}
              onChange={set<number>(setGlow, "glow")}
            />

            {/* Speed */}
            <SliderRow
              label="Trail Speed"
              value={speed}
              min={0.02} max={0.5} step={0.01}
              display={speed.toFixed(2)}
              onChange={set<number>(setSpeed, "speed")}
            />

            {/* Opacity */}
            <SliderRow
              label="Opacity"
              value={opacity}
              min={0.1} max={1} step={0.05}
              display={`${Math.round(opacity * 100)}%`}
              onChange={set<number>(setOpacity, "opacity")}
            />

            {/* Reset */}
            <button
              onClick={() => {
                set<number>(setNumCircles, "numCircles")(DEFAULTS.numCircles);
                set<number>(setCircleSize, "circleSize")(DEFAULTS.circleSize);
                set<number>(setBlur, "blur")(DEFAULTS.blur);
                set<number>(setGlow, "glow")(DEFAULTS.glow);
                set<number>(setSpeed, "speed")(DEFAULTS.speed);
                set<number>(setOpacity, "opacity")(DEFAULTS.opacity);
                set<number>(setTailScale, "tailScale")(DEFAULTS.tailScale);
                set<boolean>(setGooey, "gooey")(DEFAULTS.gooey);
                set<number>(setGooeyStrength, "gooeyStrength")(DEFAULTS.gooeyStrength);
                set<string>(setPalette, "palette")(DEFAULTS.palette);
              }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-extrabold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>
        )}
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
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-none"
      />
    </div>
  );
}
