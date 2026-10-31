/**
 * 7th Heaven Design System - Color Tokens
 *
 * Violet Nocturne Palette with WCAG 2.1 AAA Contrast
 * Base background: #210e2a (Violet-black)
 * Solitary action accent: #f5b942 (Warm Gold - 11.6:1 contrast ratio)
 */

export const colors = {
  // Base Surface Backgrounds
  background: {
    base: "#210e2a",
    surface: "#2c1238",
    glass: "rgba(33, 14, 42, 0.72)",
    glassDark: "rgba(15, 15, 19, 0.85)",
    inset: "rgba(0, 0, 0, 0.25)",
  },

  // Solitary Action Accent - The ONLY warm color on the site
  // Reserved for primary CTAs, active booking states, calendar highlights, and clickable contact links
  action: {
    main: "#f5b942", // 11.6:1 on #05030a
    hover: "#ffd27a", // 13.8:1
    active: "#e6a42a",
    soft: "rgba(245, 185, 66, 0.14)",
    ring: "rgba(245, 185, 66, 0.45)",
    glow: "0 0 20px rgba(245, 185, 66, 0.45)",
  },

  // Violet Nocturne Atmospheric Palette
  nocturne: {
    midnight: "#210e2a",
    wine: "#49193c",
    plum: "#531161",
    mauve: "#835e6e",
    rose: "#d2a8a2",
  },

  // Calibrated In-Gamut OKLCH Purple Scale (Hue 303.9°)
  purple: {
    50: "oklch(97% 0.015 303.9)",
    100: "oklch(93% 0.035 303.9)",
    200: "oklch(88% 0.065 303.9)",
    300: "oklch(80% 0.115 303.9)",
    400: "oklch(72% 0.165 303.9)",
    500: "oklch(64% 0.215 303.9)",
    600: "oklch(55% 0.250 303.9)",
    700: "oklch(45% 0.200 303.9)",
    800: "oklch(35% 0.150 303.9)",
    900: "oklch(25% 0.100 303.9)",
    950: "#210e2a",
  },

  // Typography Text Colors
  text: {
    primary: "#fffbeb", // Amber-50 warm ivory
    secondary: "#d4d4d8", // Zinc-300
    muted: "#a1a1aa", // Zinc-400
    disabled: "rgba(255, 255, 255, 0.40)",
  },

  // Semantic Status Tones
  semantic: {
    success: {
      light: "rgba(34, 197, 94, 0.15)",
      main: "#22c55e",
      text: "#86efac",
      border: "rgba(34, 197, 94, 0.35)",
    },
    warning: {
      light: "rgba(245, 185, 66, 0.15)",
      main: "#f5b942",
      text: "#fde047",
      border: "rgba(245, 185, 66, 0.35)",
    },
    error: {
      light: "rgba(239, 68, 68, 0.15)",
      main: "#ef4444",
      text: "#fca5a5",
      border: "rgba(239, 68, 68, 0.35)",
    },
    info: {
      light: "rgba(168, 85, 247, 0.15)",
      main: "#a855f7",
      text: "#d8b4fe",
      border: "rgba(168, 85, 247, 0.35)",
    },
  },

  // Borders & Dividers
  border: {
    subtle: "rgba(255, 255, 255, 0.10)",
    hover: "rgba(131, 94, 110, 0.60)",
    focus: "rgba(210, 168, 162, 0.50)",
    purple: "rgba(168, 85, 247, 0.40)",
  },
} as const;

export type Colors = typeof colors;
