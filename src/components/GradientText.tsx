"use client";

import { type ReactNode } from "react";
import "./GradientText.css";

export interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: "horizontal" | "vertical" | "diagonal";
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#5227FF", "#FF9FFC", "#B497CF"],
  animationSpeed = 8,
  showBorder = false,
  direction = "horizontal",
  pauseOnHover = false,
}: GradientTextProps) {
  const gradientAngle =
    direction === "horizontal"
      ? "to right"
      : direction === "vertical"
        ? "to bottom"
        : "to bottom right";
  const safeColors =
    Array.isArray(colors) && colors.length > 0
      ? colors
      : ["#5227FF", "#FF9FFC", "#B497CF"];
  const doubleColors = [...safeColors, ...safeColors, safeColors[0]];
  const gradientColors = doubleColors.join(", ");

  const animClass =
    direction === "horizontal"
      ? "css-anim-h"
      : direction === "vertical"
        ? "css-anim-v"
        : "css-anim-d";

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize:
      direction === "horizontal"
        ? "200% 100%"
        : direction === "vertical"
          ? "100% 200%"
          : "200% 200%",
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div className={`animated-gradient-text ${showBorder ? "with-border" : ""} ${className}`}>
      {showBorder && (
        <div
 className={`gradient-overlay ${animClass} ${pauseOnHover ? "pause-hover" : ""}`}
 style={gradientStyle}
 />
      )}
      <div
 className={`text-content ${animClass} ${pauseOnHover ? "pause-hover" : ""}`}
 style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}
