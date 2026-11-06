"use client";

import React from "react";
import {
  StoriaExploreEraButton,
  StoriaMobileMinimalFallback,
  type StoriaStageLayoutProps,
} from "./StoriaArcLayouts";
import { getCyclicOffset } from "./storiaData";

const CROWN_DEGREE_TICKS = Array.from({ length: 41 }, (_, i) => -60 + i * 3);

/**
 * LAYOUT 16 — Crown Ticks
 * Minimalist 120° upper degree-tick crown (no solid circle) with active year at zenith.
 */
export function StoriaCrownTicksLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = 700;
  const cy = 920;
  const rInner = 825;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/480] md:block">
        <svg
          viewBox="0 0 1400 480"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-hidden"
        >
          {CROWN_DEGREE_TICKS.map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const isMajor = idx % 5 === 0;
            const len = deg === 0 ? 32 : isMajor ? 16 : 8;
            const x1 = cx + rInner * Math.sin(rad);
            const y1 = cy - rInner * Math.cos(rad);
            const x2 = cx + (rInner - len) * Math.sin(rad);
            const y2 = cy - (rInner - len) * Math.cos(rad);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={deg === 0 ? "storia-arc-hairline-bright" : "storia-arc-hairline"}
              />
            );
          })}
        </svg>

        {milestones.map((m, idx) => {
          const offset = getCyclicOffset(idx, activeIdx, total);
          const isVisible = Math.abs(offset) <= 2;
          const isActive = offset === 0;
          const deg = offset * 15;
          const rad = (deg * Math.PI) / 180;
          const labelR = rInner + 28;
          const svgX = cx + labelR * Math.sin(rad);
          const svgY = cy - labelR * Math.cos(rad);

          return (
            <button
              key={m.id}
              type="button"
              tabIndex={isVisible ? 0 : -1}
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-rot": `${deg}deg`,
                  "--storia-opacity": !isVisible ? 0 : isActive ? 1 : 0.55,
                } as React.CSSProperties
              }
              className={`storia-center-pin group absolute top-0 left-0 cursor-pointer font-sans tabular-nums hover:opacity-100 focus-visible:outline-none ${
                isVisible ? "pointer-events-auto" : "pointer-events-none"
              }`}
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

        <div className="pointer-events-none absolute inset-x-0 top-[36%] flex flex-col items-center gap-3 px-12 text-center">
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-purple-200/65">
            {active.statMeta}
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
 * LAYOUT 17 — Caliper Span
 * True-scale 1985–2026 proportional span bracket where milestones sit at real calendar spacing.
 */
export function StoriaCaliperSpanLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];
  const minYear = milestones[0]?.yearNum ?? 1985;
  const maxYear = milestones[milestones.length - 1]?.yearNum ?? 2026;
  const span = Math.max(1, maxYear - minYear);
  const activePct = `${(6 + ((active.yearNum - minYear) / span) * 88).toFixed(2)}%`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-6 sm:px-8">
      {/* Proportional 41-Year Caliper Bracket */}
      <div className="relative h-20 w-full">
        {/* Bracket Left/Right End Caps + Horizontal Span Wire */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[6%] top-10 h-3 border-x border-t border-purple-200/30"
        />

        {/* Gliding Caliper Needle */}
        <div
          aria-hidden="true"
          style={{ "--storia-x": activePct } as React.CSSProperties}
          className="storia-pct-x pointer-events-none absolute top-10 flex flex-col items-center"
        >
          <span className="block h-10 w-px bg-white" />
        </div>

        {/* True-Calendar-Spaced Year Marks */}
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const xPct = `${(6 + ((m.yearNum - minYear) / span) * 88).toFixed(2)}%`;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={{ "--storia-x": xPct } as React.CSSProperties}
              className="storia-pct-x group absolute top-1 flex cursor-pointer flex-col items-center focus-visible:outline-none"
            >
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

      {/* Open Centerpiece Typography */}
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 sm:text-3xl">
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
    </div>
  );
}

/**
 * LAYOUT 18 — Pulse Dots
 * Line-free ultra-minimal row of 8 breathing points of light above open centered typography.
 */
export function StoriaPulseDotsLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-4 py-8 text-center sm:px-8">
      {/* 8 Pure Points of Light (Zero Lines) */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {milestones.map((m, idx) => {
          const dist = Math.abs(idx - activeIdx);
          const isActive = dist === 0;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className="group flex cursor-pointer flex-col items-center gap-3 focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "size-3.5 bg-white ring-8 ring-purple-200/20"
                    : dist === 1
                      ? "size-2 bg-purple-200/65 group-hover:bg-white"
                      : "size-1.5 bg-purple-200/35 group-hover:bg-purple-100"
                }`}
              />
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-base font-semibold text-white sm:text-lg"
                    : "text-xs font-light text-purple-200/50 group-hover:text-white sm:text-sm"
                }`}
              >
                {m.year}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pure Open Monumental Typography */}
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
 * LAYOUT 19 — Stepping Plateaus
 * 8 quiet ascending horizontal hairline steps rising across four decades.
 */
export function StoriaSteppingPlateausLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-8">
      {/* 8 Ascending Hairline Plateaus */}
      <div className="grid grid-cols-4 items-end gap-3 sm:grid-cols-8 sm:gap-4">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const stepPb = `${idx * 8}px`;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-step-pb": stepPb,
                } as React.CSSProperties
              }
              className="storia-step-y group flex cursor-pointer flex-col items-start gap-2 text-left focus-visible:outline-none"
            >
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-base font-semibold text-white sm:text-xl"
                    : "text-xs font-light text-purple-200/55 group-hover:text-white sm:text-sm"
                }`}
              >
                {m.year}
              </span>
              <span
                aria-hidden="true"
                className={`block h-px w-full transition-colors ${
                  isActive
                    ? "bg-white"
                    : "bg-purple-200/25 group-hover:bg-purple-200/65"
                }`}
              />
              <span className="font-sans text-xs font-light text-purple-200/45">
                0{idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Open Monumental Typography */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 sm:text-3xl">
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
    </div>
  );
}

/**
 * LAYOUT 20 — Twin Brackets
 * Left & right vertical hairline brackets (4 years each side) flanking open centerpiece type.
 */
export function StoriaTwinBracketsLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];
  const half = Math.ceil(milestones.length / 2);
  const leftEras = milestones.slice(0, half);
  const rightEras = milestones.slice(half);

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-8 sm:px-8 md:grid-cols-12">
      {/* Left Bracket [ 1985..2007 */}
      <div className="flex flex-row justify-center gap-4 md:col-span-2 md:flex-col md:items-start md:gap-4 md:border-y md:border-l md:border-purple-200/25 md:py-8 md:pl-5">
        {leftEras.map((m, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className={`cursor-pointer font-sans tabular-nums transition-colors focus-visible:outline-none ${
                isActive
                  ? "text-lg font-semibold text-white"
                  : "text-sm font-light text-purple-200/55 hover:text-white"
              }`}
            >
              {m.year}
            </button>
          );
        })}
      </div>

      {/* Center Unboxed Monumental Typography */}
      <div className="flex flex-col items-center gap-3 text-center md:col-span-8">
        <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 sm:text-4xl">
          {active.year}
        </p>
        <h3 className="storia-monumental-h3 max-w-2xl uppercase text-white">
          {active.title}
        </h3>
        <p className="max-w-lg font-sans text-sm text-purple-100/80 sm:text-base">
          {active.subtitle}
        </p>
        <div className="pt-2">
          <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
        </div>
      </div>

      {/* Right Bracket 2011..2026 ] */}
      <div className="flex flex-row justify-center gap-4 md:col-span-2 md:flex-col md:items-end md:gap-4 md:border-y md:border-r md:border-purple-200/25 md:py-8 md:pr-5">
        {rightEras.map((m, offsetIdx) => {
          const idx = half + offsetIdx;
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className={`cursor-pointer font-sans tabular-nums transition-colors focus-visible:outline-none ${
                isActive
                  ? "text-lg font-semibold text-white"
                  : "text-sm font-light text-purple-200/55 hover:text-white"
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
