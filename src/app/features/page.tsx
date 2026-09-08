"use client";

import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import Link from "next/link";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import { FEATURES, TECH, CATEGORIES, Category, FeatureCard } from "./data/featuresData";
import { FeatureCardUI } from "./components/FeatureCardUI";

/* ══════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════ */
function Counter({ end, label, sublabel }: { end: number; label: string; sublabel?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = Math.max(1, Math.ceil(end / 40));
        const t = setInterval(() => { n += step; if (n >= end) { setCount(end); clearInterval(t); } else setCount(n); }, 28);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center px-6 py-8">
      <div className="text-6xl md:text-7xl font-bold text-white tabular-nums leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
        {count}<span style={{ color: "#851DEF" }}>+</span>
      </div>
      <div className="text-base font-bold uppercase tracking-[0.15em] text-white mt-2">{label}</div>
      {sublabel && <div className="text-white/30 mt-1 max-w-[180px] mx-auto ">{sublabel}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const filtered = FEATURES.filter(f => activeCategory === "all" || f.category.includes(activeCategory as Category));
  const highlights = FEATURES.filter(f => f.highlight);

  return (
    <main className="min-h-screen text-white overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 pb-28 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-lg bg-[var(--color-accent)] opacity-[0.10] blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,10,61,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,10,61,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-lg bg-[var(--color-accent)]/10 border border-[#851DEF]/30 text-[#c084fc] font-bold uppercase tracking-[0.25em] mb-10">
            Full Platform Overview · All Features Live & Documented
          </div>

          <h1 className="text-6xl font-bold uppercase text-white mb-6 leading-[0.9] " style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
            Everything<br /><span style={{ color: "#851DEF" }}>Built In.</span>
          </h1>

          <p className="max-w-3xl mx-auto mb-6">
            A production-grade digital platform for 7th Heaven. Every feature is live, documented, and explained in full — from live-stream raffles to proximity SMS alerts to AI photo moderation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {["WebRTC Live Streaming", "Web Push Notifications", "Direct Merchant E-Commerce", "Supabase Real-Time DB", "TensorFlow.js AI", "12 Email Templates", "Push Notification Engine", "Sanity CMS"].map(p => (
              <span key={p} className="px-3 py-1.5 rounded-lg bg-[#00000029] border border-white/10 text-white/40 font-semibold">{p}</span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/live" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-base uppercase tracking-[0.12em] rounded-lg transition-colors hover:shadow-[0_0_40px_rgba(255,10,61,0.5)]">
              <span className="w-2 h-2 rounded-lg bg-white animate-pulse" />Watch Live
            </Link>
            <Link href="/book" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00000029] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold text-base uppercase tracking-[0.12em] rounded-lg transition-colors">Book The Band →</Link>
            <Link href="/fans" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00000029] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold text-base uppercase tracking-[0.12em] rounded-lg transition-colors">Fan Dashboard →</Link>
            <a href="#all-features" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 text-[var(--color-accent)] font-bold text-base uppercase tracking-[0.12em] rounded-lg transition-colors">View All Features ↓</a>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-gradient-to-r from-[#851DEF]/5 via-transparent to-[#851DEF]/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06]">
          <Counter end={30} label="Features Live" sublabel="Fan, Live, Booking, Commerce, Comms & Platform" />
          <Counter end={40} label="API Endpoints" sublabel="Auth, Push, Email, CMS, Merchant, LiveKit" />
          <Counter end={12} label="Email Templates" sublabel="Resend-powered, branded HTML, all flows covered" />
          <Counter end={10} label="Push Notification Alerts" sublabel="Web Push — proximity, RSVP, live broadcasts, crew" />
        </div>
      </section>

      {/* ═══ FLAGSHIP FEATURES ═══════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className=" text-[var(--color-accent)]">✦</span>
            <h2 className="font-bold uppercase text-white" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>Flagship Features</h2>
          </div>
          <p className="mb-12 max-w-2xl">The ten defining features of the platform — each explained in full with bullet points, business impact, and a technical walkthrough. Click <em>How It Works</em> on any card to expand the technical detail.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlights.map((f) => <FeatureCardUI key={f.title} f={f} />)}
          </div>
        </div>
      </section>

      {/* ═══ FULL FEATURE SET ════════════════════════════ */}
      <section id="all-features" className="py-24 px-6 md:px-12 lg:px-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/30">◈</span>
            <h2 className="font-bold uppercase text-white" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>All {FEATURES.length} Features</h2>
          </div>
          <p className="mb-10">Filter by category. Every feature card includes a full description, bullet list, business impact statement, and expandable technical breakdown.</p>

          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map(cat => {
              const count = cat.key === "all" ? FEATURES.length : FEATURES.filter(f => f.category.includes(cat.key as Category)).length;
              return (
                <button aria-label="Action button" key={cat.key} onClick={() => setActiveCategory(cat.key as Category | "all")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${activeCategory === cat.key ? "bg-[var(--color-accent)] border-[#851DEF] text-white shadow-[0_0_20px_rgba(255,10,61,0.35)]" : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white hover:border-white/30"}`}>
                  {cat.icon} {cat.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-lg font-bold ${activeCategory === cat.key ? "bg-white/20 text-white" : " bg-[#00000029] text-white/30"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((f) => <FeatureCardUI key={f.title} f={f} />)}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ══════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/30">◈</span>
            <h2 className="font-bold uppercase text-white" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>Built With</h2>
          </div>
          <p className="mb-10">Best-in-class services and frameworks — each chosen for reliability, scalability, and fit-for-purpose performance.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH.map((t) => (
              <div key={t.name} className="flex items-start gap-4 p-5 border border-white/[0.06] bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-11 h-11 rounded-lg bg-[#00000029] border border-white/10 flex items-center justify-center text-2xl shrink-0">{t.icon}</div>
                <div>
                  <div className="text-base font-bold uppercase tracking-wide" style={{ color: t.color }}>{t.name}</div>
                  <p className="mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#851DEF]/8 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-lg bg-[var(--color-accent)] opacity-[0.07] blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,10,61,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,10,61,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-bold uppercase text-white mb-4 leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
            Ready to<br /><span style={{ color: "#851DEF" }}>Experience It?</span>
          </h2>
          <p className="mb-3 max-w-2xl mx-auto">Every feature on this page is live and ready. No demos, no mockups — the real thing.</p>
          <p className="mb-12">Questions? Reach out via the contact page.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CosmicRadialButton
              icon={false}
              onClick={() => window.location.href = "/fans"}
              className="px-8 py-4 text-white font-bold text-base tracking-[0.15em] rounded-lg"
            >
              Join as a Fan →
            </CosmicRadialButton>
            <Link href="/live" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-[#00000029] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold text-base uppercase tracking-[0.15em] rounded-lg transition-colors">Watch Live</Link>
            <Link href="/#tour" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-[#00000029] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold text-base uppercase tracking-[0.15em] rounded-lg transition-colors">See Tour Dates</Link>
            <Link href="/book" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-[#00000029] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold text-base uppercase tracking-[0.15em] rounded-lg transition-colors">Book the Band</Link>
            <Link href="/contact" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-[#00000029] hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold text-base uppercase tracking-[0.15em] rounded-lg transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
