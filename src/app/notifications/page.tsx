"use client";

import React, { useEffect, useMemo, useState } from "react";
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

export default function NotificationsPage() {
  const { member } = useMember();

  const defaultTab: Group = useMemo(() => {
    if (member?.role === "crew") return "crew";
    if ((member?.role as string) === "cruise") return "cruise";
    return "fans";
  }, [member?.role]);

  const [activeTab, setActiveTab] = useState<Group>(defaultTab);
  const [info, setInfo] = useState<TopicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live Test Push state
  const [testTitle, setTestTitle] = useState("🚨 7th Heaven Live Push Test");
  const [testMessage, setTestMessage] = useState("7th Heaven push alerts are working! Live show at Station 34 tonight at 8:30pm.");
  const [testSending, setTestSending] = useState(false);
  const [testStatus, setTestStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Custom SMS Text List Dispatch state
  const [smsRecipientsList, setSmsRecipientsList] = useState("(630) 555-0199, (312) 555-0188");
  const [smsTextBody, setSmsTextBody] = useState("7th Heaven is playing LIVE tonight at Station 34! Doors open at 8:00pm.");
  const [smsSending, setSmsSending] = useState(false);
  const [smsStatus, setSmsStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCopied(false);
    fetch(`/api/ntfy/topic?group=${activeTab}`)
      .then((res) => res.json())
      .then((data: TopicResponse) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) setInfo({ ok: false, configured: false, group: activeTab });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const server = info?.server || "https://ntfy.sh";
  const serverHost = server.replace(/^https?:\/\//, "");
  const topic = info?.topic || "";
  const browserUrl = topic ? `${server}/${topic}` : "";
  const appDeepLink = topic ? `ntfy://${serverHost}/${topic}` : "";

  const activeMeta = GROUP_TABS.find((g) => g.id === activeTab)!;

  const handleCopy = () => {
    if (!topic || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(topic).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendTestPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSending(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/ntfy/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: activeTab,
          title: testTitle,
          message: testMessage,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send push test");
      }
      setTestStatus({
        ok: true,
        msg: `Push notification sent to "${activeTab}" channel! Check your phone/browser now.`,
      });
    } catch (err: any) {
      setTestStatus({ ok: false, msg: err.message || "Failed to send test push" });
    } finally {
      setTestSending(false);
    }
  };

  const handleSendCustomSmsList = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSending(true);
    setSmsStatus(null);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipients: smsRecipientsList,
          message: smsTextBody,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        throw new Error("🔒 Admin access required — log in as admin to send SMS.");
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to send SMS text list");
      }
      setSmsStatus({
        ok: true,
        msg: data.message || `✅ SMS dispatched to ${data.sent ?? data.nearbyCount ?? 1} recipient(s)!`,
      });
    } catch (err: any) {
      setSmsStatus({ ok: false, msg: err.message || "Failed to send custom SMS list" });
    } finally {
      setSmsSending(false);
    }
  };

  const isAdmin = member?.role === "admin" || member?.role === "crew";

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
          <a href="https://ntfy.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400 transition-colors font-bold">
            ntfy
          </a>
          , a 100% free, open push network with zero carrier costs for fans or the band.
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
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition duration-200 border cursor-pointer ${
                isActive
                  ? "bg-purple-600 border-purple-600 text-white shadow-md"
                  : "bg-white/5 border-white/15 text-white/70 hover:text-white hover:border-white/30"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-md">
        <p className="text-white/60 text-sm font-medium text-center mb-8">{activeMeta.blurb}</p>

        {loading ? (
          <div className="py-12 text-center text-white/40 text-sm font-bold uppercase tracking-widest">
            Loading &hellip;
          </div>
        ) : !info?.configured ? (
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
              <div className="bg-white p-3 rounded-2xl shadow-xl border border-white/20 min-w-[174px] min-h-[174px] flex items-center justify-center">
                {browserUrl || appDeepLink ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(browserUrl || appDeepLink)}`}
                    alt="Scan Push Notification QR Code"
                    width={150}
                    height={150}
                    className="w-[150px] h-[150px] object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-[150px] h-[150px] bg-gray-100 animate-pulse rounded-xl" />
                )}
              </div>
              <p className="text-[10px] text-white/50 font-extrabold uppercase tracking-widest text-center max-w-[160px]">
                Scan with phone camera or inside ntfy app
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

      {/* ⚡ REAL-TIME LIVE PUSH TESTER */}
      <div className="max-w-3xl mx-auto mt-12 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#160b2d]/90 to-[#0a0518]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <span className="text-lg">🚀</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Real-Time Push Notification Tester
            </h3>
            <p className="text-xs text-purple-300/80 font-bold uppercase tracking-wider">
              Send a live test alert to the &ldquo;{activeMeta.label}&rdquo; channel right now
            </p>
          </div>
        </div>

        <form onSubmit={handleSendTestPush} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/60 mb-1">
              Push Alert Title
            </label>
            <input
              type="text"
              required
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/60 mb-1">
              Push Alert Message
            </label>
            <textarea
              required
              rows={2}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm font-medium text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {testStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                testStatus.ok
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {testStatus.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={testSending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {testSending ? "Sending Push Test..." : `🚀 Send Live Test Push to "${activeMeta.label}"`}
          </button>
        </form>
      </div>

      {/* 📱 CUSTOM SMS TEXT LIST DISPATCHER */}
      <div className="max-w-3xl mx-auto mt-8 overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-b from-[#1c0b24]/90 to-[#0c0512]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/40">
            <span className="text-lg">📱</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Send SMS Text Message to Custom Recipient List
            </h3>
            <p className="text-xs text-pink-300/80 font-bold uppercase tracking-wider">
              {isAdmin ? "Paste or type a list of phone numbers (comma or newline separated)" : "🔒 Admin / Crew access required"}
            </p>
          </div>
        </div>

        {!isAdmin ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <span className="text-4xl">🔒</span>
            <p className="text-white/60 text-sm font-bold">You must be logged in as <span className="text-pink-400">Admin</span> or <span className="text-pink-400">Crew</span> to send SMS texts.</p>
            <a href="/admin" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg transition-all">
              Go to Admin Login →
            </a>
          </div>
        ) : (
          <form onSubmit={handleSendCustomSmsList} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/60 mb-1">
                Recipient Phone Numbers (comma or newline separated)
              </label>
              <textarea
                required
                rows={2}
                placeholder="(630) 555-0199, (312) 555-0188, +17085550144"
                value={smsRecipientsList}
                onChange={(e) => setSmsRecipientsList(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm font-mono text-pink-200 outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/60 mb-1">
                SMS Text Body
              </label>
              <textarea
                required
                rows={2}
                value={smsTextBody}
                onChange={(e) => setSmsTextBody(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm font-medium text-white outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {smsStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  smsStatus.ok
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {smsStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={smsSending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {smsSending ? "Sending SMS Texts..." : "💬 Send SMS Texts to Custom List"}
            </button>
          </form>
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
