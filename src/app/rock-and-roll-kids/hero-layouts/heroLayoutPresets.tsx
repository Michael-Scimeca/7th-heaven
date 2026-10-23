"use client";

import React from "react";
import Image from "next/image";
import {
  Tv,
  Gamepad2,
  BookOpen,
  Music,
  Play,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Layers,
  Film,
  Star,
  CheckCircle2,
} from "lucide-react";
import type { HeroColorTheme } from "../RockNRollKidsClient";

export interface HeroLayoutPreset {
  id: number;
  name: string;
  desc: string;
}

export const HERO_LAYOUT_PRESETS: HeroLayoutPreset[] = [
  { id: 1, name: "Classic Broadside", desc: "Left accent bar, horizontal format pills, 4-col pillar row" },
  { id: 2, name: "Split Stage 60/40", desc: "Left narrative & CTAs + Right vertical 4-pillar stack" },
  { id: 3, name: "Centered Cinema", desc: "Balanced center-aligned typography, pill row & centered CTAs" },
  { id: 4, name: "Pillars Horizon Top", desc: "4 media pillars placed first at top, followed by story & CTAs" },
  { id: 5, name: "2x2 Quadrant Grid", desc: "Hero story on left with a bold 2x2 pillar quadrant on right" },
  { id: 6, name: "Editorial Spread", desc: "Two-column broadsheet: left story quote + right vertical pillars" },
  { id: 7, name: "Connected Step Flow", desc: "Horizontal 01 → 02 → 03 → 04 journey with guide rail" },
  { id: 8, name: "Manifesto Pull-Quote", desc: "Starts with prominent art mission quote, followed by headline" },
  { id: 9, name: "Triple Column Symphony", desc: "3 equal columns: Title/CTAs, Mission Story, and 4 Pillars" },
  { id: 10, name: "Billboard Header", desc: "Headline & CTAs inline at top, followed by 4 pillars ribbon" },
  { id: 11, name: "Bold Numerals", desc: "Oversized font-mono numbers (01-04) alongside each pillar" },
  { id: 12, name: "Vertical Accent Ribbon", desc: "Tall gradient vertical accent bar anchoring the full content" },
  { id: 13, name: "Golden Ratio 62/38", desc: "Harmonic 62% primary story canvas + 38% pillar stack" },
  { id: 14, name: "CTAs Direct Under Headline", desc: "Action buttons placed immediately beneath title & subtitle" },
  { id: 15, name: "Two-Tier Split Stage", desc: "Top 2-col split for story/CTAs + full-width 4-col pillar base" },
  { id: 16, name: "Vertical Step Track", desc: "Left vertical numbered timeline rail + right story & actions" },
  { id: 17, name: "Production Film Slate", desc: "Executive animated production slate with meta tags & 2x2 rows" },
  { id: 18, name: "Asymmetric Stagger", desc: "Dynamic staggered 2x2 pillars with rock-and-roll cadence" },
  { id: 19, name: "Horizontal Pillar Strip", desc: "Full-bleed horizontal strip for 4 pillars with glowing tags" },
  { id: 20, name: "Executive Grand Broadside", desc: "Ultra-clean synthesis with dual story paragraphs & pill badges" },
];

export interface FranchisePillarItem {
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  desc: string;
  tag: string;
  accent: string;
  pillClass: string;
}

interface HeroContentRendererProps {
  layoutId: number;
  activeColorTheme: HeroColorTheme;
  sanityContent?: any;
  para1: string;
  para2?: string;
  productsList: any[];
  pillars: FranchisePillarItem[];
}

export function HeroContentRenderer({
  layoutId,
  activeColorTheme,
  sanityContent,
  para1,
  para2,
  productsList,
  pillars,
}: HeroContentRendererProps) {
  const headline = (
    <h1
      id="rrk-hero-heading"
      className="uppercase tracking-tight text-white font-extrabold text-2xl sm:text-4xl lg:text-5xl"
    >
      7th Heaven &amp; The Rock &apos;n&apos; Roll Kids
    </h1>
  );

  const subtitle = (
    <p className={`text-sm sm:text-base font-medium mt-1.5 ${activeColorTheme.subtitle}`}>
      {sanityContent?.heroSubheading ||
        "An animated adventure series communicating messages of fun, positivity, and social consciousness through music and imagination."}
    </p>
  );

  const pillsRow = (
    <div
      aria-label="Franchise Media Pillars: TV, Game Apps, Comic Books, and Rock Music"
      className="flex flex-wrap items-center gap-2"
    >
      {pillars.map(({ Icon, title, pillClass }) => (
        <span
          key={title}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${pillClass}`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {title}
        </span>
      ))}
    </div>
  );

  const narrative = (
    <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed">
      &ldquo;{para1}&rdquo;{para2 ? ` — ${para2}` : ""}
    </p>
  );

  const ctaButtons = (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="#rrk-comics"
        className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${activeColorTheme.primaryBtn}`}
      >
        <BookOpen className="h-4 w-4" />
        Explore Comic Books ({productsList.length})
      </a>
      <a
        href="#rrk-videos"
        className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${activeColorTheme.secondaryBtn}`}
      >
        <Play className="h-4 w-4" />
        Watch Animated Singles
      </a>
    </div>
  );

  /* ──────────────────────────────────────────────────────────
     LAYOUT 1: CLASSIC BROADSIDE (Current Base Layout)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 1) {
    return (
      <div className="relative z-10 flex flex-col gap-6">
        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>

        <div className="pl-5">{pillsRow}</div>

        <div className="pl-5 max-w-4xl">{narrative}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pl-5 pt-4 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="pl-5 pt-2">{ctaButtons}</div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 2: SPLIT STAGE (60% STORY / 40% PILLARS STACK)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 2) {
    return (
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-5">{pillsRow}</div>
          <div className="pl-5">{narrative}</div>
          <div className="pl-5 pt-2">{ctaButtons}</div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
            Franchise Media Universe
          </div>
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-b-0">
              <span className={`font-mono text-base font-extrabold ${activeColorTheme.numbers} pt-0.5`}>
                0{idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                  <h2 className="text-sm font-bold uppercase text-white">{tag}</h2>
                </div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 3: CENTERED CINEMA BROADSIDE
  ────────────────────────────────────────────────────────── */
  if (layoutId === 3) {
    return (
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-5xl mx-auto">
        <div>
          {headline}
          {subtitle}
        </div>

        <div className="flex justify-center">{pillsRow}</div>

        <div className="max-w-3xl">{narrative}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10 w-full text-left">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2">{ctaButtons}</div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 4: PILLARS FIRST HORIZON (Pillars Overlap First)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 4) {
    return (
      <div className="relative z-10 flex flex-col gap-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide">{tag}</h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-5">{pillsRow}</div>
          <div className="pl-5 max-w-4xl">{narrative}</div>
          <div className="pl-5 pt-2">{ctaButtons}</div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 5: 2x2 QUADRANT GRID
  ────────────────────────────────────────────────────────── */
  if (layoutId === 5) {
    return (
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-5">{pillsRow}</div>
          <div className="pl-5">{narrative}</div>
          <div className="pl-5 pt-2">{ctaButtons}</div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${accent}`} />
                  <h2 className="text-xs font-bold uppercase text-white tracking-wide">{tag}</h2>
                </div>
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 6: EDITORIAL SPREAD
  ────────────────────────────────────────────────────────── */
  if (layoutId === 6) {
    return (
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            {headline}
            {subtitle}
          </div>
          <div>{pillsRow}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-white/40">
              MISSION MANIFESTO
            </div>
            {narrative}
            <div className="pt-2">{ctaButtons}</div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
            {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
              <div key={title} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                    0{idx + 1}.
                  </span>
                  <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                  <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                    {tag}
                  </h2>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 7: CONNECTED STEP FLOW (01 → 02 → 03 → 04)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 7) {
    return (
      <div className="relative z-10 flex flex-col gap-8">
        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>

        <div className="pl-5 flex flex-wrap items-center justify-between gap-4">
          {pillsRow}
          {ctaButtons}
        </div>

        <div className="pl-5 max-w-4xl">{narrative}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pl-5 pt-4 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="relative flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  {idx + 1}
                </span>
                <Icon className={`h-4 w-4 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide">{tag}</h2>
                {idx < 3 && (
                  <ArrowRight className="hidden lg:block ml-auto h-3.5 w-3.5 text-white/20" />
                )}
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 8: MANIFESTO PULL-QUOTE LEAD
  ────────────────────────────────────────────────────────── */
  if (layoutId === 8) {
    return (
      <div className="relative z-10 flex flex-col gap-6">
        <div className="border-l-2 border-amber-400/60 pl-5">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300/80 mb-1">
            Series Philosophy &amp; Vision
          </p>
          <blockquote className="text-lg sm:text-xl text-white font-medium italic leading-relaxed">
            &ldquo;{para1}&rdquo;
          </blockquote>
        </div>

        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5 pt-2`}>
          {headline}
          {subtitle}
        </div>

        <div className="pl-5">{pillsRow}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pl-5 pt-4 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="pl-5 pt-2">{ctaButtons}</div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 9: TRIPLE COLUMN SYMPHONY (4 - 4 - 4)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 9) {
    return (
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-4`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-4 pt-2">{ctaButtons}</div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50">
            About the Adventure
          </div>
          {narrative}
          <div>{pillsRow}</div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50">
            4 Release Channels
          </div>
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-3.5 w-3.5 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white">{tag}</h2>
              </div>
              <p className="text-xs text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 10: BILLBOARD HEADER WITH INLINE CTAS
  ────────────────────────────────────────────────────────── */
  if (layoutId === 10) {
    return (
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-5 lg:pl-0 shrink-0">{ctaButtons}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pl-5">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-5 pt-4 border-t border-white/10">
          <div className="max-w-3xl">{narrative}</div>
          <div className="shrink-0">{pillsRow}</div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 11: BOLD NUMERALS (STREETWEAR ROCK TYPOGRAPHY)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 11) {
    return (
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          {headline}
          {subtitle}
        </div>

        <div>{pillsRow}</div>

        <div className="max-w-4xl">{narrative}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex gap-4 items-baseline">
              <span className={`font-mono text-4xl font-extrabold ${activeColorTheme.numbers} opacity-90 select-none`}>
                0{idx + 1}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${accent}`} />
                  <h2 className="text-xs font-bold uppercase text-white tracking-wide">{tag}</h2>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">{ctaButtons}</div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 12: VERTICAL ACCENT RIBBON
  ────────────────────────────────────────────────────────── */
  if (layoutId === 12) {
    return (
      <div className="relative z-10 flex gap-6 sm:gap-8 items-stretch">
        <div className="w-1.5 rounded-full bg-gradient-to-b from-white via-cyan-400 to-purple-600 shrink-0" />

        <div className="flex flex-col gap-6 flex-1">
          <div>
            {headline}
            {subtitle}
          </div>

          <div>{pillsRow}</div>

          <div className="max-w-4xl">{narrative}</div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/10">
            {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
              <div key={title} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                    0{idx + 1}.
                  </span>
                  <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                  <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                    {tag}
                  </h2>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">{ctaButtons}</div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 13: GOLDEN RATIO (62% PRIMARY / 38% STACK)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 13) {
    return (
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-5">{pillsRow}</div>
          <div className="pl-5 text-base sm:text-lg text-white/90 leading-relaxed">
            {narrative}
          </div>
          <div className="pl-5 pt-2">{ctaButtons}</div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/50">
            Core Channels
          </span>
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}
                </span>
                <Icon className={`h-4 w-4 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white">{tag}</h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 14: CTAS DIRECT UNDER HEADLINE
  ────────────────────────────────────────────────────────── */
  if (layoutId === 14) {
    return (
      <div className="relative z-10 flex flex-col gap-6">
        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>

        <div className="pl-5 flex flex-wrap items-center gap-4">
          {ctaButtons}
          {pillsRow}
        </div>

        <div className="pl-5 max-w-4xl">{narrative}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pl-5 pt-4 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 15: TWO-TIER SPLIT STAGE
  ────────────────────────────────────────────────────────── */
  if (layoutId === 15) {
    return (
      <div className="relative z-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
              {headline}
              {subtitle}
            </div>
            <div className="pl-5">{ctaButtons}</div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
            {narrative}
            <div>{pillsRow}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 16: VERTICAL STEP TRACK
  ────────────────────────────────────────────────────────── */
  if (layoutId === 16) {
    return (
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
            Roadmap to Positivity
          </div>
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex items-start gap-3">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                {idx + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${accent}`} />
                  <h2 className="text-xs font-bold uppercase text-white">{tag}</h2>
                </div>
                <p className="text-xs text-white/70">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
            {headline}
            {subtitle}
          </div>
          <div className="pl-5">{pillsRow}</div>
          <div className="pl-5">{narrative}</div>
          <div className="pl-5 pt-2">{ctaButtons}</div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 17: PRODUCTION FILM SLATE
  ────────────────────────────────────────────────────────── */
  if (layoutId === 17) {
    return (
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider text-white/60">
          <span className="text-white">PROJECT: 7TH HEAVEN</span>
          <span>•</span>
          <span className="text-cyan-300">ANIMATED SERIES</span>
          <span>•</span>
          <span className="text-amber-300">COMIC BOOK UNIVERSE</span>
          <span>•</span>
          <span className="text-purple-300">ORIGINAL ROCK OST</span>
        </div>

        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-5">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex items-baseline gap-3 border-b border-white/10 pb-2">
              <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                0{idx + 1}
              </span>
              <Icon className={`h-4 w-4 ${accent} shrink-0`} />
              <div>
                <span className="text-xs font-bold uppercase text-white mr-2">{tag}:</span>
                <span className="text-xs text-white/70">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pl-5 max-w-4xl">{narrative}</div>

        <div className="pl-5 flex flex-wrap items-center gap-4 pt-2">
          {ctaButtons}
          {pillsRow}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 18: ASYMMETRIC STAGGER (DYNAMIC ROCK CADENCE)
  ────────────────────────────────────────────────────────── */
  if (layoutId === 18) {
    return (
      <div className="relative z-10 flex flex-col gap-8">
        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>

        <div className="pl-5">{pillsRow}</div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pl-5">
          <div className="md:col-span-5 flex flex-col gap-5">
            {narrative}
            <div className="pt-2">{ctaButtons}</div>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
              <div
                key={title}
                className={`flex flex-col gap-1.5 ${
                  idx % 2 === 1 ? "sm:translate-y-4" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                    0{idx + 1}.
                  </span>
                  <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                  <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                    {tag}
                  </h2>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 19: HORIZONTAL PILLAR STRIP
  ────────────────────────────────────────────────────────── */
  if (layoutId === 19) {
    return (
      <div className="relative z-10 flex flex-col gap-6">
        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>

        <div className="pl-5 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {pillars.map(({ Icon, title, tag, accent, pillClass }, idx) => (
            <div
              key={title}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${pillClass}`}
            >
              <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
              <Icon className="h-3.5 w-3.5" />
              <span>{title}</span>
            </div>
          ))}
        </div>

        <div className="pl-5 max-w-4xl">{narrative}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pl-5 pt-4 border-t border-white/10">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-white tracking-wide">
                {tag}
              </span>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="pl-5 pt-2">{ctaButtons}</div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     LAYOUT 20: EXECUTIVE GRAND BROADSIDE (Ultra-Clean Synthesis)
  ────────────────────────────────────────────────────────── */
  return (
    <div className="relative z-10 flex flex-col gap-7">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className={`border-l-4 ${activeColorTheme.accentBar} pl-5`}>
          {headline}
          {subtitle}
        </div>
        <div className="pl-5 lg:pl-0 shrink-0">{pillsRow}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pl-5">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
            &ldquo;{para1}&rdquo;
          </p>
          {para2 && (
            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
              {para2}
            </p>
          )}
          <div className="pt-3">{ctaButtons}</div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          {pillars.map(({ Icon, title, desc, tag, accent }, idx) => (
            <div key={title} className="flex flex-col gap-1 pb-2 border-b border-white/5 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${activeColorTheme.numbers}`}>
                  0{idx + 1}.
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <h2 className="text-xs font-bold uppercase text-white tracking-wide truncate">
                  {tag}
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
