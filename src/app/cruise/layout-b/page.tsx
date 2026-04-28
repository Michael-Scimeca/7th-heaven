"use client";

import React, { useState } from "react";

export default function CruiseLayoutB() {
  const [signupStatus, setSignupStatus] = useState<"idle"|"submitting"|"success">("idle");
  const [form, setForm] = useState({ name: "", email: "", guests: "2" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("submitting");
    setTimeout(() => setSignupStatus("success"), 1000);
  };

  const ISLANDS = [
    { name: "Cozumel", country: "Mexico", desc: "Crystal reefs, Mayan ruins, and world-famous beach bars.", icon: "🏝️", highlights: ["Snorkeling", "Mayan Ruins", "Beach Clubs"] },
    { name: "Grand Cayman", country: "Cayman Islands", desc: "Stingray City, Seven Mile Beach, and sunset cocktails.", icon: "🐢", highlights: ["Stingray City", "Seven Mile Beach", "Diving"] },
    { name: "Roatán", country: "Honduras", desc: "Jungle zip-lines, world-class diving, and untouched nature.", icon: "🤿", highlights: ["Zip-lining", "Scuba Diving", "Jungle Tours"] },
  ];

  const STEPS = [
    { n: "01", title: "Sign Up Free", desc: "Tell us you're interested and how many you'd bring. No cost, no commitment.", icon: "✍️" },
    { n: "02", title: "We Negotiate", desc: "We take the total headcount to cruise management and lock in the best group rate.", icon: "🤝" },
    { n: "03", title: "You Get First Access", desc: "We email you the price before anyone else. Book at the locked-in rate.", icon: "🎟️" },
    { n: "04", title: "Set Sail", desc: "Board the ship, meet the band, and have the time of your life.", icon: "🚢" },
  ];

  return (
    <div className="min-h-screen pt-[72px] bg-[var(--color-bg-primary)]">

      {/* ── SPLIT-SCREEN HERO ── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left: text + form */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Free Signup — No Commitment
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.95]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Set Sail<br/>With <span className="accent-gradient-text">7th Heaven</span>
            </h1>
            <p className="text-white/40 text-[0.95rem] mt-5 max-w-md leading-relaxed">
              7-night Caribbean cruise with live shows, island hopping, meet & greets, and the ultimate fan experience. The more people who sign up, the better the deal.
            </p>

            {/* Inline signup */}
            {signupStatus === "success" ? (
              <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <p className="text-emerald-400 font-bold">🚢 You&apos;re on the list! We&apos;ll be in touch.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-3 max-w-md">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors text-sm" />
                  <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors text-sm" />
                </div>
                <div className="flex gap-3">
                  <select value={form.guests} onChange={e => setForm(f => ({...f, guests: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors text-sm appearance-none cursor-pointer flex-1">
                    <option value="1">1 guest</option><option value="2">2 guests</option><option value="4">4 guests</option><option value="6">6+</option>
                  </select>
                  <button type="submit" disabled={signupStatus === "submitting"}
                    className="px-8 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer whitespace-nowrap">
                    Count Me In
                  </button>
                </div>
              </form>
            )}

            {/* Quick stats */}
            <div className="flex gap-8 mt-8 pt-6 border-t border-white/5">
              {[{ n: "142", l: "Fans Interested" }, { n: "284", l: "Total Guests" }, { n: "7", l: "Nights" }].map(s => (
                <div key={s.l}>
                  <p className="text-2xl font-black text-white">{s.n}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/25">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: photo */}
          <div className="relative hidden lg:block">
            <img src="/images/cruise-hero.png" alt="Cruise ship at sunset" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* ── ISLAND DESTINATION CARDS ── */}
      <section className="site-container max-w-5xl py-20">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-2 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Island <span className="accent-gradient-text">Destinations</span>
        </h2>
        <p className="text-white/30 text-sm text-center mb-12">Three stops across the Caribbean — each with its own adventure.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ISLANDS.map(island => (
            <div key={island.name} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group">
              {/* Island photo placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-cyan-900/30 to-blue-900/30 relative overflow-hidden">
                <img src="/images/cruise-hero.png" alt={island.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-2xl">{island.icon}</span>
                  <h3 className="text-xl font-black text-white mt-1">{island.name}</h3>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">{island.country}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[0.8rem] text-white/40 leading-relaxed mb-4">{island.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {island.highlights.map(h => (
                    <span key={h} className="px-2.5 py-1 bg-cyan-500/5 border border-cyan-500/15 rounded-full text-[0.55rem] text-cyan-400 font-bold uppercase tracking-widest">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (4 steps) ── */}
      <section className="site-container max-w-5xl pb-20">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-12 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          How It <span className="accent-gradient-text">Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-[var(--color-accent)]/30 transition-all group">
              {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-white/10 text-xl">→</div>}
              <span className="text-3xl block mb-3">{step.icon}</span>
              <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Step {step.n}</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">{step.title}</h3>
              <p className="text-[0.75rem] text-white/35 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="site-container max-w-5xl pb-20">
        <div className="bg-gradient-to-r from-[var(--color-accent)]/5 to-cyan-500/5 border border-white/5 rounded-3xl p-10">
          <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            What&apos;s <span className="accent-gradient-text">Included</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🎸", text: "6 Live Performances" },
              { icon: "🤝", text: "Meet & Greet Sessions" },
              { icon: "🍽️", text: "All Meals Included" },
              { icon: "🏝️", text: "3 Island Excursions" },
              { icon: "🎉", text: "Pool Deck Parties" },
              { icon: "💰", text: "Group Rate Pricing" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-white/60 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layout label */}
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout B — Split Screen
      </div>
    </div>
  );
}
