"use client";

import React, { useState } from "react";
import { Sparkles, Wine, Music, Flame, Check, Shield } from "lucide-react";

export type ToggleLayoutId =
  | "inline-chip"
  | "corner-jewel"
  | "discrete-capsule"
  | "stacked-editorial"
  | "stage-neon"
  | "minimal-underline"
  | "tactile-keypad"
  | "symmetrical-split"
  | "metric-hero"
  | "aurora-glass";

interface ToggleLayoutShowcaseProps {
  onSelectLayout?: (layoutId: ToggleLayoutId) => void;
  selectedLayout?: ToggleLayoutId;
}

export default function ToggleLayoutShowcase({
  onSelectLayout,
  selectedLayout = "inline-chip",
}: ToggleLayoutShowcaseProps) {
  // Independent state for each layout demo so user can test clicking them freely
  const [activeTabs, setActiveTabs] = useState<Record<string, "bars" | "entertainment">>({
    layout1: "bars",
    layout2: "bars",
    layout3: "bars",
    layout4: "bars",
    layout5: "bars",
    layout6: "bars",
    layout7: "bars",
    layout8: "bars",
    layout9: "bars",
    layout10: "bars",
  });

  const setTab = (layoutKey: string, val: "bars" | "entertainment") => {
    setActiveTabs((prev) => ({ ...prev, [layoutKey]: val }));
  };

  const layouts = [
    {
      id: "inline-chip" as const,
      num: 1,
      name: "Inline Pill Chip (The Clean Pro)",
      tag: "Recommended for Balance",
      desc: "Badges are self-contained inline chips with dynamic contrast. Zero overlap, perfect breathing room, responsive on all screens.",
      render: () => {
        const current = activeTabs.layout1;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 1: Inline Pill Chip"
            className="inline-flex items-center rounded-full bg-black/40 border border-white/10 p-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout1", "bars")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>Bars &amp; Clubs</span>
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight transition-colors ${
                  current === "bars"
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                20
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout1", "entertainment")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>Entertainment</span>
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight transition-colors ${
                  current === "entertainment"
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "corner-jewel" as const,
      num: 2,
      name: "Corner Jewel Badge (Padded Apple Vision)",
      tag: "Elevated Depth",
      desc: "Floating circular notification jewel with a micro-halo ring. Ample capsule padding ensures the badge never clips the outer frame.",
      render: () => {
        const current = activeTabs.layout2;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 2: Corner Jewel Badge"
            className="inline-flex items-center rounded-full bg-purple-950/40 border border-white/10 p-2 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout2", "bars")}
              className={`relative flex cursor-pointer items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-purple-600/40"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Bars &amp; Clubs</span>
              <span
                className={`pointer-events-none absolute -top-1.5 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none shadow-md ring-2 ring-purple-950/80 transition-all ${
                  current === "bars"
                    ? "bg-white text-purple-900 shadow-white/30"
                    : "bg-white/20 text-white/70 backdrop-blur-sm"
                }`}
              >
                20
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout2", "entertainment")}
              className={`relative flex cursor-pointer items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-purple-600/40"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Entertainment</span>
              <span
                className={`pointer-events-none absolute -top-1.5 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none shadow-md ring-2 ring-purple-950/80 transition-all ${
                  current === "entertainment"
                    ? "bg-white text-purple-900 shadow-white/30"
                    : "bg-white/20 text-white/70 backdrop-blur-sm"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "discrete-capsule" as const,
      num: 3,
      name: "Discrete Capsule Switch (Hairline Divider)",
      tag: "Frictionless & Robust",
      desc: "Inspired by the Cruise Insurance toggle: separate discrete buttons separated by a vertical frosted hairline divider.",
      render: () => {
        const current = activeTabs.layout3;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 3: Discrete Capsule Switch"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-purple-900/60 border border-white/10 p-1.5 backdrop-blur-2xl"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout3", "bars")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-purple-600/40"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>Bars &amp; Clubs</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  current === "bars" ? "bg-white/25 text-white" : "bg-white/10 text-white/60"
                }`}
              >
                20
              </span>
            </button>

            <div className="mx-1.5 h-4 w-px bg-white/20" />

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout3", "entertainment")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-purple-600/40"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>Entertainment</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  current === "entertainment" ? "bg-white/25 text-white" : "bg-white/10 text-white/60"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "stacked-editorial" as const,
      num: 4,
      name: "Stacked Editorial (Title + Count Subtext)",
      tag: "Information Density",
      desc: "Vertical stack inside each pill. Main title in bold with uppercase venue count subtitle below for high visual hierarchy.",
      render: () => {
        const current = activeTabs.layout4;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 4: Stacked Editorial"
            className="inline-flex items-center rounded-2xl bg-black/40 border border-white/10 p-1.5 backdrop-blur-xl"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout4", "bars")}
              className={`flex cursor-pointer flex-col items-center rounded-xl px-5 py-2 transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-900/40"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-sm font-bold tracking-tight">Bars &amp; Clubs</span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  current === "bars" ? "text-purple-200" : "text-white/40"
                }`}
              >
                20 Venues
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout4", "entertainment")}
              className={`flex cursor-pointer flex-col items-center rounded-xl px-5 py-2 transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-900/40"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-sm font-bold tracking-tight">Entertainment</span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  current === "entertainment" ? "text-purple-200" : "text-white/40"
                }`}
              >
                20 Attractions
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "stage-neon" as const,
      num: 5,
      name: "Stage Neon + Iconography",
      tag: "Live Band Atmosphere",
      desc: "Icons paired with category names (cocktail glass & music note) + a vibrant neon glow for high entertainment presence.",
      render: () => {
        const current = activeTabs.layout5;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 5: Stage Neon + Iconography"
            className="inline-flex items-center rounded-full bg-black/60 border border-fuchsia-500/30 p-1.5 shadow-[0_0_24px_rgba(217,70,239,0.15)]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout5", "bars")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_16px_rgba(217,70,239,0.5)] border border-fuchsia-300/40"
                  : "text-white/60 hover:text-fuchsia-200 hover:bg-white/[0.04]"
              }`}
            >
              <Wine className="h-3.5 w-3.5 shrink-0" />
              <span>Bars &amp; Clubs</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  current === "bars"
                    ? "bg-black/30 text-fuchsia-100"
                    : "bg-fuchsia-950/40 text-fuchsia-400"
                }`}
              >
                20
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout5", "entertainment")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_16px_rgba(217,70,239,0.5)] border border-fuchsia-300/40"
                  : "text-white/60 hover:text-fuchsia-200 hover:bg-white/[0.04]"
              }`}
            >
              <Music className="h-3.5 w-3.5 shrink-0" />
              <span>Entertainment</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  current === "entertainment"
                    ? "bg-black/30 text-fuchsia-100"
                    : "bg-fuchsia-950/40 text-fuchsia-400"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "minimal-underline" as const,
      num: 6,
      name: "Minimalist Sliding Underline",
      tag: "Editorial & Sleek",
      desc: "Zero container well. A clean typographic layout with glowing underline indicator and badge tags.",
      render: () => {
        const current = activeTabs.layout6;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 6: Minimalist Sliding Underline"
            className="inline-flex items-center gap-6 border-b border-white/10 pb-1"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout6", "bars")}
              className="relative flex cursor-pointer items-center gap-2 pb-2 text-sm font-semibold transition-colors"
            >
              <span className={current === "bars" ? "text-white font-bold" : "text-white/50 hover:text-white"}>
                Bars &amp; Clubs
              </span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  current === "bars"
                    ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                    : "bg-white/5 text-white/40"
                }`}
              >
                20
              </span>
              {current === "bars" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout6", "entertainment")}
              className="relative flex cursor-pointer items-center gap-2 pb-2 text-sm font-semibold transition-colors"
            >
              <span className={current === "entertainment" ? "text-white font-bold" : "text-white/50 hover:text-white"}>
                Entertainment
              </span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  current === "entertainment"
                    ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                    : "bg-white/5 text-white/40"
                }`}
              >
                20
              </span>
              {current === "entertainment" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </button>
          </div>
        );
      },
    },

    {
      id: "tactile-keypad" as const,
      num: 7,
      name: "Tactile Keypad (Skeuomorphic Affordance)",
      tag: "Maximum Click Sensation",
      desc: "Recessed dark container well with raised, top-lit pill button and recessed badge wells. Physically screams 'press me'.",
      render: () => {
        const current = activeTabs.layout7;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 7: Tactile Keypad"
            className="inline-flex items-center rounded-full bg-black/60 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),inset_0_-1px_0_rgba(255,255,255,0.08)]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout7", "bars")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all duration-150 active:scale-[0.97] ${
                current === "bars"
                  ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Bars &amp; Clubs</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  current === "bars"
                    ? "bg-black/30 text-purple-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                    : "bg-black/20 text-white/50"
                }`}
              >
                20
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout7", "entertainment")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all duration-150 active:scale-[0.97] ${
                current === "entertainment"
                  ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Entertainment</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  current === "entertainment"
                    ? "bg-black/30 text-purple-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                    : "bg-black/20 text-white/50"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "symmetrical-split" as const,
      num: 8,
      name: "Symmetrical 50/50 Balanced Grid",
      tag: "Equal Width Harmony",
      desc: "Both tabs strictly occupy 50% container width with justified labels and right-anchored count badges.",
      render: () => {
        const current = activeTabs.layout8;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 8: Symmetrical Split"
            className="grid w-full max-w-md grid-cols-2 rounded-full bg-black/40 border border-white/10 p-1 backdrop-blur-xl"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout8", "bars")}
              className={`flex cursor-pointer items-center justify-between rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-purple-600/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Bars &amp; Clubs</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  current === "bars" ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                }`}
              >
                20
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout8", "entertainment")}
              className={`flex cursor-pointer items-center justify-between rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-purple-600/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Entertainment</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  current === "entertainment" ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },

    {
      id: "metric-hero" as const,
      num: 9,
      name: "Metric Hero (Count-First Pill)",
      tag: "Data-Driven Discovery",
      desc: "Puts the numerical counter first in a dedicated high-contrast badge block. Ideal when comparing sizes or volumes.",
      render: () => {
        const current = activeTabs.layout9;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 9: Metric Hero"
            className="inline-flex items-center rounded-full bg-black/40 border border-white/10 p-1.5 backdrop-blur-xl"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout9", "bars")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span
                className={`flex h-5 w-6 items-center justify-center rounded-md text-[11px] font-black ${
                  current === "bars"
                    ? "bg-white text-purple-900 shadow-sm"
                    : "bg-white/10 text-white/70"
                }`}
              >
                20
              </span>
              <span>Bars &amp; Clubs</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout9", "entertainment")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span
                className={`flex h-5 w-6 items-center justify-center rounded-md text-[11px] font-black ${
                  current === "entertainment"
                    ? "bg-white text-purple-900 shadow-sm"
                    : "bg-white/10 text-white/70"
                }`}
              >
                20
              </span>
              <span>Entertainment</span>
            </button>
          </div>
        );
      },
    },

    {
      id: "aurora-glass" as const,
      num: 10,
      name: "Ambient Aurora Glass (Liquid Glassmorphism)",
      tag: "Ultra-Premium",
      desc: "Frosted translucent glass with iridescent aurora gradients and floating glass bubble badges.",
      render: () => {
        const current = activeTabs.layout10;
        return (
          <div
            role="radiogroup"
            aria-label="Layout 10: Aurora Glass"
            className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/20 p-1.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={current === "bars"}
              onClick={() => setTab("layout10", "bars")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 active:scale-[0.98] ${
                current === "bars"
                  ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-white/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span>Bars &amp; Clubs</span>
              <span
                className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-extrabold backdrop-blur-md transition-colors ${
                  current === "bars"
                    ? "bg-white/25 text-white border border-white/40 shadow-inner"
                    : "bg-white/10 text-white/50 border border-white/10"
                }`}
              >
                20
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={current === "entertainment"}
              onClick={() => setTab("layout10", "entertainment")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 active:scale-[0.98] ${
                current === "entertainment"
                  ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-white/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span>Entertainment</span>
              <span
                className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-extrabold backdrop-blur-md transition-colors ${
                  current === "entertainment"
                    ? "bg-white/25 text-white border border-white/40 shadow-inner"
                    : "bg-white/10 text-white/50 border border-white/10"
                }`}
              >
                20
              </span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {layouts.map((layout) => {
          const isChosen = selectedLayout === layout.id;
          return (
            <div
              key={layout.id}
              className={`group flex flex-col justify-between rounded-[var(--radius-box)] border p-5 transition-all duration-200 ${
                isChosen
                  ? "border-purple-500/80 bg-purple-950/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[11px] font-black text-purple-300">
                      {layout.num}
                    </span>
                    <h3 className="font-bold text-white tracking-tight">
                      {layout.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">
                    {layout.desc}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  {layout.tag}
                </span>
              </div>

              {/* Interactive Demo Area */}
              <div className="my-2 flex min-h-[72px] items-center justify-center rounded-xl bg-black/40 p-4 border border-white/5">
                {layout.render()}
              </div>

              {/* Action */}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] text-white/40">
                  Click options to test toggle state
                </span>
                {onSelectLayout && (
                  <button
                    type="button"
                    onClick={() => onSelectLayout(layout.id)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      isChosen
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {isChosen ? (
                      <>
                        <Check className="h-3 w-3" />
                        Selected
                      </>
                    ) : (
                      "Apply This Layout"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
