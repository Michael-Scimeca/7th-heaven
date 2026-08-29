"use client";

import React from "react";

export interface FoolishShrimpButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const FoolishShrimpButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpButtonProps
>(({ children = "Credits", className = "", icon, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`uiverse-foolish-shrimp ${className}`}
      {...props}
    >
      <div className="points_wrapper">
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
        <i className="point" />
      </div>

      <span className="inner">{children}</span>
    </button>
  );
});

FoolishShrimpButton.displayName = "FoolishShrimpButton";

export default FoolishShrimpButton;
