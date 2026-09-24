"use client";

import React from "react";

export interface SeventhButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
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
  href?: string;
  target?: string;
  rel?: string;
}

export const SeventhButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
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
      href,
      target,
      rel,
      ...props
    },
    ref,
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
    const content = (
      <span>
        {renderIcon}
        {children}
      </span>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          className={combinedClassName}
          style={{ ...(cssVars as React.CSSProperties), ...style }}
          {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={combinedClassName}
        style={{ ...(cssVars as React.CSSProperties), ...style }}
        {...props}
      >
        {content}
      </button>
    );
  },
);

SeventhButton.displayName = "SeventhButton";

export default SeventhButton;
