"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import SearchInput from "@/components/SearchInput";

const InputStyleEditor = dynamic(() => import("@/components/InputStyleEditor"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-xs font-mono text-white/40 bg-black/40 rounded-2xl border border-white/10 animate-pulse">Loading Input Style Editor Studio...</div>
});

const CruiseChat = dynamic(() => import("@/components/CruiseChat"), {
  ssr: false,
  loading: () => <div className="p-12 text-center text-xs font-mono text-white/40 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl rounded-2xl border border-purple-500/30 animate-pulse">Loading Live Cruise Chat Box...</div>
});

const SquishyToggle = dynamic(() => import("@/components/SquishyToggle"), {
  ssr: false,
});

const GooeyDropdown = dynamic(() => import("@/components/GooeyDropdown"), {
  ssr: false,
  loading: () => <div className="p-3 text-center text-xs font-mono text-white/40 bg-white/5 rounded-xl border border-white/10">Loading Dropdown...</div>
});

const GooeyMessagesDropdown = dynamic(() => import("@/components/GooeyMessagesDropdown"), {
  ssr: false,
  loading: () => <div className="p-3 text-center text-xs font-mono text-white/40 bg-white/5 rounded-xl border border-white/10">Loading Pill Dropdown...</div>
});

import RoleBadge from "@/components/RoleBadge";
import CustomScrollbar from "@/components/CustomScrollbar";
import { SectionBadge } from "@/components/SectionBadge";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { useThemeTokens } from "@/components/ThemeProvider";
import { useMember } from "@/context/MemberContext";
import {
  Type,
  Palette,
  MousePointer,
  Layout,
  ChevronDown,
  MessageSquare,
  Layers,
  ShieldCheck,
  Box,
  Sliders,
  Check,
  Copy,
  AlertTriangle,
  Info,
  Bell,
  Search,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Lock,
  ArrowRight,
  Send,
  Eye,
  Settings,
  Anchor,
  Compass,
  HelpCircle,
  CreditCard,
  Calendar,
  Maximize2,
  Trash2,
  CheckCircle,
  Mail,
  Zap,
} from "lucide-react";

// Sample Dropdown options (Module Scope)
const dropdownOptions = [
  { label: "Chicago, IL — House of Blues", value: "chicago", icon: "🎸" },
  { label: "Naperville, IL — Ribfest", value: "naperville", icon: "🤘" },
  { label: "Milwaukee, WI — Summerfest", value: "milwaukee", icon: "⚡" },
  { label: "Las Vegas, NV — Cruise 2026", value: "vegas", icon: "🚢" },
];

const sections = [
  { id: "typography", label: "1. Typography", icon: Type },
  { id: "colors", label: "2. Color Palette", icon: Palette },
  { id: "buttons", label: "3. Buttons", icon: MousePointer },
  { id: "form-elements", label: "4. Form Elements", icon: Layout },
  { id: "dropdowns", label: "5. Dropdowns", icon: ChevronDown },
  { id: "chat", label: "6. Chat Component", icon: MessageSquare },
  { id: "components", label: "7. Cards & Badges", icon: Layers },
  { id: "modals", label: "8. Modals & Dialogs", icon: Maximize2 },
  { id: "borders", label: "9. Borders & Glass", icon: ShieldCheck },
  { id: "scrollbars", label: "Scrollbars", icon: Sliders },
  { id: "spacing", label: "10. Spacing & Padding", icon: Box },
  { id: "canvas-studio", label: "11. Canvas & Film Grain", icon: Sliders },
  { id: "stateroom-perks", label: "12. Staterooms & Perks", icon: Anchor },
  { id: "crew-scheduling", label: "13. Crew Scheduling & Groups", icon: Calendar },
];

export default function StyleGuidePage() {
  const { openModal } = useMember();
  const { tokens, isSaving, hasUnsavedChanges, updateToken, saveTheme, resetToDefaults, exportThemeJson } = useThemeTokens();

  // Active section tab & search query for fast jumping
  const [activeSection, setActiveSection] = useState<string>("typography");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Sample interactive form states
  const [textInput, setTextInput] = useState("Michael Scimeca");
  const [searchInput, setSearchInput] = useState("");
  const [textareaInput, setTextareaInput] = useState("Great performance at House of Blues! PA sound check scheduled for 4:30 PM.");
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioState, setRadioState] = useState("full_band");
  const [toggleState, setToggleState] = useState(true);
  const [selectedDropdown, setSelectedDropdown] = useState("chicago");
  const [previewAlerts, setPreviewAlerts] = useState(true);
  const [previewNews, setPreviewNews] = useState(true);
  const [previewAge, setPreviewAge] = useState(true);
  const [previewRadius, setPreviewRadius] = useState("50");
  const [signInRole, setSignInRole] = useState<'fan' | 'crew' | 'planner' | 'cruise'>('fan');
  const [signUpRole, setSignUpRole] = useState<'fan' | 'planner' | 'cruise'>('fan');

  /* ── PIN Input Demo State ── */
  const [pinDefaultDigits, setPinDefaultDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinDefaultFocusedIndex, setPinDefaultFocusedIndex] = useState<number | null>(null);
  const pinDefaultRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pinDigits, setPinDigits] = useState<string[]>(["7", "H", "", "", "", ""]);
  const [pinFocusedIndex, setPinFocusedIndex] = useState<number | null>(null);
  const [pinError, setPinError] = useState(false);

  /* ── Modal Demo State ── */
  const [showGlassModal, setShowGlassModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [confirmResult, setConfirmResult] = useState<string | null>(null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinDigit = (idx: number, val: string) => {
    const clean = val.replace(/[^0-9a-zA-Z]/g, "").slice(-1).toUpperCase();
    setPinDigits(prev => { const n = [...prev]; n[idx] = clean; return n; });
    setPinError(false);
    if (clean && idx < 5) pinRefs.current[idx + 1]?.focus();
  };

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[idx] && idx > 0) {
      pinRefs.current[idx - 1]?.focus();
    }
  };

  const handlePinDefaultDigit = (idx: number, val: string) => {
    const clean = val.replace(/[^0-9a-zA-Z]/g, "").slice(-1).toUpperCase();
    setPinDefaultDigits(prev => { const n = [...prev]; n[idx] = clean; return n; });
    if (clean && idx < 5) pinDefaultRefs.current[idx + 1]?.focus();
  };

  const handlePinDefaultKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDefaultDigits[idx] && idx > 0) {
      pinDefaultRefs.current[idx - 1]?.focus();
    }
  };
  // Interactive Chat Bubble UI Control States
  const [bubbleRadius, setBubbleRadius] = useState<number>(16);
  const [bubbleBorderWidth, setBubbleBorderWidth] = useState<number>(0);
  const [bubbleBorderColor, setBubbleBorderColor] = useState<string>("transparent");
  const [bubbleBgStyle, setBubbleBgStyle] = useState<string>("classic");
  const [bubbleFontSize, setBubbleFontSize] = useState<number>(12);
  const [bubblePaddingY, setBubblePaddingY] = useState<number>(5);
  const [bubblePaddingX, setBubblePaddingX] = useState<number>(13);
  const [messageSpacing, setMessageSpacing] = useState<number>(13);
  const [bubbleColorPalette, setBubbleColorPalette] = useState<string>("default");
  const [customHexColor, setCustomHexColor] = useState<string>("#9333ea");
  const [bubbleOpacity, setBubbleOpacity] = useState<number>(80);
  const [multiUserColorMode, setMultiUserColorMode] = useState<boolean>(true);
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false);

  // Canvas Shader & Film Grain UI Control States
  const [canvasGrainOpacity, setCanvasGrainOpacity] = useState<number>(6);
  const [canvasGrainBlend, setCanvasGrainBlend] = useState<string>("overlay");
  const [canvasGrainSize, setCanvasGrainSize] = useState<number>(0.85);
  // NeatGradient live shader parameters
  const [canvasSpeed, setCanvasSpeed] = useState<number>(3);
  const [canvasWaveAmp, setCanvasWaveAmp] = useState<number>(0.6);
  const [canvasWaveFreqX, setCanvasWaveFreqX] = useState<number>(1.5);
  const [canvasWaveFreqY, setCanvasWaveFreqY] = useState<number>(2.0);
  const [canvasColorBlending, setCanvasColorBlending] = useState<number>(10);
  const [canvasColorSaturation, setCanvasColorSaturation] = useState<number>(10);
  const [canvasColorBrightness, setCanvasColorBrightness] = useState<number>(0.5);
  const [canvasShadows, setCanvasShadows] = useState<number>(10);
  const [canvasHighlights, setCanvasHighlights] = useState<number>(10);
  const [canvasHPressure, setCanvasHPressure] = useState<number>(3);
  const [canvasVPressure, setCanvasVPressure] = useState<number>(3);
  const [canvasBgColor, setCanvasBgColor] = useState<string>("#05030a");
  const [copiedCanvasSpec, setCopiedCanvasSpec] = useState<boolean>(false);

  // Stateroom Catalog & Suite Perks interactive preview states
  const [stateroomTab, setStateroomTab] = useState<"suites" | "balcony" | "ocean" | "interior">("suites");
  const [suiteTab, setSuiteTab] = useState<"sea" | "sky" | "star">("sea");
  const [sgGuestInsurance, setSgGuestInsurance] = useState("yes");
  const [sgGuestGratuities, setSgGuestGratuities] = useState("yes");

  /* ── Dedicated Fluid Type Studio Control Panel States ── */
  const [studioSelectedTier, setStudioSelectedTier] = useState<string>("6xl");
  const [studioMinFs, setStudioMinFs] = useState<number>(40);
  const [studioMaxFs, setStudioMaxFs] = useState<number>(56);
  const [studioMinVw, setStudioMinVw] = useState<number>(1025);
  const [studioMaxVw, setStudioMaxVw] = useState<number>(1550);
  const [studioMode, setStudioMode] = useState<"locked" | "chained">("locked");
  const [copiedStudioFormula, setCopiedStudioFormula] = useState<boolean>(false);
  const [liveWinW, setLiveWinW] = useState<number>(1280);

  // Global CSS Export & Modal States
  const [cssCopied, setCssCopied] = useState<boolean>(false);
  const [showCssModal, setShowCssModal] = useState<boolean>(false);
  const [generatedCssExport, setGeneratedCssExport] = useState<string>("");

  useEffect(() => {
    // Sync to real viewport width after hydration
    setLiveWinW(window.innerWidth);
    const handleResize = () => setLiveWinW(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to hash anchor on initial load (Next.js doesn't do this automatically)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < 10) {
        setTimeout(() => tryScroll(attempts + 1), 150);
      }
    };
    tryScroll();
  }, []);

  // Compute exact CSS clamp values and parameters
  const computeFluidClamp = (minFsPx: number, maxFsPx: number, minVwPx: number, maxVwPx: number) => {
    if (minFsPx === maxFsPx || minVwPx === maxVwPx) {
      return { clampStr: `${(minFsPx / 16).toFixed(4)}rem`, minRem: minFsPx / 16, maxRem: maxFsPx / 16, slopeVw: 0, interceptRem: minFsPx / 16 };
    }
    const minRem = minFsPx / 16;
    const maxRem = maxFsPx / 16;
    const slope = (maxRem - minRem) / (maxVwPx - minVwPx);
    const slopeVw = slope * 100;
    const interceptRem = minRem - slope * minVwPx;
    const minBound = Math.min(minRem, maxRem);
    const maxBound = Math.max(minRem, maxRem);

    const clampStr = `clamp(${minBound.toFixed(4)}rem, ${interceptRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxBound.toFixed(4)}rem)`;
    return { clampStr, minRem, maxRem, slopeVw, interceptRem };
  };

  // Synchronize Studio Panel parameters into live DOM style overrides
  useEffect(() => {
    // Remove old conflicting tag if present
    const oldTag = document.getElementById("studio-fluid-override");
    if (oldTag) oldTag.remove();

    // Sync input values in the detailed table
    const section = document.getElementById("typography");
    if (section) {
      const row = section.querySelector(`[data-tier="${studioSelectedTier}"]`);
      if (row) {
        const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
        if (inputs[4]) inputs[4].value = (studioMinFs / 16).toString();
        if (inputs[5]) inputs[5].value = (studioMaxFs / 16).toString();
        const labelDMin = row.querySelector("[data-val='dMin']");
        if (labelDMin) labelDMin.textContent = `${studioMinFs}px`;
        const labelDMax = row.querySelector("[data-val='dMax']");
        if (labelDMax) labelDMax.textContent = `${studioMaxFs}px`;

        // Trigger single source-of-truth style rebuild
        const win = window as any;
        if (typeof win.__rebuildStyleTag === "function") {
          win.__rebuildStyleTag();
        }
      }
    }
  }, [studioSelectedTier, studioMinFs, studioMaxFs, studioMinVw, studioMaxVw, studioMode]);

  // Sync grain overlay CSS vars + push shader values to the live NeatGradient instance
  useEffect(() => {
    document.documentElement.style.setProperty("--canvas-grain-opacity", `${canvasGrainOpacity / 100}`);
    document.documentElement.style.setProperty("--canvas-grain-blend", canvasGrainBlend);
    document.documentElement.style.setProperty("--canvas-grain-size", `${canvasGrainSize}`);
    const feTurb = document.querySelector("#globalGrainFilter feTurbulence");
    if (feTurb) feTurb.setAttribute("baseFrequency", `${canvasGrainSize}`);

    const neat = (window as any).__neatInstance;
    if (neat) {
      neat.speed = canvasSpeed;
      neat.waveAmplitude = canvasWaveAmp;
      neat.waveFrequencyX = canvasWaveFreqX;
      neat.waveFrequencyY = canvasWaveFreqY;
      neat.colorBlending = canvasColorBlending;
      neat.colorSaturation = canvasColorSaturation;
      neat.colorBrightness = canvasColorBrightness;
      neat.shadows = canvasShadows;
      neat.highlights = canvasHighlights;
      neat.horizontalPressure = canvasHPressure;
      neat.verticalPressure = canvasVPressure;
      neat.backgroundColor = canvasBgColor;
    }
  }, [canvasGrainOpacity, canvasGrainBlend, canvasGrainSize, canvasSpeed, canvasWaveAmp, canvasWaveFreqX, canvasWaveFreqY, canvasColorBlending, canvasColorSaturation, canvasColorBrightness, canvasShadows, canvasHighlights, canvasHPressure, canvasVPressure, canvasBgColor]);

  const handleCopyCanvasSpec = () => {
    const spec = `:root {
  /* Film Grain Overlay */
  --canvas-grain-opacity: ${canvasGrainOpacity / 100};
  --canvas-grain-blend: ${canvasGrainBlend};
  --canvas-grain-size: ${canvasGrainSize};
  /* NeatGradient Shader */
  --canvas-speed: ${canvasSpeed};
  --canvas-wave-amplitude: ${canvasWaveAmp};
  --canvas-wave-freq-x: ${canvasWaveFreqX};
  --canvas-wave-freq-y: ${canvasWaveFreqY};
  --canvas-color-blending: ${canvasColorBlending};
  --canvas-color-saturation: ${canvasColorSaturation};
  --canvas-color-brightness: ${canvasColorBrightness};
  --canvas-shadows: ${canvasShadows};
  --canvas-highlights: ${canvasHighlights};
  --canvas-h-pressure: ${canvasHPressure};
  --canvas-v-pressure: ${canvasVPressure};
  --canvas-bg-color: ${canvasBgColor};
}`;
    navigator.clipboard.writeText(spec);
    setCopiedCanvasSpec(true);
    setTimeout(() => setCopiedCanvasSpec(false), 2000);
  };

  const handleCopyToken = (varName: string, val: string) => {
    navigator.clipboard.writeText(`${varName}: ${val};`);
    setCopiedToken(varName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen  text-white pt-24 pb-20 px-6 sm:px-8 lg:px-[42px]">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 7th Heaven Design System
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400">
              Master Style Guide
            </h1>
            <p className="text-white/60 text-base mt-2 max-w-2xl">
              The unified design specification for typography, color swatches, real shipping components, form controls, dropdowns, borders, and spacing tokens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => resetToDefaults()}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-xs transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Tokens
            </button>
            <button
              onClick={() => saveTheme()}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 ${hasUnsavedChanges
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                : "bg-white/10 text-white/50 cursor-default"
                }`}
            >
              {isSaving ? "Saving..." : "Save Theme Tokens"}
            </button>
          </div>
        </div>

        {/* Sticky Section Quick Navigation Bar */}
        <div className="sticky top-20 z-40 bg-[#070510]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center gap-2 overflow-x-auto scrollbar-none">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition flex items-center gap-2 border ${isActive
                  ? "bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-md"
                  : "bg-transparent text-white/60 hover:text-white border-transparent hover:border-white/10"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </a>
            );
          })}
        </div>

        {/* SECTION 1: TYPOGRAPHY — FLUID TYPE SCALE EDITOR */}
        <section id="typography" className="scroll-mt-36 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Type className="w-6 h-6" /> 1. Fluid Typography System
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Every text size uses <code className="text-purple-400 font-mono">clamp()</code> for fluid scaling. Edit <strong>Mobile</strong>, <strong>Tablet</strong>, and <strong>Desktop</strong> values — changes apply live to the entire site.
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
             DEDICATED FLUID TYPE STUDIO CONTROL PANEL
             ═══════════════════════════════════════════════════════════════════ */}
          {(() => {
            const studioClamp = computeFluidClamp(studioMinFs, studioMaxFs, studioMinVw, studioMaxVw);
            const currentComputedPx = (() => {
              if (liveWinW <= studioMinVw) return studioMinFs;
              if (liveWinW >= studioMaxVw) return studioMaxFs;
              const ratio = (liveWinW - studioMinVw) / (studioMaxVw - studioMinVw);
              return Math.round((studioMinFs + ratio * (studioMaxFs - studioMinFs)) * 10) / 10;
            })();

            const tiersList = ["6xl", "5xl", "4xl", "3xl", "2xl", "xl", "base", "sm", "xs"];

            const handleCopyStudioFormula = () => {
              navigator.clipboard.writeText(`font-size: ${studioClamp.clampStr} !important;`);
              setCopiedStudioFormula(true);
              setTimeout(() => setCopiedStudioFormula(false), 2000);
            };

            return (
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-black/40 to-black/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                {/* Glow Backdrop */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl" />

                {/* Studio Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      <Sliders className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                        Fluid Type Studio Controls
                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
                          .text-{studioSelectedTier}
                        </span>
                      </h3>
                      <p className="text-xs text-white/50">
                        Linear slope math engine for exact 40px @ 1025px $\rightarrow$ 56px @ 1550px continuous scaling.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyStudioFormula}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 border self-start sm:self-auto ${copiedStudioFormula
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                      : "bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      }`}
                  >
                    {copiedStudioFormula ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStudioFormula ? "Formula Copied!" : "Copy CSS clamp()"}</span>
                  </button>
                </div>

                {/* Target Element Selector */}
                <div className="space-y-2 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-purple-400" /> Target Typography Element / Utility Class:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {tiersList.map((t) => (
                      <button
                        key={t}
                        onClick={() => setStudioSelectedTier(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all ${studioSelectedTier === t
                          ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-300 scale-105"
                          : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                          }`}
                      >
                        .text-{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {/* 1. Min Font Size */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        1. Min Font Size:
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          value={studioMinFs}
                          onChange={(e) => setStudioMinFs(Number(e.target.value))}
                          className="w-12 bg-transparent text-right text-emerald-300 font-bold outline-none"
                        />
                        <span className="text-white/40">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="128"
                      value={studioMinFs}
                      onChange={(e) => setStudioMinFs(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                    />
                    <p className="text-[10px] text-white/40">
                      Smallest font size rendered at or below Min Viewport Width ({studioMinVw}px).
                    </p>
                  </div>

                  {/* 2. Max Font Size */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-400 flex items-center gap-1">
                        2. Max Font Size:
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          value={studioMaxFs}
                          onChange={(e) => setStudioMaxFs(Number(e.target.value))}
                          className="w-12 bg-transparent text-right text-purple-300 font-bold outline-none"
                        />
                        <span className="text-white/40">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="128"
                      value={studioMaxFs}
                      onChange={(e) => setStudioMaxFs(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-purple-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.9)]"
                    />
                    <p className="text-[10px] text-white/40">
                      Largest font size rendered at or above Max Viewport Width ({studioMaxVw}px).
                    </p>
                  </div>

                  {/* 3. Min Viewport Width */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        3. Min Viewport Width:
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          value={studioMinVw}
                          onChange={(e) => setStudioMinVw(Number(e.target.value))}
                          className="w-16 bg-transparent text-right text-amber-300 font-bold outline-none"
                        />
                        <span className="text-white/40">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="320"
                      max="1920"
                      step="5"
                      value={studioMinVw}
                      onChange={(e) => setStudioMinVw(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-amber-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                    />
                    <p className="text-[10px] text-white/40">
                      Screen width at which text hits Min Font Size ({studioMinFs}px).
                    </p>
                  </div>

                  {/* 4. Max Viewport Width */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        4. Max Viewport Width:
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          value={studioMaxVw}
                          onChange={(e) => setStudioMaxVw(Number(e.target.value))}
                          className="w-16 bg-transparent text-right text-cyan-300 font-bold outline-none"
                        />
                        <span className="text-white/40">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="320"
                      max="1920"
                      step="5"
                      value={studioMaxVw}
                      onChange={(e) => setStudioMaxVw(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                    />
                    <p className="text-[10px] text-white/40">
                      Screen width at which text hits Max Font Size ({studioMaxFs}px).
                    </p>
                  </div>
                </div>

                {/* 5. Below Min Viewport Behavior Toggle */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      5. Below {studioMinVw}px Boundary Behavior:
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Choose whether font stays locked at {studioMinFs}px below {studioMinVw}px or chains into Tablet/Mobile ranges.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                    <button
                      onClick={() => setStudioMode("locked")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${studioMode === "locked"
                        ? "bg-purple-500 text-white shadow-md"
                        : "text-white/50 hover:text-white"
                        }`}
                    >
                      🔒 Lock at {studioMinFs}px
                    </button>
                    <button
                      onClick={() => setStudioMode("chained")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${studioMode === "chained"
                        ? "bg-purple-500 text-white shadow-md"
                        : "text-white/50 hover:text-white"
                        }`}
                    >
                      🔗 Chain to Tablet ({studioMinFs}px $\rightarrow$ 25px)
                    </button>
                  </div>
                </div>

                {/* Live Formula & Computed Viewport Readout Card */}
                <div className="rounded-2xl bg-black/60 border border-purple-500/30 p-5 space-y-4 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-xs font-mono font-black uppercase tracking-wider text-purple-300">
                        Generated CSS Formula & Live Inspection:
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-white/40">Live Viewport:</span>
                      <span className="font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                        {liveWinW}px
                      </span>
                      <span className="text-white/40">Computed Size:</span>
                      <span className="font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                        {currentComputedPx}px
                      </span>
                    </div>
                  </div>

                  {/* Code snippet */}
                  <div className="overflow-x-auto rounded-xl bg-black/80 pt-3 pb-3 font-mono text-xs text-purple-200 border border-purple-500/20">
                    <code className="text-purple-400">font-size</code>:{" "}
                    <span className="text-white font-bold">{studioClamp.clampStr}</span> !important;
                  </div>

                  {/* Formula Math Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono text-white/60">
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <span className="block text-white/30 text-[9px] uppercase">Min Rem</span>
                      <span className="text-emerald-300 font-bold">{studioClamp.minRem.toFixed(4)}rem</span> ({studioMinFs}px)
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <span className="block text-white/30 text-[9px] uppercase">Max Rem</span>
                      <span className="text-purple-300 font-bold">{studioClamp.maxRem.toFixed(4)}rem</span> ({studioMaxFs}px)
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <span className="block text-white/30 text-[9px] uppercase">Slope (vw)</span>
                      <span className="text-cyan-300 font-bold">{studioClamp.slopeVw.toFixed(4)}vw</span>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <span className="block text-white/30 text-[9px] uppercase">Intercept (rem)</span>
                      <span className="text-amber-300 font-bold">{studioClamp.interceptRem.toFixed(4)}rem</span>
                    </div>
                  </div>

                  {/* Live Interactive Sample Node */}
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-2">
                      Live Sample Render (`.text-{studioSelectedTier}`):
                    </span>
                    <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6 flex items-center justify-center overflow-x-auto min-h-[120px]">
                      <div className={`text-${studioSelectedTier} font-black text-white uppercase tracking-tight text-center leading-none`}>
                        {studioSelectedTier.toUpperCase()} FLUID SCALING SAMPLE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Fluid Type Scale Editor */}
          {(() => {
            const FLUID_SCALE = [
              { key: "6xl", label: "text-6xl", cssProp: "--text-6xl", mobMin: "1.125", mobMax: "2.25", tabMin: "2.25", tabMax: "3.5", deskMin: "3.5", deskMax: "8.0", sample: "9XL HERO (NOW 6XL)", weight: "font-black", extra: "uppercase" },
              { key: "5xl", label: "text-5xl", cssProp: "--text-5xl", mobMin: "1.0625", mobMax: "2.0", tabMin: "2.0", tabMax: "3.0", deskMin: "3.0", deskMax: "6.0", sample: "8XL DISPLAY (NOW 5XL)", weight: "font-black", extra: "uppercase" },
              { key: "4xl", label: "text-4xl", cssProp: "--text-4xl", mobMin: "1.0", mobMax: "1.75", tabMin: "1.75", tabMax: "2.5", deskMin: "2.5", deskMax: "4.5", sample: "7TH HEAVEN (NOW 4XL)", weight: "font-black", extra: "uppercase" },
              { key: "3xl", label: "text-3xl", cssProp: "--text-3xl", mobMin: "0.875", mobMax: "1.0", tabMin: "1.0", tabMax: "1.25", deskMin: "1.25", deskMax: "1.75", sample: "VIP Backstage Package", weight: "font-extrabold", extra: "" },
              { key: "2xl", label: "text-2xl", cssProp: "--text-2xl", mobMin: "0.8125", mobMax: "0.9375", tabMin: "0.9375", tabMax: "1.125", deskMin: "1.125", deskMax: "1.5", sample: "Rocking Chicago & Nationwide Since 1985", weight: "font-bold", extra: "" },
              { key: "xl", label: "text-xl", cssProp: "--text-xl", mobMin: "0.8125", mobMax: "0.875", tabMin: "0.875", tabMax: "1.0", deskMin: "1.0", deskMax: "1.25", sample: "Join over 50,000 fans across 100+ shows every single year (Unified XL).", weight: "font-semibold", extra: "" },
              { key: "base", label: "text-base", cssProp: "--text-base", mobMin: "0.75", mobMax: "0.8125", tabMin: "0.8125", tabMax: "0.875", deskMin: "0.875", deskMax: "1.0", sample: "7th Heaven has processed over 1.5 million ticket requests. Book early for best availability.", weight: "font-normal", extra: "" },
              { key: "sm", label: "text-sm", cssProp: "--text-sm", mobMin: "0.6875", mobMax: "0.75", tabMin: "0.75", tabMax: "0.8125", deskMin: "0.8125", deskMax: "0.875", sample: "Doors open at 6:30 PM. All ages event subject to venue policies. Tickets non-refundable.", weight: "font-normal", extra: "" },
              { key: "xs", label: "text-xs", cssProp: "--text-xs", mobMin: "0.625", mobMax: "0.6875", tabMin: "0.6875", tabMax: "0.75", deskMin: "0.75", deskMax: "0.75", sample: "LAST UPDATED 2 HOURS AGO • VERIFIED BY BAND MANAGEMENT", weight: "font-bold", extra: "uppercase tracking-wider" },
            ];

            const remToPx = (rem: string | number) => Math.round(parseFloat(String(rem)) * 16);

            // Calculate fluid clamp formula for a specific breakpoint segment
            const calcSegmentClamp = (w1: number, fs1Rem: number, w2: number, fs2Rem: number) => {
              if (fs1Rem === fs2Rem) return `${fs1Rem}rem`;
              const slopeVw = (1600 * (fs2Rem - fs1Rem)) / (w2 - w1);
              const interceptRem = fs1Rem - (slopeVw * (w1 / 1600));
              const min = Math.min(fs1Rem, fs2Rem);
              const max = Math.max(fs1Rem, fs2Rem);
              return `clamp(${min}rem, ${interceptRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${max}rem)`;
            };

            // Rebuild <style> tag with piecewise continuous fluid clamp per breakpoint segment
            const rebuildStyleTag = () => {
              const section = document.getElementById("typography");
              if (!section) return;

              const mobRules: string[] = [];
              const tabRules: string[] = [];
              const deskRules: string[] = [];
              const mobVars: string[] = [];
              const tabVars: string[] = [];
              const deskVars: string[] = [];

              FLUID_SCALE.forEach((tier) => {
                const row = section.querySelector(`[data-tier="${tier.key}"]`);
                if (!row) return;
                const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
                const mMin = parseFloat(inputs[0]?.value || tier.mobMin);
                const mMax = parseFloat(inputs[1]?.value || tier.mobMax);
                const tMin = mMax; // Strict segment continuity at 678px
                const tMax = parseFloat(inputs[3]?.value || tier.tabMax);
                const dMin = tMax; // Strict segment continuity at 1025px
                const dMax = parseFloat(inputs[5]?.value || tier.deskMax);

                const mClamp = calcSegmentClamp(320, mMin, 678, mMax);
                const tClamp = calcSegmentClamp(678, tMin, 1024, tMax);
                const dClamp = calcSegmentClamp(1025, dMin, 1560, dMax);

                mobRules.push(`.text-${tier.key}, [data-fluid-sample="${tier.key}"] { font-size: ${mClamp} !important; }`);
                tabRules.push(`.text-${tier.key}, [data-fluid-sample="${tier.key}"] { font-size: ${tClamp} !important; }`);
                deskRules.push(`.text-${tier.key}, [data-fluid-sample="${tier.key}"] { font-size: ${dClamp} !important; }`);

                mobVars.push(`  ${tier.cssProp}: ${mClamp} !important;`);
                tabVars.push(`  ${tier.cssProp}: ${tClamp} !important;`);
                deskVars.push(`  ${tier.cssProp}: ${dClamp} !important;`);
              });

              const css = `
/* Style Guide — Continuous Segmented Fluid Typography */
@media (max-width: 677px) {
  :root, html, body {
${mobVars.join("\n")}
  }
${mobRules.join("\n")}
}
@media (min-width: 678px) and (max-width: 1024px) {
  :root, html, body {
${tabVars.join("\n")}
  }
${tabRules.join("\n")}
}
@media (min-width: 1025px) {
  :root, html, body {
${deskVars.join("\n")}
  }
${deskRules.join("\n")}
}`;

              let tag = document.getElementById("fluid-type-overrides") as HTMLStyleElement;
              if (!tag) {
                tag = document.createElement("style");
                tag.id = "fluid-type-overrides";
                document.head.appendChild(tag);
              }
              tag.textContent = css;
            };

            if (typeof window !== "undefined") {
              (window as any).__rebuildStyleTag = rebuildStyleTag;
              setTimeout(rebuildStyleTag, 50);
            }

            return (
              <div className="space-y-4">
                {/* Column headers */}
                <div className="hidden xl:grid grid-cols-[90px_1fr_220px_220px_220px] gap-4 px-4 pb-2 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Utility</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Preview</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">📱 Mobile Range</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">📟 Tablet Range</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">🖥 Desktop Range</span>
                </div>

                {FLUID_SCALE.map((tier) => {
                  const isHero = tier.key === "9xl" || tier.key === "8xl" || tier.key === "7xl" || tier.key === "6xl";
                  const maxLimit = isHero ? 8 : 4; // 128px max for hero display, 64px max for standard text

                  return (
                    <div key={tier.key} data-tier={tier.key} className="group rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-colors p-4">
                      <div className="grid grid-cols-1 xl:grid-cols-[90px_1fr_220px_220px_220px] gap-4 items-center">
                        {/* Label */}
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                            {tier.label}
                          </code>
                        </div>

                        {/* Live Preview */}
                        <div data-fluid-sample={tier.key} className={`text-${tier.key} ${tier.weight} ${tier.extra} text-white leading-none tracking-tight min-w-0 overflow-visible py-1`}>
                          {tier.sample}
                        </div>

                        {/* Mobile Pill (Green): Left = Min (320px), Right = Max (678px) */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-400 px-1">
                            <span data-val="mMin">{remToPx(tier.mobMin)}px</span>
                            <span data-val="mMax">{remToPx(tier.mobMax)}px</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/[0.02] border border-emerald-500/40 rounded-full p-1.5 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                            <div className="w-1/2 flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                              <input
                                type="range" step="0.01" min="0.625" max={maxLimit} defaultValue={tier.mobMin}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                                onInput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  const row = (e.target as HTMLElement).closest("[data-tier]") as HTMLElement;
                                  const labelMMin = row?.querySelector("[data-val='mMin']");
                                  if (labelMMin) labelMMin.textContent = `${remToPx(val)}px`;
                                  rebuildStyleTag();
                                }}
                              />
                            </div>
                            <div className="w-1/2 flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                              <input
                                type="range" step="0.01" min="0.625" max={maxLimit} defaultValue={tier.mobMax}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                                onInput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  const row = (e.target as HTMLElement).closest("[data-tier]") as HTMLElement;
                                  if (!row) return;
                                  const labelMMax = row.querySelector("[data-val='mMax']");
                                  if (labelMMax) labelMMax.textContent = `${remToPx(val)}px`;

                                  // Sync 678px boundary: Mobile Right (mMax) <-> Tablet Left (tMin)
                                  const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
                                  if (inputs[2] && inputs[2].value !== val) {
                                    inputs[2].value = val;
                                    const labelTMin = row.querySelector("[data-val='tMin']");
                                    if (labelTMin) labelTMin.textContent = `${remToPx(val)}px`;
                                  }

                                  rebuildStyleTag();
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400/60 px-1 pt-0.5">
                            <span>320px</span>
                            <span>678px</span>
                          </div>
                        </div>

                        {/* Tablet Pill (Amber): Left = Min (678px), Right = Max (1025px) */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-400 px-1">
                            <span data-val="tMin">{remToPx(tier.tabMin)}px</span>
                            <span data-val="tMax">{remToPx(tier.tabMax)}px</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/[0.02] border border-amber-500/40 rounded-full p-1.5 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                            <div className="w-1/2 flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                              <input
                                type="range" step="0.01" min="0.625" max={maxLimit} defaultValue={tier.tabMin}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-amber-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                                onInput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  const row = (e.target as HTMLElement).closest("[data-tier]") as HTMLElement;
                                  if (!row) return;
                                  const labelTMin = row.querySelector("[data-val='tMin']");
                                  if (labelTMin) labelTMin.textContent = `${remToPx(val)}px`;

                                  // Sync 678px boundary: Tablet Left (tMin) <-> Mobile Right (mMax)
                                  const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
                                  if (inputs[1] && inputs[1].value !== val) {
                                    inputs[1].value = val;
                                    const labelMMax = row.querySelector("[data-val='mMax']");
                                    if (labelMMax) labelMMax.textContent = `${remToPx(val)}px`;
                                  }

                                  rebuildStyleTag();
                                }}
                              />
                            </div>
                            <div className="w-1/2 flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                              <input
                                type="range" step="0.01" min="0.625" max={maxLimit} defaultValue={tier.tabMax}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-amber-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                                onInput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  const row = (e.target as HTMLElement).closest("[data-tier]") as HTMLElement;
                                  if (!row) return;
                                  const labelTMax = row.querySelector("[data-val='tMax']");
                                  if (labelTMax) labelTMax.textContent = `${remToPx(val)}px`;

                                  // Sync 1025px boundary: Tablet Right (tMax) <-> Desktop Left (dMin)
                                  const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
                                  if (inputs[4] && inputs[4].value !== val) {
                                    inputs[4].value = val;
                                    const labelDMin = row.querySelector("[data-val='dMin']");
                                    if (labelDMin) labelDMin.textContent = `${remToPx(val)}px`;
                                  }

                                  rebuildStyleTag();
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400/60 px-1 pt-0.5">
                            <span>678px</span>
                            <span>1025px</span>
                          </div>
                        </div>

                        {/* Desktop Pill (Purple): Left = Min (1025px), Right = Max (1560px) */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-400 px-1">
                            <span data-val="dMin">{remToPx(tier.deskMin)}px</span>
                            <span data-val="dMax">{remToPx(tier.deskMax)}px</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/[0.02] rounded-full p-1.5 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                            <div className="w-1/2 flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                              <input
                                type="range" step="0.01" min="0.625" max={maxLimit} defaultValue={tier.deskMin}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-purple-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.9)]"
                                onInput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  const row = (e.target as HTMLElement).closest("[data-tier]") as HTMLElement;
                                  if (!row) return;
                                  const labelDMin = row.querySelector("[data-val='dMin']");
                                  if (labelDMin) labelDMin.textContent = `${remToPx(val)}px`;

                                  // Sync 1025px boundary: Desktop Left (dMin) <-> Tablet Right (tMax)
                                  const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
                                  if (inputs[3] && inputs[3].value !== val) {
                                    inputs[3].value = val;
                                    const labelTMax = row.querySelector("[data-val='tMax']");
                                    if (labelTMax) labelTMax.textContent = `${remToPx(val)}px`;
                                  }

                                  rebuildStyleTag();
                                }}
                              />
                            </div>
                            <div className="w-1/2 flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                              <input
                                type="range" step="0.01" min="0.625" max={maxLimit} defaultValue={tier.deskMax}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-purple-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.9)]"
                                onInput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  const row = (e.target as HTMLElement).closest("[data-tier]") as HTMLElement;
                                  const labelDMax = row?.querySelector("[data-val='dMax']");
                                  if (labelDMax) labelDMax.textContent = `${remToPx(val)}px`;
                                  rebuildStyleTag();
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-400/60 px-1 pt-0.5">
                            <span>1025px</span>
                            <span>1560px</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-white/40">
                      💡 Changes update in real time. Click Save to copy global CSS.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const section = document.getElementById("typography");
                        if (!section) return;

                        const mobRules: string[] = [];
                        const tabRules: string[] = [];
                        const deskRules: string[] = [];

                        FLUID_SCALE.forEach((tier) => {
                          const row = section.querySelector(`[data-tier="${tier.key}"]`);
                          if (!row) return;
                          const inputs = row.querySelectorAll<HTMLInputElement>("input[type='range']");
                          const mMin = parseFloat(inputs[0]?.value || tier.mobMin);
                          const mMax = parseFloat(inputs[1]?.value || tier.mobMax);
                          const tMin = mMax;
                          const tMax = parseFloat(inputs[3]?.value || tier.tabMax);
                          const dMin = tMax;
                          const dMax = parseFloat(inputs[5]?.value || tier.deskMax);

                          const mClamp = calcSegmentClamp(320, mMin, 678, mMax);
                          const tClamp = calcSegmentClamp(678, tMin, 1024, tMax);
                          const dClamp = calcSegmentClamp(1025, dMin, 1560, dMax);

                          mobRules.push(`  :root { ${tier.cssProp}: ${mClamp}; }\n  .${tier.label} { font-size: ${mClamp} !important; }`);
                          tabRules.push(`  :root { ${tier.cssProp}: ${tClamp}; }\n  .${tier.label} { font-size: ${tClamp} !important; }`);
                          deskRules.push(`  :root { ${tier.cssProp}: ${dClamp}; }\n  .${tier.label} { font-size: ${dClamp} !important; }`);
                        });

                        const fullCss = `/* =========================================================================
   7th Heaven — Piecewise Continuous Fluid Typography (Generated Output)
   ========================================================================= */

/* Mobile Range (320px -> 678px) */
@media (max-width: 677px) {
${mobRules.join("\n")}
}

/* Tablet Range (678px -> 1024px) */
@media (min-width: 678px) and (max-width: 1024px) {
${tabRules.join("\n")}
}

/* Desktop Range (1025px -> 1560px+) */
@media (min-width: 1025px) {
${deskRules.join("\n")}
}`;

                        setGeneratedCssExport(fullCss);
                        navigator.clipboard.writeText(fullCss);
                        setCssCopied(true);
                        setShowCssModal(true);
                        setTimeout(() => setCssCopied(false), 3000);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] flex items-center gap-2"
                    >
                      <span>💾 Save & Copy Global CSS</span>
                      {cssCopied && <span className="text-emerald-300 animate-pulse">✓ Copied!</span>}
                    </button>

                    <button
                      onClick={() => {
                        const tag = document.getElementById("fluid-type-overrides");
                        if (tag) tag.remove();
                        const section = document.getElementById("typography");
                        if (section) {
                          section.querySelectorAll<HTMLInputElement>("input[type='range']").forEach((input) => {
                            input.value = input.defaultValue;
                          });
                          FLUID_SCALE.forEach((tier) => {
                            const row = section.querySelector(`[data-tier="${tier.key}"]`);
                            if (row) {
                              const mm = row.querySelector("[data-val='mMin']");
                              const mx = row.querySelector("[data-val='mMax']");
                              const tm = row.querySelector("[data-val='tMin']");
                              const tx = row.querySelector("[data-val='tMax']");
                              const dm = row.querySelector("[data-val='dMin']");
                              const dx = row.querySelector("[data-val='dMax']");
                              if (mm) mm.textContent = `${remToPx(tier.mobMin)}px`;
                              if (mx) mx.textContent = `${remToPx(tier.mobMax)}px`;
                              if (tm) tm.textContent = `${remToPx(tier.tabMin)}px`;
                              if (tx) tx.textContent = `${remToPx(tier.tabMax)}px`;
                              if (dm) dm.textContent = `${remToPx(tier.deskMin)}px`;
                              if (dx) dx.textContent = `${remToPx(tier.deskMax)}px`;
                            }
                          });
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                    >
                      ↺ Reset All to Defaults
                    </button>
                  </div>
                </div>

                {/* CSS Export Modal Drawer */}
                {showCssModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-3xl bg-[#0d0914] border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                          <h3 className="text-lg font-black uppercase tracking-wider text-white">
                            Global CSS Saved to Clipboard
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowCssModal(false)}
                          className="text-white/40 hover:text-white text-xl font-bold p-1 transition"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-xs text-white/60">
                        The CSS below has been copied to your clipboard. Paste this block directly into <code className="text-purple-400 font-mono">src/app/globals.css</code> to make your fluid typography settings permanent globally across the entire site.
                      </p>

                      <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-[11px] max-h-80 overflow-y-auto leading-relaxed select-all">
                        {generatedCssExport}
                      </pre>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCssExport);
                            setCssCopied(true);
                            setTimeout(() => setCssCopied(false), 2000);
                          }}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          📋 Copy Again
                        </button>
                        <button
                          onClick={() => setShowCssModal(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        {/* SECTION 2: COLORS */}
        <section id="colors" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Palette className="w-6 h-6" /> 2. Full Color Palette & Swatches
              </h2>
              <p className="text-white/60 text-xs mt-1">
                Standard CSS custom variables and live theme color tokens across background, text, accent, status, and borders.
              </p>
            </div>
          </div>

          {/* White Standard Callout */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-black text-purple-400uppercase tracking-widest block mb-1">
                Standardized White Palette Rules
              </span>
              <h3 className="text-lg font-bold text-white">The Two White Palette: Solid White & 0.5 White</h3>
              <p className="text-xs text-white/60 mt-1">
                Our site design strictly uses only two shades of white: <strong className="text-white">Solid White (#ffffff / 100%)</strong> for primary text and titles, and <strong className="text-white/70">0.5 White (rgba(255, 255, 255, 0.5) / 50%)</strong> for secondary text, labels, and muted metadata.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-white text-black font-black text-xs shadow-lg">
                Solid White (#ffffff)
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/50 text-black font-black text-xs shadow-lg border border-white/20">
                0.5 White (50%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(tokens.colors || {}).map(([varName, colorVal]) => (
              <div
                key={varName}
                onClick={() => handleCopyToken(varName, colorVal)}
                className="group relative p-3 rounded-2xl bg-[#0d091a] border border-white/10 hover:border-purple-500/40 transition cursor-pointer flex flex-col justify-between h-40"
              >
                {/* Swatch Box with Dark Checkerboard Pattern */}
                <div
                  className="w-full h-20 rounded-xl border border-white/15 overflow-hidden relative flex items-center justify-center transition group-hover:scale-[1.02]"
                  style={{
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.1) 1px, transparent 0)`,
                    backgroundSize: "8px 8px",
                    backgroundColor: "#05030a",
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold"
                    style={{ backgroundColor: colorVal.startsWith("var(") ? "#9333ea" : colorVal }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-bold bg-black/80 px-2 py-1 rounded text-white flex items-center gap-1">
                      {copiedToken === varName ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedToken === varName ? "Copied!" : "Copy"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white/90 truncate" title={varName}>
                    {varName.replace("--color-", "").replace("--chat-", "")}
                  </div>
                  <div className="text-[10px] font-mono text-white/50 truncate">
                    {colorVal}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inline Theme Token Editor */}
          <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-4">
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Quick Theme Token Overrides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-white/60 font-bold mb-1">Accent Glow Color</label>
                <input
                  type="text"
                  value={tokens.colors["--color-accent-glow"] || "rgba(147, 51, 234, 0.4)"}
                  onChange={(e) => updateToken("colors", "--color-accent-glow", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-white/60 font-bold mb-1">Border Main Color</label>
                <input
                  type="text"
                  value={tokens.colors["--color-border-main"] || "rgba(255, 255, 255, 0.08)"}
                  onChange={(e) => updateToken("colors", "--color-border-main", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-white/60 font-bold mb-1">Chat Glow Color</label>
                <input
                  type="text"
                  value={tokens.colors["--chat-glow-color"] || "rgba(168, 85, 247, 0.35)"}
                  onChange={(e) => updateToken("colors", "--chat-glow-color", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: BUTTONS */}
        <section id="buttons" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <MousePointer className="w-6 h-6" /> 3. Button Variants & States
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Every button variant (Primary Glow, Cyan Neon, Secondary Glass, Ghost, Danger, Outline) across Default, Hover, Focused, Disabled, and Loading states.
            </p>
          </div>

          <div className="space-y-6">
            {/* Primary Purple Glow */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Primary Glow Purple</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] transition">
                  Default
                </button>
                <button className="px-5 py-2.5 rounded-lg bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.6)] ring-2 ring-purple-400 transition">
                  Hover / Focus State
                </button>
                <button disabled className="px-5 py-2.5 rounded-lg bg-purple-600/30 text-white/40 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed border border-white/5">
                  Disabled
                </button>
                <button disabled className="px-5 py-2.5 rounded-lg bg-purple-600/50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-wait">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                </button>
              </div>
            </div>

            {/* Cyan Neon */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-purple-400uppercase tracking-wider">Cyan Neon Action</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.4)] transition">
                  Default
                </button>
                <button className="px-5 py-2.5 rounded-lg bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(34,211,238,0.7)] ring-2 ring-cyan-200 transition">
                  Hover / Active
                </button>
                <button disabled className="px-5 py-2.5 rounded-lg bg-cyan-400/20 text-cyan-400/40 font-black text-xs uppercase tracking-wider cursor-not-allowed border border-cyan-500/10">
                  Disabled
                </button>
              </div>
            </div>

            {/* Secondary Glass */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider">Secondary Glass</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition">
                  Glass Default
                </button>
                <button className="px-5 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white font-bold text-xs ring-2 ring-white/20">
                  Glass Hover
                </button>
                <button disabled className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/5 text-white/30 font-bold text-xs cursor-not-allowed">
                  Glass Disabled
                </button>
              </div>
            </div>

            {/* Ghost & Danger */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Ghost & Danger Buttons</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition">
                  Ghost Button
                </button>
                <button className="px-5 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-extrabold text-xs uppercase tracking-wider transition">
                  Danger Action
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FORM ELEMENTS */}
        <section id="form-elements" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Layout className="w-6 h-6" /> 4. Form Elements & Real Controls
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Text inputs, search inputs, textareas, checkboxes, radios, switches, and select dropdowns across Default, Focused, Filled, Error, and Disabled states.
            </p>
          </div>

          {/* Form Input Studio Controls Component */}
          <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" /> Integrated Form Input Style Studio
              </h3>
              <span className="text-[11px] font-mono text-white/40">Real-time global control</span>
            </div>
            <InputStyleEditor />
          </div>

          {/* Interactive Form Controls grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Text Inputs */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-purple-400uppercase tracking-wider">Text Inputs</h3>

              {/* Default */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Default State</label>
                <div className="input-glow-border rounded-lg">
                  <input
                    type="text"
                    placeholder="Enter full name..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/40 text-xs font-medium outline-none transition"
                  />
                </div>
              </div>

              {/* Focused / Active */}
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1">Focused / Active State</label>
                <div className="input-glow-border rounded-lg active">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-none text-white/80 text-xs font-medium outline-none transition"
                  />
                </div>
              </div>

              {/* Error */}
              <div>
                <label className="block text-xs font-bold text-red-400 mb-1">Error State</label>
                <input
                  type="text"
                  value="invalid_email_format"
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-xs outline-none focus:ring-1 focus:ring-red-400/50 transition"
                />
                <span className="text-[10px] text-red-400 mt-1 block">Please enter a valid email address.</span>
              </div>

              {/* Disabled */}
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">Disabled State</label>
                <input
                  type="text"
                  value="Read-only System ID: 7H-ADMIN-99"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/5 text-white/30 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            {/* Search & Textarea */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Search & Textarea Controls</h3>

              {/* Search input with icon */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Search Bar (Global Reusable Component)</label>
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="Search shows, venues, tours, or keywords..."
                  containerClassName="w-full"
                />
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Textarea Input</label>
                <div className="input-glow-border w-full rounded-lg">
                  <textarea
                    rows={4}
                    value={textareaInput}
                    onChange={(e) => setTextareaInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border-none text-white/80 placeholder-white/40 text-xs font-medium outline-none focus:ring-0 transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PIN / OTP Digit Input */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5 md:col-span-2">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">PIN / OTP Digit Input</h3>

              {/* Default State */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-2">Default State</label>
                <div className="flex items-center gap-1.5 no-glow">
                  {[
                    { id: "sg-def-slot-0", slotIndex: 0 },
                    { id: "sg-def-slot-1", slotIndex: 1 },
                    { id: "sg-def-slot-2", slotIndex: 2 },
                    { id: "sg-def-slot-3", slotIndex: 3 },
                    { id: "sg-def-slot-4", slotIndex: 4 },
                    { id: "sg-def-slot-5", slotIndex: 5 },
                  ].map(({ id, slotIndex: i }) => {
                    const digit = pinDefaultDigits[i];
                    return (
                      <div key={id} className="input-glow-border !w-11 !h-14 rounded-xl shrink-0 transition-all duration-200">
                        <input
                          aria-label={`Default PIN digit ${i + 1}`}
                          ref={el => { pinDefaultRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          placeholder="·"
                          style={{ padding: 0 }}
                          onFocus={() => setPinDefaultFocusedIndex(i)}
                          onBlur={() => setPinDefaultFocusedIndex(null)}
                          onChange={e => handlePinDefaultDigit(i, e.target.value)}
                          onKeyDown={e => handlePinDefaultKeyDown(i, e)}
                          className={`w-full h-full text-center text-xl font-black rounded-xl border-2 bg-black/70 !p-0 outline-none transition-all duration-200 tabular-nums placeholder-white/20
                            ${pinDefaultFocusedIndex === i
                              ? 'border-white/40 text-white'
                              : digit
                                ? 'border-white/30 text-white/70'
                                : 'border-white/20 text-white/40 hover:border-white/30'
                            }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive / Focused State */}
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-2">Interactive (Focus a box)</label>
                <div className="flex items-center gap-1.5 no-glow">
                  {[
                    { id: "sg-foc-slot-0", slotIndex: 0 },
                    { id: "sg-foc-slot-1", slotIndex: 1 },
                    { id: "sg-foc-slot-2", slotIndex: 2 },
                    { id: "sg-foc-slot-3", slotIndex: 3 },
                    { id: "sg-foc-slot-4", slotIndex: 4 },
                    { id: "sg-foc-slot-5", slotIndex: 5 },
                  ].map(({ id, slotIndex: i }) => {
                    const digit = pinDigits[i];
                    return (
                      <div key={id} className="input-glow-border !w-11 !h-14 rounded-xl shrink-0 transition-all duration-200">
                        <input
                          aria-label={`PIN digit ${i + 1}`}
                          ref={el => { pinRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          style={{ padding: 0 }}
                          onFocus={() => setPinFocusedIndex(i)}
                          onBlur={() => setPinFocusedIndex(null)}
                          onChange={e => handlePinDigit(i, e.target.value)}
                          onKeyDown={e => handlePinKeyDown(i, e)}
                          className={`w-full h-full text-center text-xl font-black rounded-xl border-2 bg-black/70 !p-0 outline-none transition-all duration-200 tabular-nums
                            ${pinFocusedIndex === i
                              ? 'border-purple-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.95)] bg-purple-950/80 scale-[1.08] z-10 relative'
                              : digit
                                ? 'border-purple-500/80 text-purple-300 shadow-[0_0_14px_rgba(147,51,234,0.4)]'
                                : 'border-white/20 text-white/40 hover:border-white/40'
                            }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filled State */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-2">Filled State</label>
                <div className="flex items-center gap-1.5 no-glow">
                  {[
                    { id: "sg-filled-slot-0", char: "7" },
                    { id: "sg-filled-slot-1", char: "H" },
                    { id: "sg-filled-slot-2", char: "C" },
                    { id: "sg-filled-slot-3", char: "R" },
                    { id: "sg-filled-slot-4", char: "E" },
                    { id: "sg-filled-slot-5", char: "W" },
                  ].map(({ id, char: d }, i) => (
                    <div key={id} className="input-glow-border !w-11 !h-14 rounded-xl shrink-0">
                      <input
                        aria-label={`Filled PIN digit ${i + 1}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        readOnly
                        style={{ padding: 0 }}
                        className="w-full h-full text-center text-xl font-black rounded-xl border-2 bg-black/70 !p-0 outline-none border-purple-500/80 text-purple-300 shadow-[0_0_14px_rgba(147,51,234,0.4)] cursor-default"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error State */}
              <div>
                <label className="block text-xs font-bold text-red-400 mb-2">Error State</label>
                <div className="flex items-center gap-1.5 no-glow">
                  {[
                    { id: "sg-err-slot-0", char: "X" },
                    { id: "sg-err-slot-1", char: "X" },
                    { id: "sg-err-slot-2", char: "X" },
                    { id: "sg-err-slot-3", char: "X" },
                    { id: "sg-err-slot-4", char: "X" },
                    { id: "sg-err-slot-5", char: "X" },
                  ].map(({ id, char: d }, i) => (
                    <div key={id} className="input-glow-border !w-11 !h-14 rounded-xl shrink-0">
                      <input
                        aria-label={`Error PIN digit ${i + 1}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        readOnly
                        style={{ padding: 0 }}
                        className="w-full h-full text-center text-xl font-black rounded-xl border-2 bg-red-950/50 !p-0 outline-none border-red-500/70 text-red-400 shadow-[0_0_14px_rgba(239,68,68,0.3)] cursor-default animate-[shake_0.3s_ease-in-out]"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-red-400 mt-1.5 block">Invalid PIN. Please try again.</span>
              </div>
            </div>

            {/* Verify Module Cards */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6 md:col-span-2">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Verify Module Cards (Crew · Planner · Cruise · Admin)</h3>
              <p className="text-[10px] text-white/40">Full glassmorphism verify card modules as used on <code className="text-purple-300 font-mono">/crew/verify</code>, <code className="text-purple-300 font-mono">/planner/verify</code>, <code className="text-purple-300 font-mono">/cruise/verify</code>, and <code className="text-purple-300 font-mono">/admin</code> (2FA).</p>

              <div className="overflow-x-auto -mx-5 px-5">
                <div className="grid grid-cols-4 gap-6 min-w-[900px]">

                  {/* ── Crew Verify Card ── */}
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-1">7th Heaven · Crew</p>
                    <h4 className="text-white font-black text-lg uppercase tracking-widest mb-1">Crew PIN Verification</h4>
                    <p className="text-white/30 text-[10px] mb-4">Enter your 6-digit PIN to verify crew access</p>
                    <div
                      className="rounded-3xl px-4 py-6 w-full no-glow"
                      style={{
                        background: "rgba(18, 10, 34, 0.85)",
                        backdropFilter: "blur(32px) saturate(180%)",
                        WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 24,
                        boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-center mb-4">Enter 6-Digit PIN</p>
                      <div className="flex items-center justify-center gap-1.5 mb-5 no-glow">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`crew-pin-${i}`} className="input-glow-border w-9 h-12 rounded-xl shrink-0">
                            <input aria-label={`Crew PIN digit ${i + 1}`} type="text" inputMode="numeric" maxLength={1} style={{ padding: 0 }}
                              className="w-full h-full text-center text-lg font-black rounded-xl border-2 bg-black/70 !p-0 outline-none border-white/20 text-white/40 hover:border-white/40 transition-all duration-200 tabular-nums" />
                          </div>
                        ))}
                      </div>
                      <button aria-label="Action button" disabled
                        style={{ opacity: 0.35, background: "rgba(168,85,247,0.15)", border: "none", color: "rgba(255,255,255,0.4)" }}
                        className="w-full py-3 font-black text-[10px] uppercase tracking-widest cursor-not-allowed rounded-lg mb-3"
                      >Access My Dashboard →</button>
                      <div className="mt-3 text-center">
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Didn&apos;t receive the code?</p>
                        <button aria-label="Action button" type="button" style={{ background: "none", border: "none", color: "#a855f7", fontSize: 10, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Resend Code</button>
                      </div>
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" }} />
                      <p className="text-center text-white/40 text-[10px] cursor-pointer hover:text-white/60 transition">← Back to Crew Page</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-white/25">7TH HEAVEN · CREW ACCESS</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                      </div>
                    </div>
                  </div>

                  {/* ── Planner Verify Card ── */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-white font-black text-lg uppercase tracking-widest mb-1">Planner Access PIN</h4>
                    <p className="text-white/45 text-[10px] mb-4">Enter your 6-digit PIN to access your Planner Dashboard</p>
                    <div
                      className="rounded-3xl px-4 py-6 w-full no-glow"
                      style={{
                        background: "rgba(18, 10, 34, 0.85)",
                        backdropFilter: "blur(32px) saturate(180%)",
                        WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 24,
                        boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-5 no-glow">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`planner-pin-${i}`} className="input-glow-border w-9 h-12 rounded-xl shrink-0">
                            <input aria-label={`Planner PIN digit ${i + 1}`} type="text" inputMode="numeric" maxLength={1} style={{ padding: 0 }}
                              className="w-full h-full text-center text-lg font-black rounded-xl border-2 bg-black/70 !p-0 outline-none border-white/20 text-white/40 hover:border-white/40 transition-all duration-200 tabular-nums" />
                          </div>
                        ))}
                      </div>
                      <button aria-label="Action button" disabled
                        style={{ opacity: 0.35, background: "rgba(168,85,247,0.15)", border: "none", color: "rgba(255,255,255,0.4)" }}
                        className="w-full py-3 font-black text-[10px] uppercase tracking-widest cursor-not-allowed rounded-lg mb-3"
                      >Access My Dashboard →</button>
                      <div className="space-y-1.5 mt-3 text-center">
                        <button aria-label="Action button" type="button" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 10, cursor: "pointer", textDecoration: "underline" }}>Resend PIN</button>
                        <button aria-label="Action button" type="button" style={{ display: "block", margin: "4px auto 0", background: "none", border: "none", color: "rgba(168,85,247,0.8)", fontSize: 10, cursor: "pointer", textDecoration: "underline" }}>Need a PIN sent to your email?</button>
                      </div>
                      <p className="flex items-center justify-center gap-1.5 mt-4" style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>
                        <svg className="w-3 h-3 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>PIN expires in 10 minutes · Only admins can create planner accounts</span>
                      </p>
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" }} />
                      <p className="text-center text-white/40 text-[10px] cursor-pointer hover:text-white/60 transition">← Back to Planner Page</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-white/25">7TH HEAVEN · PLANNER ACCESS</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                      </div>
                    </div>
                  </div>

                  {/* ── Cruise Verify Card ── */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-purple-400 bg-purple-500/15 border border-purple-500/30 rounded-full px-3 py-1">7th Heaven Caribbean Cruise</span>
                    </div>
                    <h4 className="text-white font-black text-lg uppercase tracking-widest mb-1">Check Your Email</h4>
                    <p className="text-white/45 text-[10px] mb-1">We sent a 6-digit verification code to</p>
                    <p className="text-purple-400 font-bold text-[10px] bg-purple-500/15 border border-purple-500/30 rounded-lg px-2.5 py-1 mb-4">your email address</p>
                    <div
                      className="rounded-3xl px-4 py-6 w-full no-glow"
                      style={{
                        background: "rgba(18, 10, 34, 0.85)",
                        backdropFilter: "blur(32px) saturate(180%)",
                        WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 24,
                        boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      {/* Progress bar */}
                      <div className="w-full h-0.5 bg-white/10 rounded-full mb-5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: "0%" }} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-5 no-glow">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`cruise-pin-${i}`} className="input-glow-border w-9 h-12 rounded-xl shrink-0">
                            <input aria-label={`Cruise PIN digit ${i + 1}`} type="text" inputMode="numeric" maxLength={1} style={{ padding: 0 }}
                              className="w-full h-full text-center text-lg font-black rounded-xl border-2 bg-black/70 !p-0 outline-none border-white/20 text-white/40 hover:border-white/40 transition-all duration-200 tabular-nums" />
                          </div>
                        ))}
                      </div>
                      <button aria-label="Action button" disabled
                        style={{ opacity: 0.35, background: "rgba(168,85,247,0.15)", border: "none", color: "rgba(255,255,255,0.4)" }}
                        className="w-full py-3 font-black text-[10px] uppercase tracking-widest cursor-not-allowed rounded-lg mb-3"
                      >Access My Dashboard →</button>
                      <div className="mt-3 text-center">
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Didn&apos;t receive the code?</p>
                        <button aria-label="Action button" type="button" style={{ background: "none", border: "none", color: "#a855f7", fontSize: 10, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Resend Code</button>
                      </div>
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" }} />
                      <p className="text-center text-white/40 text-[10px] cursor-pointer hover:text-white/60 transition">← Back to Cruise Page</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-white/25">7TH HEAVEN · CARIBBEAN CRUISE 2025</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                      </div>
                    </div>
                  </div>

                  {/* ── Admin 2FA Verify Card ── */}
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-1">7th Heaven · Admin</p>
                    <h4 className="text-white font-black text-lg uppercase tracking-widest mb-1">Admin 2FA Verification</h4>
                    <p className="text-white/30 text-[10px] mb-4">Enter your 6-digit PIN after login</p>
                    <div
                      className="rounded-3xl px-4 py-6 w-full no-glow"
                      style={{
                        background: "rgba(18, 10, 34, 0.85)",
                        backdropFilter: "blur(32px) saturate(180%)",
                        WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 24,
                        boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-center mb-4">Enter 6-Digit PIN</p>
                      <div className="flex items-center justify-center gap-1.5 mb-5 no-glow">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`admin-pin-${i}`} className="input-glow-border w-9 h-12 rounded-xl shrink-0">
                            <input aria-label={`Admin PIN digit ${i + 1}`} type="text" inputMode="numeric" maxLength={1} style={{ padding: 0 }}
                              className="w-full h-full text-center text-lg font-black rounded-xl border-2 bg-black/70 !p-0 outline-none border-white/20 text-white/40 hover:border-white/40 transition-all duration-200 tabular-nums" />
                          </div>
                        ))}
                      </div>
                      <button aria-label="Action button" disabled
                        style={{ opacity: 0.35, background: "rgba(168,85,247,0.15)", border: "none", color: "rgba(255,255,255,0.4)" }}
                        className="w-full py-3 font-black text-[10px] uppercase tracking-widest cursor-not-allowed rounded-lg mb-3"
                      >Access My Dashboard →</button>
                      <div className="mt-3 text-center">
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Didn&apos;t receive the code?</p>
                        <button aria-label="Action button" type="button" style={{ background: "none", border: "none", color: "#a855f7", fontSize: 10, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Resend Code</button>
                      </div>
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0" }} />
                      <p className="text-center text-white/40 text-[10px] cursor-pointer hover:text-white/60 transition">← Back to Login</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-white/25">7TH HEAVEN · ADMIN ACCESS</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Auth Modal Modules */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6 md:col-span-2">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Auth Modal Modules (Sign In · Sign Up)</h3>
              <p className="text-[10px] text-white/40">Full glassmorphism authentication modal cards as used in <code className="text-purple-300 font-mono">LoginModal.tsx</code> for fan and member login/signup.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Sign In Modal Card ── */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-1">7th Heaven · Auth</p>
                  <h4 className="text-white font-black text-lg uppercase tracking-widest mb-1">Sign In Modal</h4>
                  <p className="text-white/30 text-[10px] mb-4">Existing member login interface</p>
                  <div
                    className="rounded-3xl p-6 w-full no-glow relative"
                    style={{
                      background: "rgba(18, 10, 34, 0.85)",
                      backdropFilter: "blur(32px) saturate(180%)",
                      WebkitBackdropFilter: "blur(32px) saturate(180%)",
                      border: "1px solid rgba(168, 85, 247, 0.4)",
                      borderRadius: 24,
                      boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    {/* Close Button */}
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs cursor-pointer hover:bg-white/20 transition">✕</div>

                    {/* Logo Header */}
                    <div className="text-center mb-5">
                      <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                        <span className="text-[var(--color-accent)]">7</span>th <span className="text-[var(--color-accent)] not-italic">HEAVEN</span>
                      </h2>
                      <div className="text-xs uppercase tracking-[0.18em] font-black text-[var(--color-accent)] mt-1">
                        SIGN IN TO YOUR ACCOUNT
                      </div>
                    </div>

                    {/* Mode Tabs */}
                    <div className="relative grid grid-cols-2 p-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg mb-4 select-none">
                      <div className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#7c00ff] to-[#a855f7] rounded-lg shadow-[0_0_15px_rgba(124,0,255,0.6)]" />
                      <button className="relative z-10 py-2 text-xs font-black uppercase tracking-widest text-white text-center">Sign In</button>
                      <button className="relative z-10 py-2 text-xs font-black uppercase tracking-widest text-white/60 text-center">Sign Up</button>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="my-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-extrabold tracking-[0.15em] text-white/70 block text-left">ACCOUNT TYPE:</span>
                      </div>
                      <div className="grid grid-cols-5 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl gap-1 select-none">
                        {(['fan', 'crew', 'planner', 'cruise', 'admin'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSignInRole(r as any)}
                            className={`py-1.5 px-1 text-[10px] font-black uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer ${signInRole === (r as any)
                              ? "bg-gradient-to-r from-[#7c00ff] to-[#a855f7] text-white shadow-[0_0_15px_rgba(124,0,255,0.6)] border border-purple-400/40"
                              : "text-white/50 hover:text-white/90"
                              }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">EMAIL</label>
                        <div className="input-glow-border rounded-xl w-full">
                          <input type="email" readOnly value="your@email.com" className="w-full px-4 py-2.5 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">PASSWORD</label>
                        <div className="input-glow-border rounded-xl w-full">
                          <input type="password" readOnly value="••••••••" className="w-full px-4 py-2.5 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-purple-300 hover:underline cursor-pointer">Forgot Password?</span>
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <button disabled style={{ opacity: 0.9, background: "linear-gradient(135deg,#7c00ff,#a855f7)", border: "none", color: "#fff" }} className="w-full py-3 font-black text-xs uppercase tracking-widest rounded-lg mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      SIGN IN
                    </button>

                    {/* Divider & Socials */}
                    <div className="relative text-center my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                      <span className="relative bg-[#120a22] px-3 text-[9px] font-black uppercase tracking-widest text-white/40">OR CONTINUE WITH</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="py-2.5 bg-[#EA4335] hover:bg-[#d9382a] border border-red-500/30 rounded-lg text-xs font-bold text-white text-center transition flex items-center justify-center gap-1.5 shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761H12.545z" /></svg>
                        Google
                      </button>
                      <button className="py-2.5 bg-[#1877F2] hover:bg-[#166fe5] border border-blue-400/30 rounded-lg text-xs font-bold text-white text-center transition flex items-center justify-center gap-1.5 shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        Facebook
                      </button>
                      <button style={{ backgroundColor: "#000000" }} className="py-2.5 hover:bg-zinc-900 border-none rounded-lg text-xs font-bold text-white text-center transition flex items-center justify-center gap-1.5 shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.688.792-1.35 2.233-1.168 3.61 1.343.104 2.61-.69 3.454-1.598z" /></svg>
                        Apple
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Sign Up Modal Card ── */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-accent)] mb-1">7th Heaven · Auth</p>
                  <h4 className="text-white font-black text-lg uppercase tracking-widest mb-1">Sign Up Modal</h4>
                  <p className="text-white/30 text-[10px] mb-4">New fan registration interface</p>
                  <div
                    className="rounded-3xl p-6 w-full no-glow relative"
                    style={{
                      background: "rgba(18, 10, 34, 0.85)",
                      backdropFilter: "blur(32px) saturate(180%)",
                      WebkitBackdropFilter: "blur(32px) saturate(180%)",
                      border: "1px solid rgba(168, 85, 247, 0.4)",
                      borderRadius: 24,
                      boxShadow: "0 0 35px rgba(168, 85, 247, 0.25), 0 30px 90px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    {/* Close Button */}
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs cursor-pointer hover:bg-white/20 transition">✕</div>

                    {/* Logo Header */}
                    <div className="text-center mb-5">
                      <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                        <span className="text-[var(--color-accent)]">7</span>th <span className="text-[var(--color-accent)] not-italic">HEAVEN</span>
                      </h2>
                      <div className="text-xs uppercase tracking-[0.18em] font-black text-[var(--color-accent)] mt-1 flex items-center justify-center gap-1 flex-wrap">
                        SIGN UP FOR FREE <span className="text-xs font-black text-white bg-[var(--color-accent)] px-2 py-0.5 rounded-lg border border-[var(--color-accent)]/40">FAN</span> MEMBERSHIP
                      </div>
                    </div>

                    {/* Mode Tabs */}
                    <div className="relative grid grid-cols-2 p-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg mb-4 select-none">
                      <div className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#7c00ff] to-[#a855f7] rounded-lg shadow-[0_0_15px_rgba(124,0,255,0.6)] translate-x-full" />
                      <button className="relative z-10 py-2 text-xs font-black uppercase tracking-widest text-white/60 text-center">Sign In</button>
                      <button className="relative z-10 py-2 text-xs font-black uppercase tracking-widest text-white text-center">Sign Up</button>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="my-3 space-y-1.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-[0.15em] text-white/70 block text-left">ACCOUNT TYPE:</span>
                      <div className="grid grid-cols-2 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl gap-1 select-none">
                        {(['fan', 'planner'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSignUpRole(r)}
                            className={`py-1.5 px-2 text-[10px] font-black uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer ${signUpRole === r
                              ? "bg-gradient-to-r from-[#7c00ff] to-[#a855f7] text-white shadow-[0_0_15px_rgba(124,0,255,0.6)] border border-purple-400/40"
                              : "text-white/50 hover:text-white/90"
                              }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 mb-4">
                      {signUpRole === 'planner' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">FULL NAME</label>
                            <div className="input-glow-border rounded-xl w-full">
                              <input type="text" readOnly value="Your full name" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">COMPANY / VENUE NAME</label>
                            <div className="input-glow-border rounded-xl w-full">
                              <input type="text" readOnly value="e.g. Dream Events / Venue" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                            </div>
                          </div>
                        </div>
                      ) : signUpRole === 'cruise' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">FULL NAME</label>
                            <div className="input-glow-border rounded-xl w-full">
                              <input type="text" readOnly value="Your full name" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">STATEROOM # <span className="text-white/40 font-normal">(optional)</span></label>
                            <div className="input-glow-border rounded-xl w-full">
                              <input type="text" readOnly value="e.g. Stateroom 7102" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">FULL NAME</label>
                              <div className="input-glow-border rounded-xl w-full">
                                <input type="text" readOnly value="Your name" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">USERNAME <span className="text-white/40 font-normal">(optional)</span></label>
                              <div className="input-glow-border rounded-xl w-full">
                                <input type="text" readOnly value="e.g. rocknroller_7h" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <SquishyToggle id="preview-alerts" checked={previewAlerts} onChange={setPreviewAlerts} label="Show alerts near me" />
                              <span className="text-[10px] font-bold text-white/80">Show alerts near me</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <SquishyToggle id="preview-news" checked={previewNews} onChange={setPreviewNews} label="News & updates" />
                              <span className="text-[10px] font-bold text-white/80">News & updates</span>
                            </div>
                          </div>

                          {previewAlerts && (
                            <div className="pt-1">
                              <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">Zip Code & Radius</label>
                              <div className="flex items-center gap-2">
                                <div className="input-glow-border rounded-xl flex-1">
                                  <input type="text" readOnly value="60601" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" placeholder="Zip code" />
                                </div>
                                <div className="shrink-0 relative z-30">
                                  <GooeyDropdown
                                    label={`${previewRadius} MI`}
                                    accentColor="#242630"
                                    glassOpacity={1.0}
                                    backdropBlur={0}
                                    items={[
                                      { label: "15 MI", onClick: () => setPreviewRadius("15") },
                                      { label: "25 MI", onClick: () => setPreviewRadius("25") },
                                      { label: "50 MI", onClick: () => setPreviewRadius("50") },
                                      { label: "100 MI", onClick: () => setPreviewRadius("100") },
                                    ]}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">EMAIL</label>
                          <div className="input-glow-border rounded-xl w-full">
                            <input type="email" readOnly value="your@email.com" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-white/80 mb-1 block">PASSWORD</label>
                          <div className="input-glow-border rounded-xl w-full">
                            <input type="password" readOnly value="••••••••" className="w-full px-3 py-2 bg-black/60 border border-white/20 text-xs text-white/50 outline-none rounded-xl" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <SquishyToggle id="preview-age" checked={previewAge} onChange={setPreviewAge} label="Age confirmation" />
                        <span className="text-[10px] font-bold text-white/80">I confirm that I am <strong className="text-purple-300">18 years of age or older</strong></span>
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <button disabled style={{ opacity: 0.9, background: "linear-gradient(135deg,#7c00ff,#a855f7)", border: "none", color: "#fff" }} className="w-full py-3 font-black text-xs uppercase tracking-widest rounded-lg mb-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      CREATE ACCOUNT
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Checkboxes & Radios */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Checkboxes & Radio Controls</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 cursor-pointer">
                  <SquishyToggle
                    id="sg-newsletter-toggle"
                    label="Subscribe to official band newsletter announcements"
                    checked={checkboxState}
                    onChange={setCheckboxState}
                  />
                  <span className="text-xs text-white/90 font-bold">Subscribe to official band newsletter announcements</span>
                </div>

                <div className="flex items-center gap-3 cursor-pointer">
                  <SquishyToggle
                    id="sg-unchecked-toggle"
                    label="Unchecked state"
                    checked={false}
                    onChange={() => { }}
                  />
                  <span className="text-xs text-white/60">Unchecked state</span>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <SquishyToggle
                    id="sg-disabled-toggle"
                    label="Disabled checked state"
                    disabled={true}
                    checked={true}
                    onChange={() => { }}
                  />
                  <span className="text-xs text-white/40">Disabled checked state</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-xs font-bold text-white/70 block mb-2">Performance Tier Radio Group</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tier"
                      value="full_band"
                      checked={radioState === "full_band"}
                      onChange={(e) => setRadioState(e.target.value)}
                      className="w-4 h-4 text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-xs text-white/90 font-bold">Full Electric Band (6-Piece)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tier"
                      value="acoustic"
                      checked={radioState === "acoustic"}
                      onChange={(e) => setRadioState(e.target.value)}
                      className="w-4 h-4 text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-xs text-white/80">Acoustic Trio Setup</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Switches & Toggles */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">Toggles & Switches</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white/90 block">Push Notifications</span>
                    <span className="text-[11px] text-white/50 block">Receive live show reminders</span>
                  </div>
                  <SquishyToggle
                    id="style-guide-push-notifications"
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Push Notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white/60 block">Disabled Toggle (Off)</span>
                    <span className="text-[11px] text-white/40 block">System locked</span>
                  </div>
                  <SquishyToggle
                    id="style-guide-disabled-toggle"
                    checked={false}
                    onChange={() => { }}
                    disabled
                    label="Disabled toggle"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 5: DROPDOWNS */}
        <section id="dropdowns" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400flex items-center gap-2">
              <ChevronDown className="w-6 h-6" /> 5. Standardized Global Dropdowns
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Standardized dropdown implementation using our global border standard <code className="text-cyan-300 font-mono">rgba(255,255,255,0.08)</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Standard Pill Filter Dropdown (CITY ▼ Default) */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-purple-400uppercase tracking-wider">Default Site Pill Dropdown (`CITY ▼`)</h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Site-Wide Standard</span>
              </div>
              <p className="text-xs text-white/50">
                Gooey animated glass filter pill dropdown with selection popup menu. Used across Tour List filters, booking forms, and site-wide dropdown controls.
              </p>
              <div className="pt-2">
                <GooeyMessagesDropdown
                  placeholder="CITY"
                  customers={[
                    { id: "chicago", name: "Chicago, IL (14)" },
                    { id: "naperville", name: "Naperville, IL (8)" },
                    { id: "milwaukee", name: "Milwaukee, WI (5)" },
                    { id: "vegas", name: "Las Vegas, NV (3)" },
                  ]}
                  onSelect={(opt) => setSelectedDropdown(opt.id)}
                />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 6: CHAT BOX COMPONENT */}
        <section id="chat" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" /> 6. Live Chat Box Component
              </h2>
              <p className="text-white/60 text-xs mt-1">
                Live interactive preview of <code className="text-purple-300 font-mono">CruiseChat</code> with real-time UI controls for bubble radius, borders, opacity, font size, and per-user colors.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const cssVars = `/* 7th Heaven Chat Style CSS Specs */
:root {
  --chat-bubble-radius: ${bubbleRadius}px;
  --chat-bubble-border-width: ${bubbleBorderWidth}px;
  --chat-bubble-font-size: ${bubbleFontSize}px;
  --chat-bubble-padding-y: ${bubblePaddingY}px;
  --chat-bubble-padding-x: ${bubblePaddingX}px;
  --chat-message-spacing: ${messageSpacing}px;
  --chat-bubble-opacity: ${bubbleOpacity}%;
  --chat-bubble-theme: ${bubbleBgStyle};
  --chat-multi-user-colors: ${multiUserColorMode};
  --chat-color-palette: ${bubbleColorPalette};
}`;
                  navigator.clipboard.writeText(cssVars);
                  setCopiedSpec(true);
                  setTimeout(() => setCopiedSpec(null as any), 2500);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSpec ? "CSS Specs Copied!" : "Copy Chat Style Spec"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBubbleRadius(16);
                  setBubbleBorderWidth(0);
                  setBubbleBorderColor("transparent");
                  setBubbleBgStyle("classic");
                  setBubbleFontSize(12);
                  setBubblePaddingY(10);
                  setBubblePaddingX(16);
                  setMessageSpacing(16);
                  setBubbleOpacity(80);
                  setMultiUserColorMode(true);
                  setBubbleColorPalette("default");
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold transition"
              >
                Reset Controls
              </button>
            </div>
          </div>

          {/* Chat Bubble Customizer UI Control Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xs font-mono font-bold text-purple-400uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Chat Bubble UI Controls Studio
              </h3>

              {/* Multi-User Distinct Color Mode Toggle */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                <span className="text-[11px] font-bold text-white/80 pl-1">Multi-User Unique Colors:</span>
                <button
                  type="button"
                  onClick={() => setMultiUserColorMode(!multiUserColorMode)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${multiUserColorMode
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white/10 text-white/50"
                    }`}
                >
                  {multiUserColorMode ? "ON (Unique Per Person)" : "OFF (Single Swatch)"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

              {/* 1. Corner Radius Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Corner Radius</span>
                  <span className="font-mono text-purple-300">{bubbleRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={bubbleRadius}
                  onChange={(e) => setBubbleRadius(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[0, 8, 16, 24].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBubbleRadius(r)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${bubbleRadius === r
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {r === 0 ? "0px" : `${r}px`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Border Width Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Border Width</span>
                  <span className="font-mono text-cyan-300">{bubbleBorderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={bubbleBorderWidth}
                  onChange={(e) => setBubbleBorderWidth(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[0, 1, 2, 3].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setBubbleBorderWidth(w)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${bubbleBorderWidth === w
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {w === 0 ? "0px" : `${w}px`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Font Size Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Font Size</span>
                  <span className="font-mono text-emerald-300">{bubbleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={bubbleFontSize}
                  onChange={(e) => setBubbleFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[10, 12, 14, 16].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBubbleFontSize(s)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${bubbleFontSize === s
                        ? "bg-emerald-600 border-emerald-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Padding Y Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Padding Y (Vertical)</span>
                  <span className="font-mono text-cyan-300">{bubblePaddingY}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  value={bubblePaddingY}
                  onChange={(e) => setBubblePaddingY(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[6, 10, 14, 18].map((py) => (
                    <button
                      key={py}
                      type="button"
                      onClick={() => setBubblePaddingY(py)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${bubblePaddingY === py
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {py}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Padding X Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Padding X (Horizontal)</span>
                  <span className="font-mono text-purple-300">{bubblePaddingX}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={bubblePaddingX}
                  onChange={(e) => setBubblePaddingX(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[12, 16, 20, 24].map((px) => (
                    <button
                      key={px}
                      type="button"
                      onClick={() => setBubblePaddingX(px)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${bubblePaddingX === px
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {px}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Message Spacing Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Message Spacing (Gap)</span>
                  <span className="font-mono text-amber-300">{messageSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="28"
                  value={messageSpacing}
                  onChange={(e) => setMessageSpacing(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[8, 12, 16, 20].map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setMessageSpacing(sp)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${messageSpacing === sp
                        ? "bg-amber-600 border-amber-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {sp}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Opacity Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Bubble Opacity</span>
                  <span className="font-mono text-pink-300">{bubbleOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={bubbleOpacity}
                  onChange={(e) => setBubbleOpacity(Number(e.target.value))}
                  className="w-full accent-pink-500 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-1 pt-1">
                  {[20, 50, 80, 100].map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setBubbleOpacity(o)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${bubbleOpacity === o
                        ? "bg-pink-600 border-pink-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {o}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. Color Palette Swatches */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">Color Swatches</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: "Default", val: "default", bg: "#7e22ce" },
                    { label: "Purple", val: "#9333ea", bg: "#9333ea" },
                    { label: "Cyan", val: "#06b6d4", bg: "#06b6d4" },
                    { label: "Pink", val: "#ec4899", bg: "#ec4899" },
                    { label: "Emerald", val: "#10b981", bg: "#10b981" },
                    { label: "Amber", val: "#f59e0b", bg: "#f59e0b" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => {
                        setBubbleColorPalette(p.val);
                        setMultiUserColorMode(false);
                      }}
                      style={{ backgroundColor: p.bg }}
                      title={p.label}
                      className={`w-5 h-5 rounded-full border-2 transition transform hover:scale-110 ${bubbleColorPalette === p.val && !multiUserColorMode
                        ? "border-white ring-2 ring-white/50 scale-110"
                        : "border-transparent opacity-80"
                        }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={customHexColor}
                    onChange={(e) => {
                      setCustomHexColor(e.target.value);
                      setBubbleColorPalette(e.target.value);
                      setMultiUserColorMode(false);
                    }}
                    className="w-5 h-5 rounded-md border border-white/20 bg-transparent cursor-pointer"
                    title="Custom Color Picker"
                  />
                  <span className="text-[9px] font-mono text-white/60 uppercase truncate max-w-[80px]">
                    {multiUserColorMode ? "Multi-User" : bubbleColorPalette}
                  </span>
                </div>
              </div>

              {/* 9. Background Style Themes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">Fill Theme</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Classic", val: "classic" },
                    { label: "Glass", val: "glass" },
                    { label: "Midnight", val: "midnight" },
                    { label: "Neon", val: "neon" },
                  ].map((bg) => (
                    <button
                      key={bg.val}
                      type="button"
                      onClick={() => setBubbleBgStyle(bg.val)}
                      className={`py-1 px-1.5 rounded text-[10px] font-bold border truncate transition ${bubbleBgStyle === bg.val
                        ? "bg-purple-600/40 border-purple-400 text-purple-200"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div
            style={{
              ['--chat-bubble-radius' as any]: `${bubbleRadius}px`,
              ['--chat-bubble-border-width' as any]: `${bubbleBorderWidth}px`,
              ['--chat-bubble-font-size' as any]: `${bubbleFontSize}px`,
              ['--chat-bubble-padding-y' as any]: `${bubblePaddingY}px`,
              ['--chat-bubble-padding-x' as any]: `${bubblePaddingX}px`,
              ['--chat-message-spacing' as any]: `${messageSpacing}px`,
              ['--chat-bubble-member-border' as any]: bubbleBorderColor,
              ['--chat-bubble-self-border' as any]: bubbleBorderColor,
              ['--chat-bubble-admin-border' as any]: bubbleBorderColor,
              ['--chat-bubble-override-bg' as any]: multiUserColorMode
                ? undefined
                : bubbleColorPalette !== 'default'
                  ? bubbleColorPalette
                  : bubbleBgStyle === 'glass' ? `rgba(8, 145, 178, ${bubbleOpacity / 200})` : bubbleBgStyle === 'midnight' ? '#0f172a' : bubbleBgStyle === 'neon' ? '#0284c7' : `rgba(22, 101, 124, ${bubbleOpacity / 100})`,
              ['--chat-bubble-self-bg' as any]: multiUserColorMode
                ? undefined
                : bubbleColorPalette !== 'default'
                  ? bubbleColorPalette
                  : bubbleBgStyle === 'glass' ? `rgba(126, 34, 206, ${bubbleOpacity / 200})` : bubbleBgStyle === 'midnight' ? '#1e1b4b' : bubbleBgStyle === 'neon' ? '#9333ea' : `rgba(126, 34, 206, ${bubbleOpacity / 100})`,
              ['--chat-bubble-admin-bg' as any]: multiUserColorMode
                ? undefined
                : bubbleColorPalette !== 'default'
                  ? bubbleColorPalette
                  : bubbleBgStyle === 'glass' ? `rgba(46, 16, 101, ${bubbleOpacity / 200})` : bubbleBgStyle === 'midnight' ? '#2e1065' : bubbleBgStyle === 'neon' ? '#581c87' : `rgba(46, 16, 101, ${bubbleOpacity / 100})`,
            }}
            className="morph-pick rounded-2xl border border-white/10 bg-transparent overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.15)]"
            data-pick-label="Live Chat"
          >
            <CruiseChat activeChannel="general" />
          </div>
        </section>

        {/* SECTION 7: CARDS & BADGES */}
        <section id="components" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-pink-400 flex items-center gap-2">
              <Layers className="w-6 h-6" /> 7. Reusable Cards, Badges & Alerts
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Actual shipping badges, announcement banners, cookie notices, and glass card containers.
            </p>
          </div>

          {/* Role Badges */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-purple-400uppercase tracking-wider">Role & Section Badges</h3>
            <div className="flex flex-wrap items-center gap-3">
              <RoleBadge role="admin" />
              <RoleBadge role="crew" />
              <RoleBadge role="fan" />
              <SectionBadge label="VIP BACKSTAGE PASS" color="amber" />
              <SectionBadge label="LIVE SHOW HUB" color="cyan" />
            </div>
          </div>

          {/* Announcement Banner Component */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Announcement Banner Component</h3>
            <AnnouncementBanner
              text="⚡ 7TH HEAVEN CRUISE 2026 PRE-SALE IS NOW OPEN FOR VIP MEMBERS!"
              link="/cruise"
              linkText="BOOK CABIN NOW →"
              inline={true}
            />
          </div>

          {/* Cards & Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">

            {/* Glass Card Container */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition space-y-3">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">Glassmorphism Card</span>
              <h4 className="text-lg font-bold text-white">House of Blues Chicago</h4>
              <p className="text-xs text-white/60">
                Standard container card with 1px border <code className="text-purple-300 font-mono">rgba(255,255,255,0.08)</code>.
              </p>
              <button className="px-4 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-bold transition">
                View Event Details
              </button>
            </div>

            {/* Alert Banner Callout */}
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> System Warning Notice
              </div>
              <p className="text-xs text-amber-200/80">
                Weather advisory in effect for outdoor amphitheater shows. Check live venue updates before departure.
              </p>
            </div>

            {/* Modal Trigger */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Interactive Modal</span>
                <h4 className="text-lg font-bold text-white">Login & Authentication Modal</h4>
                <p className="text-xs text-white/60 mt-1">
                  Trigger the site-wide login/signup modal dialog.
                </p>
              </div>
              <button
                onClick={() => openModal("login")}
                className="px-4 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase transition flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" /> Launch Login Modal
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 8: MODALS & DIALOGS */}
        <section id="modals" className="scroll-mt-36 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Maximize2 className="w-6 h-6" /> 8. Modals & Dialogs
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Standard modal patterns: glassmorphism shell, confirmation/alert dialogs, and the global login/signup auth modal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1 — Glassmorphism Modal Shell */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Glass Shell</span>
                <h4 className="text-lg font-bold text-white">Glassmorphism Modal</h4>
                <p className="text-xs text-white/60 mt-1">
                  The frosted-glass card used for verify screens, PIN entry, and success states.
                </p>
              </div>
              <button
                onClick={() => setShowGlassModal(true)}
                className="px-4 py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-extrabold uppercase transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Glass Modal
              </button>
            </div>

            {/* 2 — Confirmation / Alert Dialog */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Confirm / Alert</span>
                <h4 className="text-lg font-bold text-white">Confirmation Dialog</h4>
                <p className="text-xs text-white/60 mt-1">
                  Destructive action confirmation with cancel/confirm buttons.
                </p>
                {confirmResult && (
                  <p className={`text-xs mt-2 font-bold ${confirmResult === 'confirmed' ? 'text-red-400' : 'text-white/50'}`}>
                    Result: {confirmResult === 'confirmed' ? '✓ Confirmed' : '✕ Cancelled'}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setShowConfirmModal(true); setConfirmResult(null); }}
                className="px-4 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Open Confirm Dialog
              </button>
            </div>

            {/* 3 — Login / Auth Modal */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Auth Modal</span>
                <h4 className="text-lg font-bold text-white">Login & Signup Modal</h4>
                <p className="text-xs text-white/60 mt-1">
                  Site-wide auth modal with login/signup toggle, form validation, and role selection.
                </p>
              </div>
              <button
                onClick={() => openModal("login")}
                className="px-4 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Launch Login Modal
              </button>
            </div>
          </div>

          {/* Alert / Success Toast Demo (inline) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Alert / Success Toast Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Success */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">Success</p>
                  <p className="text-[10px] text-emerald-200/70 mt-0.5">Your PIN has been verified successfully.</p>
                </div>
              </div>
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-300">Warning</p>
                  <p className="text-[10px] text-amber-200/70 mt-0.5">Your session will expire in 5 minutes.</p>
                </div>
              </div>
              {/* Error */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-300">Error</p>
                  <p className="text-[10px] text-red-200/70 mt-0.5">Invalid PIN. Please try again.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Glassmorphism Modal Portal ── */}
          {showGlassModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close backdrop"
                className="absolute inset-0 bg-black/60 backdrop-blur-md border-0 p-0 cursor-default"
                onClick={() => setShowGlassModal(false)}
              />
              <div
                className="relative w-full max-w-sm rounded-3xl px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease] text-center"
                style={{
                  background: "var(--color-bg-glass)",
                  backdropFilter: "blur(32px) saturate(180%)",
                  WebkitBackdropFilter: "blur(32px) saturate(180%)",
                  border: "1px solid var(--color-border-main)",
                }}
              >
                <button
                  onClick={() => setShowGlassModal(false)}
                  aria-label="Close modal"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Glassmorphism Shell</h3>
                <p className="text-xs text-white/60 mb-6">
                  This is the standard frosted-glass modal card used across verify screens, PIN entry, and success states.
                </p>

                <div className="space-y-3">
                  <div className="input-glow-border rounded-lg w-full">
                    <input
                      type="text"
                      placeholder="Enter your email..."
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 placeholder-white/40 text-xs font-medium outline-none transition"
                    />
                  </div>
                  <button
                    onClick={() => setShowGlassModal(false)}
                    className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Confirmation Dialog Portal ── */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close backdrop"
                className="absolute inset-0 bg-black/60 backdrop-blur-md border-0 p-0 cursor-default"
                onClick={() => { setShowConfirmModal(false); setConfirmResult('cancelled'); }}
              />
              <div
                className="relative w-full max-w-sm rounded-3xl px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease]"
                style={{
                  background: "var(--color-bg-surface)",
                  backdropFilter: "blur(32px) saturate(180%)",
                  WebkitBackdropFilter: "blur(32px) saturate(180%)",
                  border: "1px solid var(--color-border-main)",
                }}
              >
                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider text-center mb-1">Delete Item?</h3>
                <p className="text-xs text-white/60 text-center mb-6">
                  This action cannot be undone. The item will be permanently removed from your account.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowConfirmModal(false); setConfirmResult('cancelled'); }}
                    className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setShowConfirmModal(false); setConfirmResult('confirmed'); }}
                    className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 9: BORDERS & GLASS */}
        <section id="borders" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> 9. Border & Glass Standard
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Confirming all dividers and component boundaries use our standardized global border color: <code className="text-cyan-300 font-mono">rgba(255, 255, 255, 0.08)</code>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>Variable: <strong className="text-white">--color-border-main</strong></span>
              <span>Computed Value: <strong className="text-cyan-400">rgba(255, 255, 255, 0.08)</strong></span>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-center">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-white/80">
                Card Border: border-white/10
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-white/80">
                Divider: border-b border-white/10
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-white/80">
                Input Border: border-white/10
              </div>
            </div>
          </div>
        </section>

        {/* SCROLLBAR SHOWCASE */}
        <section id="scrollbars" className="scroll-mt-36 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Sliders className="w-6 h-6" /> Custom Scrollbars
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Apply <code className="text-purple-300 font-mono">custom-scrollbar</code> or <code className="text-purple-300 font-mono">custom-purple-scrollbar</code> to any scrollable container.
              Both classes are identical — the glowing purple thumb always shows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Vertical scroll demo */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Vertical Scroll</p>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <CustomScrollbar height={256} className="p-4 space-y-3">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-[10px] font-black text-purple-300 shrink-0">{i + 1}</div>
                      <div>
                        <p className="text-xs font-bold text-white">List item {i + 1}</p>
                        <p className="text-[10px] text-white/30">Scroll down to see more items</p>
                      </div>
                    </div>
                  ))}
                </CustomScrollbar>
              </div>
              <p className="text-[10px] text-white/30 font-mono">&lt;CustomScrollbar&gt;...&lt;/CustomScrollbar&gt;</p>
            </div>

            {/* Horizontal scroll demo */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Horizontal Scroll</p>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <CustomScrollbar direction="horizontal" className="p-4 pb-6">
                  <div className="flex gap-3" style={{ minWidth: 900 }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="shrink-0 w-28 h-24 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-[10px] font-black text-purple-300">{i + 1}</div>
                        <span className="text-[10px] text-white/40">Card {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </CustomScrollbar>
              </div>
              <p className="text-[10px] text-white/30 font-mono">className=&quot;custom-scrollbar overflow-x-auto&quot;</p>
            </div>

            {/* Both axes demo */}
            <div className="space-y-3 md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Both Axes (2D Scroll)</p>
              <div
                data-lenis-prevent
                className="custom-scrollbar overflow-scroll max-h-48 bg-white/[0.02] border border-white/10 rounded-2xl p-4"
              >
                <div style={{ minWidth: 900 }} className="space-y-2">
                  {Array.from({ length: 10 }).map((_, row) => (
                    <div key={row} className="flex gap-2">
                      {Array.from({ length: 10 }).map((_, col) => (
                        <div key={col} className="shrink-0 w-20 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-[9px] font-mono text-purple-300">
                          {row},{col}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-white/30 font-mono">className=&quot;custom-scrollbar overflow-auto&quot;</p>
            </div>

          </div>

          {/* Usage code block */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-3">Usage</p>
            <pre className="text-[11px] text-purple-200 font-mono leading-relaxed overflow-x-auto custom-scrollbar">
              {`// globals.css already defines:
.custom-scrollbar::-webkit-scrollbar        { width: 10px; height: 10px; }
.custom-scrollbar::-webkit-scrollbar-track  { background: rgba(147,51,234,0.25); border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb  { background: linear-gradient(180deg,#e9d5ff,#9333ea); border-radius: 9999px; box-shadow: 0 0 14px rgba(192,132,252,1); }

// Apply to any scrollable element:
<div className="custom-scrollbar overflow-y-auto max-h-96">{/* content */}</div>
<div className="custom-scrollbar overflow-x-auto">{/* content */}</div>
<div className="custom-scrollbar overflow-auto">{/* content */}</div>`}
            </pre>
          </div>
        </section>

        {/* SECTION 10: SPACING & PADDING TOKENS */}
        <section id="spacing" className="scroll-mt-36  border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Box className="w-6 h-6" /> 10. Spacing & Page Padding Scale
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Standardized responsive page padding scale: <code className="text-purple-300 font-mono">px-6 sm:px-8 lg:px-[42px]</code> (24px Mobile / 32px Tablet / 42px Desktop).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">Mobile Page Padding</span>
              <div className="text-2xl font-black text-white">16px (<code className="text-xs text-white/50 font-mono">var(--page-padding-x)</code>)</div>
              <p className="text-xs text-white/50">Used on screens below 768px viewport width.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400">Tablet Page Padding</span>
              <div className="text-2xl font-black text-white">32px (<code className="text-xs text-white/50 font-mono">var(--page-padding-x)</code>)</div>
              <p className="text-xs text-white/50">Used on screens between 768px and 1024px viewport width.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">Desktop Page Padding</span>
              <div className="text-2xl font-black text-white">42px (<code className="text-xs text-white/50 font-mono">var(--page-padding-x)</code>)</div>
              <p className="text-xs text-white/50">Standardized max desktop horizontal container padding.</p>
            </div>
          </div>

          {/* Dedicated .site-container Utility Specification Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-black border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-black text-purple-400 uppercase tracking-widest block">
                Primary Layout Wrapper Class
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <code className="text-purple-300 font-mono bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/40">.site-container</code>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Active Globally</span>
              </h3>
              <p className="text-xs text-white/60 max-w-2xl mt-1">
                The universal wrapper class <code className="text-purple-300">.site-container</code> enforces 100% full-bleed edge-to-edge layout width with responsive breakpoint padding (<code className="text-cyan-300">16px</code> Mobile $\rightarrow$ <code className="text-purple-300">32px</code> Tablet $\rightarrow$ <code className="text-emerald-300">42px</code> Desktop).
              </p>
            </div>
            <div className="shrink-0 p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-purple-300 space-y-1">
              <div><span className="text-white/40">width:</span> 100%;</div>
              <div><span className="text-white/40">max-width:</span> 100% !important;</div>
              <div><span className="text-white/40">padding:</span> 0 var(--page-padding-x);</div>
            </div>
          </div>
        </section>

        {/* SECTION 11: CANVAS SHADER & FILM GRAIN STUDIO */}
        <section id="canvas-studio" className="scroll-mt-36 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Sliders className="w-6 h-6" /> 11. Canvas Shader & Full-Page Film Grain Studio
              </h2>
              <p className="text-white/60 text-xs mt-1">
                Interactive real-time controller for background WebGL shader parameters and full-page film grain overlay system.
              </p>
            </div>
            <button
              onClick={handleCopyCanvasSpec}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 border self-start sm:self-auto ${copiedCanvasSpec
                ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                }`}
            >
              {copiedCanvasSpec ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCanvasSpec ? "Canvas Specs Copied!" : "Copy Canvas & Grain Spec"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Full-Page Film Grain Controls */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> 1. Full-Page Film Grain Overlay System
              </h3>
              <p className="text-xs text-white/60">
                Controls the fixed resolution-independent SVG fractal noise layer covering the entire viewport screen (<code className="text-emerald-300 font-mono">z-[99999]</code>).
              </p>

              {/* Grain Opacity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white/80">Grain Opacity</span>
                  <span className="text-emerald-400 font-mono">{canvasGrainOpacity}% ({(canvasGrainOpacity / 100).toFixed(2)})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={canvasGrainOpacity}
                  onChange={(e) => setCanvasGrainOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex gap-1.5 pt-1">
                  {[0, 4, 6, 10, 18, 25].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setCanvasGrainOpacity(op)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${canvasGrainOpacity === op
                        ? "bg-emerald-600 border-emerald-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {op}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Grain Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white/80">Grain Size (baseFrequency)</span>
                  <span className="text-emerald-400 font-mono">{canvasGrainSize}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={canvasGrainSize}
                  onChange={(e) => setCanvasGrainSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex gap-1.5 pt-1">
                  {[0.3, 0.5, 0.65, 0.85, 1.2, 2.0].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setCanvasGrainSize(sz)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${canvasGrainSize === sz
                        ? "bg-emerald-600 border-emerald-400 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grain Blend Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">Grain Blend Mode</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { label: "Overlay", val: "overlay" },
                    { label: "Soft Light", val: "soft-light" },
                    { label: "Screen", val: "screen" },
                    { label: "Multiply", val: "multiply" },
                    { label: "Dodge", val: "color-dodge" },
                  ].map((mode) => (
                    <button
                      key={mode.val}
                      type="button"
                      onClick={() => setCanvasGrainBlend(mode.val)}
                      className={`py-1.5 px-1 rounded text-[10px] font-bold border truncate transition ${canvasGrainBlend === mode.val
                        ? "bg-emerald-600/40 border-emerald-400 text-emerald-200"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Background WebGL Shader Controls — LIVE connected to NeatGradient */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> 2. Background Shader Parameters (Live)
              </h3>
              <p className="text-[10px] text-white/50">All sliders update the WebGL canvas shader in real-time via <code className="text-purple-300 font-mono">window.__neatInstance</code>.</p>

              {/* Reusable slider helper */}
              {([
                { label: "Speed", value: canvasSpeed, set: setCanvasSpeed, min: 0, max: 10, step: 1, color: "purple" },
                { label: "Wave Amplitude", value: canvasWaveAmp, set: setCanvasWaveAmp, min: 0, max: 3, step: 0.1, color: "cyan" },
                { label: "Wave Freq X", value: canvasWaveFreqX, set: setCanvasWaveFreqX, min: 0, max: 5, step: 0.1, color: "cyan" },
                { label: "Wave Freq Y", value: canvasWaveFreqY, set: setCanvasWaveFreqY, min: 0, max: 5, step: 0.1, color: "cyan" },
                { label: "Color Blending", value: canvasColorBlending, set: setCanvasColorBlending, min: 0, max: 20, step: 1, color: "purple" },
                { label: "Color Saturation", value: canvasColorSaturation, set: setCanvasColorSaturation, min: 0, max: 20, step: 1, color: "pink" },
                { label: "Color Brightness", value: canvasColorBrightness, set: setCanvasColorBrightness, min: 0, max: 2, step: 0.05, color: "amber" },
                { label: "Shadows", value: canvasShadows, set: setCanvasShadows, min: 0, max: 20, step: 1, color: "purple" },
                { label: "Highlights", value: canvasHighlights, set: setCanvasHighlights, min: 0, max: 20, step: 1, color: "amber" },
                { label: "H. Pressure", value: canvasHPressure, set: setCanvasHPressure, min: 0, max: 10, step: 1, color: "emerald" },
                { label: "V. Pressure", value: canvasVPressure, set: setCanvasVPressure, min: 0, max: 10, step: 1, color: "emerald" },
              ] as const).map((ctrl) => (
                <div key={ctrl.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/80">{ctrl.label}</span>
                    <span className={`font-mono text-${ctrl.color}-400`}>{ctrl.value}</span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={ctrl.value}
                    onChange={(e) => ctrl.set(Number(e.target.value))}
                    className={`w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-${ctrl.color}-500`}
                  />
                </div>
              ))}

              {/* Background Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">Background Color</label>
                <div className="flex items-center gap-3">
                  {[
                    { label: "Midnight", bg: "#05030a" },
                    { label: "Deep Purple", bg: "#0a0418" },
                    { label: "Dark Magenta", bg: "#120215" },
                    { label: "Ocean Black", bg: "#020b18" },
                    { label: "True Black", bg: "#000000" },
                  ].map((bg) => (
                    <button
                      key={bg.bg}
                      type="button"
                      onClick={() => setCanvasBgColor(bg.bg)}
                      style={{ backgroundColor: bg.bg }}
                      title={bg.label}
                      className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${canvasBgColor === bg.bg ? "border-white ring-2 ring-white/50 scale-110" : "border-white/20"
                        }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={canvasBgColor}
                    onChange={(e) => setCanvasBgColor(e.target.value)}
                    className="w-6 h-6 rounded-md border border-white/20 bg-transparent cursor-pointer ml-auto"
                    title="Custom Hex Picker"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: GLOBAL CONTAINER STYLES */}
        <section id="global-containers" className="scroll-mt-36 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-pink-400 flex items-center gap-2">
              <Settings className="w-6 h-6" /> 11. Global Container, Border & Background Styles
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Edit global CSS variables for section/card backgrounds, borders, and glass surfaces. Changes apply site-wide in real-time. Hit <strong className="text-white">SAVE THEME TOKENS</strong> at the top to persist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card / Section Background Token */}
            {([
              { label: "Section Background", token: "--color-section-bg", category: "colors" as const, desc: "Booking/calendar/form section fill (was #0c0817)" },
              { label: "Section Border", token: "--color-section-border", category: "colors" as const, desc: "Border on booking/form containers" },
              { label: "Input Background", token: "--color-input-bg", category: "colors" as const, desc: "Select/input field backgrounds" },
              { label: "Input Border", token: "--color-input-border", category: "colors" as const, desc: "Select/input field borders" },
              { label: "Card Background", token: "--color-bg-card", category: "colors" as const, desc: "All card & container fill" },
              { label: "Glass Background", token: "--color-bg-glass", category: "colors" as const, desc: "Glassmorphism panels" },
              { label: "Surface Background", token: "--color-bg-surface", category: "colors" as const, desc: "Deep surface layers" },
              { label: "Primary Background", token: "--color-bg-primary", category: "colors" as const, desc: "Page-level base background" },
              { label: "Deep Background", token: "--color-bg-deep", category: "colors" as const, desc: "Deepest background layer" },
              { label: "Main Border", token: "--color-border-main", category: "colors" as const, desc: "Default border on all containers" },
              { label: "Purple Border", token: "--color-border-purple", category: "colors" as const, desc: "Accent purple border" },
              { label: "Accent Color", token: "--color-accent", category: "colors" as const, desc: "Primary brand accent" },
            ]).map((item) => {
              const currentValue = tokens[item.category]?.[item.token] || "";
              return (
                <div key={item.token} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-pink-400">{item.label}</span>
                      <p className="text-[10px] text-white/50 mt-0.5">{item.desc}</p>
                    </div>
                    <code className="text-[10px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded border border-white/5">{item.token}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: currentValue }}
                    />
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => updateToken(item.category, item.token, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:border-pink-500 focus:outline-none transition"
                      placeholder="rgba(255,255,255,0.03)"
                    />
                    <button
                      type="button"
                      onClick={() => updateToken(item.category, item.token, "transparent")}
                      className="px-2 py-1.5 text-[10px] font-bold uppercase text-white/60 bg-white/5 border border-white/10 rounded-lg hover:text-white hover:border-white/30 transition"
                    >
                      Clear
                    </button>
                  </div>
                  {/* Quick presets */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(item.token.includes("border")
                      ? ["transparent", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.15)", "rgba(147,51,234,0.3)"]
                      : ["transparent", "rgba(255,255,255,0.02)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.05)", "rgba(18,18,24,0.45)", "rgba(15,5,29,0.55)"]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateToken(item.category, item.token, preset)}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition ${currentValue === preset
                          ? "bg-pink-600/40 border-pink-400 text-pink-200"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                          }`}
                      >
                        {preset === "transparent" ? "none" : preset.length > 20 ? preset.slice(0, 18) + "…" : preset}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Preview Strip */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60">Live Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl space-y-2" style={{ backgroundColor: tokens.colors["--color-bg-card"], border: `1px solid ${tokens.colors["--color-border-main"]}` }}>
                <span className="text-xs font-bold text-pink-400">Card Container</span>
                <p className="text-xs text-white/60">Uses <code className="text-pink-300 font-mono text-[10px]">--color-bg-card</code> + <code className="text-pink-300 font-mono text-[10px]">--color-border-main</code></p>
              </div>
              <div className="p-5 rounded-2xl backdrop-blur-xl space-y-2" style={{ backgroundColor: tokens.colors["--color-bg-glass"], border: `1px solid ${tokens.colors["--color-border-main"]}` }}>
                <span className="text-xs font-bold text-purple-400">Glass Panel</span>
                <p className="text-xs text-white/60">Uses <code className="text-purple-300 font-mono text-[10px]">--color-bg-glass</code></p>
              </div>
              <div className="p-5 rounded-2xl space-y-2" style={{ backgroundColor: tokens.colors["--color-bg-surface"], border: `1px solid ${tokens.colors["--color-border-purple"]}` }}>
                <span className="text-xs font-bold text-cyan-400">Surface Panel</span>
                <p className="text-xs text-white/60">Uses <code className="text-cyan-300 font-mono text-[10px]">--color-bg-surface</code> + <code className="text-cyan-300 font-mono text-[10px]">--color-border-purple</code></p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 12: STATEROOM CATALOG & SUITE PERKS */}
        <section id="stateroom-perks" className="scroll-mt-36 border-0 rounded-3xl p-0 space-y-6 overflow-hidden">
          <div className="border-b border-white/10 px-0 py-4 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400flex items-center gap-2">
              <Anchor className="w-6 h-6" /> 12. Stateroom Catalog & Suite Class Perks
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Interactive preview of the Stateroom Categories catalog and Suite Class Perks component (from the Cruise page). Responds to container, border, and accent theme token changes in real-time.
            </p>
          </div>

          <div className="p-0 grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
            {/* Stateroom Categories Tab Column — borderless & unpadded */}
            <div className="lg:col-span-1 flex flex-col justify-between p-0 border-0 bg-transparent shadow-none">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-widest mb-4">Stateroom Categories</h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    { id: "suites", label: "Royal Suites", desc: "Star Class, Sky Class, and Sea Class accommodations." },
                    { id: "balcony", label: "Balconies & Infinite", desc: "Private sliding glass doors opening to ocean breeze." },
                    { id: "ocean", label: "Ocean View", desc: "Large windows overlooking port approaches." },
                    { id: "interior", label: "Interior Rooms", desc: "Efficient, comfortable, and budget-friendly." },
                  ].map(tab => (
                    <button aria-label="Action button"
                      key={tab.id}
                      type="button"
                      onClick={() => setStateroomTab(tab.id as any)}
                      className={`w-full p-4 rounded-lg text-left border-0 transition-colors cursor-pointer ${stateroomTab === tab.id
                        ? "bg-purple-600/30 text-white"
                        : "bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                    >
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">{tab.label}</h4>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">{tab.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 bg-transparent border-0 p-0">
                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-3">Available layouts:</h4>
                {stateroomTab === "suites" && (
                  <div className="space-y-2 text-sm text-white/80 font-medium">
                    <p>• Ultimate Family Townhouse</p>
                    <p>• Royal Loft Suite</p>
                    <p>• Owner&apos;s Suite</p>
                    <p>• Grand Suite (1 Bedroom & 2 Bedroom)</p>
                    <p>• Sky Junior Suite</p>
                    <p>• Surfside Family Suite</p>
                  </div>
                )}
                {stateroomTab === "balcony" && (
                  <div className="space-y-2 text-sm text-white/80 font-medium">
                    <p>• Infinite Ocean View Balcony</p>
                    <p>• Infinite Central Park Balcony</p>
                    <p>• Ocean View Balcony</p>
                    <p>• Central Park View Balcony</p>
                    <p>• Surfside Family View Balcony</p>
                  </div>
                )}
                {stateroomTab === "ocean" && (
                  <div className="space-y-2 text-sm text-white/80 font-medium">
                    <p>• Panoramic Ocean View</p>
                    <p>• Ocean View</p>
                  </div>
                )}
                {stateroomTab === "interior" && (
                  <div className="space-y-2 text-sm text-white/80 font-medium">
                    <p>• Interior</p>
                    <p>• Spacious Interior</p>
                    <p>• Central Park View Interior</p>
                    <p>• Surfside Family View Interior</p>
                  </div>
                )}
              </div>
            </div>

            {/* Suite Class Benefits Column (Span 2) */}
            <div className="lg:col-span-2 bg-[var(--color-section-bg)] backdrop-blur-xl border border-[var(--color-section-border)] p-6 md:p-8 rounded-3xl flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">VIP Experiences</span>
                    <h3 className="text-2xl md:text-3xl font-black uppercase text-white mt-1">Suite Class Perks</h3>
                  </div>
                  <div className="flex gap-1.5 bg-white/5 p-1.5 border border-white/10 rounded-xl">
                    {(["sea", "sky", "star"] as const).map(perk => (
                      <button aria-label="Action button"
                        key={perk}
                        type="button"
                        onClick={() => setSuiteTab(perk)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors cursor-pointer ${suiteTab === perk
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                          : "bg-transparent text-white/60 hover:text-white"
                          }`}
                      >
                        {perk} Class
                      </button>
                    ))}
                  </div>
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-sm md:text-base text-white/90 font-medium leading-relaxed">
                  {suiteTab === "sea" && [
                    "Dedicated check-in line",
                    "Priority boarding",
                    "Dinner at Coastal Kitchen (subject to availability)*",
                    "All-day access to Star | Sky | Sea dining",
                    "Royal Caribbean plush bathrobes for use onboard",
                    "Luxury pillow top mattress and linen",
                    "Luxury bathroom amenities",
                    "Lavazza Espresso coffee machine"
                  ].map((perk) => (
                    <div key={`sea-perk-${perk}`} className="flex items-center gap-2.5">
                      <span className="text-purple-400 font-black text-base shrink-0">✓</span>
                      <span>{perk}</span>
                    </div>
                  ))}

                  {suiteTab === "sky" && [
                    "Concierge service",
                    "All-day access to Coastal Kitchen*",
                    "All-day access to Star & Sky dining",
                    "Complimentary VOOM Surf + Stream (1 device pp)†",
                    "Specialty bottled water upon arrival",
                    "Flexible arrival boarding & priority departure",
                    "Priority dining reservations",
                    "Reserved seating in select entertainment venues",
                    "Suite Lounge access (complimentary hors d’oeuvres/cocktails)",
                    "Access to Suite Sun Deck (The Grove on Star)",
                    "Royal Caribbean plush bathrobes for use onboard",
                    "Luxury pillow top mattress and linen",
                    "Luxury bathroom amenities",
                    "Lavazza Espresso coffee machine"
                  ].map((perk) => (
                    <div key={`sky-perk-${perk}`} className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-black text-base shrink-0">✓</span>
                      <span>{perk}</span>
                    </div>
                  ))}

                  {suiteTab === "star" && [
                    "Exclusive access to Royal Genie service§",
                    "All-day access to Coastal Kitchen*",
                    "All-day access to Star & Sky dining",
                    "Complimentary Deluxe Beverage Package (ages 21+)†",
                    "Complimentary Refreshment Package (under legal age)†",
                    "Still and sparkling water replenished daily",
                    "Complimentary Gratuities for stateroom/dining staffΔ",
                    "Complimentary VOOM Surf + Stream powered by Starlink",
                    "Expedited boarding & departure",
                    "Best seats in the house in select entertainment venues",
                    "Priority entrance to many onboard activities††",
                    "Suite Lounge access (complimentary hors d'oeuvres/cocktails)",
                    "Access to Suite Sun Deck, and The Grove",
                    "Complimentary minibar stocked with Coca-Cola & water",
                    "Complimentary laundry and pressing services",
                    "Luxury mattress, pillows, and linens",
                    "Luxury bathroom amenities",
                    "Luxury bathrobes for use onboard",
                    "In-suite coffee machine"
                  ].map((perk) => (
                    <div key={`star-perk-${perk}`} className="flex items-center gap-2.5">
                      <span className="text-[var(--color-accent)] font-black text-base shrink-0">✓</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimers & Notes */}
              <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/60 space-y-1.5 leading-relaxed font-semibold">
                {suiteTab === "sea" && (
                  <>
                    <p>* Reservations required for dinner at Coastal Kitchen. Beverages are not included.</p>
                    <p>** Sea Class guests do not have access to stateroom lounges.</p>
                    <p>— Complimentary gratuities are not included for Sea Class guests.</p>
                  </>
                )}
                {suiteTab === "sky" && (
                  <>
                    <p>* Reservations required for dinner at Coastal Kitchen. Beverages are not included.</p>
                    <p>† VOOM Surf + Stream package: One device per person is included for guests booked in a Sky Suite (not included in Sky Junior Suite).</p>
                  </>
                )}
                {suiteTab === "star" && (
                  <>
                    <p>§ Royal Genie services are for Star Class guests only and cannot be extended to friends/family in other staterooms.</p>
                    <p>* Reservations required for dinner at Coastal Kitchen. Beverages not in Deluxe Package are charged.</p>
                    <p>Δ Gratuities apply to standard housekeeping/dining. genie/concierge tipping is at guest discretion.</p>
                    <p>†† Reduced wait times for select activities during published hours, excluding sea day peaks (1:00 PM – 4:00 PM).</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stateroom Pricing & Rate Cards Showcase */}
          <div className="pt-8 border-t border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">Prevailing Market Pricing Cards</span>
                <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Stateroom & Cabin Rate Cards</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { code: "ZI", title: "Inside GTY", price: "$1,430.77", label: "Guaranteed Cabin", image: "/images/cruise/q2_interior_plus.jpg", selectValue: "prev_zi" },
                { code: "YO", title: "Ocean View GTY", price: "$1,691.27", label: "Guaranteed Cabin", image: "/images/cruise/n5.jpg", selectValue: "prev_yo", isHighlighted: true },
                { code: "IF", title: "Infinite Central Park", price: "$1,907.27", label: "Central Park View", image: "/images/cruise/if.jpg", selectValue: "prev_if" },
              ].map((room) => {
                const isYo = room.code === "YO";
                return (
                  <div
                    key={room.code}
                    className="overflow-hidden rounded-2xl flex flex-col justify-between group relative shadow-none border-0 bg-transparent"
                  >
                    {isYo && (
                      <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-md flex items-center gap-1 border-0 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Popular</span>
                      </div>
                    )}
                    <div>
                      {room.image && (
                        <div className="relative h-44 w-full overflow-hidden text-center">
                          <Image width={350} height={200} unoptimized src={room.image} alt={room.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="px-0 py-5">
                        <div className="flex justify-between items-start gap-2 mb-3 text-left">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider border-0 ${isYo ? 'bg-purple-500/30 text-purple-200' : 'bg-white/10 text-white/70'
                            }`}>{room.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">{room.code} Category</span>
                        <h4 className="text-base font-black text-white uppercase tracking-tight mt-0.5 text-left">{room.title}</h4>
                      </div>
                    </div>

                    <div className="px-0 pt-0 pb-5 text-left">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-white">{room.price}</span>
                        <span className="text-xs text-white/60 font-bold">USD pp</span>
                      </div>
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mt-1">Rates as of June 27, 2026</span>
                      <button
                        type="button"
                        className={`mt-4 w-full py-2.5 px-4 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md border-0 ${isYo
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                          }`}
                      >
                        <span>Select Prevailing Rate</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cruise Guest Reservation Form Card Showcase */}
          <div className="pt-8 border-t border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Reservation Form Component</span>
                <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Cruise Guest Booking Registration Card</h3>
              </div>
            </div>

            <div className="booking-form-card bg-transparent border-0 rounded-3xl overflow-hidden shadow-none p-0 text-left">
              {/* Header Banner */}
              <div className="booking-header-banner border-0 px-0 py-2 text-left bg-transparent">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">7 NIGHT EASTERN CARIBBEAN CRUISE — ORLANDO, FL • COCOCAY • ST. THOMAS • ST. MAARTEN</h2>
                <p className="text-xs text-purple-400font-extrabold uppercase mt-1">STAR OF THE SEAS — ROYAL CARIBBEAN (JANUARY 10, 2027 - JANUARY 17, 2027)</p>
                <p className="text-[10px] text-white/60 font-bold uppercase mt-0.5">GROUP I.D. 3325680 • OFFICIAL TRAVEL AGENCY: NTD VACATIONS (877-683-9753)</p>
              </div>

              {/* GUEST 1 (Primary Booker) */}
              <div className="booking-section-container border-0 bg-transparent p-0">
                <div className="booking-section-header bg-transparent px-0 py-3 border-0 flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-wider text-white">Guest 1 (Primary Booker)</span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-purple-600 px-3 py-1 rounded-full shadow-sm border-0">Primary</span>
                </div>
                <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-y-2" suppressHydrationWarning>
                  {/* Name */}
                  <div className="booking-cell border-0 py-3 px-0   col-span-2" suppressHydrationWarning>
                    <label htmlFor="sg-guest1-name" className="booking-label block text-xs font-black text-purple-400uppercase tracking-wider mb-1.5">Full Legal Name (as spelled on passport) *</label>
                    <input aria-label="Full Legal Name" id="sg-guest1-name" type="text" defaultValue="Michael Scimeca" suppressHydrationWarning className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                  </div>
                  {/* Phone */}
                  <div className="booking-cell border-0 py-3 px-0 md:pr-3" suppressHydrationWarning>
                    <label htmlFor="sg-guest1-phone" className="booking-label block text-xs font-black text-purple-400uppercase tracking-wider mb-1.5">Phone Number *</label>
                    <input aria-label="Phone Number" id="sg-guest1-phone" type="tel" defaultValue="(555) 123-4567" suppressHydrationWarning className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                  </div>
                  {/* Email */}
                  <div className="booking-cell border-0 py-3 px-0 md:pl-3  " suppressHydrationWarning>
                    <label htmlFor="sg-guest1-email" className="booking-label block text-xs font-black text-purple-400uppercase tracking-wider mb-1.5">Email Address *</label>
                    <input aria-label="Email Address" id="sg-guest1-email" type="email" defaultValue="michael@7thheaven.com" suppressHydrationWarning className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                  </div>
                  {/* T-Shirt Size */}
                  <div className="booking-cell border-0 py-3 px-0 md:pr-3   relative" suppressHydrationWarning>
                    <label htmlFor="sg-guest1-tshirt" className="booking-label block text-xs font-black text-purple-400uppercase tracking-wider mb-1.5">T-Shirt Size</label>
                    <select aria-label="T-Shirt Size" id="sg-guest1-tshirt" defaultValue="L" suppressHydrationWarning className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white focus:outline-none cursor-pointer appearance-none rounded-lg">
                      {["S", "M", "L", "XL", "XXL", "3XL"].map(sz => <option key={sz} value={sz} className="bg-[#0c0817] text-white font-bold">{sz}</option>)}
                    </select>
                  </div>
                  {/* Crown & Anchor */}
                  <div className="booking-cell border-0 py-3 px-0 md:pl-3  " suppressHydrationWarning>
                    <label htmlFor="sg-guest1-crown" className="booking-label block text-xs font-black text-purple-400uppercase tracking-wider mb-1.5">Crown & Anchor Number (if applicable)</label>
                    <input aria-label="Loyalty Number" id="sg-guest1-crown" type="text" placeholder="Loyalty Number" suppressHydrationWarning className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 border-0 gap-y-2 mt-2">
                  <div className="booking-cell border-0 py-3 px-0 md:pr-3 flex flex-col justify-between">
                    <span className="booking-label block text-xs font-black text-purple-400uppercase tracking-wider mb-2.5">Do you want travel protection insurance? *</span>
                    <div className="flex gap-3">
                      {["yes", "no"].map(opt => (
                        <button aria-label="Travel protection option" key={opt} type="button" onClick={() => setSgGuestInsurance(opt)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider border-0 transition-colors cursor-pointer shadow-sm ${sgGuestInsurance === opt ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30" : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"}`}>
                          {opt === "yes" ? "Yes, Protect" : "No, Decline"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="booking-cell border-0 py-3 px-0 md:pl-3 flex flex-col justify-between">
                    <span className="booking-label block text-xs font-black text-purple-400 uppercase tracking-wider mb-2.5">Do you want pre-paid gratuities? *</span>
                    <div className="flex gap-3">
                      {["yes", "no"].map(opt => (
                        <button aria-label="Prepaid gratuities option" key={opt} type="button" onClick={() => setSgGuestGratuities(opt)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider border-0 transition-colors cursor-pointer shadow-sm ${sgGuestGratuities === opt ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"}`}>
                          {opt === "yes" ? "Yes, Include" : "No, Exclude"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cruise Policies & Guidelines 3-Column Showcase */}
          <div className="pt-8 border-t border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">Policies & Terms Component</span>
                <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Cruise Booking, Passport & Cancellation Guidelines</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              {/* Column 1: Booking Policy */}
              <div className="bg-transparent border-0 p-0 relative text-left">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">Booking Policy & Best Rate Guarantee</h3>
                </div>
                <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">
                  Book through us to participate & lock in best rates
                </p>
                <p className="text-xs text-white/80 leading-relaxed mb-4">
                  To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation <strong className="text-white font-extrabold">must</strong> be placed under our official group booking.
                </p>
                <ul className="space-y-3 text-xs text-white/80 leading-relaxed mb-6">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400shrink-0 mt-0.5" />
                    <span>We book in multiple ways: Group Rate, Prevailing Rate, Sales, and Promotions.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400shrink-0 mt-0.5" />
                    <span>We match rates & automatically re-roll your room if prices drop before final payment!</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-purple-400shrink-0 mt-0.5" />
                    <span><strong>ALL-INCLUSIVE:</strong> Prices include Cabin, Gratuities, Taxes, and Port Fees (Based on Double Occupancy).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-400shrink-0 mt-0.5" />
                    <span><strong>Group Rate:</strong> Gratuities fully included.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <span><strong>Prevailing Rates:</strong> Gratuities are <strong>NOT included</strong> (Pre-paid gratuities are $129.50 PP • $147 PP for Suites).</span>
                  </li>
                </ul>
                <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                  <p className="text-white/80">
                    <strong>Need help?</strong> <a href="mailto:info@NTDVacations.com" className="text-cyan-400 hover:text-white underline font-bold transition-colors">info@NTDVacations.com</a>
                  </p>
                  <p className="text-white/80">
                    <CreditCard className="w-4 h-4 text-purple-400inline mr-1.5" /><strong>Deposit:</strong> $250 per person to secure cabin.
                  </p>
                  <p className="text-white/80">
                    <Calendar className="w-4 h-4 text-purple-400inline mr-1.5" /><strong>Final Payment:</strong> October 1, 2026.
                  </p>
                </div>
              </div>

              {/* Column 2: Passport Requirements */}
              <div className="bg-transparent border-0 p-0 relative text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Compass className="w-6 h-6 text-purple-400shrink-0" />
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">Passport Requirements</h3>
                </div>
                <p className="text-xs font-black text-purple-400uppercase tracking-widest mb-4">
                  Essential travel document guidelines
                </p>
                <div className="space-y-4 text-xs text-white/80 leading-relaxed">
                  <p>
                    A physical passport book valid for 6 months post-cruise is <strong className="text-white font-extrabold underline inline-block">highly recommended</strong> for all travelers.
                  </p>
                  <p>
                    For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable, but a passport is always the safest method.
                  </p>
                  <p>
                    Visas may be required depending on nationality. Check <a href="http://travel.state.gov" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-extrabold underline hover:text-white inline-block">travel.state.gov</a> to ensure compliance.
                  </p>
                </div>
              </div>

              {/* Column 3: Cancellation Policy */}
              <div className="bg-transparent border-0 p-0 relative text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-purple-400 shrink-0" />
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">Cancellation Policy</h3>
                </div>
                <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4">
                  Refund terms before booking
                </p>
                <div className="space-y-4 text-xs text-white/80 leading-relaxed">
                  <div>
                    <h4 className="font-extrabold text-white uppercase tracking-wider text-xs mb-1">Group Rate Rooms:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Cancel before May 12, 2026: <strong>No penalty</strong></li>
                      <li>May 12, 2026 – July 12, 2026: <strong>$50 pp fee</strong></li>
                      <li>July 13, 2026 – Sept 10, 2026: <strong>$100 pp fee</strong></li>
                      <li>Sept 11, 2026 – Nov 10, 2026: <strong>$200 pp fee</strong></li>
                      <li>After Nov 10, 2026: <strong>50% cost</strong></li>
                      <li>After Dec 10, 2026: <strong>No refund</strong></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white uppercase tracking-wider text-xs mb-1">Prevailing Rate:</h4>
                    <p>Cancel by Oct 10, 2026 for no penalty.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 13: CREW SCHEDULING & CREW GROUPS SYSTEM */}
        <section id="crew-scheduling" className="scroll-mt-36 border-0 rounded-3xl p-0 space-y-8 overflow-hidden">
          <div className="border-b border-white/10 px-0 py-4 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Calendar className="w-6 h-6" /> 13. Crew Scheduling & Crew Groups System
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Complete UI specification and live previews of the OpenShifts grid cell controls, Select Crew Group popover module, Create New Crew Group glass modal, and Shift Drawer candidate assignment cards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* MODULE 1: OpenShifts Cell Controls & Select Crew Group Popover */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-widest">OpenShifts Cell & Group Popover</h3>
                    <p className="text-xs text-white/50">Grid cell action buttons & frosted glass group selection popover</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">Module Preview</span>
                </div>

                {/* OpenShifts Cell Controls Mockup */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">1. OpenShifts Grid Cell Buttons</span>
                  <div className="p-3 bg-[#0d0d14] border border-white/10 rounded-xl space-y-2 max-w-sm">
                    <div className="w-full py-1.5 flex flex-col items-center justify-center border border-dashed border-purple-500/40 hover:border-purple-400 rounded-lg bg-transparent hover:bg-purple-500/10 transition-colors cursor-pointer group shadow-2xs">
                      <span className="text-xs text-purple-400 font-bold group-hover:text-purple-300">+</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 group-hover:text-purple-300 mt-0.5">Add Crew Member</span>
                    </div>

                    <div className="flex gap-2 w-full">
                      <div className="flex-1 py-1.5 flex flex-col items-center justify-center border border-dashed border-purple-500/40 hover:border-purple-400 rounded-lg bg-transparent hover:bg-purple-500/10 transition-colors cursor-pointer group shadow-2xs">
                        <span className="text-xs text-purple-400 font-bold group-hover:text-purple-300">+</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 group-hover:text-purple-300 mt-0.5 text-center leading-tight">Add Crew Group</span>
                      </div>
                      <div className="flex-1 py-1.5 flex flex-col items-center justify-center border border-dashed border-purple-500/40 hover:border-purple-400 rounded-lg bg-transparent hover:bg-purple-500/10 transition-colors cursor-pointer group shadow-2xs">
                        <span className="text-xs text-purple-400 font-bold group-hover:text-purple-300">+</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 group-hover:text-purple-300 mt-0.5 text-center leading-tight">Create Group</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select Crew Group Popover Spec */}
                <div className="space-y-3 mt-6">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">2. Frosted Glass Select Crew Group Popover</span>
                  <div
                    className="w-full max-w-sm bg-[#14151f]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 font-sans"
                    style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                  >
                    <div className="text-sm text-white/90 font-black uppercase tracking-wider px-2 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                      <span>Select Crew Group</span>
                      <span className="text-xs text-white/50 font-bold px-2 py-0.5 bg-white/5 rounded-full border border-white/10">3 saved</span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { name: "Kitchen", count: "4 members" },
                        { name: "Managers", count: "2 members" },
                        { name: "Production Tech Crew", count: "6 members" },
                      ].map((grp, i) => (
                        <button
                          key={grp.name}
                          type="button"
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-sm text-white font-extrabold transition-all cursor-pointer border border-white/10 hover:border-white/20 flex items-center gap-3 bg-transparent"
                        >
                          <span className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-inner">+</span>
                          <div className="min-w-0 flex-1 flex items-center justify-between">
                            <span className="truncate text-sm tracking-wide font-extrabold">{grp.name}</span>
                            <span className="text-[10px] text-white/40 font-semibold">{grp.count}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 2: Create New Crew Group Modal Spec */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">Create New Crew Group Glass Modal</h3>
                  <p className="text-xs text-white/50">Modal container, input spacing, toggle checklist & role preset pills</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">Modal Spec</span>
              </div>

              {/* Modal Frame Mockup */}
              <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-sans">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-transparent flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-black italic tracking-wide text-white">Create New Crew Group</h3>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold mt-0.5">Select members and customize their shift slots</p>
                  </div>
                  <button type="button" className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm">✕</button>
                </div>

                {/* Body */}
                <CustomScrollbar height={384} className="px-4 pt-5 pb-3 space-y-3.5">
                  {/* Group Name input */}
                  <div className="mt-1 space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-white/50 font-extrabold block">Group Name</label>
                    <input
                      type="text"
                      readOnly
                      value="Weekend Tech Crew"
                      className="w-full px-3.5 py-2.5 bg-transparent border border-white/10 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  {/* Member selection list item */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] uppercase tracking-wider text-white/50 font-extrabold block">Select Crew Members</span>
                    <div className="p-3 bg-transparent border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-4 bg-purple-600 rounded-full relative cursor-pointer">
                            <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.25 right-0.5 shadow-sm" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-purple-600 border border-purple-400/40 text-[10px] font-black text-white flex items-center justify-center">
                            AJ
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Abbie Janssen</p>
                            <span className="text-[8px] text-white/40 uppercase font-semibold block">STAGE MANAGER</span>
                          </div>
                        </div>
                      </div>

                      {/* Time Frame box */}
                      <div className="p-2.5 bg-transparent border border-white/10 space-y-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="uppercase tracking-wider text-purple-300 font-extrabold text-[9.5px]">Time Frame 1</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-1.5 bg-white/5 border border-white/10 rounded text-[10px] text-white font-bold">5:00 PM</div>
                          <div className="p-1.5 bg-white/5 border border-white/10 rounded text-[10px] text-white font-bold">10:00 PM</div>
                        </div>

                        {/* Role Pills Showcase */}
                        <div className="pt-1">
                          <span className="uppercase tracking-wider text-white/50 mb-1 block font-bold text-[8px]">Roles / Duties</span>
                          <div className="flex flex-wrap gap-1">
                            {["STAGE HAND", "AUDIO MIX", "LIGHTS", "STAGE MANAGER"].map(preset => {
                              const isSelected = preset === "STAGE MANAGER" || preset === "LIGHTS";
                              return (
                                <span
                                  key={preset}
                                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider border font-sans ${isSelected
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                                    : 'bg-white/5 border-white/10 text-white/70'
                                    }`}
                                >
                                  {isSelected ? `✓ ${preset}` : preset}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CustomScrollbar>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-transparent flex items-center justify-between gap-3 shrink-0">
                  <button type="button" className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/70 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="button" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none shadow-sm shadow-purple-900/30">
                    Save Group
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
