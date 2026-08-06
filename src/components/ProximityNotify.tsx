"use client";
import Image from 'next/image';

import { useState, useRef } from "react";
import Link from "next/link";
import { signupSchema } from "@/lib/validation";

interface ProximityNotifyProps {
  nextShow?: {
    venue: string;
    city: string;
    state?: string;
    date: string;
    time: string;
    info?: string;
    allAges?: boolean;
  };
}

export default function ProximityNotify({ nextShow }: ProximityNotifyProps = {}) {
  const showVenue = nextShow?.venue || "Station 34";
  const showCity = nextShow?.city || "Mt. Prospect";
  const showState = nextShow?.state || "IL";
  const showTime = nextShow?.time || "9:00pm";
  const showInfo = nextShow?.info || "F.A.N. Show - Unplugged";

  const isAllAges = nextShow
    ? (nextShow.allAges === true || showInfo.toLowerCase().includes("all age") || showInfo.toLowerCase().includes("all-age"))
    : false; // default to 21+ for Station 34
  const is21Plus = nextShow
    ? (nextShow.allAges === false || showInfo.toLowerCase().includes("21 &") || showInfo.toLowerCase().includes("21+"))
    : true; // default to 21+ for Station 34

  const ageLabel = isAllAges ? "👶 All Ages" : "🔞 21+";

  const coverLabel = showInfo.toLowerCase().includes("free") || showInfo.toLowerCase().includes("festival") || showInfo.toLowerCase().includes("casino")
    ? "Free Admission"
    : "$5 cover";

  const showVenueSlug = showVenue.toLowerCase().replace(/[^a-z0-9]/g, "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("50");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [agreeNotify, setAgreeNotify] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [notifyAreaShows, setNotifyAreaShows] = useState(true);
  const [notifyNextShow, setNotifyNextShow] = useState(true);
  const [notifyBrowser, setNotifyBrowser] = useState(false);
  const [selectedShowTypes, setSelectedShowTypes] = useState<string[]>([
    "full", "unplugged", "outdoor", "casino", "tv", "special"
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBrowserNotifyToggle = (checked: boolean) => {
    setNotifyBrowser(checked);
    if (checked && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            setNotifyBrowser(false);
          }
        });
      } else if (Notification.permission === "denied") {
        alert("Notification permission is blocked. Please enable it in browser settings.");
        setNotifyBrowser(false);
      }
    }
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Profile photo must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    if (!agreeTerms || !agreeNotify) return;

    // Client-side validation with Zod
    const validation = signupSchema.safeParse({
      name,
      email,
      phone,
      zip,
      radius,
      notifyAreaShows,
      notifyNextShow,
      showTypes: selectedShowTypes
    });
    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          zip,
          radius,
          notifyAreaShows,
          notifyNextShow,
          showTypes: selectedShowTypes
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName(""); setEmail(""); setPhone(""); setZip(""); setProfilePic(null);
        if (notifyBrowser && typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("7th Heaven Alerts", {
              body: `Proximity alerts successfully activated for ${showVenue}! 🎸`,
            });
          }
        }
      } else if (res.status === 429) {
        setStatus("error");
        setErrorMsg("Too many attempts. Please wait a moment and try again.");
      } else if (res.status === 409) {
        setStatus("error");
        setErrorMsg("An account with this email already exists. Please sign in.");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Check your connection and try again.");
    }
  };

  return (
    <section className="relative py-24 sm:py-32 bg-[var(--color-bg-surface)] overflow-hidden" id="proximity-notify">

      {/* ═══ Full Background — Dark Map ═══ */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Google Maps-style background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.35]"
          style={{ backgroundImage: "url('/map-bg.png')" }}
        />

        {/* Radial gradient overlay — soft vignette, lets more map through */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, rgba(13,9,20,0.7) 60%, #0d0914 100%)'
        }} />

        {/* Top/bottom fade for seamless section blending */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0d0914] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0914] to-transparent" />

        {/* Accent glow behind content area */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[var(--color-accent)]/[0.05] rounded-full blur-[120px]" />
      </div>

      {/* ═══ Content — Two Column ═══ */}
      <div className="relative z-10 site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center max-w-[1100px] mx-auto">

          {/* ── LEFT: Phone Mockup ── */}
          <div className="w-[390px] sm:w-[450px] mx-auto animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.2s_both]">
            <div className="relative bg-[#111120] rounded-[2.8rem] p-[7px] shadow-[0_25px_80px_-15px_rgba(255,10,61,0.2)] border border-white/[0.08]">
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black rounded-full z-20" />

              {/* Screen */}
              <div className="relative rounded-[2.4rem] overflow-hidden aspect-[9/15.5]">

                {/* ═══ STEP 1: iMessage Text Thread ═══ */}
                <div className="absolute inset-0 z-[2] animate-[lockFade_20s_ease-in-out_infinite]">
                  {/* Dark iMessage background */}
                  <div className="absolute inset-0 bg-[var(--color-bg-primary)]" />

                  {/* Status bar */}
                  <div className="relative z-10 flex items-center justify-between px-6 pt-4">
                    <div className="text-sm text-white/60 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</div>
                    <div className="flex gap-1.5 items-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" fillOpacity="0.4"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                      <div className="w-[18px] h-[10px] border border-white/30 rounded-[2px] relative"><div className="absolute inset-[1px] right-[4px] bg-white/40 rounded-[1px]" /></div>
                    </div>
                  </div>

                  {/* iMessage header */}
                  <div className="relative z-10 px-4 pt-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-md shadow-[var(--color-accent)]/20">
                        <span className="text-white font-black text-[var(--font-size-2xs)]">7H</span>
                      </div>
                    </div>
                    <p className="text-white font-semibold text-base text-center">7th Heaven</p>
                    <p className="text-white/30 text-xs text-center mt-0.5 mb-4">Text Message</p>
                    <div className="w-full h-[1px] bg-white/[0.06]" />
                  </div>

                  {/* Date pill */}
                  <div className="relative z-10 text-center mt-3">
                    <span className="text-xs text-white/25 font-medium bg-white/[0.03] px-3 py-1 rounded-full">Today 9:41 PM</span>
                  </div>

                  {/* Green SMS bubble — iOS style */}
                  <div className="relative z-10 px-4 mt-3 animate-[notifyPop_20s_ease-in-out_infinite]">
                    <div className="relative max-w-[85%]">
                      <div className="bg-[#34C759] rounded-[1.2rem] rounded-bl-[4px] p-3">
                        <p className="text-base text-white leading-relaxed font-medium">
                          🎸 7th Heaven is playing near you tonight!
                        </p>
                        <p className="text-sm text-white/90 leading-relaxed mt-1.5">
                          📍 {showVenue} — {showCity}, {showState}
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed mt-0.5">
                          🚪 Doors 7PM · 🎤 Show {showTime}
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed mt-0.5">
                          {ageLabel} · 🎫 {coverLabel}
                        </p>
                        <p className="text-sm text-white font-semibold leading-relaxed mt-1.5">
                          🔥 23 fans already going!
                        </p>
                        <p className="text-xs text-white/60 mt-1.5">
                          Reply 1=GOING 2=THERE 3=DIRECTIONS
                        </p>
                      </div>
                    </div>

                    {/* Link preview card */}
                    <div className="max-w-[85%] mt-1.5 bg-[var(--color-bg-elevated)] overflow-hidden border border-white/[0.06]">
                      <div className="bg-[#2c2c2e] px-3 py-2">
                        <p className="text-xs text-white/30 uppercase tracking-wider font-bold">7thheavenband.com</p>
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-sm text-white font-semibold leading-snug">7th Heaven @ {showVenue}</p>
                        <p className="text-xs text-white/40 mt-0.5">RSVP &amp; see who else is going</p>
                      </div>
                    </div>

                    <p className="text-[var(--font-size-2xs)] text-white/20 mt-1.5 ml-1 font-medium">Delivered</p>
                    <p className="text-[var(--font-size-2xs)] text-white/12 ml-1">Reply STOP to unsubscribe</p>
                  </div>

                  {/* iMessage input bar */}
                  <div className="absolute bottom-0 inset-x-0 z-10 px-3 pb-8 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                      </div>
                      <div className="flex-1 h-[30px] bg-white/[0.06] border border-white/[0.08] rounded-full px-3 flex items-center">
                        <span className="text-xs text-white/20">Text Message</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ═══ STEP 2: Show Details (tapped link) ═══ */}
                <div className="absolute inset-0 z-[1] bg-[#08080f]">
                  {/* Status bar */}
                  <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 pt-4">
                    <div className="text-sm text-white/50 font-medium">9:42</div>
                    <div className="flex gap-1.5 items-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" fillOpacity="0.35"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                      <div className="w-[18px] h-[10px] border border-white/30 rounded-[2px] relative"><div className="absolute inset-[1px] right-[4px] bg-white/30 rounded-[1px]" /></div>
                    </div>
                  </div>

                  {/* Safari address bar */}
                  <div className="absolute top-10 inset-x-0 z-10 px-3">
                    <div className="bg-[var(--color-bg-elevated)] border border-white/[0.08] px-3 py-2 flex items-center gap-2">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <p className="text-xs text-white/40 flex-1 truncate">7thheavenband.com/shows/{showVenueSlug}</p>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                    </div>
                  </div>

                  {/* Show content */}
                  <div className="absolute inset-x-0 top-[4.5rem] bottom-0 overflow-y-auto animate-[mapFadeIn_20s_ease-in-out_infinite]">
                    {/* Venue header */}
                    <div className="px-4 pt-4 pb-2">
                      <span className="text-sm font-black uppercase tracking-[0.2em]  text-[var(--color-accent)]">📍 0.8 mi away</span>
                      <h3 className="text-white font-black text-2xl leading-tight mt-1">7th Heaven</h3>
                      <p className="text-white/40 text-base mt-0.5">{showVenue} · {showCity}, {showState}</p>
                      <p className="text-white/25 text-sm mt-0.5">Tonight · Doors 7PM · Show {showTime}</p>
                    </div>

                    {/* RSVP buttons */}
                    <div className="px-4 pt-2 pb-2 animate-[cardUp_20s_ease-in-out_infinite]">
                      <div className="flex gap-1.5">
                        <div className="flex-1 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-lg py-2 flex items-center justify-center gap-1">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span className="text-base font-bold  text-[var(--color-accent)]">Going</span>
                        </div>
                        <div className="flex-1 bg-emerald-500/10 border  border-[var(--color-accent)]/30 rounded-lg py-2 flex items-center justify-center">
                          <span className="text-base font-bold text-[var(--color-accent)]">✓ Here Now</span>
                        </div>
                        <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg py-2 flex items-center justify-center">
                          <span className="text-base font-bold text-white/30">Directions</span>
                        </div>
                      </div>
                    </div>

                    {/* Who's Going */}
                    <div className="mx-4 mt-1 animate-[msg2_20s_ease-out_infinite]">
                      <p className="text-sm uppercase tracking-widest text-white/25 font-bold mb-1.5">Who&apos;s Going</p>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { initials: "AJ", name: "Alex J.", status: "there", color: "from-amber-400 to-orange-500" },
                          { initials: "SR", name: "Sarah R.", status: "going", color: "from-sky-500 to-blue-600" },
                          { initials: "TK", name: "Tyler K.", status: "going", color: "from-pink-400 to-rose-500" },
                          { initials: "JM", name: "Jake M.", status: "there", color: "from-cyan-400 to-blue-500" },
                          { initials: "LR", name: "Lisa R.", status: "going", color: "from-emerald-400 to-teal-500" },
                          { initials: "??", name: "Anonymous", status: "going", color: "from-white/10 to-white/5" },
                        ].map((fan, i) => (
                          <div key={i} className={`flex items-center gap-1.5 p-1 border ${fan.status === "there" ? " border-[var(--color-accent)]/30 bg-emerald-500/[0.03]" : "border-white/[0.04]"} rounded`}>
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${fan.color} flex items-center justify-center shrink-0`}>
                              <span className="text-[var(--font-size-2xs)] font-black text-white">{fan.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white/60 leading-none">{fan.name}</p>
                              <p className={`text-xs font-bold mt-0.5 ${fan.status === "there" ? "text-emerald-400" : "text-white/25"}`}>{fan.status === "there" ? "✓ Here" : "Going"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-1 py-1 border border-dashed border-white/[0.06] text-xs text-white/20 font-bold uppercase tracking-widest rounded">+ 12 more fans going ↓</button>
                    </div>

                    {/* Map — fills remaining space */}
                    <div className="mx-4 mt-2 mb-4 rounded-lg overflow-hidden border border-white/[0.06] animate-[msg2_20s_ease-out_infinite]">
                      <div className="relative h-[260px] bg-[#0f1218]">
                        {/* Street grid */}
                        <div className="absolute inset-0 opacity-[0.08]">
                          <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-white" />
                          <div className="absolute top-[40%] left-0 right-0 h-[1px] bg-white" />
                          <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-white" />
                          <div className="absolute top-[80%] left-0 right-0 h-[1px] bg-white" />
                          <div className="absolute left-[20%] top-0 bottom-0 w-[1px] bg-white" />
                          <div className="absolute left-[40%] top-0 bottom-0 w-[1px] bg-white" />
                          <div className="absolute left-[60%] top-0 bottom-0 w-[1px] bg-white" />
                          <div className="absolute left-[80%] top-0 bottom-0 w-[1px] bg-white" />
                          <div className="absolute top-0 left-[15%] w-[2px] h-full bg-white/60 rotate-[20deg] origin-top-left" />
                          <div className="absolute top-[30%] left-0 w-full h-[2px] bg-white/40 rotate-[-8deg]" />
                        </div>
                        {/* Venue pin */}
                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-[pinFloat_2s_ease-in-out_infinite]">
                          <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] border-2 border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,10,61,0.5)]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div className="mt-1 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[var(--font-size-2xs)] font-bold text-white whitespace-nowrap border border-white/10">
                            {showVenue}
                          </div>
                        </div>
                        {/* Your location dot */}
                        <div className="absolute top-[65%] left-[30%] w-3 h-3 rounded-full bg-blue-500 border-2 border-white/50 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <div className="absolute top-[65%] left-[30%] w-3 h-3 rounded-full bg-blue-500/30 animate-ping" />
                        {/* Proximity rings */}
                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[var(--color-accent)]/20 animate-[rPulse_3s_ease-in-out_infinite]" />
                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-[var(--color-accent)]/10" />
                        {/* Distance label */}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[var(--font-size-2xs)] font-bold text-white/50 border border-white/10">
                          0.8 mi
                        </div>
                      </div>
                    </div>

                    {/* Go to Home Page */}
                    <div className="mx-4 mt-3 mb-6">
                      <div className="w-full py-2.5 bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 rounded-lg flex items-center justify-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        <span className="text-sm font-bold  text-[var(--color-accent)] uppercase tracking-wider">Go to Home Page</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Phone glow */}
            <div className="absolute -inset-12 bg-[var(--color-accent)]/[0.04] rounded-full blur-[80px] -z-10" />
          </div>

          {/* ── RIGHT: Heading + Form ── */}
          <div className="text-center lg:text-center">
            <h2 className="font-[var(--font-heading)] text-[clamp(2.8rem,6vw,4.5rem)] font-extrabold italic text-white leading-[0.9] tracking-tight mb-4 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.4s_both]">
              Never Miss a Show
            </h2>
            <p className="text-base text-white/35 max-w-[480px] mb-2 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.5s_both] mx-auto">
              Get exclusives. Stay connected to the 7th Heaven community.
            </p>
            <p className="text-base text-white/50 max-w-[480px] mb-10 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.55s_both] mx-auto">
              Join <span className="text-white/70 font-semibold">1,000s</span>{' '}of fans getting proximity alerts &amp; show updates.
            </p>

            {/* Glass Form Card */}
            <div className="w-full max-w-[520px] mx-auto animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.6s_both]">
              {status === "success" ? (
                <div className="bg-[var(--color-accent)]/10 backdrop-blur-xl border border-[var(--color-accent)]/20 p-10 text-center">
                  <div className="flex items-center justify-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-white font-bold text-lg">Check your email!</span>
                  </div>
                  <p className="text-white/35 text-base mb-1">We&apos;ve sent a confirmation link to your inbox.</p>
                  <p className="text-white/25 text-sm">Click the link to confirm your account and start getting show alerts.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-md border border-white/[0.05] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                  <div className="space-y-3">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-5 mb-4 pb-4 border-b border-white/[0.05]">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 overflow-hidden group ${profilePic
                          ? 'border-2 border-[var(--color-accent)]/30'
                          : name.trim()
                            ? 'bg-gradient-to-br from-[var(--color-accent)] to-[#6b21a8] border-2 border-white/[0.1]  shadow-[var(--color-accent)]/20'
                            : 'bg-white/[0.06] border-2 border-dashed border-white/[0.15] hover:border-[var(--color-accent)]/50 hover:bg-white/[0.08]'
                          }`}
                      >
                        {profilePic ? (
                          <Image width={200} height={200} unoptimized src={profilePic} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                        ) : name.trim() ? (
                          <span className="text-2xl font-bold text-white leading-none">{name.trim()[0].toUpperCase()}</span>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                        </div>
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
                      <div>
                        <p className="text-sm text-white/50">{profilePic ? 'Change Photo' : 'Add a Profile Photo'}</p>
                        <p className="text-xs text-white/20 mt-0.5">Visible to other members at shows</p>
                      </div>
                    </div>

                    {/* Name */}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full name"
                      className="w-full bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
                    />
                    {/* Email */}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
                      className="w-full bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
                    />
                    {/* Phone */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\-()+ ]/g, "").slice(0, 16))}
                      placeholder="Phone number"
                      className="w-full bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
                    />
                    {/* Zip + Radius */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        required
                        placeholder="Zip code"
                        maxLength={5}
                        pattern="\d{5}"
                        className="flex-1 bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-all duration-200"
                      />
                      <select
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className="bg-white/[0.05] border border-white/[0.08] px-4 py-4 text-base text-white/40 focus:border-[var(--color-accent)]/50 focus:outline-none transition-all duration-200 appearance-none cursor-pointer text-center w-[110px]"
                      >
                        <option value="25" className="bg-[var(--color-bg-surface)]">25 mi</option>
                        <option value="50" className="bg-[var(--color-bg-surface)]">50 mi</option>
                        <option value="100" className="bg-[var(--color-bg-surface)]">100 mi</option>
                        <option value="200" className="bg-[var(--color-bg-surface)]">200 mi</option>
                      </select>
                    </div>

                    {/* Preferences for notifications */}
                    <div className="pt-3 pb-2 border-t border-white/[0.05]">
                      <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2.5 text-left">Notification Preferences</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                          <input
                            type="checkbox"
                            checked={notifyAreaShows}
                            onChange={(e) => setNotifyAreaShows(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/[0.05]  text-[var(--color-accent)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white/80">Shows In My Area</p>
                            <p className="text-[var(--font-size-3xs)] text-white/40">Within {radius} miles of {zip || "Zip"}</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                          <input
                            type="checkbox"
                            checked={notifyNextShow}
                            onChange={(e) => setNotifyNextShow(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/[0.05]  text-[var(--color-accent)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white/80">Next Upcoming Show</p>
                            <p className="text-[var(--font-size-3xs)] text-white/40">General band alerts</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                          <input
                            type="checkbox"
                            checked={notifyBrowser}
                            onChange={(e) => handleBrowserNotifyToggle(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/[0.05]  text-[var(--color-accent)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white/80">Web Browser Alerts</p>
                            <p className="text-[var(--font-size-3xs)] text-white/40">Desktop/browser popups</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-3 pb-2 border-t border-white/[0.05]">
                      <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2.5 text-left">Show Types to Notify For</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: "full", label: "Full Band" },
                          { id: "unplugged", label: "Unplugged" },
                          { id: "outdoor", label: "Outdoor" },
                          { id: "casino", label: "Casino" },
                          { id: "tv", label: "TV Appearance" },
                          { id: "special", label: "Special Event" }
                        ].map((type) => {
                          const isChecked = selectedShowTypes.includes(type.id);
                          return (
                            <label
                              key={type.id}
                              className={`flex items-center gap-2 cursor-pointer px-3 py-2.5 border  transition-all duration-200 ${isChecked
                                ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-white"
                                : "bg-white/[0.02] border-white/[0.05] text-white/40 hover:border-white/10 hover:text-white/60"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedShowTypes(prev =>
                                    prev.includes(type.id)
                                      ? prev.filter(t => t !== type.id)
                                      : [...prev, type.id]
                                  );
                                }}
                                className="sr-only"
                              />
                              <span className="text-xs font-semibold tracking-wide">{type.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notification Agreement */}
                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <button
                        type="button"
                        onClick={() => setAgreeNotify(!agreeNotify)}
                        className={`relative w-[42px] h-[24px] rounded-full transition-all duration-300 shrink-0 mt-0.5 ${agreeNotify
                          ? "bg-[var(--color-accent)] shadow-[0_0_12px_rgba(255,10,61,0.3)]"
                          : "bg-white/[0.1]"
                          }`}
                      >
                        <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-300 ${agreeNotify ? "left-[21px]" : "left-[3px]"
                          }`} />
                      </button>
                      <span className="text-sm text-white/40 leading-snug">Enable proximity notifications &amp; SMS alerts for nearby shows. You can manage this anytime in your profile settings.</span>
                    </label>

                    {/* Terms & Privacy Agreement */}
                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <div
                        onClick={() => setAgreeTerms(!agreeTerms)}
                        className={`w-[18px] h-[18px] rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer ${agreeTerms
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                          : 'border-white/20 hover:border-white/30'
                          }`}
                      >
                        {agreeTerms && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-sm text-white/35 leading-snug">
                        I am 18 years of age or older and agree to the{' '}
                        <Link href="/terms" className="text-white/50 underline hover:text-white/70 transition-colors">Terms of Service</Link>{' '}and{' '}
                        <Link href="/privacy" className="text-white/50 underline hover:text-white/70 transition-colors">Privacy Policy</Link>.
                      </span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "loading" || !agreeNotify || !agreeTerms}
                      className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 hover:shadow-[0_8px_30px_-5px_rgba(255,10,61,0.4)] text-white font-bold text-base uppercase tracking-[0.15em] py-4 transition-all duration-300 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {status === "loading" ? "Creating account..." : "Create Account"}
                    </button>
                  </div>

                  {/* Data usage notice */}
                  <p className="text-xs text-white/[0.12] mt-5 leading-relaxed text-center">
                    Your data is encrypted and stored securely. We will never sell your personal information. You may request data deletion at any time. By creating an account you consent to receive transactional emails related to your account.
                  </p>

                  {/* Field validation errors */}
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="mt-4 space-y-1">
                      {Object.entries(fieldErrors).map(([field, errors]) => (
                        <p key={field} className="text-red-400 text-sm">
                          <span className="capitalize">{field}</span>: {errors.join(", ")}
                        </p>
                      ))}
                    </div>
                  )}

                  {status === "error" && (
                    <p className="text-red-400 text-sm mt-4 text-center">{errorMsg || "Something went wrong. Try again."}</p>
                  )}
                </form>
              )}
              <p className="text-xs text-white/[0.12] mt-5 tracking-wide text-center">Already a fan? <span className="text-white/20 underline cursor-pointer">Sign in</span> to enable notifications in your profile settings.</p>
            </div>
          </div>

        </div>{/* close grid */}
      </div>


    </section>
  );
}
