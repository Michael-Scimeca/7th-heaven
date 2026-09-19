"use client";

import React, { useRef, useEffect, type ButtonHTMLAttributes } from "react";
import gsap from "gsap";

export interface GlowOrbButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode;
  /** Pill background color behind the label */
  background?: string;
  /** Label text color */
  color?: string;
  /** Left/right stops of the rotating shine ring visible around the edge */
  shineLeft?: string;
  shineRight?: string;
  /** Hex colors the cursor-tracking glow blends between, left to right */
  glowStart?: string;
  glowEnd?: string;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const clamp01 = Math.min(1, Math.max(0, t));
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(r1 + (r2 - r1) * clamp01);
  const g = Math.round(g1 + (g2 - g1) * clamp01);
  const b = Math.round(b1 + (b2 - b1) * clamp01);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * GlowOrbButton — cursor-tracking luminous glow button.
 * Adapted from Aaron Iker's "Glow Button" (https://codepen.io/aaroniker/pen/XWYpyNM):
 * a rotating shine ring behind a dark pill, plus a soft radial glow that follows
 * the pointer and blends between --glow-start and --glow-end as it travels
 * across the button. Reimplemented with gsap (already a project dependency)
 * driving CSS custom properties, and a small local hex mixer in place of chroma-js.
 */
export const GlowOrbButton = React.forwardRef<HTMLButtonElement, GlowOrbButtonProps>(
  (
    {
      children = "Button",
      background,
      color,
      shineLeft,
      shineRight,
      glowStart,
      glowEnd,
      className = "",
      style,
      type = "button",
      ...buttonProps
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef =
      (forwardedRef as React.RefObject<HTMLButtonElement | null>) || internalRef;

    useEffect(() => {
      const button = (buttonRef as React.RefObject<HTMLButtonElement | null>).current;
      if (!button) return;

      const handlePointerMove = (e: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(button, {
          "--pointer-x": `${x}px`,
          "--pointer-y": `${y}px`,
          duration: 0.6,
        });

        const start =
          getComputedStyle(button).getPropertyValue("--button-glow-start").trim() ||
          "#B000E8";
        const end =
          getComputedStyle(button).getPropertyValue("--button-glow-end").trim() ||
          "#009FFD";

        gsap.to(button, {
          "--button-glow": mixHex(start, end, rect.width ? x / rect.width : 0),
          duration: 0.2,
        });
      };

      button.addEventListener("pointermove", handlePointerMove);
      return () => button.removeEventListener("pointermove", handlePointerMove);
    }, [buttonRef]);

    const cssVars: Record<string, string> = {};
    if (background) cssVars["--button-background"] = background;
    if (color) cssVars["--button-color"] = color;
    if (shineLeft) cssVars["--button-shine-left"] = shineLeft;
    if (shineRight) cssVars["--button-shine-right"] = shineRight;
    if (glowStart) cssVars["--button-glow-start"] = glowStart;
    if (glowEnd) cssVars["--button-glow-end"] = glowEnd;

    return (
      <button
        ref={buttonRef}
        type={type}
        className={`gob-button ${className}`}
        style={{ ...(cssVars as React.CSSProperties), ...style }}
        {...buttonProps}
      >
        <div className="gob-gradient" aria-hidden="true" />
        <span>{children}</span>
      </button>
    );
  }
);

GlowOrbButton.displayName = "GlowOrbButton";

export default GlowOrbButton;
