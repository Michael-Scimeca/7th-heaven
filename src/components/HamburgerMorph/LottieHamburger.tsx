"use client";

/** Lottie build: lottie-web plays the generated animation, using playSegments for open/close. */

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import { CLOSE, OPEN } from "./keyframes";
import { hamburgerLottie } from "./lottieData";
import { btn } from "./SvgHamburger";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function LottieHamburger({ open, onToggle, size = 96, color = "#ffffff" }: { open: boolean; onToggle: () => void; size?: number; color?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const first = useRef(true);

  useEffect(() => {
    let cancelled = false;
    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !host.current) return;
      anim.current = lottie.loadAnimation({
        container: host.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: hamburgerLottie(hexToRgb(color)),
      });
      anim.current.goToAndStop(0, true);
    }).catch(() => {});
    return () => {
      cancelled = true;
      anim.current?.destroy();
      anim.current = null;
    };
  }, [color]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const a = anim.current;
    if (!a) return;
    a.setSpeed(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 1);
    a.playSegments(open ? OPEN : CLOSE, true);
  }, [open]);

  return (
    <button type="button" onClick={onToggle} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} style={btn(size)}>
      <span ref={host} style={{ width: size, height: size, display: "block" }} aria-hidden />
    </button>
  );
}
