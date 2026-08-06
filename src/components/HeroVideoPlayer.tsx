"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
const emptySubscribe = () => () => {};
import type { ReactNode } from "react";
import VinylHeroPlayer from "@/components/VinylHeroPlayer";
import HeroYTBackground from "@/components/HeroYTBackground";
import {
  VideoSnapshotContext,
  type VideoSnapshotContextValue,
} from "@/context/VideoSnapshotContext";

const ALBUM_VIDEOS: Record<string, string> = {
  "be-here": "/movie/are-we-there-yet.mp4",
  "color-in-motion": "/movie/hero-colorinmostion.mp4",
  "luminous": "/movie/luminous.mp4",
  "next": "/movie/next.mp4",
  "spectrum": "/movie/spectrum.mp4",
};

const DEFAULT_VIDEO = "/movie/are-we-there-yet.mp4";
const SNAPSHOT_INTERVAL_MS = 30_000; // 30 seconds
const MAX_SNAPSHOTS = 2;

const TINT_PRESETS = [
  { name: "Deep Charcoal", color: "#0d0914" },
  { name: "Electric Crimson", color: "#FF0A3D" },
  { name: "Electric Purple", color: "#851def" },
  { name: "Vibrant Blue", color: "#3b82f6" },
  { name: "Neon Amber", color: "#9333ea" },
  { name: "Emerald Green", color: "#10b981" },
];

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

const GRADIENT_PRESETS = [
  { name: "My Custom Choice", height: 46, opacity: 0.95, midstop: 37, color: "#000000" },
  { name: "Cinematic Dark", height: 75, opacity: 0.95, midstop: 35, color: "#000000" },
  { name: "Smooth Fade", height: 60, opacity: 0.85, midstop: 25, color: "#000000" },
  { name: "Deep Violet Shadow", height: 70, opacity: 0.95, midstop: 30, color: "#090314" },
];

export default function HeroVideoPlayer({ children }: { children?: ReactNode }) {
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [snapshots, setSnapshots] = useState<string[]>([]);

  const isYouTube = !videoSrc.includes(".mp4");
  const ytId = isYouTube ? videoSrc.replace(/^.*[=/]/, "") : "";

  // ── Tint Customizer states ──────────────────────────────────────────────────
  const [tintColor, setTintColor] = useState("#0d0914");
  const [tintOpacity, setTintOpacity] = useState(0.52);
  const [mixBlendMode, setMixBlendMode] = useState<"normal" | "multiply" | "screen" | "overlay" | "color" | "darken">("normal");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // ── Bottom-Up Gradient Customizer states ──────────────────────────────────
  const [gradHeight, setGradHeight] = useState(46); // %
  const [gradOpacity, setGradOpacity] = useState(0.95); // 0..1
  const [gradMidstop, setGradMidstop] = useState(37); // %
  const [gradColor, setGradColor] = useState("#000000");
  const [isGradUiOpen, setIsGradUiOpen] = useState(false);
  const [gradCopied, setGradCopied] = useState(false);

  useEffect(() => {
    const savedColor = localStorage.getItem("7h_tint_color");
    const savedOpacity = localStorage.getItem("7h_tint_opacity");
    const savedBlend = localStorage.getItem("7h_tint_blend");

    if (savedColor) setTintColor(savedColor);
    if (savedOpacity) setTintOpacity(parseFloat(savedOpacity));
    if (savedBlend) setMixBlendMode(savedBlend as any);

    // Load gradient settings
    const savedGradH = localStorage.getItem("7h_hero_grad_height");
    const savedGradO = localStorage.getItem("7h_hero_grad_opacity");
    const savedGradM = localStorage.getItem("7h_hero_grad_midstop");
    const savedGradC = localStorage.getItem("7h_hero_grad_color");

    if (savedGradH) setGradHeight(parseFloat(savedGradH));
    if (savedGradO) setGradOpacity(parseFloat(savedGradO));
    if (savedGradM) setGradMidstop(parseFloat(savedGradM));
    if (savedGradC) setGradColor(savedGradC);
  }, []);

  const updateGradHeight = (h: number) => {
    setGradHeight(h);
    localStorage.setItem("7h_hero_grad_height", h.toString());
  };
  const updateGradOpacity = (o: number) => {
    setGradOpacity(o);
    localStorage.setItem("7h_hero_grad_opacity", o.toString());
  };
  const updateGradMidstop = (m: number) => {
    setGradMidstop(m);
    localStorage.setItem("7h_hero_grad_midstop", m.toString());
  };
  const updateGradColor = (c: string) => {
    setGradColor(c);
    localStorage.setItem("7h_hero_grad_color", c);
  };

  const copyGradCSS = () => {
    const cssText = `background: linear-gradient(to top, ${gradColor} 0%, ${hexToRgba(gradColor, gradOpacity * 0.75)} ${gradMidstop}%, transparent 100%);\nheight: ${gradHeight}%;`;
    navigator.clipboard.writeText(cssText);
    setGradCopied(true);
    setTimeout(() => setGradCopied(false), 2000);
  };

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
      canvas.width = Math.round(video.videoWidth / 2);
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
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let handler: (() => void) | undefined;

    const startCapturing = () => {
      if (!active) return;
      captureFrame();
      intervalId = setInterval(() => {
        if (active) captureFrame();
      }, SNAPSHOT_INTERVAL_MS);
    };

    if (video.readyState >= 2) {
      startCapturing();
    } else {
      handler = () => {
        if (active) startCapturing();
        if (handler) video.removeEventListener("canplay", handler);
      };
      video.addEventListener("canplay", handler);
    }

    return () => {
      active = false;
      if (handler) video.removeEventListener("canplay", handler);
      if (intervalId) clearInterval(intervalId);
    };
  }, [captureFrame, videoSrc]); // re-run when source changes

  // ── Album → video sync ──────────────────────────────────────────────────────
  const handleAlbumChange = (albumId: string) => {
    const next = ALBUM_VIDEOS[albumId] ?? DEFAULT_VIDEO;
    if (next === videoSrc) return;
    setVideoSrc(next);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => { });
      }
    }, 0);
  };

  const ctxValue: VideoSnapshotContextValue = { snapshots };

  return (
    <VideoSnapshotContext.Provider value={ctxValue}>
      {/* CSS Animations style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />

      {/* ── Hero background video (YouTube full-bleed or HTML5 video) ── */}
      {isYouTube ? (
        <HeroYTBackground videoId={ytId} />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none scale-[1.08]"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      <div
        className="absolute inset-0 z-[1] pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: tintColor,
          opacity: tintOpacity,
          mixBlendMode: mixBlendMode,
        }}
      />

      {/* ── Bottom-Up Black Gradient Overlay ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none transition-colors duration-150"
        style={{
          height: `${gradHeight}%`,
          background: `linear-gradient(to top, ${gradColor} 0%, ${hexToRgba(gradColor, gradOpacity * 0.75)} ${gradMidstop}%, transparent 100%)`,
        }}
      />

      {/* ── Gradient Customizer Toggle Button + UI Drawer ── */}
      <div className="absolute top-[104px] right-6 z-40 md:right-8 flex flex-col items-end gap-2">
        {!isGradUiOpen ? (
          <button
            onClick={() => setIsGradUiOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-wider hover:bg-black/90 hover:border-purple-400 hover:scale-105 active:scale-95 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer group"
            title="Adjust Hero Bottom-Up Black Gradient"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-t from-purple-500 to-pink-500 animate-pulse" />
            <span>Hero Gradient UI</span>
          </button>
        ) : (
          <div className="w-[300px] bg-black/90 backdrop-blur-2xl border border-white/15 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 select-none animate-[scaleIn_0.2s_ease-out] text-left text-white z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-rockstar)] text-xs font-black uppercase tracking-wider  text-[var(--color-accent)]">
                  Hero Gradient Controls
                </span>
                <span className="text-[9px] text-white/50 uppercase font-semibold">
                  Adjust bottom-up dark overlay
                </span>
              </div>
              <button
                onClick={() => setIsGradUiOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-white/50 uppercase tracking-wider block">Presets</span>
              <div className="grid grid-cols-2 gap-1.5">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      updateGradHeight(p.height);
                      updateGradOpacity(p.opacity);
                      updateGradMidstop(p.midstop);
                      updateGradColor(p.color);
                    }}
                    className="px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg border border-white/10 bg-white/5 hover:bg-purple-600/30 hover:border-purple-400 text-white/80 transition-colors text-left truncate cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Height</span>
                <span className=" text-[var(--color-accent)] font-mono font-black">{gradHeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={gradHeight}
                onChange={(e) => updateGradHeight(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Bottom Black Opacity</span>
                <span className=" text-[var(--color-accent)] font-mono font-black">{Math.round(gradOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={gradOpacity}
                onChange={(e) => updateGradOpacity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Fade Midpoint Stop Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Fade Midpoint Stop</span>
                <span className=" text-[var(--color-accent)] font-mono font-black">{gradMidstop}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={gradMidstop}
                onChange={(e) => updateGradMidstop(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Color Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Gradient Color</span>
                <span className=" text-[var(--color-accent)] font-mono font-bold text-[9px]">{gradColor}</span>
              </div>
              <div className="flex items-center gap-2">
                {["#000000", "#000000", "#090314", "#0f051d", "#020617"].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateGradColor(c)}
                    className="w-6 h-6 rounded-full border transition-transform cursor-pointer"
                    style={{
                      backgroundColor: c,
                      borderColor: gradColor === c ? '#a855f7' : 'rgba(255,255,255,0.2)',
                      transform: gradColor === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
                <div className="relative w-6 h-6 rounded-full border border-white/30 overflow-hidden cursor-pointer bg-purple-600/30 flex items-center justify-center">
                  <input
                    type="color"
                    value={gradColor}
                    onChange={(e) => updateGradColor(e.target.value)}
                    className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0"
                  />
                  <span className="text-[10px] font-bold text-white">+</span>
                </div>
              </div>
            </div>

            {/* Live CSS Code Box */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 font-mono text-[9px] text-white/60 break-all leading-relaxed select-all">
              background: linear-gradient(to top, {gradColor} 0%, {hexToRgba(gradColor, gradOpacity * 0.75)} {gradMidstop}%, transparent 100%);<br />
              height: {gradHeight}%;
            </div>

            {/* Copy CSS Button */}
            <button
              onClick={copyGradCSS}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-[10px] uppercase tracking-widest transition-colors shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {gradCopied ? "✓ Copied CSS to Clipboard!" : "Copy Gradient CSS"}
            </button>
          </div>
        )}
      </div>

      {/* ── Tint Customizer Floating Panel (Dev/Tester Only) ── */}
      {mounted && localStorage.getItem("7h_tint_tester") === "true" && (
        <div className="absolute top-[104px] right-6 z-40 md:right-8 flex flex-col items-end">
          {!isCustomizerOpen ? (
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer hover:bg-black/85 hover:scale-105 active:scale-95 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)] group"
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
                className="text-white/80 group-hover: text-[var(--color-accent)] group-hover:rotate-45 transition-colors duration-300"
              >
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </button>
          ) : (
            <div
              className="w-[280px] bg-black/75 backdrop-blur-xl border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 select-none animate-[scaleIn_0.2s_ease-out] text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-rockstar)] text-[var(--font-size-2xs)] font-black uppercase tracking-wider  text-[var(--color-accent)]">
                    Video Tint Tester
                  </span>
                  <span className="text-[var(--font-size-4xs)] text-white/40 uppercase font-semibold">
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
                <span className="text-[var(--font-size-3xs)] font-extrabold text-white/45 uppercase tracking-wider block">Presets</span>
                <div className="flex flex-wrap gap-2">
                  {TINT_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => updateColor(preset.color)}
                      className={`w-6 h-6 rounded-full border transition-colors hover:scale-115 relative cursor-pointer flex items-center justify-center`}
                      style={{
                        backgroundColor: preset.color,
                        borderColor: tintColor === preset.color ? '#9333ea' : 'rgba(255,255,255,0.2)'
                      }}
                      title={preset.name}
                    >
                      {tintColor === preset.color && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_4px_rgba(147, 51, 234,0.8)]" />
                      )}
                    </button>
                  ))}
                  {/* Custom Color Selector */}
                  <div
                    className="w-6 h-6 rounded-full border border-white/20 relative overflow-hidden cursor-pointer hover:scale-115 transition-transform flex items-center justify-center bg-[var(--color-accent)]/80"
                    title="Custom Color"
                  >
                    <input
                      type="color"
                      value={tintColor}
                      onChange={(e) => updateColor(e.target.value)}
                      className="absolute -inset-1 w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent opacity-0"
                    />
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white drop-shadow"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--font-size-3xs)] font-extrabold text-white/45 uppercase tracking-wider">
                  <span>Opacity</span>
                  <span className=" text-[var(--color-accent)] font-mono font-black">{Math.round(tintOpacity * 100)}%</span>
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
                <span className="text-[var(--font-size-3xs)] font-extrabold text-white/45 uppercase tracking-wider block">Mix Blend Mode</span>
                <div className="grid grid-cols-3 gap-1">
                  {(["normal", "multiply", "overlay", "screen", "color", "darken"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateBlend(mode)}
                      className={`px-1 py-1 text-[var(--font-size-4xs)] font-black uppercase rounded border transition-colors cursor-pointer ${mixBlendMode === mode
                        ? "bg-[var(--color-purple-primary)] border-[var(--color-border-purple)] text-[var(--color-text-main)] shadow-[0_0_8px_var(--color-purple-glow)] font-black"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10"
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Values HUD */}
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-[var(--font-size-4xs)] font-mono text-white/40 space-y-0.5">
                <div>Color: <span className="text-white font-bold">{tintColor}</span></div>
                <div>Opacity: <span className="text-white font-bold">{tintOpacity}</span></div>
                <div>Blend: <span className="text-white font-bold">{mixBlendMode}</span></div>
              </div>

              {/* Copy CSS Button */}
              <button
                onClick={copyCSS}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black text-[var(--font-size-2xs)] uppercase tracking-widest transition-colors shadow-[0_4px_12px_rgba(147, 51, 234,0.2)] active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
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
        <div className="relative z-30 flex justify-start ml-8">
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
