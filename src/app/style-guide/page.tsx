"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/* ─────────────────────────────────────────────
   Token Map — auto-read from CSS custom props
   ───────────────────────────────────────────── */

const bgScale = [
  { token: "--color-bg-primary", label: "Primary", hex: "#000000" },
  { token: "--color-bg-deep", label: "Deep", hex: "#050508" },
  { token: "--color-bg-surface", label: "Surface", hex: "#0b0b12" },
  { token: "--color-bg-card", label: "Card", hex: "#111116" },
  { token: "--color-bg-elevated", label: "Elevated", hex: "#181820" },
];

const accentColors = [
  { token: "--color-accent", label: "Accent", hex: "#851DEF" },
  { token: "--color-accent-hover", label: "Accent Hover", hex: "#9d3cff" },
  { token: "--color-accent-soft", label: "Accent Soft", hex: "#a855f7" },
  { token: "--color-accent-fuchsia", label: "Fuchsia", hex: "#d946ef" },
  { token: "--color-accent-pink", label: "Pink", hex: "#ec4899" },
  { token: "--color-accent-blue", label: "Blue", hex: "#3b82f6" },
  { token: "--color-accent-cyan", label: "Cyan", hex: "#06b6d4" },
  { token: "--color-accent-green", label: "Green", hex: "#10b981" },
  { token: "--color-accent-amber", label: "Amber", hex: "#f59e0b" },
  { token: "--color-accent-red", label: "Red", hex: "#ef4444" },
  { token: "--color-accent-orange", label: "Orange", hex: "#f97316" },
  { token: "--color-accent-indigo", label: "Indigo", hex: "#6366f1" },
];

const textColors = [
  { token: "--color-text-primary", label: "Primary", hex: "#FFFEFE" },
  { token: "--color-text-secondary", label: "Secondary", hex: "#a0a0b8" },
  { token: "--color-text-muted", label: "Muted", hex: "#6b6b80" },
  { token: "--color-text-disabled", label: "Disabled", hex: "#4a4a5a" },
];

const brandColors = [
  { token: "--color-brand-spotify", label: "Spotify", hex: "#1DB954" },
  { token: "--color-brand-apple-music", label: "Apple Music", hex: "#FC3C44" },
  { token: "--color-brand-facebook", label: "Facebook", hex: "#1877F2" },
];

const fontSizes = [
  { token: "--font-size-5xs", label: "5xs", note: "7px — micro labels" },
  { token: "--font-size-4xs", label: "4xs", note: "8px — tiny badges" },
  { token: "--font-size-3xs", label: "3xs", note: "10px — small metadata" },
  { token: "--font-size-2xs", label: "2xs", note: "~11px" },
  { token: "--font-size-xs", label: "xs", note: "~13px" },
  { token: "--font-size-sm", label: "sm", note: "~14px" },
  { token: "--font-size-base", label: "base", note: "16px body" },
  { token: "--font-size-lg", label: "lg", note: "fluid" },
  { token: "--font-size-xl", label: "xl", note: "fluid" },
  { token: "--font-size-2xl", label: "2xl", note: "fluid" },
  { token: "--font-size-3xl", label: "3xl", note: "fluid" },
  { token: "--font-size-4xl", label: "4xl", note: "fluid" },
  { token: "--font-size-5xl", label: "5xl", note: "fluid" },
  { token: "--font-size-6xl", label: "6xl", note: "fluid" },
];

const shadows = [
  { token: "--shadow-card", label: "Card" },
  { token: "--shadow-deep", label: "Deep" },
  { token: "--shadow-accent-glow", label: "Accent Glow" },
  { token: "--shadow-accent-glow-lg", label: "Accent Glow LG" },
  { token: "--shadow-cyan-glow", label: "Cyan Glow" },
  { token: "--shadow-pink-glow", label: "Pink Glow" },
  { token: "--shadow-nav", label: "Nav" },
];

const zLayers = [
  { token: "--z-base", value: "0", label: "Base" },
  { token: "--z-low", value: "1", label: "Low" },
  { token: "--z-default", value: "10", label: "Default" },
  { token: "--z-raised", value: "20", label: "Raised" },
  { token: "--z-high", value: "30", label: "High" },
  { token: "--z-overlay", value: "40", label: "Overlay" },
  { token: "--z-nav", value: "50", label: "Nav" },
  { token: "--z-modal", value: "9999", label: "Modal" },
  { token: "--z-overlay-fx", value: "99998", label: "Overlay FX" },
  { token: "--z-preloader", value: "100000", label: "Preloader" },
];

/* ─── Section Wrapper ─── */
function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 border-b border-white/5">
      <div className="site-container">
        <h2 className="text-3xl font-black uppercase tracking-wider text-white mb-2 font-[family-name:var(--font-rockstar)]">
          {title}
        </h2>
        <div className="w-16 h-0.5 bg-[var(--color-accent)] mb-10" />
        {children}
      </div>
    </section>
  );
}

/* ─── Token Badge ─── */
function TokenBadge({ token }: { token: string }) {
  return (
    <code className="text-[var(--font-size-4xs)] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded-md">
      {token}
    </code>
  );
}

/* ─── File Badge ─── */
function FileBadge({ path }: { path: string }) {
  return (
    <span className="text-[var(--font-size-4xs)] font-mono text-[var(--color-accent-cyan)] opacity-60">
      📁 {path}
    </span>
  );
}

/* ─── Color Swatch ─── */
function Swatch({ hex, token, label, textOnDark = true }: { hex: string; token: string; label: string; textOnDark?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="w-full h-20 rounded-xl border border-white/10 flex items-end p-3"
        style={{ backgroundColor: hex }}
      >
        <span className={`text-[var(--font-size-4xs)] font-bold uppercase tracking-wider ${textOnDark ? "text-white/70" : "text-black/70"}`}>
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <TokenBadge token={token} />
        <span className="text-[var(--font-size-4xs)] text-white/30 font-mono">{hex}</span>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  const [activeNav, setActiveNav] = useState("colors");

  const navItems = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "shadows", label: "Shadows" },
    { id: "z-index", label: "Z-Index" },
    { id: "buttons", label: "Buttons" },
    { id: "forms", label: "Forms" },
    { id: "components", label: "Components" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Sticky Sub-Nav */}
      <div className="sticky top-0 z-40 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-b border-white/5">
        <div className="site-container">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            <h1 className="text-sm font-black uppercase tracking-widest text-white/60 mr-4 shrink-0 font-[family-name:var(--font-rockstar)]">
              Style Guide
            </h1>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveNav(item.id)}
                className={`px-3 py-1.5 text-[var(--font-size-3xs)] font-bold uppercase tracking-widest rounded-lg transition-all shrink-0 ${
                  activeNav === item.id
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="py-20 bg-gradient-to-b from-[var(--color-accent)]/10 to-transparent">
        <div className="site-container">
          <p className="text-eyebrow mb-4">Design System</p>
          <h1 className="heading-hero text-white mb-4">7th Heaven</h1>
          <p className="text-body max-w-2xl">
            Single source of truth for all design tokens. Every color, font size, shadow, and spacing value
            used across the site is defined in{" "}
            <code className="text-[var(--color-accent)] font-mono text-sm">globals.css @theme</code> and
            rendered here using the real production values.
          </p>
          <FileBadge path="src/app/globals.css → @theme block" />
        </div>
      </div>

      {/* ═══ COLORS ═══ */}
      <Section title="Color Palette" id="colors">
        {/* Dark Background Scale */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Background Scale <span className="text-white/30 text-sm">(5 semantic levels)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {bgScale.map((c) => (
            <Swatch key={c.token} {...c} />
          ))}
        </div>

        {/* Accent Colors */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Accent Colors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {accentColors.map((c) => (
            <Swatch key={c.token} {...c} textOnDark />
          ))}
        </div>

        {/* Text Colors */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Text Colors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {textColors.map((c) => (
            <div key={c.token} className="flex items-center gap-3 p-4 bg-[var(--color-bg-surface)] rounded-xl border border-white/5">
              <span style={{ color: c.hex }} className="text-xl font-bold">Aa</span>
              <div>
                <div className="text-[var(--font-size-3xs)] text-white/70 font-bold">{c.label}</div>
                <TokenBadge token={c.token} />
              </div>
            </div>
          ))}
        </div>

        {/* Brand Colors */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Brand / Third-Party
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {brandColors.map((c) => (
            <Swatch key={c.token} {...c} textOnDark />
          ))}
        </div>
      </Section>

      {/* ═══ TYPOGRAPHY ═══ */}
      <Section title="Typography Scale" id="typography">
        <FileBadge path="src/app/globals.css → @theme --font-size-*" />

        <div className="mt-8 space-y-1">
          {fontSizes.map((f) => (
            <div
              key={f.token}
              className="flex items-baseline gap-4 py-3 border-b border-white/5 group hover:bg-white/[0.02] px-4 -mx-4 rounded-lg transition-colors"
            >
              <div className="w-16 shrink-0">
                <span className="text-[var(--font-size-3xs)] font-bold text-[var(--color-accent)] uppercase">
                  {f.label}
                </span>
              </div>
              <span
                style={{ fontSize: `var(${f.token})` }}
                className="text-white font-semibold leading-tight"
              >
                The quick brown fox
              </span>
              <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TokenBadge token={f.token} />
                <span className="text-[var(--font-size-4xs)] text-white/30">{f.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Heading Hierarchy */}
        <h3 className="text-lg font-bold text-white mb-6 mt-16 uppercase tracking-wider">
          Heading Hierarchy <span className="text-white/30 text-sm">(h1–h6)</span>
        </h3>
        <div className="space-y-6 bg-[var(--color-bg-surface)] p-8 rounded-2xl border border-white/5">
          <div>
            <h1>Heading 1 — The Stage Is Set</h1>
            <TokenBadge token="--font-size-5xl" />
          </div>
          <div>
            <h2>Heading 2 — Sound Check Complete</h2>
            <TokenBadge token="--font-size-4xl" />
          </div>
          <div>
            <h3>Heading 3 — Opening Act</h3>
            <TokenBadge token="--font-size-3xl" />
          </div>
          <div>
            <h4>Heading 4 — Main Event</h4>
            <TokenBadge token="--font-size-2xl" />
          </div>
          <div>
            <h5>Heading 5 — Encore Performance</h5>
            <TokenBadge token="--font-size-xl" />
          </div>
          <div>
            <h6>Heading 6 — After Party</h6>
            <TokenBadge token="--font-size-lg" />
          </div>
        </div>

        {/* Utility Classes */}
        <h3 className="text-lg font-bold text-white mb-6 mt-16 uppercase tracking-wider">
          Typography Utilities
        </h3>
        <div className="space-y-8">
          <div>
            <div className="heading-hero text-white mb-2">heading-hero</div>
            <TokenBadge token="@utility heading-hero" />
            <FileBadge path="globals.css" />
          </div>
          <div>
            <div className="heading-section text-white mb-2">heading-section</div>
            <TokenBadge token="@utility heading-section" />
          </div>
          <div>
            <div className="heading-card text-white mb-2">heading-card</div>
            <TokenBadge token="@utility heading-card" />
          </div>
          <div>
            <p className="text-body mb-2">
              Body text — This is the standard paragraph style used throughout the site.
              It uses Barlow at 1rem with 1.7 line-height and 65% white opacity.
            </p>
            <TokenBadge token="@utility text-body" />
          </div>
          <div>
            <p className="text-eyebrow mb-2">Eyebrow label</p>
            <TokenBadge token="@utility text-eyebrow" />
          </div>
        </div>

        {/* Inline elements */}
        <h3 className="text-lg font-bold text-white mb-6 mt-16 uppercase tracking-wider">
          Inline Elements
        </h3>
        <div className="bg-[var(--color-bg-surface)] p-8 rounded-2xl border border-white/5 space-y-4 text-body">
          <p>Regular paragraph with <strong className="text-white font-bold">bold text</strong> and <em className="italic text-white/80">italic text</em>.</p>
          <p>Links look like <a href="#" className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]">this hyperlink style</a>.</p>
          <p>Inline <code className="text-[var(--color-accent-cyan)] bg-white/5 px-1.5 py-0.5 rounded-md text-sm font-mono">code</code> for technical references.</p>
          <blockquote className="border-l-2 border-[var(--color-accent)] pl-4 italic text-white/60">
            &ldquo;Pull quote — The music never stops when you&apos;re on the 7th Heaven cruise.&rdquo;
          </blockquote>
          <ul className="list-disc list-inside space-y-1 text-white/60">
            <li>Unordered list item one</li>
            <li>Unordered list item two
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Nested item</li>
              </ul>
            </li>
          </ul>
          <ol className="list-decimal list-inside space-y-1 text-white/60">
            <li>Ordered list item one</li>
            <li>Ordered list item two</li>
          </ol>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/60 font-bold">Column A</th>
                <th className="text-left py-2 text-white/60 font-bold">Column B</th>
                <th className="text-left py-2 text-white/60 font-bold">Column C</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2 text-white/50">Data 1</td>
                <td className="py-2 text-white/50">Data 2</td>
                <td className="py-2 text-white/50">Data 3</td>
              </tr>
            </tbody>
          </table>
          <hr className="border-white/10" />
          <p className="text-[var(--font-size-3xs)] text-white/30">Caption / small text at 10px (--font-size-3xs)</p>
        </div>
      </Section>

      {/* ═══ SPACING ═══ */}
      <Section title="Spacing Scale" id="spacing">
        <div className="space-y-3">
          {[
            { label: "Container Padding", token: "--space-container", value: "32px", tw: "px-8 / site-container" },
            { label: "gap-1", token: "Tailwind", value: "4px", tw: "gap-1" },
            { label: "gap-2", token: "Tailwind", value: "8px", tw: "gap-2" },
            { label: "gap-3", token: "Tailwind", value: "12px", tw: "gap-3" },
            { label: "gap-4", token: "Tailwind", value: "16px", tw: "gap-4" },
            { label: "gap-6", token: "Tailwind", value: "24px", tw: "gap-6" },
            { label: "gap-8", token: "Tailwind", value: "32px", tw: "gap-8" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 py-2 border-b border-white/5">
              <div className="w-32 text-[var(--font-size-3xs)] text-white/70 font-bold">{s.label}</div>
              <div className="h-6 bg-[var(--color-accent)]/30 rounded-sm" style={{ width: s.value }} />
              <span className="text-[var(--font-size-4xs)] text-white/40 font-mono">{s.value}</span>
              <code className="text-[var(--font-size-4xs)] text-[var(--color-accent-cyan)] font-mono">{s.tw}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ SHADOWS ═══ */}
      <Section title="Shadows" id="shadows">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shadows.map((s) => (
            <div
              key={s.token}
              className="h-32 bg-[var(--color-bg-card)] rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{ boxShadow: `var(${s.token})` }}
            >
              <span className="text-sm font-bold text-white">{s.label}</span>
              <TokenBadge token={s.token} />
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ Z-INDEX ═══ */}
      <Section title="Z-Index Layers" id="z-index">
        <div className="relative h-[400px] bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden">
          {zLayers.map((z, i) => (
            <div
              key={z.token}
              className="absolute left-0 right-0 flex items-center justify-between px-6 h-10 border-b border-white/5"
              style={{
                bottom: `${i * 38}px`,
                backgroundColor: `rgba(133, 29, 239, ${0.03 + i * 0.03})`,
              }}
            >
              <span className="text-[var(--font-size-3xs)] font-bold text-white">{z.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--font-size-4xs)] text-[var(--color-accent)] font-mono font-bold">{z.value}</span>
                <TokenBadge token={z.token} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ BUTTONS ═══ */}
      <Section title="Buttons" id="buttons">
        <FileBadge path="src/app/globals.css → @utility btn-primary, btn-outline" />

        <h3 className="text-lg font-bold text-white mb-4 mt-8 uppercase tracking-wider">Primary</h3>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="btn-primary btn-primary-hover rounded-lg">Default</button>
          <button className="btn-primary btn-primary-hover rounded-lg opacity-80">Hover (simulated)</button>
          <button className="btn-primary rounded-lg opacity-50 cursor-not-allowed">Disabled</button>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Outline</h3>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="btn-outline btn-outline-hover rounded-lg">Default</button>
          <button className="btn-outline rounded-lg border-[var(--color-accent)] bg-purple-500/10">Hover (simulated)</button>
          <button className="btn-outline rounded-lg opacity-50 cursor-not-allowed">Disabled</button>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Nav Button (Sign In)</h3>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="px-3.5 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-md">
            SIGN IN
          </button>
          <FileBadge path="src/components/Header.tsx" />
        </div>

        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Pill / Book Us</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-6 py-2 border-2 border-white rounded-2xl text-white text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            BOOK US
          </button>
          <FileBadge path="src/components/Header.tsx" />
        </div>
      </Section>

      {/* ═══ FORMS ═══ */}
      <Section title="Form Inputs" id="forms">
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Text Input</label>
            <input
              type="text"
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Textarea</label>
            <textarea
              placeholder="Write your message..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors placeholder:text-white/20 resize-none"
            />
          </div>
          <div>
            <label className="text-[var(--font-size-3xs)] text-white/60 font-bold uppercase tracking-wider block mb-1.5">Select</label>
            <select className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-white/10 rounded-xl text-white text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors">
              <option>Option One</option>
              <option>Option Two</option>
              <option>Option Three</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ═══ LIVE COMPONENTS ═══ */}
      <Section title="Live Components" id="components">
        <p className="text-body mb-8">
          These are the real production components imported and rendered live. If they look wrong here, they&apos;re wrong in production.
        </p>

        {/* Nav States */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Navigation <FileBadge path="src/components/Header.tsx" />
        </h3>
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-white/5 overflow-hidden mb-12">
          <div className="relative h-[80px]">
            <Header />
          </div>
        </div>

        {/* Glass Utility */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Glass Card <TokenBadge token="@utility glass" />
        </h3>
        <div className="flex gap-4 mb-12">
          <div className="glass rounded-2xl p-6 w-64">
            <h4 className="text-white font-bold mb-2">Glass Panel</h4>
            <p className="text-body text-sm">Frosted glass effect with blur backdrop.</p>
          </div>
        </div>

        {/* Card Elevation Demo */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Card Elevation Scale
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {["deep", "surface", "card", "elevated"].map((level) => (
            <div
              key={level}
              className={`p-6 rounded-2xl border border-white/5 bg-[var(--color-bg-${level})]`}
              style={{ backgroundColor: `var(--color-bg-${level})` }}
            >
              <div className="text-sm font-bold text-white mb-1 uppercase">{level}</div>
              <TokenBadge token={`--color-bg-${level}`} />
              <p className="text-body text-sm mt-2">Card at the {level} elevation level.</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Footer <FileBadge path="src/components/Footer.tsx" />
        </h3>
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <Footer />
        </div>
      </Section>
    </div>
  );
}
