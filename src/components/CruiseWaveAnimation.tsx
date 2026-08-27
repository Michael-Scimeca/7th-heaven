"use client";

import { useEffect, useRef } from "react";
export default function CruiseWaveAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: any = null;
    let isMounted = true;

    Promise.all([
      import("lottie-web"),
      fetch("/lottie/cruise-wave.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([lottieModule, waveData]) => {
      if (!isMounted || !containerRef.current || !waveData) return;
      const lottie = lottieModule.default || lottieModule;
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: waveData,
      });
    }).catch(() => {});

    return () => {
      isMounted = false;
      if (anim) anim.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute -bottom-0.5 left-0 right-0 h-3 flex items-center justify-center pointer-events-none opacity-80 overflow-hidden transform-gpu translate-z-0"
      style={{ transform: "translate3d(0, 0, 0)" }}
    />
  );
}
