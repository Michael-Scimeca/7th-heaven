"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { waitForPageReady } from "@/lib/waitForPageReady";

// ─── Preloader ───────────────────────────────────────────────────────────────
// Shape measured frame by frame from the reference recording:
//   - instant cut to black (ONE frame, not a fade)
//   - mark is already on screen at ~27% brightness and sits flat there ~200ms
//   - it then FILLS from the bottom edge upward over ~1030ms. Not a fade:
//     sampling the mark in horizontal bands showed the lowest band reaching
//     full brightness ~600ms before the top band did. Averaging brightness
//     across the whole mark hides that completely, which is how an earlier
//     pass concluded "opacity ramp" and got it wrong.
//   - the overlay then leaves as an outgoing page while the real page arrives
//
// That last step reuses page-push-out/page-push-in from globals.css rather
// than restating the motion, so entering the site and navigating within it are
// the same movement by construction.
//
// Runs on every full document load — PRELOAD_SCRIPT_CONTENT in layout.tsx is
// the single gate. This component keeps no state of its own about whether it
// has run, so there is nothing here that can disagree with that script.

// Every tunable lives in globals.css (:root) and is read back at runtime, so
// this file cannot drift out of step with the stylesheet.
const FALLBACK = { minVisible: 1250, reveal: 620 };

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
  const doneRef = useRef(false);

  /* eslint-disable react-doctor/effect-needs-cleanup */
  useEffect(() => {
    const root = document.documentElement;
    const shouldRun = forceShow || root.classList.contains("is-preloading");

    if (!shouldRun) {
      root.classList.remove("is-preloading");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
      onComplete?.();
      return;
    }

    // Lock all scrolling while preloader is active
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    (window as unknown as { lenis?: { stop: () => void } }).lenis?.stop();

    setActive(true);
    const startedAt = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;

      // Both layers start in the SAME frame, exactly as a route change does:
      // the overlay leaves on page-push-out while the page arrives on
      // page-push-in.
      setLeaving(true);
      root.classList.add("is-revealing");

      timers.push(
        setTimeout(() => {
          // The overlay stays mounted for the whole reveal so it can travel
          // off screen. Unmounting it when the reveal starts (as an earlier
          // version did) made it vanish on the first frame instead of leaving.
          setActive(false);
          root.classList.remove("is-preloading", "is-revealing");
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
          (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
          onComplete?.();
        }, revealDurationMs())
      );
    };

    waitForPageReady().then(() => {
      const waited = performance.now() - startedAt;
      timers.push(setTimeout(finish, Math.max(0, minVisibleMs() - waited)));
    });

    // Hard backstop: never strand a visitor on a black screen because one font
    // or image never resolved. waitForPageReady has its own deadline, but this
    // covers it throwing or never settling at all.
    timers.push(setTimeout(finish, 6000));

    return () => timers.forEach(clearTimeout);
  }, [forceShow, onComplete]);

  if (!active) return null;

  return (
    <div
      className={`preloader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="preloader-mark">
        {/* Dim copy underneath, full-brightness copy clipped over it and
            revealed from the bottom edge upward. */}
        <Logo className="preloader-logo preloader-logo-base" />
        <Logo className="preloader-logo preloader-logo-fill" />
      </div>
    </div>
  );
}
