"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FormLayoutA() {
  const supabase = createClient();
  const [signupStatus, setSignupStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [form, setForm] = useState({ name: "", email: "", guests: "2", phone: "" });
  const [signupCount, setSignupCount] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { count } = await supabase.from('cruise_signups').select('*', { count: 'exact', head: true });
        const { data } = await supabase.from('cruise_signups').select('guest_count');
        setSignupCount(count || 0);
        setTotalGuests((data || []).reduce((s: number, r: any) => s + (r.guest_count || 1), 0));
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
        body: JSON.stringify({ name: form.name, email: form.email.toLowerCase().trim(), phone: form.phone || null, guest_count: parseInt(form.guests) || 2 }),
      });
      if (!res.ok) throw new Error();
      setSignupStatus("success");
      setSignupCount(p => p + 1);
      setTotalGuests(p => p + (parseInt(form.guests) || 2));
    } catch { setSignupStatus("error"); }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4">
      {/* Compact Grid Form */}
      <div className="w-full max-w-3xl relative">
        <div className="flex gap-6 items-stretch">
          {/* Form Card */}
          <div className="flex-1 bg-[#0d0d14]/95 backdrop-blur-xl border border-[var(--color-accent)]/30 rounded-3xl p-8 shadow-[0_0_60px_rgba(133,29,239,0.12)]">
            <h2 className="text-3xl font-black uppercase italic tracking-tight mb-2 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Join the <span className="accent-gradient-text">Voyage</span>
            </h2>
            <p className="text-white/35 text-sm text-center mb-6">Free, non-binding. Just show us you&apos;re interested.</p>

            {signupStatus === "success" ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                <span className="text-3xl block mb-3">🚢</span>
                <p className="text-white font-bold text-lg">You&apos;re on the list!</p>
                <p className="text-emerald-400 text-sm mt-2">Check your email for confirmation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                  <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                  <select value={form.guests} onChange={e => setForm(f => ({...f, guests: e.target.value}))}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option value="1">1 guest</option><option value="2">2 guests</option><option value="4">4 guests</option><option value="6">6+</option>
                  </select>
                </div>
                <button type="submit" disabled={signupStatus === "submitting"}
                  className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                  {signupStatus === "submitting" ? "Submitting..." : "Count Me In"}
                </button>
                {signupStatus === "error" && <p className="text-rose-400 text-xs text-center">Something went wrong. Try again.</p>}
              </form>
            )}
          </div>

          {/* Vertical Stats Sidebar */}
          <div className="w-20 flex flex-col items-center justify-center gap-6 bg-[#0d0d14]/80 border border-white/5 rounded-2xl py-6">
            <div className="text-center" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
              <span className="text-3xl font-black text-white">{signupCount}</span>
              <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] ml-2">Fans</span>
            </div>
            <div className="w-8 h-px bg-white/10" />
            <div className="text-center" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
              <span className="text-3xl font-black text-white">{totalGuests}</span>
              <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-cyan-400 ml-2">Guests</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Form A — Compact Grid
      </div>
    </div>
  );
}
