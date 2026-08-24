"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "./Logo";
import { waitForPageReady } from "@/lib/waitForPageReady";

// ─── Preloader ───────────────────────────────────────────────────────────────
// Uses the exact same curtain overlay backdrop, logo sizing, and breathing pulse
// animation as PageTransition.tsx so initial page entry and route-to-route
// navigations are visually and functionally identical.

const FALLBACK = { minVisible: 1200, reveal: 1030 };

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
  const doneRef = useRef(false);
  const pageReadyRef = useRef(false);
  const logoRef = useRef<HTMLDivElement>(null);

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
        try { l.stop(); } catch {}
      }
    };

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      const l = getLenis();
      if (l && typeof l.start === "function") {
        try { l.start(); } catch {}
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

      setLeaving(true);
      root.classList.add("is-revealing");

      timers.push(
        setTimeout(() => {
          setActive(false);
          root.classList.remove("is-preloading", "is-revealing");
          unlockScroll();
          onComplete?.();
        }, revealDurationMs())
      );
    };

    const checkReadyLoop = () => {
      if (doneRef.current) return;
      const elapsed = performance.now() - startedAt;

      if (pageReadyRef.current && elapsed >= minVisibleMs()) {
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
        finish();
      }, 5000)
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
      opacity: 0.45,
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

  if (!active) return null;

  return (
    <div
      className={`preloader preloader-cosmic-bg${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div ref={logoRef}>
        <Logo className="h-8 md:h-11 w-auto text-white" />
      </div>
    </div>
  );
}
