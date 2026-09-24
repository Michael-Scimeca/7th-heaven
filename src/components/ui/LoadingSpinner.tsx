import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullPage?: boolean;
}

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({
  size = "md",
  label,
  fullPage = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-purple-400",
        className,
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin", spinnerSizes[size])} />
      {label && (
        <span className="text-sm font-medium tracking-wide text-white/70">
          {label}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-8">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
