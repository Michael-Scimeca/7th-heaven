"use client";

/**
 * Control panel for the halftone page transition.
 * Open with ?halftone-tuner=on (remembered in this browser), close with the × or ?halftone-tuner=off.
 * Changes apply to the next transition and are saved in localStorage.
 */

import { useState } from "react";
import { useHalftone } from "./HalftoneTransition";
import {
  type HalftoneArrival,
  HALFTONE_DEFAULTS,
  HALFTONE_EASES,
  HALFTONE_PRESETS,
  matchPreset,
  presetSettings,
  type HalftoneEase,
  type HalftoneSettings,
} from "./settings";

type NumKey = Exclude<keyof HalftoneSettings, "ease" | "arrival">;

const ARRIVALS: { value: HalftoneArrival; label: string }[] = [
  { value: "match", label: "Match main curve (Buttermax)" },
  { value: "glide", label: "Glide in (soft landing)" },
  { value: "spring", label: "Spring in (overshoot)" },
];

const GROUPS: { title: string; rows: { key: NumKey; label: string; min: number; max: number; step: number; hint?: string }[] }[] = [
  {
    title: "Timing",
    rows: [{ key: "duration", label: "Duration (s)", min: 0.6, max: 5, step: 0.1 }],
  },
  {
    title: "Dots",
    rows: [
      { key: "dotsAcross", label: "Dots across screen", min: 6, max: 60, step: 1 },
      { key: "dotBlur", label: "Liquid merge", min: 0.1, max: 1.2, step: 0.01, hint: "softer dots melt together more" },
      { key: "spread", label: "Spread speed", min: 4, max: 30, step: 0.5, hint: "how fast the circle grows from your click" },
    ],
  },
  {
    title: "Old page (leaving)",
    rows: [
      { key: "oldZoom", label: "Zoom in", min: 0, max: 3, step: 0.05 },
      { key: "oldTurn", label: "Rotation", min: 0, max: 1, step: 0.01, hint: "more when you click further right" },
      { key: "rgb", label: "Color split", min: 0, max: 0.05, step: 0.001 },
      { key: "anchorPull", label: "Zoom anchor → centre", min: 0, max: 1, step: 0.05, hint: "0 = zoom around your click" },
    ],
  },
  {
    title: "New page (arriving)",
    rows: [
      { key: "newScale", label: "Starting size", min: 0.2, max: 1, step: 0.01 },
      { key: "newTurn", label: "Starting rotation", min: 0, max: 1, step: 0.01 },
      { key: "newRise", label: "Rise from below", min: 0, max: 0.4, step: 0.01 },
      { key: "newBlur", label: "Focus pull (blur → sharp)", min: 0, max: 0.03, step: 0.001 },
      { key: "newSplit", label: "Colour settle", min: 0, max: 0.05, step: 0.001 },
      { key: "overshoot", label: "Spring overshoot", min: 0, max: 0.4, step: 0.01, hint: "only with Spring in" },
    ],
  },
  {
    title: "Look",
    rows: [
      { key: "crt", label: "Screen bulge", min: 0, max: 0.6, step: 0.01 },
      { key: "rimWidth", label: "Rainbow rim width", min: 0, max: 0.4, step: 0.01, hint: "0 turns the rims off" },
      { key: "rimEnd", label: "Rim fades out by", min: 0.25, max: 1, step: 0.01 },
    ],
  },
];

const ORIGINS = [
  { label: "Centre", x: 0.5, y: 0.5 },
  { label: "Top right", x: 0.9, y: 0.08 },
  { label: "Top left", x: 0.1, y: 0.08 },
  { label: "Bottom left", x: 0.1, y: 0.92 },
  { label: "Bottom right", x: 0.9, y: 0.92 },
];

const fmt = (n: number, step: number) => (step >= 1 ? String(Math.round(n)) : n.toFixed(step < 0.01 ? 3 : 2));

export default function HalftoneTuner() {
  const { settings, setSettings, resetSettings, preview, closeTuner } = useHalftone();
  const [origin, setOrigin] = useState(0);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const current = matchPreset(settings);
  const choosePreset = (i: number) => {
    const n = (i + HALFTONE_PRESETS.length) % HALFTONE_PRESETS.length;
    setSettings(presetSettings(n));
    // play it straight away so you can compare looks quickly
    window.setTimeout(() => preview({ x: ORIGINS[origin].x, y: ORIGINS[origin].y }), 30);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed right-4 bottom-4 rounded-full border border-white/15 bg-[#0f0717]/92 px-4 py-2 text-[12px] font-semibold text-white shadow-2xl backdrop-blur-md transition-colors duration-200 hover:bg-[#1b1121]"
        style={{ zIndex: 2147483000, fontFamily: "var(--font-body)" }}
      >
        Halftone controls
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Halftone transition controls"
      data-no-text-anim
      className="fixed right-4 bottom-4 flex max-h-[82vh] w-[320px] flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0f0717]/92 text-white shadow-2xl backdrop-blur-md"
      style={{ zIndex: 2147483000, fontFamily: "var(--font-body)" }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold">Halftone transition</p>
          <p className="text-[11px] text-white/55">FAQ ↔ Contact · saved in this browser</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Minimize controls"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            –
          </button>
          <button
            type="button"
            onClick={closeTuner}
            aria-label="Close controls"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-3">
        <span className="text-[10px] font-semibold tracking-[0.14em] text-[#ffb627] uppercase">Presets</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous preset"
            onClick={() => choosePreset((current < 0 ? 0 : current) - 1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors duration-200 hover:bg-white/10"
          >
            ‹
          </button>
          <select
            aria-label="Preset"
            value={current}
            onChange={(e) => choosePreset(Number(e.target.value))}
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-3 py-1.5 text-[12px] text-white"
          >
            {current < 0 && (
              <option value={-1} className="bg-[#0f0717]">
                Custom
              </option>
            )}
            {Array.from(new Set(HALFTONE_PRESETS.map((p) => p.group ?? "Looks"))).map((group) => (
              <optgroup key={group} label={group === "Looks" ? "Looks" : group === "Arrival" ? "Better arrivals" : `${group} variations`} className="bg-[#0f0717]">
                {HALFTONE_PRESETS.map((p, i) =>
                  (p.group ?? "Looks") === group ? (
                    <option key={p.name} value={i} className="bg-[#0f0717]">
                      {i + 1}. {p.name} — {p.note}
                    </option>
                  ) : null,
                )}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            aria-label="Next preset"
            onClick={() => choosePreset(current + 1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors duration-200 hover:bg-white/10"
          >
            ›
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => preview({ x: ORIGINS[origin].x, y: ORIGINS[origin].y })}
            className="flex-1 rounded-full bg-[#8a1cfc] px-3 py-2 text-[12px] font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-[#9d3dfd]"
          >
            Preview
          </button>
          <select
            aria-label="Preview starts from"
            value={origin}
            onChange={(e) => setOrigin(Number(e.target.value))}
            className="rounded-full border border-white/15 bg-transparent px-3 text-[12px] text-white"
          >
            {ORIGINS.map((o, i) => (
              <option key={o.label} value={i} className="bg-[#0f0717]">
                From {o.label.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <label className="flex flex-col gap-1 text-[11px] text-white/65">
          Easing
          <select
            value={settings.ease}
            onChange={(e) => setSettings({ ease: e.target.value as HalftoneEase })}
            className="rounded-md border border-white/15 bg-transparent px-2 py-1.5 text-[12px] text-white"
          >
            {(Object.keys(HALFTONE_EASES) as HalftoneEase[]).map((k) => (
              <option key={k} value={k} className="bg-[#0f0717]">
                {HALFTONE_EASES[k].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-4 py-3">
        {GROUPS.map((g) => (
          <fieldset key={g.title} className="flex flex-col gap-2.5">
            <legend className="mb-1 text-[10px] font-semibold tracking-[0.14em] text-[#ffb627] uppercase">{g.title}</legend>
            {g.title.startsWith("New page") && (
              <label className="flex flex-col gap-1 text-[11px] text-white/80">
                Arrival curve
                <select
                  value={settings.arrival}
                  onChange={(e) => setSettings({ arrival: e.target.value as HalftoneArrival })}
                  className={`rounded-md border border-white/15 bg-transparent px-2 py-1.5 text-[12px] ${settings.arrival !== HALFTONE_DEFAULTS.arrival ? "text-[#ffb627]" : "text-white"}`}
                >
                  {ARRIVALS.map((a) => (
                    <option key={a.value} value={a.value} className="bg-[#0f0717]">
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {g.rows.map((r) => {
              const v = settings[r.key];
              const changed = v !== HALFTONE_DEFAULTS[r.key];
              return (
                <label key={r.key} className="flex flex-col gap-1" title={r.hint}>
                  <span className="flex justify-between text-[11px]">
                    <span className="text-white/80">{r.label}</span>
                    <span className={`font-mono tabular-nums ${changed ? "text-[#ffb627]" : "text-white/50"}`}>{fmt(v, r.step)}</span>
                  </span>
                  <input
                    type="range"
                    min={r.min}
                    max={r.max}
                    step={r.step}
                    value={v}
                    onChange={(e) => setSettings({ [r.key]: Number(e.target.value) } as Partial<HalftoneSettings>)}
                    className="w-full accent-[#ffb627]"
                  />
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>

      <div className="flex gap-2 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={resetSettings}
          className="flex-1 rounded-full border border-white/20 px-3 py-2 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-white/10"
        >
          Reset to Buttermax
        </button>
        <button
          type="button"
          onClick={copy}
          className="flex-1 rounded-full border border-white/20 px-3 py-2 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy settings"}
        </button>
      </div>
    </div>
  );
}
