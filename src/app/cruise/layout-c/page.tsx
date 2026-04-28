"use client";

import React, { useState } from "react";

export default function CruiseLayoutC() {
  const [signupStatus, setSignupStatus] = useState<"idle"|"submitting"|"success">("idle");
  const [form, setForm] = useState({ name: "", email: "", guests: "2", phone: "" });
  const [stickyVisible, setStickyVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("submitting");
    setTimeout(() => setSignupStatus("success"), 1000);
  };

  const SECTIONS = [
    {
      title: "The Voyage",
      subtitle: "7 Nights on the Caribbean",
      desc: "Departing from Miami, we'll cruise through crystal waters to three incredible islands — Cozumel, Grand Cayman, and Roatán. Between ports, catch intimate acoustic sets by the pool and full-production concerts in the main theater.",
      align: "right" as const,
    },
    {
      title: "The Shows",
      subtitle: "6 Live Performances",
      desc: "From poolside acoustic jams at sunset to a blow-the-roof-off grand finale, 7th Heaven is playing six shows across the week. Request your favorite songs and experience the band like never before — 50 feet away, on a boat, in paradise.",
      align: "left" as const,
    },
    {
      title: "The Islands",
      subtitle: "Cozumel · Grand Cayman · Roatán",
      desc: "Snorkel crystal reefs in Cozumel. Swim with stingrays in Grand Cayman. Zip-line through jungle canopy in Roatán. Or just grab a beach chair and a cocktail — your call. Each port day is yours to explore.",
      align: "right" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">

      {/* ── EDITORIAL HERO ── */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <img src="/images/cruise-hero.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-black/40 to-black/20" />

        {/* Overlapping text blocks */}
        <div className="absolute inset-0 flex items-end">
          <div className="site-container pb-20 max-w-5xl">
            <div className="max-w-2xl">
              <div className="bg-black/70 backdrop-blur-sm px-8 py-6 -rotate-1 inline-block mb-4 border-l-4 border-[var(--color-accent)]">
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Rock the<br/>Wave
                </h1>
              </div>
              <div className="bg-amber-500/90 text-black px-6 py-3 rotate-1 inline-block ml-8">
                <p className="text-sm font-black uppercase tracking-widest">A 7th Heaven Cruise Experience</p>
              </div>
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 -rotate-[0.5deg] inline-block mt-4">
                <p className="text-white/80 font-bold">Miami → Caribbean · 7 Nights · 3 Islands · 6 Shows</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALTERNATING SECTIONS ── */}
      {SECTIONS.map((section, i) => (
        <section key={i} className="py-20 border-t border-white/5">
          <div className="site-container max-w-5xl">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${section.align === "left" ? "lg:direction-rtl" : ""}`}>
              {/* Photo */}
              <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden ${section.align === "left" ? "lg:order-2" : ""}`}>
                <img src="/images/cruise-hero.png" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  style={{ objectPosition: i === 0 ? 'center' : i === 1 ? 'center 30%' : 'center 70%' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Text */}
              <div className={section.align === "left" ? "lg:order-1 lg:text-right" : ""}>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-amber-400">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="text-4xl font-black uppercase italic tracking-tight mt-2 mb-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {section.title}
                </h2>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/25 mb-4">{section.subtitle}</p>
                <p className="text-[0.95rem] text-white/40 leading-relaxed max-w-md" style={section.align === "left" ? { marginLeft: "auto" } : {}}>{section.desc}</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── SIGNUP SECTION ── */}
      <section className="py-20 border-t border-white/5">
        <div className="site-container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Ready to <span className="accent-gradient-text">Set Sail</span>?
            </h2>
            <p className="text-white/40 text-sm mt-3">Free, non-binding interest signup. The more fans who join, the better rate we negotiate.</p>
          </div>

          {signupStatus === "success" ? (
            <div className="max-w-lg mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-3">🚢</span>
              <p className="text-xl font-bold text-white mb-1">You&apos;re on the list!</p>
              <p className="text-emerald-400 text-sm">We&apos;ll email you the moment rates are locked.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-colors" />
                <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-colors" />
                <select value={form.guests} onChange={e => setForm(f => ({...f, guests: e.target.value}))}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-amber-500 focus:outline-none transition-colors appearance-none cursor-pointer">
                  <option value="1">1 guest</option><option value="2">2 guests</option><option value="4">4 guests</option><option value="6">6+</option><option value="10">10+</option>
                </select>
              </div>
                <button type="submit" disabled={signupStatus === "submitting"} className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                {signupStatus === "submitting" ? "Submitting..." : "Count Me In — It's Free"}
                </button>
            </form>
          )}

          {/* Stats row */}
          <div className="flex justify-center gap-10 mt-10 pt-8 border-t border-white/5">
            {[{ n: "142", l: "Fans" }, { n: "284", l: "Guests" }, { n: "7", l: "Nights" }, { n: "3", l: "Islands" }, { n: "6", l: "Shows" }].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-black text-white">{s.n}</p>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-white/20">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY CTA BAR ── */}
      {stickyVisible && signupStatus !== "success" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="hidden md:block">
              <p className="text-white font-bold text-sm">Ready for the cruise? 🚢</p>
              <p className="text-white/40 text-xs">Free signup · No commitment · Group rate pricing</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <a href="#signup-section" onClick={e => { e.preventDefault(); document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex-1 md:flex-none px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all text-center">
                Sign Up Now
              </a>
              <button onClick={() => setStickyVisible(false)} className="text-white/30 hover:text-white text-xl cursor-pointer px-2">×</button>
            </div>
          </div>
        </div>
      )}

      {/* Layout label */}
      <div className="fixed bottom-16 right-6 z-50 px-4 py-2 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout C — Editorial
      </div>
    </div>
  );
}
