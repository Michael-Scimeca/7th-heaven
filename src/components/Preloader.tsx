"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "./Logo";
import { waitForPageReady } from "@/lib/waitForPageReady";

// ─── Preloader ───────────────────────────────────────────────────────────────
// Uses the exact same curtain overlay backdrop, logo sizing, and breathing pulse
// animation as PageTransition.tsx so initial page entry and route-to-route
// navigations are visually and functionally identical.

const FALLBACK = { minVisible: 300, reveal: 350 };

function cssMs(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return fallback;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith("ms") ? n : n * 1000;
}

const minVisibleMs = () => cssMs("--preloader-min-visible", FALLBACK.minVisible);
const revealDurationMs = () => cssMs("--preloader-reveal-duration", FALLBACK.reveal);

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [fillPercent, setFillPercent] = useState(0);
  const doneRef = useRef(false);
  const pageReadyRef = useRef(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const fillProgressRef = useRef(0);

  /* eslint-disable react-doctor/effect-needs-cleanup */
  useEffect(() => {
    const root = document.documentElement;
    const shouldRun = forceShow || root.classList.contains("is-preloading");

    const getLenis = () => {
      if (typeof window === "undefined") return null;
      const l = (window as any).__lenis || (window as any).lenis;
      return l && typeof l === "object" ? l : null;
    };

    const lockScroll = () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      const l = getLenis();
      if (l && typeof l.stop === "function") {
        try { l.stop(); } catch { }
      }
    };

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      const l = getLenis();
      if (l && typeof l.start === "function") {
        try { l.start(); } catch { }
      }
    };

    if (!shouldRun) {
      root.classList.remove("is-preloading");
      unlockScroll();
      onComplete?.();
      return;
    }

    lockScroll();
    setActive(true);
    const startedAt = performance.now();
    let rafId: number;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      if (doneRef.current || forceShow) return;
      doneRef.current = true;
      fillProgressRef.current = 100;
      setFillPercent(100);

      setLeaving(true);
      root.classList.add("is-revealing");

      timers.push(
        setTimeout(() => {
          setActive(false);
          root.classList.remove("is-preloading", "is-revealing");
          unlockScroll();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("7h-preloader-done"));
          }
          onComplete?.();
        }, revealDurationMs())
      );
    };

    fillProgressRef.current = 0;
    setFillPercent(0);

    const checkReadyLoop = () => {
      if (doneRef.current) return;
      const elapsed = performance.now() - startedAt;
      const minVis = Math.max(600, minVisibleMs());

      // Progress starts at 0% and ramps smoothly up to 92% based on elapsed duration
      let timeRatio = Math.min(1, elapsed / minVis);
      let targetProgress = Math.floor(timeRatio * 92);

      if (pageReadyRef.current && elapsed >= minVis) {
        targetProgress = 100;
      }

      // Smooth lerp from current progress to targetProgress
      const lerpSpeed = pageReadyRef.current && elapsed >= minVis ? 0.3 : 0.18;
      fillProgressRef.current += (targetProgress - fillProgressRef.current) * lerpSpeed;
      const currentFill = Math.min(100, Math.round(fillProgressRef.current));
      setFillPercent((prev) => (prev !== currentFill ? currentFill : prev));

      if (pageReadyRef.current && elapsed >= minVis && currentFill >= 98) {
        finish();
      } else {
        rafId = requestAnimationFrame(checkReadyLoop);
      }
    };

    rafId = requestAnimationFrame(checkReadyLoop);

    waitForPageReady().then(() => {
      pageReadyRef.current = true;
    });

    timers.push(
      setTimeout(() => {
        pageReadyRef.current = true;
      }, 1500)
    );

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
    };
  }, [forceShow, onComplete]);

  // Logo breathing shimmer pulse — identical to PageTransition.tsx
  useEffect(() => {
    if (!active || leaving) return;
    const logo = logoRef.current;
    if (!logo) return;

    const tween = gsap.to(logo, {
      opacity: 0.85,
      duration: 0.9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tween.kill();
      gsap.set(logo, { opacity: 1 });
    };
  }, [active, leaving]);

  const interRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || leaving) return;
    const inter = interRef.current;
    if (!inter) return;

    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      tgX = e.clientX;
      tgY = e.clientY;
    };

    const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      if (inter) {
        inter.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      }
      animId = requestAnimationFrame(move);
    };

    window.addEventListener("mousemove", onMouseMove);
    animId = requestAnimationFrame(move);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [active, leaving]);

  if (!active) return null;

  return (
    <div
      className={`preloader preloader-cosmic-bg${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* ── 7th Heaven Logo Progressive Bottom-To-Top Fill ── */}
      <div ref={logoRef} className="relative z-10 select-none flex flex-col items-center gap-3">
        <div className="relative inline-flex items-center justify-center">
          {/* Base Unfilled Logo Outline (20% Opacity) */}
          <Logo className="h-9 md:h-12 w-auto text-white/20" />

          {/* Foreground Filled Logo (Fills up vertically from bottom to top based on fillPercent) */}
          <div
            className="absolute inset-0 overflow-hidden transition-[clip-path] duration-75 ease-out"
            style={{
              clipPath: `inset(${100 - fillPercent}% 0 0 0)`,
            }}
          >
            <Logo className="h-9 md:h-12 w-auto text-white filter drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]" />
          </div>
        </div>


      </div>
    </div>
  );
}
