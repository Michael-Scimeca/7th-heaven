"use client";

import type { ReactNode } from "react";
import { LiquidGlass } from "quick-liquid/react";

/**
 * Liquid-glass surface for the content stack that slides up over the sticky
 * home hero. Uses quick-liquid's heaviest frost ("ultra") so the hero video
 * and headline are frosted/refracted out of view while the tour list and
 * sections cover it — no flat background color.
 *
 * The glass is a viewport-sized sticky layer BEHIND the content rather than a
 * wrapper around it: quick-liquid forces `overflow: hidden` on its host
 * element (which would break sticky children like the tour sort bar) and
 * builds its displacement map at the host's size (a page-tall map would be
 * very expensive). A 100svh panel keeps the map small and reusable.
 */
export default function HeroCoverGlass({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <LiquidGlass
          className="hero-cover-glass-host sticky top-0 h-[100vh] h-[100svh] w-full !shadow-none [&_.ql-rim]:!hidden [&_.ql-sheen]:!hidden"
          config={{
            material: "ultra",
            appearance: "dark",
            borderRadius: 0,
            quality: "medium",
            cursorTracking: false,
            hoverLighting: false,
            parallax: false,
            inertia: false,
            dynamicLighting: false,
          }}
        />
      </div>
      <div className="page-stack">{children}</div>
    </div>
  );
}
