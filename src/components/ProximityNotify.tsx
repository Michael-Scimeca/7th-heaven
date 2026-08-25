/* eslint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer, react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer, react-doctor/click-events-have-key-events */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from 'next/image';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signupSchema } from "@/lib/validation";
import { SquishyToggle } from "@/components/SquishyToggle";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import { GlowInput } from "@/components/GlowInput";
import IphoneClipMask from "@/components/IphoneClipMask";
import { User, Mail, MapPin, Sliders, Music, Check } from "lucide-react";

const RADIUS_OPTIONS = [
  { value: "15", label: "15 Mi" },
  { value: "30", label: "30 Mi" },
  { value: "50", label: "50 Mi" },
  { value: "100", label: "100 Mi" },
  { value: "all", label: "All" },
];

const SHOW_TYPES = [
  { id: "all", label: "All Shows", icon: "🎸" },
  { id: "full", label: "Full Band", icon: "🟣" },
  { id: "unplugged", label: "Unplugged", icon: "🟣" },
  { id: "outdoor", label: "Outdoor", icon: "🟢" },
  { id: "casino", label: "Casino", icon: "🟡" },
  { id: "tv", label: "TV", icon: "🔵" },
  { id: "fundraiser", label: "Fundraiser", icon: "🔴" },
  { id: "special", label: "Special", icon: "💗" },
];

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
    : false;
  const is21Plus = nextShow
    ? (nextShow.allAges === false || showInfo.toLowerCase().includes("21 &") || showInfo.toLowerCase().includes("21+"))
    : true;

  const ageLabel = isAllAges ? "All Ages" : "21+";

  const coverLabel = showInfo.toLowerCase().includes("free") || showInfo.toLowerCase().includes("festival") || showInfo.toLowerCase().includes("casino")
    ? "Free Admission"
    : "$5 cover";

  const showVenueSlug = showVenue.toLowerCase().replace(/[^a-z0-9]/g, "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("50");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [notifyAreaShows, setNotifyAreaShows] = useState(true);
  const [notifyNextShow, setNotifyNextShow] = useState(true);
  const [notifyBrowser, setNotifyBrowser] = useState(false);
  const [selectedShowTypes, setSelectedShowTypes] = useState<string[]>(["all"]);
  const fileRef = useRef<HTMLInputElement>(null);
  const phoneVideoRef = useRef<HTMLVideoElement>(null);

  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = phoneVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (typeof IntersectionObserver === "undefined") {
      setVideoLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoLoaded(true);
          if (video) {
            video.src = "/movie/notefication.mp4";
            video.load();
            video.play().catch(() => { });
          }
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

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

    if (!agreeTerms) return;

    // Client-side validation with Zod
    const validation = signupSchema.safeParse({
      name,
      email,
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
          zip,
          radius,
          notifyAreaShows,
          notifyNextShow,
          showTypes: selectedShowTypes
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName(""); setEmail(""); setZip(""); setProfilePic(null);
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
    <section id="proximity-notify" className="site-container relative py-section-fluid bg-transparent overflow-hidden">

      {/* ═══ Content — Two Column Layout Matching Reference Image ═══ */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-stretch justify-center">

          {/* ── LEFT COLUMN: Concert Video Showcase (5 Cols) ── */}
          <div className="md:col-span-5 flex justify-center md:justify-end items-center w-full h-full my-auto">
            <div className="relative w-full h-full max-h-[900px] flex items-center justify-center md:justify-end">
              <IphoneClipMask
                insetXPercent={0}
                insetTopPercent={0}
                insetBottomPercent={0}
                borderRadiusPx={48}
                className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px] h-full max-h-[900px] flex items-center justify-center md:justify-end"
              >
                <div className="relative w-full h-full max-h-[900px] aspect-[9/18] rounded-[44px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]  bg-black flex items-center justify-center transition-all duration-300">
                  <video
                    ref={phoneVideoRef}
                    src={videoLoaded ? "/movie/notefication.mp4" : undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={videoLoaded ? "auto" : "none"}
                    aria-label="7th Heaven Concert Live Stream"
                    className="w-full h-full object-cover rounded-[40px]"
                    onCanPlay={(e) => {
                      e.currentTarget.muted = true;
                      e.currentTarget.play().catch(() => { });
                    }}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.muted = true;
                      e.currentTarget.play().catch(() => { });
                    }}
                  />
                </div>
              </IphoneClipMask>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Metrics Display + Proximity Signup Form (7 Cols) ── */}
          <div className="md:col-span-7 flex flex-col justify-center items-start space-y-6 w-full max-w-xl mx-auto md:mx-0 md:pl-0">
            {/* Header Title */}
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-3">
                Never Miss a Show
              </h2>
              <p className="text-purple-200/70 text-base sm:text-lg max-w-xl">
                Get exclusives. Stay connected to the 7th Heaven community. Join 1,000s of fans getting proximity alerts &amp; show updates.
              </p>
            </div>

            {/* Metrics Counter Display (2 Clean Vertical Columns) */}
            <div className="flex flex-row gap-8 sm:gap-12 py-1 w-full">
              {/* Left Column */}
              <div className="flex flex-col space-y-3 min-w-[110px]">
                <div>
                  <p className="text-amber-200/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider font-semibold mb-0.5">
                    Countries
                  </p>
                  <p className="text-xl sm:text-2xl  font-bold  text-amber-200 tracking-tight">
                    7
                  </p>
                </div>

                <div>
                  <p className="text-amber-200/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider font-semibold mb-0.5">
                    Impressions
                  </p>
                  <p className="text-xl sm:text-2xl  font-bold  text-amber-200 tracking-tight">
                    2,100,000
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col space-y-3">
                <div>
                  <p className="text-amber-200/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider font-semibold mb-0.5">
                    Followers &amp; Fans
                  </p>
                  <p className="text-xl sm:text-2xl  font-bold  text-amber-200 tracking-tight">
                    +18,000
                  </p>
                </div>

                <div>
                  <p className="text-amber-200/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider font-semibold mb-0.5">
                    Live Engagements
                  </p>
                  <p className="text-xl sm:text-2xl  font-bold  text-amber-200 tracking-tight">
                    160,000
                  </p>
                </div>
              </div>
            </div>

            {/* Glass Form Card */}
            <div className="w-full max-w-xl">
              {status === "success" ? (
                <div className="bg-purple-950/40 backdrop-blur-xl border border-purple-500/30 p-8  rounded-lg text-center shadow-2xl">
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
                  {/* Input Fields (Matching Footer Setup) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-400" /> Full Name
                      </label>
                      <GlowInput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        wrapperClassName="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-purple-400" /> Email address
                      </label>
                      <GlowInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        wrapperClassName="w-full"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="w-full sm:w-[220px]">
                        <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink-400" /> Zip Code / City
                        </label>
                        <GlowInput
                          type="text"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="e.g. 60056"
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div className="w-full flex-1">
                        <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-purple-400" /> Distance Radius
                        </label>
                        <div className="inline-flex flex-wrap gap-1 items-center w-fit max-w-full">
                          {RADIUS_OPTIONS.map((opt) => {
                            const active = radius === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setRadius(opt.value)}
                                className={`h-[42px] px-2.5 py-1.5  rounded-lg text-xs font-bold transition-all cursor-pointer border ${active
                                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white border-pink-400 shadow-md shadow-purple-500/30 scale-105"
                                  : "bg-[#e1e6ff29]   text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                                  }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Show Type Preferences */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 flex items-center gap-1">
                      <Music className="w-3 h-3 text-cyan-400" /> Notification Types
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SHOW_TYPES.map((type) => {
                        const isSelected = selectedShowTypes.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              if (type.id === "all") { setSelectedShowTypes(["all"]); return; }
                              let next = selectedShowTypes.filter((t) => t !== "all");
                              next = next.includes(type.id) ? next.filter((t) => t !== type.id) : [...next, type.id];
                              setSelectedShowTypes(next.length === 0 ? ["all"] : next);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5  rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${isSelected
                              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white border-pink-400 shadow-md shadow-purple-500/30 scale-105"
                              : "bg-[#e1e6ff29]    text-white  border-white/10 hover:bg-white/10 hover:text-white"
                              }`}
                          >
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-pink-300 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="pt-2 space-y-2">
                    <div
                      className="flex items-start gap-2.5 cursor-pointer text-left w-full select-none"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                    >
                      <div className="shrink-0 mt-0.5">
                        <SquishyToggle
                          id="agree-terms"
                          label="Agree to terms and privacy policy"
                          checked={agreeTerms}
                          onChange={setAgreeTerms}
                        />
                      </div>
                      <span className="text-xs text-white/40 leading-tight">
                        I agree to the <Link href="/terms" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Terms</Link> and <Link href="/privacy" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <CosmicRadialButton
                    type="submit"
                    icon={false}
                    disabled={status === "loading" || !agreeTerms}
                    className="w-full py-3.5 text-sm uppercase tracking-wider font-bold shadow-lg shadow-purple-600/30  rounded-lg cursor-pointer hover:scale-[1.02] transition-all disabled:opacity-60"
                  >
                    {status === "loading" ? "Activating Proximity Alerts..." : "Activate Show Alerts"}
                  </CosmicRadialButton>

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
    </section>
  );
}
