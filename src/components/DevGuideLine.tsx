"use client";

import { useState, useEffect } from "react";

export default function DevGuideLine() {
  const [enabled, setEnabled] = useState(true);
  const [topPos, setTopPos] = useState(122);
  const [showVerticalGuides, setShowVerticalGuides] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "g") {
        setEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Horizontal laser guide line */}
      <div
        className="fixed left-0 right-0 z-[999999] pointer-events-none transition-all duration-150"
        style={{ top: `${topPos}px` }}
      >
        {/* Bright laser line */}
        <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_12px_#22d3ee,0_0_4px_#22d3ee]" />

        {/* Developer badge indicator */}
        <div className="absolute right-6 top-1 pointer-events-auto flex items-center gap-2 bg-black/95 border border-cyan-400/60 text-cyan-300 px-3 py-1 text-[11px] font-mono font-bold rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-md select-none z-[9999999]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>DEV GUIDE: {topPos}PX</span>
          <button
            onClick={(e) => { e.stopPropagation(); setTopPos((prev) => (prev === 122 ? 120 : 122)); }}
            className="ml-1 px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
          >
            Toggle {topPos === 122 ? "120px" : "122px"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowVerticalGuides((prev) => !prev); }}
            className="ml-1 px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border border-purple-400/40 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
          >
            Guides: {showVerticalGuides ? "ON" : "OFF"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setEnabled(false);
            }}
            className="ml-1.5 px-2 py-1 text-cyan-400 hover:text-red-400 hover:bg-red-500/20 rounded font-bold transition-all cursor-pointer text-xs leading-none z-[9999999]"
            title="Hide guide overlay (Press Alt+G to restore)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Vertical side margin guide lines (25px mobile / 32px desktop) */}
      {showVerticalGuides && (
        <div className="fixed inset-0 z-[999998] pointer-events-none overflow-hidden">
          {/* Left guideline (25px mobile, 32px desktop) */}
          <div className="absolute top-0 bottom-0 left-[25px] md:left-[32px] w-[1px] bg-cyan-400/80 shadow-[0_0_8px_#22d3ee]">
            <span className="absolute top-2 left-1 bg-cyan-950/90 text-cyan-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-400/40 whitespace-nowrap shadow-sm">
              <span className="md:hidden">25px Left</span>
              <span className="hidden md:inline">32px Left</span>
            </span>
          </div>

          {/* Right guideline (25px mobile, 32px desktop) */}
          <div className="absolute top-0 bottom-0 right-[25px] md:right-[32px] w-[1px] bg-cyan-400/80 shadow-[0_0_8px_#22d3ee]">
            <span className="absolute top-2 right-1 bg-cyan-950/90 text-cyan-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-400/40 whitespace-nowrap shadow-sm">
              <span className="md:hidden">25px Right</span>
              <span className="hidden md:inline">32px Right</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
