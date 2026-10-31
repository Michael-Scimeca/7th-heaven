"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { TWENTY_FILTER_LAYOUTS } from "./MediaFilterLayoutsTypes";
import TopLayerDialog from "./TopLayerDialog";

export interface MediaFilterLayoutSwitcherDockProps {
  activeLayoutId: number;
  onSelectLayout: (id: number) => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export default function MediaFilterLayoutSwitcherDock({
  activeLayoutId,
  onSelectLayout,
  activeFilterCount,
  onResetFilters,
}: MediaFilterLayoutSwitcherDockProps) {
  const [isGridOpen, setIsGridOpen] = useState(false);

  const totalLayouts = TWENTY_FILTER_LAYOUTS.length;
  const currentIndex = TWENTY_FILTER_LAYOUTS.findIndex((l) => l.id === activeLayoutId);
  const current =
    currentIndex !== -1 ? TWENTY_FILTER_LAYOUTS[currentIndex] : TWENTY_FILTER_LAYOUTS[0];
  const isTbwaFilter = activeLayoutId >= 21 && activeLayoutId <= 25;

  const handlePrev = () => {
    const idx =
      (currentIndex - 1 + TWENTY_FILTER_LAYOUTS.length) % TWENTY_FILTER_LAYOUTS.length;
    onSelectLayout(TWENTY_FILTER_LAYOUTS[idx].id);
  };

  const handleNext = () => {
    const idx = (currentIndex + 1) % TWENTY_FILTER_LAYOUTS.length;
    onSelectLayout(TWENTY_FILTER_LAYOUTS[idx].id);
  };

  const handleBracketShortcut = useEffectEvent((key: "[" | "]") => {
    if (key === "[") {
      const idx =
        (currentIndex - 1 + TWENTY_FILTER_LAYOUTS.length) % TWENTY_FILTER_LAYOUTS.length;
      onSelectLayout(TWENTY_FILTER_LAYOUTS[idx].id);
    } else {
      const idx = (currentIndex + 1) % TWENTY_FILTER_LAYOUTS.length;
      onSelectLayout(TWENTY_FILTER_LAYOUTS[idx].id);
    }
  });

  // Support [ and ] keys to cycle quickly when not typing in an input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        handleBracketShortcut(e.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <aside aria-label={`${totalLayouts} Filter Layout Switcher`} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-purple-500/40 bg-zinc-950/90 p-2 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 min-w-0 pl-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-purple-600 text-white shrink-0">
              <SlidersHorizontal className="size-3.5" />
            </span>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-amber-400 shrink-0">
                FILTER {current.number}/{totalLayouts}
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-white truncate">
                {current.name}
              </span>
            </div>
            <span className="hidden lg:inline-flex rounded-full border border-purple-400/30 bg-purple-500/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-purple-300 shrink-0">
              {current.family}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onSelectLayout(isTbwaFilter ? ((activeLayoutId - 21 + 1) % 5) + 21 : 21)
              }
              className={`clip-tbwa-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                isTbwaFilter
                  ? "bg-white text-zinc-950 hover:bg-lime-300"
                  : "bg-lime-300 text-zinc-950 hover:bg-white"
              }`}
              title="Jump to or cycle TBWA\Hakuhodo Filter Architectures (#21–#25)"
            >
              <span>\</span>
              <span>{isTbwaFilter ? `TBWA #${current.number}` : "TBWA (#21–#25)"}</span>
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 font-mono text-xs font-bold text-amber-300 transition-colors cursor-pointer"
                title="Clear active filters"
              >
                <RotateCcw className="size-3" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous filter layout"
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
              title="Previous Filter Setup ( [ )"
            >
              <ChevronLeft className="size-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next filter layout"
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
              title="Next Filter Setup ( ] )"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsGridOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              <Layers className="size-3.5" />
              <span>All {totalLayouts}</span>
            </button>
          </div>
        </div>
      </aside>

      <TopLayerDialog
        open={isGridOpen}
        onClose={() => setIsGridOpen(false)}
        ariaLabel={`${totalLayouts} Filter Layout Architectures`}
        className="m-auto w-full max-w-5xl rounded-[var(--radius-box)]"
      >
        <div className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-[var(--radius-box)] border border-white/20 bg-zinc-950/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-600/20 text-purple-300">
                <SlidersHorizontal className="size-5" />
              </div>
              <div>
                <h2 className="uppercase text-white">
                  {totalLayouts} Completely Different Filter Architectures
                </h2>
                <p className="text-xs text-zinc-400">
                  Click any layout below (or press [ and ] keys) to test all {totalLayouts} filter setups — including TBWA\Hakuhodo #21–#25 — live on the Media Vault.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGridOpen(false)}
              aria-label={`Close ${totalLayouts} filter layouts picker`}
              className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto p-6">
            {TWENTY_FILTER_LAYOUTS.map((layout) => {
              const isSelected = layout.id === activeLayoutId;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => {
                    onSelectLayout(layout.id);
                    setIsGridOpen(false);
                  }}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "border-amber-400 bg-purple-950/50"
                      : "border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-extrabold text-amber-400">
                        #{layout.number}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-xs text-purple-300">
                        {layout.family}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">{layout.name}</span>
                    <p className="text-xs text-zinc-400 line-clamp-3">{layout.desc}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2 font-mono text-xs">
                    <span className="text-zinc-500">SETUP {layout.number}</span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Check className="size-3.5" /> ACTIVE
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-300">Preview →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </TopLayerDialog>
    </>
  );
}
