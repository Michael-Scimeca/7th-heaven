"use client";

import React, { useState, useRef, useEffect } from "react";
import { DotChevronDown } from "@/components/ui/DotArrow";
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export interface FormDropdownShowcaseProps {
  className?: string;
}

export default function FormDropdownShowcase({
  className = "",
}: FormDropdownShowcaseProps) {
  // Shared state for the demos
  const [val1, setVal1] = useState<"no" | "yes">("no");
  const [open1, setOpen1] = useState(false);

  const [val2, setVal2] = useState<"no" | "yes">("no");

  const [val3, setVal3] = useState<"no" | "yes">("no");
  const [open3, setOpen3] = useState(false);

  const [val4, setVal4] = useState<"no" | "yes">("no");

  const [val5, setVal5] = useState<"no" | "yes">("no");
  const [open5, setOpen5] = useState(false);

  const [val6, setVal6] = useState<"no" | "yes">("no");
  const [open6, setOpen6] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen1(false);
        setOpen3(false);
        setOpen5(false);
        setOpen6(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen1(false);
        setOpen3(false);
        setOpen5(false);
        setOpen6(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const options = [
    {
      value: "no" as const,
      label: "NO - I DECLINE INSURANCE",
      sublabel: "Standard cruise cancellation penalties apply",
      shortLabel: "DECLINED",
    },
    {
      value: "yes" as const,
      label: "YES - SEND ME QUOTE OPTIONS",
      sublabel: "Protects against cancellations, delays & medical events",
      shortLabel: "QUOTE REQUESTED",
    },
  ];

  return (
    <div ref={containerRef} className={`flex flex-col gap-10 ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/20 px-3 py-0.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Sliders className="h-3.5 w-3.5" /> Single-Select Form Fields
          </span>
          <span className="text-xs text-white/50">Layout &amp; Styling Sections</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Travel Insurance (Yes / No) Dropdown Layouts
        </h2>
        <p className="text-xs text-white/60 max-w-3xl leading-relaxed">
          Interactive design variations for single-select choice fields and binary form options (e.g. Travel Insurance, Pre-Paid Gratuities, Dining Seatings). Compare layouts ranging from VisionOS frosted capsules to frictionless segmented pills.
        </p>
      </div>

      {/* Grid of Layout Styling Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* ===================================================================== */}
        {/* STYLE 1: VisionOS Frosted Glass Capsule (Global Standard Match)       */}
        {/* ===================================================================== */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold">1</span>
                VisionOS Frosted Glass Capsule
              </span>
              <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                Matches Date Capsule
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Shares the exact semi-translucent purple-indigo gradient body as the calendar capsule with an opaque popover menu.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#120726]/60 p-6 backdrop-blur-md relative min-h-[160px] flex flex-col justify-center">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/70">
                Travel Insurance? (Yes / No)
              </label>

              <div className="relative inline-block self-start">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={open1}
                  onClick={() => setOpen1(!open1)}
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-2xl transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      val1 === "yes" ? "bg-emerald-400" : "bg-white/50"
                    }`}
                  />
                  <span>{options.find((o) => o.value === val1)?.label}</span>
                  <DotChevronDown
                    className={`h-3 w-3 text-white/80 transition-transform duration-300 ${
                      open1 ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open1 && (
                  <div
                    role="listbox"
                    data-lenis-prevent="true"
                    data-lenis-prevent-wheel="true"
                    data-lenis-prevent-touch="true"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-72 rounded-2xl border border-white/20 bg-[#0f0724] py-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  >
                    <div className="flex flex-col">
                      {options.map((opt) => {
                        const isSelected = val1 === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setVal1(opt.value);
                              setOpen1(false);
                            }}
                            className={`flex cursor-pointer flex-col px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {opt.label}
                            </span>
                            <span className="mt-0.5 text-[10px] text-white/50">
                              {opt.sublabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
            <span>Behavior: Dropdown Menu</span>
            <span className="font-mono text-purple-300">Selected: {val1.toUpperCase()}</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STYLE 2: Frictionless Segmented Switch (Zero-Click Toggle)            */}
        {/* ===================================================================== */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">2</span>
                Segmented Capsule Switch
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                1-Click Frictionless
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Eliminates the dropdown popover entirely. Both options are visible side-by-side inside a single connected pill for instant 1-click selection.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#120726]/60 p-6 backdrop-blur-md relative min-h-[160px] flex flex-col justify-center">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/70">
                Travel Insurance? (Yes / No)
              </label>

              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-900/50 p-1 backdrop-blur-2xl self-start">
                <button
                  type="button"
                  onClick={() => setVal2("no")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    val2 === "no"
                      ? "bg-white/20 text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <X className="h-3.5 w-3.5 text-rose-400" />
                  <span>No, Decline</span>
                </button>

                <div className="h-4 w-px bg-white/20 mx-1" />

                <button
                  type="button"
                  onClick={() => setVal2("yes")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    val2 === "yes"
                      ? "bg-emerald-500/30 text-emerald-200 shadow-md border border-emerald-400/30"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Yes, Send Quote</span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
            <span>Behavior: Direct Inline Toggle</span>
            <span className="font-mono text-cyan-300">Selected: {val2.toUpperCase()}</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STYLE 3: Split-Pod Capsule with Status Pill & Detail Chevron          */}
        {/* ===================================================================== */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-bold">3</span>
                Split-Pod Capsule with Status Badge
              </span>
              <span className="rounded-full border border-pink-400/30 bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-200">
                Visual Clarity
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Features an icon on the left, primary text in center, a hairline divider, and an explicit status badge on the right.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#120726]/60 p-6 backdrop-blur-md relative min-h-[160px] flex flex-col justify-center">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/70">
                Travel Insurance? (Yes / No)
              </label>

              <div className="relative inline-block self-start">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={open3}
                  onClick={() => setOpen3(!open3)}
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-purple-900/60 p-1.5 pl-4 backdrop-blur-2xl transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                    {val3 === "yes" ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                    )}
                    <span>{val3 === "yes" ? "Insurance Quote Requested" : "Declining Travel Insurance"}</span>
                  </div>

                  <div className="h-4 w-px bg-white/20 mx-1" />

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      val3 === "yes"
                        ? "bg-emerald-500/30 text-emerald-200"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {val3 === "yes" ? "PROTECTED" : "DECLINED"}
                  </span>

                  <DotChevronDown
                    className={`h-3 w-3 mr-2 text-white/70 transition-transform duration-300 ${
                      open3 ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open3 && (
                  <div
                    role="listbox"
                    data-lenis-prevent="true"
                    data-lenis-prevent-wheel="true"
                    data-lenis-prevent-touch="true"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-80 rounded-2xl border border-white/20 bg-[#0f0724] py-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  >
                    <div className="flex flex-col">
                      {options.map((opt) => {
                        const isSelected = val3 === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setVal3(opt.value);
                              setOpen3(false);
                            }}
                            className={`flex cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="mt-0.5">
                              {opt.value === "yes" ? (
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <ShieldAlert className="h-4 w-4 text-amber-400" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold uppercase tracking-wider">
                                {opt.label}
                              </span>
                              <span className="mt-0.5 text-[10px] text-white/50">
                                {opt.sublabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
            <span>Behavior: Status-Decorated Dropdown</span>
            <span className="font-mono text-pink-300">Selected: {val3.toUpperCase()}</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STYLE 4: Bento Choice Cards (Interactive Side-by-Side Tiles)          */}
        {/* ===================================================================== */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">4</span>
                Bento Interactive Tiles
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                Premium Form UX
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Expands the choice into two interactive card tiles with full policy context, bullet points, and instant visual confirmation.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#120726]/60 p-6 backdrop-blur-md relative min-h-[160px] flex flex-col justify-center">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-white/70">
                Travel Insurance? (Yes / No)
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Decline Tile */}
                <button
                  type="button"
                  onClick={() => setVal4("no")}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    val4 === "no"
                      ? "border-purple-400/60 bg-purple-950/60 text-white shadow-lg shadow-purple-950/50"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <X className="h-3.5 w-3.5 text-rose-400" /> Decline Insurance
                    </span>
                    {val4 === "no" && <span className="h-2 w-2 rounded-full bg-purple-400" />}
                  </div>
                  <p className="mt-1 text-[11px] text-white/50 leading-snug">
                    Standard cruise cancellation rules apply. No medical refund protection.
                  </p>
                </button>

                {/* Accept Tile */}
                <button
                  type="button"
                  onClick={() => setVal4("yes")}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    val4 === "yes"
                      ? "border-emerald-400/60 bg-emerald-950/40 text-white shadow-lg shadow-emerald-950/50"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Send Quote Options
                    </span>
                    {val4 === "yes" && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                  </div>
                  <p className="mt-1 text-[11px] text-white/50 leading-snug">
                    Comprehensive travel, trip delay, and emergency medical protection.
                  </p>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
            <span>Behavior: Side-by-Side Bento Tiles</span>
            <span className="font-mono text-emerald-300">Selected: {val4.toUpperCase()}</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STYLE 5: Minimalist Hairline Border Pill                              */}
        {/* ===================================================================== */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">5</span>
                Minimalist Hairline Pill
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                Subtle &amp; Clean
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Ultra-light border, subtle hover lift, and clean minimalist flush menu with zero gradients.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#120726]/60 p-6 backdrop-blur-md relative min-h-[160px] flex flex-col justify-center">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/70">
                Travel Insurance? (Yes / No)
              </label>

              <div className="relative inline-block self-start">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={open5}
                  onClick={() => setOpen5(!open5)}
                  className="flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                >
                  <span>{options.find((o) => o.value === val5)?.label}</span>
                  <DotChevronDown
                    className={`h-3 w-3 text-white/70 transition-transform duration-300 ${
                      open5 ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open5 && (
                  <div
                    role="listbox"
                    data-lenis-prevent="true"
                    data-lenis-prevent-wheel="true"
                    data-lenis-prevent-touch="true"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-72 rounded-2xl border border-white/20 bg-[#0f0724] py-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  >
                    <div className="flex flex-col">
                      {options.map((opt) => {
                        const isSelected = val5 === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setVal5(opt.value);
                              setOpen5(false);
                            }}
                            className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white/90" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
            <span>Behavior: Minimal Dropdown</span>
            <span className="font-mono text-amber-300">Selected: {val5.toUpperCase()}</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STYLE 6: Neon Cyan-Violet Glow Outline Capsule                        */}
        {/* ===================================================================== */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-box)] border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">6</span>
                Neon Glow Accent Capsule
              </span>
              <span className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                High Impact
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Framed with a cyan-purple neon border glow, paired with dynamic hover glow highlights.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#120726]/60 p-6 backdrop-blur-md relative min-h-[160px] flex flex-col justify-center">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/70">
                Travel Insurance? (Yes / No)
              </label>

              <div className="relative inline-block self-start">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={open6}
                  onClick={() => setOpen6(!open6)}
                  className="flex items-center gap-3 rounded-full border border-cyan-400/40 bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-purple-900/70 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-2xl transition-all hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-[0.98]"
                >
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{options.find((o) => o.value === val6)?.label}</span>
                  <DotChevronDown
                    className={`h-3 w-3 text-cyan-300 transition-transform duration-300 ${
                      open6 ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open6 && (
                  <div
                    role="listbox"
                    data-lenis-prevent="true"
                    data-lenis-prevent-wheel="true"
                    data-lenis-prevent-touch="true"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-72 rounded-2xl border border-cyan-400/30 bg-[#0f0724] py-1.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(6,182,212,0.2)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  >
                    <div className="flex flex-col">
                      {options.map((opt) => {
                        const isSelected = val6 === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setVal6(opt.value);
                              setOpen6(false);
                            }}
                            className={`flex cursor-pointer flex-col px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-cyan-500/20 text-cyan-200"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {opt.label}
                            </span>
                            <span className="mt-0.5 text-[10px] text-white/50">
                              {opt.sublabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
            <span>Behavior: Neon Highlight Dropdown</span>
            <span className="font-mono text-cyan-300">Selected: {val6.toUpperCase()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
