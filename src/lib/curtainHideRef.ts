"use client";

// Plain (non-React) mutable ref shared between PageTransition.tsx (which
// registers a function that imperatively hides the curtain overlay) and
// TransitionContext.tsx (which calls it).
//
// Why this exists: when document.startViewTransition() is in play,
// resolving its update-callback promise is what tells the browser "take
// the AFTER snapshot now." If the curtain is still visible (opaque, with
// the logo) at that exact moment, the browser bakes a black rectangle into
// the "new page" snapshot, and the push animation slides that in instead
// of the actual destination content — a real, silent-looking bug, not a
// hypothetical: nothing about "the curtain fades out eventually" stops it
// from still being on screen at the specific instant the promise resolves,
// since PageTransition's own mode-driven hide runs in a React effect,
// which is not guaranteed to run before that instant.
//
// Routing this through a plain mutable ref instead of a React state/context
// value is deliberate: TransitionContext needs to call this synchronously,
// in the same tick as resolving the transition promise, with zero
// dependency on a render having happened in between. A context value read
// via useContext() would still be whatever it was at TransitionContext's
// OWN last render — not necessarily fresh — whereas a plain object's
// `.current` is always whatever PageTransition last set it to, read
// directly, no render involved.
export const curtainHideRef: { current: (() => void) | null } = {
  current: null,
};
