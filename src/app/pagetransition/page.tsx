"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import SlideUpReveal from "@/components/SlideUpReveal";
import TransitionLink from "@/components/TransitionLink";

export default function PageTransitionDemo() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);
  const [headlineKey, setHeadlineKey] = useState(0);

  // All five phases from the recording, as one timeline, in order — not
  // just the wipe on its own. Skipping straight to phase 3/4 last time is
  // exactly why the "outgoing dim" beat was missing.
  //   Phase 1 (hover glitch between project markers) — out of scope, you
  //     confirmed you want the click transition, not the hover preview.
  //   Phase 2 (0.0s) — the "outgoing" content dims uniformly, before any
  //     curtain is visible.
  //   Phase 3 (~0.35s) — the black curtain snaps in fully opaque, wordmark
  //     showing, covering everything. The incoming photo + headline are
  //     already mounted underneath it this whole time, just hidden.
  //   Phase 4 (~0.7s) — the curtain wipes away via clip-path, bottom edge
  //     rising, top edge fixed. No scale/zoom on the photo — only the
  //     curtain's own clip region moves. The incoming headline's
  //     character-stagger reveal fires partway through this wipe, so its
  //     letters are still catching up to each other as the wipe edge
  //     crosses them — that's the jagged "tilt".
  //   Phase 5 (~1.7s+) — settled: curtain fully clipped away, headline
  //     landed.
  useLayoutEffect(() => {
    const curtain = curtainRef.current;
    const outgoing = outgoingRef.current;
    if (!curtain || !outgoing) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Reset to phase-1 state: outgoing content visible, curtain hidden
      // (not just clipped away — invisible, so it doesn't block clicks/
      // paint while "we're still on the previous page").
      tl.set(outgoing, { autoAlpha: 1 })
        .set(curtain, { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)" })
        // Phase 2 — dim the outgoing content.
        .to(outgoing, { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, "dim")
        // Phase 3 — curtain snaps to fully opaque as the dim finishes, then
        // holds a beat with the wordmark showing before it starts moving.
        .to(curtain, { autoAlpha: 1, duration: 0.001 }, "dim+=0.3")
        .to({}, { duration: 0.3 })
        // Phase 4 — the wipe.
        .to(curtain, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1,
          ease: "power3.inOut",
        })
        // Fire the incoming headline's per-letter reveal ~50% into the
        // wipe, not at wipe-start and not after wipe-end.
        .call(() => setHeadlineKey((k) => k + 1), [], "<50%");
    });

    return () => ctx.revert();
  }, [transitionKey]);

  return (
    <div className="site-container flex flex-col gap-16 py-16 md:py-24">
      <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 p-6 flex flex-col gap-3">
        <span
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--color-accent)" }}
        >
          Read this first
        </span>
        <p className="max-w-2xl text-base text-white/80 leading-relaxed">
          Everything below on this page (including the &quot;Replay page
          transition&quot; button) is a self-contained component demo — it
          replays a GSAP timeline in place, it does not navigate anywhere.
          It&apos;s useful for tuning the curtain&apos;s look, but it is
          NOT the real thing. The real, live page-to-page transition now runs
          on actual navigation via <code>TransitionLink</code> (wired into
          the site&apos;s header nav, and into the link below) — a URL you
          load directly never shows a transition, since there&apos;s no
          previous page to transition from. Click through to see the real
          one:
        </p>
        <TransitionLink
          href="/pageslidetransition"
          className="w-fit rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          See the real transition →
        </TransitionLink>
      </div>

      {/*
        Deliberately a <div>, not <header>: globals.css has a bare `header {
        height: 88px }` rule (min-width: 1024px block) meant for the site's
        real nav bar. Using the semantic <header> tag here let that rule
        clamp this block to a fixed 88px box regardless of its actual flex
        content, so this section's own height stopped matching what was
        visually rendered and the next section down painted over the tail
        of the headline/paragraph/button. That looked like the reveal was
        "stuck" — it wasn't; it was just being covered.
      */}
      <div className="flex flex-col gap-6">
        <span
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--color-accent)" }}
        >
          Slide-up reveal · GSAP SplitText demo
        </span>

        <SlideUpReveal
          as="h1"
          mask="chars"
          duration={0.85}
          stagger={0.035}
          skew={9}
          replayKey={replayKey}
          className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.95] text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Letters slide up and tilt into place
        </SlideUpReveal>

        <SlideUpReveal
          as="p"
          mask="words"
          delay={0.35}
          stagger={0.02}
          skew={4}
          replayKey={replayKey}
          className="max-w-xl text-base md:text-lg text-white/60 leading-relaxed"
        >
          Each character sits inside its own overflow-hidden box. GSAP
          SplitText pushes every letter down out of view with yPercent and a
          small skewY, then eases each one back to 0 on its own staggered
          delay — since neighboring letters are never at the same point in
          the tween at the same instant, they briefly sit at different
          heights as they slide in, which reads as a jagged &quot;tilt&quot;
          right as the headline lands.
        </SlideUpReveal>

        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="mt-2 w-fit rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-[var(--color-accent)] hover:text-white"
        >
          Replay animation
        </button>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <span
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: "var(--color-accent)" }}
          >
            The actual page-transition curtain
          </span>
          <p className="mt-2 max-w-xl text-base text-white/60 leading-relaxed">
            All five beats from the recording, in order: the &quot;you&apos;re
            still on the previous page&quot; content dims uniformly first,
            then a black curtain snaps to fully opaque with a wordmark and
            holds briefly, then it wipes away via <code>clip-path</code> from
            <code> inset(0% 0% 0% 0%)</code> to
            <code> inset(0% 0% 100% 0%)</code> — bottom edge rising, no
            scale or zoom on the photo underneath — and the incoming
            headline&apos;s character-stagger reveal fires partway through
            that wipe.
          </p>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
          {/* Incoming page — mounted the whole time, just hidden under the curtain until the wipe. */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero-banner.png"
              alt="7th Heaven"
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <SlideUpReveal
                as="span"
                mask="chars"
                duration={0.6}
                stagger={0.022}
                skew={9}
                replayKey={headlineKey}
                className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                7th Heaven Live
              </SlideUpReveal>
            </div>
          </div>

          {/* Phase 2 — the outgoing page's stand-in content, dims out before the curtain takes over. */}
          <div
            ref={outgoingRef}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0a0a0f]"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
              Previous page
            </span>
            <span
              className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              7th Heaven
            </span>
          </div>

          {/* Phase 3 + 4 — the curtain: hidden until the dim finishes, then opaque, then wipes away. */}
          <div
            ref={curtainRef}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black"
            style={{ clipPath: "inset(0% 0% 0% 0%)" }}
          >
            <span
              className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              7th Heaven
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTransitionKey((k) => k + 1)}
          className="w-fit rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-[var(--color-accent)] hover:text-white"
        >
          Replay page transition
        </button>
      </section>

      <section className="flex flex-col gap-3 border-t border-white/10 pt-10">
        <SlideUpReveal
          as="h2"
          mask="chars"
          duration={0.7}
          stagger={0.025}
          skew={9}
          replayKey={replayKey}
          className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Character-level stagger reads even punchier
        </SlideUpReveal>
        <SlideUpReveal
          as="p"
          mask="chars"
          delay={0.2}
          stagger={0.012}
          duration={0.6}
          skew={4}
          replayKey={replayKey}
          className="max-w-2xl text-sm md:text-base text-white/50"
        >
          Swap mask=&quot;lines&quot; for mask=&quot;chars&quot; and shrink the stagger
          for a tighter, more energetic cascade — useful for short kickers
          and tags rather than full paragraphs.
        </SlideUpReveal>
      </section>
    </div>
  );
}
