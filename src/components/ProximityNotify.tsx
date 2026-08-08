/* eslint-disable react-doctor/no-giant-component */
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
    <section className="relative py-20 md:py-28 lg:py-36 bg-transparent overflow-hidden" id="proximity-notify">

      {/* ═══ Full Background — Transparent with subtle glow ═══ */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Accent glow behind content area */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[var(--color-accent)]/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* ═══ Content — Two Column ═══ */}
      <div className="relative z-10 site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center max-w-[1100px] mx-auto">

          {/* ── LEFT: Heading + Form ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            <h2 className="font-[var(--font-heading)] text-[clamp(2.8rem,6vw,4.5rem)] font-extrabold italic text-white leading-[0.9] tracking-tight mb-4 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.4s_both]">
              Never Miss a Show
            </h2>
            <p className="text-base text-white/35 max-w-[480px] mb-2 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.5s_both]">
              Get exclusives. Stay connected to the 7th Heaven community.
            </p>
            <p className="text-base text-white/50 max-w-[480px] mb-10 leading-relaxed animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.55s_both]">
              Join <span className="text-white/70 font-semibold">1,000s</span>{' '}of fans getting proximity alerts &amp; show updates.
            </p>

            {/* Glass Form Card */}
            <div className="w-full max-w-[520px] mx-auto lg:mx-0 animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.6s_both]">
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
                      <button aria-label="Action button"
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-200 overflow-hidden group ${profilePic
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
                      <input aria-label="Input field" ref={fileRef} type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
                      <div>
                        <p className="text-sm text-white/50">{profilePic ? 'Change Photo' : 'Add a Profile Photo'}</p>
                        <p className="text-xs text-white/20 mt-0.5">Visible to other members at shows</p>
                      </div>
                    </div>

                    {/* Name */}
                    <input aria-label="Input field"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full name"
                      className="w-full bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-colors duration-200"
                    />
                    {/* Email */}
                    <input aria-label="Input field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
                      className="w-full bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-colors duration-200"
                    />
                    {/* Phone */}
                    <input aria-label="Input field"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\-()+ ]/g, "").slice(0, 16))}
                      placeholder="Phone number"
                      className="w-full bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-colors duration-200"
                    />
                    {/* Zip + Radius */}
                    <div className="flex gap-3">
                      <input aria-label="Input field"
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        required
                        placeholder="Zip code"
                        maxLength={5}
                        pattern="\d{5}"
                        className="flex-1 bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-base text-white placeholder:text-white/25 focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] focus:outline-none transition-colors duration-200"
                      />
                      <select aria-label="Select option"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className="bg-white/[0.05] border border-white/[0.08] px-4 py-4 text-base text-white/40 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors duration-200 appearance-none cursor-pointer text-center w-[110px]"
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
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                          <input aria-label="Input field"
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
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                          <input aria-label="Next"
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
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                          <input aria-label="Input field"
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
                              className={`flex items-center gap-2 cursor-pointer px-3 py-2.5 border  transition-colors duration-200 ${isChecked
                                ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-white"
                                : "bg-white/[0.02] border-white/[0.05] text-white/40 hover:border-white/10 hover:text-white/60"
                                }`}
                            >
                              <input aria-label="Previous"
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
                    <div className="flex items-start gap-3 cursor-pointer pt-1">
                      <button aria-label="Action button"
                        type="button"
                        onClick={() => setAgreeNotify(!agreeNotify)}
                        className={`relative w-[42px] h-[24px] rounded-full transition-colors duration-300 shrink-0 mt-0.5 ${agreeNotify
                          ? "bg-[var(--color-accent)] shadow-[0_0_12px_rgba(255,10,61,0.3)]"
                          : "bg-white/[0.1]"
                          }`}
                      >
                        <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-colors duration-300 ${agreeNotify ? "left-[21px]" : "left-[3px]"
                          }`} />
                      </button>
                      <span className="text-sm text-white/40 leading-snug">Enable proximity notifications &amp; SMS alerts for nearby shows. You can manage this anytime in your profile settings.</span>
                    </div>

                    {/* Terms & Privacy Agreement */}
                    <div className="flex items-start gap-3 cursor-pointer pt-1">
                      <button type="button"
                        aria-label="Agree to terms and privacy policy"
                        onClick={() => setAgreeTerms(!agreeTerms)}
                        className={`w-[18px] h-[18px] rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors duration-200 cursor-pointer ${agreeTerms
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                          : 'border-white/20 hover:border-white/30'
                          }`}
                      >
                        {agreeTerms && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                      <span className="text-sm text-white/35 leading-snug">
                        I am 18 years of age or older and agree to the{' '}
                        <Link href="/terms" className="text-white/50 underline hover:text-white/70 transition-colors">Terms of Service</Link>{' '}and{' '}
                        <Link href="/privacy" className="text-white/50 underline hover:text-white/70 transition-colors">Privacy Policy</Link>.
                      </span>
                    </div>

                    {/* Submit */}
                    <button aria-label="Action button"
                      type="submit"
                      disabled={status === "loading" || !agreeNotify || !agreeTerms}
                      className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 hover:shadow-[0_8px_30px_-5px_rgba(255,10,61,0.4)] text-white font-bold text-base uppercase tracking-[0.15em] py-4 transition-colors duration-300 cursor-pointer disabled:opacity-50 mt-1"
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
