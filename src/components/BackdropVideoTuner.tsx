"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Film,
  Sliders,
  Check,
  RotateCcw,
  Copy,
  X,
  Palette,
  Eye,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";
import LiquidGlassComparison from "./media/LiquidGlassComparison";
import VideoLoopsShowcase from "./media/VideoLoopsShowcase";
import {
  DEFAULT_BACKDROP_SETTINGS,
  BACKDROP_STORAGE_KEY,
  BACKDROP_EVENT_KEY,
  applyBackdropSettingsToDOM,
  VIDEO_LOOP_PRESETS,
  type VideoLoopPreset,
  type BackdropOverlaySettings,
} from "./GlobalVideoBackdrop";

const COLOR_PRESETS = [
  { id: "jjettas", name: "JJettas Obsidian (#0b0a0f)", hex: "#0b0a0f", desc: "Authentic JJettas.com stage tone with #4f2bab purple" },
  { id: "obsidian", name: "Obsidian Violet", hex: "#0b0414", desc: "7th Heaven signature haze" },
  { id: "media", name: "Media Scrim (Black)", hex: "#000000", desc: "Media page 60%-35%-75% contrast scrim" },
  { id: "elva", name: "Elva Labs #131313", hex: "#131313", desc: "Elva Labs carbon black with cyan/purple aura" },
  { id: "navy", name: "Midnight Navy", hex: "#030712", desc: "Deep arena twilight" },
  { id: "plum", name: "Deep Plum", hex: "#18041c", desc: "Velvet stage glow" },
  { id: "charcoal", name: "Charcoal Dark", hex: "#121214", desc: "Neutral carbon tint" },
];

export default function BackdropVideoTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"video" | "noise">("video");
  const [settings, setSettings] = useState<BackdropOverlaySettings>(DEFAULT_BACKDROP_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [showLiquidComparison, setShowLiquidComparison] = useState(false);
  const [showLoopShowcase, setShowLoopShowcase] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
        applyBackdropSettingsToDOM({ ...DEFAULT_BACKDROP_SETTINGS, ...parsed });
      } else {
        applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
      }
    } catch {
      applyBackdropSettingsToDOM(DEFAULT_BACKDROP_SETTINGS);
    }
  }, []);

  const handleToggleOpen = (open: boolean) => {
    setIsOpen(open);
  };

  const updateSettings = useCallback(
    (newSettings: BackdropOverlaySettings) => {
      setSettings(newSettings);
      applyBackdropSettingsToDOM(newSettings);
      try {
        localStorage.setItem(BACKDROP_STORAGE_KEY, JSON.stringify(newSettings));
      } catch {
        // ignore
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(BACKDROP_EVENT_KEY, {
            detail: newSettings,
          })
        );
      }
    },
    []
  );

  const handleUpdateDarkness = (val: number) => {
    updateSettings({ ...settings, overlayDarkness: val });
  };

  const handleUpdateColor = (hex: string) => {
    updateSettings({ ...settings, overlayColor: hex });
  };

  const handleToggleGradient = (isGrad: boolean) => {
    updateSettings({ ...settings, isGradient: isGrad });
  };

  const handleUpdateDirection = (dir: "to-bottom" | "radial" | "to-top") => {
    updateSettings({ ...settings, gradientDirection: dir });
  };

  const handleUpdateBlur = (blur: number) => {
    updateSettings({ ...settings, blurAmount: blur });
  };

  const handleUpdateOpacity = (opacity: number) => {
    updateSettings({ ...settings, videoOpacity: opacity });
  };

  const handleUpdateSaturation = (sat: number) => {
    updateSettings({ ...settings, videoSaturation: sat });
  };

  const handleUpdateVideoSrc = (src: string) => {
    updateSettings({ ...settings, videoSrc: src });
  };

  const handleToggleNoise = (enabled: boolean) => {
    updateSettings({ ...settings, noiseEnabled: enabled });
  };

  const handleUpdateNoiseOpacity = (val: number) => {
    updateSettings({ ...settings, noiseOpacity: val });
  };

  const handleUpdateNoiseScale = (val: number) => {
    updateSettings({ ...settings, noiseScale: val });
  };

  const handleUpdateNoiseBlend = (blend: "overlay" | "soft-light" | "screen" | "color-dodge" | "multiply") => {
    updateSettings({ ...settings, noiseBlendMode: blend });
  };

  const handleToggleNoiseAnimated = (anim: boolean) => {
    updateSettings({ ...settings, noiseAnimated: anim });
  };

  const handleUpdateNoiseSpeed = (speed: number) => {
    updateSettings({ ...settings, noiseSpeed: speed });
  };

  const handleResetNoise = () => {
    updateSettings({
      ...settings,
      noiseEnabled: true,
      noiseOpacity: 100,
      noiseScale: 100,
      noiseBlendMode: "overlay",
      noiseAnimated: false,
      noiseSpeed: 0.35,
    });
  };

  const handleReset = () => {
    updateSettings(DEFAULT_BACKDROP_SETTINGS);
  };

  const handleCopyCSS = () => {
    const scalePx = Math.round(160 * ((settings.noiseScale ?? 100) / 100));
    const css = `:root {
  /* Video Backdrop & Dark Overlay */
  --backdrop-overlay-darkness: ${settings.overlayDarkness}%;
  --backdrop-overlay-color: ${settings.overlayColor};
  --backdrop-overlay-mode: ${settings.isGradient ? "gradient" : "solid"};
  --backdrop-overlay-direction: ${settings.gradientDirection};
  --backdrop-video-blur: ${settings.blurAmount}px;
  --backdrop-video-opacity: ${settings.videoOpacity / 100};
  --backdrop-video-saturate: ${settings.videoSaturation}%;

  /* Analog Film Grain & Noise */
  --backdrop-noise-display: ${settings.noiseEnabled ?? true ? "block" : "none"};
  --backdrop-noise-opacity: ${(settings.noiseEnabled ?? true) ? (settings.noiseOpacity ?? 40) / 100 : 0};
  --backdrop-noise-blend: ${settings.noiseBlendMode ?? "overlay"};
  --backdrop-noise-size: ${scalePx}px ${scalePx}px;
  --backdrop-noise-animation: ${settings.noiseAnimated ? `filmGrainJitter ${settings.noiseSpeed ?? 0.35}s steps(4) infinite both` : "none"};
}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Floating Trigger Pills — Elva Labs Frosted Glass & Laser Draw Style */}
      <div className="fixed bottom-[184px] left-8 z-[999999] pointer-events-auto flex items-center gap-2">
        {/* Backdrop Video Pill */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("video");
            handleToggleOpen(!isOpen || activeTab !== "video");
          }}
          aria-label="Toggle Background Video & Dark Overlay Tuner"
          className="group relative flex cursor-pointer select-none items-center gap-2.5 px-4 py-2.5 rounded-[16px] border border-white/10 hover:border-transparent bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[10px] backdrop-saturate-[180%] shadow-2xl text-xs font-semibold text-zinc-100 hover:text-white transition-all transform active:scale-95 overflow-hidden"
        >
          {/* Elva Labs Animated Laser Draw Perimeter Gradient Stroke */}
          <svg
            className="pointer-events-none absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)]"
            aria-hidden="true"
            style={{ filter: "blur(3px)" }}
          >
            <defs>
              <linearGradient id="elva-tuner-grad" x1="0%" y1="30%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0989d8" />
                <stop offset="100%" stopColor="#850dee" />
              </linearGradient>
            </defs>
            <rect
              x="2"
              y="2"
              rx="16"
              fill="none"
              stroke="url(#elva-tuner-grad)"
              strokeWidth="4"
              className="elva-laser-rect w-[calc(100%-4px)] h-[calc(100%-4px)]"
            />
          </svg>

          {/* Mini video indicator swatch */}
          <div
            className="relative z-10 w-3.5 h-3.5 rounded-full border border-white/20 transition-transform group-hover:scale-110 flex items-center justify-center bg-[var(--swatch-color)] shadow-[var(--swatch-glow)]"
            style={
              {
                "--swatch-color": settings.overlayColor,
                "--swatch-glow": `0 0 6px ${settings.overlayColor === "#000000" ? "rgba(168,85,247,0.5)" : settings.overlayColor}`,
              } as React.CSSProperties
            }
          >
            <Film className="w-2 h-2 text-white/80" />
          </div>
          <span className="relative z-10">Backdrop Video</span>
          <span className="relative z-10 font-mono text-[10px] text-zinc-400 group-hover:text-amber-300">
            {settings.overlayDarkness}% {settings.isGradient ? "Grad" : "Solid"}
          </span>
          <Sliders className="relative z-10 w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-300 transition-colors" />

          {/* Elva Labs white tracking dot indicator */}
          <span
            aria-hidden="true"
            className="relative z-10 block h-1 w-1 shrink-0 rounded-full bg-white opacity-85 transition-transform group-hover:scale-150 group-hover:opacity-100"
          />
        </button>

        {/* Dedicated Noise Pill */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("noise");
            handleToggleOpen(!isOpen || activeTab !== "noise");
          }}
          aria-label="Toggle Film Grain & Noise Tuner"
          className="group relative flex cursor-pointer select-none items-center gap-2 px-3.5 py-2.5 rounded-[16px] border border-white/10 hover:border-amber-400/40 bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[10px] backdrop-saturate-[180%] shadow-2xl text-xs font-semibold text-zinc-100 hover:text-white transition-all transform active:scale-95 overflow-hidden"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="relative z-10">Noise</span>
          <span className="relative z-10 font-mono text-[10px] text-amber-300/90 font-bold">
            {settings.noiseEnabled ?? true ? `${settings.noiseOpacity ?? 40}%` : "Off"}
          </span>
          <Sliders className="relative z-10 w-3 h-3 text-zinc-400 group-hover:text-amber-300 transition-colors" />
        </button>
      </div>

      {/* Tuner Dialog Modal — Docked all the way to the right side */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-end p-2 sm:p-5">
          {/* Completely transparent click-outside dismissal layer with zero screen tint or darkening */}
          <div
            className="fixed inset-0 pointer-events-auto bg-transparent"
            onClick={() => handleToggleOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Background Video & Dark Overlay Studio"
            className="pointer-events-auto relative w-full max-w-md rounded-[var(--radius-box)] bg-[#0d0a14]/95 border border-white/20 p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col gap-4 sm:gap-5 text-white max-h-[94vh] overflow-y-auto custom-scrollbar mr-0 sm:mr-2 animate-[fadeIn_0.15s_ease-out]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    Backdrop Video & Overlay Studio
                    <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Live Tuner
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Control background video blur & dark overlay across all frontend pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleOpen(false)}
                aria-label="Close Backdrop Tuner"
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.05] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "video"
                    ? "bg-purple-600 text-white shadow-lg font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Backdrop Video</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("noise")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "noise"
                    ? "bg-amber-500 text-black font-bold shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analog Noise</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-current font-mono">
                  {settings.noiseEnabled ?? true ? `${settings.noiseOpacity ?? 40}%` : "Off"}
                </span>
              </button>
            </div>

            {activeTab === "video" && (
              <>
                {/* Live Backdrop Video Active Notice */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Live Synchronized Tuning Active:</strong> Screen darkening, blur, and opacity sliders apply live across both site pages and the Media Vault.
                  </span>
                </div>

            {/* 6s Bandwidth-Saver Video Loops (30s In) */}
            <div className="flex flex-col gap-2.5 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-100 font-bold flex items-center gap-1.5 text-sm">
                  <Film className="w-4 h-4 text-purple-400" />
                  6s Video Loops (30s In)
                </span>
                <button
                  type="button"
                  onClick={() => setShowLoopShowcase(true)}
                  className="font-mono text-purple-300 font-extrabold text-[11px] bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  Show All 5
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Extracted at 0:30 into 6s loops to slash bandwidth by over 90% while keeping high-res video.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {VIDEO_LOOP_PRESETS.map((loop) => {
                  const isCur = settings.videoSrc === loop.videoSrc;
                  return (
                    <button
                      key={loop.id}
                      type="button"
                      onClick={() => handleUpdateVideoSrc(loop.videoSrc)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isCur
                          ? "bg-purple-500/20 border-purple-400/60 shadow-md shadow-purple-500/10"
                          : "bg-white/[0.02] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                          {loop.title}
                        </span>
                        {isCur && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{loop.timeRange}</span>
                        <span className="text-amber-400 font-semibold">{loop.size}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screen Darkening / Dark Overlay Slider — Elva Frosted Glass Styling */}
            <div className="flex flex-col gap-2.5 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-100 font-bold flex items-center gap-1.5 text-sm">
                  <Moon className="w-4 h-4 text-amber-400" />
                  Screen Darkening / Dark Overlay
                </span>
                <span className="font-mono text-amber-300 font-extrabold text-sm bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {settings.overlayDarkness}%
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Adjust how dark the background overlay is over the video. Higher values darken the screen for crisp text readability.
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.overlayDarkness}
                onChange={(e) => handleUpdateDarkness(Number(e.target.value))}
                className="w-full slider-elva cursor-pointer accent-amber-400 my-1"
                aria-label="Screen Darkening overlay opacity"
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateDarkness(0)}
                  className={`hover:text-amber-300 transition-colors ${settings.overlayDarkness === 0 ? "font-bold text-amber-400" : ""}`}
                >
                  0% (Off)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateDarkness(35)}
                  className={`hover:text-amber-300 transition-colors ${settings.overlayDarkness === 35 ? "font-bold text-amber-400" : ""}`}
                >
                  35% (Light)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateDarkness(55)}
                  className={`hover:text-amber-300 transition-colors ${settings.overlayDarkness === 55 ? "font-bold text-amber-400" : ""}`}
                >
                  55% (Mid)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateDarkness(65)}
                  className={`hover:text-amber-300 transition-colors ${settings.overlayDarkness === 65 ? "font-bold text-amber-400 underline" : ""}`}
                >
                  65% (Default)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateDarkness(80)}
                  className={`hover:text-amber-300 transition-colors ${settings.overlayDarkness === 80 ? "font-bold text-amber-400" : ""}`}
                >
                  80% (Deep)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateDarkness(95)}
                  className={`hover:text-amber-300 transition-colors ${settings.overlayDarkness === 95 ? "font-bold text-amber-400" : ""}`}
                >
                  95% (Max)
                </button>
              </div>
            </div>

            {/* Gradient vs Solid Mode Toggle — Elva Frosted Glass Styling */}
            <div className="flex flex-col gap-3 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Overlay Style Mode
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {settings.isGradient
                      ? "Cinematic Vignette (gentle fade at center, darker top & bottom for reading)"
                      : "Uniform Flat Tint (consistent single dark tone across whole page)"}
                  </p>
                </div>
                <Toggle
                  size="sm"
                  checked={settings.isGradient}
                  onChange={handleToggleGradient}
                  label={
                    <span className="text-[11px] font-semibold text-zinc-300">
                      {settings.isGradient ? "Gradient" : "Solid"}
                    </span>
                  }
                />
              </div>

              {/* Gradient Direction Options when Gradient is active */}
              {settings.isGradient && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                  {[
                    { id: "to-bottom", label: "Top-to-Bottom" },
                    { id: "radial", label: "Radial Vignette" },
                    { id: "to-top", label: "Bottom-to-Top" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleUpdateDirection(d.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all ${
                        settings.gradientDirection === d.id
                          ? "bg-purple-600/30 text-purple-200 border border-purple-500/50"
                          : "bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Overlay Color Selection — Elva Frosted Glass Styling */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                Overlay Color Tone
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const active = settings.overlayColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleUpdateColor(preset.hex)}
                      className={`flex items-center gap-2 p-2.5 rounded-[14px] border text-left transition-all ${
                        active
                          ? "bg-purple-900/40 border-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.35)]"
                          : "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0 bg-[var(--dot-bg)]"
                        style={{ "--dot-bg": preset.hex } as React.CSSProperties}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {preset.desc}
                        </p>
                      </div>
                      {active && (
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-auto" />
                      )}
                    </button>
                  );
                })}

                {/* Custom Color Input — Elva Frosted Glass Capsule */}
                <div className="flex items-center gap-2.5 p-2 rounded-[14px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-transparent focus-within:border-transparent transition-all backdrop-blur-[10px]">
                  <input
                    type="color"
                    value={settings.overlayColor}
                    onChange={(e) => handleUpdateColor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 shrink-0"
                    aria-label="Custom overlay color"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">Custom Hex</p>
                    <p className="text-[10px] font-mono text-amber-300 uppercase font-bold">
                      {settings.overlayColor}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Blur & Image Quality — Elva Frosted Glass Styling */}
            <div className="flex flex-col gap-4 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              {/* Video Blur Intensity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    Video Blur Filter
                  </span>
                  <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {settings.blurAmount}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="64"
                  value={settings.blurAmount}
                  onChange={(e) => handleUpdateBlur(Number(e.target.value))}
                  className="w-full slider-elva cursor-pointer accent-purple-400 my-1"
                  aria-label="Video Blur Filter Amount"
                />
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <button
                    onClick={() => handleUpdateBlur(0)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Sharp (0px)
                  </button>
                  <button
                    onClick={() => handleUpdateBlur(16)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Soft (16px)
                  </button>
                  <button
                    onClick={() => handleUpdateBlur(36)}
                    className="hover:text-purple-300 transition-colors font-bold text-purple-300"
                  >
                    Standard (36px)
                  </button>
                  <button
                    onClick={() => handleUpdateBlur(54)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Heavy (54px)
                  </button>
                </div>

                {/* QuickLiquid vs Standard CSS Blur Lab Trigger */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      QuickLiquid Comparison Lab
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Standard CSS blur vs. SVG displacement glass
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLiquidComparison(true)}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Side-by-Side
                  </button>
                </div>
              </div>

              {/* Video Brightness / Opacity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-zinc-400" />
                    Video Opacity
                  </span>
                  <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {settings.videoOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.videoOpacity}
                  onChange={(e) => handleUpdateOpacity(Number(e.target.value))}
                  className="w-full slider-elva cursor-pointer accent-purple-400 my-1"
                  aria-label="Video Opacity Amount"
                />
              </div>

              {/* Video Color Saturation */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">Color Saturation</span>
                  <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {settings.videoSaturation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={settings.videoSaturation}
                  onChange={(e) => handleUpdateSaturation(Number(e.target.value))}
                  className="w-full slider-elva cursor-pointer accent-purple-400 my-1"
                  aria-label="Video Color Saturation Amount"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "noise" && (
          <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
            {/* Live Noise Status Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/25 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-amber-100 flex items-center gap-2">
                    Analog Film Noise Layer
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {settings.noiseEnabled ?? true ? "ACTIVE" : "BYPASSED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/70 mt-0.5">
                    Tactile celluloid grain full-bleed across backdrop and footer.
                  </p>
                </div>
              </div>
              <Toggle
                label="Noise Master"
                hideLabel
                checked={settings.noiseEnabled ?? true}
                onChange={handleToggleNoise}
                size="sm"
              />
            </div>

            {/* Live Noise Visual Texture Swatch */}
            <div className="relative h-20 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/80 flex items-center justify-between px-4 select-none">
              {/* Backdrop video mini preview */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-black/80" />
              {/* Live noise surface */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-film-noise backdrop-noise-surface pointer-events-none"
              />
              <div className="relative z-10 flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/90 font-bold">
                  Live Grain Texture
                </span>
                <span className="text-xs font-semibold text-white">
                  {settings.noiseOpacity ?? 40}% Intensity • {settings.noiseBlendMode ?? "overlay"} • {Math.round(160 * ((settings.noiseScale ?? 100) / 100))}px
                </span>
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-zinc-300">
                  {settings.noiseAnimated ? "Projector Jitter" : "Static (Calm)"}
                </span>
              </div>
            </div>

            {/* Noise Opacity / Strength Slider */}
            <div className="flex flex-col gap-2.5 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-100 font-bold flex items-center gap-1.5 text-sm">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Grain Intensity (Opacity)
                </span>
                <span className="font-mono text-amber-300 font-extrabold text-sm bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {settings.noiseOpacity ?? 40}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.noiseOpacity ?? 40}
                onChange={(e) => handleUpdateNoiseOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                aria-label="Grain Opacity Amount"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>0% Clean</span>
                <span>40% Balanced</span>
                <span>100% Extreme</span>
              </div>
              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {[
                  { label: "Subtle", val: 15 },
                  { label: "Natural", val: 30 },
                  { label: "Punchy", val: 45 },
                  { label: "Gritty", val: 70 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleUpdateNoiseOpacity(p.val)}
                    className={`py-1 px-2 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                      settings.noiseOpacity === p.val
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                        : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/25"
                    }`}
                  >
                    {p.label} ({p.val}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Grain Texture Size / Scale */}
            <div className="flex flex-col gap-2.5 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-100 font-bold flex items-center gap-1.5 text-sm">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Grain Texture Size (Scale)
                </span>
                <span className="font-mono text-purple-300 font-extrabold text-sm bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {Math.round(160 * ((settings.noiseScale ?? 100) / 100))}px
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={settings.noiseScale ?? 100}
                onChange={(e) => handleUpdateNoiseScale(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                aria-label="Grain Size Amount"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>50% Micro (80px)</span>
                <span>100% 35mm (160px)</span>
                <span>250% Coarse (400px)</span>
              </div>
              {/* Quick Scale Presets */}
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {[
                  { label: "Fine", val: 65 },
                  { label: "35mm", val: 100 },
                  { label: "16mm", val: 150 },
                  { label: "Coarse", val: 210 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleUpdateNoiseScale(p.val)}
                    className={`py-1 px-2 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                      settings.noiseScale === p.val
                        ? "bg-purple-500/20 border-purple-400 text-purple-200 font-bold"
                        : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/25"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blend Mode Selection */}
            <div className="flex flex-col gap-2.5 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-100 font-bold flex items-center gap-1.5 text-sm">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  Blend Mode
                </span>
                <span className="font-mono text-emerald-300 font-extrabold text-[11px] uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {settings.noiseBlendMode ?? "overlay"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { id: "overlay", name: "Overlay", desc: "Balanced contrast" },
                  { id: "soft-light", name: "Soft Light", desc: "Gentle & subtle" },
                  { id: "screen", name: "Screen", desc: "Bright silver flecks" },
                  { id: "color-dodge", name: "Color Dodge", desc: "Concert electric glow" },
                  { id: "multiply", name: "Multiply", desc: "Cinematic dark soot" },
                ].map((m) => {
                  const isCur = (settings.noiseBlendMode ?? "overlay") === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleUpdateNoiseBlend(m.id as any)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                        isCur
                          ? "bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.2)] text-white"
                          : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{m.name}</span>
                        {isCur && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 leading-tight">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Film Projector Motion (Jitter) */}
            <div className="flex flex-col gap-3 p-4 rounded-[16px] bg-white/[0.04] border border-white/10 backdrop-blur-[10px] backdrop-saturate-[180%] shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-zinc-100 font-bold flex items-center gap-1.5 text-sm">
                    <Film className="w-4 h-4 text-amber-400" />
                    Projector Film Jitter (Motion)
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Simulates 24fps celluloid projector shutter wobble.
                  </p>
                </div>
                <Toggle
                  label="Film Jitter Animation"
                  hideLabel
                  checked={settings.noiseAnimated ?? false}
                  onChange={handleToggleNoiseAnimated}
                  size="sm"
                />
              </div>

              {settings.noiseAnimated ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10 animate-[fadeIn_0.15s_ease-out]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Jitter Speed</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {settings.noiseSpeed ?? 0.35}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={settings.noiseSpeed ?? 0.35}
                    onChange={(e) => handleUpdateNoiseSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    aria-label="Jitter Speed"
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>0.10s (Rapid)</span>
                    <span>0.35s (Standard)</span>
                    <span>0.80s (Slow Wobble)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                    ⚠️ Note: High-frequency jitter can appear as strobing/flickering against dark solid footers.
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400">
                  ✨ Currently in <strong>Static Mode</strong>: 100% calm, flicker-free analog grain texture across the whole page and footer.
                </div>
              )}
            </div>

            {/* Reset Noise Section */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleResetNoise}
                className="flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-amber-500/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Noise to Factory Defaults
              </button>
            </div>
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
          <button
            onClick={activeTab === "noise" ? handleResetNoise : handleReset}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{activeTab === "noise" ? "Reset Noise Defaults" : "Reset Defaults"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCSS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy CSS"}</span>
            </button>
            <button
              onClick={() => handleToggleOpen(false)}
              className="px-4 py-1.5 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Side-by-Side QuickLiquid vs Standard CSS Blur Lab */}
      {showLiquidComparison && (
        <LiquidGlassComparison
          isOpen={showLiquidComparison}
          onClose={() => setShowLiquidComparison(false)}
        />
      )}

      {/* 6s Bandwidth-Saver Video Loops Showcase Modal */}
      {showLoopShowcase && (
        <VideoLoopsShowcase
          isOpen={showLoopShowcase}
          onClose={() => setShowLoopShowcase(false)}
          activeVideoSrc={settings.videoSrc}
          onSelectVideo={(src) => {
            handleUpdateVideoSrc(src);
          }}
        />
      )}
    </>,
    document.body
  );
}
