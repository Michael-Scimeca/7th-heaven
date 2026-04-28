"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const ITINERARY = [
  { day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", desc: "Board the ship and join the Sail-Away Party with 7th Heaven on the pool deck." },
  { day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", desc: "Acoustic set by the pool. Meet & Greet. Full electric show in the main theater." },
  { day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", desc: "Explore Mayan ruins, snorkel crystal reefs, or chill on the beach." },
  { day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", desc: "Stingray City, Seven Mile Beach. Sunset deck session with the band." },
  { day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", desc: "World-class diving and zip-lining through the jungle canopy." },
  { day: 6, port: "At Sea", label: "Sea Day", icon: "🎸", desc: "Grand Finale — full 2-hour concert, fan-request setlist, after-party." },
  { day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", desc: "Farewell breakfast and group photo before heading home." },
];

const FAQS = [
  { q: "How does the group deal work?", a: "We take the total number of interested fans to cruise line management and negotiate the best possible group rate. The more people who sign up, the better the deal for everyone." },
  { q: "Am I committing to buy by signing up?", a: "No — signing up is free and non-binding. It just tells us you're interested so we can negotiate the best rate. You'll get first access to book once pricing is locked in." },
  { q: "When will I know the final price?", a: "Once we hit our target number of interested fans, we'll take the headcount to cruise management. You'll be emailed the negotiated pricing before anyone else." },
  { q: "Is 7th Heaven playing the whole cruise?", a: "Yes! We have multiple performances planned — from intimate acoustic sets by the pool to a full-production grand finale concert." },
  { q: "Can I bring friends and family?", a: "Absolutely! When you sign up, tell us how many people you'd bring. Every person counts toward the group rate, so the more the merrier." },
  { q: "What's included?", a: "Cabin, meals at main dining venues, all 7th Heaven performances, and standard cruise amenities. Drink packages and excursions are typically additional." },
];

export default function CruisePage() {
  const supabase = createClient();
  const [signupStatus, setSignupStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", anonymous: false });
  const [guests, setGuests] = useState<{name: string; email: string; phone: string; age: string; type: "adult" | "child"}[]>([]);
  const [openPanel, setOpenPanel] = useState<number>(-1); // -1 = primary booker open by default handled below
  const [primaryOpen, setPrimaryOpen] = useState(true);

  const GUEST_COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#8b5cf6", "#f97316"];

  const addGuest = () => {
    setGuests(prev => [...prev, { name: "", email: "", phone: "", age: "", type: "adult" }]);
    setOpenPanel(guests.length);
    setPrimaryOpen(false);
  };

  const removeGuest = (idx: number) => {
    setGuests(prev => prev.filter((_, i) => i !== idx));
    if (openPanel === idx) setOpenPanel(-1);
  };

  const updateGuest = (index: number, field: string, value: string) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [signupCount, setSignupCount] = useState<number>(0);
  const [joinedFans, setJoinedFans] = useState<{name: string; guest_count: number; anonymous: boolean; created_at: string}[]>([]);
  const [totalGuests, setTotalGuests] = useState<number>(0);

  const AVATAR_COLORS = ["#851DEF", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#8b5cf6"];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/cruise/count');
        if (res.ok) {
          const data = await res.json();
          setSignupCount(data.signupCount);
          setTotalGuests(data.totalGuests);
          setJoinedFans(data.joinedFans);
        }
      } catch {}
    };
    loadStats();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("submitting");
    try {
      const res = await fetch('/api/cruise/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase().trim(),
          phone: form.phone || null,
          guest_count: 1 + guests.length,
          notes: form.notes || null,
          anonymous: form.anonymous,
          guests: guests.filter(g => g.name).map(g => ({
            name: g.name,
            email: g.email || null,
            phone: g.phone || null,
            age: g.type === "child" ? (g.age || null) : null,
            type: g.type,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setSignupStatus("error");
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }
      setSignupStatus("success");
      setSignupCount(prev => prev + 1);
      setTotalGuests(prev => prev + 1 + guests.length);
      setForm({ name: "", email: "", phone: "", notes: "", anonymous: false });
      setGuests([]);
    } catch {
      setSignupStatus("error");
    }
  };

  const GOAL = 200;
  const progress = Math.min((totalGuests / GOAL) * 100, 100);

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
      <section id="signup" className="site-container -mt-20 relative z-20 mb-20">
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
                  <p className="text-white font-bold text-lg">You&apos;re on the list!</p>
                  <p className="text-emerald-400 text-sm mt-2">Check your email for a confirmation with all the cruise details.</p>
                  <p className="text-white/30 text-xs mt-3">If you change your mind, you can cancel from the email anytime.</p>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* ── Collapsible Guest List ── */}
                  <div className="space-y-2">
                    {/* Primary Booker */}
                    <div className="rounded-xl overflow-hidden border border-white/5">
                      <button type="button" onClick={() => { setPrimaryOpen(!primaryOpen); setOpenPanel(-1); }}
                        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-all bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/25">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0 bg-[var(--color-accent)]">
                          {form.name ? form.name[0].toUpperCase() : "1"}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-[0.5rem] font-bold uppercase tracking-widest text-white/40">Primary Booker</p>
                          <p className="text-sm font-bold text-white">{form.name || "—"}</p>
                        </div>
                        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20 mr-2">Adult</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/30 transition-transform ${primaryOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      {primaryOpen && (
                        <div className="px-4 pb-4 pt-3 space-y-2.5 bg-white/[0.01]">
                          <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                          <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                          <input type="tel" required placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                        </div>
                      )}
                    </div>

                    {/* Additional Guests */}
                    {guests.map((guest, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-white/5">
                        <button type="button" onClick={() => { setOpenPanel(openPanel === i ? -1 : i); setPrimaryOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-all bg-white/[0.03] hover:bg-white/[0.05]">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0" style={{ backgroundColor: GUEST_COLORS[i % GUEST_COLORS.length] }}>
                            {guest.name ? guest.name[0].toUpperCase() : (i + 2)}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="text-[0.5rem] font-bold uppercase tracking-widest text-white/30">Guest {i + 2}</p>
                            <p className="text-sm font-bold text-white">{guest.name || "—"}</p>
                          </div>
                          <span className={`text-[0.5rem] font-bold uppercase tracking-widest mr-2 ${guest.type === "child" ? "text-cyan-400/60" : "text-white/20"}`}>
                            {guest.type === "child" ? "Child" : "Adult"}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/30 transition-transform ${openPanel === i ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        {openPanel === i && (
                          <div className="px-4 pb-4 pt-3 space-y-2.5 bg-white/[0.01]">
                            {/* Adult / Child Toggle */}
                            <div className="flex gap-2 mb-1">
                              <button type="button" onClick={() => updateGuest(i, "type", "adult")}
                                className={`flex-1 py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                  guest.type === "adult" ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30" : "bg-white/[0.03] text-white/25 border border-white/5 hover:text-white/40"
                                }`}>👤 Adult</button>
                              <button type="button" onClick={() => updateGuest(i, "type", "child")}
                                className={`flex-1 py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                  guest.type === "child" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-white/[0.03] text-white/25 border border-white/5 hover:text-white/40"
                                }`}>🧒 Child</button>
                            </div>
                            <input type="text" required placeholder={guest.type === "child" ? "Child's Name" : "Guest Name"} value={guest.name} onChange={e => updateGuest(i, "name", e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                            {guest.type === "child" && (
                              <select value={guest.age} onChange={e => updateGuest(i, "age", e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer">
                                <option value="" disabled>Child&apos;s Age</option>
                                {Array.from({ length: 18 }, (_, n) => (
                                  <option key={n} value={String(n)} className="bg-[#0d0d14] text-white">{n === 0 ? "Under 1" : `${n} year${n > 1 ? "s" : ""} old`}</option>
                                ))}
                              </select>
                            )}
                            {guest.type === "adult" && (
                              <>
                                <input type="email" required placeholder="Email" value={guest.email} onChange={e => updateGuest(i, "email", e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                                <input type="tel" required placeholder="Phone" value={guest.phone} onChange={e => updateGuest(i, "phone", e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                              </>
                            )}
                            <button type="button" onClick={() => removeGuest(i)}
                              className="text-[0.6rem] text-red-400/40 hover:text-red-400 font-bold uppercase tracking-widest transition-colors cursor-pointer">Remove Guest</button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Guest Button */}
                    <button type="button" onClick={addGuest}
                      className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest text-white/20 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-colors cursor-pointer">
                      + Add a Guest
                    </button>
                  </div>
                  <textarea placeholder="Anything else? (optional)" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-none" />
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({...f, anonymous: e.target.checked}))}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--color-accent)] cursor-pointer" />
                    <span className="text-[0.75rem] text-white/40 group-hover:text-white/60 transition-colors">Keep my name anonymous on the public list</span>
                  </label>
                  <button type="submit" disabled={signupStatus === "submitting"}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                    {signupStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : "Count Me In"}
                  </button>
                  <p className="text-[0.6rem] text-white/25 text-center leading-relaxed">
                    By signing up you agree to our <a href="/privacy" className="text-white/40 underline hover:text-white/60 transition-colors">Privacy Policy</a> and <a href="/terms" className="text-white/40 underline hover:text-white/60 transition-colors">Terms of Service</a>. You'll receive a confirmation email. You can cancel anytime.
                  </p>
                  {signupStatus === "error" && <p className="text-rose-400 text-xs text-center">Something went wrong. Try again.</p>}
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

              {/* Who's Joined */}
              {joinedFans.length > 0 && (
                <div className="mt-6 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-[0.55rem] text-white/30 font-bold uppercase tracking-widest mb-4">Who&apos;s Joined</p>
                  
                  {/* Avatar Stack */}
                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                      {joinedFans.slice(0, 8).map((fan, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white border-2 border-[#0d0d14] shrink-0 relative z-[1] hover:z-10 hover:scale-110 transition-transform cursor-default"
                          style={{ backgroundColor: fan.anonymous ? '#374151' : AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 8 - i }}
                          title={fan.anonymous ? 'Anonymous Fan' : fan.name}
                        >
                          {fan.anonymous ? '?' : fan.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {joinedFans.length > 8 && (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white/60 bg-white/10 border-2 border-[#0d0d14] shrink-0">
                          +{joinedFans.length - 8}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Names List */}
                  <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                    {joinedFans.map((fan, i) => (
                      <span key={i} className="text-[0.7rem] text-white/40">
                        {fan.anonymous ? 'Anonymous' : fan.name.split(' ')[0]}
                        {fan.guest_count > 1 && <span className="text-white/20"> +{fan.guest_count - 1}</span>}
                        {i < joinedFans.length - 1 && <span className="text-white/15 mx-0.5">·</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ITINERARY TIMELINE ── */}
      <section className="site-container mb-20">
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

      {/* ── WHAT'S INCLUDED ── */}
      <section className="site-container mb-20">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          What&apos;s <span className="accent-gradient-text">Included</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🎸", title: "Multiple Live Shows", desc: "Acoustic sets, full-band concerts, and exclusive jam sessions throughout the cruise." },
            { icon: "🤝", title: "Meet & Greet", desc: "Hang with the band in small groups. Photos, conversations, and fan-only moments." },
            { icon: "🍽️", title: "All Meals Included", desc: "Main dining, buffets, and room service included in your cabin rate." },
            { icon: "🏝️", title: "3 Island Stops", desc: "Cozumel, Grand Cayman, and Roatán with optional group excursions." },
            { icon: "🎉", title: "Exclusive Events", desc: "Sail-away party, sunset deck sessions, and a grand finale after-party." },
            { icon: "💰", title: "Group Rate Pricing", desc: "The more fans who sign up, the better the deal we negotiate for everyone." },
          ].map(item => (
            <div key={item.title} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-colors">
              <span className="text-2xl block mb-3">{item.icon}</span>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-[0.75rem] text-white/35 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="site-container mb-16 pb-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Questions? <span className="accent-gradient-text">Answers.</span>
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer">
                <span className="font-bold text-[0.9rem] text-white pr-4">{faq.q}</span>
                <span className={`text-white/30 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-[0.85rem] text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
