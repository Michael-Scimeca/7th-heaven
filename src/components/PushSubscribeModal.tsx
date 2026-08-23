"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, X, Shield, Mail, User, Sparkles } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import SquishyToggle from "@/components/SquishyToggle";
import { useMember } from "@/context/MemberContext";

interface PushSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: "fans" | "crew" | "cruise";
  onSuccess?: () => void;
}

export default function PushSubscribeModal({
  isOpen,
  onClose,
  group = "fans",
  onSuccess,
}: PushSubscribeModalProps) {
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy to subscribe.");
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
          group,
          source: "live-stream",
          agreedToTerms: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed.");
      }

      setSubscribed(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to process subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0e0a1a] p-6 sm:p-8 text-white shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {!subscribed ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-inner">
                <Bell className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-wide">
                  Live Stream Push Alerts
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  7th Heaven Official Notifications
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-300/90 leading-relaxed mb-6">
              Enter your details below to get instant push notifications whenever 7th Heaven or a crew member goes live!
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative w-full">
                  <div className="input-glow-border rounded-xl w-full">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Michael Scimeca"
                      className="w-full bg-[#0d071b] border border-white/10 rounded-xl text-white placeholder:text-white/40 !pl-10 pr-4 py-3 text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-20 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Your Email Address
                </label>
                <div className="relative w-full">
                  <div className="input-glow-border rounded-xl w-full">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="michael@example.com"
                      className="w-full bg-[#0d071b] border border-white/10 rounded-xl text-white placeholder:text-white/40 !pl-10 pr-4 py-3 text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-20 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Legal Terms of Service & Privacy Policy Toggle */}
              <div className="flex items-center gap-3 pt-1 pb-1">
                <SquishyToggle
                  id="modal-terms-toggle"
                  label="I agree to the Terms of Service & Privacy Policy"
                  checked={agreedToTerms}
                  onChange={(checked) => setAgreedToTerms(checked)}
                />
                <label htmlFor="modal-terms-toggle" className="text-xs text-gray-300/90 leading-normal cursor-pointer select-none">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-purple-300">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-purple-300">
                    Privacy Policy
                  </a>{" "}
                  to receive live stream push & email notifications.
                </label>
              </div>

              <div className="pt-2">
                <CosmicRadialButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-white text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? "SUBSCRIBING..." : "SUBSCRIBE TO LIVE ALERTS 🔔"}
                </CosmicRadialButton>
              </div>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <p className="text-[11px] text-white/40 leading-relaxed">
                🔒 100% Free · We value your privacy. Every alert email includes a 1-click unsubscribe link.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4 shadow-lg">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">You&apos;re Subscribed! 🔔</h3>
            <p className="text-sm text-gray-300 max-w-sm mx-auto leading-relaxed mb-6">
              We sent a welcome confirmation email to <strong className="text-white font-mono">{email}</strong> with details on how your live stream alerts work and how to manage or unsubscribe anytime.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors"
            >
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
