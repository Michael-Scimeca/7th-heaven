"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  buildDecayingSlantClipPath,
  computeViewportOrigin,
} from "@/lib/curtainClipPath";
import {
  waitForPageReady,
  waitForCanvasReady,
  waitForMediaVideosReady,
} from "@/lib/waitForPageReady";

function getPageElement(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return (
    document.querySelector(".exoape-page-inner") ||
    document.querySelector("main") ||
    document.getElementById("main-content")
  ) as HTMLElement | null;
}

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

const WIPE_DURATION = 0.15; // 150ms wipe reveal
const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const WIPE_SLANT_RATIO = 0.095;

// Loader fill: cycles through colors in 100ms total for ultra-fast load
const LOADER_PALETTE = ["#5f3fb1", "#850FB7", "#A43E17", "#a73373", "#611EBD"];
const LOADER_STEP_MS = 20; // 20ms per color step = 100ms total fill time
const LOADER_TOTAL_MS = 100; // 100ms total preloader time

const HARD_CEILING_MS = 2000;

// Shared with PageTransition.tsx so the preloader and every in-site
// navigation after it read as the same curtain, not two different overlays.
export const CURTAIN_BG = "rgb(13, 14, 19)";

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
  const [phase, setPhase] = useState<Phase>("loading");
  const [replayKey, setReplayKey] = useState<number>(0);
  const [scrubProgress, setScrubProgress] = useState<number | null>(null);
  const [scrubNonce, setScrubNonce] = useState<number>(0);

  useEffect(() => {
    const handleReplay = () => {
      setScrubProgress(null);
      document.documentElement.classList.add("is-preloading");
      setPhase("loading");
      setReplayKey((k) => k + 1);
    };

    const handleScrub = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      const p = customEvent.detail?.progress ?? 0;
      document.documentElement.classList.add("is-preloading");
      setScrubProgress(p);
      setScrubNonce((n) => n + 1);
    };

    const handleClearScrub = () => {
      setScrubProgress(null);
      document.documentElement.classList.remove("is-preloading");
      setPhase("done");
      const pageEl = getPageElement();
      if (pageEl) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      }
    };

    const handleSettingsUpdate = () => {
      setScrubNonce((n) => n + 1);
    };

    window.addEventListener("7h-replay-preloader", handleReplay);
    window.addEventListener("7h-scrub-preloader", handleScrub);
    window.addEventListener("7h-clear-scrub-preloader", handleClearScrub);
    window.addEventListener("7h-update-preloader-settings", handleSettingsUpdate);

    return () => {
      window.removeEventListener("7h-replay-preloader", handleReplay);
      window.removeEventListener("7h-scrub-preloader", handleScrub);
      window.removeEventListener("7h-clear-scrub-preloader", handleClearScrub);
      window.removeEventListener("7h-update-preloader-settings", handleSettingsUpdate);
      const pageEl = getPageElement();
      if (pageEl) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      }
    };
  }, []);

  useEffect(() => {
    const pageEl = getPageElement();
    if (scrubProgress === null) {
      if (pageEl) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      }
      return;
    }
    const p = scrubProgress;
    let slant = WIPE_SLANT_RATIO;
    let flipSlant = false;
    let pageMotion = true;
    let pageY = 0;
    let pageX = 0;
    let pageScale = 1.0;
    let pageRot = 0;
    let pageOrigin = "center bottom";
    try {
      const saved = localStorage.getItem("7h_transition_settings_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.preloaderSlantRatio === "number") slant = parsed.preloaderSlantRatio;
        if (typeof parsed.preloaderFlipSlant === "boolean") flipSlant = parsed.preloaderFlipSlant;
        if (typeof parsed.preloaderPageMotion === "boolean") pageMotion = parsed.preloaderPageMotion;
        if (typeof parsed.preloaderPageY === "number") pageY = parsed.preloaderPageY;
        if (typeof parsed.preloaderPageX === "number") pageX = parsed.preloaderPageX;
        if (typeof parsed.preloaderPageScale === "number") pageScale = parsed.preloaderPageScale;
        if (typeof parsed.preloaderPageRotation === "number") pageRot = parsed.preloaderPageRotation;
        if (typeof parsed.preloaderPageOrigin === "string") pageOrigin = parsed.preloaderPageOrigin;
      }
    } catch {}

    if (pageEl) {
      if (!pageMotion || (pageY === 0 && pageX === 0 && pageScale === 1.0 && pageRot === 0)) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      } else {
        const wipeP = p <= 0.60 ? 0 : Math.min(1, Math.max(0, (p - 0.60) / 0.40));
        const remP = 1 - wipeP;
        const curX = pageX * remP;
        const curY = pageY * remP;
        const curScale = 1 - (1 - pageScale) * remP;
        const curRot = pageRot * remP;
        pageEl.style.transformOrigin = computeViewportOrigin(pageOrigin);
        pageEl.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) scale(${curScale.toFixed(3)}) rotate(${curRot.toFixed(2)}deg)`;
      }
    }

    const overlay = overlayRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    const wrap = loaderWrapRef.current;

    if (!overlay) return;

    if (p <= 0.45) {
      const fillP = p / 0.45;
      const clipVal = buildDecayingSlantClipPath(0, slant, 0.05, flipSlant);
      overlay.style.clipPath = clipVal;
      (overlay.style as any).webkitClipPath = clipVal;
      if (content) {
        content.style.opacity = "1";
        content.style.transform = "none";
      }
      if (bar) {
        bar.classList.remove("filling");
        bar.style.width = `${Math.min(100, fillP * 100)}%`;
      }
      if (wrap) {
        wrap.classList.remove("done");
        const colorIdx = Math.min(
          LOADER_PALETTE.length - 1,
          Math.floor(fillP * LOADER_PALETTE.length),
        );
        wrap.style.setProperty("--pc", LOADER_PALETTE[colorIdx]);
      }
    } else if (p <= 0.60) {
      const fadeP = (p - 0.45) / 0.15;
      const clipVal = buildDecayingSlantClipPath(0, slant, 0.05, flipSlant);
      overlay.style.clipPath = clipVal;
      (overlay.style as any).webkitClipPath = clipVal;
      if (content) {
        content.style.opacity = `${1 - fadeP}`;
        content.style.transform = `translateY(${-fadeP * 25}px)`;
      }
      if (bar) {
        bar.style.width = "100%";
      }
      if (wrap) {
        wrap.classList.add("done");
        wrap.style.setProperty(
          "--pc",
          LOADER_PALETTE[LOADER_PALETTE.length - 1],
        );
      }
    } else {
      const wipeP = (p - 0.60) / 0.40;
      if (content) {
        content.style.opacity = "0";
      }
      const clipVal = buildDecayingSlantClipPath(wipeP, slant, 0.05, flipSlant);
      overlay.style.clipPath = clipVal;
      (overlay.style as any).webkitClipPath = clipVal;
    }
  }, [scrubProgress, scrubNonce]);

  const isBypass = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return (
          window.location.search.includes("bypass=true") ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );
      } catch {
        return false;
      }
    },
    () => false,
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loaderWrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  /* eslint-disable-next-line react-doctor/effect-needs-cleanup */
  useEffect(() => {
    const html = document.documentElement;
    let finished = false;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const preventScrollKeys = (e: KeyboardEvent) => {
      const keys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Space",
        "Home",
        "End",
        " ",
      ];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const unlockScroll = () => {
      html.classList.remove("is-preloading");
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKeys);
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.start();
          (window as any).__lenis.resize();
        } catch {}
      }
    };

    // Single, idempotent exit path -- whether reached via the normal
    // wipe-complete callback or the watchdog below, this is the only place
    // that unlocks scroll and flips phase to "done".
    const finish = () => {
      if (finished) return;
      finished = true;
      if (overlayRef.current) {
        overlayRef.current.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
        (overlayRef.current.style as any).webkitClipPath = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
      }
      unlockScroll();
      setPhase("done");
      const pageEl = getPageElement();
      if (pageEl) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      }
    };

    if (!html.classList.contains("is-preloading") || isBypass) {
      unlockScroll();
      setPhase("done");
      const pageEl = getPageElement();
      if (pageEl) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      }
      return;
    }

    // Attach active event listeners to block any scroll attempts while preloading
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScrollKeys, { passive: false });

    // Reset scroll to top and pause Lenis while preloading
    window.scrollTo(0, 0);
    if ((window as any).__lenis) {
      try {
        (window as any).__lenis.stop();
      } catch {}
    }

    // Dynamic settings from Transition Tuner Panel if configured
    let activeWipeDuration = WIPE_DURATION;
    let activeWipeSlantRatio = WIPE_SLANT_RATIO;
    let activeWipeFlipSlant = false;
    let activeLoaderTotalMs = LOADER_TOTAL_MS;
    let activeWipeEase = "power2.out";
    let activeEnabled = true;
    let activeShowParticles = true;
    let activeSpeedMult = 1;
    let activePageMotion = true;
    let activePageY = 0;
    let activePageX = 0;
    let activePageScale = 1.0;
    let activePageRot = 0;
    let activePageOrigin = "center bottom";

    try {
      const saved = localStorage.getItem("7h_transition_settings_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.preloaderEnabled === "boolean") {
          activeEnabled = parsed.preloaderEnabled;
        }
        if (typeof parsed.preloaderShowParticles === "boolean") {
          activeShowParticles = parsed.preloaderShowParticles;
        }
        if (typeof parsed.preloaderDuration === "number" && parsed.preloaderDuration > 0) {
          activeWipeDuration = parsed.preloaderDuration;
        }
        if (typeof parsed.preloaderSlantRatio === "number" && parsed.preloaderSlantRatio >= 0) {
          activeWipeSlantRatio = parsed.preloaderSlantRatio;
        }
        if (typeof parsed.preloaderFlipSlant === "boolean") {
          activeWipeFlipSlant = parsed.preloaderFlipSlant;
        }
        if (typeof parsed.preloaderFillMs === "number" && parsed.preloaderFillMs > 0) {
          activeLoaderTotalMs = parsed.preloaderFillMs;
        }
        if (typeof parsed.preloaderEase === "string" && parsed.preloaderEase.trim()) {
          activeWipeEase = parsed.preloaderEase;
        }
        if (typeof parsed.speedMult === "number" && parsed.speedMult > 0) {
          activeSpeedMult = parsed.speedMult;
        }
        if (typeof parsed.preloaderPageMotion === "boolean") {
          activePageMotion = parsed.preloaderPageMotion;
        }
        if (typeof parsed.preloaderPageY === "number") {
          activePageY = parsed.preloaderPageY;
        }
        if (typeof parsed.preloaderPageX === "number") {
          activePageX = parsed.preloaderPageX;
        }
        if (typeof parsed.preloaderPageScale === "number") {
          activePageScale = parsed.preloaderPageScale;
        }
        if (typeof parsed.preloaderPageRotation === "number") {
          activePageRot = parsed.preloaderPageRotation;
        }
        if (typeof parsed.preloaderPageOrigin === "string") {
          activePageOrigin = parsed.preloaderPageOrigin;
        }
      }
    } catch {}

    if (!activeEnabled) {
      finish();
      return;
    }

    activeWipeDuration = activeWipeDuration * activeSpeedMult;
    activeLoaderTotalMs = activeLoaderTotalMs * activeSpeedMult;
    const activeStepMs = activeLoaderTotalMs / LOADER_PALETTE.length;

    let cancelled = false;
    let wipeTween: gsap.core.Tween | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const pageEl = getPageElement();
    const hasPageMotion =
      activePageMotion &&
      (activePageY !== 0 ||
        activePageX !== 0 ||
        activePageScale !== 1.0 ||
        activePageRot !== 0);

    if (pageEl && hasPageMotion) {
      pageEl.style.transformOrigin = computeViewportOrigin(activePageOrigin);
      pageEl.style.transform = `translate3d(${activePageX.toFixed(1)}px, ${activePageY.toFixed(1)}px, 0) scale(${activePageScale.toFixed(3)}) rotate(${activePageRot.toFixed(2)}deg)`;
    }

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

      safetyTimer = setTimeout(() => {
        if (!cancelled && !finished) {
          finish();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("preloader-complete"));
            window.dispatchEvent(new CustomEvent("7h-preloader-done"));
          }
        }
      }, (activeWipeDuration + 0.15) * 1000 + 100);

      const proxy = { p: 0 };
      wipeTween = gsap.to(proxy, {
        p: 1,
        duration: activeWipeDuration,
        ease: activeWipeEase,
        onUpdate: () => {
          if (!overlay) return;
          const clipVal = buildDecayingSlantClipPath(
            proxy.p,
            activeWipeSlantRatio,
            0.05,
            activeWipeFlipSlant,
          );
          overlay.style.clipPath = clipVal;
          (overlay.style as any).webkitClipPath = clipVal;

          if (pageEl && hasPageMotion) {
            const remP = 1 - proxy.p;
            const curX = activePageX * remP;
            const curY = activePageY * remP;
            const curScale = 1 - (1 - activePageScale) * remP;
            const curRot = activePageRot * remP;
            pageEl.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) scale(${curScale.toFixed(3)}) rotate(${curRot.toFixed(2)}deg)`;
          }
        },
        onComplete: () => {
          if (safetyTimer) clearTimeout(safetyTimer);
          if (cancelled) return;
          if (pageEl) {
            pageEl.style.transform = "";
            pageEl.style.transformOrigin = "";
          }
          finish();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("preloader-complete"));
            window.dispatchEvent(new CustomEvent("7h-preloader-done"));
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
          duration: 0.1 * activeSpeedMult, // content fade scales with speedMult
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
        setTimeout(
          () => {
            note.remove();
          },
          duration * 1000 + 60,
        ),
      );
    };

    const wrap = loaderWrapRef.current;
    const bar = barRef.current;
    if (wrap && bar) {
      wrap.style.setProperty("--pc", LOADER_PALETTE[0]);

      bar.style.animationDuration = activeLoaderTotalMs + "ms";
      bar.classList.remove("filling");
      void bar.offsetWidth; // force reflow so the fill starts from 0%
      bar.classList.add("filling");

      for (let i = 1; i < LOADER_PALETTE.length; i++) {
        colorTimeouts.push(
          setTimeout(() => {
            if (!finished) wrap.style.setProperty("--pc", LOADER_PALETTE[i]);
          }, i * activeStepMs),
        );
      }

      if (particlesRef.current) {
        particlesRef.current.style.display = activeShowParticles ? "" : "none";
      }

      if (activeShowParticles) {
        particleInterval = setInterval(spawnParticle, 100);
        for (let i = 0; i < 4; i++) {
          particleTimeouts.push(setTimeout(spawnParticle, i * 25));
        }
      }

      loaderDoneTimeout = setTimeout(async () => {
        if (particleInterval) clearInterval(particleInterval);
        wrap.classList.add("done"); // fades the bar track + trailing dot
        await Promise.all([
          waitForPageReady(),
          waitForCanvasReady(),
          waitForMediaVideosReady(),
        ]);
        advanceToWipe();
      }, activeLoaderTotalMs);
    } else {
      // Refs not ready for some reason -- don't hang the site on a missing element.
      Promise.all([
        waitForPageReady(),
        waitForCanvasReady(),
        waitForMediaVideosReady(),
      ]).then(() => {
        advanceToWipe();
      });
    }

    // Watchdog: if the loader-fill -> fade -> wipe chain hasn't finished
    // within a generous bound, force it through instead of leaving the whole
    // site hidden behind the overlay forever.
    const activeCeilingMs = Math.max(
      HARD_CEILING_MS,
      (activeLoaderTotalMs + activeWipeDuration * 1000 + 1500) * 1.5,
    );
    const watchdog = setTimeout(() => {
      if (cancelled || finished) return;
      if (safetyTimer) clearTimeout(safetyTimer);
      if (particleInterval) clearInterval(particleInterval);
      if (loaderDoneTimeout) clearTimeout(loaderDoneTimeout);
      wipeTween?.kill();
      finish();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("preloader-complete"));
      }
    }, activeCeilingMs);

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (loaderDoneTimeout) clearTimeout(loaderDoneTimeout);
      if (particleInterval) clearInterval(particleInterval);
      colorTimeouts.forEach(clearTimeout);
      particleTimeouts.forEach(clearTimeout);
      wipeTween?.kill();
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKeys);
      const pageEl = getPageElement();
      if (pageEl) {
        pageEl.style.transform = "";
        pageEl.style.transformOrigin = "";
      }
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
  }, [isBypass, replayKey]);

  if (pathname?.startsWith("/studio") || (phase === "done" && scrubProgress === null)) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="preloader-overlay fixed inset-0 flex flex-col items-center justify-center pointer-events-auto bg-[var(--curtain-bg)] [clip-path:var(--curtain-clip)]"
      style={{
        "--curtain-bg": CURTAIN_BG,
        "--curtain-clip": buildDecayingSlantClipPath(0, WIPE_SLANT_RATIO),
      } as React.CSSProperties}
    >
      <div
        ref={contentRef}
        className="preloader-content z-10 flex flex-col items-center justify-center text-center select-none"
      >
        <div
          ref={loaderWrapRef}
          className="preloader-loader"
          style={{ "--pc": LOADER_PALETTE[0] } as React.CSSProperties}
        >
          <svg
            className="preloader-note-icon"
            viewBox="0 0 9.06 11.45"
            width="40"
            height="51"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M1.75,11.45h-.47c-.42-.06-.82-.22-1.1-.56-.26-.4-.23-.92.07-1.32.52-.69,1.45-.96,2.3-.7V1.05s6.52-1.05,6.52-1.05v8.83c-.02.43-.19.78-.51,1.07-.86.72-2.41.74-2.88-.34-.11-.39-.02-.8.24-1.12.54-.65,1.44-.9,2.28-.65V2.48s-4.77.87-4.77.87l-.02,6.51c0,.92-.82,1.47-1.66,1.59Z" />
          </svg>

          <div ref={particlesRef} className="preloader-particles">
            <span
              className="preloader-note-particle"
              style={
                {
                  left: "20%",
                  width: "14px",
                  height: "23px",
                  "--pc-drift": "-12px",
                  animationDuration: "1.8s",
                  animationDelay: "0s",
                  opacity: 0.95,
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{ __html: NOTE_SVG_MARKUP }}
            />
            <span
              className="preloader-note-particle"
              style={
                {
                  left: "45%",
                  width: "18px",
                  height: "29px",
                  "--pc-drift": "15px",
                  animationDuration: "2.2s",
                  animationDelay: "0.15s",
                  opacity: 0.9,
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{ __html: NOTE_SVG_MARKUP }}
            />
            <span
              className="preloader-note-particle"
              style={
                {
                  left: "70%",
                  width: "12px",
                  height: "19px",
                  "--pc-drift": "-8px",
                  animationDuration: "1.6s",
                  animationDelay: "0.3s",
                  opacity: 0.85,
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{ __html: NOTE_SVG_MARKUP }}
            />
            <span
              className="preloader-note-particle"
              style={
                {
                  left: "85%",
                  width: "16px",
                  height: "26px",
                  "--pc-drift": "10px",
                  animationDuration: "2.0s",
                  animationDelay: "0.45s",
                  opacity: 0.9,
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{ __html: NOTE_SVG_MARKUP }}
            />
          </div>

          <div className="preloader-bar-track">
            <div ref={barRef} className="preloader-bar-fill filling">
              <div className="preloader-bar-shine" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
