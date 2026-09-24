"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import SeventhButton from "@/components/SeventhButton";
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
      <div
        className="text-6xl tabular-nums md:text-7xl"
        style={{ fontStyle: "italic" }}
      >
        {count}
        <span style={{ color: "#851DEF" }}>+</span>
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
    <main className="min-h-screen overflow-x-hidden">
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 pt-40 pb-28 md:px-12 lg:px-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-lg bg-[var(--color-accent)] opacity-[0.10] blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,10,61,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,10,61,0.6) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-lg border border-[#851DEF]/30 bg-[var(--color-accent)]/10 px-5 py-2 text-[#c084fc]">
            Full Platform Overview · All Features Live & Documented
          </div>

          <h1
            className="mb-6 text-6xl leading-[0.9]"
            style={{ fontStyle: "italic" }}
          >
            Everything
            <br />
            <span style={{ color: "#851DEF" }}>Built In.</span>
          </h1>

          <p className="mx-auto mb-6 max-w-3xl">
            A production-grade digital platform for 7th Heaven. Every feature is
            live, documented, and explained in full — from interactive visual
            sitemaps to live-stream raffles, 6-digit PIN security flows, and AI
            photo moderation.
          </p>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
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
                className="rounded-lg border border-white/10 bg-[#00000029] px-3 py-1.5 text-white/40"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sitemap"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-8 py-3.5 text-base transition-colors hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_40px_rgba(255,10,61,0.5)]"
            >
              Interactive Sitemap →
            </Link>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-3.5 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              <span className="h-2 w-2 animate-pulse rounded-lg bg-white" />
              Watch Live
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-3.5 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Book The Band →
            </Link>
            <Link
              href="/fans"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-3.5 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Fan Dashboard →
            </Link>
            <a
              href="#all-features"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-8 py-3.5 text-base transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/20"
            >
              View All Features ↓
            </a>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-gradient-to-r from-[#851DEF]/5 via-transparent to-[#851DEF]/5">
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
      </section>

      {/* ═══ FLAGSHIP FEATURES ═══════════════════════════ */}
      <section className="px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[var(--color-accent)]">✦</span>
            <h2 className="" style={{ fontStyle: "italic" }}>
              Flagship Features
            </h2>
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
      </section>

      {/* ═══ FULL FEATURE SET ════════════════════════════ */}
      <section
        id="all-features"
        className="bg-white/[0.01] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-white/30">◈</span>
            <h2 className="" style={{ fontStyle: "italic" }}>
              All {FEATURES.length} Features
            </h2>
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
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-4 py-2 transition-colors ${activeCategory === cat.key ? "border-[#851DEF] bg-[var(--color-accent)] shadow-[0_0_20px_rgba(255,10,61,0.35)]" : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/30 hover:text-white"}`}
                >
                  {cat.icon} {cat.label}
                  <span
                    className={`ml-1 rounded-lg px-1.5 py-0.5 ${activeCategory === cat.key ? "bg-white/20" : "bg-[#00000029] text-white/30"}`}
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
      </section>

      {/* ═══ TECH STACK ══════════════════════════════════ */}
      <section className="px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-white/30">◈</span>
            <h2 className="" style={{ fontStyle: "italic" }}>
              Built With
            </h2>
          </div>
          <p className="mb-10">
            Best-in-class services and frameworks — each chosen for reliability,
            scalability, and fit-for-purpose performance.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH.map((t) => (
              <div
                key={t.name}
                className="flex cursor-default items-start gap-4 border border-white/10 border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#00000029] text-2xl">
                  {t.icon}
                </div>
                <div>
                  <div className="" style={{ color: t.color }}>
                    {t.name}
                  </div>
                  <p className="mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#851DEF]/8 to-transparent" />
          <div className="absolute top-1/2 left-1/2 h-[400px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-accent)] opacity-[0.07] blur-[130px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,10,61,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,10,61,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <h2
            className="mb-6 text-6xl md:text-8xl"
            style={{ fontStyle: "italic" }}
          >
            Ready to
            <br />
            <span style={{ color: "#851DEF" }}>Experience It?</span>
          </h2>
          <p className="mx-auto mb-3 max-w-2xl">
            Every feature on this page is live and ready. No demos, no mockups —
            the real thing.
          </p>
          <p className="mb-12">Questions? Reach out via the contact page.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SeventhButton
              icon={false}
              onClick={() => (window.location.href = "/fans")}
            >
              Join as a Fan →
            </SeventhButton>
            <Link
              href="/live"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-4 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Watch Live
            </Link>
            <Link
              href="/#tour"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-4 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              See Tour Dates
            </Link>
            <Link
              href="/book"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-4 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Book the Band
            </Link>
            <TransitionLink
              href="/contact"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-8 py-4 text-base transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Contact Us
            </TransitionLink>
          </div>
        </div>
      </section>
    </main>
  );
}
