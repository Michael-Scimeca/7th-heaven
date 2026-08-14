"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

const COOKIE_KEY = "7h_consent";
const COOKIE_VERSION = "1";

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.version === COOKIE_VERSION && parsed.analytics === true;
  } catch {
    return false;
  }
}

export default function GoogleAnalytics({ ga_id }: { ga_id: string }) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Check on mount
    setConsented(hasAnalyticsConsent());

    // Listen for consent updates from the banner
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConsented(!!detail?.analytics);
    };
    window.addEventListener("7h:consent", handler);
    return () => window.removeEventListener("7h:consent", handler);
  }, []);

  if (!consented || !ga_id) return null;

  return <NextGoogleAnalytics gaId={ga_id} />;
}
