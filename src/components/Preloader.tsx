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
// which held the overlay on screen indefinitely. A fixed timer can't hang.
type Phase = "loading" | "wiping" | "done";

const WIPE_DURATION = 0.8;
const WIPE_EASE = "expo.inOut";
const WIPE_SLANT_RATIO = 0.095;

// Shared with PageTransition.tsx so the preloader and every in-site
// navigation after it read as the same curtain, not two different overlays.
export const CURTAIN_BG = "rgb(13, 14, 19)";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.location.search.includes("bypass=true")
  );
}

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [count, setCount] = useState<number>(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;

    if (!html.classList.contains("is-preloading")) {
      setPhase("done");
      return;
    }

    if (shouldSkip()) {
      html.classList.remove("is-preloading");
      setPhase("done");
      return;
    }

    let cancelled = false;

    // Exo Ape style smooth progress counter 0 -> 100
    const counterProxy = { value: 0 };
    const counterTween = gsap.to(counterProxy, {
      value: 100,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        if (!cancelled) {
          setCount(Math.floor(counterProxy.value));
        }
      },
      onComplete: () => {
        if (cancelled) return;
        setPhase("wiping");

        const overlay = overlayRef.current;
        if (!overlay) {
          html.classList.remove("is-preloading");
          setPhase("done");
          return;
        }

        const proxy = { p: 0 };
        gsap.to(proxy, {
          p: 1,
          duration: WIPE_DURATION,
          ease: WIPE_EASE,
          onUpdate: () => {
            overlay.style.clipPath = buildDecayingSlantClipPath(proxy.p, WIPE_SLANT_RATIO);
          },
          onComplete: () => {
            if (cancelled) return;
            html.classList.remove("is-preloading");
            setPhase("done");
          },
        });
      },
    });

    return () => {
      cancelled = true;
      counterTween.kill();
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
      <div className="flex flex-col items-center justify-center text-center p-6 select-none z-10">
        {/* Brandmark Logo */}
        <div className="mb-4">
          <Logo className="w-24 sm:w-32 h-auto text-white animate-[fade-in_0.4s_ease-out_both]" />
        </div>

        {/* Subtitle */}
        <div className="mb-8">
          <p className="text-[10px] sm:text-xs    font-bold tracking-[0.3em] uppercase text-purple-300/80">
            Digital Experience • 40 Years of Rock
          </p>
        </div>

        {/* Exo Ape Style Numerical Counter */}
        <div className="   font-bold text-4xl sm:text-6xl text-white tracking-tighter tabular-nums drop-shadow-lg">
          {String(count).padStart(2, "0")}<span className="text-purple-400 text-2xl sm:text-3xl ml-0.5">%</span>
        </div>
      </div>
    </div>
  );
}
