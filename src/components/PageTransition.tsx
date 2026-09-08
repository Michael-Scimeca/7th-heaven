"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import Logo from "@/components/Logo";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { useTransition } from "@/context/TransitionContext";

// Speed / easing / slant-ratio / direction all tuned live on the
// /preloaders sandbox (dial each knob against an instant replay) and
// ported over once they felt right:
//  - WIPE_SLANT_RATIO: bumped from the raw exoape-measured 0.095 to 0.18
//    for a clearly visible diagonal instead of a subtle one.
//  - EXIT_DURATION / REVEAL_DURATION: the old page's exit and the new
//    page's reveal now start at the exact same moment (Phase 1 fires the
//    exit immediately; Phase 2 starts the reveal the instant the route
//    commits -- see the Phase 2 comment below for why it can't literally
//    be frame 0), but the reveal always runs a fixed 0.25s SLOWER than
//    the exit, so the new page visibly "chases" and covers the old one
//    instead of the two just swapping. Settled on 0.55s exit / 0.80s
//    reveal after live A/B'ing speeds in the sandbox -- fast enough to
//    feel snappy, slow enough that the slant reveal actually reads.
//  - TRANSITION_EASE: exoape's real EXO_EASE curve
//    (cubic-bezier(0.496, 0.004, 0, 1)) is extremely front-loaded (~85% of
//    its progress lands in the first 50% of elapsed time), which squeezed
//    the whole decaying-slant sweep into an imperceptible sliver of real
//    time -- it read as a flat pop instead of a slant. Went through
//    expo.out first, then settled on circ.out after further live sandbox
//    comparison -- still a hard deceleration into the landing, but with
//    a rounder, less abrupt initial burst that reads smoother at the
//    slower 0.55s/0.80s durations above.
//  - The incoming page no longer scales during its reveal (was 1.3 -> 1,
//    matching the old page's own exit zoom) -- live sandbox testing
//    showed the scale mostly disappears under the clip-path mask anyway
//    (it decays in lockstep with the reveal) and reads as an unwanted
//    zoom on the rare frames it IS visible. The reveal is now a straight
//    slide-up + slanted clip-path wipe, no scale. The old page's own
//    exit keeps its 1.3x zoom-away scale -- that's a different, still-
//    wanted "flies off camera" effect for the page leaving, not the one
//    arriving.
//  - The old page's exit also travels 30px further up (-windowHeight/2 -
//    30 instead of -windowHeight/2) so it visibly clears the frame
//    before the reveal catches up, instead of the two potentially still
//    overlapping right at the handoff.
//  - Direction: the slant now leads from the LEFT edge instead of the
//    right (mirrored via the local buildIncomingRevealClipPath /
//    buildOutgoingExitClipPath below) -- chosen after comparing both
//    directions live in the sandbox. @/lib/curtainClipPath's
//    buildDecayingSlantCoverClipPath (right-leads, measured directly off
//    exoape's footage) is left untouched for reference/rollback.
const WIPE_SLANT_RATIO = 0.18;
const FAILSAFE_MS = 3000;
const CURTAIN_BG = "rgb(13, 14, 19)";

const TRANSITION_EASE = "circ.out";
const EXIT_DURATION = 0.55;
// Always a fixed quarter-second slower than the exit -- see the comment
// block above for why this is what actually makes the new page read as
// "covering" the old one instead of just replacing it.
const REVEAL_DURATION = EXIT_DURATION + 0.25;

// Local, flipped mirror of @/lib/curtainClipPath's buildDecayingSlantCoverClipPath
// (left edge leads instead of right). The verified, measured-from-video
// helper is left untouched; this mirrored version -- and its complement
// below -- are scoped to this component only.
function buildIncomingRevealClipPath(progress: number, ratio: number, rampFraction = 0.05): string {
  const p = Math.min(1, Math.max(0, progress));
  const rightY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leftY = rightY / (1 + rampedRatio);
  return `polygon(0% ${leftY}%, 100% ${rightY}%, 100% 100%, 0% 100%)`;
}

// Complement of buildIncomingRevealClipPath, for the outgoing snapshot's
// own exit: carves the visible region down from the top instead of
// revealing it from the bottom, along the exact same diagonal, so both
// halves of the transition read as one continuous move instead of two
// unrelated animations.
function buildOutgoingExitClipPath(progress: number, ratio: number, rampFraction = 0.05): string {
  const p = Math.min(1, Math.max(0, progress));
  const lagY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = lagY / (1 + rampedRatio);
  return `polygon(0% 0%, 100% 0%, 100% ${lagY}%, 0% ${leadY}%)`;
}

function shouldSkip(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.location.search.includes("bypass=true")
  );
}

function pathOf(href: string): string {
  if (typeof window === "undefined") return href.split(/[?#]/)[0];
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split(/[?#]/)[0];
  }
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, pendingHref, setMode, clearPendingHref } = useTransition();

  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const contentTweenRef = useRef<gsap.core.Tween | null>(null);
  // Tracks which pendingHref Phase 2 has already started revealing, so the
  // reveal race is only ever kicked off once per navigation. See the long
  // comment on the Phase 2 effect below for why this can't just be a
  // mode !== "covered" check in the dependency array.
  const revealStartedForRef = useRef<string | null>(null);
  // Tracks the outgoing snapshot's own tweens (snapshotInner + overlay),
  // which are NOT covered by tweenRef/contentTweenRef (those are Phase 2's
  // reveal tweens). Found the hard way: if a transition never reaches its
  // own onComplete (rAF starved, tab backgrounded, a slow/first-compile dev
  // route, anything), these two tweens are orphaned -- GSAP keeps ticking
  // them forever, which keeps their detached, full-page-clone target nodes
  // alive and off the DOM but never garbage collected. Every subsequent
  // navigation piles on two more forever-running tweens plus another full
  // clone, and GSAP has to walk the whole growing pile every frame -- a
  // compounding leak. Measured directly: successive navigations in one tab
  // went from ~1s to ~13s to ~29s before a "renderer may be frozen" CDP
  // timeout, tracking almost exactly with this pile growing by two tweens
  // each click. Killed explicitly below (new transition start + watchdog)
  // instead of trusting onComplete to always fire.
  const outgoingTweensRef = useRef<gsap.core.Tween[]>([]);

  // Line-by-Line 1:1 Implementation of Exo Ape Production Module 464 (6f3a20d.js)
  //
  // Two phases, split across two effects, because they're gated on two
  // different things:
  //
  //   Phase 1 ("covering"): fires once per request. Snapshots the outgoing
  //   page, hides + pre-scales the incoming page so it's invisible from its
  //   very first frame, fires the real navigation, and flies the outgoing
  //   snapshot away. Ends by handing off to "covered" -- it does NOT reveal
  //   anything itself.
  //
  //   Phase 2 ("covered" -> "uncovering"): only starts once usePathname()
  //   actually reflects the destination route. That's the real signal that
  //   Next has committed the navigation and mounted the new page -- not a
  //   fixed delay. Revealing before that would mean the reveal animation
  //   plays *while* React is still mounting the destination page, fighting
  //   it for main-thread time (visible as stutter), and on a slow route it
  //   would uncover over content that isn't there yet. waitForPageReady()
  //   adds a second, finer check on top (fonts + real text painted), bounded
  //   by FAILSAFE_MS so a route that never settles can't hang the curtain
  //   open forever.
  //
  // Header.tsx and Footer.tsx already key off mode === "covered" (nav
  // highlight / hiding the footer while fully covered) -- this is what
  // actually drives mode through that state instead of skipping it.
  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;

    document.documentElement.classList.add("is-page-transitioning");

    // Pause Lenis smooth scroll during transition
    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch {}
    }

    if (shouldSkip()) {
      // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
      router.push(pendingHref);
      clearPendingHref();
      setMode("idle");
      return;
    }

    tweenRef.current?.kill();
    contentTweenRef.current?.kill();
    // Kill any outgoing-snapshot tweens orphaned by a previous transition
    // that never reached its own onComplete (see the long comment on
    // outgoingTweensRef above), then sweep for any leftover snapshot DOM
    // those orphaned tweens were still targeting. MUST run before the new
    // snapshot below is created/appended -- this exact ordering bug shipped
    // once already: putting this sweep AFTER creating this run's own
    // snapshotOuter meant the querySelectorAll(".exoape-snapshot-outer")
    // below matched and immediately deleted the snapshot THIS transition
    // had just appended two lines earlier, since it carries the same class.
    // Net effect: the outgoing tween still ran, but against a detached node
    // already off the DOM, so the wipe was invisible and navigation looked
    // like an instant, unanimated cut -- exactly what happened when this
    // was tested live after the leak fix shipped.
    outgoingTweensRef.current.forEach((t) => t.kill());
    outgoingTweensRef.current = [];
    document.querySelectorAll(".exoape-snapshot-inner, .exoape-snapshot-overlay").forEach((el) => {
      gsap.killTweensOf(el);
    });
    document.querySelectorAll(".exoape-snapshot-outer").forEach((node) => node.remove());

    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    // 1. Snapshot OUTGOING page outer wrapper (z-index: 9991)
    const snapshotOuter = document.createElement("div");
    snapshotOuter.className = "exoape-snapshot-outer";
    snapshotOuter.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9991;
      pointer-events: none;
      overflow: hidden;
      background-color: ${CURTAIN_BG};
    `;

    const snapshotInner = document.createElement("div");
    snapshotInner.className = "exoape-snapshot-inner";
    snapshotInner.style.cssText = `
      width: 100%;
      min-height: 100vh;
      transform-origin: center center;
    `;

    const snapshotOverlay = document.createElement("div");
    snapshotOverlay.className = "exoape-snapshot-overlay";
    snapshotOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 10;
      background-color: rgba(13, 14, 19, 0.45);
      pointer-events: none;
      opacity: 0;
    `;

    if (contentRef.current) {
      const clone = contentRef.current.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      // Strip any live iframes (Google Maps' TourMap embed, currently the
      // only one on the site) out of the clone before it's appended.
      // cloneNode(true) copies iframe elements' attributes including src,
      // but an iframe clone does NOT inherit its source document's loaded
      // state -- the browser treats it as a brand-new browsing context
      // and starts loading/initializing it independently the moment the
      // clone is inserted into the DOM. Confirmed live: iframe count on
      // the page goes 1 -> 2 the instant this snapshot is appended, and
      // that second Maps instance spinning up is what Chrome's Long Tasks
      // API was flagging as a ~300-600ms "multiple-contexts" block on
      // every single navigation away from a page with the map on it --
      // entirely wasted work, since this snapshot is a frozen visual
      // that's about to wipe off-screen in well under a second and was
      // never meant to be a second live, interactive map.
      clone.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
      snapshotInner.appendChild(clone);
    }
    snapshotOuter.appendChild(snapshotInner);
    snapshotOuter.appendChild(snapshotOverlay);
    document.body.appendChild(snapshotOuter);

    const duration = EXIT_DURATION;
    const ease = TRANSITION_EASE;

    // Fresh navigation -- clear any stale "already revealed" marker from a
    // previous transition so Phase 2 is free to run again for this href.
    revealStartedForRef.current = null;

    // Hide + pre-position the incoming page BEFORE it exists (synchronously,
    // no tween) so whatever router.push is about to mount underneath the
    // outgoing snapshot is invisible from the very first frame, however long
    // Phase 2 ends up waiting.
    //
    // No rotate here: frame-by-frame analysis of the real exoape.com wipe
    // (both the fixed header and the incoming content itself) shows the
    // page never actually tilts as a rigid shape -- the diagonal look comes
    // entirely from the clip-path's own shallow, decaying slant below. A
    // rotate() on top of that clip-path was what made the transition read
    // as "swinging" left/right instead of sliding straight up.
    if (outerRef.current) {
      outerRef.current.style.position = "fixed";
      outerRef.current.style.inset = "0";
      outerRef.current.style.zIndex = "9992";
      outerRef.current.style.overflow = "hidden";
      outerRef.current.style.willChange = "clip-path";
      outerRef.current.style.clipPath = buildIncomingRevealClipPath(0, WIPE_SLANT_RATIO);
    }
    if (contentRef.current) {
      contentRef.current.style.willChange = "transform";
      gsap.set(contentRef.current, {
        y: windowHeight / 2,
        transformOrigin: "center center",
      });
    }

    // 2. Perform client-side route push
    //
    // Tried delaying this until the exit-wipe's own onComplete (so the
    // expensive React/Next unmount-mount swap wouldn't compete with the
    // wipe tween's rAF ticks for the main thread). Measured live and
    // reverted: the stutter wasn't actually caused by that overlap --
    // live profiling (iframe-count sampling + Long Tasks) showed the same
    // ~0.8-1.8s of main-thread blocking on EVERY navigation regardless of
    // when push fired, scaling with the size of the page's DOM tree (a
    // 603-node page transition blocks for ~0.8s, Home's 2339-node tree
    // for ~1.5-1.8s) -- i.e. it's inherent React reconciliation cost, not
    // something ordering push around can dodge. Delaying it only added a
    // real downside (URL/history updates later, feels less responsive)
    // with no measured upside, so it's back to firing immediately here.
    // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
    router.push(pendingHref);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    // Outgoing Inner Motion (Module 464 leave):
    // scale: 1 -> 1.3, y: 0 -> -(window.innerHeight / 2 + 30) (no rotate --
    // see note above). The extra 30px is so the old page visibly clears
    // the frame before the incoming reveal catches up to it.
    // Runs immediately -- it's animating a detached snapshot clone, so it
    // never has to wait on the incoming page.
    snapshotInner.style.willChange = "transform";
    const outgoingInnerTween = gsap.fromTo(
      snapshotInner,
      { scale: 1, y: 0 },
      {
        scale: 1.3,
        y: -windowHeight / 2 - 30,
        duration,
        ease,
        // Wipes the outgoing snapshot off along the same decaying-slant
        // diagonal the incoming reveal uses below, so the whole transition
        // reads as one continuous move instead of two unrelated animations.
        onUpdate: function () {
          snapshotInner.style.clipPath = buildOutgoingExitClipPath(this.progress(), WIPE_SLANT_RATIO);
        },
        onComplete: () => {
          if (snapshotOuter.parentNode) {
            snapshotOuter.parentNode.removeChild(snapshotOuter);
          }
        },
      }
    );

    // Outgoing Backdrop Overlay (Module 464 leave t.firstChild autoAlpha):
    const outgoingOverlayTween = gsap.fromTo(
      snapshotOverlay,
      { opacity: 0 },
      {
        opacity: 1,
        duration,
        ease,
      }
    );

    outgoingTweensRef.current = [outgoingInnerTween, outgoingOverlayTween];

    // Hand off to Phase 2 -- it picks up once usePathname() matches pendingHref.
    setMode("covered");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pendingHref]);

  // Phase 2: reveal only once the destination route has actually been
  // committed (pathname matches) -- see the long comment above Phase 1.
  //
  // Deliberately NOT keyed on `mode` in the dependency array. This effect
  // calls setMode("uncovering") itself, and that state update -- if `mode`
  // were a dependency -- would cause React to re-run this very effect
  // (cleanup then re-fire) as soon as the re-render commits, almost
  // immediately and well before the async waitForPageReady()/FAILSAFE_MS
  // race below ever resolves. The cleanup sets `cancelled = true` on the
  // ORIGINAL closure, so by the time that original race resolved it always
  // bailed out silently -- the reveal tween never ran, the clip-path stayed
  // pinned at its fully-covered state, and the page was left permanently
  // blank under the curtain. (Caught live on /book: the console trace
  // showed "GATE PASSED" immediately followed by the effect re-running with
  // mode: "uncovering", then "race resolved { cancelled: true }".)
  // revealStartedForRef guards against double-starting the reveal for the
  // same navigation without needing `mode` as a dependency.
  useEffect(() => {
    if (!pendingHref) return;
    if (pathname !== pathOf(pendingHref)) return;
    if (revealStartedForRef.current === pendingHref) return;
    revealStartedForRef.current = pendingHref;

    let cancelled = false;
    setMode("uncovering");

    const duration = REVEAL_DURATION;
    const ease = TRANSITION_EASE;
    const failsafe = new Promise<void>((resolve) => setTimeout(resolve, FAILSAFE_MS));

    Promise.race([waitForPageReady(), failsafe]).then(() => {
      if (cancelled) return;

      // Incoming Inner Motion (Module 464 enter, scale removed):
      // y: window.innerHeight / 2 -> 0, no scale (straight slide-up, see
      // header comment for why the zoom was dropped) and no rotate (see
      // note on Phase 1).
      if (contentRef.current) {
        contentTweenRef.current = gsap.to(contentRef.current, {
          y: 0,
          duration,
          ease,
          clearProps: "all",
        });
      }

      // Incoming Outer ClipPath Sweep (Module 464 enter clipPath):
      // polygon(0% 100%, 100% 110%, 100% 100%, 0% 100%) -> polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)
      const proxy = { p: 0 };
      tweenRef.current = gsap.to(proxy, {
        p: 1,
        duration,
        ease,
        onUpdate: () => {
          if (outerRef.current) {
            outerRef.current.style.clipPath = buildIncomingRevealClipPath(proxy.p, WIPE_SLANT_RATIO);
          }
        },
        onComplete: () => {
          document.documentElement.classList.remove("is-page-transitioning");
          if (outerRef.current) {
            outerRef.current.style.position = "";
            outerRef.current.style.inset = "";
            outerRef.current.style.zIndex = "";
            outerRef.current.style.overflow = "";
            outerRef.current.style.clipPath = "none";
            outerRef.current.style.willChange = "";
          }
          if (contentRef.current) {
            gsap.set(contentRef.current, { clearProps: "all" });
          }
          if (typeof window !== "undefined" && (window as any).__lenis) {
            try {
              (window as any).__lenis.start();
              (window as any).__lenis.resize();
            } catch {}
          }
          revealStartedForRef.current = null;
          clearPendingHref();
          setMode("idle");
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingHref, pathname]);

  // Watchdog: if a transition doesn't reach "idle" within a generous bound,
  // something went wrong -- a tween never got a chance to tick (tab was
  // backgrounded mid-transition), an exception was thrown, or the
  // destination route never became ready -- and `mode` is stuck somewhere
  // other than "idle". TransitionContext's requestTransition() no-ops
  // unless mode === "idle" (by design, to stop two transitions racing),
  // so a stuck mode silently breaks EVERY future nav-link click with zero
  // visual feedback: preventDefault() still fires, but nothing after it
  // ever runs. Reproduced directly: leaving a transition to freeze mid-flight
  // (GSAP's rAF-driven ticker never advances in a backgrounded tab) left
  // is-page-transitioning permanently set and every subsequent click a
  // total no-op, exactly matching "nothing happens on navigation" -- and
  // only a full page reload (which resets React state) recovered it. This
  // timer is a last-resort reset so one bad transition can't permanently
  // wedge navigation until the user reloads.
  useEffect(() => {
    if (mode === "idle") return;
    const watchdogMs = FAILSAFE_MS + (EXIT_DURATION + REVEAL_DURATION) * 1000 + 1000;
    const id = setTimeout(() => {
      tweenRef.current?.kill();
      contentTweenRef.current?.kill();
      outgoingTweensRef.current.forEach((t) => t.kill());
      outgoingTweensRef.current = [];
      document.querySelectorAll(".exoape-snapshot-inner, .exoape-snapshot-overlay").forEach((el) => {
        gsap.killTweensOf(el);
      });
      document.querySelectorAll(".exoape-snapshot-outer").forEach((node) => node.remove());
      document.documentElement.classList.remove("is-page-transitioning");
      if (outerRef.current) {
        outerRef.current.style.position = "";
        outerRef.current.style.inset = "";
        outerRef.current.style.zIndex = "";
        outerRef.current.style.overflow = "";
        outerRef.current.style.clipPath = "none";
        outerRef.current.style.willChange = "";
      }
      if (contentRef.current) {
        gsap.set(contentRef.current, { clearProps: "all" });
      }
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
      revealStartedForRef.current = null;
      clearPendingHref();
      setMode("idle");
    }, watchdogMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Document-wide link interception
  const { requestTransition } = useTransition();
  const requestTransitionRef = useRef(requestTransition);
  useEffect(() => {
    requestTransitionRef.current = requestTransition;
  }, [requestTransition]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>("a[href]");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
      if (target.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (href === currentPath) return;

      e.preventDefault();
      requestTransitionRef.current(href);
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  return (
    <>
      {/* Persistent backdrop for the whole transition, independent of the
          animated outgoing-snapshot wipe above. Found via screen recording,
          not timing numbers: on a destination page slow to become ready
          (e.g. /book waiting on its availability fetch), the outgoing
          snapshot still finishes its own fixed EXIT_DURATION wipe and
          removes itself on schedule, but Phase 2's reveal (gated on
          waitForPageReady()/FAILSAFE_MS, up to 3s) hadn't started yet --
          `outerRef`'s clip-path was still fully closed, so with nothing at
          z-index 9991 any more, the clipped-away area fell through to
          whatever's normally behind the page (the ambient gradient), i.e. a
          blank flash with zero visual feedback for up to ~2.5s. This sits
          at the same z-index the outgoing snapshot occupies so there's
          never a gap between "snapshot gone" and "reveal started," however
          long the destination page takes. */}
      {mode !== "idle" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9991,
            backgroundColor: CURTAIN_BG,
            pointerEvents: "none",
          }}
        />
      )}
      <div
      ref={outerRef}
      className="exoape-page-outer"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <div
        ref={contentRef}
        className="exoape-page-inner transform-gpu"
        style={{
          width: "100%",
          minHeight: "100vh",
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
    </>
  );
}
