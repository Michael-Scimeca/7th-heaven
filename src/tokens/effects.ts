/**
 * 7th Heaven Design System - Effects, Radii & Animations
 */

export const effects = {
  // Border Radius Consistency Tokens
  radius: {
    box: "20px",        // Standard card & container radius: rounded-[var(--radius-box)]
    full: "9999px",     // Buttons, badges, avatar pills: rounded-full
    xs: "4px",
    sm: "6px",
    md: "10px",
    lg: "16px",
    none: "0px",
  },

  // Atmospheric Shadows & Glows
  shadows: {
    actionGlow: "0 0 20px rgba(245, 185, 66, 0.45)",
    glassCard: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
    interactiveHover: "0 0 25px rgba(168, 85, 247, 0.15)",
    modalBackdrop: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
    innerWell: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
  },

  // Easing Functions
  transition: {
    fast: "150ms ease",
    default: "200ms ease",
    slow: "350ms ease",
    dialog: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth panel & dialog transitions
    squishy: "cubic-bezier(0, 0, 0.3, 1.5)", // Unified squishy toggle spring physics
  },
} as const;

export type Effects = typeof effects;
