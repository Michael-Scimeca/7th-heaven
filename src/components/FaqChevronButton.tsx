"use client";

import React from "react";
import { DotChevronRight } from "@/components/ui/DotArrow";

export interface FaqChevronButtonProps {
  isExpanded: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  ariaLabel?: string;
  as?: "div" | "button";
}

/**
 * Reusable FAQ toggle button / indicator component used across FAQ pages.
 * Displays a glassy square container with a rotating chevron icon.
 */
export function FaqChevronButton({
  isExpanded,
  onClick,
  className = "",
  ariaLabel,
  as,
}: FaqChevronButtonProps) {
  // Use 'div' by default when nested inside an outer accordion <button> to avoid invalid nested <button> HTML,
  // or 'button' when used standalone with onClick.
  const Component = as || (onClick ? "button" : "div");

  return (
    <Component
      {...(Component === "button" ? { type: "button", onClick } : { onClick })}
      aria-expanded={isExpanded}
      aria-label={
        ariaLabel || (isExpanded ? "Collapse answer" : "Expand answer")
      }
      className={`accordion-chevron focus-ring shrink-0 transition-transform ${isExpanded
          ? "rotate-90 text-purple-400"
          : "text-white/70 hover:text-white"
        } ${className}`}
    >
      <DotChevronRight className="h-4 w-4" />
    </Component>
  );
}

export default FaqChevronButton;
