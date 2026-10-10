"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  MapPin,
  Check,
  Mail,
  User,
  Guitar,
} from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
import GlowInput from "@/components/GlowInput";
import { Toggle } from "@/components/Toggle";
import IphoneClipMask from "@/components/IphoneClipMask";
import SegmentedTabs from "@/components/SegmentedTabs";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc";

const RADIUS_OPTIONS = [
  { value: "all", label: "All Shows" },
  { value: "15", label: "15 Miles" },
  { value: "30", label: "30 Miles" },
  { value: "50", label: "50 Miles" },
  { value: "100", label: "100 Miles" },
];

const SHOW_TYPES = [
  { id: "all", label: "All Shows", dotClass: "bg-purple-400" },
  { id: "full", label: "Full Band", dotClass: "bg-purple-500" },
  { id: "unplugged", label: "Unplugged", dotClass: "bg-purple-300" },
  { id: "outdoor", label: "Outdoor", dotClass: "bg-emerald-400" },
  { id: "casino", label: "Casino", dotClass: "bg-amber-400" },
  { id: "tv", label: "TV", dotClass: "bg-blue-400" },
  { id: "fundraiser", label: "Fundraiser", dotClass: "bg-rose-500" },
  { id: "special", label: "Special", dotClass: "bg-pink-400" },
];

const BAND_FORMATS = [
  { id: "full", label: "Full Band", desc: "Electric 5-piece rock sets", dot: "bg-purple-500" },
  { id: "unplugged", label: "Unplugged", desc: "Acoustic & vocal sets", dot: "bg-purple-300" },
  { id: "special", label: "Special Feature", desc: "Guest stars & anniversaries", dot: "bg-pink-400" },
];

const VENUE_FORMATS = [
  { id: "outdoor", label: "Outdoor Fest", desc: "Festivals & parks", dot: "bg-emerald-400" },
  { id: "casino", label: "Casino & Resort", desc: "Lounges & showrooms", dot: "bg-amber-400" },
  { id: "tv", label: "TV Broadcast", desc: "Televised live sets", dot: "bg-blue-400" },
  { id: "fundraiser", label: "Fundraiser", desc: "Charity & benefits", dot: "bg-rose-500" },
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
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/** Create a new push subscription */
async function createSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC_KEY,
      ) as unknown as ArrayBuffer,
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
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  // Hydrate from localStorage on mount
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = videoContainerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      const saved =
        localStorage.getItem("7h_alert_prefs_v1") ||
        localStorage.getItem("7h_alert_prefs");
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

  const toggleType = (id: string, e?: React.MouseEvent) => {
    if (id === "all") {
      setSelectedTypes(["all"]);
      return;
    }

    const isAll = selectedTypes.includes("all");

    // If all formats are active, or if Alt/Option is held, immediately isolate just this one!
    if (isAll || e?.altKey) {
      setSelectedTypes([id]);
      return;
    }

    const currentActive = [...selectedTypes];
    const activeSet = new Set(currentActive);
    if (activeSet.has(id)) {
      activeSet.delete(id);
    } else {
      activeSet.add(id);
    }

    const specificTypes = SHOW_TYPES.map((t) => t.id).filter(
      (tId) => tId !== "all",
    );
    const hasAllSpecific = specificTypes.every((tId) => activeSet.has(tId));

    if (activeSet.size === 0 || hasAllSpecific) {
      setSelectedTypes(["all"]);
    } else {
      setSelectedTypes(Array.from(activeSet));
    }
  };

  const selectOnlyType = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTypes([id]);
  };

  /** Save prefs locally and POST the subscription to the server */
  async function persistSubscription(pushSub: PushSubscription) {
    localStorage.setItem(
      "7h_alert_prefs_v1",
      JSON.stringify({ name, zip, email, radius, selectedTypes }),
    );

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
        localStorage.setItem(
          "7h_alert_prefs_v1",
          JSON.stringify({ name, zip, email, radius, selectedTypes }),
        );
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
        localStorage.setItem(
          "7h_alert_prefs_v1",
          JSON.stringify({ name, zip, email, radius, selectedTypes }),
        );
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
  const isAll = selectedTypes.includes("all");
  const activeTypeSet = new Set(selectedTypes);

  return (
    <div className="relative z-10 mb-9 flex w-full flex-col items-start gap-6 md:flex-row md:items-start">
      {/* ── LEFT COLUMN: iPhone Mobile Preview Device Mockup ── */}
      <div className="hidden w-full shrink-0 items-start justify-start md:flex md:w-auto">
        <div className="relative aspect-[9/19.5] w-[190px] filter select-none sm:w-[210px] lg:w-[230px]">
          <IphoneClipMask
            insetXPercent={0}
            insetTopPercent={0}
            insetBottomPercent={0}
            borderRadiusPx={36}
            className="flex h-full w-full items-center justify-center"
          >
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[34px] border border-purple-500/30 bg-[#12071f] p-2 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)]">
              {/* Phone Content Screen */}
              <div
                ref={videoContainerRef}
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] bg-black"
              >
                {isVideoVisible && (
                  <video
                    src="/movie/notefication.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    aria-label="7th Heaven Concert Live Stream"
                    className="h-full w-full rounded-[28px] bg-black object-contain"
                  />
                )}
              </div>
            </div>
          </IphoneClipMask>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Proximity Alert Filters Form ── */}
      <div className="w-full min-w-0 flex-1">
        {/* Header */}
        <div className="relative z-10 mb-6 border-b border-white/10 pb-4">
          <h3 className="m-0">
            Proximity & Show Alert Filters
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Get notified only for shows within your distance & preferences
          </p>
        </div>

        {status === "error" && errorMsg && (
          <div className="mb-6 rounded-[var(--radius-box)] border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
            ⚠️ {errorMsg}
          </div>
        )}

        {permission === "denied" && (
          <div className="mb-6 rounded-[var(--radius-box)] border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-300">
            🔒 Notifications are blocked in your browser settings. Enable them
            to receive show alerts.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Sub-component: Contact Inputs */}
          <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col justify-end">
              <label className="mb-2 flex h-6 items-center gap-1.5 whitespace-nowrap text-xs font-medium">
                Full Name
              </label>
              <GlowInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                wrapperClassName="w-full"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="mb-2 flex h-6 items-center gap-1.5 whitespace-nowrap text-xs ">
                Zip Code / City
              </label>
              <GlowInput
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="e.g. 60056 or City"
                wrapperClassName="w-full"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="mb-2 flex h-6 items-center gap-1.5 whitespace-nowrap text-xs ">
                Email
              </label>
              <GlowInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          {/* ── PHYSIOLOGICALLY OPTIMAL CONSOLE ── */}
          <div className=" ">
            {/* Section 1: Distance Boundary (Scalar Spatial Anchor) */}
            <div className="mb-5">
              <div className="flex items-center justify-between items-start">
                <div className="flex items-center">
                  <label className="text-xs font-medium ">
                    Only notify for shows within your travel radius
                  </label>
                </div>
                {!isAll && (
                  <button
                    type="button"
                    onClick={() => setSelectedTypes(["all"])}
                    className="cursor-pointer text-xs font-semibold text-purple-400 hover:text-purple-300 underline transition-colors duration-150"
                  >
                    Select All Shows
                  </button>
                )}
              </div>
              <SegmentedTabs
                tabs={RADIUS_OPTIONS.map((opt) => ({
                  id: opt.value,
                  label: opt.label,
                }))}
                activeTab={radius}
                onChange={(val) => setRadius(val)}
                shape="full"
                size="sm"
                ariaLabel="Maximum Distance Radius"
              />
            </div>


            {/* Section 2: Show Formats & Categorical Chunking */}
            <div>

              {/* Chunk A: Band Lineup Formats (Miller's Law Chunk 1) */}
              <div className="mb-4">
                <label className="mb-2 flex items-center gap-1.5 text-[11px] ">
                  Band Performance Format
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {BAND_FORMATS.map((item) => {
                    const isSelected = isAll || activeTypeSet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => toggleType(item.id, e)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-colors duration-200 ${isSelected
                          ? "border-purple-400/60 bg-purple-950/40 text-white ring-1 ring-purple-500/50 "
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
                          }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                            <span className="truncate text-xs font-semibold">
                              {item.label}
                            </span>
                          </div>
                          <span className="mt-0.5 block truncate text-[10px] text-white/50">
                            {item.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(isAll || selectedTypes.length > 1) && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => selectOnlyType(item.id, e)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  selectOnlyType(item.id, e as unknown as React.MouseEvent);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-[opacity,background-color,color] duration-150 rounded px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 hover:bg-purple-500/20 hover:text-white"
                              title={`Select only ${item.label}`}
                            >
                              Only
                            </span>
                          )}
                          {isSelected ? (
                            <Check className="h-4 w-4 shrink-0 text-purple-300 stroke-[3]" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chunk B: Venue & Atmosphere Formats (Miller's Law Chunk 2) */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-[12px] font-bold ">
                  Venue & Atmosphere
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {VENUE_FORMATS.map((item) => {
                    const isSelected = isAll || activeTypeSet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => toggleType(item.id, e)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-colors duration-200 ${isSelected
                          ? "border-purple-400/60 bg-purple-950/40 text-white ring-1 ring-purple-500/50 "
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
                          }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                            <span className="truncate text-xs font-semibold">
                              {item.label}
                            </span>
                          </div>
                          <span className="mt-0.5 block truncate text-[10px] text-white/50">
                            {item.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(isAll || selectedTypes.length > 1) && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => selectOnlyType(item.id, e)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  selectOnlyType(item.id, e as unknown as React.MouseEvent);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity rounded px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 hover:bg-purple-500/20 hover:text-white"
                              title={`Select only ${item.label}`}
                            >
                              Only
                            </span>
                          )}
                          {isSelected ? (
                            <Check className="h-4 w-4 shrink-0 text-purple-300 stroke-[3]" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-component: Terms & Submit Block */}
          <div className="relative z-10 flex w-full max-w-full items-center select-none">
            <Toggle
              id="footer-agree-terms"
              checked={agreeTerms}
              onChange={setAgreeTerms}
              className="w-full max-w-full text-xs"
              label={
                <span className="block break-words min-w-0 text-xs">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-white underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-white underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              }
            />
          </div>

          <div className="relative z-10 flex flex-col items-start justify-start gap-3">
            {permission === "granted" ? (
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-box)] border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-emerald-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> Push
                  Enabled
                </span>
                <SeventhButton
                  icon={false}
                  onClick={handleSavePrefs}
                  disabled={isBusy}
                  className="shrink-0 cursor-pointer flex-nowrap whitespace-nowrap disabled:opacity-60"
                >
                  <span className="flex shrink-0 flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
                    {status === "saving" ? (
                      <span className="inline-block h-4 w-4 shrink-0 animate-spin border-2 border-white/10 border-t-white" />
                    ) : status === "saved" ? (
                      <>
                        <Check className="h-4 w-4 shrink-0 text-emerald-300" />{" "}
                        <span className="whitespace-nowrap">Saved!</span>
                      </>
                    ) : (
                      <span className="whitespace-nowrap">Save Preferences</span>
                    )}
                  </span>
                </SeventhButton>
              </div>
            ) : (
              <SeventhButton
                icon={false}
                onClick={handleEnableAlerts}
                disabled={isBusy || permission === "denied"}
                className="shrink-0 cursor-pointer flex-nowrap whitespace-nowrap disabled:opacity-60"
              >
                <span className="flex shrink-0 flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
                  {status === "saving" ? (
                    <span className="inline-block h-4 w-4 shrink-0 animate-spin border-2 border-white/10 border-t-white" />
                  ) : status === "saved" ? (
                    <>
                      <span className="whitespace-nowrap">
                        Preferences Saved!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap">
                        ENABLE ALERTS
                      </span>
                    </>
                  )}
                </span>
              </SeventhButton>
            )}

            <p className="text-xs text-muted">
              {permission === "granted"
                ? "Your notifications are enabled. Update filters above and save anytime."
                : "Click to enable instant browser & proximity alerts for nearby shows."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
