"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Rebuilt from fluxtheory.in. Three effects run that site's headings:
 *   1. blur sweep  — per character: blur + fade, staggered across the line
 *   2. word rise   — per word: lift + fade
 *   3. line cycler — a fixed lead-in with a rotating phrase under it
 * Everything here is plain CSS + a little JS; no animation library.
 * ------------------------------------------------------------------ */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type SweepOpts = { blur: number; stagger: number; duration: number; rise: number };
const DEFAULTS: SweepOpts = { blur: 34, stagger: 13, duration: 400, rise: 14 };

/** Page-wide on/off switches for each part of the transition. */
type Fx = { rise: boolean; blur: boolean; fade: boolean };
const FX_DEFAULTS: Fx = { rise: true, blur: true, fade: true };
const FxContext = createContext<Fx>(FX_DEFAULTS);

/** Splits to characters and animates blur+fade across them, left to right. */
function BlurSweep({
  text,
  opts,
  playKey,
  className = "",
}: {
  text: string;
  opts: SweepOpts;
  playKey: number;
  className?: string;
}) {
  const chars = [...text];
  const fx = useContext(FxContext);
  return (
    <span className="at-title" aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={`${playKey}-${i}`}
          aria-hidden="true"
          className={`at-char ${className}`}
          style={{
            animation: `atBlurSweep ${opts.duration}ms ${EASE} ${i * opts.stagger}ms both`,
            ["--at-blur" as string]: `${fx.blur ? opts.blur : 0}px`,
            ["--at-rise" as string]: `${fx.rise ? opts.rise : 0}px`,
            ["--at-fade" as string]: fx.fade ? 0 : 1,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/** Splits to words and lifts each one in. */
function WordRise({
  text,
  playKey,
  stagger = 70,
  duration = 700,
}: {
  text: string;
  playKey: number;
  stagger?: number;
  duration?: number;
}) {
  const fx = useContext(FxContext);
  return (
    <span aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={`${playKey}-${i}`} className="ih-word-wrap" aria-hidden="true">
          <span
            className="ih-word"
            style={{
              animation: `ihWordRise ${duration}ms ${EASE} ${i * stagger}ms both`,
              ["--ih-rise" as string]: fx.rise ? "110%" : "0%",
              ["--ih-blur" as string]: fx.blur ? "8px" : "0px",
              ["--ih-fade" as string]: fx.fade ? 0 : 1,
            }}
          >
            {w}
          </span>
          {" "}
        </span>
      ))}
    </span>
  );
}

/** Fixed lead-in with a phrase that swaps underneath, word by word. */
function LineCycler({ lead, lines, hold = 2600 }: { lead: string; lines: string[]; hold?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % lines.length), hold);
    return () => window.clearTimeout(t);
  }, [i, paused, hold, lines.length]);
  return (
    <div className="flex flex-col items-start">
      <span className="block">{lead}</span>
      <span className="relative block">
        {/* invisible longest line keeps the box from jumping */}
        <span className="invisible block" aria-hidden="true">
          {lines.reduce((a, b) => (b.length > a.length ? b : a))}
        </span>
        <span className="absolute inset-0 block">
          <WordRise key={i} text={lines[i]} playKey={i} />
        </span>
      </span>
      <button
        onClick={() => setPaused((p) => !p)}
        className="mt-4 min-h-[36px] rounded-full border border-white/20 bg-white/5 px-4 text-xs uppercase text-white transition-colors hover:bg-white/10"
      >
        {paused ? "Resume" : "Pause"} cycle
      </button>
    </div>
  );
}

/** Replays its children whenever they scroll back into view. */
function Replayable({
  children,
}: {
  children: (playKey: number, replay: () => void) => React.ReactNode;
}) {
  const [playKey, setPlayKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const replay = useCallback(() => setPlayKey((k) => k + 1), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setPlayKey((k) => k + 1);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{children(playKey, replay)}</div>;
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-xs uppercase transition-colors ${
        on
          ? "border-[var(--color-action)] bg-[var(--color-action)] font-semibold text-black"
          : "border-white/20 bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${on ? "bg-black" : "bg-white/30"}`}
      />
      {label} {on ? "on" : "off"}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs text-[var(--color-text-muted)]">
        {label}
        <span className="tabular-nums text-white">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-action)]"
      />
    </label>
  );
}

export default function TextTestClient() {
  const [opts, setOpts] = useState<SweepOpts>(DEFAULTS);
  const set = (k: keyof SweepOpts) => (v: number) => setOpts((o) => ({ ...o, [k]: v }));
  const [fx, setFx] = useState<Fx>(FX_DEFAULTS);
  // bumping this remounts the demos so a toggle change replays them right away
  const [fxKey, setFxKey] = useState(0);
  const toggle = (k: keyof Fx) => (v: boolean) => {
    setFx((f) => ({ ...f, [k]: v }));
    setFxKey((n) => n + 1);
  };

  return (
    <main className="text-test-page mx-auto w-full max-w-5xl px-4 pb-32 pt-28 md:px-8">
      <header className="mb-16 flex flex-col gap-3">
        <p className="text-xs uppercase text-[var(--color-text-muted)]">Test page</p>
        <h1 className="uppercase text-white">Text transitions</h1>
        <p className="max-w-[65ch] text-[var(--color-text-secondary)]">
          The heading animations from fluxtheory.in, rebuilt in plain CSS. Each one replays when it
          scrolls back into view, or press replay. Scroll down and back up to see them fire.
        </p>
      </header>

      <div className="sticky top-4 z-20 -mx-2 mb-16 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-md">
        <span className="mr-2 text-xs uppercase text-[var(--color-text-muted)]">Effects</span>
        <Toggle label="Rise" on={fx.rise} onChange={toggle("rise")} />
        <Toggle label="Blur" on={fx.blur} onChange={toggle("blur")} />
        <Toggle label="Fade" on={fx.fade} onChange={toggle("fade")} />
        {(!fx.rise || !fx.blur || !fx.fade) && (
          <button
            type="button"
            onClick={() => {
              setFx(FX_DEFAULTS);
              setFxKey((n) => n + 1);
            }}
            className="ml-auto min-h-[40px] px-3 text-xs uppercase text-[var(--color-text-secondary)] underline-offset-4 hover:underline"
          >
            All on
          </button>
        )}
      </div>

      <FxContext.Provider value={fx}>
      <div key={fxKey}>

      {/* 1 — blur sweep */}
      <section className="mb-24 border-t border-white/10 pt-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="uppercase text-white">01 — Blur sweep</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Per character: blur and fade, staggered left to right.
          </p>
        </div>

        <Replayable>
          {(playKey, replay) => (
            <>
              <div
                className="font-[family-name:var(--font-display)] uppercase leading-[0.95] text-white"
                style={{ fontSize: "clamp(2.5rem, 9vw, 6rem)" }}
              >
                <BlurSweep text="Feel the sound" opts={opts} playKey={playKey} />
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Slider label="Start blur" value={opts.blur} min={0} max={40} unit="px" onChange={set("blur")} />
                <Slider label="Stagger" value={opts.stagger} min={0} max={160} unit="ms" onChange={set("stagger")} />
                <Slider label="Duration" value={opts.duration} min={200} max={2000} step={50} unit="ms" onChange={set("duration")} />
                <Slider label="Rise" value={opts.rise} min={0} max={60} unit="px" onChange={set("rise")} />
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={replay}
                  className="min-h-[44px] rounded-full bg-[var(--color-action)] px-5 text-sm font-semibold text-black transition-transform duration-150 hover:scale-105 active:scale-95"
                >
                  Replay
                </button>
                <button
                  onClick={() => setOpts(DEFAULTS)}
                  className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </Replayable>
      </section>

      {/* 2 — word rise */}
      <section className="mb-24 border-t border-white/10 pt-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="uppercase text-white">02 — Word rise</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Per word: lifts up from behind a clipped line.
          </p>
        </div>
        <Replayable>
          {(playKey, replay) => (
            <>
              <div
                className="font-[family-name:var(--font-display)] uppercase leading-[1.05] text-white"
                style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
              >
                <WordRise text="Forty years of Chicago rock and roll" playKey={playKey} />
              </div>
              <button
                onClick={replay}
                className="mt-6 min-h-[44px] rounded-full bg-[var(--color-action)] px-5 text-sm font-semibold text-black transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                Replay
              </button>
            </>
          )}
        </Replayable>
      </section>

      {/* 3 — line cycler */}
      <section className="mb-24 border-t border-white/10 pt-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="uppercase text-white">03 — Line cycler</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Fixed lead-in, rotating phrase underneath. This is the hero effect.
          </p>
        </div>
        <div
          className="font-[family-name:var(--font-display)] uppercase leading-[1.02] text-white"
          style={{ fontSize: "clamp(2rem, 7vw, 4.5rem)" }}
        >
          <LineCycler
            lead="Hear the"
            lines={["crowd lift you.", "guitars move you.", "night carry you."]}
          />
        </div>
      </section>

      {/* 4 — the two together, as the real hero does it */}
      <section className="border-t border-white/10 pt-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="uppercase text-white">04 — Combined</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Blur sweep on the heading, word rise on the line under it.
          </p>
        </div>
        <Replayable>
          {(playKey, replay) => (
            <>
              <div
                className="font-[family-name:var(--font-display)] uppercase leading-[0.95] text-white"
                style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
              >
                <BlurSweep text="The Sport" opts={opts} playKey={playKey} />
              </div>
              <div className="mt-3 text-[var(--color-text-secondary)]" style={{ fontSize: "clamp(0.9rem, 2vw, 1.25rem)" }}>
                <WordRise text="For the sport in you — stay charged — be ready to play" playKey={playKey} stagger={55} />
              </div>
              <button
                onClick={replay}
                className="mt-6 min-h-[44px] rounded-full bg-[var(--color-action)] px-5 text-sm font-semibold text-black transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                Replay
              </button>
            </>
          )}
        </Replayable>
      </section>
      </div>
      </FxContext.Provider>

      <style>{`
        /* the site intro overlay sits on top in dev; this is a test route, so drop it */
        body:has(.text-test-page) .preloader-overlay { display: none !important; }
        .at-title { display: inline; }
        .at-char { display: inline-block; will-change: opacity, transform, filter; }
        @keyframes atBlurSweep {
          from { opacity: var(--at-fade, 0); filter: blur(var(--at-blur, 34px)); transform: translate3d(0, var(--at-rise, 14px), 0); }
          to   { opacity: 1; filter: blur(0px);                   transform: translate3d(0, 0, 0); }
        }
        .ih-word-wrap { display: inline-block; overflow: hidden; vertical-align: bottom; }
        .ih-word { display: inline-block; will-change: opacity, transform, filter; }
        @keyframes ihWordRise {
          from { opacity: var(--ih-fade, 0); filter: blur(var(--ih-blur, 0px)); transform: translate3d(0, var(--ih-rise, 110%), 0); }
          to   { opacity: 1; filter: blur(0px); transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .at-char, .ih-word { animation: none !important; opacity: 1 !important; filter: none !important; transform: none !important; }
        }
      `}</style>
    </main>
  );
}
