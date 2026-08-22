"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { waitForPageReady } from "@/lib/waitForPageReady";

// ─── Preloader ───────────────────────────────────────────────────────────────
// Timings below were originally measured frame-by-frame off a screen
// recording, then corrected by live-inspecting exoape.com's actual shipped
// source (window.$nuxt.$root + its component bundle) directly — the
// recording-based numbers for the fill duration and dim hold turned out to
// be off, the source values are ground truth:
//   - instant cut to black (ONE frame, not a fade)
//   - mark is on screen at 20% brightness (exoape: rgba(light-grey, 0.2) on
//     their dim `.background` layer) with NO hold — their fill tween starts
//     at timeline position 0, immediately on mount
//   - it then FILLS from the bottom edge upward over 2000ms (exoape: their
//     `.filler` bar is an explicit GSAP `duration: 2` scaleY tween, not a
//     fade). Not a fade here either: sampling the mark in horizontal bands
//     showed the lowest band reaching full brightness well before the top
//     band did — averaging brightness across the whole mark hides that
//     completely, which is how an earlier pass concluded "opacity ramp" and
//     got it wrong.
//   - the mark then shrinks + fades in place (see .preloader-mark.is-leaving
//     in globals.css) WHILE the overlay leaves as an outgoing page and the
//     real page arrives — exoape's icon/fill group animates independently
//     (scale 1->0, autoAlpha 1->0) at the same time as their curtain-lift,
//     not just riding along attached to it.
//
// The curtain-lift step reuses page-push-out/page-push-in's easing curve
// (not the motion itself — the preloader is a simple translateY, the route
// transition is a measured push) so entering the site and navigating within
// it feel like the same system rather than two independently-tuned ones.
//
// Runs on every full document load — PRELOAD_SCRIPT_CONTENT in layout.tsx is
// the single gate. This component keeps no state of its own about whether it
// has run, so there is nothing here that can disagree with that script.

// Every tunable lives in globals.css (:root) and is read back at runtime, so
// this file cannot drift out of step with the stylesheet. These are only the
// last-resort fallback if that CSS read fails for some reason.
const FALLBACK = { minVisible: 2000, reveal: 1030 };

function cssMs(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return fallback;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  // Chrome normalises 620ms to .62s, so the unit must be checked, not assumed.
  return raw.endsWith("ms") ? n : n * 1000;
}

const minVisibleMs = () => cssMs("--preloader-min-visible", FALLBACK.minVisible);
const revealDurationMs = () => cssMs("--preloader-reveal-duration", FALLBACK.reveal);

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  // Starts false on both server and client so hydration matches. The black for
  // the very first paint does NOT come from this component — it comes from the
  // html.is-preloading::before rule, which the blocking inline script in
  // layout.tsx switches on before anything paints. Without that there would be
  // a visible flash of the real page before React ever mounted.
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [fillPercent, setFillPercent] = useState(0);
  const doneRef = useRef(false);
  const pageReadyRef = useRef(false);

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

    // Lock all scrolling while preloader is active
    lockScroll();

    setActive(true);
    const startedAt = performance.now();
    let rafId: number;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setFillPercent(100);

      // Both layers start in the SAME frame, exactly as a route change does:
      // the overlay leaves on page-push-out while the page arrives on page-push-in.
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

    // Smoothly animate logo fill percentage to match actual load progress
    const animateFill = () => {
      if (doneRef.current) return;
      const elapsed = performance.now() - startedAt;

      let target: number;
      if (pageReadyRef.current) {
        // Page is ready: fill swiftly to 100% and finish
        target = 100;
      } else {
        // Page still loading: progress smoothly up to 90% over 2.2s while waiting
        target = Math.min(90, (elapsed / 2200) * 90);
      }

      setFillPercent((prev) => {
        const delta = target - prev;
        const speed = pageReadyRef.current ? 0.25 : 0.12;
        const next = prev + delta * speed;
        if (pageReadyRef.current && next >= 98) {
          finish();
          return 100;
        }
        return next;
      });

      rafId = requestAnimationFrame(animateFill);
    };

    rafId = requestAnimationFrame(animateFill);

    waitForPageReady().then(() => {
      pageReadyRef.current = true;
    });

    // Hard backstop timeout: ensure finish() is triggered even if an asset stalls
    timers.push(setTimeout(() => {
      pageReadyRef.current = true;
      finish();
    }, 5000));

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
    };
  }, [forceShow, onComplete]);

  if (!active) return null;

  return (
    <div
      className={`preloader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className={`preloader-mark${leaving ? " is-leaving" : ""}`}>
        <Logo className="preloader-logo preloader-logo-base" />
        <Logo
          className="preloader-logo preloader-logo-fill"
          style={{
            clipPath: `inset(${Math.max(0, 100 - fillPercent).toFixed(2)}% 0 0 0)`,
            animation: "none",
          }}
        />
      </div>
    </div>
  );
}
