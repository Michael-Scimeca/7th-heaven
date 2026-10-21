/** How the vault enters and leaves. `t` runs 0 (gone) → 1 (fully shown). */
export type FastTransitionName =
  | "snappy"
  | "hyperdrive"
  | "slingshot"
  | "vortex"
  | "riser"
  | "deck"
  | "drop"
  | "scatterFast"
  | "magnetic"
  | "dolly"
  | "accordion"
  | "flyby"
  | "rush"
  | "horizon"
  | "pop"
  | "spiral"
  | "flash"
  | "pendulum"
  | "laser"
  | "quantum";

export type TransitionName = FastTransitionName | "scatter" | "sweep" | "rise" | "zoom" | "fade";

export type DiscTransform = {
  /** multiplies the horizontal/vertical gap between discs */
  spread: number;
  /** added to z (negative pushes away from camera) */
  z: number;
  /** multiplies disc scale */
  scale: number;
  /** extra spin, rad/sec */
  spin: number;
  /** added to y */
  y: number;
};

export type Transition = {
  label: string;
  name: TransitionName;
  badge: string;
  inMs: number;
  outMs: number;
  /** easing applied to raw progress before `at` */
  ease?: (t: number) => number;
  at: (t: number) => DiscTransform;
};

// High-performance easing curves tailored for fast, snappy 300ms-480ms entrances
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const outQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const outQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const outExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const outBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const inOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

const base: DiscTransform = { spread: 1, z: 0, scale: 1, spin: 0, y: 0 };

export const TRANSITIONS: Record<TransitionName, Transition> = {
  // ── 20 DISTINCT HIGH-SPEED WAYS TO TRANSITION IN ──
  snappy: {
    name: "snappy",
    label: "1. Snap Velocity — tight spread, instant lock-in",
    badge: "Fastest",
    inMs: 380,
    outMs: 280,
    ease: outExpo,
    at: (t) => ({ ...base, spread: 0.6 + 0.4 * t, z: -(1 - t) * 6, scale: 0.8 + 0.2 * t, spin: (1 - t) * 3 }),
  },
  hyperdrive: {
    name: "hyperdrive",
    label: "2. Hyperdrive Warp — streaks in from deep space",
    badge: "Warp",
    inMs: 400,
    outMs: 300,
    ease: outExpo,
    at: (t) => ({ ...base, z: -(1 - t) * 16, spread: 0.2 + 0.8 * t, scale: 0.5 + 0.5 * t, spin: (1 - t) * 12 }),
  },
  slingshot: {
    name: "slingshot",
    label: "3. Sonic Slingshot — punchy elastic spring overshoot",
    badge: "Elastic",
    inMs: 420,
    outMs: 320,
    ease: outBack,
    at: (t) => ({ ...base, spread: 0.7 + 0.3 * t, z: -(1 - t) * 8, scale: 0.75 + 0.25 * t, spin: (1 - t) * 6 }),
  },
  vortex: {
    name: "vortex",
    label: "4. Vortex Helix — 720° spin settling rapidly",
    badge: "Spiral",
    inMs: 440,
    outMs: 320,
    ease: outCubic,
    at: (t) => ({ ...base, spin: (1 - t) * 16, spread: 0.4 + 0.6 * t, z: -(1 - t) * 7, scale: 0.7 + 0.3 * t }),
  },
  riser: {
    name: "riser",
    label: "5. Stage Elevator Lift — surges up from under stage",
    badge: "Concert",
    inMs: 380,
    outMs: 280,
    ease: outQuart,
    at: (t) => ({ ...base, y: -(1 - t) * 6.5, scale: 0.85 + 0.15 * t, spin: (1 - t) * 2 }),
  },
  deck: {
    name: "deck",
    label: "6. Deck Deal Shuffle — lateral card fan deal",
    badge: "Shuffle",
    inMs: 410,
    outMs: 300,
    ease: outCubic,
    at: (t) => ({ ...base, spread: 1 + (1 - t) * 3.5, y: (1 - t) * 1.5, scale: 0.8 + 0.2 * t, spin: (1 - t) * 4 }),
  },
  drop: {
    name: "drop",
    label: "7. Gravity Plummet — drops from above with cushion",
    badge: "Gravity",
    inMs: 390,
    outMs: 290,
    ease: outBack,
    at: (t) => ({ ...base, y: (1 - t) * 5.2, z: -(1 - t) * 3, scale: 0.9 + 0.1 * t }),
  },
  scatterFast: {
    name: "scatterFast",
    label: "8. Scatter Blitz — 2.3x accelerated scatter burst",
    badge: "Burst",
    inMs: 440,
    outMs: 320,
    ease: outCubic,
    at: (t) => ({ ...base, spread: 1 + (1 - t) * 2.2, scale: 0.8 + 0.2 * t, spin: (1 - t) * 8 }),
  },
  magnetic: {
    name: "magnetic",
    label: "9. Magnetic Pull — smooth pull into sudden snap lock",
    badge: "Snap",
    inMs: 390,
    outMs: 280,
    ease: inOutQuart,
    at: (t) => ({ ...base, z: -(1 - t) * 9, spread: 0.5 + 0.5 * t, scale: 0.75 + 0.25 * t, spin: (1 - t) * 4 }),
  },
  dolly: {
    name: "dolly",
    label: "10. Cinema Dolly Zoom — vertigo foreground zoom",
    badge: "Cinematic",
    inMs: 430,
    outMs: 310,
    ease: outCubic,
    at: (t) => ({ ...base, scale: 2.0 - 1.0 * t, z: (1 - t) * 3.5, spread: 0.6 + 0.4 * t, spin: (1 - t) * 3 }),
  },
  accordion: {
    name: "accordion",
    label: "11. Accordion Spring — compressed stack springs wide",
    badge: "Elastic",
    inMs: 410,
    outMs: 300,
    ease: outBack,
    at: (t) => ({ ...base, spread: 0.2 + 0.8 * t, scale: 0.85 + 0.15 * t, spin: (1 - t) * 2 }),
  },
  flyby: {
    name: "flyby",
    label: "12. Banked Flyby — upper-right diagonal flight path",
    badge: "Flyby",
    inMs: 440,
    outMs: 320,
    ease: outCubic,
    at: (t) => ({ ...base, y: (1 - t) * 3.5, z: -(1 - t) * 8, spread: 1 + (1 - t) * 1.8, spin: (1 - t) * 7 }),
  },
  rush: {
    name: "rush",
    label: "13. Flash Rush — minimal 300ms instant audio rush",
    badge: "Ultra-Fast",
    inMs: 300,
    outMs: 220,
    ease: outExpo,
    at: (t) => ({ ...base, z: -(1 - t) * 3, scale: 0.95 + 0.05 * t }),
  },
  horizon: {
    name: "horizon",
    label: "14. Horizon Tilt — glides in flat, tilts upright",
    badge: "Glide",
    inMs: 430,
    outMs: 310,
    ease: outQuart,
    at: (t) => ({ ...base, spread: 1 + (1 - t) * 2.6, y: -(1 - t) * 2.5, spin: (1 - t) * 5 }),
  },
  pop: {
    name: "pop",
    label: "15. Pop Rocket — miniature point pop-scale burst",
    badge: "Pop",
    inMs: 380,
    outMs: 270,
    ease: outBack,
    at: (t) => ({ ...base, scale: 0.2 + 0.8 * t, z: -(1 - t) * 4, spin: (1 - t) * 4 }),
  },
  spiral: {
    name: "spiral",
    label: "16. Archimedes Spiral — curving circular sweep",
    badge: "Vortex",
    inMs: 450,
    outMs: 330,
    ease: outCubic,
    at: (t) => ({ ...base, y: (1 - t) * 2.8, spread: 0.4 + 0.6 * t, z: -(1 - t) * 6, spin: (1 - t) * 11 }),
  },
  flash: {
    name: "flash",
    label: "17. Strobe Pulse — high-energy optic pulse",
    badge: "Pulse",
    inMs: 340,
    outMs: 240,
    ease: outExpo,
    at: (t) => ({ ...base, scale: 1.4 - 0.4 * t, z: (1 - t) * 1.5, spin: (1 - t) * 2 }),
  },
  pendulum: {
    name: "pendulum",
    label: "18. Pendulum Swing — harmonic inertia arc settle",
    badge: "Swing",
    inMs: 430,
    outMs: 310,
    ease: outBack,
    at: (t) => ({ ...base, spread: 0.5 + 0.5 * t, y: -(1 - t) * 3.0, spin: (1 - t) * 8 }),
  },
  laser: {
    name: "laser",
    label: "19. Laser Glide — razor quintic stage floor glide",
    badge: "Precision",
    inMs: 390,
    outMs: 280,
    ease: outQuint,
    at: (t) => ({ ...base, z: -(1 - t) * 5, spread: 0.7 + 0.3 * t, spin: (1 - t) * 2 }),
  },
  quantum: {
    name: "quantum",
    label: "20. Quantum Shift — phase-shifts from foreground into slot",
    badge: "Phase",
    inMs: 410,
    outMs: 290,
    ease: outQuart,
    at: (t) => ({ ...base, z: (1 - t) * 5, scale: 1.3 - 0.3 * t, spread: 0.8 + 0.2 * t, spin: -(1 - t) * 5 }),
  },

  // Backward-compatible accelerated aliases
  scatter: {
    name: "scatter",
    label: "Scatter — accelerated classic burst",
    badge: "Classic",
    inMs: 460,
    outMs: 340,
    ease: outCubic,
    at: (t) => ({ ...base, spread: 1 + (1 - t) * 2.2, scale: 0.8 + 0.2 * t, spin: (1 - t) * 8 }),
  },
  sweep: {
    name: "sweep",
    label: "Sweep — discs fly in from back",
    badge: "Classic",
    inMs: 460,
    outMs: 340,
    ease: outCubic,
    at: (t) => ({ ...base, spread: 0.55 + 0.45 * t, z: -(1 - t) * 7, scale: 0.75 + 0.25 * t, spin: (1 - t) * 5 }),
  },
  rise: {
    name: "rise",
    label: "Rise — discs lift into place",
    badge: "Classic",
    inMs: 440,
    outMs: 320,
    ease: outCubic,
    at: (t) => ({ ...base, y: -(1 - t) * 4.5, scale: 0.9 + 0.1 * t, spin: (1 - t) * 2 }),
  },
  zoom: {
    name: "zoom",
    label: "Zoom — settles from foreground",
    badge: "Classic",
    inMs: 450,
    outMs: 320,
    ease: inOutCubic,
    at: (t) => ({ ...base, scale: 1.6 - 0.6 * t, z: (1 - t) * 2.2, spread: 0.7 + 0.3 * t, spin: (1 - t) * 3 }),
  },
  fade: {
    name: "fade",
    label: "Fade — fast opacity fade only",
    badge: "Classic",
    inMs: 320,
    outMs: 240,
    at: () => ({ ...base }),
  },
};

export const FAST_TRANSITION_NAMES: FastTransitionName[] = [
  "snappy",
  "hyperdrive",
  "slingshot",
  "vortex",
  "riser",
  "deck",
  "drop",
  "scatterFast",
  "magnetic",
  "dolly",
  "accordion",
  "flyby",
  "rush",
  "horizon",
  "pop",
  "spiral",
  "flash",
  "pendulum",
  "laser",
  "quantum",
];

export const TRANSITION_NAMES = Object.keys(TRANSITIONS) as TransitionName[];
