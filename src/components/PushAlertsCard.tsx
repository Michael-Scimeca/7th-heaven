"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import PushSubscribeModal from "@/components/PushSubscribeModal";

type Group = "fans" | "crew" | "cruise";

interface PushAlertsCardProps {
  group: Group;
  className?: string;
  title?: string;
  subtitle?: string;
}

interface TopicResponse {
  ok: boolean;
  configured: boolean;
  group: Group;
  topic?: string;
  server?: string;
}

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ExternalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function PushAlertsCard({
  group,
  className = "",
  title,
  subtitle,
}: PushAlertsCardProps) {
  const [info, setInfo] = useState<TopicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/ntfy/topic?group=${group}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load topic");
        return res.json();
      })
      .then((data: TopicResponse) => {
        if (active) setInfo(data);
      })
      .catch(() => {
        if (active) setInfo({ ok: false, configured: false, group });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [group]);

  const server = info?.server || "https://ntfy.sh";
  const serverHost = server.replace(/^https?:\/\//, "");
  const topic = info?.topic || "";
  const webUrl = topic ? `${server}/${topic}` : "";

  const defaultTitle =
    group === "fans"
      ? "Instant Show & Merch Push Alerts"
      : group === "crew"
        ? "Crew Member Live Stream Push Alerts"
        : "Cruise Passenger Push Alerts";

  const defaultSubtitle =
    group === "fans"
      ? "Get instant free push alerts on your phone whenever 7th Heaven drops new show dates, tickets, or merch!"
      : group === "crew"
        ? "Subscribe to get instant free push alerts on your phone or browser whenever a 7th Heaven crew or band member goes live!"
        : "Stay updated on cruise cabin pricing, setlist voting, and shore excursion announcements.";

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#120b24]/90 via-[#0d071b]/95 to-[#080410] p-6 sm:p-7 shadow-2xl backdrop-blur-xl ${className}`}
      >
        {/* Decorative top accent glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-pink-600/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center  rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-inner">
              <BellIcon />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {title || defaultTitle}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                100% Free · No App Signup Needed
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed mb-6">
            {subtitle || defaultSubtitle}
          </p>

          {loading ? (
            <div className="h-12 w-full animate-pulse  rounded-lg bg-[#e1e6ff29]   border border-white/10" />
          ) : (
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
              {/* Primary Action: Open Subscription Modal to collect Name & Email */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2"
              >
                <CosmicRadialButton className="w-full justify-center !py-3 !px-5 text-xs  font-bold  uppercase tracking-wider !text-white shadow-lg">
                  <BellIcon />
                  {subscribed ? "✓ Live Alerts Enabled 🔔" : "Enable Push Alerts"}
                </CosmicRadialButton>
              </button>

              {/* Secondary Action: Open Web Version */}
              {webUrl ? (
                <a
                  href={webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2  rounded-lg border border-white/15 bg-[#e1e6ff29]   px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 hover:border-white/30 transition-all text-center"
                >
                  Web Alerts <ExternalIcon />
                </a>
              ) : null}

              {/* QR Code / Instructions Page Link */}
              <Link
                href={`/notifications?group=${group}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2  rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all text-center"
              >
                Scan QR Code / Guide →
              </Link>
            </div>
          )}
        </div>
      </div>

      <PushSubscribeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        group={group}
        onSuccess={() => setSubscribed(true)}
      />
    </>
  );
}
