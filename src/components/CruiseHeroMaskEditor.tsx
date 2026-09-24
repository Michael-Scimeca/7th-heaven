"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  X,
  RotateCcw,
  Copy,
  Check,
  Eye,
  Sparkles,
  Layers,
  MapPin,
} from "lucide-react";

export interface HeroMaskSettings {
  // Hero Top Mask Gradient
  topFadeStart: number; // % (0 - 50)
  topFadeEnd: number; // % (0 - 50)
  topGradientHeight?: number; // px (0 - 400)
  topGradientOpacity?: number; // % (0 - 100)

  // Hero Bottom Mask Gradient
  bottomFadeStart: number; // % (50 - 100)
  bottomFadeEnd: number; // % (50 - 100)

  // Hero Video Filters
  videoBlur: number; // px (0 - 20)
  videoBrightness: number; // % (50 - 150)
  videoContrast: number; // % (50 - 150)
  videoOpacity: number; // % (0 - 100)

  // Hero Bottom ::before Blur Strip Overlay
  beforeHeight: number; // px (0 - 200)
  beforeBlur: number; // px (0 - 80)
  beforeBgOpacity: number; // % (0 - 100)
  beforeZIndex: number; // z-index (1 - 50)

  // Official Itinerary Container Mask & Blur Controls
  itinTopFadeStart: number; // % (0 - 30)
  itinTopFadeEnd: number; // % (0 - 40)
  itinBottomFadeStart: number; // % (60 - 100)
  itinBottomFadeEnd: number; // % (70 - 100)
  itinBgOpacity: number; // % (0 - 100)
  itinBlur: number; // px (0 - 40)

  // Cruising History Section Mask & Blur Controls
  historyTopFadeStart: number; // % (0 - 30)
  historyTopFadeEnd: number; // % (0 - 40)
  historyBottomFadeStart: number; // % (60 - 100)
  historyBottomFadeEnd: number; // % (70 - 100)
  historyBgOpacity: number; // % (0 - 100)
  historyBlur: number; // px (0 - 40)
}

export const DEFAULT_HERO_MASK_SETTINGS: HeroMaskSettings = {
  topFadeStart: 0,
  topFadeEnd: 15,
  topGradientHeight: 240,
  topGradientOpacity: 85,
  bottomFadeStart: 73,
  bottomFadeEnd: 100,
  videoBlur: 0,
  videoBrightness: 90,
  videoContrast: 100,
  videoOpacity: 100,
  beforeHeight: 0,
  beforeBlur: 0,
  beforeBgOpacity: 85,
  beforeZIndex: 10,
  itinTopFadeStart: 0,
  itinTopFadeEnd: 3,
  itinBottomFadeStart: 95,
  itinBottomFadeEnd: 100,
  itinBgOpacity: 90,
  itinBlur: 16,
  historyTopFadeStart: 0,
  historyTopFadeEnd: 2,
  historyBottomFadeStart: 95,
  historyBottomFadeEnd: 100,
  historyBgOpacity: 90,
  historyBlur: 16,
};

export default function CruiseHeroMaskEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<HeroMaskSettings>(
    DEFAULT_HERO_MASK_SETTINGS,
  );

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("7h_cruise_hero_mask_v4");
      if (saved) {
        setSettings({ ...DEFAULT_HERO_MASK_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.dispatchEvent(
      new CustomEvent("hero-mask-update", { detail: settings }),
    );
  }, [settings, mounted]);

  const updateSetting = (key: keyof HeroMaskSettings, value: number) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "itinBottomFadeStart" && next.itinBottomFadeEnd < value) {
        next.itinBottomFadeEnd = value;
      }
      if (key === "itinBottomFadeEnd" && value < next.itinBottomFadeStart) {
        next.itinBottomFadeStart = value;
      }
      if (key === "itinTopFadeStart" && next.itinTopFadeEnd < value) {
        next.itinTopFadeEnd = value;
      }
      if (key === "itinTopFadeEnd" && value < next.itinTopFadeStart) {
        next.itinTopFadeStart = value;
      }
      if (
        key === "historyBottomFadeStart" &&
        next.historyBottomFadeEnd < value
      ) {
        next.historyBottomFadeEnd = value;
      }
      if (
        key === "historyBottomFadeEnd" &&
        value < next.historyBottomFadeStart
      ) {
        next.historyBottomFadeStart = value;
      }
      if (key === "historyTopFadeStart" && next.historyTopFadeEnd < value) {
        next.historyTopFadeEnd = value;
      }
      if (key === "historyTopFadeEnd" && value < next.historyTopFadeStart) {
        next.historyTopFadeStart = value;
      }
      if (key === "bottomFadeStart" && next.bottomFadeEnd < value) {
        next.bottomFadeEnd = value;
      }
      if (key === "bottomFadeEnd" && value < next.bottomFadeStart) {
        next.bottomFadeStart = value;
      }
      if (key === "topFadeStart" && next.topFadeEnd < value) {
        next.topFadeEnd = value;
      }
      if (key === "topFadeEnd" && value < next.topFadeStart) {
        next.topFadeStart = value;
      }
      return next;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem("7h_cruise_hero_mask_v4", JSON.stringify(settings));
      alert("Hero & Itinerary Studio settings saved!");
    } catch {}
  };

  const handleReset = () => {
    setSettings(DEFAULT_HERO_MASK_SETTINGS);
    try {
      localStorage.removeItem("7h_cruise_hero_mask_v4");
    } catch {}
  };

  const generateCSS = () => {
    const topEnd = Math.max(settings.topFadeStart, settings.topFadeEnd);
    const bottomEnd = Math.max(
      settings.bottomFadeStart,
      settings.bottomFadeEnd,
    );
    const itinTopEnd = Math.max(
      settings.itinTopFadeStart,
      settings.itinTopFadeEnd,
    );
    const itinBottomEnd = Math.max(
      settings.itinBottomFadeStart,
      settings.itinBottomFadeEnd,
    );
    const historyTopEnd = Math.max(
      settings.historyTopFadeStart,
      settings.historyTopFadeEnd,
    );
    const historyBottomEnd = Math.max(
      settings.historyBottomFadeStart,
      settings.historyBottomFadeEnd,
    );

    return `/* 7th Heaven Hero & Official Itinerary Section Mask CSS */
.hero-video-mask {
  mask-image: linear-gradient(to bottom, transparent ${settings.topFadeStart}%, black ${topEnd}%, black ${settings.bottomFadeStart}%, transparent ${bottomEnd}%);
  -webkit-mask-image: linear-gradient(to bottom, transparent ${settings.topFadeStart}%, black ${topEnd}%, black ${settings.bottomFadeStart}%, transparent ${bottomEnd}%);
}

.hero-video-element {
  filter: blur(${settings.videoBlur}px) brightness(${settings.videoBrightness}%) contrast(${settings.videoContrast}%);
  -webkit-filter: blur(${settings.videoBlur}px) brightness(${settings.videoBrightness}%) contrast(${settings.videoContrast}%);
  opacity: ${settings.videoOpacity / 100};
}

.official-itinerary-section {
  mask-image: linear-gradient(to bottom, transparent ${settings.itinTopFadeStart}%, black ${itinTopEnd}%, black ${settings.itinBottomFadeStart}%, transparent ${itinBottomEnd}%);
  -webkit-mask-image: linear-gradient(to bottom, transparent ${settings.itinTopFadeStart}%, black ${itinTopEnd}%, black ${settings.itinBottomFadeStart}%, transparent ${itinBottomEnd}%);
  backdrop-filter: blur(${settings.itinBlur}px);
  -webkit-backdrop-filter: blur(${settings.itinBlur}px);
  background: rgba(0, 0, 0, ${settings.itinBgOpacity / 100});
}

.cruising-history-section {
  mask-image: linear-gradient(to bottom, transparent ${settings.historyTopFadeStart}%, black ${historyTopEnd}%, black ${settings.historyBottomFadeStart}%, transparent ${historyBottomEnd}%);
  -webkit-mask-image: linear-gradient(to bottom, transparent ${settings.historyTopFadeStart}%, black ${historyTopEnd}%, black ${settings.historyBottomFadeStart}%, transparent ${historyBottomEnd}%);
  backdrop-filter: blur(${settings.historyBlur}px);
  -webkit-backdrop-filter: blur(${settings.historyBlur}px);
  background: rgba(0, 0, 0, ${settings.historyBgOpacity / 100});
}`;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Studio Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-lg border border-purple-300/40 bg-cyan-600 px-4 py-3 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-[background-color,box-shadow,border-color] hover:bg-cyan-500"
        >
          <Sliders className="h-5 w-5" />
          <span className="r">PAGE & ITINERARY CSS STUDIO</span>
        </button>
      )}

      {/* Main Drawer Panel */}
      {isOpen && (
        <div
          className="fixed top-[88px] right-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-purple-500/40 bg-[#0c101d]/95 shadow-[0_10px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          style={{ height: "calc(100vh - 110px)" }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-purple-500/20 bg-black/40 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-400/40 bg-cyan-500/20">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h3>HERO & ITINERARY STUDIO</h3>
                <p className="text-gray-400">
                  Controls for Hero Video & Official Itinerary
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="Reset to Defaults"
                className="rounded-lg bg-[#00000029] p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-[#00000029] p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Controls */}
          <div
            className="flex-1 space-y-6 overflow-y-scroll p-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#06b6d4 rgba(12, 16, 29, 0.8)",
            }}
          >
            {/* 📍 1. OFFICIAL ITINERARY & CRUISING HISTORY SECTION MASK & BG */}
            <div className="space-y-3 rounded-lg border border-purple-500/30 bg-purple-950/30 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" /> OFFICIAL
                  ITINERARY & CRUISING HISTORY
                </span>
                <span className="/70 text-[10px]">#itinerary & .history</span>
              </div>

              {/* Itinerary Top Fade Start */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    Itinerary Top Mask Start
                  </span>
                  <span>{settings.itinTopFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.itinTopFadeStart}
                  onChange={(e) =>
                    updateSetting("itinTopFadeStart", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-purple-400"
                />
              </div>

              {/* Itinerary Top Fade End */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Itinerary Top Mask End</span>
                  <span>{settings.itinTopFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.itinTopFadeEnd}
                  onChange={(e) =>
                    updateSetting("itinTopFadeEnd", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-purple-400"
                />
              </div>

              {/* Itinerary Bottom Fade Start */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    Itinerary Bottom Mask Start
                  </span>
                  <span>{settings.itinBottomFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={settings.itinBottomFadeStart}
                  onChange={(e) =>
                    updateSetting("itinBottomFadeStart", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-purple-400"
                />
              </div>

              {/* Itinerary Bottom Fade End */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    Itinerary Bottom Mask End
                  </span>
                  <span>{settings.itinBottomFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={settings.itinBottomFadeEnd}
                  onChange={(e) =>
                    updateSetting("itinBottomFadeEnd", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-purple-400"
                />
              </div>

              {/* Itinerary Background Opacity */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    Itinerary Dark BG Opacity
                  </span>
                  <span>{settings.itinBgOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.itinBgOpacity}
                  onChange={(e) =>
                    updateSetting("itinBgOpacity", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-purple-400"
                />
              </div>

              {/* Itinerary Backdrop Blur */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Itinerary Backdrop Blur</span>
                  <span>{settings.itinBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.itinBlur}
                  onChange={(e) =>
                    updateSetting("itinBlur", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-purple-400"
                />
              </div>
            </div>

            {/* 📜 2. CRUISING HISTORY SECTION MASK & BG */}
            <div className="space-y-3 rounded-lg border border-purple-500/30 bg-cyan-950/30 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> CRUISING HISTORY CONTAINER
                </span>
                <span className="text-[10px]">.history-timeline</span>
              </div>

              {/* History Top Fade Start */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">History Top Mask Start</span>
                  <span>{settings.historyTopFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.historyTopFadeStart}
                  onChange={(e) =>
                    updateSetting("historyTopFadeStart", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* History Top Fade End */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">History Top Mask End</span>
                  <span>{settings.historyTopFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.historyTopFadeEnd}
                  onChange={(e) =>
                    updateSetting("historyTopFadeEnd", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* History Bottom Fade Start */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    History Bottom Mask Start
                  </span>
                  <span>{settings.historyBottomFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={settings.historyBottomFadeStart}
                  onChange={(e) =>
                    updateSetting(
                      "historyBottomFadeStart",
                      Number(e.target.value),
                    )
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* History Bottom Fade End */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">History Bottom Mask End</span>
                  <span>{settings.historyBottomFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={settings.historyBottomFadeEnd}
                  onChange={(e) =>
                    updateSetting(
                      "historyBottomFadeEnd",
                      Number(e.target.value),
                    )
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* History Background Opacity */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">History Dark BG Opacity</span>
                  <span>{settings.historyBgOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.historyBgOpacity}
                  onChange={(e) =>
                    updateSetting("historyBgOpacity", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* History Backdrop Blur */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">History Backdrop Blur</span>
                  <span>{settings.historyBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.historyBlur}
                  onChange={(e) =>
                    updateSetting("historyBlur", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>
            </div>

            {/* 🎬 2. HERO TOP MASK GRADIENT */}
            <div className="space-y-3 rounded-lg border border-purple-500/20 bg-cyan-950/30 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  HERO TOP MASK GRADIENT
                </span>
              </div>

              {/* Top Fade Start */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Hero Top Fade Start</span>
                  <span>{settings.topFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.topFadeStart}
                  onChange={(e) =>
                    updateSetting("topFadeStart", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Top Fade End */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Hero Top Fade End</span>
                  <span>{settings.topFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.topFadeEnd}
                  onChange={(e) =>
                    updateSetting("topFadeEnd", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Top Dark Overlay Gradient Height */}
              <div className="border-t border-purple-500/20 pt-2">
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    Top Dark Gradient Height
                  </span>
                  <span>{settings.topGradientHeight ?? 240}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={settings.topGradientHeight ?? 240}
                  onChange={(e) =>
                    updateSetting(
                      "topGradientHeight" as any,
                      Number(e.target.value),
                    )
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Top Dark Overlay Gradient Opacity */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">
                    Top Dark Gradient Opacity
                  </span>
                  <span>{settings.topGradientOpacity ?? 85}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.topGradientOpacity ?? 85}
                  onChange={(e) =>
                    updateSetting(
                      "topGradientOpacity" as any,
                      Number(e.target.value),
                    )
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>
            </div>

            {/* 🎬 3. HERO BOTTOM MASK GRADIENT */}
            <div className="space-y-3 rounded-lg border border-purple-500/20 bg-cyan-950/30 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> HERO BOTTOM MASK GRADIENT
                </span>
              </div>

              {/* Bottom Fade Start */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Hero Bottom Fade Start</span>
                  <span>{settings.bottomFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  value={settings.bottomFadeStart}
                  onChange={(e) =>
                    updateSetting("bottomFadeStart", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Bottom Fade End */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Hero Bottom Fade End</span>
                  <span>{settings.bottomFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={settings.bottomFadeEnd}
                  onChange={(e) =>
                    updateSetting("bottomFadeEnd", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>
            </div>

            {/* 🎥 4. VIDEO FILTERS */}
            <div className="space-y-3 rounded-lg border border-purple-500/20 bg-cyan-950/30 p-3.5">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> HERO VIDEO FILTERS
              </span>

              {/* Video Blur */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Video Blur</span>
                  <span>{settings.videoBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.videoBlur}
                  onChange={(e) =>
                    updateSetting("videoBlur", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Video Brightness */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Brightness</span>
                  <span>{settings.videoBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  value={settings.videoBrightness}
                  onChange={(e) =>
                    updateSetting("videoBrightness", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Contrast</span>
                  <span>{settings.videoContrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.videoContrast}
                  onChange={(e) =>
                    updateSetting("videoContrast", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Opacity</span>
                  <span>{settings.videoOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.videoOpacity}
                  onChange={(e) =>
                    updateSetting("videoOpacity", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>
            </div>

            {/* 🥞 5. ::BEFORE BLUR OVERLAY STRIP */}
            <div className="space-y-3 rounded-lg border border-purple-500/20 bg-cyan-950/30 p-3.5">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> ::BEFORE BLUR OVERLAY STRIP
              </span>

              {/* Strip Height */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Strip Height</span>
                  <span>{settings.beforeHeight}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.beforeHeight}
                  onChange={(e) =>
                    updateSetting("beforeHeight", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Backdrop Blur */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Backdrop Blur</span>
                  <span>{settings.beforeBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.beforeBlur}
                  onChange={(e) =>
                    updateSetting("beforeBlur", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Dark Tint Opacity */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Dark Tint Opacity</span>
                  <span>{settings.beforeBgOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.beforeBgOpacity}
                  onChange={(e) =>
                    updateSetting("beforeBgOpacity", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>

              {/* Z-Index */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">Z-Index Layer</span>
                  <span>{settings.beforeZIndex}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.beforeZIndex}
                  onChange={(e) =>
                    updateSetting("beforeZIndex", Number(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer rounded-lg bg-gray-700 accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex shrink-0 items-center gap-2 rounded-b-2xl border-t border-purple-500/20 bg-black/50 p-3">
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-cyan-600 py-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-[background-color,box-shadow] hover:bg-cyan-500"
            >
              Save Changes
            </button>
            <button
              onClick={copyCSS}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
