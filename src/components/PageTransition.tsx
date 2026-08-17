"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "@/context/TransitionContext";
import Logo from "@/components/Logo";

// ─── What this actually is (corrected) ──────────────────────────────────────
// An earlier version of this file/comment claimed the leave/enter motion
// below was "decompiled straight from exoape.com's production bundle." That
// claim was wrong and has been retracted — there's no real decompilation
// happening in this environment, and a from-scratch reverse-engineer of a
// minified bundle down to exact GSAP calls isn't something that was actually
// done. What *is* verified, from directly and repeatedly watching
// exoape.com's real site: a full-bleed curtain covers the screen, holds on
// their icon mark with a slow shimmer for a beat, then reveals the
// destination. The exact leave-transform/clip-path choreography that used to
// live here was speculative on top of that and is the direct cause of a real
// bug: it tied the curtain's own opacity fade to the SAME 1s duration as a
// transform on the live page content, so on a fast/local route (content
// swaps in well under 1s) the curtain was still partly transparent when the
// new page rendered underneath it — showing the new page, darkened, with the
// logo ghosted on top of it. Confirmed with a frame-by-frame recording of
// this exact bug happening on Cruise → Book Us and again on Book Us →
// Contact.
//
// The fix: the curtain's own opacity is now driven independently and FAST
// (COVER_DURATION below), so it's fully opaque well before React could
// plausibly have swapped the routed content underneath it, regardless of how
// quickly the destination route becomes ready. No transform is applied to
// the live page content anymore — that was the thing whose timing could
// slip out of sync with the curtain and cause the bleed-through. The reveal
// (uncovering) is a plain opacity fade for the same reason: simple, and
// impossible for its timing to desync from what's actually on screen.
const COVER_DURATION = 0.35;
const REVEAL_DURATION = 0.6;

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
 *   covering   → the curtain fades to fully opaque FAST (COVER_DURATION —
 *                deliberately much shorter than a typical route swap, see
 *                the note above COVER_DURATION for why). router.push()
 *                ALREADY fired the instant the click happened — see
 *                TransitionContext.requestTransition — so the destination
 *                route is loading in the background the whole time.
 *                → mode: "covered" once the curtain is fully opaque.
 *   covered    → a real branded loading beat, not a rushed pass-through.
 *                Watching exoape.com's actual site live shows their curtain
 *                holds on their icon mark — with a slow shimmer/pulse on it
 *                — for a beat before revealing the destination.
 *                MIN_COVERED_HOLD_MS below reproduces that: the curtain
 *                won't leave "covered" before it elapses, even if the
 *                destination route was ready instantly. See "Two-stage
 *                ready check" below for how readiness AND the hold floor
 *                combine.
 *   uncovering → curtain fades back out (REVEAL_DURATION) over the new
 *                page, which is simply what's underneath — no transform
 *                applied to it. Back to "idle" once that finishes.
 *
 * ─── Two-stage ready check (the standard App Router pattern for this) ─────
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
 * committed to the DOM, so:
 *
 *   1. Wait for `isPending` to go false AND `pathname` to actually equal
 *      the href we navigated to (belt-and-suspenders — confirms the swap
 *      really landed, not just that some unrelated transition finished).
 *   2. Only THEN run waitForPageReady() — the fonts/images/double-RAF
 *      check — since step 1 only guarantees the new React tree is mounted,
 *      not that its images have decoded or its web fonts have painted.
 *
 * Because startTransition defers committing the new tree, the OLD page
 * keeps rendering (and the leave animation keeps playing over it
 * uninterrupted) for however long step 1 takes — an early router.push()
 * doesn't yank content out from under the recede/fade.
 *
 * Readiness (steps 1+2) and MIN_COVERED_HOLD_MS are independent, and
 * "covered" only ends once BOTH are satisfied: readiness so the reveal
 * never shows a half-loaded page, the hold floor so a fast/prefetched route
 * doesn't skip the branded loading beat entirely. Whichever takes longer
 * wins — usually the hold floor, same as exoape's real site.
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

// Minimum time to spend in "covered" before revealing the destination,
// regardless of how fast it was actually ready. Correction: an earlier
// version of this comment claimed exoape.com's hold was a "confirmed
// deliberate branded pause of 3-4+ seconds, not network latency." That
// wasn't reliable — re-testing their live site produced wildly different
// results across attempts (one nav click revealed in under a second,
// another sat on the curtain for 9+ seconds and then landed back on their
// homepage instead of the clicked link), so their real hold time can't be
// pinned down from watching it and may just be that page's own load time,
// not a fixed floor at all. 1.6s here is a deliberately modest, defensible
// middle ground: enough for the logo + shimmer to actually register as a
// moment rather than a flicker, without inventing a specific number and
// presenting it as verified.
const MIN_COVERED_HOLD_MS = 1600;

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode, pendingHref, clearPendingHref, isPending } = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  // Stamped the instant we enter "covered" (see the covering effect's
  // onComplete below) so the readiness effect can compute how much of
  // MIN_COVERED_HOLD_MS is left, rather than always waiting the full
  // duration even when readiness resolves late.
  const coveredEnteredAtRef = useRef<number | null>(null);

  // covering → the curtain fades to fully opaque, FAST. No transform is
  // applied to `content` here anymore — see the note above COVER_DURATION
  // for why a previous version's page-recede transform (tied to the same
  // slow ~1s duration as the curtain fade) is exactly what caused the
  // reported bleed-through/ghosting bug: `content` renders whatever
  // `children` React has currently committed, and on a fast route that can
  // swap from the old page to the new one well before a 1s tween finishes,
  // so the still-partially-transparent curtain ended up showing the NEW
  // page, darkened, with the logo ghosted on top of it. Keeping this fade
  // fast and untouched by content changes means the curtain is fully opaque
  // long before that swap can happen, regardless of route speed.
  // The real navigation already fired back in requestTransition() the
  // instant the click happened (see the two-stage ready check above for
  // why) — this effect doesn't start it, just plays the cover and flips to
  // "covered" once it's fully opaque.
  useEffect(() => {
    if (mode !== "covering") return;
    const curtain = curtainRef.current;
    if (!curtain) return;

    const tl = gsap.timeline({
      onComplete: () => {
        coveredEnteredAtRef.current = Date.now();
        setMode("covered");
      },
    });

    tl.set(curtain, {
      autoAlpha: 0,
      pointerEvents: "auto",
    }).to(curtain, { autoAlpha: 1, duration: COVER_DURATION, ease: "power2.out" });

    // Safety net #1: GSAP timelines are driven by requestAnimationFrame,
    // which browsers straight-up DON'T FIRE (not just throttle) once
    // `document.visibilityState` is "hidden" — confirmed by direct
    // instrumentation: sampling this exact curtain's computed opacity every
    // 150ms showed it pinned at the tween's starting value for 6+ seconds
    // straight while visibilityState read "hidden", even though the tab was
    // the active/focused one from the OS's point of view. A plain
    // setTimeout guard is NOT a reliable rescue for this case — setTimeout
    // is throttled/coalesced under the same background conditions (backed
    // by the same instrumentation run: a 150ms setInterval landed samples
    // ~1000ms apart instead), so it can fire many multiples of its delay
    // late. Kept even with COVER_DURATION now short, as a backstop against
    // any other reason a tween might stall.
    const stuckGuard = setTimeout(() => tl.progress(1), 1200);

    // Safety net #2: `visibilitychange` is a real DOM event fired the
    // instant the tab's visibility flips, NOT a timer — it isn't subject to
    // the throttling/suspension above, so it's the reliable way to catch
    // "the tab was hidden for however long mid-tween, and just came back."
    // Forcing straight to the end state (rather than letting the tween try
    // to resume from wherever it was) avoids any weird half-animated catch
    // up after an arbitrarily long hidden gap.
    const forceCompleteIfVisible = () => {
      if (document.visibilityState === "visible") tl.progress(1);
    };
    document.addEventListener("visibilitychange", forceCompleteIfVisible);
    window.addEventListener("focus", forceCompleteIfVisible);

    return () => {
      clearTimeout(stuckGuard);
      document.removeEventListener("visibilitychange", forceCompleteIfVisible);
      window.removeEventListener("focus", forceCompleteIfVisible);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // covered → wait for the new route to actually land (React's isPending
  // clears + pathname matches what we navigated to), THEN wait for its
  // fonts/images/DOM to actually be paintable, AND make sure the branded
  // hold has been on screen for at least MIN_COVERED_HOLD_MS — whichever
  // of "ready" and "hold floor" finishes last is what actually gates the
  // reveal.
  useEffect(() => {
    if (mode !== "covered") return;
    if (isPending) return; // React hasn't finished rendering the new route yet
    if (pendingHref && pathname !== pendingHref) return; // swap hasn't landed yet

    let cancelled = false;
    let holdTimeout: ReturnType<typeof setTimeout> | null = null;

    waitForPageReady().then(() => {
      if (cancelled) return;
      const elapsed = Date.now() - (coveredEnteredAtRef.current ?? Date.now());
      const remaining = Math.max(0, MIN_COVERED_HOLD_MS - elapsed);
      holdTimeout = setTimeout(() => {
        if (!cancelled) setMode("uncovering");
      }, remaining);
    });

    return () => {
      cancelled = true;
      if (holdTimeout) clearTimeout(holdTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPending, pathname, pendingHref]);

  // Safety net for `isPending` above: if the route swap never completes
  // (broken destination, hung fetch, etc.), stop waiting after a few
  // seconds and reveal whatever's there rather than hiding the site behind
  // a black curtain indefinitely.
  useEffect(() => {
    if (mode !== "covered" || !isPending) return;
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

  // uncovering → the curtain fades back out over the new page. By this
  // point `mode` only got here because the "covered" effect above already
  // confirmed the new route landed AND waitForPageReady() resolved, so
  // `content` (rendering the current `children`) is genuinely the new,
  // ready page — no transform, no clip-path, just a plain fade so there's
  // nothing here whose timing could desync from what's actually on screen.
  useEffect(() => {
    if (mode !== "uncovering") return;
    const curtain = curtainRef.current;
    if (!curtain) return;

    const tween = gsap.to(curtain, {
      autoAlpha: 0,
      duration: REVEAL_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        clearPendingHref();
        setMode("idle");
      },
    });
    // pointerEvents flips off immediately (not waiting on the fade) so the
    // new page is clickable/scrollable right away rather than sitting
    // behind an invisible-but-still-intercepting curtain for REVEAL_DURATION.
    gsap.set(curtain, { pointerEvents: "none" });

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
