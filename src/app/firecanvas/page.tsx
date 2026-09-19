"use client";

import React, { useState, useCallback } from "react";
import PixelFireplaceCanvas from "@/components/PixelFireplaceCanvas";

const PALETTE_THEMES = [
  { id: 0, label: "Violet Ember" },
  { id: 1, label: "Classic Fiery Orange" },
  { id: 2, label: "Cyan Cyber" },
  { id: 3, label: "Toxic Emerald" },
  { id: 4, label: "Silver Monochrome" },
];

const DEFAULTS = {
  flameSpeed: 0.6,
  flameHeight: 1.5,
  sparkDensity: 2.0,
  sparkScale: 0.1,
  paletteTheme: 0,
  useCustomColors: false,
  colorBaseHex: "#151150",
  colorMidHex: "#611EBD",
  colorCoreHex: "#FF7A29",
  colorSparkHex: "#FF6124",
  canvasOpacity: 100,
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-white/70 text-sm font-medium">{label}</span>
        <span className="font-mono text-amber-400 text-sm">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wide text-white/50 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-white/15 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/50 border border-white/15 rounded px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-amber-400"
        />
      </div>
    </div>
  );
}

export default function FireCanvasTunerPage() {
  const [flameSpeed, setFlameSpeed] = useState(DEFAULTS.flameSpeed);
  const [flameHeight, setFlameHeight] = useState(DEFAULTS.flameHeight);
  const [sparkDensity, setSparkDensity] = useState(DEFAULTS.sparkDensity);
  const [sparkScale, setSparkScale] = useState(DEFAULTS.sparkScale);
  const [paletteTheme, setPaletteTheme] = useState(DEFAULTS.paletteTheme);
  const [useCustomColors, setUseCustomColors] = useState(DEFAULTS.useCustomColors);
  const [colorBaseHex, setColorBaseHex] = useState(DEFAULTS.colorBaseHex);
  const [colorMidHex, setColorMidHex] = useState(DEFAULTS.colorMidHex);
  const [colorCoreHex, setColorCoreHex] = useState(DEFAULTS.colorCoreHex);
  const [colorSparkHex, setColorSparkHex] = useState(DEFAULTS.colorSparkHex);
  const [canvasOpacity, setCanvasOpacity] = useState(DEFAULTS.canvasOpacity);
  const [copied, setCopied] = useState(false);

  const resetAll = useCallback(() => {
    setFlameSpeed(DEFAULTS.flameSpeed);
    setFlameHeight(DEFAULTS.flameHeight);
    setSparkDensity(DEFAULTS.sparkDensity);
    setSparkScale(DEFAULTS.sparkScale);
    setPaletteTheme(DEFAULTS.paletteTheme);
    setUseCustomColors(DEFAULTS.useCustomColors);
    setColorBaseHex(DEFAULTS.colorBaseHex);
    setColorMidHex(DEFAULTS.colorMidHex);
    setColorCoreHex(DEFAULTS.colorCoreHex);
    setColorSparkHex(DEFAULTS.colorSparkHex);
    setCanvasOpacity(DEFAULTS.canvasOpacity);
  }, []);

  const copyProps = useCallback(async () => {
    const lines = [
      "<PixelFireplaceCanvas",
      `  flameSpeed={${flameSpeed}}`,
      `  flameHeight={${flameHeight}}`,
      `  sparkDensity={${sparkDensity}}`,
      `  sparkScale={${sparkScale}}`,
      `  paletteTheme={${paletteTheme}}`,
      `  useCustomColors={${useCustomColors}}`,
    ];
    if (useCustomColors) {
      lines.push(
        `  colorBaseHex="${colorBaseHex}"`,
        `  colorMidHex="${colorMidHex}"`,
        `  colorCoreHex="${colorCoreHex}"`,
        `  colorSparkHex="${colorSparkHex}"`
      );
    }
    lines.push("/>");
    const snippet = lines.join("\n");
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy the props below:", snippet);
    }
  }, [
    flameSpeed,
    flameHeight,
    sparkDensity,
    sparkScale,
    paletteTheme,
    useCustomColors,
    colorBaseHex,
    colorMidHex,
    colorCoreHex,
    colorSparkHex,
  ]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Live canvas preview */}
      <div className="relative h-[60vh] min-h-[380px] w-full overflow-hidden border-b border-white/10 bg-[#050308]">
        <PixelFireplaceCanvas
          className="absolute inset-0 h-full w-full"
          style={{ opacity: canvasOpacity / 100 }}
          flameSpeed={flameSpeed}
          flameHeight={flameHeight}
          sparkDensity={sparkDensity}
          sparkScale={sparkScale}
          paletteTheme={paletteTheme}
          useCustomColors={useCustomColors}
          colorBaseHex={colorBaseHex}
          colorMidHex={colorMidHex}
          colorCoreHex={colorCoreHex}
          colorSparkHex={colorSparkHex}
        />
        <div className="pointer-events-none absolute top-4 left-4 text-xs uppercase tracking-[0.2em] text-white/40">
          Fire Canvas Tuner
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Pixel Fireplace — Live Tuner</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={copyProps}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400 whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy JSX props"}
            </button>
          </div>
        </div>

        <p className="text-sm text-white/50">
          Tune the effect here, then hit &ldquo;Copy JSX props&rdquo; and paste the
          block onto the <code className="text-white/70">&lt;PixelFireplaceCanvas /&gt;</code>{" "}
          instance in <code className="text-white/70">BioParallaxSlider.tsx</code>.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <Slider
            label="Flame Speed"
            value={flameSpeed}
            min={0.1}
            max={2.5}
            step={0.1}
            onChange={setFlameSpeed}
            format={(v) => `${v.toFixed(1)}x`}
          />
          <Slider
            label="Flame Height Scale"
            value={flameHeight}
            min={0.2}
            max={3.0}
            step={0.1}
            onChange={setFlameHeight}
            format={(v) => `${v.toFixed(1)}x`}
          />
          <Slider
            label="Spark Density"
            value={sparkDensity}
            min={0.0}
            max={3.0}
            step={0.1}
            onChange={setSparkDensity}
            format={(v) => `${v.toFixed(1)}x`}
          />
          <Slider
            label="Spark Size"
            value={sparkScale}
            min={0.02}
            max={0.2}
            step={0.01}
            onChange={setSparkScale}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Canvas Opacity"
            value={canvasOpacity}
            min={0}
            max={100}
            step={5}
            onChange={setCanvasOpacity}
            format={(v) => `${v}%`}
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-white/70">Palette Theme</div>
          <div className="flex flex-wrap gap-2">
            {PALETTE_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setPaletteTheme(theme.id);
                  setUseCustomColors(false);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  !useCustomColors && paletteTheme === theme.id
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-white/15 text-white/60 hover:bg-white/5"
                }`}
              >
                {theme.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUseCustomColors(true)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                useCustomColors
                  ? "border-amber-400 bg-amber-400/10 text-amber-300"
                  : "border-white/15 text-white/60 hover:bg-white/5"
              }`}
            >
              Custom Colors
            </button>
          </div>
        </div>

        {useCustomColors && (
          <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <ColorField label="Base (coolest)" value={colorBaseHex} onChange={setColorBaseHex} />
            <ColorField label="Mid" value={colorMidHex} onChange={setColorMidHex} />
            <ColorField label="Core (hottest)" value={colorCoreHex} onChange={setColorCoreHex} />
            <ColorField label="Spark" value={colorSparkHex} onChange={setColorSparkHex} />
          </div>
        )}
      </div>
    </main>
  );
}
