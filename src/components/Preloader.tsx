"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

const getImageStyle = (idx: number) => {
  switch (idx) {
    case 1: return { transform: "translate(11.95px, -13.0px) scale(1.14)" };
    case 2: return { transform: "translate(11.3px, -12.9px) scale(1.14)" };
    case 3: return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 4: return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 5: return { transform: "translate(11.5px, -12.0px) scale(1.14)" };
    case 6: return { transform: "translate(11.5px, -13.8px) scale(1.14)" };
    default: return {};
  }
};

// ─── Wave Canvas Progress ──────────────────────────────────────────────────
function WaveProgress({ percent }: { percent: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef(0);
  const rafRef    = useRef<number | null>(null);
  const pctRef    = useRef(percent);

  useEffect(() => { pctRef.current = percent; }, [percent]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pct   = pctRef.current;
    const fillX = (pct / 100) * W;
    const midY  = H / 2;
    const amp   = 4;
    const freq  = 2.2;
    const phase = phaseRef.current;

    // Build the shared wave path
    const buildPath = () => {
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const y = midY + Math.sin((x / W) * Math.PI * 2 * freq + phase) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    };

    // 1. Gray background track (full width)
    buildPath();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = "round";
    ctx.lineCap     = "round";
    ctx.stroke();

    // 2. Colored fill (left → fillX), white at start → purple at tip
    if (fillX > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, fillX, H);
      ctx.clip();

      buildPath();
      const grad = ctx.createLinearGradient(0, 0, fillX, 0);
      grad.addColorStop(0,   "rgba(255,255,255,1)");
      grad.addColorStop(0.6, "rgba(180,80,255,1)");
      grad.addColorStop(1,   "rgba(133,29,239,1)");
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    const loop = () => {
      phaseRef.current -= 0.055;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={40}
      style={{ width: 280, height: 40 }}
      aria-hidden="true"
    />
  );
}
// ──────────────────────────────────────────────────────────────────────────

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    if (forceShow) return true;
    return !sessionStorage.getItem("7h_preloaded");
  });
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadedRef = useRef(false);

  const [selectedFrames, setSelectedFrames] = useState<number[]>([1, 3, 4, 5, 2]);

  useEffect(() => {
    // Shuffle image order safely on client after hydration to avoid SSR mismatch
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

  useEffect(() => { isLoadedRef.current = isLoaded; }, [isLoaded]);

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
    // Lock scroll on both html and body (covers iOS safari, desktop, touch)
    const html = document.documentElement;
    const body = document.body;
    const preventTouch = (e: TouchEvent) => e.preventDefault();

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventTouch, { passive: false });

    let currentPercent = 0;
    let timer: NodeJS.Timeout;

    const unlock = () => {
      html.style.overflow = "";
      body.style.overflow = "";
      document.removeEventListener("touchmove", preventTouch);
      try {
        sessionStorage.setItem("7h_preloaded", "true");
      } catch {}
    };

    const runProgress = () => {
      if (currentPercent < 85) {
        currentPercent += 2;
        if (currentPercent > 85) currentPercent = 85;
        setPercent(currentPercent);
        timer = setTimeout(runProgress, 18);
      } else if (currentPercent >= 85 && currentPercent < 100) {
        if (isLoadedRef.current || currentPercent >= 90) {
          currentPercent += 2;
          if (currentPercent > 100) currentPercent = 100;
          setPercent(currentPercent);
          timer = setTimeout(runProgress, 16);
        } else {
          timer = setTimeout(runProgress, 50);
        }
      } else {
        setTimeout(() => {
          setFadeOut(true);
          unlock();
          setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
          }, 500);
        }, 200);
      }
    };

    runProgress();
    return () => {
      clearTimeout(timer);
      unlock();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      suppressHydrationWarning
      className={`fixed inset-0 z-[100000] bg-[#090314] flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Film Grain */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Portrait Circle */}
      <div className="relative mb-8 flex flex-col items-center justify-center">
        <div className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-tr from-[#d946ef]/20 to-[#7c00ff]/20 blur-2xl animate-pulse" />
        <div className="relative w-[180px] h-[180px] rounded-full border border-white/10 shadow-[0_0_50px_rgba(217,70,239,0.3)] flex items-center justify-center">
          {selectedFrames.map((idx) => {
            const isActive = getActiveFrame(percent) === idx;
            return (
              <div key={idx} className="absolute inset-0 transition-opacity duration-300 ease-in-out" style={{ opacity: isActive ? 1 : 0 }}>
                <Image src={`/images/loading-images/${idx}.png`} alt={`Loading ${idx}`} fill priority sizes="180px" className="object-contain" style={getImageStyle(idx)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Wave Progress Block */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white font-[family-name:var(--font-rockstar)] font-black text-3xl tracking-widest italic select-none mb-1">
          {percent}%
        </div>

        {/* Wave Canvas */}
        <WaveProgress percent={percent} />

        <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 font-bold select-none mt-1">
          Rocking The World
        </span>
      </div>
    </div>
  );
}
