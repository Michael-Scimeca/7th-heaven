"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "@/context/TransitionContext";
import Logo from "@/components/Logo";

// ─── What this actually is (third pass, live-verified against exoape.com) ──
// This component has gone through two wrong models before this one:
//
//   1. A "leave/enter motion decompiled from exoape.com's production
//      bundle" — false, retracted. Nothing was ever decompiled.
//   2. A curtain that ALWAYS held for a fixed MIN_COVERED_HOLD_MS (1.6s)
//      before revealing, with a plain opacity fade in both directions.
//      That fixed a real ghosting/bleed-through bug (see the
//      PAGE_REVEAL_CLIP note below for the safe version of the fix that
//      replaced it) but was rejected outright once compared side-by-side
//      with exoape.com, because it made EVERY nav click show a slow,
//      unskippable black hold — not what their site actually does.
//
// What's actually true, from three back-to-back live nav clicks on
// exoape.com in one session, each captured as a rapid screenshot burst:
//
//   - Home → News (the FIRST navigation of the session, nothing
//     prefetched yet): a real black curtain, holding on their ape mark
//     with a shimmer, for however long that route actually took to
//     become ready.
//   - News → Work and Work → Contact (later navigations, same session —
//     those routes were already warm): NO black curtain at all. The new
//     page just wipes straight up from the bottom over the old one, with
//     a diagonal leading edge, in well under half a second.
//
// So the curtain+logo hold is a fallback for "the destination genuinely
// isn't ready yet," not a fixed branded pause on every click. The bug
// with the old fixed hold: on localhost, a route that's already compiled
// resolves near-instantly, so a 1.6s floor forced the slow branded hold
// to show on literally every navigation — the opposite of what
// exoape.com does. That floor is gone. Two things now gate how long
// "covering"/"covered" actually last, both readiness-driven, no fixed
// minimum:
//
//   - GRACE_MS below: the curtain doesn't even start fading in until this
//     elapses AND the destination still isn't ready. If it becomes ready
//     first, the curtain never appears at all — straight to the wipe.
//   - Once the curtain IS showing, "covered" ends the instant the
//     destination is actually ready (see the readiness effect below) —
//     no artificial floor.
const COVER_DURATION = 0.35;
const REVEAL_DURATION = 0.55;
// How long to wait, after a click, before showing the curtain at all.
// Standard "don't flash a loading state for something that finishes
// instantly" pattern — exoape's own warm-route clicks show no curtain
// whatsoever, so showing one immediately on every click (even ones that
// resolve in a few ms on localhost) would itself be wrong. 180ms is a
// reasonable default for that grace window, not a number pulled from
// exoape.com — their exact internal threshold isn't observable.
const GRACE_MS = 180;

// The diagonal wipe shape: a thin sliver pinned to the bottom edge (the
// right side lags slightly behind the left, via the 110% vs 100% offset
// below — that's what gives the boundary its tilt instead of a flat
// horizontal line) growing to cover the full viewport. Matches both the
// reference recording the user provided and the live Work→Contact
// capture (new page's white content wiping up over the old page, higher
// on the left edge than the right at any given moment).
//
// Applied to `content` — NOT the curtain — and only during "uncovering",
// once the readiness effect has already confirmed the new route landed
// AND waitForPageReady() resolved. That's what makes this safe: content
// is guaranteed to already be the correct, ready new page by the time
// this starts animating, so unlike the old page-recede transform (the
// thing that caused the original ghosting bug — see the retracted
// MIN_COVERED_HOLD_MS/decompile comments above), there's no way for this
// clip-path's timing to race React's own swap.
const PAGE_REVEAL_CLIP_FROM = "polygon(0% 100%, 100% 110%, 100% 100%, 0% 100%)";
const PAGE_REVEAL_CLIP_TO = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

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
 *                instantly, and the new page — already confirmed ready by
 *                this point — wipes up into view via the diagonal
 *                PAGE_REVEAL_CLIP_FROM → PAGE_REVEAL_CLIP_TO clip-path.
 *                Back to "idle" once that finishes.
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
 */

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
const MAX_WAIT_MS = 1200;
async function waitForPageReady(): Promise<void> {
  // 1. Wait for custom web fonts (Barlow, Rockstar, Inter, etc.) to fully load
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
      if (document.fonts.status === "loading") {
        await new Promise<void>((resolve) => {
          const onDone = () => {
            document.fonts.removeEventListener("loadingdone", onDone);
            resolve();
          };
          document.fonts.addEventListener("loadingdone", onDone);
          setTimeout(resolve, 600);
        });
      }
    } catch {}
  }

  // 2. Ensure text content is rendered in DOM and images/paint passes complete
  return new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(deadline);
      // Double RAF ensures Next.js layout & browser font paint frames have finished
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    };

    const deadline = setTimeout(finish, MAX_WAIT_MS);

    const check = () => {
      if (resolved) return;

      // Verify DOM has rendered text
      const target = document.querySelector("main") || document.body;
      const textLength = (target.innerText || target.textContent || "").trim()
        .length;

      // Find visible images that haven't finished loading
      const pendingImages = Array.from(
        document.querySelectorAll<HTMLImageElement>("img")
      ).filter((img) => {
        if (img.complete) return false;
        const r = img.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });

      if (textLength > 30 && pendingImages.length === 0) {
        finish();
      } else if (pendingImages.length > 0) {
        let remaining = pendingImages.length;
        const imgDone = () => {
          if (--remaining <= 0) finish();
        };
        pendingImages.forEach((img) => {
          img.addEventListener("load", imgDone, { once: true });
          img.addEventListener("error", imgDone, { once: true });
        });
      } else {
        // Re-check next frame if React DOM is still mounting text
        requestAnimationFrame(check);
      }
    };

    requestAnimationFrame(check);
  });
}

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

    const graceTimer = setTimeout(() => {
      const tl = gsap.timeline({ onComplete: () => setMode("covered") });

      tl.set(curtain, {
        autoAlpha: 0,
        pointerEvents: "auto",
      }).to(curtain, { autoAlpha: 1, duration: COVER_DURATION, ease: "power2.out" });

      // Safety net #1: GSAP timelines are driven by requestAnimationFrame,
      // which browsers straight-up DON'T FIRE (not just throttle) once
      // `document.visibilityState` is "hidden" — confirmed by direct
      // instrumentation: sampling this exact curtain's computed opacity
      // every 150ms showed it pinned at the tween's starting value for 6+
      // seconds straight while visibilityState read "hidden", even though
      // the tab was the active/focused one from the OS's point of view. A
      // plain setTimeout guard is NOT a reliable rescue for this case —
      // setTimeout is throttled/coalesced under the same background
      // conditions (backed by the same instrumentation run: a 150ms
      // setInterval landed samples ~1000ms apart instead), so it can fire
      // many multiples of its delay late. Kept even with COVER_DURATION
      // now short, as a backstop against any other reason a tween might
      // stall.
      const stuckGuard = setTimeout(() => tl.progress(1), 1200);

      // Safety net #2: `visibilitychange` is a real DOM event fired the
      // instant the tab's visibility flips, NOT a timer — it isn't subject
      // to the throttling/suspension above, so it's the reliable way to
      // catch "the tab was hidden for however long mid-tween, and just
      // came back." Forcing straight to the end state (rather than letting
      // the tween try to resume from wherever it was) avoids any weird
      // half-animated catch up after an arbitrarily long hidden gap.
      const forceCompleteIfVisible = () => {
        if (document.visibilityState === "visible") tl.progress(1);
      };
      document.addEventListener("visibilitychange", forceCompleteIfVisible);
      window.addEventListener("focus", forceCompleteIfVisible);

      curtainCleanupRef.current = () => {
        clearTimeout(stuckGuard);
        document.removeEventListener("visibilitychange", forceCompleteIfVisible);
        window.removeEventListener("focus", forceCompleteIfVisible);
        tl.kill();
      };
    }, GRACE_MS);

    return () => {
      clearTimeout(graceTimer);
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
    if (mode !== "covering" && mode !== "covered") return;
    if (isPending) return; // React hasn't finished rendering the new route yet
    if (pendingHref && pathname !== pendingHref) return; // swap hasn't landed yet

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
  // above) disappears INSTANTLY, no fade, and the new page wipes up into
  // view via the diagonal clip-path instead. By this point `mode` only got
  // here because the readiness effect above already confirmed the new
  // route landed AND waitForPageReady() resolved, so `content` (rendering
  // the current `children`) is genuinely the new, ready page — safe to
  // animate its own clip-path with no risk of racing React's swap (see the
  // PAGE_REVEAL_CLIP note near the top of this file for why that's true
  // here but wasn't for the old page-recede transform).
  //
  // Hiding the curtain unconditionally (autoAlpha: 0, no tween) is correct
  // whether or not it was ever actually shown: on the fast/no-curtain path
  // its autoAlpha is already 0 from the initial inline style, so this is a
  // harmless no-op; on the slow/curtain-shown path this is what actually
  // reveals the wipe instead of leaving a black screen up while `content`
  // animates invisibly underneath it.
  useEffect(() => {
    if (mode !== "uncovering") return;
    const curtain = curtainRef.current;
    const content = contentRef.current;
    if (!curtain || !content) return;

    gsap.set(curtain, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(content, { clipPath: PAGE_REVEAL_CLIP_FROM, willChange: "clip-path" });

    const tween = gsap.to(content, {
      clipPath: PAGE_REVEAL_CLIP_TO,
      duration: REVEAL_DURATION,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(content, { clipPath: "none", willChange: "auto" });
        clearPendingHref();
        setMode("idle");
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

  return (
    <>
      <div ref={contentRef} className="flex-1 flex flex-col">
        {children}
      </div>

      <div
        ref={curtainRef}
        aria-hidden
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          // NOT `bg-black`: globals.css has a global "unboxed theme" rule
          // (`body, main, .site-container, section, .bg-black, .bg-[#000]...`)
          // that force-strips background-color to transparent with
          // `!important` on that exact class, site-wide, on purpose (so
          // "boxed" sections don't cover the animated gradient background).
          // It was silently nuking this curtain's fill too — the whole
          // state machine ran correctly, but the "solid panel" had zero
          // opacity paint, so covering the screen was invisible. Setting
          // the color inline (not via a class in that stripped list) keeps
          // this element outside that rule entirely.
          backgroundColor: "#000",
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
