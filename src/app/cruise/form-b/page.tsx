"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FormLayoutB() {
  const supabase = createClient();
  const [signupStatus, setSignupStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [form, setForm] = useState({ name: "", email: "", guests: "2" });
  const [signupCount, setSignupCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { count } = await supabase.from('cruise_signups').select('*', { count: 'exact', head: true });
        setSignupCount(count || 0);
      } catch {}
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("submitting");
    try {
      const res = await fetch('/api/cruise/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email.toLowerCase().trim(), guest_count: parseInt(form.guests) || 2 }),
      });
      if (!res.ok) throw new Error();
      setSignupStatus("success");
      setSignupCount(p => p + 1);
    } catch { setSignupStatus("error"); }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4">
      {/* Photo Split Card */}
      <div className="w-full max-w-4xl bg-[#0d0d14]/95 backdrop-blur-xl border border-cyan-500/20 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,200,255,0.08)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
          {/* Left: Photo */}
          <div className="relative hidden lg:block">
            <img src="/images/cruise-hero.png" alt="Cruise" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0d14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14]/60 via-transparent to-transparent" />
            {/* Overlay badge */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[0.6rem] font-bold text-white/70 uppercase tracking-widest">{signupCount} fans interested</span>
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex flex-col justify-center p-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tight mb-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Set Sail <span className="bg-gradient-to-r from-cyan-400 to-[var(--color-accent)] bg-clip-text text-transparent">With Us</span>
            </h2>
            <p className="text-white/35 text-sm mb-8">Join the 7th Heaven Caribbean Cruise.</p>

            {signupStatus === "success" ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                <span className="text-3xl block mb-3">🚢</span>
                <p className="text-white font-bold text-lg">You&apos;re on the list!</p>
                <p className="text-emerald-400 text-sm mt-2">Check your email for confirmation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/25 mb-1.5 block">Name</label>
                  <input type="text" required placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:border-cyan-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/25 mb-1.5 block">Email</label>
                  <input type="email" required placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:border-cyan-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/25 mb-1.5 block">Guests</label>
                  <select value={form.guests} onChange={e => setForm(f => ({...f, guests: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option value="1">Just me (1)</option><option value="2">2 guests</option><option value="4">4 guests</option><option value="6">6+</option>
                  </select>
                </div>
                <button type="submit" disabled={signupStatus === "submitting"}
                  className="w-full bg-gradient-to-r from-cyan-500 to-[var(--color-accent)] hover:from-cyan-400 hover:to-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(0,200,255,0.2)] disabled:opacity-70 cursor-pointer">
                  {signupStatus === "submitting" ? "Submitting..." : "I'm Interested"}
                </button>
                {signupStatus === "error" && <p className="text-rose-400 text-xs text-center">Something went wrong.</p>}
              </form>
            )}

            <p className="text-white/20 text-[0.65rem] text-center mt-5 tracking-wide">Free · No Commitment · Cancel Anytime</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Form B — Photo Split
      </div>
    </div>
  );
}
