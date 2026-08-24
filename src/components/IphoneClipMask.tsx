"use client";

import React from "react";

/**
 * Global SVG Mask & ClipPath definitions for iPhone Mockup PNGs.
 * Completely hides the solid black/transparent outer background rectangle,
 * showing ONLY the iPhone chassis with smooth rounded corners.
 */
export function IphoneMaskSvg() {
  return (
    <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        {/* SVG clipPath for objectBoundingBox */}
        <clipPath id="iphone-png-chassis-clip" clipPathUnits="objectBoundingBox">
          <rect x="0.08" y="0" width="0.84" height="1" rx="0.10" ry="0.05" />
        </clipPath>

        {/* SVG Mask (white = visible phone, black = masked out background) */}
        <mask id="iphone-chassis-svg-mask" maskUnits="objectBoundingBox">
          <rect x="0" y="0" width="1" height="1" fill="black" />
          <rect x="0.08" y="0" width="0.84" height="1" rx="0.10" ry="0.05" fill="white" />
        </mask>
      </defs>
    </svg>
  );
}

interface IphoneClipMaskProps {
  children: React.ReactNode;
  className?: string;
  /** Inset X percentage (left/right) to trim outer black canvas (default 8%) */
  insetXPercent?: number;
  /** Inset Top percentage to trim top black canvas (default -0.2%) */
  insetTopPercent?: number;
  /** Inset Bottom percentage to trim bottom black canvas (default -0.2%) */
  insetBottomPercent?: number;
  /** Legacy fallback inset Y percentage (default -0.2%) */
  insetYPercent?: number;
  /** Round radius inside clip-path inset(...) (default 66px) */
  clipRoundPx?: number;
  /** Border radius of the iPhone wrapper element (default 42px) */
  borderRadiusPx?: number;
  /** Style override */
  style?: React.CSSProperties;
}

/**
 * Reusable iPhone Mockup Wrapper that applies SVG / CSS mask to clip out the outer black
 * background around the iPhone image, rendering ONLY the curved iPhone phone.
 */
export default function IphoneClipMask({
  children,
  className = "",
  insetXPercent = 8.8,
  insetTopPercent,
  insetBottomPercent,
  insetYPercent = 5.2,
  clipRoundPx = 52,
  borderRadiusPx = 52,
  style = {},
}: IphoneClipMaskProps) {
  const top = insetTopPercent ?? insetYPercent;
  const bottom = insetBottomPercent ?? insetYPercent;
  const leftRight = insetXPercent;

  return (
    <div
      className={`relative inline-block overflow-hidden ${className}`}
      style={{
        clipPath: `inset(${top}% ${leftRight}% ${bottom}% ${leftRight}% round ${clipRoundPx}px)`,
        WebkitClipPath: `inset(${top}% ${leftRight}% ${bottom}% ${leftRight}% round ${clipRoundPx}px)`,
        borderRadius: `${borderRadiusPx}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
