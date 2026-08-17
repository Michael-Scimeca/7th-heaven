"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { waitForPageReady } from "@/lib/waitForPageReady";

// ─── Preloader ───────────────────────────────────────────────────────────────
// Shape is taken frame by frame from the reference recording:
//   - instant cut to black (ONE frame, not a fade)
//   - mark appears immediately at ~27% brightness and sits there ~200ms
//   - brightens to full over ~1030ms, ease-in-out, with a long asymptotic
//     tail; its bounding box stays 107-110px the whole time, so this is a
//     brightness/opacity ramp and NOT a scale
//   - holds at full ~600ms
//   - shrinks to ~75% and dims to ~75% over ~230ms
//   - the page then pushes up from below
//
// That last step deliberately reuses the page-push-in keyframes from
// globals.css rather than restating the motion, so the site's entry and its
// route changes stay identical by construction — retuning one retunes both.

// Session-scoped: shows on first arrival, not on later refreshes in the same
// tab. sessionStorage (not localStorage) so a new tab or a new day shows it
// again, and no persistent state is left on anyone's machine.
const SESSION_KEY = "7h-preloaded";

// Chosen behaviour: reveal as soon as assets are actually ready, with NO
// artificial floor. On a warm cache that means the mark can appear for only a
// few hundred ms. If that ever reads as a glitch, this is the one line to
// change — 900 would guarantee the brighten is at least mostly seen.
const MIN_VISIBLE_MS = 0;

const LOGO_BRIGHTEN_MS = 1030;
const LOGO_EXIT_MS = 230;
// Keep in step with --page-transition-duration in globals.css.
const REVEAL_FALLBACK_MS = 930;

function revealDurationMs(): number {
  if (typeof window === "undefined") return REVEAL_FALLBACK_MS;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--page-transition-duration")
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return REVEAL_FALLBACK_MS;
  return raw.endsWith("ms") ? n : n * 1000;
}

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  // Starts false on both server and client so hydration matches. The black
  // backdrop for the very first paint does NOT come from this component — it
  // comes from the `html.is-preloading::before` rule in globals.css, which the
  // blocking inline script in layout.tsx switches on before anything paints.
  // Otherwise there would be a visible flash of the real page before React
  // ever mounted.
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const shouldRun = forceShow || root.classList.contains("is-preloading");

    if (!shouldRun) {
      root.classList.remove("is-preloading");
      onComplete?.();
      return () => {};
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private mode / storage disabled — the preloader simply shows again
      // next navigation. Not worth failing the page load over.
    }

    setActive(true);

    const finishTimer = setTimeout(() => {
      setExiting(true);
      root.classList.add("is-revealing");
      setActive(false);
    }, MIN_VISIBLE_MS + LOGO_EXIT_MS);

    const revealTimer = setTimeout(() => {
      root.classList.remove("is-preloading", "is-revealing");
      onComplete?.();
    }, MIN_VISIBLE_MS + LOGO_EXIT_MS + revealDurationMs());

    return () => {
      clearTimeout(finishTimer);
      clearTimeout(revealTimer);
    };
  }, [forceShow, onComplete]);

  if (!active) return null;

  return (
    <div className="preloader" role="status" aria-label="Loading" aria-live="polite">
      <div className={`preloader-mark${exiting ? " is-exiting" : ""}`}>
        <Logo className="preloader-logo" />
      </div>
    </div>
  );
}
