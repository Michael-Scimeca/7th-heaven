"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import SeventhButton from "@/components/SeventhButton";
import PageHero from "@/components/PageHero";
import {
  FEATURES,
  TECH,
  CATEGORIES,
  Category,
  FeatureCard,
} from "./data/featuresData";
import { FeatureCardUI } from "./components/FeatureCardUI";

/* ══════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════ */
function Counter({
  end,
  label,
  sublabel,
}: {
  end: number;
  label: string;
  sublabel?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          let n = 0;
          const step = Math.max(1, Math.ceil(end / 40));
          const t = setInterval(() => {
            n += step;
            if (n >= end) {
              setCount(end);
              clearInterval(t);
            } else setCount(n);
          }, 28);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="px-6 py-8 text-center">
      <div className="text-6xl tabular-nums md:text-7xl">
        {count}
        <span className="text-[var(--color-accent)]">+</span>
      </div>
      <div className="mt-2">{label}</div>
      {sublabel && (
        <div className="mx-auto max-w-[180px] text-white/30">{sublabel}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const filtered = FEATURES.filter(
    (f) =>
      activeCategory === "all" ||
      f.category.includes(activeCategory as Category),
  );
  const highlights = FEATURES.filter((f) => f.highlight);

  return (
    <main className="page-container page-stack min-h-screen overflow-x-hidden">
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section
        id="features-hero"
        aria-labelledby="features-heading"
        className="section relative"
      >
        <div className="relative overflow-hidden px-6 md:px-12 lg:px-20">
          <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 bg-[var(--color-accent)] opacity-[0.10] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,10,61,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,10,61,0.6)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <PageHero
          badge="Full Platform Overview · All Features Live & Documented"
          title={
            <>
              Everything
              <br />
              <span className="text-[var(--color-accent)]">Built In.</span>
            </>
          }
          titleId="features-heading"
          subtitle="A production-grade digital platform for 7th Heaven. Every feature is live, documented, and explained in full — from interactive visual sitemaps to live-stream raffles, 6-digit PIN security flows, and AI photo moderation."
          align="left"
          className="relative max-w-5xl mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {[
              "Interactive Visual Sitemap",
              "WebRTC Live Streaming",
              "Web Push Notifications",
              "Direct Merchant E-Commerce",
              "Supabase Real-Time DB",
              "TensorFlow.js AI",
              "12 Email Templates",
              "Pick Collector Game",
              "1,200+ Shows Archive",
              "Sanity CMS",
            ].map((p) => (
              <span
                key={p}
                className="btn-pill-glass"
              >
                {p}
              </span>
            ))}
          </div>
        </PageHero>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sitemap"
              className="transition-[background-color,color,border-color,box-shadow] inline-flex items-center gap-2 bg-[var(--color-accent)] px-8 py-3.5 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_40px_rgba(255,10,61,0.5)]"
            >
              Interactive Sitemap →
            </Link>
            <SeventhButton href="/live">
              <span className="h-2 w-2 animate-pulse bg-white rounded-full" />
              Watch Live
            </SeventhButton>
            <SeventhButton href="/book">
              Book The Band →
            </SeventhButton>
            <SeventhButton href="/fans">
              Fan Dashboard →
            </SeventhButton>
            <SeventhButton href="#all-features">
              View All Features ↓
            </SeventhButton>
          </div>
        </div>
        </div>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════ */}
      <section
        id="platform-stats"
        aria-labelledby="platform-stats-heading"
        className="section"
      >
        <h2 id="platform-stats-heading" className="sr-only">
          Platform Statistics
        </h2>
        <div className="border-y border-white/[0.06] bg-gradient-to-r from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/5">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-white/[0.06] md:grid-cols-4 md:divide-y-0">
          <Counter
            end={30}
            label="Features Live"
            sublabel="Fan, Live, Booking, Commerce, Comms & Platform"
          />
          <Counter
            end={40}
            label="API Endpoints"
            sublabel="Auth, Push, Email, CMS, Merchant, LiveKit"
          />
          <Counter
            end={12}
            label="Email Templates"
            sublabel="Resend-powered, branded HTML, all flows covered"
          />
          <Counter
            end={10}
            label="Push Notification Alerts"
            sublabel="Web Push — proximity, RSVP, live broadcasts, crew"
          />
        </div>
        </div>
      </section>

      {/* ═══ FLAGSHIP FEATURES ═══════════════════════════ */}
      <section
        id="flagship-features"
        aria-labelledby="flagship-features-heading"
        className="section"
      >
        <div className="px-6 py-24 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[var(--color-accent)]">✦</span>
              <h2 id="flagship-features-heading">Flagship Features</h2>
            </div>
          <p className="mb-12 max-w-2xl">
            The ten defining features of the platform — each explained in full
            with bullet points, business impact, and a technical walkthrough.
            Click <em>How It Works</em> on any card to expand the technical
            detail.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {highlights.map((f) => (
              <FeatureCardUI key={f.title} f={f} />
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ═══ FULL FEATURE SET ════════════════════════════ */}
      <section
        id="all-features"
        aria-labelledby="all-features-heading"
        className="section"
      >
        <div className="bg-white/[0.01] px-6 py-24 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-white/60">◈</span>
              <h2 id="all-features-heading">All {FEATURES.length} Features</h2>
            </div>
          <p className="mb-10">
            Filter by category. Every feature card includes a full description,
            bullet list, business impact statement, and expandable technical
            breakdown.
          </p>

          <div className="mb-10 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const count =
                cat.key === "all"
                  ? FEATURES.length
                  : FEATURES.filter((f) =>
                    f.category.includes(cat.key as Category),
                  ).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as Category | "all")}
                  className={`flex cursor-pointer items-center gap-1.5 border px-4 py-2 ${activeCategory === cat.key ? "border-[var(--color-accent-bold)] bg-[var(--color-accent)] shadow-[0_0_20px_rgba(168,85,247,0.35)] text-white" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white"}`}
                >
                  {cat.icon} {cat.label}
                  <span
                    className={`ml-1 px-1.5 py-0.5 ${activeCategory === cat.key ? "bg-white/20 text-white" : "bg-[#00000029] text-white/60"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((f) => (
              <FeatureCardUI key={f.title} f={f} />
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ═══ TECH STACK ══════════════════════════════════ */}
      <section
        id="tech-stack"
        aria-labelledby="tech-stack-heading"
        className="section"
      >
        <div className="px-6 py-24 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-white/30">◈</span>
              <h2 id="tech-stack-heading">Built With</h2>
            </div>
          <p className="mb-10">
            Best-in-class services and frameworks — each chosen for reliability,
            scalability, and fit-for-purpose performance.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH.map((t) => (
              <div
                key={t.name}
                className="transition-colors flex cursor-default items-start gap-4 border border-white/10 border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-[#00000029] text-2xl">
                  {t.icon}
                </div>
                <div>
                  <div style={{ color: t.color }}>{t.name}</div>
                  <p className="mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════ */}
      <section
        id="features-cta"
        aria-labelledby="features-cta-heading"
        className="section relative"
      >
        <div className="relative overflow-hidden px-6 py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-accent)]/8 to-transparent" />
            <div className="absolute top-1/2 left-1/2 h-[400px] w-[1000px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-accent)] opacity-[0.07] blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,10,61,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,10,61,0.5)_1px,transparent_1px)] bg-[size:60px_60px]"
            />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <h2 id="features-cta-heading" className="mb-6">
            Ready to
            <br />
            <span className="text-[var(--color-accent)]">Experience It?</span>
          </h2>
          <p className="mx-auto mb-3 max-w-2xl">
            Every feature on this page is live and ready. No demos, no mockups —
            the real thing.
          </p>
          <p className="mb-12">Questions? Reach out via the contact page.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SeventhButton href="/fans">
              Join as a Fan →
            </SeventhButton>
            <SeventhButton href="/live">
              Watch Live
            </SeventhButton>
            <SeventhButton href="/#tour">
              See Tour Dates
            </SeventhButton>
            <SeventhButton href="/book">
              Book the Band
            </SeventhButton>
            <SeventhButton href="/contact">
              Contact Us
            </SeventhButton>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
