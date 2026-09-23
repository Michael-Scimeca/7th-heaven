"use client";

import React from "react";

interface ProgressiveBlurProps {
  position?: "top" | "bottom" | "both";
  className?: string;
}

export default function ProgressiveBlur({ position = "both", className = "" }: ProgressiveBlurProps) {
  return (
    <>
      {(position === "top" || position === "both") && (
        <div className={`fixed top-0 left-0 right-0 h-[60px] md:h-[100px] w-full z-40 pointer-events-none isolate overflow-hidden ${className}`} aria-hidden="true">
          <div className="absolute inset-0 z-[1] pointer-events-none backdrop-blur-[1.5px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)]" />
          <div className="absolute inset-0 z-[2] pointer-events-none backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)]" />
          <div className="absolute inset-0 z-[3] pointer-events-none backdrop-blur-[6px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)]" />
          <div className="absolute inset-0 z-[4] pointer-events-none backdrop-blur-[12px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)]" />
          <div className="absolute inset-0 z-[5] pointer-events-none backdrop-blur-[20px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)]" />
        </div>
      )}

      {(position === "bottom" || position === "both") && (
        <div className={`fixed bottom-0 left-0 right-0 h-[110px] w-full z-40 pointer-events-none isolate overflow-hidden ${className}`} aria-hidden="true">
          <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-[#05030a]/85 via-[#05030a]/40 to-transparent" />
          <div className="absolute inset-0 z-[1] pointer-events-none backdrop-blur-[1.5px] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%)]" />
          <div className="absolute inset-0 z-[2] pointer-events-none backdrop-blur-[3px] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_40%)]" />
          <div className="absolute inset-0 z-[3] pointer-events-none backdrop-blur-[6px] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_65%)]" />
          <div className="absolute inset-0 z-[4] pointer-events-none backdrop-blur-[12px] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_85%)]" />
          <div className="absolute inset-0 z-[5] pointer-events-none backdrop-blur-[20px] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_70%,rgba(0,0,0,0)_100%)]" />
        </div>
      )}
    </>
  );
}
