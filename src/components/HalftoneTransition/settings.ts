/** Tunable values for the halftone transition. Defaults are the Buttermax values. */
export type HalftoneEase = "inOutCubic" | "inOutQuart" | "inOutSine" | "outCubic" | "linear";
/** How the new page settles into place: match the main curve, glide in, or spring in with overshoot. */
export type HalftoneArrival = "match" | "glide" | "spring";

export type HalftoneSettings = {
  duration: number; // seconds
  ease: HalftoneEase;
  dotsAcross: number; // dots across the screen (portrait screens use about a third of this)
  dotBlur: number; // softness of each dot; higher = more liquid merging
  spread: number; // how fast the circle grows out of the click point
  anchorPull: number; // 0 = zoom around the click, 1 = zoom around the centre
  oldZoom: number; // extra zoom on the old page
  oldTurn: number; // old page rotation (radians, scaled by how far right you clicked)
  rgb: number; // red/blue split on the old page
  crt: number; // CRT bulge amount
  newScale: number; // new page starting scale
  newTurn: number; // new page starting rotation (radians, scaled by click x)
  arrival: HalftoneArrival; // curve for the new page's scale/rotation/rise
  overshoot: number; // spring arrival: how far it overshoots before settling
  newRise: number; // new page starts this far below (fraction of screen) and floats up
  newBlur: number; // new page starts blurred by this much and sharpens
  newSplit: number; // new page starts with this red/blue split and settles clean
  rimWidth: number; // rainbow rim width (0 = off)
  rimEnd: number; // progress where the rim has faded out
};

export const HALFTONE_DEFAULTS: HalftoneSettings = {
  duration: 2.6,
  ease: "inOutCubic",
  dotsAcross: 23,
  dotBlur: 0.55,
  spread: 15,
  anchorPull: 0.2,
  oldZoom: 1.2,
  oldTurn: 0.3,
  rgb: 0.01,
  crt: 0.1,
  newScale: 0.6,
  newTurn: 0.3,
  arrival: "match",
  overshoot: 0.12,
  newRise: 0,
  newBlur: 0,
  newSplit: 0,
  rimWidth: 0.15,
  rimEnd: 0.52,
};

/** 20 ready-made looks. Each one is the Buttermax defaults with a few values changed. */
export const HALFTONE_PRESETS: { name: string; note: string; group?: string; values: Partial<HalftoneSettings> }[] = [
  { name: "Buttermax", note: "The original", values: {} },
  { name: "Chunky pop", note: "Few huge dots", values: { dotsAcross: 6, dotBlur: 0.5, spread: 14, rimWidth: 0.2 } },
  { name: "Big bubbles", note: "Large soft blobs", values: { dotsAcross: 9, dotBlur: 0.85, spread: 12 } },
  { name: "Fine grain", note: "Tiny dense dots", values: { dotsAcross: 50, dotBlur: 0.35, spread: 18 } },
  { name: "Liquid melt", note: "Dots pour together", values: { dotsAcross: 16, dotBlur: 1.1 } },
  { name: "Crisp halftone", note: "Hard-edged print dots", values: { dotsAcross: 30, dotBlur: 0.15, rimWidth: 0.05 } },
  { name: "No rainbow", note: "Plain edges", values: { rimWidth: 0 } },
  { name: "Fat rainbow", note: "Thick colour rims that linger", values: { rimWidth: 0.35, rimEnd: 0.85 } },
  { name: "Gentle drift", note: "Slow and subtle", values: { duration: 3.4, ease: "inOutSine", oldZoom: 0.5, oldTurn: 0.1, newScale: 0.85, newTurn: 0.1, rgb: 0.004 } },
  { name: "Snap", note: "Quicker, punchier", values: { duration: 1.5, ease: "inOutQuart" } },
  { name: "Lightning", note: "Under a second", values: { duration: 0.9, ease: "outCubic", spread: 25 } },
  { name: "Deep zoom", note: "Big camera push", values: { oldZoom: 2.6, newScale: 0.35 } },
  { name: "Dots only", note: "No zoom or rotation", values: { oldZoom: 0, oldTurn: 0, newScale: 1, newTurn: 0, crt: 0, rgb: 0 } },
  { name: "Spin out", note: "Heavy rotation", values: { oldTurn: 0.9, newTurn: 0.9 } },
  { name: "Glitch", note: "Strong colour split", values: { rgb: 0.04, crt: 0.25 } },
  { name: "Retro CRT", note: "Bulging old-TV screen", values: { crt: 0.35, rgb: 0.02, dotsAcross: 20 } },
  { name: "Centre burst", note: "Always zooms from the middle", values: { anchorPull: 1, spread: 10 } },
  { name: "Slow bloom", note: "Dots creep out", values: { spread: 5, duration: 3.5 } },
  { name: "Clean", note: "Minimal, no rims", values: { newScale: 0.92, newTurn: 0, oldZoom: 0.3, oldTurn: 0, rgb: 0, crt: 0, rimWidth: 0 } },
  { name: "Concert strobe", note: "Bright rims, quick", values: { dotsAcross: 14, rimWidth: 0.3, rimEnd: 0.9, duration: 1.8, rgb: 0.02 } },

  // Variations on "Retro CRT" (crt 0.35, rgb 0.02, 20 dots)
  { group: "Retro CRT", name: "CRT warm-up", note: "Slow, like an old set coming on", values: { crt: 0.4, rgb: 0.015, dotsAcross: 20, duration: 3.2, ease: "inOutSine", spread: 8 } },
  { group: "Retro CRT", name: "CRT snap", note: "Quick channel flick", values: { crt: 0.35, rgb: 0.025, dotsAcross: 20, duration: 1.4, ease: "inOutQuart" } },
  { group: "Retro CRT", name: "CRT phosphor", note: "Fine glowing dots", values: { crt: 0.3, rgb: 0.02, dotsAcross: 44, dotBlur: 0.3 } },
  { group: "Retro CRT", name: "CRT fat pixels", note: "Chunky, crisp dots", values: { crt: 0.35, rgb: 0.02, dotsAcross: 10, dotBlur: 0.25 } },
  { group: "Retro CRT", name: "CRT max bulge", note: "Fishbowl screen", values: { crt: 0.55, rgb: 0.03, dotsAcross: 20, oldZoom: 1.6 } },
  { group: "Retro CRT", name: "CRT VHS", note: "Heavy colour bleed, slight wobble", values: { crt: 0.3, rgb: 0.045, dotsAcross: 20, rimWidth: 0.08, oldTurn: 0.15, newTurn: 0.15 } },
  { group: "Retro CRT", name: "CRT power-off", note: "Collapses into the centre", values: { crt: 0.45, rgb: 0.02, dotsAcross: 20, anchorPull: 1, oldZoom: 2.8, newScale: 0.3, spread: 8 } },
  { group: "Retro CRT", name: "CRT clean", note: "Bulge only, no split or rims", values: { crt: 0.35, rgb: 0, dotsAcross: 20, rimWidth: 0 } },
  { group: "Retro CRT", name: "CRT rainbow", note: "Bulge with thick rims", values: { crt: 0.35, rgb: 0.02, dotsAcross: 20, rimWidth: 0.32, rimEnd: 0.85 } },
  { group: "Retro CRT", name: "CRT melt", note: "Bulge with liquid dots", values: { crt: 0.35, rgb: 0.02, dotsAcross: 16, dotBlur: 1.0 } },
  { group: "Retro CRT", name: "CRT arcade", note: "Punchy, hard dots, bright rims", values: { crt: 0.3, rgb: 0.03, dotsAcross: 14, dotBlur: 0.2, duration: 1.8, rimWidth: 0.25 } },
  { group: "Retro CRT", name: "CRT slow-mo", note: "Same look at half speed", values: { crt: 0.35, rgb: 0.02, dotsAcross: 20, duration: 4.5, ease: "inOutSine" } },

  // Better arrivals: how the new page lands
  { group: "Arrival", name: "Glide in", note: "New page lands softly", values: { arrival: "glide" } },
  { group: "Arrival", name: "Spring in", note: "Small overshoot, then settles", values: { arrival: "spring", overshoot: 0.12 } },
  { group: "Arrival", name: "Rise & focus", note: "Floats up out of a blur", values: { arrival: "glide", newRise: 0.12, newBlur: 0.012, newScale: 0.8, newTurn: 0.15 } },
  { group: "Arrival", name: "Lens settle", note: "Sharpens and loses its colour fringe", values: { arrival: "glide", newBlur: 0.016, newSplit: 0.025 } },
  { group: "Arrival", name: "Bounce", note: "Springy, playful", values: { arrival: "spring", overshoot: 0.25, newScale: 0.5, newRise: 0.08 } },
  { group: "Arrival", name: "CRT glide-in", note: "Retro CRT out, soft landing in", values: { crt: 0.35, rgb: 0.02, dotsAcross: 20, arrival: "glide", newRise: 0.06, newSplit: 0.02 } },
  { group: "Arrival", name: "CRT spring-in", note: "Retro CRT with a springy landing", values: { crt: 0.35, rgb: 0.02, dotsAcross: 20, arrival: "spring", overshoot: 0.15, newBlur: 0.008 } },
  { group: "Arrival", name: "Upright", note: "No tilt in, straight rise", values: { arrival: "glide", newTurn: 0, newScale: 0.9, newRise: 0.15 } },
];

export function presetSettings(i: number): HalftoneSettings {
  return { ...HALFTONE_DEFAULTS, ...HALFTONE_PRESETS[i]?.values };
}

/** Index of the preset that matches `s` exactly, or -1 for custom. */
export function matchPreset(s: HalftoneSettings): number {
  return HALFTONE_PRESETS.findIndex((_, i) => {
    const p = presetSettings(i);
    return (Object.keys(p) as (keyof HalftoneSettings)[]).every((k) => p[k] === s[k]);
  });
}

export const HALFTONE_EASES: Record<HalftoneEase, { label: string; fn: (t: number) => number }> = {
  inOutCubic: { label: "Ease in-out cubic (Buttermax)", fn: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
  inOutQuart: { label: "Ease in-out quart (snappier)", fn: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2) },
  inOutSine: { label: "Ease in-out sine (gentler)", fn: (t) => -(Math.cos(Math.PI * t) - 1) / 2 },
  outCubic: { label: "Ease out cubic (fast start)", fn: (t) => 1 - Math.pow(1 - t, 3) },
  linear: { label: "Linear", fn: (t) => t },
};

export const SETTINGS_KEY = "7h_halftone_settings";

export function loadSettings(): HalftoneSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return HALFTONE_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<HalftoneSettings>;
    const out = { ...HALFTONE_DEFAULTS };
    for (const k of Object.keys(HALFTONE_DEFAULTS) as (keyof HalftoneSettings)[]) {
      const v = parsed[k];
      if (k === "ease") {
        if (typeof v === "string" && v in HALFTONE_EASES) out.ease = v as HalftoneEase;
      } else if (k === "arrival") {
        if (v === "match" || v === "glide" || v === "spring") out.arrival = v;
      } else if (typeof v === "number" && Number.isFinite(v)) {
        (out[k] as number) = v;
      }
    }
    return out;
  } catch {
    return HALFTONE_DEFAULTS;
  }
}

export function saveSettings(s: HalftoneSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}
