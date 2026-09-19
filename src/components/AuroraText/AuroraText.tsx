"use client";

import React, { memo } from "react";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

/**
 * Animated gradient text effect, adapted from MagicUI's AuroraText
 * (https://magicui.design/docs/components/aurora-text).
 *
 * Renders a screen-reader-only copy of the text plus a visually
 * animated, gradient-clipped copy on top of it.
 */
export const AuroraText = memo(
  ({
    children,
    className = "",
    colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
    speed = 1,
  }: AuroraTextProps) => {
    const safeColors =
      Array.isArray(colors) && colors.length > 0
        ? colors
        : ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"];
    const doubleColors = [...safeColors, ...safeColors, safeColors[0]];
    const gradientStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${doubleColors.join(", ")})`,
      backgroundSize: "200% 200%",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${16 / speed}s`,
      animationTimingFunction: "linear",
    };

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
 className="aurora-text-aurora relative bg-clip-text text-transparent"
 style={gradientStyle}
 aria-hidden="true">
          {children}
        </span>
      </span>
    );
  }
);

AuroraText.displayName = "AuroraText";
