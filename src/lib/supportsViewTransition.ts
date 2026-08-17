"use client";

// Shared between TransitionContext.tsx (decides whether to wrap navigation
// in document.startViewTransition()) and PageTransition.tsx (decides
// whether its own GSAP clip-path reveal should run, or step aside because
// the browser is already animating the page-push via globals.css). Both
// need to agree on the same answer for the same navigation, so this is one
// function, not two copies that could drift.
export function supportsViewTransition(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (document as unknown as { startViewTransition?: unknown })
      .startViewTransition === "function"
  );
}
