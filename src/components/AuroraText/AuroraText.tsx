"use client";

import React, { memo } from "react";
import styles from "./AuroraText.module.css";

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
    const gradientStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${
        colors[0]
      })`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${8 / speed}s`,
    };

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className={`${styles.aurora} relative bg-clip-text text-transparent`}
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  }
);

AuroraText.displayName = "AuroraText";
