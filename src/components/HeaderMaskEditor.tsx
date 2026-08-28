"use client";

import React, { useState, useEffect } from "react";

interface MaskSettings {
  height: number;         // in px (80 - 400)
  fadeStart: number;      // in % (0 - 100)
  fadeEnd: number;        // in % (50 - 100)
  blurAmount: number;     // in px (0 - 60)
  bgOpacity: number;      // in % (0 - 100)
  maskMode: "linear" | "ease" | "sharp";
}

const DEFAULT_SETTINGS: MaskSettings = {
  height: 228,
  fadeStart: 70,
  fadeEnd: 100,
  blurAmount: 24,
  bgOpacity: 60,
  maskMode: "linear",
};

export default function HeaderMaskEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<MaskSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("7th_header_mask_settings_v1");
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {
      // Fallback to defaults
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty("--header-mask-height", `${settings.height}px`);
    root.style.setProperty("--header-mask-fade-start", `${settings.fadeStart}%`);
    root.style.setProperty("--header-mask-fade-end", `${settings.fadeEnd}%`);
    root.style.setProperty("--header-mask-blur", `${settings.blurAmount}px`);
    root.style.setProperty("--header-mask-opacity", `${settings.bgOpacity / 100}`);

    try {
      localStorage.setItem("7th_header_mask_settings_v1", JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings, mounted]);

  const updateSetting = <K extends keyof MaskSettings>(key: K, value: MaskSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: Partial<MaskSettings>) => {
    setSettings((prev) => ({ ...prev, ...preset }));
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[99999] font-sans pointer-events-auto">
      {/* Floating Toggle Button */}
      <button
        aria-label="Toggle Header Mask Controls"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-black/90 hover:bg-purple-950/90 text-white font-bold uppercase tracking-wider rounded-lg border border-purple-500/40 backdrop-blur-[45px] shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <span className="text-purple-400">🎛️</span>
        <span>Header Mask UI</span>
        <span className={`text-[10px] text-purple-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▲
        </span>
      </button>

      {/* Control Drawer Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 sm:w-96 bg-[#090514]/95backdrop-blur-[18px] text-white border border-purple-500/30 rounded-lg p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div>
              <h3 className="font-bold tracking-wide uppercase text-purple-200">
                Header Mask Gradient Editor
              </h3>
              <p className="text-purple-300/70">
                Live mask gradient, height, blur & opacity control
              </p>
            </div>
            <button
              aria-label="Close Header Mask Studio"
              onClick={() => setIsOpen(false)}
              className="text-purple-400 hover:text-white font-bold px-2 py-1 bg-purple-900/30 rounded hover:bg-purple-800/50 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Visual Gradient Preview Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-purple-300/80">
              <span>Mask Gradient Preview</span>
              <span>0% ── {settings.fadeStart}% ── {settings.fadeEnd}%</span>
            </div>
            <div
              className="h-7 w-full rounded-lg border border-purple-500/30 relative overflow-hidden shadow-inner"
              style={{
                background: `linear-gradient(to right, rgba(147, 51, 234, 0.9) 0%, rgba(147, 51, 234, 0.9) ${settings.fadeStart}%, rgba(147, 51, 234, 0) ${settings.fadeEnd}%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-mono text-white/90 drop-shadow">
                <span>Solid (Black)</span>
                <span>Fade</span>
                <span>Transparent</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-purple-300/80">
              Presets
            </label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => applyPreset({ height: 228, fadeStart: 70, fadeEnd: 100, blurAmount: 24, bgOpacity: 60, maskMode: "linear" })}
                className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-800/80 border border-purple-500/30 rounded-lg font-semibold text-left transition-colors cursor-pointer"
              >
                ⚡ Standard 228px
              </button>
              <button
                onClick={() => applyPreset({ height: 260, fadeStart: 85, fadeEnd: 100, blurAmount: 40, bgOpacity: 75, maskMode: "ease" })}
                className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-800/80 border border-purple-500/30 rounded-lg font-semibold text-left transition-colors cursor-pointer"
              >
                ✨ Ultra Glass
              </button>
              <button
                onClick={() => applyPreset({ height: 200, fadeStart: 40, fadeEnd: 100, blurAmount: 16, bgOpacity: 45, maskMode: "linear" })}
                className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-800/80 border border-purple-500/30 rounded-lg font-semibold text-left transition-colors cursor-pointer"
              >
                🌊 Soft Fade
              </button>
              <button
                onClick={() => applyPreset({ height: 280, fadeStart: 95, fadeEnd: 100, blurAmount: 32, bgOpacity: 90, maskMode: "sharp" })}
                className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-800/80 border border-purple-500/30 rounded-lg font-semibold text-left transition-colors cursor-pointer"
              >
                ⬛ Solid Dark
              </button>
            </div>
          </div>

          {/* Sliders Group */}
          <div className="flex flex-col gap-3.5 mt-1">
            {/* Expanded Mask Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-200">Expanded Mask Height</span>
                <span className="text-purple-400 font-mono">{settings.height}px</span>
              </div>
              <input
                type="range"
                aria-label="Expanded Mask Height"
                min={80}
                max={400}
                value={settings.height}
                onChange={(e) => updateSetting("height", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Gradient Fade Start */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-200">Bottom Fade Start</span>
                <span className="text-purple-400 font-mono">{settings.fadeStart}%</span>
              </div>
              <input
                type="range"
                aria-label="Bottom Fade Start"
                min={0}
                max={100}
                value={settings.fadeStart}
                onChange={(e) => updateSetting("fadeStart", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Gradient Fade End */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-200">Bottom Fade End (100% Transparent)</span>
                <span className="text-purple-400 font-mono">{settings.fadeEnd}%</span>
              </div>
              <input
                type="range"
                aria-label="Bottom Fade End"
                min={50}
                max={100}
                value={settings.fadeEnd}
                onChange={(e) => updateSetting("fadeEnd", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Backdrop Blur Amount */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-200">Backdrop Blur Radius</span>
                <span className="text-purple-400 font-mono">{settings.blurAmount}px</span>
              </div>
              <input
                type="range"
                aria-label="Backdrop Blur Radius"
                min={0}
                max={60}
                value={settings.blurAmount}
                onChange={(e) => updateSetting("blurAmount", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Dark Background Opacity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold">
                <span className="text-purple-200">Background Dark Opacity</span>
                <span className="text-purple-400 font-mono">{settings.bgOpacity}%</span>
              </div>
              <input
                type="range"
                aria-label="Background Dark Opacity"
                min={0}
                max={100}
                value={settings.bgOpacity}
                onChange={(e) => updateSetting("bgOpacity", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="w-full py-2 mt-1 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white font-bold uppercase tracking-wider rounded-lg border border-purple-500/20 transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      )}
    </div>
  );
}
