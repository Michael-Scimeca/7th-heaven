"use client";

import React from "react";
import {
  StoriaExploreEraButton,
  StoriaMobileMinimalFallback,
  type StoriaStageLayoutProps,
} from "./StoriaArcLayouts";

const SINE_WAVE_PATH = (() => {
  const samples = 64;
  const xStart = 90;
  const xEnd = 1310;
  const parts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = xStart + (xEnd - xStart) * t;
    const y = 104 + 34 * Math.sin(t * Math.PI * 2);
    parts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.join(" ");
})();

/**
 * LAYOUT 26 — Diamond Wire
 * Single rotated diamond hairline frame with 8 upper-facet year anchors & centered type.
 */
export function StoriaDiamondWireLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const active = milestones[activeIdx] ?? milestones[0];
  const half = Math.ceil(milestones.length / 2);

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/520] md:block">
        <svg
          viewBox="0 0 1400 520"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <polygon
            points="700,28 1220,260 700,492 180,260"
            className="storia-arc-hairline"
          />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const isLeftFacet = idx < half;
          const localT = isLeftFacet
            ? (idx + 0.5) / half
            : (idx - half + 0.5) / Math.max(1, milestones.length - half);
          const edgeX = isLeftFacet
            ? 180 + (700 - 180) * localT
            : 700 + (1220 - 700) * localT;
          const edgeY = isLeftFacet
            ? 260 + (28 - 260) * localT
            : 28 + (260 - 28) * localT;
          const svgX = isLeftFacet ? edgeX - 18 : edgeX + 18;
          const svgY = edgeY - 22;

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
                  "--storia-opacity": isActive ? 1 : 0.55,
                } as React.CSSProperties
              }
              className="storia-center-pin group absolute top-0 left-0 cursor-pointer font-sans tabular-nums hover:opacity-100 focus-visible:outline-none"
            >
              <span
                className={
                  isActive
                    ? "text-lg font-semibold text-white lg:text-xl"
                    : "text-sm font-light text-purple-200/80 group-hover:text-white"
                }
              >
                {m.year}
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-24 text-center">
          <p className="font-sans text-xl font-light tabular-nums text-purple-200/75 lg:text-3xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-2xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-lg font-sans text-sm text-purple-100/80">
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
 * LAYOUT 27 — Arch Portal
 * Minimalist round-crown architectural arch framing open centered monumental typography.
 */
export function StoriaArchPortalLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const cx = 700;
  const crownY = 265;
  const rx = 380;
  const ry = 215;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/520] md:block">
        <svg
          viewBox="0 0 1400 520"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <path
            d={`M ${cx - rx} 485 L ${cx - rx} ${crownY} A ${rx} ${ry} 0 0 1 ${cx + rx} ${crownY} L ${cx + rx} 485`}
            className="storia-arc-hairline"
          />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const t = total > 1 ? idx / (total - 1) : 0.5;
          const angleDeg = 166 - t * 152;
          const rad = (angleDeg * Math.PI) / 180;
          const svgX = cx + (rx + 36) * Math.cos(rad);
          const svgY = crownY - (ry + 28) * Math.sin(rad);

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
                  "--storia-opacity": isActive ? 1 : 0.56,
                } as React.CSSProperties
              }
              className="storia-center-pin group absolute top-0 left-0 cursor-pointer font-sans tabular-nums hover:opacity-100 focus-visible:outline-none"
            >
              <span
                className={
                  isActive
                    ? "text-lg font-semibold text-white lg:text-xl"
                    : "text-sm font-light text-purple-200/80 group-hover:text-white"
                }
              >
                {m.year}
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 top-[30%] flex flex-col items-center gap-3 px-20 text-center">
          <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 lg:text-3xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 max-w-2xl uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-md font-sans text-sm text-purple-100/80">
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
 * LAYOUT 28 — Sine Thread
 * Single low-amplitude harmonic wave carrying 8 clickable years above open centered type.
 */
export function StoriaSineThreadLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const xStart = 140;
  const xEnd = 1260;
  const activeT = total > 1 ? activeIdx / (total - 1) : 0.5;
  const activeSvgX = xStart + (xEnd - xStart) * activeT;
  const activeWaveT = (activeSvgX - 90) / (1310 - 90);
  const activeSvgY = 104 + 34 * Math.sin(activeWaveT * Math.PI * 2);

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/480] md:block">
        <svg
          viewBox="0 0 1400 480"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <path d={SINE_WAVE_PATH} className="storia-arc-hairline" />
          <line
            x1={activeSvgX}
            y1={activeSvgY + 20}
            x2={activeSvgX}
            y2={192}
            className="storia-plumb-hairline"
          />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const t = total > 1 ? idx / (total - 1) : 0.5;
          const svgX = xStart + (xEnd - xStart) * t;
          const waveT = (svgX - 90) / (1310 - 90);
          const svgY = 104 + 34 * Math.sin(waveT * Math.PI * 2);

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
 * LAYOUT 29 — Open Triptych
 * Three airy borderless columns previewing previous, active & next eras side by side.
 */
export function StoriaOpenTriptychLayout({
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
        {/* Left Wing: Quiet Previous Era Preview */}
        <button
          type="button"
          onClick={() => onSelectIdx(prevIdx)}
          className="group hidden cursor-pointer flex-col items-end gap-1.5 text-right transition-opacity hover:opacity-100 focus-visible:outline-none md:col-span-3 md:flex"
        >
          <span className="font-sans text-lg font-light tabular-nums text-purple-200/50 group-hover:text-white">
            ← {prev.year}
          </span>
          <span className="font-heading text-lg uppercase tracking-wide text-purple-200/35 group-hover:text-purple-100/80">
            {prev.title}
          </span>
        </button>

        {/* Center Panel: Active Monumental Era */}
        <div className="flex flex-col items-center gap-3 text-center md:col-span-6 md:border-x md:border-purple-200/20 md:px-8">
          <p className="font-sans text-2xl font-light tabular-nums text-purple-200/75 sm:text-4xl">
            {active.year}
          </p>
          <h3 className="storia-monumental-h3 uppercase text-white">
            {active.title}
          </h3>
          <p className="max-w-md font-sans text-sm text-purple-100/80 sm:text-base">
            {active.subtitle}
          </p>
          <div className="pt-2">
            <StoriaExploreEraButton isOpen={isDossierOpen} onToggle={onToggleDossier} />
          </div>
        </div>

        {/* Right Wing: Quiet Next Era Preview */}
        <button
          type="button"
          onClick={() => onSelectIdx(nextIdx)}
          className="group hidden cursor-pointer flex-col items-start gap-1.5 text-left transition-opacity hover:opacity-100 focus-visible:outline-none md:col-span-3 md:flex"
        >
          <span className="font-sans text-lg font-light tabular-nums text-purple-200/50 group-hover:text-white">
            {next.year} →
          </span>
          <span className="font-heading text-lg uppercase tracking-wide text-purple-200/35 group-hover:text-purple-100/80">
            {next.title}
          </span>
        </button>
      </div>

      {/* Quiet 8-Year Index Row */}
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
                  : "font-light text-purple-200/45 hover:text-white"
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
 * LAYOUT 30 — Zenith Rays
 * 8 faint radial rays fanning from bottom center with a single bright beam to the active year.
 */
export function StoriaZenithRaysLayout({
  milestones,
  activeIdx,
  onSelectIdx,
  isDossierOpen,
  onToggleDossier,
}: StoriaStageLayoutProps) {
  const total = milestones.length;
  const active = milestones[activeIdx] ?? milestones[0];
  const originX = 700;
  const originY = 486;
  const rayRadius = 425;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="@container relative hidden w-full aspect-[1400/500] md:block">
        <svg
          viewBox="0 0 1400 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          {milestones.map((m, idx) => {
            const isActive = idx === activeIdx;
            const t = total > 1 ? idx / (total - 1) : 0.5;
            const deg = -56 + t * 112;
            const rad = (deg * Math.PI) / 180;
            const x2 = originX + rayRadius * Math.sin(rad);
            const y2 = originY - rayRadius * Math.cos(rad);
            return (
              <line
                key={m.id}
                x1={originX}
                y1={originY}
                x2={x2}
                y2={y2}
                className={
                  isActive
                    ? "storia-arc-hairline-bright"
                    : "storia-arc-hairline-faint"
                }
              />
            );
          })}
          <circle cx={originX} cy={originY} r={3} className="fill-purple-200/60" />
        </svg>

        {milestones.map((m, idx) => {
          const isActive = idx === activeIdx;
          const t = total > 1 ? idx / (total - 1) : 0.5;
          const deg = -56 + t * 112;
          const rad = (deg * Math.PI) / 180;
          const labelR = rayRadius + 28;
          const svgX = originX + labelR * Math.sin(rad);
          const svgY = originY - labelR * Math.cos(rad);

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
                  "--storia-rot": `${deg * 0.45}deg`,
                  "--storia-opacity": isActive ? 1 : 0.56,
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

        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center gap-3 px-16 text-center">
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
