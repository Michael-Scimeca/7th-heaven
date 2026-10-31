"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Layers,
  Sliders,
  X,
  Play,
  Volume2,
  Maximize2,
  Info,
  Check,
  Flame,
  ArrowRightLeft,
  RotateCw,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";

// Dynamically import LiquidGlass from quick-liquid to ensure zero SSR execution
const QuickLiquidComp = dynamic(
  () =>
    import("quick-liquid/react").then((mod) => {
      // Type wrapper
      return mod.LiquidGlass;
    }),
  { ssr: false }
);

interface LiquidGlassComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrackTitle?: string;
  activeTrackSubtitle?: string;
}

export default function LiquidGlassComparison({
  isOpen,
  onClose,
  activeTrackTitle = "Monster",
  activeTrackSubtitle = "Heavy Rock Powerhouse • Live Preview",
}: LiquidGlassComparisonProps) {
  const [mounted, setMounted] = useState(false);
  const [material, setMaterial] = useState<"clear" | "thin" | "regular" | "thick">("regular");
  const [refractionStrength, setRefractionStrength] = useState(26);
  const [chromaticAberration, setChromaticAberration] = useState(0.24);
  const [bezelWidth, setBezelWidth] = useState(36);
  const [cursorTracking, setCursorTracking] = useState(true);
  const [jiggleKey, setJiggleKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="liquid-comparison-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl rounded-[28px] bg-zinc-950/90 border border-white/15 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-white/20 flex items-center justify-center text-amber-300">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="liquid-comparison-title"
                className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2"
              >
                Side-by-Side Engine Lab: Standard CSS Blur vs. QuickLiquid
              </h2>
              <p className="text-xs text-zinc-400">
                Comparing standard browser Gaussian backdrop-filter with QuickLiquid SVG Snell&apos;s Law displacement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Comparison Lab"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tuning Bar for QuickLiquid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
          {/* Preset selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              Liquid Preset
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
              {(["clear", "thin", "regular", "thick"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMaterial(m)}
                  className={`py-1 rounded-lg text-center font-bold capitalize transition-all ${
                    material === m
                      ? "bg-amber-400 text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Refraction Strength */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                Refraction (Distortion)
              </span>
              <span className="font-mono text-amber-300 font-bold">{refractionStrength}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={refractionStrength}
              onChange={(e) => setRefractionStrength(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Chromatic Dispersion */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                Chromatic Aberration
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {(chromaticAberration * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.02"
              value={chromaticAberration}
              onChange={(e) => setChromaticAberration(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Physics & Tracking */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex flex-col">
              <span className="text-zinc-300 font-bold">Cursor Light Tracking</span>
              <span className="text-[10px] text-zinc-500">Specular rim tilts with pointer</span>
            </div>
            <Toggle
              checked={cursorTracking}
              onChange={setCursorTracking}
              label="Toggle Cursor Tracking"
              hideLabel
              size="sm"
            />
          </div>
        </div>

        {/* Side by Side Display Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* LEFT: Standard CSS Blur Card */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                <h3 className="font-bold text-sm text-zinc-200">Standard CSS Backdrop Blur</h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                CSS filter: blur()
              </span>
            </div>

            {/* Visual Glass Container */}
            <div className="relative min-h-[320px] rounded-[24px] overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-2xl backdrop-saturate-150 p-6 flex flex-col justify-between shadow-2xl group transition-all">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 border border-white/20 text-white">
                  Flat Translucent Scrim
                </span>
                <span className="font-mono text-xs text-zinc-400">FPS: 120 (Native GPU)</span>
              </div>

              {/* Center Content simulating Media Card */}
              <div className="flex flex-col gap-3 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">{activeTrackTitle}</h4>
                  <p className="text-xs text-zinc-300">{activeTrackSubtitle}</p>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/60 h-full w-2/5 rounded-full" />
                </div>
              </div>

              {/* Explanatory notes */}
              <div className="pt-4 border-t border-white/10 text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">How it works:</strong> Isotropic Gaussian blur. Blurs all pixels equally in all directions without bending or optical refraction. Extremely fast, lightweight, and standard across all browsers.
              </div>
            </div>
          </div>

          {/* RIGHT: QuickLiquid Refractive Glass Card */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-bold text-sm text-amber-300">QuickLiquid (notnauti / amarnath3003)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setJiggleKey((k) => k + 1)}
                  className="flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  Jiggle
                </button>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  SVG Displacement Map
                </span>
              </div>
            </div>

            {/* Visual Glass Container powered by QuickLiquid */}
            <div className="relative min-h-[320px] rounded-[24px] overflow-hidden shadow-2xl transition-all">
              <QuickLiquidComp
                key={jiggleKey}
                jiggle={jiggleKey > 0 ? 1 : false}
                liquidPress={{ scale: 0.98, squish: 0.04 }}
                config={{
                  material,
                  refractionStrength,
                  chromaticAberration,
                  bezelWidth,
                  cursorTracking,
                  dynamicLighting: cursorTracking,
                  borderRadius: 24,
                  quality: "high",
                }}
                className="w-full h-full min-h-[320px] p-6 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Snell&apos;s Law Refraction
                  </span>
                  <span className="font-mono text-xs text-cyan-300 font-bold">RGB Split Active</span>
                </div>

                {/* Center Content simulating Media Card */}
                <div className="flex flex-col gap-3 my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                    <Play className="w-6 h-6 ml-0.5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">{activeTrackTitle}</h4>
                    <p className="text-xs text-amber-200/90">{activeTrackSubtitle}</p>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full w-2/5 rounded-full" />
                  </div>
                </div>

                {/* Explanatory notes */}
                <div className="pt-4 border-t border-white/10 text-[11px] text-zinc-300 leading-relaxed">
                  <strong className="text-amber-300">How it works:</strong> Generates a dynamic 1D LUT refraction profile and SVG displacement map. Notice how edges physically warp, magnify, and split light into red/blue prisms over the moving video!
                </div>
              </QuickLiquidComp>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="pb-2 font-semibold">Optical Property</th>
                <th className="pb-2 font-semibold">Standard CSS Blur</th>
                <th className="pb-2 font-semibold text-amber-300">QuickLiquid (notnauti)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              <tr>
                <td className="py-2 font-bold text-zinc-200">Light Refraction</td>
                <td className="py-2 text-zinc-400">None (flat Gaussian blur)</td>
                <td className="py-2 text-emerald-400 font-semibold">True convex optical bending (Snell&apos;s Law)</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-zinc-200">Chromatic Dispersion</td>
                <td className="py-2 text-zinc-400">None (monochromatic)</td>
                <td className="py-2 text-cyan-300 font-semibold">Separate R, G, B displacement channels</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-zinc-200">Bezel Specular Glint</td>
                <td className="py-2 text-zinc-400">Flat 1px border stroke</td>
                <td className="py-2 text-amber-300 font-semibold">Physically calculated rim lighting & cursor tilt</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-zinc-200">Spring Physics</td>
                <td className="py-2 text-zinc-400">CSS cubic-bezier transitions</td>
                <td className="py-2 text-purple-300 font-semibold">Harmonic oscillator spring jiggle & squash</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-zinc-200">Ideal UI Context</td>
                <td className="py-2 text-zinc-300">Large full-screen background video blurs</td>
                <td className="py-2 text-amber-300 font-semibold">Floating control docks, badges, cards, buttons</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-400">
          <span>Move your mouse over each card to see the difference in lighting and refraction.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
}
