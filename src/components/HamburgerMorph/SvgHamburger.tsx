"use client";

/**
 * SVG build: three round-capped <line>s animated purely with CSS @keyframes
 * (transform + stroke-width + opacity). The keyframe CSS is generated from the shared table.
 */

import { useState } from "react";
import { CLOSE, KEYS, OPEN } from "./keyframes";

const BASE = 26; // drawn line length; visual length = line + round caps

function keyframesFor(name: string, idx: number, [from, to]: [number, number]) {
  const keys = KEYS.filter((k) => k.t >= from && k.t <= to);
  const steps = keys
    .map((k) => {
      const b = k.bars[idx];
      const pct = (((k.t - from) / (to - from)) * 100).toFixed(2);
      const len = Math.max(b.w - b.h, 0.01);
      return `${pct}% { transform: translate(${b.x}px, ${b.y}px) rotate(${b.r}deg) scaleX(${(len / BASE).toFixed(4)}); stroke-width: ${b.h}px; opacity: ${b.o}; animation-timing-function: cubic-bezier(.65,0,.35,1); }`;
    })
    .join("\n");
  return `@keyframes ${name} {\n${steps}\n}`;
}

const NAMES = ["top", "mid", "bot"];
const CSS =
  NAMES.map((n, i) => keyframesFor(`hmsvg-open-${n}`, i, OPEN) + "\n" + keyframesFor(`hmsvg-close-${n}`, i, CLOSE)).join("\n") +
  `
.hmsvg line { transform-box: view-box; transform-origin: 32px 32px; stroke-linecap: round; vector-effect: non-scaling-stroke; }
${NAMES.map((n, i) => {
  const b = KEYS[0].bars[i];
  return `.hmsvg .${n} { transform: translate(${b.x}px, ${b.y}px) scaleX(${((b.w - b.h) / BASE).toFixed(4)}); stroke-width: ${b.h}px; }
.hmsvg.is-open .${n} { animation: hmsvg-open-${n} ${(OPEN[1] - OPEN[0]) / 60}s linear forwards; }
.hmsvg.is-closed .${n} { animation: hmsvg-close-${n} ${(CLOSE[1] - CLOSE[0]) / 60}s linear forwards; }`;
}).join("\n")}
@media (prefers-reduced-motion: reduce) { .hmsvg line { animation-duration: 0.01s !important; } }
`;

export default function SvgHamburger({ open, onToggle, size = 96, color = "#fff" }: { open: boolean; onToggle: () => void; size?: number; color?: string }) {
  // until first toggle, show the plain hamburger (no close animation on load)
  const [touched, setTouched] = useState(false);
  const cls = `hmsvg ${open ? "is-open" : touched ? "is-closed" : ""}`;

  return (
    <button
      type="button"
      onClick={() => {
        setTouched(true);
        onToggle();
      }}
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      style={btn(size)}
    >
      <style>{CSS}</style>
      <svg key={cls} className={cls} viewBox="0 0 64 64" width={size} height={size} stroke={color} aria-hidden>
        {NAMES.map((n) => (
          <line key={n} className={n} x1={32 - BASE / 2} y1="32" x2={32 + BASE / 2} y2="32" />
        ))}
      </svg>
    </button>
  );
}

export const btn = (size: number) =>
  ({ width: size, height: size, padding: 0, border: 0, background: "none", cursor: "pointer", display: "grid", placeItems: "center" }) as const;
