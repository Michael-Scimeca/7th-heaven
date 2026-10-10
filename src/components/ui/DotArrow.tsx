import React, { forwardRef } from "react";

export type DotArrowDirection = "right" | "left" | "down" | "up";

export interface DotChevronProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  dotRadius?: number;
  direction?: DotArrowDirection;
}

/**
 * DotArrow / DotChevron
 * ---------------------------------------------------------------------------
 * Stylized chevron arrow composed of 5 discrete dots, matching the signature
 * high-tech / digital dot-matrix aesthetic across the 7th Heaven design system.
 */
export const DotChevronDown = forwardRef<SVGSVGElement, DotChevronProps>(
  ({ className = "h-4 w-4", size, dotRadius = 1.75, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size || "1em"}
        height={size || "1em"}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <circle cx="6" cy="9" r={dotRadius} />
        <circle cx="9" cy="12" r={dotRadius} />
        <circle cx="12" cy="15" r={dotRadius} />
        <circle cx="15" cy="12" r={dotRadius} />
        <circle cx="18" cy="9" r={dotRadius} />
      </svg>
    );
  },
);
DotChevronDown.displayName = "DotChevronDown";

export const DotChevronUp = forwardRef<SVGSVGElement, DotChevronProps>(
  ({ className = "h-4 w-4", size, dotRadius = 1.75, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size || "1em"}
        height={size || "1em"}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <circle cx="6" cy="15" r={dotRadius} />
        <circle cx="9" cy="12" r={dotRadius} />
        <circle cx="12" cy="9" r={dotRadius} />
        <circle cx="15" cy="12" r={dotRadius} />
        <circle cx="18" cy="15" r={dotRadius} />
      </svg>
    );
  },
);
DotChevronUp.displayName = "DotChevronUp";

export const DotChevronRight = forwardRef<SVGSVGElement, DotChevronProps>(
  ({ className = "h-4 w-4", size, dotRadius = 1.75, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size || "1em"}
        height={size || "1em"}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <circle cx="9" cy="6" r={dotRadius} />
        <circle cx="12" cy="9" r={dotRadius} />
        <circle cx="15" cy="12" r={dotRadius} />
        <circle cx="12" cy="15" r={dotRadius} />
        <circle cx="9" cy="18" r={dotRadius} />
      </svg>
    );
  },
);
DotChevronRight.displayName = "DotChevronRight";

export const DotChevronLeft = forwardRef<SVGSVGElement, DotChevronProps>(
  ({ className = "h-4 w-4", size, dotRadius = 1.75, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size || "1em"}
        height={size || "1em"}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <circle cx="15" cy="6" r={dotRadius} />
        <circle cx="12" cy="9" r={dotRadius} />
        <circle cx="9" cy="12" r={dotRadius} />
        <circle cx="12" cy="15" r={dotRadius} />
        <circle cx="15" cy="18" r={dotRadius} />
      </svg>
    );
  },
);
DotChevronLeft.displayName = "DotChevronLeft";

export const DotArrow = forwardRef<SVGSVGElement, DotChevronProps>(
  ({ direction = "right", ...props }, ref) => {
    switch (direction) {
      case "down":
        return <DotChevronDown ref={ref} {...props} />;
      case "left":
        return <DotChevronLeft ref={ref} {...props} />;
      case "up":
        return <DotChevronUp ref={ref} {...props} />;
      case "right":
      default:
        return <DotChevronRight ref={ref} {...props} />;
    }
  },
);
DotArrow.displayName = "DotArrow";

export default DotArrow;
