"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";

type Group = "fans" | "crew" | "cruise";

interface TopicResponse {
  ok: boolean;
  configured: boolean;
  group: Group;
  topic?: string;
  server?: string;
  error?: string;
}

const GROUP_TABS: { id: Group; label: string; blurb: string }[] = [
  { id: "fans", label: "Fans", blurb: "New shows, ticket drops, merch restocks, and fan-wall highlights." },
  { id: "crew", label: "Crew", blurb: "Show-day logistics, schedule changes, and crew-only alerts." },
  { id: "cruise", label: "Cruise", blurb: "Cabin pricing, setlist votes, and shore-excursion updates." },
];

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.536c-.03-3.06 2.5-4.53 2.61-4.6-1.43-2.09-3.65-2.38-4.44-2.41-1.89-.19-3.7 1.11-4.66 1.11-.96 0-2.44-1.09-4.02-1.06-2.06.03-3.98 1.2-5.05 3.05-2.15 3.73-.55 9.26 1.55 12.29 1.02 1.48 2.24 3.15 3.85 3.09 1.55-.06 2.13-1 4-1 1.87 0 2.4 1 4.03.97 1.66-.03 2.72-1.5 3.74-2.99 1.18-1.72 1.66-3.38 1.68-3.47-.04-.02-3.22-1.24-3.25-4.98z" /><path d="M14.53 3.9c.85-1.03 1.42-2.46 1.26-3.9-1.22.05-2.7.81-3.58 1.84-.79.91-1.48 2.37-1.29 3.76 1.36.11 2.75-.69 3.61-1.7z" /></svg>
);

const AndroidIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18a.5.5 0 1 0-.87-.5l-1.86 3.22a11.44 11.44 0 0 0-9.42 0L5.43 5.8a.5.5 0 1 0-.87.5L6.4 9.48A10.86 10.86 0 0 0 1 18h22a10.86 10.86 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" /></svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const getTopicInfo = (group: Group): TopicResponse => {
  const topicMap: Record<Group, string> = {
    fans: process.env.NEXT_PUBLIC_NTFY_TOPIC_FANS || "7thheaven_fans",
    crew: process.env.NEXT_PUBLIC_NTFY_TOPIC_CREW || "7thheaven_crew",
    cruise: process.env.NEXT_PUBLIC_NTFY_TOPIC_CRUISE || "7thheaven_cruise",
  };
  return {
    ok: true,
    configured: true,
    group,
    topic: topicMap[group],
    server: "https://ntfy.sh",
  };
};

export default function NotificationsPage() {
  const { member } = useMember();

  // Picks a sensible starting tab from the logged-in member's role. Only
  // read once at mount (React ignores a later change to useState's initial
  // arg) — if role loads in asynchronously after this component mounts, the
  // visitor can still just tap another tab, which is a fine tradeoff for
  // avoiding a setState-in-effect just to keep this in sync.
  const [activeTab, setActiveTab] = useState<Group>(() => {
    if (member?.role === "crew") return "crew";
    if ((member?.role as string) === "cruise") return "cruise";
    return "fans";
  });
  const [copied, setCopied] = useState(false);

  const info = getTopicInfo(activeTab);

  const server = info?.server || "https://ntfy.sh";
  const serverHost = server.replace(/^https?:\/\//, "");
  const topic = info?.topic || "";
  const browserUrl = topic ? `${server}/${topic}` : "";
  const appDeepLink = topic ? `ntfy://${serverHost}/${topic}` : "";

  const activeMeta = GROUP_TABS.find((g) => g.id === activeTab)!;

  const handleTabChange = (tab: Group) => {
    setActiveTab(tab);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!topic || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(topic).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="site-container min-h-screen pt-[var(--page-top-offset)] pb-24 relative overflow-hidden text-[var(--text-color)]">
      {/* Page Header */}
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 mb-4 text-purple-700 text-xs font-bold uppercase tracking-wider">
          <BellIcon />
          Free &middot; No Phone Number &middot; No Signup
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-color)] tracking-tight uppercase mb-4">
          Get Notified <span className="text-purple-600">Instantly</span>
        </h1>
        <p className="text-[var(--muted-text)] text-base font-medium">
          7th Heaven can push an alert straight to your phone the moment we post one &mdash;
          new shows, ticket drops, cruise news, whatever the group needs. It doesn&apos;t
          use text messages or carrier fees; it rides on{" "}
          <a href="https://ntfy.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
            ntfy
          </a>
          , a free, open push network, so there&apos;s no cost to you and none to us.
          Prefer old-fashioned alerts? Check out our live stream alerts on{" "}
          <Link href="/live" className="underline hover:text-white transition-colors">
            the live page
          </Link>{" "}
          too.
        </p>
      </div>

      {/* Audience Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {GROUP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              aria-label={`Show ${tab.label} alerts`}
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition duration-200 border cursor-pointer ${isActive
                ? "bg-purple-600 border-purple-600 text-white shadow-md"
                : "bg-[#e1e6ff29]   border-white/15 text-white/70 hover:text-white hover:border-white/30"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto bg-[#e1e6ff29]   backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-md">
        <p className="text-white/60 text-sm font-medium text-center mb-8">{activeMeta.blurb}</p>

        {!info?.configured ? (
          <div className="py-12 text-center max-w-md mx-auto">
            <p className="text-white font-extrabold mb-1">Not set up yet</p>
            <p className="text-white/50 text-sm">
              This alert channel hasn&apos;t been configured on the server yet. Check back soon,
              or reach out on the{" "}
              <Link href="/contact" className="underline hover:text-white transition-colors">
                Contact
              </Link>{" "}
              page.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* QR Code */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <QRCode value={appDeepLink} size={148} fgColor="#0c0817" bgColor="#ffffff" />
              </div>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center max-w-[160px]">
                Scan from inside the ntfy app&apos;s &ldquo;+&rdquo; button
              </p>
            </div>

            {/* Steps */}
            <div className="flex-1 w-full space-y-5">
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">1</span>
                <div>
                  <p className="text-white font-bold text-sm mb-2">Get the free ntfy app (or skip it and use your browser)</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://apps.apple.com/us/app/ntfy/id1625396347"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs font-bold hover:bg-white/15 transition-colors"
                    >
                      <AppleIcon /> App Store
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs font-bold hover:bg-white/15 transition-colors"
                    >
                      <AndroidIcon /> Google Play
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">2</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm mb-2">Subscribe to the &ldquo;{activeMeta.label}&rdquo; channel</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <CosmicRadialButton
                      icon={false}
                      onClick={() => window.open(appDeepLink, "_self")}
                      className="px-5 py-2.5 text-xs font-black tracking-wider rounded-lg"
                    >
                      Open in ntfy App
                    </CosmicRadialButton>
                    <a
                      href={browserUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-white/60 hover:text-white underline transition-colors"
                    >
                      Or subscribe in your browser instead
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">3</span>
                <div>
                  <p className="text-white font-bold text-sm">
                    Done. You&apos;ll get a push notification the moment we send one to this channel &mdash;
                    nothing to reply to, nothing that costs you anything.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors cursor-pointer pt-1"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied channel name" : "Copy channel name manually"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="max-w-3xl mx-auto mt-10 text-center">
        <p className="text-white/40 text-xs leading-relaxed">
          Under the hood this uses ntfy, a free open-source push service &mdash; the site
          publishes a message to a private channel name and anyone subscribed to that
          exact name gets it, with no accounts, ads, or per-message cost on either end.
          Admins send these from the Admin Dashboard&apos;s Emergency Broadcast Center, Crew
          Alert, and Cruise Blast tools.
        </p>
      </div>
    </section>
  );
}
