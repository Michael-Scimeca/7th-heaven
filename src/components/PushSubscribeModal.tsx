"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Bell, Check, X, Shield, Mail, User, Sparkles } from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
import Toggle from "@/components/Toggle";
import { useMember } from "@/context/MemberContext";
import { GlowInput } from "@/components/GlowInput";
import { useScrollLock } from "@/lib/useScrollLock";

interface PushSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: "fans" | "crew" | "cruise";
  onSuccess?: () => void;
}

const emptySubscribe = () => () => {};

export default function PushSubscribeModal({
  isOpen,
  onClose,
  group = "fans",
  onSuccess,
}: PushSubscribeModalProps) {
  useScrollLock(isOpen);
  const { member } = useMember();
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const showIosTip = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined") return false;
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isStandalone =
        Boolean((window.navigator as any).standalone) ||
        window.matchMedia("(display-mode: standalone)").matches;
      return isIOS && !isStandalone;
    },
    () => false
  );

  useEffect(() => {
    if (member?.name) setName(member.name);
    if (member?.email) setEmail(member.email);
  }, [member?.name, member?.email]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-[#0e0a1a] p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-[#00000029] p-1 text-white/40 hover:bg-white/10 hover:text-white"
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

            {showIosTip && (
              <div className="mb-6 rounded-[var(--radius-box)] border border-purple-500/40 bg-purple-950/30 p-3 text-xs text-purple-200">
                📱 <strong>iPhone Note:</strong> To enable push notifications on iOS, tap <strong>Share</strong> (⎋) &rarr; <strong>Add to Home Screen</strong>, then open 7th Heaven from your Home Screen.
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-[var(--radius-box)] border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="  block text-gray-300">
                  Your Full Name
                </label>
                <div className="relative w-full">
                  <GlowInput
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Michael Scimeca"
                    className="!pl-10"
                  />
                  <div className="pointer-events-none absolute top-1/2 left-3.5 z-20 flex -translate-y-1/2 items-center justify-center text-white/40">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="  block text-gray-300">
                  Your Email Address
                </label>
                <div className="relative w-full">
                  <GlowInput
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="michael@example.com"
                    className="!pl-10"
                  />
                  <div className="pointer-events-none absolute top-1/2 left-3.5 z-20 flex -translate-y-1/2 items-center justify-center text-white/40">
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Legal Terms of Service & Privacy Policy Toggle */}
              <div className="pt-1 pb-1">
                <Toggle
                  id="modal-terms-toggle"
                  checked={agreedToTerms}
                  onChange={(checked) => setAgreedToTerms(checked)}
                  label={
                    <span className="leading-normal text-gray-300/90 select-none">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>{" "}
                      to receive live stream push & email notifications.
                    </span>
                  }
                />
              </div>

              <div className="pt-2">
                <SeventhButton
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2"
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
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
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
              className="rounded-[var(--radius-box)] bg-white/10 px-6 py-2.5 hover:bg-white/20"
            >
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
