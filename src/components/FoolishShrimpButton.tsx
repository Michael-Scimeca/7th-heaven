"use client";

import React from "react";

export interface FoolishShrimpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  active?: boolean;
}

export const FoolishShrimpButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpButtonProps>(({ children = "Credits", className = "", icon, isActive, active, type = "button", ...props }, ref) => {
  const forced = isActive || active;

  return (
    <button
      ref={ref}
      type={type}
      className={`uiverse-foolish-shrimp ${forced ? "is-active active" : ""} ${className}`}
      {...props}
    >
      <div className="points_wrapper" aria-hidden="true">
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
      <span className="inner">
        {icon}
        {children}
      </span>
    </button>
  );
});

FoolishShrimpButton.displayName = "FoolishShrimpButton";

export const FoolishShrimpAlwaysButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpButtonProps>(({ children = "Credits", className = "", icon, ...props }, ref) => {
  return (
    <FoolishShrimpButton ref={ref} isActive={true} className={className} icon={icon} {...props}>
      {children}
    </FoolishShrimpButton>
  );
});

FoolishShrimpAlwaysButton.displayName = "FoolishShrimpAlwaysButton";

export default FoolishShrimpButton;

