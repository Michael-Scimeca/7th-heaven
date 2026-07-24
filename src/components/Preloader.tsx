"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const getImageStyle = (idx: number) => {
  // Translate to compensate for off-center artwork in PNG files.
  // The scale(1.14) ensures we enlarge slightly to match the 180px container border.
  switch (idx) {
    case 1:
      return { transform: "translate(11.95px, -13.0px) scale(1.14)" };
    case 2:
      return { transform: "translate(11.3px, -12.9px) scale(1.14)" };
    case 3:
      return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 4:
      return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 5:
      return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 6:
      return { transform: "translate(11.5px, -13.8px) scale(1.14)" };
    default:
      return {};
  }
};

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadedRef = useRef(false);

  // Stable initial order — shuffled client-side only to avoid SSR hydration mismatch
  const [selectedFrames, setSelectedFrames] = useState<number[]>([1, 3, 4, 5, 2]);

  useEffect(() => {
    const otherImages = [1, 3, 4, 5, 6];
    const shuffledOthers = [...otherImages].sort(() => Math.random() - 0.5).slice(0, 4);
    setSelectedFrames([...shuffledOthers, 2]);
  }, []);

  const getActiveFrame = (pct: number): number => {
    if (selectedFrames.length < 5) return 1;
    if (pct < 20) return selectedFrames[0];
    if (pct < 40) return selectedFrames[1];
    if (pct < 60) return selectedFrames[2];
    if (pct < 80) return selectedFrames[3];
    return selectedFrames[4];
  };

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  useEffect(() => {
    const handleLoad = () => setIsLoaded(true);
    if (document.readyState === "complete") {
      setIsLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
    }
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  useEffect(() => {
    // Lock scrolling on load
    document.body.style.overflow = "hidden";

    let currentPercent = 0;
    let timer: NodeJS.Timeout;

    const runProgress = () => {
      // 1. Guaranteed minimum load (0% to 80%) to cycle through at least 4 images (takes 1.6s)
      if (currentPercent < 80) {
        currentPercent++;
        setPercent(currentPercent);
        timer = setTimeout(runProgress, 20);
      } 
      // 2. Pause at 80% until real page load event completes
      else if (currentPercent === 80) {
        if (isLoadedRef.current) {
          currentPercent++;
          setPercent(currentPercent);
          timer = setTimeout(runProgress, 20);
        } else {
          // Poll every 100ms waiting for the actual window load event to finish
          timer = setTimeout(runProgress, 100);
        }
      } 
      // 3. Finish sequence (80% to 100%) once load is complete (takes 0.4s)
      else if (currentPercent < 100) {
        currentPercent++;
        setPercent(currentPercent);
        timer = setTimeout(runProgress, 20);
      } 
      // 4. Completion transition
      else {
        setTimeout(() => {
          setFadeOut(true);
          // Unlock scrolling
          document.body.style.overflow = "";
          
          // Fully remove from DOM after transition
          setTimeout(() => {
            setVisible(false);
            if (onComplete) {
              onComplete();
            }
          }, 600);
        }, 300);
      }
    };

    // Tiny initial delay to start
    const startDelay = setTimeout(runProgress, 100);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100000] bg-[#090314] flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Film Grain Texture Overlay */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Central Portrait Circle Container */}
      <div className="relative mb-6 flex flex-col items-center justify-center">
        {/* Glowing Ambient Halo */}
        <div className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-tr from-[#d946ef]/20 to-[#7c00ff]/20 blur-2xl animate-pulse" />

        {/* Circular Artwork Frame (Unclipped container to let the pre-cropped image render fully) */}
        <div
          className="relative w-[180px] h-[180px] rounded-full border border-white/10 shadow-[0_0_50px_rgba(217,70,239,0.3)] flex items-center justify-center"
        >
          {selectedFrames.map((idx) => {
            const isActive = getActiveFrame(percent) === idx;
            return (
              <div
                key={idx}
                className="absolute inset-0 transition-opacity duration-300 ease-in-out"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                <Image
                  src={`/images/loading-images/${idx}.png`}
                  alt={`Loading ${idx}`}
                  fill
                  priority
                  sizes="180px"
                  className="object-contain"
                  style={getImageStyle(idx)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Info Block */}
      <div className="flex flex-col items-center gap-3">
        {/* Percentage Counter */}
        <div className="text-white font-[family-name:var(--font-rockstar)] font-black text-3xl tracking-widest italic select-none">
          {percent}%
        </div>

        {/* Progress Bar Track */}
        <div className="w-[180px] h-[3px] bg-white/10 rounded-full overflow-hidden relative">
          {/* Progress Bar Fill */}
          <div
            className="h-full bg-gradient-to-r from-[#7c00ff] to-[#d946ef] rounded-full transition-all duration-100 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 font-bold select-none mt-1">
          Rocking The World
        </span>
      </div>
    </div>
  );
}
