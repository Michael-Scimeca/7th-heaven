"use client";

/**
 * /herointro — recreates exoape.com's homepage load-in: a full-black
 * preloader with a centered, gently pulsing mark holds briefly, then wipes
 * away in one fast diagonal sweep (constant slant the whole way, not just
 * at the end — unlike the /pagetransition curtain) to reveal the hero
 * underneath. Reverse-engineered from a screen recording by measuring the
 * wipe boundary's pixel position frame-by-frame (see the analysis notes
 * below) rather than by reading exoape's source, since only the visible
 * behavior was available to inspect.
 *
 * What the frame analysis showed (1920x926 recording, boundary = the y
 * coordinate where black ends and the page shows through, scanned at the
 * left edge / center / right edge of the viewport):
 *   - Preloader (logo, centered, subtle pulse) holds for ~3s before the
 *     wipe starts — in production that's almost certainly "hold until the
 *     hero's real assets are ready", not a fixed timer, so this version
 *     waits for the hero video's `loadeddata` event (capped) instead of
 *     hard-coding 3s.
 *   - The wipe itself is fast: full black -> fully clear in ~11 frames at
 *     12fps, ~0.9s.
 *   - It's NOT linear — deltas were small at the start, huge in the middle,
 *     small again at the end (slow/fast/slow), matching an expo or power4
 *     "inOut" easing curve, not a simple ease.
 *   - The boundary is a straight diagonal the ENTIRE time (not just at the
 *     end): left edge consistently ~3-4% of viewport height ahead of the
 *     right edge throughout, e.g. one mid-wipe frame measured left=358px
 *     right=393px of 926px tall (~3.8%). That's a small, constant slant —
 *     this reuses buildCurtainClipPath (the constant-slant function
 *     already in curtainClipPath.ts) rather than buildStagedCurtainClipPath
 *     (which only slants for the final stretch — that one was built
 *     specifically for the /pagetransition curtain's "flat, then slants at
 *     75%" look and doesn't apply here).
 *
 * Geometry is otherwise identical to the /pagetransition curtain: a
 * clip-path polygon pinned flat at the top (y=0%), with a moving bottom
 * edge that starts at y=100% (fully covering) and rises to y=0% (fully
 * cleared) — so buildCurtainClipPath(progress, slant) drops in unchanged.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "@/components/Logo";
import { buildCurtainClipPath } from "@/lib/curtainClipPath";

// Negative = left edge leads (matches the measured recording: the left
// side of the wipe boundary is consistently ahead of the right side).
// Magnitude tuned to the ~3.8% of viewport height offset measured
// mid-wipe: with span = 1 - |slant|, the constant gap works out to
// |slant| / span * 100%, so -0.035 -> ~3.6%, close to what was measured.
const WIPE_SLANT = -0.035;
const WIPE_DURATION = 0.9;
const WIPE_EASE = "expo.inOut"; // slow/fast/slow, matching the measured mid-wipe snap
const MIN_HOLD_MS = 900; // let the mark actually register before wiping
const MAX_WAIT_MS = 3200; // failsafe if the hero video never fires loadeddata

export default function HeroIntroPage() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const video = videoRef.current;
    if (!overlay) return;

    let cancelled = false;
    const start = Date.now();

    const assetReady = new Promise<void>((resolve) => {
      if (!video) return resolve();
      if (video.readyState >= 2) return resolve(); // HAVE_CURRENT_DATA already
      const done = () => {
        video.removeEventListener("loadeddata", done);
        resolve();
      };
      video.addEventListener("loadeddata", done, { once: true });
    });

    const minHold = new Promise<void>((resolve) => setTimeout(resolve, MIN_HOLD_MS));
    const failsafe = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    Promise.race([Promise.all([assetReady, minHold]), failsafe]).then(() => {
      if (cancelled) return;

      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        duration: WIPE_DURATION,
        ease: WIPE_EASE,
        onUpdate: () => {
          overlay.style.clipPath = buildCurtainClipPath(proxy.p, WIPE_SLANT);
        },
        onComplete: () => {
          overlay.style.pointerEvents = "none";
          setRevealed(true);
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-[100dvh] min-h-screen overflow-hidden bg-black">
      {/* ── Hero underneath — same content family as the real homepage hero:
          video background, dark gradient, wordmark + tagline, scroll hint. */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src="/movie/be-here-clip.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        {/* No in-page nav here on purpose — layout.tsx already renders the
            real site Header on every route (visible on /pagetransition etc.
            too), so a second one would just duplicate it. */}

        <div className="absolute bottom-14 left-6 md:left-10 right-6 md:right-10 flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
            40 years of rocking the world.
          </span>
          <h1
            className="max-w-2xl text-3xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.95]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            An experience you just have to see and hear.
          </h1>
        </div>

        <div className="absolute bottom-14 right-6 md:right-10 hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
          Scroll to explore
        </div>
      </div>

      {/* ── Preloader / wipe overlay — solid black, wordmark pulsing while it
          holds, then this same element's clip-path animates to reveal the
          hero above without any fade (a hard diagonal edge, matching the
          reference recording — no autoAlpha crossfade like the
          /pagetransition curtain uses). */}
      <div
        ref={overlayRef}
        aria-hidden
        className="absolute inset-0 z-[9999] flex items-center justify-center"
        style={{
          // NOT `bg-black`: globals.css force-strips background-color on
          // that exact class site-wide with `!important` (see the same
          // note in PageTransition.tsx, where this bit first). Inline
          // style keeps this overlay outside that rule.
          backgroundColor: "#000",
          clipPath: buildCurtainClipPath(0, WIPE_SLANT),
        }}
      >
        {!revealed && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "heroIntroPulse 1.6s ease-in-out infinite" }}>
            <Logo className="h-8 md:h-10 w-auto text-white" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes heroIntroPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.97); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
