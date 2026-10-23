"use client";

/**
 * Live editor for the guitar-pick menu icon (GuitarPickIcon).
 * Loaded by ClientOnlyExtras in development or with ?tuner=true / ?picks=true.
 * It sets the --pick-* CSS variables on <html>, so the real header icon
 * updates as you drag. Settings stay in this browser only; use "Copy CSS"
 * and paste the result into globals.css to make them permanent.
 */

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import GuitarPickIcon from "@/components/GuitarPickIcon";

interface PickSettings {
  gap: number; // icon units from centre to each tip
  scale: number; // size of each pick
  size: number; // px, whole icon box
  width: number;
  length: number;
  spin: number; // deg per click
  rest: number; // deg
  continuous: boolean;
  duration: number; // ms
  ease: string;
  color: string;
  hoverColor: string;
}

const SWOOSH = "cubic-bezier(0.496, 0.004, 0, 1)";

const DEFAULTS: PickSettings = {
  gap: 8.25,
  scale: 0.77,
  size: 32,
  width: 1.18,
  length: 1.24,
  spin: 135,
  rest: 0,
  continuous: false,
  duration: 700,
  ease: SWOOSH,
  color: "#ffffff",
  hoverColor: "#ffffff",
};

const EASES = [
  { label: "Swoosh", value: SWOOSH },
  { label: "Expo", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { label: "Bounce", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  { label: "Linear", value: "linear" },
];

const STORAGE_KEY = "pick-icon-tuner";

function toVars(s: PickSettings): Record<string, string> {
  return {
    "--pick-gap": `${s.gap}px`,
    "--pick-scale": String(s.scale),
    "--pick-size": `${s.size}px`,
    "--pick-width": String(s.width),
    "--pick-length": String(s.length),
    "--pick-spin": `${s.spin}deg`,
    "--pick-rest": `${s.rest}deg`,
    "--pick-continuous": s.continuous ? "1" : "0",
    "--pick-duration": `${s.duration}ms`,
    "--pick-ease": s.ease,
    "--pick-color": s.color,
    "--pick-hover-color": s.hoverColor,
  };
}

function apply(s: PickSettings | null) {
  const root = document.documentElement;
  const vars = toVars(s ?? DEFAULTS);
  Object.entries(vars).forEach(([k, v]) => {
    if (s) root.style.setProperty(k, v);
    else root.style.removeProperty(k);
  });
}

function load(): PickSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function save(s: PickSettings | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked — settings just won't persist */
  }
}

function toCss(s: PickSettings) {
  return (
    "/* globals.css — guitar-pick menu icon */\n:root {\n" +
    Object.entries(toVars(s))
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n") +
    "\n}"
  );
}

type NumKey = "gap" | "scale" | "size" | "width" | "length" | "spin" | "rest" | "duration";

// Portal onto <body>: the site's page wrapper has a CSS transform, which
// would otherwise turn `position: fixed` into "fixed to the wrapper" and
// push the panel thousands of px down the page.
const toBody = (node: ReactNode) => (typeof document === "undefined" ? null : createPortal(node, document.body));

export default function PickIconTuner() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<PickSettings>(DEFAULTS);
  const [spun, setSpun] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = load();
    if (saved) {
      setS(saved);
      apply(saved);
    }
  }, []);

  const update = (patch: Partial<PickSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    apply(next);
    save(next);
  };

  const reset = () => {
    setS(DEFAULTS);
    apply(null);
    save(null);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toCss(s));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  if (!open) {
    return toBody(
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[1000000] mb-[env(safe-area-inset-bottom)] rounded-full border border-white/20 bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        Picks
      </button>,
    );
  }

  const label = "flex justify-between text-xs font-semibold text-white/80";

  const slider = (k: NumKey, name: string, min: number, max: number, step: number, unit = "") => (
    <div key={k} className="flex flex-col gap-1">
      <label htmlFor={`pick-${k}`} className={label}>
        <span>{name}</span>
        <span className="font-mono text-amber-300">
          {s[k]}
          {unit}
        </span>
      </label>
      <input
        id={`pick-${k}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={s[k]}
        onChange={(e) => update({ [k]: Number(e.target.value) } as Partial<PickSettings>)}
        className="cursor-pointer accent-amber-500"
      />
    </div>
  );

  return toBody(
    <aside
      data-lenis-prevent
      aria-label="Guitar pick icon tuner"
      className="custom-scrollbar fixed bottom-4 right-4 z-[1000000] mb-[env(safe-area-inset-bottom)] max-h-[85dvh] w-[280px] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#0b0812]/95 p-4 text-white shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <strong className="text-sm">Guitar pick icon</strong>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close pick tuner"
          className="h-8 w-8 rounded-full text-lg leading-none transition-colors hover:bg-white/10"
        >
          ×
        </button>
      </div>

      {/* Live preview — click to spin */}
      <button
        type="button"
        onClick={() => setSpun((v) => !v)}
        className="group mb-4 flex h-28 w-full items-center justify-center rounded-xl border border-white/10 bg-black"
        aria-label="Spin preview"
      >
        <GuitarPickIcon open={spun} />
      </button>

      <div className="flex flex-col gap-4">
        <strong className="text-sm">Layout</strong>
        {slider("gap", "Space between picks", 0, 20, 0.25)}
        {slider("scale", "Pick size", 0.3, 1.5, 0.01, "×")}
        {slider("size", "Whole icon size", 12, 64, 1, "px")}
        {slider("width", "Pick width", 0.5, 1.5, 0.01, "×")}
        {slider("length", "Pick length", 0.5, 1.5, 0.01, "×")}

        <hr className="border-white/10" />
        <strong className="text-sm">Spin</strong>
        {slider("spin", "Spin per click", -360, 360, 5, "°")}
        {slider("rest", "Resting angle", 0, 90, 1, "°")}
        {slider("duration", "Speed", 100, 2000, 50, "ms")}

        <div className="grid grid-cols-2 gap-1">
          {[
            { label: "Spin & return", v: false },
            { label: "Keep spinning", v: true },
          ].map((m) => (
            <button
              key={m.label}
              type="button"
              aria-pressed={s.continuous === m.v}
              onClick={() => update({ continuous: m.v })}
              className={`rounded-lg py-1.5 text-xs font-semibold ${s.continuous === m.v ? "bg-amber-500 text-black" : "bg-white/10 text-white"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1">
          {EASES.map((e) => (
            <button
              key={e.label}
              type="button"
              aria-pressed={s.ease === e.value}
              onClick={() => update({ ease: e.value })}
              className={`rounded-lg py-1.5 text-[11px] font-semibold ${s.ease === e.value ? "bg-amber-500 text-black" : "bg-white/10 text-white"}`}
            >
              {e.label}
            </button>
          ))}
        </div>

        <hr className="border-white/10" />
        <strong className="text-sm">Colour</strong>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/80">
          <label className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5">
            Fill
            <input type="color" value={s.color} onChange={(e) => update({ color: e.target.value })} />
          </label>
          <label className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5">
            Hover
            <input type="color" value={s.hoverColor} onChange={(e) => update({ hoverColor: e.target.value })} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={reset} className="rounded-lg bg-white/10 py-2 text-xs font-semibold">
            Reset
          </button>
          <button type="button" onClick={copy} className="rounded-lg bg-amber-500 py-2 text-xs font-semibold text-black">
            {copied ? "Copied!" : "Copy CSS"}
          </button>
        </div>
      </div>
    </aside>,
  );
}
