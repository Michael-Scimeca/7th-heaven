"use client";

import React from "react";
import SparkleGenerateButton, { SparkleGenerateButtonProps } from "./SparkleGenerateButton";

export interface FoolishShrimpButtonProps extends SparkleGenerateButtonProps {
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
    <SparkleGenerateButton ref={ref} active={isActive} className={className} {...props}>
      {children}
    </SparkleGenerateButton>
  );
});

FoolishShrimpButton.displayName = "FoolishShrimpButton";

export const FoolishShrimpAlwaysButton = React.forwardRef<
  HTMLButtonElement,
  FoolishShrimpButtonProps
>(({ children = "Credits", className = "", icon, ...props }, ref) => {
  return (
    <SparkleGenerateButton ref={ref} active={true} className={className} {...props}>
      {children}
    </SparkleGenerateButton>
  );
});

FoolishShrimpAlwaysButton.displayName = "FoolishShrimpAlwaysButton";

export default FoolishShrimpButton;

