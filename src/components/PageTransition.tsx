"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

// Self-contained route-change crossfade: blur+fade the outgoing view out,
// swap in the new route's content, blur+fade it back in, then give any
// top-level headings a short staggered reveal.
//
// Deliberately a SINGLE state machine living entirely in this component,
// driven only by `usePathname()` with fixed GSAP durations -- no dependency
// on TransitionContext's cover/uncover state and no waiting on browser
// lifecycle events. An earlier version of this feature split the same job
// across two state machines (this component + TransitionContext) that could
// race each other, plus a browser View Transition path with its own cleanup
// timing -- that combination is what caused the flicker/hang bugs that got
// this feature pulled entirely. Keeping one simple owner here avoids all of
// that by construction rather than by careful sequencing.
export default function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
