"use client";
import dynamic from "next/dynamic";

// These components use browser APIs and must be client-only.
// Wrapping them here (a client component) allows ssr:false inside a Server Component layout.
const DevGuideLine = dynamic(
  () => import("@/components/DevGuideLine"),
  { ssr: false }
);

const PagesPillDrawer = dynamic(
  () => import("@/components/PagesPillDrawer"),
  { ssr: false }
);

const WebVitalsReporter = dynamic(
  () => import("@/components/WebVitalsReporter"),
  { ssr: false }
);

import { useEffect } from "react";

export default function ClientOnlyExtras() {
  useEffect(() => {
    // Purge any unused ytimg preconnect tags from document.head to eliminate DevTools audit warnings
    const purgeUnusedPreconnects = () => {
      const tags = document.querySelectorAll('link[rel="preconnect"][href*="ytimg.com"]');
      tags.forEach((tag) => tag.remove());
    };
    purgeUnusedPreconnects();
  }, []);

  return (
    <>
      <DevGuideLine />
      <PagesPillDrawer />
      <WebVitalsReporter />
    </>
  );
}
