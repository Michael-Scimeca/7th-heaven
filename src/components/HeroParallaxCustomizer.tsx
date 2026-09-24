"use client";

import { useSyncExternalStore } from "react";
import {
  PARALLAX_PRESETS,
  type HeroParallaxController,
} from "@/lib/useHeroParallax";

const emptySubscribe = () => () => {};

interface HeroParallaxCustomizerProps extends HeroParallaxController {
  /** Tailwind position classes — override when a page already has another
   * floating dev panel occupying the default spot. */
  positionClassName?: string;
}

/**
 * Floating dev/tester panel for tuning the shared hero parallax effect
 * (see src/lib/useHeroParallax.ts). Drop this into ANY hero that uses the
 * hook — it reads/writes the same localStorage-backed settings, so tuning
 * it here updates the default on every other hero on the site too.
 *
 * Gated behind the same `7h_tint_tester` flag used by the existing video
 * tint customizer, so it stays invisible to regular visitors.
 */
export default function HeroParallaxCustomizer({
  pxRange,
  pxScrub,
  pxForeground,
  updatePxRange,
  updatePxScrub,
  updatePxForeground,
  isPxUiOpen,
  setIsPxUiOpen,
  pxCopied,
  copyPxSettings,
  positionClassName = "top-[104px] right-6 md:right-8",
}: HeroParallaxCustomizerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted || localStorage.getItem("7h_tint_tester") !== "true")
    return null;

  return (
    <div
      className={`absolute ${positionClassName} z-40 flex flex-col items-end`}
    >
      {!isPxUiOpen ? (
        <button
          aria-label="Open Parallax Customizer"
          onClick={() => setIsPxUiOpen(true)}
          className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-2xl hover:bg-black/85 active:scale-95"
          title="Open Parallax Customizer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:text-[var(--color-accent)]"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </button>
      ) : (
        <div className="flex w-[280px] animate-[scaleIn_0.2s_ease-out] flex-col gap-4 border border-white/10 bg-black/75 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-rockstar)] text-[var(--color-accent)] text-[var(--font-size-2xs)]">
                Parallax Tester
              </span>
              <span className="text-white/40">
                Applies to every hero site-wide
              </span>
            </div>
            <button
              aria-label="Close Parallax Customizer"
              onClick={() => setIsPxUiOpen(false)}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <span className="/45 block">Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {PARALLAX_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  aria-label={`Apply ${preset.name} preset`}
                  onClick={() => updatePxRange(preset.range)}
                  className={`cursor-pointer rounded border px-2 py-1 ${pxRange === preset.range ? "border-[var(--color-border-purple)] bg-[var(--color-purple-primary)] text-[var(--color-text-main)] shadow-[0_0_8px_var(--color-purple-glow)]" : "border-white/10 bg-[#00000029] hover:border-white/10 hover:bg-white/10"}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Depth (range) Slider */}
          <div className="space-y-1.5">
            <div className="/45 r flex justify-between">
              <span>Depth</span>
              <span className="text-[var(--color-accent)]">±{pxRange}%</span>
            </div>
            <input
              aria-label="Parallax depth"
              type="range"
              min="0"
              max="30"
              step="1"
              value={pxRange}
              onChange={(e) => updatePxRange(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-500"
            />
          </div>

          {/* Scrub (smoothing) Slider */}
          <div className="space-y-1.5">
            <div className="/45 r flex justify-between">
              <span>Smoothing</span>
              <span className="text-[var(--color-accent)]">
                {pxScrub.toFixed(1)}s
              </span>
            </div>
            <input
              aria-label="Parallax smoothing"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pxScrub}
              onChange={(e) => updatePxScrub(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-500"
            />
          </div>

          {/* Foreground Counter-Drift Toggle */}
          <button
            aria-label="Toggle foreground counter-drift"
            onClick={() => updatePxForeground(!pxForeground)}
            className={`flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 ${pxForeground ? "border-[var(--color-border-purple)] bg-[var(--color-purple-primary)]/20" : "border-white/10 bg-[#00000029] hover:bg-white/10"}`}
          >
            <span className="r">Foreground Counter-Drift</span>
            <span
              className={`relative h-4 w-8 rounded-lg ${pxForeground ? "bg-[var(--color-accent)]" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-lg bg-white ${pxForeground ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </span>
          </button>

          {/* Active Values HUD */}
          <div className="space-y-0.5 rounded-lg border border-white/10 bg-white/[0.02] p-2 text-white/40">
            <div>
              Depth: <span>±{pxRange}%</span>
            </div>
            <div>
              Smoothing: <span>{pxScrub.toFixed(1)}s</span>
            </div>
            <div>
              Foreground drift: <span>{pxForeground ? "on" : "off"}</span>
            </div>
          </div>

          {/* Copy Settings Button */}
          <button
            aria-label="Copy parallax settings"
            onClick={copyPxSettings}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 py-2 text-[var(--font-size-2xs)] shadow-[0_4px_12px_rgba(147,51,234,0.2)] hover:from-amber-600 hover:to-orange-700 active:scale-97"
          >
            {pxCopied ? (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[scaleIn_0.15s_ease-out]"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Settings
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
