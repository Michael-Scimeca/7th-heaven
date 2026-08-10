/* eslint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
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

  const ageLabel = isAllAges ? "All Ages" : "21+";

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
              body: `Proximity alerts successfully activated for ${showVenue}!`,
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
    <section className="relative py-16 md:py-24 lg:py-32 bg-transparent overflow-hidden" id="proximity-notify">

      {/* ═══ Content — Two Column Layout Matching Reference Image ═══ */}
      <div className="relative z-10 site-container max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── LEFT COLUMN: Modern Phone Mockup with Floating Reactions (6 Cols) ── */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px]">
              {/* iPhone Outer Device Frame */}
              <div className="relative w-full aspect-[9/18.5] bg-black/90 rounded-[56px] p-4 border-[3px] border-amber-200/25 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden group">
                {/* Inner Screen */}
                <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-zinc-950 flex flex-col justify-between">
                  {/* Concert Photo Background */}
                  <Image
                    src="/images/band-performance.png"
                    alt="7th Heaven Concert Live Stream"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-95"
                    priority
                  />

                  {/* Dark Gradient Overlay for Status Bar & Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                  {/* Status Bar (Clock + Icons) */}
                  <div className="relative z-20 flex items-center justify-between px-7 pt-4 text-white text-[14px] font-semibold tracking-tight">
                    <span>02:25</span>
                    {/* Dynamic Island Notch */}
                    <div className="w-28 h-6 bg-black rounded-full border border-white/10 mx-auto -mt-1 shadow-inner" />
                    <div className="flex items-center gap-1.5 opacity-90 text-[12px]">
                      <span>5G</span>
                      <div className="w-4.5 h-3 border border-white rounded-sm flex items-center p-0.5">
                        <div className="w-full h-full bg-white rounded-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Live Reaction Bubbles (CSS Animated) */}
                  <div className="absolute right-6 bottom-14 z-20 w-20 h-80 pointer-events-none flex flex-col items-center justify-end overflow-visible">
                    {/* Floating Bubble 1 - Heart */}
                    <div className="absolute bottom-0 p-3.5 rounded-full bg-amber-100/90 text-amber-950 shadow-xl animate-float-up-1">
                      <svg className="w-6 h-6 fill-amber-950" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>

                    {/* Floating Bubble 2 - Thumbs Up */}
                    <div className="absolute bottom-3 p-3.5 rounded-full bg-white/95 text-zinc-900 shadow-xl animate-float-up-2">
                      <svg className="w-6 h-6 fill-zinc-900" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                      </svg>
                    </div>

                    {/* Floating Bubble 3 - Heart Pill */}
                    <div className="absolute bottom-6 p-3.5 rounded-full bg-amber-200/90 text-amber-950 shadow-xl animate-float-up-3">
                      <svg className="w-6 h-6 fill-amber-950" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>

                    {/* Floating Bubble 4 - Thumbs Up Small */}
                    <div className="absolute bottom-9 p-2.5 rounded-full bg-white/90 text-zinc-900 shadow-lg animate-float-up-4">
                      <svg className="w-5 h-5 fill-zinc-900" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Metrics Display + Proximity Signup Form (6 Cols) ── */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8">
            {/* Header Title */}
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Never Miss a Show
              </h2>
              <p className="text-purple-200/70 text-base sm:text-lg max-w-xl">
                Get exclusives. Stay connected to the 7th Heaven community. Join 1,000s of fans getting proximity alerts &amp; show updates.
              </p>
            </div>

            {/* Metrics Counter Grid (Styled exactly like Reference Image) */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 max-w-lg py-2">
              <div>
                <p className="text-amber-200/60 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold mb-1">
                  Countries
                </p>
                <p className="text-4xl sm:text-5xl font-black text-amber-200 tracking-tight">
                  7
                </p>
              </div>

              <div>
                <p className="text-amber-200/60 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold mb-1">
                  Followers &amp; Fans
                </p>
                <p className="text-4xl sm:text-5xl font-black text-amber-200 tracking-tight">
                  +18.000
                </p>
              </div>

              <div>
                <p className="text-amber-200/60 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold mb-1">
                  Impressions
                </p>
                <p className="text-4xl sm:text-5xl font-black text-amber-200 tracking-tight">
                  2.100.000
                </p>
              </div>

              <div>
                <p className="text-amber-200/60 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold mb-1">
                  Live Engagements
                </p>
                <p className="text-4xl sm:text-5xl font-black text-amber-200 tracking-tight">
                  160.000
                </p>
              </div>
            </div>

            {/* Glass Form Card */}
            <div className="w-full max-w-xl">
              {status === "success" ? (
                <div className="bg-purple-950/40 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl text-center shadow-2xl">
                  <div className="flex items-center justify-center gap-2.5 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-white font-bold text-xl">Check your email!</span>
                  </div>
                  <p className="text-purple-200/70 text-base mb-1">We&apos;ve sent a confirmation link to your inbox.</p>
                  <p className="text-white/40 text-sm">Click the link to confirm your account and start getting show alerts.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-transparent p-0 space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-4 pb-3 border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 overflow-hidden group ${profilePic
                        ? 'border-2 border-purple-400'
                        : name.trim()
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-white/20'
                          : 'bg-white/10 border-2 border-dashed border-white/20 hover:border-purple-400 hover:bg-white/15'
                        }`}
                    >
                      {profilePic ? (
                        <Image width={200} height={200} unoptimized src={profilePic} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                      ) : name.trim() ? (
                        <span className="text-xl font-bold text-white leading-none">{name.trim()[0].toUpperCase()}</span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
                    <div>
                      <p className="text-sm font-semibold text-white/90">{profilePic ? 'Change Photo' : 'Add a Profile Photo'}</p>
                      <p className="text-xs text-white/40">Visible to other members at shows</p>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email address"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\-()+ ]/g, "").slice(0, 16))}
                      placeholder="Phone number"
                      className="sm:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        required
                        placeholder="Zip"
                        maxLength={5}
                        pattern="\d{5}"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none transition-colors text-center"
                      />
                      <select
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-xs text-white/70 focus:border-purple-500 focus:outline-none transition-colors cursor-pointer text-center"
                      >
                        <option value="25" className="bg-zinc-900">25 mi</option>
                        <option value="50" className="bg-zinc-900">50 mi</option>
                        <option value="100" className="bg-zinc-900">100 mi</option>
                        <option value="200" className="bg-zinc-900">200 mi</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkbox Preferences */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <p className="text-[11px] uppercase tracking-wider text-white/50 font-bold">Notification Preferences</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={notifyAreaShows}
                          onChange={(e) => setNotifyAreaShows(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-white/90">Area Shows</p>
                          <p className="text-[10px] text-white/40">Within {radius}mi</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={notifyNextShow}
                          onChange={(e) => setNotifyNextShow(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-white/90">Next Show</p>
                          <p className="text-[10px] text-white/40">Band alerts</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={notifyBrowser}
                          onChange={(e) => handleBrowserNotifyToggle(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-white/90">Browser Popups</p>
                          <p className="text-[10px] text-white/40">Alerts</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      aria-label="Enable proximity notifications & SMS alerts"
                      className="flex items-start gap-2.5 cursor-pointer text-left w-full"
                      onClick={() => setAgreeNotify(!agreeNotify)}
                    >
                      <div className={`relative w-8 h-4 rounded-full transition-colors shrink-0 mt-0.5 ${agreeNotify ? "bg-purple-600" : "bg-white/15"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${agreeNotify ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-xs text-white/50 leading-tight">Enable proximity notifications &amp; SMS alerts for nearby shows.</span>
                    </button>

                    <button
                      type="button"
                      aria-label="Agree to Terms and Privacy Policy"
                      className="flex items-start gap-2.5 cursor-pointer text-left w-full"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                    >
                      <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${agreeTerms ? "bg-purple-600 border-purple-600" : "border-white/20"}`}>
                        {agreeTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <span className="text-xs text-white/40 leading-tight">
                        I agree to the <Link href="/terms" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Terms</Link> and <Link href="/privacy" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
                      </span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading" || !agreeNotify || !agreeTerms}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {status === "loading" ? "Activating Proximity Alerts..." : "Activate Show Alerts"}
                  </button>

                  {/* Errors */}
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="space-y-1 pt-1">
                      {Object.entries(fieldErrors).map(([field, errors]) => (
                        <p key={field} className="text-red-400 text-xs text-center">
                          <span className="capitalize">{field}</span>: {errors.join(", ")}
                        </p>
                      ))}
                    </div>
                  )}

                  {status === "error" && (
                    <p className="text-red-400 text-xs text-center pt-1">{errorMsg || "Something went wrong. Try again."}</p>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Reaction CSS Keyframes */}
      <style>{`
        @keyframes floatUp1 {
          0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
          15% { opacity: 1; transform: translateY(-20px) scale(1) rotate(-6deg); }
          80% { opacity: 0.9; transform: translateY(-150px) scale(1.1) rotate(6deg); }
          100% { transform: translateY(-220px) scale(0.7) rotate(-12deg); opacity: 0; }
        }
        @keyframes floatUp2 {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          20% { opacity: 1; transform: translateY(-30px) scale(1) rotate(8deg); }
          85% { opacity: 0.85; transform: translateY(-170px) scale(1.05) rotate(-8deg); }
          100% { transform: translateY(-240px) scale(0.6) rotate(10deg); opacity: 0; }
        }
        @keyframes floatUp3 {
          0% { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 0; }
          25% { opacity: 1; transform: translateY(-40px) scale(1.1) rotate(-10deg); }
          75% { opacity: 0.9; transform: translateY(-130px) scale(1) rotate(4deg); }
          100% { transform: translateY(-200px) scale(0.7) rotate(-6deg); opacity: 0; }
        }
        @keyframes floatUp4 {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          18% { opacity: 1; transform: translateY(-25px) scale(0.95) rotate(5deg); }
          82% { opacity: 0.8; transform: translateY(-160px) scale(1) rotate(-5deg); }
          100% { transform: translateY(-230px) scale(0.6) rotate(8deg); opacity: 0; }
        }
        .animate-float-up-1 {
          animation: floatUp1 4s ease-in-out infinite;
        }
        .animate-float-up-2 {
          animation: floatUp2 4.5s ease-in-out infinite 1.2s;
        }
        .animate-float-up-3 {
          animation: floatUp3 3.8s ease-in-out infinite 2.3s;
        }
        .animate-float-up-4 {
          animation: floatUp4 4.2s ease-in-out infinite 0.7s;
        }
      `}</style>
    </section>
  );
}
