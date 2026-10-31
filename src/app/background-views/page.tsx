"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { BACKGROUND_VIEW_PRESETS, type BackgroundViewPreset } from "@/components/background/backgroundPresets";
import {
  BackgroundViewRenderer,
} from "@/components/background/BackgroundViewRenderer";
import {
  BG_STORAGE_KEY,
  BG_EVENT_KEY,
  getActiveBgView,
  setActiveBgView,
} from "@/components/background/BackgroundViewsSwitcher";
import { Sparkles, Check, ArrowRight, ShieldCheck, Eye, Layers } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";

export default function BackgroundViewsPage() {
  const [activeView, setActiveView] = useState("arena-concert");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    setActiveView(getActiveBgView());

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<{ viewId: string }>).detail;
      if (detail?.viewId) setActiveView(detail.viewId);
    };

    window.addEventListener(BG_EVENT_KEY, handleChange);
    return () => window.removeEventListener(BG_EVENT_KEY, handleChange);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen text-white pt-28 pb-32 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black tracking-widest uppercase text-[#eeac1a] mb-3">
          Site-Wide Background Directions
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-5">
          5 Background Views
        </h1>
        <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6">
          Compare 5 custom visual atmospheric styles designed for 7th Heaven. Click{" "}
          <strong className="text-white">“Activate View”</strong> on any option to apply it live
          across the entire site.
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <Layers className="w-4 h-4 text-[#eeac1a]" />
          <span className="text-xs font-medium text-white/80">
            Currently Active Site-Wide:{" "}
            <span className="font-bold text-[#eeac1a]">
              {BACKGROUND_VIEW_PRESETS.find((p) => p.id === activeView)?.name}
            </span>
          </span>
        </div>
      </div>

      {/* ── 5 VIEWS COMPARISON GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {BACKGROUND_VIEW_PRESETS.map((preset, index) => {
          const isActive = preset.id === activeView;
          return (
            <div
              key={preset.id}
              className={`group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 ${
                isActive
                  ? "border-[#eeac1a] bg-white/[0.07] shadow-[0_0_40px_rgba(238,172,26,0.2)] ring-1 ring-[#eeac1a]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              {/* Live Miniature Viewport Preview */}
              <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-white/10 bg-black">
                <BackgroundViewRenderer viewId={preset.id} />

                {/* Overlaid UI Mockup to demonstrate contrast */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {preset.badge}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#eeac1a] text-black">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/15 bg-black/40 backdrop-blur-md p-3">
                    <div className="h-2 w-16 bg-white/60 rounded mb-1.5" />
                    <div className="h-1.5 w-28 bg-white/30 rounded" />
                  </div>
                </div>
              </div>

              {/* Card Meta & Description */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-black uppercase tracking-wider text-white/50 mb-1">
                  View 0{index + 1}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                  {preset.name.replace(/^[0-9.]+\s*/, "")}
                </h3>
                <p className="text-xs font-semibold text-[#eeac1a] mb-3">
                  {preset.tagline}
                </p>
                <p className="text-xs text-white/70 leading-relaxed mb-6 flex-1">
                  {preset.description}
                </p>

                {/* Color Swatch Strip */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] uppercase font-bold text-white/40">Palette:</span>
                  <div className="flex items-center gap-1.5">
                    {preset.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    setActiveView(preset.id);
                    setActiveBgView(preset.id);
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-[#eeac1a] text-black shadow-[0_0_20px_rgba(238,172,26,0.3)] hover:brightness-110"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-4 h-4" />
                      Currently Active
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#eeac1a]" />
                      Activate This View
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RETURN TO MEDIA VAULT LINK ── */}
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl text-center">
        <h3 className="text-xl font-bold mb-2">Ready to test with live band media?</h3>
        <p className="text-sm text-white/70 mb-5 max-w-lg">
          Head back to the Media Vault or Home page to see how your active background looks under
          full-bleed video cards and arena concerts.
        </p>
        <TransitionLink
          href="/media"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-[#eeac1a] transition-colors"
        >
          <span>Return to Media Vault</span>
          <ArrowRight className="w-4 h-4" />
        </TransitionLink>
      </div>
    </div>
  );
}
