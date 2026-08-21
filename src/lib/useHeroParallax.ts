import { useEffect, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Shared hero parallax engine.
 *
 * This is the single source of truth for the "background drifts slower than
 * the page, foreground counter-drifts for depth" effect used on hero
 * sections across the site (home page video hero, /media featured hero,
 * and any future hero). Every usage reads/writes the SAME localStorage keys
 * below, so tuning it via the Parallax Customizer panel on ANY page updates
 * the defaults everywhere else too — there's no per-page copy to keep in
 * sync.
 *
 * Usage:
 *   const mediaRef = useRef<HTMLVideoElement>(null);
 *   const foregroundRef = useRef<HTMLDivElement>(null);
 *   const parallax = useHeroParallax({
 *     mediaRef,
 *     foregroundRef,
 *     triggerSelector: "#hero",
 *     enabled: isDesktop,
 *   });
 *   // ...render <video ref={mediaRef} className="... scale-[1.3]" />
 *   // (a static fallback scale matching parallaxScaleFor(PARALLAX_DEFAULT_RANGE)
 *   // ≈ 1.3 — GSAP takes over within a frame or two of mount and owns the
 *   // transform from then on. Match the DEFAULT range here, not the max
 *   // preset: most visitors never touch the customizer, so this is what
 *   // they'll actually see pre-hydration. Don't bind the className to a
 *   // *computed* scale value either — that fights GSAP for control of the
 *   // same inline `transform` on every render. A tester who previously
 *   // dialed in a bigger range may see one brief pop on their own machine
 *   // right after hydration; that's an acceptable trade for not showing
 *   // every regular visitor a mismatched zoom.)
 *   // ...render <div ref={foregroundRef}>...</div>
 *   // ...render <HeroParallaxCustomizer {...parallax} />
 */

export const PARALLAX_PRESETS = [
  { name: "Subtle", range: 6 },
  { name: "Medium", range: 14 },
  { name: "Dramatic", range: 22 },
  { name: "Extreme", range: 30 },
] as const;

// Shared storage keys — deliberately the same across every hero using this
// hook so a change made in one place (any page's customizer panel) is
// reflected everywhere else the next time that page loads.
const LS_RANGE = "7h_hero_parallax_range";
const LS_SCRUB = "7h_hero_parallax_scrub";
const LS_FG = "7h_hero_parallax_fg";

export const PARALLAX_DEFAULT_RANGE = 14;
export const PARALLAX_DEFAULT_SCRUB = 0.6;
export const PARALLAX_DEFAULT_FOREGROUND = true;

/** Video/image scale that leaves enough headroom for a given drift range. */
export function parallaxScaleFor(range: number): number {
  return 1 + (range / 50) * 1.05;
}

interface UseHeroParallaxOptions {
  /** Background media element (video or image) that drifts as the page scrolls. */
  mediaRef: RefObject<HTMLElement | null>;
  /** Optional foreground element that counter-drifts at half the range for extra depth. */
  foregroundRef?: RefObject<HTMLElement | null>;
  /** CSS selector for the ScrollTrigger trigger (usually the hero section's id). */
  triggerSelector: string;
  /**
   * Set false to fully skip (mobile, video-is-playing, etc). Default true.
   *
   * IMPORTANT: the animation effect only re-runs when one of this hook's
   * dependencies changes (enabled, triggerSelector, pxRange, pxScrub,
   * pxForeground, remountKey) — it does NOT poll `mediaRef.current`. If your
   * hero's background/foreground renders conditionally behind async data
   * (e.g. `{data && <Image ref={mediaRef} />}` after a fetch resolves),
   * `enabled` must itself flip from false to true in that same render, or
   * the effect fires once too early against a still-null ref and never gets
   * another chance to bind. Fold the readiness check into `enabled` itself,
   * e.g. `enabled: !isPlaying && Boolean(data)` — don't rely on `!isPlaying`
   * alone if `data` can still be loading.
   */
  enabled?: boolean;
  /**
   * Extra value to force the animation to rebind to a fresh DOM node — pass
   * something like `videoSrc` when the media element remounts (e.g. via a
   * changing `key`) without `enabled` itself changing.
   */
  remountKey?: string | number;
}

export function useHeroParallax({
  mediaRef,
  foregroundRef,
  triggerSelector,
  enabled = true,
  remountKey,
}: UseHeroParallaxOptions) {
  // Seeded from localStorage via a lazy initializer rather than an effect —
  // every page using this hook reads from the same three keys, so this is
  // the "change it in one place" part. A lazy initializer (vs. loading in a
  // useEffect and calling setState) means the very first client render
  // already reflects a previously-tuned value: no default-then-flash-to-
  // saved-value pop, and it sidesteps this repo's react-hooks/set-state-in-
  // effect lint rule. Guarded for SSR, where `window`/`localStorage` don't
  // exist and the initializer just falls back to the shared defaults.
  const [pxRange, setPxRangeState] = useState(() => {
    if (typeof window === "undefined") return PARALLAX_DEFAULT_RANGE;
    const saved = localStorage.getItem(LS_RANGE);
    return saved ? parseFloat(saved) : PARALLAX_DEFAULT_RANGE;
  });
  const [pxScrub, setPxScrubState] = useState(() => {
    if (typeof window === "undefined") return PARALLAX_DEFAULT_SCRUB;
    const saved = localStorage.getItem(LS_SCRUB);
    return saved ? parseFloat(saved) : PARALLAX_DEFAULT_SCRUB;
  });
  const [pxForeground, setPxForegroundState] = useState(() => {
    if (typeof window === "undefined") return PARALLAX_DEFAULT_FOREGROUND;
    const saved = localStorage.getItem(LS_FG);
    return saved ? saved === "true" : PARALLAX_DEFAULT_FOREGROUND;
  });
  const [isPxUiOpen, setIsPxUiOpen] = useState(false);
  const [pxCopied, setPxCopied] = useState(false);

  const updatePxRange = (r: number) => {
    setPxRangeState(r);
    localStorage.setItem(LS_RANGE, r.toString());
  };
  const updatePxScrub = (s: number) => {
    setPxScrubState(s);
    localStorage.setItem(LS_SCRUB, s.toString());
  };
  const updatePxForeground = (on: boolean) => {
    setPxForegroundState(on);
    localStorage.setItem(LS_FG, on.toString());
  };

  const copyPxSettings = () => {
    const snippet = `// Hero parallax settings (shared across every page)\nrange: ${pxRange},\nscrub: ${pxScrub},\nforegroundCounterParallax: ${pxForeground},`;
    navigator.clipboard.writeText(snippet);
    setPxCopied(true);
  };

  useEffect(() => {
    if (!pxCopied) return;
    const t = setTimeout(() => setPxCopied(false), 2000);
    return () => clearTimeout(t);
  }, [pxCopied]);

  // ── Drive the actual GSAP ScrollTrigger animation ─────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const media = mediaRef.current;
    if (!media) return;

    gsap.registerPlugin(ScrollTrigger);

    // Extra space needed on each side of the media, as a fraction of its own
    // height, is pxRange/100 (the max translate distance). A small buffer
    // (1.05x) keeps the scaled edge from ever peeking into view.
    const scale = parallaxScaleFor(pxRange);
    const halfRange = pxRange / 2;

    const ctx = gsap.context(() => {
      // GSAP writes a single inline `transform`, which would otherwise
      // clobber any Tailwind scale class (inline style always wins over the
      // stylesheet rule). Keeping scale in both tween ends means GSAP owns
      // the whole transform and the zoom never drops.
      gsap.fromTo(
        media,
        { yPercent: -pxRange, scale },
        {
          yPercent: pxRange,
          scale,
          ease: "none",
          scrollTrigger: {
            trigger: triggerSelector,
            start: "top top",
            end: "bottom top",
            scrub: pxScrub,
          },
        }
      );

      // Foreground counter-drift: moves the opposite direction at half the
      // amplitude, so the layer visually separates from the background
      // instead of scrolling in lockstep with it.
      if (pxForeground && foregroundRef?.current) {
        gsap.fromTo(
          foregroundRef.current,
          { yPercent: halfRange },
          {
            yPercent: -halfRange,
            ease: "none",
            scrollTrigger: {
              trigger: triggerSelector,
              start: "top top",
              end: "bottom top",
              scrub: pxScrub,
            },
          }
        );
      }

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, triggerSelector, pxRange, pxScrub, pxForeground, remountKey]);

  return {
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
  };
}

export type HeroParallaxController = ReturnType<typeof useHeroParallax>;
