"use client";

import React from "react";

export interface FoolishShrimpButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export const FoolishShrimpButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpButtonProps
>(({ children = "Credits", className = "", icon, isActive, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`uiverse-foolish-shrimp ${isActive ? "is-active" : ""} ${className}`}
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

export const FoolishShrimpAlwaysButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpButtonProps
>(({ children = "Credits", className = "", icon, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`uiverse-foolish-shrimp always ${className}`}
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

FoolishShrimpAlwaysButton.displayName = "FoolishShrimpAlwaysButton";

export default FoolishShrimpButton;
