"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Type,
  Maximize2,
  Sliders,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Palette,
  Layout,
  ExternalLink,
} from "lucide-react";
import PageSection from "@/components/PageSection";
import SectionHeader from "@/components/SectionHeader";
import Stack from "@/components/Stack";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import GlassCard from "@/components/ui/GlassCard";
import FormField from "@/components/ui/FormField";
import InputField from "@/components/InputField";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionBadge from "@/components/SectionBadge";
import { colors, typography, spacing, effects } from "@/tokens";

export default function DesignSystemClient() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [demoToggle, setDemoToggle] = useState(true);
  const [demoToggleSm, setDemoToggleSm] = useState(false);
  const [demoInputValue, setDemoInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing" | "components" | "recipe">("colors");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#210e2a] text-white selection:bg-action selection:text-black">
      {/* ── Open Hero Canvas (No heavy box around headline) ── */}
      <header className="relative pt-24 pb-16 border-b border-white/10 overflow-hidden">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(168,85,247,0.25),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl pointer-events-none" />

        <div className="site-container relative z-10 flex flex-col items-start gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-action/15 border border-action/30 text-action text-xs font-bold uppercase tracking-wider">
              Version 2.0 • Tailwind v4 + Utopia
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-zinc-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              WCAG 2.1 AAA Contrast
            </span>
          </div>

          <h1 className="font-heading text-display leading-tight text-white tracking-normal uppercase">
            7th Heaven Design System
          </h1>

          <p className="max-w-2xl text-body text-zinc-300 leading-relaxed text-pretty">
            The official living design system specification for 7th Heaven. Built on the Violet Nocturne atmospheric
            palette, Anton display typography, Utopia fluid modular spacing, and tokenized canonical UI primitives.
          </p>

          {/* Quick Jump Navigation */}
          <nav aria-label="Design system sections" className="flex flex-wrap gap-2 pt-4">
            {[
              { id: "colors", label: "🎨 Color Palette" },
              { id: "typography", label: "🔤 Typography" },
              { id: "spacing", label: "📐 8px Spacing" },
              { id: "components", label: "🧩 UI Primitives" },
              { id: "recipes", label: "📦 Section Recipe" },
            ].map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-4 py-2 rounded-full border border-white/15 bg-black/40 hover:border-action/50 hover:bg-black/60 text-xs font-semibold text-zinc-200 hover:text-white transition-all"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Floating Copied Toast */}
      {copiedToken && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-action text-black font-bold text-xs shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          <Check className="h-4 w-4" />
          <span>Copied {copiedToken} to clipboard!</span>
        </div>
      )}

      {/* ── Section 1: Color Foundations ── */}
      <PageSection id="colors" aria-labelledby="colors-heading" size="md">
        <SectionHeader
          id="colors-heading"
          title="Color Palette & Contrast Hierarchy"
          subtitle="Built for an immersive dark-atmosphere concert experience. Warm gold is strictly reserved as the solitary interactive action accent."
          badge="Foundations"
        />

        <Stack gap="xl">
          {/* Solitary Action Accent Spotlight */}
          <GlassCard variant="interactive" padding="lg" className="border-action/40 bg-black/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-action shadow-[0_0_12px_var(--color-action-ring)]" />
                  <span className="text-xs uppercase font-bold tracking-wider text-action">
                    The Solitary Action Accent
                  </span>
                </div>
                <h3 className="font-heading text-h3 uppercase text-white">#F5B942 (Warm Gold)</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Warm gold is the <strong>only warm color</strong> across the entire site. It is strictly reserved for
                  interactive triggers, primary CTA buttons, calendar highlights, and clickable contact links. On our
                  base canvas, it achieves an extraordinary <strong>11.6:1 contrast ratio</strong> (surpassing WCAG AAA).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Button variant="primary" size="md">
                  Primary Action Button
                </Button>
                <button
                  type="button"
                  onClick={() => copyToClipboard("#f5b942", "Action Token")}
                  className="px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy var(--color-action)
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Violet Nocturne Base Surfaces */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Violet Nocturne Base Surfaces</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Root Canvas", hex: "#210e2a", token: "--color-bg-base", role: "Page foundation" },
                { name: "Elevated Surface", hex: "#2c1238", token: "--color-bg-surface", role: "Card & section fills" },
                { name: "Nocturne Wine", hex: "#49193c", token: "--color-nocturne-wine", role: "Secondary borders & fills" },
                { name: "Nocturne Plum", hex: "#531161", token: "--color-nocturne-plum", role: "Active glows & gradients" },
              ].map((c) => (
                <div
                  key={c.name}
                  onClick={() => copyToClipboard(c.hex, c.name)}
                  className="group p-4 rounded-[var(--radius-box)] border border-white/10 bg-black/40 hover:border-purple-500/40 cursor-pointer transition-all flex flex-col justify-between h-36"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="h-6 w-6 rounded-full border border-white/20 bg-[var(--swatch-color)]"
                      style={{ "--swatch-color": c.hex } as React.CSSProperties}
                    />
                    <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="font-mono text-xs text-action">{c.hex}</span>
                    <span className="text-[11px] text-zinc-400">{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibrated OKLCH Purple Scale */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              In-Gamut Calibrated OKLCH Purple Scale (Hue 303.9°)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              {[
                { step: "50", oklch: "97% 0.015", hex: "#fbf6fc" },
                { step: "100", oklch: "93% 0.035", hex: "#f3e3f6" },
                { step: "200", oklch: "88% 0.065", hex: "#e7c7ed" },
                { step: "300", oklch: "80% 0.115", hex: "#d598e0" },
                { step: "400", oklch: "72% 0.165", hex: "#c06ad1" },
                { step: "500", oklch: "64% 0.215", hex: "#ab3fc1" },
                { step: "600", oklch: "55% 0.250", hex: "#951cb1" },
                { step: "700", oklch: "45% 0.200", hex: "#7a1591" },
                { step: "800", oklch: "35% 0.150", hex: "#5d106f" },
                { step: "900", oklch: "25% 0.100", hex: "#3f0a4c" },
                { step: "950", oklch: "15% 0.050", hex: "#210e2a" },
              ].map((p) => (
                <div
                  key={p.step}
                  onClick={() => copyToClipboard(p.hex, `Purple ${p.step}`)}
                  className="p-3 rounded-xl border border-white/10 bg-black/40 hover:border-purple-400 cursor-pointer transition-all flex flex-col items-center gap-2"
                >
                  <span
                    className="h-8 w-full rounded-md border border-white/10 bg-[var(--swatch-color)]"
                    style={{ "--swatch-color": p.hex } as React.CSSProperties}
                  />
                  <span className="font-bold text-xs text-white">{p.step}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{p.hex}</span>
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* ── Section 2: Typography ── */}
      <PageSection id="typography" aria-labelledby="typography-heading" size="md">
        <SectionHeader
          id="typography-heading"
          title="Typography & Fluid Scale"
          subtitle="Two complementary typefaces: Anton for punchy arena rock marquee headlines, and Inter for clean UI legibility. Fluid clamp sizing scales smoothly between 360px and 1440px viewports."
          badge="Type Scale"
        />

        <Stack gap="lg">
          {/* Fluid Scale Table */}
          <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-6">
            {[
              {
                level: "Display",
                tag: "Hero Marquee",
                clamp: "clamp(2.75rem, 5vw + 1rem, 5.5rem)",
                range: "44px → 88px",
                font: "font-heading text-display uppercase",
                text: "7TH HEAVEN LIVE ARENA",
              },
              {
                level: "H1",
                tag: "Page Title",
                clamp: "clamp(2.25rem, 4vw + 1rem, 4.0rem)",
                range: "36px → 64px",
                font: "font-heading text-h1 uppercase",
                text: "CONCERT BOOKING & TOUR DATES",
              },
              {
                level: "H2",
                tag: "Section Header",
                clamp: "clamp(1.75rem, 3vw + 0.75rem, 3.0rem)",
                range: "28px → 48px",
                font: "font-heading text-h2 uppercase",
                text: "UPCOMING MIDWEST FESTIVALS",
              },
              {
                level: "H3",
                tag: "Card Title",
                clamp: "clamp(1.35rem, 2vw + 0.5rem, 2.25rem)",
                range: "22px → 36px",
                font: "font-heading text-h3 uppercase",
                text: "VIP EXPERIENCE & MERCHANDISE",
              },
              {
                level: "Body",
                tag: "Paragraph",
                clamp: "clamp(1.0rem, 0.38rem + 0.96vw, 1.25rem)",
                range: "16px → 20px",
                font: "font-sans text-body",
                text: "Experience high-energy rock and roll with Midwest festival favorites 7th Heaven, performing over 250 shows annually.",
              },
            ].map((t) => (
              <div
                key={t.level}
                onClick={() => copyToClipboard(t.clamp, t.level)}
                className="group p-4 rounded-xl border border-white/5 hover:border-purple-500/40 bg-black/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-action/20 text-action text-[10px] font-bold uppercase">
                      {t.level}
                    </span>
                    <span className="text-xs text-zinc-400">{t.tag}</span>
                    <span className="text-xs font-mono text-purple-300">({t.range})</span>
                  </div>
                  <p className={`${t.font} text-white truncate mt-1`}>{t.text}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {t.clamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Stack>
      </PageSection>

      {/* ── Section 3: 8px Fluid Spacing ── */}
      <PageSection id="spacing" aria-labelledby="spacing-heading" size="md">
        <SectionHeader
          id="spacing-heading"
          title="Fluid 8px Modular Spatial Scale"
          subtitle="All margins, paddings, and gap distances are anchored to an 8px modular rhythm scaled via Utopia fluid clamps. Gap belongs between siblings; padding belongs inside containers."
          badge="Spatial Grid"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { token: "--spacing-3xs", min: "4px", max: "6px", use: "Micro badge padding, icon spacing" },
            { token: "--spacing-2xs", min: "8px", max: "10px", use: "Small button padding, input labels" },
            { token: "--spacing-xs", min: "12px", max: "16px", use: "Compact card padding, field gap" },
            { token: "--spacing-sm", min: "16px", max: "22px", use: "Standard card inner padding" },
            { token: "--spacing-md", min: "24px", max: "34px", use: "Standard <Stack> sibling gap" },
            { token: "--spacing-lg", min: "32px", max: "46px", use: "Between related sub-sections" },
            { token: "--spacing-xl", min: "48px", max: "70px", use: "Major section spacing" },
            { token: "--spacing-2xl", min: "64px", max: "94px", use: "Page top/bottom padding" },
          ].map((s) => (
            <div
              key={s.token}
              onClick={() => copyToClipboard(`var(${s.token})`, s.token)}
              className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-action/40 transition-all flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-white">{s.token}</span>
                <span className="text-xs text-zinc-400">{s.use}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded bg-white/10 text-xs font-mono text-action font-bold">
                  {s.min} → {s.max}
                </span>
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      {/* ── Section 4: Canonical Primitives ── */}
      <PageSection id="components" aria-labelledby="components-heading" size="md">
        <SectionHeader
          id="components-heading"
          title="Interactive UI Primitives"
          subtitle="Re-usable, WCAG AAA compliant base components from the unified barrel (@/components/ui)."
          badge="Primitives"
        />

        <Stack gap="xl">
          {/* Buttons Showcase */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Buttons (&lt;Button&gt;)</h4>
            <div className="p-6 rounded-[var(--radius-box)] border border-white/10 bg-black/40 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg">
                Primary Large (Gold)
              </Button>
              <Button variant="primary" size="md">
                Primary Medium
              </Button>
              <Button variant="primary" size="sm">
                Primary Small
              </Button>
              <Button variant="secondary" size="md">
                Secondary Neon
              </Button>
              <Button variant="tertiary" size="md">
                Tertiary Text Link →
              </Button>
            </div>
          </div>

          {/* Unified Squishy Toggle */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Unified Accessible Squishy Toggle (&lt;Toggle&gt;)
            </h4>
            <div className="p-6 rounded-[var(--radius-box)] border border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white">Spring Physics Switch</span>
                <span className="text-xs text-zinc-400">
                  Driven by cubic-bezier(0, 0, 0.3, 1.5) squish animation in globals.css
                </span>
              </div>

              <div className="flex items-center gap-8">
                <Toggle
                  size="md"
                  label={`Standard (md): ${demoToggle ? "Active" : "Inactive"}`}
                  checked={demoToggle}
                  onChange={setDemoToggle}
                />
                <Toggle
                  size="sm"
                  label={`Compact (sm): ${demoToggleSm ? "On" : "Off"}`}
                  checked={demoToggleSm}
                  onChange={setDemoToggleSm}
                />
              </div>
            </div>
          </div>

          {/* Form Fields & Inputs */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Inputs & Form Fields (&lt;InputField&gt;, &lt;FormField&gt;)
            </h4>
            <div className="p-6 rounded-[var(--radius-box)] border border-white/10 bg-black/40 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Contact Name"
                placeholder="e.g. Richard Hofherr"
                value={demoInputValue}
                onChange={(e) => setDemoInputValue(e.target.value)}
                required
              />
              <FormField label="Email Address" helperText="We will send your concert confirmation here.">
                <input
                  type="email"
                  placeholder="contact@7thheavenband.com"
                  className="form-input w-full"
                />
              </FormField>
            </div>
          </div>

          {/* Glass Card Variants */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Surfaces & Cards (&lt;GlassCard&gt;)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard variant="default" padding="md">
                <h5 className="font-bold text-white mb-1">Default Glass</h5>
                <p className="text-xs text-zinc-300">Frosted glass backdrop with 1px border-white/10.</p>
              </GlassCard>

              <GlassCard variant="interactive" padding="md">
                <h5 className="font-bold text-white mb-1">Interactive Glass</h5>
                <p className="text-xs text-zinc-300">Hover for glowing purple border and atmospheric shadow.</p>
              </GlassCard>

              <GlassCard variant="gradient" padding="md">
                <h5 className="font-bold text-white mb-1">Gradient Glass</h5>
                <p className="text-xs text-zinc-300">Deep purple-to-black vertical gradient wash.</p>
              </GlassCard>
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* ── Section 5: Standard Section Recipe ── */}
      <PageSection id="recipes" aria-labelledby="recipes-heading" size="md">
        <SectionHeader
          id="recipes-heading"
          title="The Standard Section Recipe"
          subtitle="Every section across the site follows this 3-primitive contract: <PageSection> for outer spacing & gutter, <SectionHeader> for titles, and <Stack> for internal layout spacing."
          badge="Standard Recipe"
        />

        <div className="p-6 rounded-[var(--radius-box)] border border-white/10 bg-black/60 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed">
          <pre>{`// Canonical Section Implementation:
<PageSection id="tour-dates" aria-labelledby="tour-dates-heading" size="md">
  <SectionHeader
    id="tour-dates-heading"
    title="Upcoming Concert Shows"
    subtitle="Catch 7th Heaven live across the Midwest."
    badge="2026 Tour"
  />

  <Stack gap="md">
    <GlassCard variant="interactive" padding="md">
      {/* Cards and content sit cleanly on the 8px grid */}
    </GlassCard>
  </Stack>
</PageSection>`}</pre>
        </div>
      </PageSection>
    </main>
  );
}
