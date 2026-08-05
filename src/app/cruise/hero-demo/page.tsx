"use client";

import { useState } from "react";

const layouts = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
type Layout = typeof layouts[number];

export default function HeroDemoPage() {
  const [active, setActive] = useState<Layout>("A");

  return (
    <div className="bg-[var(--color-bg-deep)] min-h-screen">
      {/* Layout Switcher */}
      <div className="fixed top-20 right-6 z-[999] flex flex-col gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3">
        <p className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.25em] text-white/40 text-center mb-1">Layout</p>
        {layouts.map(l => (
          <button
            key={l}
            onClick={() => setActive(l)}
            className={`w-10 h-10 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              active === l
                ? "bg-[var(--color-accent)] text-white  shadow-[var(--color-accent)]/30"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          LAYOUT A — Split Hero (Text Left, Stats Right)
          ═══════════════════════════════════════════ */}
      {active === "A" && (
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 site-container min-h-screen flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full py-32">
              {/* Left — Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Gauging Interest — Free Signup
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white drop- leading-[0.9]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  7th Heaven<br />
                  <span className="accent-gradient-text">Cruise</span>
                </h1>
                <p className="text-lg text-white/50 mt-6 max-w-md leading-relaxed">
                  7 nights. 3 islands. 6 live shows. The ultimate fan experience on the Caribbean.
                </p>

                {/* Quick Stats */}
                <div className="flex gap-4 mt-8">
                  {[
                    { val: "7", label: "Nights" },
                    { val: "3", label: "Islands" },
                    { val: "6", label: "Shows" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] px-6 py-4 text-center">
                      <p className="text-2xl font-black text-white">{s.val}</p>
                      <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.2em] text-white/30 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <a href="#signup" className="px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)]">
                    Count Me In
                  </a>
                  <a href="#itinerary" className="px-8 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-white font-bold uppercase tracking-widest text-sm transition-all hover:bg-white/[0.1]">
                    View Itinerary
                  </a>
                </div>
              </div>

              {/* Right — Glass Card */}
              <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">Fan Interest Tracker</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/[0.05] backdrop-blur-md border border-white/[0.1] p-5 text-center">
                    <p className="text-4xl font-black text-white">5</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Fans</p>
                  </div>
                  <div className="bg-white/[0.05] backdrop-blur-md border border-white/[0.1] p-5 text-center">
                    <p className="text-4xl font-black text-white">9</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Total Guests</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {["🚢 Miami → Cozumel → Grand Cayman → Roatán", "🎸 6 Live Performances", "🏝️ 3 Island Excursions"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08]">
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex -space-x-2 mb-3">
                  {["#851DEF", "#3b82f6", "#06b6d4", "#9333ea", "#10b981"].map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0d0d14] flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c, zIndex: 5 - i }}>
                      {["E", "M", "D", "T", "T"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/30">E2E · Michael · d +1 · Test +2 · Test +1</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT B — Centered Cinematic (Big Title, CTA below)
          ═══════════════════════════════════════════ */}
      {active === "B" && (
        <section className="relative min-h-screen overflow-hidden flex flex-col">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050508]" />
          </div>

          {/* Top center content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              7 Nights · 3 Islands · 6 Shows
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black uppercase italic tracking-tighter text-white drop- leading-[0.85]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Cruise
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mt-4 mb-8">
              with 7th Heaven · Caribbean 2027
            </p>

            {/* Horizontal glass stat bar */}
            <div className="flex items-center gap-0 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] overflow-hidden shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
              {[
                { icon: "🚢", label: "Miami Departure" },
                { icon: "🏝️", label: "Cozumel" },
                { icon: "🐢", label: "Grand Cayman" },
                { icon: "🤿", label: "Roatán" },
                { icon: "🎸", label: "6 Live Shows" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-2 px-6 py-4 ${i > 0 ? "border-l border-white/[0.08]" : ""}`}>
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom floating CTA */}
          <div className="relative z-10 site-container pb-16">
            <div className="flex items-center justify-between bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] p-6 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {["#851DEF", "#3b82f6", "#06b6d4", "#9333ea", "#10b981"].map((c, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black/30 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c, zIndex: 5 - i }}>
                      {["E", "M", "D", "T", "T"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">9 guests already interested</p>
                  <p className="text-white/40 text-xs">Free, non-binding signup</p>
                </div>
              </div>
              <a href="#signup" className="px-10 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)]">
                Count Me In →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT C — Asymmetric Editorial (Offset Title + Vertical Ticker)
          ═══════════════════════════════════════════ */}
      {active === "C" && (
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#050508]" />
          </div>

          {/* Left-aligned content */}
          <div className="relative z-10 site-container min-h-screen flex flex-col justify-end pb-20 pt-32">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
              {/* Left column */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  2027 Caribbean
                </div>
                <h1 className="text-6xl md:text-[8rem] font-black uppercase italic tracking-tighter text-white drop- leading-[0.85]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Set Sail<br />
                  <span className="accent-gradient-text">With Us</span>
                </h1>
                <p className="text-lg text-white/50 mt-6 max-w-lg leading-relaxed">
                  The ultimate 7th Heaven fan experience — 7 nights on the Caribbean with 6 live shows, 3 island stops, and the whole crew.
                </p>
                <div className="flex gap-4 mt-8">
                  <a href="#signup" className="px-10 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)]">
                    I&apos;m In
                  </a>
                  <a href="#itinerary" className="px-10 py-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-white font-bold uppercase tracking-widest text-sm transition-all hover:bg-white/[0.1]">
                    See the Schedule
                  </a>
                </div>
              </div>

              {/* Right — Vertical glass ticker */}
              <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] p-6 w-72 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Live Ticker</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-emerald-400/70">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { who: "E2E", action: "signed up", time: "2m ago", color: "#851DEF" },
                    { who: "Michael", action: "added +1 guest", time: "15m ago", color: "#3b82f6" },
                    { who: "Dave", action: "signed up", time: "1h ago", color: "#06b6d4" },
                    { who: "Test", action: "added +2 guests", time: "3h ago", color: "#9333ea" },
                    { who: "Test", action: "signed up", time: "5h ago", color: "#10b981" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/[0.08]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: item.color }}>
                        {item.who[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.who}</p>
                        <p className="text-xs text-white/30">{item.action}</p>
                      </div>
                      <span className="text-[var(--font-size-2xs)] text-white/20 shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-white">9</p>
                    <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.2em] text-white/25">Total Guests</p>
                  </div>
                  <a href="#signup" className="px-5 py-2.5 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs rounded-lg transition-all hover:bg-[var(--color-accent)]/30">
                    Join →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT D — Countdown / Event Style
          ═══════════════════════════════════════════ */}
      {active === "D" && (
        <section className="relative min-h-screen overflow-hidden flex items-center">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#050508]" />
          </div>
          <div className="relative z-10 site-container text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400 mb-6">Departing From Miami · 2027</p>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white drop-" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              7th Heaven <span className="accent-gradient-text">Cruise</span>
            </h1>
            <p className="text-white/50 text-lg mt-4 mb-12 max-w-xl mx-auto">The ultimate fan experience on the Caribbean.</p>

            {/* Countdown Blocks */}
            <div className="flex justify-center gap-4 mb-12">
              {[
                { val: "247", label: "Days" },
                { val: "14", label: "Hours" },
                { val: "32", label: "Minutes" },
                { val: "08", label: "Seconds" },
              ].map(t => (
                <div key={t.label} className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] w-24 h-28 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <p className="text-3xl font-black text-white tabular-nums">{t.val}</p>
                  <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.25em] text-white/30 mt-1">{t.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex justify-between text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-white/30 mb-2">
                <span>9 / 200 guests</span>
                <span>4.5%</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]">
                <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-400 rounded-full transition-all" style={{ width: "4.5%" }} />
              </div>
            </div>

            <a href="#signup" className="inline-block px-12 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)]">
              Reserve My Spot
            </a>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT E — Boarding Pass
          ═══════════════════════════════════════════ */}
      {active === "E" && (
        <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
            {/* Boarding Pass Card */}
            <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] rounded-3xl overflow-hidden shadow-[0_16px_80px_rgba(0,0,0,0.5)]">
              {/* Top stripe */}
              <div className="bg-[var(--color-accent)]/20 border-b border-white/[0.08] px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚢</span>
                  <div>
                    <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.3em] text-white/40">7th Heaven</p>
                    <p className="text-sm font-black uppercase tracking-widest text-white">Boarding Pass</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.3em] text-white/40">Cabin Class</p>
                  <p className="text-sm font-black uppercase tracking-widest text-[var(--color-accent)]">VIP Fan</p>
                </div>
              </div>

              {/* Main content */}
              <div className="px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">From</p>
                    <p className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>MIA</p>
                    <p className="text-xs text-white/40">Miami, FL</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center px-6">
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/20" />
                      <span className="text-white/40 text-xl">✈</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 via-white/20 to-transparent" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">To</p>
                    <p className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>CZM</p>
                    <p className="text-xs text-white/40">Cozumel, MX</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Duration", val: "7 Nights" },
                    { label: "Islands", val: "3 Stops" },
                    { label: "Shows", val: "6 Live" },
                    { label: "Guests", val: "9" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] p-3 text-center">
                      <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.25em] text-white/30 mb-1">{s.label}</p>
                      <p className="text-sm font-black text-white">{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* Dashed separator */}
                <div className="border-t-2 border-dashed border-white/[0.1] mb-8 relative">
                  <div className="absolute -left-12 -top-4 w-8 h-8 rounded-full bg-[var(--color-bg-deep)]" />
                  <div className="absolute -right-12 -top-4 w-8 h-8 rounded-full bg-[var(--color-bg-deep)]" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {["#851DEF", "#3b82f6", "#06b6d4", "#9333ea", "#10b981"].map((c, i) => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-black/30 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c, zIndex: 5 - i }}>
                        {["E", "M", "D", "T", "T"][i]}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full bg-white/10 border-2 border-black/30 flex items-center justify-center text-[var(--font-size-2xs)] font-bold text-white/40">+4</div>
                  </div>
                  <a href="#signup" className="px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)]">
                    Board Now →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT F — Magazine Cover
          ═══════════════════════════════════════════ */}
      {active === "F" && (
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/20" />
          </div>

          {/* Magazine-style overlay frame */}
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="site-container pt-28 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-black text-sm">7H</div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest">7th Heaven</p>
                  <p className="text-white/30 text-[var(--font-size-2xs)] uppercase tracking-[0.3em]">Official Cruise Issue</p>
                </div>
              </div>
              <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-full px-5 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">9 fans onboard</span>
              </div>
            </div>

            {/* Center title — pushed down */}
            <div className="flex-1 flex items-end">
              <div className="site-container pb-24 w-full">
                <div className="max-w-3xl">
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--color-accent)] mb-3">Caribbean 2027</p>
                  <h1 className="text-5xl md:text-[6.5rem] font-black uppercase italic text-white leading-[0.85] tracking-tighter" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    Rock the<br />Ocean
                  </h1>
                  <div className="flex items-center gap-6 mt-6">
                    <p className="text-white/50 text-base max-w-sm leading-relaxed">
                      7 nights. 3 islands. The band. The fans. One unforgettable voyage.
                    </p>
                    <a href="#signup" className="shrink-0 px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)]">
                      Join the Voyage
                    </a>
                  </div>
                </div>

                {/* Bottom stat strip */}
                <div className="flex gap-8 mt-10">
                  {[
                    { val: "7", label: "Nights at Sea", accent: true },
                    { val: "3", label: "Island Stops", accent: false },
                    { val: "6", label: "Live Shows", accent: true },
                    { val: "∞", label: "Memories", accent: false },
                  ].map(s => (
                    <div key={s.label} className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${s.accent ? "text-[var(--color-accent)]" : "text-white"}`}>{s.val}</span>
                      <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.2em] text-white/30">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT G — Minimal Typographic
          ═══════════════════════════════════════════ */}
      {active === "G" && (
        <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 text-center px-6">
            <div className="flex items-center justify-center gap-8 text-xs font-bold uppercase tracking-[0.4em] text-white/30 mb-10">
              <span>Miami</span>
              <span className="w-6 h-px bg-white/20" />
              <span>Cozumel</span>
              <span className="w-6 h-px bg-white/20" />
              <span>Grand Cayman</span>
              <span className="w-6 h-px bg-white/20" />
              <span>Roatán</span>
            </div>
            <h1 className="text-[clamp(3rem,12vw,12rem)] font-black uppercase italic tracking-tighter text-white leading-[0.8]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Cruise
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/30 mt-6 mb-12">
              with 7th Heaven · 7 nights · 6 shows · 2027
            </p>
            <div className="flex items-center justify-center gap-6">
              <a href="#signup" className="group flex items-center gap-3">
                <span className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,10,61,0.4)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Count Me In</span>
              </a>
            </div>
          </div>

          {/* Floating bottom stats */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-white/[0.05] backdrop-blur-2xl border border-white/[0.1] rounded-full px-8 py-3">
            <div className="flex -space-x-1.5">
              {["#851DEF", "#3b82f6", "#06b6d4"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-black/40 flex items-center justify-center text-[var(--font-size-2xs)] font-bold text-white" style={{ backgroundColor: c, zIndex: 3 - i }}>
                  {["E", "M", "D"][i]}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">9 guests interested</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">Free signup</span>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          LAYOUT H — Stacked Cards (Mobile-First Feel)
          ═══════════════════════════════════════════ */}
      {active === "H" && (
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover" poster="/images/cruise-hero.png">
              <source src="/movie/cruise.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#050508]" />
          </div>
          <div className="relative z-10 site-container min-h-screen flex flex-col justify-center py-32">
            <div className="max-w-xl mx-auto w-full space-y-4">
              {/* Title Card */}
              <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 text-center shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  2027 Caribbean
                </div>
                <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  7th Heaven <span className="accent-gradient-text">Cruise</span>
                </h1>
                <p className="text-white/40 mt-3 text-sm">7 nights. 3 islands. 6 live shows.</p>
              </div>

              {/* Route Card */}
              <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  {["🚢 Miami", "🏝️ Cozumel", "🐢 Cayman", "🤿 Roatán", "🎸 Miami"].map((stop, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {i > 0 && <div className="w-4 h-px bg-white/10 -ml-1 mr-1" />}
                      <span className="text-xs font-bold text-white/50">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: "7", label: "Nights", icon: "🌙" },
                  { val: "6", label: "Shows", icon: "🎸" },
                  { val: "9", label: "Guests", icon: "👥" },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] p-4 text-center shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                    <span className="text-lg block mb-1">{s.icon}</span>
                    <p className="text-2xl font-black text-white">{s.val}</p>
                    <p className="text-[var(--font-size-2xs)] font-bold uppercase tracking-[0.2em] text-white/25 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Social Proof Card */}
              <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] p-5 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <div className="flex -space-x-2">
                  {["#851DEF", "#3b82f6", "#06b6d4", "#9333ea", "#10b981"].map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-black/30 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c, zIndex: 5 - i }}>
                      {["E", "M", "D", "T", "T"][i]}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Join 5 fans & 9 guests</p>
                  <p className="text-xs text-white/30">Free, non-binding interest signup</p>
                </div>
              </div>

              {/* CTA */}
              <a href="#signup" className="block w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,10,61,0.3)] text-center">
                Count Me In →
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
