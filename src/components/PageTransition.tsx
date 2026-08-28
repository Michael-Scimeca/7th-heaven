"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "@/context/TransitionContext";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { supportsViewTransition } from "@/lib/supportsViewTransition";
import { curtainHideRef } from "@/lib/curtainHideRef";
import Logo from "@/components/Logo";

// ─── What this actually is (fourth pass, live-verified against exoape.com) ──
// This component has gone through three wrong models before this one:
//
//   1. A "leave/enter motion decompiled from exoape.com's production
//      bundle" — false, retracted. Nothing was ever decompiled.
//   2. A curtain that ALWAYS held for a fixed MIN_COVERED_HOLD_MS (1.6s)
//      before revealing, with a plain opacity fade in both directions —
//      rejected once compared side-by-side with exoape.com, because it
//      made EVERY nav click show a slow, unskippable black hold, which
//      isn't what their site does.
//   3. A curtain with the fixed hold removed (readiness-gated instead) and
//      a GSAP clip-path reveal on `content` alone, mimicking a wipe. This
//      fixed the "holds too long" problem but was STILL not close: a
//      frame-by-frame re-check of the reference recording (tracking the
//      "Digital" text on exoape's own Home page across consecutive frames)
//      showed the OUTGOING page visibly translates upward and off-screen
//      WHILE the incoming page slides up from below — both moving
//      together, a "push." Model 3 only ever animated the incoming page;
//      the outgoing one just vanished (React had already unmounted it by
//      the time the reveal ran), so there was never any push sensation —
//      just a static wipe. That's almost certainly what read as "not even
//      close": the defining motion of exoape's transition was missing
//      entirely, not just mistimed.
//
// Model 4 (this one): the push is real, physical motion of TWO different
// page trees on screen at once, which plain React/Next.js client-side
// routing fundamentally can't do — the App Router replaces `children`
// atomically, there's never a moment where both the old and new route's
// DOM both exist to animate independently. The browser's native View
// Transitions API is built exactly for this: `document.startViewTransition()`
// (called from TransitionContext.requestTransition) snapshots the whole
// document before and after the route swap, and CSS animates those two
// snapshots independently — see the "PAGE TRANSITION" section of
// globals.css for the actual translateY/clip-path keyframes that do the
// push + diagonal leading edge.
//
// So this component's job shrank: it no longer owns the page-to-page
// reveal motion at all on browsers that support the native API (the
// `supportsViewTransition()` branches below just get out of the way). What
// it still owns everywhere:
//
//   - The black curtain + logo shimmer "hold" overlay, for when the
//     destination genuinely isn't ready yet — the browser's View
//     Transition freezes the outgoing snapshot while its update callback
//     is pending, but doesn't provide any "still waiting" indicator of its
//     own, which is exactly the gap exoape.com's own hold-with-shimmer
//     fills on a cold/slow load (see GRACE_MS below).
//   - The GSAP clip-path reveal, as a fallback ONLY for browsers without
//     View Transition support (Firefox as of when this was written) —
//     without it those browsers would just see an instant, motionless
//     page swap once the curtain (if shown) lifts.
const COVER_DURATION = 0.35;
// Fallback-path reveal length only (browsers without View Transition
// support, e.g. Firefox). The real (View Transition) animation's length
// lives in globals.css as --page-transition-duration and is read at
// runtime by readViewTransitionMs() below — see the comment there. Matched
// to that same value (currently 1030ms, exoape.com's measured route-push
// duration) so the fallback path feels the same speed as the primary one
// instead of running noticeably snappier.
const REVEAL_DURATION = 1.03;

// The View Transition animation is defined entirely in CSS, so its duration
// is a CSS value. Reading it back instead of keeping a second hardcoded copy
// here means the two can't drift: previously globals.css said 0.55s and this
// file independently said 0.55s, and changing one silently left the other
// wrong (during debugging, a CSS override to 4s left this file still clearing
// transition state at 550ms — mode went back to "idle" while the page was
// still visibly mid-animation).
const VIEW_TRANSITION_FALLBACK_MS = 380;

function readViewTransitionMs(): number {
  if (typeof window === "undefined") return VIEW_TRANSITION_FALLBACK_MS;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--page-transition-duration")
    .trim();
  if (!raw) return VIEW_TRANSITION_FALLBACK_MS;
  // Accept either "900ms" or "0.9s".
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return VIEW_TRANSITION_FALLBACK_MS;
  return raw.endsWith("ms") ? n : n * 1000;
}
// How long to wait, after a click, before showing the curtain at all.
// Standard "don't flash a loading state for something that finishes
// instantly" pattern — exoape's own warm-route clicks show no curtain
// whatsoever, so showing one immediately on every click (even ones that
// resolve in a few ms on localhost) would itself be wrong. 180ms is a
// reasonable default for that grace window, not a number pulled from
// exoape.com — their exact internal threshold isn't observable.
const GRACE_MS = 180;

// Fallback-only reveal shape (see supportsViewTransition() note above) — a
// thin sliver pinned to the bottom edge, growing to cover the full
// viewport, with a slight tilt so the leading edge isn't a flat horizontal
// line. On browsers with View Transition support this is unused; the real
// push+tilt animation lives in globals.css instead.
const PAGE_REVEAL_CLIP_FROM = "polygon(0% 100%, 100% 103%, 100% 100%, 0% 100%)";
const PAGE_REVEAL_CLIP_TO = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

function isSamePathname(currentPathname: string, targetHref: string | null): boolean {
  if (!targetHref) return true;
  try {
    const targetPath = new URL(targetHref, "http://localhost").pathname.replace(/\/$/, "") || "/";
    const currentPath = currentPathname.replace(/\/$/, "") || "/";
    return currentPath === targetPath;
  } catch {
    const cleanTarget = targetHref.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
    const cleanCurrent = currentPathname.replace(/\/$/, "") || "/";
    return cleanCurrent === cleanTarget;
  }
}

function getPageIdFromPathname(pathname: string): string {
  if (!pathname || pathname === "/") return "home-page";
  const cleanPath = pathname.split("?")[0].replace(/^\/|\/$/g, "");
  if (!cleanPath) return "home-page";
  const slug = cleanPath.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-");
  return `${slug}-page`;
}

/**
 * PageTransition
 * ─────────────────────────────────────────────────────────────────────────
 * Drives the actual route-to-route transition. This component is driven
 * entirely by TransitionContext's `mode` state machine (see
 * src/context/TransitionContext.tsx). It doesn't decide when to navigate —
 * TransitionLink calls `requestTransition(href)` on click, which flips mode
 * to "covering"; everything below reacts to that.
 *
 *   idle       → no overlay, normal page.
 *   covering   → router.push() ALREADY fired the instant the click
 *                happened (see TransitionContext.requestTransition), so
 *                the destination is loading in the background this whole
 *                phase. Nothing is shown yet — a GRACE_MS timer is
 *                running. If the destination becomes ready before that
 *                timer fires, the curtain is skipped entirely and mode
 *                jumps straight to "uncovering" (see the readiness effect
 *                below). Only if GRACE_MS elapses first does the curtain
 *                actually fade in (COVER_DURATION) → mode: "covered".
 *   covered    → the curtain is opaque and holding on the logo (with a
 *                shimmer) because the destination genuinely isn't ready
 *                yet. No fixed floor — ends the instant readiness clears
 *                (see the readiness effect below), however long that
 *                takes. This is what reproduces exoape.com's real
 *                behavior: their hold length tracks actual load time,
 *                it isn't a fixed branded pause (confirmed by watching
 *                three consecutive live nav clicks on their site — see
 *                the file-level comment above for details).
 *   uncovering → curtain (if it was ever shown — safe to hide
 *                unconditionally either way, see below) disappears
 *                instantly. On browsers with View Transition support the
 *                actual page-push reveal is already running natively (see
 *                globals.css) by this point — this just waits it out. On
 *                browsers without support, the new page — already
 *                confirmed ready by this point — wipes up into view via
 *                the fallback PAGE_REVEAL_CLIP_FROM → PAGE_REVEAL_CLIP_TO
 *                clip-path instead. Back to "idle" once that finishes.
 *
 * ─── Ready check (the standard App Router pattern for this) ───────────────
 * router.push() is fire-and-forget: it returns immediately, before Next.js
 * has fetched/rendered the destination route. The naive version of this
 * component called router.push() then started polling the DOM right away —
 * which mostly just found the OLD page still sitting there (already fully
 * loaded), so it "finished" almost instantly and the curtain could start
 * uncovering before the new route had actually swapped in.
 *
 * The fix (the same pattern Next.js's own docs use for coordinating
 * navigation with UI state — see "Understanding the pending state" for
 * `useTransition`): TransitionContext wraps the router.push() call in
 * React's `startTransition` and tracks its `isPending` flag (exposed here
 * via the same context, NOT a second independent useTransition() call —
 * React's isPending only reflects a startTransition call from the SAME hook
 * instance, so this component reads the actual pending state of that push
 * rather than one of its own that would never see it flip). React only
 * clears `isPending` once the new route's tree has actually rendered and
 * committed to the DOM, so the readiness effect below:
 *
 *   1. Waits for `isPending` to go false AND `pathname` to actually equal
 *      the href we navigated to (belt-and-suspenders — confirms the swap
 *      really landed, not just that some unrelated transition finished).
 *   2. Only THEN runs waitForPageReady() — the fonts/images/double-RAF
 *      check — since step 1 only guarantees the new React tree is mounted,
 *      not that its images have decoded or its web fonts have painted.
 *
 * Because startTransition defers committing the new tree, the OLD page
 * keeps rendering underneath (whatever's visible — curtain or nothing)
 * for however long step 1 takes — an early router.push() doesn't yank
 * content out from under anything.
 *
 * waitForPageReady() itself now lives in src/lib/waitForPageReady.ts,
 * shared with TransitionContext.tsx's View Transition callback — both need
 * the same definition of "ready" (see that file for the fonts/DOM
 * text/images/double-RAF check itself).
 */

// ─── Component ────────────────────────────────────────────────────────────────
// Safety net: if isPending somehow never clears (e.g. router.push targets
// an external/invalid URL, or a slow/broken data fetch on the destination
// route), don't leave the curtain — and the site — stuck forever.
const MAX_PENDING_WAIT_MS = 6000;

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode, pendingHref, clearPendingHref, isPending } = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  // Holds the cleanup for whichever curtain tween/listeners the grace-timer
  // callback below created, if it ever fired (declared before the effect
  // that uses it since this is a plain component-body ref, not hoisted).
  const curtainCleanupRef = useRef<(() => void) | null>(null);

  // Registers the imperative "hide the curtain right now" function that
  // TransitionContext calls just before resolving a View Transition's
  // update callback — see curtainHideRef.ts for why this can't just be the
  // mode-driven "uncovering" effect below (timing isn't guaranteed early
  // enough relative to when the browser takes its "after" snapshot).
  // gsap.set is synchronous, so this really does take effect immediately.
  //
  // Also kills whatever curtain fade-in tween/timeline the covering effect
  // below may still have running (via curtainCleanupRef) — without this,
  // if readiness clears while the fade-in is mid-tween, GSAP's next tick
  // would just animate straight back toward opaque, silently undoing the
  // gsap.set() below on the very next frame.
  useEffect(() => {
    curtainHideRef.current = () => {
      curtainCleanupRef.current?.();
      curtainCleanupRef.current = null;
      const curtain = curtainRef.current;
      if (!curtain) return;
      gsap.set(curtain, { autoAlpha: 0, pointerEvents: "none" });
    };
    return () => {
      curtainHideRef.current = null;
    };
  }, []);

  // covering → wait GRACE_MS before even starting to fade the curtain in.
  // If mode has already moved on (because the readiness effect below found
  // the destination ready first and jumped straight to "uncovering") by
  // the time this timer fires, this effect's cleanup (the mode dependency
  // changing) has already cleared it — so on a fast/warm route, the
  // curtain never appears at all, matching exoape.com's News→Work /
  // Work→Contact behavior. Only on a genuinely slow/cold route does this
  // timer actually fire and start the fade.
  useEffect(() => {
    if (mode !== "covering") return;
    const curtain = curtainRef.current;
    if (!curtain) return;

    let tlInstance: gsap.core.Timeline | undefined;

    const forceCompleteIfVisible = () => {
      tlInstance?.progress(1);
    };

    document.addEventListener("visibilitychange", forceCompleteIfVisible);
    window.addEventListener("focus", forceCompleteIfVisible);

    // Safety net #1: GSAP timelines are driven by requestAnimationFrame,
    // which browsers straight-up DON'T FIRE (not just throttle) once
    // `document.visibilityState` is "hidden". A plain setTimeout guard is
    // kept as a backstop against any other reason a tween might stall.
    const stuckGuard = setTimeout(() => tlInstance?.progress(1), GRACE_MS + 1200);

    const graceTimer = setTimeout(() => {
      const tl = gsap.timeline({ onComplete: () => setMode("covered") });
      tlInstance = tl;

      tl.set(curtain, {
        autoAlpha: 0,
        pointerEvents: "auto",
      }).to(curtain, { autoAlpha: 1, duration: COVER_DURATION, ease: "power2.out" });

      curtainCleanupRef.current = () => {
        clearTimeout(stuckGuard);
        document.removeEventListener("visibilitychange", forceCompleteIfVisible);
        window.removeEventListener("focus", forceCompleteIfVisible);
        tl.kill();
      };
    }, GRACE_MS);

    return () => {
      clearTimeout(graceTimer);
      clearTimeout(stuckGuard);
      document.removeEventListener("visibilitychange", forceCompleteIfVisible);
      window.removeEventListener("focus", forceCompleteIfVisible);
      tlInstance?.kill();
      curtainCleanupRef.current?.();
      curtainCleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Readiness → the single source of truth for when to stop
  // covering/waiting and start the reveal. Runs across BOTH "covering"
  // (curtain not shown yet, still inside/past the grace window) and
  // "covered" (curtain shown, holding) — whichever state we're in when the
  // destination becomes ready, jump straight to "uncovering". No fixed
  // minimum hold: exoape.com's own hold length tracks real load time, not
  // a fixed branded pause (see the file-level comment above).
  useEffect(() => {
    if (supportsViewTransition()) return;
    if (mode !== "covering" && mode !== "covered") return;
    if (pendingHref && !isSamePathname(pathname, pendingHref)) return; // swap hasn't landed yet

    let cancelled = false;
    waitForPageReady().then(() => {
      if (!cancelled) setMode("uncovering");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPending, pathname, pendingHref]);

  // Safety net for `isPending` above: if the route swap never completes
  // (broken destination, hung fetch, etc.), stop waiting after a few
  // seconds and reveal whatever's there rather than hiding the site behind
  // a black curtain indefinitely.
  useEffect(() => {
    if (supportsViewTransition()) return;
    if ((mode !== "covering" && mode !== "covered") || !isPending) return;
    const t = setTimeout(() => {
      waitForPageReady().then(() => setMode("uncovering"));
    }, MAX_PENDING_WAIT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPending]);

  // Logo shimmer — exoape's real loading curtain doesn't just sit static on
  // their ape mark, it has a slow breathing pulse on it the whole time it
  // holds. Runs for the entire covering+covered span (not just "covered")
  // so it's already going by the time the curtain is opaque enough to read,
  // and stops cleanly (reset to full opacity) the moment we leave either.
  useEffect(() => {
    if (mode !== "covering" && mode !== "covered") return;
    const logo = logoRef.current;
    if (!logo) return;

    const tween = gsap.to(logo, {
      opacity: 0.45,
      duration: 0.9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tween.kill();
      gsap.set(logo, { opacity: 1 });
    };
  }, [mode]);

  // uncovering → the curtain (if it was ever shown at all — see GRACE_MS
  // above) disappears INSTANTLY, no fade. What happens to `content` next
  // depends on whether the browser supports the native View Transitions
  // API (see the file-level comment above and TransitionContext.tsx):
  //
  //   - Supported: nothing here animates `content` at all. By the time
  //     mode reaches "uncovering", TransitionContext's View Transition
  //     callback has already resolved, which means the browser has ALREADY
  //     taken its "after" snapshot and started running the real push
  //     animation (globals.css) — this effect just hides the curtain
  //     (which was drawn on top of the still-live DOM during the wait, see
  //     TransitionContext's comment on why that overlay still works) and,
  //     after roughly the same duration as that CSS animation, clears
  //     state back to idle. Animating `content`'s own clip-path here too
  //     would be redundant at best (the live DOM is behind the browser's
  //     snapshot overlay for the whole animation, so it wouldn't even be
  //     visible) and risks a visible double-motion if timing ever drifts.
  //   - Not supported (Firefox, as of when this was written): falls back
  //     to the old GSAP clip-path wipe on `content` — no push, no diagonal
  //     leading edge, just a plain reveal, but still safe: `content` is
  //     already confirmed to be the correct, ready new page by this point
  //     (the readiness effect above only reaches "uncovering" after
  //     confirming that), so there's no risk of racing React's own swap
  //     the way the very first version of this curtain's page-recede
  //     transform did.
  useEffect(() => {
    if (mode !== "uncovering") return;
    const curtain = curtainRef.current;
    const content = contentRef.current;
    if (!curtain || !content) return;

    gsap.set(curtain, { autoAlpha: 0, pointerEvents: "none" });

    const finish = () => {
      clearPendingHref();
      setMode("idle");
      // Reset the flag TransitionContext.requestTransition set synchronously
      // on click — nothing was ever clearing this, so canvas rAF loops
      // reading it (see AudioPlayer.tsx) would treat every navigation after
      // the very first one as permanently "mid-transition."
      if (typeof window !== "undefined") {
        (window as unknown as { __pageTransitionActive?: boolean }).__pageTransitionActive = false;
        // Paired with the add() in TransitionContext.requestTransition —
        // brings the film-grain layer back (it fades in via the transition on
        // .grain-overlay). This lives in finish() specifically because
        // finish() is the one path every route change goes through, including
        // the timeout safety nets, so the grain can't get stranded hidden.
        document.documentElement.classList.remove("is-page-transitioning");
      }
    };

    if (supportsViewTransition()) {
      return;
    }

    gsap.set(content, { clipPath: PAGE_REVEAL_CLIP_FROM, willChange: "clip-path" });

    const tween = gsap.to(content, {
      clipPath: PAGE_REVEAL_CLIP_TO,
      duration: REVEAL_DURATION,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(content, { clipPath: "none", willChange: "auto" });
        finish();
      },
    });

    // Same throttled/hidden-tab safety net as the covering effect above —
    // both a timeout backstop AND an immediate visibilitychange/focus
    // rescue, since the timeout alone is unreliable while hidden (see the
    // long comment on the covering effect's version of this).
    const stuckGuard = setTimeout(() => tween.progress(1), 1200);
    const forceCompleteIfVisible = () => {
      if (document.visibilityState === "visible") tween.progress(1);
    };
    document.addEventListener("visibilitychange", forceCompleteIfVisible);
    window.addEventListener("focus", forceCompleteIfVisible);

    return () => {
      clearTimeout(stuckGuard);
      document.removeEventListener("visibilitychange", forceCompleteIfVisible);
      window.removeEventListener("focus", forceCompleteIfVisible);
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const pageId = getPageIdFromPathname(pathname);

  return (
    <>
      <div id={pageId} ref={contentRef} className="flex-1 flex flex-col">
        {children}
      </div>

      <div
        ref={curtainRef}
        aria-hidden
        className="fixed inset-0 z-[9999] flex items-center justify-center preloader-cosmic-bg"
        style={{
          opacity: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div ref={logoRef}>
          <Logo className="h-8 md:h-11 w-auto text-white" />
        </div>
      </div>
    </>
  );
}
