"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FormLayoutC() {
  const supabase = createClient();
  const [signupStatus, setSignupStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: "2" });
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

  const guestOptions = ["1", "2", "4", "6"];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-[var(--color-accent)]/20 via-amber-500/20 to-cyan-500/20 border border-white/10 rounded-2xl px-6 py-4 mb-4 text-center backdrop-blur-sm">
          <p className="text-white text-sm">
            <span className="font-black text-lg text-white">{signupCount}</span>
            <span className="text-white/50"> Fans Interested</span>
            <span className="text-white/20 mx-3">·</span>
            <span className="font-black text-lg text-white">{totalGuests}</span>
            <span className="text-white/50"> Total Guests</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d0d14]/95 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(245,158,11,0.08)]">
          <h2 className="text-2xl font-black uppercase italic tracking-tight mb-6 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Reserve Your <span className="text-amber-400">Spot</span>
          </h2>

          {signupStatus === "success" ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
              <span className="text-3xl block mb-3">🚢</span>
              <p className="text-white font-bold text-lg">You&apos;re on the list!</p>
              <p className="text-emerald-400 text-sm mt-2">Check your email for confirmation.</p>
              <p className="text-white/30 text-xs mt-2">Cancel anytime from your email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Name</label>
                <input type="text" required placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/15 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Email</label>
                <input type="email" required placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/15 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Phone</label>
                <input type="tel" placeholder="Optional" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/15 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-2 block">Guests</label>
                <div className="flex gap-2">
                  {guestOptions.map(g => (
                    <button key={g} type="button" onClick={() => setForm(f => ({...f, guests: g}))}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                        form.guests === g
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                          : "bg-white/[0.02] border-white/10 text-white/40 hover:border-white/20"
                      }`}
                    >
                      {g === "6" ? "6+" : g}
                    </button>
                  ))}
                </div>
              </div>
                <button type="submit" disabled={signupStatus === "submitting"} className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                {signupStatus === "submitting" ? "Submitting..." : "Count Me In"}
                </button>
              {signupStatus === "error" && <p className="text-rose-400 text-xs text-center">Something went wrong.</p>}
            </form>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-4 mt-5">
          {[
            { icon: "✓", text: "Free Signup" },
            { icon: "✓", text: "No Commitment" },
            { icon: "✓", text: "Cancel Anytime" },
          ].map(badge => (
            <div key={badge.text} className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[0.5rem] font-bold flex items-center justify-center">{badge.icon}</span>
              <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
        Form C — Stacked + Pills
      </div>
    </div>
  );
}
