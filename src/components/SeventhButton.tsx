"use client";

import React from "react";

export interface SeventhButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode | boolean;
  isActive?: boolean;
  active?: boolean;
  dotCount?: number;
  background?: string;
  color?: string;
  shineLeft?: string;
  shineRight?: string;
  glowStart?: string;
  glowEnd?: string;
}

export const SeventhButton = React.forwardRef<
  HTMLButtonElement,
  SeventhButtonProps
>(
  (
    {
      children = "Credits",
      className = "",
      icon,
      isActive,
      active,
      type = "button",
      background,
      color,
      shineLeft,
      shineRight,
      glowStart,
      glowEnd,
      style,
      ...props
    },
    ref
  ) => {
    const forced = Boolean(isActive || active);
    const combinedClassName = [
      "seventh--btn",
      forced ? "is-active active" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const cssVars: Record<string, string> = {};
    if (background) cssVars["--button-background"] = background;
    if (color) cssVars["--button-color"] = color;
    if (shineLeft) cssVars["--button-shine-left"] = shineLeft;
    if (shineRight) cssVars["--button-shine-right"] = shineRight;
    if (glowStart) cssVars["--button-glow-start"] = glowStart;
    if (glowEnd) cssVars["--button-glow-end"] = glowEnd;

    const renderIcon = typeof icon === "boolean" ? null : icon;

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClassName}
        style={{ ...(cssVars as React.CSSProperties), ...style }}
        {...props}
      >

        <span>
          {renderIcon}
          {children}
        </span>
      </button>
    );
  }
);

SeventhButton.displayName = "SeventhButton";

export default SeventhButton;
