"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Copy,
  X,
  Palette,
  Sun,
  Moon,
  Flame,
  Radio,
  Eye,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";

export interface AtmosphereSettings {
  presetId: "noir" | "twilight" | "cyber" | "ember" | "abyss" | "elva";
  bgColor: string;
  ambientGrad1: string;
  ambientGrad2: string;
  ambientGrad3: string;
  bodyGrad1: string;
  bodyGrad2: string;
  bodyGrad3: string;
  blendMode: "screen" | "normal" | "soft-light";
  ambientOpacity: number; // 0 to 1
  grainOpacity: number; // 0 to 0.15
}

export const ATMOSPHERE_PRESETS: Record<
  AtmosphereSettings["presetId"],
  {
    name: string;
    description: string;
    tag: string;
    settings: AtmosphereSettings;
  }
> = {
  elva: {
    name: "Elva Labs (#131313 Dark)",
    description: "Deep #131313 carbon canvas with cyan (#0989d8) and purple (#850dee) chromatic dispersion.",
    tag: "Elva Labs AI",
    settings: {
      presetId: "elva",
      bgColor: "#131313",
      ambientGrad1: "radial-gradient(ellipse at 50% 25%, rgba(9, 137, 216, 0.22) 0%, rgba(133, 13, 238, 0.18) 40%, rgba(19, 19, 19, 0) 70%)",
      ambientGrad2: "radial-gradient(circle at 18% 70%, rgba(133, 13, 238, 0.20) 0%, rgba(19, 19, 19, 0) 50%)",
      ambientGrad3: "radial-gradient(circle at 82% 60%, rgba(9, 137, 216, 0.15) 0%, rgba(19, 19, 19, 0) 50%)",
      bodyGrad1: "rgba(9, 137, 216, 0.16)",
      bodyGrad2: "rgba(133, 13, 238, 0.18)",
      bodyGrad3: "rgba(19, 19, 19, 0.40)",
      blendMode: "screen",
      ambientOpacity: 0.85,
      grainOpacity: 0.075,
    },
  },
  noir: {
    name: "Concert Noir (Dark & Deep)",
    description: "Deep obsidian velvet with subtle midnight violet haze. Maximum text legibility.",
    tag: "Recommended Dark",
    settings: {
      presetId: "noir",
      bgColor: "#07040b",
      ambientGrad1: "rgba(55, 12, 80, 0.22)",
      ambientGrad2: "rgba(40, 10, 70, 0.18)",
      ambientGrad3: "rgba(70, 22, 10, 0.08)",
      bodyGrad1: "rgba(45, 10, 65, 0.18)",
      bodyGrad2: "rgba(35, 8, 55, 0.14)",
      bodyGrad3: "rgba(60, 18, 10, 0.06)",
      blendMode: "screen",
      ambientOpacity: 0.60,
      grainOpacity: 0.055,
    },
  },
  twilight: {
    name: "Midnight Stage",
    description: "Concert arena spotlight glow with rich plum and orchid hues.",
    tag: "Stage Lights",
    settings: {
      presetId: "twilight",
      bgColor: "#0c0614",
      ambientGrad1: "rgba(85, 18, 125, 0.28)",
      ambientGrad2: "rgba(60, 14, 105, 0.22)",
      ambientGrad3: "rgba(110, 35, 18, 0.12)",
      bodyGrad1: "rgba(70, 15, 100, 0.22)",
      bodyGrad2: "rgba(50, 12, 85, 0.18)",
      bodyGrad3: "rgba(90, 28, 14, 0.09)",
      blendMode: "screen",
      ambientOpacity: 0.75,
      grainOpacity: 0.06,
    },
  },
  cyber: {
    name: "Obsidian Laser Cyan",
    description: "Electric cyan and deep midnight navy lasers on pitch black.",
    tag: "High Contrast",
    settings: {
      presetId: "cyber",
      bgColor: "#040508",
      ambientGrad1: "rgba(0, 180, 210, 0.18)",
      ambientGrad2: "rgba(18, 32, 70, 0.22)",
      ambientGrad3: "rgba(220, 0, 75, 0.10)",
      bodyGrad1: "rgba(0, 140, 180, 0.14)",
      bodyGrad2: "rgba(14, 25, 55, 0.18)",
      bodyGrad3: "rgba(180, 0, 60, 0.08)",
      blendMode: "screen",
      ambientOpacity: 0.65,
      grainOpacity: 0.05,
    },
  },
  ember: {
    name: "Warm Stage Ember",
    description: "Charcoal espresso foundation with warm amber lantern glow.",
    tag: "Warm Vintage",
    settings: {
      presetId: "ember",
      bgColor: "#0a0706",
      ambientGrad1: "rgba(120, 42, 12, 0.22)",
      ambientGrad2: "rgba(85, 55, 14, 0.18)",
      ambientGrad3: "rgba(45, 15, 55, 0.10)",
      bodyGrad1: "rgba(95, 34, 10, 0.18)",
      bodyGrad2: "rgba(70, 44, 12, 0.14)",
      bodyGrad3: "rgba(35, 12, 45, 0.08)",
      blendMode: "screen",
      ambientOpacity: 0.65,
      grainOpacity: 0.06,
    },
  },
  abyss: {
    name: "Abyssal Stealth Black",
    description: "Ultra-dark OLED black with virtually zero glow. Extreme minimalism.",
    tag: "Ultra Dark",
    settings: {
      presetId: "abyss",
      bgColor: "#020104",
      ambientGrad1: "rgba(25, 6, 38, 0.10)",
      ambientGrad2: "rgba(18, 5, 30, 0.08)",
      ambientGrad3: "rgba(0, 0, 0, 0)",
      bodyGrad1: "rgba(20, 5, 30, 0.08)",
      bodyGrad2: "rgba(15, 4, 25, 0.06)",
      bodyGrad3: "rgba(0, 0, 0, 0)",
      blendMode: "normal",
      ambientOpacity: 0.35,
      grainOpacity: 0.04,
    },
  },
};

const STORAGE_KEY = "7h_atmosphere_v1";

export function applyAtmosphere(settings: AtmosphereSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--bg-color", settings.bgColor);
  root.style.setProperty("--ambient-grad-1", settings.ambientGrad1);
  root.style.setProperty("--ambient-grad-2", settings.ambientGrad2);
  root.style.setProperty("--ambient-grad-3", settings.ambientGrad3);
  root.style.setProperty("--body-grad-1", settings.bodyGrad1);
  root.style.setProperty("--body-grad-2", settings.bodyGrad2);
  root.style.setProperty("--body-grad-3", settings.bodyGrad3);
  root.style.setProperty("--ambient-blend-mode", settings.blendMode);
  root.style.setProperty("--ambient-opacity", String(settings.ambientOpacity));
  root.style.setProperty("--canvas-grain-opacity", String(settings.grainOpacity));
}

export default function GradientAtmosphereTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AtmosphereSettings>(ATMOSPHERE_PRESETS.noir.settings);
  const [copied, setCopied] = useState(false);

  // Restore saved atmosphere on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.presetId && ATMOSPHERE_PRESETS[parsed.presetId as AtmosphereSettings["presetId"]]) {
          setSettings(parsed);
          applyAtmosphere(parsed);
          return;
        }
      }
    } catch {}
    // Default to noir on initial run
    applyAtmosphere(ATMOSPHERE_PRESETS.noir.settings);
  }, []);

  const handleSelectPreset = (presetId: AtmosphereSettings["presetId"]) => {
    const next = ATMOSPHERE_PRESETS[presetId].settings;
    setSettings(next);
    applyAtmosphere(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleUpdateOpacity = (val: number) => {
    const next = { ...settings, ambientOpacity: val };
    setSettings(next);
    applyAtmosphere(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleUpdateGrain = (val: number) => {
    const next = { ...settings, grainOpacity: val };
    setSettings(next);
    applyAtmosphere(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleReset = () => {
    handleSelectPreset("noir");
  };

  const handleCopyCSS = () => {
    const css = `:root {
  --bg-color: ${settings.bgColor};
  --ambient-grad-1: ${settings.ambientGrad1};
  --ambient-grad-2: ${settings.ambientGrad2};
  --ambient-grad-3: ${settings.ambientGrad3};
  --ambient-blend-mode: ${settings.blendMode};
  --ambient-opacity: ${settings.ambientOpacity};
  --canvas-grain-opacity: ${settings.grainOpacity};
}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Trigger Pill — sits neatly above the PageNav pill */}
      <div className="fixed bottom-[88px] left-8 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Gradient Atmosphere Tuner"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/20 bg-black/85 hover:bg-black backdrop-blur-md shadow-2xl text-xs font-semibold text-zinc-200 hover:text-white transition-all transform active:scale-95 group"
        >
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/20 transition-transform group-hover:scale-110 bg-[var(--swatch-bg)] shadow-[0_0_8px_rgba(133,15,183,0.6)]"
            style={{ "--swatch-bg": settings.bgColor } as React.CSSProperties}
          />
          <span>Dark Atmosphere</span>
          <Sliders className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-300 transition-colors" />
        </button>
      </div>

      {/* Tuner Panel Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div
            role="dialog"
            aria-label="Atmosphere & Gradient Tuner"
            className="w-full max-w-lg rounded-[var(--radius-box)] bg-[#0d0a14] border border-white/15 p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">Gradient Atmosphere Controller</h3>
                  <p className="text-xs text-zinc-400">Select darker presets or fine-tune page background intensity</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                aria-label="Close tuner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5 Presets Grid */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Atmosphere Presets</span>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(ATMOSPHERE_PRESETS) as AtmosphereSettings["presetId"][]).map((key) => {
                  const p = ATMOSPHERE_PRESETS[key];
                  const active = settings.presetId === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        active
                          ? "bg-white/15 border-amber-400/50 shadow-lg text-white"
                          : "bg-black/30 border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 bg-[var(--preset-swatch-bg)] shadow-[0_0_10px_var(--preset-swatch-glow)]"
                          style={{
                            "--preset-swatch-bg": p.settings.bgColor,
                            "--preset-swatch-glow": p.settings.ambientGrad1,
                          } as React.CSSProperties}
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] uppercase font-bold tracking-wider bg-white/10 text-zinc-300">
                              {p.tag}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">{p.description}</div>
                        </div>
                      </div>
                      {active && <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              {/* Glow Intensity Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Glow Intensity (Ambient Opacity)</span>
                  <span className="font-mono text-amber-300">{Math.round(settings.ambientOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(settings.ambientOpacity * 100)}
                  onChange={(e) => handleUpdateOpacity(Number(e.target.value) / 100)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Film Grain Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Film Grain Texture Density</span>
                  <span className="font-mono text-amber-300">{Math.round((settings.grainOpacity / 0.15) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={Math.round(settings.grainOpacity * 1000)}
                  onChange={(e) => handleUpdateGrain(Number(e.target.value) / 1000)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Dark Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCSS}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy CSS"}</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
