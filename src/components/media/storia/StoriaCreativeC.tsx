"use client";

import React from "react";
import {
  StoriaExploreEraButton,
  StoriaMobileMinimalFallback,
  type StoriaStageLayoutProps,
} from "./StoriaArcLayouts";

const SKY_POLYLINE_COORDS: readonly { readonly x: number; readonly y: number }[] = [
  { x: 130, y: 138 },
  { x: 295, y: 84 },
  { x: 455, y: 118 },
  { x: 620, y: 58 },
  { x: 785, y: 96 },
  { x: 945, y: 54 },
  { x: 1110, y: 108 },
  { x: 1270, y: 68 },
];

const ROMAN_CHAPTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

/**
 * LAYOUT 21 — Pendulum Drop
 * Top-pivoted single hairline pointer tilting smoothly toward each year over open typography.
 */
export function StoriaPendulumDropLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const pivotX = 700;
  const pivotY = 16;
  const yearRowY = 148;
  const activeX =
    total > 1 ? 160 + (activeIdx / (total - 1)) * 1080 : pivotX;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/480] md:block">
        <svg
          viewBox="0 0 1400 480"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          {/* Pivot Anchor + Single Pendulum Hairline */}
          <circle cx={pivotX} cy={pivotY} r={3} className="fill-white" />
          <line
            x1={pivotX}
            y1={pivotY}
            x2={activeX}
            y2={yearRowY - 24}
            className="storia-arc-hairline-bright"
          />
          <line
            x1={140}
            y1={yearRowY + 26}
            x2={1260}
            y2={yearRowY + 26}
            className="storia-arc-hairline-faint"
          />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const svgX = total > 1 ? 160 + (idx / (total - 1)) * 1080 : pivotX;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": yearRowY,
                  "--storia-opacity": isActive ? 1 : 0.55,
                } as React.CSSProperties
              }
              className="storia-center-pin group absolute top-0 left-0 cursor-pointer font-sans tabular-nums hover:opacity-100 focus-visible:outline-none"
            >
              <span
                className={
                  isActive
                    ? "text-xl font-semibold text-white lg:text-2xl"
                    : "text-base font-light text-purple-200/80 group-hover:text-white"
                }
              >
                {m.year}
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 top-[44%] flex flex-col items-center gap-3 px-12 text-center">
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 lg:text-base">
            {active.subtitle}
          </p>
          <div className="pointer-events-auto pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>
      </div>

      <StoriaMobileMinimalFallback
        milestones={milestones}
        activeIdx={activeIdx}
        onSelectIdx={onSelectIdx}
        isDossierOpen={isDossierOpen}
        onToggleDossier={onToggleDossier}
      />
    </div>
  );
}

/**
 * LAYOUT 22 — Horizon Reflection
 * Monumental title above a full-width center horizon line with hanging years & story below.
 */
export function StoriaHorizonReflectionLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-6 text-center sm:px-8">
      {/* Upper Sky: Active Year + Monumental Headline */}
      <div className="flex flex-col items-center gap-2 pb-8">
        <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 sm:text-4xl">
          {active.year}
        </p>
        <h3 className="storia-monumental-h3 max-w-4xl uppercase text-white">
          {active.title}
        </h3>
      </div>

      {/* Center 1px Horizon Line + Hanging Year Drops */}
      <div className="relative flex w-full items-start justify-between border-t border-purple-200/30 px-2 sm:px-10">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className="group flex cursor-pointer flex-col items-center gap-2 focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className={`block w-px transition-all duration-300 ${
                  isActive
                    ? "h-9 bg-white"
                    : "h-4 bg-purple-200/35 group-hover:h-6 group-hover:bg-purple-100"
                }`}
              />
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-sm font-semibold text-white sm:text-lg"
                    : "text-xs font-light text-purple-200/55 group-hover:text-white sm:text-sm"
                }`}
              >
                {m.year}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lower Reflection: Subtitle & Explore Button */}
      <div className="flex flex-col items-center gap-4 pt-8">
        <p className="max-w-xl font-sans text-sm text-purple-100/80 sm:text-base">
          {active.subtitle}
        </p>
        <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
      </div>
    </div>
  );
}

/**
 * LAYOUT 23 — Sky Polyline
 * 8 quiet star-point nodes joined by a single gentle upper polyline above open centered type.
 */
export function StoriaSkyPolylineLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];
  const pointsAttr = SKY_POLYLINE_COORDS.slice(0, milestones.length)
    .map((pt) => `${pt.x},${pt.y}`)
    .join(" ");
  const activePt = SKY_POLYLINE_COORDS[activeIdx] ?? SKY_POLYLINE_COORDS[0];

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/480] md:block">
        <svg
          viewBox="0 0 1400 480"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <polyline points={pointsAttr} className="storia-arc-hairline" />
          <line
            x1={activePt.x}
            y1={activePt.y + 18}
            x2={activePt.x}
            y2={188}
            className="storia-plumb-hairline"
          />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const pt = SKY_POLYLINE_COORDS[idx] ?? SKY_POLYLINE_COORDS[0];
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": pt.x,
                  "--storia-svg-y": pt.y,
                  "--storia-opacity": isActive ? 1 : 0.6,
                } as React.CSSProperties
              }
              className="storia-center-pin group absolute top-0 left-0 flex cursor-pointer flex-col items-center gap-1.5 hover:opacity-100 focus-visible:outline-none"
            >
              <span
                className={`font-sans tabular-nums ${
                  isActive
                    ? "text-lg font-semibold text-white lg:text-xl"
                    : "text-sm font-light text-purple-200/80 group-hover:text-white"
                }`}
              >
                {m.year}
              </span>
              <span
                aria-hidden="true"
                className={`block rounded-full ${
                  isActive
                    ? "size-2.5 bg-white ring-4 ring-purple-200/25"
                    : "size-1.5 bg-purple-200/55 group-hover:bg-white"
                }`}
              />
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 top-[44%] flex flex-col items-center gap-3 px-12 text-center">
          <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 lg:text-3xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 lg:text-base">
            {active.subtitle}
          </p>
          <div className="pointer-events-auto pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>
      </div>

      <StoriaMobileMinimalFallback
        milestones={milestones}
        activeIdx={activeIdx}
        onSelectIdx={onSelectIdx}
        isDossierOpen={isDossierOpen}
        onToggleDossier={onToggleDossier}
      />
    </div>
  );
}

/**
 * LAYOUT 24 — Margin Ledger
 * Expansive left display typography balanced by a narrow right-hand architectural year ledger.
 */
export function StoriaMarginLedgerLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-6 sm:px-8 md:grid-cols-12">
      {/* Left Expansive Open Editorial Typography */}
      <div className="flex flex-col items-center gap-3 text-center md:col-span-9 md:items-start md:text-left">
        <p className="font-sans text-sm font-light uppercase tracking-widest text-purple-200/70 tabular-nums">
          {active.year} — {active.statMeta}
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

      {/* Right Narrow Margin Ledger */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 md:col-span-3 md:flex-col md:items-end md:gap-2.5 md:border-r md:border-purple-200/25 md:pr-6">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className="group flex cursor-pointer items-center gap-3 text-right focus-visible:outline-none"
            >
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-xl font-semibold text-white"
                    : "text-sm font-light text-purple-200/55 group-hover:text-white sm:text-base"
                }`}
              >
                {m.year}
              </span>
              <span
                aria-hidden="true"
                className={`hidden h-px transition-all md:block ${
                  isActive
                    ? "w-8 bg-white"
                    : "w-3 bg-purple-200/35 group-hover:w-5 group-hover:bg-purple-100"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * LAYOUT 25 — Roman Chapters
 * Minimal chapter numeral rule (I–VIII) over a short center hairline & classical editorial type.
 */
export function StoriaRomanChaptersLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];
  const activeRoman = ROMAN_CHAPTERS[activeIdx] ?? `${activeIdx + 1}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-8 text-center sm:px-8">
      {/* Classical Roman Numeral Rule (I — VIII) */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const roman = ROMAN_CHAPTERS[idx] ?? `${idx + 1}`;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className="group flex cursor-pointer flex-col items-center gap-1 focus-visible:outline-none"
            >
              <span
                className={`font-sans tracking-widest transition-colors ${
                  isActive
                    ? "text-lg font-semibold text-white sm:text-xl"
                    : "text-sm font-light text-purple-200/50 group-hover:text-white"
                }`}
              >
                {roman}
              </span>
              <span
                className={`font-sans text-xs tabular-nums transition-colors ${
                  isActive
                    ? "text-purple-100"
                    : "text-purple-200/40 group-hover:text-purple-200/80"
                }`}
              >
                {m.year}
              </span>
            </button>
          );
        })}
      </div>

      {/* Short Classical Divider */}
      <span aria-hidden="true" className="block h-px w-16 bg-purple-200/40" />

      {/* Centered Editorial Chapter Typography */}
      <div className="flex flex-col items-center gap-3">
        <p className="font-sans text-xs font-light uppercase tracking-widest text-purple-200/75 tabular-nums">
          Chapter {activeRoman} • {active.year}
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
    </div>
  );
}
