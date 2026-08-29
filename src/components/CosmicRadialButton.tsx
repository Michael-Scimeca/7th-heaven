"use client";

import React from "react";
import FoolishShrimpButton, { FoolishShrimpButtonProps } from "./FoolishShrimpButton";

export interface CosmicRadialButtonProps extends FoolishShrimpButtonProps {
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
      <FoolishShrimpButton ref={ref} className={className} {...props}>
        {children}
      </FoolishShrimpButton>
    );
  }
);

CosmicRadialButton.displayName = "CosmicRadialButton";

export default CosmicRadialButton;
