"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "@/context/TransitionContext";

// exoape.com's own nav-triggered page transition, decompiled straight from
// their production bundle (chunk 6f3a20d.js — Nuxt's `transition:{enter,
// leave}` option on their default layout) rather than eyeballed off a
// recording, so this is their ACTUAL code, not a lookalike:
//
//   leave(t, done) {                          // t = departing page root
//     gsap.fromTo(t,
//       { scale: 1, rotate: 0, y: 0 },
//       { scale: 1.3, rotate: -7, y: -innerHeight/2, duration: 1,
//         ease: customEase, onComplete: done })
//     gsap.fromTo(t.firstChild,                // a full-bleed panel that
//       { autoAlpha: 0 },                      // lives INSIDE every page's
//       { autoAlpha: 1, duration: 1, ease: customEase })  // own root
//   }
//   enter(t) {                                 // t = arriving page root
//     gsap.fromTo(t,
//       { clipPath: PAGE_REVEAL_CLIP_FROM, zIndex: 2 },
//       { clipPath: PAGE_REVEAL_CLIP_TO, duration: 1, ease: customEase,
//         clearProps: "all" })
//     gsap.fromTo(t.lastChild,
//       { scale: 1.3, rotate: 7, y: innerHeight/2 },
//       { scale: 1, rotate: 0, y: 0, duration: 1, ease: customEase,
//         clearProps: "all" })
//   }
//
// customEase is the SVG path "M0,0 C0.496,0.004 0,1 1,1", which decodes to
// the exact same cubic-bezier(0.496, 0.004, 0, 1) already used for the
// mobile menu's own page-recede effect in Header.tsx (search
// PAGE_RECEDE_EASE there for that derivation).
//
// Two things don't map 1:1 onto our component split and are adapted below
// rather than copied verbatim:
//   - Their "curtain" isn't a separate overlay element at all — it's
//     literally the first child inside each page's own root markup,
//     fading in as that page recedes. Our `curtain` (a persistent portaled
//     div, needed because Next/React can't retrofit a hidden panel into
//     every page's own JSX root the way their Vue setup could) plays the
//     same role: fade in over the SAME 1s/ease as the recede, not a
//     separate 0.5s power2.out stagger like an earlier version here had.
//   - Their real "enter" clip-path reveal has a bug: the TO string in
//     their own minified source is `"polygon(0% 0%, 100% 0%, 100% 100%,
//     0% 100%"` — missing its closing `)`. An unclosed clip-path is
//     invalid CSS, so the browser silently rejects every frame of that
//     tween and the reveal likely just snaps once GSAP's `clearProps`
//     strips the property at the very end, rather than actually wiping.
//     The shape's own design (bottom two corners pinned, top two rising
//     into place) is clearly meant to animate smoothly, so it's
//     reproduced here with the closing paren restored rather than the bug
//     copied along with it.
const PAGE_RECEDE_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const PAGE_REVEAL_CLIP_FROM = "polygon(0% 100%, 100% 110%, 100% 100%, 0% 100%)";
const PAGE_REVEAL_CLIP_TO = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

// Distance from `el`'s top edge to the top of the viewport, using ONLY
// layout-based offsets (walking `offsetTop` up the `offsetParent` chain) —
// never getBoundingClientRect(), which reports the element's rendered,
// TRANSFORMED box. See the matching comment in Header.tsx (same helper,
// same reasoning) for why: temporarily clearing `transform` to measure
// with getBoundingClientRect() forces a layout flush that the browser then
// treats as the transition's real starting point, silently killing the
// animation whenever the cleared/identity value happens to match one end
// of the tween. offsetTop is unaffected by an element's own CSS transform,
// so it's safe to read without disturbing the transform being animated.
function getUntransformedViewportTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top - window.scrollY;
}

/**
 * PageTransition
 * ─────────────────────────────────────────────────────────────────────────
 * Drives the actual route-to-route transition — ported from exoape.com's
 * real leave/enter hooks (see the comment above PAGE_RECEDE_EASE for the
 * decompiled source and what's adapted vs. copied verbatim). The departing
 * page itself grows/rotates/slides away while a full-bleed panel fades in
 * over it; the real Next.js navigation actually fires immediately on click
 * (see TransitionContext.requestTransition), loading in the background for
 * the full second the recede/fade takes; the arriving page then reveals
 * itself via its own `clip-path` — a bottom-anchored wipe, pinned corners
 * at the bottom, top corners rising into place — while settling out of the
 * mirrored scale/rotate/slide pose.
 *
 * This component is driven entirely by TransitionContext's `mode` state
 * machine (see src/context/TransitionContext.tsx). It doesn't decide when
 * to navigate — TransitionLink calls `requestTransition(href)` on click,
 * which flips mode to "covering"; everything below reacts to that.
 *
 *   idle       → no overlay, normal page.
 *   covering   → current page recedes (scale/rotate/slide) while the
 *                curtain panel fades in over it, both running the full 1s.
 *                router.push() ALREADY fired the instant the click
 *                happened — see TransitionContext.requestTransition — so
 *                the destination route has this entire second to load in
 *                the background while the OLD page is still what's on
 *                screen. → mode: "covered" once the recede/fade finishes.
 *   covered    → waiting for the ACTUAL new route to be ready before
 *                revealing it — see "Two-stage ready check" below. Since
 *                loading started a full second earlier (not after reaching
 *                this state), this is usually near-instant now instead of
 *                a visible hold.
 *   uncovering → curtain is hidden immediately; the new page reveals
 *                itself via its own clip-path wipe while settling out of
 *                its receded pose. Back to "idle" once that finishes.
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

  // covering → current page recedes while the curtain fades in over it.
  // The real navigation already fired back in requestTransition() the
  // instant the click happened (see the two-stage ready check above for
  // why) — this effect no longer starts it, just plays the recede/fade and
  // flips to "covered" once that's done.
  useEffect(() => {
    if (mode !== "covering") return;
    const content = contentRef.current;
    const curtain = curtainRef.current;
    if (!content || !curtain) return;

    const tl = gsap.timeline({
      onComplete: () => setMode("covered"),
    });

    // `content` wraps the whole routed page (not just the viewport) — on a
    // long page a plain "50% 50%" transform-origin pivots from the middle
    // of the FULL page rather than the middle of what's actually on screen,
    // which flashes unrelated sections into view mid-tween (same bug as
    // `.content-area`'s recede effect in Header.tsx — see the comment
    // there for the full writeup and how this was diagnosed).
    const originY = window.innerHeight / 2 - getUntransformedViewportTop(content);

    tl.set(curtain, {
      autoAlpha: 0,
      pointerEvents: "auto",
    })
      .set(content, { transformOrigin: `50% ${originY}px` })
      // Both run the full 1s, starting together — exact match for exoape's
      // own leave hook: the page-root tween (scale/rotate/y) and the
      // firstChild opacity fade run in parallel on the SAME duration and
      // ease, no stagger. An earlier version delayed the fade to start at
      // 0.3s with a different (power2.out) ease and held an extra 0.15s
      // afterward — neither is in their real code, so both are gone.
      .to(content, { scale: 1.3, rotate: -7, y: "-50vh", duration: 1, ease: PAGE_RECEDE_EASE }, 0)
      .to(curtain, { autoAlpha: 1, duration: 1, ease: PAGE_RECEDE_EASE }, 0);

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
    // late, which is exactly the "frozen mid-fade with the old page still
    // faintly bleeding through" look reported (and reproduced here).
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
  // fonts/images/DOM to actually be paintable, before revealing it.
  useEffect(() => {
    if (mode !== "covered") return;
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
    if (mode !== "covered" || !isPending) return;
    const t = setTimeout(() => {
      waitForPageReady().then(() => setMode("uncovering"));
    }, MAX_PENDING_WAIT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPending]);

  // uncovering → curtain is hidden immediately (exoape's real enter hook
  // sets the entering page's own z-index above everything else and reveals
  // IT via clip-path — there's no separate curtain layer wiping away on
  // their site at all). `content` settles out of its receded pose while
  // clip-path grows from a bottom-anchored sliver to the full rect,
  // revealing the new page underneath its own wipe.
  useEffect(() => {
    if (mode !== "uncovering") return;
    const content = contentRef.current;
    const curtain = curtainRef.current;
    if (!content || !curtain) return;

    gsap.set(curtain, { autoAlpha: 0, pointerEvents: "none" });

    // Reset to the "just arrived" pose before revealing — the mirror image
    // of the leave tween above (130% -> 100%, +7deg -> 0, +50vh -> 0),
    // exoape's own "enter" motion. Set explicitly rather than continuing
    // from wherever the leave tween left off, since covering's outgoing
    // pose (rotate:-7) and this incoming one (rotate:+7) are opposite signs.
    // Same viewport-center transform-origin fix as the covering effect
    // above. `content` is still sitting at the leave tween's final pose
    // (scale 1.3, rotate -7, y -50vh) at this point, but offsetTop-based
    // measurement is unaffected by that (or any) CSS transform, so it
    // reads the correct untransformed position regardless.
    const originY = window.innerHeight / 2 - getUntransformedViewportTop(content);

    gsap.set(content, {
      autoAlpha: 1,
      transformOrigin: `50% ${originY}px`,
      scale: 1.3,
      rotate: 7,
      y: "50vh",
      clipPath: PAGE_REVEAL_CLIP_FROM,
    });
    const tween = gsap.to(content, {
      scale: 1,
      rotate: 0,
      y: 0,
      clipPath: PAGE_REVEAL_CLIP_TO,
      duration: 1,
      ease: PAGE_RECEDE_EASE,
      clearProps: "transform,transformOrigin,clipPath",
      onComplete: () => {
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
        <span
          className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          7th heaven
        </span>
      </div>
    </>
  );
}
