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
      <div className={`w-full ${maxWidth} p-6 rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-[#0d071b] to-[#080410] backdrop-blur-xl text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white">Verification Email Sent to {email}! ✉️</h4>
            <p className="text-gray-300 mt-0.5">
              To prevent unauthorized signups, we sent a verification link to <strong className="text-white font-mono">{email}</strong>. Click the link in your email to activate live alerts!
            </p>
          </div>
        </div>

        <a
          href={topicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-purple-300 hover:text-white font-bold uppercase tracking-wider rounded-lg transition-all border border-purple-500/30 flex items-center gap-2 shrink-0"
        >
          <span>Web Alerts Feed</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full ${maxWidth} text-white ${className}`}>
        {/* Header Title & Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-yellow-300 shrink-0 shadow-inner">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-white uppercase tracking-wider">
                Crew Member Live Stream Push & Email Alerts
              </h3>
              <p className="text-purple-200/70">
                Enter your details below to get instant push notifications on your phone & email whenever a 7th Heaven crew member goes live!
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase    bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto shrink-0">
            <span className="h-2 w-2 rounded-lg bg-emerald-400 animate-ping" />
            100% Free Push Alerts
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative w-full">
              <div className="input-glow-border rounded-lg w-full">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-[#0d071b] border border-white/10 rounded-lg text-white placeholder:text-white/40 !pl-10 pr-4 py-3 outline-none transition-all"
                />
              </div>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-20 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="relative w-full">
              <div className="input-glow-border rounded-lg w-full">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full bg-[#0d071b] border border-white/10 rounded-lg text-white placeholder:text-white/40 !pl-10 pr-4 py-3 outline-none transition-all"
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
            <label htmlFor="inline-terms-toggle" className="text-gray-300/90 leading-tight cursor-pointer select-none">
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

          {/* Action Button */}
          <div className="pt-2">
            <CosmicRadialButton
              type="submit"
              disabled={loading}
              icon={<Sparkles className="w-4 h-4 text-yellow-300" />}
              className="w-full py-3 text-white font-bold uppercase    flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? "SUBSCRIBING & ENABLING PUSH ALERTS..." : "SUBSCRIBE & ENABLE PUSH ALERTS 🔔"}
            </CosmicRadialButton>
          </div>
        </form>
      </div>
    </>
  );
}
