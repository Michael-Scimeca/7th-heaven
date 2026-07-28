"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import waveData from "../../public/lottie/cruise-wave.json";

export default function CruiseWaveAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: waveData,
    });

    return () => {
      anim.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute -bottom-0.5 left-0 right-0 h-3 flex items-center justify-center pointer-events-none opacity-80 overflow-hidden transform-gpu translate-z-0"
      style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
    />
  );
}
