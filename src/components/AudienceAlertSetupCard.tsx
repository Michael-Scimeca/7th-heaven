"use client";

import React, { useState, useEffect } from "react";
import { Bell, Shield, Smartphone, Mail, Check, Radio, Moon, Sparkles, Send } from "lucide-react";
import { Toggle } from "@/components/Toggle";
import GlowInput from "@/components/GlowInput";
import SeventhButton from "@/components/SeventhButton";
import { InstallAppButton } from "@/components/InstallAppButton";

export interface AudienceAlertSetupCardProps {
  audience: "crew" | "band" | "planner" | "fan";
  title?: string;
  subtitle?: string;
  className?: string;
  bookingId?: string; // For planner-specific alerts
}

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc";

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
async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/** Create a new browser push subscription */
async function createPushSubscription(): Promise<PushSubscription | null> {
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

export function AudienceAlertSetupCard({
  audience,
  title,
  subtitle,
  className = "",
  bookingId,
}: AudienceAlertSetupCardProps) {
  const [webPushEnabled, setWebPushEnabled] = useState(false);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Default labels based on audience
  const defaultTitle =
    title ||
    (audience === "crew"
      ? "Crew Alert & Schedule Notifications"
      : audience === "band"
        ? "Band Member Show & Tour Alerts"
        : audience === "planner"
          ? "Event Planner Real-Time Booking Updates"
          : "Fan Show & Tour Alerts");

  const defaultSubtitle =
    subtitle ||
    (audience === "crew"
      ? "Receive instant lock-screen alerts for load-in times, setlist changes, and emergency updates at no cost."
      : audience === "band"
        ? "Get notified of itinerary updates, soundcheck schedules, and VIP requests."
        : audience === "planner"
          ? "Stay updated on rider status, contract confirmations, and day-of-show logistics for your event."
          : "Never miss a show near you. Instant push alerts and email notices.");

  // Check current browser push status
  useEffect(() => {
    let active = true;
    getExistingPushSubscription().then((sub) => {
      if (active && sub) {
        setWebPushEnabled(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleWebPushToggle = async (checked: boolean) => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setStatusMessage("Push notifications are not supported by this browser.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      if (checked) {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatusMessage("Permission denied. Please enable notifications in your browser settings.");
          setWebPushEnabled(false);
          setLoading(false);
          return;
        }

        const sub = await createPushSubscription();
        if (!sub) {
          throw new Error("Could not initialize service worker push subscription.");
        }

        const subJson = sub.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
            audience,
            email: email || undefined,
            quietHoursStart: quietHoursEnabled ? quietStart : undefined,
            quietHoursEnd: quietHoursEnabled ? quietEnd : undefined,
          }),
        });

        setWebPushEnabled(true);
        setStatusMessage("✅ Browser push notifications enabled!");
      } else {
        // Unsubscribe
        const sub = await getExistingPushSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
        setWebPushEnabled(false);
        setStatusMessage("Push notifications disabled.");
      }
    } catch (err: any) {
      console.error("[push] toggle error:", err);
      setStatusMessage(`Error: ${err.message || "Failed to update notification settings"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification("7th Heaven Live Alert", {
          body: `Test notification for ${audience} group! Everything is working cleanly.`,
          icon: "/icon-192.png",
          badge: "/badge.png",
          tag: "test-alert",
        });
        setStatusMessage("🔔 Test alert sent to your device!");
      }
    } catch (err: any) {
      setStatusMessage("Failed to trigger local notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-start gap-3">

          <div className="text-left">
            <h3 className="text-white text-left">{defaultTitle}</h3>
            <p className="text-xs text-white/60 mt-0.5 text-left">{defaultSubtitle}</p>
          </div>
        </div>
        <div className="shrink-0">
          <InstallAppButton variant="compact" />
        </div>
      </div>

      {/* Controls */}
      <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Browser Web Push Toggle */}
        <div className="flex items-center justify-between rounded-[var(--radius-box)] border border-white/10 bg-[#00000029] p-4">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Browser & Lock-Screen Push</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300">
                  FREE · INSTANT
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Delivers immediate updates even when your browser is in the background.
              </p>
            </div>
          </div>
          <Toggle
            id={`webpush-toggle-${audience}`}
            size="md"
            checked={webPushEnabled}
            disabled={loading}
            onChange={handleWebPushToggle}
          />
        </div>

        {/* Quiet Hours Configuration */}
        <div className="flex flex-col justify-center rounded-[var(--radius-box)] border border-white/10 bg-[#00000029] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-white">Quiet Hours</span>
                <p className="text-xs text-white/50">Mute non-urgent alerts during specified hours</p>
              </div>
            </div>
            <Toggle
              id={`quiet-hours-toggle-${audience}`}
              size="md"
              checked={quietHoursEnabled}
              onChange={setQuietHoursEnabled}
            />
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Do Not Disturb Starts</label>
                <GlowInput
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Do Not Disturb Ends</label>
                <GlowInput
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-200">
            {statusMessage}
          </div>
        )}

        {/* Action button bar */}
        <div className="flex items-center justify-between pt-2">
          {webPushEnabled ? (
            <button
              type="button"
              onClick={handleSendTestPush}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Test Notification</span>
            </button>
          ) : (
            <span className="text-xs text-white/40">Toggle push above to enable instant alerts</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AudienceAlertSetupCard;
