"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export interface FluidGapSettings {
  desktop: number; // base at 1440px (first)
  tablet: number; // base at 768px (second)
  mobile: number; // base at 375px (third)
  scale: number; // master multiplier
  sectionSm?: number; // specific --spacing-section-sm override (e.g. 75px) for desktop
  sectionSmTablet?: number; // tablet --spacing-section-sm override (e.g. 60px)
  sectionSmMobile?: number; // mobile --spacing-section-sm override (e.g. 40px)
  sectionLg?: number; // specific --spacing-section-lg override (e.g. 140px)
  bannerGap?: number; // CD to button gap (e.g. 24px)
  bannerInnerGap?: number; // CD to title gap (e.g. 16px)
  headerColsGap?: number; // Media Vault to Audio Vault 2-col gap (e.g. 32px)
}

export type ActiveStep = "desktop" | "tablet" | "mobile" | "all" | "banner";
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
  sectionSm: 75,
  sectionSmTablet: 60,
  sectionSmMobile: 40,
  sectionLg: 140,
  bannerGap: 24,
  bannerInnerGap: 16,
  headerColsGap: 32,
};

function calculateClamp(minVal: number, maxVal: number, minVw: number, maxVw: number): string {
  if (minVal === 0 && maxVal === 0) return "0px";
  const delta = maxVal - minVal;
  if (delta === 0) return `${minVal}px`;
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

  const actualSectionSmDesktop =
    typeof settings.sectionSm === "number"
      ? Math.round(settings.sectionSm * scale)
      : Math.round(scaledDesktop * 0.75);

  const actualSectionSmTablet =
    typeof settings.sectionSmTablet === "number"
      ? Math.round(settings.sectionSmTablet * scale)
      : typeof settings.sectionSm === "number"
      ? Math.round(settings.sectionSm * 0.8 * scale)
      : Math.round(scaledTablet * 0.75);

  const actualSectionSmMobile =
    typeof settings.sectionSmMobile === "number"
      ? Math.round(settings.sectionSmMobile * scale)
      : typeof settings.sectionSm === "number"
      ? Math.round(settings.sectionSm * 0.55 * scale)
      : Math.round(scaledMobile * 0.75);

  const actualSectionLg =
    typeof settings.sectionLg === "number"
      ? Math.round(settings.sectionLg * scale)
      : Math.round(scaledDesktop * 1.8);

  const actualBannerGap = typeof settings.bannerGap === "number" ? settings.bannerGap : 24;
  const actualBannerInnerGap = typeof settings.bannerInnerGap === "number" ? settings.bannerInnerGap : 16;
  const actualHeaderColsGap = typeof settings.headerColsGap === "number" ? settings.headerColsGap : 32;

  // Clamps across breakpoints: Desktop -> Tablet -> Mobile
  // Desktop (>=1024px): 1024px -> 1440px
  const desktopClamp = calculateClamp(scaledTablet, scaledDesktop, 1024, 1440);
  const desktopSm = calculateClamp(actualSectionSmTablet, actualSectionSmDesktop, 1024, 1440);
  const desktopLg = calculateClamp(Math.round(scaledTablet * 1.5), actualSectionLg, 1024, 1440);

  // Tablet (640px -> 1024px)
  const tabletClamp = calculateClamp(Math.round((scaledMobile + scaledTablet) / 2), scaledTablet, 640, 1024);
  const tabletSm = calculateClamp(actualSectionSmMobile, actualSectionSmTablet, 640, 1024);
  const tabletLg = calculateClamp(Math.round(((scaledMobile + scaledTablet) / 2) * 1.5), Math.round(scaledTablet * 1.5), 640, 1024);

  // Mobile (<640px): 360px -> 640px
  const mobileClamp = calculateClamp(scaledMobile, Math.round((scaledMobile + scaledTablet) / 2), 360, 640);
  const mobileSm = calculateClamp(Math.max(0, Math.round(actualSectionSmMobile * 0.8)), actualSectionSmMobile, 360, 640);
  const mobileLg = calculateClamp(Math.round(scaledMobile * 1.5), Math.round(((scaledMobile + scaledTablet) / 2) * 1.5), 360, 640);

  let overrideCss = "";
  if (previewMode === "desktop") {
    overrideCss = `
      :root {
        --spacing-section: ${scaledDesktop}px !important;
        --spacing-section-sm: ${actualSectionSmDesktop}px !important;
        --spacing-section-lg: ${actualSectionLg}px !important;
        --spacing-stack: ${Math.round(scaledDesktop * 0.85)}px !important;
        --music-vault-gap: ${actualBannerGap}px !important;
        --music-vault-inner-gap: ${actualBannerInnerGap}px !important;
        --header-cols-gap: ${actualHeaderColsGap}px !important;
      }
    `;
  } else if (previewMode === "tablet") {
    overrideCss = `
      :root {
        --spacing-section: ${scaledTablet}px !important;
        --spacing-section-sm: ${actualSectionSmTablet}px !important;
        --spacing-section-lg: ${Math.round(scaledTablet * 1.5)}px !important;
        --spacing-stack: ${Math.round(scaledTablet * 0.85)}px !important;
        --music-vault-gap: ${actualBannerGap}px !important;
        --music-vault-inner-gap: ${actualBannerInnerGap}px !important;
        --header-cols-gap: ${actualHeaderColsGap}px !important;
      }
    `;
  } else if (previewMode === "mobile") {
    overrideCss = `
      :root {
        --spacing-section: ${scaledMobile}px !important;
        --spacing-section-sm: ${actualSectionSmMobile}px !important;
        --spacing-section-lg: ${Math.round(scaledMobile * 1.5)}px !important;
        --spacing-stack: ${Math.round(scaledMobile * 0.85)}px !important;
        --music-vault-gap: ${actualBannerGap}px !important;
        --music-vault-inner-gap: ${actualBannerInnerGap}px !important;
        --header-cols-gap: ${actualHeaderColsGap}px !important;
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
      --music-vault-gap: ${actualBannerGap}px;
      --music-vault-inner-gap: ${actualBannerInnerGap}px;
      --header-cols-gap: ${actualHeaderColsGap}px;
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

interface GapControlRowProps {
  title: string;
  subtitle?: string;
  cssVar: string;
  selector: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  accent?: "cyan" | "pink" | "purple";
  presets?: number[];
  onChange: (val: number) => void;
}

function GapControlRow({
  title,
  subtitle,
  cssVar,
  selector,
  value,
  min = 0,
  max = 200,
  step = 1,
  accent = "cyan",
  presets = [0, 24, 38, 48, 60, 75, 96, 120],
  onChange,
}: GapControlRowProps) {
  const isCyan = accent === "cyan";
  const isPink = accent === "pink";

  const accentColor = isCyan ? "text-cyan-300" : isPink ? "text-pink-300" : "text-purple-300";
  const borderColor = isCyan ? "border-cyan-500/30" : isPink ? "border-pink-500/30" : "border-purple-500/30";
  const bgBadge = isCyan ? "bg-cyan-950/60" : isPink ? "bg-pink-950/60" : "bg-purple-950/60";
  const accentClass = isCyan ? "accent-cyan-400" : isPink ? "accent-pink-400" : "accent-purple-400";
  const borderPill = isCyan ? "border-cyan-400/60 text-cyan-200" : isPink ? "border-pink-400/60 text-pink-200" : "border-purple-400/60 text-purple-200";

  return (
    <div className={`flex flex-col gap-2 rounded-xl border ${borderColor} bg-white/[0.02] p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-white text-xs">{title}</span>
            <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              {selector}
            </span>
          </div>
          {subtitle && <div className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</div>}
          <div className="text-[10px] font-mono text-zinc-500">{cssVar}</div>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed)));
            }}
            className={`w-14 rounded border ${borderColor} ${bgBadge} px-1.5 py-1 text-right font-mono text-xs font-bold ${accentColor} outline-none focus:border-white/40`}
          />
          <span className="font-mono text-xs text-zinc-400">px</span>
        </div>
      </div>

      {/* Range Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className={`h-2 w-full cursor-pointer ${accentClass}`}
      />

      {/* Nudge Buttons */}
      <div className="flex items-center justify-between gap-1 pt-0.5">
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="text-zinc-500 mr-0.5">Nudge:</span>
          {[-10, -5, -1, 1, 5, 10].map((delta) => (
            <button
              key={`nudge-${delta}`}
              type="button"
              onClick={() => onChange(Math.max(min, Math.min(max, value + delta)))}
              className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px] text-zinc-500">
          {min}px ➔ {max}px
        </span>
      </div>

      {/* Preset Chips */}
      {presets.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-white/5">
          <span className="text-[10px] font-mono text-zinc-500 mr-0.5">Presets:</span>
          {presets.map((p) => (
            <button
              key={`preset-${p}`}
              type="button"
              onClick={() => onChange(p)}
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition cursor-pointer ${
                value === p
                  ? `bg-white/10 ${borderPill} border font-bold shadow-sm`
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {p}px
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FluidGapTuner() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<ActiveStep>("desktop");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [simulateFrame, setSimulateFrame] = useState(false);
  const [settings, setSettings] = useState<FluidGapSettings>(DEFAULT_SETTINGS);
  const [currentViewport, setCurrentViewport] = useState<number>(1440);
  const [computedGapPx, setComputedGapPx] = useState<number>(100);
  const [computedSectionSmPx, setComputedSectionSmPx] = useState<number>(75);
  const [copiedCss, setCopiedCss] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 20, y: 80 });
  const panelPosRef = React.useRef(panelPos);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const [dockSlot, setDockSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    panelPosRef.current = panelPos;
  }, [panelPos]);

  useEffect(() => {
    const updateSlot = () => {
      if (typeof document !== "undefined") {
        const el = document.getElementById("tuner-dock-section-gap-slot");
        if (el) setDockSlot(el);
      }
    };
    updateSlot();
    window.addEventListener("tuner-dock-mounted", updateSlot);
    const interval = setInterval(updateSlot, 200);
    const timer = setTimeout(() => clearInterval(interval), 3000);
    return () => {
      window.removeEventListener("tuner-dock-mounted", updateSlot);
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

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
            sectionSm: typeof parsed.sectionSm === "number" ? parsed.sectionSm : 75,
            sectionSmTablet: typeof parsed.sectionSmTablet === "number" ? parsed.sectionSmTablet : 60,
            sectionSmMobile: typeof parsed.sectionSmMobile === "number" ? parsed.sectionSmMobile : 40,
            sectionLg: typeof parsed.sectionLg === "number" ? parsed.sectionLg : 140,
            bannerGap: typeof parsed.bannerGap === "number" ? parsed.bannerGap : 24,
            bannerInnerGap: typeof parsed.bannerInnerGap === "number" ? parsed.bannerInnerGap : 16,
            headerColsGap: typeof parsed.headerColsGap === "number" ? parsed.headerColsGap : 32,
          });
        }
      }
      const savedStep = localStorage.getItem(STEP_KEY) as ActiveStep | null;
      if (savedStep && ["desktop", "tablet", "mobile", "all", "banner"].includes(savedStep)) {
        setActiveStep(savedStep);
        setPreviewMode(savedStep === "all" || savedStep === "banner" ? "auto" : savedStep);
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
      const savedOpen = localStorage.getItem(OPEN_KEY);
      if (savedOpen !== null) {
        setIsOpen(savedOpen === "true");
      } else if (
        window.location.search.includes("gap=true") ||
        window.location.search.includes("tuner=true")
      ) {
        setIsOpen(true);
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
    if (step === "all" || step === "banner") {
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
        setComputedSectionSmPx(Math.round((settings.sectionSm ?? 75) * settings.scale));
        return;
      }
      if (previewMode === "tablet") {
        setComputedGapPx(Math.round(settings.tablet * settings.scale));
        setComputedSectionSmPx(Math.round((settings.sectionSmTablet ?? 60) * settings.scale));
        return;
      }
      if (previewMode === "mobile") {
        setComputedGapPx(Math.round(settings.mobile * settings.scale));
        setComputedSectionSmPx(Math.round((settings.sectionSmMobile ?? 40) * settings.scale));
        return;
      }

      // Auto mode: measure computed gap on page-stack & page-stack-sm
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

      const testSmEl = document.querySelector(".page-stack-sm");
      if (testSmEl) {
        const csSm = window.getComputedStyle(testSmEl);
        const rowGapSm = parseFloat(csSm.rowGap || csSm.gap || "0");
        if (rowGapSm > 0) {
          setComputedSectionSmPx(Math.round(rowGapSm));
          return;
        }
      }

      const scaledSmDesk = (settings.sectionSm ?? 75) * settings.scale;
      const scaledSmTab = (settings.sectionSmTablet ?? 60) * settings.scale;
      const scaledSmMob = (settings.sectionSmMobile ?? 40) * settings.scale;
      if (w >= 1024) {
        const p = Math.min(1, (w - 1024) / (1440 - 1024));
        setComputedSectionSmPx(Math.round(scaledSmTab + p * (scaledSmDesk - scaledSmTab)));
      } else if (w >= 640) {
        const p = (w - 640) / (1024 - 640);
        setComputedSectionSmPx(Math.round(scaledSmMob + p * (scaledSmTab - scaledSmMob)));
      } else {
        setComputedSectionSmPx(Math.round(scaledSmMob));
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
    const handleOpen = (e?: Event) => {
      setIsOpen(true);
      const custom = e as CustomEvent<{ tab?: ActiveStep }> | undefined;
      if (custom?.detail?.tab) {
        handleSelectStep(custom.detail.tab);
      }
    };
    const handleToggle = () => setIsOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-fluid-gap-tuner", handleOpen as EventListener);
    window.addEventListener("toggle-fluid-gap-tuner", handleToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-fluid-gap-tuner", handleOpen as EventListener);
      window.removeEventListener("toggle-fluid-gap-tuner", handleToggle);
    };
  }, [handleSelectStep]);

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
        x: Math.max(10, Math.min(window.innerWidth - 380, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 560, dragStartRef.current.startY + dy)),
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

  const handleQuickNudge = useCallback(
    (delta: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const mult = e.shiftKey ? 5 : 1;
      const stepDelta = delta * mult;

      if (previewMode === "mobile") {
        updateSetting("sectionSmMobile", Math.max(0, (settings.sectionSmMobile ?? 40) + stepDelta));
      } else if (previewMode === "tablet") {
        updateSetting("sectionSmTablet", Math.max(0, (settings.sectionSmTablet ?? 60) + stepDelta));
      } else {
        updateSetting("sectionSm", Math.max(0, (settings.sectionSm ?? 75) + stepDelta));
      }
    },
    [previewMode, settings.sectionSmMobile, settings.sectionSmTablet, settings.sectionSm, updateSetting]
  );

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setActiveStep("desktop");
    setPreviewMode("desktop");
    setSimulateFrame(false);
  }, []);

  const applyPreset = useCallback((desktop: number, tablet: number, mobile: number, scale = 1.0) => {
    setSettings((prev) => ({
      ...prev,
      desktop,
      tablet,
      mobile,
      scale,
      sectionSm: Math.round(desktop * 0.75),
      sectionSmTablet: Math.round(tablet * 0.75),
      sectionSmMobile: Math.round(mobile * 0.75),
    }));
  }, []);

  const handleCopyCss = useCallback(() => {
    const cssLines = [
      `/* 7th Heaven Spacing & Stack Gap Variables */`,
      `:root {`,
      `  --spacing-section-sm: ${settings.sectionSm ?? 75}px; /* .page-stack-sm */`,
      `  --spacing-section: ${settings.desktop}px; /* .page-stack */`,
      `  --spacing-section-lg: ${settings.sectionLg ?? 140}px; /* .page-stack-lg */`,
      `  --music-vault-gap: ${settings.bannerGap ?? 24}px;`,
      `  --music-vault-inner-gap: ${settings.bannerInnerGap ?? 16}px;`,
      `  --header-cols-gap: ${settings.headerColsGap ?? 32}px;`,
      `}`,
      `@media (max-width: 1023px) {`,
      `  :root {`,
      `    --spacing-section-sm: ${settings.sectionSmTablet ?? 60}px;`,
      `    --spacing-section: ${settings.tablet}px;`,
      `  }`,
      `}`,
      `@media (max-width: 639px) {`,
      `  :root {`,
      `    --spacing-section-sm: ${settings.sectionSmMobile ?? 40}px;`,
      `    --spacing-section: ${settings.mobile}px;`,
      `  }`,
      `}`,
    ].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(cssLines).then(() => {
        setCopiedCss(true);
        setTimeout(() => setCopiedCss(false), 2000);
      });
    }
  }, [settings]);

  if (!mounted) return null;

  // Always render interactive pill into dockSlot (or floating if no dock)
  const pillContent = (
    <div
      className={`flex items-center gap-1 rounded-full border ${
        isOpen
          ? "border-cyan-400 bg-cyan-950/80 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          : "border-cyan-500/50 bg-zinc-950/95"
      } p-1 font-mono text-xs text-cyan-300 shadow-2xl backdrop-blur-xl transition-all`}
    >
      <button
        type="button"
        onClick={(e) => handleQuickNudge(-1, e)}
        title="Nudge .page-stack-sm Gap -1px (Shift: -5px)"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-cyan-500/25 hover:text-white text-cyan-300 font-bold transition cursor-pointer"
      >
        -
      </button>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? "Minimize Tuner (Alt+G)" : "Open Gap Controller (Alt+G)"}
        className="flex items-center gap-1.5 px-2.5 py-1 text-left hover:text-white transition cursor-pointer"
      >
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <span className="font-semibold text-white">
          Gap: <span className="text-cyan-300 font-bold">sm {computedSectionSmPx}px</span>
          <span className="text-zinc-600 mx-1.5">|</span>
          <span className="text-zinc-400">base {computedGapPx}px</span>
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => handleQuickNudge(1, e)}
        title="Nudge .page-stack-sm Gap +1px (Shift: +5px)"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-cyan-500/25 hover:text-white text-cyan-300 font-bold transition cursor-pointer"
      >
        +
      </button>
    </div>
  );

  const targetSlot =
    dockSlot ||
    (typeof document !== "undefined"
      ? document.getElementById("tuner-dock-section-gap-slot")
      : null);

  const pillPortal = targetSlot
    ? createPortal(pillContent, targetSlot)
    : !isOpen
    ? createPortal(
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
          {pillContent}
        </div>,
        document.body
      )
    : null;

  if (!isOpen) {
    return pillPortal;
  }

  // Expanded Controller Modal Card
  return (
    <>
      {pillPortal}
      {createPortal(
        <div
          data-fluid-gap-tuner
      className="fixed z-[9999998] w-[390px] rounded-2xl border border-cyan-500/40 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-2xl font-sans text-xs select-none"
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
          <span className="font-mono text-xs font-semibold text-cyan-300">🌊 Fluid Gap & Stack Tuner</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={resetDefaults}
            title="Reset to original defaults"
            className="transition-colors rounded px-2 py-0.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Minimize (Alt+G)"
            className="transition-colors rounded px-2 py-0.5 font-mono text-xs text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-3 max-h-[82vh] overflow-y-auto custom-scrollbar">
        {/* Live Status Banner */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wider text-cyan-300 font-mono">
              {previewMode === "auto" ? `Auto Mode (${currentViewport}px)` : `Preview: ${previewMode.toUpperCase()}`}
            </span>
            <span className="font-medium text-white">
              {previewMode === "desktop"
                ? "💻 Desktop (≥1024px)"
                : previewMode === "tablet"
                ? "📱 Tablet (640-1023px)"
                : previewMode === "mobile"
                ? "📱 Mobile (<640px)"
                : "Live Responsive Clamps"}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              Live Stack Gaps
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300">
                sm {computedSectionSmPx}px
              </span>
              <span className="text-zinc-500">/</span>
              <span className="text-xs font-bold text-zinc-300">
                base {computedGapPx}px
              </span>
            </div>
          </div>
        </div>

        {/* STEP-BY-STEP PROGRESSION TABS: DESKTOP -> TABLET -> MOBILE -> ALL GAPS -> BANNER */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Breakpoint & Gap Selector:
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

          <div className="grid grid-cols-5 gap-1 rounded-lg bg-zinc-900 p-1 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectStep("desktop")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "desktop"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              1. Desk
            </button>
            <button
              type="button"
              onClick={() => handleSelectStep("tablet")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "tablet"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              2. Tab
            </button>
            <button
              type="button"
              onClick={() => handleSelectStep("mobile")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "mobile"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              3. Mob
            </button>
            <button
              type="button"
              onClick={() => handleSelectStep("all")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "all"
                  ? "bg-purple-500/25 text-purple-200 border border-purple-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              4. CSS
            </button>
            <button
              type="button"
              onClick={() => handleSelectStep("banner")}
              className={`rounded py-1.5 text-center font-medium transition cursor-pointer ${
                activeStep === "banner"
                  ? "bg-pink-500/25 text-pink-200 border border-pink-400/60 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              5. Banner
            </button>
          </div>
        </div>

        {/* STEP 1: 💻 DESKTOP CONTROLS */}
        {activeStep === "desktop" && (
          <div className="flex flex-col gap-3">
            {/* Primary: .page-stack-sm */}
            <GapControlRow
              title="Desktop Stack Small Gap"
              subtitle="Direct spacing for Media Wall, Vault & Page stacks"
              cssVar="--spacing-section-sm"
              selector=".page-stack-sm"
              value={settings.sectionSm ?? 75}
              min={0}
              max={200}
              step={1}
              accent="cyan"
              presets={[0, 24, 38, 48, 60, 75, 96, 120]}
              onChange={(val) => updateSetting("sectionSm", val)}
            />

            {/* Secondary: .page-stack */}
            <GapControlRow
              title="Desktop Main Section Gap"
              subtitle="Wide-screen spacing for primary page sections"
              cssVar="--spacing-section"
              selector=".page-stack"
              value={settings.desktop}
              min={0}
              max={240}
              step={2}
              accent="purple"
              presets={[0, 40, 60, 80, 100, 120, 136, 160]}
              onChange={(val) => updateSetting("desktop", val)}
            />

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-zinc-400">Desktop live preview active</span>
              <button
                type="button"
                onClick={() => handleSelectStep("tablet")}
                className="transition-colors flex items-center gap-1 rounded bg-cyan-500/20 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer"
              >
                <span>Next: Tablet</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 📱 TABLET CONTROLS */}
        {activeStep === "tablet" && (
          <div className="flex flex-col gap-3">
            {/* Primary: .page-stack-sm on tablet */}
            <GapControlRow
              title="Tablet Stack Small Gap"
              subtitle="Intermediate spacing for iPad & Tablet stacks"
              cssVar="--spacing-section-sm"
              selector=".page-stack-sm"
              value={settings.sectionSmTablet ?? 60}
              min={0}
              max={160}
              step={1}
              accent="cyan"
              presets={[0, 20, 32, 45, 60, 75, 90]}
              onChange={(val) => updateSetting("sectionSmTablet", val)}
            />

            {/* Secondary: .page-stack on tablet */}
            <GapControlRow
              title="Tablet Main Section Gap"
              subtitle="Intermediate wide spacing for iPad sections"
              cssVar="--spacing-section"
              selector=".page-stack"
              value={settings.tablet}
              min={0}
              max={180}
              step={2}
              accent="purple"
              presets={[0, 40, 60, 80, 100, 120]}
              onChange={(val) => updateSetting("tablet", val)}
            />

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleSelectStep("desktop")}
                className="transition-colors rounded bg-white/5 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ⬅ Back: Desktop
              </button>
              <button
                type="button"
                onClick={() => handleSelectStep("mobile")}
                className="transition-colors flex items-center gap-1 rounded bg-cyan-500/20 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer"
              >
                <span>Next: Mobile</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 📱 MOBILE CONTROLS */}
        {activeStep === "mobile" && (
          <div className="flex flex-col gap-3">
            {/* Primary: .page-stack-sm on mobile */}
            <GapControlRow
              title="Mobile Stack Small Gap"
              subtitle="Compact spacing for smartphone pages"
              cssVar="--spacing-section-sm"
              selector=".page-stack-sm"
              value={settings.sectionSmMobile ?? 40}
              min={0}
              max={120}
              step={1}
              accent="cyan"
              presets={[0, 16, 24, 32, 40, 48, 60]}
              onChange={(val) => updateSetting("sectionSmMobile", val)}
            />

            {/* Secondary: .page-stack on mobile */}
            <GapControlRow
              title="Mobile Main Section Gap"
              subtitle="Compact fluid spacing for smartphone sections"
              cssVar="--spacing-section"
              selector=".page-stack"
              value={settings.mobile}
              min={0}
              max={120}
              step={2}
              accent="purple"
              presets={[0, 24, 32, 40, 50, 64, 80]}
              onChange={(val) => updateSetting("mobile", val)}
            />

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleSelectStep("tablet")}
                className="transition-colors rounded bg-white/5 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ⬅ Back: Tablet
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("auto")}
                className={`transition-colors rounded px-2.5 py-1 font-mono text-xs font-semibold border cursor-pointer ${
                  previewMode === "auto"
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {previewMode === "auto" ? "✓ In Auto Mode" : "Switch to Auto"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 📐 ALL GAPS, MASTER SCALE & LIVE CSS */}
        {activeStep === "all" && (
          <div className="flex flex-col gap-3">
            {/* Master Multiplier */}
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-300">Master Multiplier (All Gaps)</span>
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

            {/* Quick Cascades */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Quick Cascades (Desk ➔ Tablet ➔ Mobile):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset(136, 100, 50)}
                  className="transition-colors rounded-lg border border-cyan-500/50 bg-cyan-950/30 p-1.5 text-left hover:border-cyan-400 hover:bg-cyan-900/40 shadow-sm cursor-pointer"
                >
                  <div className="font-semibold text-cyan-200">Target</div>
                  <div className="font-mono text-xs text-cyan-300">136 ➔ 100 ➔ 50px</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(160, 120, 60)}
                  className="transition-colors rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
                >
                  <div className="font-semibold text-white">Airy</div>
                  <div className="font-mono text-xs text-zinc-400">160 ➔ 120 ➔ 60px</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(112, 80, 40)}
                  className="transition-colors rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
                >
                  <div className="font-semibold text-white">Compact</div>
                  <div className="font-mono text-xs text-zinc-400">112 ➔ 80 ➔ 40px</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(88, 64, 32)}
                  className="transition-colors rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-left hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
                >
                  <div className="font-semibold text-white">Minimal</div>
                  <div className="font-mono text-xs text-zinc-400">88 ➔ 64 ➔ 32px</div>
                </button>
              </div>
            </div>

            {/* Generated CSS Block */}
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-black/60 p-2.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-400 border-b border-white/10 pb-1.5">
                <span>Active CSS Configuration</span>
                <button
                  type="button"
                  onClick={handleCopyCss}
                  className="transition-colors rounded px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer text-[10px]"
                >
                  {copiedCss ? "✓ Copied!" : "📋 Copy CSS"}
                </button>
              </div>
              <pre className="text-zinc-300 overflow-x-auto custom-scrollbar text-[10px] leading-relaxed pt-1">
{`:root {
  --spacing-section-sm: ${settings.sectionSm ?? 75}px; /* .page-stack-sm */
  --spacing-section: ${settings.desktop}px; /* .page-stack */
  --spacing-section-lg: ${settings.sectionLg ?? 140}px;
}
@media (max-width: 1023px) {
  --spacing-section-sm: ${settings.sectionSmTablet ?? 60}px;
  --spacing-section: ${settings.tablet}px;
}
@media (max-width: 639px) {
  --spacing-section-sm: ${settings.sectionSmMobile ?? 40}px;
  --spacing-section: ${settings.mobile}px;
}`}
              </pre>
            </div>
          </div>
        )}

        {/* STEP 5: 🎵 BANNER & HEADER GAPS */}
        {activeStep === "banner" && (
          <div className="flex flex-col gap-3">
            <GapControlRow
              title="Music Banner Item Gap"
              subtitle="CD + Text ↔ Right CTA Button"
              cssVar="--music-vault-gap"
              selector="#audio-vault-banner"
              value={settings.bannerGap ?? 24}
              min={0}
              max={64}
              step={2}
              accent="pink"
              presets={[8, 12, 16, 24, 32, 48]}
              onChange={(val) => updateSetting("bannerGap", val)}
            />

            <GapControlRow
              title="CD ↔ Text Inner Gap"
              subtitle="Distance between spinning CD and Audio Vault title"
              cssVar="--music-vault-inner-gap"
              selector="#audio-vault-banner .cd-text"
              value={settings.bannerInnerGap ?? 16}
              min={0}
              max={48}
              step={2}
              accent="pink"
              presets={[4, 8, 12, 16, 24, 32]}
              onChange={(val) => updateSetting("bannerInnerGap", val)}
            />

            <GapControlRow
              title="Header Columns Gap"
              subtitle="2-column gap between Media Vault title & Music Player"
              cssVar="--header-cols-gap"
              selector="#media-header-cols"
              value={settings.headerColsGap ?? 32}
              min={0}
              max={96}
              step={4}
              accent="pink"
              presets={[12, 16, 24, 32, 48, 64]}
              onChange={(val) => updateSetting("headerColsGap", val)}
            />
          </div>
        )}

        {/* Current Hierarchy Breakdown */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 flex flex-col gap-1 font-mono text-xs">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Configured Stack Small Hierarchy</span>
          <div className="flex items-center justify-between text-cyan-300 text-[11px]">
            <span>💻 Desk: {settings.sectionSm ?? 75}px</span>
            <span>➔</span>
            <span>📱 Tab: {settings.sectionSmTablet ?? 60}px</span>
            <span>➔</span>
            <span>📱 Mob: {settings.sectionSmMobile ?? 40}px</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
      )}
    </>
  );
}
