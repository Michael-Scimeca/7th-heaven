"use client";

import React from "react";

export interface GeneratingGradientProps {
  label?: React.ReactNode;
  className?: string;
  /** Seconds for one full sweep of the gradient. */
  duration?: number;
}

/**
 * Stitch-style "Generating Screen..." placeholder in 7th Heaven colors: a dark
 * card with an accent-purple border and soft diagonal color bands sweeping across it.
 */
export default function GeneratingGradient({
  label = "Generating Screen...",
  className = "",
  duration = 4,
}: GeneratingGradientProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-xs text-[var(--color-text-muted)] select-none">{label}</span>
      )}
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="generating-gradient relative flex-1 overflow-hidden rounded-[var(--radius-box)]"
        style={{ "--gg-duration": `${duration}s` } as React.CSSProperties}
      >
        <span className="sr-only">{label}</span>
      </div>

      <style jsx>{`
        .generating-gradient {
          min-height: 200px;
          background-color: var(--color-bg-surface);
          border: 2px solid var(--color-accent);
          box-shadow: 0 0 0 1px var(--color-accent-soft),
            0 0 18px var(--color-accent-soft);
        }

        /* Moving color bands */
        .generating-gradient::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
            100deg,
            var(--color-bg-surface) 0%,
            var(--color-purple-950) 12%,
            var(--color-purple-900) 25%,
            var(--color-indigo-950) 33%,
            var(--color-purple-800) 40%,
            var(--color-bg-surface) 50%,
            var(--color-purple-950) 62%,
            var(--color-purple-900) 75%,
            var(--color-indigo-950) 83%,
            var(--color-purple-800) 90%,
            var(--color-bg-surface) 100%
          );
          /* Two identical halves + 200% size = seamless loop */
          background-size: 200% 100%;
          animation: gg-sweep var(--gg-duration) linear infinite;
        }

        @keyframes gg-sweep {
          from {
            background-position: 100% 0;
          }
          to {
            background-position: 0% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .generating-gradient::before {
            animation: none;
            background-position: 50% 0;
          }
        }
      `}</style>
    </div>
  );
}
