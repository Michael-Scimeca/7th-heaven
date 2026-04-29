"use client";

import { useState, useEffect } from "react";

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = "7h_consent";
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
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-[640px] transition-all duration-350 ease-out ${
        closing ? "opacity-0 translate-y-4 scale-[0.98] pointer-events-none" : "opacity-100 translate-y-0 scale-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Cookie consent"
    >
      <div className="relative bg-[#0e0e1a]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_20px_80px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Purple accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-[0.95rem] leading-tight mb-0.5">Your Privacy</h2>
              <p className="text-white/40 text-[0.75rem] leading-snug">
                We use cookies to improve your experience. By using 7thHeavenBand.com you agree to our{" "}
                <a href="/privacy" className="text-[var(--color-accent)]/80 hover:text-[var(--color-accent)] underline underline-offset-2 transition-colors" target="_blank" rel="noopener">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="text-[var(--color-accent)]/80 hover:text-[var(--color-accent)] underline underline-offset-2 transition-colors" target="_blank" rel="noopener">
                  Terms of Service
                </a>.
              </p>
            </div>
          </div>

          {/* Expandable custom preferences */}
          {expanded && (
            <div className="mb-4 space-y-2 border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
              {/* Essential — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.8rem] font-semibold text-white/80">Essential Cookies</p>
                  <p className="text-[0.65rem] text-white/30 mt-0.5">Required for the site to function. Cannot be disabled.</p>
                </div>
                <div className="w-9 h-5 bg-[var(--color-accent)]/30 rounded-full flex items-center justify-end px-0.5 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-[var(--color-accent)] shadow-sm" />
                </div>
              </div>
              <div className="h-px bg-white/[0.05]" />
              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.8rem] font-semibold text-white/80">Analytics</p>
                  <p className="text-[0.65rem] text-white/30 mt-0.5">Helps us understand how fans use the site (Google Analytics).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalytics(!analytics)}
                  aria-checked={analytics}
                  role="switch"
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors duration-200 shrink-0 ${
                    analytics ? "bg-[var(--color-accent)] justify-end" : "bg-white/[0.1] justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
              <div className="h-px bg-white/[0.05]" />
              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.8rem] font-semibold text-white/80">Marketing</p>
                  <p className="text-[0.65rem] text-white/30 mt-0.5">Personalised show recommendations and fan engagement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMarketing(!marketing)}
                  aria-checked={marketing}
                  role="switch"
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors duration-200 shrink-0 ${
                    marketing ? "bg-[var(--color-accent)] justify-end" : "bg-white/[0.1] justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="cookie-accept-all"
              onClick={acceptAll}
              className="flex-1 min-w-[120px] bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.8rem] font-bold uppercase tracking-[0.12em] px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(133,29,239,0.5)]"
            >
              Accept All
            </button>
            {!expanded ? (
              <>
                <button
                  id="cookie-reject-all"
                  onClick={rejectAll}
                  className="flex-1 min-w-[100px] bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white text-[0.8rem] font-semibold px-5 py-2.5 rounded-xl border border-white/[0.06] transition-all duration-200"
                >
                  Reject All
                </button>
                <button
                  id="cookie-customize"
                  onClick={() => setExpanded(true)}
                  className="text-white/30 hover:text-white/60 text-[0.75rem] font-semibold underline underline-offset-2 transition-colors px-2 py-2.5 whitespace-nowrap"
                >
                  Customize
                </button>
              </>
            ) : (
              <button
                id="cookie-save-custom"
                onClick={saveCustom}
                className="flex-1 min-w-[120px] bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-[0.8rem] font-semibold px-5 py-2.5 rounded-xl border border-white/[0.06] transition-all duration-200"
              >
                Save Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
