"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
  from?: string;
  via?: string;
  to?: string;
  children: React.ReactNode;
}

export const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  (
    {
      as = "span",
      from = "from-purple-400",
      via = "via-pink-400",
      to = "to-purple-300",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = as as any;

    return (
      <Component
        ref={ref}
        className={cn(
          "bg-clip-text text-transparent bg-gradient-to-r font-extrabold",
          from,
          via,
          to,
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

GradientText.displayName = "GradientText";

export default GradientText;
