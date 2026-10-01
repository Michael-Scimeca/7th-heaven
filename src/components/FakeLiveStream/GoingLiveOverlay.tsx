"use client";

import React, { useState, useEffect } from "react";
import type { CrewConfig } from "./constants";

export function GoingLiveOverlay({
  onComplete,
  crew,
}: {
  onComplete: () => void;
  crew: CrewConfig;
}) {
  const [phase, setPhase] = useState<"connecting" | "initializing" | "live">(
    "connecting",
  );
  const [faded, setFaded] = useState(false);

  // Use RAF + Date.now() so it works even in background tabs
  useEffect(() => {
    const start = Date.now();
    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= 1800 && elapsed < 3600) setPhase("initializing");
      else if (elapsed >= 3600) setPhase("live");
      if (elapsed >= 4200) setFaded(true);
      if (elapsed >= 5000) {
        onComplete();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-800 ${
        faded ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
      }`}
    >
      {/* Scan line */}
      <div
        className="absolute inset-x-0 h-[2px] animate-[scan-line_2s_linear_infinite] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
      />

      {/* Center */}
      <div className="relative z-10 text-center">
        {/* Pulsing rings */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          {[0, 0.4, 0.8].map((delay, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-[ring-expand_2s_ease-out_infinite]"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,10,61,0.3)_0%,transparent_70%)]"
          >
            <span className="text-4xl">{crew.badge}</span>
          </div>
        </div>

        <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/30">
          7th Heaven
        </div>

        {phase === "connecting" && (
          <div>
            <div className="mb-2 text-2xl font-black tracking-wider text-white">
              Connecting...
            </div>
            <div className="flex items-center justify-center gap-1">
              {[0, 0.2, 0.4].map((d, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-[blink-dot_1s_ease-in-out_infinite]"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
          </div>
        )}
        {phase === "initializing" && (
          <div>
            <div className="mb-2 text-2xl font-black tracking-wider text-purple-500">
              Crew member is going live
            </div>
            <div className="rounded-[var(--radius-box)] border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-[11px] tracking-[0.2em] text-white/50">
              {crew.name} · {crew.instrument}
            </div>
          </div>
        )}
        {phase === "live" && (
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2 text-lg font-black tracking-widest text-white shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <span className="h-2 w-2 rounded-full bg-white animate-[blink-dot_0.8s_ease-in-out_infinite]" />
              YOU&apos;RE LIVE
            </div>
          </div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="transition-colors absolute right-8 bottom-8 cursor-pointer rounded-[var(--radius-box)] border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold tracking-widest text-white/40 hover:bg-white/10 hover:text-white"
      >
        Skip →
      </button>

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
      />
    </div>
  );
}
