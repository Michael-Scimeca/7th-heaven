"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import VinylHeroPlayer from "@/components/VinylHeroPlayer";
import {
  VideoSnapshotContext,
  type VideoSnapshotContextValue,
} from "@/context/VideoSnapshotContext";

const ALBUM_VIDEOS: Record<string, string> = {
  "be-here":         "/movie/Behere-hero.mp4",
  "color-in-motion": "/movie/hero-colorinmostion.mp4",
  "luminous":        "/movie/luminous.mp4",
  "next":            "/movie/next.mp4",
  "spectrum":        "/movie/spectrum.mp4",
};

const DEFAULT_VIDEO = "/movie/Behere-hero.mp4";
const SNAPSHOT_INTERVAL_MS = 30_000; // 30 seconds
const MAX_SNAPSHOTS = 2;

const TINT_PRESETS = [
  { name: "Deep Charcoal", color: "#0d0914" },
  { name: "Electric Purple", color: "#851def" },
  { name: "Vibrant Blue", color: "#3b82f6" },
  { name: "Crimson Rose", color: "#f43f5e" },
  { name: "Neon Amber", color: "#f59e0b" },
  { name: "Emerald Green", color: "#10b981" },
];

export default function HeroVideoPlayer({ children }: { children?: ReactNode }) {
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [snapshots, setSnapshots] = useState<string[]>([]);

  // ── Tint Customizer states ──────────────────────────────────────────────────
  const [tintColor, setTintColor] = useState("#0d0914");
  const [tintOpacity, setTintOpacity] = useState(0.52);
  const [mixBlendMode, setMixBlendMode] = useState<"normal" | "multiply" | "screen" | "overlay" | "color" | "darken">("normal");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedColor = localStorage.getItem("7h_tint_color");
    const savedOpacity = localStorage.getItem("7h_tint_opacity");
    const savedBlend = localStorage.getItem("7h_tint_blend");
    
    if (savedColor) setTintColor(savedColor);
    if (savedOpacity) setTintOpacity(parseFloat(savedOpacity));
    if (savedBlend) setMixBlendMode(savedBlend as any);
  }, []);

  const updateColor = (color: string) => {
    setTintColor(color);
    localStorage.setItem("7h_tint_color", color);
  };

  const updateOpacity = (opacity: number) => {
    setTintOpacity(opacity);
    localStorage.setItem("7h_tint_opacity", opacity.toString());
  };

  const updateBlend = (blend: typeof mixBlendMode) => {
    setMixBlendMode(blend);
    localStorage.setItem("7h_tint_blend", blend);
  };

  const copyCSS = () => {
    const cssText = `background-color: ${tintColor}; opacity: ${tintOpacity}; mix-blend-mode: ${mixBlendMode};`;
    navigator.clipboard.writeText(cssText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Canvas capture ──────────────────────────────────────────────────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return;

    try {
      const canvas = document.createElement("canvas");
      // Capture at half-resolution for speed / memory
      canvas.width  = Math.round(video.videoWidth  / 2);
      canvas.height = Math.round(video.videoHeight / 2);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);

      setSnapshots((prev) => [dataUrl, ...prev].slice(0, MAX_SNAPSHOTS));
    } catch {
      // Cross-origin or security errors — silently ignore
    }
  }, []);

  // Capture on mount (once ready) + every 30 s thereafter
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Wait for the first frame to be ready before capturing
    const onReady = () => {
      captureFrame();
      const id = setInterval(captureFrame, SNAPSHOT_INTERVAL_MS);
      return id;
    };

    let intervalId: ReturnType<typeof setInterval>;

    if (video.readyState >= 2) {
      intervalId = onReady();
    } else {
      const handler = () => {
        intervalId = onReady();
        video.removeEventListener("canplay", handler);
      };
      video.addEventListener("canplay", handler);
    }

    return () => clearInterval(intervalId);
  }, [captureFrame, videoSrc]); // re-run when source changes

  // ── Album → video sync ──────────────────────────────────────────────────────
  const handleAlbumChange = (albumId: string) => {
    const next = ALBUM_VIDEOS[albumId] ?? DEFAULT_VIDEO;
    if (next === videoSrc) return;
    setVideoSrc(next);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }, 0);
  };

  const ctxValue: VideoSnapshotContextValue = { snapshots };

  return (
    <VideoSnapshotContext.Provider value={ctxValue}>
      {/* CSS Animations style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />

      {/* ── Hero background video (self-hosted, full-bleed) ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* ── Video Tint Overlay ── */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: tintColor,
          opacity: tintOpacity,
          mixBlendMode: mixBlendMode,
        }}
      />

      {/* ── Tint Customizer Floating Panel (Dev/Tester Only) ── */}
      {mounted && localStorage.getItem("7h_tint_tester") === "true" && (
        <div className="absolute top-[104px] right-6 z-40 md:right-8 flex flex-col items-end">
          {!isCustomizerOpen ? (
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer hover:bg-black/85 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] group"
              title="Open Video Tint Customizer"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white/80 group-hover:text-amber-500 group-hover:rotate-45 transition-all duration-300"
              >
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="m6.34 17.66-1.41 1.41"/>
                <path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            </button>
          ) : (
            <div 
              className="w-[280px] bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 select-none animate-[scaleIn_0.2s_ease-out] text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-rockstar)] text-[11px] font-black uppercase tracking-wider text-amber-500">
                    Video Tint Tester
                  </span>
                  <span className="text-[9px] text-white/40 uppercase font-semibold">
                    Customize background tint
                  </span>
                </div>
                <button
                  onClick={() => setIsCustomizerOpen(false)}
                  className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-white/45 uppercase tracking-wider block">Presets</span>
                <div className="flex flex-wrap gap-2">
                  {TINT_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => updateColor(preset.color)}
                      className={`w-6 h-6 rounded-full border transition-all hover:scale-115 relative cursor-pointer flex items-center justify-center`}
                      style={{ 
                        backgroundColor: preset.color,
                        borderColor: tintColor === preset.color ? '#f59e0b' : 'rgba(255,255,255,0.2)'
                      }}
                      title={preset.name}
                    >
                      {tintColor === preset.color && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]" />
                      )}
                    </button>
                  ))}
                  {/* Custom Color Selector */}
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20 relative overflow-hidden cursor-pointer hover:scale-115 transition-transform flex items-center justify-center bg-gradient-to-tr from-rose-500 via-purple-500 to-blue-500"
                    title="Custom Color"
                  >
                    <input 
                      type="color" 
                      value={tintColor} 
                      onChange={(e) => updateColor(e.target.value)} 
                      className="absolute -inset-1 w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent opacity-0"
                    />
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white drop-shadow"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-extrabold text-white/45 uppercase tracking-wider">
                  <span>Opacity</span>
                  <span className="text-amber-500 font-mono font-black">{Math.round(tintOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={tintOpacity}
                  onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Blend Modes */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-white/45 uppercase tracking-wider block">Mix Blend Mode</span>
                <div className="grid grid-cols-3 gap-1">
                  {(["normal", "multiply", "overlay", "screen", "color", "darken"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateBlend(mode)}
                      className={`px-1 py-1 text-[9px] font-black uppercase rounded border transition-all cursor-pointer ${
                        mixBlendMode === mode
                          ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.3)] font-black"
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Values HUD */}
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-[9px] font-mono text-white/40 space-y-0.5">
                <div>Color: <span className="text-white font-bold">{tintColor}</span></div>
                <div>Opacity: <span className="text-white font-bold">{tintOpacity}</span></div>
                <div>Blend: <span className="text-white font-bold">{mixBlendMode}</span></div>
              </div>

              {/* Copy CSS Button */}
              <button
                onClick={copyCSS}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.2)] active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-[scaleIn_0.15s_ease-out]"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    Copy CSS Snippet
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom row: live stream thumbs on left + vinyl player on right ── */}
      <div className="relative z-[3] flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6 w-full mt-auto">
        {/* Live stream small thumbnails */}
        <div className="relative z-30 flex justify-start">
          {children}
        </div>

        {/* Vinyl MP3 Album Player */}
        <div className="flex justify-end">
          <VinylHeroPlayer onAlbumChange={handleAlbumChange} />
        </div>
      </div>
    </VideoSnapshotContext.Provider>
  );
}
