"use client";

import React, { useState } from "react";

export default function CruiseLayoutA() {
  const [signupStatus, setSignupStatus] = useState<"idle"|"submitting"|"success">("idle");
  const [form, setForm] = useState({ name: "", email: "", guests: "2" });
  const [openFaq, setOpenFaq] = useState<number|null>(null);
  const signupCount = 142;
  const totalGuests = 284;
  const GOAL = 400;
  const progress = Math.min((totalGuests / GOAL) * 100, 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("submitting");
    setTimeout(() => setSignupStatus("success"), 1000);
  };

  const ITINERARY = [
    { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck." },
    { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater." },
    { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach." },
    { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band." },
    { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy." },
    { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party." },
    { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home." },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">

      {/* ── FULL-VIEWPORT HERO ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cruise-hero.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[var(--color-bg-primary)]" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Gauging Interest — Free Signup
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            7th Heaven <span className="accent-gradient-text">Cruise</span>
          </h1>
          <p className="text-xl text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            7 nights. 3 islands. 6 live shows. The ultimate fan experience on the Caribbean.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white/40">
            <span>🚢 Miami → Caribbean</span>
            <span>🏝️ Cozumel · Grand Cayman · Roatán</span>
            <span>🎸 6 Performances</span>
          </div>

        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-[0.55rem] uppercase tracking-widest font-bold">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* ── SIGNUP + COUNTER (overlapping hero) ── */}
      <section id="signup" className="site-container max-w-4xl -mt-20 relative z-20 mb-20">
        <div className="bg-[#0d0d14]/95 backdrop-blur-xl border border-[var(--color-accent)]/30 rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(133,29,239,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight mb-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Join the <span className="accent-gradient-text">Journey</span>
              </h2>
              <p className="text-white/40 text-sm mb-6">Free, non-binding. Just show us you&apos;re interested.</p>
              {signupStatus === "success" ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                  <span className="text-3xl block mb-3">🚢</span>
                  <p className="text-white font-bold">You&apos;re on the list!</p>
                  <p className="text-emerald-400 text-sm mt-1">We&apos;ll email you when rates are locked.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                  <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                  <select value={form.guests} onChange={e => setForm(f => ({...f, guests: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option value="1">Just me (1)</option><option value="2">2 guests</option><option value="4">4 guests</option><option value="6">6+ guests</option>
                  </select>
                  <button type="submit" disabled={signupStatus === "submitting"}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                    {signupStatus === "submitting" ? "Submitting..." : "Count Me In"}
                  </button>
                </form>
              )}
            </div>
            {/* Counter */}
            <div className="flex flex-col justify-center">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">Fan Interest Tracker</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{signupCount}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Fans</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{totalGuests}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Total Guests</p>
                </div>
              </div>
              <div className="mb-2 flex justify-between text-[0.55rem] font-bold uppercase tracking-widest text-white/25">
                <span>Progress</span><span>{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[0.6rem] text-white/25">{GOAL - totalGuests} more guests unlock the best group rate</p>
              <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[0.55rem] text-white/30 font-bold uppercase tracking-widest mb-2">How it works</p>
                <div className="space-y-2">
                  {["Sign up free — tell us your group size", "We negotiate the rate with cruise management", "You get first access at the locked-in price"].map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-[0.5rem] font-black text-[var(--color-accent)] shrink-0">{i+1}</span>
                      <p className="text-[0.75rem] text-white/40">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ITINERARY TIMELINE ── */}
      <section className="site-container max-w-4xl mb-20">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-10 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Day-by-Day <span className="accent-gradient-text">Itinerary</span>
        </h2>
        <div className="space-y-0">
          {ITINERARY.map(day => (
            <div key={day.day} className="flex gap-6 group">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl group-hover:border-[var(--color-accent)]/50 group-hover:bg-[var(--color-accent)]/10 transition-all">{day.icon}</div>
                {day.day < 7 && <div className="w-px flex-1 bg-gradient-to-b from-white/10 to-transparent mt-2" />}
              </div>
              <div className="pb-8">
                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Day {day.day}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{day.port}</h3>
                <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/20">{day.label}</span>
                <p className="text-[0.85rem] text-white/35 leading-relaxed mt-1">{day.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Layout label */}
      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Layout A — Cinematic
      </div>
    </div>
  );
}
