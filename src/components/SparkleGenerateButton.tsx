"use client";

import React, { useRef, type ButtonHTMLAttributes } from "react";

export interface SparkleGenerateButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: React.ReactNode;
  /** Number of dust particles in the loop. Defaults to 10. */
  dotCount?: number;
  /** Lock the button into its active (hover) visual state */
  active?: boolean;
  isActive?: boolean;
  icon?: React.ReactNode | boolean;
  className?: string;
}

/**
 * Pure CSS "Generate Site" button (GSAP disabled for maximum performance).
 */
export const SparkleGenerateButton = React.forwardRef<
  HTMLButtonElement,
  SparkleGenerateButtonProps
>(
  (
    {
      children = "Generate Site",
      dotCount,
      active = false,
      isActive = false,
      icon,
      className = "",
      type = "button",
      ...buttonProps
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (forwardedRef as React.RefObject<HTMLButtonElement | null>) || internalRef;

    const forced = active || isActive;

    return (
      <button
 ref={buttonRef}
 type={type}
 className={`sgb-generate-button ${forced ? "sgb-is-forced" : ""} ${className}`}
 {...buttonProps}
 >
        <span>
          {typeof icon === "object" && icon !== null ? icon : null}
          {children}
        </span>
      </button>
    );
  }
);

SparkleGenerateButton.displayName = "SparkleGenerateButton";

export default SparkleGenerateButton;
