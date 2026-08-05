"use client";

import React, { useState, useMemo } from "react";

interface TourShow {
  date: string;
  venue: string;
  city?: string;
  time?: string;
}

interface EmergencyBroadcastCenterProps {
  tourDates?: TourShow[];
}

export function EmergencyBroadcastCenter({ tourDates = [] }: EmergencyBroadcastCenterProps) {
  const [selectedShowDate, setSelectedShowDate] = useState<string>("");
  const [alertType, setAlertType] = useState<"cancellation" | "time_change" | "venue_change" | "announcement">("cancellation");
  const [targetAudience, setTargetAudience] = useState<"all_fans" | "show_fans" | "crew_and_band">("all_fans");
  
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendDashboardBanner, setSendDashboardBanner] = useState(true);

  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const selectedShow = useMemo(() => {
    return tourDates.find(s => s.date === selectedShowDate) || tourDates[0] || {
      date: "2026-06-04",
      venue: "Broken Oar",
      city: "P. Barrington",
      time: "4:00 PM",
    };
  }, [tourDates, selectedShowDate]);

  // Apply Preset Templates based on selected show & alert type
  const activeTitle = customTitle || (
    alertType === "cancellation" ? `🚨 SHOW CANCELLED: ${selectedShow.venue}` :
    alertType === "time_change" ? `⏰ TIME CHANGE: ${selectedShow.venue}` :
    alertType === "venue_change" ? `📍 VENUE UPDATE: ${selectedShow.venue}` :
    `🎟️ SPECIAL NOTICE: ${selectedShow.venue}`
  );

  const activeBody = customBody || (
    alertType === "cancellation"
      ? `ALERT: 7th Heaven show at ${selectedShow.venue} (${selectedShow.city || 'IL'}) on ${selectedShow.date} has been CANCELLED due to severe weather/emergency. Refunds will be issued automatically. Stay safe!`
      : alertType === "time_change"
      ? `TIME UPDATE: 7th Heaven performance at ${selectedShow.venue} on ${selectedShow.date} has been moved up to ${selectedShow.time || '5:00 PM'}. Doors open early at 4:00 PM!`
      : alertType === "venue_change"
      ? `LOCATION UPDATE: 7th Heaven performance on ${selectedShow.date} has been relocated to ${selectedShow.venue} (${selectedShow.city || 'IL'}). All existing tickets remain valid.`
      : `SPECIAL NOTICE: Exclusive VIP meet & greet upgrades for 7th Heaven at ${selectedShow.venue} on ${selectedShow.date} are now live on the fan dashboard!`
  );

  // Recipient Count Calculation
  const recipientCount = targetAudience === "all_fans" ? 1482 : targetAudience === "show_fans" ? 284 : 42;

  // Twilio & Email Cost Calculations
  const smsLength = activeBody.length;
  const smsSegments = Math.max(1, Math.ceil(smsLength / 160));
  const smsRatePerSegment = 0.0079; // Twilio US SMS rate
  const emailRatePerMsg = 0.001; // Email dispatch rate

  const estimatedSmsCost = sendSms ? recipientCount * smsSegments * smsRatePerSegment : 0;
  const estimatedEmailCost = sendEmail ? recipientCount * emailRatePerMsg : 0;
  const totalEstimatedCost = estimatedSmsCost + estimatedEmailCost;

  const handleApplyPreset = (type: "cancellation" | "time_change" | "venue_change" | "announcement") => {
    setAlertType(type);
    setCustomTitle("");
    setCustomBody("");
  };

  const handleDispatch = async () => {
    setIsSending(true);
    setDispatchResult(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showName: selectedShow.venue,
          showDate: selectedShow.date,
          alertType,
          messageTitle: activeTitle,
          messageBody: activeBody,
          channels: {
            sms: sendSms,
            email: sendEmail,
            dashboardBanner: sendDashboardBanner,
          },
          targetAudience,
          recipientCount,
        }),
      });

      const data = await res.json();
      setDispatchResult(data);
    } catch (err: any) {
      setDispatchResult({ error: err.message || "Failed to dispatch broadcast" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-5 bg-[var(--card-bg)] border-t border-[var(--border-color)] space-y-4 text-[var(--text-color)] font-sans">
      
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-black/30 border border-[var(--border-color)] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-rose-400 block">Target Audience</span>
            <span className="text-[11px] font-black text-[var(--text-color)]">{recipientCount.toLocaleString()} Subscribers</span>
          </div>
          <span className="text-sm">📢</span>
        </div>

        <div className="p-2.5 bg-black/30 border border-[var(--border-color)] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-purple-300 block">SMS Length & Segments</span>
            <span className="text-[11px] font-black text-[var(--text-color)]">{smsLength} Chars ({smsSegments} Segments)</span>
          </div>
          <span className="text-sm">📱</span>
        </div>

        <div className="p-2.5 bg-black/30 border border-[var(--border-color)] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-accent)] block">Twilio SMS Rate</span>
            <span className="text-[11px] font-black text-[var(--text-color)]">${estimatedSmsCost.toFixed(2)} (${smsRatePerSegment}/msg)</span>
          </div>
          <span className="text-sm">💳</span>
        </div>

        <div className="p-2.5 bg-black/30 border border-[var(--border-color)] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 block">Total Est. Campaign Cost</span>
            <span className="text-[11px] font-black text-emerald-400">${totalEstimatedCost.toFixed(2)}</span>
          </div>
          <span className="text-sm">💵</span>
        </div>
      </div>

      {/* Preset Alert Type Selector */}
      <div>
        <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
          1. Quick Alert Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset("cancellation")}
            className={`p-2 rounded-lg border text-[10px] font-black text-left transition-all cursor-pointer ${
              alertType === "cancellation"
                ? "bg-rose-600 border-rose-600 text-white shadow-md"
                : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)] hover:bg-black/50 hover:text-[var(--text-color)]"
            }`}
          >
            🚨 Show Cancelled
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("time_change")}
            className={`p-2 rounded-lg border text-[10px] font-black text-left transition-all cursor-pointer ${
              alertType === "time_change"
                ? "bg-purple-700 border-purple-600 text-white shadow-md"
                : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)] hover:bg-black/50 hover:text-[var(--text-color)]"
            }`}
          >
            ⏰ Time Moved Up
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("venue_change")}
            className={`p-2 rounded-lg border text-[10px] font-black text-left transition-all cursor-pointer ${
              alertType === "venue_change"
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md"
                : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)] hover:bg-black/50 hover:text-[var(--text-color)]"
            }`}
          >
            📍 Venue Changed
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("announcement")}
            className={`p-2 rounded-lg border text-[10px] font-black text-left transition-all cursor-pointer ${
              alertType === "announcement"
                ? "bg-cyan-600 border-cyan-600 text-white shadow-md"
                : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)] hover:bg-black/50 hover:text-[var(--text-color)]"
            }`}
          >
            🎟️ VIP / Special Alert
          </button>
        </div>
      </div>

      {/* Show & Audience Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Target Show Selector */}
        <div>
          <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
            2. Target Show Date / Venue
          </label>
          <select
            value={selectedShowDate}
            onChange={(e) => setSelectedShowDate(e.target.value)}
            className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11px] font-bold text-[var(--text-color)] focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {tourDates.map((s, idx) => (
              <option key={idx} value={s.date} className="bg-zinc-900 text-white font-semibold">
                {s.date} — {s.venue} ({s.city || 'IL'})
              </option>
            ))}
          </select>
        </div>

        {/* Target Audience Selector */}
        <div>
          <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
            3. Target Audience
          </label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value as any)}
            className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11px] font-bold text-[var(--text-color)] focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all_fans" className="bg-zinc-900 text-white font-semibold">📢 All Opted-In SMS & Email Fan Subscribers (1,482 Subscribers)</option>
            <option value="show_fans" className="bg-zinc-900 text-white font-semibold">📍 Fans Registered for {selectedShow.venue} (284 Fans)</option>
            <option value="crew_and_band" className="bg-zinc-900 text-white font-semibold">👥 Active Band & Crew Roster (42 Members)</option>
          </select>
        </div>
      </div>

      {/* Notification Delivery Channels */}
      <div>
        <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
          4. Delivery Channels & Cost Estimator
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div
            onClick={() => setSendSms(!sendSms)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              sendSms ? "bg-[var(--color-purple-glow)] border-[var(--color-border-purple)] text-[var(--text-color)] shadow-xs" : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={sendSms} onChange={() => {}} className="accent-amber-500 w-3.5 h-3.5" />
              <div>
                <span className="text-[10px] font-black text-[var(--text-color)] block">📱 Twilio SMS Alert</span>
                <span className="text-[9px] text-[var(--muted-text)] font-mono font-bold">${estimatedSmsCost.toFixed(2)} total</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSendEmail(!sendEmail)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              sendEmail ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-[var(--text-color)] shadow-xs" : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={sendEmail} onChange={() => {}} className="accent-purple-500 w-3.5 h-3.5" />
              <div>
                <span className="text-[10px] font-black text-[var(--text-color)] block">📧 Email Broadcast</span>
                <span className="text-[9px] text-[var(--muted-text)] font-mono font-bold">${estimatedEmailCost.toFixed(2)} total</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSendDashboardBanner(!sendDashboardBanner)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              sendDashboardBanner ? "bg-cyan-500/15 border-cyan-500/40 text-[var(--text-color)] shadow-xs" : "bg-black/30 border border-[var(--border-color)] text-[var(--muted-text)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={sendDashboardBanner} onChange={() => {}} className="accent-cyan-500 w-3.5 h-3.5" />
              <div>
                <span className="text-[10px] font-black text-[var(--text-color)] block">🔔 Fan Wall Banner</span>
                <span className="text-[9px] text-[var(--muted-text)] font-mono font-bold">Free ($0.00)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Message Text & Live iPhone SMS Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Custom Message Inputs */}
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1">
              Message Title / Header
            </label>
            <input
              type="text"
              value={customTitle !== "" ? customTitle : activeTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. 🚨 SHOW CANCELLED: Broken Oar"
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11px] text-[var(--text-color)] font-bold placeholder:text-[var(--muted-text)] outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider">
                SMS & Alert Body Text
              </label>
              <span className="text-[9px] font-mono font-bold text-purple-300">
                {smsLength} / 160 chars ({smsSegments} segment{smsSegments > 1 ? "s" : ""})
              </span>
            </div>
            <textarea
              rows={3}
              value={customBody !== "" ? customBody : activeBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="Write your emergency broadcast message text..."
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg p-2.5 text-[11px] text-[var(--text-color)] font-mono font-semibold placeholder:text-[var(--muted-text)] outline-none focus:border-purple-500 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Live iPhone SMS Mockup Preview */}
        <div className="bg-black/40 border border-[var(--border-color)] p-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 mb-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1">
              <span>📱</span> Twilio Live SMS Preview
            </span>
            <span className="text-[8px] font-mono text-[var(--muted-text)] font-bold">Twilio Toll-Free # +1 (888) 7TH-BAND</span>
          </div>

          {/* SMS Bubble */}
          <div className="p-3 bg-zinc-900/90 border border-white/10 text-[11px] leading-relaxed space-y-1 shadow-sm">
            <span className="text-[11px] font-black text-rose-400 block">{activeTitle}</span>
            <p className="text-white font-semibold text-[11px] leading-relaxed">{activeBody}</p>
            <span className="text-[8px] text-white/50 block text-right font-mono font-bold pt-1">7th Heaven Emergency Alerts • Reply STOP to unsubscribe</span>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-[var(--border-color)] flex items-center justify-between text-[9px] font-mono text-[var(--muted-text)] font-bold">
            <span>Estimated Cost: <strong className="text-emerald-400 font-black">${estimatedSmsCost.toFixed(2)}</strong></span>
            <span>Targeting {recipientCount.toLocaleString()} Fans</span>
          </div>
        </div>
      </div>

      {/* Dispatch CTA Button */}
      <div className="pt-1.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[10px] text-black/70 font-mono font-bold">
          Ready to dispatch across <strong className="text-black font-black">{[sendSms && "SMS", sendEmail && "Email", sendDashboardBanner && "Banner"].filter(Boolean).join(", ")}</strong> to <strong className="text-black font-black">{recipientCount.toLocaleString()}</strong> recipients.
        </div>

        <button
          type="button"
          onClick={handleDispatch}
          disabled={isSending}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSending ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Dispatching Broadcast...
            </>
          ) : (
            <>
              <span>🚀</span> Dispatch Emergency Broadcast (${totalEstimatedCost.toFixed(2)})
            </>
          )}
        </button>
      </div>

      {/* Dispatch Result Feedback */}
      {dispatchResult && (
        <div className={`p-3 rounded-lg border text-[10px] font-bold flex items-center justify-between animate-[fadeIn_0.2s_ease-out] ${
          dispatchResult.success ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-rose-500/15 border-rose-500/30 text-rose-300"
        }`}>
          <div>
            <span className="block font-black uppercase text-[11px] mb-0.5">
              {dispatchResult.success ? "✅ Broadcast Dispatched Successfully!" : "❌ Dispatch Failed"}
            </span>
            <p className="font-normal opacity-90 text-[10px]">{dispatchResult.message || dispatchResult.error}</p>
          </div>
          <button
            type="button"
            onClick={() => setDispatchResult(null)}
            className="text-white/40 hover:text-white cursor-pointer border-none bg-transparent text-[11px]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
