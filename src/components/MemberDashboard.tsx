/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from "next/image";

import { useMember } from "@/context/MemberContext";
import { tierColors } from "@/context/member-constants";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const FanUploadForm = dynamic(() => import("./FanUploadForm"), {
  ssr: false,
  loading: () => <p className="animate-pulse">Loading upload form...</p>,
});

import PickAwardsSection from "./PickAwardsSection";
import PushAlertsCard from "./PushAlertsCard";

// Venue data for proximity check
const showVenues = [
  {
    name: "Station 34",
    city: "Mt. Prospect, IL",
    lat: 42.064,
    lng: -87.937,
    date: "January 2",
    time: "8:30pm",
    type: "Unplugged",
  },
  {
    name: "Old Republic",
    city: "Elgin, IL",
    lat: 42.0354,
    lng: -88.2826,
    date: "January 3",
    time: "8:30pm",
    type: "Full Band",
  },
  {
    name: "Rookies",
    city: "Hoffman Est., IL",
    lat: 42.068,
    lng: -88.12,
    date: "January 9",
    time: "8:00pm",
    type: "Unplugged",
  },
  {
    name: "Sundance Saloon",
    city: "Mundelein, IL",
    lat: 42.2631,
    lng: -88.0037,
    date: "January 11",
    time: "2:00pm",
    type: "Unplugged",
  },
  {
    name: "WGN TV",
    city: "Chicago, IL",
    lat: 41.8905,
    lng: -87.6358,
    date: "January 28",
    time: "10:00am",
    type: "TV",
  },
  {
    name: "Des Plaines Theater",
    city: "Des Plaines, IL",
    lat: 42.0334,
    lng: -87.8834,
    date: "January 31",
    time: "9:00pm",
    type: "Full Band",
  },
  {
    name: "Hard Rock Casino",
    city: "Rockford, IL",
    lat: 42.2711,
    lng: -89.094,
    date: "February 7",
    time: "8:00pm",
    type: "Casino",
  },
  {
    name: "Durty Nellies",
    city: "Palatine, IL",
    lat: 42.1103,
    lng: -88.034,
    date: "February 14",
    time: "9:30pm",
    type: "Full Band",
  },
  {
    name: "Stage 119",
    city: "Mt. Prospect, IL",
    lat: 42.0663,
    lng: -87.9375,
    date: "February 15",
    time: "",
    type: "Full Band",
  },
  {
    name: "Jamo's Live",
    city: "Rosemont, IL",
    lat: 41.9786,
    lng: -87.8706,
    date: "February 21",
    time: "",
    type: "Full Band",
  },
  {
    name: "Evenflow",
    city: "Geneva, IL",
    lat: 41.8842,
    lng: -88.3059,
    date: "February 27",
    time: "",
    type: "Full Band",
  },
  {
    name: "Broken Oar",
    city: "Mokena, IL",
    lat: 41.5267,
    lng: -87.8829,
    date: "March 7",
    time: "",
    type: "Full Band",
  },
  {
    name: "Bannerman's",
    city: "Chicago, IL",
    lat: 41.9466,
    lng: -87.6756,
    date: "March 8",
    time: "",
    type: "Full Band",
  },
  {
    name: "Sundance Saloon",
    city: "Mundelein, IL",
    lat: 42.2636,
    lng: -88.004,
    date: "March 22",
    time: "",
    type: "Full Band",
  },
  {
    name: "Tailgaters",
    city: "Bolingbrook, IL",
    lat: 41.6986,
    lng: -88.0684,
    date: "March 27",
    time: "",
    type: "Full Band",
  },
  {
    name: "Station 34",
    city: "Mt. Prospect, IL",
    lat: 42.0645,
    lng: -87.9375,
    date: "May 1",
    time: "",
    type: "Full Band",
  },
  {
    name: "Deer Park Fest",
    city: "Deer Park, IL",
    lat: 42.16,
    lng: -88.081,
    date: "May 2",
    time: "",
    type: "Outdoor",
  },
  {
    name: "Joe's Live",
    city: "Rosemont, IL",
    lat: 41.9795,
    lng: -87.8695,
    date: "April 11",
    time: "",
    type: "Full Band",
  },
  {
    name: "Rochaus",
    city: "W. Dundee, IL",
    lat: 42.0989,
    lng: -88.2768,
    date: "April 26",
    time: "",
    type: "Full Band",
  },
];

import {
  Palette,
  Ticket,
  PenTool,
  Users,
  Crown,
  Music,
  Star,
  Shield,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
} from "lucide-react";

function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const rewards = [
  { name: "Free Sticker Pack", points: 200, icon: Palette },
  { name: "Early Access Tickets", points: 500, icon: Ticket },
  { name: "Signed Setlist", points: 750, icon: PenTool },
  { name: "Backstage Meet & Greet", points: 1500, icon: Users },
  { name: "VIP Concert Package", points: 3000, icon: Crown },
  { name: "Private Acoustic Session", points: 5000, icon: Music },
];

const tierThresholds = [
  { tier: "Bronze", min: 0, max: 499 },
  { tier: "Silver", min: 500, max: 1999 },
  { tier: "Gold", min: 2000, max: 4999 },
  { tier: "Platinum", min: 5000, max: Infinity },
];

export default function MemberDashboard() {
  const {
    member,
    logout,
    isLoggedIn,
    openModal,
    updateLocation,
    toggleNotifications,
    setNotificationRadius: setRadius,
  } = useMember();
  const geoStatusRef = useRef<"idle" | "loading" | "granted" | "denied">(
    "idle",
  );

  // SMS Alert form state
  const smsNameRef = useRef("");
  const [smsZip, setSmsZip] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const smsStatusRef = useRef<"idle" | "sending" | "success" | "error">("idle");
  const smsMessageRef = useRef("");
  const [unsubPhone, setUnsubPhone] = useState("");
  const unsubStatusRef = useRef<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const unsubMessageRef = useRef("");

  // Fan Authored Photos State
  const [myPhotos, setMyPhotos] = useState<any[]>([]);

  // Fan Prize Claim State
  const [claimConfirmId, setClaimConfirmId] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [localInbox, setLocalInbox] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalInbox(
        JSON.parse(
          localStorage.getItem("vip_inbox_messages_v1") ||
            localStorage.getItem("vip_inbox_messages") ||
            "[]",
        ),
      );
    }
  }, []);

  const executeClaimFlash = (id: string) => {
    setClaimConfirmId(null);
    setIsFlashing(true);

    // Play flashing animation for 3.5 seconds
    setTimeout(() => {
      setIsFlashing(false);
      // Mark as claimed in local state and localStorage
      const updated = localInbox.map((msg) =>
        msg.id === id ? { ...msg, isClaimed: true } : msg,
      );
      setLocalInbox(updated);
      localStorage.setItem("vip_inbox_messages_v1", JSON.stringify(updated));
    }, 3500);
  };

  const fetchPhotos = useCallback(async () => {
    if (!member?.name) return;
    try {
      const res = await fetch("/api/fans?all=true");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMyPhotos(data.filter((p: any) => p.name === member.name));
        }
      }
    } catch {}
  }, [member?.name]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Pre-fill name from member
  useEffect(() => {
    if (member?.name && !smsNameRef.current) smsNameRef.current = member.name;
  }, [member?.name]);

  const handleSubscribe = async () => {
    if (!smsConsent) {
      smsStatusRef.current = "error";
      smsMessageRef.current = "You must agree to the terms first.";
      return;
    }
    if (!smsPhone || !smsZip) {
      smsStatusRef.current = "error";
      smsMessageRef.current = "Phone and zip code are required.";
      return;
    }
    smsStatusRef.current = "sending";
    try {
      const res = await fetch("/api/sms/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: smsNameRef.current,
          zip: smsZip,
          phone: smsPhone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        smsStatusRef.current = "success";
        smsMessageRef.current = data.message;
      } else {
        const data = await res.json().catch(() => ({}));
        smsStatusRef.current = "error";
        smsMessageRef.current = data.error || "Failed to subscribe.";
      }
    } catch {
      smsStatusRef.current = "error";
      smsMessageRef.current = "Network error. Try again.";
    }
  };

  const handleUnsubscribe = async () => {
    if (!unsubPhone) {
      unsubStatusRef.current = "error";
      unsubMessageRef.current = "Enter your phone number.";
      return;
    }
    unsubStatusRef.current = "sending";
    try {
      const res = await fetch("/api/sms/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: unsubPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        unsubStatusRef.current = "success";
        unsubMessageRef.current = data.message;
      } else {
        const data = await res.json().catch(() => ({}));
        unsubStatusRef.current = "error";
        unsubMessageRef.current = data.error || "Failed to unsubscribe.";
      }
    } catch {
      unsubStatusRef.current = "error";
      unsubMessageRef.current = "Network error. Try again.";
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (member?.location) {
      geoStatusRef.current = "granted";
      return;
    }
  }, [isLoggedIn, member?.location]);

  const requestLocation = () => {
    geoStatusRef.current = "loading";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
        geoStatusRef.current = "granted";
      },
      () => {
        geoStatusRef.current = "denied";
      },
      { enableHighAccuracy: true },
    );
  };

  const nearbyShows = useMemo(() => {
    if (!member?.location) return [];
    const radius = member.notificationRadius;
    const { lat, lng } = member.location;
    return showVenues
      .flatMap((v) => {
        const distance = getDistance(lat, lng, v.lat, v.lng);
        return distance <= radius ? [{ ...v, distance }] : [];
      })
      .sort((a, b) => a.distance - b.distance);
  }, [member?.location, member?.notificationRadius]);

  // Not logged in
  if (!isLoggedIn) {
    const isSignup = true;
    // We need a proper local state for this form.
    return (
      <section className="flex min-h-[calc(100vh-72px)] items-center justify-center py-20">
        <div className="site-container w-full max-w-xl">
          <div className="relative overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />
            <div className="p-10">
              <div className="mb-10 text-center">
                <h1 className="mb-3">
                  Join the{" "}
                  <span className="text-[var(--color-accent)]">Family</span>
                </h1>
                <p>
                  Create a Fan Account to access exclusive rewards, secure
                  priority merchandise, and get proximity text alerts when we
                  play in your city.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => openModal("signup")}
                  className="w-full cursor-pointer rounded bg-[var(--color-accent)] py-4 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-colors hover:brightness-110"
                >
                  Create Fan Account
                </button>

                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <span className="relative bg-[var(--color-bg-surface)] px-4 text-white/30">
                    Already a fan?
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => openModal("login")}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.02] py-4 transition-colors hover:border-[var(--color-accent)]"
                  >
                    Sign In As Fan
                  </button>
                  <button
                    onClick={() => openModal("login")}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded border border-white/10 bg-emerald-500/5 py-4 transition-colors hover:border-emerald-500 hover:bg-emerald-500/10"
                  >
                    Crew Portal
                  </button>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-8 text-center text-white/30">
                <p>
                  By creating an account, you agree to receive SMS proximity
                  notifications. You can turn these off at any time using the
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentTierData = tierThresholds.find((t) => t.tier === member!.tier)!;
  const nextTier = tierThresholds[tierThresholds.indexOf(currentTierData) + 1];
  const progress = nextTier
    ? ((member!.points - currentTierData.min) /
        (nextTier.min - currentTierData.min)) *
      100
    : 100;

  return (
    <section className="min-h-screen py-12">
      <div className="site-container">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-5">
            <div className="relative flex h-12 w-12 items-center justify-center border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-xl text-[var(--color-accent)]">
              {member!.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1>{member!.name}</h1>
                {/* Role label */}
                {(() => {
                  const role = member?.role ?? "fan";
                  const cfg = {
                    fan: {
                      label: "FAN",
                      cls: "text-purple-300 bg-purple-600/20 border-purple-500/35",
                    },
                    crew: {
                      label: "CREW",
                      cls: "text-purple-300 bg-purple-600/20 border-purple-500/35",
                    },
                    admin: {
                      label: "ADMIN",
                      cls: "text-[var(--color-purple-light)] bg-[var(--color-purple-glow)] border-[var(--color-border-purple)]",
                    },
                  }[role as "fan" | "crew" | "admin"] ?? {
                    label: "FAN",
                    cls: "text-purple-300 bg-purple-600/20 border-purple-500/35",
                  };
                  return (
                    <span
                      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[var(--font-size-xs)] ${cfg.cls}`}
                    >
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <p>{member!.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(member?.role === "crew" || member?.role === "admin") && (
              <Link
                href="/crew"
                className="inline-flex cursor-pointer items-center gap-1.5 border border-white/10 bg-emerald-500/10 px-4 py-2 transition-colors hover:border-emerald-500/40 hover:text-white"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Crew Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Free Push Alerts Setup Card */}
        <PushAlertsCard group="fans" className="mb-10" />

        {/* Digital Tickets / Inbox moved to top */}
        <div className="group relative mb-10 overflow-hidden border border-white/10 bg-[url('/images/card-glow.jpg')] bg-cover bg-center p-6 shadow-[0_0_40px_rgba(255,10,61,0.15)]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#0a0a14]/90 to-black/80" />
          <div className="group-hover:blur-0 absolute top-0 right-0 translate-x-4 -translate-y-4 p-4 opacity-30 blur-[2px] transition-colors duration-500 group-hover:opacity-40">
            <svg
              width="150"
              height="150"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>

          <div className="relative z-10 mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Ticket className="h-6 w-6" />
              <h2>
                Prize <span className="gradient-text">Wallet</span>
              </h2>
            </div>
            <span className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 px-3 py-1 text-[var(--color-accent)]/80">
              Claim PINs
            </span>
          </div>

          <div className="relative z-10">
            {(() => {
              if (localInbox.length === 0) {
                return (
                  <div className="flex flex-col items-center border border-dashed border-white/10 bg-[#00000029] py-6">
                    <p>Your wallet is currently empty.</p>
                    <p>
                      Keep participating in live streams for a chance to win
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-3">
                  {localInbox.map((msg: any) => {
                    const pinMatch = msg.desc.match(/PIN:\s*(\d+)/i);
                    const pin = pinMatch ? pinMatch[1] : null;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col items-center justify-between gap-4 border bg-black/40 p-4 backdrop-blur-[45px] sm:flex-row ${msg.color === "yellow" ? "border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]" : "border-white/10"}`}
                      >
                        <div className="flex w-full items-center gap-4">
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-xl shadow-inner ${msg.color === "yellow" ? "border border-yellow-400/30 bg-gradient-to-br from-yellow-400/20 to-amber-500/10 text-yellow-500" : "border border-white/10 bg-[#00000029]"}`}
                          >
                            {msg.icon}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h4>{msg.title}</h4>
                              {msg.isNew && (
                                <span className="rounded-lg bg-yellow-500 px-2 py-0.5 text-[var(--font-size-2xs)] shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="max-w-sm">
                              {msg.desc.replace(/Your PIN: \d+\.\s*/, "")}
                            </p>
                            <p>{msg.time}</p>
                          </div>
                        </div>

                        {pin && (
                          <div className="mt-3 flex w-full flex-col items-center gap-3 sm:mt-0 sm:w-auto sm:flex-row">
                            {msg.isClaimed ? (
                              <div className="border border-white/10 bg-[#00000029] px-5 py-2 opacity-50 grayscale">
                                <span className="mb-1 block text-center text-[var(--font-size-2xs)] text-white/40">
                                  Claimed
                                </span>
                                <span className="text-xl text-white/30 line-through">
                                  {pin}
                                </span>
                              </div>
                            ) : claimConfirmId === msg.id ? (
                              <div className="flex w-full max-w-xs flex-col gap-2 border border-red-500/50 bg-red-500/10 p-3 text-center">
                                <p className="animate-pulse text-red-400">
                                  Show this to merch crew.
                                </p>
                                <button
                                  onClick={() => executeClaimFlash(msg.id)}
                                  className="w-full rounded bg-red-600 py-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-colors hover:bg-red-500"
                                >
                                  CLICK TO FLASH & CLAIM
                                </button>
                                <button
                                  onClick={() => setClaimConfirmId(null)}
                                  className="cursor-pointer text-white/40 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setClaimConfirmId(msg.id)}
                                className="cursor-pointer border border-yellow-400/50 bg-yellow-400/10 px-6 py-3 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-colors hover:bg-yellow-400/20"
                              >
                                Redeem Prize
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Photo Upload System */}
        <div className="mb-10">
          <FanUploadForm />
        </div>

        {/* My Photo Submissions */}
        <div className="mb-10 border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2>
              My Photo <span className="gradient-text">Submissions</span>
            </h2>
            <span>Fan Wall Activity</span>
          </div>

          {myPhotos.length === 0 ? (
            <div className="flex flex-col items-center border border-dashed border-white/10 bg-[#00000029] py-8">
              <p>No photo submissions found.</p>
              <p>Upload a photo to join the fan wall!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {myPhotos.map((photo: any) => (
                <div
                  key={photo.id}
                  className={`group relative overflow-hidden border bg-black/40 backdrop-blur-[45px] transition-colors ${photo.rejected ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]" : photo.approved ? "border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-white/10"}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#00000029]">
                    <Image
                      width={200}
                      height={200}
                      unoptimized
                      src={photo.src}
                      alt={photo.caption || "Upload"}
                      className="h-full w-full object-cover"
                    />

                    {/* Status Overlay Badge */}
                    <div className="absolute top-2 right-2">
                      {photo.approved ? (
                        <span className="flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-500/90 px-2.5 py-1 text-[0.9rem]">
                          <Check className="h-3 w-3" /> Published
                        </span>
                      ) : photo.rejected ? (
                        <span className="flex items-center gap-1 rounded border border-red-400/30 bg-red-500/95 px-2.5 py-1 text-[0.9rem]">
                          <AlertTriangle className="h-3 w-3" /> Declined
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded border border-yellow-400/20 bg-yellow-500/90 px-2.5 py-1 text-[0.9rem]">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-4">
                    {photo.caption && (
                      <p className="line-clamp-2 border-l-2 border-white/10 pl-2">
                        "{photo.caption}"
                      </p>
                    )}

                    {/* Declined Details block */}
                    {photo.rejected && (
                      <div className="mt-2 rounded-lg border border-red-500/15 bg-red-500/5 p-2.5 text-left">
                        <p className="mb-1 text-red-400">Reason for Decline</p>
                        <p className="leading-normal text-red-200/80">
                          {photo.rejection_reason ||
                            "Content does not meet community guidelines."}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[0.65rem] text-white/30">
                      {photo.venue && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="text-purple-400shrink-0 h-3 w-3" />{" "}
                          {photo.venue}
                        </span>
                      )}
                      <span>
                        {new Date(photo.submittedAt).toLocaleDateString(
                          "en-US",
                          { timeZone: "America/Chicago" },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              label: "Shows Attended",
              value: member!.showsAttended.toString(),
              accent: true,
            },
            {
              label: "Fan Since",
              value: new Date(member!.joinDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
                timeZone: "America/Chicago",
              }),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-white/10 bg-white/[0.02] p-5"
            >
              <p className="mb-1">{s.label}</p>
              <p className={`${s.accent ? "text-[var(--color-accent)]" : ""}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Pick Awards — Collector Section (LIVE from Supabase) */}
        <PickAwardsSection userId={member?.id} />

        {/* Removed Digital Tickets / Inbox from here as it was moved to the very top */}

        {/* My Purchases */}
        <div className="mt-6 border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2>
              My <span className="gradient-text">Purchases</span>
            </h2>
            <span>Order History</span>
          </div>

          {(() => {
            // Demo purchases — in production these come from an API
            const purchases = [
              {
                id: "7H-2026-0412",
                date: "Apr 12, 2026",
                items: [
                  {
                    name: "7th Heaven Logo Tee",
                    type: "Merch",
                    price: "$29.99",
                    img: "/images/merch/logo-tee.png",
                  },
                ],
                status: "Delivered",
                statusColor: "text-emerald-400",
              },
              {
                id: "7H-2026-0401",
                date: "Apr 1, 2026",
                items: [
                  {
                    name: "VIP Ticket — Durty Nellies",
                    type: "Ticket",
                    price: "$75.00",
                    img: "/images/merch/ticket-vip.png",
                  },
                  {
                    name: "Meet & Greet Add-On",
                    type: "Upgrade",
                    price: "$25.00",
                    img: "/images/merch/ticket-vip.png",
                  },
                ],
                status: "Completed",
                statusColor: "text-emerald-400",
              },
              {
                id: "7H-2026-0315",
                date: "Mar 15, 2026",
                items: [
                  {
                    name: "Signed Vinyl — Greatest Hits",
                    type: "Merch",
                    price: "$44.99",
                    img: "/images/merch/vinyl.png",
                  },
                ],
                status: "Shipped",
                statusColor: "text-purple-300",
              },
              {
                id: "7H-2026-0228",
                date: "Feb 28, 2026",
                items: [
                  {
                    name: "7th Heaven Hoodie (Black)",
                    type: "Merch",
                    price: "$54.99",
                    img: "/images/merch/hoodie.png",
                  },
                ],
                status: "Delivered",
                statusColor: "text-emerald-400",
              },
              {
                id: "7H-2026-0210",
                date: "Feb 10, 2026",
                items: [
                  {
                    name: "GA Ticket — Des Plaines Theater",
                    type: "Ticket",
                    price: "$35.00",
                    img: "/images/merch/ticket-ga.png",
                  },
                ],
                status: "Used",
                statusColor: " text-white/40",
              },
            ];

            return (
              <div className="flex flex-col gap-3">
                {purchases.map((order) => (
                  <div
                    key={order.id}
                    className="overflow-hidden border border-white/10 bg-white/[0.01]"
                  >
                    {/* Order header */}
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
                      <div className="flex items-center gap-4">
                        <span className="text-white/30">{order.id}</span>
                        <span className="text-white/20">{order.date}</span>
                      </div>
                      <span className={`${order.statusColor}`}>
                        {order.status}
                      </span>
                    </div>
                    {/* Items */}
                    <div className="flex flex-col gap-2 px-4 py-3">
                      {order.items.map((item, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              width={200}
                              height={200}
                              unoptimized
                              src={item.img}
                              alt={item.name}
                              className="h-12 w-12 border border-white/10 object-cover"
                            />
                            <div>
                              <p className=" ">{item.name}</p>
                              <p className=" ">{item.type}</p>
                            </div>
                          </div>
                          <span className="text-white/50">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Full Screen Flash Overlay */}
      {isFlashing && (
        <div
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ animation: "strobe 0.15s ease-in-out infinite" }}
        >
          <div className="scale-125 rotate-3 border-8 border-green-500 p-10 text-center shadow-[0_0_100px_rgba(34,197,94,1)] sm:scale-150">
            <h1>WINNER</h1>
            <p className="mt-4">CLAIMING PRIZE</p>
          </div>
        </div>
      )}
    </section>
  );
}
