/**
 * Shared clip-path math for the page-transition curtain.
 *
 * Used by both the tuning sandbox (src/app/pagetransition/page.tsx) and the
 * real, route-driven curtain (src/components/PageTransition.tsx) so a value
 * dialed in on the sandbox behaves identically on the live transition.
 *
 * The curtain covers the screen with a quadrilateral: top edge pinned flat
 * at the top of the viewport, bottom edge defined by two independent
 * points (bottom-left, bottom-right). Wiping away = the bottom edge rises
 * from y=100% (fully covering) to y=0% (fully cleared).
 *
 * `slantFrac` controls whether the left or right point leads:
 *   0            → both points rise together, a flat horizontal edge
 *                  (this is what the thibaultguignand.com reference site
 *                  actually does — see the clip-path polygon() keyframes
 *                  pulled from its bundle).
 *   0 to ~0.9    → the right point starts rising sooner and finishes
 *                  sooner than the left, so the edge reads as a diagonal
 *                  line sweeping up-and-to-the-left as it moves.
 *   -0.9 to 0    → mirrored: left point leads, edge sweeps up-and-to-the-
 *                  right.
 * The magnitude is how much of the total wipe duration one side leads the
 * other by (as a fraction) — both points always start at 100% and both
 * always finish at 0%, so the wipe still fully clears the curtain either
 * way; only the shape of the edge while it's moving changes.
 */

const MAX_SLANT_FRAC = 0.9;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/**
 * @param progress  0 (fully covering) to 1 (fully cleared).
 * @param slantFrac -0.9 to 0.9. 0 = flat edge, matching the reference site.
 */
export function buildCurtainClipPath(progress: number, slantFrac: number): string {
  const d = Math.min(MAX_SLANT_FRAC, Math.abs(slantFrac));
  const span = 1 - d || 1; // guard against divide-by-zero at the clamp ceiling

  let leftP: number;
  let rightP: number;
  if (slantFrac >= 0) {
    // Right point leads — clears first.
    rightP = clamp01(progress / span);
    leftP = clamp01((progress - d) / span);
  } else {
    // Left point leads — clears first.
    leftP = clamp01(progress / span);
    rightP = clamp01((progress - d) / span);
  }

  const leftY = 100 * (1 - leftP);
  const rightY = 100 * (1 - rightP);

  return `polygon(0% 0%, 100% 0%, 100% ${rightY.toFixed(2)}%, 0% ${leftY.toFixed(2)}%)`;
}

export const CURTAIN_MAX_SLANT_FRAC = MAX_SLANT_FRAC;
