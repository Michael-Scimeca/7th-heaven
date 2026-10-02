"use client";

/**
 * Dev-only live editor for the top ProgressiveBlur strip and the
 * title → paragraph gaps (TitleGroup.css).
 * Loaded by ClientOnlyExtras in development or with ?dev=true.
 * It edits the CSS variables in ProgressiveBlur.css on <html>, so what you
 * see is exactly what the site will render. Settings are kept in this
 * browser only; use "Copy CSS" to make them permanent in ProgressiveBlur.css.
 */

import { useEffect, useState } from "react";

type Layers = "auto" | "3" | "4" | "5";

interface BlurSettings {
  blur: number; // em, strength of the blurriest layer
  scale: number; // strip height × --header-height
  tint: number; // 0–1
  layers: Layers;
  // Title → paragraph gaps (rem). null = use the value in TitleGroup.css
  gapPage: number | null;
  gapSection: number | null;
  gapSub: number | null;
  // Hover motion
  durationBase: number | null; // ms (null = default 300ms)
  easeOut: string | null; // easing curve
  // Heading max sizes (rem). null = use default clamp
  h1Max: number | null;
  h2Max: number | null;
  h3Max: number | null;
  h4Max: number | null;
  h5Max: number | null;
  h6Max: number | null;
}

const DEFAULTS: BlurSettings = {
  blur: 1.5,
  scale: 1.8,
  tint: 0,
  layers: "auto",
  gapPage: null,
  gapSection: null,
  gapSub: null,
  durationBase: null,
  easeOut: null,
  h1Max: null,
  h2Max: null,
  h3Max: null,
  h4Max: null,
  h5Max: null,
  h6Max: null,
};

const HEADING_DEFAULTS = {
  h1Max: 4.0,
  h2Max: 3.0,
  h3Max: 2.25,
  h4Max: 1.75,
  h5Max: 1.35,
  h6Max: 1.15,
} as const;

const GAP_VARS = {
  gapPage: "--title-gap-page",
  gapSection: "--title-gap-section",
  gapSub: "--title-gap-sub",
} as const;
type GapKey = keyof typeof GAP_VARS;
// What each gap starts at in TitleGroup.css (for the slider position only).
const GAP_START: Record<GapKey, number> = { gapPage: 0.5, gapSection: 0.5, gapSub: 0.375 };
const STORAGE_KEY = "pb-tuner";

const EASING_PRESETS = [
  { label: "Expo", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { label: "In-Out", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
  { label: "Quad", value: "cubic-bezier(0.25, 1, 0.5, 1)" },
  { label: "Linear", value: "linear" },
];

function load(): BlurSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function save(s: BlurSettings | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked (private mode) — settings just won't persist */
  }
}

function apply(s: BlurSettings | null) {
  const root = document.documentElement;
  if (!s) {
    root.style.removeProperty("--pb-blur");
    root.style.removeProperty("--pb-scale");
    root.style.removeProperty("--pb-tint");
    root.removeAttribute("data-pb-layers");
    Object.values(GAP_VARS).forEach((v) => root.style.removeProperty(v));
    root.style.removeProperty("--duration-base");
    root.style.removeProperty("--default-transition-duration");
    root.style.removeProperty("--ease-out");
    root.style.removeProperty("--default-transition-timing-function");
    (["h1Max", "h2Max", "h3Max", "h4Max", "h5Max", "h6Max"] as const).forEach((k) => {
      root.style.removeProperty(`--font-size-${k.replace("Max", "")}`);
    });
    return;
  }
  (Object.keys(GAP_VARS) as GapKey[]).forEach((k) => {
    const val = s[k];
    if (val === null) root.style.removeProperty(GAP_VARS[k]);
    else root.style.setProperty(GAP_VARS[k], `${val}rem`);
  });
  root.style.setProperty("--pb-blur", `${s.blur}em`);
  root.style.setProperty("--pb-scale", String(s.scale));
  root.style.setProperty("--pb-tint", String(s.tint));
  if (s.layers === "auto") root.removeAttribute("data-pb-layers");
  else root.setAttribute("data-pb-layers", s.layers);

  if (s.durationBase === null) {
    root.style.removeProperty("--duration-base");
    root.style.removeProperty("--default-transition-duration");
  } else {
    root.style.setProperty("--duration-base", `${s.durationBase}ms`);
    root.style.setProperty("--default-transition-duration", `${s.durationBase}ms`);
  }

  if (s.easeOut === null) {
    root.style.removeProperty("--ease-out");
    root.style.removeProperty("--default-transition-timing-function");
  } else {
    root.style.setProperty("--ease-out", s.easeOut);
    root.style.setProperty("--default-transition-timing-function", s.easeOut);
  }

  (["h1Max", "h2Max", "h3Max", "h4Max", "h5Max", "h6Max"] as const).forEach((k) => {
    const val = s[k];
    const token = `--font-size-${k.replace("Max", "")}`;
    if (val === null) {
      root.style.removeProperty(token);
    } else {
      root.style.setProperty(token, `${val}rem`);
    }
  });
}

function toCss(s: BlurSettings) {
  let out =
    `/* ProgressiveBlur.css */\n:root {\n  --pb-blur: ${s.blur}em;\n  --pb-scale: ${s.scale};\n  --pb-tint: ${s.tint};\n}` +
    (s.layers === "auto" ? "" : `\n/* layers: ${s.layers} (set html data-pb-layers="${s.layers}") */`);
  const gaps = (Object.keys(GAP_VARS) as GapKey[]).filter((k) => s[k] !== null);
  if (gaps.length) {
    out +=
      `\n\n/* TitleGroup.css */\n:root {\n` +
      gaps.map((k) => `  ${GAP_VARS[k]}: ${s[k]}rem;`).join("\n") +
      `\n}`;
  }
  if (s.durationBase !== null || s.easeOut !== null) {
    out += `\n\n/* globals.css Motion Tokens */\n@theme {\n`;
    if (s.durationBase !== null) {
      out += `  --duration-base: ${s.durationBase}ms;\n  --default-transition-duration: ${s.durationBase}ms;\n`;
    }
    if (s.easeOut !== null) {
      out += `  --ease-out: ${s.easeOut};\n  --default-transition-timing-function: ${s.easeOut};\n`;
    }
    out += `}`;
  }
  const headingOverrides = (["h1Max", "h2Max", "h3Max", "h4Max", "h5Max", "h6Max"] as const).filter((k) => s[k] !== null);
  if (headingOverrides.length) {
    out += `\n\n/* globals.css Heading Max Size Tokens */\n@theme {\n`;
    headingOverrides.forEach((k) => {
      const level = k.replace("Max", "");
      out += `  --font-size-${level}: ${s[k]}rem;\n`;
    });
    out += `}`;
  }
  return out;
}

export default function BlurTuner() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<BlurSettings>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  // Restore saved settings once on mount.
  useEffect(() => {
    const saved = load();
    if (saved) {
      setS(saved);
      apply(saved);
    }
  }, []);

  const update = (patch: Partial<BlurSettings>) => {
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
      /* clipboard blocked — values are visible in the panel anyway */
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[1000000] mb-[env(safe-area-inset-bottom)] rounded-full border border-white/20 bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        Tune
      </button>
    );
  }

  const row = "flex flex-col gap-1";
  const label = "flex justify-between text-xs font-semibold text-white/80";

  return (
    <aside
      aria-label="Design tuner"
      className="fixed bottom-4 left-4 z-[1000000] mb-[env(safe-area-inset-bottom)] max-h-[85dvh] w-[280px] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#0b0812]/95 p-4 text-white shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <strong className="text-sm">Top blur</strong>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close blur tuner"
          className="transition-colors h-8 w-8 rounded-full text-lg leading-none hover:bg-white/10"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className={row}>
          <label htmlFor="pb-blur" className={label}>
            <span>Strength</span>
            <span>{s.blur.toFixed(2)}em</span>
          </label>
          <input
            id="pb-blur"
            type="range"
            min={0}
            max={4}
            step={0.05}
            value={s.blur}
            onChange={(e) => update({ blur: Number(e.target.value) })}
          />
        </div>

        <div className={row}>
          <label htmlFor="pb-scale" className={label}>
            <span>Height</span>
            <span>{s.scale.toFixed(1)}× header</span>
          </label>
          <input
            id="pb-scale"
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={s.scale}
            onChange={(e) => update({ scale: Number(e.target.value) })}
          />
        </div>

        <div className={row}>
          <label htmlFor="pb-tint" className={label}>
            <span>Dark tint</span>
            <span>{Math.round(s.tint * 100)}%</span>
          </label>
          <input
            id="pb-tint"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.tint}
            onChange={(e) => update({ tint: Number(e.target.value) })}
          />
        </div>

        <div className={row}>
          <span className={label}>
            <span>Layers</span>
            <span className="font-normal text-white/50">auto = 5 desktop / 3 mobile</span>
          </span>
          <div className="grid grid-cols-4 gap-1">
            {(["auto", "3", "4", "5"] as Layers[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => update({ layers: l })}
                aria-pressed={s.layers === l}
                className={`rounded-lg py-1.5 text-xs font-semibold ${s.layers === l ? "bg-white text-black" : "bg-white/10 text-white"
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-white/10" />
        <strong className="text-sm">Title → text gap</strong>

        {(
          [
            ["gapPage", "Page titles (H1)"],
            ["gapSection", "Section titles (H2)"],
            ["gapSub", "Sub titles (H3)"],
          ] as [GapKey, string][]
        ).map(([k, name]) => {
          const val = s[k] ?? GAP_START[k];
          const px = Math.round(val * 16);
          return (
            <div key={k} className={row}>
              <label htmlFor={`gap-${k}`} className={label}>
                <span>{name}</span>
                <span className="font-mono text-purple-300">
                  {val.toFixed(2)}rem ({px}px)
                </span>
              </label>
              <input
                id={`gap-${k}`}
                type="range"
                min={0}
                max={3}
                step={0.025}
                value={val}
                onChange={(e) => update({ [k]: Number(e.target.value) } as Partial<BlurSettings>)}
                className="accent-purple-500 cursor-pointer"
              />
              <div className="flex gap-1 pt-0.5">
                {[
                  { label: "0px", r: 0 },
                  { label: "4px", r: 0.25 },
                  { label: "8px", r: 0.5 },
                  { label: "12px", r: 0.75 },
                  { label: "16px", r: 1 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => update({ [k]: p.r } as Partial<BlurSettings>)}
                    className={`flex-1 rounded py-0.5 text-[10px] font-mono transition-colors ${Math.abs(val - p.r) < 0.01
                        ? "bg-purple-600 text-white  "
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <hr className="border-white/10" />
        <strong className="text-sm">Hover motion</strong>

        <div className={row}>
          <label htmlFor="hover-duration" className={label}>
            <span>Hover speed</span>
            <span className="font-mono text-cyan-300">
              {s.durationBase ?? 300}ms {s.durationBase === null ? "(default)" : ""}
            </span>
          </label>
          <input
            id="hover-duration"
            type="range"
            min={50}
            max={1000}
            step={25}
            value={s.durationBase ?? 300}
            onChange={(e) => update({ durationBase: Number(e.target.value) })}
            className="accent-cyan-500 cursor-pointer"
          />
          <div className="flex gap-1 pt-0.5">
            {[
              { label: "150ms", d: 150 },
              { label: "200ms", d: 200 },
              { label: "300ms", d: 300 },
              { label: "500ms", d: 500 },
              { label: "1000ms", d: 1000 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => update({ durationBase: p.d })}
                className={`flex-1 rounded py-0.5 text-[10px] font-mono transition-colors ${(s.durationBase ?? 300) === p.d
                    ? "bg-cyan-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={row}>
          <span className={label}>
            <span>Hover easing</span>
            <span className="font-mono text-cyan-300">
              {EASING_PRESETS.find((p) => p.value === (s.easeOut ?? EASING_PRESETS[0].value))?.label ?? "Custom"}
            </span>
          </span>
          <div className="grid grid-cols-4 gap-1">
            {EASING_PRESETS.map((p) => {
              const active = (s.easeOut ?? EASING_PRESETS[0].value) === p.value;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => update({ easeOut: p.value })}
                  aria-pressed={active}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${active ? "bg-cyan-600 text-white" : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-white/10" />
        <strong className="text-sm">Heading max sizes</strong>

        {(
          [
            ["h1Max", "H1 (Page Title)", 2.5, 6.0, 0.125],
            ["h2Max", "H2 (Section)", 2.0, 4.5, 0.125],
            ["h3Max", "H3 (Card Group)", 1.5, 3.5, 0.125],
            ["h4Max", "H4 (Card / Item)", 1.25, 2.5, 0.05],
            ["h5Max", "H5 (Compact)", 1.0, 2.0, 0.05],
            ["h6Max", "H6 (Metric / Small)", 0.875, 1.5, 0.05],
          ] as const
        ).map(([k, labelText, minVal, maxVal, stepVal]) => {
          const val = s[k] ?? HEADING_DEFAULTS[k];
          const px = Math.round(val * 16);
          return (
            <div key={k} className={row}>
              <label htmlFor={`heading-${k}`} className={label}>
                <span>{labelText}</span>
                <span className="font-mono text-purple-300">
                  {val.toFixed(2)}rem ({px}px)
                </span>
              </label>
              <input
                id={`heading-${k}`}
                type="range"
                min={minVal}
                max={maxVal}
                step={stepVal}
                value={val}
                onChange={(e) => update({ [k]: Number(e.target.value) } as Partial<BlurSettings>)}
                className="accent-purple-500 cursor-pointer"
              />
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-white/10 py-2 text-xs font-semibold"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-purple-600 py-2 text-xs font-semibold"
          >
            {copied ? "Copied!" : "Copy CSS"}
          </button>
        </div>
      </div>
    </aside>
  );
}
