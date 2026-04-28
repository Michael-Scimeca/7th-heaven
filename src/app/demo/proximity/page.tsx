"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";

// Hardcoded demo show for the simulation
const DEMO_SHOW = {
  id: "34f3a136-3220-4355-b396-74a46d244640",
  venue: "Station 34",
  city: "Mt. Prospect",
  state: "IL",
  date: "May 1, 2026",
  time: "8:00 PM",
  url: "/shows/34f3a136-3220-4355-b396-74a46d244640",
};

type Step = "signup" | "sms" | "show";

export default function ProximityDemoPage() {
  const { member, isLoggedIn } = useMember();
  const [step, setStep] = useState<Step>("signup");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [phoneNumber] = useState("(312) 555-0199");

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

                    {/* Notification banner */}
                    <div
                      className={`transition-all duration-700 ${
                        notificationVisible && !notificationDismissed
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-4 pointer-events-none"
                      }`}
                    >
                      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(133,29,239,0.5)]">
                            <span className="text-white text-sm font-black">7H</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-white text-xs font-bold">7th Heaven</span>
                              <span className="text-white/50 text-[0.6rem]">now</span>
                            </div>
                            <p className="text-white/90 text-xs leading-relaxed">
                              🎸 <span className="font-bold">Show alert!</span> We&apos;re playing at <span className="font-bold">{DEMO_SHOW.venue}</span> in {DEMO_SHOW.city} on {DEMO_SHOW.date} — only {Math.floor(Math.random() * 8) + 3} miles from you!
                            </p>
                            <p className="text-blue-300 text-xs mt-1.5 font-medium underline">
                              7thheavenband.com/shows/{DEMO_SHOW.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swipe hint */}
                  {notificationVisible && !notificationDismissed && (
                    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center animate-pulse">
                      <p className="text-white/30 text-[0.6rem] uppercase tracking-widest">Tap the notification</p>
                      <span className="text-white/20 text-lg mt-1">↑</span>
                    </div>
                  )}

                  {/* Tap overlay */}
                  {notificationVisible && !notificationDismissed && (
                    <div
                      className="absolute inset-0 cursor-pointer z-20"
                      onClick={() => { setNotificationDismissed(true); setTimeout(() => setStep("show"), 400); }}
                    />
                  )}
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
                  <strong>{DEMO_SHOW.venue}</strong> in {DEMO_SHOW.city}, {DEMO_SHOW.state}<br />
                  📅 {DEMO_SHOW.date} · {DEMO_SHOW.time}<br /><br />
                  See who&apos;s going and RSVP:<br />
                  <span className="text-blue-400 underline">7thheavenband.com/shows/{DEMO_SHOW.id.slice(0, 8)}…</span><br /><br />
                  <span className="text-white/30 text-xs">Reply STOP to unsubscribe</span>
                </p>
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

        {/* ── STEP 3: Show Page ── */}
        {step === "show" && (
          <div className="space-y-6">
            <div className="p-5 bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/30 font-bold mb-2">You tapped the SMS link and landed here:</p>
              <p className="font-mono text-purple-400 text-sm break-all">7thheavenband.com/shows/{DEMO_SHOW.id}</p>
            </div>

            {/* Preview of the show page */}
            <div className="border border-white/10 overflow-hidden">
              {/* Mini hero */}
              <div className="bg-gradient-to-br from-[#0d0718] to-[#050505] p-8 border-b border-white/5">
                <span className="text-[0.55rem] uppercase tracking-widest text-purple-400 border border-purple-500/30 px-3 py-1 bg-purple-500/5">Upcoming Show</span>
                <h2 className="text-3xl font-extrabold tracking-tight mt-4 mb-1">{DEMO_SHOW.venue}</h2>
                <p className="text-white/50">{DEMO_SHOW.city}, {DEMO_SHOW.state}</p>
                <p className="text-white/30 text-sm mt-1">{DEMO_SHOW.date} · {DEMO_SHOW.time}</p>
              </div>

              {/* Login / RSVP prompt */}
              {!isLoggedIn ? (
                <div className="p-8 bg-[#0a0a14] flex flex-col items-center text-center gap-4">
                  <span className="text-4xl">🎸</span>
                  <div>
                    <p className="font-bold text-white text-lg">Want to RSVP and see who&apos;s going?</p>
                    <p className="text-white/40 text-sm mt-1">Sign in to your fan account to join the attendee list.</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/shows/${DEMO_SHOW.id}`} className="px-6 py-3 bg-purple-600 text-white text-sm font-black uppercase tracking-widest hover:bg-purple-500 transition-all">
                      Go to Show Page
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-[#0a0a14] flex flex-col items-center text-center gap-4">
                  <span className="text-4xl">✅</span>
                  <div>
                    <p className="font-bold text-white text-lg">You&apos;re logged in as {member?.name}!</p>
                    <p className="text-white/40 text-sm mt-1">Go to the live show page to RSVP and see who else is going.</p>
                  </div>
                  <Link href={`/shows/${DEMO_SHOW.id}`} className="px-8 py-4 bg-purple-600 text-white text-sm font-black uppercase tracking-widest hover:bg-purple-500 transition-all">
                    🎸 Open Show Page →
                  </Link>
                </div>
              )}
            </div>

            {/* Big CTA to the real page */}
            <Link
              href={`/shows/${DEMO_SHOW.id}`}
              className="block w-full py-5 bg-purple-600 text-white font-black uppercase tracking-widest text-sm hover:bg-purple-500 transition-all text-center shadow-[0_0_40px_rgba(133,29,239,0.3)]"
            >
              Open the Live Show Page →
            </Link>

            <div className="p-5 bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/30 font-bold mb-3">On the show page you can:</p>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Hit <strong className="text-white/70">&ldquo;I&apos;m Going&rdquo;</strong> — you appear in the attendee list instantly</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> See every other fan who RSVPed with their tier badge</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Get directions straight to Google Maps</li>
                <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Share the link via SMS to bring friends</li>
              </ul>
            </div>
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
