"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import Logo from "@/components/Logo";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";
import { waitForPageReady } from "@/lib/waitForPageReady";
import { useTransition } from "@/context/TransitionContext";

// Route-change curtain: covers the viewport with the same diagonal
// decaying-slant wipe as Preloader.tsx (buildDecayingSlantClipPath), swaps
// the route underneath while fully covered, then wipes away once the
// destination is actually ready -- same visual language, same 7th Heaven
// wordmark, as the very first paint.
//
// Single owner of the whole state machine, on purpose. A prior version of
// this feature split "when do we actually navigate / when do we reveal"
// across this component AND TransitionContext, with a separate
// document.startViewTransition() path layered on top of both -- those
// pieces could race each other, which is what caused the flicker/hang bugs
// that got the whole feature pulled (see git history on this file and on
// TransitionContext.tsx). TransitionContext now only holds state
// (mode/pendingHref); every animation frame and the router.push call itself
// happen only here, in response to mode changes -- one clear sequence, not
// several coordinating machines, and no View Transition API in the mix.
//
// Reveal timing is gated on the ACTUAL destination path matching
// usePathname(), not a fixed delay, so a slow route never gets revealed
// over stale content. A hard failsafe timer sits underneath that so a
// route that somehow never resolves can't leave the curtain -- and the
// site -- stuck black forever.
const WIPE_SLANT_RATIO = 0.095;
const COVER_DURATION = 0.5;
const COVER_EASE = "power2.in";
const REVEAL_DURATION = 0.7;
const REVEAL_EASE = "expo.inOut";
const FAILSAFE_MS = 3000;

// Matches Preloader.tsx's CURTAIN_BG -- kept as its own constant rather than
// a shared import so this file has zero dependency on Preloader ever having
// mounted (it hasn't, on a client-side route change).
const CURTAIN_BG = "rgb(13, 14, 19)";

// Exo Ape Custom Ease Curve: cubic-bezier(0.496, 0.004, 0, 1)
const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const TRANSITION_DURATION = 1.0;

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

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const contentTweenRef = useRef<gsap.core.Tween | null>(null);
  const revealingRef = useRef(false);

  const setClip = useCallback((p: number) => {
    if (overlayRef.current) {
      overlayRef.current.style.clipPath = buildDecayingSlantClipPath(p, WIPE_SLANT_RATIO);
    }
  }, []);

  const reveal = useCallback(() => {
    if (revealingRef.current) return;
    revealingRef.current = true;
    tweenRef.current?.kill();

    const finish = () => {
      document.documentElement.classList.remove("is-page-transitioning");
      if (contentRef.current) {
        gsap.set(contentRef.current, { clearProps: "all" });
      }
      clearPendingHref();
      setMode("idle");
    };

    if (shouldSkip()) {
      setClip(1);
      finish();
      return;
    }

    // Exo Ape style incoming page reveal: content resets to identity as clip-path wipes away
    if (contentRef.current) {
      contentTweenRef.current?.kill();
      gsap.set(contentRef.current, {
        scale: 1,
        y: 0,
        rotation: 0,
        opacity: 1,
      });
    }

    const proxy = { p: 0 };
    tweenRef.current = gsap.to(proxy, {
      p: 1,
      duration: TRANSITION_DURATION,
      ease: "power2.inOut",
      onUpdate: () => setClip(proxy.p),
      onComplete: finish,
    });
  }, [clearPendingHref, setClip, setMode]);

  // Phase 1: a transition was requested -- cover, then actually navigate.
  useEffect(() => {
    if (mode !== "covering" || !pendingHref) return;

    revealingRef.current = false;
    document.documentElement.classList.add("is-page-transitioning");

    if (shouldSkip()) {
      setClip(0);
      // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
      router.push(pendingHref);
      setMode("covered");
      return;
    }

    // Exo Ape exact outgoing page exit: scale to 1.30x, rotate +7.0deg & slide downward (+50vh)
    if (contentRef.current) {
      contentTweenRef.current?.kill();
      const halfVh = typeof window !== "undefined" ? window.innerHeight * 0.5 : 370;
      contentTweenRef.current = gsap.to(contentRef.current, {
        scale: 1.3,
        y: halfVh,
        rotation: 7,
        opacity: 1.0,
        duration: TRANSITION_DURATION,
        ease: EXO_EASE,
      });
    }

    const proxy = { p: 1 };
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(proxy, {
      p: 0,
      duration: TRANSITION_DURATION,
      ease: EXO_EASE,
      onUpdate: () => setClip(proxy.p),
      onComplete: () => {
        // eslint-disable-next-line react-doctor/nextjs-no-client-side-redirect
        router.push(pendingHref);
        setMode("covered");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pendingHref]);

  // Phase 2: fully covered -- wait for the destination to actually be the
  // current route AND ready, then wipe away.
  useEffect(() => {
    if (mode !== "covered" || !pendingHref) return;

    let cancelled = false;
    const targetPath = pathOf(pendingHref);

    if (targetPath === pathname) {
      waitForPageReady().then(() => {
        if (!cancelled) reveal();
      });
    }

    const failsafe = setTimeout(() => {
      if (!cancelled) reveal();
    }, FAILSAFE_MS);

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
    };
  }, [mode, pathname, pendingHref, reveal]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
      contentTweenRef.current?.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        id="curtain-primary"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: CURTAIN_BG,
          clipPath: buildDecayingSlantClipPath(1, WIPE_SLANT_RATIO),
          pointerEvents: mode === "idle" ? "none" : "auto",
        }}
      >
        {(mode === "covering" || mode === "covered") && (
          <div className="hvn-page-curtain__mark">
            <Logo className="hvn-page-curtain__logo w-32 h-auto text-white opacity-80 animate-pulse" />
          </div>
        )}
      </div>
      <div ref={contentRef} className={mode !== "idle" ? "transform-gpu" : undefined}>
        {children}
      </div>
    </>
  );
}
