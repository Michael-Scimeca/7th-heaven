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
          className={`pointer-events-none fixed top-0 right-0 left-0 isolate z-40 h-[60px] w-full overflow-hidden md:h-[100px] ${className}`}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 z-[1] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)] backdrop-blur-[1.5px] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)]" />
          <div className="pointer-events-none absolute inset-0 z-[2] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)] backdrop-blur-[3px] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)]" />
          <div className="pointer-events-none absolute inset-0 z-[3] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)] backdrop-blur-[6px] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)]" />
          <div className="pointer-events-none absolute inset-0 z-[4] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)] backdrop-blur-[12px] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)]" />
          <div className="pointer-events-none absolute inset-0 z-[5] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)] backdrop-blur-[20px] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)]" />
        </div>
      )}

      {(position === "bottom" || position === "both") && (
        <div
          className={`pointer-events-none fixed right-0 bottom-0 left-0 isolate z-40 h-[110px] w-full overflow-hidden ${className}`}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#05030a]/85 via-[#05030a]/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-[1] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)] backdrop-blur-[1.5px] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)]" />
          <div className="pointer-events-none absolute inset-0 z-[2] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)] backdrop-blur-[3px] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)]" />
          <div className="pointer-events-none absolute inset-0 z-[3] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)] backdrop-blur-[6px] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)]" />
          <div className="pointer-events-none absolute inset-0 z-[4] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)] backdrop-blur-[12px] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)]" />
          <div className="pointer-events-none absolute inset-0 z-[5] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)] backdrop-blur-[20px] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)]" />
        </div>
      )}
    </>
  );
}
