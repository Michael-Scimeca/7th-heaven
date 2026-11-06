"use client";

import React from "react";
import {
  StoriaExploreEraButton,
  StoriaMobileMinimalFallback,
  type StoriaStageLayoutProps,
} from "./StoriaArcLayouts";

/**
 * LAYOUT 06 — Horizon Wire
 * Single flat horizontal 1px wire across the top with 8 years & sliding vertical plumb line.
 */
export function StoriaHorizonWireLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const activeXPct =
    total > 1 ? `${(8 + (activeIdx / (total - 1)) * 84).toFixed(2)}%` : "50%";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-6 sm:px-8">
      {/* Top Single Horizontal Wire + Sliding Plumb Needle */}
      <div className="relative h-20 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-8 h-px bg-purple-200/25"
        />

        {/* Sliding Plumb Drop Under Active Year */}
        <div
          aria-hidden="true"
          style={{ "--storia-x": activeXPct } as React.CSSProperties}
          className="storia-pct-x pointer-events-none absolute top-8 flex flex-col items-center"
        >
          <span className="block size-2.5 -translate-y-1/2 rounded-full bg-white ring-4 ring-purple-200/25" />
          <span className="block h-11 w-px bg-purple-200/45" />
        </div>

        {/* 8 Evenly Spaced Year Triggers */}
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const xPct =
            total > 1 ? `${(8 + (idx / (total - 1)) * 84).toFixed(2)}%` : "50%";
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={{ "--storia-x": xPct } as React.CSSProperties}
              className="storia-pct-x group absolute top-0 flex cursor-pointer flex-col items-center focus-visible:outline-none"
            >
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-base font-semibold text-white sm:text-xl"
                    : "text-xs font-light text-purple-200/65 group-hover:text-white sm:text-base"
                }`}
              >
                {m.year}
              </span>
            </button>
          );
        })}
      </div>

      {/* Open Unboxed Centerpiece Typography */}
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-sans text-sm font-light uppercase tracking-widest text-purple-200/70">
          {active.year} • {active.themeLabel}
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
 * LAYOUT 07 — Plumb Thread
 * Single center vertical thread with alternating quiet left/right year ticks leading into open type.
 */
export function StoriaPlumbThreadLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-4 sm:px-8">
      {/* Upper Vertical Plumb Thread With Alternating Year Ticks */}
      <div className="relative flex w-full max-w-md flex-col py-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-purple-200/25"
        />

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const isLeft = idx % 2 === 0;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className="group relative grid w-full cursor-pointer grid-cols-2 items-center py-1 focus-visible:outline-none"
            >
              <span
                className={`pr-5 text-right font-sans tabular-nums transition-colors ${
                  isLeft
                    ? isActive
                      ? "text-base font-semibold text-white sm:text-lg"
                      : "text-sm font-light text-purple-200/60 group-hover:text-white"
                    : "text-xs text-purple-200/40"
                }`}
              >
                {isLeft ? m.year : isActive ? m.themeLabel : ""}
              </span>

              <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${
                  isActive
                    ? "size-2.5 bg-white ring-4 ring-purple-200/25"
                    : "size-1.5 bg-purple-200/45 group-hover:bg-white"
                }`}
              />

              <span
                className={`pl-5 text-left font-sans tabular-nums transition-colors ${
                  !isLeft
                    ? isActive
                      ? "text-base font-semibold text-white sm:text-lg"
                      : "text-sm font-light text-purple-200/60 group-hover:text-white"
                    : "text-xs text-purple-200/40"
                }`}
              >
                {!isLeft ? m.year : isActive ? m.themeLabel : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Open Monumental Typography */}
      <div className="flex flex-col items-center gap-3 text-center">
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
 * LAYOUT 08 — Split Axis
 * Minimal left vertical year rail & horizontal leader line into open display typography.
 */
export function StoriaSplitAxisLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-6 sm:px-8 md:grid-cols-12">
      {/* Left Vertical Year Rail */}
      <div className="relative flex flex-row flex-wrap items-center justify-center gap-3 md:col-span-3 md:flex-col md:items-start md:gap-2.5 md:border-l md:border-purple-200/20 md:pl-6">
        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              className="group flex cursor-pointer items-center gap-3 text-left focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className={`hidden h-px transition-all md:block ${
                  isActive
                    ? "w-8 bg-white"
                    : "w-3 bg-purple-200/35 group-hover:w-5 group-hover:bg-purple-100"
                }`}
              />
              <span
                className={`font-sans tabular-nums transition-colors ${
                  isActive
                    ? "text-xl font-semibold text-white"
                    : "text-sm font-light text-purple-200/60 group-hover:text-white sm:text-base"
                }`}
              >
                {m.year}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Open Editorial Spread */}
      <div className="flex flex-col items-center gap-3 text-center md:col-span-9 md:items-start md:text-left">
        <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 sm:text-4xl">
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
 * LAYOUT 09 — Diagonal Thread
 * Clean 11° ascending hairline wire stepping eras diagonally across open space.
 */
export function StoriaDiagonalThreadLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const x1 = 90;
  const y1 = 235;
  const x2 = 1310;
  const y2 = 45;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/480] md:block">
        <svg
          viewBox="0 0 1400 480"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <line x1={x1} y1={y1} x2={x2} y2={y2} className="storia-arc-hairline" />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const t = total > 1 ? idx / (total - 1) : 0.5;
          const svgX = x1 + (x2 - x1) * t;
          const svgY = y1 + (y2 - y1) * t;

          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectIdx(idx)}
              style={
                {
                  "--storia-svg-x": svgX.toFixed(2),
                  "--storia-svg-y": svgY.toFixed(2),
                  "--storia-opacity": isActive ? 1 : 0.62,
                } as React.CSSProperties
              }
              className="storia-center-pin group absolute top-0 left-0 flex cursor-pointer flex-col items-center gap-1.5 hover:opacity-100 focus-visible:outline-none"
            >
              <span
                className={`font-sans tabular-nums ${
                  isActive
                    ? "text-lg font-semibold text-white lg:text-2xl"
                    : "text-sm font-light text-purple-200/80 group-hover:text-white lg:text-base"
                }`}
              >
                {m.year}
              </span>
              <span
                aria-hidden="true"
                className={`block rounded-full ${
                  isActive
                    ? "size-2.5 bg-white ring-4 ring-purple-200/25"
                    : "size-2 bg-purple-200/50 group-hover:bg-white"
                }`}
              />
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-12 text-center">
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
 * LAYOUT 10 — Crosshair Datum
 * Full-stage X/Y hairline intersection locking the active year at the center datum.
 */
export function StoriaCrosshairDatumLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-8">
      <div className="relative hidden flex-col items-center gap-12 py-6 md:flex">
        {/* Vertical Center Datum Hairline (Top Segment) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 h-24 w-px -translate-x-1/2 bg-purple-200/35"
        />

        {/* Horizontal Axis Wire Where Years Glide So Active Locks At 50% */}
        <div className="relative h-14 w-full overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-purple-200/22"
          />

          {milestones.map((m, idx) => {
            const diff = idx - activeIdx;
            const isVisible = Math.abs(diff) <= 3;
            const isActive = diff === 0;
            const xPct = `${50 + diff * 15}%`;

            return (
              <button
                key={m.id}
                type="button"
                tabIndex={isVisible ? 0 : -1}
                aria-pressed={isActive}
                onClick={() => onSelectIdx(idx)}
                style={{ "--storia-x": xPct } as React.CSSProperties}
                className={`storia-pct-x group absolute top-1/2 flex -translate-y-1/2 flex-col items-center px-3 focus-visible:outline-none ${
                  isVisible
                    ? "pointer-events-auto cursor-pointer"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <span
                  className={`font-sans tabular-nums transition-colors ${
                    isActive
                      ? "text-2xl font-semibold text-white"
                      : "text-base font-light text-purple-200/55 group-hover:text-white"
                  }`}
                >
                  {m.year}
                </span>
              </button>
            );
          })}
        </div>

        {/* Centerpiece Typography Under the Crosshair */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-purple-200/65">
            {active.venueMeta}
          </p>
          <h3 className="storia-monumental-h3 max-w-3xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-xl font-sans text-sm text-purple-100/80 lg:text-base">
            {active.subtitle}
          </p>
          <div className="pt-2">
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
