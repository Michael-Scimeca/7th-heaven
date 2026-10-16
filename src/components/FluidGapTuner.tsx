"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export interface FluidGapSettings {
  desktop: number; // base at 1440px (first)
  tablet: number; // base at 768px (second)
  mobile: number; // base at 375px (third)
  scale: number; // master multiplier
}

export type ActiveStep = "desktop" | "tablet" | "mobile" | "master";
export type PreviewMode = "auto" | "desktop" | "tablet" | "mobile";

const STORAGE_KEY = "v2_fluid_gap_settings";
const STEP_KEY = "v2_fluid_gap_active_step";
const OPEN_KEY = "v2_fluid_gap_open";
const PANEL_POS_KEY = "v2_fluid_gap_panel_pos";
const STYLE_TAG_ID = "fluid-gap-dynamic-styles";

const DEFAULT_SETTINGS: FluidGapSettings = {
  desktop: 100,
  tablet: 100,
  mobile: 50,
  scale: 1.0,
};

function calculateClamp(minVal: number, maxVal: number, minVw: number, maxVw: number): string {
  const delta = maxVal - minVal;
  const slope = delta / (maxVw - minVw);
  const yIntercept = minVal - slope * minVw;
  const preferredCalc = `${(slope * 100).toFixed(2)}vw + ${(yIntercept / 16).toFixed(2)}rem`;
  return `clamp(${minVal}px, calc(${preferredCalc}), ${maxVal}px)`;
}

export function applyFluidGapToDocument(
  settings: FluidGapSettings,
  previewMode: PreviewMode = "auto",
  simulateFrame: boolean = false
) {
  if (typeof document === "undefined") return;

  const { desktop, tablet, mobile, scale } = settings;
  const scaledDesktop = Math.round(desktop * scale);
  const scaledTablet = Math.round(tablet * scale);
  const scaledMobile = Math.round(mobile * scale);

  // Clamps across breakpoints: Desktop -> Tablet -> Mobile
  // Desktop (>=1024px): 1024px -> 1440px
  const desktopClamp = calculateClamp(scaledTablet, scaledDesktop, 1024, 1440);
  const desktopSm = calculateClamp(Math.round(scaledTablet * 0.75), Math.round(scaledDesktop * 0.75), 1024, 1440);
  const desktopLg = calculateClamp(Math.round(scaledTablet * 1.5), Math.round(scaledDesktop * 1.8), 1024, 1440);

  // Tablet (640px -> 1024px)
  const tabletClamp = calculateClamp(Math.round((scaledMobile + scaledTablet) / 2), scaledTablet, 640, 1024);
  const tabletSm = calculateClamp(Math.round(((scaledMobile + scaledTablet) / 2) * 0.75), Math.round(scaledTablet * 0.75), 640, 1024);
  const tabletLg = calculateClamp(Math.round(((scaledMobile + scaledTablet) / 2) * 1.5), Math.round(scaledTablet * 1.5), 640, 1024);

  // Mobile (<640px): 360px -> 640px
  const mobileClamp = calculateClamp(scaledMobile, Math.round((scaledMobile + scaledTablet) / 2), 360, 640);
  const mobileSm = calculateClamp(Math.round(scaledMobile * 0.75), Math.round(((scaledMobile + scaledTablet) / 2) * 0.75), 360, 640);
  const mobileLg = calculateClamp(Math.round(scaledMobile * 1.5), Math.round(((scaledMobile + scaledTablet) / 2) * 1.5), 360, 640);

  let overrideCss = "";
  if (previewMode === "desktop") {
    overrideCss = `
      :root {
        --spacing-section: ${scaledDesktop}px !important;
        --spacing-section-sm: ${Math.round(scaledDesktop * 0.75)}px !important;
        --spacing-section-lg: ${Math.round(scaledDesktop * 1.8)}px !important;
        --spacing-stack: ${Math.round(scaledDesktop * 0.85)}px !important;
      }
    `;
  } else if (previewMode === "tablet") {
    overrideCss = `
      :root {
        --spacing-section: ${scaledTablet}px !important;
        --spacing-section-sm: ${Math.round(scaledTablet * 0.75)}px !important;
        --spacing-section-lg: ${Math.round(scaledTablet * 1.5)}px !important;
        --spacing-stack: ${Math.round(scaledTablet * 0.85)}px !important;
      }
    `;
  } else if (previewMode === "mobile") {
    overrideCss = `
      :root {
        --spacing-section: ${scaledMobile}px !important;
        --spacing-section-sm: ${Math.round(scaledMobile * 0.75)}px !important;
        --spacing-section-lg: ${Math.round(scaledMobile * 1.5)}px !important;
        --spacing-stack: ${Math.round(scaledMobile * 0.85)}px !important;
      }
    `;
  }

  // Handle optional viewport simulation frame
  const wrapper = document.querySelector("#page-content-wrapper") as HTMLElement | null;
  if (wrapper) {
    if (simulateFrame && previewMode === "mobile") {
      wrapper.style.maxWidth = "390px";
      wrapper.style.marginLeft = "auto";
      wrapper.style.marginRight = "auto";
      wrapper.style.boxShadow = "0 0 60px rgba(0, 0, 0, 0.9)";
      wrapper.style.transition = "max-width 0.3s ease";
    } else if (simulateFrame && previewMode === "tablet") {
      wrapper.style.maxWidth = "768px";
      wrapper.style.marginLeft = "auto";
      wrapper.style.marginRight = "auto";
      wrapper.style.boxShadow = "0 0 60px rgba(0, 0, 0, 0.9)";
      wrapper.style.transition = "max-width 0.3s ease";
    } else {
      wrapper.style.maxWidth = "";
      wrapper.style.marginLeft = "";
      wrapper.style.marginRight = "";
      wrapper.style.boxShadow = "";
    }
  }

  const css = `
    :root {
      --gap-desktop: ${scaledDesktop}px;
      --gap-tablet: ${scaledTablet}px;
      --gap-mobile: ${scaledMobile}px;
      --spacing-section: ${desktopClamp};
      --spacing-section-sm: ${desktopSm};
      --spacing-section-lg: ${desktopLg};
      --spacing-stack: ${calculateClamp(Math.round(scaledTablet * 0.85), Math.round(scaledDesktop * 0.85), 1024, 1440)};
    }
    @media (max-width: 1023px) {
      :root {
        --spacing-section: ${tabletClamp};
        --spacing-section-sm: ${tabletSm};
        --spacing-section-lg: ${tabletLg};
        --spacing-stack: ${calculateClamp(Math.round(((scaledMobile + scaledTablet) / 2) * 0.85), Math.round(scaledTablet * 0.85), 640, 1024)};
      }
    }
    @media (max-width: 639px) {
      :root {
        --spacing-section: ${mobileClamp};
        --spacing-section-sm: ${mobileSm};
        --spacing-section-lg: ${mobileLg};
        --spacing-stack: ${calculateClamp(Math.round(scaledMobile * 0.85), Math.round(((scaledMobile + scaledTablet) / 2) * 0.85), 360, 640)};
      }
    }
    ${overrideCss}
  `;

  let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = STYLE_TAG_ID;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = css;
}

export default function FluidGapTuner() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const savedOpen = localStorage.getItem(OPEN_KEY);
      if (savedOpen !== null) {
        return savedOpen === "true";
      }
      return (
        window.location.search.includes("gap=true") ||
        window.location.search.includes("tuner=true") ||
        process.env.NODE_ENV === "development"
      );
    }
    return false;
  });
  const [activeStep, setActiveStep] = useState<ActiveStep>("desktop");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [simulateFrame, setSimulateFrame] = useState(false);
  const [settings, setSettings] = useState<FluidGapSettings>(DEFAULT_SETTINGS);
  const [currentViewport, setCurrentViewport] = useState<number>(1440);
  const [computedGapPx, setComputedGapPx] = useState<number>(72);
  const [panelPos, setPanelPos] = useState({ x: 20, y: 80 });
  const panelPosRef = React.useRef(panelPos);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    panelPosRef.current = panelPos;
  }, [panelPos]);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed.desktop === "number" &&
          typeof parsed.tablet === "number" &&
          typeof parsed.mobile === "number"
        ) {
          setSettings({
            desktop: parsed.desktop,
            tablet: parsed.tablet,
            mobile: parsed.mobile,
            scale: typeof parsed.scale === "number" ? parsed.scale : 1.0,
          });
        }
      }
      const savedStep = localStorage.getItem(STEP_KEY) as ActiveStep | null;
      if (savedStep && ["desktop", "tablet", "mobile", "master"].includes(savedStep)) {
        setActiveStep(savedStep);
        setPreviewMode(savedStep === "master" ? "auto" : savedStep);
      }
      const savedPos = localStorage.getItem(PANEL_POS_KEY);
      if (savedPos) {
        try {
          const parsedPos = JSON.parse(savedPos);
          if (typeof parsedPos.x === "number" && typeof parsedPos.y === "number") {
            setPanelPos(parsedPos);
          }
        } catch {}
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Persist open state
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(OPEN_KEY, String(isOpen));
    } catch {}
  }, [isOpen, mounted]);

  // When activeStep changes, also update previewMode to match that device
  const handleSelectStep = useCallback((step: ActiveStep) => {
    setActiveStep(step);
    if (step === "master") {
      setPreviewMode("auto");
    } else {
      setPreviewMode(step);
    }
    try {
      localStorage.setItem(STEP_KEY, step);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Apply fluid gap styles and persist whenever settings or previewMode change
  useEffect(() => {
    applyFluidGapToDocument(settings, previewMode, simulateFrame);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore localStorage errors
    }
  }, [settings, previewMode, simulateFrame]);

  // Clean up simulation frame on unmount
  useEffect(() => {
    return () => {
      const wrapper = document.querySelector("#page-content-wrapper") as HTMLElement | null;
      if (wrapper) {
        wrapper.style.maxWidth = "";
        wrapper.style.marginLeft = "";
        wrapper.style.marginRight = "";
        wrapper.style.boxShadow = "";
      }
    };
  }, []);

  // Viewport resize tracking & computed live gap measurement
  useEffect(() => {
    const measureLive = () => {
      const w = window.innerWidth;
      setCurrentViewport(w);

      if (previewMode === "desktop") {
        setComputedGapPx(Math.round(settings.desktop * settings.scale));
        return;
      }
      if (previewMode === "tablet") {
        setComputedGapPx(Math.round(settings.tablet * settings.scale));
        return;
      }
      if (previewMode === "mobile") {
        setComputedGapPx(Math.round(settings.mobile * settings.scale));
        return;
      }

      // Auto mode: measure computed gap on page-stack
      const testEl = document.querySelector(".page-stack") || document.body;
      const cs = window.getComputedStyle(testEl);
      const rowGap = parseFloat(cs.rowGap || cs.gap || "0");
      if (rowGap > 0) {
        setComputedGapPx(Math.round(rowGap));
      } else {
        const scaledDesktop = settings.desktop * settings.scale;
        const scaledTablet = settings.tablet * settings.scale;
        const scaledMobile = settings.mobile * settings.scale;
        if (w >= 1024) {
          const p = Math.min(1, (w - 1024) / (1440 - 1024));
          setComputedGapPx(Math.round(scaledTablet + p * (scaledDesktop - scaledTablet)));
        } else if (w >= 640) {
          const p = (w - 640) / (1024 - 640);
          setComputedGapPx(Math.round(scaledMobile + p * (scaledTablet - scaledMobile)));
        } else {
          setComputedGapPx(Math.round(scaledMobile));
        }
      }
    };

    measureLive();
    window.addEventListener("resize", measureLive, { passive: true });
    return () => window.removeEventListener("resize", measureLive);
  }, [settings, previewMode]);

  // Keyboard shortcut: Alt+G to toggle & custom events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "g" || e.key === "G")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleOpen = () => setIsOpen(true);
    const handleToggle = () => setIsOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-fluid-gap-tuner", handleOpen);
    window.addEventListener("toggle-fluid-gap-tuner", handleToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-fluid-gap-tuner", handleOpen);
      window.removeEventListener("toggle-fluid-gap-tuner", handleToggle);
    };
  }, []);

  // Dragging support
  const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: panelPos.x,
      startY: panelPos.y,
    };
  }, [panelPos]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanelPos({
        x: Math.max(10, Math.min(window.innerWidth - 370, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 530, dragStartRef.current.startY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(PANEL_POS_KEY, JSON.stringify(panelPosRef.current));
      } catch {}
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const updateSetting = useCallback((key: keyof FluidGapSettings, val: number) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: val };
      // Maintain logical hierarchy: Desktop >= Tablet >= Mobile
      if (key === "desktop" && next.tablet > val) {
        next.tablet = val;
      }
      if (key === "tablet") {
        if (next.tablet > next.desktop) next.desktop = next.tablet;
        if (next.mobile > next.tablet) next.mobile = next.tablet;
      }
      if (key === "mobile" && next.mobile > next.tablet) {
        next.tablet = next.mobile;
      }
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setActiveStep("desktop");
    setPreviewMode("desktop");
    setSimulateFrame(false);
  }, []);

  const applyPreset = useCallback((desktop: number, tablet: number, mobile: number, scale = 1.0) => {
    setSettings({
      desktop,
      tablet,
      mobile,
      scale,
    });
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  const scaledDesktop = Math.round(settings.desktop * settings.scale);
  const scaledTablet = Math.round(settings.tablet * settings.scale);
  const scaledMobile = Math.round(settings.mobile * settings.scale);

  // Closed Floating Pill
  if (!isOpen) {
    return createPortal(
      <div
        data-fluid-gap-tuner
        className="fixed z-[9999998] transition-opacity cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragMouseDown}
        style={
          {
            "--panel-x": `${panelPos.x}px`,
            "--panel-y": `${panelPos.y}px`,
            left: "var(--panel-x)",
            top: "var(--panel-y)",
          } as React.CSSProperties
        }
      >
        <button
          onClick={() => setIsOpen(true)}
          title="Open Section Gap Controller (Alt+G)"
          className="transition-colors flex items-center gap-2 rounded-full border border-cyan-500/50 bg-zinc-950/95 px-3.5 py-2 font-mono text-xs text-cyan-300 shadow-2xl backdrop-blur-xl hover:border-cyan-400 hover:bg-cyan-950 hover:text-white cursor-pointer"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="font-semibold">🌊 Section Gap: {computedGapPx}px</span>
        </button>
      </div>,
      document.body
    );
  }

  // Expanded Controller Modal Card
  return createPortal(
    <div
      data-fluid-gap-tuner
      className="fixed z-[9999998] w-[370px] rounded-2xl border border-cyan-500/40 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-2xl font-sans text-xs select-none"
      style={
        {
          "--panel-x": `${panelPos.x}px`,
          "--panel-y": `${panelPos.y}px`,
          left: "var(--panel-x)",
          top: "var(--panel-y)",
        } as React.CSSProperties
      }
    >
      {/* Header bar (Draggable) */}
      <div
        onMouseDown={handleDragMouseDown}
        className="flex items-center justify-between border-b border-white/10 p-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold text-cyan-300">🌊 Fluid Gap Tuner</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetDefaults}
            title="Reset to original defaults"
            className="transition-colors rounded px-2 py-0.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Minimize (Alt+G)"
            className="transition-colors rounded px-2 py-0.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-3.5 max-h-[82vh] overflow-y-auto custom-scrollbar">
        {/* Live Status Banner */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wider text-cyan-300 font-mono">
              {previewMode === "auto" ? `Auto Mode (${currentViewport}px)` : `Step: ${previewMode.toUpperCase()}`}
            </span>
            <span className="font-medium text-white">
              {previewMode === "desktop"
                ? "💻 Desktop Viewport (≥1024px)"
                : previewMode === "tablet"
                ? "📱 Tablet Viewport (640-1023px)"
                : previewMode === "mobile"
                ? "📱 Mobile Viewport (<640px)"
                : "Live Responsive Viewport"}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs uppercase tracking-wider text-white/50 font-mono">
              Active Gap
            </span>
            <span className="text-base font-extrabold text-cyan-300 font-mono leading-none">
              {computedGapPx}px
            </span>
          </div>
        </div>

        {/* STEP-BY-STEP PROGRESSION TABS: DESKTOP -> TABLET -> MOBILE */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Step-by-Step Device Setup:
            </span>
            {(activeStep === "tablet" || activeStep === "mobile") && (
              <label className="flex items-center gap-1 cursor-pointer text-xs text-cyan-300 font-mono">
                <input
                  type="checkbox"
                  checked={simulateFrame}
                  onChange={(e) => setSimulateFrame(e.target.checked)}
                  className="accent-cyan-400 h-3 w-3"
                />
                <span>Simulate Frame</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-900 p-1 font-mono text-xs">
            <button
              onClick={() => handleSelectStep("desktop")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "desktop"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              1. 💻 Desktop
            </button>
            <button
              onClick={() => handleSelectStep("tablet")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "tablet"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              2. 📱 Tablet
            </button>
            <button
              onClick={() => handleSelectStep("mobile")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "mobile"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              3. 📱 Mobile
            </button>
          </div>
        </div>

        {/* STEP 1: 💻 DESKTOP CONTROL */}
        {activeStep === "desktop" && (
          <div className="flex flex-col gap-3 rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Step 1: Desktop Gap (≥1024px)</div>
                <div className="text-xs text-zinc-400">Baseline wide-screen section spacing</div>
              </div>
              <span className="font-mono text-cyan-300 font-bold text-sm">{scaledDesktop}px</span>
            </div>

            <input
              type="range"
              min="60"
              max="240"
              step="2"
              value={settings.desktop}
              onChange={(e) => updateSetting("desktop", parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-mono">
              <span>60px (Tight)</span>
              <span>Target: 136px</span>
              <span>240px (Extra Large)</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-zinc-400">Previewing Desktop live</span>
              <button
                onClick={() => handleSelectStep("tablet")}
                className="transition-colors flex items-center gap-1 rounded bg-cyan-500/20 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer"
              >
                <span>Next: Tablet</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 📱 TABLET CONTROL */}
        {activeStep === "tablet" && (
          <div className="flex flex-col gap-3 rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Step 2: Tablet Gap (640-1023px)</div>
                <div className="text-xs text-zinc-400">Intermediate fluid gap for iPads & tablets</div>
              </div>
              <span className="font-mono text-cyan-300 font-bold text-sm">{scaledTablet}px</span>
            </div>

            <input
              type="range"
              min="40"
              max="180"
              step="2"
              value={settings.tablet}
              onChange={(e) => updateSetting("tablet", parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-mono">
              <span>40px (Tight)</span>
              <span>Target: 100px</span>
              <span>Max: {settings.desktop}px</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <button
                onClick={() => handleSelectStep("desktop")}
                className="transition-colors rounded bg-white/5 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ⬅ Back: Desktop
              </button>
              <button
                onClick={() => handleSelectStep("mobile")}
                className="transition-colors flex items-center gap-1 rounded bg-cyan-500/20 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer"
              >
                <span>Next: Mobile</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 📱 MOBILE CONTROL */}
        {activeStep === "mobile" && (
          <div className="flex flex-col gap-3 rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Step 3: Mobile Gap (&lt;640px)</div>
                <div className="text-xs text-zinc-400">Compact fluid gap for smartphones</div>
              </div>
              <span className="font-mono text-cyan-300 font-bold text-sm">{scaledMobile}px</span>
            </div>

            <input
              type="range"
              min="20"
              max="100"
              step="2"
              value={settings.mobile}
              onChange={(e) => updateSetting("mobile", parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-mono">
              <span>20px (Tight)</span>
              <span>Target: 50px</span>
              <span>Max: {settings.tablet}px</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <button
                onClick={() => handleSelectStep("tablet")}
                className="transition-colors rounded bg-white/5 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ⬅ Back: Tablet
              </button>
              <button
                onClick={() => setPreviewMode("auto")}
                className={`transition-colors rounded px-2.5 py-1 font-mono text-xs font-semibold border cursor-pointer ${
                  previewMode === "auto"
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {previewMode === "auto" ? "✓ In Auto Mode" : "Switch to Auto Mode"}
              </button>
            </div>
          </div>
        )}

        {/* MASTER SCALE MULTIPLIER (Optional quick boost) */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-300">Master Multiplier (All 3)</span>
            <span className="font-mono text-cyan-300 font-bold">{settings.scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={settings.scale}
            onChange={(e) => updateSetting("scale", parseFloat(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-zinc-500 font-mono">
            <span>0.5x (Tight)</span>
            <span>1.0x (Normal)</span>
            <span>2.5x (Airy)</span>
          </div>
        </div>

        {/* QUICK CASCADE PRESETS (Desktop -> Tablet -> Mobile) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Quick Cascades (Desk ➔ Tablet ➔ Mobile):
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => applyPreset(136, 100, 50)}
              className="transition-colors rounded-lg border border-cyan-500/50 bg-cyan-950/30 p-1.5 text-left hover:border-cyan-400 hover:bg-cyan-900/40 shadow-sm cursor-pointer"
            >
              <div className="font-semibold text-cyan-200">Target</div>
              <div className="font-mono text-xs text-cyan-300">136 ➔ 100 ➔ 50px</div>
            </button>
            <button
              onClick={() => applyPreset(160, 120, 60)}
              className="transition-colors rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
            >
              <div className="font-semibold text-white">Airy</div>
              <div className="font-mono text-xs text-zinc-400">160 ➔ 120 ➔ 60px</div>
            </button>
            <button
              onClick={() => applyPreset(112, 80, 40)}
              className="transition-colors rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
            >
              <div className="font-semibold text-white">Compact</div>
              <div className="font-mono text-xs text-zinc-400">112 ➔ 80 ➔ 40px</div>
            </button>
            <button
              onClick={() => applyPreset(88, 64, 32)}
              className="transition-colors rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
            >
              <div className="font-semibold text-white">Minimal</div>
              <div className="font-mono text-xs text-zinc-400">88 ➔ 64 ➔ 32px</div>
            </button>
          </div>
        </div>

        {/* Current Hierarchy Breakdown */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 flex flex-col gap-1 font-mono text-xs">
          <span className="text-zinc-400 uppercase tracking-wider">Configured Hierarchy</span>
          <div className="flex items-center justify-between text-cyan-300">
            <span>💻 Desk: {scaledDesktop}px</span>
            <span>➔</span>
            <span>📱 Tab: {scaledTablet}px</span>
            <span>➔</span>
            <span>📱 Mob: {scaledMobile}px</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
