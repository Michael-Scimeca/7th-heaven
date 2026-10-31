"use client";

import { useEffect, useRef } from "react";

// Mobile menu icon.
// At rest: three normal horizontal menu lines.
// On hover, keyboard focus, or while the menu is open: smoothly transitions
// into three static vertical sound bars (short / tall / short) without looping animation.

const VIEW_W = 32;
const VIEW_H = 28;
const CY = 14;
// resting menu lines
const REST_Y = [8, 14, 20];
const REST_X1 = 6;
const REST_X2 = 26;
// active sound bars (short, tall, short)
const BAR_X = [11.5, 16, 20.5];
const BAR_H = [10, 20, 10];

const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export default function SoundBarsIcon({ open }: { open: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const openRef = useRef(open);
  const kickRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    openRef.current = open;
    kickRef.current?.();
  }, [open]);

  useEffect(() => {
    const svg = svgRef.current;
    const btn = svg?.closest("button");
    if (!svg || !btn) return () => {};

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let h = openRef.current ? 1 : 0;
    let raf = 0;
    let focusOn = false;
    let isHovered = false;

    const wanted = () => openRef.current || focusOn || isHovered || btn.matches(":hover");

    const draw = (e: number) => {
      for (let i = 0; i < 3; i++) {
        const el = lineRefs.current[i];
        if (!el) continue;
        const H = BAR_H[i];
        // Two clean steps (no tilting): lines shrink sideways into dots at the
        // bar positions, then the dots stretch up into bars.
        const k1 = ease(Math.min(1, e * 2));
        const k2 = ease(Math.max(0, e * 2 - 1));
        const cx = lerp((REST_X1 + REST_X2) / 2, BAR_X[i], k1);
        const cy = lerp(REST_Y[i], CY, k1);
        const hw = lerp((REST_X2 - REST_X1) / 2, 0, k1);
        const hh = lerp(0, H / 2, k2);
        el.setAttribute("x1", (cx - hw).toFixed(2));
        el.setAttribute("x2", (cx + hw).toFixed(2));
        el.setAttribute("y1", (cy - hh).toFixed(2));
        el.setAttribute("y2", (cy + hh).toFixed(2));
      }
    };

    const loop = () => {
      const target = wanted() ? 1 : 0;
      if (reduceMotion.matches) {
        h = target;
        draw(h);
        raf = 0;
        return;
      }

      h += (target - h) * 0.18;
      if (Math.abs(target - h) < 0.002) {
        h = target;
        draw(h);
        raf = 0;
        return;
      }
      draw(h);
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    const onEnter = () => {
      isHovered = true;
      kick();
    };
    const onLeave = () => {
      isHovered = false;
      kick();
    };
    const onFocus = () => {
      focusOn = btn.matches(":focus-visible");
      kick();
    };
    const onBlur = () => {
      focusOn = false;
      kick();
    };

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mouseleave", onLeave);
    btn.addEventListener("focus", onFocus);
    btn.addEventListener("blur", onBlur);

    // Initial draw to match current state
    draw(h);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      kickRef.current = null;
      btn.removeEventListener("pointerenter", onEnter);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("mouseleave", onLeave);
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
      className="h-[28px] w-[32px] overflow-visible pointer-events-none"
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
