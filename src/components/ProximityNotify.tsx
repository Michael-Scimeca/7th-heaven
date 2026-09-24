/* eslint-disable react-doctor/no-giant-component, react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer, react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/control-has-associated-label, react-doctor/label-has-associated-control, react-doctor/prefer-useReducer, react-doctor/click-events-have-key-events */
"use client";

/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from "next/image";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signupSchema } from "@/lib/validation";
import { SquishyToggle } from "@/components/SquishyToggle";
import SeventhButton from "@/components/SeventhButton";
import { GlowInput } from "@/components/GlowInput";
import IphoneClipMask from "@/components/IphoneClipMask";
import {
  User,
  Mail,
  MapPin,
  Sliders,
  Music,
  Check,
  Guitar,
} from "lucide-react";
import CheckMarkIcon from "@/components/CheckMarkIcon";

const RADIUS_OPTIONS = [
  { value: "15", label: "15 Mi" },
  { value: "30", label: "30 Mi" },
  { value: "50", label: "50 Mi" },
  { value: "100", label: "100 Mi" },
  { value: "all", label: "All" },
];

const SHOW_TYPES = [
  { id: "all", label: "All Shows", color: "#c084fc", iconType: "guitar" },
  { id: "full", label: "Full Band", color: "#a855f7" },
  { id: "unplugged", label: "Unplugged", color: "#c084fc" },
  { id: "outdoor", label: "Outdoor", color: "#34d399" },
  { id: "casino", label: "Casino", color: "#fbbf24" },
  { id: "tv", label: "TV", color: "#60a5fa" },
  { id: "fundraiser", label: "Fundraiser", color: "#f43f5e" },
  { id: "special", label: "Special", color: "#f472b6" },
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

function CrispCheckIcon() {
  return (
    <CheckMarkIcon className="ml-0.5 inline-block h-3.5 w-3.5 shrink-0 text-purple-200" />
  );
}

export default function ProximityNotify({
  nextShow,
}: ProximityNotifyProps = {}) {
  const showVenue = nextShow?.venue || "Station 34";
  const showCity = nextShow?.city || "Mt. Prospect";
  const showState = nextShow?.state || "IL";
  const showTime = nextShow?.time || "9:00pm";
  const showInfo = nextShow?.info || "F.A.N. Show - Unplugged";

  const isAllAges = nextShow
    ? nextShow.allAges === true ||
      showInfo.toLowerCase().includes("all age") ||
      showInfo.toLowerCase().includes("all-age")
    : false;
  const is21Plus = nextShow
    ? nextShow.allAges === false ||
      showInfo.toLowerCase().includes("21 &") ||
      showInfo.toLowerCase().includes("21+")
    : true;

  const ageLabel = isAllAges ? "All Ages" : "21+";

  const coverLabel =
    showInfo.toLowerCase().includes("free") ||
    showInfo.toLowerCase().includes("festival") ||
    showInfo.toLowerCase().includes("casino")
      ? "Free Admission"
      : "$5 cover";

  const showVenueSlug = showVenue.toLowerCase().replace(/[^a-z0-9]/g, "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("50");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
            video.play().catch(() => {});
          }
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
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
        alert(
          "Notification permission is blocked. Please enable it in browser settings.",
        );
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
      showTypes: selectedShowTypes,
    });
    if (!validation.success) {
      setFieldErrors(
        validation.error.flatten().fieldErrors as Record<string, string[]>,
      );
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
          showTypes: selectedShowTypes,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setZip("");
        setProfilePic(null);
        if (
          notifyBrowser &&
          typeof window !== "undefined" &&
          "Notification" in window
        ) {
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
        setErrorMsg(
          "An account with this email already exists. Please sign in.",
        );
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
    <section
      id="proximity-notify"
      className="site-container py-section-fluid relative overflow-hidden bg-transparent"
    >
      {/* ═══ Content — Two Column Layout Matching Reference Image ═══ */}
      <div className="relative z-10 max-w-6xl md:mx-auto">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* ── LEFT COLUMN: Concert Video Showcase (5 Cols) ── */}
          <div className="my-auto flex h-full w-full items-center justify-center md:col-span-5 md:justify-end">
            <div className="relative flex h-full max-h-[900px] w-full items-center justify-center md:justify-end">
              <IphoneClipMask
                insetXPercent={0}
                insetTopPercent={0}
                insetBottomPercent={0}
                borderRadiusPx={48}
                className="flex h-full max-h-[900px] w-full max-w-[340px] items-center justify-center sm:max-w-[380px] md:max-w-[420px] md:justify-end"
              >
                <div className="relative flex aspect-[9/18] h-full max-h-[900px] w-full items-center justify-center overflow-hidden rounded-[44px] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                  <video
                    ref={phoneVideoRef}
                    src={videoLoaded ? "/movie/notefication.mp4" : undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={videoLoaded ? "auto" : "none"}
                    aria-label="7th Heaven Concert Live Stream"
                    className="h-full w-full rounded-[40px] object-cover"
                    onCanPlay={(e) => {
                      e.currentTarget.muted = true;
                      e.currentTarget.play().catch(() => {});
                    }}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.muted = true;
                      e.currentTarget.play().catch(() => {});
                    }}
                  />
                </div>
              </IphoneClipMask>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Metrics Display + Proximity Signup Form (7 Cols) ── */}
          <div className="flex w-full flex-col items-start justify-center space-y-6 md:col-span-7 md:mx-0 md:pl-0">
            {/* Header Title */}
            <div>
              <h2 className="mb-3 lg:text-6xl">Never Miss a Show</h2>
              <p className="max-w-xl text-purple-200/70">
                Get exclusives. Stay connected to the 7th Heaven community. Join
                1,000s of fans getting proximity alerts &amp; show updates.
              </p>
            </div>

            {/* Metrics Counter Display (2 Clean Vertical Columns) */}
            <div className="flex w-full flex-row gap-8 py-1 sm:gap-12">
              {/* Left Column */}
              <div className="flex min-w-[110px] flex-col space-y-3">
                <div>
                  <p className="mb-0.5 text-amber-200/60">Countries</p>
                  <p className="text-amber-200">7</p>
                </div>

                <div>
                  <p className="mb-0.5 text-amber-200/60">Impressions</p>
                  <p className="text-amber-200">2,100,000</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col space-y-3">
                <div>
                  <p className="mb-0.5 text-amber-200/60">
                    Followers &amp; Fans
                  </p>
                  <p className="text-amber-200">+18,000</p>
                </div>

                <div>
                  <p className="mb-0.5 text-amber-200/60">Live Engagements</p>
                  <p className="text-amber-200">160,000</p>
                </div>
              </div>
            </div>

            {/* Glass Form Card */}
            <div className="w-full max-w-xl">
              {status === "success" ? (
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/40 p-8 text-center shadow-2xl backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-center gap-2.5">
                    <div className="bg- purple-white/20 flex h-12 w-12 items-center justify-center rounded-lg text-purple-400">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xl">Check your email!</span>
                  </div>
                  <p className="mb-1 text-purple-200/70">
                    We&apos;ve sent a confirmation link to your inbox.
                  </p>
                  <p>
                    Click the link to confirm your account and start getting
                    show alerts.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 bg-transparent p-0"
                >
                  {/* Input Fields (Matching Footer Setup) */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block flex items-center gap-1">
                        Full Name
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
                      <label className="text- mb-1 block flex items-center gap-1">
                        Email address
                      </label>
                      <GlowInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        wrapperClassName="w-full"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                      <div className="w-full sm:w-[220px]">
                        <label className="mb-1 block flex items-center gap-1">
                          Zip Code / City
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
                        <label className="mb-1 block flex items-center gap-1">
                          Distance Radius
                        </label>
                        <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1">
                          {RADIUS_OPTIONS.map((opt) => {
                            const active = radius === opt.value;
                            return (
                              <SeventhButton
                                key={opt.value}
                                type="button"
                                onClick={() => setRadius(opt.value)}
                                isActive={active}
                                className="!w-auto px-2.5 py-1.5"
                              >
                                {opt.label}
                              </SeventhButton>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Show Type Preferences */}
                  <div className="space-y-1.5 border-t border-white/10 pt-2">
                    <label className="block flex items-center gap-1">
                      Notification Types
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SHOW_TYPES.map((type) => {
                        const isSelected = selectedShowTypes.includes(type.id);
                        return (
                          <SeventhButton
                            key={type.id}
                            type="button"
                            onClick={() => {
                              if (type.id === "all") {
                                setSelectedShowTypes(["all"]);
                                return;
                              }
                              let next = selectedShowTypes.filter(
                                (t) => t !== "all",
                              );
                              next = next.includes(type.id)
                                ? next.filter((t) => t !== type.id)
                                : [...next, type.id];
                              setSelectedShowTypes(
                                next.length === 0 ? ["all"] : next,
                              );
                            }}
                            isActive={isSelected}
                            className="inline-flex !w-auto items-center gap-1 px-2.5 py-1.5"
                          >
                            {type.iconType === "guitar" ? (
                              <Guitar className="inline-block h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <span
                                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: type.color,
                                  boxShadow: `0 0 6px ${type.color}80`,
                                }}
                              />
                            )}
                            <span>{type.label}</span>
                            {isSelected && <CrispCheckIcon />}
                          </SeventhButton>
                        );
                      })}
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-2 pt-2">
                    <div
                      className="flex w-full cursor-pointer items-start gap-2.5 text-left select-none"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                    >
                      <div className="mt-0.5 shrink-0">
                        <SquishyToggle
                          id="agree-terms"
                          label="Agree to terms and privacy policy"
                          checked={agreeTerms}
                          onChange={setAgreeTerms}
                        />
                      </div>
                      <span className="text-white/40">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <SeventhButton
                    type="submit"
                    icon={false}
                    disabled={status === "loading" || !agreeTerms}
                    className="w-full cursor-pointer disabled:opacity-60"
                  >
                    {status === "loading"
                      ? "Activating Proximity Alerts..."
                      : "Activate Show Alerts"}
                  </SeventhButton>

                  {/* Errors */}
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="space-y-1 pt-1">
                      {Object.entries(fieldErrors).map(([field, errors]) => (
                        <p key={field} className="text-center text-red-400">
                          <span className="capitalize">{field}</span>:{" "}
                          {errors.join(", ")}
                        </p>
                      ))}
                    </div>
                  )}

                  {status === "error" && (
                    <p className="pt-1 text-center text-red-400">
                      {errorMsg || "Something went wrong. Try again."}
                    </p>
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
