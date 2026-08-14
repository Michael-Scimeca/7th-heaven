"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import SlideUpReveal from "@/components/SlideUpReveal";

export default function PageTransitionDemo() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);
  const [headlineKey, setHeadlineKey] = useState(0);

  // The actual page-transition curtain: a black overlay (holding the
  // "outgoing" mark) that wipes away via clip-path, top edge fixed, bottom
  // edge rising — NOT a scale/zoom on the photo underneath. The photo and
  // incoming headline sit statically beneath the curtain the whole time;
  // only the curtain's clip region animates, so the reveal reads as content
  // being uncovered from the bottom up, matching thibaultguignand.com.
  useLayoutEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    const ctx = gsap.context(() => {
      gsap.set(curtain, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.to(curtain, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1,
        ease: "power3.inOut",
        delay: 0.2,
      });
    });

    // Kick the incoming headline's per-letter reveal partway through the
    // wipe (not on curtain-start, not after curtain-end) so the letters are
    // still catching up to each other right as the wipe line crosses them —
    // that's the jagged "tilt" moment from your recording.
    const headlineTimer = setTimeout(() => setHeadlineKey((k) => k + 1), 650);

    return () => {
      ctx.revert();
      clearTimeout(headlineTimer);
    };
  }, [transitionKey]);

  return (
    <div className="site-container flex flex-col gap-16 py-16 md:py-24">
      <header className="flex flex-col gap-6">
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
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <span
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: "var(--color-accent)" }}
          >
            The actual page-transition curtain
          </span>
          <p className="mt-2 max-w-xl text-base text-white/60 leading-relaxed">
            This is the real mechanic from your recording: a black overlay
            covers the photo, then its <code>clip-path</code> animates from
            <code> inset(0% 0% 0% 0%)</code> (fully covering) to
            <code> inset(0% 0% 100% 0%)</code> (fully clipped away) — the
            bottom edge rises, uncovering the photo from the bottom up. The
            photo itself never scales or zooms; only the curtain&apos;s clip
            region moves. The headline underneath fires its own
            character-stagger reveal partway through the wipe, so the two
            effects overlap the way they do on thibaultguignand.com.
          </p>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-banner.png"
              alt="7th Heaven"
              fill
              priority
              sizes="100vw"
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

          <div
            ref={curtainRef}
            className="absolute inset-0 flex items-center justify-center bg-black"
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
