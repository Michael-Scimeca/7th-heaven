"use client";

import { useEffect } from "react";

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

  pageWidth: 3,
  pageThumbBg: SCROLLBAR_PRESETS["neon-violet"].thumbBg,
  pageThumbHoverBg: SCROLLBAR_PRESETS["neon-violet"].thumbHoverBg,
  pageThumbRadius: 0,
  pageGlow: 0,
  pageTrackOpacity: 0.5,
  pageThumbColor: SCROLLBAR_PRESETS["neon-violet"].firefoxColor,

  innerWidth: 3,
  innerThumbBg: SCROLLBAR_PRESETS["neon-violet"].thumbBg,
  innerThumbHoverBg: SCROLLBAR_PRESETS["neon-violet"].thumbHoverBg,
  innerThumbRadius: 0,
  innerGlow: 0,
  innerTrackOpacity: 0.5,
  innerThumbColor: SCROLLBAR_PRESETS["neon-violet"].firefoxColor,

  customColorStart: "#38bdf8",
  customColorEnd: "#1d4ed8",
  customHoverColor: "#60a5fa",
};

const STORAGE_KEY = "7h-scrollbar-settings-v2";

function getPresetTrackRgb(presetId: ScrollbarPresetId): string {
  switch (presetId) {
    case "laser-cyan":
      return "8, 20, 32";
    case "sunset-amber":
      return "32, 18, 8";
    case "minimal-white":
      return "20, 20, 25";
    case "emerald-matrix":
      return "6, 30, 20";
    case "cyber-pink":
      return "32, 8, 24";
    case "stealth-obsidian":
      return "10, 10, 12";
    case "custom":
      return "12, 12, 16";
    case "neon-violet":
    default:
      return "15, 7, 32";
  }
}

function applyScrollbarSettingsToDOM(settings: ScrollbarSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const trackRgb = getPresetTrackRgb(settings.presetId);

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
    `rgba(${trackRgb}, ${settings.pageTrackOpacity})`
  );
  root.style.setProperty("--scrollbar-color-thumb", settings.pageThumbColor);
  root.style.setProperty(
    "--scrollbar-color-track",
    `rgba(${trackRgb}, ${Math.max(0.2, settings.pageTrackOpacity)})`
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
    `rgba(${trackRgb}, ${settings.innerTrackOpacity})`
  );
  root.style.setProperty("--scrollbar-inner-color-thumb", settings.innerThumbColor);
  root.style.setProperty(
    "--scrollbar-inner-color-track",
    `rgba(${trackRgb}, ${Math.max(0.2, settings.innerTrackOpacity)})`
  );
}

export default function ScrollbarTuner() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ScrollbarSettings>;
        applyScrollbarSettingsToDOM({ ...DEFAULT_SCROLLBAR_SETTINGS, ...parsed });
      } else {
        applyScrollbarSettingsToDOM(DEFAULT_SCROLLBAR_SETTINGS);
      }
    } catch {
      applyScrollbarSettingsToDOM(DEFAULT_SCROLLBAR_SETTINGS);
    }
  }, []);

  return null;
}
