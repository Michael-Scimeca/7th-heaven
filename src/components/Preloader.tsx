"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

// Simple, original logo-reveal preloader: fades a centered mark in, holds
// briefly, fades the whole overlay out. Deliberately timer-driven rather than
// tied to window "load" or asset-readiness events -- a previous version of
// this component waited on page-readiness signals that didn't always fire
// (some routes with query params never resolved them), which held the
// overlay on screen indefinitely. A fixed timer can't hang.
//
// Runs once per full document load (gated by the `is-preloading` class the
// inline script in layout.tsx adds before paint), never on client-side route
// changes -- those get PageTransition's crossfade instead.
type Phase = "in" | "hold" | "out" | "done";

const HOLD_AT_MS = 80;
const FADE_OUT_AT_MS = 750;
const DONE_AT_MS = 1200;

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const html = document.documentElement;

    if (!html.classList.contains("is-preloading")) {
      setPhase("done");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      html.classList.remove("is-preloading");
      setPhase("done");
      return;
    }

    const timers = [
      setTimeout(() => setPhase("hold"), HOLD_AT_MS),
      setTimeout(() => setPhase("out"), FADE_OUT_AT_MS),
      setTimeout(() => {
        html.classList.remove("is-preloading");
        setPhase("done");
      }, DONE_AT_MS),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`preloader-overlay preloader-overlay--${phase}`} aria-hidden="true">
      <div className="preloader-overlay__mark">
        <Logo className="preloader-overlay__logo" />
      </div>
    </div>
  );
}
