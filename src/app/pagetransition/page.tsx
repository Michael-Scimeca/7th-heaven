"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import SlideUpReveal from "@/components/SlideUpReveal";

export default function PageTransitionDemo() {
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [replayKey, setReplayKey] = useState(0);

  useLayoutEffect(() => {
    const wrap = imageWrapRef.current;
    const img = imageRef.current;
    if (!wrap || !img) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap,
        { clipPath: "inset(18% 12% 18% 12%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "power4.out",
          delay: 0.15,
        }
      );
      gsap.fromTo(
        img,
        { scale: 1.25, yPercent: 8 },
        {
          scale: 1,
          yPercent: 0,
          duration: 1.4,
          ease: "power4.out",
          delay: 0.15,
        }
      );
    }, wrap);

    return () => ctx.revert();
  }, [replayKey]);

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
          mask="lines"
          skew={7}
          replayKey={replayKey}
          className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.95] text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Lines slide up and tilt into place
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
          Each line sits inside its own overflow-hidden box. GSAP SplitText
          pushes the text down out of view with yPercent and a small skewY,
          then eases both back to 0 with a power4.out ease — that lingering
          skew is what reads as a slight tilt partway through the slide,
          the same technique used on thibaultguignand.com.
        </SlideUpReveal>

        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="mt-2 w-fit rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-[var(--color-accent)] hover:text-white"
        >
          Replay animation
        </button>
      </header>

      <div
        ref={imageWrapRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div ref={imageRef} className="absolute inset-0">
          <Image
            src="/images/hero-banner.png"
            alt="7th Heaven"
            fill
            priority
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6">
          <SlideUpReveal
            as="span"
            mask="chars"
            delay={0.5}
            stagger={0.015}
            duration={0.7}
            replayKey={replayKey}
            className="text-sm font-bold uppercase tracking-[0.2em] text-white"
          >
            Image reveal via clip-path + scale
          </SlideUpReveal>
        </div>
      </div>

      <section className="flex flex-col gap-3 border-t border-white/10 pt-10">
        <SlideUpReveal
          as="h2"
          mask="lines"
          skew={7}
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
