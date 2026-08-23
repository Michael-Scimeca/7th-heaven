"use client";

import { useSyncExternalStore } from "react";
import { PARALLAX_PRESETS, type HeroParallaxController } from "@/lib/useHeroParallax";

const emptySubscribe = () => () => { };

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
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted || localStorage.getItem("7h_tint_tester") !== "true") return null;

  return (
    <div className={`absolute ${positionClassName} z-40 flex flex-col items-end`}>
      {/* Self-contained so this panel works on any page, even ones that don't
       * already define this keyframe (HeroVideoPlayer defines its own copy
       * too — harmless to have both, the browser just dedupes identical rules). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `,
        }}
      />
      {!isPxUiOpen ? (
        <button
          aria-label="Open Parallax Customizer"
          onClick={() => setIsPxUiOpen(true)}
          className="w-10 h-10 rounded-full bg-black/60  backdrop-blur-[45px] border border-white/15 flex items-center justify-center cursor-pointer hover:bg-black/85 hover:scale-105 active:scale-95 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)] group"
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
            className="text-white/80 group-hover:text-[var(--color-accent)] transition-colors duration-300"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </button>
      ) : (
        <div className="w-[280px] bg-black/75 backdrop-blur-xl border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 select-none animate-[scaleIn_0.2s_ease-out] text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-rockstar)] text-[var(--font-size-2xs)] font-black uppercase tracking-wider text-[var(--color-accent)]">
                Parallax Tester
              </span>
              <span className="text-[var(--font-size-4xs)] text-white/40 uppercase font-semibold">
                Applies to every hero site-wide
              </span>
            </div>
            <button
              aria-label="Close Parallax Customizer"
              onClick={() => setIsPxUiOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <span className="text-[var(--font-size-3xs)] font-extrabold text-white/45 uppercase tracking-wider block">Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {PARALLAX_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  aria-label={`Apply ${preset.name} preset`}
                  onClick={() => updatePxRange(preset.range)}
                  className={`px-2 py-1 text-[var(--font-size-4xs)] font-black uppercase rounded border transition-colors cursor-pointer ${pxRange === preset.range
                    ? "bg-[var(--color-purple-primary)] border-[var(--color-border-purple)] text-[var(--color-text-main)] shadow-[0_0_8px_var(--color-purple-glow)]"
                    : "bg-[#e1e6ff29]   border-white/5  text-white  hover:bg-white/10 hover:border-white/10"
                    }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Depth (range) Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[var(--font-size-3xs)] font-extrabold text-white/45 uppercase tracking-wider">
              <span>Depth</span>
              <span className="text-[var(--color-accent)] font-mono font-black">±{pxRange}%</span>
            </div>
            <input
              aria-label="Parallax depth"
              type="range"
              min="0"
              max="30"
              step="1"
              value={pxRange}
              onChange={(e) => updatePxRange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Scrub (smoothing) Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[var(--font-size-3xs)] font-extrabold text-white/45 uppercase tracking-wider">
              <span>Smoothing</span>
              <span className="text-[var(--color-accent)] font-mono font-black">{pxScrub.toFixed(1)}s</span>
            </div>
            <input
              aria-label="Parallax smoothing"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pxScrub}
              onChange={(e) => updatePxScrub(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Foreground Counter-Drift Toggle */}
          <button
            aria-label="Toggle foreground counter-drift"
            onClick={() => updatePxForeground(!pxForeground)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded border transition-colors cursor-pointer ${pxForeground
              ? "bg-[var(--color-purple-primary)]/20 border-[var(--color-border-purple)] text-white"
              : "bg-[#e1e6ff29]   border-white/5  text-white  hover:bg-white/10"
              }`}
          >
            <span className="text-[var(--font-size-3xs)] font-extrabold uppercase tracking-wider">Foreground Counter-Drift</span>
            <span className={`w-8 h-4 rounded-full relative transition-colors ${pxForeground ? "bg-[var(--color-accent)]" : "bg-white/20"}`}>
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pxForeground ? "translate-x-4" : "translate-x-0.5"
                  }`}
              />
            </span>
          </button>

          {/* Active Values HUD */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-[var(--font-size-4xs)] font-mono text-white/40 space-y-0.5">
            <div>
              Depth: <span className="text-white font-bold">±{pxRange}%</span>
            </div>
            <div>
              Smoothing: <span className="text-white font-bold">{pxScrub.toFixed(1)}s</span>
            </div>
            <div>
              Foreground drift: <span className="text-white font-bold">{pxForeground ? "on" : "off"}</span>
            </div>
          </div>

          {/* Copy Settings Button */}
          <button
            aria-label="Copy parallax settings"
            onClick={copyPxSettings}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black text-[var(--font-size-2xs)] uppercase tracking-widest transition-colors shadow-[0_4px_12px_rgba(147,51,234,0.2)] active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {pxCopied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-[scaleIn_0.15s_ease-out]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
