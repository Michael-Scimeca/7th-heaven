"use client";

import Script from "next/script";
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

  if (!consented) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              analytics_storage: 'granted',
              ad_storage: 'denied',
            });
            gtag('config', '${ga_id}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  );
}
