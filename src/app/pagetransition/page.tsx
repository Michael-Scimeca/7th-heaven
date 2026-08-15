"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import SlideUpReveal from "@/components/SlideUpReveal";
import TransitionLink from "@/components/TransitionLink";
import { buildCurtainClipPath, CURTAIN_MAX_SLANT_FRAC } from "@/lib/curtainClipPath";

const EASE_OPTIONS = [
  { value: "power3.inOut", label: "power3.inOut" },
  { value: "power2.inOut", label: "power2.inOut" },
  { value: "expo.inOut", label: "expo.inOut (closest to the reference site's snap)" },
  { value: "circ.inOut", label: "circ.inOut" },
  { value: "linear", label: "linear" },
];

export default function PageTransitionDemo() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);
  const [copied, setCopied] = useState(false);

  // Curtain settings — this is the "recreate the animation for testing"
  // panel. Every value here maps 1:1 to a knob in the timeline below, and
  // to CURTAIN_SLANT / the tween options in PageTransition.tsx (the real,
  // route-driven curtain). Dial these in, hit replay, then port the values
  // you like over to the real component.
  const [slant, setSlant] = useState(0); // -90..90, mapped to -0.9..0.9 fraction
  const [wipeDuration, setWipeDuration] = useState(1);
  const [holdDuration, setHoldDuration] = useState(0.3);
  const [dimDuration, setDimDuration] = useState(0.35);
  const [easeKey, setEaseKey] = useState("power3.inOut");

  const slantFrac = (slant / 100) * CURTAIN_MAX_SLANT_FRAC;

  // The sliders below update state on every drag tick (that's how a range
  // input works). If the timeline effect depended on that state directly,
  // every tick would tear down and restart the whole ~1.5s sequence — so
  // while you're actively dragging it never reaches the wipe at all, and
  // only plays once, automatically, the instant you let go. Easy to miss
  // entirely. Instead: sliders only update this ref. The timeline effect
  // depends on nothing but `transitionKey`, and reads whatever's currently
  // in the ref — so it only ever plays when you explicitly hit Replay,
  // using the settings on the sliders at that moment.
  const settingsRef = useRef({ slantFrac, wipeDuration, holdDuration, dimDuration, easeKey });
  useEffect(() => {
    settingsRef.current = { slantFrac, wipeDuration, holdDuration, dimDuration, easeKey };
  }, [slantFrac, wipeDuration, holdDuration, dimDuration, easeKey]);

  // Curtain-only timeline — no text animation anywhere in here on purpose.
  // Three beats, in order:
  //   1. The "outgoing page" stand-in dims uniformly.
  //   2. A solid panel snaps to fully opaque and holds.
  //   3. The panel's bottom edge rises to uncover the new page — flat or
  //      slanted depending on the `slant` control, top edge always pinned.
  useLayoutEffect(() => {
    const curtain = curtainRef.current;
    const outgoing = outgoingRef.current;
    if (!curtain || !outgoing) return;

    const {
      slantFrac: slant,
      wipeDuration: wipeDur,
      holdDuration: holdDur,
      dimDuration: dimDur,
      easeKey: ease,
    } = settingsRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const proxy = { p: 0 };

      tl.set(outgoing, { autoAlpha: 1 })
        .set(curtain, { autoAlpha: 0, clipPath: buildCurtainClipPath(0, slant) })
        // Beat 1 — dim the outgoing content.
        .to(outgoing, { autoAlpha: 0, duration: dimDur, ease: "power2.out" }, "dim")
        // Beat 2 — curtain snaps to fully opaque as the dim finishes, then
        // holds with the wordmark showing before it starts moving.
        .to(curtain, { autoAlpha: 1, duration: 0.001 }, `dim+=${Math.max(dimDur - 0.05, 0)}`)
        .to({}, { duration: holdDur })
        // Beat 3 — the wipe. Driven by a 0→1 proxy so the clip-path can be
        // a slanted polygon instead of a plain inset().
        .to(proxy, {
          p: 1,
          duration: wipeDur,
          ease,
          onUpdate: () => {
            curtain.style.clipPath = buildCurtainClipPath(proxy.p, slant);
          },
        });
    });

    return () => ctx.revert();
  }, [transitionKey]);

  const handleCopySettings = () => {
    const snippet = [
      `const CURTAIN_SLANT = ${slantFrac.toFixed(3)}; // was ${slant} on the -100..100 slider`,
      `// wipe duration: ${wipeDuration.toFixed(2)}s, ease: "${easeKey}"`,
      `// hold duration: ${holdDuration.toFixed(2)}s, dim duration: ${dimDuration.toFixed(2)}s`,
    ].join("\n");
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
          The curtain box below (and its settings panel) is a self-contained
          component demo — it replays a GSAP timeline in place, it does not
          navigate anywhere. It&apos;s the sandbox for tuning the curtain
          itself: slant, timing, easing. It is NOT the real thing. The real,
          live page-to-page transition now runs on actual navigation via{" "}
          <code>TransitionLink</code> (wired into the site&apos;s header
          nav, and into the link below), and now shares the exact same
          clip-path math as this sandbox via{" "}
          <code>src/lib/curtainClipPath.ts</code> — a URL you load directly
          never shows a transition, since there&apos;s no previous page to
          transition from. Click through to see the real one:
        </p>
        <TransitionLink
          href="/pageslidetransition"
          className="w-fit rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          See the real transition →
        </TransitionLink>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <span
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: "var(--color-accent)" }}
          >
            The page-transition curtain — testing sandbox
          </span>
          <p className="mt-2 max-w-xl text-base text-white/60 leading-relaxed">
            Outgoing content dims, a solid panel snaps to fully opaque and
            holds, then it wipes away — bottom edge rising, top edge fixed.
            No scale or zoom on the photo underneath. Nothing here animates
            text; that&apos;s deliberate.{" "}
            <strong className="text-white">
              Adjust the sliders, then click &quot;Replay page
              transition&quot;
            </strong>{" "}
            to preview them — moving a slider only updates the number, it
            doesn&apos;t auto-play (dragging while it&apos;s mid-animation
            would just cancel it every tick and you&apos;d never see it
            finish). Copy the settings once it feels right.
          </p>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
          {/* Incoming page — mounted the whole time, just hidden under the curtain until the wipe. */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero-banner.png"
              alt="7th Heaven"
              fill
              sizes="100vw"
              priority
              unoptimized
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span
                className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                7th Heaven Live
              </span>
            </div>
          </div>

          {/* Beat 1 — the outgoing page's stand-in content, dims out before the curtain takes over. */}
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

          {/* Beat 2 + 3 — the curtain: hidden until the dim finishes, then opaque, then wipes away.
              NOT `bg-black`: globals.css strips background-color to transparent
              on that exact class site-wide with `!important` (see PageTransition.tsx
              for the full explanation). Setting the fill inline keeps this curtain
              out of that rule. */}
          <div
            ref={curtainRef}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ backgroundColor: "#000", clipPath: buildCurtainClipPath(0, slantFrac) }}
          >
            <span
              className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              7th Heaven
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>
              Wipe edge slant —{" "}
              {slant === 0
                ? "flat (matches the reference site)"
                : slant > 0
                ? `right leads +${slant}`
                : `left leads ${slant}`}
            </span>
            <input
              type="range"
              min={-100}
              max={100}
              step={1}
              value={slant}
              onChange={(e) => setSlant(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>Wipe duration — {wipeDuration.toFixed(2)}s</span>
            <input
              type="range"
              min={0.4}
              max={2}
              step={0.05}
              value={wipeDuration}
              onChange={(e) => setWipeDuration(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>Hold duration (curtain fully covering) — {holdDuration.toFixed(2)}s</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={holdDuration}
              onChange={(e) => setHoldDuration(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>Dim duration (outgoing fade) — {dimDuration.toFixed(2)}s</span>
            <input
              type="range"
              min={0.1}
              max={0.8}
              step={0.05}
              value={dimDuration}
              onChange={(e) => setDimDuration(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-white/70 sm:col-span-2">
            <span>Wipe ease</span>
            <select
              value={easeKey}
              onChange={(e) => setEaseKey(e.target.value)}
              className="rounded border border-white/15 bg-black/40 px-2 py-1.5 text-white"
            >
              {EASE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTransitionKey((k) => k + 1)}
            className="w-fit rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-[var(--color-accent)] hover:text-white"
          >
            Replay page transition
          </button>
          <button
            type="button"
            onClick={handleCopySettings}
            className="w-fit rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-[var(--color-accent)] hover:text-white"
          >
            {copied ? "Copied!" : "Copy current settings"}
          </button>
        </div>
      </section>

      {/*
        Deliberately a <div>, not <header>: globals.css has a bare `header {
        height: 88px }` rule (min-width: 1024px block) meant for the site's
        real nav bar. Using the semantic <header> tag here let that rule
        clamp this block to a fixed 88px box regardless of its actual flex
        content, so this section's own height stopped matching what was
        visually rendered and the next section down painted over the tail
        of the headline/paragraph/button. That looked like the reveal was
        "stuck" — it wasn't; it was just being covered.

        This SplitText demo below is unrelated to the page-transition
        curtain above — it's kept as a separate reference for the
        character-stagger text effect, on its own replay button.
      */}
      <div className="flex flex-col gap-6 border-t border-white/10 pt-10">
        <span
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--color-accent)" }}
        >
          Slide-up reveal · GSAP SplitText demo (unrelated to the curtain above)
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
