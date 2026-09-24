"use client";

import { useState, useEffect } from "react";
import { GradientToggle } from "./GradientToggle";

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = "7h_consent_v1";
const COOKIE_VERSION = "1"; // bump to re-prompt after policy changes

function readConsent(): (ConsentState & { version: string }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== COOKIE_VERSION) return null; // outdated — re-prompt
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(consent: ConsentState) {
  localStorage.setItem(
    COOKIE_KEY,
    JSON.stringify({ ...consent, version: COOKIE_VERSION }),
  );
  // Push to GTM dataLayer if available
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
    });
  }
  // Dispatch event so GoogleAnalytics component can react
  window.dispatchEvent(new CustomEvent("7h:consent", { detail: consent }));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      // Delay appearance slightly so page loads first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (consent: ConsentState) => {
    writeConsent(consent);
    setClosing(true);
    setTimeout(() => setVisible(false), 350);
  };

  const acceptAll = () => dismiss({ analytics: true, marketing: true });
  const rejectAll = () => dismiss({ analytics: false, marketing: false });
  const saveCustom = () => dismiss({ analytics, marketing });

  if (!visible) return null;

  return (
    <dialog
      open
      className={`fixed bottom-4 left-1/2 z-[9999] m-0 w-[calc(100vw-2rem)] max-w-[640px] -translate-x-1/2 border-none p-0 text-inherit ${closing ? "pointer-events-none translate-y-4 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100"}`}
      aria-label="Cookie consent"
    >
      <div className="relative overflow-hidden border border-white/10 bg-[#0e0e1a]/95 shadow-[0_20px_80px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Purple accent line */}
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="mb-6 flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--color-accent)]/15">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2>Your Privacy</h2>
              <p>
                We use cookies to improve your experience. By using
                7thHeavenBand.com you agree to our{" "}
                <a
                  href="/privacy"
                  className="text-[var(--color-accent)]/80 underline-offset-2"
                  target="_blank"
                  rel="noopener"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  className="text-[var(--color-accent)]/80 underline-offset-2"
                  target="_blank"
                  rel="noopener"
                >
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>

          {/* Expandable custom preferences */}
          {expanded && (
            <div className="mb-6 space-y-2 border border-white/10 bg-white/[0.02] p-4">
              {/* Essential — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p>Essential Cookies</p>
                  <p className="mt-0.5">
                    Required for the site to function. Cannot be disabled.
                  </p>
                </div>
                <div className="flex h-5 w-9 shrink-0 items-center justify-end rounded-lg bg-[var(--color-accent)]/30 px-0.5">
                  <div className="h-4 w-4 rounded-lg bg-[var(--color-accent)]" />
                </div>
              </div>
              <div className="h-px bg-white/10" />
              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <p>Analytics</p>
                  <p className="mt-0.5">
                    Helps us understand how fans use the site (Google
                    Analytics).
                  </p>
                </div>
                <GradientToggle
                  id="cookie-analytics-toggle"
                  checked={analytics}
                  onChange={setAnalytics}
                />
              </div>
              <div className="h-px bg-white/[0.05]" />
              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <p>Marketing</p>
                  <p className="mt-0.5">
                    Personalised show recommendations and fan engagement.
                  </p>
                </div>
                <GradientToggle
                  id="cookie-marketing-toggle"
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="cookie-accept-all"
              onClick={acceptAll}
              className="min-w-[120px] flex-1 bg-[var(--color-accent)] px-5 py-2.5 hover:bg-[var(--color-accent)]/90 hover:shadow-[0_4px_20px_-4px_rgba(255,10,61,0.5)]"
            >
              Accept All
            </button>
            {!expanded ? (
              <>
                <button
                  id="cookie-reject-all"
                  onClick={rejectAll}
                  className="min-w-[100px] flex-1 border border-white/[0.06] bg-white/[0.06] px-5 py-2.5 hover:bg-white/[0.1] hover:text-white"
                >
                  Reject All
                </button>
                <button
                  id="cookie-customize"
                  onClick={() => setExpanded(true)}
                  className="px-2 py-2.5 whitespace-nowrap text-white/30 underline-offset-2"
                >
                  Customize
                </button>
              </>
            ) : (
              <button
                id="cookie-save-custom"
                onClick={saveCustom}
                className="min-w-[120px] flex-1 border border-white/[0.06] bg-white/[0.06] px-5 py-2.5 hover:bg-white/[0.1] hover:text-white"
              >
                Save Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
