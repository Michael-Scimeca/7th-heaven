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
import { Play, Flame, Music, Radio, Volume2, Sparkles, Sliders } from "lucide-react";
import { DotChevronLeft } from "@/components/ui/DotArrow";

export default function TransitionTestPageB() {
  const { config, previewInPlace, isTransitioning } = useWebGLTransition();

  return (
    <main className="min-h-screen py-10 flex flex-col gap-12 bg-transparent text-white">
      {/* Hero Section */}
      <PageSection
        id="hero-b"
        size="lg"
        aria-labelledby="hero-b-heading"
        data-scrub-target="hero"
      >
        <Stack gap="lg" className="max-w-4xl mx-auto text-center items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/40 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-xs backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Page B: Live Stage Arena</span>
          </div>

          {/* heading-size-ok: WebGL transition hero title */}
          <h1
            id="hero-b-heading"
            className="font-black tracking-tight text-white leading-tight drop-shadow-md"
          >
            Page B: Concert Experience &amp; Tour Life
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed drop-shadow-xs">
            You successfully transitioned into Page B using the WebGL noise dissolve shader directly over the live background canvas. Notice how the fluid canvas remains visible underneath without any solid color block.
          </p>

          {/* Interactive Navigation Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <WebGLTransitionLink
              href="/transition-test/page-a"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-rose-600/30 hover:opacity-95 active:scale-95 transition-[opacity,transform] duration-150"
            >
              <DotChevronLeft className="w-4 h-4" />
              <span>Transition Back to Page A</span>
            </WebGLTransitionLink>

            <button
              type="button"
              disabled={isTransitioning}
              onClick={() => previewInPlace()}
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/15 active:scale-95 transition-[border-color,background-color,transform] duration-150 shadow-lg backdrop-blur-md disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-amber-400" />
              <span>Preview Dissolve In-Place</span>
            </button>
          </div>

          {/* Live Parameter Pill bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 backdrop-blur-md">
              <span className="text-amber-300">Target:</span>
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
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 backdrop-blur-md">
              <span className="text-amber-300">Veil Opacity:</span>
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
              <span className="text-amber-300 font-semibold">{config.ease}</span>
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* Live Transition Control Studio Section */}
      <PageSection
        id="control-studio-b"
        size="md"
        aria-labelledby="control-studio-b-heading"
        data-scrub-target="control-studio"
      >
        <Stack gap="lg">
          <SectionHeader
            id="control-studio-b-heading"
            title="Live Transition Control Studio"
            subtitle="Complete interactive control: freeze time, scrub frames, dial noise scale, edge feathering, speed, and opacity"
            badge="Diagnostic Studio"
            icon={Sliders}
          />
          <WebGLControlDeck />
        </Stack>
      </PageSection>

      {/* Tour & Sound Specs */}
      <PageSection
        id="tour-specs"
        size="md"
        aria-labelledby="tour-specs-heading"
        data-scrub-target="cards"
      >
        <Stack gap="lg">
          <SectionHeader
            id="tour-specs-heading"
            title="Tour Production Capabilities"
            subtitle="Explore the live stage sound and arena production specs"
            badge="Live Tour"
            icon={Music}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
              <Volume2 className="w-8 h-8 text-amber-400" />
              <h3 className="font-bold text-white">Full Arena Line Arrays</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Custom calibrated stereo line arrays pushing pristine audio fidelity across stadiums, outdoor amphitheatres, and festival fields.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
              <Radio className="w-8 h-8 text-rose-400" />
              <h3 className="font-bold text-white">Wireless In-Ear Monitoring</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                State-of-the-art RF wireless in-ear monitoring delivering zero-latency multitrack mix feedback to every band member on stage.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h3 className="font-bold text-white">Dynamic Lighting &amp; Lasers</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Timecode-synchronized DMX moving heads, blinders, cryo jets, and atmospheric haze designed for maximum crowd immersion.
              </p>
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* Testing & Verification Guide */}
      <PageSection
        id="verification-guide"
        size="md"
        aria-labelledby="verification-guide-heading"
        data-scrub-target="specs"
      >
        <Stack gap="lg">
          <SectionHeader
            id="verification-guide-heading"
            title="Transition Verification &amp; Tuning Guide"
            subtitle="How to compare different aesthetic variants of the Codrops About transition"
            badge="Guide"
          />

          <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 flex flex-col gap-4 shadow-xl backdrop-blur-md">
            <h3 className="font-bold text-amber-200">
              Testing Scenarios to Explore
            </h3>
            <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-white">Codrops Default Preset (#beb9b8):</strong> Use the floating tuner at the bottom-right to test the original muted stone color from the Codrops demo.
              </li>
              <li>
                <strong className="text-white">7th Heaven Signature Purple (#8a1cfc):</strong> Switch to electric purple to see how the band branding looks with the WebGL dissolve.
              </li>
              <li>
                <strong className="text-white">Adjust Edge Softness:</strong> Increase edge width to 0.35+ for a smoky fog dissolve, or reduce to 0.05 for a gritty pixelated stencil dissolve.
              </li>
              <li>
                <strong className="text-white">Duration &amp; Ease:</strong> Experiment with faster 0.6s snappy transitions vs dramatic 1.5s cinematic dissolves.
              </li>
            </ol>
          </div>
        </Stack>
      </PageSection>
    </main>
  );
}
