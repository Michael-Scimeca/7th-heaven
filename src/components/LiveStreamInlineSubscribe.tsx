"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Sparkles,
  User,
  Mail,
  ExternalLink,
  QrCode,
} from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
import SquishyToggle from "@/components/SquishyToggle";
import { useMember } from "@/context/MemberContext";

export default function LiveStreamInlineSubscribe({
  className = "",
  maxWidth = "max-w-4xl",
  title,
  subtitle,
}: {
  className?: string;
  maxWidth?: string;
  title?: string;
  subtitle?: string;
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
      <div
        className={`w-full ${maxWidth} flex flex-col items-center justify-between gap-4 rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-[#0d071b] to-[#080410] p-6 backdrop-blur-xl sm:flex-row ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="bg- purple-white/20 flex h-12 w-12 shrink-0 animate-pulse items-center justify-center rounded-lg border border-purple-500/40 text-purple-300">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h4>Verification Email Sent to {email}! ✉️</h4>
            <p className="mt-0.5 text-gray-300">
              To prevent unauthorized signups, we sent a verification link to{" "}
              <strong>{email}</strong>. Click the link in your email to activate
              live alerts!
            </p>
          </div>
        </div>

        <a
          href={topicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2.5 text-purple-300 transition-all hover:bg-white/20 hover:text-white"
        >
          <span>Web Alerts Feed</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full ${maxWidth} ${className}`}>
        {/* Header Title & Pill */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="bg- purple-white/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-purple-500/40 text-yellow-300 shadow-inner">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h3 className="r">
                {title || "Crew Member Live Stream Push & Email Alerts"}
              </h3>
              <p className="text-purple-200/70">
                {subtitle ||
                  "Enter your details below to get instant push notifications on your phone & email whenever a 7th Heaven crew member goes live!"}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-400 sm:self-auto">
            <span className="h-2 w-2 animate-ping rounded-lg bg-emerald-400" />
            100% Free Push Alerts
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative w-full">
              <div className="input-glow-border w-full">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="placeholder: w-full rounded-lg border border-white/10 bg-[#0d071b] py-3 pr-4 !pl-10 text-white/40 transition-all outline-none"
                />
              </div>
              <div className="pointer-events-none absolute top-1/2 left-3.5 z-20 flex -translate-y-1/2 items-center justify-center text-white/40">
                <User className="h-4 w-4" />
              </div>
            </div>

            <div className="relative w-full">
              <div className="input-glow-border w-full">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="placeholder: w-full rounded-lg border border-white/10 bg-[#0d071b] py-3 pr-4 !pl-10 text-white/40 transition-all outline-none"
                />
              </div>
              <div className="pointer-events-none absolute top-1/2 left-3.5 z-20 flex -translate-y-1/2 items-center justify-center text-white/40">
                <Mail className="h-4 w-4" />
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
            <label
              htmlFor="inline-terms-toggle"
              className="cursor-pointer text-gray-300/90 select-none"
            >
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Terms of Service
              </a>{" "}
              &{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Privacy Policy
              </a>{" "}
              for instant push & email alerts.
            </label>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <SeventhButton
              type="submit"
              disabled={loading}
              icon={<Sparkles className="h-4 w-4 text-yellow-300" />}
              className="flex w-full items-center justify-center gap-2 py-3"
            >
              {loading
                ? "SUBSCRIBING & ENABLING PUSH ALERTS..."
                : "SUBSCRIBE & ENABLE PUSH ALERTS 🔔"}
            </SeventhButton>
          </div>
        </form>
      </div>
    </>
  );
}
