/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/duplicate-jsx-subtree */
/* oxlint-disable react-doctor/no-high-complexity-react-function */
/* oxlint-disable react-doctor/duplicate-jsx-subtree */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, MapPin, Check, Sliders, Music, Mail, User, Guitar } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import GlowInput from "@/components/GlowInput";
import { SquishyToggle } from "@/components/SquishyToggle";
import IphoneClipMask from "@/components/IphoneClipMask";
import CheckMarkIcon from "@/components/CheckMarkIcon";

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
    { id: "all", label: "All Shows", color: "#c084fc", iconType: "guitar" },
    { id: "full", label: "Full Band", color: "#a855f7" },
    { id: "unplugged", label: "Unplugged", color: "#c084fc" },
    { id: "outdoor", label: "Outdoor", color: "#34d399" },
    { id: "casino", label: "Casino", color: "#fbbf24" },
    { id: "tv", label: "TV", color: "#60a5fa" },
    { id: "fundraiser", label: "Fundraiser", color: "#f43f5e" },
    { id: "special", label: "Special", color: "#f472b6" },
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

function CrispCheckIcon() {
    return <CheckMarkIcon className="w-3.5 h-3.5 text-purple-200 ml-0.5 shrink-0 inline-block" />;
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
        if (id === "all") {
            setSelectedTypes(["all"]);
            return;
        }
        const isAll = selectedTypes.includes("all");
        const currentActive = isAll
            ? SHOW_TYPES.map((t) => t.id).filter((tId) => tId !== "all")
            : [...selectedTypes];

        const activeSet = new Set(currentActive);
        if (activeSet.has(id)) {
            activeSet.delete(id);
        } else {
            activeSet.add(id);
        }

        const specificTypes = SHOW_TYPES.map((t) => t.id).filter((tId) => tId !== "all");
        const hasAllSpecific = specificTypes.every((tId) => activeSet.has(tId));

        if (activeSet.size === 0 || hasAllSpecific) {
            setSelectedTypes(["all"]);
        } else {
            setSelectedTypes(Array.from(activeSet));
        }
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
        <div className="w-full relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
            {/* ── LEFT COLUMN: iPhone Mobile Preview Device Mockup (Hidden on mobile, shown on tablet/desktop) ── */}
            <div className="hidden md:flex shrink-0 w-full md:w-auto justify-center items-center my-auto">
                <div className="relative w-[190px] sm:w-[210px] lg:w-[230px] aspect-[9/19.5] select-none filter ">
                    <IphoneClipMask
 insetXPercent={0}
 insetTopPercent={0}
 insetBottomPercent={0}
 borderRadiusPx={36}
 className="w-full h-full flex items-center justify-center">
                        <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-[#12071f] flex flex-col justify-between p-2 border border-purple-500/30 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)]">
                            {/* Phone Content Screen */}
                            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center">
                                <video
 src="/movie/notefication.mp4"
 autoPlay
 loop
 muted
 playsInline
 aria-label="7th Heaven Concert Live Stream"
 className="w-full h-full object-contain bg-black rounded-[28px]"
 />
                            </div>
                        </div>
                    </IphoneClipMask>
                </div>
            </div>

            {/* ── RIGHT COLUMN: Proximity Alert Filters Form ── */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-3">

                        <div>
                            <h4>
                                Proximity & Show Alert Filters
                            </h4>
                            <p>
                                Get notified only for shows within your distance & preferences
                            </p>
                        </div>
                    </div>
                </div>

                {status === "error" && errorMsg && (
                    <div className="mb-4 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {permission === "denied" && (
                    <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        🔒 Notifications are blocked in your browser settings. Enable them to receive show alerts.
                    </div>
                )}

                {/* Top Row: Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 relative z-10">
                    <div>
                        <label className="block mb-2 flex items-center gap-1.5">
                        </label>
                        <GlowInput type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" wrapperClassName="w-full" />
                    </div>

                    <div>
                        <label className="block uppercase mb-2 flex items-center gap-1.5">
                            Your Zip Code / City
                        </label>
                        <GlowInput type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 60056 or Chicago" wrapperClassName="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 flex items-center gap-1.5">
                            Email <span className="text-white/30 normal-case tracking-normal">(optional)</span>
                        </label>
                        <GlowInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" wrapperClassName="w-full" />
                    </div>
                </div>

                {/* Stacked Rows: Maximum Distance Radius on Top, Notification Types Below */}
                <div className="flex flex-col gap-6 mb-6 relative z-10">
                    <div>
                        <label className="block text-[11px] uppercase mb-2 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" /> Maximum Distance Radius
                        </label>
                        <div className="inline-flex flex-wrap gap-1.5 w-fit max-w-full">
                            {RADIUS_OPTIONS.map((opt) => {
                                const isSelected = radius === opt.value;
                                return (
                                    <FoolishShrimpButton
 key={opt.value}
 type="button"
 onClick={() => setRadius(opt.value)}
                                        isActive={isSelected}
                                        className="!w-auto px-3.5 py-2 text-xs">
                                        {opt.label}
                                    </FoolishShrimpButton>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] uppercase mb-2 flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5" /> Which Types of Show Notifications?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                const isAll = selectedTypes.includes("all");
                                const activeTypeSet = new Set(selectedTypes);
                                return SHOW_TYPES.map((type) => {
                                    const isSelected = isAll || activeTypeSet.has(type.id);
                                    return (
                                        /* eslint-disable-next-line react-doctor/duplicate-jsx-subtree */
                                        <FoolishShrimpButton
 key={type.id}
 type="button"
 onClick={() => toggleType(type.id)}
                                            isActive={isSelected}
                                            className="!w-auto inline-flex items-center gap-1.5 px-2.5 py-2 text-xs">
                                            <span>{type.label}</span>

                                        </FoolishShrimpButton>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                <div className="mb-5 flex items-center gap-3 cursor-pointer select-none relative z-10" onClick={() => setAgreeTerms(!agreeTerms)}>
                    <SquishyToggle id="footer-agree-terms" label="Agree to terms and privacy policy" checked={agreeTerms} onChange={setAgreeTerms} />
                    <span className="text-white font-medium">
                        I agree to the <Link href="/terms" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Terms</Link> and <Link href="/privacy" className="underline hover:text-white" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
                    </span>
                </div>

                <div className="pt-5 border-t border-white/10 flex flex-col items-start justify-start gap-3 relative z-10">
                    {permission === "granted" ? (
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 uppercase whitespace-nowrap shrink-0">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Push Enabled
                            </span>
                            <CosmicRadialButton
 icon={false}
 onClick={handleSavePrefs}
 disabled={isBusy}
 className="!px-6 !py-3 !text-xs ! uppercase rounded-lg shrink-0 cursor-pointer transition-all disabled:opacity-60 whitespace-nowrap flex-nowrap">
                                <span className="flex items-center justify-center gap-2 whitespace-nowrap flex-nowrap shrink-0">
                                    {status === "saving" ? (
                                        <span className="w-4 h-4 border-2 border-white/10 border-t-white rounded-lg animate-spin inline-block shrink-0" />
                                    ) : status === "saved" ? (
                                        <><Check className="w-4 h-4 text-emerald-300 shrink-0" /> <span className="whitespace-nowrap">Saved!</span></>
                                    ) : (
                                        <span className="whitespace-nowrap">Save Preferences</span>
                                    )}
                                </span>
                            </CosmicRadialButton>
                        </div>
                    ) : (
                        <CosmicRadialButton
 icon={false}
 onClick={handleEnableAlerts}
 disabled={isBusy || permission === "denied"}
 className="!px-6 !py-3.5 !text-xs ! uppercase rounded-lg shrink-0 cursor-pointer transition-all disabled:opacity-60 whitespace-nowrap flex-nowrap">
                            <span className="flex items-center justify-center gap-2 whitespace-nowrap flex-nowrap shrink-0">
                                {status === "saving" ? (
                                    <span className="w-4 h-4 border-2 border-white/10 border-t-white rounded-lg animate-spin inline-block shrink-0" />
                                ) : status === "saved" ? (
                                    <><Check className="w-4 h-4 text-emerald-300 shrink-0" /> <span className="whitespace-nowrap">Preferences Saved!</span></>
                                ) : (
                                    <>
                                        <Bell className="w-4 h-4 text-amber-300 shrink-0" />
                                        <span className="whitespace-nowrap">ENABLE ALERTS ({radius === "all" ? "ALL SHOWS" : `${radius} MI`})</span>
                                    </>
                                )}
                            </span>
                        </CosmicRadialButton>
                    )}

                    <p className="uppercase text-xs text-white/70 tracking-wide ">
                        {permission === "granted"
                            ? "Your notifications are enabled. Update filters above and save anytime."
                            : "Click to enable instant browser & proximity alerts for nearby shows."}
                    </p>
                </div>
            </div>
        </div>
    );
}
