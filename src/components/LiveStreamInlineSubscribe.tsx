"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Sparkles, User, Mail, Shield } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import { useMember } from "@/context/MemberContext";

import SquishyToggle from "@/components/SquishyToggle";

export default function LiveStreamInlineSubscribe() {
  const { member } = useMember();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
      if (typeof window !== "undefined" && "Notification" in window) {
        await Notification.requestPermission();
      }

      const res = await fetch("/api/ntfy/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          group: "fans",
          source: "live-inline-bar",
          agreedToTerms: true,
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
      <div className="w-full max-w-xl p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 backdrop-blur-xl text-white shadow-xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-white">You&apos;re Subscribed to Live Alerts! 🔔</h4>
          <p className="text-xs text-gray-300">
            Welcome email sent to <strong className="text-white font-mono">{email}</strong>. You will get instant alerts whenever 7th Heaven streams live!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl backdrop-blur-xl text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-yellow-300 shrink-0">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
            Join Live Chat & Get Stream Alerts
          </h3>
          <p className="text-xs text-purple-200/70">
            Enter your name & email below to get instant live concert alerts & join the live chat.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative group">
            <User className="absolute left-3 top-3 w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full bg-white/5 border border-white/20 py-2.5 !pl-9 pr-3 text-white placeholder:text-white/30 text-xs rounded-xl transition-all duration-300 focus:outline-none focus:border-purple-400 focus:bg-purple-950/40 focus:ring-2 focus:ring-purple-500/50 shadow-inner focus:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              className="w-full bg-white/5 border border-white/20 py-2.5 !pl-9 pr-3 text-white placeholder:text-white/30 text-xs rounded-xl transition-all duration-300 focus:outline-none focus:border-purple-400 focus:bg-purple-950/40 focus:ring-2 focus:ring-purple-500/50 shadow-inner focus:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            />
          </div>
        </div>

        {/* Legal Terms & Privacy Checkbox */}
        <div className="flex items-center gap-3 pt-1 pb-1">
          <SquishyToggle
            id="inline-terms-toggle"
            label="I agree to the Terms of Service & Privacy Policy"
            checked={agreedToTerms}
            onChange={(checked) => setAgreedToTerms(checked)}
          />
          <label htmlFor="inline-terms-toggle" className="text-[11px] text-gray-300/90 leading-tight cursor-pointer select-none">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-purple-300">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-purple-300">
              Privacy Policy
            </a>{" "}
            for live stream alerts.
          </label>
        </div>

        <CosmicRadialButton
          type="submit"
          disabled={loading}
          icon={<Sparkles className="w-4 h-4 text-yellow-300" />}
          className="w-full py-2.5 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {loading ? "SUBSCRIBING..." : "SUBSCRIBE TO LIVE ALERTS 🔔"}
        </CosmicRadialButton>
      </form>
    </div>
  );
}
