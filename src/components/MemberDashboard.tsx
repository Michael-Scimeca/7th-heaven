/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';

import { useMember } from "@/context/MemberContext";
import { tierColors } from "@/context/member-constants";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const FanUploadForm = dynamic(() => import("./FanUploadForm"), {
  ssr: false,
  loading: () => <p className="text-white/40 animate-pulse">Loading upload form...</p>,
});

import PickAwardsSection from "./PickAwardsSection";

// Venue data for proximity check
const showVenues = [
  { name: "Station 34", city: "Mt. Prospect, IL", lat: 42.0640, lng: -87.9370, date: "January 2", time: "8:30pm", type: "Unplugged" },
  { name: "Old Republic", city: "Elgin, IL", lat: 42.0354, lng: -88.2826, date: "January 3", time: "8:30pm", type: "Full Band" },
  { name: "Rookies", city: "Hoffman Est., IL", lat: 42.0680, lng: -88.1200, date: "January 9", time: "8:00pm", type: "Unplugged" },
  { name: "Sundance Saloon", city: "Mundelein, IL", lat: 42.2631, lng: -88.0037, date: "January 11", time: "2:00pm", type: "Unplugged" },
  { name: "WGN TV", city: "Chicago, IL", lat: 41.8905, lng: -87.6358, date: "January 28", time: "10:00am", type: "TV" },
  { name: "Des Plaines Theater", city: "Des Plaines, IL", lat: 42.0334, lng: -87.8834, date: "January 31", time: "9:00pm", type: "Full Band" },
  { name: "Hard Rock Casino", city: "Rockford, IL", lat: 42.2711, lng: -89.0940, date: "February 7", time: "8:00pm", type: "Casino" },
  { name: "Durty Nellies", city: "Palatine, IL", lat: 42.1103, lng: -88.0340, date: "February 14", time: "9:30pm", type: "Full Band" },
  { name: "Stage 119", city: "Mt. Prospect, IL", lat: 42.0663, lng: -87.9375, date: "February 15", time: "", type: "Full Band" },
  { name: "Jamo's Live", city: "Rosemont, IL", lat: 41.9786, lng: -87.8706, date: "February 21", time: "", type: "Full Band" },
  { name: "Evenflow", city: "Geneva, IL", lat: 41.8842, lng: -88.3059, date: "February 27", time: "", type: "Full Band" },
  { name: "Broken Oar", city: "Mokena, IL", lat: 41.5267, lng: -87.8829, date: "March 7", time: "", type: "Full Band" },
  { name: "Bannerman's", city: "Chicago, IL", lat: 41.9466, lng: -87.6756, date: "March 8", time: "", type: "Full Band" },
  { name: "Sundance Saloon", city: "Mundelein, IL", lat: 42.2636, lng: -88.0040, date: "March 22", time: "", type: "Full Band" },
  { name: "Tailgaters", city: "Bolingbrook, IL", lat: 41.6986, lng: -88.0684, date: "March 27", time: "", type: "Full Band" },
  { name: "Station 34", city: "Mt. Prospect, IL", lat: 42.0645, lng: -87.9375, date: "May 1", time: "", type: "Full Band" },
  { name: "Deer Park Fest", city: "Deer Park, IL", lat: 42.1600, lng: -88.0810, date: "May 2", time: "", type: "Outdoor" },
  { name: "Joe's Live", city: "Rosemont, IL", lat: 41.9795, lng: -87.8695, date: "April 11", time: "", type: "Full Band" },
  { name: "Rochaus", city: "W. Dundee, IL", lat: 42.0989, lng: -88.2768, date: "April 26", time: "", type: "Full Band" },
];

import { Palette, Ticket, PenTool, Users, Crown, Music, Star, Shield, Check, AlertTriangle, Clock, MapPin } from "lucide-react";

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
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
  const { member, logout, isLoggedIn, openModal, updateLocation, toggleNotifications, setNotificationRadius: setRadius } = useMember();
  const geoStatusRef = useRef<"idle" | "loading" | "granted" | "denied">("idle");

  // SMS Alert form state
  const smsNameRef = useRef("");
  const [smsZip, setSmsZip] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const smsStatusRef = useRef<"idle" | "sending" | "success" | "error">("idle");
  const smsMessageRef = useRef("");
  const [unsubPhone, setUnsubPhone] = useState("");
  const unsubStatusRef = useRef<"idle" | "sending" | "success" | "error">("idle");
  const unsubMessageRef = useRef("");

  // Fan Authored Photos State
  const [myPhotos, setMyPhotos] = useState<any[]>([]);

  // Fan Prize Claim State
  const [claimConfirmId, setClaimConfirmId] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [localInbox, setLocalInbox] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalInbox(JSON.parse(localStorage.getItem("vip_inbox_messages_v1") || localStorage.getItem("vip_inbox_messages") || "[]"));
    }
  }, []);

  const executeClaimFlash = (id: string) => {
    setClaimConfirmId(null);
    setIsFlashing(true);

    // Play flashing animation for 3.5 seconds
    setTimeout(() => {
      setIsFlashing(false);
      // Mark as claimed in local state and localStorage
      const updated = localInbox.map(msg => msg.id === id ? { ...msg, isClaimed: true } : msg);
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
    } catch { }
  }, [member?.name]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Pre-fill name from member
  useEffect(() => {
    if (member?.name && !smsNameRef.current) smsNameRef.current = member.name;
  }, [member?.name]);

  const handleSubscribe = async () => {
    if (!smsConsent) { smsStatusRef.current = "error"; smsMessageRef.current = "You must agree to the terms first."; return; }
    if (!smsPhone || !smsZip) { smsStatusRef.current = "error"; smsMessageRef.current = "Phone and zip code are required."; return; }
    smsStatusRef.current = "sending";
    try {
      const res = await fetch("/api/sms/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: smsNameRef.current, zip: smsZip, phone: smsPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        smsStatusRef.current = "success"; smsMessageRef.current = data.message;
      } else {
        const data = await res.json().catch(() => ({}));
        smsStatusRef.current = "error"; smsMessageRef.current = data.error || "Failed to subscribe.";
      }
    } catch { smsStatusRef.current = "error"; smsMessageRef.current = "Network error. Try again."; }
  };

  const handleUnsubscribe = async () => {
    if (!unsubPhone) { unsubStatusRef.current = "error"; unsubMessageRef.current = "Enter your phone number."; return; }
    unsubStatusRef.current = "sending";
    try {
      const res = await fetch("/api/sms/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: unsubPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        unsubStatusRef.current = "success"; unsubMessageRef.current = data.message;
      } else {
        const data = await res.json().catch(() => ({}));
        unsubStatusRef.current = "error"; unsubMessageRef.current = data.error || "Failed to unsubscribe.";
      }
    } catch { unsubStatusRef.current = "error"; unsubMessageRef.current = "Network error. Try again."; }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (member?.location) { geoStatusRef.current = "granted"; return; }
  }, [isLoggedIn, member?.location]);

  const requestLocation = () => {
    geoStatusRef.current = "loading";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
        geoStatusRef.current = "granted";
      },
      () => { geoStatusRef.current = "denied"; },
      { enableHighAccuracy: true }
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
      <section className="py-20 min-h-[calc(100vh-72px)] flex items-center justify-center">
        <div className="site-container max-w-xl w-full">
          <div className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />
            <div className="p-10">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                  Join the <span className=" text-[var(--color-accent)]">Family</span>
                </h1>
                <p className="text-white/40 text-sm">
                  Create a Fan Account to access exclusive rewards, secure priority merchandise, and get proximity text alerts when we play in your city.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button aria-label="Action button" onClick={() => openModal("signup")} className="w-full py-4 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] rounded hover:brightness-110 transition-colors cursor-pointer shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  Create Fan Account
                </button>

                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <span className="relative bg-[var(--color-bg-surface)] px-4 text-xs font-bold text-white/30 uppercase tracking-widest">Already a fan?</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button aria-label="Action button" onClick={() => openModal("login")} className="flex-1 py-4 border border-white/20 text-white flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-[0.15em] rounded hover:border-[var(--color-accent)] hover: text-[var(--color-accent)] transition-colors cursor-pointer bg-white/[0.02]">
                    Sign In As Fan
                  </button>
                  <button aria-label="Action button" onClick={() => openModal("login")} className="flex-1 py-4 border  border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-[0.15em] rounded hover:bg-emerald-500/10 hover:border-emerald-500 transition-colors cursor-pointer bg-emerald-500/5">
                    Crew Portal
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-white/30">
                <p>By creating an account, you agree to receive SMS proximity notifications. You can turn these off at any time using the dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentTierData = tierThresholds.find(t => t.tier === member!.tier)!;
  const nextTier = tierThresholds[tierThresholds.indexOf(currentTierData) + 1];
  const progress = nextTier ? ((member!.points - currentTierData.min) / (nextTier.min - currentTierData.min)) * 100 : 100;

  return (
    <section className="py-12 min-h-screen">
      <div className="site-container">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 flex items-center justify-center text-xl font-black bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]  text-[var(--color-accent)]">
              {member!.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{member!.name}</h1>
                {/* Role label */}
                {(() => {
                  const role = member?.role ?? 'fan';
                  const cfg = { fan: { label: 'FAN', Icon: Star, cls: 'text-white/50 bg-white/[0.06] border-white/[0.08]' }, crew: { label: 'CREW', Icon: Shield, cls: 'text-emerald-400 bg-emerald-500/10  border-[var(--color-accent)]/30' }, admin: { label: 'ADMIN', Icon: Crown, cls: 'text-[var(--color-purple-light)] bg-[var(--color-purple-glow)] border-[var(--color-border-purple)]' } }[role as 'fan' | 'crew' | 'admin'] ?? { label: 'FAN', Icon: Star, cls: 'text-white/50 bg-white/[0.06] border-white/[0.08]' };
                  return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[var(--font-size-xs)] font-bold uppercase tracking-[0.15em] border rounded-full ${cfg.cls}`}>
                      <cfg.Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[var(--font-size-sm)] text-white/40">{member!.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(member?.role === 'crew' || member?.role === 'admin') && (
              <Link href="/crew" className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-[var(--color-accent)] hover:text-white bg-emerald-500/10 border  border-[var(--color-accent)]/30 hover:border-emerald-500/40 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                Crew Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Digital Tickets / Inbox moved to top */}
        <div className="mb-10 p-6 bg-[url('/images/card-glow.jpg')] bg-cover bg-center border border-[var(--color-accent)]/30 relative overflow-hidden shadow-[0_0_40px_rgba(255,10,61,0.15)] group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#0a0a14]/90 to-black/80" />
          <div className="absolute top-0 right-0 p-4 opacity-30 blur-[2px] transition-colors duration-500 group-hover:blur-0 group-hover:opacity-40 translate-x-4 -translate-y-4">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z" /></svg>
          </div>

          <div className="relative z-10 flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Ticket className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-black italic tracking-tight">
                Prize <span className="gradient-text">Wallet</span>
              </h2>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold  text-[var(--color-accent)]/80 bg-[var(--color-accent)]/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/20">Claim PINs</span>
          </div>

          <div className="relative z-10">
            {(() => {
              if (localInbox.length === 0) {
                return (
                  <div className="py-6 flex flex-col items-center border border-white/5 bg-white/5 border-dashed">
                    <p className="text-sm text-white/50 font-bold">Your wallet is currently empty.</p>
                    <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-bold">Keep participating in live streams for a chance to win</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-3">
                  {localInbox.map((msg: any) => {
                    const pinMatch = msg.desc.match(/PIN:\s*(\d+)/i);
                    const pin = pinMatch ? pinMatch[1] : null;

                    return (
                      <div key={msg.id} className={`p-4  border bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${msg.color === 'yellow' ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'border-white/10'}`}>
                        <div className="flex items-center gap-4 w-full">
                          <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg text-xl shadow-inner ${msg.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400/20 to-amber-500/10 text-yellow-500 border border-yellow-400/30' : 'bg-white/5 border border-white/10'}`}>{msg.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-base text-white tracking-wide">{msg.title}</h4>
                              {msg.isNew && <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-500 text-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]">New</span>}
                            </div>
                            <p className="text-xs text-white/60 max-w-sm">{msg.desc.replace(/Your PIN: \d+\.\s*/, '')}</p>
                            <p className="text-[var(--font-size-2xs)] uppercase tracking-widest font-bold text-white/20 mt-1">{msg.time}</p>
                          </div>
                        </div>

                        {pin && (
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                            {msg.isClaimed ? (
                              <div className="px-5 py-2 border border-white/20 bg-white/5 opacity-50 grayscale">
                                <span className="text-[var(--font-size-2xs)] uppercase tracking-[0.2em] font-bold text-white/40 block text-center mb-1">Claimed</span>
                                <span className="font-mono text-xl font-black tracking-[0.25em] text-white/30 line-through">{pin}</span>
                              </div>
                            ) : claimConfirmId === msg.id ? (
                              <div className="p-3 border border-red-500/50 bg-red-500/10 text-center flex flex-col gap-2 w-full max-w-xs">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest leading-tight animate-pulse">Show this to merch crew.</p>
                                <button aria-label="Action button" onClick={() => executeClaimFlash(msg.id)} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                  CLICK TO FLASH & CLAIM
                                </button>
                                <button aria-label="Action button" onClick={() => setClaimConfirmId(null)} className="text-xs text-white/40 hover:text-white uppercase tracking-widest cursor-pointer">Cancel</button>
                              </div>
                            ) : (
                              <button aria-label="Action button" onClick={() => setClaimConfirmId(msg.id)} className="px-6 py-3 border border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 font-black text-sm uppercase tracking-[0.2em] transition-colors shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:scale-105 cursor-pointer">
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
        <div className="mb-10 p-6 bg-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">
              My Photo <span className="gradient-text">Submissions</span>
            </h2>
            <span className="text-xs uppercase tracking-[0.15em] text-white/25">Fan Wall Activity</span>
          </div>

          {myPhotos.length === 0 ? (
            <div className="py-8 flex flex-col items-center border border-white/5 bg-white/5 border-dashed">
              <p className="text-sm text-white/50 font-bold">No photo submissions found.</p>
              <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-bold">Upload a photo to join the fan wall!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myPhotos.map((photo: any) => (
                <div
                  key={photo.id}
                  className={`group relative bg-black/40 border  overflow-hidden backdrop-blur-md transition-colors ${photo.rejected
                    ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                    : photo.approved
                      ? " border-[var(--color-accent)]/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      : "border-white/10"
                    }`}
                >
                  <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                    <Image width={200} height={200} unoptimized
                      src={photo.src}
                      alt={photo.caption || "Upload"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Status Overlay Badge */}
                    <div className="absolute top-2 right-2">
                      {photo.approved ? (
                        <span className="px-2.5 py-1 bg-emerald-500/90 text-white font-mono text-[0.6rem] uppercase tracking-widest rounded border border-emerald-400/20 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Published
                        </span>
                      ) : photo.rejected ? (
                        <span className="px-2.5 py-1 bg-red-500/95 text-white font-mono text-[0.6rem] uppercase tracking-widest rounded border border-red-400/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Declined
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-500/90 text-black font-mono text-[0.6rem] uppercase tracking-widest rounded border border-yellow-400/20 font-black flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    {photo.caption && (
                      <p className="text-xs text-white/70 italic border-l-2 border-[var(--color-accent)]/30 pl-2 line-clamp-2">
                        "{photo.caption}"
                      </p>
                    )}

                    {/* Declined Details block */}
                    {photo.rejected && (
                      <div className="mt-2 p-2.5 bg-red-500/5 border border-red-500/15 rounded-lg text-left">
                        <p className="text-[0.6rem] text-red-400 font-extrabold uppercase tracking-widest mb-1">
                          Reason for Decline
                        </p>
                        <p className="text-[var(--font-size-2xs)] text-red-200/80 leading-normal font-medium">
                          {photo.rejection_reason || "Content does not meet community guidelines."}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-[0.65rem] text-white/30">
                      {photo.venue && <span className="truncate flex items-center gap-1"><MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {photo.venue}</span>}
                      <span className="font-mono">{new Date(photo.submittedAt).toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {[
            { label: "Shows Attended", value: member!.showsAttended.toString(), accent: true },
            { label: "Fan Since", value: new Date(member!.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "America/Chicago" }) },
          ].map((s) => (
            <div key={s.label} className="p-5 bg-white/[0.02] border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-white/25 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.accent ? " text-[var(--color-accent)]" : ""}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>



        {/* Pick Awards — Collector Section (LIVE from Supabase) */}
        <PickAwardsSection userId={member?.id} />

        {/* Removed Digital Tickets / Inbox from here as it was moved to the very top */}

        {/* My Purchases */}
        <div className="mt-6 p-6 bg-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              My <span className="gradient-text">Purchases</span>
            </h2>
            <span className="text-xs uppercase tracking-[0.15em] text-white/25">Order History</span>
          </div>

          {(() => {
            // Demo purchases — in production these come from an API
            const purchases = [
              { id: "7H-2026-0412", date: "Apr 12, 2026", items: [{ name: "7th Heaven Logo Tee", type: "Merch", price: "$29.99", img: "/images/merch/logo-tee.png" }], status: "Delivered", statusColor: "text-emerald-400" },
              { id: "7H-2026-0401", date: "Apr 1, 2026", items: [{ name: "VIP Ticket — Durty Nellies", type: "Ticket", price: "$75.00", img: "/images/merch/ticket-vip.png" }, { name: "Meet & Greet Add-On", type: "Upgrade", price: "$25.00", img: "/images/merch/ticket-vip.png" }], status: "Completed", statusColor: "text-emerald-400" },
              { id: "7H-2026-0315", date: "Mar 15, 2026", items: [{ name: "Signed Vinyl — Greatest Hits", type: "Merch", price: "$44.99", img: "/images/merch/vinyl.png" }], status: "Shipped", statusColor: "text-purple-300" },
              { id: "7H-2026-0228", date: "Feb 28, 2026", items: [{ name: "7th Heaven Hoodie (Black)", type: "Merch", price: "$54.99", img: "/images/merch/hoodie.png" }], status: "Delivered", statusColor: "text-emerald-400" },
              { id: "7H-2026-0210", date: "Feb 10, 2026", items: [{ name: "GA Ticket — Des Plaines Theater", type: "Ticket", price: "$35.00", img: "/images/merch/ticket-ga.png" }], status: "Used", statusColor: "text-white/40" },
            ];

            return (
              <div className="flex flex-col gap-3">
                {purchases.map((order) => (
                  <div key={order.id} className="border border-white/5 bg-white/[0.01] overflow-hidden">
                    {/* Order header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-white/30">{order.id}</span>
                        <span className="text-xs text-white/20">{order.date}</span>
                      </div>
                      <span className={`text-xs uppercase tracking-[0.15em] font-bold ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </div>
                    {/* Items */}
                    <div className="px-4 py-3 flex flex-col gap-2">
                      {order.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Image width={200} height={200} unoptimized src={item.img} alt={item.name} className="w-12 h-12 object-cover border border-white/10" />
                            <div>
                              <p className="text-sm font-semibold text-white/80">{item.name}</p>
                              <p className="text-xs text-white/25 uppercase tracking-[0.1em]">{item.type}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white/50">{item.price}</span>
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none" style={{ animation: 'strobe 0.15s ease-in-out infinite' }}>
          <style>{`
         @keyframes strobe {
           0% { background-color: #ffffff; }
           50% { background-color: #22c55e; }
           100% { background-color: #ffffff; }
         }
       `}</style>
          <div className="  p-10 border-8 border-green-500 text-center scale-125 sm:scale-150 rotate-3 shadow-[0_0_100px_rgba(34,197,94,1)]">
            <h1 className="text-5xl sm:text-7xl font-black text-green-500 uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">WINNER</h1>
            <p className="text-xl sm:text-3xl font-bold text-white mt-4 uppercase tracking-widest">CLAIMING PRIZE</p>
          </div>
        </div>
      )}
    </section>
  );
}
