"use client";

import React from "react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Music,
  Film,
  Users,
  Search,
  Camera,
  Sparkles,
  ArrowRightLeft,
  Zap,
  Type,
} from "lucide-react";
import { WHOLE_PAGE_LAYOUT_PRESETS } from "./MediaLayoutTypes";
import { HERO_TYPOGRAPHY_PRESETS } from "./MediaTypographyPresets";
import { ElvaInput } from "@/components/ui/ElvaInput";

interface MediaLayoutControlBarProps {
  activeLayoutId: number;
  setActiveLayoutId: (id: number) => void;
  activeTab: "all" | "band" | "fan";
  setActiveTab: (tab: "all" | "band" | "fan") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalTracks: number;
  onOpenSubmitModal?: () => void;
  onOpenGlassComparison?: () => void;
  onOpenLoopsShowcase?: () => void;
  typographyPresetId?: number;
  setTypographyPresetId?: (id: number) => void;
  onOpenTypographyModal?: () => void;
}

export default function MediaLayoutControlBar({
  activeLayoutId,
  setActiveLayoutId,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  totalTracks,
  onOpenSubmitModal,
  onOpenGlassComparison,
  onOpenLoopsShowcase,
  typographyPresetId,
  setTypographyPresetId,
  onOpenTypographyModal,
}: MediaLayoutControlBarProps) {
  const currentPreset = WHOLE_PAGE_LAYOUT_PRESETS.find((p) => p.id === activeLayoutId) || WHOLE_PAGE_LAYOUT_PRESETS[0];

  return (
    <div className="fixed top-16 sm:top-18 inset-x-4 sm:inset-x-8 lg:inset-x-12 z-40 pointer-events-auto">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-black/75 hover:bg-black/85 border border-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all">
        {/* Left: UI/UX Preset Switcher Dropdown & Chevrons */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/25 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-300">
              LAYOUT
            </span>
          </div>

          <div className="relative flex-1 min-w-0">
            <select
              value={activeLayoutId}
              onChange={(e) => setActiveLayoutId(Number(e.target.value))}
              aria-label="Select Whole Page Layout Architecture"
              className="w-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/15 px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer truncate transition-colors"
            >
              {WHOLE_PAGE_LAYOUT_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white font-medium">
                  #{p.id < 10 ? `0${p.id}` : p.id}: {p.name} [{p.category}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveLayoutId(activeLayoutId > 1 ? activeLayoutId - 1 : WHOLE_PAGE_LAYOUT_PRESETS.length)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-xs cursor-pointer"
              aria-label="Previous layout preset"
              title="Previous layout"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-amber-300 px-1.5 font-bold">
              {activeLayoutId}/{WHOLE_PAGE_LAYOUT_PRESETS.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveLayoutId(activeLayoutId < WHOLE_PAGE_LAYOUT_PRESETS.length ? activeLayoutId + 1 : 1)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-xs cursor-pointer"
              aria-label="Next layout preset"
              title="Next layout"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Typography Preset Quick Switcher (Live In-Place, No Modals) */}
          {setTypographyPresetId && (
            <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-500/10 border border-purple-400/25 text-purple-300 shrink-0">
                <Type className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden xl:inline text-[10px] font-mono font-black uppercase tracking-wider">
                  FONT
                </span>
              </div>
              <div className="relative">
                <select
                  value={typographyPresetId || 1}
                  onChange={(e) => setTypographyPresetId(Number(e.target.value))}
                  aria-label="Select Typography Preset"
                  className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/15 px-2.5 py-1.5 focus:outline-none focus:border-purple-400 cursor-pointer max-w-[140px] sm:max-w-[190px] truncate transition-colors"
                >
                  {HERO_TYPOGRAPHY_PRESETS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-neutral-900 text-white font-medium">
                      #{t.id < 10 ? `0${t.id}` : t.id}: {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setTypographyPresetId(
                      (typographyPresetId || 20) > 1
                        ? (typographyPresetId || 20) - 1
                        : HERO_TYPOGRAPHY_PRESETS.length
                    )
                  }
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-xs cursor-pointer"
                  aria-label="Previous font preset"
                  title="Previous font setup"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-purple-300 px-1 font-bold">
                  {typographyPresetId || 20}/{HERO_TYPOGRAPHY_PRESETS.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTypographyPresetId(
                      (typographyPresetId || 20) < HERO_TYPOGRAPHY_PRESETS.length
                        ? (typographyPresetId || 20) + 1
                        : 1
                    )
                  }
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-xs cursor-pointer"
                  aria-label="Next font preset"
                  title="Next font setup"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {onOpenTypographyModal && (
                <button
                  type="button"
                  onClick={onOpenTypographyModal}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-400/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  title="Open 21 Typography & Color Options Gallery"
                >
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  <span className="hidden xl:inline">21 Fonts Gallery</span>
                  <span className="xl:hidden">Gallery</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveLayoutId(61)}
                className={`px-3 py-1 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  activeLayoutId === 61
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.6)] ring-2 ring-amber-300"
                    : "bg-purple-900/60 hover:bg-purple-800/80 text-amber-300 border border-amber-400/40"
                }`}
                title="Switch to #61 JJettas Signature Moments (Large Video Grid + Transparent Blur)"
              >
                <span>⚡ #61 JJettas Grid</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick Segmented Tab Filter & Search */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                activeTab === "all" ? "bg-purple-600 text-white font-extrabold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({totalTracks})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("band")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1 cursor-pointer ${
                activeTab === "band" ? "bg-[#5500ff] text-white font-extrabold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Band</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fan")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1 cursor-pointer ${
                activeTab === "fan" ? "bg-[#a855f7] text-white font-extrabold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Fan</span>
            </button>
          </div>

          {onOpenGlassComparison && (
            <button
              type="button"
              onClick={onOpenGlassComparison}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              title="Compare Standard CSS Blur vs. QuickLiquid Refractive Glass side by side"
              aria-label="Compare Glass Engines"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden md:inline">Liquid vs. Blur</span>
            </button>
          )}

          {onOpenLoopsShowcase && (
            <button
              type="button"
              onClick={onOpenLoopsShowcase}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              title="Show 3 Bandwidth-Saver Video Loops (30s In)"
              aria-label="Show 6s Video Loops"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">6s Loops</span>
            </button>
          )}

          {onOpenSubmitModal && (
            <button
              type="button"
              onClick={onOpenSubmitModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] border border-white/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Submit your concert photo or video"
              aria-label="Submit Fan Media"
            >
              <Camera className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">+ Submit Media</span>
              <span className="sm:hidden">+ Submit</span>
            </button>
          )}

          <span className="hidden lg:inline-block px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
            {currentPreset.badge}
          </span>
        </div>
      </div>
    </div>
  );
}
