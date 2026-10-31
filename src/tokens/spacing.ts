/**
 * 7th Heaven Design System - Spacing & Layout Tokens
 *
 * Utopia Fluid Space Scale (360px -> 1440px)
 * All values on the 8px modular grid
 */

export const spacing = {
  // Fluid spatial tokens
  "3xs": "clamp(0.25rem, 0.21rem + 0.19vw, 0.375rem)",  // 4px -> 6px
  "2xs": "clamp(0.5rem, 0.46rem + 0.19vw, 0.625rem)",   // 8px -> 10px
  xs: "clamp(0.75rem, 0.67rem + 0.37vw, 1.0rem)",       // 12px -> 16px
  sm: "clamp(1.0rem, 0.89rem + 0.56vw, 1.375rem)",      // 16px -> 22px
  md: "clamp(1.5rem, 1.31rem + 0.93vw, 2.125rem)",      // 24px -> 34px (Standard Stack Gap)
  lg: "clamp(2.0rem, 1.74rem + 1.30vw, 2.875rem)",      // 32px -> 46px
  xl: "clamp(3.0rem, 2.59rem + 2.04vw, 4.375rem)",      // 48px -> 70px
  "2xl": "clamp(4.0rem, 3.44rem + 2.78vw, 5.875rem)",   // 64px -> 94px

  // Semantic layout space
  stack: "clamp(1.5rem, 1.31rem + 0.93vw, 2.125rem)",   // 24px -> 34px
  cardPadding: "clamp(1.0rem, 0.85rem + 0.74vw, 1.5rem)", // 16px -> 24px
  headerHeight: "70px",
  pageTop: "32px",

  // Fixed 8px scale helpers
  fixed: {
    1: "0.25rem", // 4px
    2: "0.5rem",  // 8px
    3: "0.75rem", // 12px
    4: "1rem",    // 16px
    5: "1.25rem", // 20px
    6: "1.5rem",  // 24px
    8: "2rem",    // 32px
    10: "2.5rem", // 40px
    12: "3rem",   // 48px
    16: "4rem",   // 64px
  },
} as const;

export type Spacing = typeof spacing;
