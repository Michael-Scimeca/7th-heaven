"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Smartphone,
  Laptop,
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Calendar,
} from "lucide-react";
import { DotChevronRight } from "@/components/ui/DotArrow";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Stack } from "@/components/Stack";
import { Toggle } from "@/components/Toggle";

interface BroadcastScenario {
  id: string;
  name: string;
  badge: string;
  icon: string;
  urgent: boolean;
  category: "shows" | "weather" | "tickets" | "cruise";
  showName: string;
  showDate: string;
  venue: string;
  city: string;
  title: string;
  body: string;
  ctaText: string;
  targetAudience: string;
  estimatedReach: number;
}

const PRESET_SCENARIOS: BroadcastScenario[] = [
  {
    id: "weather-move",
    name: "⛈️ Weather Venue Move",
    badge: "Urgent Show Alert",
    icon: "⛈️",
    urgent: true,
    category: "weather",
    showName: "Taste of Joliet Summer Fest",
    showDate: "Tonight • Saturday, July 18",
    venue: "Memorial Stadium (Moved to Indoor Fieldhouse)",
    city: "Joliet, IL",
    title: "⚡ TONIGHT'S SHOW MOVED INDOORS — STAGE TIME 8:30 PM",
    body: "Severe thunderstorm watch in Will County. 7th Heaven is moved into the air-conditioned Joliet Fieldhouse! Full sound, full lights, zero rain. Doors at 7:00 PM.",
    ctaText: "Get Fieldhouse Parking & Map",
    targetAudience: "Fans within 45 miles of Joliet, IL",
    estimatedReach: 4850,
  },
  {
    id: "cruise-cabin",
    name: "🚢 2028 Caribbean Cruise Booking",
    badge: "Band Cruise Update",
    icon: "🚢",
    urgent: false,
    category: "cruise",
    showName: "7th Heaven 7-Night Caribbean Cruise",
    showDate: "Feb 14 - 21, 2028",
    venue: "Royal Caribbean • Legend of the Seas",
    city: "Miami & Western Caribbean",
    title: "🚢 2028 CRUISE CABINS ARE OFFICIALLY LIVE",
    body: "Oceanview and Balcony staterooms for our 2028 rock cruise just opened! 4 private band concerts, Q&A acoustic jam, fan trivia, and beach party in Cozumel.",
    ctaText: "View Itinerary & Book Cabin",
    targetAudience: "Cruise Club & Fan Registry",
    estimatedReach: 6890,
  },
  {
    id: "surprise-encore",
    name: "🎸 Pop-up Acoustic Set",
    badge: "Live Stage Alert",
    icon: "🎸",
    urgent: false,
    category: "shows",
    showName: "Woodfield Acoustic Session",
    showDate: "Today • 5:00 PM",
    venue: "Main Square Plaza",
    city: "Schaumburg, IL",
    title: "🎸 POP-UP ACOUSTIC MINI-SET ANNOUNCED",
    body: "Surprise! Richard and Anthony are doing an unannounced 45-minute acoustic set before tonight's arena concert. Completely free, all ages welcome.",
    ctaText: "View Stage Location",
    targetAudience: "Fans within 25 miles of Schaumburg, IL",
    estimatedReach: 2740,
  },
];

export default function PushUpdatesShowcasePage() {
  const [selectedScenario, setSelectedScenario] = useState<BroadcastScenario>(
    PRESET_SCENARIOS[0],
  );
  const [previewTab, setPreviewTab] = useState<"phone" | "desktop" | "email">(
    "phone",
  );
  const [recipientEmail, setRecipientEmail] = useState("fan@7thheavenband.com");
  const [recipientZip, setRecipientZip] = useState("60435");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isUrgent, setIsUrgent] = useState(selectedScenario.urgent);

  // Live simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [dispatchComplete, setDispatchComplete] = useState(false);
  const [dispatchLog, setDispatchLog] = useState<{
    pushDelivered: number;
    emailsQueued: number;
    timestamp: string;
  } | null>(null);

  // Live real test email state
  const [realTestEmail, setRealTestEmail] = useState("");
  const [realTestSending, setRealTestSending] = useState(false);
  const [realTestStatus, setRealTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSelectScenario = (scenario: BroadcastScenario) => {
    setSelectedScenario(scenario);
    setIsUrgent(scenario.urgent);
    setDispatchComplete(false);
    setDispatchLog(null);
  };

  const handleSimulateBroadcast = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setDispatchComplete(false);

    setTimeout(() => {
      setIsSimulating(false);
      setDispatchComplete(true);
      setDispatchLog({
        pushDelivered: pushEnabled
          ? Math.round(selectedScenario.estimatedReach * 0.78)
          : 0,
        emailsQueued: emailEnabled ? selectedScenario.estimatedReach : 0,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    }, 1100);
  };

  const handleSendRealTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (realTestSending || !realTestEmail) return;

    setRealTestSending(true);
    setRealTestStatus(null);

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: realTestEmail,
          subject: `[7th Heaven Alert] ${selectedScenario.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #0c0919; color: #ffffff; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.15);">
              <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #c084fc; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">7th Heaven Official</h1>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Instant Fan Notification & Tour Update</p>
              </div>
              <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #a855f7;">
                <span style="background: #a855f7; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">${selectedScenario.badge}</span>
                <h2 style="color: #ffffff; font-size: 18px; margin: 12px 0 8px 0;">${selectedScenario.title}</h2>
                <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">${selectedScenario.body}</p>
                <div style="font-size: 13px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
                  <div>📅 <strong>${selectedScenario.showDate}</strong></div>
                  <div>📍 <strong>${selectedScenario.venue} (${selectedScenario.city})</strong></div>
                </div>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
                You are receiving this update because you subscribed to 7th Heaven show notifications. 1-click instant unsubscribe included in all automated fan mailers.
              </p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRealTestStatus({
            success: true,
            message: `Real test update delivered to ${realTestEmail}! Check your inbox.`,
          });
        } else {
          setRealTestStatus({
            success: false,
            message: data.error || "Failed to dispatch test email.",
          });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setRealTestStatus({
          success: false,
          message: err.error || `HTTP error code ${res.status}`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred";
      setRealTestStatus({ success: false, message: msg });
    } finally {
      setRealTestSending(false);
    }
  };

  return (
    <main className="min-h-screen text-white bg-transparent flex flex-col pt-24 pb-20">
      {/* ── Page Hero ── */}
      <header className="site-container flex flex-col items-center text-center max-w-4xl mx-auto pt-6 pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1.5 text-xs font-semibold text-purple-300 shadow-xs backdrop-blur-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Real-time Fan Communication System</span>
        </div>

        {/* heading-size-ok: Hero display headline with drop shadow */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
          How 7th Heaven Pushes Instant Notifications &amp; Email Updates
        </h1>

        <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
          See how our multi-channel notification engine instantly reaches fans who provided their email address or granted Web Push permissions — keeping thousands informed of weather moves, ticket presales, and live concert announcements.
        </p>

        {/* Feature stats counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-10">
          <div className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-box)] border border-white/10 bg-black/30 backdrop-blur-md shadow-xl">
            <span className="text-2xl font-black text-purple-400">&lt; 500ms</span>
            <span className="text-xs text-zinc-400 mt-1">Web Push Latency</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-box)] border border-white/10 bg-black/30 backdrop-blur-md shadow-xl">
            <span className="text-2xl font-black text-amber-400">Dual-Channel</span>
            <span className="text-xs text-zinc-400 mt-1">Push + Email Sync</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-box)] border border-white/10 bg-black/30 backdrop-blur-md shadow-xl">
            <span className="text-2xl font-black text-cyan-400">Proximity</span>
            <span className="text-xs text-zinc-400 mt-1">ZIP Radius Targeting</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-box)] border border-white/10 bg-black/30 backdrop-blur-md shadow-xl">
            <span className="text-2xl font-black text-emerald-400">Zero-Spam</span>
            <span className="text-xs text-zinc-400 mt-1">Quiet Hours &amp; RLS</span>
          </div>
        </div>
      </header>

      {/* ── Interactive Live Simulator Section ── */}
      <PageSection id="simulator" size="lg" aria-labelledby="simulator-heading">
        <SectionHeader
          id="simulator-heading"
          title="Interactive Live Dispatch Simulator"
          subtitle="Select a scenario, adjust target parameters, and observe the live delivery preview across mobile lock-screens, desktop notifications, and email inboxes."
          badge="Live Demo"
          icon={Send}
        />

        <Stack gap="lg" className="w-full">
          {/* Preset Scenario Selector Bar */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Band Update Scenario
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario.id === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectScenario(scenario)}
                    className={`flex flex-col items-start p-4 rounded-[var(--radius-box)] border text-left transition-colors duration-150 ${
                      isSelected
                        ? "border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-500/20"
                        : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-bold text-white">
                        {scenario.name}
                      </span>
                      {scenario.urgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          URGENT
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 line-clamp-1">
                      {scenario.venue}
                    </span>
                    <span className="text-[11px] text-purple-300 font-mono mt-2">
                      Reach: ~{scenario.estimatedReach.toLocaleString()} fans
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulator Studio Layout: Left Controls + Right Live Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Panel (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">
                    Broadcast Dispatcher
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Target: {selectedScenario.targetAudience}
                </span>
              </div>

              {/* Show & Venue Summary */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Show Event:</span>
                  <span className="text-white font-semibold">
                    {selectedScenario.showName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date &amp; Time:</span>
                  <span className="text-purple-300 font-semibold">
                    {selectedScenario.showDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Venue &amp; City:</span>
                  <span className="text-zinc-200">
                    {selectedScenario.venue}, {selectedScenario.city}
                  </span>
                </div>
              </div>

              {/* Dispatch Channel Toggles */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-zinc-300">
                  Active Dispatch Channels
                </span>

                <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">
                        Web Push Notification
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Instant mobile &amp; browser popup (&lt;500ms)
                      </span>
                    </div>
                  </div>
                  <Toggle
                    checked={pushEnabled}
                    onChange={setPushEnabled}
                    size="sm"
                    label="Toggle Web Push"
                    hideLabel
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">
                        Email Newsletter Update
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Rich HTML template with ticket CTA &amp; map
                      </span>
                    </div>
                  </div>
                  <Toggle
                    checked={emailEnabled}
                    onChange={setEmailEnabled}
                    size="sm"
                    label="Toggle Email Newsletter"
                    hideLabel
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-950/20">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-rose-200">
                        High Priority Flag
                      </span>
                      <span className="text-[11px] text-rose-300/70">
                        Bypasses quiet hours for weather &amp; moves
                      </span>
                    </div>
                  </div>
                  <Toggle
                    checked={isUrgent}
                    onChange={setIsUrgent}
                    size="sm"
                    label="Toggle Urgency"
                    hideLabel
                  />
                </div>
              </div>

              {/* Fan Subscriber Input Simulation */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-zinc-300">
                  Simulate Individual Fan Recipient
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label
                      htmlFor="test-recipient-email"
                      className="text-[11px] text-zinc-400"
                    >
                      Fan Email Address
                    </label>
                    <input
                      id="test-recipient-email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs font-mono text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="test-recipient-zip"
                      className="text-[11px] text-zinc-400"
                    >
                      Fan ZIP
                    </label>
                    <input
                      id="test-recipient-zip"
                      type="text"
                      value={recipientZip}
                      onChange={(e) => setRecipientZip(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs font-mono text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                type="button"
                disabled={isSimulating || (!pushEnabled && !emailEnabled)}
                onClick={handleSimulateBroadcast}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-[opacity,transform] duration-150 disabled:opacity-50 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Broadcasting to {selectedScenario.estimatedReach.toLocaleString()} Fans...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Simulate Live Fan Dispatch</span>
                  </>
                )}
              </button>

              {/* Dispatch Complete Toast */}
              {dispatchComplete && dispatchLog && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Broadcast Sent at {dispatchLog.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 flex flex-col gap-0.5 font-mono">
                    <span>
                      • Web Push Notifications: {dispatchLog.pushDelivered.toLocaleString()} active devices
                    </span>
                    <span>
                      • HTML Emails Queued: {dispatchLog.emailsQueued.toLocaleString()} inbox dispatches
                    </span>
                    <span>• Status: Delivered with zero bounce reports</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Live Preview Tabs (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Preview Format Tab Switcher */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Live Recipient Preview
                </span>

                <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("phone")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      previewTab === "phone"
                        ? "bg-purple-600 text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Lock-Screen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab("desktop")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      previewTab === "desktop"
                        ? "bg-purple-600 text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Desktop Popup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab("email")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      previewTab === "email"
                        ? "bg-purple-600 text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Newsletter</span>
                  </button>
                </div>
              </div>

              {/* ── View 1: Mobile Lockscreen Mockup ── */}
              {previewTab === "phone" && (
                <div className="flex items-center justify-center p-4 rounded-[var(--radius-box)] border border-white/10 bg-black/50 backdrop-blur-md">
                  <div className="relative w-full max-w-[320px] aspect-[9/18.5] rounded-[44px] border-[6px] border-zinc-700 bg-gradient-to-b from-zinc-950 via-purple-950/60 to-zinc-950 p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
                    {/* Phone Notch */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700" />
                    </div>

                    {/* Clock & Status */}
                    <div className="flex flex-col items-center text-center pt-10 select-none">
                      <span className="text-5xl font-light text-white tracking-tight">
                        8:14
                      </span>
                      <span className="text-xs text-zinc-300 font-medium mt-1">
                        Saturday, July 18
                      </span>
                    </div>

                    {/* Push Notification Card on Lock-Screen */}
                    <div className="my-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
                      <div className="flex flex-col rounded-2xl border border-white/20 bg-black/75 p-3.5 shadow-2xl backdrop-blur-xl text-left">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-purple-600 text-[10px] font-black text-white">
                              7H
                            </span>
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                              7th Heaven
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            now
                          </span>
                        </div>

                        <span className="text-xs font-bold text-purple-200 leading-snug">
                          {selectedScenario.title}
                        </span>

                        <p className="text-[11px] text-zinc-300 line-clamp-3 mt-1 leading-relaxed">
                          {selectedScenario.body}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-purple-300 font-semibold">
                          <span>Tap to open live tour details</span>
                          <DotChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    {/* Phone Bottom Bar */}
                    <div className="flex items-center justify-center pb-1">
                      <div className="w-32 h-1 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── View 2: Desktop Browser Notification Banner ── */}
              {previewTab === "desktop" && (
                <div className="flex flex-col items-center justify-center p-6 rounded-[var(--radius-box)] border border-white/10 bg-black/50 backdrop-blur-md min-h-[380px]">
                  <div className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-2xl flex flex-col gap-3 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md">
                          7H
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">
                            7th Heaven Official Tour Alert
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            7thheavenband.com • now
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold">
                        {selectedScenario.badge}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {/* heading-size-ok: In-mock notification card title */}
                      <h3 className="text-sm font-bold text-purple-100">
                        {selectedScenario.title}
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {selectedScenario.body}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition shadow-xs"
                      >
                        {selectedScenario.ctaText}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── View 3: Rich Email Inbox Newsletter ── */}
              {previewTab === "email" && (
                <div className="flex flex-col rounded-[var(--radius-box)] border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden shadow-2xl">
                  {/* Email Client Header Chrome */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-4 py-2.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono text-[11px] text-zinc-400">
                        Inbox: {recipientEmail}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-purple-300">
                      via Resend &bull; 100% DKIM Signed
                    </span>
                  </div>

                  {/* Rendered Email Body */}
                  <div className="p-6 flex flex-col gap-4 text-zinc-200">
                    <div className="border-b border-white/10 pb-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400">
                          From: 7th Heaven &lt;updates@7thheavenband.com&gt;
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Just now
                        </span>
                      </div>
                      {/* heading-size-ok: In-mock email subject title */}
                      <h3 className="text-base font-bold text-white">
                        {selectedScenario.title}
                      </h3>
                    </div>

                    {/* Email Card Template */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-base font-black tracking-widest text-purple-400 uppercase">
                          7th Heaven
                        </span>
                        <span className="rounded-full bg-purple-500/20 text-purple-300 px-2.5 py-0.5 text-xs font-bold">
                          {selectedScenario.badge}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-200 leading-relaxed">
                        Hey 7th Heaven Fan,
                      </p>

                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {selectedScenario.body}
                      </p>

                      {/* Event Details Box */}
                      <div className="rounded-lg border border-white/10 bg-black/40 p-3.5 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{selectedScenario.showDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>
                            {selectedScenario.venue} &bull; {selectedScenario.city}
                          </span>
                        </div>
                      </div>

                      {/* Call to Action Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-opacity duration-150"
                        >
                          <span>{selectedScenario.ctaText}</span>
                          <DotChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-500 border-t border-white/10 pt-3 flex flex-col gap-1">
                      <span>
                        Sent to {recipientEmail} because you opted in to tour alerts for ZIP {recipientZip}.
                      </span>
                      <span>
                        7th Heaven Band &bull; Chicago, IL &bull; 1-click instant unsubscribe &bull; Privacy policy
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Stack>
      </PageSection>

      {/* ── How the Fan Communication Pipeline Works ── */}
      <PageSection id="pipeline" size="md" aria-labelledby="pipeline-heading">
        <SectionHeader
          id="pipeline-heading"
          title="The 4-Step Fan Communication Pipeline"
          subtitle="How a fan's email turns into instant concert notices, emergency weather moves, and VIP presales."
          badge="Architecture"
          icon={Radio}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 font-black text-sm">
              01
            </div>
            {/* heading-size-ok: Pipeline step card title */}
            <h3 className="text-base font-bold text-white">Fan Email Capture</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Fans submit their email and optional ZIP code at shows via QR code, online ticket reservation, fan wall, or the website newsletter box.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 font-black text-sm">
              02
            </div>
            {/* heading-size-ok: Pipeline step card title */}
            <h3 className="text-base font-bold text-white">Geofenced Radius Filter</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              When a show in Milwaukee or Joliet has an update, the database automatically filters fans within a 35–50 mile radius so fans in distant states aren&apos;t spammed.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 font-black text-sm">
              03
            </div>
            {/* heading-size-ok: Pipeline step card title */}
            <h3 className="text-base font-bold text-white">1-Click Admin Dispatch</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              From the mobile admin dashboard, band management types the update (or picks a weather template) and taps broadcast.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 font-black text-sm">
              04
            </div>
            {/* heading-size-ok: Pipeline step card title */}
            <h3 className="text-base font-bold text-white">Dual Instant Delivery</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Mobile phones buzz instantly with lockscreen web push, while formatted HTML emails land in inboxes with full map links and calendar invites.
            </p>
          </div>
        </div>
      </PageSection>

      {/* ── Test a Real Email Dispatch Live ── */}
      <PageSection id="real-test" size="md" aria-labelledby="real-test-heading">
        <SectionHeader
          id="real-test-heading"
          title="Send a Live Test Email to Your Inbox"
          subtitle="Test the live server email dispatcher right now by entering your own email address."
          badge="Live Dispatch Test"
          icon={Mail}
        />

        <div className="max-w-2xl mx-auto rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSendRealTestEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="real-email-input" className="text-xs font-semibold text-zinc-300">
                Enter Your Email Address
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="real-email-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={realTestEmail}
                  onChange={(e) => setRealTestEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={realTestSending || !realTestEmail}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition disabled:opacity-50 cursor-pointer"
                >
                  {realTestSending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Real Test Update</span>
                    </>
                  )}
                </button>
              </div>
              <span className="text-[11px] text-zinc-400">
                Sends the currently active scenario ({selectedScenario.name}) directly to your inbox via our live email server.
              </span>
            </div>

            {realTestStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium ${
                  realTestStatus.success
                    ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                    : "border-rose-500/30 bg-rose-950/40 text-rose-300"
                }`}
              >
                {realTestStatus.message}
              </div>
            )}
          </form>
        </div>
      </PageSection>

      {/* ── Privacy & Anti-Spam Standards ── */}
      <PageSection id="compliance" size="sm" aria-labelledby="compliance-heading">
        <SectionHeader
          id="compliance-heading"
          title="Subscriber Privacy &amp; Anti-Fatigue Standards"
          subtitle="Every broadcast adheres to strict fan privacy rules and email deliverability safeguards."
          badge="Trust &amp; Security"
          icon={ShieldCheck}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-5">
            <span className="text-sm font-bold text-white">
              🔒 Supabase Row-Level Security
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Subscriber email addresses and push tokens are isolated behind strict service-role permissions (Migration 023). Public clients cannot read subscriber lists.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-5">
            <span className="text-sm font-bold text-white">
              🌙 Automatic Quiet Hours
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Non-urgent alerts automatically queue between 10:00 PM and 8:00 AM local time to prevent waking fans, unless flagged as an urgent weather evacuation.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-5">
            <span className="text-sm font-bold text-white">
              ⚡ 1-Click Unsubscribe
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full CAN-SPAM and GDPR compliance. Fans can unsubscribe or change notification categories (shows only, cruise only) with a single tap.
            </p>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
