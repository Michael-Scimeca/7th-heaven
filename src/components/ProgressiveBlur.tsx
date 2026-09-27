"use client";

import React from "react";

interface ProgressiveBlurProps {
  position?: "top" | "bottom" | "both";
  className?: string;
}

export default function ProgressiveBlur({
  position = "both",
  className = "",
}: ProgressiveBlurProps) {
  return (
    <>
      {(position === "top" || position === "both") && (
        <div
          className={`pointer-events-none fixed top-0 right-0 left-0 isolate z-40 h-[80px] w-full overflow-hidden bg-gradient-to-b from-[#05030a]/80 via-[#05030a]/40 to-transparent backdrop-blur-md ${className}`}
          aria-hidden="true"
        />
      )}

      {(position === "bottom" || position === "both") && (
        <div
          className={`pointer-events-none fixed right-0 bottom-0 left-0 isolate z-40 h-[110px] w-full overflow-hidden bg-gradient-to-t from-[#05030a]/90 via-[#05030a]/50 to-transparent backdrop-blur-md ${className}`}
          aria-hidden="true"
        />
      )}
    </>
  );
}
