"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, MapPin, Check, Sliders, Music, Mail, User } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import { GlowInput } from "@/components/GlowInput";
import { SquishyToggle } from "@/components/SquishyToggle";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc";

const RADIUS_OPTIONS = [
  { value: "15", label: "15 Miles" },
  { value: "30", label: "30 Miles" },
  { value: "50", label: "50 Miles" },
  { value: "100", label: "100 Miles" },
  { value: "all", label: "All Shows" },
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

// Convert VAPID public key to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Get the current push subscription from the active service worker */
async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/** Create a new push subscription */
async function createSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
    });
  } catch (e) {
    console.warn("[push] subscribe failed:", e);
    return null;
  }
}

export default function FooterProximityAlerts() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [radius, setRadius] = useState("50");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"]);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Set current permission state
    if ("Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
    // Restore saved prefs
    try {
      const saved = localStorage.getItem("7h_alert_prefs_v1") || localStorage.getItem("7h_alert_prefs");
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.name) setName(prefs.name);
        if (prefs.zip) setZip(prefs.zip);
        if (prefs.email) setEmail(prefs.email);
        if (prefs.radius) setRadius(prefs.radius);
        if (prefs.selectedTypes?.length) setSelectedTypes(prefs.selectedTypes);
      }
    } catch { }
  }, []);

  const toggleType = (id: string) => {
    if (id === "all") { setSelectedTypes(["all"]); return; }
    let next = selectedTypes.filter((t) => t !== "all");
    next = next.includes(id) ? next.filter((t) => t !== id) : [...next, id];
    setSelectedTypes(next.length === 0 ? ["all"] : next);
  };

  /** Save prefs locally and POST the subscription to the server */
  async function persistSubscription(pushSub: PushSubscription) {
    // Save locally
    localStorage.setItem("7h_alert_prefs_v1", JSON.stringify({ name, zip, email, radius, selectedTypes }));

    // Convert PushSubscription to plain object
    const subJson = pushSub.toJSON();

    const res = await fetch("/api/web-push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: {
          endpoint: subJson.endpoint,
          keys: { p256dh: subJson.keys?.p256dh, auth: subJson.keys?.auth },
        },
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        zip: zip.trim() || undefined,
        radius,
        selectedTypes,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Server error saving subscription");
    }
  }

  const handleEnableAlerts = async () => {
    if (!agreeTerms) setAgreeTerms(true);
    setStatus("saving");
    setErrorMsg("");
    try {
      let pushSub: PushSubscription | null = null;
      if (typeof window !== "undefined" && "Notification" in window) {
        const p = await Notification.requestPermission();
        setPermission(p);
        if (p === "granted" && "serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/sw.js");
          pushSub = await createSubscription();
        }
      }
      if (pushSub) {
        await persistSubscription(pushSub);
      } else {
        localStorage.setItem("7h_alert_prefs_v1", JSON.stringify({ name, zip, email, radius, selectedTypes }));
        await fetch("/api/web-push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || undefined,
            email: email.trim() || undefined,
            zip: zip.trim() || undefined,
            radius,
            selectedTypes,
          }),
        });
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      console.error("[push] handleEnableAlerts:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const handleSavePrefs = async () => {
    setStatus("saving");
    setErrorMsg("");
    try {
      let pushSub = await getExistingSubscription();
      if (!pushSub) {
        pushSub = await createSubscription();
      }
      if (pushSub) {
        await persistSubscription(pushSub);
      } else {
        localStorage.setItem("7h_alert_prefs_v1", JSON.stringify({ name, zip, email, radius, selectedTypes }));
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      console.error("[push] handleSavePrefs:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const isBusy = status === "saving";

  return (
    <div className="w-full relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">

          <div>
            <h3 className="font-[var(--font-heading)] text-lg sm:text-xl  font-bold  uppercase tracking-tight text-white flex items-center gap-2">
              Proximity & Show Alert Filters
            </h3>
            <p className="text-xs text-purple-300/90 font-bold uppercase tracking-wider">
              Get notified only for shows within your distance & preferences
            </p>
          </div>
        </div>
      </div>

      {status === "error" && errorMsg && (
        <div className="mb-4 px-4 py-2.5  rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {permission === "denied" && (
        <div className="mb-4 px-4 py-2.5  rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          🔒 Notifications are blocked in your browser settings. Enable them to receive show alerts.
        </div>
      )}

      <div className="flex flex-wrap items-end gap-6 mb-6 relative z-10">
        <div className="shrink-0 w-full sm:w-[300px]">
          <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-400" /> Full Name <span className="text-white/30 normal-case font-medium tracking-normal">(optional)</span>
          </label>
          <GlowInput type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" wrapperClassName="w-full sm:w-[300px]" />
        </div>

        <div className="shrink-0 w-full sm:w-[300px]">
          <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-pink-400" /> Your Zip Code / City
          </label>
          <GlowInput type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 60056 or Chicago" wrapperClassName="w-full sm:w-[300px]" />
        </div>

        <div className="shrink-0 w-full sm:w-[300px]">
          <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email <span className="text-white/30 normal-case font-medium tracking-normal">(optional)</span>
          </label>
          <GlowInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" wrapperClassName="w-full sm:w-[300px]" />
        </div>

        <div className="shrink-0 w-full lg:w-auto">
          <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Maximum Distance Radius
          </label>
          <div className="inline-flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#e1e6ff29] border  border-white/10  backdrop-blur-[16px] w-fit max-w-full">
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={`px-3.5 py-2  rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : " text-white  hover:text-white hover:bg-[#e1e6ff29]  "
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <label className="block text-[11px]  font-bold  uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-cyan-400" /> Which Types of Show Notifications?
        </label>
        <div className="flex flex-wrap gap-2">
          {SHOW_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleType(type.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2  rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white  border-white/10 "
                  : "bg-[#e1e6ff29]    text-white  border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3 cursor-pointer select-none relative z-10" onClick={() => setAgreeTerms(!agreeTerms)}>
        <SquishyToggle id="footer-agree-terms" label="Agree to terms and privacy policy" checked={agreeTerms} onChange={setAgreeTerms} />
        <span className="text-xs  text-white  leading-tight font-medium">
          I agree to the <Link href="/terms" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Terms</Link> and <Link href="/privacy" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
        </span>
      </div>

      <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-5 relative z-10">
        {permission === "granted" ? (
          <div className="flex items-center gap-3 shrink-0 flex-nowrap">
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5  rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs  font-bold  uppercase tracking-wider whitespace-nowrap shrink-0">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Push Enabled
            </span>
            <CosmicRadialButton
              icon={false}
              onClick={handleSavePrefs}
              disabled={isBusy}
              className="!px-6 !py-3 !text-xs ! font-bold  uppercase tracking-wider  rounded-lg shrink-0 cursor-pointer   hover:scale-105 transition-all disabled:opacity-60 whitespace-nowrap flex-nowrap"
            >
              <span className="flex items-center justify-center gap-2 whitespace-nowrap flex-nowrap shrink-0">
                {status === "saving" ? (
                  <span className="w-4 h-4 border-2  border-white/10  border-t-white rounded-full animate-spin inline-block shrink-0" />
                ) : status === "saved" ? (
                  <><Check className="w-4 h-4 text-emerald-300 shrink-0" /> <span className="whitespace-nowrap  font-bold ">Saved!</span></>
                ) : (
                  <span className="whitespace-nowrap  font-bold ">Save Preferences</span>
                )}
              </span>
            </CosmicRadialButton>
          </div>
        ) : (
          <CosmicRadialButton
            icon={false}
            onClick={handleEnableAlerts}
            disabled={isBusy || permission === "denied"}
            className="!px-6 !py-3.5 !text-xs ! font-bold  uppercase tracking-wider  rounded-lg shrink-0 cursor-pointer   hover:scale-105 transition-all disabled:opacity-60 whitespace-nowrap flex-nowrap"
          >
            <span className="flex items-center justify-center gap-2 whitespace-nowrap flex-nowrap shrink-0">
              {status === "saving" ? (
                <span className="w-4 h-4 border-2  border-white/10  border-t-white rounded-full animate-spin inline-block shrink-0" />
              ) : status === "saved" ? (
                <><Check className="w-4 h-4 text-emerald-300 shrink-0" /> <span className="whitespace-nowrap  font-bold ">Preferences Saved!</span></>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="whitespace-nowrap  font-bold ">ENABLE ALERTS ({radius === "all" ? "ALL SHOWS" : `${radius} MI`})</span>
                </>
              )}
            </span>
          </CosmicRadialButton>
        )}

        <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
          {permission === "granted"
            ? "Your notifications are enabled. Update filters above and save anytime."
            : "Click to enable instant browser & proximity alerts for nearby shows."}
        </p>
      </div>
    </div>
  );
}
