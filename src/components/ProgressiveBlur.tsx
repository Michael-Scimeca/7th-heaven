"use client";

import React from "react";
import "./ProgressiveBlur.css";

interface ProgressiveBlurProps {
  position?: "top" | "bottom" | "both";
  className?: string;
}

const LAYERS = [1, 2, 3, 4, 5] as const;

export default function ProgressiveBlur({
  position = "both",
  className = "",
}: ProgressiveBlurProps) {
  return (
    <>
      {(position === "top" || position === "both") && (
        <div className={`progressive-blur is-top ${className} `} aria-hidden="true">
          {LAYERS.map((n) => (
            <div key={n} className={`progressive-blur__layer is--${n}`} />
          ))}
        </div>
      )}

      {(position === "bottom" || position === "both") && (
        <div
          className={`pointer-events-none fixed right-0 bottom-0 left-0 isolate z-40 h-[110px] w-full overflow-hidden bg-gradient-to-t from-[#05030a]/90 via-[#05030a]/50 to-transparent backdrop-blur-md ${className} `}
          aria-hidden="true"
        />
      )}
    </>
  );
}
