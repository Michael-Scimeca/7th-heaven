"use client";

/**
 * Canvas build: a tiny tween loop walks the shared keyframes and redraws three rounded rects each frame.
 * Toggling mid-animation jumps into the other segment, like a Lottie playSegments call.
 */

import { useEffect, useRef } from "react";
import { barsAt, CLOSE, FPS, OPEN } from "./keyframes";
import { btn } from "./SvgHamburger";

export default function CanvasHamburger({ open, onToggle, size = 96, color = "#fff" }: { open: boolean; onToggle: () => void; size?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0); // current timeline frame
  const first = useRef(true);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const draw = (t: number) => {
      ctx.setTransform(dpr * (size / 64), 0, 0, dpr * (size / 64), 0, 0);
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = color;
      for (const b of barsAt(t)) {
        if (b.w <= 0.1 || b.o <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = b.o;
        ctx.translate(32 + b.x, 32 + b.y);
        ctx.rotate((b.r * Math.PI) / 180);
        ctx.beginPath();
        ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, Math.min(b.h / 2, b.w / 2));
        ctx.fill();
        ctx.restore();
      }
    };

    if (first.current) {
      first.current = false;
      frame.current = open ? OPEN[1] : 0;
      draw(frame.current);
      return;
    }

    const [from, to] = open ? OPEN : CLOSE;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = from;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      t = Math.min(to, t + ((now - last) / 1000) * FPS * (reduce ? 10 : 1));
      last = now;
      frame.current = t;
      draw(t);
      if (t < to) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, size, color]);

  return (
    <button type="button" onClick={onToggle} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} style={btn(size)}>
      <canvas ref={ref} style={{ width: size, height: size }} aria-hidden />
    </button>
  );
}
