"use client";

import React from "react";
import SparkleGenerateButton, { SparkleGenerateButtonProps } from "./SparkleGenerateButton";

export interface CosmicRadialButtonProps extends SparkleGenerateButtonProps {
  duration?: number;
  easing?: string;
  autoDrift?: boolean;
  driftInterval?: number;
  maxOffset?: number;
  engine?: "property" | "raf" | "keyframes" | string;
  syncId?: string;
}

export const CosmicRadialButton = React.forwardRef<
  HTMLButtonElement,
  CosmicRadialButtonProps
>(
  (
    {
      children,
      className = "",
      duration,
      easing,
      autoDrift,
      driftInterval,
      maxOffset,
      engine,
      syncId,
      ...props
    },
    ref
  ) => {
    return (
      <SparkleGenerateButton ref={ref} className={className} {...props}>
        {children}
      </SparkleGenerateButton>
    );
  }
);

CosmicRadialButton.displayName = "CosmicRadialButton";

export default CosmicRadialButton;

