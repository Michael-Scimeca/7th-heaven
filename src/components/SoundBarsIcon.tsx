"use client";

import { useEffect, useRef } from "react";

// Mobile menu icon.
// At rest: three normal horizontal menu lines.
// On hover, keyboard focus, and while the menu is open: the lines stand up into
// three tightly spaced vertical bars that pulse short / tall / short like a sound meter.
// Respects prefers-reduced-motion (bars still appear, but don't pulse).

const VIEW_W = 32;
const VIEW_H = 28;
const CY = 14;
// resting menu lines
const REST_Y = [8, 14, 20];
const REST_X1 = 6;
const REST_X2 = 26;
// active bars (tight spacing)
const BAR_X = [11.5, 16, 20.5];
const BAR_H = [10, 20, 10];

const beat = (t: number) => Math.exp(-((t * 2) % 1) * 6);
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export default function SoundBarsIcon({ open }: { open: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
    kickRef.current?.();
  }, [open]);

  const kickRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const btn = svg?.closest("button");
    if (!svg || !btn) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let h = 0;
    let raf = 0;
    let focusOn = false;

    const wanted = () => openRef.current || focusOn || btn.matches(":hover");

    const draw = (t: number) => {
      const e = ease(h);
      for (let i = 0; i < 3; i++) {
        const el = lineRefs.current[i];
        if (!el) continue;
        const pulse = reduceMotion.matches ? 1 : 0.55 + 0.45 * beat(t - i * 0.05);
        const H = BAR_H[i] * pulse;
        el.setAttribute("x1", lerp(REST_X1, BAR_X[i], e).toFixed(2));
        el.setAttribute("x2", lerp(REST_X2, BAR_X[i], e).toFixed(2));
        el.setAttribute("y1", lerp(REST_Y[i], CY - H / 2, e).toFixed(2));
        el.setAttribute("y2", lerp(REST_Y[i], CY + H / 2, e).toFixed(2));
      }
    };

    const loop = () => {
      const t = performance.now() / 1000;
      const target = wanted() ? 1 : 0;
      h += (target - h) * 0.16;
      if (target === 0 && h < 0.002) {
        h = 0;
        draw(t);
        raf = 0;
        return;
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    const onFocus = () => {
      focusOn = btn.matches(":focus-visible");
      kick();
    };
    const onBlur = () => {
      focusOn = false;
      kick();
    };
    btn.addEventListener("pointerenter", kick);
    btn.addEventListener("mouseenter", kick);
    btn.addEventListener("focus", onFocus);
    btn.addEventListener("blur", onBlur);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      kickRef.current = null;
      btn.removeEventListener("pointerenter", kick);
      btn.removeEventListener("mouseenter", kick);
      btn.removeEventListener("focus", onFocus);
      btn.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinecap="round"
      className="h-[28px] w-[32px] overflow-visible"
      aria-hidden="true"
    >
      {REST_Y.map((y, i) => (
        <line
          key={y}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          x1={REST_X1}
          y1={y}
          x2={REST_X2}
          y2={y}
        />
      ))}
    </svg>
  );
}
