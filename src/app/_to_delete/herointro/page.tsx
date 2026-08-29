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
 *   - The boundary is diagonal the ENTIRE time (not just at the end), left
 *     edge always ahead of the right — but CORRECTED after a second, more
 *     thorough recording: it's not a constant angle. Sampled the left/right
 *     edge position at 15 points across a full wipe and the gap between
 *     them isn't a fixed number of pixels, it's a fixed RATIO to how much
 *     black remains (~0.095, held from 0.086-0.10 across all 15 samples,
 *     no drift up or down as the wipe progressed). Since the black is
 *     shrinking, that means the angle itself shrinks right along with it —
 *     steep near the start, perfectly flat/level exactly as it finishes.
 *     That's what reads as the edge "rotating": it's leveling out as it
 *     completes, not a constant-angle line just sliding up. Confirmed the
 *     content itself doesn't actually rotate by tracking a vertical
 *     landmark (the dome's spire/statue) across the same frames — stays
 *     perfectly vertical throughout, so this is purely a mask-edge effect.
 *     Uses buildDecayingSlantClipPath (curtainClipPath.ts) for this —
 *     buildCurtainClipPath's constant-gap shape is left alone since
 *     /pagetransition's curtain still uses it deliberately.
 *   - The hero content ITSELF also moves, in sync with the wipe — it's not
 *     a static image sitting behind a moving mask. Tracking a fixed feature
 *     (the dome's top edge) across frames showed its on-screen position
 *     climbing steadily from ~612px up to its resting ~292px as the wipe
 *     played out — real vertical travel, not just newly-unmasked pixels.
 *     Confirmed independently in the live DOM too: exoape's logo-mark
 *     element carries a leftover `transform: translate(0px, 0px)` residue
 *     (the settled state of what was clearly an animated transform),
 *     showing the site drives content position the same transform-based
 *     way elsewhere. So this version also translates the hero content on
 *     the SAME proxy/timeline as the clip-path, starting offset below its
 *     resting position and easing up to 0 as the wipe completes. The exact
 *     starting offset is an estimate — content is only observable once the
 *     mask has partly opened, so the true progress=0 offset (before any of
 *     it becomes visible) can't be measured directly, only extrapolated.
 *     Important scoping note: only the BACKGROUND MEDIA layer (the video)
 *     gets this slide — the dome-tracking evidence is about the background
 *     photo, not about exoape's headline copy, which for all I could tell
 *     may be on its own separate reveal. Sliding the bottom-anchored
 *     headline/tagline by the same largeish offset pushed it below the
 *     viewport entirely for part of the animation (since it already sits
 *     close to the bottom edge), which read as a pop-in glitch rather than
 *     a slide — caught that while testing, so it's scoped to the media only.
 *
 * Geometry is otherwise identical to the /pagetransition curtain: a
 * clip-path polygon pinned flat at the top (y=0%), with a moving bottom
 * edge that starts at y=100% (fully covering) and rises to y=0% (fully
 * cleared) — so buildCurtainClipPath(progress, slant) drops in unchanged.
 *
 * Visual-parity pass (after directly screenshotting both at matched forced
 * checkpoints): exoape's preloader background is rgb(13,14,19), not a flat
 * #000, and their centered mark is a small compact badge rather than a
 * full-width title. Matched both here. Also found this site's global
 * film-grain layer (.grain-overlay, z-index 99999) painting over the top
 * of this page's black hold — exoape has no grain at all — so it's
 * suppressed for just this route via a scoped CSS override below, rather
 * than touched globally.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Logo from "@/components/Logo";
import { buildDecayingSlantClipPath } from "@/lib/curtainClipPath";

// Corrected from an earlier constant-gap slant after measuring a second,
// more thorough recording: the real wipe's edge gets LESS diagonal as it
// progresses, settling perfectly flat right as it finishes, not a fixed
// angle the whole way. See buildDecayingSlantClipPath's doc comment for
// the measurement (15 sample points, ~0.095 gap-to-remaining ratio held
// constant throughout). Left leads (matches the measured recording).
const WIPE_SLANT_RATIO = 0.095;
const WIPE_DURATION = 0.9;
const WIPE_EASE = "expo.inOut"; // slow/fast/slow, matching the measured mid-wipe snap
const MIN_HOLD_MS = 900; // let the mark actually register before wiping
const MAX_WAIT_MS = 3200; // failsafe if the hero video never fires loadeddata
// How far below its resting position the hero content starts, as a
// fraction of viewport height, before easing up to 0 in sync with the
// wipe. Estimated from the dome-tracking data (offsets up to ~34% of
// height were visible mid-wipe, and the true start is earlier/larger
// than the first frame it becomes visible in) — tune to taste.
const CONTENT_SLIDE_VH = 0.24;

export default function HeroIntroPage() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const media = mediaRef.current;
    const video = videoRef.current;
    if (!overlay || !media) return;

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
          overlay.style.clipPath = buildDecayingSlantClipPath(proxy.p, WIPE_SLANT_RATIO);
          // Same proxy, same easing curve — the media rides the exact same
          // timeline as the mask instead of a separate tween, which is what
          // keeps the two motions reading as one synced move instead of two
          // things that happen to overlap.
          const offsetPx = (1 - proxy.p) * CONTENT_SLIDE_VH * window.innerHeight;
          media.style.transform = `translateY(${offsetPx.toFixed(1)}px)`;
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
        {/* Media layer only — this is what actually slides, starting
            translated down by CONTENT_SLIDE_VH (matching its resting
            position at mount, before the wipe's tween takes over) so
            there's no jump when the animation begins. Scoped to just the
            video/gradient rather than the whole content block — see the
            file header note on why the headline stays out of this. */}
        <div
          ref={mediaRef}
          className="absolute inset-0"
          style={{ transform: `translateY(${CONTENT_SLIDE_VH * 100}vh)` }}
        >
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
        </div>
        {/* No in-page nav here on purpose — layout.tsx already renders the
            real site Header on every route (visible on /pagetransition etc.
            too), so a second one would just duplicate it. */}

        {/* Text layer — static, only ever revealed by the mask (no extra
            translate) so it can't end up pushed off-screen mid-wipe. */}
        <div className="absolute bottom-14 left-6 md:left-10 right-6 md:right-10 flex flex-col gap-3">
          <span className="font-bold uppercase tracking-[0.3em] text-white/50">
            40 years of rocking the world.
          </span>
          <h1
            className="max-w-2xl text-3xl md:text-6xl font-bold uppercase tracking-tight text-white leading-[0.95]"
            style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}
          >
            An experience you just have to see and hear.
          </h1>
        </div>

        <div className="absolute bottom-14 right-6 md:right-10 hidden md:flex items-center gap-2 font-bold uppercase    text-white/50">
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
          // rgb(13,14,19) matches exoape's measured preloader background —
          // a near-black charcoal with a faint blue cast, not a flat #000.
          backgroundColor: "rgb(13, 14, 19)",
          clipPath: buildDecayingSlantClipPath(0, WIPE_SLANT_RATIO),
          // Traced (didn't just guess) a brief flash where the real site
          // Header shows through this overlay on first load, despite
          // z-9999 vs Header's z-[1000]: layout.tsx wraps page content in
          // a div that fades opacity 0->1 over 0.35s on mount, and any
          // ancestor with opacity < 1 forces a NEW stacking context per
          // spec — while that fade is running, this whole subtree (overlay
          // included) gets capped inside it and stacks in normal DOM order
          // *below* Header's own explicitly z-indexed layer, regardless of
          // this element's z-9999. `isolation: isolate` here does NOT fix
          // that (the trapping context is on an ancestor I don't own), so
          // it's left in as a no-op safety net rather than a real fix. In
          // a normal, focused tab this is a <0.35s flash before the fade
          // finishes and the stacking context releases — well inside the
          // 900ms hold, so it's likely invisible in practice. It only
          // looked "stuck" in my testing because this automated tab
          // throttles the CSS transition when backgrounded. Flagging
          // rather than chasing further, since a real fix means touching
          // the shared layout's page-fade wrapper, not this page.
          isolation: "isolate",
        }}
      >
        {!revealed && (
          <div className="flex flex-col items-center gap-4" style={{ animation: "heroIntroPulse 1.6s ease-in-out infinite" }}>
            {/* Shrunk from h-8/h-10 — exoape's mark is a small, quiet badge,
                not a full-width title card. This is still the full wordmark
                (no separate icon-only asset exists in this project), just
                sized down to read closer to that same "quiet" weight. */}
            <Logo className="h-4 md:h-5 w-auto text-white/90" />
          </div>
        )}
      </div>

      {/* Site-wide film-grain effect (.grain-overlay, z-index 99999) sits
          above everything, including this preloader — exoape's preloader
          has no grain at all, so it was muddying the "flat, clean black"
          look this page is going for. Scoped to just this page (removed on
          unmount with this <style> tag) rather than touching the global
          effect, which other pages still want. */}
      <style>{`
        @keyframes heroIntroPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.97); }
          50% { opacity: 1; transform: scale(1); }
        }
        .grain-overlay { display: none !important; }
      `}</style>
    </div>
  );
}
