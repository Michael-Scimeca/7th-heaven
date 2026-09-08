"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "@/components/Logo";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";

// Diagonal wipe-reveal preloader, sharing its visual language with the
// page-to-page curtain (PageTransition.tsx): a dark overlay, the 7th Heaven
// wordmark holding center, then the same decaying-slant diagonal edge
// wiping it away. Geometry/easing come from
// curtainClipPath.buildDecayingSlantClipPath -- the shape measured directly
// off exoape.com's own preloader (see that function's doc comment, and
// src/app/_to_delete/herointro/page.tsx for the frame-by-frame analysis this
// was reverse-engineered from) rather than guessed.
//
// Runs once per full document load (gated by the `is-preloading` class the
// inline script in layout.tsx adds before paint), never on client-side route
// changes -- those get PageTransition's own curtain instead.
//
// Timer-driven rather than tied to window "load" or asset-readiness events --
// a previous version of this component waited on page-readiness signals that
// didn't always fire (some routes with query params never resolved them),
// which held the overlay on screen indefinitely.
//
// A fixed timer can't hang on its own, but the two GSAP tweens driving it
// (the 0->100 counter, then the wipe) can still get orphaned -- the same
// class of bug found and fixed in PageTransition.tsx, where a tween whose
// onComplete never fires (rAF throttling in a backgrounded tab, a slow
// initial script evaluation, etc.) leaves whatever it was gating stuck
// forever. Here that means the `is-preloading` class never gets removed and
// the whole site stays hidden behind the overlay. A HARD_CEILING_MS watchdog
// force-finishes the sequence no matter what stalls, so the worst case is a
// skipped/cut-short animation, never a frozen site.
type Phase = "loading" | "wiping" | "done";

const WIPE_DURATION = 1.0;
const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const WIPE_SLANT_RATIO = 0.095;

// Counter (1.2s) + content fade-out (0.3s) + wipe (1.0s) = 2.5s in the
// happy path. Give it a generous multiple of that before force-finishing.
const HARD_CEILING_MS = 6000;

// Shared with PageTransition.tsx so the preloader and every in-site
// navigation after it read as the same curtain, not two different overlays.
export const CURTAIN_BG = "rgb(13, 14, 19)";

function shouldSkip(): boolean {
  return true;
}

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>(() => (shouldSkip() ? "done" : "loading"));
  const [count, setCount] = useState<number>(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    let finished = false;

    const unlockScroll = () => {
      html.classList.remove("is-preloading");
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch { }
      }
    };

    // Single, idempotent exit path -- whether reached via the normal
    // wipe-complete callback or the watchdog below, this is the only place
    // that unlocks scroll and flips phase to "done".
    const finish = () => {
      if (finished) return;
      finished = true;
      unlockScroll();
      setPhase("done");
    };

    if (!html.classList.contains("is-preloading") || shouldSkip()) {
      unlockScroll();
      setPhase("done");
      return;
    }

    // Reset scroll to top and pause Lenis while preloading
    window.scrollTo(0, 0);
    if ((window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch { }
    }

    let cancelled = false;
    let wipeTween: gsap.core.Tween | null = null;

    const startWipe = () => {
      if (cancelled) return;
      setPhase("wiping");

      const overlay = overlayRef.current;
      if (!overlay) {
        finish();
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("preloader-wiping"));
      }

      const proxy = { p: 0 };
      wipeTween = gsap.to(proxy, {
        p: 1,
        duration: WIPE_DURATION,
        ease: EXO_EASE,
        onUpdate: () => {
          overlay.style.clipPath = buildDecayingSlantClipPath(proxy.p, WIPE_SLANT_RATIO);
        },
        onComplete: () => {
          if (cancelled) return;
          finish();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("preloader-complete"));
          }
        },
      });
    };

    // Exo Ape style smooth progress counter 0 -> 100%
    const counterProxy = { value: 0 };
    const counterTween = gsap.to(counterProxy, {
      value: 100,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (!cancelled) {
          setCount(Math.floor(counterProxy.value));
        }
      },
      onComplete: () => {
        if (cancelled) return;
        if (contentRef.current) {
          gsap.to(contentRef.current, {
            opacity: 0,
            y: -25,
            duration: 0.3,
            ease: "power2.in",
            onComplete: startWipe,
          });
        } else {
          startWipe();
        }
      },
    });

    // Watchdog: if the counter -> fade -> wipe chain hasn't finished within
    // a generous bound, force it through instead of leaving the whole site
    // hidden behind the overlay forever.
    const watchdog = setTimeout(() => {
      if (cancelled || finished) return;
      counterTween.kill();
      wipeTween?.kill();
      finish();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("preloader-complete"));
      }
    }, HARD_CEILING_MS);

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      counterTween.kill();
      wipeTween?.kill();
      unlockScroll();
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-preloader)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: CURTAIN_BG,
        clipPath: buildDecayingSlantClipPath(0, WIPE_SLANT_RATIO),
        pointerEvents: "none",
      }}
    >
      <div
        ref={contentRef}
        className="preloader-content flex flex-col items-center justify-center text-center p-6 select-none z-10"
      >
        {/* Brandmark Logo */}
        <div className="mb-4">
          <Logo className="w-24 sm:w-32 h-auto text-white animate-[fade-in_0.4s_ease-out_both]" />
        </div>

        {/* Subtitle */}
        <div className="mb-8">
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-purple-300/80">
            Digital Experience • 40 Years of Rock
          </p>
        </div>

        {/* Exo Ape Style Numerical Counter */}
        <div className="font-bold text-4xl sm:text-6xl text-white er tabular-nums drop-shadow-lg">
          {String(count).padStart(2, "0")}<span className="text-purple-400 text-2xl sm:text-3xl ml-0.5">%</span>
        </div>
      </div>
    </div>
  );
}
