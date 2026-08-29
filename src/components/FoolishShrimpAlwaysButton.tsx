"use client";

import React from "react";

export interface FoolishShrimpAlwaysButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const FoolishShrimpAlwaysButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpAlwaysButtonProps
>(({ children = "Button", className = "", icon, ...props }, ref) => {
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

export default FoolishShrimpAlwaysButton;
