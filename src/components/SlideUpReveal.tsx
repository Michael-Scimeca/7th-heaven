"use client";

/**
 * SlideUpReveal
 * ─────────────────────────────────────────────────────────────────────────
 * Recreates the line/char "slide up" text reveal seen on sites like
 * thibaultguignand.com: GSAP SplitText's `mask` option wraps each split
 * unit (line / word / char) in its own `overflow:hidden` box, the unit is
 * pushed below the box with `yPercent: 100+`, then tweened back to
 * `yPercent: 0` with a punchy ease — so the text looks like it slides up
 * from behind a mask rather than fading in.
 *
 * The reference site also gives each unit a small `skewY` on the way in
 * (e.g. 6-8deg) that eases back to 0 in lockstep with the position tween.
 * Because the ease is front-loaded (power4.out), most of the vertical
 * travel resolves fast but a visible sliver of skew lingers into the
 * early/mid part of the motion — that's the little "tilt" you see as the
 * line is still ~20% short of its final position. Pass `skew` to enable it.
 *
 * Usage:
 *   <SlideUpReveal as="h1" mask="lines" className="text-6xl font-black">
 *     Slide up on scroll
 *   </SlideUpReveal>
 */

import {
  CSSProperties,
  ElementType,
  ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export interface SlideUpRevealProps {
  /** HTML tag to render the text in. Defaults to "div". */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: string;
  /**
   * What SplitText should split on. Defaults to whatever `mask` is set to,
   * since SplitText only populates `instance.chars`/`instance.words` for
   * levels you actually ask it to split — if `mask="chars"` but `type`
   * stays at its old default of "lines", `instance.chars` comes back empty
   * and the reveal silently animates nothing. Only override this if you
   * need a level split (e.g. measuring words) that differs from the level
   * you're masking.
   */
  type?: "lines" | "words" | "chars" | "words, chars" | "lines, words, chars";
  /** Which split unit gets the overflow-hidden mask + the slide motion. */
  mask?: "lines" | "words" | "chars";
  /** Seconds to wait before the reveal starts (e.g. to sequence after another element). */
  delay?: number;
  /** Seconds between each unit's start time. */
  stagger?: number;
  duration?: number;
  ease?: string;
  /**
   * Degrees of skewY applied at the start of the reveal (eased back to 0
   * alongside the yPercent slide). 0 disables it. Try 6-10 for a subtle
   * tilt, matching the reference site's headline reveal.
   */
  skew?: number;
  /** Bump this number to replay the animation (handy for demos). */
  replayKey?: number;
  /** Called once the reveal timeline finishes. */
  onComplete?: () => void;
}

export default function SlideUpReveal({
  as = "div",
  className,
  style,
  children,
  type,
  mask = "lines",
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  ease = "power4.out",
  skew = 0,
  replayKey = 0,
  onComplete,
}: SlideUpRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // If the caller didn't override `type`, split at the same level we're
  // masking so `instance[mask]` is guaranteed to be populated.
  const effectiveType = type ?? mask;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let split: SplitText | null = null;
    let cancelled = false;

    const ctx = gsap.context(() => {
      const run = () => {
        if (cancelled || !el) return;

        split = SplitText.create(el, {
          type: effectiveType,
          mask,
          autoSplit: true,
          onSplit(instance) {
            const targets =
              mask === "chars"
                ? instance.chars
                : mask === "words"
                ? instance.words
                : instance.lines;

            gsap.set(targets, {
              yPercent: 110,
              skewY: skew || 0,
              transformOrigin: "left top",
            });
            return gsap.to(targets, {
              yPercent: 0,
              skewY: 0,
              duration,
              ease,
              stagger,
              delay,
              onComplete,
            });
          },
        });
      };

      // Wait for web fonts so line/word wraps (and therefore the mask
      // boxes) are measured against final metrics, not a fallback font.
      if (typeof document !== "undefined" && "fonts" in document) {
        document.fonts.ready.then(run);
      } else {
        run();
      }
    }, el);

    return () => {
      cancelled = true;
      ctx.revert();
      split?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, replayKey, effectiveType, mask, delay, stagger, duration, ease, skew]);

  const Tag = as as ElementType;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className ?? undefined} style={style ?? undefined}>
      {children as ReactNode}
    </Tag>
  );
}
