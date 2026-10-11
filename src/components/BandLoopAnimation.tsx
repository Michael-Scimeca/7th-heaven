"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

// 8s looping Lottie of the cartoon band (built by scripts/build-band-lottie.py).
// /lottie/* is served immutable, so bump the version whenever the JSON is rebuilt.
const BAND_LOTTIE_URL = "/lottie/band-loop.json?v=2";

export default function BandLoopAnimation({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let isMounted = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.all([
      import("lottie-web"),
      fetch(BAND_LOTTIE_URL)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([lottieModule, bandData]) => {
        if (!isMounted || !containerRef.current || !bandData) return;
        const lottie = lottieModule.default || lottieModule;
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: !reduceMotion,
          animationData: bandData,
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (anim) anim.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Cartoon 7th Heaven band rocking out"
      className={`pointer-events-none aspect-[1249/564] w-full ${className}`}
    />
  );
}
