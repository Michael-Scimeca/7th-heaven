"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sliders, X, Copy, Check, RotateCcw, Sparkles, Layers, Eye, Type, CheckSquare, Search } from "lucide-react";

export interface InputStyleSettings {
  bgRed: number;            // 0 - 255
  bgGreen: number;          // 0 - 255
  bgBlue: number;           // 0 - 255
  bgOpacity: number;        // 0 - 1 (step 0.01)
  blurAmount: number;       // in px (0 - 40)
  borderWidth: number;      // in px (0 - 6)
  borderColor: string;      // hex or rgba
  borderRadius: number;     // in px (0 - 36)
  textColor: string;        // hex
  placeholderOpacity: number;// 0 - 1
  focusBorderColor: string; // hex
  focusGlowOpacity: number; // 0 - 1
  paddingY: number;         // in px (6 - 24)
  paddingX: number;         // in px (8 - 32)

  // Search Bar Controls
  searchIconColor: string;    // hex or rgb
  searchIconOpacity: number;  // 0 - 1
  searchIconLeft: number;     // in px (8 - 32)
  searchIconTopOffset: number;// in px (-6 to 6)
  searchPaddingLeft: number;  // in px (32 - 80)
  searchPaddingRight: number; // in px (32 - 80)
  searchPaddingY: number;     // in px (6 - 24)
  searchMaxWidth: number;     // in px (300 - 1000)
  searchRadius: number;       // in px (0 - 36)

  // Checkbox Controls
  checkboxAccentColor: string; // hex or rgb
  checkboxSize: number;        // in px (12 - 32)
  checkboxRadius: number;      // in px (0 - 16)

  // Typography & Element Tags
  headingColor: string;     // hex or rgb
  pTextColor: string;       // hex or rgba
  linkColor: string;        // hex or rgb
  linkHoverColor: string;   // hex or rgb
}

export const DEFAULT_INPUT_SETTINGS: InputStyleSettings = {
  bgRed: 192,
  bgGreen: 132,
  bgBlue: 252,
  bgOpacity: 0.03,
  blurAmount: 24,
  borderWidth: 0,
  borderColor: "rgba(192, 132, 252, 0.4)",
  borderRadius: 0,
  textColor: "#ffffff",
  placeholderOpacity: 0.4,
  focusBorderColor: "#c084fc",
  focusGlowOpacity: 0,
  paddingY: 12,
  paddingX: 18,

  searchIconColor: "#9ca3af",
  searchIconOpacity: 0.5,
  searchIconLeft: 16,
  searchIconTopOffset: 1.5,
  searchPaddingLeft: 48,
  searchPaddingRight: 48,
  searchPaddingY: 14,
  searchMaxWidth: 500,
  searchRadius: 12,

  checkboxAccentColor: "#ffffff",
  checkboxSize: 18,
  checkboxRadius: 4,

  headingColor: "#ffffff",
  pTextColor: "rgba(255, 255, 255, 0.85)",
  linkColor: "#c084fc",
  linkHoverColor: "#e879f9",
};

export const PRESETS: { name: string; icon: string; settings: Partial<InputStyleSettings> }[] = [
  {
    name: "🧊 Frosted Glass",
    icon: "🧊",
    settings: {
      bgRed: 255, bgGreen: 255, bgBlue: 255, bgOpacity: 0.08,
      blurAmount: 16, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.25)",
      borderRadius: 12, textColor: "#ffffff", placeholderOpacity: 0.45,
      focusBorderColor: "#00f0ff", focusGlowOpacity: 0.4, paddingY: 12, paddingX: 16,
      checkboxAccentColor: "#00f0ff", checkboxSize: 18, checkboxRadius: 4,
      headingColor: "#ffffff", linkColor: "#00f0ff", linkHoverColor: "#38bdf8",
    },
  },
  {
    name: "🔮 Cyberpunk Neon",
    icon: "🔮",
    settings: {
      bgRed: 0, bgGreen: 240, bgBlue: 255, bgOpacity: 0.1,
      blurAmount: 20, borderWidth: 2, borderColor: "#00f0ff",
      borderRadius: 14, textColor: "#ffffff", placeholderOpacity: 0.6,
      focusBorderColor: "#00f0ff", focusGlowOpacity: 0.8, paddingY: 12, paddingX: 16,
      checkboxAccentColor: "#ec4899", checkboxSize: 20, checkboxRadius: 6,
      headingColor: "#00f0ff", linkColor: "#ec4899", linkHoverColor: "#f472b6",
    },
  },
  {
    name: "🌑 Midnight Velvet",
    icon: "🌑",
    settings: {
      bgRed: 192, bgGreen: 132, bgBlue: 252, bgOpacity: 0.12,
      blurAmount: 24, borderWidth: 1, borderColor: "rgba(192, 132, 252, 0.4)",
      borderRadius: 16, textColor: "#ffffff", placeholderOpacity: 0.4,
      focusBorderColor: "#c084fc", focusGlowOpacity: 0.6, paddingY: 14, paddingX: 18,
      checkboxAccentColor: "#c084fc", checkboxSize: 18, checkboxRadius: 4,
      headingColor: "#ffffff", linkColor: "#c084fc", linkHoverColor: "#e879f9",
    },
  },
  {
    name: "⚡ High Contrast",
    icon: "⚡",
    settings: {
      bgRed: 255, bgGreen: 255, bgBlue: 255, bgOpacity: 0.18,
      blurAmount: 10, borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: 8, textColor: "#ffffff", placeholderOpacity: 0.5,
      focusBorderColor: "#ffffff", focusGlowOpacity: 0.5, paddingY: 10, paddingX: 14,
      checkboxAccentColor: "#ffffff", checkboxSize: 20, checkboxRadius: 2,
      headingColor: "#ffffff", linkColor: "#ffffff", linkHoverColor: "#38bdf8",
    },
  },
  {
    name: "👻 Dark Phantom",
    icon: "👻",
    settings: {
      bgRed: 12, bgGreen: 8, bgBlue: 23, bgOpacity: 0.8,
      blurAmount: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12, textColor: "#ffffff", placeholderOpacity: 0.35,
      focusBorderColor: "#38bdf8", focusGlowOpacity: 0.3, paddingY: 12, paddingX: 16,
      checkboxAccentColor: "#38bdf8", checkboxSize: 18, checkboxRadius: 4,
      headingColor: "#ffffff", linkColor: "#38bdf8", linkHoverColor: "#7dd3fc",
    },
  },
];

export default function InputStyleEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<InputStyleSettings>(DEFAULT_INPUT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"controls" | "search" | "checkboxes" | "typography" | "preview" | "css">("controls");

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("7th_input_style_settings");
      if (saved) {
        setSettings({ ...DEFAULT_INPUT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {
      // Fallback
    }
  }, []);

  const applySettingsToDOM = useCallback((s: InputStyleSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--input-bg-red", `${s.bgRed}`);
    root.style.setProperty("--input-bg-green", `${s.bgGreen}`);
    root.style.setProperty("--input-bg-blue", `${s.bgBlue}`);
    root.style.setProperty("--input-bg-opacity", `${s.bgOpacity}`);
    root.style.setProperty("--input-blur", `${s.blurAmount}px`);
    root.style.setProperty("--input-border-width", `${s.borderWidth}px`);
    root.style.setProperty("--input-border-color", s.borderColor);
    root.style.setProperty("--input-border-radius", `${s.borderRadius}px`);
    root.style.setProperty("--input-text-color", s.textColor);
    root.style.setProperty("--input-placeholder-color", `rgba(255, 255, 255, ${s.placeholderOpacity})`);
    root.style.setProperty("--input-focus-border", s.focusBorderColor);
    root.style.setProperty("--input-focus-glow", `rgba(0, 240, 255, ${s.focusGlowOpacity})`);
    root.style.setProperty("--input-padding-y", `${s.paddingY}px`);
    root.style.setProperty("--input-padding-x", `${s.paddingX}px`);

    // Search Controls
    root.style.setProperty("--search-icon-color", s.searchIconColor || "#ffffff");
    root.style.setProperty("--search-icon-opacity", `${s.searchIconOpacity ?? 0.5}`);
    root.style.setProperty("--search-icon-left", `${s.searchIconLeft ?? 16}px`);
    root.style.setProperty("--search-padding-left", `${s.searchPaddingLeft ?? 48}px`);
    root.style.setProperty("--search-padding-right", `${s.searchPaddingRight ?? 48}px`);
    root.style.setProperty("--search-padding-y", `${s.searchPaddingY ?? 14}px`);
    root.style.setProperty("--search-max-width", `${s.searchMaxWidth ?? 500}px`);
    root.style.setProperty("--search-radius", `${s.searchRadius ?? 12}px`);

    // Checkbox Controls
    root.style.setProperty("--checkbox-accent-color", s.checkboxAccentColor || "#ffffff");
    root.style.setProperty("--checkbox-size", `${s.checkboxSize || 18}px`);
    root.style.setProperty("--checkbox-border-radius", `${s.checkboxRadius || 4}px`);

    // Typography Controls
    root.style.setProperty("--heading-color", s.headingColor || "#ffffff");
    root.style.setProperty("--text-p-color", s.pTextColor || "rgba(255, 255, 255, 0.85)");
    root.style.setProperty("--link-color", s.linkColor || "#c084fc");
    root.style.setProperty("--link-hover-color", s.linkHoverColor || "#e879f9");

    try {
      localStorage.setItem("7th_input_style_settings", JSON.stringify(s));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      applySettingsToDOM(settings);
    }
  }, [settings, mounted, applySettingsToDOM]);

  const update = <K extends keyof InputStyleSettings>(key: K, val: InputStyleSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const generatedCSS = `/* Form Inputs */
.site-input,
.form-input,
input[type="text"],
input[type="search"],
input[type="email"],
input[type="tel"],
select,
textarea {
  background-color: rgba(${settings.bgRed}, ${settings.bgGreen}, ${settings.bgBlue}, ${settings.bgOpacity});
  backdrop-filter: blur(${settings.blurAmount}px);
  -webkit-backdrop-filter: blur(${settings.blurAmount}px);
  border: ${settings.borderWidth}px solid ${settings.borderColor};
  border-radius: ${settings.borderRadius}px;
  color: ${settings.textColor};
  padding: ${settings.paddingY}px ${settings.paddingX}px;
  outline: none;
  transition: all 0.2s ease-in-out;
}

input::placeholder,
textarea::placeholder {
  color: rgba(255, 255, 255, ${settings.placeholderOpacity});
}

input:focus,
select:focus,
textarea:focus {
  border-color: ${settings.focusBorderColor};
  box-shadow: 0 0 18px rgba(0, 240, 255, ${settings.focusGlowOpacity});
}

/* Checkboxes */
input[type="checkbox"] {
  accent-color: ${settings.checkboxAccentColor};
  width: ${settings.checkboxSize}px;
  height: ${settings.checkboxSize}px;
  border-radius: ${settings.checkboxRadius}px;
  cursor: pointer;
}

/* Typography & Headings */
h1, h2, h3, h4, h5, h6 {
  color: ${settings.headingColor};
}

p {
  color: ${settings.pTextColor};
}

a {
  color: ${settings.linkColor};
}

a:hover {
  color: ${settings.linkHoverColor};
}`;

  const copyCSS = () => {
    navigator.clipboard.writeText(generatedCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        aria-label="Open Input Style Controls"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-[9999] px-3.5 py-2.5 bg-[#0c0817]/90 backdrop-blur-xl border border-cyan-400/40 text-cyan-300 rounded-full font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:bg-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-2 cursor-pointer group"
      >
        <Sliders className="w-4 h-4 group-hover:rotate-45 transition-transform" />
        <span>Input Style Controls</span>
      </button>

      {/* Editor Drawer Modal — Pinned to Far Right, No Background Blur/Tint Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-end p-4 md:p-6 pointer-events-none">
          <div className="bg-[#0c0817]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.2)] text-white overflow-hidden pointer-events-auto shadow-2xl">

            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300 leading-tight">Style Customization Studio</h3>
                  <p className="text-xs text-white/50">Form inputs, checkboxes, headings, p tags & links</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Reset to defaults"
                  onClick={() => setSettings(DEFAULT_INPUT_SETTINGS)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  aria-label="Close modal"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Presets Bar */}
            <div className="px-5 py-3 border-b border-white/10 bg-black/40 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 shrink-0 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" /> Presets:
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSettings((prev) => ({ ...prev, ...p.settings }))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/80 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* View Tabs */}
            <div className="flex border-b border-white/10  text-xs font-bold">
              <button
                onClick={() => setActiveTab("controls")}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activeTab === "controls" ? "border-cyan-400 text-cyan-300 bg-white/5" : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Inputs
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activeTab === "search" ? "border-cyan-400 text-cyan-300 bg-white/5" : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <Search className="w-3.5 h-3.5" /> Search Bar
              </button>
              <button
                onClick={() => setActiveTab("checkboxes")}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activeTab === "checkboxes" ? "border-cyan-400 text-cyan-300 bg-white/5" : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Checkboxes
              </button>
              <button
                onClick={() => setActiveTab("typography")}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activeTab === "typography" ? "border-cyan-400 text-cyan-300 bg-white/5" : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <Type className="w-3.5 h-3.5" /> Typography & Tags
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activeTab === "preview" ? "border-cyan-400 text-cyan-300 bg-white/5" : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <Eye className="w-3.5 h-3.5" /> Sandbox
              </button>
              <button
                onClick={() => setActiveTab("css")}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${activeTab === "css" ? "border-cyan-400 text-cyan-300 bg-white/5" : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <Layers className="w-3.5 h-3.5" /> CSS
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 max-h-[60vh]">
              {activeTab === "controls" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Background & Blur */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      🎨 Background & Blur
                    </h4>
                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Fill Opacity</span>
                        <span className="font-mono text-cyan-300">{Math.round(settings.bgOpacity * 100)}%</span>
                      </label>
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={settings.bgOpacity}
                        onChange={(e) => update("bgOpacity", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Backdrop Blur</span>
                        <span className="font-mono text-cyan-300">{settings.blurAmount}px</span>
                      </label>
                      <input
                        type="range" min="0" max="40" step="1"
                        value={settings.blurAmount}
                        onChange={(e) => update("blurAmount", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Background Tint (RGB)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-red-400 font-mono block">R: {settings.bgRed}</span>
                          <input type="range" min="0" max="255" value={settings.bgRed} onChange={(e) => update("bgRed", parseInt(e.target.value, 10))} className="w-full accent-red-400" />
                        </div>
                        <div>
                          <span className="text-[10px] text-green-400 font-mono block">G: {settings.bgGreen}</span>
                          <input type="range" min="0" max="255" value={settings.bgGreen} onChange={(e) => update("bgGreen", parseInt(e.target.value, 10))} className="w-full accent-green-400" />
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-400 font-mono block">B: {settings.bgBlue}</span>
                          <input type="range" min="0" max="255" value={settings.bgBlue} onChange={(e) => update("bgBlue", parseInt(e.target.value, 10))} className="w-full accent-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Border & Geometry */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      📐 Border & Geometry
                    </h4>
                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Border Width</span>
                        <span className="font-mono text-cyan-300">{settings.borderWidth}px</span>
                      </label>
                      <input
                        type="range" min="0" max="6" step="1"
                        value={settings.borderWidth}
                        onChange={(e) => update("borderWidth", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Corner Radius</span>
                        <span className="font-mono text-cyan-300">{settings.borderRadius}px</span>
                      </label>
                      <input
                        type="range" min="0" max="36" step="1"
                        value={settings.borderRadius}
                        onChange={(e) => update("borderRadius", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Border Color</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.borderColor}
                          onChange={(e) => update("borderColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Focus Glow & Colors */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      ✨ Focus Glow & Color
                    </h4>
                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Focus Glow Opacity</span>
                        <span className="font-mono text-cyan-300">{Math.round(settings.focusGlowOpacity * 100)}%</span>
                      </label>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={settings.focusGlowOpacity}
                        onChange={(e) => update("focusGlowOpacity", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Focus Border Color</label>
                      <input
                        type="color"
                        value={settings.focusBorderColor.startsWith("#") ? settings.focusBorderColor : "#00f0ff"}
                        onChange={(e) => update("focusBorderColor", e.target.value)}
                        className="w-full h-8 bg-transparent rounded cursor-pointer border border-white/20"
                      />
                    </div>
                  </div>

                  {/* Padding & Spacing */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      📏 Spacing & Padding
                    </h4>
                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Vertical Padding</span>
                        <span className="font-mono text-cyan-300">{settings.paddingY}px</span>
                      </label>
                      <input
                        type="range" min="6" max="24" step="1"
                        value={settings.paddingY}
                        onChange={(e) => update("paddingY", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Horizontal Padding</span>
                        <span className="font-mono text-cyan-300">{settings.paddingX}px</span>
                      </label>
                      <input
                        type="range" min="8" max="32" step="1"
                        value={settings.paddingX}
                        onChange={(e) => update("paddingX", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "search" && (
                <div className="space-y-6">
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      🔍 Search Bar & Left Icon Styling
                    </h4>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Search Icon Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.searchIconColor?.startsWith("#") ? settings.searchIconColor : "#ffffff"}
                          onChange={(e) => update("searchIconColor", e.target.value)}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.searchIconColor || "#ffffff"}
                          onChange={(e) => update("searchIconColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-2 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Icon Opacity</span>
                        <span className="font-mono text-cyan-300">{Math.round((settings.searchIconOpacity ?? 0.5) * 100)}%</span>
                      </label>
                      <input
                        type="range" min="0.1" max="1" step="0.05"
                        value={settings.searchIconOpacity ?? 0.5}
                        onChange={(e) => update("searchIconOpacity", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Icon Left Offset</span>
                        <span className="font-mono text-cyan-300">{settings.searchIconLeft ?? 16}px</span>
                      </label>
                      <input
                        type="range" min="8" max="36" step="2"
                        value={settings.searchIconLeft ?? 16}
                        onChange={(e) => update("searchIconLeft", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Icon Vertical Alignment (Nudge Down)</span>
                        <span className="font-mono text-cyan-300">+{settings.searchIconTopOffset ?? 1.5}px</span>
                      </label>
                      <input
                        type="range" min="-6" max="6" step="0.5"
                        value={settings.searchIconTopOffset ?? 1.5}
                        onChange={(e) => update("searchIconTopOffset", parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Text Left Padding (Icon Clearance)</span>
                        <span className="font-mono text-cyan-300">{settings.searchPaddingLeft ?? 48}px</span>
                      </label>
                      <input
                        type="range" min="32" max="80" step="2"
                        value={settings.searchPaddingLeft ?? 48}
                        onChange={(e) => update("searchPaddingLeft", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Text Right Padding</span>
                        <span className="font-mono text-cyan-300">{settings.searchPaddingRight ?? 48}px</span>
                      </label>
                      <input
                        type="range" min="24" max="80" step="2"
                        value={settings.searchPaddingRight ?? 48}
                        onChange={(e) => update("searchPaddingRight", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Vertical Padding (Height)</span>
                        <span className="font-mono text-cyan-300">{settings.searchPaddingY ?? 14}px</span>
                      </label>
                      <input
                        type="range" min="6" max="24" step="1"
                        value={settings.searchPaddingY ?? 14}
                        onChange={(e) => update("searchPaddingY", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Search Bar Max Width</span>
                        <span className="font-mono text-cyan-300">{settings.searchMaxWidth ?? 500}px</span>
                      </label>
                      <input
                        type="range" min="300" max="900" step="20"
                        value={settings.searchMaxWidth ?? 500}
                        onChange={(e) => update("searchMaxWidth", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Search Corner Radius</span>
                        <span className="font-mono text-cyan-300">{settings.searchRadius ?? 12}px</span>
                      </label>
                      <input
                        type="range" min="0" max="32" step="2"
                        value={settings.searchRadius ?? 12}
                        onChange={(e) => update("searchRadius", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* Live Search Bar Preview */}
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Live Search Bar Preview</p>
                      <div className="relative mx-auto" style={{ maxWidth: `${settings.searchMaxWidth ?? 500}px` }}>
                        <div
                          className="absolute inset-y-0 flex items-center pointer-events-none z-10"
                          style={{
                            left: `${settings.searchIconLeft ?? 16}px`,
                            color: settings.searchIconColor || "#ffffff",
                            opacity: settings.searchIconOpacity ?? 0.5,
                          }}
                        >
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="search"
                          placeholder="Search questions, keywords, or topics..."
                          className="form-input w-full text-sm font-semibold"
                          style={{
                            paddingLeft: `${settings.searchPaddingLeft ?? 48}px`,
                            paddingRight: `${settings.searchPaddingRight ?? 48}px`,
                            paddingTop: `${settings.searchPaddingY ?? 14}px`,
                            paddingBottom: `${settings.searchPaddingY ?? 14}px`,
                            borderRadius: `${settings.searchRadius ?? 12}px`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "checkboxes" && (
                <div className="space-y-6">
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      ☑️ Checkbox Input Styling
                    </h4>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Checkbox Accent Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.checkboxAccentColor.startsWith("#") ? settings.checkboxAccentColor : "#c084fc"}
                          onChange={(e) => update("checkboxAccentColor", e.target.value)}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.checkboxAccentColor}
                          onChange={(e) => update("checkboxAccentColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-2 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Checkbox Dimension Size</span>
                        <span className="font-mono text-cyan-300">{settings.checkboxSize}px</span>
                      </label>
                      <input
                        type="range" min="12" max="32" step="1"
                        value={settings.checkboxSize}
                        onChange={(e) => update("checkboxSize", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 justify-between flex mb-1">
                        <span>Checkbox Corner Radius</span>
                        <span className="font-mono text-cyan-300">{settings.checkboxRadius}px</span>
                      </label>
                      <input
                        type="range" min="0" max="16" step="1"
                        value={settings.checkboxRadius}
                        onChange={(e) => update("checkboxRadius", parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* Live Checkbox Preview */}
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Live Checkbox Preview</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 text-xs text-white cursor-pointer select-none">
                          <input type="checkbox" defaultChecked />
                          <span>Drop on ALL live streams (Global)</span>
                        </label>
                        <label className="flex items-center gap-3 text-xs text-white/70 cursor-pointer select-none">
                          <input type="checkbox" />
                          <span>Send email notification to band members</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "typography" && (
                <div className="space-y-6">
                  <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      🔤 Typography & Tag Styling
                    </h4>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Headings Color (h1, h2, h3, h4, h5, h6)</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.headingColor.startsWith("#") ? settings.headingColor : "#ffffff"}
                          onChange={(e) => update("headingColor", e.target.value)}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.headingColor}
                          onChange={(e) => update("headingColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-2 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Paragraph Text Color (p tags)</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.pTextColor.startsWith("#") ? settings.pTextColor : "#ffffff"}
                          onChange={(e) => update("pTextColor", e.target.value)}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.pTextColor}
                          onChange={(e) => update("pTextColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-2 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Link Color (a tags)</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.linkColor.startsWith("#") ? settings.linkColor : "#c084fc"}
                          onChange={(e) => update("linkColor", e.target.value)}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.linkColor}
                          onChange={(e) => update("linkColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-2 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1">Link Hover Color (a:hover)</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={settings.linkHoverColor.startsWith("#") ? settings.linkHoverColor : "#e879f9"}
                          onChange={(e) => update("linkHoverColor", e.target.value)}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={settings.linkHoverColor}
                          onChange={(e) => update("linkHoverColor", e.target.value)}
                          className="flex-1 bg-black/50 border border-white/20 px-3 py-2 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* Live Typography Preview */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Live Typography Preview</p>
                      <h1>Sample H1 Main Title Header</h1>
                      <h3>Sample H3 Section Subtitle</h3>
                      <p>This is a live preview paragraph demonstrating paragraph text styling with an <a href="#" onClick={e => e.preventDefault()}>Interactive Custom Link</a> embedded inside.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preview" && (
                <div className="p-6 bg-gradient-to-br from-purple-950/40 via-cyan-950/20 to-black rounded-2xl border border-cyan-500/20 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Live Input Testing Sandbox</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-1">Full Name</label>
                      <input type="text" placeholder="John Smith..." className="form-input w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-1">Select Event Type</label>
                      <select className="form-input w-full cursor-pointer">
                        <option value="1" className="bg-[#0c0817] text-white">Full Band Concert</option>
                        <option value="2" className="bg-[#0c0817] text-white">Unplugged Acoustic</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-1">Special Requests</label>
                      <textarea rows={2} placeholder="Add notes here..." className="form-input w-full" />
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <label className="flex items-center gap-3 text-xs text-white cursor-pointer select-none">
                        <input type="checkbox" defaultChecked />
                        <span>Interactive Checkbox Control</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "css" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Generated Global CSS Rules</span>
                    <button
                      onClick={copyCSS}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied to Clipboard!" : "Copy CSS"}
                    </button>
                  </div>
                  <pre className="p-4 bg-black/80 border border-white/10 rounded-2xl text-xs font-mono text-cyan-200/90 overflow-x-auto max-h-[300px] leading-relaxed">
                    {generatedCSS}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
              <span className="text-white/50">Changes apply live to all forms, checkboxes, headings, p tags & links across the site.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
