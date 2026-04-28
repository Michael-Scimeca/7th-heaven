"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";
import QRCode from "react-qr-code";

// Hardcoded demo show for the simulation
const DEMO_SHOW = {
  id: "34f3a136-3220-4355-b396-74a46d244640",
  venue: "Station 34",
  city: "Mt. Prospect",
  state: "IL",
  date: "May 1, 2026",
  time: "9:00 PM",
  doorsTime: "8:00 PM",
  allAges: false,
  cover: "$5",
  url: "/shows/34f3a136-3220-4355-b396-74a46d244640",
};

type Step = "signup" | "sms" | "show";

export default function ProximityDemoPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const [step, setStep] = useState<Step>("signup");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [phoneNumber] = useState("(312) 555-0199");
  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "going" | "there" | "loading">("idle");
  const [anonToggle, setAnonToggle] = useState(false);
  const [shareConfirm, setShareConfirm] = useState(false);

  const handleRsvp = async (status: "going" | "there") => {
    if (!isLoggedIn) {
      openModal("login");
      return;
    }
    setRsvpStatus("loading");
    await fetch("/api/proximity/attendees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showId: DEMO_SHOW.id, status, anonymous: false }),
    });
    setRsvpStatus(status);
  };

  // Auto-show notification after entering sms step
  useEffect(() => {
    if (step === "sms") {
      const t = setTimeout(() => setNotificationVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-[72px]">
      <div className="max-w-[680px] mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[0.65rem] font-black uppercase tracking-[0.25em] text-purple-400 border border-purple-500/30 px-4 py-1.5 mb-6">
            Feature Demo
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Proximity Show Alerts
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
            Walk through the full fan experience — from creating an account to seeing who&apos;s going to a show near you.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-14">
          {[
            { id: "signup", label: "1. Sign Up", icon: "👤" },
            { id: "sms", label: "2. SMS Alert", icon: "📱" },
            { id: "show", label: "3. Show Page", icon: "🎸" },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => setStep(s.id as Step)}
                className={`flex flex-col items-center gap-1.5 flex-1 py-3 transition-all border-b-2 ${
                  step === s.id
                    ? "border-purple-500 text-white"
                    : "border-white/10 text-white/30 hover:text-white/50"
                }`}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="text-[0.6rem] font-black uppercase tracking-widest">{s.label}</span>
              </button>
              {i < 2 && <div className="w-px h-8 bg-white/10 shrink-0" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Sign Up ── */}
        {step === "signup" && (
          <div className="space-y-6">
            <div className="p-8 bg-[#0c0c18] border border-white/10">
              {/* Modal preview */}
              <div className="mb-6">
                <div className="h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 mb-8" />
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">
                    <span className="text-purple-400">7</span>th <em className="text-purple-400">heaven</em>
                  </h2>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30 mt-1">Join the Family</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">Full Name</label>
                    <div className="px-4 py-3 bg-white/[0.04] border border-white/10 text-sm text-white/60 font-mono">Alex Johnson</div>
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">Email</label>
                    <div className="px-4 py-3 bg-white/[0.04] border border-white/10 text-sm text-white/60 font-mono">alex@example.com</div>
                  </div>

                  {/* Notification toggle */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
                    <div className="relative w-9 h-5 rounded-full bg-purple-500 shrink-0">
                      <span className="absolute top-0.5 left-[18px] w-4 h-4 rounded-full bg-white" />
                    </div>
                    <span className="text-[0.75rem] text-white/70">📍 Notify me when 7th Heaven books a show near me</span>
                  </div>

                  {/* Zip code */}
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">Zip Code</label>
                    <div className="px-4 py-3 bg-white/[0.04] border border-purple-500/30 text-sm text-purple-300 font-mono">60016</div>
                  </div>

                  <div className="px-4 py-3.5 bg-purple-600 text-white text-center text-sm font-black uppercase tracking-[0.15em] mt-2 cursor-pointer hover:bg-purple-500 transition-colors" onClick={() => setStep("sms")}>
                    Create Account →
                  </div>
                  <p className="text-[0.55rem] text-white/20 text-center">
                    Zip code is geocoded to match nearby shows within your radius
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/30 font-bold mb-2">What happens at signup</p>
              <ul className="space-y-1.5 text-sm text-white/50">
                <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">✓</span> Account created in Supabase Auth</li>
                <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">✓</span> Zip code geocoded to lat/lng via Zippopotam API</li>
                <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">✓</span> Coordinates saved to your profile for proximity matching</li>
                <li className="flex items-start gap-2"><span className="text-purple-400 shrink-0">✓</span> When a show within 50 miles is added, you get an SMS</li>
              </ul>
            </div>

            <button onClick={() => setStep("sms")} className="w-full py-4 bg-purple-600 text-white font-black uppercase tracking-widest text-sm hover:bg-purple-500 transition-all">
              Next: See the SMS Alert →
            </button>
          </div>
        )}

        {/* ── STEP 2: SMS Notification ── */}
        {step === "sms" && (
          <div className="space-y-8">
            {/* iPhone mockup */}
            <div className="relative mx-auto w-[320px]">
              {/* Phone frame */}
              <div className="bg-[#1a1a1a] rounded-[2.5rem] border-[6px] border-[#333] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                {/* Status bar */}
                <div className="bg-black px-6 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-white text-xs font-semibold">9:41</span>
                  <div className="w-24 h-5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
                  <div className="flex items-center gap-1">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.6"/><rect x="9" y="0" width="3" height="12" rx="1" opacity="0.8"/><rect x="13.5" y="0" width="2.5" height="12" rx="1"/></svg>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><path d="M8 0C3.6 0 0 3.1 0 7s3.6 7 8 7 8-3.1 8-7-3.6-7-8-7zm0 10.5c-1.9 0-3.5-1.6-3.5-3.5S6.1 3.5 8 3.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" opacity="0.4"/></svg>
                    <div className="flex items-center gap-0.5">
                      <div className="w-5 h-2.5 border border-white rounded-sm p-0.5"><div className="bg-white h-full w-3/4 rounded-[1px]" /></div>
                    </div>
                  </div>
                </div>

                {/* Lock screen */}
                <div className="bg-gradient-to-b from-[#1c2a4a] via-[#0f1a30] to-[#0a1020] min-h-[480px] relative overflow-hidden">
                  {/* Wallpaper glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(100,120,200,0.3)_0%,_transparent_70%)]" />

                  <div className="relative z-10 px-4 pt-12 pb-6">
                    {/* Clock */}
                    <div className="text-center mb-8">
                      <div className="text-6xl font-extralight text-white tracking-tight">9:41</div>
                      <div className="text-white/60 text-sm mt-1">Tuesday, April 28</div>
                    </div>

                    {/* Notification banner — tap to advance */}
                    <div
                      className={`transition-all duration-700 cursor-pointer ${
                        notificationVisible && !notificationDismissed
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-4 pointer-events-none"
                      }`}
                      onClick={() => { setNotificationDismissed(true); setTimeout(() => setStep("show"), 300); }}
                    >
                      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-transform">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(133,29,239,0.5)]">
                            <span className="text-white text-sm font-black">7H</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-xs font-bold">7th Heaven</span>
                              <span className="text-white/50 text-[0.6rem]">now</span>
                            </div>
                            <p className="text-white text-xs font-bold mb-1">🎸 Show near you!</p>
                            <div className="text-white/85 text-[0.65rem] leading-relaxed space-y-0.5">
                              <p><span className="font-bold">{DEMO_SHOW.venue}</span> · {DEMO_SHOW.city}, {DEMO_SHOW.state}</p>
                              <p>🚪 Doors {DEMO_SHOW.doorsTime} · 🎤 Show {DEMO_SHOW.time}</p>
                              <p>{DEMO_SHOW.allAges ? "✅ All Ages" : "🔞 21+"} · 💵 {DEMO_SHOW.cover}</p>
                            </div>
                            <p className="text-blue-300 text-[0.6rem] mt-1.5 font-medium underline">
                              7thheavenband.com/shows/{DEMO_SHOW.id.slice(0, 8)}...
                            </p>
                            {/* Going / There quick actions */}
                            <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                              <button
                                onClick={(e) => { e.stopPropagation(); setNotificationDismissed(true); setTimeout(() => setStep("show"), 200); }}
                                className="flex-1 py-1 rounded bg-purple-500/30 border border-purple-400/30 text-purple-200 text-[0.6rem] font-black uppercase tracking-widest hover:bg-purple-500/50 transition-all"
                              >
                                🎸 Going
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setNotificationDismissed(true); setTimeout(() => setStep("show"), 200); }}
                                className="flex-1 py-1 rounded bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-[0.6rem] font-black uppercase tracking-widest hover:bg-emerald-500/50 transition-all"
                              >
                                ✓ There
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Tap hint */}
                      <div className="flex justify-center mt-3 animate-pulse">
                        <span className="text-white/30 text-[0.6rem] uppercase tracking-widest">Tap to open →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone reflection */}
              <div className="absolute -bottom-4 left-4 right-4 h-8 bg-gradient-to-b from-white/5 to-transparent blur-md rounded-full" />
            </div>

            {/* SMS text body */}
            <div className="p-6 bg-[#0c0c18] border border-white/10 space-y-4">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/30 font-bold">SMS text sent to {phoneNumber}</p>
              <div className="bg-[#1a2a1a] border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-sm text-white/80 leading-relaxed">
                  🎸 <strong>7th Heaven is playing near you!</strong><br /><br />
                  <strong>{DEMO_SHOW.venue}</strong><br />
                  📍 {DEMO_SHOW.city}, {DEMO_SHOW.state}<br />
                  📅 {DEMO_SHOW.date}<br />
                  🚪 Doors: {DEMO_SHOW.doorsTime}<br />
                  🎤 Show: {DEMO_SHOW.time}<br />
                  {DEMO_SHOW.allAges ? "✅ All Ages" : "🔞 21+ Only"}<br />
                  💵 Cover: {DEMO_SHOW.cover}<br /><br />
                  See who&apos;s going &amp; RSVP:<br />
                  <span className="text-blue-400 underline">7thheavenband.com/shows/{DEMO_SHOW.id.slice(0, 8)}…</span><br /><br />
                  <strong className="text-white/60 text-xs uppercase tracking-wider">Tap to RSVP:</strong><br />
                  <span className="text-blue-400 underline cursor-pointer">Going</span>
                  <span className="text-white/30 text-xs"> → 7thheavenband.com/shows/{DEMO_SHOW.id.slice(0, 8)}…?rsvp=going</span><br />
                  <span className="text-blue-400 underline cursor-pointer">There</span>
                  <span className="text-white/30 text-xs"> → 7thheavenband.com/shows/{DEMO_SHOW.id.slice(0, 8)}…?rsvp=there</span><br /><br />
                  <span className="text-white/30 text-xs">Reply STOP to unsubscribe</span>
                </p>
              </div>

              {/* RSVP quick buttons */}
              <div className="mt-4 pt-4 border-t border-emerald-500/10">
                <p className="text-[0.55rem] uppercase tracking-widest text-white/30 font-bold mb-3">Quick RSVP from this message:</p>
                {rsvpStatus === "going" || rsvpStatus === "there" ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-emerald-400 text-lg">{rsvpStatus === "there" ? "✓" : "🎸"}</span>
                    <div>
                      <p className="text-emerald-400 text-sm font-bold">
                        {rsvpStatus === "there" ? "You\'re checked in!" : "You\'re going!"}
                      </p>
                      <p className="text-white/30 text-xs">You\'re on the list — <Link href={DEMO_SHOW.url} className="text-purple-400 underline">see who else is going</Link></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRsvp("going")}
                      disabled={rsvpStatus === "loading"}
                      className="flex-1 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[0.65rem] font-black uppercase tracking-widest hover:bg-purple-600/40 transition-all disabled:opacity-50 rounded-lg cursor-pointer"
                    >
                      {rsvpStatus === "loading" ? "…" : "🎸 I'm Going"}
                    </button>
                    <button
                      onClick={() => handleRsvp("there")}
                      disabled={rsvpStatus === "loading"}
                      className="flex-1 py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-[0.65rem] font-black uppercase tracking-widest hover:bg-emerald-600/40 transition-all disabled:opacity-50 rounded-lg cursor-pointer"
                    >
                      {rsvpStatus === "loading" ? "…" : "✓ I'm There"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!notificationVisible && (
              <button onClick={() => setNotificationVisible(true)} className="w-full py-3 border border-white/10 text-white/50 text-sm font-bold uppercase tracking-widest hover:border-white/30 hover:text-white transition-all">
                Show Notification Again
              </button>
            )}

            <button onClick={() => setStep("show")} className="w-full py-4 bg-purple-600 text-white font-black uppercase tracking-widest text-sm hover:bg-purple-500 transition-all">
              Next: Open the Show Page →
            </button>
          </div>
        )}

        {/* ── STEP 3: Show Page UI Mockup ── */}
        {step === "show" && (
          <div className="space-y-4">

            {/* URL bar */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/[0.06]">
              <span className="text-emerald-400 text-xs">🔒</span>
              <span className="font-mono text-white/40 text-xs">7thheavenband.com/shows/{DEMO_SHOW.id.slice(0,8)}…</span>
            </div>

            {/* ── LIVE FEED BANNER ── */}
            <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border border-red-500/20 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-wide">🎥 Mike is LIVE from the show</p>
                  <p className="text-[0.55rem] text-red-300/60 mt-0.5">42 people watching · Backstage feed</p>
                </div>
              </div>
              <Link href="/live" className="px-3 py-1.5 bg-red-500 text-white text-[0.55rem] font-black uppercase tracking-widest shrink-0 hover:bg-red-400 transition-colors">Watch Now →</Link>
            </div>

            {/* ── HERO ── */}
            <div className="relative bg-gradient-to-b from-[#0d0718] to-[#080810] border border-white/5 overflow-hidden p-7">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(133,29,239,0.15)_0%,_transparent_60%)]" />
              <div className="relative z-10 flex gap-6">

                {/* LEFT — show info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-purple-400 border border-purple-500/30 px-3 py-1 bg-purple-500/5">Upcoming Show</span>
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-white/30">12 fans going</span>
                  </div>

                  <h1 className="text-4xl font-extrabold tracking-tight mb-1">{DEMO_SHOW.venue}</h1>
                  <p className="text-white/50">{DEMO_SHOW.city}, {DEMO_SHOW.state}</p>
                  <p className="text-white/30 text-sm mt-1">Friday, May 1, 2026</p>

                  {/* Detail pills */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">🚪 Doors {DEMO_SHOW.doorsTime}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">🎸 Show {DEMO_SHOW.time}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-[0.65rem] font-bold uppercase tracking-widest text-amber-400">🔞 21+</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">💵 Cover: {DEMO_SHOW.cover}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => handleRsvp("going")}
                      disabled={rsvpStatus === "loading"}
                      className={`px-8 py-4 text-sm font-black uppercase tracking-widest text-white text-center transition-all ${
                        rsvpStatus === "going"
                          ? "bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                          : "bg-[var(--color-accent)] shadow-[0_0_30px_rgba(133,29,239,0.4)] hover:brightness-110"
                      }`}
                    >
                      {rsvpStatus === "loading" ? "…" : rsvpStatus === "going" ? "✓ You're Going!" : "🎸 I'm Going"}
                    </button>

                    <button
                      onClick={() => setAnonToggle((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2 border border-white/[0.06] text-[0.6rem] font-bold uppercase tracking-widest text-white/50 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <span className={`w-7 h-4 rounded-full relative shrink-0 transition-colors ${anonToggle ? "bg-purple-500" : "bg-white/10"}`}>
                        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${anonToggle ? "left-3.5" : "left-0.5"}`} />
                      </span>
                      {anonToggle ? <span className="text-purple-300">Anonymous On</span> : "Go anonymously"}
                    </button>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${DEMO_SHOW.venue}, ${DEMO_SHOW.city}, ${DEMO_SHOW.state}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-6 py-4 text-sm font-black uppercase tracking-widest border border-white/10 text-white/60 text-center hover:border-white/30 hover:text-white transition-all"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>

                {/* RIGHT — QR code */}
                <div className="hidden sm:flex flex-col items-center shrink-0 text-center">
                  <p className="text-white/30 text-[0.6rem] mb-1">Know someone who might be going?</p>
                  <p className="text-white text-xs font-bold mb-3">Share this show page</p>
                  <div className="p-3 bg-white shadow-[0_0_30px_rgba(133,29,239,0.3)] mb-2">
                    <QRCode
                      value={`${typeof window !== "undefined" ? window.location.origin : "https://7thheavenband.com"}/shows/${DEMO_SHOW.id}`}
                      size={110}
                      bgColor="#ffffff"
                      fgColor="#0a0a0a"
                      level="M"
                    />
                  </div>
                  <p className="text-[0.45rem] uppercase tracking-widest text-white/20 font-bold">Scan to open show page</p>
                </div>

              </div>
            </div>

            {/* ── GOING COUNT — clickable ── */}
            <div>
              <div className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.06] border-b-0">
                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <p className="text-[0.55rem] uppercase tracking-widest text-white/30 font-bold mb-1">Fans Going</p>
                    <p className="text-3xl font-extrabold text-white">11</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-left">
                    <p className="text-[0.55rem] uppercase tracking-widest text-emerald-400/60 font-bold mb-1">Here Now</p>
                    <p className="text-3xl font-extrabold text-emerald-400">1</p>
                  </div>
                </div>
                <span className="text-white/40 text-xl rotate-180">↓</span>
              </div>

              {/* Expanded attendee list */}
              <div className="border border-white/[0.06] border-t-0 bg-white/[0.01] p-5">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 mb-5 bg-white/[0.03] border border-white/5 p-1 w-fit">
                  {["All (12)", "Going (11)", "Here Now (1)"].map((label, i) => (
                    <div key={i} className={`px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest ${i === 0 ? "bg-white/10 text-white" : "text-white/30"}`}>{label}</div>
                  ))}
                </div>

                {/* Attendee grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Checked in fan */}
                  <div className="flex items-center gap-4 p-4 border border-emerald-500/30 bg-emerald-500/[0.03]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-sm border-2 border-yellow-500/40 text-yellow-400 bg-white/[0.04]">AJ</div>
                    <div>
                      <p className="font-bold text-sm text-white">Alex Johnson <span className="ml-1 text-[0.5rem] uppercase tracking-widest text-purple-400 font-black">You</span></p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[0.45rem] font-black uppercase text-yellow-400">Gold</span>
                        <span className="text-[0.5rem] font-black uppercase text-emerald-400">✓ Here Now</span>
                      </div>
                    </div>
                  </div>

                  {/* Regular going fan */}
                  <div className="flex items-center gap-4 p-4 border border-white/[0.06] bg-white/[0.02]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-sm border-2 border-amber-700/40 text-amber-600 bg-white/[0.04]">SR</div>
                    <div>
                      <p className="font-bold text-sm text-white">Sarah R.</p>
                      <span className="text-[0.45rem] font-black uppercase text-white/25">Going</span>
                    </div>
                  </div>

                  {/* Anonymous fan */}
                  <div className="flex items-center gap-4 p-4 border border-white/[0.06] bg-white/[0.02]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 border-white/10 bg-white/[0.04] text-lg">👤</div>
                    <div>
                      <p className="font-bold text-sm text-white/50 italic">Anonymous Fan</p>
                      <span className="text-[0.45rem] font-black uppercase text-white/25">Going</span>
                    </div>
                  </div>

                  {/* Platinum fan */}
                  <div className="flex items-center gap-4 p-4 border border-white/[0.06] bg-white/[0.02] shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-sm border-2 border-purple-500/40 text-purple-400 bg-white/[0.04]">TK</div>
                    <div>
                      <p className="font-bold text-sm text-white">Tyler K.</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[0.45rem] font-black uppercase text-purple-400">Platinum</span>
                        <span className="text-[0.45rem] font-black uppercase text-white/25">Going</span>
                      </div>
                    </div>
                  </div>

                  {/* +8 more pill */}
                  <div className="flex items-center justify-center p-4 border border-dashed border-white/[0.06] sm:col-span-2">
                    <span className="text-white/25 text-sm font-bold">+ 8 more fans going</span>
                  </div>
                </div>

                <p className="text-[0.55rem] text-white/15 mt-4 text-center">Fans who chose to go anonymously appear as &ldquo;Anonymous Fan&rdquo;</p>
              </div>
            </div>

            {/* ── SHARE CTA ── */}
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-white/40 text-sm mb-1">Know someone who might be going?</p>
              <p className="text-white font-bold text-base mb-5">Share this show page</p>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="p-3 bg-white inline-block shadow-[0_0_30px_rgba(133,29,239,0.3)] mb-2">
                  <QRCode
                    value={`${typeof window !== "undefined" ? window.location.origin : "https://7thheavenband.com"}/shows/${DEMO_SHOW.id}`}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#0a0a0a"
                    level="M"
                  />
                </div>
                <p className="text-[0.5rem] uppercase tracking-widest text-white/20 font-bold">Scan to open show page</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : "https://7thheavenband.com"}/shows/${DEMO_SHOW.id}`);
                    setShareConfirm(true);
                    setTimeout(() => setShareConfirm(false), 2000);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white text-[0.7rem] font-black uppercase tracking-widest hover:bg-purple-500 transition-all"
                >
                  {shareConfirm ? "✓ Copied!" : "🔗 Copy Link"}
                </button>
                <a
                  href={`sms:?body=${encodeURIComponent(
                    rsvpStatus === "going"
                      ? `I'm going to see ${DEMO_SHOW.venue} in ${DEMO_SHOW.city} on May 1st — you should come! ${typeof window !== "undefined" ? window.location.origin : "https://7thheavenband.com"}/shows/${DEMO_SHOW.id}`
                      : rsvpStatus === "there"
                      ? `I'm already at the show — ${DEMO_SHOW.venue} in ${DEMO_SHOW.city}! Get here! ${typeof window !== "undefined" ? window.location.origin : "https://7thheavenband.com"}/shows/${DEMO_SHOW.id}`
                      : `Are you going to ${DEMO_SHOW.venue} in ${DEMO_SHOW.city} on May 1st? Check it out: ${typeof window !== "undefined" ? window.location.origin : "https://7thheavenband.com"}/shows/${DEMO_SHOW.id}`
                  )}`}
                  className="px-6 py-3 border border-white/10 text-white/50 text-[0.7rem] font-black uppercase tracking-widest hover:border-white/30 hover:text-white transition-all"
                >
                  {rsvpStatus === "going"
                    ? "💬 Text — I'm Going!"
                    : rsvpStatus === "there"
                    ? "💬 Text — I'm There!"
                    : "💬 Text a Friend"}
                </a>
              </div>
            </div>

            {/* CTA to real page */}
            <Link
              href={`/shows/${DEMO_SHOW.id}`}
              className="block w-full py-5 bg-purple-600 text-white font-black uppercase tracking-widest text-sm hover:bg-purple-500 transition-all text-center shadow-[0_0_40px_rgba(133,29,239,0.3)]"
            >
              Open the Live Show Page →
            </Link>
          </div>
        )}

        {/* Bottom nav */}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          <button
            onClick={() => setStep(step === "show" ? "sms" : "signup")}
            className={`text-sm text-white/30 hover:text-white/60 font-bold uppercase tracking-widest transition-colors ${step === "signup" ? "invisible" : ""}`}
          >
            ← Back
          </button>
          <Link href={`/shows/${DEMO_SHOW.id}`} className="text-sm text-purple-400 hover:text-white font-bold uppercase tracking-widest transition-colors">
            View Live Show Page →
          </Link>
        </div>
      </div>
    </div>
  );
}
