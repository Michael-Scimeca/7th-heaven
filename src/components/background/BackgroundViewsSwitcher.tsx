"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { BACKGROUND_VIEW_PRESETS, type BackgroundViewPreset } from "./backgroundPresets";
import { Layers, Check, ChevronDown, ChevronUp, Sparkles, ExternalLink } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";

export const BG_STORAGE_KEY = "7h_active_bg_view";
export const BG_EVENT_KEY = "7h_bg_view_changed";

export function getActiveBgView(): string {
  if (typeof window === "undefined") return "arena-concert";
  try {
    return localStorage.getItem(BG_STORAGE_KEY) || "arena-concert";
  } catch {
    return "arena-concert";
  }
}

export function setActiveBgView(viewId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BG_STORAGE_KEY, viewId);
    window.dispatchEvent(new CustomEvent(BG_EVENT_KEY, { detail: { viewId } }));
  } catch {
    // ignore
  }
}

export default function BackgroundViewsSwitcher() {
  const [activeView, setActiveView] = useState("arena-concert");
  const [expanded, setExpanded] = useState(false);
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

  const currentPreset =
    BACKGROUND_VIEW_PRESETS.find((p) => p.id === activeView) || BACKGROUND_VIEW_PRESETS[0];

  return (
    <div
      id="bg-views-switcher-dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9990] flex flex-col items-center pointer-events-auto"
    >
      {/* Expanded Tray */}
      {expanded && (
        <div className="mb-3 w-[92vw] max-w-[840px] rounded-2xl border border-white/15 bg-black/80 backdrop-blur-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#eeac1a]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                5 Background Views (Site-Wide Preview)
              </span>
            </div>
            <TransitionLink
              href="/background-views"
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-white transition-colors"
            >
              <span>Side-by-Side Gallery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </TransitionLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {BACKGROUND_VIEW_PRESETS.map((preset) => {
              const isSelected = preset.id === activeView;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActiveView(preset.id);
                    setActiveBgView(preset.id);
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[#eeac1a] bg-white/10 shadow-[0_0_20px_rgba(238,172,26,0.25)]"
                      : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-[#eeac1a] text-black" : "bg-white/10 text-white/70"
                      }`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#eeac1a]" />}
                  </div>

                  <span className="text-xs font-bold text-white line-clamp-1 mb-1">
                    {preset.name}
                  </span>

                  <span className="text-[11px] text-white/60 line-clamp-2 leading-tight mb-2.5">
                    {preset.tagline}
                  </span>

                  {/* Color Swatch Dots */}
                  <div className="flex items-center gap-1.5 mt-auto">
                    {preset.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/75 backdrop-blur-xl px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2.5 text-xs text-white/90 hover:text-white cursor-pointer select-none"
        >
          <Layers className="w-4 h-4 text-[#eeac1a]" />
          <span className="font-semibold text-white/90">
            Background: <span className="text-[#eeac1a] font-bold">{currentPreset.name}</span>
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-white/60" />
          ) : (
            <ChevronUp className="w-4 h-4 text-white/60" />
          )}
        </button>

        {/* Quick Cycle Button */}
        <div className="h-4 w-[1px] bg-white/20 mx-1" />
        <button
          onClick={() => {
            const currentIndex = BACKGROUND_VIEW_PRESETS.findIndex((p) => p.id === activeView);
            const nextPreset =
              BACKGROUND_VIEW_PRESETS[(currentIndex + 1) % BACKGROUND_VIEW_PRESETS.length];
            setActiveView(nextPreset.id);
            setActiveBgView(nextPreset.id);
          }}
          className="text-[11px] font-bold uppercase tracking-wider text-purple-400 hover:text-white cursor-pointer"
          title="Cycle to next background view"
        >
          Next View ↻
        </button>
      </div>
    </div>
  );
}
