/**
 * Site motion style.
 *
 * "fed"     – Federico Pian–style motion: simplex-noise background (NoiseFieldBackground),
 *             blur-dissolve page exit and random-order masked character reveal.
 * "classic" – the previous NEAT shader gradient + curtain / blur-sweep transitions.
 *
 * Switch per browser with ?motion=classic or ?motion=fed (remembered in localStorage).
 * Change MOTION_DEFAULT to flip the site-wide default.
 */
export type MotionMode = "fed" | "classic";

export const MOTION_DEFAULT: MotionMode = "fed";

const KEY = "7h_motion_mode";

/** Fired by page transitions with { path } so the background can recolor early. */
export const FED_ROUTE_EVENT = "fed:route";

/** Recolor the noise background: detail { palette: [bg, color1, color2] } or { palette: null } to restore the route's. */
export const FED_PALETTE_EVENT = "fed:palette";

export function readMotionMode(): MotionMode {
  if (typeof window === "undefined") return MOTION_DEFAULT;
  try {
    const q = new URLSearchParams(window.location.search).get("motion");
    if (q === "fed" || q === "classic") {
      localStorage.setItem(KEY, q);
      return q;
    }
    const saved = localStorage.getItem(KEY);
    if (saved === "fed" || saved === "classic") return saved;
  } catch {}
  return MOTION_DEFAULT;
}

export function isFedMotion(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("fed-motion");
}
