"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Sparkles, User, Mail, ExternalLink, QrCode } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import SquishyToggle from "@/components/SquishyToggle";
import { useMember } from "@/context/MemberContext";

export default function LiveStreamInlineSubscribe({
  className = "",
  maxWidth = "max-w-4xl",
}: {
  className?: string;
  maxWidth?: string;
}) {
  const { member } = useMember();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const topicUrl = "https://ntfy.sh/7thheaven_crew";

  useEffect(() => {
    if (member?.name) setName(member.name);
    if (member?.email) setEmail(member.email);
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      // 1. Request Browser Push Notification Permission
      let pushPermission = "default";
      if (typeof window !== "undefined" && "Notification" in window) {
        pushPermission = await Notification.requestPermission();
      }

      // 2. Register backend subscription (Email + ntfy push topic)
      const res = await fetch("/api/ntfy/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          group: "crew",
          source: "live-inline-master",
          agreedToTerms: true,
          pushGranted: pushPermission === "granted",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed.");
      }

      setSubscribed(true);
    } catch (err: any) {
      setError(err?.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`w-full ${maxWidth} p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-[#0d071b] to-[#080410] backdrop-blur-xl text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">Live Push & Email Alerts Activated! 🔔</h4>
            <p className="text-xs text-gray-300 mt-0.5">
              Instant alerts will pop up on your device & welcome email was sent to <strong className="text-white font-mono">{email}</strong> whenever 7th Heaven or a crew member goes live.
            </p>
          </div>
        </div>

        <a
          href={topicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-purple-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-purple-500/30 flex items-center gap-2 shrink-0"
        >
          <span>Web Alerts Feed</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full ${maxWidth} p-5 sm:p-7 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#130b24]/90 via-[#0d071b]/95 to-[#080410] backdrop-blur-xl text-white shadow-2xl ${className}`}>
        {/* Header Title & Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-yellow-300 shrink-0 shadow-inner">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Crew Member Live Stream Push & Email Alerts
              </h3>
              <p className="text-xs text-purple-200/70">
                Enter your details below to get instant push notifications on your phone & email whenever a 7th Heaven crew member goes live!
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            100% Free Push Alerts
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative w-full">
              <div className="input-glow-border rounded-xl w-full">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-[#0d071b] border border-white/10 rounded-xl text-white placeholder:text-white/40 !pl-10 pr-4 py-3 text-xs sm:text-sm outline-none transition-all"
                />
              </div>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-20 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="relative w-full">
              <div className="input-glow-border rounded-xl w-full">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full bg-[#0d071b] border border-white/10 rounded-xl text-white placeholder:text-white/40 !pl-10 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-20 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Legal Terms & Privacy Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <SquishyToggle
              id="inline-terms-toggle"
              label="I agree to the Terms of Service & Privacy Policy"
              checked={agreedToTerms}
              onChange={(checked) => setAgreedToTerms(checked)}
            />
            <label htmlFor="inline-terms-toggle" className="text-xs text-gray-300/90 leading-tight cursor-pointer select-none">
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-purple-300">
                Terms of Service
              </a>{" "}
              &{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-purple-300">
                Privacy Policy
              </a>{" "}
              for instant push & email alerts.
            </label>
          </div>

          {/* Actions Bar: Subscribe Button + Web Alerts & Mobile QR Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <CosmicRadialButton
              type="submit"
              disabled={loading}
              icon={<Sparkles className="w-4 h-4 text-yellow-300" />}
              className="w-full sm:flex-1 py-3 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? "SUBSCRIBING & ENABLING PUSH ALERTS..." : "SUBSCRIBE & ENABLE PUSH ALERTS 🔔"}
            </CosmicRadialButton>

            <a
              href={topicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-purple-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Web Alerts</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-purple-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR Guide →</span>
            </button>
          </div>
        </form>
      </div>

      {/* QR Code / Mobile Guide Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-2xl border border-purple-500/30 bg-[#0e0a1a] text-white shadow-2xl text-center">
            <h3 className="text-xl font-black mb-2">Mobile Push Alert Setup</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Scan this QR code with your phone camera or visit <strong className="text-purple-400 font-mono">ntfy.sh/7thheaven_crew</strong> in the free ntfy mobile app to receive instant lock screen notifications whenever a 7th Heaven member goes live!
            </p>
            <div className="mx-auto w-48 h-48 bg-white p-3 rounded-xl shadow-inner mb-6 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(topicUrl)}`}
                alt="Push Alert QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </>
  );
}
