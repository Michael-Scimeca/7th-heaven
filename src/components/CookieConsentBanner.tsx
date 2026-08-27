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
  localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...consent, version: COOKIE_VERSION }));
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
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-[640px] m-0 p-0 bg-transparent border-none text-inherit transition-colors duration-350 ease-out ${closing ? "opacity-0 translate-y-4 scale-[0.98] pointer-events-none" : "opacity-100 translate-y-0 scale-100"
        }`}
      aria-label="Cookie consent"
    >
      <div className="relative bg-[#0e0e1a]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Purple accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-base leading-tight mb-0.5">Your Privacy</h2>
              <p className="text-white/40 text-sm leading-snug">
                We use cookies to improve your experience. By using 7thHeavenBand.com you agree to our{" "}
                <a href="/privacy" className=" text-[var(--color-accent)]/80 hover: text-[var(--color-accent)] underline underline-offset-2 transition-colors" target="_blank" rel="noopener">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className=" text-[var(--color-accent)]/80 hover: text-[var(--color-accent)] underline underline-offset-2 transition-colors" target="_blank" rel="noopener">
                  Terms of Service
                </a>.
              </p>
            </div>
          </div>

          {/* Expandable custom preferences */}
          {expanded && (
            <div className="mb-4 space-y-2 border border-white/10 p-4 bg-white/[0.02]">
              {/* Essential — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">Essential Cookies</p>
                  <p className="text-xs text-white/30 mt-0.5">Required for the site to function. Cannot be disabled.</p>
                </div>
                <div className="w-9 h-5 bg-[var(--color-accent)]/30  rounded-lg  flex items-center justify-end px-0.5 shrink-0">
                  <div className="w-4 h-4  rounded-lg  bg-[var(--color-accent)]  " />
                </div>
              </div>
              <div className="h-px bg-white/10" />
              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">Analytics</p>
                  <p className="text-xs text-white/30 mt-0.5">Helps us understand how fans use the site (Google Analytics).</p>
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
                  <p className="text-sm font-semibold text-white/80">Marketing</p>
                  <p className="text-xs text-white/30 mt-0.5">Personalised show recommendations and fan engagement.</p>
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
            <button aria-label="Action button"
              id="cookie-accept-all"
              onClick={acceptAll}
              className="flex-1 min-w-[120px] bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-sm font-bold uppercase tracking-[0.12em] px-5 py-2.5 transition-colors duration-200 hover:shadow-[0_4px_20px_-4px_rgba(255,10,61,0.5)]"
            >
              Accept All
            </button>
            {!expanded ? (
              <>
                <button aria-label="Action button"
                  id="cookie-reject-all"
                  onClick={rejectAll}
                  className="flex-1 min-w-[100px] bg-white/[0.06] hover:bg-white/[0.1]  text-white  hover:text-white text-sm font-semibold px-5 py-2.5 border border-white/[0.06] transition-colors duration-200"
                >
                  Reject All
                </button>
                <button aria-label="Action button"
                  id="cookie-customize"
                  onClick={() => setExpanded(true)}
                  className="text-white/30 hover: text-white  text-sm font-semibold underline underline-offset-2 transition-colors px-2 py-2.5 whitespace-nowrap"
                >
                  Customize
                </button>
              </>
            ) : (
              <button aria-label="Action button"
                id="cookie-save-custom"
                onClick={saveCustom}
                className="flex-1 min-w-[120px] bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-sm font-semibold px-5 py-2.5 border border-white/[0.06] transition-colors duration-200"
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
