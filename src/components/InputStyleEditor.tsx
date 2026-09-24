/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/only-export-components, react-doctor/no-placeholder-only-field */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/only-export-components, react-doctor/no-placeholder-only-field, react-doctor/no-high-complexity-react-function */

import React, { useState, useEffect, useCallback } from "react";
import {
  Sliders,
  X,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  Type,
  CheckSquare,
  Search,
} from "lucide-react";
import { SquishyToggle } from "@/components/SquishyToggle";

export interface InputStyleSettings {
  bgRed: number; // 0 - 255
  bgGreen: number; // 0 - 255
  bgBlue: number; // 0 - 255
  bgOpacity: number; // 0 - 1 (step 0.01)
  blurAmount: number; // in px (0 - 40)
  borderWidth: number; // in px (0 - 6)
  borderColor: string; // hex or rgba
  borderRadius: number; // in px (0 - 36)
  textColor: string; // hex
  placeholderOpacity: number; // 0 - 1
  focusBorderColor: string; // hex
  focusGlowOpacity: number; // 0 - 1
  paddingY: number; // in px (6 - 24)
  paddingX: number; // in px (8 - 32)

  // Search Bar Controls
  searchIconColor: string; // hex or rgb
  searchIconOpacity: number; // 0 - 1
  searchIconLeft: number; // in px (8 - 32)
  searchIconTopOffset: number; // in px (-6 to 6)
  searchPaddingLeft: number; // in px (32 - 80)
  searchPaddingRight: number; // in px (32 - 80)
  searchPaddingY: number; // in px (6 - 24)
  searchMaxWidth: number; // in px (300 - 1000)
  searchRadius: number; // in px (0 - 36)

  // Checkbox Controls
  checkboxAccentColor: string; // hex or rgb
  checkboxSize: number; // in px (12 - 32)
  checkboxRadius: number; // in px (0 - 16)

  // Typography & Element Tags
  headingColor: string; // hex or rgb
  pTextColor: string; // hex or rgba
  linkColor: string; // hex or rgb
  linkHoverColor: string; // hex or rgb
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

export const PRESETS: {
  name: string;
  icon: string;
  settings: Partial<InputStyleSettings>;
}[] = [
  {
    name: "🧊 Frosted Glass",
    icon: "🧊",
    settings: {
      bgRed: 255,
      bgGreen: 255,
      bgBlue: 255,
      bgOpacity: 0.08,
      blurAmount: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.25)",
      borderRadius: 12,
      textColor: "#ffffff",
      placeholderOpacity: 0.45,
      focusBorderColor: "#00f0ff",
      focusGlowOpacity: 0.4,
      paddingY: 12,
      paddingX: 16,
      checkboxAccentColor: "#00f0ff",
      checkboxSize: 18,
      checkboxRadius: 4,
      headingColor: "#ffffff",
      linkColor: "#00f0ff",
      linkHoverColor: "#38bdf8",
    },
  },
  {
    name: "🔮 Cyberpunk Neon",
    icon: "🔮",
    settings: {
      bgRed: 0,
      bgGreen: 240,
      bgBlue: 255,
      bgOpacity: 0.1,
      blurAmount: 20,
      borderWidth: 2,
      borderColor: "#00f0ff",
      borderRadius: 14,
      textColor: "#ffffff",
      placeholderOpacity: 0.6,
      focusBorderColor: "#00f0ff",
      focusGlowOpacity: 0.8,
      paddingY: 12,
      paddingX: 16,
      checkboxAccentColor: "#ec4899",
      checkboxSize: 20,
      checkboxRadius: 6,
      headingColor: "#00f0ff",
      linkColor: "#ec4899",
      linkHoverColor: "#f472b6",
    },
  },
  {
    name: "🌑 Midnight Velvet",
    icon: "🌑",
    settings: {
      bgRed: 192,
      bgGreen: 132,
      bgBlue: 252,
      bgOpacity: 0.12,
      blurAmount: 24,
      borderWidth: 1,
      borderColor: "rgba(192, 132, 252, 0.4)",
      borderRadius: 16,
      textColor: "#ffffff",
      placeholderOpacity: 0.4,
      focusBorderColor: "#c084fc",
      focusGlowOpacity: 0.6,
      paddingY: 14,
      paddingX: 18,
      checkboxAccentColor: "#c084fc",
      checkboxSize: 18,
      checkboxRadius: 4,
      headingColor: "#ffffff",
      linkColor: "#c084fc",
      linkHoverColor: "#e879f9",
    },
  },
  {
    name: "⚡ High Contrast",
    icon: "⚡",
    settings: {
      bgRed: 255,
      bgGreen: 255,
      bgBlue: 255,
      bgOpacity: 0.18,
      blurAmount: 10,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: 8,
      textColor: "#ffffff",
      placeholderOpacity: 0.5,
      focusBorderColor: "#ffffff",
      focusGlowOpacity: 0.5,
      paddingY: 10,
      paddingX: 14,
      checkboxAccentColor: "#ffffff",
      checkboxSize: 20,
      checkboxRadius: 2,
      headingColor: "#ffffff",
      linkColor: "#ffffff",
      linkHoverColor: "#38bdf8",
    },
  },
  {
    name: "👻 Dark Phantom",
    icon: "👻",
    settings: {
      bgRed: 12,
      bgGreen: 8,
      bgBlue: 23,
      bgOpacity: 0.8,
      blurAmount: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      textColor: "#ffffff",
      placeholderOpacity: 0.35,
      focusBorderColor: "#38bdf8",
      focusGlowOpacity: 0.3,
      paddingY: 12,
      paddingX: 16,
      checkboxAccentColor: "#38bdf8",
      checkboxSize: 18,
      checkboxRadius: 4,
      headingColor: "#ffffff",
      linkColor: "#38bdf8",
      linkHoverColor: "#7dd3fc",
    },
  },
];

export default function InputStyleEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<InputStyleSettings>(
    DEFAULT_INPUT_SETTINGS,
  );
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "controls" | "search" | "checkboxes" | "typography" | "preview" | "css"
  >("controls");

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("7th_input_style_settings_v1");
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
    root.style.setProperty(
      "--input-placeholder-color",
      `rgba(255, 255, 255, ${s.placeholderOpacity})`,
    );
    root.style.setProperty("--input-focus-border", s.focusBorderColor);
    root.style.setProperty(
      "--input-focus-glow",
      `rgba(0, 240, 255, ${s.focusGlowOpacity})`,
    );
    root.style.setProperty("--input-padding-y", `${s.paddingY}px`);
    root.style.setProperty("--input-padding-x", `${s.paddingX}px`);

    // Search Controls
    root.style.setProperty(
      "--search-icon-color",
      s.searchIconColor || "#ffffff",
    );
    root.style.setProperty(
      "--search-icon-opacity",
      `${s.searchIconOpacity ?? 0.5}`,
    );
    root.style.setProperty("--search-icon-left", `${s.searchIconLeft ?? 16}px`);
    root.style.setProperty(
      "--search-padding-left",
      `${s.searchPaddingLeft ?? 48}px`,
    );
    root.style.setProperty(
      "--search-padding-right",
      `${s.searchPaddingRight ?? 48}px`,
    );
    root.style.setProperty("--search-padding-y", `${s.searchPaddingY ?? 14}px`);
    root.style.setProperty(
      "--search-max-width",
      `${s.searchMaxWidth ?? 500}px`,
    );
    root.style.setProperty("--search-radius", `${s.searchRadius ?? 12}px`);

    // Checkbox Controls
    root.style.setProperty(
      "--checkbox-accent-color",
      s.checkboxAccentColor || "#ffffff",
    );
    root.style.setProperty("--checkbox-size", `${s.checkboxSize || 18}px`);
    root.style.setProperty(
      "--checkbox-border-radius",
      `${s.checkboxRadius || 4}px`,
    );

    // Typography Controls
    root.style.setProperty("--heading-color", s.headingColor || "#ffffff");
    root.style.setProperty(
      "--text-p-color",
      s.pTextColor || "rgba(255, 255, 255, 0.85)",
    );
    root.style.setProperty("--link-color", s.linkColor || "#c084fc");
    root.style.setProperty(
      "--link-hover:text-whitecolor",
      s.linkHoverColor || "#e879f9",
    );

    try {
      localStorage.setItem("7th_input_style_settings_v1", JSON.stringify(s));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      applySettingsToDOM(settings);
    }
  }, [settings, mounted, applySettingsToDOM]);

  const update = <K extends keyof InputStyleSettings>(
    key: K,
    val: InputStyleSettings[K],
  ) => {
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
      {/* Editor Drawer Modal — Pinned to Far Right, No Background Blur/Tint Overlay */}
      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-end p-4 md:p-6">
          <div className="bg-[#0c0817]/95backdrop-blur-xl pointer-events-auto flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-purple-500/30 shadow-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-purple-400/30 bg-cyan-500/20">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3>Style Customization Studio</h3>
                  <p>Form inputs, checkboxes, headings, p tags & links</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Reset to defaults"
                  onClick={() => setSettings(DEFAULT_INPUT_SETTINGS)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#00000029] px-3 py-1.5 hover:bg-white/10 hover:text-white"
                  title="Reset to defaults"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button
                  aria-label="Close modal"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 bg-black/40 px-5 py-3">
              <span className="mr-1 flex shrink-0 items-center gap-1 text-[10px] text-white/40">
                <Sparkles className="h-3 w-3 text-yellow-400" /> Presets:
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, ...p.settings }))
                  }
                  className="shrink-0 cursor-pointer rounded-lg border border-white/10 bg-[#00000029] px-3 py-1.5 hover:border-purple-400/40 hover:bg-cyan-500/20"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* View Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab("controls")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 ${activeTab === "controls" ? "border-purple-400 bg-[#00000029]" : "border-transparent text-white/50 hover:text-white"}`}
              >
                <Sliders className="h-3.5 w-3.5" /> Inputs
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 ${activeTab === "search" ? "border-purple-400 bg-[#00000029]" : "border-transparent text-white/50 hover:text-white"}`}
              >
                <Search className="h-3.5 w-3.5" /> Search Bar
              </button>
              <button
                onClick={() => setActiveTab("checkboxes")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 ${activeTab === "checkboxes" ? "border-purple-400 bg-[#00000029]" : "border-transparent text-white/50 hover:text-white"}`}
              >
                <CheckSquare className="h-3.5 w-3.5" /> Checkboxes
              </button>
              <button
                onClick={() => setActiveTab("typography")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 ${activeTab === "typography" ? "border-purple-400 bg-[#00000029]" : "border-transparent text-white/50 hover:text-white"}`}
              >
                <Type className="h-3.5 w-3.5" /> Typography & Tags
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 ${activeTab === "preview" ? "border-purple-400 bg-[#00000029]" : "border-transparent text-white/50 hover:text-white"}`}
              >
                <Eye className="h-3.5 w-3.5" /> Sandbox
              </button>
              <button
                onClick={() => setActiveTab("css")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 ${activeTab === "css" ? "border-purple-400 bg-[#00000029]" : "border-transparent text-white/50 hover:text-white"}`}
              >
                <Layers className="h-3.5 w-3.5" /> CSS
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[60vh] flex-1 space-y-6 overflow-y-auto p-6">
              {activeTab === "controls" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Background & Blur */}
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    <h4 className="flex items-center gap-2">
                      🎨 Background & Blur
                    </h4>
                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Fill Opacity</span>
                        <span>{Math.round(settings.bgOpacity * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.bgOpacity}
                        onChange={(e) =>
                          update("bgOpacity", parseFloat(e.target.value))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Backdrop Blur</span>
                        <span>{settings.blurAmount}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        value={settings.blurAmount}
                        onChange={(e) =>
                          update("blurAmount", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block">
                        Background Tint (RGB)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="block text-[10px] text-red-400">
                            R: {settings.bgRed}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={settings.bgRed}
                            onChange={(e) =>
                              update("bgRed", parseInt(e.target.value, 10))
                            }
                            className="w-full accent-red-400"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-green-400">
                            G: {settings.bgGreen}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={settings.bgGreen}
                            onChange={(e) =>
                              update("bgGreen", parseInt(e.target.value, 10))
                            }
                            className="w-full accent-green-400"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-blue-400">
                            B: {settings.bgBlue}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={settings.bgBlue}
                            onChange={(e) =>
                              update("bgBlue", parseInt(e.target.value, 10))
                            }
                            className="w-full accent-blue-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Border & Geometry */}
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    f
                    <h4 className="flex items-center gap-2">
                      📐 Border & Geometry
                    </h4>
                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Border Width</span>
                        <span>{settings.borderWidth}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        step="1"
                        value={settings.borderWidth}
                        onChange={(e) =>
                          update("borderWidth", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Corner Radius</span>
                        <span>{settings.borderRadius}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="36"
                        step="1"
                        value={settings.borderRadius}
                        onChange={(e) =>
                          update("borderRadius", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block">Border Color</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.borderColor}
                          onChange={(e) =>
                            update("borderColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Focus Glow & Colors */}
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    <h4 className="flex items-center gap-2">
                      ✨ Focus Glow & Color
                    </h4>
                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Focus Glow Opacity</span>
                        <span>
                          {Math.round(settings.focusGlowOpacity * 100)}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.focusGlowOpacity}
                        onChange={(e) =>
                          update("focusGlowOpacity", parseFloat(e.target.value))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block">Focus Border Color</label>
                      <input
                        type="color"
                        value={
                          settings.focusBorderColor.startsWith("#")
                            ? settings.focusBorderColor
                            : "#00f0ff"
                        }
                        onChange={(e) =>
                          update("focusBorderColor", e.target.value)
                        }
                        className="h-8 w-full cursor-pointer rounded border border-white/10"
                      />
                    </div>
                  </div>

                  {/* Padding & Spacing */}
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    <h4 className="flex items-center gap-2">
                      📏 Spacing & Padding
                    </h4>
                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Vertical Padding</span>
                        <span>{settings.paddingY}px</span>
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="24"
                        step="1"
                        value={settings.paddingY}
                        onChange={(e) =>
                          update("paddingY", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Horizontal Padding</span>
                        <span>{settings.paddingX}px</span>
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="32"
                        step="1"
                        value={settings.paddingX}
                        onChange={(e) =>
                          update("paddingX", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "search" && (
                <div className="space-y-6">
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    <h4 className="flex items-center gap-2">
                      🔍 Search Bar & Left Icon Styling
                    </h4>

                    <div>
                      <label className="mb-1 block">Search Icon Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            settings.searchIconColor?.startsWith("#")
                              ? settings.searchIconColor
                              : "#ffffff"
                          }
                          onChange={(e) =>
                            update("searchIconColor", e.target.value)
                          }
                          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.searchIconColor || "#ffffff"}
                          onChange={(e) =>
                            update("searchIconColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Icon Opacity</span>
                        <span>
                          {Math.round(
                            (settings.searchIconOpacity ?? 0.5) * 100,
                          )}
                          %
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={settings.searchIconOpacity ?? 0.5}
                        onChange={(e) =>
                          update(
                            "searchIconOpacity",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Icon Left Offset</span>
                        <span>{settings.searchIconLeft ?? 16}px</span>
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="36"
                        step="2"
                        value={settings.searchIconLeft ?? 16}
                        onChange={(e) =>
                          update("searchIconLeft", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Icon Vertical Alignment (Nudge Down)</span>
                        <span>+{settings.searchIconTopOffset ?? 1.5}px</span>
                      </label>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="0.5"
                        value={settings.searchIconTopOffset ?? 1.5}
                        onChange={(e) =>
                          update(
                            "searchIconTopOffset",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Text Left Padding (Icon Clearance)</span>
                        <span>{settings.searchPaddingLeft ?? 48}px</span>
                      </label>
                      <input
                        type="range"
                        min="32"
                        max="80"
                        step="2"
                        value={settings.searchPaddingLeft ?? 48}
                        onChange={(e) =>
                          update(
                            "searchPaddingLeft",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Text Right Padding</span>
                        <span>{settings.searchPaddingRight ?? 48}px</span>
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        step="2"
                        value={settings.searchPaddingRight ?? 48}
                        onChange={(e) =>
                          update(
                            "searchPaddingRight",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Vertical Padding (Height)</span>
                        <span>{settings.searchPaddingY ?? 14}px</span>
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="24"
                        step="1"
                        value={settings.searchPaddingY ?? 14}
                        onChange={(e) =>
                          update("searchPaddingY", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Search Bar Max Width</span>
                        <span>{settings.searchMaxWidth ?? 500}px</span>
                      </label>
                      <input
                        type="range"
                        min="300"
                        max="900"
                        step="20"
                        value={settings.searchMaxWidth ?? 500}
                        onChange={(e) =>
                          update("searchMaxWidth", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Search Corner Radius</span>
                        <span>{settings.searchRadius ?? 12}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        step="2"
                        value={settings.searchRadius ?? 12}
                        onChange={(e) =>
                          update("searchRadius", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* Live Search Bar Preview */}
                    <div className="border-t border-white/10 pt-3">
                      <p className="mb-2">Live Search Bar Preview</p>
                      <div className="input-glow-border rounded-xl">
                        <div className="relative flex items-center">
                          <div
                            className="pointer-events-none !absolute z-10"
                            style={{
                              left: `${settings.searchIconLeft ?? 16}px`,
                              color: settings.searchIconColor || "#ffffff",
                              opacity: settings.searchIconOpacity ?? 0.5,
                            }}
                          >
                            <Search className="h-4 w-4" />
                          </div>
                          <input
                            type="search"
                            aria-label="Search"
                            placeholder="Search"
                            className="form-input w-full"
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
                </div>
              )}

              {activeTab === "checkboxes" && (
                <div className="space-y-6">
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    <h4 className="flex items-center gap-2">
                      ☑️ Checkbox Input Styling
                    </h4>

                    <div>
                      <label className="mb-1 block">
                        Checkbox Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            settings.checkboxAccentColor.startsWith("#")
                              ? settings.checkboxAccentColor
                              : "#c084fc"
                          }
                          onChange={(e) =>
                            update("checkboxAccentColor", e.target.value)
                          }
                          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.checkboxAccentColor}
                          onChange={(e) =>
                            update("checkboxAccentColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Checkbox Dimension Size</span>
                        <span>{settings.checkboxSize}px</span>
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={settings.checkboxSize}
                        onChange={(e) =>
                          update("checkboxSize", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex justify-between">
                        <span>Checkbox Corner Radius</span>
                        <span>{settings.checkboxRadius}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="16"
                        step="1"
                        value={settings.checkboxRadius}
                        onChange={(e) =>
                          update("checkboxRadius", parseInt(e.target.value, 10))
                        }
                        className="w-full cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* Live Checkbox Preview */}
                    <div className="border-t border-white/10 pt-3">
                      <p className="mb-2">Live Checkbox Preview</p>
                      <div className="space-y-2">
                        <div className="flex cursor-pointer items-center gap-3 select-none">
                          <SquishyToggle
                            id="editor-preview-1"
                            label="Drop on ALL live streams"
                            checked={true}
                            onChange={() => {}}
                          />
                          <span>Drop on ALL live streams (Global)</span>
                        </div>
                        <div className="flex cursor-pointer items-center gap-3 select-none">
                          <SquishyToggle
                            id="editor-preview-2"
                            label="Send email notification"
                            checked={false}
                            onChange={() => {}}
                          />
                          <span>Send email notification to band members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "typography" && (
                <div className="space-y-6">
                  <div className="space-y-4 rounded-lg border border-white/10 bg-[#00000029] p-4">
                    <h4 className="flex items-center gap-2">
                      🔤 Typography & Tag Styling
                    </h4>

                    <div>
                      <label className="mb-1 block">
                        Headings Color (h1, h2, h3, h4, h5, h6)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            settings.headingColor.startsWith("#")
                              ? settings.headingColor
                              : "#ffffff"
                          }
                          onChange={(e) =>
                            update("headingColor", e.target.value)
                          }
                          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.headingColor}
                          onChange={(e) =>
                            update("headingColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block">
                        Paragraph Text Color (p tags)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            settings.pTextColor.startsWith("#")
                              ? settings.pTextColor
                              : "#ffffff"
                          }
                          onChange={(e) => update("pTextColor", e.target.value)}
                          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.pTextColor}
                          onChange={(e) => update("pTextColor", e.target.value)}
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block">Link Color (a tags)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            settings.linkColor.startsWith("#")
                              ? settings.linkColor
                              : "#c084fc"
                          }
                          onChange={(e) => update("linkColor", e.target.value)}
                          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.linkColor}
                          onChange={(e) => update("linkColor", e.target.value)}
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block">
                        Link Hover Color (a:hover)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            settings.linkHoverColor.startsWith("#")
                              ? settings.linkHoverColor
                              : "#e879f9"
                          }
                          onChange={(e) =>
                            update("linkHoverColor", e.target.value)
                          }
                          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/10"
                        />
                        <input
                          type="text"
                          value={settings.linkHoverColor}
                          onChange={(e) =>
                            update("linkHoverColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Live Typography Preview */}
                    <div className="space-y-2 border-t border-white/10 pt-3">
                      <p className="mb-1">Live Typography Preview</p>
                      <h1>Sample H1 Main Title Header</h1>
                      <h3>Sample H3 Section Subtitle</h3>
                      <p>
                        This is a live preview paragraph demonstrating paragraph
                        text styling with an{" "}
                        <button type="button" className="cursor-pointer">
                          Interactive Custom Link
                        </button>{" "}
                        embedded inside.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preview" && (
                <div className="space-y-4 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-cyan-950/20 to-black p-6">
                  <h4>Live Input Testing Sandbox</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block">Full Name</label>
                      <input
                        type="text"
                        aria-label="Full Name"
                        placeholder="John Smith..."
                        className="form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block">Select Event Type</label>
                      <select
                        aria-label="Select Event Type"
                        className="form-input w-full cursor-pointer"
                      >
                        <option value="1" className="bg-[#0c0817]">
                          Full Band Concert
                        </option>
                        <option value="2" className="bg-[#0c0817]">
                          Unplugged Acoustic
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block">Special Requests</label>
                      <textarea
                        rows={2}
                        aria-label="Special Requests"
                        placeholder="Add notes here..."
                        className="form-input w-full"
                      />
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex cursor-pointer items-center gap-3 select-none">
                        <SquishyToggle
                          id="editor-preview-3"
                          label="Interactive Checkbox Control"
                          checked={true}
                          onChange={() => {}}
                        />
                        <span>Interactive Checkbox Control</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "css" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Generated Global CSS Rules</span>
                    <button
                      onClick={copyCSS}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-400/40 bg-cyan-500/20 px-3 py-1.5 hover:bg-cyan-500/30"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copied to Clipboard!" : "Copy CSS"}
                    </button>
                  </div>
                  <pre className="/90 max-h-[300px] overflow-x-auto rounded-lg border border-white/10 bg-black/80 p-4">
                    {generatedCSS}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-black/40 p-4">
              <span className="text-white/50">
                Changes apply live to all forms, checkboxes, headings, p tags &
                links across the site.
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:brightness-110"
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
