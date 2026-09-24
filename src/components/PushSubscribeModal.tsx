"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, X, Shield, Mail, User, Sparkles } from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
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
      setError(
        "You must agree to the Terms of Service & Privacy Policy to subscribe.",
      );
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
      setError(
        err?.message || "Failed to process subscription. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[45px] transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0e0a1a] p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg bg-[#00000029] p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {!subscribed ? (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div>
                <h3>Live Stream Push Alerts</h3>
                <span className="text-purple-400">
                  7th Heaven Official Notifications
                </span>
              </div>
            </div>

            <p className="mb-6 text-gray-300/90">
              Enter your details below to get instant push notifications
              whenever 7th Heaven or a crew member goes live!
            </p>

            {error && (
              <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-gray-300">
                  Your Full Name
                </label>
                <div className="relative w-full">
                  <div className="input-glow-border w-full">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Michael Scimeca"
                      className="placeholder: w-full rounded-lg border border-white/10 bg-[#0d071b] py-3 pr-4 !pl-10 text-white/40 transition-all outline-none"
                    />
                  </div>
                  <div className="pointer-events-none absolute top-1/2 left-3.5 z-20 flex -translate-y-1/2 items-center justify-center text-white/40">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-gray-300">
                  Your Email Address
                </label>
                <div className="relative w-full">
                  <div className="input-glow-border w-full">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="michael@example.com"
                      className="placeholder: w-full rounded-lg border border-white/10 bg-[#0d071b] py-3 pr-4 !pl-10 text-white/40 transition-all outline-none"
                    />
                  </div>
                  <div className="pointer-events-none absolute top-1/2 left-3.5 z-20 flex -translate-y-1/2 items-center justify-center text-white/40">
                    <Mail className="h-4 w-4" />
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
                <label
                  htmlFor="modal-terms-toggle"
                  className="cursor-pointer leading-normal text-gray-300/90 select-none"
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
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Privacy Policy
                  </a>{" "}
                  to receive live stream push & email notifications.
                </label>
              </div>

              <div className="pt-2">
                <SeventhButton
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 py-3.5"
                >
                  {loading ? "SUBSCRIBING..." : "SUBSCRIBE TO LIVE ALERTS "}
                </SeventhButton>
              </div>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <p>
                🔒 100% Free · We value your privacy. Every alert email includes
                a 1-click unsubscribe link.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="mb-2">You&apos;re Subscribed! 🔔</h3>
            <p className="mx-auto mb-6 max-w-sm text-gray-300">
              We sent a welcome confirmation email to <strong>{email}</strong>{" "}
              with details on how your live stream alerts work and how to manage
              or unsubscribe anytime.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/10 px-6 py-2.5 transition-colors hover:bg-white/20"
            >
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
