"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import { buildDecayingSlantCoverClipPath } from "@/lib/curtainClipPath";

const EXO_EASE = "cubic-bezier(0.496, 0.004, 0, 1)";
const WIPE_SLANT_RATIO = 0.095;

// ---------------------------------------------------------------------------
// Shared little "browser" chrome so all three demos sit inside an identical
// frame -- makes it obvious the header/nav never participates in any of
// these transitions, only the content area underneath it does.
// ---------------------------------------------------------------------------
function DemoFrame({
  label,
  children,
  onPlay,
  playing,
}: {
  label: string;
  children: React.ReactNode;
  onPlay: () => void;
  playing: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold ">{label}</h2>
        <button
          onClick={onPlay}
          disabled={playing}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm   tracking-wide transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? "Playing…" : "Replay"}
        </button>
      </div>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black"
        style={{ aspectRatio: "16 / 11" }}
      >
        {/* fixed chrome -- never touched by any transition */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-2 backdrop-blur-sm">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
            7th Heaven Studio
          </span>
          <span className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          </span>
        </div>
        <div className="absolute inset-0 top-9">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Curtain wipe -- the effect currently wired into PageTransition.tsx.
//    Reuses the same buildDecayingSlantCoverClipPath helper the real site
//    uses, at the same ratio/duration/ease, with no rotate (per the fix).
// ---------------------------------------------------------------------------
// Reveal-ease presets available in the tuning panel below. "power2.out" is
// the current default (see CurtainWipeDemo's doc comment for why); the
// site's real EXO_EASE is included so you can A/B against production feel.
const REVEAL_EASE_OPTIONS: { label: string; value: string }[] = [
  { label: "power1.out", value: "power1.out" },
  { label: "power2.out (default)", value: "power2.out" },
  { label: "power3.out", value: "power3.out" },
  { label: "power4.out", value: "power4.out" },
  { label: "sine.out", value: "sine.out" },
  { label: "circ.out", value: "circ.out" },
  { label: "expo.out", value: "expo.out" },
  { label: "back.out(1.2)", value: "back.out(1.2)" },
  { label: "power1.inOut", value: "power1.inOut" },
  { label: "power2.inOut", value: "power2.inOut" },
  { label: "linear", value: "linear" },
  { label: "site cubic-bezier (EXO_EASE)", value: EXO_EASE },
];

// Mirror of buildDecayingSlantCoverClipPath -- same decaying-slant math, just
// with the lagging/leading edges swapped left<->right. The production
// helper in @/lib/curtainClipPath is left untouched (it's measured directly
// off the real exoape.com footage and is shared with PageTransition.tsx);
// this lives here purely so the demo's "flip" toggle can mirror the shape
// without risking the verified production curve.
function buildDecayingSlantCoverClipPathFlipped(progress: number, ratio: number, rampFraction = 0.05) {
  const p = Math.max(0, Math.min(1, progress));
  const rightY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leftY = rightY / (1 + rampedRatio);
  return `polygon(0% ${leftY}%, 100% ${rightY}%, 100% 100%, 0% 100%)`;
}

// Complement of the reveal mask above, for the OLD PAGE's exit. Instead of
// uncovering the region BELOW the diagonal line (like buildClip does for
// the incoming layer), this carves away the region ABOVE it -- so as its
// own progress goes 0 -> 1 the old page gets trimmed down to nothing along
// the exact same decaying-slant edge, respecting the same ratio and flip
// state as the reveal. This is what wires the old page into the same
// speed/easing/slant/flip UI setup the panel controls, instead of it just
// scaling/translating as a plain rectangle.
function buildOldPageExitClipPath(progress: number, ratio: number, flip: boolean, rampFraction = 0.05) {
  const p = Math.max(0, Math.min(1, progress));
  const lagY = 100 * (1 - p);
  const rampedRatio = ratio * Math.min(1, p / (rampFraction || 1));
  const leadY = lagY / (1 + rampedRatio);
  const leftY = flip ? leadY : lagY;
  const rightY = flip ? lagY : leadY;
  return `polygon(0% 0%, 100% 0%, 100% ${rightY}%, 0% ${leftY}%)`;
}

function CurtainWipeDemo() {
  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const oldRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  // Tunable knobs -- exposed via the control panel under the demo so you can
  // feel out speed/easing/slant combinations live instead of round-tripping
  // through code edits. "revealDuration"/"revealEase"/"slantRatio"/"flipSlant"
  // now drive BOTH halves of the transition: the incoming reveal (content
  // settle + clip-path sweep) and the outgoing old-page exit, so the whole
  // thing feels like one consistent move instead of two unrelated animations.
  const [revealEase, setRevealEase] = useState("circ.out");
  // How much the incoming page scales DOWN as it settles into place
  // (1.3 = starts at 130% and shrinks to 100%). This was previously
  // hardcoded and barely visible because it decays in lockstep with the
  // clip-path reveal -- tunable now so it can be pushed higher to
  // actually read as a scale effect.
  // Default to 1 (no scale) -- the reveal should read as a straight
  // slide-up + slanted clip-path wipe, not a zoom. Slider below still
  // lets you dial scale back in if you want that combined look.
  const [revealScale, setRevealScale] = useState(1);
  const [slantRatio, setSlantRatio] = useState(0.18);
  // false (default) matches the real exoape.com footage this was measured
  // from -- right edge leads/reveals first, left edge lags. true swaps it.
  const [flipSlant, setFlipSlant] = useState(true);
  const buildClip = flipSlant ? buildDecayingSlantCoverClipPathFlipped : buildDecayingSlantCoverClipPath;

  // Independent knobs for the OLD PAGE's own exit -- previously this reused
  // revealDuration/revealEase/slantRatio/flipSlant wholesale, which made it
  // impossible to feel out (say) a snappier exit against a slower reveal.
  // Same defaults as the reveal knobs above, so nothing changes until you
  // actually move a slider.
  const [oldDuration, setOldDuration] = useState(0.3);
  const [oldEase, setOldEase] = useState("circ.out");
  const [oldSlantRatio, setOldSlantRatio] = useState(0.18);
  const [oldFlipSlant, setOldFlipSlant] = useState(true);
  // How much the old page scales UP as it exits (1.3 = 130%, the original
  // hardcoded value). Higher reads as a more aggressive "zoom past camera"
  // exit; 1.0 would mean it just slides/wipes off with no zoom at all.
  const [oldScale, setOldScale] = useState(1.3);
  // How much the old page rotates as it exits, in degrees. 0 = no
  // rotation (original behavior). Positive spins clockwise.
  const [oldRotation, setOldRotation] = useState(0);

  // Derived, not independently tunable: play() always runs the reveal
  // exactly 0.25s slower than the current exit speed (oldDuration above),
  // so the two start together and the reveal simply takes longer.
  const revealDuration = oldDuration + 0.25;

  const play = () => {
    if (playing) return;
    setPlaying(true);

    const el = outerRef.current!.parentElement!;
    const height = el.clientHeight;

    // Pre-hide the incoming content
    gsap.set(outerRef.current, { clipPath: buildClip(0, slantRatio) });
    gsap.set(contentRef.current, { scale: revealScale, y: height / 2 });
    gsap.set(oldRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });

    const tl = gsap.timeline({
      onComplete: () => setPlaying(false),
    });

    // Outgoing snapshot flies away AND wipes off along diagonal
    tl.fromTo(
      oldRef.current,
      { scale: 1, y: 0, opacity: 1 },
      {
        scale: oldScale,
        y: -height / 2 - 30,
        rotation: oldRotation,
        duration: oldDuration,
        ease: oldEase,
        onUpdate: function () {
          const p = this.progress();
          if (oldRef.current) oldRef.current.style.clipPath = buildOldPageExitClipPath(p, oldSlantRatio, oldFlipSlant);
        },
      },
      0
    );
    // Incoming reveal -- content settle and clip-path sweep share duration/ease
    tl.to(contentRef.current, { scale: 1, y: 0, duration: revealDuration, ease: revealEase, clearProps: "all" }, 0);
    tl.to(
      { p: 0 },
      {
        p: 1,
        duration: revealDuration,
        ease: revealEase,
        onUpdate: function () {
          const p = (this.targets()[0] as { p: number }).p;
          if (outerRef.current) outerRef.current.style.clipPath = buildClip(p, slantRatio);
        },
        onComplete: () => {
          if (outerRef.current) outerRef.current.style.clipPath = "none";
        },
      },
      0
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <DemoFrame label="Curtain wipe (current)" onPlay={play} playing={playing}>
        <div className="relative h-full w-full bg-black overflow-hidden">
          <div ref={oldRef} className="absolute inset-0 z-0">
            <Image src="/preloader-demo/cruise-v2.jpg" alt="" fill sizes="100vw" unoptimized className="h-full w-full object-cover object-top" />
            <span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white/90">
              Cruise (old)
            </span>
          </div>
          <div ref={outerRef} className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" }}>
            <div ref={contentRef} className="relative h-full w-full">
              <Image src="/preloader-demo/book.jpg" alt="" fill sizes="100vw" unoptimized className="h-full w-full object-cover object-top" />
              <span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white/90">
                Book (new)
              </span>
            </div>
          </div>
        </div>
      </DemoFrame>

      {/* Tuning panel -- speed / easing / slant, live-wired into play() above */}
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]   /80">New page reveal</p>
        <div className="flex items-center justify-between gap-3">
          <label className="text-white/60">
            Reveal speed <span className="text-white/35">(exit + 0.25s, linked)</span>
          </label>
          <span className="font-mono text-white/80">{revealDuration.toFixed(2)}s</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={1.5}
          step={0.05}
          value={revealDuration}
          disabled
          readOnly
          className="w-full accent-cyan-400 opacity-50 cursor-not-allowed"
        />

        <div className="flex items-center justify-between gap-3">
          <label htmlFor="reveal-scale" className="text-white/60">
            Reveal scale
          </label>
          <span className="font-mono text-white/80">{revealScale.toFixed(2)}x</span>
        </div>
        <input
          id="reveal-scale"
          type="range"
          min={1}
          max={2}
          step={0.05}
          value={revealScale}
          onChange={(e) => setRevealScale(parseFloat(e.target.value))}
          className="w-full accent-cyan-400"
        />

        <label htmlFor="reveal-ease" className="text-white/60">
          Reveal easing
        </label>
        <select
          id="reveal-ease"
          value={revealEase}
          onChange={(e) => setRevealEase(e.target.value)}
          className="w-full rounded border border-white/15 bg-black/40 px-2 py-1.5 text-white/90"
        >
          {REVEAL_EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className=" text-white">
              {o.label}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between gap-3">
          <label htmlFor="slant-ratio" className="text-white/60">
            Slant ratio
          </label>
          <span className="font-mono text-white/80">{slantRatio.toFixed(3)}</span>
        </div>
        <input
          id="slant-ratio"
          type="range"
          min={0}
          max={0.3}
          step={0.005}
          value={slantRatio}
          onChange={(e) => setSlantRatio(parseFloat(e.target.value))}
          className="w-full accent-cyan-400"
        />

        <label className="flex items-center gap-2 text-white/60">
          <input
            type="checkbox"
            checked={flipSlant}
            onChange={(e) => setFlipSlant(e.target.checked)}
            className="accent-cyan-400"
          />
          Flip slant direction {flipSlant ? "(left leads)" : "(right leads -- matches reference)"}
        </label>
      </div>

      {/* Old-page exit panel -- independent speed/easing/slant/flip, wired
          into the tl.fromTo(oldRef.current, ...) tween in play() above. */}
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400/80">Old page exit</p>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="old-duration" className="text-white/60">
            Exit speed
          </label>
          <span className="font-mono text-white/80">{oldDuration.toFixed(2)}s</span>
        </div>
        <input
          id="old-duration"
          type="range"
          min={0.2}
          max={1.5}
          step={0.05}
          value={oldDuration}
          onChange={(e) => setOldDuration(parseFloat(e.target.value))}
          className="w-full accent-fuchsia-400"
        />

        <div className="flex items-center justify-between gap-3">
          <label htmlFor="old-scale" className="text-white/60">
            Exit scale
          </label>
          <span className="font-mono text-white/80">{oldScale.toFixed(2)}x</span>
        </div>
        <input
          id="old-scale"
          type="range"
          min={1}
          max={2}
          step={0.05}
          value={oldScale}
          onChange={(e) => setOldScale(parseFloat(e.target.value))}
          className="w-full accent-fuchsia-400"
        />

        <div className="flex items-center justify-between gap-3">
          <label htmlFor="old-rotation" className="text-white/60">
            Exit rotation
          </label>
          <span className="font-mono text-white/80">{oldRotation}°</span>
        </div>
        <input
          id="old-rotation"
          type="range"
          min={-45}
          max={45}
          step={1}
          value={oldRotation}
          onChange={(e) => setOldRotation(parseFloat(e.target.value))}
          className="w-full accent-fuchsia-400"
        />

        <label htmlFor="old-ease" className="text-white/60">
          Exit easing
        </label>
        <select
          id="old-ease"
          value={oldEase}
          onChange={(e) => setOldEase(e.target.value)}
          className="w-full rounded border border-white/15 bg-black/40 px-2 py-1.5 text-white/90"
        >
          {REVEAL_EASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className=" text-white">
              {o.label}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between gap-3">
          <label htmlFor="old-slant-ratio" className="text-white/60">
            Slant ratio
          </label>
          <span className="font-mono text-white/80">{oldSlantRatio.toFixed(3)}</span>
        </div>
        <input
          id="old-slant-ratio"
          type="range"
          min={0}
          max={0.3}
          step={0.005}
          value={oldSlantRatio}
          onChange={(e) => setOldSlantRatio(parseFloat(e.target.value))}
          className="w-full accent-fuchsia-400"
        />

        <label className="flex items-center gap-2 text-white/60">
          <input
            type="checkbox"
            checked={oldFlipSlant}
            onChange={(e) => setOldFlipSlant(e.target.checked)}
            className="accent-fuchsia-400"
          />
          Flip slant direction {oldFlipSlant ? "(left leads)" : "(right leads -- matches reference)"}
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Glitch / RGB-split cut -- the "Metropole -> Acheter du Neuf" style cut.
//    Label swaps almost instantly; 3 tinted layers jitter apart with a
//    stepped (not smooth) ease while a jagged clip-path tears them, then
//    everything resolves clean onto the new content.
// ---------------------------------------------------------------------------
function jaggedPolygon(intensity: number) {
  // A handful of horizontal bands, each independently offset left/right --
  // intensity 1 = maximum tear, 0 = clean rectangle.
  const bands = 6;
  let top = "polygon(";
  const points: string[] = [];
  for (let i = 0; i <= bands; i++) {
    const y = (i / bands) * 100;
    const jitter = (Math.random() - 0.5) * intensity * 18;
    points.push(`${0 + jitter}% ${y}%`);
  }
  for (let i = bands; i >= 0; i--) {
    const y = (i / bands) * 100;
    const jitter = (Math.random() - 0.5) * intensity * 18;
    points.push(`${100 + jitter}% ${y}%`);
  }
  return top + points.join(",") + ")";
}

function GlitchCutDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rLayer = useRef<HTMLDivElement>(null);
  const gLayer = useRef<HTMLDivElement>(null);
  const bLayer = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("OLD PAGE");

  const play = () => {
    if (playing) return;
    setPlaying(true);

    const layers = [rLayer.current!, gLayer.current!, bLayer.current!];
    gsap.set(layers, { opacity: 1, clipPath: "none", x: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(layers, { opacity: 0 });
        setPlaying(false);
      },
    });

    // 1. label swaps instantly, well before the image resolves
    tl.call(() => setLabel("NEW PAGE"), [], 0.03);

    // 2. peak chaos: jitter + jagged tearing, stepped easing = stutter
    const proxy = { t: 0 };
    tl.to(
      proxy,
      {
        t: 1,
        duration: 0.32,
        ease: "steps(6)",
        onUpdate: () => {
          const intensity = 1 - proxy.t;
          layers.forEach((el, i) => {
            const dir = i === 0 ? -1 : i === 2 ? 1 : 0;
            gsap.set(el, {
              x: dir * intensity * gsap.utils.random(4, 14),
              clipPath: jaggedPolygon(intensity),
            });
          });
        },
        onComplete: () => gsap.set(layers, { x: 0, clipPath: "none" }),
      },
      0
    );

    return tl;
  };

  return (
    <DemoFrame label="Glitch / RGB-split cut" onPlay={play} playing={playing}>
      <div ref={stageRef} className="relative h-full w-full overflow-hidden bg-gradient-to-br from-orange-900 to-red-950">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black ">{label}</span>
        </div>
        {/* RGB-tinted tearing layers, hidden until played */}
        <div ref={rLayer} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-900 to-red-950 opacity-0 mix-blend-screen" style={{ filter: "sepia(1) saturate(6) hue-rotate(-50deg)" }}>
          <span className="text-2xl font-black ">{label}</span>
        </div>
        <div ref={gLayer} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-900 to-red-950 opacity-0 mix-blend-screen" style={{ filter: "sepia(1) saturate(6) hue-rotate(90deg)" }}>
          <span className="text-2xl font-black ">{label}</span>
        </div>
        <div ref={bLayer} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-900 to-red-950 opacity-0 mix-blend-screen" style={{ filter: "sepia(1) saturate(6) hue-rotate(220deg)" }}>
          <span className="text-2xl font-black ">{label}</span>
        </div>
      </div>
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// 3. Fade to black, then a straight-edge rise from the bottom -- the
//   "Acheter du Neuf card -> full case study" transition.
// ---------------------------------------------------------------------------
function FadeThenRiseDemo() {
  const oldRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (playing) return;
    setPlaying(true);

    gsap.set(oldRef.current, { opacity: 1 });
    gsap.set(newRef.current, { clipPath: "inset(100% 0 0 0)" });

    const tl = gsap.timeline({ onComplete: () => setPlaying(false) });
    tl.to(oldRef.current, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
    tl.to({}, { duration: 0.35 }); // hold on black
    tl.to(newRef.current, { clipPath: "inset(0% 0 0 0)", duration: 0.4, ease: "power2.out" });
  };

  return (
    <DemoFrame label="Fade to black + bottom rise" onPlay={play} playing={playing}>
      <div className="relative h-full w-full bg-black">
        <div ref={oldRef} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-800 to-teal-950">
          <span className="text-2xl font-black ">OLD PAGE</span>
        </div>
        {/* title stays pinned/visible through the whole fade, like the reference */}
        <span className="absolute bottom-3 left-4 z-10 text-sm font-black uppercase tracking-widest text-white">
          old page
        </span>
        <div ref={newRef} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-800 to-slate-950">
          <span className="text-2xl font-black ">NEW PAGE</span>
        </div>
      </div>
    </DemoFrame>
  );
}

export default function PreloadersTestPage() {
  return (
    <main className="min-h-screen bg-[#05030a] px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Internal test page</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Preloader / transition test bench</h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Three self-contained transition demos, isolated from real routing so you can play each one back
          to back and compare. The curtain wipe is what&apos;s currently wired into the real site&apos;s
          page navigation; the other two are the effects pulled from the Stratal Scenography reference video.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <CurtainWipeDemo />
          <GlitchCutDemo />
          <FadeThenRiseDemo />
        </div>
      </div>
    </main>
  );
}
