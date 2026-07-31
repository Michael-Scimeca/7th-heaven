"use client";

import { useState, useEffect } from "react";

export default function DevGuideLine() {
  const [enabled, setEnabled] = useState(true);
  const [topPos, setTopPos] = useState(122);

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
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setEnabled(false);
          }}
          className="ml-1.5 px-2 py-1 text-cyan-400 hover:text-red-400 hover:bg-red-500/20 rounded font-bold transition-all cursor-pointer text-xs leading-none z-[9999999]"
          title="Hide line (Press Alt+G to restore)"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
