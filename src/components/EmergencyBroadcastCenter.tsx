/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
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

export function EmergencyBroadcastCenter({
  tourDates = EMPTY_TOUR_DATES,
}: EmergencyBroadcastCenterProps) {
  const [selectedShowDate, setSelectedShowDate] = useState<string>("");
  const [alertType, setAlertType] = useState<
    "cancellation" | "time_change" | "venue_change" | "announcement"
  >("cancellation");
  const [targetAudience, setTargetAudience] = useState<
    "all_fans" | "show_fans" | "crew_and_band"
  >("all_fans");

  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendDashboardBanner, setSendDashboardBanner] = useState(true);
  const [sendPush, setSendPush] = useState(true);

  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const selectedShow = useMemo(() => {
    return (
      tourDates.find((s) => s.date === selectedShowDate) ||
      tourDates[0] || {
        date: "2026-06-04",
        venue: "Broken Oar",
        city: "P. Barrington",
        time: "4:00 PM",
      }
    );
  }, [tourDates, selectedShowDate]);

  const showOptions = useMemo(() => {
    if (!tourDates || tourDates.length === 0) {
      return [
        {
          id: selectedShow.date,
          name: `${selectedShow.date} – ${selectedShow.venue} (${selectedShow.city || "IL"})`,
        },
      ];
    }
    return tourDates.map((s) => ({
      id: s.date,
      name: `${s.date} – ${s.venue} (${s.city || "IL"})`,
    }));
  }, [tourDates, selectedShow]);

  const audienceOptions = useMemo(
    () => [
      {
        id: "all_fans",
        name: "All Opted-In SMS & Email Fan Subscribers (1,482 Subscribers)",
      },
      {
        id: "show_fans",
        name: `Fans Registered for ${selectedShow?.venue || "Show"} (284 Fans)`,
      },
      { id: "crew_and_band", name: "Active Band & Crew Roster (42 Members)" },
    ],
    [selectedShow?.venue],
  );

  // Apply Preset Templates based on selected show & alert type
  const activeTitle =
    customTitle ||
    (alertType === "cancellation"
      ? `SHOW CANCELLED: ${selectedShow.venue}`
      : alertType === "time_change"
        ? `TIME CHANGE: ${selectedShow.venue}`
        : alertType === "venue_change"
          ? `VENUE UPDATE: ${selectedShow.venue}`
          : `SPECIAL NOTICE: ${selectedShow.venue}`);

  const activeBody =
    customBody ||
    (alertType === "cancellation"
      ? `ALERT: 7th Heaven show at ${selectedShow.venue} (${selectedShow.city || "IL"}) on ${selectedShow.date} has been CANCELLED due to severe weather/emergency. Refunds will be issued automatically. Stay safe!`
      : alertType === "time_change"
        ? `TIME UPDATE: 7th Heaven performance at ${selectedShow.venue} on ${selectedShow.date} has been moved up to ${selectedShow.time || "5:00 PM"}. Doors open early at 4:00 PM!`
        : alertType === "venue_change"
          ? `LOCATION UPDATE: 7th Heaven performance on ${selectedShow.date} has been relocated to ${selectedShow.venue} (${selectedShow.city || "IL"}). All existing tickets remain valid.`
          : `SPECIAL NOTICE: Exclusive VIP meet & greet upgrades for 7th Heaven at ${selectedShow.venue} on ${selectedShow.date} are now live on the fan dashboard!`);

  // Recipient Count Calculation
  const recipientCount =
    targetAudience === "all_fans"
      ? 1482
      : targetAudience === "show_fans"
        ? 284
        : 42;

  // Twilio & Email Cost Calculations
  const smsLength = activeBody.length;
  const smsSegments = Math.max(1, Math.ceil(smsLength / 160));
  const smsRatePerSegment = 0.0079; // Twilio US SMS rate
  const emailRatePerMsg = 0.001; // Email dispatch rate

  const estimatedSmsCost = sendSms
    ? recipientCount * smsSegments * smsRatePerSegment
    : 0;
  const estimatedEmailCost = sendEmail ? recipientCount * emailRatePerMsg : 0;
  const totalEstimatedCost = estimatedSmsCost + estimatedEmailCost;

  const handleApplyPreset = (
    type: "cancellation" | "time_change" | "venue_change" | "announcement",
  ) => {
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
            push: sendPush,
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
      setDispatchResult({
        error: err.message || "Failed to dispatch broadcast",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 border-none py-5 pl-0">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3.5">
          <div>
            <span className="block text-rose-400">Target Audience</span>
            <span>{recipientCount.toLocaleString()} Subscribers</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-rose-400"
          >
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8 a3 3 0 1 1-5.8-1.6" />
          </svg>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3.5">
          <div>
            <span className="block">SMS Length & Segments</span>
            <span>
              {smsLength} Chars ({smsSegments} Segments)
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3.5">
          <div>
            <span className="block">Twilio SMS Rate</span>
            <span>
              ${estimatedSmsCost.toFixed(2)} (${smsRatePerSegment}/msg)
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-accent)]"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3.5">
          <div>
            <span className="block">Total Est. Campaign Cost</span>
            <span className="text-[var(--color-accent)]">
              ${totalEstimatedCost.toFixed(2)}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-400"
          >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      </div>

      {/* Preset Alert Type Selector */}
      <div>
        <span className="mb-1.5 block">1. Quick Alert Presets</span>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => handleApplyPreset("cancellation")}
            className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-left ${alertType === "cancellation" ? "border-rose-400/50 bg-rose-600 shadow-rose-900/30" : "border-white/10 bg-white/[0.03] hover:bg-white/10"}`}
          >
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              Show Cancelled
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("time_change")}
            className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-left ${alertType === "time_change" ? "border-purple-400/50 bg-purple-700 shadow-purple-900/30" : "border-white/10 bg-white/[0.03] hover:bg-white/10"}`}
          >
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Time Moved Up
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("venue_change")}
            className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-left ${alertType === "venue_change" ? "border-purple-400/50 bg-[var(--color-accent)] shadow-purple-900/30" : "border-white/10 bg-white/[0.03] hover:bg-white/10"}`}
          >
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Venue Changed
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset("announcement")}
            className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-left ${alertType === "announcement" ? "border-purple-400/50 bg-cyan-600 shadow-cyan-900/30" : "border-white/10 bg-white/[0.03] hover:bg-white/10"}`}
          >
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              VIP / Special Alert
            </span>
          </button>
        </div>
      </div>

      {/* Show & Audience Selector Grid */}
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2">
        {/* Target Show Selector */}
        <div>
          <label className="mb-1.5 block">2. Target Show Date / Venue</label>
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
          <label className="mb-1.5 block">3. Target Audience</label>
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
        <span className="mb-1.5 block">
          4. Delivery Channels & Cost Estimator
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border-none p-2.5">
            <div className="flex items-center gap-2">
              <SquishyToggle
                id="send-sms"
                label="Send via Twilio SMS"
                checked={sendSms}
                onChange={setSendSms}
              />
              <div>
                <span className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                  Twilio SMS Alert
                </span>
                <span>${estimatedSmsCost.toFixed(2)} total</span>
              </div>
            </div>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border-none p-2.5">
            <div className="flex items-center gap-2">
              <SquishyToggle
                id="send-email"
                label="Send via email broadcast"
                checked={sendEmail}
                onChange={setSendEmail}
              />
              <div>
                <span className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email Broadcast
                </span>
                <span>${estimatedEmailCost.toFixed(2)} total</span>
              </div>
            </div>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border-none p-2.5">
            <div className="flex items-center gap-2">
              <SquishyToggle
                id="send-push"
                label="Send via ntfy push notification"
                checked={sendPush}
                onChange={setSendPush}
              />
              <div>
                <span className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  Push Notification (ntfy)
                </span>
                <span>Free ($0.00) — real send</span>
              </div>
            </div>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border-none p-2.5">
            <div className="flex items-center gap-2">
              <SquishyToggle
                id="send-dashboard-banner"
                label="Send fan wall banner"
                checked={sendDashboardBanner}
                onChange={setSendDashboardBanner}
              />
              <div>
                <span className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  Fan Wall Banner
                </span>
                <span>Free ($0.00)</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Editable Message Text & Live iPhone SMS Preview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Custom Message Inputs */}
        <div className="space-y-2.5">
          <div>
            <label htmlFor="emg-msg-title" className="mb-1 block">
              Message Title / Header
            </label>
            <input
              id="emg-msg-title"
              type="text"
              value={customTitle !== "" ? customTitle : activeTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. SHOW CANCELLED: Broken Oar"
              className="! focus-ring w-full rounded-lg border border-[var(--border-color)] px-3 py-2 outline-none"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="emg-msg-body" className="block">
                SMS & Alert Body Text
              </label>
              <span>
                {smsLength} / 160 chars ({smsSegments} segment
                {smsSegments > 1 ? "s" : ""})
              </span>
            </div>
            <textarea
              aria-label="Text input"
              id="emg-msg-body"
              rows={3}
              value={customBody !== "" ? customBody : activeBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="Write your emergency broadcast message text..."
              className="! focus-ring w-full resize-none rounded-lg border border-[var(--border-color)] p-2.5 outline-none"
            />
          </div>
        </div>

        {/* Live iPhone SMS Mockup Preview */}
        <div className="flex flex-col justify-between">
          <div className="mb-2.5 flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
              Twilio Live SMS Preview
            </span>
            <span>Twilio Toll-Free # +1 (888) 7TH-BAND</span>
          </div>

          {/* SMS Bubble */}
          <div className="space-y-1 rounded-lg border border-white/10 bg-[#a855f71f] p-3.5">
            <span className="block text-rose-400">{activeTitle}</span>
            <p>{activeBody}</p>
            <span className="block pt-1 text-right text-white/50">
              7th Heaven Emergency Alerts • Reply STOP to unsubscribe
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border-color)] pt-1.5">
            <span>
              Estimated Cost:{" "}
              <strong className="text-emerald-400">
                ${estimatedSmsCost.toFixed(2)}
              </strong>
            </span>
            <span>Targeting {recipientCount.toLocaleString()} Fans</span>
          </div>
        </div>
      </div>

      {/* Dispatch CTA Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5">
        <div>
          Ready to dispatch across{" "}
          <strong>
            {[
              sendSms && "SMS",
              sendEmail && "Email",
              sendPush && "Push",
              sendDashboardBanner && "Banner",
            ]
              .filter(Boolean)
              .join(", ")}
          </strong>{" "}
          to <strong>{recipientCount.toLocaleString()}</strong> recipients.
        </div>

        <button
          type="button"
          onClick={handleDispatch}
          disabled={isSending}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700 disabled:opacity-50"
        >
          {isSending ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-lg border-2 border-white border-t-transparent" />
              Dispatching Broadcast...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" x2="11" y1="2" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Dispatch Emergency Broadcast (${totalEstimatedCost.toFixed(2)})
            </>
          )}
        </button>
      </div>

      {/* Dispatch Result Feedback */}
      {dispatchResult && (
        <div
          className={`flex animate-[fadeIn_0.2s_ease-out] items-center justify-between rounded-lg border p-3 ${dispatchResult.success ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" : "border-rose-500/30 bg-rose-500/15 text-rose-300"}`}
        >
          <div>
            <span className="block">
              {dispatchResult.success
                ? "Broadcast Dispatched Successfully!"
                : "Dispatch Failed"}
            </span>
            <p className="font-normal opacity-90">
              {dispatchResult.message || dispatchResult.error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDispatchResult(null)}
            className="cursor-pointer border-none text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
