/**
 * 7th Heaven Design System - Typography Tokens
 *
 * Headings: 'Anton' (punchy arena rock marquee)
 * Body: 'Inter' (geometric legibility)
 * Fluid clamp scales for responsive 360px -> 1440px rendering
 */

export const typography = {
  fontFamily: {
    heading: "'Anton', var(--font-anton), sans-serif",
    display: "'Anton', var(--font-anton), sans-serif",
    body: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sans: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lemon: "'LTLemon', var(--font-ltlemon), cursive, sans-serif",
    quisas: "'Quisas', var(--font-quisas), cursive, sans-serif",
  },

  // Fluid typography scale clamped from 360px viewport to 1440px viewport
  fontSize: {
    display: "clamp(2.75rem, 5vw + 1rem, 5.5rem)", // 44px -> 88px
    h1: "clamp(2.25rem, 4vw + 1rem, 4.0rem)",       // 36px -> 64px
    h2: "clamp(1.75rem, 3vw + 0.75rem, 3.0rem)",     // 28px -> 48px
    h3: "clamp(1.35rem, 2vw + 0.5rem, 2.25rem)",     // 21.6px -> 36px
    h4: "clamp(1.15rem, 1.2vw + 0.5rem, 1.75rem)",   // 18.4px -> 28px
    h5: "clamp(1.0rem, 0.8vw + 0.5rem, 1.35rem)",    // 16px -> 21.6px
    h6: "clamp(0.95rem, 0.5vw + 0.5rem, 1.15rem)",   // 15.2px -> 18.4px
    bodyLg: "1.375rem",                              // 22px
    body: "clamp(1rem, 0.3846rem + 0.9615vw, 1.25rem)", // 16px -> 20px
    small: "0.875rem",                               // 14px
    caption: "0.75rem",                              // 12px
  },

  lineHeight: {
    display: "0.95",
    h1: "1.05",
    h2: "1.15",
    h3: "1.2",
    h4: "1.25",
    h5: "1.3",
    h6: "1.3",
    body: "1.5",
    tight: "1.25",
    none: "1",
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Zero letter-spacing site-wide
  letterSpacing: {
    tighter: "0",
    tight: "0",
    normal: "0",
    wide: "0",
    wider: "0",
    widest: "0",
  },
} as const;

export type Typography = typeof typography;
