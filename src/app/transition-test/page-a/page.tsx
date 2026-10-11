"use client";

import React from "react";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Stack } from "@/components/Stack";
import {
  useWebGLTransition,
  WebGLTransitionLink,
  WebGLControlDeck,
} from "@/components/WebGLNoiseTransition";
import { Play, Sparkles, Layers, Sliders, ShieldCheck } from "lucide-react";
import { DotChevronRight } from "@/components/ui/DotArrow";

export default function TransitionTestPageA() {
  const { config, previewInPlace, isTransitioning } = useWebGLTransition();

  return (
    <main className="min-h-screen py-10 flex flex-col gap-12 bg-transparent text-white">
      {/* Hero Section */}
      <PageSection
        id="hero-a"
        size="lg"
        aria-labelledby="hero-a-heading"
        data-scrub-target="hero"
      >
        <Stack gap="lg" className="max-w-4xl mx-auto text-center items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1.5 text-xs font-semibold text-purple-300 shadow-xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Codrops Barba.js &amp; GSAP About Transition</span>
          </div>

          {/* heading-size-ok: WebGL transition hero title */}
          <h1
            id="hero-a-heading"
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md"
          >
            Page A: Band Showcase &amp; Discography
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed drop-shadow-xs">
            Experience the custom WebGL noise dissolve transition directly over the live background shader canvas. Inspired by{" "}
            <span className="text-white font-semibold underline decoration-purple-400/50">
              page-transitions-astro-barba-gsap.crnacura.workers.dev/about/
            </span>
            .
          </p>

          {/* Interactive Navigation Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <WebGLTransitionLink
              href="/transition-test/page-b"
              className="inline-flex items-center gap-2.5 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:bg-purple-500 active:scale-95 transition-[background-color,transform] duration-150"
            >
              <span>Transition to Page B</span>
              <DotChevronRight className="w-4 h-4" />
            </WebGLTransitionLink>

            <button
              type="button"
              disabled={isTransitioning}
              onClick={() => previewInPlace()}
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/15 active:scale-95 transition-[border-color,background-color,transform] duration-150 shadow-lg backdrop-blur-md disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-purple-400" />
              <span>Preview Dissolve In-Place</span>
            </button>
          </div>

          {/* Live Parameter Pill bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 backdrop-blur-md">
              <span className="text-purple-300">Target:</span>
              <span className="text-white font-semibold">
                {config.targetMode === "page-only" ? "Page Only (Background Untouched)" : "Full Overlay"}
              </span>
            </div>
            {config.targetMode === "page-only" ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">
                <span className="text-zinc-400">Noise Intensity:</span>
                <span className="text-white font-semibold">{config.displacementScale}px</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">
                <span className="text-zinc-400">Color:</span>
                <span className="text-white font-semibold">{config.color}</span>
                <span
                  className="w-3 h-3 rounded-full border border-white/30 ml-1 bg-[var(--live-color)]"
                  style={{ "--live-color": config.color } as React.CSSProperties}
                />
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 backdrop-blur-md">
              <span className="text-purple-300">Veil Opacity:</span>
              <span className="text-white font-semibold">
                {Math.round(config.maxAlpha * 100)}% (Transparent)
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">
              <span className="text-zinc-400">Duration:</span>
              <span className="text-white font-semibold">{config.duration.toFixed(2)}s</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">
              <span className="text-zinc-400">Ease:</span>
              <span className="text-purple-300 font-semibold">{config.ease}</span>
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* Live Transition Control Studio Section */}
      <PageSection
        id="control-studio"
        size="md"
        aria-labelledby="control-studio-heading"
        data-scrub-target="control-studio"
      >
        <Stack gap="lg">
          <SectionHeader
            id="control-studio-heading"
            title="Live Transition Control Studio"
            subtitle="Complete interactive control: freeze time, scrub frames, dial noise scale, edge feathering, speed, and opacity"
            badge="Diagnostic Studio"
            icon={Sliders}
          />
          <WebGLControlDeck />
        </Stack>
      </PageSection>

      {/* Feature Showcase Grid */}
      <PageSection
        id="showcase-content"
        size="md"
        aria-labelledby="showcase-content-heading"
        data-scrub-target="cards"
      >
        <Stack gap="lg">
          <SectionHeader
            id="showcase-content-heading"
            title="Band Milestone Highlights"
            subtitle="Real content over the animated background canvas to verify visual continuity and smooth rendering"
            badge="Live Content"
            icon={Layers}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
              <span className="text-3xl font-black text-purple-400">5,000+</span>
              {/* heading-size-ok: card title */}
              <h3 className="text-lg font-bold text-white">Live Concerts Performed</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                From festival main stages to intimate arenas across the Midwest, delivering unforgettable high-octane rock anthems for over 30 years.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
              <span className="text-3xl font-black text-cyan-400">30+</span>
              {/* heading-size-ok: card title */}
              <h3 className="text-lg font-bold text-white">Albums &amp; Original Hits</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                A deep discography spanning chart-topping singles, melodic pop-rock originals, and timeless festival fan favorites.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
              <span className="text-3xl font-black text-rose-400">Guinness</span>
              {/* heading-size-ok: card title */}
              <h3 className="text-lg font-bold text-white">World Record Holders</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Recognized worldwide for extraordinary stamina, musical prowess, and passionate devotion to their loyal fan community.
              </p>
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* Technical Architecture Section */}
      <PageSection
        id="tech-specs"
        size="md"
        aria-labelledby="tech-specs-heading"
        data-scrub-target="specs"
      >
        <Stack gap="lg">
          <SectionHeader
            id="tech-specs-heading"
            title="Shader Architecture &amp; Implementation Details"
            subtitle="Reverse-engineered from the Codrops Astro/Barba.js About transition source"
            badge="Specs"
            icon={Sliders}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
            {/* heading-size-ok: card header */}
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>GLSL Noise Shader Function</span>
            </h3>
            <p className="text-sm text-zinc-300">
              The shader uses a pseudo-random hash combined with bilinear interpolation to generate smooth 2D value noise:
            </p>
            <pre className="rounded-xl border border-white/10 bg-black/50 p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
{`vec2 uv = vec2(vUv.x * uAspect, vUv.y);
float n = noise(uv * uNoiseScale);
float disolve = smoothstep(
  1.0 - uProgress - uEdge, 
  1.0 - uProgress + uEdge, 
  n
);
float alpha = 1.0 - disolve;
gl_FragColor = vec4(uColor, alpha);`}
            </pre>
          </div>

          <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
            {/* heading-size-ok: card header */}
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <span>GSAP Timeline Lifecycle</span>
            </h3>
            <ul className="text-sm text-zinc-300 space-y-3 list-disc list-inside">
              <li>
                <strong className="text-white">Leave Phase:</strong> Animates{" "}
                <code className="text-purple-300 bg-white/10 px-1 py-0.5 rounded">uProgress: 1.5 &rarr; -0.75</code> with{" "}
                <code className="text-purple-300 bg-white/10 px-1 py-0.5 rounded">power1.in</code> over 1.0s. Noise dissolves across the screen until fully covered.
              </li>
              <li>
                <strong className="text-white">Route Swap:</strong> Next.js updates route without unmounting the WebGL overlay.
              </li>
              <li>
                <strong className="text-white">Enter Phase:</strong> Animates{" "}
                <code className="text-purple-300 bg-white/10 px-1 py-0.5 rounded">uProgress: -0.75 &rarr; 1.5</code> revealing the new page.
              </li>
              <li>
                <strong className="text-white">On-Demand Rendering:</strong> Three.js renders only during GSAP updates, ensuring zero idle CPU or GPU consumption.
              </li>
            </ul>
          </div>
        </div>
        </Stack>
      </PageSection>
    </main>
  );
}
