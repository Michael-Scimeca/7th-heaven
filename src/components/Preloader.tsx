"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";

// Diagonal wipe-reveal preloader, sharing its visual language with the
// page-to-page curtain (PageTransition.tsx): a dark overlay, the loader
// content holding center, then the same decaying-slant diagonal edge
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
// (the content fade-out, then the wipe) can still get orphaned -- the same
// class of bug found and fixed in PageTransition.tsx, where a tween whose
// onComplete never fires (rAF throttling in a backgrounded tab, a slow
// initial script evaluation, etc.) leaves whatever it was gating stuck
// forever. Here that means the `is-preloading` class never gets removed and
// the whole site stays hidden behind the overlay. A HARD_CEILING_MS watchdog
// force-finishes the sequence no matter what stalls, so the worst case is a
// skipped/cut-short animation, never a frozen site.
//
// Loader content: a bobbing music-note icon, small notes rising past it, and
// a bar that fills once while sweeping through the brand palette (plus a
// moving highlight streak) -- built and iterated as a standalone prototype
// before being ported in here. Driven by plain CSS animations + a couple of
// setTimeouts rather than GSAP, matching how it was prototyped; only the
// pre-existing content-fade -> wipe handoff below still goes through GSAP,
// unchanged from before.
type Phase = "loading" | "wiping" | "done";

const WIPE_DURATION = 1.0;
const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const WIPE_SLANT_RATIO = 0.095;

// Loader fill: cycles through every color once, then hands off to the
// existing fade -> wipe chain below.
const LOADER_PALETTE = ["#5f3fb1", "#850FB7", "#A43E17", "#a73373", "#611EBD"];
const LOADER_STEP_MS = 400; // how long each color holds
const LOADER_TOTAL_MS = LOADER_STEP_MS * LOADER_PALETTE.length; // full single-pass fill time

// Loader fill (LOADER_TOTAL_MS) + content fade-out (0.3s) + wipe (1.0s) is
// the happy path. Give it a generous multiple of that before force-finishing.
const HARD_CEILING_MS = 6000;

// Shared with PageTransition.tsx so the preloader and every in-site
// navigation after it read as the same curtain, not two different overlays.
export const CURTAIN_BG = "rgb(13, 14, 19)";

function shouldSkip(): boolean {
  return false;
}

// A single rising note particle, matching the standalone prototype: a small
// dingle.svg-shaped note that fades in, drifts up and sideways, and removes
// itself. Kept as plain DOM manipulation (not React state) since particles
// are purely decorative and spawn/despawn far more often than a re-render
// budget should be spent on.
const NOTE_ASPECT = 11.85 / 7.29; // dingle.svg's height / width, so particles keep its proportions
const NOTE_SVG_MARKUP =
  '<svg viewBox="0 0 7.29 11.85" fill="currentColor" aria-hidden="true">' +
  '<path d="M3.75,10.12c0,1.24-1.48,2-2.72,1.64-.75-.22-1.18-.78-.97-1.55.39-1.06,1.69-1.53,2.75-1.19V.43C2.8.15,3.16-.01,3.34,0c.17.27.36.45.57.66.6.53,1.22.99,1.88,1.45.85.59,1.43,1.48,1.5,2.55-.33-.48-.65-.92-1.05-1.32-.37-.37-.76-.68-1.22-.93-.39-.2-.81-.34-1.25-.37l-.02,8.08Z"/>' +
  "</svg>";

export default function Preloader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>(() => (shouldSkip() ? "done" : "loading"));
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loaderWrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

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
          const clipVal = buildDecayingSlantClipPath(proxy.p, WIPE_SLANT_RATIO);
          overlay.style.clipPath = clipVal;
          (overlay.style as any).webkitClipPath = clipVal;
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

    const advanceToWipe = () => {
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
    };

    // -- Loader animation: bar fill + color cycle + rising note particles --
    const colorTimeouts: ReturnType<typeof setTimeout>[] = [];
    const particleTimeouts: ReturnType<typeof setTimeout>[] = [];
    let particleInterval: ReturnType<typeof setInterval> | null = null;
    let loaderDoneTimeout: ReturnType<typeof setTimeout> | null = null;

    const spawnParticle = () => {
      if (cancelled || finished) return;
      const stage = particlesRef.current;
      if (!stage) return;

      const note = document.createElement("span");
      note.className = "preloader-note-particle";
      note.innerHTML = NOTE_SVG_MARKUP;

      const startX = 10 + Math.random() * 80;
      const drift = (Math.random() - 0.5) * 55;
      const size = 10 + Math.random() * 12;
      const duration = 1.5 + Math.random() * 1.3;

      note.style.left = startX + "%";
      note.style.width = size + "px";
      note.style.height = size * NOTE_ASPECT + "px";
      note.style.setProperty("--pc-drift", drift + "px");
      note.style.animationDuration = duration + "s";

      stage.appendChild(note);
      particleTimeouts.push(
        setTimeout(() => {
          note.remove();
        }, duration * 1000 + 60)
      );
    };

    const wrap = loaderWrapRef.current;
    const bar = barRef.current;
    if (wrap && bar) {
      wrap.style.setProperty("--pc", LOADER_PALETTE[0]);

      bar.style.animationDuration = LOADER_TOTAL_MS + "ms";
      bar.classList.remove("filling");
      void bar.offsetWidth; // force reflow so the fill starts from 0%
      bar.classList.add("filling");

      for (let i = 1; i < LOADER_PALETTE.length; i++) {
        colorTimeouts.push(
          setTimeout(() => {
            if (!finished) wrap.style.setProperty("--pc", LOADER_PALETTE[i]);
          }, i * LOADER_STEP_MS)
        );
      }

      particleInterval = setInterval(spawnParticle, 160);
      for (let i = 0; i < 8; i++) {
        particleTimeouts.push(setTimeout(spawnParticle, i * 80));
      }

      loaderDoneTimeout = setTimeout(() => {
        if (particleInterval) clearInterval(particleInterval);
        wrap.classList.add("done"); // fades the bar track + trailing dot
        advanceToWipe();
      }, LOADER_TOTAL_MS);
    } else {
      // Refs not ready for some reason -- don't hang the site on a missing element.
      advanceToWipe();
    }

    // Watchdog: if the loader-fill -> fade -> wipe chain hasn't finished
    // within a generous bound, force it through instead of leaving the whole
    // site hidden behind the overlay forever.
    const watchdog = setTimeout(() => {
      if (cancelled || finished) return;
      if (particleInterval) clearInterval(particleInterval);
      if (loaderDoneTimeout) clearTimeout(loaderDoneTimeout);
      wipeTween?.kill();
      finish();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("preloader-complete"));
      }
    }, HARD_CEILING_MS);

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      if (loaderDoneTimeout) clearTimeout(loaderDoneTimeout);
      if (particleInterval) clearInterval(particleInterval);
      colorTimeouts.forEach(clearTimeout);
      particleTimeouts.forEach(clearTimeout);
      wipeTween?.kill();
      // Deliberately NOT calling unlockScroll() here. This component lives
      // once at the root layout and never unmounts during normal app
      // life, so the only time this cleanup fires is React StrictMode's
      // dev-only mount -> cleanup -> mount double-invoke. If it removed
      // the "is-preloading" class, the second (real) mount's own guard
      // above (`if (!html.classList.contains("is-preloading"))`) would
      // immediately see the class already gone and bail straight to
      // "done" -- skipping the entire animation before it ever paints a
      // frame, every single time, in dev. Actually finishing (wipe
      // onComplete, or the watchdog) is the only thing that should strip
      // the class -- both already go through finish() -> unlockScroll().
    };
  }, []);

  if (pathname?.startsWith("/studio") || phase === "done") return null;

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
      }}>
      <div
        ref={contentRef}
        className="preloader-content flex flex-col items-center justify-center text-center select-none z-10">
        <div ref={loaderWrapRef} className="preloader-loader">
          <svg
            className="preloader-note-icon"
            viewBox="0 0 9.06 11.45"
            width="40"
            height="51"
            fill="currentColor"
            aria-hidden="true">
            <path d="M1.75,11.45h-.47c-.42-.06-.82-.22-1.1-.56-.26-.4-.23-.92.07-1.32.52-.69,1.45-.96,2.3-.7V1.05s6.52-1.05,6.52-1.05v8.83c-.02.43-.19.78-.51,1.07-.86.72-2.41.74-2.88-.34-.11-.39-.02-.8.24-1.12.54-.65,1.44-.9,2.28-.65V2.48s-4.77.87-4.77.87l-.02,6.51c0,.92-.82,1.47-1.66,1.59Z" />
          </svg>

          <div ref={particlesRef} className="preloader-particles" />

          <div className="preloader-bar-track">
            <div ref={barRef} className="preloader-bar-fill">
              <div className="preloader-bar-shine" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preloader-loader {
          position: relative;
          width: min(60vw, 320px);
        }

        .preloader-note-icon {
          position: absolute;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          color: var(--pc, #850fb7);
          filter: drop-shadow(0 0 6px var(--pc, #850fb7))
            drop-shadow(0 0 18px color-mix(in srgb, var(--pc, #850fb7) 70%, transparent))
            drop-shadow(0 0 34px color-mix(in srgb, var(--pc, #850fb7) 45%, transparent));
          animation: preloader-bob 1.7s ease-in-out infinite;
          transition: color 0.35s linear;
        }

        @keyframes preloader-bob {
          0%,
          100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-7px);
          }
        }

        .preloader-particles {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 30px;
          height: 150px;
          pointer-events: none;
        }

        :global(.preloader-note-particle) {
          position: absolute;
          bottom: 0;
          color: var(--pc, #850fb7);
          filter: drop-shadow(0 0 4px var(--pc, #850fb7))
            drop-shadow(0 0 10px color-mix(in srgb, var(--pc, #850fb7) 70%, transparent));
          opacity: 0;
          animation-name: preloader-rise;
          animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1);
          animation-fill-mode: forwards;
        }

        :global(.preloader-note-particle svg) {
          display: block;
          width: 100%;
          height: 100%;
        }

        @keyframes preloader-rise {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4);
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--pc-drift, -10px), -130px) scale(1);
          }
        }

        .preloader-bar-track {
          position: relative;
          height: 2px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
          overflow: visible;
          transition: opacity 0.5s ease;
        }

        .preloader-loader.done .preloader-bar-track {
          opacity: 0;
        }

        .preloader-bar-fill {
          position: absolute;
          inset: 0;
          width: 0%;
          border-radius: 10px;
          overflow: visible;
          background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--pc, #850fb7) 30%, transparent),
            var(--pc, #850fb7)
          );
          transition: background 0.35s linear;
        }

        .preloader-bar-fill.filling {
          animation: preloader-fill linear forwards;
        }

        @keyframes preloader-fill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        /* Moving gradient sweep: a fixed-width streak clipped to whatever is
           currently filled, kept separate from .preloader-bar-fill's own
           (resizing) box so its speed and width stay constant instead of
           scaling with the growing bar. */
        .preloader-bar-shine {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
          pointer-events: none;
        }

        .preloader-bar-shine::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 50px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.85) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
        }

        .preloader-bar-fill.filling .preloader-bar-shine::before {
          animation: preloader-shine 1.15s linear infinite;
        }

        @keyframes preloader-shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(800%);
          }
        }

        .preloader-bar-fill::after {
          content: "";
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--pc, #850fb7) 70%, white 30%);
          transition: background 0.35s linear;
        }

        .preloader-loader.done .preloader-bar-fill::after {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
      `}</style>
    </div>
  );
}
