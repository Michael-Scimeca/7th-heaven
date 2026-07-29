"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

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

let hasRanInMemory = false;

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  const pathname = usePathname();
  
  // Pages that require/benefit from heavy preloading (or forced via props/query)
  const heavyPages = ["/", "/cruise", "/features", "/live", "/video"];
  const requiresPreloader = heavyPages.includes(pathname) || forceShow;

  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [selectedFrames, setSelectedFrames] = useState<number[]>([1, 3, 4, 5, 2]);

  // Determine visibility after mount to avoid SSR hydration mismatch
  useEffect(() => {
    if (forceShow) { setVisible(true); return; }

    // If we arrived here via the page-transition wave, the transition already handles
    // the enter visual. Running the preloader's two rAF loops at the same time is what
    // freezes the wave animation. Suppress and mark done so it won't show again.
    if ((window as any).__pageTransitionActive) {
      hasRanInMemory = true;
      try { sessionStorage.setItem("7h_preloader_shown", "true"); } catch {}
      setTimeout(() => { document.body.classList.remove("preloading"); }, 150);
      return;
    }

    // If the preloader won't show, reveal the page content after a short delay
    // so that Next.js streaming SSR has time to deliver the page content
    // before the page becomes visible (prevents footer flash before content).
    if (hasRanInMemory || sessionStorage.getItem("7h_preloader_shown") === "true" || !requiresPreloader) {
      setTimeout(() => {
        document.body.classList.remove("preloading");
      }, 150);
      return;
    }
    setVisible(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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



  // ── Real resource tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    if (!requiresPreloader && !forceShow) return;

    const html = document.documentElement;
    const body = document.body;

    // Lock scroll while preloading
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventTouch, { passive: false });
    if (typeof window !== "undefined" && (window as any).__lenis) {
      try { (window as any).__lenis.stop(); } catch {}
    }

    const unlock = () => {
      html.style.overflow = "";
      body.style.overflow = "";
      document.removeEventListener("touchmove", preventTouch);
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
    };

    const finish = () => {
      setPercent(100);
      hasRanInMemory = true;
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("7h_preloader_shown", "true");
        }
      } catch {}
      unlock();
      setFadeOut(true);
      // Reveal page content by removing the hiding class
      document.body.classList.remove("preloading");
      setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 500);
    };

    // ── Discover real resources to track ──
    let totalResources = 0;
    let loadedResources = 0;
    let documentReady = document.readyState === "complete";
    let fontsReady = false;
    let finished = false;

    const getProgress = () => {
      if (totalResources === 0) {
        // No trackable resources — rely on document + fonts
        const docWeight = documentReady ? 50 : 0;
        const fontWeight = fontsReady ? 50 : 0;
        return docWeight + fontWeight;
      }
      // Weight: 60% resources, 20% document ready, 20% fonts
      const resourcePct = totalResources > 0 ? (loadedResources / totalResources) * 60 : 60;
      const docPct = documentReady ? 20 : 0;
      const fontPct = fontsReady ? 20 : 0;
      return Math.min(Math.round(resourcePct + docPct + fontPct), 100);
    };

    const onResourceLoaded = () => {
      loadedResources++;
    };

    // Track all <img> elements (including those with loading=lazy that are in viewport)
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        // Already loaded
        return;
      }
      totalResources++;
      if (img.complete) {
        loadedResources++;
      } else {
        img.addEventListener("load", onResourceLoaded, { once: true });
        img.addEventListener("error", onResourceLoaded, { once: true });
      }
    });

    // Track <video> elements
    const videos = document.querySelectorAll("video");
    videos.forEach((vid) => {
      if (vid.readyState >= 3) return; // HAVE_FUTURE_DATA or better
      totalResources++;
      vid.addEventListener("canplaythrough", onResourceLoaded, { once: true });
      vid.addEventListener("error", onResourceLoaded, { once: true });
    });

    // Track document ready state
    if (document.readyState === "complete") {
      documentReady = true;
    } else {
      const handleLoad = () => { documentReady = true; };
      window.addEventListener("load", handleLoad, { once: true });
    }

    // Track fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { fontsReady = true; }).catch(() => { fontsReady = true; });
    } else {
      fontsReady = true;
    }

    // ── Smooth animation loop ──
    // Uses a time-based ramp + real progress. The displayed percent is the
    // MINIMUM of: (a) the time-based ramp and (b) the real resource progress.
    // This ensures the preloader is always visible for at least MIN_DURATION,
    // but won't hit 100% until resources are genuinely loaded.
    const MIN_DURATION = 1800; // ms — minimum time to show the preloader
    let displayedPercent = 0;
    let rafId: number;
    const startTime = performance.now();
    const currentPercentRef = { current: 0 };

    const tick = () => {
      if (finished) return;

      const elapsed = performance.now() - startTime;
      const realProgress = getProgress();

      // Time-based ramp: smoothly goes 0→100 over MIN_DURATION
      const timeRamp = Math.min((elapsed / MIN_DURATION) * 100, 100);

      // The effective ceiling is the minimum of the time ramp and real progress
      // This means: even if resources are loaded instantly, the bar still takes
      // MIN_DURATION to fill. But if resources are slow, the bar pauses and
      // waits for them (capped at 98% until genuinely done).
      const effectiveProgress = Math.min(timeRamp, realProgress >= 100 ? 100 : Math.min(realProgress + 2, 98));

      // Smooth chase
      const speed = effectiveProgress >= 100 ? 4 : 1.5;
      displayedPercent += (effectiveProgress - displayedPercent) * (speed / 10);

      const rounded = Math.min(Math.round(displayedPercent), 100);
      currentPercentRef.current = rounded;
      setPercent(rounded);

      // Only finish when both the time ramp is done AND resources are loaded
      if (rounded >= 100 && realProgress >= 100 && elapsed >= MIN_DURATION) {
        finished = true;
        finish();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // Hard failsafe: guarantee completion after 8 seconds max
    const maxFailsafe = setTimeout(() => {
      if (!finished) {
        finished = true;
        finish();
      }
    }, 8000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(maxFailsafe);
      unlock();
    };
  }, [requiresPreloader, forceShow, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div
      suppressHydrationWarning
      className={`fixed inset-0 z-[100000] bg-[var(--color-bg-deep)] flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Film Grain */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Portrait Circle */}
      <div className="relative mb-8 flex flex-col items-center justify-center">
        <div className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-tr from-[#d946ef]/20 to-[#7c00ff]/20 blur-2xl animate-pulse" />
        <div className="relative w-[180px] h-[180px] rounded-full overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(217,70,239,0.35)] flex items-center justify-center">
          {selectedFrames.map((idx) => {
            const isActive = getActiveFrame(percent) === idx;
            return (
              <div key={idx} className="absolute inset-0 rounded-full overflow-hidden transition-opacity duration-300 ease-in-out" style={{ opacity: isActive ? 1 : 0 }}>
                <Image src={`/images/loading-images/${idx}.png`} alt={`Loading ${idx}`} fill priority sizes="180px" className="object-contain rounded-full" style={getImageStyle(idx)} />
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

        <span className="text-[var(--font-size-4xs)] uppercase tracking-[0.25em] text-white/30 font-bold select-none mt-1">
          Rocking The World
        </span>
      </div>
    </div>
  );
}
