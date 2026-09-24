"use client";

import React, { useEffect, useState } from "react";
import SeventhButton from "@/components/SeventhButton";
import PushSubscribeModal from "@/components/PushSubscribeModal";
import GlassCard from "@/components/ui/GlassCard";

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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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
);

const ExternalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DEFAULT_TITLES: Record<Group, string> = {
  fans: "Instant Show & Merch Push Alerts",
  crew: "Crew Member Live Stream Push Alerts",
  cruise: "Cruise Passenger Push Alerts",
};

const DEFAULT_SUBTITLES: Record<Group, string> = {
  fans: "Get instant free push alerts on your phone whenever 7th Heaven drops new show dates, tickets, or merch!",
  crew: "Subscribe to get instant free push alerts on your phone or browser whenever a 7th Heaven crew or band member goes live!",
  cruise:
    "Stay updated on cruise cabin pricing, setlist voting, and shore excursion announcements.",
};

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
  const topic = info?.topic || "";
  const webUrl = topic ? `${server}/${topic}` : "";

  const defaultTitle = DEFAULT_TITLES[group];
  const defaultSubtitle = DEFAULT_SUBTITLES[group];

  return (
    <>
      <GlassCard className={`relative overflow-hidden ${className}`}>
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-3">
            <div>
              <h3>{title || defaultTitle}</h3>
            </div>
          </div>

          <p className="mb-6 text-gray-300/90">{subtitle || defaultSubtitle}</p>

          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-lg border border-white/10 bg-[#00000029]" />
          ) : (
            <div className="flex flex-col flex-wrap items-center gap-3 sm:flex-row">
              {/* Primary Action: Open Subscription Modal to collect Name & Email */}
              <SeventhButton
                onClick={() => setShowModal(true)}
                className="! justify-center !px-5 !py-2.5"
              >
                <BellIcon />
                {subscribed ? "✓ Live Alerts Enabled 🔔" : "Enable Push Alerts"}
              </SeventhButton>

              {/* Secondary Action: Open Web Version */}
              {webUrl ? (
                <a
                  href={webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-4 py-3 text-center transition-colors hover:border-white/30 hover:bg-white/15 sm:w-auto"
                >
                  Web Alerts <ExternalIcon />
                </a>
              ) : null}
            </div>
          )}
        </div>
      </GlassCard>

      <PushSubscribeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        group={group}
        onSuccess={() => setSubscribed(true)}
      />
    </>
  );
}
