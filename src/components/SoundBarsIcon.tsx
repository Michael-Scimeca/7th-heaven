"use client";

import { useEffect, useRef } from "react";

// Menu toggle icon.
// At rest: three horizontal menu lines (bottom line shorter & right-aligned).
// On hover, keyboard focus, or while the menu is open: the three lines recede
// first, then draw outward into an "X".

const VIEW_W = 32;
const VIEW_H = 28;
const CX = 16;
const CY = 14;
const X_R = 6.5;
// resting menu lines (top two full-width, bottom bar shorter & right-aligned)
const REST_Y = [8, 14, 20] as const;
const REST_X1 = [6, 6, 17.2] as const;
const REST_X2 = 26;

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
    let lastTime = 0;

    const wanted = () => openRef.current || focusOn || isHovered || btn.matches(":hover");

    const draw = (e: number) => {
      if (e <= 0.5) {
        // Stage 1 (0 -> 0.5): horizontal lines recede toward the right edge
        const t = Math.max(0, Math.min(1, e * 2));
        const k1 = ease(t);
        const op = (1 - ease(Math.max(0, (t - 0.65) / 0.35))).toFixed(3);

        for (let i = 0; i < 3; i++) {
          const el = lineRefs.current[i];
          if (!el) continue;
          const x1 = lerp(REST_X1[i], REST_X2, k1);
          const y = REST_Y[i];
          el.setAttribute("x1", x1.toFixed(2));
          el.setAttribute("y1", y.toFixed(2));
          el.setAttribute("x2", REST_X2.toFixed(2));
          el.setAttribute("y2", y.toFixed(2));
          el.setAttribute("opacity", op);
        }
      } else {
        // Stage 2 (0.5 -> 1): two diagonals expand from center into an X
        const t = Math.max(0, Math.min(1, (e - 0.5) * 2));
        const k2 = ease(t);
        const r = X_R * k2;
        const op = Math.min(1, t * 3.5).toFixed(3);

        const el0 = lineRefs.current[0];
        if (el0) {
          el0.setAttribute("x1", (CX - r).toFixed(2));
          el0.setAttribute("y1", (CY - r).toFixed(2));
          el0.setAttribute("x2", (CX + r).toFixed(2));
          el0.setAttribute("y2", (CY + r).toFixed(2));
          el0.setAttribute("opacity", op);
        }

        const el1 = lineRefs.current[1];
        if (el1) {
          el1.setAttribute("x1", (CX + r).toFixed(2));
          el1.setAttribute("y1", (CY - r).toFixed(2));
          el1.setAttribute("x2", (CX - r).toFixed(2));
          el1.setAttribute("y2", (CY + r).toFixed(2));
          el1.setAttribute("opacity", op);
        }

        const el2 = lineRefs.current[2];
        if (el2) {
          el2.setAttribute("opacity", "0");
        }
      }
    };

    const loop = (now: number) => {
      const target = wanted() ? 1 : 0;
      if (reduceMotion.matches) {
        h = target;
        draw(h);
        raf = 0;
        lastTime = 0;
        return;
      }

      const dt = lastTime ? Math.min(32, now - lastTime) : 16;
      lastTime = now;
      const speed = dt / 320; // ~160ms recede + ~160ms X expansion
      if (h < target) {
        h = Math.min(target, h + speed);
      } else if (h > target) {
        h = Math.max(target, h - speed);
      }

      draw(h);

      if (Math.abs(target - h) < 0.001) {
        h = target;
        draw(h);
        raf = 0;
        lastTime = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (!raf) {
        lastTime = 0;
        raf = requestAnimationFrame(loop);
      }
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
          x1={REST_X1[i]}
          y1={y}
          x2={REST_X2}
          y2={y}
        />
      ))}
    </svg>
  );
}
