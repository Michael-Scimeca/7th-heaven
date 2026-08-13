/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import React, { useState, useMemo } from "react";

import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import { SquishyToggle } from "@/components/SquishyToggle";

interface TourShow {
  date: string;
  venue: string;
  city?: string;
  time?: string;
}

interface EmergencyBroadcastCenterProps {
  tourDates?: TourShow[];
}

const EMPTY_TOUR_DATES: TourShow[] = [];

export function EmergencyBroadcastCenter({ tourDates = EMPTY_TOUR_DATES }: EmergencyBroadcastCenterProps) {
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

  const showOptions = useMemo(() => {
    if (!tourDates || tourDates.length === 0) {
      return [{ id: selectedShow.date, name: `${selectedShow.date} – ${selectedShow.venue} (${selectedShow.city || 'IL'})` }];
    }
    return tourDates.map(s => ({
      id: s.date,
      name: `${s.date} – ${s.venue} (${s.city || 'IL'})`
    }));
  }, [tourDates, selectedShow]);

  const audienceOptions = useMemo(() => [
    { id: "all_fans", name: "All Opted-In SMS & Email Fan Subscribers (1,482 Subscribers)" },
    { id: "show_fans", name: `Fans Registered for ${selectedShow?.venue || 'Show'} (284 Fans)` },
    { id: "crew_and_band", name: "Active Band & Crew Roster (42 Members)" }
  ], [selectedShow?.venue]);

  // Apply Preset Templates based on selected show & alert type
  const activeTitle = customTitle || (
    alertType === "cancellation" ? `SHOW CANCELLED: ${selectedShow.venue}` :
      alertType === "time_change" ? `TIME CHANGE: ${selectedShow.venue}` :
        alertType === "venue_change" ? `VENUE UPDATE: ${selectedShow.venue}` :
          `SPECIAL NOTICE: ${selectedShow.venue}`
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

      if (res.ok) {
        const data = await res.json();
        setDispatchResult(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setDispatchResult({ error: data.error || `HTTP ${res.status}` });
      }
    } catch (err: any) {
      setDispatchResult({ error: err.message || "Failed to dispatch broadcast" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="py-5 pl-0 bg-transparent border-none space-y-4 text-[var(--text-color)] font-sans">

      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-transparent border-none flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-rose-400 block">Target Audience</span>
            <span className="text-[11px] font-black text-[var(--text-color)]">{recipientCount.toLocaleString()} Subscribers</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8 a3 3 0 1 1-5.8-1.6" /></svg>
        </div>

        <div className="p-2.5 bg-transparent border-none flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-purple-300 block">SMS Length & Segments</span>
            <span className="text-[11px] font-black text-[var(--text-color)]">{smsLength} Chars ({smsSegments} Segments)</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
        </div>

        <div className="p-2.5 bg-transparent border-none flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider  text-[var(--color-accent)] block">Twilio SMS Rate</span>
            <span className="text-[11px] font-black text-[var(--text-color)]">${estimatedSmsCost.toFixed(2)} (${smsRatePerSegment}/msg)</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
        </div>

        <div className="p-2.5 bg-transparent border-none flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-accent)] block">Total Est. Campaign Cost</span>
            <span className="text-[11px] font-black text-[var(--color-accent)]">${totalEstimatedCost.toFixed(2)}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        </div>
      </div>

      {/* Preset Alert Type Selector */}
      <div>
        <span className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
          1. Quick Alert Presets
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button aria-label="Action button"
            type="button"
            onClick={() => handleApplyPreset("cancellation")}
            className={`p-2 rounded-lg text-[10px] font-black text-left transition-colors cursor-pointer border-none ${alertType === "cancellation"
              ? "bg-rose-600 text-white shadow-md"
              : "bg-transparent text-[var(--muted-text)] hover:bg-white/5 hover:text-[var(--text-color)]"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              Show Cancelled
            </span>
          </button>

          <button aria-label="Action button"
            type="button"
            onClick={() => handleApplyPreset("time_change")}
            className={`p-2 rounded-lg text-[10px] font-black text-left transition-colors cursor-pointer border-none ${alertType === "time_change"
              ? "bg-purple-700 text-white shadow-md"
              : "bg-transparent text-[var(--muted-text)] hover:bg-white/5 hover:text-[var(--text-color)]"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Time Moved Up
            </span>
          </button>

          <button aria-label="Action button"
            type="button"
            onClick={() => handleApplyPreset("venue_change")}
            className={`p-2 rounded-lg text-[10px] font-black text-left transition-colors cursor-pointer border-none ${alertType === "venue_change"
              ? "bg-[var(--color-accent)] text-white shadow-md"
              : "bg-transparent text-[var(--muted-text)] hover:bg-white/5 hover:text-[var(--text-color)]"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              Venue Changed
            </span>
          </button>

          <button aria-label="Action button"
            type="button"
            onClick={() => handleApplyPreset("announcement")}
            className={`p-2 rounded-lg text-[10px] font-black text-left transition-colors cursor-pointer border-none ${alertType === "announcement"
              ? "bg-cyan-600 text-white shadow-md"
              : "bg-transparent text-[var(--muted-text)] hover:bg-white/5 hover:text-[var(--text-color)]"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              VIP / Special Alert
            </span>
          </button>
        </div>
      </div>

      {/* Show & Audience Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        {/* Target Show Selector */}
        <div>
          <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
            2. Target Show Date / Venue
          </label>
          <GooeyMessagesDropdown
            fullWidth={true}
            placeholder="Select Show Date / Venue"
            defaultSelectedId={selectedShowDate || showOptions[0]?.id}
            customers={showOptions}
            onSelect={(opt) => setSelectedShowDate(opt.id)}
            className="w-full"
          />
        </div>

        {/* Target Audience Selector */}
        <div>
          <label className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
            3. Target Audience
          </label>
          <GooeyMessagesDropdown
            fullWidth={true}
            placeholder="Select Target Audience"
            defaultSelectedId={targetAudience}
            customers={audienceOptions}
            onSelect={(opt) => setTargetAudience(opt.id as any)}
            className="w-full"
          />
        </div>
      </div>

      {/* Notification Delivery Channels */}
      <div>
        <span className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1.5">
          4. Delivery Channels & Cost Estimator
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <label className="p-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between border-none bg-transparent">
            <div className="flex items-center gap-2">
              <SquishyToggle id="send-sms" label="Send via Twilio SMS" checked={sendSms} onChange={setSendSms} />
              <div>
                <span className="text-[10px] font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                  Twilio SMS Alert
                </span>
                <span className="text-[9px] text-[var(--muted-text)] font-mono font-bold">${estimatedSmsCost.toFixed(2)} total</span>
              </div>
            </div>
          </label>

          <label className="p-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between border-none bg-transparent">
            <div className="flex items-center gap-2">
              <SquishyToggle id="send-email" label="Send via email broadcast" checked={sendEmail} onChange={setSendEmail} />
              <div>
                <span className="text-[10px] font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  Email Broadcast
                </span>
                <span className="text-[9px] text-[var(--muted-text)] font-mono font-bold">${estimatedEmailCost.toFixed(2)} total</span>
              </div>
            </div>
          </label>

          <label className="p-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between border-none bg-transparent">
            <div className="flex items-center gap-2">
              <SquishyToggle id="send-dashboard-banner" label="Send fan wall banner" checked={sendDashboardBanner} onChange={setSendDashboardBanner} />
              <div>
                <span className="text-[10px] font-black text-[var(--text-color)] flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                  Fan Wall Banner
                </span>
                <span className="text-[9px] text-[var(--muted-text)] font-mono font-bold">Free ($0.00)</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Editable Message Text & Live iPhone SMS Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Custom Message Inputs */}
        <div className="space-y-2.5">
          <div>
            <label htmlFor="emg-msg-title" className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider block mb-1">
              Message Title / Header
            </label>
            <input aria-label="Input field"
              id="emg-msg-title"
              type="text"
              value={customTitle !== "" ? customTitle : activeTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. SHOW CANCELLED: Broken Oar"
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11px] text-[var(--text-color)] font-bold placeholder:text-[var(--muted-text)] outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="emg-msg-body" className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-wider">
                SMS & Alert Body Text
              </label>
              <span className="text-[9px] font-mono font-bold text-purple-300">
                {smsLength} / 160 chars ({smsSegments} segment{smsSegments > 1 ? "s" : ""})
              </span>
            </div>
            <textarea aria-label="Text input"
              id="emg-msg-body"
              rows={3}
              value={customBody !== "" ? customBody : activeBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="Write your emergency broadcast message text..."
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg p-2.5 text-[11px] text-[var(--text-color)] font-mono font-semibold placeholder:text-[var(--muted-text)] outline-none focus:border-purple-500 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Live iPhone SMS Mockup Preview */}
        <div className="bg-transparent border border-[var(--border-color)] p-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 mb-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
              Twilio Live SMS Preview
            </span>
            <span className="text-[8px] font-mono text-[var(--muted-text)] font-bold">Twilio Toll-Free # +1 (888) 7TH-BAND</span>
          </div>

          {/* SMS Bubble */}
          <div className="p-3 bg-transparent border border-white/10 text-[11px] leading-relaxed space-y-1 shadow-sm">
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
        <div className="text-[10px] text-white/60 font-mono font-bold">
          Ready to dispatch across <strong className="text-white font-black">{[sendSms && "SMS", sendEmail && "Email", sendDashboardBanner && "Banner"].filter(Boolean).join(", ")}</strong> to <strong className="text-white font-black">{recipientCount.toLocaleString()}</strong> recipients.
        </div>

        <button aria-label="Action button"
          type="button"
          onClick={handleDispatch}
          disabled={isSending}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSending ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Dispatching Broadcast...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              Dispatch Emergency Broadcast (${totalEstimatedCost.toFixed(2)})
            </>
          )}
        </button>
      </div>

      {/* Dispatch Result Feedback */}
      {dispatchResult && (
        <div className={`p-3 rounded-lg border text-[10px] font-bold flex items-center justify-between animate-[fadeIn_0.2s_ease-out] ${dispatchResult.success ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}>
          <div>
            <span className="block font-black uppercase text-[11px] mb-0.5">
              {dispatchResult.success ? "Broadcast Dispatched Successfully!" : "Dispatch Failed"}
            </span>
            <p className="font-normal opacity-90 text-[10px]">{dispatchResult.message || dispatchResult.error}</p>
          </div>
          <button aria-label="Action button"
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
