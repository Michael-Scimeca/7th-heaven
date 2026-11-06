"use client";

import React from "react";
import {
  StoriaExploreEraButton,
  type StoriaStageLayoutProps,
} from "./StoriaArcLayouts";

/**
 * LAYOUT 11 — Whisper Giants
 * Zero-line pure typography: giant active year flanked by ghosted prev & next eras.
 */
export function StoriaWhisperGiantsLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;
  const prev = milestones[prevIdx] ?? active;
  const next = milestones[nextIdx] ?? active;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-8 text-center sm:px-8">
      {/* Flanking Ghost Years + Monumental Center Year */}
      <div className="grid w-full grid-cols-3 items-baseline gap-4">
        <button
          type="button"
          onClick={() => onSelectIdx(prevIdx)}
          aria-label={`Previous era ${prev.year}`}
          className="storia-ghost-year cursor-pointer text-right font-heading tabular-nums text-purple-200/25 transition-colors hover:text-purple-100/75 focus-visible:outline-none"
        >
          {prev.year}
        </button>

        <span className="storia-giant-year font-heading tabular-nums text-white">
          {active.year}
        </span>

        <button
          type="button"
          onClick={() => onSelectIdx(nextIdx)}
          aria-label={`Next era ${next.year}`}
          className="storia-ghost-year cursor-pointer text-left font-heading tabular-nums text-purple-200/25 transition-colors hover:text-purple-100/75 focus-visible:outline-none"
        >
          {next.year}
        </button>
      </div>

      {/* Centerpiece Headline & CTA */}
      <div className="flex flex-col items-center gap-3">
        <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
          {active.title}
        </h3>
        <p className="max-w-xl font-sans text-sm text-purple-100/80 sm:text-base">
          {active.subtitle}
        </p>
        <div className="pt-2">
          <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
        </div>
      </div>
    </div>
  );
}

/**
 * LAYOUT 12 — Editorial Split
 * Colossal outlined year numeral beside a 1px divider & open left-aligned headline.
 */
export function StoriaEditorialSplitLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10">
        {/* Left Colossal Outlined Year */}
        <div className="flex flex-col items-center md:col-span-5 md:items-end">
          <span className="storia-outline-year font-heading tabular-nums">
            {active.year}
          </span>
        </div>

        {/* Right Open Editorial Spread With 1px Left Divider */}
        <div className="flex flex-col items-center gap-3 text-center md:col-span-7 md:items-start md:border-l md:border-purple-200/25 md:pl-10 md:text-left">
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-purple-200/70">
            {active.venueMeta}
          </p>
          <h3 className="storia-monumental-h3 uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-lg font-sans text-sm text-purple-100/80 sm:text-base">
            {active.subtitle}
          </p>
          <div className="pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>
      </div>

      {/* Quiet Baseline Year Row */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className={`cursor-pointer font-sans text-sm tabular-nums transition-colors focus-visible:outline-none ${
                isActive
                  ? "border-b border-white pb-0.5 font-semibold text-white"
                  : "font-light text-purple-200/55 hover:text-white"
              }`}
            >
              {m.year}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * LAYOUT 13 — Stacked Index
 * Borderless vertical typographic list where only the active era blooms into monumental scale.
 */
export function StoriaStackedIndexLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-4 py-4 text-center sm:px-8">
      {milestones.map((m, idx) => {
        const isActive = idx === activeIdx;
        if (isActive) {
          return (
            <div
              key={m.id}
              className="flex w-full flex-col items-center gap-2.5 border-y border-purple-200/20 py-6"
            >
              <span className="font-sans text-xl font-light tabular-nums text-purple-200/80 sm:text-2xl">
                {m.year}
              </span>
              <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
                {m.title}
              </h3>
              <p className="max-w-xl font-sans text-sm text-purple-100/80 sm:text-base">
                {m.subtitle}
              </p>
              <div className="pt-2">
                <StoriaExploreEraButton
                  isOpen={isDossierOpen}
                  onToggle={onToggleDossier}
                />
              </div>
            </div>
          );
        }

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectIdx(idx)}
            className="group flex cursor-pointer items-baseline gap-4 py-1 font-sans transition-colors focus-visible:outline-none"
          >
            <span className="text-sm font-light tabular-nums text-purple-200/50 group-hover:text-white">
              {m.year}
            </span>
            <span className="text-sm font-normal uppercase tracking-wider text-purple-200/45 group-hover:text-purple-100">
              {m.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * LAYOUT 14 — Corner Reticle
 * Four delicate 16px corner hairlines framing open space, centered type & baseline years.
 */
export function StoriaCornerReticleLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];
  const stepLabel = `0${activeIdx + 1} / 0${milestones.length}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-8">
      <div className="relative flex flex-col items-center justify-between gap-12 px-6 py-12 sm:px-14">
        {/* 4 Minimal 16px Architectural Corner Hairlines */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 size-5 border-t border-l border-purple-200/45"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 size-5 border-t border-r border-purple-200/45"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 size-5 border-b border-l border-purple-200/45"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 size-5 border-r border-b border-purple-200/45"
        />

        {/* Quiet Top Meta Row */}
        <div className="flex w-full items-center justify-between font-sans text-xs font-light uppercase tracking-widest text-purple-200/65 tabular-nums">
          <span>{stepLabel}</span>
          <span>{active.decade}</span>
        </div>

        {/* Center Open Monumental Typography */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-sans text-3xl font-light tabular-nums text-purple-200/80 sm:text-4xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 sm:text-base">
            {active.subtitle}
          </p>
          <div className="pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>

        {/* Bottom Spaced Year Row */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          {milestones.map((m, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectIdx(idx)}
                className={`cursor-pointer font-sans text-xs sm:text-sm tabular-nums transition-colors focus-visible:outline-none ${
                  isActive
                    ? "font-semibold text-white"
                    : "font-light text-purple-200/50 hover:text-white"
                }`}
              >
                {m.year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * LAYOUT 15 — Offset Baseline
 * Oversized flush-left year & flush-right monumental title resting on one shared 1px baseline.
 */
export function StoriaOffsetBaselineLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
      {/* Shared Baseline Row */}
      <div className="flex flex-col items-center justify-between gap-4 border-b border-purple-200/25 pb-6 md:flex-row md:items-end">
        <span className="storia-giant-year font-heading tabular-nums text-white">
          {active.year}
        </span>

        <h3 className="storia-monumental-h3 max-w-2xl text-center uppercase text-white md:text-right">
          {active.title}
        </h3>
      </div>

      {/* Below Baseline: Subtitle Left + CTA Right */}
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <p className="max-w-xl text-center font-sans text-sm text-purple-100/80 sm:text-base md:text-left">
          {active.subtitle}
        </p>
        <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
      </div>

      {/* Minimal Year Selector Along Bottom */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 md:justify-start">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className={`cursor-pointer font-sans text-sm tabular-nums transition-colors focus-visible:outline-none ${
                isActive
                  ? "font-semibold text-white"
                  : "font-light text-purple-200/50 hover:text-white"
              }`}
            >
              {m.year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
