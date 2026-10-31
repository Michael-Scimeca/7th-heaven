"use client";

import React, { useEffect, useCallback } from "react";
import {
  Type,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sliders,
  Palette,
  Maximize,
  Layers,
} from "lucide-react";
import {
  HERO_TYPOGRAPHY_PRESETS,
  type TypographyPreset,
} from "./MediaTypographyPresets";

interface TypographyOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetId: number;
  onSelectPreset: (presetId: number) => void;
  sampleTitle?: string;
  sampleCategory?: string;
  sampleYear?: number;
  sampleSynopsis?: string;
}

export default function TypographyOptionsModal({
  isOpen,
  onClose,
  activePresetId,
  onSelectPreset,
  sampleTitle = "30 Songs in 30 Minutes",
  sampleCategory = "Medley Special",
  sampleYear = 2025,
  sampleSynopsis = "7th Heaven's world-famous continuous medley performed live without a single second of pause. Featuring 30 timeless arena rock hits seamlessly modulated on twin guitars and synthesizers before 20,000 screaming fans.",
}: TypographyOptionsModalProps) {
  const currentPreset =
    HERO_TYPOGRAPHY_PRESETS.find((p) => p.id === activePresetId) ||
    HERO_TYPOGRAPHY_PRESETS[0];

  const handlePrev = useCallback(() => {
    onSelectPreset(
      activePresetId > 1 ? activePresetId - 1 : HERO_TYPOGRAPHY_PRESETS.length
    );
  }, [activePresetId, onSelectPreset]);

  const handleNext = useCallback(() => {
    onSelectPreset(
      activePresetId < HERO_TYPOGRAPHY_PRESETS.length ? activePresetId + 1 : 1
    );
  }, [activePresetId, onSelectPreset]);

  // Arrow key navigation for instant browsing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen) return null;

  // Compute title casing
  let displayTitle = sampleTitle;
  if (currentPreset.casing === "uppercase") {
    displayTitle = sampleTitle.toUpperCase();
  } else if (currentPreset.casing === "titlecase") {
    displayTitle = sampleTitle;
  }

  // Derive human-readable edit metrics
  const getScaleLabel = (classes: string) => {
    if (classes.includes("text-8xl")) return "8XL Ultra-Titan (96px)";
    if (classes.includes("text-7xl")) return "7XL Colossal Display (72px)";
    if (classes.includes("text-6xl")) return "6XL Arena Display (60px)";
    if (classes.includes("text-5xl")) return "5XL Impact Header (48px)";
    return "4XL Bold Header (36px)";
  };

  const getCasingLabel = (casing: string) => {
    switch (casing) {
      case "uppercase":
        return "ALL UPPERCASE (Maximum Arena Impact)";
      case "titlecase":
        return "Title Case (Classic Editorial Balance)";
      case "smallcaps":
        return "All Small-Caps (Literary Distinction)";
      default:
        return "Standard Mixed Casing";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="typography-edit-module-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto pointer-events-auto"
    >
      {/* Semi-transparent backdrop overlay - clicking it closes */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dark Module Container */}
      <div
        className="relative z-10 w-full max-w-5xl rounded-[28px] bg-[#0c0414]/95 border border-purple-500/35 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-3xl overflow-hidden flex flex-col gap-5 text-white p-5 sm:p-7 lg:p-8 my-auto max-h-[94vh]"
      >
        {/* Module Top Bar: Title, Stepper, and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Type className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="typography-edit-module-title"
                  className="text-base sm:text-lg font-black tracking-tight text-white"
                >
                  Typography Edits Module
                </h2>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Option {currentPreset.id} of 20
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live inspection of typographic casing, scale, and color styling edits.
              </p>
            </div>
          </div>

          {/* Stepper & Close */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
                title="Previous Edit (Left Arrow)"
                aria-label="Previous Edit"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-2 text-amber-300">
                #{currentPreset.id < 10 ? `0${currentPreset.id}` : currentPreset.id}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
                title="Next Edit (Right Arrow)"
                aria-label="Next Edit"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close Module (Esc)"
              aria-label="Close Module"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 20 Options Quick-Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {HERO_TYPOGRAPHY_PRESETS.map((p) => {
            const isCurrent = p.id === activePresetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400"
                    : "bg-white/[0.05] hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10"
                }`}
                title={`#${p.id}: ${p.name}`}
              >
                <span className="font-mono text-[10px] font-black">
                  #{p.id < 10 ? `0${p.id}` : p.id}
                </span>
                <span className="hidden sm:inline text-[11px] font-medium truncate max-w-[120px]">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content: The Rendered Edits + The Edits Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch overflow-y-auto pr-1 custom-scrollbar">
          {/* Left Column: Live Rendered Editorial Hero Block with Edits */}
          <div className="lg:col-span-7 rounded-2xl bg-black/60 border border-white/15 p-5 sm:p-6 flex flex-col justify-between gap-5 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-b border-white/10 pb-2.5">
              <span>Previewing Live Hero Block</span>
              <span className="text-amber-400 font-bold">{currentPreset.category}</span>
            </div>

            {/* The Actual Rendered Content with Current Edits */}
            <div className="space-y-4 my-auto">
              {/* Divider Accent */}
              <div className={currentPreset.dividerClasses} />

              {/* Eyebrow */}
              <div className={currentPreset.eyebrowClasses}>
                {sampleCategory} • {sampleYear}
              </div>

              {/* Headline with Live Font Size, Casing, and Color */}
              <h3 className={`${currentPreset.titleClasses} transition-all`}>
                {currentPreset.highlightWords ? (
                  <>
                    <span>{displayTitle.split(" ").slice(0, -2).join(" ")} </span>
                    <span className="text-amber-400">{displayTitle.split(" ").slice(-2).join(" ")}</span>
                  </>
                ) : (
                  displayTitle
                )}
              </h3>

              {/* Synopsis Narrative */}
              <p className={`${currentPreset.synopsisClasses} line-clamp-3 text-xs sm:text-sm`}>
                {sampleSynopsis}
              </p>
            </div>

            {/* Credits & Technical Specs Table */}
            <div className="border-t border-white/15 pt-3.5 space-y-2">
              <h4 className={currentPreset.specsHeaderClasses}>
                Credits & Technical Specs
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div>
                  <span className={currentPreset.specLabelClasses}>ARTIST</span>
                  <span className={currentPreset.specValueClasses}>7th Heaven</span>
                </div>
                <div>
                  <span className={currentPreset.specLabelClasses}>FORMAT</span>
                  <span className={currentPreset.specValueClasses}>4K Multi-Cam Stage Capture • 60fps</span>
                </div>
                <div>
                  <span className={currentPreset.specLabelClasses}>VENUE</span>
                  <span className={`${currentPreset.specValueClasses} truncate block`}>
                    Festival Mainstage Circuit
                  </span>
                </div>
                <div>
                  <span className={currentPreset.specLabelClasses}>AUDIO</span>
                  <span className={`${currentPreset.specValueClasses} truncate block`}>
                    24-Bit Multi-Track Live Arena Mix
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edits Breakdown HUD */}
          <div className="lg:col-span-5 rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="text-xs font-mono font-black uppercase text-purple-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Edits Applied
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Preset #{currentPreset.id}
                </span>
              </div>

              {/* List of Applied Edits */}
              <div className="space-y-3 text-xs">
                {/* Edit 1: Font Scale */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Maximize className="w-3 h-3 text-amber-400" />
                    Font Scale & Hierarchy
                  </span>
                  <span className="font-bold text-white">
                    {getScaleLabel(currentPreset.titleClasses)}
                  </span>
                </div>

                {/* Edit 2: Letter Casing */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Type className="w-3 h-3 text-purple-400" />
                    Letter Casing
                  </span>
                  <span className="font-bold text-white">
                    {getCasingLabel(currentPreset.casing)}
                  </span>
                </div>

                {/* Edit 3: Color Palette & Atmospheric Aura */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3 h-3 text-cyan-400" />
                    Color Palette & Atmosphere
                  </span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                    {currentPreset.colorFamily}
                  </span>
                  <p className="text-[11px] text-zinc-400 pt-0.5 leading-snug">
                    {currentPreset.tagline}
                  </p>
                </div>

                {/* Edit 4: Eyebrow & Specs Styling */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    Eyebrow & Specs Typography
                  </span>
                  <span className="font-bold text-white">
                    Matching {currentPreset.category} System
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply Edit to Site & Close</span>
              </button>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                <span>Use ← / → keys to flip through options</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Next Edit</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
