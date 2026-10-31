"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  Sliders,
  Check,
  RotateCcw,
  Copy,
  X,
  Palette,
  Eye,
  Layers,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";

export type ScrollbarPresetId =
  | "neon-violet"
  | "laser-cyan"
  | "sunset-amber"
  | "minimal-white"
  | "emerald-matrix"
  | "cyber-pink"
  | "stealth-obsidian"
  | "custom";

export interface ScrollbarSettings {
  presetId: ScrollbarPresetId;
  syncBoth: boolean;

  // Global Page Scrollbar
  pageWidth: number; // 2 to 24px
  pageThumbBg: string; // CSS gradient or solid color
  pageThumbHoverBg: string;
  pageThumbRadius: number; // 0 to 9999px
  pageGlow: number; // 0 to 25px
  pageTrackOpacity: number; // 0 to 1
  pageThumbColor: string; // fallback for firefox

  // Container Scrollbars (.custom-scrollbar & inner elements all over the site)
  innerWidth: number; // 2 to 24px
  innerThumbBg: string;
  innerThumbHoverBg: string;
  innerThumbRadius: number;
  innerGlow: number;
  innerTrackOpacity: number;
  innerThumbColor: string;

  // Custom Color overrides if presetId === "custom"
  customColorStart: string;
  customColorEnd: string;
  customHoverColor: string;
}

export const SCROLLBAR_PRESETS: Record<
  Exclude<ScrollbarPresetId, "custom">,
  {
    name: string;
    description: string;
    thumbBg: string;
    thumbHoverBg: string;
    glowColor: string;
    firefoxColor: string;
    trackColor: string;
  }
> = {
  "neon-violet": {
    name: "Neon Violet",
    description: "Official 7th Heaven signature stage purple & orchid glow",
    thumbBg: "linear-gradient(180deg, #e9d5ff 0%, #a855f7 50%, #7e22ce 100%)",
    thumbHoverBg: "linear-gradient(180deg, #ffffff 0%, #c084fc 50%, #9333ea 100%)",
    glowColor: "rgba(192, 132, 252, 0.65)",
    firefoxColor: "#c084fc",
    trackColor: "rgba(15, 7, 32, 0.5)",
  },
  "laser-cyan": {
    name: "Laser Cyan",
    description: "Electric concert laser cyan & aqua radiance",
    thumbBg: "linear-gradient(180deg, #cffafe 0%, #06b6d4 50%, #0369a1 100%)",
    thumbHoverBg: "linear-gradient(180deg, #ffffff 0%, #22d3ee 50%, #0891b2 100%)",
    glowColor: "rgba(6, 182, 212, 0.65)",
    firefoxColor: "#22d3ee",
    trackColor: "rgba(8, 20, 32, 0.5)",
  },
  "sunset-amber": {
    name: "Sunset Amber",
    description: "Warm arena floodlight gold & sunset amber",
    thumbBg: "linear-gradient(180deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)",
    thumbHoverBg: "linear-gradient(180deg, #ffffff 0%, #fbbf24 50%, #d97706 100%)",
    glowColor: "rgba(245, 158, 11, 0.65)",
    firefoxColor: "#fbbf24",
    trackColor: "rgba(32, 18, 8, 0.5)",
  },
  "minimal-white": {
    name: "Minimalist Pure White",
    description: "High-contrast clean silver & pure white shine",
    thumbBg: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 50%, #a1a1aa 100%)",
    thumbHoverBg: "linear-gradient(180deg, #ffffff 0%, #f4f4f5 50%, #d4d4d8 100%)",
    glowColor: "rgba(255, 255, 255, 0.55)",
    firefoxColor: "#ffffff",
    trackColor: "rgba(20, 20, 25, 0.6)",
  },
  "emerald-matrix": {
    name: "Emerald Laser",
    description: "Vibrant neon stage emerald & green beam",
    thumbBg: "linear-gradient(180deg, #a7f3d0 0%, #10b981 50%, #047857 100%)",
    thumbHoverBg: "linear-gradient(180deg, #ffffff 0%, #34d399 50%, #059669 100%)",
    glowColor: "rgba(16, 185, 129, 0.65)",
    firefoxColor: "#34d399",
    trackColor: "rgba(6, 30, 20, 0.5)",
  },
  "cyber-pink": {
    name: "Cyber Pink",
    description: "Rock club hot magenta & fluorescent pink",
    thumbBg: "linear-gradient(180deg, #fbcfe8 0%, #ec4899 50%, #be185d 100%)",
    thumbHoverBg: "linear-gradient(180deg, #ffffff 0%, #f472b6 50%, #db2777 100%)",
    glowColor: "rgba(236, 72, 153, 0.65)",
    firefoxColor: "#f472b6",
    trackColor: "rgba(32, 8, 24, 0.5)",
  },
  "stealth-obsidian": {
    name: "Stealth Obsidian",
    description: "Subtle dark mode carbon with zero distraction",
    thumbBg: "linear-gradient(180deg, #52525b 0%, #27272a 50%, #18181b 100%)",
    thumbHoverBg: "linear-gradient(180deg, #71717a 0%, #3f3f46 50%, #27272a 100%)",
    glowColor: "rgba(0, 0, 0, 0.7)",
    firefoxColor: "#71717a",
    trackColor: "rgba(10, 10, 12, 0.8)",
  },
};

export const DEFAULT_SCROLLBAR_SETTINGS: ScrollbarSettings = {
  presetId: "neon-violet",
  syncBoth: true,

  pageWidth: 8,
  pageThumbBg: SCROLLBAR_PRESETS["neon-violet"].thumbBg,
  pageThumbHoverBg: SCROLLBAR_PRESETS["neon-violet"].thumbHoverBg,
  pageThumbRadius: 9999,
  pageGlow: 10,
  pageTrackOpacity: 0.5,
  pageThumbColor: SCROLLBAR_PRESETS["neon-violet"].firefoxColor,

  innerWidth: 7,
  innerThumbBg: SCROLLBAR_PRESETS["neon-violet"].thumbBg,
  innerThumbHoverBg: SCROLLBAR_PRESETS["neon-violet"].thumbHoverBg,
  innerThumbRadius: 9999,
  innerGlow: 10,
  innerTrackOpacity: 0.45,
  innerThumbColor: SCROLLBAR_PRESETS["neon-violet"].firefoxColor,

  customColorStart: "#38bdf8",
  customColorEnd: "#1d4ed8",
  customHoverColor: "#60a5fa",
};

const STORAGE_KEY = "7h-scrollbar-settings-v1";

function applyScrollbarSettingsToDOM(settings: ScrollbarSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Global Page Scrollbar
  root.style.setProperty("--scrollbar-width", `${settings.pageWidth}px`);
  root.style.setProperty("--scrollbar-thumb-bg", settings.pageThumbBg);
  root.style.setProperty("--scrollbar-thumb-hover-bg", settings.pageThumbHoverBg);
  root.style.setProperty(
    "--scrollbar-thumb-radius",
    settings.pageThumbRadius >= 999 ? "9999px" : `${settings.pageThumbRadius}px`
  );
  root.style.setProperty(
    "--scrollbar-thumb-shadow",
    settings.pageGlow > 0
      ? `0 0 ${settings.pageGlow}px ${
          settings.presetId === "custom"
            ? settings.customHoverColor
            : SCROLLBAR_PRESETS[settings.presetId]?.glowColor || "rgba(192, 132, 252, 0.6)"
        }`
      : "none"
  );
  root.style.setProperty(
    "--scrollbar-thumb-hover-shadow",
    settings.pageGlow > 0
      ? `0 0 ${settings.pageGlow + 4}px ${
          settings.presetId === "custom"
            ? settings.customHoverColor
            : SCROLLBAR_PRESETS[settings.presetId]?.glowColor || "rgba(192, 132, 252, 0.9)"
        }`
      : "none"
  );
  root.style.setProperty(
    "--scrollbar-track-bg",
    `rgba(15, 7, 32, ${settings.pageTrackOpacity})`
  );
  root.style.setProperty("--scrollbar-color-thumb", settings.pageThumbColor);
  root.style.setProperty(
    "--scrollbar-color-track",
    `rgba(15, 7, 32, ${Math.max(0.2, settings.pageTrackOpacity)})`
  );

  // Inner Container Scrollbars (.custom-scrollbar & inner elements all over the site)
  root.style.setProperty("--scrollbar-inner-width", `${settings.innerWidth}px`);
  root.style.setProperty("--scrollbar-inner-thumb-bg", settings.innerThumbBg);
  root.style.setProperty("--scrollbar-inner-thumb-hover-bg", settings.innerThumbHoverBg);
  root.style.setProperty(
    "--scrollbar-inner-thumb-radius",
    settings.innerThumbRadius >= 999 ? "9999px" : `${settings.innerThumbRadius}px`
  );
  root.style.setProperty(
    "--scrollbar-inner-thumb-shadow",
    settings.innerGlow > 0
      ? `0 0 ${settings.innerGlow}px ${
          settings.presetId === "custom"
            ? settings.customHoverColor
            : SCROLLBAR_PRESETS[settings.presetId]?.glowColor || "rgba(192, 132, 252, 0.6)"
        }`
      : "none"
  );
  root.style.setProperty(
    "--scrollbar-inner-thumb-hover-shadow",
    settings.innerGlow > 0
      ? `0 0 ${settings.innerGlow + 4}px ${
          settings.presetId === "custom"
            ? settings.customHoverColor
            : SCROLLBAR_PRESETS[settings.presetId]?.glowColor || "rgba(192, 132, 252, 0.9)"
        }`
      : "none"
  );
  root.style.setProperty(
    "--scrollbar-inner-track-bg",
    `rgba(15, 7, 32, ${settings.innerTrackOpacity})`
  );
  root.style.setProperty("--scrollbar-inner-color-thumb", settings.innerThumbColor);
  root.style.setProperty(
    "--scrollbar-inner-color-track",
    `rgba(15, 7, 32, ${Math.max(0.2, settings.innerTrackOpacity)})`
  );
}

export default function ScrollbarTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"global" | "containers">("global");
  const [settings, setSettings] = useState<ScrollbarSettings>(DEFAULT_SCROLLBAR_SETTINGS);
  const [copied, setCopied] = useState(false);

  // Sync external store to avoid SSR hydration mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
        applyScrollbarSettingsToDOM({ ...DEFAULT_SCROLLBAR_SETTINGS, ...parsed });
      } else {
        applyScrollbarSettingsToDOM(DEFAULT_SCROLLBAR_SETTINGS);
      }
    } catch {
      applyScrollbarSettingsToDOM(DEFAULT_SCROLLBAR_SETTINGS);
    }
  }, []);

  const updateSettings = useCallback((newSettings: ScrollbarSettings) => {
    setSettings(newSettings);
    applyScrollbarSettingsToDOM(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore in incognito
    }
  }, []);

  const handleSelectPreset = (presetId: ScrollbarPresetId) => {
    if (presetId === "custom") {
      const customBg = `linear-gradient(180deg, ${settings.customColorStart} 0%, ${settings.customColorEnd} 100%)`;
      const next: ScrollbarSettings = {
        ...settings,
        presetId: "custom",
        pageThumbBg: customBg,
        pageThumbHoverBg: `linear-gradient(180deg, #ffffff 0%, ${settings.customHoverColor} 100%)`,
        pageThumbColor: settings.customHoverColor,
        ...(settings.syncBoth
          ? {
              innerThumbBg: customBg,
              innerThumbHoverBg: `linear-gradient(180deg, #ffffff 0%, ${settings.customHoverColor} 100%)`,
              innerThumbColor: settings.customHoverColor,
            }
          : {}),
      };
      updateSettings(next);
      return;
    }

    const preset = SCROLLBAR_PRESETS[presetId];
    if (!preset) return;

    const next: ScrollbarSettings = {
      ...settings,
      presetId,
      pageThumbBg: preset.thumbBg,
      pageThumbHoverBg: preset.thumbHoverBg,
      pageThumbColor: preset.firefoxColor,
      pageTrackOpacity: 0.5,
      ...(settings.syncBoth
        ? {
            innerThumbBg: preset.thumbBg,
            innerThumbHoverBg: preset.thumbHoverBg,
            innerThumbColor: preset.firefoxColor,
            innerTrackOpacity: 0.45,
          }
        : {}),
    };
    updateSettings(next);
  };

  const handleUpdateWidth = (width: number) => {
    const next: ScrollbarSettings = {
      ...settings,
      ...(activeTab === "global" || settings.syncBoth ? { pageWidth: width } : {}),
      ...(activeTab === "containers" || settings.syncBoth ? { innerWidth: width } : {}),
    };
    updateSettings(next);
  };

  const handleUpdateGlow = (glow: number) => {
    const next: ScrollbarSettings = {
      ...settings,
      ...(activeTab === "global" || settings.syncBoth ? { pageGlow: glow } : {}),
      ...(activeTab === "containers" || settings.syncBoth ? { innerGlow: glow } : {}),
    };
    updateSettings(next);
  };

  const handleUpdateRadius = (radius: number) => {
    const next: ScrollbarSettings = {
      ...settings,
      ...(activeTab === "global" || settings.syncBoth ? { pageThumbRadius: radius } : {}),
      ...(activeTab === "containers" || settings.syncBoth ? { innerThumbRadius: radius } : {}),
    };
    updateSettings(next);
  };

  const handleUpdateTrackOpacity = (opacity: number) => {
    const next: ScrollbarSettings = {
      ...settings,
      ...(activeTab === "global" || settings.syncBoth ? { pageTrackOpacity: opacity } : {}),
      ...(activeTab === "containers" || settings.syncBoth ? { innerTrackOpacity: opacity } : {}),
    };
    updateSettings(next);
  };

  const handleToggleSync = (sync: boolean) => {
    const next: ScrollbarSettings = {
      ...settings,
      syncBoth: sync,
      ...(sync
        ? {
            innerWidth: settings.pageWidth,
            innerThumbBg: settings.pageThumbBg,
            innerThumbHoverBg: settings.pageThumbHoverBg,
            innerThumbRadius: settings.pageThumbRadius,
            innerGlow: settings.pageGlow,
            innerTrackOpacity: settings.pageTrackOpacity,
            innerThumbColor: settings.pageThumbColor,
          }
        : {}),
    };
    updateSettings(next);
  };

  const handleReset = () => {
    updateSettings(DEFAULT_SCROLLBAR_SETTINGS);
  };

  const handleCopyCSS = () => {
    const css = `:root {
  /* Global Page Scrollbar */
  --scrollbar-width: ${settings.pageWidth}px;
  --scrollbar-thumb-bg: ${settings.pageThumbBg};
  --scrollbar-thumb-hover-bg: ${settings.pageThumbHoverBg};
  --scrollbar-thumb-radius: ${settings.pageThumbRadius >= 999 ? "9999px" : `${settings.pageThumbRadius}px`};
  --scrollbar-thumb-shadow: ${
    settings.pageGlow > 0 ? `0 0 ${settings.pageGlow}px ${settings.pageThumbColor}` : "none"
  };
  --scrollbar-thumb-hover-shadow: ${
    settings.pageGlow > 0 ? `0 0 ${settings.pageGlow + 4}px ${settings.pageThumbColor}` : "none"
  };
  --scrollbar-track-bg: rgba(15, 7, 32, ${settings.pageTrackOpacity});
  --scrollbar-color-thumb: ${settings.pageThumbColor};
  --scrollbar-color-track: rgba(15, 7, 32, ${Math.max(0.2, settings.pageTrackOpacity)});

  /* Inner Containers (.custom-scrollbar & site-wide inner scroll areas) */
  --scrollbar-inner-width: ${settings.innerWidth}px;
  --scrollbar-inner-thumb-bg: ${settings.innerThumbBg};
  --scrollbar-inner-thumb-hover-bg: ${settings.innerThumbHoverBg};
  --scrollbar-inner-thumb-radius: ${settings.innerThumbRadius >= 999 ? "9999px" : `${settings.innerThumbRadius}px`};
  --scrollbar-inner-thumb-shadow: ${
    settings.innerGlow > 0 ? `0 0 ${settings.innerGlow}px ${settings.innerThumbColor}` : "none"
  };
  --scrollbar-inner-thumb-hover-shadow: ${
    settings.innerGlow > 0 ? `0 0 ${settings.innerGlow + 4}px ${settings.innerThumbColor}` : "none"
  };
  --scrollbar-inner-track-bg: rgba(15, 7, 32, ${settings.innerTrackOpacity});
  --scrollbar-inner-color-thumb: ${settings.innerThumbColor};
  --scrollbar-inner-color-track: rgba(15, 7, 32, ${Math.max(0.2, settings.innerTrackOpacity)});
}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  const currentWidth = activeTab === "global" ? settings.pageWidth : settings.innerWidth;
  const currentGlow = activeTab === "global" ? settings.pageGlow : settings.innerGlow;
  const currentRadius = activeTab === "global" ? settings.pageThumbRadius : settings.innerThumbRadius;
  const currentTrackOpacity =
    activeTab === "global" ? settings.pageTrackOpacity : settings.innerTrackOpacity;

  return (
    <>
      {/* Floating Trigger Pill — docked right above Dark Atmosphere */}
      <div className="fixed bottom-[136px] left-8 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Custom Scrollbar Tuner"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/20 bg-black/85 hover:bg-black backdrop-blur-md shadow-2xl text-xs font-semibold text-zinc-200 hover:text-white transition-all transform active:scale-95 group"
        >
          {/* Mini Scrollbar Swatch */}
          <div
            className="w-2 h-4 rounded-full border border-white/20 transition-transform group-hover:scale-110 bg-[var(--swatch-bg)] shadow-[var(--swatch-glow)]"
            style={
              {
                "--swatch-bg":
                  settings.presetId === "custom"
                    ? settings.customHoverColor
                    : SCROLLBAR_PRESETS[settings.presetId]?.firefoxColor || "#c084fc",
                "--swatch-glow": `0 0 6px ${
                  settings.presetId === "custom"
                    ? settings.customHoverColor
                    : SCROLLBAR_PRESETS[settings.presetId]?.firefoxColor || "#c084fc"
                }`,
              } as React.CSSProperties
            }
          />
          <span>Scrollbars</span>
          <span className="font-mono text-[10px] text-zinc-400 group-hover:text-amber-300">
            {settings.pageWidth}px
          </span>
          <Sliders className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-300 transition-colors" />
        </button>
      </div>

      {/* Tuner Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div
            role="dialog"
            aria-label="Global & Site-Wide Custom Scrollbar Tuner"
            className="w-full max-w-lg rounded-[var(--radius-box)] bg-[#0d0a14] border border-white/15 p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    Custom Scrollbar Studio
                    <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Live Tuner
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Live control of the global page scrollbar & all site containers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Scrollbar Tuner"
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope Selector Tabs & Sync Toggle */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Target Scope
                </span>
                <div className="flex items-center gap-2">
                  <Toggle
                    size="sm"
                    checked={settings.syncBoth}
                    onChange={handleToggleSync}
                    label={
                      <span className="text-[11px] text-zinc-300 font-medium">
                        Sync Page & Containers
                      </span>
                    }
                  />
                </div>
              </div>

              {!settings.syncBoth && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setActiveTab("global")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "global"
                        ? "bg-purple-600/30 text-purple-200 border border-purple-500/50"
                        : "bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                    }`}
                  >
                    <span>🌐 Global Page Scrollbar</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("containers")}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "containers"
                        ? "bg-purple-600/30 text-purple-200 border border-purple-500/50"
                        : "bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                    }`}
                  >
                    <span>📦 Site Containers (.custom-scrollbar)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Color Presets */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  Color & Atmosphere Presets
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {settings.presetId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  Object.keys(SCROLLBAR_PRESETS) as Array<
                    Exclude<ScrollbarPresetId, "custom">
                  >
                ).map((id) => {
                  const preset = SCROLLBAR_PRESETS[id];
                  const active = settings.presetId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelectPreset(id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-purple-900/30 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Mini vertical bar preview */}
                        <div
                          className="w-2.5 h-7 rounded-full border border-white/20 shrink-0 bg-[var(--preview-bg)] shadow-[var(--preview-glow)]"
                          style={
                            {
                              "--preview-bg": preset.firefoxColor,
                              "--preview-glow": `0 0 6px ${preset.firefoxColor}`,
                            } as React.CSSProperties
                          }
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {preset.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                      {active && (
                        <Check className="w-4 h-4 text-purple-400 shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension & Geometry Sliders */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              {/* Width / Thickness */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
                    Thickness (Width)
                  </span>
                  <span className="font-mono text-purple-300 font-bold">
                    {currentWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={currentWidth}
                  onChange={(e) => handleUpdateWidth(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <button
                    onClick={() => handleUpdateWidth(4)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Ultra Thin (4px)
                  </button>
                  <button
                    onClick={() => handleUpdateWidth(8)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Default (8px)
                  </button>
                  <button
                    onClick={() => handleUpdateWidth(12)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Medium (12px)
                  </button>
                  <button
                    onClick={() => handleUpdateWidth(16)}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Bold (16px)
                  </button>
                </div>
              </div>

              {/* Glow & Halo Shadow */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    Neon Glow Intensity
                  </span>
                  <span className="font-mono text-purple-300 font-bold">
                    {currentGlow}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={currentGlow}
                  onChange={(e) => handleUpdateGlow(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Corner Radius */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Thumb Corner Radius</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {currentRadius >= 999 ? "Pill (9999px)" : `${currentRadius}px`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "Pill", value: 9999 },
                    { label: "Round (8px)", value: 8 },
                    { label: "Soft (4px)", value: 4 },
                    { label: "Square (0px)", value: 0 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => handleUpdateRadius(r.value)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                        currentRadius === r.value
                          ? "bg-purple-600/30 text-purple-200 border border-purple-500/50"
                          : "bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Track Darkness & Visibility */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Track Background Contrast</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {Math.round(currentTrackOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(currentTrackOpacity * 100)}
                  onChange={(e) => handleUpdateTrackOpacity(Number(e.target.value) / 100)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            </div>

            {/* Interactive Live Testing Area */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                Live Scroll Simulator (.custom-scrollbar)
              </span>
              <div className="h-28 rounded-xl bg-black/60 border border-white/10 p-3 overflow-y-scroll custom-scrollbar text-xs text-zinc-400 space-y-2">
                <p className="font-semibold text-zinc-200">
                  ⚡ Test scroll and hover feel right here:
                </p>
                <p>
                  As you drag the sliders or switch presets above, this test box and
                  the entire page scrollbar respond in real-time.
                </p>
                <p>
                  All 45+ scrollable containers across the site (drawers, media lists,
                  timelines, tour maps, filter panels, news sections) will automatically
                  match these styles.
                </p>
                <p>
                  Settings are automatically saved to your browser so they remain
                  active as you navigate between pages.
                </p>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Signature Purple</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCSS}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied CSS!" : "Copy CSS"}</span>
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
