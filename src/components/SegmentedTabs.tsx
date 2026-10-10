"use client";

import React, { useRef, useState, useEffect } from "react";

export interface SegmentedTabOption<T extends string | number = string> {
  id: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedTabsProps<T extends string | number = string> {
  tabs: SegmentedTabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  gridColsClass?: string;
  layout?: "grid" | "flex";
  shape?: "full" | "box";
  size?: "none" | "sm" | "md" | "lg";
  containerPadding?: "none" | "xs" | "sm" | "md";
  noPadding?: boolean;
  ariaLabel?: string;
  variant?: SegmentedTabsVariant;
}

export type SegmentedTabsVariant =
  | "glass"
  | "outline"
  | "light"
  | "neon"
  | "underline"
  | "frosted"
  | "sunset"
  | "minimal"
  // Psychology / design-theory driven
  | "isolation"
  | "tactile"
  | "focus"
  | "spotlight"
  | "elevated"
  | "contrast"
  | "calm"
  | "aurora";

/** Visual recipes. Layout/height/radius stay synced via globals.css. */
export const SEGMENTED_TABS_VARIANTS: Record<
  SegmentedTabsVariant,
  { container: string; pill: string; active: string; idle: string }
> = {
  glass: {
    container:
      "bg-[rgba(0,0,0,0.16)] backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]",
    pill: "top-1 bottom-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 shadow-md shadow-purple-600/40",
    active: "text-white font-semibold",
    idle: "text-white/60 hover:text-white",
  },
  outline: {
    container: "bg-transparent border border-white/20",
    pill: "top-1 bottom-1 border border-purple-400/70 bg-purple-500/10",
    active: "text-purple-200 font-semibold",
    idle: "text-white/55 hover:text-white",
  },
  light: {
    container: "bg-white/10 backdrop-blur-md",
    pill: "top-1 bottom-1 bg-white shadow-lg shadow-black/30",
    active: "text-black font-semibold",
    idle: "text-white/70 hover:text-white",
  },
  neon: {
    container:
      "bg-black/40 border border-purple-500/40 shadow-[0_0_24px_rgba(168,85,247,0.25)]",
    pill: "top-1 bottom-1 border border-fuchsia-400 bg-fuchsia-500/15 shadow-[0_0_16px_rgba(232,121,249,0.6)]",
    active: "text-fuchsia-100 font-semibold",
    idle: "text-white/50 hover:text-fuchsia-200",
  },
  underline: {
    container: "bg-transparent border-b border-white/10 !rounded-none",
    pill: "bottom-0 h-[3px] !rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]",
    active: "text-white font-semibold",
    idle: "text-white/50 hover:text-white",
  },
  frosted: {
    container:
      "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    pill: "top-1 bottom-1 bg-white/15 border border-white/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
    active: "text-white font-semibold",
    idle: "text-white/60 hover:text-white",
  },
  sunset: {
    container:
      "bg-[rgba(0,0,0,0.16)] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]",
    pill: "top-1 bottom-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 shadow-md shadow-rose-500/40",
    active: "text-white font-semibold",
    idle: "text-white/60 hover:text-white",
  },
  minimal: {
    container: "bg-zinc-900/80",
    pill: "top-1 bottom-1 bg-zinc-700",
    active: "text-white font-semibold",
    idle: "text-zinc-400 hover:text-white",
  },

  // ── Psychology / design-theory driven ──

  /** Von Restorff (isolation) effect: the one item that differs is remembered + found fastest. */
  isolation: {
    container:
      "bg-[rgba(0,0,0,0.16)] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]",
    pill: "top-1 bottom-1 bg-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.45)]",
    active: "text-black font-bold",
    idle: "text-white/55 hover:text-white",
  },
  /** Affordance / skeuomorphism: a recessed well + raised key reads as "pressable". */
  tactile: {
    container:
      "bg-black/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.55),inset_0_-1px_0_rgba(255,255,255,0.06)]",
    pill: "top-1 bottom-1 bg-gradient-to-b from-purple-500 to-purple-700 shadow-[0_2px_4px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]",
    active: "text-white font-semibold",
    idle: "text-white/60 hover:text-white",
  },
  /** Cognitive load / Hick's law: mute everything but the current choice. */
  focus: {
    container: "bg-[rgba(0,0,0,0.16)]",
    pill: "top-1 bottom-1 bg-white/10",
    active: "text-white font-semibold",
    idle: "text-white/35 hover:text-white/80",
  },
  /** Metaphor / mental model: a stage spotlight for a live band. */
  spotlight: {
    container:
      "bg-black/40 shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]",
    pill: "top-1 bottom-1 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.45),rgba(192,132,252,0.55)_40%,rgba(88,28,135,0.7)_100%)] shadow-[0_0_28px_rgba(192,132,252,0.55)]",
    active: "text-white font-semibold",
    idle: "text-white/55 hover:text-white",
  },
  /** Gestalt figure-ground: the pill floats above the bar using depth (shadow + lift). */
  elevated: {
    container: "bg-black/50 border border-white/5",
    pill: "top-1 bottom-1 bg-purple-950 border border-purple-400/30 shadow-[0_10px_24px_-6px_rgba(0,0,0,0.8),0_0_0_1px_rgba(168,85,247,0.15)]",
    active: "text-purple-100 font-semibold",
    idle: "text-white/55 hover:text-white",
  },
  /** WCAG AAA contrast: maximum legibility for every tab, every user. */
  contrast: {
    container: "bg-black border border-white/40",
    pill: "top-1 bottom-1 bg-white",
    active: "text-black font-bold",
    idle: "text-white hover:underline underline-offset-4",
  },
  /** Color psychology: blue/cyan signals trust & calm — good for admin / booking. */
  calm: {
    container:
      "bg-[rgba(0,0,0,0.16)] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]",
    pill: "top-1 bottom-1 bg-gradient-to-r from-sky-500 to-cyan-400 shadow-md shadow-cyan-500/30",
    active: "text-slate-950 font-semibold",
    idle: "text-white/60 hover:text-white",
  },
  /** Aesthetic-usability effect: beautiful, gently moving UI is perceived as easier to use. */
  aurora: {
    container:
      "bg-[rgba(0,0,0,0.16)] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]",
    pill: "top-1 bottom-1 segmented-aurora shadow-[0_0_20px_rgba(236,72,153,0.35)]",
    active: "text-white font-semibold",
    idle: "text-white/60 hover:text-white",
  },
};

const getGridColsClass = (count: number): string => {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 6:
      return "grid-cols-6";
    default:
      return "grid-cols-2 sm:grid-cols-4";
  }
};

export const SegmentedTabs = <T extends string | number = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
  gridColsClass,
  layout = "grid",
  shape = "full",
  size = "md",
  containerPadding,
  noPadding = false,
  ariaLabel = "Tab selector",
  variant = "glass",
}: SegmentedTabsProps<T>) => {
  const v = SEGMENTED_TABS_VARIANTS[variant];
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTab),
  );

  const isGrid = layout === "grid";
  const gridClass = isGrid ? (gridColsClass || getGridColsClass(tabs.length)) : "";
  const shapeClass = shape === "box" ? "rounded-[var(--radius-box)]" : "rounded-full";

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [flexPill, setFlexPill] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    if (layout === "flex") {
      const el = tabRefs.current[activeIndex];
      if (el) {
        const left = el.offsetLeft;
        const width = el.offsetWidth;
        setFlexPill((prev) =>
          prev && prev.left === left && prev.width === width
            ? prev
            : { left, width },
        );
      }
    }
  }, [activeIndex, activeTab, layout, tabs]);

  const sizeButtonClasses = {
    none: "p-0 text-sm",
    sm: "px-3 text-xs",
    md: "px-4 text-sm",
    lg: "px-5 text-base",
  }[noPadding ? "none" : size];

  const hasExplicitZeroPadding =
    noPadding ||
    containerPadding === "none" ||
    className.includes("p-0") ||
    className.includes("px-0") ||
    className.includes("py-0");

  const padClass = hasExplicitZeroPadding
    ? "p-0"
    : containerPadding === "sm"
      ? "p-1.5"
      : containerPadding === "md"
        ? "p-2"
        : "p-1";

  const containerVars: Record<string, string | number> = {
    "--active-index": activeIndex,
    "--tab-count": tabs.length,
  };

  if (flexPill) {
    containerVars["--pill-left"] = `${flexPill.left}px`;
    containerVars["--pill-width"] = `${flexPill.width}px`;
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={containerVars as React.CSSProperties}
      className={`segmented-tabs-control relative shrink-0 items-center ${v.container} ${padClass} ${shapeClass} ${isGrid ? `grid ${gridClass}` : "inline-flex"} ${className}`}
    >
      {/* Sliding Active Pill Background */}
      <div
        aria-hidden="true"
        className={`absolute ${shapeClass} ${v.pill} pointer-events-none ${isGrid ? "sliding-pill-indicator" : "sliding-pill-indicator-flex"
          }`}
      />

      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;

        const hasBadge = tab.badge !== undefined && tab.badge !== null;

        return (
          <button
            key={String(tab.id)}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${String(tab.id)}`}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            className={`relative z-10 flex h-full cursor-pointer items-center justify-center ${shapeClass} border-none font-medium whitespace-nowrap transition-colors duration-[250ms] focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 select-none ${sizeButtonClasses} ${isActive ? v.active : v.idle}`}
          >
            {tab.icon && <span className="inline-flex items-center shrink-0 mr-2">{tab.icon}</span>}
            <span className="relative inline-flex items-center">
              {tab.label}
              {hasBadge && (
                <span
                  className={`pointer-events-none absolute -top-1 -right-4.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none transition-colors duration-[250ms] ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60"
                    }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export const SlidingSegmentedTabs = SegmentedTabs;
export default SegmentedTabs;
