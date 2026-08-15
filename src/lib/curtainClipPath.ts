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
 */

const MAX_SLANT_FRAC = 0.9;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/**
 * Where the left/right ends of the bottom edge sit (0-100, % from the top)
 * for a wipe that runs `progress` 0→1, with `slantFrac` controlling which
 * side leads:
 *   0          → both ends rise together, a flat horizontal edge (this is
 *                what the thibaultguignand.com reference site actually
 *                does — see the clip-path polygon() keyframes pulled from
 *                its bundle).
 *   0 to 0.9   → the right end starts rising sooner and finishes sooner
 *                than the left, so the edge reads as a diagonal line
 *                sweeping up-and-to-the-left as it moves.
 *   -0.9 to 0  → mirrored: left end leads.
 * The magnitude is how much of the total span one side leads the other by
 * (as a fraction) — both ends always start at 100 and both always finish
 * at 0, so the wipe still fully clears either way; only the shape of the
 * edge while it's moving changes.
 */
function edgePoints(progress: number, slantFrac: number): { leftY: number; rightY: number } {
  const d = Math.min(MAX_SLANT_FRAC, Math.abs(slantFrac));
  const span = 1 - d || 1; // guard against divide-by-zero at the clamp ceiling

  let leftP: number;
  let rightP: number;
  if (slantFrac >= 0) {
    rightP = clamp01(progress / span);
    leftP = clamp01((progress - d) / span);
  } else {
    leftP = clamp01(progress / span);
    rightP = clamp01((progress - d) / span);
  }

  return { leftY: 100 * (1 - leftP), rightY: 100 * (1 - rightP) };
}

function toPolygon(leftY: number, rightY: number): string {
  return `polygon(0% 0%, 100% 0%, 100% ${rightY.toFixed(2)}%, 0% ${leftY.toFixed(2)}%)`;
}

/**
 * @param progress  0 (fully covering) to 1 (fully cleared).
 * @param slantFrac -0.9 to 0.9. 0 = flat edge, matching the reference site.
 */
export function buildCurtainClipPath(progress: number, slantFrac: number): string {
  const { leftY, rightY } = edgePoints(clamp01(progress), slantFrac);
  return toPolygon(leftY, rightY);
}

function stagedEdgePoints(
  progress: number,
  slantFrac: number,
  slantStart: number
): { leftY: number; rightY: number } {
  const p = clamp01(progress);
  const start = Math.min(0.95, Math.max(0, slantStart));

  if (p <= start) {
    const y = 100 * (1 - p);
    return { leftY: y, rightY: y };
  }

  // Y value at the exact moment the slant kicks in — the flat run and the
  // slanted run meet here, so there's no visible jump at the handoff.
  const yAtStart = 100 * (1 - start);
  const local = (p - start) / (1 - start || 1);
  const { leftY: leftLocal, rightY: rightLocal } = edgePoints(local, slantFrac);

  return {
    leftY: (leftLocal / 100) * yAtStart,
    rightY: (rightLocal / 100) * yAtStart,
  };
}

/**
 * Same wipe, but the edge stays perfectly flat for the first `slantStart`
 * fraction of the progress, then grows into the slant over the remaining
 * stretch — finishing fully cleared (both ends at 0%) exactly at
 * progress = 1 no matter what slantFrac is. This is the "keep it flat,
 * then have it slant once it gets to like 75%" version: most of the wipe
 * reads as a normal flat curtain, and the diagonal only appears as it's
 * finishing.
 *
 * @param progress   0 (fully covering) to 1 (fully cleared).
 * @param slantFrac  -0.9 to 0.9. 0 = stays flat the whole way (same as
 *                   buildCurtainClipPath with slantFrac 0).
 * @param slantStart 0-0.95. Fraction of progress the edge stays flat for
 *                   before the slant starts appearing. Defaults to 0.75.
 */
export function buildStagedCurtainClipPath(
  progress: number,
  slantFrac: number,
  slantStart: number = 0.75
): string {
  const { leftY, rightY } = stagedEdgePoints(progress, slantFrac, slantStart);
  return toPolygon(leftY, rightY);
}

export const CURTAIN_MAX_SLANT_FRAC = MAX_SLANT_FRAC;
