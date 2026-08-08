"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const InputStyleEditor = dynamic(() => import("@/components/InputStyleEditor"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-xs font-mono text-white/40 bg-black/40 rounded-2xl border border-white/10 animate-pulse">Loading Input Style Editor Studio...</div>
});

const CruiseChat = dynamic(() => import("@/components/CruiseChat"), {
  ssr: false,
  loading: () => <div className="p-12 text-center text-xs font-mono text-white/40 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl rounded-2xl border border-purple-500/30 animate-pulse">Loading Live Cruise Chat Box...</div>
});

const GooeyDropdown = dynamic(() => import("@/components/GooeyDropdown"), {
  ssr: false,
  loading: () => <div className="p-3 text-center text-xs font-mono text-white/40 bg-white/5 rounded-xl border border-white/10">Loading Dropdown...</div>
});

import RoleBadge from "@/components/RoleBadge";
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
} from "lucide-react";

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
  // Interactive Chat Bubble UI Control States
  const [bubbleRadius, setBubbleRadius] = useState<number>(16);
  const [bubbleBorderWidth, setBubbleBorderWidth] = useState<number>(0);
  const [bubbleBorderColor, setBubbleBorderColor] = useState<string>("transparent");
  const [bubbleBgStyle, setBubbleBgStyle] = useState<string>("classic");
  const [bubbleFontSize, setBubbleFontSize] = useState<number>(12);
  const [bubbleColorPalette, setBubbleColorPalette] = useState<string>("default");
  const [customHexColor, setCustomHexColor] = useState<string>("#9333ea");

  // Sample Dropdown options
  const dropdownOptions = [
    { label: "Chicago, IL — House of Blues", value: "chicago", icon: "🎸" },
    { label: "Naperville, IL — Ribfest", value: "naperville", icon: "🤘" },
    { label: "Milwaukee, WI — Summerfest", value: "milwaukee", icon: "⚡" },
    { label: "Las Vegas, NV — Cruise 2026", value: "vegas", icon: "🚢" },
  ];

  const handleCopyToken = (varName: string, val: string) => {
    navigator.clipboard.writeText(`${varName}: ${val};`);
    setCopiedToken(varName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const sections = [
    { id: "typography", label: "1. Typography", icon: Type },
    { id: "colors", label: "2. Color Palette", icon: Palette },
    { id: "buttons", label: "3. Buttons", icon: MousePointer },
    { id: "form-elements", label: "4. Form Elements", icon: Layout },
    { id: "dropdowns", label: "5. Dropdowns", icon: ChevronDown },
    { id: "chat", label: "6. Chat Component", icon: MessageSquare },
    { id: "components", label: "7. Cards & Badges", icon: Layers },
    { id: "borders", label: "8. Borders & Glass", icon: ShieldCheck },
    { id: "spacing", label: "9. Spacing & Padding", icon: Box },
  ];

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

        {/* SECTION 1: TYPOGRAPHY */}
        <section id="typography" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Type className="w-6 h-6" /> 1. Typography System
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Heading levels H1–H6 shown at actual size, weight, and font family (Barlow / Sans), plus body and label hierarchy.
            </p>
          </div>

          {/* Heading Samples */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-purple-400 font-bold">H1 Display — 4.5rem (72px) / Bold 900</span>
                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white mt-1">
                  7TH HEAVEN LIVE
                </h1>
              </div>
              <code className="text-[11px] font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
                text-4xl sm:text-6xl font-black uppercase
              </code>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">H2 Section Heading — 3rem (48px) / Bold 800</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white mt-1">
                  Upcoming Tour Dates & Venues
                </h2>
              </div>
              <code className="text-[11px] font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
                text-3xl sm:text-4xl font-extrabold
              </code>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">H3 Component Title — 2.25rem (36px) / Bold 700</span>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white mt-1">
                  VIP Passenger Cruise Package
                </h3>
              </div>
              <code className="text-[11px] font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
                text-2xl sm:text-3xl font-bold
              </code>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">H4 Card Header — 1.5rem (24px) / Semibold 600</span>
                <h4 className="text-xl sm:text-2xl font-semibold text-white mt-1">
                  House of Blues Sound Check Setup
                </h4>
              </div>
              <code className="text-[11px] font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
                text-xl sm:text-2xl font-semibold
              </code>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-pink-400 font-bold">H5 Subhead — 1.25rem (20px) / Medium 500</span>
                <h5 className="text-lg sm:text-xl font-medium text-white/90 mt-1">
                  Performance Schedule & Stage Specs
                </h5>
              </div>
              <code className="text-[11px] font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
                text-lg sm:text-xl font-medium
              </code>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">H6 Minor Heading — 1rem (16px) / Medium 500</span>
                <h6 className="text-base font-semibold text-white/80 uppercase tracking-widest mt-1">
                  Technical Rider Notes
                </h6>
              </div>
              <code className="text-[11px] font-mono text-white/40 bg-black/40 px-3 py-1.5 rounded-lg self-start md:self-auto border border-white/5">
                text-base font-semibold uppercase tracking-widest
              </code>
            </div>
          </div>

          {/* Body & Text Styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-purple-300 font-bold">Body Large — 1.125rem (18px)</span>
              <p className="text-lg text-white/90 leading-relaxed">
                7th Heaven is an American rock band formed in Chicagoland. High-energy performances with over 30 years of touring history.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-cyan-300 font-bold">Body Base — 1rem (16px)</span>
              <p className="text-base text-white/80 leading-normal">
                Join our official fan directory for exclusive merchandise discounts, meet & greet announcements, and cruise itinerary updates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-emerald-300 font-bold">Small Text — 0.875rem (14px)</span>
              <p className="text-sm text-white/70">
                Doors open at 6:30 PM. All ages event subject to venue policies. Tickets non-refundable unless canceled.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono text-amber-300 font-bold">Caption & Subtle — 0.75rem (12px)</span>
              <p className="text-xs text-white/50 uppercase tracking-wider font-bold">
                Last updated 2 hours ago • Verified by Band Management
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: COLORS */}
        <section id="colors" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
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
              <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest block mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-white/60 font-bold mb-1">Border Main Color</label>
                <input
                  type="text"
                  value={tokens.colors["--color-border-main"] || "rgba(255, 255, 255, 0.08)"}
                  onChange={(e) => updateToken("colors", "--color-border-main", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-white/60 font-bold mb-1">Chat Glow Color</label>
                <input
                  type="text"
                  value={tokens.colors["--chat-glow-color"] || "rgba(168, 85, 247, 0.35)"}
                  onChange={(e) => updateToken("colors", "--chat-glow-color", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: BUTTONS */}
        <section id="buttons" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
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
                <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] transition">
                  Default
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.6)] ring-2 ring-purple-400 transition">
                  Hover / Focus State
                </button>
                <button disabled className="px-5 py-2.5 rounded-xl bg-purple-600/30 text-white/40 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed border border-white/5">
                  Disabled
                </button>
                <button disabled className="px-5 py-2.5 rounded-xl bg-purple-600/50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-wait">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                </button>
              </div>
            </div>

            {/* Cyan Neon */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Cyan Neon Action</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.4)] transition">
                  Default
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(34,211,238,0.7)] ring-2 ring-cyan-200 transition">
                  Hover / Active
                </button>
                <button disabled className="px-5 py-2.5 rounded-xl bg-cyan-400/20 text-cyan-400/40 font-black text-xs uppercase tracking-wider cursor-not-allowed border border-cyan-500/10">
                  Disabled
                </button>
              </div>
            </div>

            {/* Secondary Glass */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider">Secondary Glass</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition">
                  Glass Default
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white font-bold text-xs ring-2 ring-white/20">
                  Glass Hover
                </button>
                <button disabled className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white/30 font-bold text-xs cursor-not-allowed">
                  Glass Disabled
                </button>
              </div>
            </div>

            {/* Ghost & Danger */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Ghost & Danger Buttons</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition">
                  Ghost Button
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-extrabold text-xs uppercase tracking-wider transition">
                  Danger Action
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FORM ELEMENTS */}
        <section id="form-elements" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
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
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Text Inputs</h3>

              {/* Default */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Default State</label>
                <input
                  type="text"
                  placeholder="Enter full name..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/40 text-xs font-medium outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
                />
              </div>

              {/* Focused / Active */}
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Focused / Active State</label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-cyan-400 text-white/80 text-xs font-medium outline-none ring-2 ring-cyan-400/40 transition"
                />
              </div>

              {/* Error */}
              <div>
                <label className="block text-xs font-bold text-red-400 mb-1">Error State</label>
                <input
                  type="text"
                  value="invalid_email_format"
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/50 text-red-300 text-xs outline-none focus:ring-1 focus:ring-red-400/50 transition"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white/30 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            {/* Search & Textarea */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Search & Textarea Controls</h3>

              {/* Search input with icon */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Search Bar</label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3.5 text-gray-400 z-10 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search shows, venues, tours, or keywords..."
                    style={{ paddingLeft: "3rem" }}
                    className="no-bg-icon w-full pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/50 text-xs font-medium outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition"
                  />
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Textarea Input</label>
                <textarea
                  rows={4}
                  value={textareaInput}
                  onChange={(e) => setTextareaInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/40 text-xs font-medium outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition resize-none"
                />
              </div>
            </div>

            {/* Checkboxes & Radios */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Checkboxes & Radio Controls</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkboxState}
                    onChange={(e) => setCheckboxState(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-xs text-white/90 font-bold">Subscribe to official band newsletter announcements</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    className="w-4 h-4 rounded border-white/20 bg-white/10 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-xs text-white/60">Unchecked state</span>
                </label>

                <label className="flex items-center gap-3 cursor-not-allowed opacity-40">
                  <input
                    type="checkbox"
                    disabled
                    checked={true}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 cursor-not-allowed"
                  />
                  <span className="text-xs text-white/40">Disabled checked state</span>
                </label>
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
                  <button
                    type="button"
                    onClick={() => setToggleState(!toggleState)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${toggleState ? "bg-purple-600" : "bg-white/20"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${toggleState ? "translate-x-6" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div>
                    <span className="text-xs font-bold text-white/60 block">Disabled Toggle (Off)</span>
                    <span className="text-[11px] text-white/40 block">System locked</span>
                  </div>
                  <div className="w-12 h-6 rounded-full p-1 bg-white/10">
                    <div className="w-4 h-4 rounded-full bg-white/40 translate-x-0" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 5: DROPDOWNS */}
        <section id="dropdowns" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <ChevronDown className="w-6 h-6" /> 5. Standardized Global Dropdowns
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Standardized dropdown implementation using our global border standard <code className="text-cyan-300 font-mono">rgba(255,255,255,0.08)</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Gooey Dropdown Neon Theme */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Gooey Dropdown (Neon Theme)</h3>
              <GooeyDropdown
                options={dropdownOptions}
                value={selectedDropdown}
                onChange={setSelectedDropdown}
                theme="neon"
                id="styleguide-neon"
              />
            </div>

            {/* Gooey Dropdown Dark Theme */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Gooey Dropdown (Dark Theme)</h3>
              <GooeyDropdown
                options={dropdownOptions}
                value={selectedDropdown}
                onChange={setSelectedDropdown}
                theme="dark"
                id="styleguide-dark"
              />
            </div>

            {/* Gooey Dropdown Disabled */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Disabled Dropdown</h3>
              <GooeyDropdown
                options={dropdownOptions}
                value={selectedDropdown}
                onChange={setSelectedDropdown}
                disabled={true}
                id="styleguide-disabled"
              />
            </div>

          </div>
        </section>

        {/* SECTION 6: CHAT BOX COMPONENT */}
        <section id="chat" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" /> 6. Live Chat Box Component
              </h2>
              <p className="text-white/60 text-xs mt-1">
                Live interactive preview of <code className="text-purple-300 font-mono">CruiseChat</code> with real-time UI controls for bubble radius, borders, and fills.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setBubbleRadius(16);
                setBubbleBorderWidth(0);
                setBubbleBorderColor("transparent");
                setBubbleBgStyle("classic");
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold transition shrink-0"
            >
              Reset Chat Controls
            </button>
          </div>

          {/* Chat Bubble Customizer UI Control Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Chat Bubble UI Controls studio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              
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
                <div className="flex items-center gap-1.5 pt-1">
                  {[0, 8, 16, 24].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBubbleRadius(r)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${
                        bubbleRadius === r
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
                <div className="flex items-center gap-1.5 pt-1">
                  {[0, 1, 2, 3].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setBubbleBorderWidth(w)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${
                        bubbleBorderWidth === w
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
                <div className="flex items-center gap-1.5 pt-1">
                  {[10, 12, 14, 16].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBubbleFontSize(s)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition ${
                        bubbleFontSize === s
                          ? "bg-emerald-600 border-emerald-400 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Color Palette Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">Color Palette Swatches</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: "Default", val: "default", bg: "#7e22ce" },
                    { label: "Purple", val: "#9333ea", bg: "#9333ea" },
                    { label: "Cyan", val: "#06b6d4", bg: "#06b6d4" },
                    { label: "Pink", val: "#ec4899", bg: "#ec4899" },
                    { label: "Emerald", val: "#10b981", bg: "#10b981" },
                    { label: "Amber", val: "#f59e0b", bg: "#f59e0b" },
                    { label: "Rose", val: "#f43f5e", bg: "#f43f5e" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setBubbleColorPalette(p.val)}
                      style={{ backgroundColor: p.bg }}
                      title={p.label}
                      className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${
                        bubbleColorPalette === p.val
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
                    }}
                    className="w-6 h-6 rounded-md border border-white/20 bg-transparent cursor-pointer"
                    title="Custom Color Picker"
                  />
                  <span className="text-[10px] font-mono text-white/60 uppercase">{bubbleColorPalette}</span>
                </div>
              </div>

              {/* 5. Background Style Themes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">Background Fill Theme</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Classic", val: "classic" },
                    { label: "Glassmorphic", val: "glass" },
                    { label: "Midnight", val: "midnight" },
                    { label: "Vibrant Neon", val: "neon" },
                  ].map((bg) => (
                    <button
                      key={bg.val}
                      type="button"
                      onClick={() => setBubbleBgStyle(bg.val)}
                      className={`py-1.5 px-2 rounded text-[10px] font-bold border truncate transition ${
                        bubbleBgStyle === bg.val
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
              ['--chat-bubble-member-border' as any]: bubbleBorderColor,
              ['--chat-bubble-self-border' as any]: bubbleBorderColor,
              ['--chat-bubble-admin-border' as any]: bubbleBorderColor,
              ['--chat-bubble-member-bg' as any]:
                bubbleColorPalette !== 'default'
                  ? bubbleColorPalette
                  : bubbleBgStyle === 'glass' ? 'rgba(8, 145, 178, 0.35)' : bubbleBgStyle === 'midnight' ? '#0f172a' : bubbleBgStyle === 'neon' ? '#0284c7' : 'rgba(22, 101, 124, 0.75)',
              ['--chat-bubble-self-bg' as any]:
                bubbleColorPalette !== 'default'
                  ? bubbleColorPalette
                  : bubbleBgStyle === 'glass' ? 'rgba(126, 34, 206, 0.35)' : bubbleBgStyle === 'midnight' ? '#1e1b4b' : bubbleBgStyle === 'neon' ? '#9333ea' : 'rgba(126, 34, 206, 0.85)',
              ['--chat-bubble-admin-bg' as any]:
                bubbleColorPalette !== 'default'
                  ? bubbleColorPalette
                  : bubbleBgStyle === 'glass' ? 'rgba(46, 16, 101, 0.45)' : bubbleBgStyle === 'midnight' ? '#2e1065' : bubbleBgStyle === 'neon' ? '#581c87' : 'rgba(46, 16, 101, 0.95)',
            }}
            className="rounded-2xl border border-white/10 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.25)]"
          >
            <CruiseChat activeChannel="general" />
          </div>
        </section>

        {/* SECTION 7: CARDS & BADGES */}
        <section id="components" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
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
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Role & Section Badges</h3>
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
              <button className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-bold transition">
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
                className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase transition flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" /> Launch Login Modal
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 8: BORDERS & GLASS */}
        <section id="borders" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> 8. Border & Glass Standard
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

        {/* SECTION 9: SPACING & PADDING TOKENS */}
        <section id="spacing" className="scroll-mt-36 bg-[#090616] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Box className="w-6 h-6" /> 9. Spacing & Page Padding Scale
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Standardized responsive page padding scale: <code className="text-purple-300 font-mono">px-6 sm:px-8 lg:px-[42px]</code> (24px Mobile / 32px Tablet / 42px Desktop).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">Mobile Page Padding</span>
              <div className="text-2xl font-black text-white">24px (<code className="text-xs text-white/50 font-mono">px-6</code>)</div>
              <p className="text-xs text-white/50">Used on screens below 640px viewport width.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400">Tablet Page Padding</span>
              <div className="text-2xl font-black text-white">32px (<code className="text-xs text-white/50 font-mono">px-8</code>)</div>
              <p className="text-xs text-white/50">Used on screens between 640px and 1024px viewport width.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">Desktop Page Padding</span>
              <div className="text-2xl font-black text-white">42px (<code className="text-xs text-white/50 font-mono">lg:px-[42px]</code>)</div>
              <p className="text-xs text-white/50">Standardized max desktop horizontal container padding.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
