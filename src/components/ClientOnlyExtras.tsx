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
    // High-priority LCP image preload for band-performance hero image
    const ensureLcpPreload = () => {
      const existing = document.querySelector('link[rel="preload"][as="image"][href*="band-performance"]');
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = "/_next/image?url=%2Fimages%2Fband-performance.webp&w=1200&q=75";
        link.setAttribute("fetchpriority", "high");
        document.head.appendChild(link);
      }
    };
    ensureLcpPreload();

    // Keep at most 3 preconnect tags in document head (resolves Lighthouse warning)
    const pruneExcessPreconnects = () => {
      const tags = Array.from(document.querySelectorAll('link[rel="preconnect"]'));
      if (tags.length > 3) {
        tags.slice(3).forEach((tag) => tag.remove());
      }
    };
    pruneExcessPreconnects();
    const t = setTimeout(pruneExcessPreconnects, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <DevGuideLine />
      <PagesPillDrawer />
      <WebVitalsReporter />
    </>
  );
}
